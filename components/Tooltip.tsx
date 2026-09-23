import React, { useEffect, useId, useRef, useState } from 'react';
import { TooltipBubble } from './ui/TooltipBubble';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
  contentClassName?: string;
  hidden?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
  contentClassName = '',
  hidden = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', close, true);
    return () => document.removeEventListener('keydown', close, true);
  }, [open]);
  return (
    <div
      ref={ref}
      className={`tooltip inline-flex ${className}`}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') setOpen(true);
      }}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      {children}
      {open && !hidden && ref.current && (
        <TooltipBubble
          anchor={
            ref.current.querySelector<HTMLElement>('button, a, input, [tabindex]') ?? ref.current
          }
          content={content}
          id={id}
          position={position}
          className={contentClassName}
        />
      )}
    </div>
  );
};

export default Tooltip;

/** Native controls share one help surface; explicit Tooltip owns rich content. */
export function ControlTooltips() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const activeAnchor = useRef<HTMLElement | null>(null);
  const id = useId();
  useEffect(() => {
    activeAnchor.current = anchor;
  }, [anchor]);
  useEffect(() => {
    const enter = (event: Event) => {
      if ('pointerType' in event && event.pointerType === 'touch') return;
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest<HTMLElement>(
        '[data-tooltip], button, [role="button"][aria-label], input[aria-label], select[aria-label]',
      );
      setAnchor(control && !control.closest('.tooltip, [role="tooltip"]') ? control : null);
    };
    const leave = () => setAnchor(null);
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeAnchor.current) {
        setAnchor(null);
      }
    };
    document.addEventListener('pointerover', enter);
    document.addEventListener('focusin', enter);
    document.addEventListener('pointerout', leave);
    document.addEventListener('focusout', leave);
    document.addEventListener('click', leave);
    document.addEventListener('keydown', key, true);
    return () => {
      document.removeEventListener('pointerover', enter);
      document.removeEventListener('focusin', enter);
      document.removeEventListener('pointerout', leave);
      document.removeEventListener('focusout', leave);
      document.removeEventListener('click', leave);
      document.removeEventListener('keydown', key, true);
    };
  }, []);
  const content =
    anchor?.dataset.tooltip || anchor?.getAttribute('aria-label') || anchor?.textContent?.trim();
  return anchor?.isConnected && content ? (
    <TooltipBubble anchor={anchor} content={content} id={id} />
  ) : null;
}
