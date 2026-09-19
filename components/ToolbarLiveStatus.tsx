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
  id,
  variant = 'dock',
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
  id?: string;
  variant?: 'dock' | 'rail';
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
    if (variant === 'rail') return;
    const target = textareaRef.current;
    if (!target) return;
    const scrollPosition = target.scrollTop;
    target.style.height = '28px';
    target.style.height = `${Math.min(Math.max(target.scrollHeight, 28), 320)}px`;
    target.scrollTop = scrollPosition;
  }, [displayedPrompt, textareaRef, variant]);

  return (
    <textarea
      ref={textareaRef}
      id={id}
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
      placeholder={
        variant === 'rail'
          ? 'Describe the image you want to create…'
          : 'Describe what you want to create...'
      }
      rows={variant === 'rail' ? 6 : 1}
      className={
        variant === 'rail'
          ? `create-prompt-input ${isScrambling ? 'is-scrambling' : ''} ${isHidden ? 'hidden' : ''}`
          : `custom-scrollbar max-h-[320px] min-w-0 flex-1 self-end overflow-y-auto resize-none border-none bg-transparent px-1.5 py-1 text-[13px] font-medium leading-normal tracking-tight text-[color:var(--wb-ink)] outline-none placeholder:text-[color:var(--wb-muted)] sm:min-w-[100px] ${isScrambling ? 'font-mono text-accent-400 opacity-80' : ''} ${isHidden ? 'hidden' : ''}`
      }
      style={variant === 'rail' ? undefined : { minHeight: '28px' }}
    />
  );
}

export function GenerationElapsedStatus({
  startTime,
  variant = 'dock',
}: {
  startTime: number | null;
  variant?: 'dock' | 'rail';
}) {
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

  if (variant === 'rail') {
    return (
      <div className="create-generate-status" data-generation-elapsed-status>
        <span className="create-generate-spinner" aria-hidden="true" />
        <span>Generating</span>
        <span className="create-generate-elapsed">{elapsedTime}s</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative z-10 flex items-center gap-2" data-generation-elapsed-status>
        <Send size={14} className="text-accent-200" />
        <span className="text-white">QUEUE</span>
        <span className="hidden w-12 text-right text-[length:var(--wbp-label)] tabular-nums text-accent-300/80 sm:inline">
          {elapsedTime}s
        </span>
      </div>
    </>
  );
}
