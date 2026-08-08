/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vite-plus/test';

import { useLazyRef } from './useLazyRef';

describe('useLazyRef', () => {
  it('creates one mutable value and preserves its identity across renders', () => {
    const createValue = vi.fn(() => new Set<string>());
    const { result, rerender } = renderHook(() => useLazyRef(createValue));
    const initialRef = result.current;

    initialRef.current.add('job-1');
    rerender();

    expect(createValue).toHaveBeenCalledOnce();
    expect(result.current).toBe(initialRef);
    expect(result.current.current).toEqual(new Set(['job-1']));
  });
});
