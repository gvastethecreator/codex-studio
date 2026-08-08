/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vite-plus/test';

import { useGenerationQueueController } from './useGenerationQueueController';

describe('useGenerationQueueController', () => {
  it('opens Queue once when generation starts', () => {
    const setIsQueueOpen = vi.fn();
    const { rerender } = renderHook(
      ({ isGenerating, isQueueOpen }) =>
        useGenerationQueueController({ isGenerating, isQueueOpen, setIsQueueOpen }),
      { initialProps: { isGenerating: false, isQueueOpen: false } },
    );

    rerender({ isGenerating: true, isQueueOpen: false });
    expect(setIsQueueOpen).toHaveBeenCalledOnce();
    expect(setIsQueueOpen).toHaveBeenCalledWith(true);

    rerender({ isGenerating: true, isQueueOpen: true });
    expect(setIsQueueOpen).toHaveBeenCalledOnce();
  });
});
