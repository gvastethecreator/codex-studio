import React, { useEffect, useMemo, useState } from 'react';
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
  IconCircleX as XCircle,
} from '@tabler/icons-react';

import { getActiveRecipeIndicator } from '../lib/activeRecipeIndicator';
import { summarizePersistentJobs } from '../lib/persistentJobSummary';
import { canRetryStudioJob, canResumeStudioJob } from '../lib/studioJobRetry';
import type { StudioQueueResultPreview } from '../lib/studioQueueResults';
import type { ShellActivityJob as StudioJob } from '../lib/shellActivityJob';
import { cn } from '../lib/utils';
import { useLatestRef } from '../hooks/useLatestRef';
import { isRegisteredRecipeId } from '../lib/recipeIds';
import { useJobHistory } from '../hooks/useJobHistory';
import { useWorkerDiagnostics } from '../hooks/useWorkerDiagnostics';
import { QueueBatchCard } from './QueueBatchCard';
import type { TerminalJobStatus } from '../packages/shared/src';
import type { WorkerStatus } from '../packages/shared/src/workerContracts';

function formatWaitReason(wait: WorkerStatus['waiting'][number]) {
  switch (wait.reason) {
    case 'provider_capacity':
      return `Waiting for ${wait.providerId} capacity`;
    case 'global_capacity':
      return 'Waiting for a worker slot';
    case 'provider_turn':
      return `Waiting for ${wait.providerId}'s turn`;
    case 'stopping':
      return 'Worker stopping; job remains queued';
  }
}

interface QueuePanelProps {
  results?: StudioQueueResultPreview[];
  serverJobs?: StudioJob[];
  selectedJobId?: string | null;
  onInspectJob: (jobId: string) => void;
  onRetryServerJob?: (jobId: string) => void;
  onCancelServerJob: (jobId: string) => void;
  onClose?: () => void;
}

const EMPTY_RESULTS: StudioQueueResultPreview[] = [];
const EMPTY_SERVER_JOBS: StudioJob[] = [];

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
  return minutes <= 0 ? `${seconds}s` : `${minutes}m ${seconds}s`;
}

const StatItem = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex flex-col items-center justify-center bg-black/20 px-1.5 py-1">
    <span className={cn('text-[11px] font-bold', color)}>{value}</span>
    <span className="text-[8px] font-bold uppercase tracking-tighter text-white/30">{label}</span>
  </div>
);

