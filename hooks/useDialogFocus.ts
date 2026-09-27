import { useEffect, useRef } from 'react';
import { useLatestRef } from './useLatestRef';

const inertOwners = new Map<HTMLElement, { count: number; previous: boolean }>();
let scrollLocks = 0;
let previousOverflow = '';

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
    const inertNodes: HTMLElement[] = [];
    let branch: HTMLElement = root;
    while (branch.parentElement && branch !== document.body) {
      for (const sibling of Array.from(branch.parentElement.children)) {
        if (
          !(sibling instanceof HTMLElement) ||
          sibling === branch ||
          sibling.tagName === 'SCRIPT' ||
          sibling.tagName === 'STYLE'
        )
          continue;
        const owner = inertOwners.get(sibling) ?? { count: 0, previous: sibling.inert };
        owner.count += 1;
        inertOwners.set(sibling, owner);
        sibling.inert = true;
        inertNodes.push(sibling);
      }
      branch = branch.parentElement;
    }
    if (scrollLocks++ === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
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
      for (const node of inertNodes) {
        const owner = inertOwners.get(node);
        if (owner && --owner.count === 0) {
          node.inert = owner.previous;
          inertOwners.delete(node);
        }
      }
      if (--scrollLocks === 0) document.body.style.overflow = previousOverflow;
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
