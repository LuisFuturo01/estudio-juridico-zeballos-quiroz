/**
 * Servicio de envío del formulario de contacto.
 * Proveedor configurable vía .env (VITE_CONTACT_PROVIDER): 'emailjs' | 'api' | 'none'.
 * Ninguna credencial está escrita en el código: todo se lee de import.meta.env.
 */
import type { Lang } from '../types';

export interface ContactPayload {
  name: string;
  phone: string;
  email: string;
  specialty: string;
  message: string;
  lang: Lang;
}

export type ContactResult = { ok: true; mode: 'sent' | 'demo' } | { ok: false; error: string };

const env = import.meta.env;

async function sendWithEmailJS(p: ContactPayload): Promise<ContactResult> {
  const service_id = env.VITE_EMAILJS_SERVICE_ID;
  const template_id = env.VITE_EMAILJS_TEMPLATE_ID;
  const user_id = env.VITE_EMAILJS_PUBLIC_KEY;
  if (!service_id || !template_id || !user_id) return { ok: false, error: 'EmailJS no configurado (.env)' };

  // API REST oficial de EmailJS (sin SDK adicional).
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id,
      template_id,
      user_id,
      template_params: {
        from_name: p.name,
        phone: p.phone,
        reply_to: p.email,
        specialty: p.specialty,
        message: p.message,
        language: p.lang,
      },
    }),
  });
  return res.ok ? { ok: true, mode: 'sent' } : { ok: false, error: `EmailJS ${res.status}` };
}

async function sendWithApi(p: ContactPayload): Promise<ContactResult> {
  const url = env.VITE_CONTACT_API_URL;
  if (!url) return { ok: false, error: 'VITE_CONTACT_API_URL no configurado' };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p),
  });
  return res.ok ? { ok: true, mode: 'sent' } : { ok: false, error: `API ${res.status}` };
}

export async function sendContactMessage(payload: ContactPayload): Promise<ContactResult> {
  try {
    switch (env.VITE_CONTACT_PROVIDER) {
      case 'emailjs':
        return await sendWithEmailJS(payload);
      case 'api':
        return await sendWithApi(payload);
      default:
        await new Promise((r) => setTimeout(r, 700));
        return { ok: true, mode: 'demo' };
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
