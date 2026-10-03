import React, {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useGSAP } from '@gsap/react';

import gsap from '../../lib/motionRuntime';
import { cn } from '../../lib/utils';
import { workbenchAmbientPortalProps } from '../../lib/workbenchAmbient';

gsap.registerPlugin(useGSAP);

type DropdownPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface GsapDropdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id'> {
  id?: string;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerRef?: { current: HTMLElement | null };
  placement?: DropdownPlacement;
  portal?: boolean;
  portalOffset?: number;
  portalZIndex?: number;
}

function resolveTransformOrigin(placement: DropdownPlacement) {
  if (placement === 'top-left') return '0% 100%';
  if (placement === 'top-right') return '100% 100%';
  if (placement === 'bottom-left') return '0% 0%';
  return '100% 0%';
}

function resolveOffset(placement: DropdownPlacement, open: boolean) {
  const distance = open ? 6 : 4;
  return placement.startsWith('top') ? distance : -distance;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function resolvePortalStyle({
  trigger,
  panel,
  placement,
  portalOffset,
  portalZIndex,
}: {
  trigger: HTMLElement;
  panel: HTMLElement;
  placement: DropdownPlacement;
  portalOffset: number;
  portalZIndex: number;
}): React.CSSProperties {
  const triggerRect = trigger.getBoundingClientRect();
  panel.style.setProperty('--dropdown-trigger-width', `${triggerRect.width}px`);
  const viewportPadding = 8;
  // GSAP transforms affect client rects while a menu opens. Position from its layout size.
  const panelWidth = panel.offsetWidth || triggerRect.width;
  const panelHeight = panel.offsetHeight || 1;
  const desiredLeft = placement.endsWith('right')
    ? triggerRect.right - panelWidth
    : triggerRect.left;
  const spaceBelow = window.innerHeight - triggerRect.bottom - portalOffset - viewportPadding;
  const spaceAbove = triggerRect.top - portalOffset - viewportPadding;
  const preferAbove = placement.startsWith('top');
  const placeAbove = preferAbove
    ? spaceAbove >= panelHeight || spaceAbove > spaceBelow
    : spaceBelow < panelHeight && spaceAbove > spaceBelow;
  const desiredTop = placeAbove
    ? triggerRect.top - panelHeight - portalOffset
    : triggerRect.bottom + portalOffset;

  return {
    position: 'fixed',
    margin: 0,
    maxWidth: 'calc(100vw - 16px)',
    left: `${clamp(desiredLeft, viewportPadding, window.innerWidth - panelWidth - viewportPadding)}px`,
    top: `${clamp(desiredTop, viewportPadding, window.innerHeight - panelHeight - viewportPadding)}px`,
    right: 'auto',
    bottom: 'auto',
    zIndex: portalZIndex,
  };
}

export const GsapDropdown = React.forwardRef<HTMLDivElement, GsapDropdownProps>(
  (
    {
      id,
      open,
      onOpenChange,
      triggerRef,
      placement = 'bottom-right',
      portal = false,
      portalOffset = 8,
      portalZIndex = 120,
      className,
      children,
      role = 'menu',
      style,
      ...props
    },
    forwardedRef,
  ) => {
    const generatedId = useId();
    const dropdownId = id ?? generatedId;
    const panelRef = useRef<HTMLDivElement | null>(null);
    const keyboardInput = useRef(Boolean(triggerRef?.current?.matches(':focus-visible')));
    const [isMounted, setIsMounted] = useState(open);
    const [portalStyle, setPortalStyle] = useState<React.CSSProperties | null>(null);

    const setRefs = (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    useEffect(() => {
      if (open) setIsMounted(true);
    }, [open]);

    useEffect(() => {
      const pointer = () => {
        keyboardInput.current = false;
      };
      const keyboard = () => {
        keyboardInput.current = true;
      };
      document.addEventListener('pointerdown', pointer, true);
      document.addEventListener('keydown', keyboard, true);
      return () => {
        document.removeEventListener('pointerdown', pointer, true);
        document.removeEventListener('keydown', keyboard, true);
      };
    }, []);

    const updatePortalPosition = useCallback(() => {
      if (!portal || !triggerRef?.current || !panelRef.current || typeof window === 'undefined') {
        return;
      }

      const nextStyle = resolvePortalStyle({
        trigger: triggerRef.current,
        panel: panelRef.current,
        placement,
        portalOffset,
        portalZIndex,
      });
      setPortalStyle((current) =>
        current &&
        Object.entries(nextStyle).every(
          ([key, value]) => current[key as keyof React.CSSProperties] === value,
        )
          ? current
          : nextStyle,
      );
    }, [placement, portal, portalOffset, portalZIndex, triggerRef]);

    useLayoutEffect(() => {
      if (!portal || !isMounted) {
        setPortalStyle(null);
        return;
      }

      updatePortalPosition();
      const observer = new ResizeObserver(updatePortalPosition);
      if (panelRef.current) observer.observe(panelRef.current);
      if (triggerRef?.current) observer.observe(triggerRef.current);
      window.addEventListener('resize', updatePortalPosition);
      window.addEventListener('scroll', updatePortalPosition, true);
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', updatePortalPosition);
        window.removeEventListener('scroll', updatePortalPosition, true);
      };
    }, [isMounted, portal, updatePortalPosition]);

    const closeFromDocument = useEffectEvent((restoreFocus: boolean) => {
      onOpenChange?.(false);
      if (restoreFocus) triggerRef?.current?.focus();
    });

    useEffect(() => {
      if (!open) return;

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (panelRef.current?.contains(target)) return;
        if (triggerRef?.current?.contains(target)) return;
        closeFromDocument(false);
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          closeFromDocument(true);
          return;
        }
        if (role !== 'menu' && role !== 'listbox') return;
        const target = event.target as Node | null;
        const panel = panelRef.current;
        if (
          !target ||
          !panel ||
          (!panel.contains(target) && !triggerRef?.current?.contains(target))
        )
          return;
        if (event.key === 'Tab') {
          closeFromDocument(true);
          return;
        }
        const items = Array.from(
          panel.querySelectorAll<HTMLElement>('[role="option"], [role^="menuitem"]'),
        ).filter((item) => !item.matches(':disabled, [aria-disabled="true"]'));
        if (!items.length) return;
        const index = items.indexOf(document.activeElement as HTMLElement);
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? items.length - 1
              : event.key === 'ArrowDown'
                ? (index + 1) % items.length
                : event.key === 'ArrowUp'
                  ? index < 0
                    ? items.length - 1
                    : (index - 1 + items.length) % items.length
                  : null;
        if (next === null) return;
        event.preventDefault();
        event.stopPropagation();
        items[next]?.focus();
      };

      document.addEventListener('pointerdown', handlePointerDown, true);
      document.addEventListener('keydown', handleKeyDown, true);
      return () => {
        document.removeEventListener('pointerdown', handlePointerDown, true);
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    }, [open, role, triggerRef]);

    useGSAP(
      () => {
        const panel = panelRef.current;
        if (!panel || !isMounted) return;

        const reduceMotion = prefersReducedMotion() || keyboardInput.current;
        const tokens = getComputedStyle(panel);
        const duration = (name: string, fallback: number) =>
          (Number.parseFloat(tokens.getPropertyValue(name)) || fallback) / 1000;
        gsap.killTweensOf(panel);

        if (open) {
          if (!panel.style.opacity)
            gsap.set(panel, {
              autoAlpha: 0,
              scale: reduceMotion ? 1 : 0.985,
              y: reduceMotion ? 0 : resolveOffset(placement, true),
              transformOrigin: resolveTransformOrigin(placement),
              willChange: 'transform, opacity',
            });
          gsap.to(panel, {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: reduceMotion ? 0 : duration('--dropdown-open-dur', 180),
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'visibility',
            onComplete: () => gsap.set(panel, { willChange: 'auto' }),
          });

          return;
        }

        gsap.to(panel, {
          autoAlpha: 0,
          scale: reduceMotion ? 1 : 0.99,
          y: reduceMotion ? 0 : resolveOffset(placement, false),
          duration: reduceMotion ? 0 : duration('--dropdown-close-dur', 120),
          ease: 'power3.out',
          overwrite: 'auto',
          onComplete: () => setIsMounted(false),
        });
      },
      { dependencies: [isMounted, open, placement], scope: panelRef },
    );

    // Initialize animation styles before moving focus into the panel.
    useLayoutEffect(() => {
      const panel = panelRef.current;
      if (!panel || !isMounted) return;
      if (!open) {
        if (panel.contains(document.activeElement)) triggerRef?.current?.focus();
        return;
      }
      if (!keyboardInput.current || (role !== 'menu' && role !== 'listbox')) return;
      const item = panel.querySelector<HTMLElement>(
        '[role="option"][aria-selected="true"], [role^="menuitem"][aria-checked="true"]',
      );
      (item ?? panel.querySelector<HTMLElement>('[role="option"], [role^="menuitem"]'))?.focus();
    }, [isMounted, open, role, triggerRef]);

    if (!isMounted) return null;

    const ambient = workbenchAmbientPortalProps();

    const dropdown = (
      <div
        {...props}
        {...ambient}
        id={dropdownId}
        ref={setRefs}
        role={role}
        data-gsap-dropdown
        data-state={open ? 'open' : 'closed'}
        inert={!open}
        aria-hidden={!open || undefined}
        style={portal ? { ...style, ...portalStyle } : style}
        className={cn(
          ambient.className,
          'origin-top-right rounded-md border border-[color:var(--wb-border)] outline-none',
          className,
        )}
      >
        {children}
      </div>
    );

    if (portal && typeof document !== 'undefined') {
      return createPortal(dropdown, document.body);
    }

    return dropdown;
  },
);

GsapDropdown.displayName = 'GsapDropdown';
