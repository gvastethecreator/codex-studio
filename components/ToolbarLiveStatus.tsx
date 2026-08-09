import { IconSend as Send } from '@tabler/icons-react';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';

const SCRAMBLE_CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

function buildScrambleText(prompt: string) {
  const targetLength = prompt.length > 0 ? prompt.length : 50;
  let scrambled = '';
  for (let index = 0; index < targetLength; index += 1) {
    scrambled +=
      prompt[index] === ' '
        ? ' '
        : SCRAMBLE_CHARACTERS[Math.floor(Math.random() * SCRAMBLE_CHARACTERS.length)];
  }
  return scrambled;
}

export function LivePromptTextarea({
  textareaRef,
  prompt,
  isScrambling,
  isHidden,
  onFocus,
  onBlur,
  onChange,
  onKeyDown,
  onPaste,
  onDrop,
  onDragOver,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  prompt: string;
  isScrambling: boolean;
  isHidden: boolean;
  onFocus: React.FocusEventHandler<HTMLTextAreaElement>;
  onBlur: React.FocusEventHandler<HTMLTextAreaElement>;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>;
  onPaste: React.ClipboardEventHandler<HTMLTextAreaElement>;
  onDrop: React.DragEventHandler<HTMLTextAreaElement>;
  onDragOver: React.DragEventHandler<HTMLTextAreaElement>;
}) {
  const [scrambleTick, setScrambleTick] = useState(0);

  useEffect(() => {
    if (!isScrambling) return;
    const interval = window.setInterval(() => setScrambleTick((tick) => tick + 1), 30);
    return () => window.clearInterval(interval);
  }, [isScrambling]);

  const displayedPrompt = useMemo(() => {
    if (!isScrambling) return prompt;
    void scrambleTick;
    return buildScrambleText(prompt);
  }, [isScrambling, prompt, scrambleTick]);

  useLayoutEffect(() => {
    const target = textareaRef.current;
    if (!target) return;
    const scrollPosition = target.scrollTop;
    target.style.height = '28px';
    target.style.height = `${Math.min(Math.max(target.scrollHeight, 28), 320)}px`;
    target.scrollTop = scrollPosition;
  }, [displayedPrompt, textareaRef]);

  return (
    <textarea
      ref={textareaRef}
      value={displayedPrompt}
      readOnly={isScrambling}
      onFocus={onFocus}
      aria-label="Prompt input"
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onDrop={onDrop}
      onDragOver={onDragOver}
      placeholder="Describe what you want to create..."
      rows={1}
      className={`custom-scrollbar max-h-[320px] min-w-0 flex-1 self-end overflow-y-auto resize-none border-none bg-transparent px-1.5 py-1 text-[13px] font-medium leading-normal tracking-tight text-zinc-200 outline-none placeholder-zinc-700 sm:min-w-[100px] ${isScrambling ? 'font-mono text-accent-400 opacity-80' : ''} ${isHidden ? 'hidden' : ''}`}
      style={{ minHeight: '28px' }}
    />
  );
}

export function GenerationElapsedStatus({ startTime }: { startTime: number | null }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const interval = window.setInterval(() => setTick((value) => value + 1), 100);
    return () => window.clearInterval(interval);
  }, [startTime]);

  const elapsedTime = useMemo(() => {
    if (!startTime) return '0.0';
    void tick;
    return ((Date.now() - startTime) / 1000).toFixed(1);
  }, [startTime, tick]);

  return (
    <>
      <div
        className="absolute bottom-0 left-0 top-0 z-0 w-full origin-left bg-accent-500/20 transition-transform duration-100 ease-linear"
        style={{
          transform: `scaleX(${Math.min(Number.parseFloat(elapsedTime) / 120, 1)})`,
        }}
      />
      <div className="absolute inset-0 z-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10 flex items-center gap-2" data-generation-elapsed-status>
        <Send size={14} className="text-accent-200" />
        <span className="text-white">QUEUE</span>
        <span className="hidden w-12 text-right text-[8px] tabular-nums text-accent-300/80 sm:inline">
          {elapsedTime}s
        </span>
      </div>
    </>
  );
}
