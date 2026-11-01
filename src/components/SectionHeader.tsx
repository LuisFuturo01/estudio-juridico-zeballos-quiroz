import type { ReactNode } from 'react';
import { useReveal } from '../hooks/useReveal';

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
  align?: 'left' | 'center';
  children?: ReactNode;
}

export function SectionHeader({ eyebrow, title, subtitle, dark, align = 'left', children }: Props) {
  const ref = useReveal<HTMLDivElement>();
  const center = align === 'center';
  return (
    <div ref={ref} className={`reveal ${center ? 'mx-auto max-w-3xl text-center' : ''}`}>
      <span className={`eyebrow ${dark ? 'eyebrow-light' : ''}`}>{eyebrow}</span>
      <h2 className={`section-title ${dark ? 'text-white' : ''}`}>{title}</h2>
      {subtitle && <p className={`section-subtitle ${center ? 'mx-auto' : ''} ${dark ? 'text-steel-300' : ''}`}>{subtitle}</p>}
      {children}
    </div>
  );
}
