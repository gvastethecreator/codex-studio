import type {
  Asset,
  CatalogBatchChangedEventPayload,
  CatalogImage,
  Job,
  JobStatusSnapshot,
  OnboardingProbe,
  OnboardingStagePayload,
  StudioEvent,
  SystemLog,
  SubscriptionAuthUpdatedEventPayload,
  UnknownStudioEvent,
} from '../packages/shared/src';
import { getStudioApiBase } from './studio-api/http';
import { getStudioJobStatus } from './studio-api/jobs';

type Unsubscribe = () => void;
type Listener<T> = (payload: T) => void;

function notifyListener<T>(listener: Listener<T>, payload: T) {
  try {
    listener(payload);
  } catch (error) {
    // Report subscriber failures without interrupting other consumers of the shared stream.
    // eslint-disable-next-line no-console
    console.error('Studio event listener failed', error);
  }
}

export type StudioCatalogEventPayload =
  | {
      type: 'catalog.created' | 'catalog.updated' | 'catalog.deleted';
      image: CatalogImage;
    }
  | {
      type: 'catalog.batch_changed';
      batch: CatalogBatchChangedEventPayload;
    };

const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancelled', 'needs_review']);

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
  const initialDelayMs = Math.max(
    100,
    Math.floor(policy.initialDelayMs ?? DEFAULT_STUDIO_EVENT_RECONNECT_POLICY.initialDelayMs),
  );
  const maxDelayMs = Math.max(
    initialDelayMs,
    Math.floor(policy.maxDelayMs ?? DEFAULT_STUDIO_EVENT_RECONNECT_POLICY.maxDelayMs),
  );

  return {
    initialDelayMs,
    maxDelayMs,
  };
}

