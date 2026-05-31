import type { Asset, Job, StudioEvent, SystemLog } from '../packages/shared/src';
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
        this.dispatch(JSON.parse(event.data) as StudioEvent);
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

  private dispatch(event: StudioEvent) {
    if (event.type.startsWith('job.')) {
      const job = event.payload as Job;
      this.jobListeners.get('*')?.forEach((listener) => listener(job));
      this.jobListeners.get(job.id)?.forEach((listener) => listener(job));
    } else if (event.type === 'asset.created') {
      this.assetListeners.forEach((listener) => listener(event.payload as Asset));
    } else if (event.type === 'log.appended' || event.type === 'log.created') {
      this.logListeners.forEach((listener) => listener(event.payload as SystemLog));
    }
  }
}

/**
 * Create a live SSE stream for backend events. Consumers should reuse the same
 * instance when they need correlated job and asset updates.
 */
export function createStudioEventStream(apiBase?: string): StudioEventStream {
  return new BrowserStudioEventStream(
    apiBase,
    normalizeStudioEventReconnectPolicy(DEFAULT_STUDIO_EVENT_RECONNECT_POLICY),
  );
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
  const initial = (await listStudioJobs()).find((job) => job.id === jobId);
  if (initial && isTerminalStudioJobStatus(initial.status)) {
    if (initial.status === 'failed' || initial.status === 'cancelled') {
      throw createJobTerminalStatusError(initial);
    }
    return initial;
  }

  return new Promise<Job>((resolve, reject) => {
    const timeout = globalThis.setTimeout(() => {
      cleanup();
      reject(new JobWatchTimeoutError(jobId));
    }, timeoutMs);
    const abort = () => {
      cleanup();
      reject(new JobWatchCancelledError());
    };
    const unsubscribe = stream.onJobUpdate(jobId, (job) => {
      if (!isTerminalStudioJobStatus(job.status)) return;
      cleanup();
      if (job.status === 'failed' || job.status === 'cancelled') {
        reject(createJobTerminalStatusError(job));
      } else {
        resolve(job);
      }
    });
    const cleanup = () => {
      globalThis.clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
      unsubscribe();
    };
    signal?.addEventListener('abort', abort);
  });
}
