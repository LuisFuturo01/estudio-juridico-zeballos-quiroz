import { useEffect, useState } from 'react';
import { Menu, Siren, X } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { whatsappUrl } from '../lib/contact';
import { Logo } from './Logo';

const SECTIONS = ['inicio', 'especialidades', 'abogados', 'noticias', 'contacto'] as const;

function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  return (
    <div role="group" aria-label={t.lang.label} className={`relative inline-flex rounded-full bg-white/10 p-1 text-xs font-bold ring-1 ring-white/15 ${className}`}>
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-gold-sheen shadow-gold transition-transform duration-300 ease-in-out ${lang === 'en' ? 'translate-x-full' : ''}`}
      />
      {(['es', 'en'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`relative z-10 min-w-[2.4rem] rounded-full px-2.5 py-1.5 uppercase tracking-wider transition-colors duration-300 ${lang === code ? 'text-graphite-950' : 'text-steel-200 hover:text-white'}`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const { t, lang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('inicio');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), {
      rootMargin: '-45% 0px -50% 0px',
    });
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const labels: Record<(typeof SECTIONS)[number], string> = {
    inicio: t.nav.home,
    especialidades: t.nav.specialties,
    abogados: t.nav.lawyers,
    noticias: t.nav.news,
    contacto: t.nav.contact,
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 px-3 transition-all duration-300 ease-in-out sm:px-5 ${scrolled ? 'pt-2' : 'pt-3 sm:pt-4'}`}>
      <div
        className={`mx-auto max-w-7xl rounded-[1.4rem] border transition-all duration-300 ease-in-out 3xl:max-w-[1600px] ${
          scrolled || open ? 'border-white/10 bg-graphite-900/85 shadow-lift backdrop-blur-xl' : 'border-white/10 bg-graphite-900/40 backdrop-blur-md'
        }`}
      >
        <nav className="flex h-[64px] items-center justify-between gap-2 px-3 sm:h-[70px] sm:px-5" aria-label="Principal">
          <Logo />

          <ul className="hidden items-center gap-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10 lg:flex">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={active === id ? 'true' : undefined}
                  className={`block whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-300 xl:px-4 ${
                    active === id ? 'bg-white text-graphite-900 shadow-soft' : 'text-steel-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {labels[id]}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <LangSwitch className="hidden sm:inline-flex" />
            <a
              href={whatsappUrl(lang, { emergency: true })}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.urgency.aria}
              className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-b from-red-500 to-red-700 px-3 text-xs font-bold text-white shadow-[0_10px_24px_-10px_rgba(220,38,38,0.8)] ring-1 ring-red-400/50 transition-all duration-300 hover:-translate-y-0.5 sm:px-4 sm:text-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <Siren className="h-4 w-4" aria-hidden="true" />
              <span className="hidden xl:inline">{t.urgency.long}</span>
              <span className="hidden sm:inline xl:hidden">{t.urgency.short}</span>
            </a>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20 lg:hidden"
              aria-label={open ? t.nav.close : t.nav.menu}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <div
          id="mobile-menu"
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out lg:hidden ${open ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <ul className="flex flex-col gap-1 border-t border-white/10 p-3">
            {SECTIONS.map((id, i) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-lg font-semibold transition ${
                    active === id ? 'bg-white text-graphite-900' : 'text-steel-100 hover:bg-white/10'
                  }`}
                >
                  {labels[id]}
                  <span className={`text-xs ${active === id ? 'text-gold-600' : 'text-graphite-400'}`}>0{i + 1}</span>
                </a>
              </li>
            ))}
            <li className="mt-2 flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <span className="text-sm text-steel-300">{t.lang.label}</span>
              <LangSwitch />
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
