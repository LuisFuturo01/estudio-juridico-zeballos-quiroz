# Estudio Jurídico Zeballos Quiroz — Plataforma Web

> *Inteligencia jurídica a su servicio.* — La Paz, Bolivia

Sitio corporativo bilingüe (ES / EN), 100 % responsivo (320 px → 4K), con contenido desacoplado en archivos JSON y un **Asistente Legal** con motor de intenciones estático listo para migrar a un LLM.

**Stack:** Vite 5 · React 18 · TypeScript · Tailwind CSS 3 · lucide-react (íconos). Sin backend obligatorio.

---

## 1. Ejecutar localmente

Requisitos: **Node.js 18+** (probado con Node 22).

```bash
npm install
cp .env.example .env      # opcional: configure el envío de correos
npm run dev               # http://localhost:5173
```

| Comando             | Descripción                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo con recarga en caliente |
| `npm run build`     | Verificación de tipos + build en `/dist`       |
| `npm run preview`   | Sirve el build de producción localmente        |
| `npm run typecheck` | Solo verificación TypeScript                   |

El contenido de `/dist` es estático: puede publicarse en Vercel, Netlify, Cloudflare Pages, GitHub Pages o cualquier hosting.

---

## 2. Estructura

```
├── public/images/brand/      Logo oficial extraído con fondo transparente (emblema, nombre, completo)
├── server/                   Ejemplos de funciones serverless (Resend y proxy LLM)
├── src/
│   ├── data/                 ← CONTENIDO EDITABLE (JSON)
│   │   ├── site.json         Rutas de imágenes globales (logo, portada, secciones)
│   │   ├── specialties.json
│   │   ├── lawyers.json
│   │   ├── blog.json
│   │   ├── social.json
│   │   └── legal_agent_knowledge.json
│   ├── services/
│   │   ├── legalAgent.ts     processLegalQuery(prompt, lang) — motor del asistente
│   │   └── contactService.ts Envío del formulario (EmailJS / API / demo)
│   ├── i18n/                 Textos fijos de interfaz + contexto de idioma (persistido en localStorage)
│   ├── components/           Navbar, Hero (escena 3D), Marquee, Specialties, Process, Lawyers (3D flip), Blog, Contact, Footer, ChatWidget…
│   ├── hooks/                useTilt (inclinación 3D), useReveal (aparición al hacer scroll)
│   └── lib/                  Acceso a datos, WhatsApp/teléfono, mini-renderer Markdown
├── .env.example
└── tailwind.config.js        Design system (paleta navy/oro, tipografías, sombras)
```

---

## 3. Editar contenido (sin tocar código)

Todos los textos bilingües usan la forma `{ "es": "...", "en": "..." }`. Tras guardar un JSON, el sitio se actualiza (en desarrollo al instante; en producción tras `npm run build`).

### Imágenes y rutas — `src/data/site.json`

Todas las imágenes del sitio se definen en JSON (nunca en el código):

| Archivo | Campo | Uso |
| --- | --- | --- |
| `site.json` | `brand.mark` / `brand.wordmark` / `brand.full` | Emblema, nombre y logo completo (PNG transparentes en `public/images/brand/`) |
| `site.json` | `hero.image` | Foto de la portada (persona) |
| `site.json` | `about.image` | Foto de la sección "Cómo trabajamos" |
| `site.json` | `contact.backgroundImage` | Fondo de la sección de contacto (La Paz) |
| `specialties.json` | `image_url` | Foto de cada tarjeta de especialidad |
| `lawyers.json` | `photo_url` | Retrato de cada abogado |
| `blog.json` | `image_url` | Portada de cada artículo |

> Las fotos actuales son **referenciales de Unsplash** (licencia gratuita). Para usar fotos propias, copie el archivo a `public/images/...` y cambie la ruta, p. ej. `"photo_url": "/images/equipo/zeballos.jpg"`.

### Añadir un abogado — `src/data/lawyers.json`

Agregue un objeto al arreglo; la grilla se adapta sola:

