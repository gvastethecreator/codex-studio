import { useState } from 'react';
import type { MutableRefObject } from 'react';

export function useLazyRef<T>(createValue: () => T): MutableRefObject<T> {
  const [ref] = useState<MutableRefObject<T>>(() => ({ current: createValue() }));
  return ref;
}
