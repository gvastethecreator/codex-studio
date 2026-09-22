import React, { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function TooltipBubble({
  anchor,
  content,
  id,
  position = 'top',
  className = '',
}: {
  anchor: HTMLElement;
  content: React.ReactNode;
  id: string;
  position?: 'top' | 'bottom';
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frameId = 0;
    const update = () => {
      const rect = anchor.getBoundingClientRect();
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const below =
        position === 'bottom' ? rect.bottom + height + 8 < innerHeight : rect.top < height + 12;
      node.style.left = `${Math.max(8, Math.min(innerWidth - width - 8, rect.left + (rect.width - width) / 2))}px`;
      node.style.top = `${Math.max(8, Math.min(innerHeight - height - 8, below ? rect.bottom + 8 : rect.top - height - 8))}px`;
    };
    const scheduleUpdate = () => {
      if (frameId !== 0) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        update();
      });
    };
    update();
    const oldDescription = anchor.getAttribute('aria-describedby');
    anchor.setAttribute('aria-describedby', [oldDescription, id].filter(Boolean).join(' '));
    window.addEventListener('resize', scheduleUpdate);
    document.addEventListener('scroll', scheduleUpdate, { capture: true, passive: true });
    return () => {
      if (oldDescription) anchor.setAttribute('aria-describedby', oldDescription);
      else anchor.removeAttribute('aria-describedby');
      if (frameId !== 0) window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', scheduleUpdate);
      document.removeEventListener('scroll', scheduleUpdate, true);
    };
  }, [anchor, content, id, position]);
  return createPortal(
    <div ref={ref} id={id} role="tooltip" className={`studio-tooltip ${className}`}>
      {content}
    </div>,
    anchor.closest('dialog[open]') ?? document.body,
  );
}
