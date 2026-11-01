import { useLang } from '../i18n/LanguageContext';
import { site } from '../lib/data';

/** Logotipo oficial (emblema + nombre) extraído del logo del estudio, con fondo transparente. */
export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const { t } = useLang();
  const lg = size === 'lg';
  return (
    <a href="#inicio" className="group flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label={`${t.brand.prefix} ${t.brand.name} — ${t.nav.home}`}>
      <img
        src={site.brand.mark}
        alt=""
        className={`w-auto shrink-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105 ${lg ? 'h-16' : 'h-9 sm:h-11'}`}
      />
      <img src={site.brand.wordmark} alt={`${t.brand.prefix} ${t.brand.name}`} className={`w-auto min-w-0 ${lg ? 'h-9' : 'h-[22px] xs:h-6 sm:h-7'}`} />
    </a>
  );
}
