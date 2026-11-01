/**
 * Motor del Asistente Legal.
 *
 * `processLegalQuery(prompt, lang)` es el ÚNICO punto de contacto entre la interfaz del chat y la
 * "inteligencia". Hoy usa un mini-modelo estático (intent matcher con ponderación de palabras clave
 * sobre legal_agent_knowledge.json). Para conectar un LLM basta con:
 *   1) definir VITE_AI_AGENT_MODE=remote y VITE_AI_AGENT_ENDPOINT en .env, o
 *   2) reemplazar el cuerpo de `processLegalQuery`.
 * La interfaz del chat no necesita cambios: siempre recibe un `AgentReply`.
 */
import type { AgentIntent, AgentKnowledge, AgentReply, Lang } from '../types';
import { agentKnowledge, social } from '../lib/data';

/* ---------------------------- Normalización ---------------------------- */

/** minúsculas, sin tildes ni signos, espacios simples. "¿Cuánto TARDA?" → "cuanto tarda" */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Coincidencia por inicio de palabra: el término "divorci" coincide con "divorcio" y "divorciarme".
 * Los términos de ≤3 letras exigen palabra exacta para evitar falsos positivos ("hi" ≠ "hijo").
 */
function matches(haystack: string, term: string): boolean {
  const t = normalize(term);
  if (!t) return false;
  const padded = ` ${haystack} `;
  return t.length <= 3 ? padded.includes(` ${t} `) : padded.includes(` ${t}`);
}

/* ------------------------------ Puntuación ----------------------------- */

interface ScoredIntent {
  intent: AgentIntent;
  score: number;
}

/**
 * Puntaje = Σ pesos de términos encontrados × prioridad.
 * Se evalúan ambos idiomas (el usuario puede escribir en cualquiera); el idioma activo pesa completo y
 * el otro al 60 %, de modo que se responda correctamente aunque el idioma de la interfaz no coincida.
 */
export function scoreIntents(prompt: string, lang: Lang, kb: AgentKnowledge = agentKnowledge): ScoredIntent[] {
  const text = normalize(prompt);
  const other: Lang = lang === 'es' ? 'en' : 'es';
  return kb.intents
    .map((intent) => {
      let raw = 0;
      const seen = new Set<string>();
      for (const [l, factor] of [[lang, 1], [other, 0.6]] as const) {
        for (const { term, weight } of intent.keywords[l]) {
          const key = normalize(term);
          if (seen.has(key)) continue;
          if (matches(text, term)) {
            raw += weight * factor;
            seen.add(key);
          }
        }
      }
      return { intent, score: raw * (intent.priority ?? 1) };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
}

/* ------------------------------ Plantillas ----------------------------- */

function fillTemplate(text: string, lang: Lang): string {
  const c = social.contact;
  const vars: Record<string, string> = {
    address: c.address[lang],
    city: c.city,
    phone: c.phoneDisplay,
    email: c.email,
    hours: c.hours[lang],
  };
  return text.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? '');
}

/* --------------------------- Motor estático ---------------------------- */

export function processStaticQuery(prompt: string, lang: Lang, kb: AgentKnowledge = agentKnowledge): AgentReply {
  const ranked = scoreIntents(prompt, lang, kb);
  const { minScore, emergencyMinScore, relatedRatio } = kb.config;

  // 1) Las emergencias tienen prioridad absoluta si superan su umbral.
  const emergency = ranked.find((r) => r.intent.emergency && r.score >= emergencyMinScore);
  const best = emergency ?? ranked[0];

  // 2) Fallback inteligente si no hay coincidencia suficiente.
  if (!best || best.score < minScore) {
    // Si hubo alguna señal débil, sugerimos esa categoría primero.
    const hint = best ? kb.intents.filter((i) => i.category === best.intent.category && i.suggestions).flatMap((i) => i.suggestions![lang]) : [];
    return {
      text: fillTemplate(kb.fallback.response[lang], lang),
      intentId: null,
      category: null,
      emergency: false,
      confidence: best ? Math.min(best.score / minScore, 0.99) * 0.5 : 0,
      suggestions: [...new Set([...hint, ...kb.fallback.suggestions[lang]])].slice(0, 5),
      actions: kb.fallback.actions ?? [],
      source: 'static',
    };
  }

  // 3) Tema relacionado: segunda intención cercana (distinta) como sugerencia adicional.
  const runnerUp = ranked.find((r) => r !== best && !r.intent.emergency && r.score >= best.score * relatedRatio && r.score >= minScore);
  const suggestions = [...(best.intent.suggestions?.[lang] ?? [])];
  if (runnerUp) {
    const label = runnerUp.intent.suggestions?.[lang]?.[0] ?? kb.quickChips[lang][0];
    if (label && !suggestions.includes(label)) suggestions.unshift(label);
  }

  return {
    text: fillTemplate(best.intent.response[lang], lang),
    intentId: best.intent.id,
    category: best.intent.category,
    emergency: !!best.intent.emergency,
    confidence: Math.min(best.score / (minScore * 3), 1),
    suggestions: suggestions.slice(0, 4),
    actions: best.intent.actions ?? [],
    source: 'static',
  };
}

/* ------------------------- Adaptador LLM remoto ------------------------ */

/**
 * Llama a SU backend (nunca directamente a OpenAI/Anthropic/Gemini desde el navegador: la API key
 * quedaría expuesta). Contrato esperado:
 *   POST { prompt, lang }  →  200 { text, suggestions?, actions?, emergency? }
 * Ver /server/ai-agent.example.js.
 */
async function processRemoteQuery(prompt: string, lang: Lang, endpoint: string): Promise<AgentReply> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, lang }),
  });
  if (!res.ok) throw new Error(`AI endpoint ${res.status}`);
  const data = (await res.json()) as Partial<AgentReply>;
  // Las emergencias siempre se validan también localmente: nunca dependemos solo del modelo remoto.
  const local = processStaticQuery(prompt, lang);
  return {
    text: data.text ?? local.text,
    intentId: data.intentId ?? null,
    category: data.category ?? null,
    emergency: Boolean(data.emergency) || local.emergency,
    confidence: data.confidence ?? 1,
    suggestions: data.suggestions ?? [],
    actions: local.emergency ? local.actions : (data.actions ?? []),
    source: 'remote',
  };
}

/* ------------------------------ API pública ---------------------------- */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function processLegalQuery(prompt: string, lang: Lang): Promise<AgentReply> {
  const mode = import.meta.env.VITE_AI_AGENT_MODE ?? 'static';
  const endpoint = import.meta.env.VITE_AI_AGENT_ENDPOINT;

  if (mode === 'remote' && endpoint) {
    try {
      return await processRemoteQuery(prompt, lang, endpoint);
    } catch (err) {
      console.warn('[legalAgent] Endpoint remoto no disponible, usando modelo estático.', err);
    }
  }

  // Pequeña latencia para que el indicador "escribiendo…" se perciba natural.
  await wait(450 + Math.min(prompt.length * 8, 650));
  return processStaticQuery(prompt, lang);
}
