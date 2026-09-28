import { useEffect, useState } from 'react';
import {
  getDefaultStylePackState,
  type DefaultStylePackState,
} from '../services/studio-api/extensions';

/**
 * Follows the background install of the default style pack (Essentials) while Studio has no
 * style pack. Polls until the install finishes.
 */
export function useDefaultStylePack(enabled: boolean) {
  const [state, setState] = useState<DefaultStylePackState | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = () =>
      getDefaultStylePackState()
        .then((next) => {
          if (cancelled) return;
          setState(next);
          if (next.state === 'installing' || next.state === 'idle') timer = setTimeout(poll, 2000);
        })
        .catch(() => undefined);
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled]);
  return state;
}
