import { Fragment, type ReactNode } from 'react';

/**
 * Renderizador Markdown mínimo y seguro (sin dangerouslySetInnerHTML).
 * Soporta: ## / ### títulos, listas (- , 1. , •), > citas, **negrita**, *cursiva* y párrafos.
 */
function inline(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={key}>{part.slice(1, -1)}</em>;
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export function Markdown({ source, className = '' }: { source: string; className?: string }) {
  const lines = source.split('\n');
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      const k = `p${blocks.length}`;
      blocks.push(
        <p key={k}>
          {paragraph.map((l, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {inline(l, `${k}-${i}`)}
            </Fragment>
          ))}
        </p>,
      );
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      const k = `l${blocks.length}`;
      const items = list.items.map((it, i) => <li key={i}>{inline(it, `${k}-${i}`)}</li>);
      blocks.push(list.ordered ? <ol key={k}>{items}</ol> : <ul key={k}>{items}</ul>);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    const ordered = /^\d+\.\s+/.test(line);
    const bullet = /^[-•]\s+/.test(line);
    if (!line) {
      flushParagraph();
      flushList();
    } else if (line.startsWith('### ') || line.startsWith('## ')) {
      flushParagraph();
      flushList();
      const level = line.startsWith('### ') ? 4 : 3;
      const text = line.replace(/^#+\s+/, '');
      blocks.push(level === 3 ? <h3 key={`h${blocks.length}`}>{text}</h3> : <h4 key={`h${blocks.length}`}>{text}</h4>);
    } else if (line.startsWith('> ')) {
      flushParagraph();
      flushList();
      blocks.push(<blockquote key={`q${blocks.length}`}>{inline(line.slice(2), `q${blocks.length}`)}</blockquote>);
    } else if (ordered || bullet) {
      flushParagraph();
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push(line.replace(/^(\d+\.|[-•])\s+/, ''));
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return <div className={className}>{blocks}</div>;
}
