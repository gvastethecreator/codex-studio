import type {
  Asset,
  CatalogImage,
  Job,
  StudioEvent,
  SystemLog,
  UnknownStudioEvent,
} from '../packages/shared/src';
import { getStudioApiBase, listStudioJobs } from './localStudioService';

type Unsubscribe = () => void;
type Listener<T> = (payload: T) => void;

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

export class JobWatchTimeoutError extends Error {
  constructor(jobId: string) {
    super(`Local studio job ${jobId} timed out`);
    this.name = 'JobWatchTimeoutError';
  }
}

export class JobWatchCancelledError extends Error {
  constructor() {
    super('Operation cancelled by user');
    this.name = 'AbortError';
  }
}

export function createJobTerminalStatusError(job: Job) {
  if (job.status === 'cancelled') {
    return new JobWatchCancelledError();
  }
  return new Error(job.error || `Local studio job ${job.status}`);
}

export interface StudioEventStream {
  onJobUpdate(jobIdOrWildcard: string, callback: Listener<Job>): Unsubscribe;
  onAssetAdded(callback: Listener<Asset>): Unsubscribe;
  onCatalogChanged(callback: Listener<CatalogImage>): Unsubscribe;
  onLogAdded(callback: Listener<SystemLog>): Unsubscribe;
  onConnectionChange(callback: Listener<boolean>): Unsubscribe;
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
  private catalogListeners = new Set<Listener<CatalogImage>>();
  private logListeners = new Set<Listener<SystemLog>>();
  private connectionListeners = new Set<Listener<boolean>>();

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
    return () => listeners.delete(callback);
  }

  onAssetAdded(callback: Listener<Asset>) {
    this.assetListeners.add(callback);
    return () => this.assetListeners.delete(callback);
  }

  onCatalogChanged(callback: Listener<CatalogImage>) {
    this.catalogListeners.add(callback);
    return () => this.catalogListeners.delete(callback);
  }

  onLogAdded(callback: Listener<SystemLog>) {
    this.logListeners.add(callback);
    return () => this.logListeners.delete(callback);
  }

  onConnectionChange(callback: Listener<boolean>) {
    this.connectionListeners.add(callback);
    callback(this.source?.readyState === EventSource.OPEN);
    return () => this.connectionListeners.delete(callback);
  }

  close() {
    this.closed = true;
    this.source?.close();
    if (this.reconnectTimer) globalThis.clearTimeout(this.reconnectTimer);
  }

  private connect() {
    if (this.closed || typeof EventSource === 'undefined') return;
    this.source?.close();
    const source = new EventSource(`${this.apiBase}/api/events`);
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
    for (const listener of this.connectionListeners) listener(connected);
  }

  private dispatch(event: StudioEvent | UnknownStudioEvent) {
    if (event.type.startsWith('job.')) {
      const job = event.payload as Job | null;
      if (!job) return;
      this.jobListeners.get('*')?.forEach((listener) => listener(job));
      this.jobListeners.get(job.id)?.forEach((listener) => listener(job));
    } else if (event.type === 'asset.created') {
      this.assetListeners.forEach((listener) => listener(event.payload as Asset));
    } else if (
      event.type === 'catalog.created' ||
      event.type === 'catalog.updated' ||
      event.type === 'catalog.deleted'
    ) {
      this.catalogListeners.forEach((listener) => listener(event.payload as CatalogImage));
    } else if (event.type === 'log.appended' || event.type === 'log.created') {
      this.logListeners.forEach((listener) => listener(event.payload as SystemLog));
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

  onCatalogChanged(callback: Listener<CatalogImage>) {
    return this.closed ? () => {} : this.stream.onCatalogChanged(callback);
  }

  onLogAdded(callback: Listener<SystemLog>) {
    return this.closed ? () => {} : this.stream.onLogAdded(callback);
  }

  onConnectionChange(callback: Listener<boolean>) {
    return this.closed ? () => {} : this.stream.onConnectionChange(callback);
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.release();
  }
}

const sharedStreams = new Map<string, { stream: BrowserStudioEventStream; refCount: number }>();

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

  return new StudioEventStreamLease(entry.stream, () => {
    entry.refCount -= 1;
    if (entry.refCount > 0) return;
    entry.stream.close();
    sharedStreams.delete(resolvedApiBase);
  });
}

/**
 * Wait for one persistent backend job to reach a terminal status.
 */
export async function watchJob(
  stream: StudioEventStream,
  jobId: string,
  signal?: AbortSignal,
  timeoutMs = 240_000,
) {
  return new Promise<Job>((resolve, reject) => {
    let settled = false;
    let unsubscribe: Unsubscribe = () => {};
    const timeout = globalThis.setTimeout(() => {
      settle(() => reject(new JobWatchTimeoutError(jobId)));
    }, timeoutMs);
    const abort = () => {
      settle(() => reject(new JobWatchCancelledError()));
    };

    const cleanup = () => {
      globalThis.clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
      unsubscribe();
    };

    const settle = (complete: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      complete();
    };

    const handleJob = (job: Job) => {
      if (!isTerminalStudioJobStatus(job.status)) return;
      if (job.status === 'failed' || job.status === 'cancelled') {
        settle(() => reject(createJobTerminalStatusError(job)));
      } else {
        settle(() => resolve(job));
      }
    };

    unsubscribe = stream.onJobUpdate(jobId, handleJob);
    if (settled) unsubscribe();

    signal?.addEventListener('abort', abort);
    if (signal?.aborted) {
      abort();
      return;
    }

    void listStudioJobs()
      .then((jobs) => {
        const initial = jobs.find((job) => job.id === jobId);
        if (initial) handleJob(initial);
      })
      .catch((error) => {
        settle(() => reject(error));
      });
  });
}