```json
{
  "id": "nuevo-abogado",
  "name": "Abg. Nombre Apellido",
  "role": { "es": "Abogada Asociada", "en": "Associate Attorney" },
  "photo_url": "/images/equipo/nuevo-abogado.jpg",
  "specialties_ids": ["familia", "civil"],
  "bio": { "es": "Semblanza…", "en": "Bio…" },
  "education": { "es": ["Licenciatura en Derecho — UMSA"], "en": ["Law Degree — UMSA"] },
  "linkedin": "https://www.linkedin.com/in/…",
  "email": "correo@zeballosquiroz.bo"
}
```

- Coloque la foto en `public/images/equipo/` (recomendado: vertical 4:5, ≥ 800×1000 px, JPG/WebP).
- `specialties_ids` debe usar los `id` de `specialties.json` → se muestran como badges dorados.

### Añadir una especialidad — `src/data/specialties.json`

Agregue un elemento a `items` con: `id`, `icon`, `image_url`, `tags`, `title`, `description`, `keyPoints`, `procedures`, `approach`.

- `tags` conecta con los filtros declarados en `filters` (puede crear filtros nuevos ahí mismo).
- `icon`: nombre registrado en `src/components/Icon.tsx`. Los disponibles son `users`, `scroll-text`, `briefcase`, `trees`, `car-front`, `scale`. Para otro ícono de [lucide.dev](https://lucide.dev), impórtelo y añádalo al `registry` (2 líneas).
- La nueva área aparece automáticamente en la grilla, el formulario de contacto, el footer y los filtros del blog.

### Publicar una noticia — `src/data/blog.json`

Campos: `id`, `date` (AAAA-MM-DD), `author`, `category` (id de especialidad), `title`, `summary`, `content_md`, `image_url`, `readingMinutes` (opcional). Se ordenan por fecha; la más reciente es la destacada.
`content_md` admite: `## títulos`, listas `-` / `1.`, `> citas`, `**negrita**` y `*cursiva*`.

### Contacto y redes — `src/data/social.json`

- `contact`: dirección, teléfono, correo, horarios y enlace de Google Maps.
- `whatsapp.number` / `emergencyNumber`: formato internacional **sin `+` ni espacios** (ej. `59171234567`). El número de emergencia se usa en el botón **Urgencias 24/7** y en las respuestas de emergencia del asistente.
- `defaultMessage` / `emergencyMessage`: mensaje prellenado (se codifica automáticamente en la URL).
- `links`: Facebook, Instagram, LinkedIn, TikTok, WhatsApp. Para WhatsApp deje `"url": "whatsapp"` (se genera con el número y mensaje).

> ⚠️ **Antes de publicar**: los nombres de abogados, fotos (referenciales de Unsplash), teléfonos (`5917000000x`), correo, dirección y enlaces de redes son **datos de ejemplo**. Reemplácelos por los reales.

---

## 4. Formulario de contacto y variables de entorno

Configure en `.env` (ver comentarios en `.env.example`):

| `VITE_CONTACT_PROVIDER` | Comportamiento |
| --- | --- |
| `none` (por defecto) | Modo demostración: valida, simula el envío y ofrece WhatsApp. |
| `emailjs` | Envío directo vía API REST de EmailJS. Requiere `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`. Variables de plantilla: `from_name`, `phone`, `reply_to`, `specialty`, `message`, `language`. |
| `api` | `POST` JSON a `VITE_CONTACT_API_URL`. Use `server/contact-resend.example.js` como base (Resend). |

**Seguridad:** las variables `VITE_*` se incrustan en el JS público. Ahí solo van valores públicos (Public Key de EmailJS, URLs). Las claves secretas (`RESEND_API_KEY`, `ANTHROPIC_API_KEY`…) se definen **solo en el servidor**. `.env` está en `.gitignore`.

---

## 5. Asistente Legal (mini-modelo estático)

### Cómo funciona

`src/services/legalAgent.ts` → `processLegalQuery(prompt, lang)`:

1. **Normaliza** el texto (minúsculas, sin tildes ni signos).
2. **Puntúa** cada intención de `legal_agent_knowledge.json`: suma los `weight` de los términos encontrados (coincidencia por inicio de palabra: `"divorci"` encuentra *divorcio*, *divorciarme*) × `priority`. Evalúa ambos idiomas (el no activo al 60 %).
3. **Emergencias primero**: si una intención `"emergency": true` supera `emergencyMinScore`, gana siempre y muestra botones de llamada/WhatsApp de guardia.
4. **Fallback**: si ningún puntaje alcanza `minScore`, responde con empatía y sugiere áreas + contacto humano.
5. Si una segunda intención queda cerca (`relatedRatio`), se ofrece como chip relacionado.

### Añadir una intención

```json
{
  "id": "herencia_sucesion",
  "category": "civil",
  "priority": 1.15,
  "keywords": {
    "es": [{ "term": "herencia", "weight": 4 }, { "term": "declaratoria de herederos", "weight": 5 }],
    "en": [{ "term": "inheritance", "weight": 4 }]
  },
  "response": { "es": "Texto con **negrita** y\n• viñetas", "en": "…" },
  "suggestions": { "es": ["¿Cuánto cuesta la consulta?"], "en": ["How much is a consultation?"] },
  "actions": [{ "type": "scroll", "target": "contacto", "label": { "es": "Agendar", "en": "Book" } }]
}
```

- Tipos de `actions`: `whatsapp`, `whatsapp_emergency`, `call`, `call_emergency`, `scroll` (target = id de sección), `link` (target = URL o `"maps"`).
- Las respuestas admiten plantillas: `{{address}}`, `{{city}}`, `{{phone}}`, `{{email}}`, `{{hours}}` (tomadas de `social.json`).
- Pesos orientativos: 4–5 término muy específico · 2–3 término del área · 1–1.5 palabra de contexto.

### Migrar a un LLM (OpenAI / Anthropic / Gemini)

La interfaz del chat solo consume `processLegalQuery` y su tipo `AgentReply`; no requiere cambios.

1. Despliegue un endpoint propio basado en `server/ai-agent.example.js` (incluye ejemplo con la API de Anthropic; para otro proveedor cambie solo la llamada `fetch`). La API key queda en el servidor.
2. En `.env`:
   ```
   VITE_AI_AGENT_MODE=remote
   VITE_AI_AGENT_ENDPOINT=https://su-dominio/api/agent
   ```
3. Listo. Si el endpoint falla, el asistente vuelve automáticamente al modelo estático, y las **emergencias se detectan siempre localmente** aunque el LLM no las marque.

---

## 6. Design system

Estética moderna en tonos **grafito / plomo** con acentos dorados del logo, efectos de vidrio (glassmorphism) y profundidad 3D.

| Token | Valor |
| --- | --- |
| Grafito (plomo oscuro) | `graphite-900 #1D2026` · `graphite-800 #2B3038` · `graphite-600 #4A515C` |
| Acero (fondos claros grises) | `steel-100 #ECEEF1` · `steel-200 #DFE3E8` · `steel-300 #CBD1D9` |
| Oro (del logo) | `gold-500 #C5A059` · `gold-400 #D4AF37` · degradado `bg-gold-sheen` |
| Texto | `ink #1E232B` · `muted #5B6470` |
| Títulos | **Sora** (geométrica, moderna) |
| Cuerpo / UI | **Manrope** |

**Efectos 3D:**
- `useTilt` + clase `.tilt`: las tarjetas se inclinan siguiendo el cursor, con brillo especular (`.tilt-glare`) y capas que "salen" de la tarjeta (`.tilt-pop`).
- Portada: escena con perspectiva; la foto, la placa dorada y las tarjetas flotantes están a distintas profundidades (`translateZ`) y giran con el puntero, más un aro dorado rotando en 3D.
- Abogados: giro 3D de la tarjeta (tap en móvil, hover en escritorio) combinado con inclinación.
- Todo se desactiva con `prefers-reduced-motion` y en pantallas táctiles (sin hover) para mantener el rendimiento.

Clases reutilizables en `src/index.css`: `btn-gold`, `btn-dark`, `btn-glass`, `btn-outline`, `glass-dark`, `glass-light`, `chip-*`, `field`, `eyebrow`, `section-title`, `prose-legal`.

## 7. Accesibilidad y UX

- Navegación por teclado completa; modales con `Esc`, foco gestionado y `aria-modal`.
- Tarjetas de abogados: giro por **hover solo en dispositivos con puntero fino**; en móviles/tablets por **tap**, con indicador "Toque para ver perfil"; también con `Enter`/`Espacio`.
- Idioma persistente (`localStorage`, con fallback seguro si está bloqueado) y `<html lang>` dinámico.