function formatQueueTaskLabel(value: string | null | undefined) {
  if (!value) return 'Task';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function resolveQueueRecipeTone(recipeId: string | null | undefined, fallbackTask?: string | null) {
  const recipe = getActiveRecipeIndicator(isRegisteredRecipeId(recipeId) ? recipeId : null);
  if (recipe) {
    return {
      label: recipe.title,
      toneClassName: recipe.toneClassName,
      dotClassName: recipe.dotClassName,
    };
  }

  return {
    label: formatQueueTaskLabel(fallbackTask),
    toneClassName: 'border-white/2 bg-white/5 text-white/45',
    dotClassName: 'bg-white/35',
  };
}

export const QueuePanel: React.FC<QueuePanelProps> = React.memo(
  ({
    results = EMPTY_RESULTS,
    serverJobs = EMPTY_SERVER_JOBS,
    selectedJobId,
    onInspectJob,
    onRetryServerJob,
    onCancelServerJob,
    onClose,
  }) => {
    const [activeResultId, setActiveResultId] = useState<string | null>(null);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const [workspaceFilter, setWorkspaceFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<TerminalJobStatus | ''>('');
    const jobHistory = useJobHistory(serverJobs, workspaceFilter, statusFilter);
    const worker = useWorkerDiagnostics();
    const waitReasons = new Map(worker.status?.waiting.map((entry) => [entry.jobId, entry]) ?? []);
    const batches = useMemo(() => {
      const revisions = new Map<string, string>();
      for (const job of [...jobHistory.open, ...jobHistory.history]) {
        if (
          job.batchId &&
          (!revisions.has(job.batchId) || job.updatedAt > revisions.get(job.batchId)!)
        )
          revisions.set(job.batchId, job.updatedAt);
      }
      return [...revisions];
    }, [jobHistory.open, jobHistory.history]);
    const activeResultIndex = activeResultId
      ? results.findIndex((result) => result.id === activeResultId)
      : -1;
    const activeResult = activeResultIndex >= 0 ? results[activeResultIndex] : null;
    const resultsByJobId = useMemo(() => {
      const previews = new Map<string, string>();
      for (const result of results) {
        if (result.jobId && !previews.has(result.jobId)) previews.set(result.jobId, result.src);
      }
      return previews;
    }, [results]);
    const summary = useMemo(() => summarizePersistentJobs(jobHistory.open), [jobHistory.open]);
    const hasLiveDurations = summary.queued + summary.running > 0;

    useEffect(() => {
      if (!hasLiveDurations) return;
      const id = window.setInterval(() => setNowMs(Date.now()), 1000);
      return () => window.clearInterval(id);
    }, [hasLiveDurations]);

    return (
      <div className="flex h-full w-full flex-col border border-white/2 bg-zinc-950 backdrop-blur-xl sm:w-[304px] sm:border-y-0 sm:border-r-0 sm:border-l sm:bg-black/45">
        <div className="flex items-center justify-between border-b border-white/2 bg-white/5 px-2.5 py-2">
          <div className="flex items-center gap-1.5">
            <div className="rounded-md bg-accent-500/20 p-1.5 text-accent-400">
              <Layers size={16} />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white/90">Persistent Jobs</h3>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                {jobHistory.page
                  ? `${jobHistory.page.globalOpenCount} open across all workspaces${jobHistory.error ? ' (last confirmed)' : ''}`
                  : jobHistory.error
                    ? 'Jobs unavailable'
                    : 'Loading jobs'}
              </p>
            </div>
          </div>
          {onClose ? (
            <button
              type="button"
              aria-label="Close jobs"
              onClick={onClose}
              className="studio-hit-target rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
              title="Close jobs"
            >
              <XCircle size={16} />
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-4 gap-px border-b border-white/2 bg-white/10">
          <StatItem label="Open" value={summary.total} color="text-white/40" />
          <StatItem label="Running" value={summary.running} color="text-accent-400" />
          <StatItem label="Queued" value={summary.queued} color="text-white/40" />
          <StatItem label="Review" value={summary.attention} color="text-amber-400" />
        </div>

        <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-1">
          {batches.map(([batchId, revision]) => (
            <QueueBatchCard key={batchId} batchId={batchId} revision={revision} />
          ))}
          <section className="rounded-lg border border-white/2 bg-white/5 p-1.5">
            <div className="mb-2 px-1 text-[10px] text-white/60" aria-label="Worker capacity">
              {worker.status ? (
                <>
                  <p>
                    {worker.status.activeWorkerCount} / {worker.status.maxConcurrentJobs} worker
                    slots active{worker.status.stopping ? ' · Stopping' : ''}
                  </p>
                  <details>
                    <summary className="cursor-pointer">Provider limits</summary>
                    {Object.entries(worker.status.providerLimits).map(([provider, limit]) => (
                      <p key={provider}>
                        {provider}: {worker.status!.activeByProvider[provider] ?? 0} / {limit}
                      </p>
                    ))}
                  </details>
                </>
              ) : (
                <p>{worker.error ? 'Worker capacity unavailable' : 'Reading worker capacity'}</p>
              )}
            </div>
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/35">
                Recent Results
              </span>
              <span className="text-[9px] font-bold text-emerald-400">{results.length}</span>
            </div>
            {results.length > 0 ? (
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
                          ? 'border-accent-500/2 bg-accent-500/10'
                          : 'border-white/2 bg-black/20 hover:border-white/2',
                      )}
                      title={result.prompt || 'Generated result'}
                    >
                      <img
                        src={result.src}
                        alt={result.prompt || 'Generated result'}
                        width={64}
                        height={64}
                        className="aspect-square w-full rounded object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="absolute inset-0 grid place-items-center rounded text-white opacity-0 transition-opacity group-hover:bg-black/35 group-hover:opacity-100">
                        <Maximize2 size={12} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-white/2 bg-black/20 p-3 text-[10px] text-zinc-600">
                Completed images for the active workspace will appear here.
              </div>
            )}
          </section>

          <section className="rounded-lg border border-white/2 bg-white/5 p-1.5">
            <div className="mb-2 flex items-center justify-between px-1 py-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/35">
                Open jobs
              </span>
              <span className="text-[9px] font-bold text-accent-400">{jobHistory.open.length}</span>
            </div>
            <label className="mb-2 block text-[10px] text-white/60">
              Workspace
              <select
                aria-label="Job workspace"
                value={workspaceFilter}
                onChange={(event) => setWorkspaceFilter(event.target.value)}
                className="mt-1 w-full rounded bg-zinc-900 p-2 text-white"
              >
                <option value="">All workspaces</option>
                {jobHistory.workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-1">
              {jobHistory.open.length > 0 ? (
                jobHistory.open.map((job) => (
                  <ServerJobItem
                    key={job.id}
                    job={job}
                    waitReason={
                      job.status === 'queued' && waitReasons.has(job.id)
                        ? formatWaitReason(waitReasons.get(job.id)!)
                        : undefined
                    }
                    previewSrc={resultsByJobId.get(job.id) ?? null}
                    nowMs={nowMs}
                    isSelected={selectedJobId === job.id}
                    onInspect={() => onInspectJob(job.id)}
                    onRetry={onRetryServerJob ? () => onRetryServerJob(job.id) : undefined}
                    onCancel={() => onCancelServerJob(job.id)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center opacity-20">
                  <Layers size={42} className="mb-3" />
                  <p className="text-sm font-medium">
                    {jobHistory.loading ? 'Loading jobs' : 'No open jobs'}
                  </p>
                  <p className="text-xs">New generations will appear here</p>
                </div>
              )}
            </div>
          </section>
          <section className="space-y-2 rounded-lg border border-white/2 bg-white/5 p-2">
            <div className="flex items-center justify-between text-[10px] text-white/60">
              <span>History</span>
              <span>
                {jobHistory.page?.counts.history ?? '—'} matching jobs
                {jobHistory.error ? ' (last confirmed)' : ''}
              </span>
            </div>
            <select
              aria-label="Job history status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as TerminalJobStatus | '')}
              className="w-full rounded bg-zinc-900 p-2 text-[11px] text-white"
            >
              <option value="">All finished states</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {jobHistory.history.map((job) => (
              <ServerJobItem
                key={job.id}
                job={job}
                previewSrc={resultsByJobId.get(job.id) ?? null}
                nowMs={nowMs}
                isSelected={selectedJobId === job.id}
                onInspect={() => onInspectJob(job.id)}
                onRetry={onRetryServerJob ? () => onRetryServerJob(job.id) : undefined}
                onCancel={() => onCancelServerJob(job.id)}
              />
            ))}
            {!jobHistory.loading && !jobHistory.error && jobHistory.history.length === 0 ? (
              <p className="text-[11px] text-white/50">No matching history.</p>
            ) : null}
            {jobHistory.error ? (
              <div role="alert" className="space-y-1 text-[11px] text-rose-300">
                <p>{jobHistory.error}</p>
                <button type="button" onClick={jobHistory.retry} className="underline">
                  Retry history
                </button>
              </div>
            ) : null}
            {jobHistory.loading ? (
              <p role="status" className="text-[11px] text-white/50">
                Loading history…
              </p>
            ) : jobHistory.nextCursor ? (
              <button
                type="button"
                onClick={jobHistory.loadMore}
                className="w-full rounded bg-white/10 p-2 text-[11px] text-white"
              >
                Load older jobs
              </button>
            ) : jobHistory.history.length > 0 && !jobHistory.error ? (
              <p className="text-[10px] text-white/40">All matching history loaded.</p>
            ) : null}
          </section>
        </div>

        {activeResult ? (
          <RecentResultViewer
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

const RecentResultViewer: React.FC<{
  result: StudioQueueResultPreview;
  index: number;
  total: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onInspect?: () => void;
}> = ({ result, index, total, onClose, onPrevious, onNext, onInspect }) => {
  const navigation = useMemo(
    () => ({ onClose, onPrevious, onNext }),
    [onClose, onNext, onPrevious],
  );
  const navigationRef = useLatestRef(navigation);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') navigationRef.current.onClose();
      if (event.key === 'ArrowLeft') navigationRef.current.onPrevious();
      if (event.key === 'ArrowRight') navigationRef.current.onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigationRef]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-md">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/2 px-3">
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
              className="rounded-lg border border-white/2 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Inspect
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close recent result"
          >
            <XCircle size={18} />
          </button>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4">
        <button
          type="button"
          onClick={onPrevious}
          className="absolute left-3 z-10 rounded-lg border border-white/2 bg-black/50 p-2 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Previous recent result"
        >
          <ChevronLeft size={20} />
        </button>
        <img
          src={result.fullSrc || result.src}
          alt={result.prompt || 'Generated result'}
          width={1024}
          height={1024}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          decoding="async"
        />
        <button
          type="button"
          onClick={onNext}
          className="absolute right-3 z-10 rounded-lg border border-white/2 bg-black/50 p-2 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
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
  waitReason?: string;
  previewSrc: string | null;
  nowMs: number;
  isSelected: boolean;
  onInspect: () => void;
  onRetry?: () => void;
  onCancel: () => void;
}> = ({ job, waitReason, previewSrc, nowMs, isSelected, onInspect, onRetry, onCancel }) => {
  const canCancel = job.status === 'queued' || job.status === 'running';
  const canResume = canResumeStudioJob(job);
  const canRetry = Boolean(onRetry) && (canRetryStudioJob(job) || canResume);
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
          ? 'border-accent-500/2 bg-accent-500/10'
          : 'border-white/2 bg-black/20 hover:border-white/2 hover:bg-white/5',
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-0.5', recipeTone.dotClassName)} />
      <button
        type="button"
        onClick={onInspect}
        className="flex min-w-0 flex-1 items-start gap-1.5 text-left cursor-pointer"
      >
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="mt-0.5 size-7 shrink-0 overflow-hidden rounded-[6px] border border-white/2 bg-black/40">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt="Job thumbnail"
              width={28}
              height={28}
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
                  ? 'border-emerald-500/2 bg-emerald-500/10'
                  : job.status === 'needs_review'
                    ? 'border-amber-500/2 bg-amber-500/10'
                    : job.status === 'failed' || job.status === 'cancelled'
                      ? 'border-rose-500/2 bg-rose-500/10'
                      : 'border-accent-500/2 bg-accent-500/10',
              )}
            >
              {job.status}
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
          {waitReason ? <p className="mt-1 text-[10px] text-amber-300">{waitReason}</p> : null}
          {job.error ? (
            <p className="mt-1 line-clamp-2 rounded-[6px] border border-rose-500/2 bg-rose-500/5 p-1 text-[9px] text-rose-300/80">
              {job.error}
            </p>
          ) : null}
        </div>
      </button>
      <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
        <BrainCircuit size={13} className="text-zinc-500" />
        {canCancel ? (
          <button
            type="button"
            aria-label={`Cancel backend job ${job.id}`}
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
            aria-label={`${canResume ? 'Resume' : 'Retry'} backend job ${job.id}`}
            onClick={onRetry}
            className="studio-hit-target rounded-[6px] p-1 text-white/35 transition-colors hover:bg-white/10 hover:text-accent-400 cursor-pointer"
            title={canResume ? 'Resume existing remote job' : 'Retry backend job'}
          >
            <RotateCcw size={13} />
          </button>
        ) : null}
      </div>
    </div>
  );
};
