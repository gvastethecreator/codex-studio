import type {
  Asset,
  Job,
  JobStatusSnapshot,
  OnboardingProbe,
  OnboardingStagePayload,
  SubscriptionAuthUpdatedEventPayload,
  SystemLog,
} from '../packages/shared/src';
import { getStudioJobStatus } from '../services/studio-api/jobs';
import { getDemoRevision, subscribeDemoEvents } from './demo-store';

type Unsubscribe = () => void;
type Listener<T> = (payload: T) => void;

export type StudioCatalogEventPayload =
  | {
      type: 'catalog.created' | 'catalog.updated' | 'catalog.deleted';
      image: import('../packages/shared/src').CatalogImage;
    }
  | {
      type: 'catalog.batch_changed';
      batch: import('../packages/shared/src').CatalogBatchChangedEventPayload;
    };

export interface StudioEventReconnectPolicy {
  initialDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_STUDIO_EVENT_RECONNECT_POLICY: StudioEventReconnectPolicy = {
  initialDelayMs: 1000,
  maxDelayMs: 30_000,
};

export function normalizeStudioEventReconnectPolicy(
  policy: Partial<StudioEventReconnectPolicy>,
): StudioEventReconnectPolicy {
  const initialDelayMs = Math.max(100, Math.floor(policy.initialDelayMs ?? 1000));
  const maxDelayMs = Math.max(initialDelayMs, Math.floor(policy.maxDelayMs ?? 30_000));
  return { initialDelayMs, maxDelayMs };
}

const TERMINAL = new Set(['completed', 'failed', 'cancelled', 'needs_review']);

export function isTerminalStudioJobStatus(status: Job['status']) {
  return TERMINAL.has(status);
}

export class JobObservationError extends Error {
  constructor(readonly jobId: string) {
    super(
      `Could not confirm job ${jobId}. Open Queue to reconnect and inspect its current status.`,
    );
    this.name = 'JobObservationError';
  }
}

export class JobWatchTimeoutError extends JobObservationError {
  constructor(jobId: string) {
    super(jobId);
    this.name = 'JobWatchTimeoutError';
  }
}

export class JobNeedsReviewError extends Error {
  constructor(
    readonly jobId: string,
    message?: string | null,
  ) {
    super(message || `Job ${jobId} needs review. Inspect its provider result in Queue.`);
    this.name = 'JobNeedsReviewError';
  }
}

export class JobWatchCancelledError extends Error {
  constructor() {
    super('Operation cancelled by user');
    this.name = 'AbortError';
  }
}

export function createJobTerminalStatusError(job: JobStatusSnapshot) {
  if (job.status === 'needs_review') return new JobNeedsReviewError(job.id, job.error);
  if (job.status === 'cancelled') return new JobWatchCancelledError();
  return new Error(job.error || `Local studio job ${job.status}`);
}

export interface StudioEventStream {
  onJobUpdate(jobIdOrWildcard: string, callback: Listener<Job>): Unsubscribe;
  onAssetAdded(callback: Listener<Asset>): Unsubscribe;
  onCatalogChanged(callback: Listener<StudioCatalogEventPayload>): Unsubscribe;
  onLogAdded(callback: Listener<SystemLog>): Unsubscribe;
  onOnboardingStage(callback: Listener<OnboardingStagePayload>): Unsubscribe;
  onOnboardingProbe(callback: Listener<OnboardingProbe>): Unsubscribe;
  onAuthUpdated(callback: Listener<SubscriptionAuthUpdatedEventPayload>): Unsubscribe;
  onConnectionChange(callback: Listener<boolean>): Unsubscribe;
  onRevisionGap?(callback: Listener<void>): Unsubscribe;
  close(): void;
}

class DemoStudioEventStream implements StudioEventStream {
  private closed = false;
  private lastRevision = getDemoRevision();
  private jobListeners = new Map<string, Set<Listener<Job>>>();
  private catalogListeners = new Set<Listener<StudioCatalogEventPayload>>();
  private logListeners = new Set<Listener<SystemLog>>();
  private connectionListeners = new Set<Listener<boolean>>();
  private revisionGapListeners = new Set<Listener<void>>();
  private unsubscribeStore: Unsubscribe;

