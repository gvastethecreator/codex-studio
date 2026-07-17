import type { CatalogRefreshScope } from '../lib/catalogOperationResult';

interface CatalogEventRefreshPolicyOptions {
  refreshCatalog: (scope: CatalogRefreshScope) => void | Promise<void>;
  debounceMs?: number;
  retryBaseDelayMs?: number;
  maxRetryAttempts?: number;
  schedule?: (callback: () => void, delayMs: number) => ReturnType<typeof setTimeout>;
  cancel?: (timer: ReturnType<typeof setTimeout>) => void;
}

export interface CatalogEventRefreshPolicy {
  request(scope?: CatalogRefreshScope): void;
  dispose(): void;
}

export function mergeCatalogRefreshScopes(
  current: CatalogRefreshScope | null,
  next: CatalogRefreshScope,
): CatalogRefreshScope {
  if (!current) return next;
  if (current.kind === 'all' || next.kind === 'all') return { kind: 'all' };
  if (current.kind !== next.kind) return { kind: 'all' };
  if (current.kind === 'workspace' && next.kind === 'workspace') {
    return current.workspaceId === next.workspaceId ? current : { kind: 'all' };
  }
  return current;
}

export function createCatalogEventRefreshPolicy({
  refreshCatalog,
  debounceMs = 25,
  retryBaseDelayMs = 300,
  maxRetryAttempts = 2,
  schedule = (callback, delayMs) => setTimeout(callback, delayMs),
  cancel = (timer) => clearTimeout(timer),
}: CatalogEventRefreshPolicyOptions): CatalogEventRefreshPolicy {
  let disposed = false;
  let pendingScope: CatalogRefreshScope | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let refreshInFlight = false;
  let consecutiveFailures = 0;

  const scheduleFlush = (delayMs = debounceMs) => {
    if (disposed || timer || refreshInFlight || !pendingScope) return;
    timer = schedule(() => {
      timer = null;
      if (disposed || !pendingScope) return;
      const scope = pendingScope;
      pendingScope = null;
      refreshInFlight = true;
      let retryDelayMs: number | null = null;
      void Promise.resolve(refreshCatalog(scope))
        .then(() => {
          consecutiveFailures = 0;
        })
        .catch(() => {
          if (disposed) return;
          if (consecutiveFailures >= maxRetryAttempts) {
            consecutiveFailures = 0;
            return;
          }

          consecutiveFailures += 1;
          pendingScope = mergeCatalogRefreshScopes(pendingScope, scope);
          retryDelayMs = retryBaseDelayMs * 2 ** (consecutiveFailures - 1);
        })
        .finally(() => {
          refreshInFlight = false;
          scheduleFlush(retryDelayMs ?? debounceMs);
        });
    }, delayMs);
  };

  return {
    request(scope = { kind: 'all' }) {
      if (disposed) return;
      pendingScope = mergeCatalogRefreshScopes(pendingScope, scope);
      scheduleFlush();
    },
    dispose() {
      disposed = true;
      pendingScope = null;
      if (timer) cancel(timer);
      timer = null;
    },
  };
}
