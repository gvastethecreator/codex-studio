import { useRef } from 'react';
import type { MutableRefObject } from 'react';

export function useLazyRef<T>(createValue: () => T): MutableRefObject<T> {
  const ref = useRef<T | null>(null);
  if (ref.current === null) {
    ref.current = createValue();
  }
  return ref as MutableRefObject<T>;
}
