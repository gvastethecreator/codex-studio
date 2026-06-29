import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionDiv } from 'motion/react';
import {
  IconAlertTriangle as AlertTriangle,
  IconBrain as BrainCircuit,
  IconCircleCheck as CheckCircle2,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconClock as Clock,
  IconStack as Layers,
  IconLoader2 as Loader2,
  IconMaximize as Maximize2,
  IconRotate as RotateCcw,
  IconTrash as Trash2,
  IconCircleX as XCircle,
  IconBolt as Zap,
} from '@tabler/icons-react';

import { canRetryStudioJob } from '../lib/studioJobRetry';
import { getActiveRecipeIndicator } from '../lib/activeRecipeIndicator';
import {
  getPrimaryQueueJobServerJobId,
  getQueueJobServerJobIds,
} from '../lib/browserQueueBackendSync';
import { cn } from '../lib/utils';
import type { StudioQueueResultPreview } from '../lib/studioQueueResults';
import type { ShellActivityJob as StudioJob } from '../lib/shellActivityJob';
import type { QueueJob, RecipeId } from '../types';

interface QueuePanelProps {
  jobs: QueueJob[];
  results?: StudioQueueResultPreview[];
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
  onClearCompleted: () => void;
  isResting: boolean;
  serverJobs?: StudioJob[];
  selectedJobId?: string | null;
  onInspectJob: (jobId: string) => void;
  onRetryServerJob?: (jobId: string) => void;
  onCancelServerJob: (jobId: string) => void;
  onClose?: () => void;
}

const localStatusConfig: Record<
  QueueJob['status'],
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    bg: string;
    border: string;
    spin?: boolean;
  }
