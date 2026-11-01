import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ExternalLink, MessageCircle, Phone, RotateCcw, Scale, SendHorizontal, ShieldAlert, X } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { agentKnowledge, site, social } from '../lib/data';
import { onOpenChat } from '../lib/chatBus';
import { scrollToSection, telUrl, whatsappUrl } from '../lib/contact';
import { Markdown } from '../lib/markdown';
import { processLegalQuery } from '../services/legalAgent';
import type { AgentAction, AgentReply, Lang } from '../types';

interface Message {
  id: number;
  from: 'user' | 'bot';
  text: string;
  reply?: AgentReply;
}

let nextId = 1;

const greetingMessage = (lang: Lang): Message => ({ id: nextId++, from: 'bot', text: agentKnowledge.greeting[lang] });

/** Botón de acción sugerido por el motor (WhatsApp, llamada, scroll, enlace). */
function ActionButton({ action, onScroll }: { action: AgentAction; onScroll: () => void }) {
  const { l, lang } = useLang();
  const label = l(action.label);
  const emergency = action.type === 'whatsapp_emergency' || action.type === 'call_emergency';
  const cls = `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-300 ${
    emergency ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-graphite-900 text-gold-100 hover:bg-graphite-700'
  }`;

  switch (action.type) {
    case 'whatsapp':
    case 'whatsapp_emergency':
      return (
        <a className={cls} href={whatsappUrl(lang, { emergency })} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> {label}
        </a>
      );
    case 'call':
    case 'call_emergency':
      return (
        <a className={cls} href={telUrl(emergency)}>
          <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {label}
        </a>
      );
    case 'link': {
      const href = action.target === 'maps' ? social.contact.mapsUrl : action.target;
      return (
        <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> {label}
        </a>
      );
    }
    case 'scroll':
      return (
        <button
          type="button"
          className={cls}
          onClick={() => {
            onScroll();
            setTimeout(() => scrollToSection(action.target ?? 'contacto'), 150);
          }}
        >
          {label}
        </button>
      );
    default:
      return null;
  }
}

