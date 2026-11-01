import { Compass, Ear, Gavel } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';
import { site } from '../lib/data';
import { SectionHeader } from './SectionHeader';

const ICONS = [Ear, Compass, Gavel];

export function Process() {
  const { t, l } = useLang();
  const steps = useReveal<HTMLOListElement>();
  const photo = useTilt<HTMLDivElement>(7);

  return (
    <section className="section relative overflow-hidden bg-graphite-700 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#4A515C_0%,#383E48_55%,#2B3038_100%)]" />
      <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-gold-400/20 blur-[120px]" />
      <div className="bg-dots absolute inset-0 opacity-60" />

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-2">
        {/* Foto apilada en 3D */}
        <div className="scene-3d order-2 lg:order-1">
          <div ref={photo} className="tilt relative mx-auto max-w-lg">
            <div className="absolute -inset-3 rounded-[2.2rem] bg-white/5 ring-1 ring-white/10 [transform:translateZ(-40px)]" />
            <img src={site.about.image} alt={l(site.about.alt)} loading="lazy" className="relative aspect-[5/4] w-full rounded-[2rem] object-cover shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]" />
            <div className="tilt-pop absolute -bottom-6 border border-white/10 bg-graphite-900/90 shadow-lift backdrop-blur-md left-6 right-6 rounded-2xl p-5 [--pop:60px] sm:left-auto sm:right-[-1.5rem] sm:w-64">
              <p className="font-display text-4xl font-extrabold text-gold-gradient">24/7</p>
              <p className="mt-1 text-sm text-steel-200">{t.urgency.long}</p>
            </div>
            <span className="tilt-glare rounded-[2rem]" />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeader eyebrow={t.process.eyebrow} title={t.process.title} dark />
          <ol ref={steps} className="reveal mt-10 space-y-4">
            {t.process.steps.map((step, i) => {
              const Icon = ICONS[i];
              return (
                <li key={step.title} className="glass-dark group flex gap-5 rounded-3xl p-5 transition-all duration-300 hover:translate-x-1 hover:bg-white/10 sm:p-6">
                  <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gold-sheen text-graphite-950 shadow-gold transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="flex items-baseline gap-3 text-lg font-bold">
                      <span className="text-sm text-gold-300">0{i + 1}</span>
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-steel-300">{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
