import { useCallback, useRef, type PointerEventHandler, type RefObject } from 'react';

interface DragState {
  pointerId: number;
  startX: number;
  startScrollLeft: number;
  dragged: boolean;
}

export function useHorizontalDragScroll<T extends HTMLElement>(ref: RefObject<T | null>) {
  const stateRef = useRef<DragState | null>(null);

  const finish = useCallback(
    (event: React.PointerEvent<T>) => {
      const element = ref.current;
      const state = stateRef.current;
      if (!element || !state || state.pointerId !== event.pointerId) return;
      stateRef.current = null;
      delete element.dataset.dragging;
      if (element.hasPointerCapture(event.pointerId))
        element.releasePointerCapture(event.pointerId);
    },
    [ref],
  );

  const onPointerDown = useCallback<PointerEventHandler<T>>(
    (event) => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      const element = ref.current;
      if (!element || element.scrollWidth <= element.clientWidth) return;
      stateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startScrollLeft: element.scrollLeft,
        dragged: false,
      };
    },
    [ref],
  );

  const onPointerMove = useCallback<PointerEventHandler<T>>(
    (event) => {
      const element = ref.current;
      const state = stateRef.current;
      if (!element || !state || state.pointerId !== event.pointerId) return;
      const delta = event.clientX - state.startX;
      if (!state.dragged && Math.abs(delta) < 4) return;
      if (!state.dragged) {
        state.dragged = true;
        element.dataset.dragging = 'true';
        element.setPointerCapture(event.pointerId);
      }
      element.scrollLeft = state.startScrollLeft - delta;
      event.preventDefault();
    },
    [ref],
  );

  return {
    onDragStart: (event: React.DragEvent<T>) => event.preventDefault(),
    onPointerCancel: finish,
    onPointerDown,
    onPointerMove,
    onPointerUp: finish,
  };
}
