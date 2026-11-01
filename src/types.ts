export type Lang = 'es' | 'en';

/** Texto bilingüe utilizado en todos los JSON de /src/data. */
export interface Localized<T = string> {
  es: T;
  en: T;
}

export interface Specialty {
  id: string;
  icon: string;
  /** Foto de la tarjeta (URL o ruta dentro de /public). */
  image_url: string;
  /** Etiquetas usadas por los filtros de la sección (ver `filters` en specialties.json). */
  tags: string[];
  title: Localized;
  description: Localized;
  keyPoints: Localized<string[]>;
  procedures: Localized<string[]>;
  approach: Localized;
}

export interface SpecialtyFilter {
  id: string;
  label: Localized;
}

export interface SpecialtiesFile {
  filters: SpecialtyFilter[];
  items: Specialty[];
}

export interface Lawyer {
  id: string;
  name: string;
  role: Localized;
  photo_url: string;
  specialties_ids: string[];
  bio: Localized;
  education: Localized<string[]>;
  linkedin?: string;
  email?: string;
}

export interface BlogPost {
  id: string;
  date: string;
  author: string;
  category: string;
  title: Localized;
  summary: Localized;
  content_md: Localized;
  image_url: string;
  readingMinutes?: number;
}

export interface SocialLink {
  id: 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'whatsapp' | string;
  label: string;
  url: string;
}

export interface SocialFile {
  contact: {
    address: Localized;
    city: string;
    mapsUrl: string;
    phone: string;
    phoneDisplay: string;
    email: string;
    hours: Localized;
  };
  whatsapp: {
    number: string;
    emergencyNumber: string;
    defaultMessage: Localized;
    emergencyMessage: Localized;
  };
  links: SocialLink[];
}

/** Rutas de imágenes globales del sitio (src/data/site.json). */
export interface SiteFile {
  brand: { mark: string; wordmark: string; full: string };
  hero: { image: string; alt: Localized; credit?: string };
  about: { image: string; alt: Localized };
  contact: { backgroundImage: string; alt: Localized };
}

/* ------------------------------ Asistente ------------------------------ */

export interface WeightedKeyword {
  /** Palabra o frase (sin importar tildes/mayúsculas). */
  term: string;
  weight: number;
}

export type AgentActionType = 'whatsapp' | 'whatsapp_emergency' | 'call' | 'call_emergency' | 'scroll' | 'link';

export interface AgentAction {
  type: AgentActionType;
  label: Localized;
  /** id de sección para `scroll` o URL para `link`. */
  target?: string;
}

export interface AgentIntent {
  id: string;
  category: string;
  emergency?: boolean;
  /** Multiplicador final del puntaje (prioriza intenciones específicas sobre las generales). */
  priority?: number;
  keywords: Localized<WeightedKeyword[]>;
  response: Localized;
  suggestions?: Localized<string[]>;
  actions?: AgentAction[];
}

export interface AgentKnowledge {
  version: string;
  config: {
    minScore: number;
    emergencyMinScore: number;
    /** Si el 2º mejor puntaje es ≥ este ratio del 1º, se sugiere como tema relacionado. */
    relatedRatio: number;
  };
  greeting: Localized;
  quickChips: Localized<string[]>;
  fallback: {
    response: Localized;
    suggestions: Localized<string[]>;
    actions?: AgentAction[];
  };
  intents: AgentIntent[];
}

export interface AgentReply {
  text: string;
  intentId: string | null;
  category: string | null;
  emergency: boolean;
  confidence: number;
  suggestions: string[];
  actions: AgentAction[];
  source: 'static' | 'remote';
}
