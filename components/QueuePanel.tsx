import React, { useEffect, useMemo, useState } from 'react';
import {
  IconAlertTriangle as AlertTriangle,
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
      return 'text-[color:var(--wb-success)]';
    case 'failed':
      return 'text-[color:var(--wb-danger)]';
    case 'cancelled':
      return 'text-[color:var(--wb-muted)]';
    case 'needs_review':
      return 'text-[color:var(--wb-warning)] ';
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

function formatQueueTaskLabel(value: string | null | undefined) {
  if (!value) return 'Task';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function resolveQueueRecipeLabel(
  recipeId: string | null | undefined,
  fallbackTask?: string | null,
) {
  return (
    getActiveRecipeIndicator(isRegisteredRecipeId(recipeId) ? recipeId : null)?.title ??
    formatQueueTaskLabel(fallbackTask)
  );
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
    const [view, setView] = useState<'active' | 'review' | 'history'>('active');
    const [visibleCount, setVisibleCount] = useState(20);
    const [historyClearedAt, setHistoryClearedAt] = useState(() => {
      const stored = Number(window.localStorage.getItem('studio-jobs-history-cleared-at') ?? 0);
      return Number.isFinite(stored) ? stored : 0;
    });
    const activeJobs = jobHistory.open.filter((job) => job.status !== 'needs_review');
    const reviewJobs = jobHistory.open.filter((job) => job.status === 'needs_review');
    const visibleHistory = jobHistory.history.filter(
      (job) => Date.parse(job.createdAt) > historyClearedAt,
    );
    const jobs = view === 'history' ? visibleHistory : view === 'review' ? reviewJobs : activeJobs;
    const visibleJobs = view === 'history' ? jobs : jobs.slice(0, visibleCount);
    const jobGroups = Array.from(
      visibleJobs
        .reduce((groups, job) => {
          const key = job.batchId ?? job.id;
          const group = groups.get(key) ?? [];
          group.push(job);
          groups.set(key, group);
          return groups;
        }, new Map<string, StudioJob[]>())
        .entries(),
    );
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
      <div
        aria-label="Jobs"
        className="studio-surface flex h-full min-h-0 w-full flex-col border border-[color:var(--wb-border)] sm:w-[304px] sm:border-y-0 sm:border-r-0"
      >
        <div className="flex items-center justify-between px-3 py-3">
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--wb-ink)]/90">Jobs</h3>
            <p className="mt-0.5 text-xs text-[color:var(--wb-muted)]">
              {jobHistory.error
                ? 'Updates unavailable · last confirmed state'
                : jobHistory.loading && !jobHistory.page
                  ? 'Loading jobs…'
                  : summary.running + summary.queued > 0
                    ? `${summary.running} running · ${summary.queued} queued`
                    : 'No jobs running or queued'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Clear job history"
              title="Clear job history"
              onClick={() => {
                const now = Date.now();
                window.localStorage.setItem('studio-jobs-history-cleared-at', String(now));
                setHistoryClearedAt(now);
                setView('history');
              }}
              className="studio-hit-target rounded-[var(--wb-radius)] px-2 py-1.5 text-xs text-[color:var(--wb-muted)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
            >
              Clear
            </button>
            {onClose ? (
              <button
                type="button"
                aria-label="Close jobs"
                title="Close jobs"
                onClick={onClose}
                className="studio-hit-target rounded-[var(--wb-radius)] p-1.5 text-[color:var(--wb-muted)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
              >
                <XCircle size={18} />
              </button>
            ) : null}
          </div>
        </div>
        <div className="space-y-3 border-b border-[color:var(--wb-border)] px-3 pb-3">
          <label className="block text-xs text-[color:var(--wb-muted)]">
            Workspace
            <select
              aria-label="Job workspace"
              value={workspaceFilter}
              onChange={(event) => {
                setWorkspaceFilter(event.target.value);
                setVisibleCount(20);
              }}
              className="mt-1 w-full rounded-[var(--wb-radius)] border border-[color:var(--wb-border)] bg-[color:var(--wb-panel)] p-2 text-xs text-[color:var(--wb-ink)]"
            >
              <option value="">All workspaces</option>
              {jobHistory.workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </label>
          <div
            role="group"
            aria-label="Job views"
            className="grid grid-cols-3 gap-1 rounded-[var(--wb-radius)] bg-[color:var(--wb-well)] p-1"
          >
            {(['active', 'review', 'history'] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={view === item}
                onClick={() => {
                  setView(item);
                  setVisibleCount(20);
                }}
                className={cn(
                  'min-h-9 rounded-[var(--wb-radius)] px-1 text-xs transition-colors',
                  view === item
                    ? 'bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] text-[color:var(--wb-ink)]'
                    : 'text-[color:var(--wb-muted)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] hover:text-[color:var(--wb-ink)]',
                )}
              >
                {item === 'active' ? 'Active' : item === 'review' ? 'Review' : 'History'}
                {item !== 'history' ? (
                  <span
                    className={cn(
                      'ml-1 tabular-nums',
                      item === 'review' &&
                        reviewJobs.length > 0 &&
                        'text-[color:var(--wb-warning)] ',
                    )}
                  >
                    {item === 'active' ? activeJobs.length : reviewJobs.length}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
        <div
          key={`${view}:${workspaceFilter}`}
          className="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-3"
        >
          {jobHistory.error ? (
            <div
              role="alert"
              className="space-y-2 rounded-[var(--wb-radius)] border border-rose-500/20 p-3 text-xs text-[color:var(--wb-danger)] "
            >
              <p>{jobHistory.error}</p>
              <button type="button" onClick={jobHistory.retry} className="min-h-8 underline">
                Refresh jobs
              </button>
            </div>
          ) : null}
          {view === 'review' ? (
            <p className="text-xs leading-relaxed text-[color:var(--wb-muted)]">
              These jobs have stopped and need a decision. Open a job to review what happened.
            </p>
          ) : null}
          {view === 'history' ? (
            <>
              <label className="block text-xs text-[color:var(--wb-muted)]">
                Status
                <select
                  aria-label="Job history status"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as TerminalJobStatus | '')
                  }
                  className="mt-1 w-full rounded-[var(--wb-radius)] border border-[color:var(--wb-border)] bg-[color:var(--wb-panel)] p-2 text-xs text-[color:var(--wb-ink)]"
                >
                  <option value="">All finished jobs</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              {results.length > 0 ? (
                <details className="rounded-[var(--wb-radius)] border border-[color:var(--wb-border)] p-2 text-xs text-[color:var(--wb-muted)]">
                  <summary className="cursor-pointer py-1">
                    Recent images · current workspace
                  </summary>
                  <div className="mt-2 grid grid-cols-4 gap-1">
                    {results.map((result) => (
                      <button
                        type="button"
                        key={result.id}
                        onClick={() => setActiveResultId(result.id)}
                        className="group relative overflow-hidden rounded border border-[color:var(--wb-border)]"
                        title={result.prompt || 'Generated result'}
                      >
                        <img
                          src={result.src}
                          alt={result.prompt || 'Generated result'}
                          width={64}
                          height={64}
                          className="aspect-square w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="absolute inset-0 grid place-items-center text-[color:var(--wb-ink)] opacity-0 group-hover:bg-[color:var(--wb-well)] group-hover:opacity-100 group-focus-visible:opacity-100">
                          <Maximize2 size={14} />
                        </span>
                      </button>
                    ))}
                  </div>
                </details>
              ) : null}
              <p className="text-xs text-[color:var(--wb-muted)]">
                {jobHistory.page?.counts.history ?? '—'} matching jobs
              </p>
            </>
          ) : null}
          <section
            aria-label={
              view === 'active'
                ? 'Active jobs'
                : view === 'review'
                  ? 'Jobs needing review'
                  : 'Job history'
            }
            className="space-y-2"
          >
            {jobGroups.map(([groupId, group]) => (
              <div key={groupId} className="space-y-2">
                {group.length > 1 && (
                  <p className="pt-3 text-xs text-[color:var(--wb-ink)]">
                    {resolveQueueRecipeLabel(group[0].recipeId, group[0].kind)} · {group.length}{' '}
                    jobs on this page · {group.filter((job) => job.status === 'completed').length}{' '}
                    completed
                  </p>
                )}
                {group.map((job, index) => (
                  <ServerJobItem
                    key={job.id}
                    job={job}
                    showBatch={index === 0}
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
                ))}
              </div>
            ))}
          </section>
          {!jobHistory.loading && !jobHistory.error && jobs.length === 0 ? (
            <div className="py-8 text-center">
              <Layers size={24} className="mx-auto mb-3 text-[color:var(--wb-muted)]" />
              <p className="text-sm text-[color:var(--wb-ink)]">
                {view === 'active'
                  ? 'No active jobs'
                  : view === 'review'
                    ? 'Nothing to review'
                    : 'No matching history'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[color:var(--wb-muted)]">
                {view === 'active'
                  ? 'New generations will appear here.'
                  : view === 'review'
                    ? 'Jobs that need your input will appear here.'
                    : 'Try another status or workspace.'}
              </p>
            </div>
          ) : null}
          {jobHistory.loading ? (
            <p role="status" className="text-xs text-[color:var(--wb-muted)]">
              Loading jobs…
            </p>
          ) : null}
          {view !== 'history' && jobs.length > visibleCount ? (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 20)}
              className="min-h-9 w-full rounded-[var(--wb-radius)] bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] px-2 text-xs text-[color:var(--wb-ink)]"
            >
              Show more · {visibleJobs.length} of {jobs.length}
            </button>
          ) : view === 'history' && jobHistory.nextCursor && !jobHistory.loading ? (
            <button
              type="button"
              onClick={jobHistory.loadMore}
              className="min-h-9 w-full rounded-[var(--wb-radius)] bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] px-2 text-xs text-[color:var(--wb-ink)]"
            >
              Load older jobs
            </button>
          ) : null}
          {view === 'active' ? (
            <details className="border-t border-[color:var(--wb-border)] pt-3 text-xs text-[color:var(--wb-muted)]">
              <summary className="cursor-pointer py-1">Worker details</summary>
              <div className="mt-2 space-y-1" aria-label="Worker capacity">
                {worker.status ? (
                  <>
                    <p>
                      {worker.status.activeWorkerCount} / {worker.status.maxConcurrentJobs} worker
                      slots active{worker.status.stopping ? ' · Stopping' : ''}
                    </p>
                    {Object.entries(worker.status.providerLimits).map(([providerId, limit]) => (
                      <p key={providerId}>
                        {providerId}: {worker.status?.activeByProvider[providerId] ?? 0} / {limit}{' '}
                        active
                      </p>
                    ))}
                  </>
                ) : (
                  <p>{worker.error ? 'Worker capacity unavailable' : 'Reading worker capacity'}</p>
                )}
              </div>
            </details>
          ) : null}
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
    <div className="fixed inset-0 z-50 flex flex-col bg-[color:var(--wba-bg)] backdrop-blur-md">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[color:var(--wb-line)] px-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-[color:var(--wb-ink)]/90">
            {result.prompt || 'Generated result'}
          </p>
          <p className="text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-ink)]/35">
            {index + 1} / {total}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onInspect ? (
            <button
              type="button"
              onClick={onInspect}
              className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-3 py-2 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
            >
              Inspect
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--wb-radius)] p-2 text-[color:var(--wb-ink)]/50 transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
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
          className="absolute left-3 z-10 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-2 text-[color:var(--wb-ink)]/65 transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
          aria-label="Previous recent result"
        >
          <ChevronLeft size={20} />
        </button>
        <img
          src={result.fullSrc || result.src}
          alt={result.prompt || 'Generated result'}
          width={1024}
          height={1024}
          className="max-h-full max-w-full rounded-[var(--wb-radius)] object-contain shadow-2xl"
          decoding="async"
        />
        <button
          type="button"
          onClick={onNext}
          className="absolute right-3 z-10 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-2 text-[color:var(--wb-ink)]/65 transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
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
  showBatch?: boolean;
  waitReason?: string;
  previewSrc: string | null;
  nowMs: number;
  isSelected: boolean;
  onInspect: () => void;
  onRetry?: () => void;
  onCancel: () => void;
}> = ({
  job,
  showBatch = true,
  waitReason,
  previewSrc,
  nowMs,
  isSelected,
  onInspect,
  onRetry,
  onCancel,
}) => {
  const [batchOpen, setBatchOpen] = useState(false);
  const canCancel = job.status === 'queued' || job.status === 'running';
  const canResume = canResumeStudioJob(job);
  const canRetry = Boolean(onRetry) && (canRetryStudioJob(job) || canResume);
  const recipeLabel = resolveQueueRecipeLabel(job.recipeId, job.kind);
  const createdAtMs = toEpochMs(job.createdAt);
  const statusLabel =
    job.status === 'needs_review' ? 'Needs review' : formatQueueTaskLabel(job.status);
  const icon =
    job.status === 'running' ? (
      <Loader2 size={14} className="motion-safe:animate-spin" />
    ) : job.status === 'completed' ? (
      <CheckCircle2 size={14} />
    ) : job.status === 'needs_review' || job.status === 'failed' ? (
      <AlertTriangle size={14} />
    ) : (
      <Clock size={14} />
    );
  return (
    <article
      className={cn(
        'overflow-hidden rounded-[var(--wb-radius)] border p-2.5',
        isSelected
          ? 'border-accent-500/50 bg-accent-500/10'
          : 'border-[color:var(--wb-border)] bg-white/[0.025]',
      )}
    >
      <button
        type="button"
        onClick={onInspect}
        aria-label={`Inspect job: ${job.originalPrompt || 'Untitled job'}`}
        className="block w-full rounded text-left"
      >
        <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
          <span className={cn('flex items-center gap-1.5', getServerStatusColor(job.status))}>
            {icon}
            {statusLabel}
          </span>
          <span className="truncate text-[color:var(--wb-muted)]">{recipeLabel}</span>
        </div>
        <div className="flex items-start gap-2">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 rounded object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <p className="line-clamp-2 text-xs leading-relaxed text-[color:var(--wb-ink)]">
            {job.originalPrompt || 'Untitled job'}
          </p>
        </div>
        <p className="mt-2 text-[11px] text-[color:var(--wb-muted)]">
          {job.status === 'running'
            ? `Submitted ${formatDurationMs(createdAtMs === null ? null : nowMs - createdAtMs)} ago`
            : job.status === 'queued'
              ? 'Waiting to start'
              : new Date(job.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          <span className="mx-1.5">·</span>
          {formatClockTime(createdAtMs)}
          <span className="float-right text-[color:var(--wb-ink)]">Details →</span>
        </p>
      </button>
      {waitReason ? (
        <p className="mt-2 text-xs text-[color:var(--wb-warning)] ">{waitReason}</p>
      ) : null}
      {job.error ? (
        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[color:var(--wb-danger)] ">
          {job.error}
        </p>
      ) : null}
      {canCancel || canRetry ? (
        <div className="mt-2 flex justify-end">
          {canCancel ? (
            <button
              type="button"
              aria-label={`Cancel backend job ${job.id}`}
              onClick={onCancel}
              className="min-h-8 rounded-[var(--wb-radius)] px-2 text-xs text-[color:var(--wb-ink)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)]"
            >
              Cancel
            </button>
          ) : null}
          {canRetry ? (
            <button
              type="button"
              aria-label={`${canResume ? 'Resume' : 'Retry'} backend job ${job.id}`}
              onClick={onRetry}
              title={canResume ? 'Resume existing remote job' : 'Retry this job'}
              className="flex min-h-8 items-center gap-1.5 rounded-[var(--wb-radius)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-2 text-xs text-[color:var(--wb-ink)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)]"
            >
              <RotateCcw size={13} />
              {canResume ? 'Resume' : 'Retry'}
            </button>
          ) : null}
        </div>
      ) : null}
      {job.batchId && showBatch ? (
        <details
          onToggle={(event) => setBatchOpen(event.currentTarget.open)}
          className="mt-2 border-t border-[color:var(--wb-border)] pt-1 text-[11px] text-[color:var(--wb-muted)]"
        >
          <summary className="cursor-pointer py-1">Batch progress and retry</summary>
          {batchOpen ? <QueueBatchCard batchId={job.batchId} revision={job.updatedAt} /> : null}
        </details>
      ) : null}
    </article>
  );
};
