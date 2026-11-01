import { useState, type KeyboardEvent } from 'react';
import { GraduationCap, Linkedin, Mail, MessageCircle, RotateCw, Undo2 } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { lawyers, shortTitle, specialtyById } from '../lib/data';
import { whatsappUrl } from '../lib/contact';
import { useTilt } from '../hooks/useTilt';
import type { Lawyer } from '../types';
import { SectionHeader } from './SectionHeader';

function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  const { t, l, lang } = useLang();
  const [flipped, setFlipped] = useState(false);
  // En escritorio el hover gira la tarjeta; tras un clic se fija el estado y se desactiva el hover.
  const [touched, setTouched] = useState(false);
  const tilt = useTilt<HTMLDivElement>(5);

  const toggle = () => {
    setTouched(true);
    setFlipped((v) => !v);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };
  const specs = lawyer.specialties_ids.map(specialtyById).filter(Boolean);
  const contactMsg = lang === 'es' ? `Hola, deseo agendar una consulta con ${lawyer.name}.` : `Hello, I would like to book a consultation with ${lawyer.name}.`;

  return (
    <div ref={tilt} className="tilt rounded-3xl">
      <div className={`flip-scene h-[520px] ${flipped ? 'is-flipped' : ''} ${touched ? '' : 'hover-flip'}`}>
        <div className="flip-inner">
          {/* -------- Frente -------- */}
          <div
            className="flip-face cursor-pointer bg-graphite-700 shadow-lift"
            role="button"
            tabIndex={flipped ? -1 : 0}
            aria-hidden={flipped}
            aria-label={`${t.lawyers.flipAria} ${lawyer.name}`}
            onClick={toggle}
            onKeyDown={onKey}
          >
            <img src={lawyer.photo_url} alt={lawyer.name} loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-graphite-950/95 via-graphite-950/20 to-transparent" />
            <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-bold text-graphite-900 shadow-soft backdrop-blur">
              <RotateCw className="h-3.5 w-3.5 animate-[spin_6s_linear_infinite] text-gold-600" aria-hidden="true" />
              {t.lawyers.flipHint}
            </span>
            <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">{l(lawyer.role)}</p>
              <h3 className="mt-1 text-2xl font-bold text-white">{lawyer.name}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {specs.map((s) => (
                  <span key={s!.id} className="badge-gold">
                    {shortTitle(l(s!.title))}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* -------- Reverso -------- */}
          <div className="flip-face flip-back flex flex-col bg-white p-6 shadow-lift sm:p-7" aria-hidden={!flipped}>
            <div className="flex items-center gap-4">
              <img src={lawyer.photo_url} alt="" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-gold-400" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-700">{l(lawyer.role)}</p>
                <h3 className="text-lg font-bold leading-tight text-graphite-900">{lawyer.name}</h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setTouched(true);
                setFlipped(false);
              }}
              tabIndex={flipped ? 0 : -1}
              className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-steel-100 px-3 py-1.5 text-xs font-bold text-graphite-600 transition hover:bg-gold-100 hover:text-gold-700"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t.lawyers.flipBack}
            </button>
            <p className="mt-5 text-sm leading-relaxed text-graphite-700">{l(lawyer.bio)}</p>
            <h4 className="mt-5 flex items-center gap-2 text-sm font-bold text-graphite-900">
              <GraduationCap className="h-4 w-4 text-gold-600" aria-hidden="true" />
              {t.lawyers.education}
            </h4>
            <ul className="mt-2 space-y-2">
              {l(lawyer.education).map((e) => (
                <li key={e} className="flex gap-2 rounded-xl bg-steel-100 px-3 py-2 text-[13px] leading-snug text-graphite-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  {e}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-center gap-2 pt-5">
              <a href={whatsappUrl(lang, { message: contactMsg })} target="_blank" rel="noopener noreferrer" tabIndex={flipped ? 0 : -1} className="btn-dark flex-1">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {t.lawyers.contact}
              </a>
              {lawyer.email && (
                <a href={`mailto:${lawyer.email}`} tabIndex={flipped ? 0 : -1} aria-label={`${t.common.email}: ${lawyer.email}`} className="btn-outline h-11 w-11 p-0">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {lawyer.linkedin && (
                <a
                  href={lawyer.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={flipped ? 0 : -1}
                  aria-label={`${t.lawyers.linkedin} — ${lawyer.name}`}
                  className="btn-outline h-11 w-11 p-0"
                >
                  <Linkedin className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Lawyers() {
  const { t } = useLang();
  return (
    <section id="abogados" className="section relative overflow-hidden bg-steel-100">
      <div className="absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-gold-300/25 blur-[140px]" />
      <div className="container-x relative">
        <SectionHeader eyebrow={t.lawyers.eyebrow} title={t.lawyers.title} subtitle={t.lawyers.subtitle} align="center" />
        <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {lawyers.map((lawyer) => (
            <li key={lawyer.id}>
              <LawyerCard lawyer={lawyer} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
