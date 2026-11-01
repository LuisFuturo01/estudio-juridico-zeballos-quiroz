import type { Lang } from '../types';
import { social } from './data';

/** Enlace wa.me con mensaje predeterminado (codificado) según idioma. */
export function whatsappUrl(lang: Lang, opts: { emergency?: boolean; message?: string } = {}) {
  const { whatsapp } = social;
  const number = opts.emergency ? whatsapp.emergencyNumber : whatsapp.number;
  const text = opts.message ?? (opts.emergency ? whatsapp.emergencyMessage[lang] : whatsapp.defaultMessage[lang]);
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function telUrl(emergency = false) {
  return `tel:+${emergency ? social.whatsapp.emergencyNumber : social.contact.phone.replace(/^\+/, '')}`;
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** En social.json, el enlace de WhatsApp se genera con el número y el mensaje predeterminado. */
export function socialHref(id: string, url: string, lang: Lang) {
  return id === 'whatsapp' ? whatsappUrl(lang) : url;
}