> = {
  pending: {
    icon: Clock,
    color: 'text-white/50',
    bg: 'bg-black/20',
    border: 'border-white/10',
  },
  processing: {
    icon: Loader2,
    color: 'text-accent-400',
    bg: 'bg-accent-500/10',
    border: 'border-accent-500/20',
    spin: true,
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  failed: {
    icon: AlertTriangle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  needs_review: {
    icon: AlertTriangle,
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
};

function getServerStatusColor(status: StudioJob['status']) {
  switch (status) {
    case 'completed':
      return 'text-emerald-400';
    case 'failed':
    case 'cancelled':
      return 'text-rose-400';
    case 'needs_review':
      return 'text-amber-300';
    default:
      return 'text-accent-400';
  }
}

function toEpochMs(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatClockTime(value: number | null) {
  if (value === null) return '—';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDurationMs(value: number | null) {
  if (value === null || value < 0) return '—';
  const totalSeconds = Math.floor(value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function resolveServerJobPreview(resultPreviewSrc?: string) {
  if (resultPreviewSrc) return resultPreviewSrc;
  return null;
}

const StatItem = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex flex-col items-center justify-center bg-black/20 px-1.5 py-1">
    <span className={cn('text-[11px] font-bold', color)}>{value}</span>
    <span className="text-[8px] font-bold uppercase tracking-tighter text-white/30">{label}</span>
  </div>
);

type RegisteredRecipeId = Exclude<RecipeId, null>;

function normalizeQueueRecipeId(value: string | null | undefined): RegisteredRecipeId | null {
  switch (value) {
    case 'styles':
    case 'remaster':
    case 'spritesheet':
    case 'cinematic':
    case 'character-lab':
    case 'character':
    case 'camera':
    case 'timeline':
      return value;
    default:
      return null;
  }
}

function formatQueueTaskLabel(value: string | null | undefined) {
  if (!value) return 'Task';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function resolveQueueRecipeTone(recipeId: string | null | undefined, fallbackTask?: string | null) {
  const normalizedRecipeId = normalizeQueueRecipeId(recipeId);
  const recipe = getActiveRecipeIndicator(normalizedRecipeId);
  if (recipe) {
    return {
      label: recipe.title,
      toneClassName: recipe.toneClassName,
      dotClassName: recipe.dotClassName,
    };
  }

  return {
    label: formatQueueTaskLabel(fallbackTask),
    toneClassName: 'border-white/10 bg-white/5 text-white/45',
    dotClassName: 'bg-white/35',
  };
}

export const QueuePanel: React.FC<QueuePanelProps> = React.memo(
  ({
    jobs,
    results = [],
    onRetry,
    onCancel,
    onRemove,
    onClearCompleted,
    isResting,
    serverJobs = [],
    selectedJobId,
    onInspectJob,
    onRetryServerJob,
    onCancelServerJob,
    onClose,
  }) => {
    const [isLocalQueueOpen, setIsLocalQueueOpen] = useState(true);
    const [isServerQueueOpen, setIsServerQueueOpen] = useState(true);
    const [activeResultId, setActiveResultId] = useState<string | null>(null);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const hasRecentResults = results.length > 0;
    const activeResultIndex = activeResultId
      ? results.findIndex((result) => result.id === activeResultId)
      : -1;
    const activeResult = activeResultIndex >= 0 ? results[activeResultIndex] : null;
    const resultsByJobId = useMemo(() => {
      const map = new Map<string, string>();
      for (const result of results) {
        if (!result.jobId) continue;
        if (!map.has(result.jobId)) {
          map.set(result.jobId, result.src);
        }
      }
      return map;
    }, [results]);
    const linkedServerJobIds = useMemo(
      () => new Set(jobs.flatMap((job) => getQueueJobServerJobIds(job))),
      [jobs],
    );

    const hasLiveDurations =
      jobs.some((job) => job.status === 'pending' || job.status === 'processing') ||
      serverJobs.some((job) => job.status === 'queued' || job.status === 'running');

    useEffect(() => {
      if (!hasLiveDurations) return;
      const id = window.setInterval(() => {
        setNowMs(Date.now());
      }, 1000);
      return () => window.clearInterval(id);
    }, [hasLiveDurations]);

    const pendingCount = jobs.filter((job) => job.status === 'pending').length;
    const processingCount = jobs.filter((job) => job.status === 'processing').length;
    const completedCount = jobs.filter((job) => job.status === 'completed').length;
    const failedCount = jobs.filter(
      (job) =>
        job.status === 'failed' || job.status === 'cancelled' || job.status === 'needs_review',
    ).length;
    const totalJobs =
      jobs.length + serverJobs.filter((job) => !linkedServerJobIds.has(job.id)).length;

    return (
      <div className="flex h-full w-full flex-col border border-white/10 bg-zinc-950 backdrop-blur-xl sm:w-[304px] sm:border-y-0 sm:border-r-0 sm:border-l sm:bg-black/45">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-2.5 py-2">
          <div className="flex items-center gap-1.5">
            <div className="rounded-md bg-accent-500/20 p-1.5 text-accent-400">
              <Layers size={16} />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white/90">Generation Queue</h3>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                {totalJobs} tracked jobs • 3 local concurrent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {(completedCount > 0 ||
              jobs.some((job) => job.status === 'cancelled' || job.status === 'needs_review')) && (
              <button
                type="button"
                onClick={onClearCompleted}
                className="studio-hit-target rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
                title="Clear completed"
              >
                <Trash2 size={16} />
              </button>
            )}
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="studio-hit-target rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
                title="Close queue"
              >
                <XCircle size={16} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-px border-b border-white/10 bg-white/10">
          <StatItem label="Wait" value={pendingCount} color="text-white/40" />
          <StatItem label="Active" value={processingCount} color="text-accent-400" />
          <StatItem label="Done" value={completedCount} color="text-emerald-400" />
          <StatItem label="Fail/X" value={failedCount} color="text-rose-400" />
        </div>

        <AnimatePresence>
          {isResting && (
            <MotionDiv
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-2 overflow-hidden border-b border-accent-500/20 bg-accent-500/10 px-4 py-2"
            >
              <Zap size={12} className="animate-pulse text-accent-400" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-accent-400">
                Cooling down (1s)
              </span>
            </MotionDiv>
          )}
        </AnimatePresence>

        <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-1">
          <div className="rounded-lg border border-white/10 bg-white/5 p-1.5">
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/35">
                Recent Results
              </span>
              <span className="text-[9px] font-bold text-emerald-400">{results.length}</span>
            </div>

            {hasRecentResults ? (
              <div className="custom-scrollbar h-24 overflow-y-auto pr-1">
                <div className="grid grid-cols-4 gap-1">
                  {results.map((result) => (
                    <button
                      type="button"
                      key={result.id}
                      onClick={() => setActiveResultId(result.id)}
                      className={cn(
                        'group relative rounded border p-0.5 transition-colors cursor-pointer',
                        selectedJobId && result.jobId === selectedJobId
                          ? 'border-accent-500/30 bg-accent-500/10'
                          : 'border-white/5 bg-black/20 hover:border-white/20',
                      )}
                      title={`${result.prompt || 'Generated result'} · ${new Date(
                        result.createdAt,
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`}
                    >
                      <div className="aspect-square overflow-hidden rounded border border-white/10 bg-black/40">
                        <img
                          src={result.src}
                          alt={result.prompt || 'Generated result'}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <span className="pointer-events-none absolute inset-0 grid place-items-center rounded bg-black/0 text-white opacity-0 transition-opacity group-hover:bg-black/35 group-hover:opacity-100">
                        <Maximize2 size={12} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-white/5 bg-black/20 p-3 text-[10px] text-zinc-600">
                Completed images for the active workspace will appear here.
              </div>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-1.5">
            <button
              type="button"
              onClick={() => setIsServerQueueOpen((value) => !value)}
              className="mb-2 flex w-full items-center justify-between rounded-lg p-1 text-left transition-colors hover:bg-white/5"
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-white/35">
                Backend Session Jobs
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-accent-400">{serverJobs.length}</span>
                <ChevronRight
                  size={14}
                  className={cn(
                    'text-zinc-500 transition-transform',
                    isServerQueueOpen && 'rotate-90',
                  )}
                />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isServerQueueOpen && (
                <MotionDiv
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1">
                    {serverJobs.length > 0 ? (
                      serverJobs
                        .slice(0, 20)
                        .map((job) => (
                          <ServerJobItem
                            key={job.id}
                            job={job}
                            previewSrc={resolveServerJobPreview(resultsByJobId.get(job.id))}
                            nowMs={nowMs}
                            isSelected={selectedJobId === job.id}
                            onInspect={() => onInspectJob(job.id)}
                            onRetry={onRetryServerJob ? () => onRetryServerJob(job.id) : undefined}
                            onCancel={() => onCancelServerJob(job.id)}
                          />
                        ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-white/5 bg-black/20 p-3 text-[10px] text-zinc-600">
                        No persistent backend jobs yet.
                      </div>
                    )}
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-1.5">
            <button
              type="button"
              onClick={() => setIsLocalQueueOpen((value) => !value)}
              className="mb-2 flex w-full items-center justify-between rounded-lg p-1 text-left transition-colors hover:bg-white/5"
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-white/35">
                Browser Queue
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-accent-400">{jobs.length}</span>
                <ChevronRight
                  size={14}
                  className={cn(
                    'text-zinc-500 transition-transform',
                    isLocalQueueOpen && 'rotate-90',
                  )}
                />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isLocalQueueOpen && (
                <MotionDiv
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1">
                    <AnimatePresence initial={false}>
                      {jobs.length === 0 && serverJobs.length === 0 && !hasRecentResults ? (
                        <MotionDiv
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex h-full flex-col items-center justify-center p-8 text-center opacity-20"
                        >
                          <Layers size={48} className="mb-4" />
                          <p className="text-sm font-medium">Queue is empty</p>
                          <p className="text-xs">Jobs will appear here</p>
                        </MotionDiv>
                      ) : jobs.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-white/5 bg-black/20 p-3 text-[10px] text-zinc-600">
                          No browser-side queued items.
                        </div>
                      ) : (
                        [...jobs].reverse().map((job) => {
                          const serverJobIds = getQueueJobServerJobIds(job);
                          const primaryServerJobId = getPrimaryQueueJobServerJobId(job);
                          const resultPreview =
                            serverJobIds
                              .map((serverJobId) => resultsByJobId.get(serverJobId))
                              .find((src): src is string => Boolean(src)) ??
                            job.config.attachments[0]?.dataUrl ??
                            null;

                          return (
                            <JobItem
                              key={job.id}
                              job={job}
                              nowMs={nowMs}
                              previewSrc={resultPreview}
                              isSelected={Boolean(
                                selectedJobId && serverJobIds.includes(selectedJobId),
                              )}
                              onInspect={
                                primaryServerJobId
                                  ? () => onInspectJob(primaryServerJobId)
                                  : undefined
                              }
                              onRetry={() => onRetry(job.id)}
                              onCancel={() => onCancel(job.id)}
                              onRemove={() => onRemove(job.id)}
                            />
                          );
                        })
                      )}
                    </AnimatePresence>
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>
        </div>
        {activeResult ? (
          <RecentResultsCarousel
            result={activeResult}
            index={activeResultIndex}
            total={results.length}
            onClose={() => setActiveResultId(null)}
            onPrevious={() =>
              setActiveResultId(
                results[(activeResultIndex - 1 + results.length) % results.length]?.id ?? null,
              )
            }
            onNext={() =>
              setActiveResultId(results[(activeResultIndex + 1) % results.length]?.id ?? null)
            }
            onInspect={
              activeResult.jobId ? () => onInspectJob(activeResult.jobId as string) : undefined
            }
          />
        ) : null}
      </div>
    );
  },
);

const RecentResultsCarousel: React.FC<{
  result: StudioQueueResultPreview;
  index: number;
  total: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onInspect?: () => void;
}> = ({ result, index, total, onClose, onPrevious, onNext, onInspect }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onPrevious();
      if (event.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-md">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white/90">
            {result.prompt || 'Generated result'}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
            {index + 1} / {total}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onInspect ? (
            <button
              type="button"
              onClick={onInspect}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Inspect
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close recent result carousel"
          >
            <XCircle size={18} />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4">
        <button
          type="button"
          onClick={onPrevious}
          className="absolute left-3 z-10 rounded-lg border border-white/10 bg-black/50 p-2 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Previous recent result"
        >
          <ChevronLeft size={20} />
        </button>
        <img
          src={result.fullSrc || result.src}
          alt={result.prompt || 'Generated result'}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          decoding="async"
        />
        <button
          type="button"
          onClick={onNext}
          className="absolute right-3 z-10 rounded-lg border border-white/10 bg-black/50 p-2 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Next recent result"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const ServerJobItem: React.FC<{
  job: StudioJob;
  previewSrc: string | null;
  nowMs: number;
  isSelected: boolean;
  onInspect: () => void;
  onRetry?: () => void;
  onCancel: () => void;
}> = ({ job, previewSrc, nowMs, isSelected, onInspect, onRetry, onCancel }) => {
  const canCancel = job.status === 'queued' || job.status === 'running';
  const canRetry = Boolean(onRetry) && canRetryStudioJob(job.status);
  const statusColor = getServerStatusColor(job.status);
  const recipeTone = resolveQueueRecipeTone(job.recipeId, job.kind);
  const createdAtMs = toEpochMs(job.createdAt);
  const completedAtMs = toEpochMs(job.completedAt ?? null);
  const durationMs = createdAtMs ? (completedAtMs ?? nowMs) - createdAtMs : null;

  const icon = canCancel ? (
    <Loader2 size={13} className="mt-0.5 shrink-0 animate-spin text-accent-400" />
  ) : job.status === 'completed' ? (
    <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-400" />
  ) : job.status === 'needs_review' ? (
    <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-300" />
  ) : job.status === 'failed' || job.status === 'cancelled' ? (
    <AlertTriangle size={13} className="mt-0.5 shrink-0 text-rose-400" />
  ) : (
    <Clock size={13} className="mt-0.5 shrink-0 text-white/30" />
  );

  return (
    <div
      className={cn(
        'relative flex items-start gap-1.5 overflow-hidden rounded-[6px] border px-1.5 py-1 transition-colors',
        isSelected
          ? 'border-accent-500/30 bg-accent-500/10'
          : 'border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/5',
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-0.5', recipeTone.dotClassName)} />
      <button
        type="button"
        onClick={onInspect}
        className="flex min-w-0 flex-1 items-start gap-1.5 text-left cursor-pointer"
      >
        <div className="mt-0.5 shrink-0">{icon}</div>

        <div className="mt-0.5 size-7 shrink-0 overflow-hidden rounded-[6px] border border-white/10 bg-black/40">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt="Job thumbnail"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[9px] text-zinc-600">
              -
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-[10px] font-semibold leading-tight text-white/90">
            {job.originalPrompt}
          </p>

          <div className="mt-0.5 flex items-center gap-1">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-[6px] border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider',
                recipeTone.toneClassName,
              )}
            >
              <span className={cn('size-1.5 rounded-full', recipeTone.dotClassName)} />
              {recipeTone.label}
            </span>
            <span
              className={cn(
                'rounded-[6px] border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider',
                statusColor,
                job.status === 'completed'
                  ? 'border-emerald-500/20 bg-emerald-500/10'
                  : job.status === 'needs_review'
                    ? 'border-amber-500/20 bg-amber-500/10'
                    : job.status === 'failed' || job.status === 'cancelled'
                      ? 'border-rose-500/20 bg-rose-500/10'
                      : 'border-accent-500/20 bg-accent-500/10',
              )}
            >
              {job.status}
            </span>

            <span className="rounded-[6px] border border-white/10 bg-black/30 px-1.5 py-0.5 text-[9px] text-white/35">
              {job.kind}
            </span>
          </div>

          <div className="mt-0.5 flex items-center gap-1 text-[9px] text-white/35">
            <span>{formatClockTime(createdAtMs)}</span>
            <span>•</span>
            <span>{formatDurationMs(durationMs)}</span>
            {job.execution?.model ? (
              <>
                <span>•</span>
                <span className="max-w-[120px] truncate text-zinc-500" title={job.execution.model}>
                  {job.execution.model}
                </span>
              </>
            ) : null}
          </div>

          {job.error && (
            <p className="mt-1 line-clamp-2 rounded-[6px] border border-rose-500/10 bg-rose-500/5 p-1 text-[9px] text-rose-300/80">
              {job.error}
            </p>
          )}
        </div>
      </button>

      <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
        <BrainCircuit size={13} className="text-zinc-500" />
        {canCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="studio-hit-target rounded-[6px] p-1 text-white/35 transition-colors hover:bg-white/10 hover:text-rose-400 cursor-pointer"
            title="Cancel backend job"
          >
            <XCircle size={13} />
          </button>
        ) : null}
        {canRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="studio-hit-target rounded-[6px] p-1 text-white/35 transition-colors hover:bg-white/10 hover:text-accent-400 cursor-pointer"
            title="Retry backend job"
          >
            <RotateCcw size={13} />
          </button>
        ) : null}
      </div>
    </div>
  );
};

const JobItem: React.FC<{
  job: QueueJob;
  previewSrc: string | null;
  nowMs: number;
  isSelected: boolean;
  onInspect?: () => void;
  onRetry: () => void;
  onCancel: () => void;
  onRemove: () => void;
}> = ({ job, previewSrc, nowMs, isSelected, onInspect, onRetry, onCancel, onRemove }) => {
  const config = localStatusConfig[job.status];
  const Icon = config.icon;
  const durationMs = (job.completedAt ?? nowMs) - job.createdAt;
  const serverJobIds = getQueueJobServerJobIds(job);
  const primaryServerJobId = getPrimaryQueueJobServerJobId(job);
  const recipeTone = resolveQueueRecipeTone(job.config.recipeId, job.config.recipeId);

  const content = (
    <>
      <div className={cn('mt-0.5', config.color)}>
        <Icon size={14} className={cn(config.spin && 'animate-spin')} />
      </div>

      <div className="mt-0.5 size-7 shrink-0 overflow-hidden rounded-[6px] border border-white/10 bg-black/40">
        {previewSrc ? (
          <img
            src={previewSrc}
            alt="Queue thumbnail"
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[9px] text-zinc-600">
            -
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-1 line-clamp-1 text-[10px] font-medium leading-tight text-white/85">
          {job.prompt}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-[6px] border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider',
              recipeTone.toneClassName,
            )}
          >
            <span className={cn('size-1.5 rounded-full', recipeTone.dotClassName)} />
            {recipeTone.label}
          </span>
          <span
            className={cn(
              'rounded-[6px] border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider',
              config.color,
              job.status === 'completed'
                ? 'border-emerald-500/20 bg-emerald-500/10'
                : job.status === 'failed' || job.status === 'cancelled'
                  ? 'border-rose-500/20 bg-rose-500/10'
                  : job.status === 'needs_review'
                    ? 'border-amber-500/20 bg-amber-500/10'
                    : job.status === 'processing'
                      ? 'border-accent-500/20 bg-accent-500/10'
                      : 'border-white/15 bg-white/5',
            )}
          >
            {job.status}
          </span>

          <span className="text-[9px] text-white/30">{formatClockTime(job.createdAt)}</span>
          <span className="text-[9px] text-white/20">•</span>
          <span className="text-[9px] text-white/30">{formatDurationMs(durationMs)}</span>

          {primaryServerJobId ? (
            <span className="rounded-[6px] border border-accent-500/20 bg-accent-500/10 px-1.5 py-0.5 text-[9px] text-accent-300">
              #{primaryServerJobId.slice(0, 8)}
              {serverJobIds.length > 1 ? ` +${serverJobIds.length - 1}` : ''}
            </span>
          ) : null}
        </div>

        {job.error && (
          <p
            className={cn(
              'mt-1 line-clamp-2 rounded-[6px] border p-1 text-[9px] leading-tight',
              job.status === 'needs_review'
                ? 'border-amber-500/10 bg-amber-500/5 text-amber-300/80'
                : 'border-rose-500/10 bg-rose-500/5 text-rose-400/80',
            )}
          >
            {job.error}
          </p>
        )}

        {primaryServerJobId ? (
          <div className="mt-1 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-zinc-500">
            <BrainCircuit size={11} className="text-accent-400" />
            Click to inspect backend transcript
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'group relative overflow-hidden rounded-[6px] border px-1.5 py-1 transition-[color,background-color,border-color,opacity,transform] duration-200',
        config.bg,
        isSelected ? 'border-accent-500/30 ring-1 ring-accent-500/20' : config.border,
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-0.5', recipeTone.dotClassName)} />
      <div className="flex items-start gap-1.5">
        {onInspect ? (
          <button
            type="button"
            onClick={onInspect}
            className="flex min-w-0 flex-1 items-start gap-1.5 text-left cursor-pointer"
          >
            {content}
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-start gap-1.5">{content}</div>
        )}

        <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {(job.status === 'processing' || job.status === 'pending') && (
            <button
              type="button"
              onClick={onCancel}
              className="studio-hit-target rounded-[6px] p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-rose-400 cursor-pointer"
              title="Cancel"
            >
              <XCircle size={14} />
            </button>
          )}

          {(job.status === 'failed' ||
            job.status === 'cancelled' ||
            job.status === 'needs_review') && (
            <button
              type="button"
              onClick={onRetry}
              className="studio-hit-target rounded-[6px] p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-accent-400 cursor-pointer"
              title="Retry"
            >
              <RotateCcw size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={onRemove}
            className="studio-hit-target rounded-[6px] p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-rose-400 cursor-pointer"
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </MotionDiv>
  );
};
