/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_PROVIDER?: 'emailjs' | 'api' | 'none';
  readonly VITE_EMAILJS_SERVICE_ID?: string;
  readonly VITE_EMAILJS_TEMPLATE_ID?: string;
  readonly VITE_EMAILJS_PUBLIC_KEY?: string;
  readonly VITE_CONTACT_API_URL?: string;
  readonly VITE_AI_AGENT_MODE?: 'static' | 'remote';
  readonly VITE_AI_AGENT_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
