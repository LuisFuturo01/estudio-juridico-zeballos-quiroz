import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Clock, Info, Loader2, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { site, social, specialties } from '../lib/data';
import { socialHref, telUrl, whatsappUrl } from '../lib/contact';
import { SELECT_SPECIALTY_EVENT } from '../lib/chatBus';
import { sendContactMessage } from '../services/contactService';
import { Icon } from './Icon';
import { SectionHeader } from './SectionHeader';

type Fields = { name: string; phone: string; email: string; specialty: string; message: string; consent: boolean };
type Errors = Partial<Record<keyof Fields, string>>;
type Status = 'idle' | 'sending' | 'sent' | 'demo' | 'error';

const EMPTY: Fields = { name: '', phone: '', email: '', specialty: '', message: '', consent: false };

export function Contact() {
  const { t, l, lang } = useLang();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');

  // Preselección desde el modal de especialidades.
  useEffect(() => {
    const handler = (e: Event) => setFields((f) => ({ ...f, specialty: (e as CustomEvent<string>).detail }));
    window.addEventListener(SELECT_SPECIALTY_EVENT, handler);
    return () => window.removeEventListener(SELECT_SPECIALTY_EVENT, handler);
  }, []);

  const validate = (f: Fields): Errors => {
    const e: Errors = {};
    if (f.name.trim().length < 3) e.name = t.contact.errors.name;
    const digits = f.phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) e.phone = t.contact.errors.phone;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = t.contact.errors.email;
    if (!f.specialty) e.specialty = t.contact.errors.specialty;
    if (f.message.trim().length < 15) e.message = t.contact.errors.message;
    if (!f.consent) e.consent = t.contact.errors.consent;
    return e;
  };

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const found = validate(fields);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`cf-${first}`)?.focus();
      return;
    }
    setStatus('sending');
    const specialty = specialties.find((s) => s.id === fields.specialty);
    const res = await sendContactMessage({
      name: fields.name.trim(),
      phone: fields.phone.trim(),
      email: fields.email.trim(),
      specialty: specialty ? specialty.title.es : t.contact.other,
      message: fields.message.trim(),
      lang,
    });
    if (res.ok) {
      setStatus(res.mode === 'demo' ? 'demo' : 'sent');
      setFields(EMPTY);
    } else {
      console.error('[contact]', res.error);
      setStatus('error');
    }
  };

  const fieldProps = (key: keyof Fields) => ({
    id: `cf-${key}`,
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `cf-${key}-err` : undefined,
  });
  const Err = ({ k }: { k: keyof Fields }) =>
    errors[k] ? (
      <p id={`cf-${k}-err`} className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-600">
        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
        {errors[k]}
      </p>
    ) : null;

  const c = social.contact;
  const labelCls = 'mb-1.5 block text-sm font-bold text-graphite-900';
  const infoRow = 'flex gap-4 rounded-2xl p-3 transition hover:bg-white/5';
  const iconBox = 'grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-300/15 text-gold-300';

  return (
    <section id="contacto" className="section relative isolate overflow-hidden">
      <img src={site.contact.backgroundImage} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-graphite-900/90 via-graphite-800/70 to-graphite-600/40" />

      <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <SectionHeader eyebrow={t.contact.eyebrow} title={t.contact.title} subtitle={t.contact.subtitle} dark />

          <div className="glass-dark mt-10 rounded-3xl p-4 text-white sm:p-5">
            <ul className="space-y-1 text-sm">
              <li className={infoRow}>
                <span className={iconBox}>
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-bold">{t.contact.address}</p>
                  <p className="mt-0.5 text-steel-300">
                    {l(c.address)}, {c.city}
                  </p>
                  <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-bold text-gold-300 underline-offset-4 hover:underline">
                    {t.contact.openMaps} →
                  </a>
                </div>
              </li>
              <li>
                <a href={telUrl()} className={`${infoRow} items-center`}>
                  <span className={iconBox}>
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-semibold text-steel-100">{c.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${c.email}`} className={`${infoRow} items-center`}>
                  <span className={iconBox}>
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="break-all font-semibold text-steel-100">{c.email}</span>
                </a>
              </li>
              <li className={infoRow}>
                <span className={iconBox}>
                  <Clock className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-bold">{t.contact.hours}</p>
                  <p className="mt-0.5 text-steel-300">{l(c.hours)}</p>
                </div>
              </li>
            </ul>
            <div className="mt-3 flex flex-col gap-4 border-t border-white/10 p-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-steel-400">{t.contact.follow}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {social.links.map((s) => (
                    <li key={s.id}>
                      <a
                        href={socialHref(s.id, s.url, lang)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        title={s.label}
                        className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-gold-sheen hover:text-graphite-950"
                      >
                        <Icon name={s.id} className="h-5 w-5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <a href={whatsappUrl(lang)} target="_blank" rel="noopener noreferrer" className="btn-gold shrink-0 whitespace-nowrap">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {t.contact.whatsapp}
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className="glass-light self-start rounded-[2rem] p-6 sm:p-8 lg:mt-14" aria-label={t.contact.title}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="cf-name" className={labelCls}>
                {t.contact.name} *
              </label>
              <input {...fieldProps('name')} type="text" autoComplete="name" value={fields.name} onChange={(e) => set('name', e.target.value)} className={`field ${errors.name ? 'field-error' : ''}`} />
              <Err k="name" />
            </div>
            <div>
              <label htmlFor="cf-phone" className={labelCls}>
                {t.contact.phone} *
              </label>
              <input {...fieldProps('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+591 7…" value={fields.phone} onChange={(e) => set('phone', e.target.value)} className={`field ${errors.phone ? 'field-error' : ''}`} />
              <Err k="phone" />
            </div>
            <div>
              <label htmlFor="cf-email" className={labelCls}>
                {t.contact.email} *
              </label>
              <input {...fieldProps('email')} type="email" autoComplete="email" value={fields.email} onChange={(e) => set('email', e.target.value)} className={`field ${errors.email ? 'field-error' : ''}`} />
              <Err k="email" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="cf-specialty" className={labelCls}>
                {t.contact.specialty} *
              </label>
              <select
                {...fieldProps('specialty')}
                value={fields.specialty}
                onChange={(e) => set('specialty', e.target.value)}
                className={`field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%235B6470%22><path d=%22M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z%22/></svg>')] bg-[length:1.25rem] bg-[right_0.9rem_center] bg-no-repeat pr-10 ${errors.specialty ? 'field-error' : ''}`}
              >
                <option value="">{t.contact.specialtyPlaceholder}</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {l(s.title)}
                  </option>
                ))}
                <option value="otra">{t.contact.other}</option>
              </select>
              <Err k="specialty" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="cf-message" className={labelCls}>
                {t.contact.message} *
              </label>
              <textarea {...fieldProps('message')} rows={5} placeholder={t.contact.messagePlaceholder} value={fields.message} onChange={(e) => set('message', e.target.value)} className={`field resize-y ${errors.message ? 'field-error' : ''}`} />
              <Err k="message" />
            </div>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-graphite-600">
                <input {...fieldProps('consent')} type="checkbox" checked={fields.consent} onChange={(e) => set('consent', e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-graphite-900" />
                {t.contact.consent}
              </label>
              <Err k="consent" />
            </div>
          </div>

          <button type="submit" disabled={status === 'sending'} className="btn-dark mt-6 w-full py-4 text-base">
            {status === 'sending' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
            {status === 'sending' ? t.contact.sending : t.contact.submit}
          </button>

          <div aria-live="polite" className="mt-4 empty:hidden">
            {status === 'sent' && (
              <p className="flex items-start gap-2 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {t.contact.success}
              </p>
            )}
            {status === 'demo' && (
              <p className="flex items-start gap-2 rounded-2xl bg-gold-50 p-4 text-sm text-graphite-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
                <span>
                  {t.contact.demo}{' '}
                  <a href={whatsappUrl(lang)} target="_blank" rel="noopener noreferrer" className="font-bold text-gold-700 underline underline-offset-4">
                    {t.contact.whatsapp}
                  </a>
                </span>
              </p>
            )}
            {status === 'error' && (
              <p className="flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {t.contact.error}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
