/**
 * EJEMPLO de función serverless (Vercel / Netlify / Cloudflare adaptables) para el formulario.
 * Uso: copiar a /api/contact.js en su plataforma, definir RESEND_API_KEY, CONTACT_TO_EMAIL y
 * CONTACT_FROM_EMAIL como variables de entorno DEL SERVIDOR, y en el front:
 *   VITE_CONTACT_PROVIDER=api
 *   VITE_CONTACT_API_URL=https://su-dominio/api/contact
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, phone, email, specialty, message, lang } = req.body ?? {};
  if (!name || !phone || !email || !message) return res.status(400).json({ error: 'Missing fields' });

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL,
      to: process.env.CONTACT_TO_EMAIL,
      reply_to: email,
      subject: `Nueva consulta web — ${specialty} — ${name}`,
      html: `<h2>Nueva consulta (${esc(lang)})</h2>
        <p><b>Nombre:</b> ${esc(name)}<br><b>Teléfono:</b> ${esc(phone)}<br><b>Correo:</b> ${esc(email)}<br><b>Área:</b> ${esc(specialty)}</p>
        <p>${esc(message).replace(/\n/g, '<br>')}</p>`,
    }),
  });
  return r.ok ? res.status(200).json({ ok: true }) : res.status(502).json({ error: 'Email provider error' });
}
