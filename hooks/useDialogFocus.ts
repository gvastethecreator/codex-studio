import { useEffect, useRef } from 'react';
import { useLatestRef } from './useLatestRef';

export function useDialogFocus(
  isOpen: boolean,
  onClose: () => void,
  returnFocusSelector?: string,
  initialFocusSelector?: string,
) {
  const ref = useRef<HTMLDivElement>(null);
  const openerRef = useRef<Element | null>(null);
  const restoreFrameRef = useRef<number | null>(null);
  const close = useLatestRef(onClose);
  useEffect(() => {
    if (!isOpen || !ref.current) return;
    if (restoreFrameRef.current !== null) cancelAnimationFrame(restoreFrameRef.current);
    const previous = openerRef.current ?? document.activeElement;
    openerRef.current = previous;
    const previousLabel = previous?.getAttribute('aria-label');
    const root = ref.current;
    const controls = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>('button, input, textarea, select, a[href], [tabindex]'),
      ).filter(
        (node) =>
          !node.matches(':disabled') &&
          !node.closest('[inert]') &&
          node.tabIndex >= 0 &&
          node.getClientRects().length > 0,
      );
    const preferred = initialFocusSelector
      ? root.querySelector<HTMLElement>(initialFocusSelector)
      : null;
    (preferred && controls().includes(preferred) ? preferred : (controls()[0] ?? root)).focus();
    const keydown = (event: KeyboardEvent) => {
      const dialogs = Array.from(
        document.querySelectorAll<HTMLElement>('[aria-modal="true"], dialog[open]'),
      ).filter((node) => !node.closest('[inert]') && node.getClientRects().length > 0);
      if (dialogs.at(-1) !== root) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        close.current();
      }
      if (event.key !== 'Tab') return;
      const items = controls();
      const first = items[0] ?? root;
      const last = items.at(-1) ?? root;
      if (
        !root.contains(document.activeElement) ||
        (event.shiftKey ? document.activeElement === first : document.activeElement === last)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener('keydown', keydown, true);
    return () => {
      document.removeEventListener('keydown', keydown, true);
      restoreFrameRef.current = requestAnimationFrame(() => {
        restoreFrameRef.current = null;
        openerRef.current = null;
        // An exit can finish after the user has already focused another control.
        if (document.activeElement !== document.body && !root.contains(document.activeElement))
          return;
        if (previous instanceof HTMLElement && previous !== document.body && previous.isConnected)
          previous.focus();
        else if (returnFocusSelector)
          document.querySelector<HTMLElement>(returnFocusSelector)?.focus();
        else if (previousLabel)
          document
            .querySelector<HTMLElement>(`[aria-label="${CSS.escape(previousLabel)}"]`)
            ?.focus();
      });
    };
  }, [isOpen, close, returnFocusSelector, initialFocusSelector]);
  return ref;
}