export function isTerminalStudioJobStatus(status: Job['status']) {
  return TERMINAL_STATUSES.has(status);
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
  if (job.status === 'cancelled') {
    return new JobWatchCancelledError();
  }
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

/**
 * Browser-backed SSE adapter shared by the UI so backend job, asset, and log
 * events reuse a single connection with reconnect semantics.
 */
class BrowserStudioEventStream implements StudioEventStream {
  private source: EventSource | null = null;
  private closed = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = DEFAULT_STUDIO_EVENT_RECONNECT_POLICY.initialDelayMs;
  private jobListeners = new Map<string, Set<Listener<Job>>>();
  private assetListeners = new Set<Listener<Asset>>();
  private catalogListeners = new Set<Listener<StudioCatalogEventPayload>>();
  private logListeners = new Set<Listener<SystemLog>>();
  private onboardingStageListeners = new Set<Listener<OnboardingStagePayload>>();
  private onboardingProbeListeners = new Set<Listener<OnboardingProbe>>();
  private authUpdatedListeners = new Set<Listener<SubscriptionAuthUpdatedEventPayload>>();
  private connectionListeners = new Set<Listener<boolean>>();
  private revisionGapListeners = new Set<Listener<void>>();
  private lastRevision = 0;

  constructor(
    private readonly apiBase = getStudioApiBase(),
    private readonly reconnectPolicy: StudioEventReconnectPolicy = DEFAULT_STUDIO_EVENT_RECONNECT_POLICY,
  ) {
    this.connect();
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

  onAssetAdded(callback: Listener<Asset>) {
    this.assetListeners.add(callback);
    return () => this.assetListeners.delete(callback);
  }

  onCatalogChanged(callback: Listener<StudioCatalogEventPayload>) {
    this.catalogListeners.add(callback);
    return () => this.catalogListeners.delete(callback);
  }

  onLogAdded(callback: Listener<SystemLog>) {
    this.logListeners.add(callback);
    return () => this.logListeners.delete(callback);
  }

  onOnboardingStage(callback: Listener<OnboardingStagePayload>) {
    this.onboardingStageListeners.add(callback);
    return () => this.onboardingStageListeners.delete(callback);
  }

  onOnboardingProbe(callback: Listener<OnboardingProbe>) {
    this.onboardingProbeListeners.add(callback);
    return () => this.onboardingProbeListeners.delete(callback);
  }

  onAuthUpdated(callback: Listener<SubscriptionAuthUpdatedEventPayload>) {
    this.authUpdatedListeners.add(callback);
    return () => this.authUpdatedListeners.delete(callback);
  }

  onConnectionChange(callback: Listener<boolean>) {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  onRevisionGap(callback: Listener<void>) {
    this.revisionGapListeners.add(callback);
    return () => this.revisionGapListeners.delete(callback);
  }

  close() {
    this.closed = true;
    this.source?.close();
    if (this.reconnectTimer) globalThis.clearTimeout(this.reconnectTimer);
  }

  private connect() {
    if (this.closed || typeof EventSource === 'undefined') return;
    this.source?.close();
    const suffix = this.lastRevision > 0 ? `?since=${this.lastRevision}` : '';
    const source = new EventSource(`${this.apiBase}/api/events${suffix}`);
    this.source = source;
    source.onopen = () => {
      this.reconnectDelay = this.reconnectPolicy.initialDelayMs;
      this.emitConnection(true);
    };
    source.onerror = () => {
      this.emitConnection(false);
      source.close();
      this.scheduleReconnect();
    };
    source.onmessage = (event) => {
      try {
        this.dispatch(JSON.parse(event.data) as StudioEvent | UnknownStudioEvent);
      } catch {
        // Ignore malformed SSE frames; the reconnect path handles broken streams.
      }
    };
  }

  private scheduleReconnect() {
    if (this.closed || this.reconnectTimer) return;
    this.reconnectTimer = globalThis.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.reconnectPolicy.maxDelayMs);
  }

  private emitConnection(connected: boolean) {
    for (const listener of this.connectionListeners) notifyListener(listener, connected);
  }

  private dispatch(event: StudioEvent | UnknownStudioEvent) {
    if (event.type === 'server.connected') {
      const connected = event as Extract<StudioEvent, { type: 'server.connected' }>;
      const serverRevision = connected.payload.revision ?? event.revision ?? 0;
      if (connected.payload.reconciled === false) {
        this.revisionGapListeners.forEach((listener) => notifyListener(listener, undefined));
      }
      // A backend restart begins a new in-memory revision epoch. The connected
      // frame is authoritative after reconciliation, even when it is lower.
      this.lastRevision = serverRevision;
      return;
    }

    if (typeof event.revision === 'number') {
      if (event.revision <= this.lastRevision) return;
      if (this.lastRevision > 0 && event.revision > this.lastRevision + 1) {
        this.revisionGapListeners.forEach((listener) => notifyListener(listener, undefined));
      }
      this.lastRevision = event.revision;
    }

    if (event.type.startsWith('job.')) {
      const job = event.payload as Job | null;
      if (!job) return;
      this.jobListeners.get('*')?.forEach((listener) => notifyListener(listener, job));
      this.jobListeners.get(job.id)?.forEach((listener) => notifyListener(listener, job));
    } else if (event.type === 'asset.created') {
      this.assetListeners.forEach((listener) => notifyListener(listener, event.payload as Asset));
    } else if (
      event.type === 'catalog.created' ||
      event.type === 'catalog.updated' ||
      event.type === 'catalog.deleted'
    ) {
      const type = event.type as Exclude<
        StudioCatalogEventPayload['type'],
        'catalog.batch_changed'
      >;
      this.catalogListeners.forEach((listener) =>
        notifyListener(listener, { type, image: event.payload as CatalogImage }),
      );
    } else if (event.type === 'catalog.batch_changed') {
      this.catalogListeners.forEach((listener) =>
        notifyListener(listener, {
          type: 'catalog.batch_changed',
          batch: event.payload as CatalogBatchChangedEventPayload,
        }),
      );
    } else if (event.type === 'log.appended' || event.type === 'log.created') {
      this.logListeners.forEach((listener) => notifyListener(listener, event.payload as SystemLog));
    } else if (event.type === 'onboarding.stage') {
      this.onboardingStageListeners.forEach((listener) =>
        notifyListener(listener, event.payload as OnboardingStagePayload),
      );
    } else if (event.type === 'onboarding.probe') {
      this.onboardingProbeListeners.forEach((listener) =>
        notifyListener(listener, event.payload as OnboardingProbe),
      );
    } else if (event.type === 'auth.updated') {
      this.authUpdatedListeners.forEach((listener) =>
        notifyListener(listener, event.payload as SubscriptionAuthUpdatedEventPayload),
      );
    }
  }
}

class StudioEventStreamLease implements StudioEventStream {
  private closed = false;

  constructor(
    private readonly stream: StudioEventStream,
    private readonly release: () => void,
  ) {}

  onJobUpdate(jobIdOrWildcard: string, callback: Listener<Job>) {
    return this.closed ? () => {} : this.stream.onJobUpdate(jobIdOrWildcard, callback);
  }

  onAssetAdded(callback: Listener<Asset>) {
    return this.closed ? () => {} : this.stream.onAssetAdded(callback);
  }

  onCatalogChanged(callback: Listener<StudioCatalogEventPayload>) {
    return this.closed ? () => {} : this.stream.onCatalogChanged(callback);
  }

  onLogAdded(callback: Listener<SystemLog>) {
    return this.closed ? () => {} : this.stream.onLogAdded(callback);
  }

  onOnboardingStage(callback: Listener<OnboardingStagePayload>) {
    return this.closed ? () => {} : this.stream.onOnboardingStage(callback);
  }

  onOnboardingProbe(callback: Listener<OnboardingProbe>) {
    return this.closed ? () => {} : this.stream.onOnboardingProbe(callback);
  }

  onAuthUpdated(callback: Listener<SubscriptionAuthUpdatedEventPayload>) {
    return this.closed ? () => {} : this.stream.onAuthUpdated(callback);
  }

  onConnectionChange(callback: Listener<boolean>) {
    return this.closed ? () => {} : this.stream.onConnectionChange(callback);
  }

  onRevisionGap(callback: Listener<void>) {
    return this.closed ? () => {} : (this.stream.onRevisionGap?.(callback) ?? (() => {}));
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.release();
  }
}

const sharedStreams = new Map<string, { stream: BrowserStudioEventStream; refCount: number }>();
const streamOwners = new WeakMap<StudioEventStream, StudioEventStream>();

/**
 * Create a live SSE stream for backend events. Consumers should reuse the same
 * instance when they need correlated job and asset updates.
 */
export function createStudioEventStream(apiBase?: string): StudioEventStream {
  const resolvedApiBase = apiBase ?? getStudioApiBase();
  let entry = sharedStreams.get(resolvedApiBase);
  if (!entry) {
    entry = {
      stream: new BrowserStudioEventStream(
        resolvedApiBase,
        normalizeStudioEventReconnectPolicy(DEFAULT_STUDIO_EVENT_RECONNECT_POLICY),
      ),
      refCount: 0,
    };
    sharedStreams.set(resolvedApiBase, entry);
  }

  entry.refCount += 1;

  const lease = new StudioEventStreamLease(entry.stream, () => {
    entry.refCount -= 1;
    if (entry.refCount > 0) return;
    entry.stream.close();
    sharedStreams.delete(resolvedApiBase);
  });
  streamOwners.set(lease, entry.stream);
  return lease;
}

interface JobObservation {
  result: Promise<JobStatusSnapshot>;
  consumers: number;
  dispose: () => void;
}

const jobObservations = new WeakMap<StudioEventStream, Map<string, JobObservation>>();

function acquireJobObservation(stream: StudioEventStream, jobId: string) {
  const owner = streamOwners.get(stream) ?? stream;
  let observations = jobObservations.get(owner);
  if (!observations) {
    observations = new Map();
    jobObservations.set(owner, observations);
  }
  const existing = observations.get(jobId);
  if (existing) {
    existing.consumers += 1;
    return existing;
  }

  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let requestController: AbortController | undefined;
  let eventVersion = 0;
  let latestUpdatedAt = Number.NEGATIVE_INFINITY;
  let hasSnapshot = false;
  let refreshRequested = false;
  let failures = 0;
  const subscriptions: Unsubscribe[] = [];
  let resolve!: (job: JobStatusSnapshot) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<JobStatusSnapshot>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  const observation: JobObservation = {
    result: promise,
    consumers: 1,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      globalThis.clearTimeout(timer);
      requestController?.abort();
      subscriptions.splice(0).forEach((unsubscribe) => unsubscribe());
      if (observations.get(jobId) === observation) observations.delete(jobId);
    },
  };
  observations.set(jobId, observation);

  const handleJob = (job: JobStatusSnapshot) => {
    if (disposed || job.id !== jobId) return;
    const updatedAt = Date.parse(job.updatedAt);
    if (updatedAt < latestUpdatedAt) return;
    if (Number.isFinite(updatedAt)) latestUpdatedAt = updatedAt;
    if (!isTerminalStudioJobStatus(job.status)) return;
    observation.dispose();
    if (job.status === 'completed') resolve(job);
    else reject(createJobTerminalStatusError(job));
  };
  const schedule = (delay: number) => {
    if (disposed) return;
    globalThis.clearTimeout(timer);
    timer = globalThis.setTimeout(() => void reconcile(), delay);
  };
  const reconcile = async () => {
    if (disposed) return;
    if (requestController) {
      refreshRequested = true;
      return;
    }
    globalThis.clearTimeout(timer);
    const controller = new AbortController();
    requestController = controller;
    const version = eventVersion;
    const deadline = globalThis.setTimeout(() => controller.abort(), 10_000);
    try {
      const job = await getStudioJobStatus(jobId, controller.signal);
      if (disposed) return;
      failures = 0;
      hasSnapshot = true;
      // An event delivered during this read is newer than the request's snapshot.
      if (version === eventVersion || Date.parse(job.updatedAt) > latestUpdatedAt) handleJob(job);
    } catch {
      if (disposed) return;
      failures += 1;
      if (failures >= 5) {
        observation.dispose();
        reject(new JobObservationError(jobId));
      }
    } finally {
      globalThis.clearTimeout(deadline);
      requestController = undefined;
      if (!disposed) {
        const delay = failures > 0 ? Math.min(1000 * 2 ** (failures - 1), 30_000) : 30_000;
        schedule(refreshRequested && failures === 0 ? 0 : delay);
        refreshRequested = false;
      }
    }
  };
  const subscribe = (unsubscribe: Unsubscribe) => {
    if (disposed) unsubscribe();
    else subscriptions.push(unsubscribe);
  };
  subscribe(
    owner.onJobUpdate(jobId, (job) => {
      eventVersion += 1;
      if (!hasSnapshot && isTerminalStudioJobStatus(job.status)) {
        void reconcile();
        return;
      }
      handleJob(job);
    }),
  );
  subscribe(
    owner.onConnectionChange((connected) => {
      if (connected) void reconcile();
    }),
  );
  if (owner.onRevisionGap) subscribe(owner.onRevisionGap(() => void reconcile()));
  void reconcile();
  return observation;
}

/** Observe one durable job. A caller deadline ends observation, never execution. */
export async function watchJob(
  stream: StudioEventStream,
  jobId: string,
  signal?: AbortSignal,
  timeoutMs?: number,
) {
  if (signal?.aborted) throw new JobWatchCancelledError();
  const observation = acquireJobObservation(stream, jobId);
  return new Promise<JobStatusSnapshot>((resolve, reject) => {
    let settled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const abort = () => {
      settle(() => reject(new JobWatchCancelledError()));
    };

    const cleanup = () => {
      globalThis.clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
      observation.consumers -= 1;
      if (observation.consumers === 0) observation.dispose();
    };

    const settle = (complete: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      complete();
    };

    observation.result.then(
      (job) => settle(() => resolve(job)),
      (error) => settle(() => reject(error)),
    );
    if (timeoutMs !== undefined && Number.isFinite(timeoutMs)) {
      timeout = globalThis.setTimeout(
        () => {
          settle(() => reject(new JobWatchTimeoutError(jobId)));
        },
        Math.max(0, timeoutMs),
      );
    }
    signal?.addEventListener('abort', abort);
    if (signal?.aborted) {
      abort();
      return;
    }
  });
}
