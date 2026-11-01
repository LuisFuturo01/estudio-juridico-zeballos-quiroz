import { useLang } from '../i18n/LanguageContext';
import { site, social, specialties } from '../lib/data';
import { socialHref } from '../lib/contact';
import { Icon } from './Icon';

export function Footer() {
  const { t, l, lang } = useLang();
  const year = new Date().getFullYear();
  const nav = [
    ['inicio', t.nav.home],
    ['especialidades', t.nav.specialties],
    ['abogados', t.nav.lawyers],
    ['noticias', t.nav.news],
    ['contacto', t.nav.contact],
  ] as const;

  return (
    <footer className="relative overflow-hidden bg-graphite-900 text-steel-300">
      <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-gold-400/10 blur-[100px]" />
      <div className="container-x relative grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          {/* El logo completo ya incluye el eslogan oficial */}
          <img src={site.brand.full} alt={`${t.brand.prefix} ${t.brand.name}`} className="w-56 max-w-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" loading="lazy" />
          <p className="mt-5 text-sm">{social.contact.city}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {social.links.map((s) => (
              <li key={s.id}>
                <a
                  href={socialHref(s.id, s.url, lang)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-steel-200 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-gold-sheen hover:text-graphite-950"
                >
                  <Icon name={s.id} className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label={t.footer.quick}>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">{t.footer.quick}</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {nav.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="transition hover:text-white">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">{t.footer.areas}</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {specialties.map((s) => (
              <li key={s.id}>
                <a href="#especialidades" className="transition hover:text-white">
                  {l(s.title)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 pb-24 text-xs text-steel-400 sm:pb-6 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} Estudio Jurídico Zeballos Quiroz. {t.footer.rights}
          </p>
          <p className="max-w-xl md:text-right">{t.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
