import React, { useEffect, useId, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';

import gsap from '../../lib/motionRuntime';
import { cn } from '../../lib/utils';

gsap.registerPlugin(useGSAP);

type DropdownPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface GsapDropdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id'> {
  id?: string;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerRef?: { current: HTMLElement | null };
  placement?: DropdownPlacement;
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

export const GsapDropdown = React.forwardRef<HTMLDivElement, GsapDropdownProps>(
  (
    {
      id,
      open,
      onOpenChange,
      triggerRef,
      placement = 'bottom-right',
      className,
      children,
      role = 'menu',
      ...props
    },
    forwardedRef,
  ) => {
    const generatedId = useId();
    const dropdownId = id ?? generatedId;
    const panelRef = useRef<HTMLDivElement | null>(null);
    const [isMounted, setIsMounted] = useState(open);

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
      if (!open) return;

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (panelRef.current?.contains(target)) return;
        if (triggerRef?.current?.contains(target)) return;
        onOpenChange?.(false);
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        onOpenChange?.(false);
        triggerRef?.current?.focus();
      };

      document.addEventListener('pointerdown', handlePointerDown, true);
      document.addEventListener('keydown', handleKeyDown, true);
      return () => {
        document.removeEventListener('pointerdown', handlePointerDown, true);
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    }, [onOpenChange, open, triggerRef]);

    useGSAP(
      () => {
        const panel = panelRef.current;
        if (!panel || !isMounted) return;

        const reduceMotion = prefersReducedMotion();
        const items = Array.from(panel.querySelectorAll('[data-dropdown-item]'));
        gsap.killTweensOf([panel, ...items]);

        if (open) {
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
            duration: reduceMotion ? 0 : 0.18,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'visibility',
            onComplete: () => gsap.set(panel, { willChange: 'auto' }),
          });

          if (!reduceMotion && items.length > 0) {
            gsap.fromTo(
              items,
              { autoAlpha: 0, y: 3 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.16,
                ease: 'power2.out',
                stagger: 0.025,
                overwrite: 'auto',
                clearProps: 'visibility',
              },
            );
          }
          return;
        }

        gsap.to(panel, {
          autoAlpha: 0,
          scale: reduceMotion ? 1 : 0.99,
          y: reduceMotion ? 0 : resolveOffset(placement, false),
          duration: reduceMotion ? 0 : 0.12,
          ease: 'power2.in',
          overwrite: 'auto',
          onComplete: () => setIsMounted(false),
        });
      },
      { dependencies: [isMounted, open, placement], scope: panelRef, revertOnUpdate: true },
    );

    if (!isMounted) return null;

    return (
      <div
        {...props}
        id={dropdownId}
        ref={setRefs}
        role={role}
        data-gsap-dropdown
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'origin-top-right rounded-xl border border-white/10 bg-zinc-950/96 shadow-[0_20px_60px_rgba(0,0,0,0.46)] backdrop-blur-xl outline-none',
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

GsapDropdown.displayName = 'GsapDropdown';
