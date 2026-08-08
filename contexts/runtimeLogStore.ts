import type { LogEntry } from '../types';
import { addLogEntry } from '../utils/logger';
import { get, set } from '../utils/idb';
import { runtimeLogger } from '../utils/runtimeLogger';

const MAX_LOGS = 500;
const PERSIST_KEY = 'session-logs';
const PERSIST_DEBOUNCE_MS = 300;

let logs: LogEntry[] = [];
const listeners = new Set<() => void>();
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let hydrateStarted = false;

function emit() {
  for (const listener of listeners) listener();
}

function schedulePersist() {
  if (typeof window === 'undefined') return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    const snapshot = logs;
    set(PERSIST_KEY, snapshot).catch((error) => {
      runtimeLogger.error('Error persisting runtime logs', error);
    });
  }, PERSIST_DEBOUNCE_MS);
}

export function getRuntimeLogsSnapshot(): LogEntry[] {
  return logs;
}

export function subscribeRuntimeLogs(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function appendRuntimeLog(message: string): LogEntry {
  const entry = addLogEntry(message);
  logs = [entry, ...logs].slice(0, MAX_LOGS);
  emit();
  schedulePersist();
  return entry;
}

export function replaceRuntimeLogs(next: LogEntry[]) {
  logs = next.slice(0, MAX_LOGS);
  emit();
  schedulePersist();
}

export function clearRuntimeLogs() {
  logs = [];
  emit();
  schedulePersist();
}

/**
 * Load session logs once from IndexedDB into the external store.
 * Does not subscribe React; safe to call from a provider mount effect.
 */
export function hydrateRuntimeLogsFromIdb(): () => void {
  if (hydrateStarted || typeof window === 'undefined') {
    return () => undefined;
  }
  hydrateStarted = true;
  let cancelled = false;
  void get<LogEntry[]>(PERSIST_KEY)
    .then((stored) => {
      if (cancelled || !stored || !Array.isArray(stored)) return;
      // Avoid re-persist loop noise: replace without forcing extra write if same ref path.
      logs = stored.slice(0, MAX_LOGS);
      emit();
    })
    .catch((error) => {
      runtimeLogger.error('Error hydrating runtime logs', error);
    });
  return () => {
    cancelled = true;
  };
}

/** Test-only: reset store + hydrate gate without touching IndexedDB. */
export function resetRuntimeLogStoreForTests() {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  logs = [];
  listeners.clear();
  hydrateStarted = true; // skip IDB hydrate during isolation tests
  emit();
}
