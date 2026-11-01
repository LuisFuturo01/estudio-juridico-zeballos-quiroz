import {
  Briefcase,
  CarFront,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Scale,
  ScrollText,
  Trees,
  Users,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

/**
 * Mapa de nombres de ícono usados en los JSON → componente.
 * Para una nueva especialidad: agregue aquí el ícono de https://lucide.dev y úselo por nombre en el JSON.
 */
const registry: Record<string, LucideIcon> = {
  users: Users,
  'scroll-text': ScrollText,
  briefcase: Briefcase,
  trees: Trees,
  'car-front': CarFront,
  scale: Scale,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  tiktok: Music2,
  whatsapp: MessageCircle,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = registry[name] ?? Scale;
  return <Cmp aria-hidden="true" {...props} />;
}