export function ChatWidget() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [greetingMessage(lang)]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const langRef = useRef(lang);

  // Al cambiar de idioma, si solo existe el saludo, se traduce.
  useEffect(() => {
    langRef.current = lang;
    setMessages((m) => (m.length === 1 && m[0].from === 'bot' ? [greetingMessage(lang)] : m));
  }, [lang]);

  const send = useCallback(async (text: string) => {
    const prompt = text.trim();
    if (!prompt) return;
    setMessages((m) => [...m, { id: nextId++, from: 'user', text: prompt }]);
    setInput('');
    setTyping(true);
    try {
      const reply = await processLegalQuery(prompt, langRef.current);
      setMessages((m) => [...m, { id: nextId++, from: 'bot', text: reply.text, reply }]);
    } finally {
      setTyping(false);
    }
  }, []);

  // Apertura desde otros componentes (Hero / modales), opcionalmente con una consulta.
  useEffect(
    () =>
      onOpenChat((prompt) => {
        setOpen(true);
        setTeaser(false);
        if (prompt) void send(prompt);
      }),
    [send],
  );

  // Burbuja de invitación tras unos segundos (una sola vez por sesión).
  useEffect(() => {
    let shown = false;
    try {
      shown = sessionStorage.getItem('zq-chat-teaser') === '1';
    } catch {
      /* ignorado */
    }
    if (shown) return;
    const id = setTimeout(() => {
      setTeaser(true);
      try {
        sessionStorage.setItem('zq-chat-teaser', '1');
      } catch {
        /* ignorado */
      }
    }, 6000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!typing) void send(input);
  };

  const reset = () => setMessages([greetingMessage(lang)]);
  const lastBot = [...messages].reverse().find((m) => m.from === 'bot');
  const chips = lastBot?.reply?.suggestions?.length ? lastBot.reply.suggestions : messages.length === 1 ? agentKnowledge.quickChips[lang] : [];

  return (
    <>
      {/* Ventana */}
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="chat-title"
        aria-hidden={!open}
        className={`fixed z-[60] flex flex-col overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgba(8,17,28,0.55)] transition-all duration-300 ease-in-out
          inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(640px,calc(100vh-8rem))] sm:w-[400px] sm:rounded-3xl sm:ring-1 sm:ring-white/40
          ${open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none invisible translate-y-6 opacity-0'}`}
      >
        {/* Cabecera ejecutiva */}
        <header className="relative flex items-center gap-3 bg-gradient-to-r from-graphite-900 to-graphite-700 px-4 py-3.5 text-white">
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-gold-300/40">
            <img src={site.brand.mark} alt="" className="h-8 w-auto" />
          </span>
          <div className="relative min-w-0 flex-1">
            <h2 id="chat-title" className="truncate font-display text-base font-semibold text-gold-100">
              {t.chat.title}
            </h2>
            <p className="flex items-center gap-1.5 text-xs text-steel-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {t.chat.status} · Zeballos Quiroz
            </p>
          </div>
          <button type="button" onClick={reset} aria-label={t.chat.reset} title={t.chat.reset} className="relative grid h-9 w-9 place-items-center rounded-lg text-steel-300 transition hover:bg-white/10 hover:text-white">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setOpen(false)} aria-label={t.chat.close} className="relative grid h-9 w-9 place-items-center rounded-lg text-steel-300 transition hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Mensajes */}
        <div ref={listRef} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto bg-steel-100 px-4 py-5" aria-live="polite" aria-relevant="additions">
          {messages.map((m) =>
            m.from === 'user' ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gradient-to-br from-graphite-700 to-graphite-900 px-4 py-2.5 text-sm text-white shadow-soft">{m.text}</p>
              </div>
            ) : (
              <div key={m.id} className="flex gap-2.5">
                <span className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full ${m.reply?.emergency ? 'bg-red-600 text-white' : 'bg-gold-sheen text-graphite-950'}`}>
                  {m.reply?.emergency ? <ShieldAlert className="h-4 w-4" aria-hidden="true" /> : <Scale className="h-3.5 w-3.5" aria-hidden="true" />}
                </span>
                <div className={`max-w-[85%] rounded-2xl rounded-tl-md border bg-white px-4 py-3 text-sm leading-relaxed text-ink shadow-soft ${m.reply?.emergency ? 'border-red-200' : 'border-steel-200'}`}>
                  <Markdown source={m.text} className="chat-md" />
                  {!!m.reply?.actions.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.reply.actions.map((a, i) => (
                        <ActionButton key={i} action={a} onScroll={() => setOpen(false)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
          {typing && (
            <div className="flex gap-2.5" role="status" aria-label={t.chat.typing}>
              <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-sheen text-graphite-950">
                <Scale className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-steel-200 bg-white px-4 py-3.5 shadow-soft">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 animate-dot-blink rounded-full bg-gold-500" style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chips */}
        {chips.length > 0 && !typing && (
          <div className="scrollbar-thin flex gap-2 overflow-x-auto border-t border-steel-200 bg-white px-4 py-3">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => send(c)}
                className="shrink-0 rounded-full border border-gold-400/50 bg-gold-50 px-3 py-1.5 text-xs font-medium text-graphite-900 transition-all duration-300 hover:border-gold-500 hover:bg-gold-100"
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Entrada */}
        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-steel-200 bg-white px-3 py-3">
          <label htmlFor="chat-input" className="sr-only">
            {t.chat.placeholder}
          </label>
          <input
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.chat.placeholder}
            autoComplete="off"
            maxLength={500}
            className="field flex-1 rounded-full py-2.5"
          />
          <button type="submit" disabled={!input.trim() || typing} aria-label={t.chat.send} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-graphite-900 text-gold-200 transition-all duration-300 hover:bg-graphite-800 disabled:opacity-40">
            <SendHorizontal className="h-5 w-5" />
          </button>
        </form>

        {/* Disclaimer jurídico */}
        <p className="border-t border-steel-200 bg-steel-50 px-4 py-2.5 text-center text-[11px] leading-snug text-muted">{t.chat.disclaimer}</p>
      </div>

      {/* Burbuja de invitación */}
      {teaser && !open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setTeaser(false);
          }}
          className="fixed bottom-[5.75rem] right-4 z-[55] max-w-[220px] animate-fade-up rounded-2xl rounded-br-md bg-white px-4 py-3 text-left text-sm font-medium text-graphite-900 shadow-lift ring-1 ring-steel-300 sm:right-6"
        >
          {t.chat.teaser}
        </button>
      )}

      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setTeaser(false);
        }}
        aria-label={open ? t.chat.close : t.chat.open}
        aria-expanded={open}
        className={`fixed bottom-4 right-4 z-[61] grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-graphite-600 to-graphite-900 text-gold-300 shadow-lift ring-2 ring-gold-400/70 transition-all duration-300 hover:scale-105 sm:bottom-6 sm:right-6 ${
          open ? 'max-sm:hidden' : 'animate-soft-pulse'
        }`}
      >
        {open ? <X className="h-7 w-7" /> : <Scale className="h-7 w-7" />}
        {!open && <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-graphite-900 bg-emerald-400" />}
      </button>
    </>
  );
}
