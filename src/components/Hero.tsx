import { useEffect, useRef } from 'react';
import { BadgeCheck, CalendarCheck, MessageSquareText, Siren, Star } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { openChat } from '../lib/chatBus';
import { site } from '../lib/data';

/** Escena 3D: la foto y las tarjetas flotantes giran según el puntero (parallax por profundidad). */
function useScene() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        el.style.setProperty('--ry', `${x * 14}deg`);
        el.style.setProperty('--rx', `${-y * 10}deg`);
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);
  return ref;
}

export function Hero() {
  const { t, l } = useLang();
  const scene = useScene();

  return (
    <section id="inicio" className="relative isolate overflow-hidden bg-graphite-800 pt-24 text-white sm:pt-28">
      {/* Fondo: degradado plomo + halos de color + puntos */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#2B3038_0%,#3A414B_45%,#4A515C_100%)]" />
      <div className="absolute -left-24 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-gold-400/25 blur-[110px]" />
      <div className="absolute -right-20 bottom-0 -z-10 h-[460px] w-[460px] rounded-full bg-sky-400/15 blur-[120px]" />
      <div className="bg-dots absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="noise absolute inset-0 -z-10" />

      <div className="container-x grid items-center gap-14 pb-20 pt-6 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[1.05fr_0.95fr] lg:pb-24">
        {/* Texto */}
        <div className="animate-fade-up">
          <span className="eyebrow eyebrow-light">{t.hero.eyebrow}</span>
          <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.03em] xs:text-5xl sm:text-6xl xl:text-7xl 3xl:text-8xl">
            {t.hero.title} <span className="text-gold-gradient">{t.hero.titleAccent}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-steel-200 sm:text-lg">{t.hero.subtitle}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#contacto" className="btn-gold px-7 py-4 text-base">
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              {t.hero.ctaPrimary}
            </a>
            <button type="button" onClick={() => openChat()} className="btn-glass px-7 py-4 text-base">
              <MessageSquareText className="h-5 w-5" aria-hidden="true" />
              {t.hero.ctaSecondary}
            </button>
          </div>

          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-3">
            {t.hero.stats.map((s) => (
              <div key={s.label} className="glass-dark flex flex-col rounded-2xl px-4 py-4 transition-transform duration-300 hover:-translate-y-1">
                <dt className="order-2 mt-1 text-[11px] font-medium leading-snug text-steel-300 sm:text-xs">{s.label}</dt>
                <dd className="order-1 font-display text-xl font-bold text-gold-200 sm:text-2xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Escena 3D con la foto */}
        <div ref={scene} className="scene-3d relative mx-auto w-full max-w-[460px] animate-fade-up [animation-delay:150ms] lg:max-w-[520px]">
          {/* Aro dorado en perspectiva */}
          <div className="pointer-events-none absolute left-1/2 top-[58%] -z-10 h-[115%] w-[115%] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]">
            <div className="h-full w-full animate-spin-3d rounded-full border-[3px] border-dashed border-gold-300/40" />
          </div>

          <div
            className="relative transition-transform duration-300 ease-out [transform-style:preserve-3d]"
            style={{ transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))' }}
          >
            {/* Placa trasera desplazada (profundidad) */}
            <div className="absolute inset-0 rounded-[2rem] bg-gold-sheen opacity-90" style={{ transform: 'translate3d(20px, 20px, -60px)' }} />

            <figure className="relative overflow-hidden rounded-[2rem] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/20">
              <img src={site.hero.image} alt={l(site.hero.alt)} className="aspect-[4/5] w-full object-cover" width={1100} height={1300} />
              <div className="absolute inset-0 bg-gradient-to-t from-graphite-950/60 via-transparent to-transparent" />
            </figure>

            {/* Tarjetas flotantes en distintas profundidades */}
            <div className="absolute -right-3 top-10 flex animate-float border border-white/10 bg-graphite-900/85 shadow-lift backdrop-blur-md sm:-right-8 items-center gap-3 rounded-2xl px-4 py-3 [--z:70px]" style={{ transform: 'translateZ(70px)' }}>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/20 text-emerald-300">
                <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold">{t.hero.floatingCase}</span>
                <span className="block text-xs text-steel-300">{t.hero.floatingCaseText}</span>
              </span>
            </div>

            <div
              className="absolute -left-3 bottom-24 flex animate-float border border-white/10 bg-graphite-900/85 shadow-lift backdrop-blur-md items-center gap-3 rounded-2xl px-4 py-3 [--z:110px] [animation-delay:1.5s] sm:-left-10"
              style={{ transform: 'translateZ(110px)' }}
            >
              <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-red-500/20 text-red-300">
                <Siren className="h-5 w-5" aria-hidden="true" />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-graphite-800" />
              </span>
              <span>
                <span className="block text-sm font-bold">{t.hero.floatingOnline}</span>
                <span className="block text-xs text-steel-300">{t.hero.floatingOnlineText} · 24/7</span>
              </span>
            </div>

            <div
              className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3 text-graphite-900 shadow-lift backdrop-blur [--z:50px]"
              style={{ transform: 'translateZ(50px)' }}
            >
              <img src={site.brand.mark} alt="" className="h-9 w-auto drop-shadow" />
              <span className="flex-1 text-sm font-bold leading-tight">{t.hero.rating}</span>
              <span className="flex text-gold-500" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transición curva hacia la siguiente sección */}
      <svg className="absolute -bottom-px left-0 w-full text-steel-200" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0 60V30C240 0 480 0 720 20s480 40 720 10v30z" />
      </svg>
    </section>
  );
}
