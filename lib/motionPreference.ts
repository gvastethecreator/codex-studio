export type MotionPreference = 'system' | 'reduced';
export const MOTION_CHANGE_EVENT = 'studio-motion-change';
export function prefersReducedMotion() {
  return (
    typeof document !== 'undefined' &&
    (document.documentElement.dataset.motion === 'reduced' ||
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches))
  );
}
