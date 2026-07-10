import { describe, expect, it } from 'vite-plus/test';

import {
  isAnimationSequenceFramePromptCurrent,
  resolveAnimationSequenceFrameSelection,
} from './animationSequenceFrameSelection';

describe('resolveAnimationSequenceFrameSelection', () => {
  const frameIds = ['frame-0001', 'frame-0002', 'frame-0003'];

  it('keeps a selected draft frame when it remains available', () => {
    expect(resolveAnimationSequenceFrameSelection('frame-0002', frameIds)).toBe('frame-0002');
  });

  it('falls back to the first frame when selection is missing or stale', () => {
    expect(resolveAnimationSequenceFrameSelection(null, frameIds)).toBe('frame-0001');
    expect(resolveAnimationSequenceFrameSelection('frame-9999', frameIds)).toBe('frame-0001');
  });

  it('clears selection when the frame plan is empty', () => {
    expect(resolveAnimationSequenceFrameSelection('frame-0001', [])).toBeNull();
  });

  it('rejects a loaded prompt from a stale run or frame selection', () => {
    const loadedPrompt = {
      runId: 'run-a',
      frameId: 'frame-0001',
      prompt: 'Prompt A',
    };

    expect(
      isAnimationSequenceFramePromptCurrent({
        loadedPrompt,
        runId: 'run-a',
        frameId: 'frame-0001',
      }),
    ).toBe(true);
    expect(
      isAnimationSequenceFramePromptCurrent({
        loadedPrompt,
        runId: 'run-a',
        frameId: 'frame-0002',
      }),
    ).toBe(false);
    expect(
      isAnimationSequenceFramePromptCurrent({
        loadedPrompt,
        runId: 'run-b',
        frameId: 'frame-0001',
      }),
    ).toBe(false);
  });
});
