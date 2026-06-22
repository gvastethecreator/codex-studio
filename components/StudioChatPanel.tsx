import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Send,
  User,
  X,
} from 'lucide-react';

import { cn } from '../lib/utils';
import type { Job as StudioJob } from '../packages/shared/src';
import type { ImageGenerationConfig, LogEntry } from '../types';

type GenerateFromChat = (
  promptOverride?: string,
  configOverrides?: Partial<ImageGenerationConfig>,
  options?: { force?: boolean; preventModal?: boolean; useCurrentAttachments?: boolean },
) => void;

interface StudioChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: GenerateFromChat;
  isGenerating: boolean;
  providerId: string;
  studioJobs: StudioJob[];
  logs: LogEntry[];
}

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
};

const RUNNING_STATUSES = new Set<StudioJob['status']>(['queued', 'running']);

function formatTime(value: number) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getJobTime(job: StudioJob) {
  const updated = Date.parse(job.updatedAt);
  if (Number.isFinite(updated)) return updated;
  const created = Date.parse(job.createdAt);
  return Number.isFinite(created) ? created : 0;
}

function getStatusIcon(status: StudioJob['status']) {
  if (status === 'completed') return CheckCircle2;
  if (status === 'failed' || status === 'cancelled' || status === 'needs_review') {
    return AlertTriangle;
  }
  if (status === 'running') return Loader2;
  return Clock;
}

function getStatusClass(status: StudioJob['status']) {
  if (status === 'completed') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
  if (status === 'failed' || status === 'cancelled') {
    return 'border-rose-500/20 bg-rose-500/10 text-rose-300';
  }
  if (status === 'needs_review') return 'border-amber-500/20 bg-amber-500/10 text-amber-200';
  return 'border-accent-500/20 bg-accent-500/10 text-accent-300';
}

export const StudioChatPanel: React.FC<StudioChatPanelProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  providerId,
  studioJobs,
  logs,
}) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-ready',
      role: 'assistant',
      text: 'Ready for a generation prompt.',
      createdAt: Date.now(),
    },
  ]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const latestJobs = useMemo(
    () => studioJobs.toSorted((a, b) => getJobTime(b) - getJobTime(a)).slice(0, 6),
    [studioJobs],
  );
  const activeCount = latestJobs.filter((job) => RUNNING_STATUSES.has(job.status)).length;
  const latestLogs = useMemo(() => logs.slice(-5).reverse(), [logs]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  if (!isOpen) return null;

  const submit = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const now = Date.now();
    setMessages((current) => [
      ...current,
      { id: `user-${now}`, role: 'user', text: trimmed, createdAt: now },
      {
        id: `assistant-${now}`,
        role: 'assistant',
        text: `Queued on ${providerId}.`,
        createdAt: now,
      },
    ]);
    onGenerate(trimmed, undefined, { preventModal: true });
    setPrompt('');
  };

  return (
    <dialog
      className="fixed inset-0 z-50 m-0 h-full w-full max-h-none max-w-none bg-transparent p-0"
      aria-labelledby="studio-chat-panel-title"
      aria-modal="true"
      open
    >
      <button
        type="button"
        aria-label="Close Codex chat"
        className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <section className="absolute inset-x-3 bottom-3 top-3 mx-auto flex max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/96 shadow-[0_40px_160px_rgba(0,0,0,0.7)] sm:inset-x-6 sm:bottom-6 sm:top-6">
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-accent-500/20 bg-accent-500/10 text-accent-300">
                <MessageSquare size={18} />
              </div>
              <div className="min-w-0">
                <h2
                  id="studio-chat-panel-title"
                  className="truncate text-lg font-semibold text-white"
                >
                  Codex Chat
                </h2>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  {activeCount > 0
                    ? `${activeCount} live job${activeCount === 1 ? '' : 's'}`
                    : 'Idle'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2.5 text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
              aria-label="Close Codex chat"
            >
              <X size={18} />
            </button>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
            <main className="flex min-h-0 flex-col">
              <div
                ref={scrollRef}
                className="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-6"
              >
                {messages.map((message) => {
                  const Icon = message.role === 'user' ? User : Bot;
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start',
                      )}
                    >
                      {message.role === 'assistant' ? (
                        <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl border border-accent-500/20 bg-accent-500/10 text-accent-300">
                          <Icon size={15} />
                        </div>
                      ) : null}
                      <div
                        className={cn(
                          'max-w-[min(680px,88%)] rounded-2xl border px-4 py-3',
                          message.role === 'user'
                            ? 'border-white/10 bg-white/10 text-white'
                            : 'border-white/8 bg-black/30 text-zinc-300',
                        )}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                        <div className="mt-2 text-[9px] font-bold uppercase tracking-wider text-zinc-600">
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/8 p-4 sm:p-5">
                <div className="flex min-h-14 items-end gap-2 rounded-2xl border border-white/10 bg-black/30 p-2">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        submit();
                      }
                    }}
                    rows={2}
                    placeholder="Describe the image..."
                    aria-label="Codex chat prompt"
                    className="custom-scrollbar max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!prompt.trim()}
                    className="grid size-11 shrink-0 place-items-center rounded-2xl border border-accent-500/20 bg-accent-600 text-white transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-zinc-600"
                    aria-label="Send generation prompt"
                  >
                    {isGenerating ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Send size={17} />
                    )}
                  </button>
                </div>
              </div>
            </main>

            <aside className="hidden min-h-0 flex-col border-l border-white/8 bg-black/20 xl:flex">
              <div className="border-b border-white/8 px-4 py-3">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Live jobs
                </div>
              </div>
              <div className="custom-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                {latestJobs.length > 0 ? (
                  latestJobs.map((job) => {
                    const Icon = getStatusIcon(job.status);
                    return (
                      <div
                        key={job.id}
                        className="rounded-2xl border border-white/8 bg-white/[0.03] p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-wider',
                              getStatusClass(job.status),
                            )}
                          >
                            <Icon
                              size={12}
                              className={job.status === 'running' ? 'animate-spin' : undefined}
                            />
                            {job.status}
                          </span>
                          <span className="text-[9px] text-zinc-600">#{job.id.slice(0, 8)}</span>
                        </div>
                        <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-zinc-300">
                          {job.originalPrompt}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/8 bg-black/20 p-4 text-xs text-zinc-600">
                    No jobs yet.
                  </div>
                )}
              </div>
              <div className="border-t border-white/8 p-3">
                <div className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Recent logs
                </div>
                <div className="space-y-1.5">
                  {latestLogs.length > 0 ? (
                    latestLogs.map((log) => (
                      <div key={log.id} className="rounded-xl bg-white/[0.03] px-3 py-2">
                        <div className="line-clamp-2 text-[10px] leading-4 text-zinc-500">
                          {log.message}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-zinc-700">No logs yet.</div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </dialog>
  );
};
