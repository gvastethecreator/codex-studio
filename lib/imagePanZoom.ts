import { useCallback, useEffect, useRef, useState } from 'react';

const LERP_FACTOR = 0.32;
export const IMAGE_PAN_ZOOM_MIN_SCALE = 0.2;
export const IMAGE_PAN_ZOOM_MAX_SCALE = 15;
export const IMAGE_PAN_ZOOM_FIT_SCALE = 1;

function lerp(start: number, end: number, factor: number) {
  return start + (end - start) * factor;
}

export function clampImagePanZoomScale(scale: number) {
  return Math.min(Math.max(scale, IMAGE_PAN_ZOOM_MIN_SCALE), IMAGE_PAN_ZOOM_MAX_SCALE);
}

export function nextImageWheelScale(scale: number, deltaY: number) {
  return clampImagePanZoomScale(scale + (deltaY < 0 ? 1 : -1) * 0.25 * scale);
}

export function useImagePanZoom(enabled: boolean) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLImageElement>(null);
  const target = useRef({ x: 0, y: 0, scale: IMAGE_PAN_ZOOM_FIT_SCALE });
  const current = useRef({ x: 0, y: 0, scale: IMAGE_PAN_ZOOM_FIT_SCALE });
  const dragStart = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const rafId = useRef<number | null>(null);
  const [scale, setScale] = useState(IMAGE_PAN_ZOOM_FIT_SCALE);

  const animate = useCallback(() => {
    if (!enabled) return;
    current.current.scale = lerp(current.current.scale, target.current.scale, LERP_FACTOR);
    current.current.x = lerp(current.current.x, target.current.x, LERP_FACTOR);
    current.current.y = lerp(current.current.y, target.current.y, LERP_FACTOR);

    if (contentRef.current) {
      contentRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) scale(${current.current.scale})`;
    }

    const isStillMoving =
      Math.abs(target.current.scale - current.current.scale) > 0.0005 ||
      Math.abs(target.current.x - current.current.x) > 0.05 ||
      Math.abs(target.current.y - current.current.y) > 0.05;

    if (isStillMoving) {
      rafId.current = requestAnimationFrame(animate);
    } else {
      rafId.current = null;
    }

    setScale(current.current.scale);
  }, [enabled]);

  const startAnimation = useCallback(() => {
    if (!rafId.current && enabled) rafId.current = requestAnimationFrame(animate);
  }, [animate, enabled]);

  const setZoom = useCallback(
    (nextScale: number) => {
      const clampedScale = clampImagePanZoomScale(nextScale);
      target.current.scale = clampedScale;
      if (clampedScale <= IMAGE_PAN_ZOOM_FIT_SCALE) {
        target.current.x = 0;
        target.current.y = 0;
      }
      startAnimation();
    },
    [startAnimation],
  );

  const reset = useCallback(() => {
    target.current = { x: 0, y: 0, scale: IMAGE_PAN_ZOOM_FIT_SCALE };
    startAnimation();
  }, [startAnimation]);

  const zoomIn = useCallback(() => setZoom(target.current.scale * 1.25), [setZoom]);
  const zoomOut = useCallback(() => setZoom(target.current.scale / 1.25), [setZoom]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!enabled || event.button !== 0 || target.current.scale <= IMAGE_PAN_ZOOM_FIT_SCALE) {
        return;
      }
      isDragging.current = true;
      dragStart.current = {
        x: event.clientX - target.current.x,
        y: event.clientY - target.current.y,
      };
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    },
    [enabled],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!enabled || !isDragging.current) return;
      target.current.x = event.clientX - dragStart.current.x;
      target.current.y = event.clientY - dragStart.current.y;
      startAnimation();
    },
    [enabled, startAnimation],
  );

  const finishPointerDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  useEffect(() => {
    reset();
  }, [enabled, reset]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!enabled || !viewport) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom(nextImageWheelScale(target.current.scale, event.deltaY));
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [enabled, setZoom]);

  return {
    viewportRef,
    contentRef,
    scale,
    zoomIn,
    zoomOut,
    reset,
    fit: reset,
    viewportProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: finishPointerDrag,
      onPointerCancel: finishPointerDrag,
      onLostPointerCapture: finishPointerDrag,
    },
  };
}
