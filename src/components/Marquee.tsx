import { useLang } from '../i18n/LanguageContext';
import { specialties } from '../lib/data';
import { Icon } from './Icon';

/** Franja en movimiento con las especialidades (se alimenta de specialties.json). */
export function Marquee() {
  const { l } = useLang();
  const items = [...specialties, ...specialties];
  return (
    <div className="relative overflow-hidden bg-steel-200 py-6" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
        {[...items, ...items].map((s, i) => (
          <span key={i} className="inline-flex items-center gap-3 rounded-full bg-white/70 px-5 py-2.5 text-sm font-bold text-graphite-700 ring-1 ring-steel-300">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-graphite-900 text-gold-300">
              <Icon name={s.icon} className="h-3.5 w-3.5" />
            </span>
            {l(s.title)}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-steel-200 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-steel-200 to-transparent" />
    </div>
  );
}