  constructor() {
    this.unsubscribeStore = subscribeDemoEvents((event) => {
      if (this.closed) return;
      if (event.revision && event.revision > this.lastRevision + 1) {
        this.revisionGapListeners.forEach((listener) => listener());
      }
      if (event.revision) this.lastRevision = event.revision;
      if (event.type.startsWith('job.') && event.payload && typeof event.payload === 'object') {
        const job = event.payload as Job;
        this.jobListeners.get(job.id)?.forEach((listener) => listener(job));
        this.jobListeners.get('*')?.forEach((listener) => listener(job));
      }
      if (event.type.startsWith('catalog.') && event.payload && 'id' in (event.payload as object)) {
        this.catalogListeners.forEach((listener) =>
          listener({
            type: event.type as 'catalog.created' | 'catalog.updated' | 'catalog.deleted',
            image: event.payload as import('../packages/shared/src').CatalogImage,
          }),
        );
      }
      if (event.type === 'log.created' || event.type === 'log.appended') {
        this.logListeners.forEach((listener) => listener(event.payload as SystemLog));
      }
    });
    queueMicrotask(() => {
      this.connectionListeners.forEach((listener) => listener(true));
    });
  }

  onJobUpdate(jobIdOrWildcard: string, callback: Listener<Job>) {
    const listeners = this.jobListeners.get(jobIdOrWildcard) ?? new Set<Listener<Job>>();
    listeners.add(callback);
    this.jobListeners.set(jobIdOrWildcard, listeners);
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) this.jobListeners.delete(jobIdOrWildcard);
    };
  }

  onAssetAdded(_callback: Listener<Asset>) {
    return () => undefined;
  }

  onCatalogChanged(callback: Listener<StudioCatalogEventPayload>) {
    this.catalogListeners.add(callback);
    return () => this.catalogListeners.delete(callback);
  }

  onLogAdded(callback: Listener<SystemLog>) {
    this.logListeners.add(callback);
    return () => this.logListeners.delete(callback);
  }

  onOnboardingStage(_callback: Listener<OnboardingStagePayload>) {
    return () => undefined;
  }

  onOnboardingProbe(_callback: Listener<OnboardingProbe>) {
    return () => undefined;
  }

  onAuthUpdated(_callback: Listener<SubscriptionAuthUpdatedEventPayload>) {
    return () => undefined;
  }

  onConnectionChange(callback: Listener<boolean>) {
    this.connectionListeners.add(callback);
    callback(true);
    return () => this.connectionListeners.delete(callback);
  }

  onRevisionGap(callback: Listener<void>) {
    this.revisionGapListeners.add(callback);
    return () => this.revisionGapListeners.delete(callback);
  }

  close() {
    this.closed = true;
    this.unsubscribeStore();
  }
}

export function createStudioEventStream(_apiBase?: string): StudioEventStream {
  return new DemoStudioEventStream();
}

export async function watchJob(
  _stream: StudioEventStream,
  jobId: string,
  signal?: AbortSignal,
  timeoutMs?: number,
) {
  if (signal?.aborted) throw new JobWatchCancelledError();
  const started = Date.now();
  while (true) {
    if (signal?.aborted) throw new JobWatchCancelledError();
    if (timeoutMs !== undefined && Date.now() - started > timeoutMs) {
      throw new JobWatchTimeoutError(jobId);
    }
    const job = await getStudioJobStatus(jobId, signal);
    if (isTerminalStudioJobStatus(job.status)) {
      if (job.status === 'completed') return job;
      throw createJobTerminalStatusError(job);
    }
    await new Promise((resolve) => window.setTimeout(resolve, 120));
  }
}
