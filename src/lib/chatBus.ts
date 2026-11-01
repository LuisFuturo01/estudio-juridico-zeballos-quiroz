/** Canal mínimo para abrir el chat desde cualquier componente (Hero, modales, etc.). */
const EVENT = 'zq:open-chat';

export function openChat(prompt?: string) {
  window.dispatchEvent(new CustomEvent<string | undefined>(EVENT, { detail: prompt }));
}

export function onOpenChat(handler: (prompt?: string) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<string | undefined>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

/** Evento para preseleccionar la especialidad en el formulario de contacto. */
export const SELECT_SPECIALTY_EVENT = 'zq:select-specialty';
