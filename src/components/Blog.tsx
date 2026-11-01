import { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, Clock, Search, UserRound } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { blogPosts, shortTitle, specialties, specialtyById } from '../lib/data';
import { normalize } from '../services/legalAgent';
import { Markdown } from '../lib/markdown';
import { useTilt } from '../hooks/useTilt';
import type { BlogPost, Lang } from '../types';
import { Modal } from './Modal';
import { SectionHeader } from './SectionHeader';

const formatDate = (iso: string, lang: Lang) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(lang === 'es' ? 'es-BO' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });

function Meta({ post, light }: { post: BlogPost; light?: boolean }) {
  const { t, lang } = useLang();
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium ${light ? 'text-steel-200' : 'text-muted'}`}>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
        <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
      </span>
      {post.readingMinutes && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {post.readingMinutes} {t.blog.minutes}
        </span>
      )}
    </div>
  );
}

function Featured({ post, category, onOpen }: { post: BlogPost; category: string; onOpen: () => void }) {
  const { t, l } = useLang();
  const tilt = useTilt<HTMLButtonElement>(4);
  return (
    <button ref={tilt} type="button" onClick={onOpen} className="tilt group relative block h-full min-h-[440px] w-full overflow-hidden rounded-3xl text-left shadow-lift lg:min-h-[520px]">
      <img src={post.image_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-graphite-950/95 via-graphite-950/40 to-transparent" />
      <div className="tilt-pop absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md [--pop:30px] sm:inset-x-6 sm:bottom-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gold-sheen px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-graphite-950">{t.blog.featured}</span>
          <span className="badge-gold">{category}</span>
        </div>
        <h3 className="mt-4 text-2xl font-bold leading-tight text-white sm:text-3xl">{l(post.title)}</h3>
        <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-steel-200 sm:text-base">{l(post.summary)}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Meta post={post} light />
          <span className="inline-flex items-center gap-1 text-sm font-bold text-gold-200">
            {t.blog.readMore} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
      <span className="tilt-glare" />
    </button>
  );
}

export function Blog() {
  const { t, l } = useLang();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<BlogPost | null>(null);

  const categories = useMemo(() => specialties.filter((s) => blogPosts.some((p) => p.category === s.id)), []);

  const visible = useMemo(() => {
    const q = normalize(query);
    return blogPosts.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      return q.split(' ').every((w) => normalize(`${l(p.title)} ${l(p.summary)} ${p.author}`).includes(w));
    });
  }, [category, query, l]);

  const catLabel = (id: string) => {
    const s = specialtyById(id);
    return s ? shortTitle(l(s.title)) : id;
  };

  const [featured, ...rest] = visible;

  return (
    <section id="noticias" className="section bg-steel-200">
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader eyebrow={t.blog.eyebrow} title={t.blog.title} subtitle={t.blog.subtitle} />
          <label className="relative block w-full lg:max-w-xs">
            <span className="sr-only">{t.blog.search}</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.blog.search} className="field rounded-full pl-11" />
          </label>
        </div>

        <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {[{ id: 'all', label: t.blog.all }, ...categories.map((c) => ({ id: c.id, label: catLabel(c.id) }))].map((c) => (
            <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => setCategory(c.id)} className={`shrink-0 ${category === c.id ? 'chip-active' : 'chip-idle'}`}>
              {c.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="mt-10 rounded-3xl border border-dashed border-steel-400 p-10 text-center text-muted">{t.blog.empty}</p>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Featured post={featured} category={catLabel(featured.category)} onOpen={() => setOpen(featured)} />
            </div>
            <div className="flex flex-col gap-4 lg:col-span-5">
              {rest.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setOpen(post)}
                  className="group flex gap-4 rounded-3xl bg-white/80 p-3 text-left shadow-soft ring-1 ring-white transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lift"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-32">
                    <img src={post.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col py-1 pr-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-700">{catLabel(post.category)}</span>
                    <h3 className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-graphite-900 transition-colors group-hover:text-gold-700">{l(post.title)}</h3>
                    <div className="mt-auto pt-2">
                      <Meta post={post} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} labelledBy="post-title" closeLabel={t.blog.close} wide>
        {open && (
          <article>
            <div className="relative aspect-[21/9] overflow-hidden">
              <img src={open.image_url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-graphite-950/80 to-transparent" />
              <span className="badge-gold absolute bottom-4 left-6 sm:left-10">{catLabel(open.category)}</span>
            </div>
            <div className="px-6 py-8 sm:px-10">
              <h3 id="post-title" className="text-2xl font-bold leading-tight text-graphite-900 sm:text-3xl">
                {l(open.title)}
              </h3>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-steel-200 pb-5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <UserRound className="h-3.5 w-3.5 text-gold-600" aria-hidden="true" />
                  {t.blog.by} {open.author}
                </span>
                <Meta post={open} />
              </div>
              <p className="mt-6 text-lg font-medium leading-relaxed text-graphite-800">{l(open.summary)}</p>
              <Markdown source={l(open.content_md)} className="prose-legal mt-4" />
            </div>
          </article>
        )}
      </Modal>
    </section>
  );
}
