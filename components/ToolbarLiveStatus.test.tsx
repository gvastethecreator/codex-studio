/** @vitest-environment jsdom */
import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { GenerationElapsedStatus, LivePromptTextarea } from './ToolbarLiveStatus';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('ToolbarLiveStatus', () => {
  it('updates elapsed generation time without rerendering its parent', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-09T00:00:00Z'));
    let parentRenders = 0;

    function Harness() {
      parentRenders += 1;
      return <GenerationElapsedStatus startTime={Date.now()} />;
    }

    render(<Harness />);
    expect(parentRenders).toBe(1);

    await act(async () => vi.advanceTimersByTimeAsync(300));

    expect(screen.getByText('0.3s')).toBeTruthy();
    expect(parentRenders).toBe(1);
  });

  it('updates scramble feedback without rerendering its parent', async () => {
    vi.useFakeTimers();
    let parentRenders = 0;
    const textareaRef = React.createRef<HTMLTextAreaElement>();

    function Harness() {
      parentRenders += 1;
      return (
        <LivePromptTextarea
          textareaRef={textareaRef}
          prompt="alpha beta"
          isScrambling
          isHidden={false}
          onFocus={() => {}}
          onBlur={() => {}}
          onChange={() => {}}
          onKeyDown={() => {}}
          onPaste={() => {}}
          onDrop={() => {}}
          onDragOver={() => {}}
        />
      );
    }

    render(<Harness />);
    await act(async () => vi.advanceTimersByTimeAsync(90));

    expect(screen.getByRole('textbox', { name: 'Prompt input' })).toHaveProperty(
      'value',
      expect.stringMatching(/^\S{5} \S{4}$/),
    );
    expect(parentRenders).toBe(1);
  });
});
