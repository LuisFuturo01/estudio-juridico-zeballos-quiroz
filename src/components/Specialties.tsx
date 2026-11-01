import { useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, FileText, MessageSquareText, Search, Sparkles } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { specialties, specialtiesData } from '../lib/data';
import { normalize } from '../services/legalAgent';
import { openChat, SELECT_SPECIALTY_EVENT } from '../lib/chatBus';
import { scrollToSection } from '../lib/contact';
import { useTilt } from '../hooks/useTilt';
import type { Specialty } from '../types';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { SectionHeader } from './SectionHeader';

function SpecialtyCard({ s, index, onOpen }: { s: Specialty; index: number; onOpen: () => void }) {
  const { t, l } = useLang();
  const tilt = useTilt<HTMLButtonElement>(6);
  return (
    <button
      ref={tilt}
      type="button"
      onClick={onOpen}
      className="tilt group relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white text-left shadow-soft ring-1 ring-white/80 hover:shadow-lift"
      aria-label={`${l(s.title)} — ${t.specialties.details}`}
    >
      <div className="relative h-48 overflow-hidden sm:h-52">
        <img src={s.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite-900/85 via-graphite-900/20 to-transparent" />
        <span className="absolute left-5 top-5 font-display text-sm font-bold text-white/80">0{index + 1}</span>
        {s.tags.includes('urgente') && (
          <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" /> 24/7
          </span>
        )}
        <h3 className="absolute bottom-4 left-5 right-16 text-xl font-bold leading-tight text-white sm:text-2xl">{l(s.title)}</h3>
      </div>

      {/* Ícono que "sale" de la tarjeta en 3D */}
      <span className="tilt-pop absolute right-5 top-[10.5rem] grid h-14 w-14 place-items-center rounded-2xl bg-gold-sheen text-graphite-950 shadow-gold ring-4 ring-white sm:top-[11.75rem]">
        <Icon name={s.icon} className="h-6 w-6" />
      </span>

      <div className="flex flex-1 flex-col p-6 pt-7">
        <p className="text-sm leading-relaxed text-muted">{l(s.description)}</p>
        <ul className="mt-5 space-y-2">
          {l(s.keyPoints).map((kp) => (
            <li key={kp} className="flex gap-2.5 text-sm font-medium text-graphite-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
              {kp}
            </li>
          ))}
        </ul>
        <span className="mt-auto inline-flex items-center gap-2 self-start pt-6 text-sm font-bold text-graphite-900">
          <span className="border-b-2 border-gold-400 pb-0.5 transition-colors group-hover:border-gold-600">{t.specialties.details}</span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-graphite-900 text-gold-300 transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </span>
      </div>
      <span className="tilt-glare" />
    </button>
  );
}

export function Specialties() {
  const { t, l } = useLang();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Specialty | null>(null);

  const visible = useMemo(() => {
    const q = normalize(query);
    return specialties.filter((s) => {
      if (filter !== 'all' && !s.tags.includes(filter)) return false;
      if (!q) return true;
      const haystack = normalize([l(s.title), l(s.description), ...l(s.keyPoints), ...l(s.procedures)].join(' '));
      return q.split(' ').every((w) => haystack.includes(w));
    });
  }, [filter, query, l]);

  const consult = (s: Specialty) => {
    setSelected(null);
    window.dispatchEvent(new CustomEvent(SELECT_SPECIALTY_EVENT, { detail: s.id }));
    setTimeout(() => scrollToSection('contacto'), 50);
  };

  return (
    <section id="especialidades" className="section relative bg-steel-200">
      <div className="bg-dots-dark absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <div className="container-x relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader eyebrow={t.specialties.eyebrow} title={t.specialties.title} subtitle={t.specialties.subtitle} />
          <label className="relative block w-full lg:max-w-xs">
            <span className="sr-only">{t.specialties.search}</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.specialties.search} className="field rounded-full pl-11" />
          </label>
        </div>

        <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="toolbar" aria-label={t.specialties.title}>
          {specialtiesData.filters.map((f) => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className={`shrink-0 ${filter === f.id ? 'chip-active' : 'chip-idle'}`}>
              {l(f.label)}
            </button>
          ))}
        </div>

        <ul className="mt-10 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((s, i) => (
            <li key={s.id} className="animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
              <SpecialtyCard s={s} index={specialties.indexOf(s)} onOpen={() => setSelected(s)} />
            </li>
          ))}
        </ul>
        {visible.length === 0 && <p className="mt-10 rounded-3xl border border-dashed border-steel-400 p-10 text-center text-muted">{t.specialties.empty}</p>}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} labelledBy="specialty-modal-title" closeLabel={t.specialties.close} wide>
        {selected && (
          <div>
            <header className="relative overflow-hidden px-6 pb-8 pt-28 text-white sm:px-10">
              <img src={selected.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-graphite-900 via-graphite-900/70 to-graphite-900/10" />
              <div className="relative flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gold-sheen text-graphite-950 shadow-gold">
                  <Icon name={selected.icon} className="h-7 w-7" />
                </span>
                <h3 id="specialty-modal-title" className="pr-10 text-2xl font-bold sm:text-3xl">
                  {l(selected.title)}
                </h3>
              </div>
              <p className="relative mt-4 text-steel-200">{l(selected.description)}</p>
            </header>
            <div className="grid gap-8 bg-steel-50 px-6 py-8 sm:px-10 md:grid-cols-2">
              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-graphite-900">
                  <FileText className="h-5 w-5 text-gold-600" aria-hidden="true" />
                  {t.specialties.procedures}
                </h4>
                <ol className="mt-4 space-y-3">
                  {l(selected.procedures).map((p, i) => (
                    <li key={p} className="flex gap-3 text-sm leading-relaxed text-ink">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-graphite-900 text-xs font-bold text-gold-200">{i + 1}</span>
                      {p}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-graphite-900">
                  <Sparkles className="h-5 w-5 text-gold-600" aria-hidden="true" />
                  {t.specialties.approach}
                </h4>
                <p className="mt-4 rounded-2xl border-l-4 border-gold-500 bg-white p-5 text-sm leading-relaxed text-graphite-900 shadow-soft">{l(selected.approach)}</p>
                <h4 className="mt-6 text-lg font-bold text-graphite-900">{t.specialties.keyPoints}</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {l(selected.keyPoints).map((kp) => (
                    <span key={kp} className="rounded-full bg-steel-200 px-3 py-1.5 text-xs font-semibold text-graphite-800">
                      {kp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <footer className="flex flex-col gap-3 border-t border-steel-200 bg-white px-6 py-6 sm:flex-row sm:px-10">
              <button type="button" className="btn-gold" onClick={() => consult(selected)}>
                {t.specialties.consult}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  const title = l(selected.title);
                  setSelected(null);
                  openChat(title);
                }}
              >
                <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                {t.specialties.askAssistant}
              </button>
            </footer>
          </div>
        )}
      </Modal>
    </section>
  );
}
