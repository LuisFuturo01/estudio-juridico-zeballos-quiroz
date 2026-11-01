/**
 * EJEMPLO de proxy LLM para el Asistente Legal (Anthropic Messages API).
 * La API key vive SOLO aquí (ANTHROPIC_API_KEY en el servidor), nunca en el navegador.
 * Front:  VITE_AI_AGENT_MODE=remote   VITE_AI_AGENT_ENDPOINT=https://su-dominio/api/agent
 * Contrato: POST { prompt, lang }  ->  { text, suggestions?, emergency? }
 * Para OpenAI o Gemini solo cambia la llamada fetch; el contrato con el front es el mismo.
 */
import knowledge from '../src/data/legal_agent_knowledge.json' with { type: 'json' };

const SYSTEM = (lang) => `Eres el asistente legal orientativo del Estudio Jurídico Zeballos Quiroz (La Paz, Bolivia).
Áreas: Familia, Civil y Obligaciones, Laboral y Seguridad Social, Agrario y Agroambiental, Tránsito y Accidentes.
Responde en ${lang === 'en' ? 'inglés' : 'español'}, breve (máx. 150 palabras), en lenguaje claro, citando normativa boliviana solo si estás seguro.
No des criterio vinculante: recomienda una consulta con un abogado del estudio. Ante urgencias (arresto, accidente grave), prioriza contención y contacto inmediato.
Base de referencia: ${JSON.stringify(knowledge.intents.map((i) => ({ id: i.id, info: i.response.es })))}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { prompt, lang = 'es' } = req.body ?? {};
  if (!prompt || String(prompt).length > 1000) return res.status(400).json({ error: 'Invalid prompt' });

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-5-5',
      max_tokens: 600,
      system: SYSTEM(lang),
      messages: [{ role: 'user', content: String(prompt) }],
    }),
  });
  if (!r.ok) return res.status(502).json({ error: 'LLM error' });
  const data = await r.json();
  const text = data.content?.filter((b) => b.type === 'text').map((b) => b.text).join('\n') ?? '';
  return res.status(200).json({ text });
}
