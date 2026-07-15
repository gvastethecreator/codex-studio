import type { CatalogRefreshScope } from '../lib/catalogOperationResult';
import { mergeCatalogRefreshScopes } from './catalogEventRefreshPolicy';

interface CatalogMutationReconciliationPolicyOptions {
  reconcile: (scope: CatalogRefreshScope) => void | Promise<void>;
  fallbackDelayMs?: number;
  retryBaseDelayMs?: number;
  maxRetryAttempts?: number;
  schedule?: (callback: () => void, delayMs: number) => ReturnType<typeof setTimeout>;
  cancel?: (timer: ReturnType<typeof setTimeout>) => void;
}

export interface CatalogMutationReconciliationPolicy {
  request(scope?: CatalogRefreshScope): void;
  getGeneration(): number;
  acknowledge(scope?: CatalogRefreshScope, generation?: number): void;
  dispose(): void;
}

export function createCatalogMutationReconciliationPolicy({
  reconcile,
  fallbackDelayMs = 500,
  retryBaseDelayMs = 300,
  maxRetryAttempts = 2,
  schedule = (callback, delayMs) => setTimeout(callback, delayMs),
  cancel = (timer) => clearTimeout(timer),
}: CatalogMutationReconciliationPolicyOptions): CatalogMutationReconciliationPolicy {
  let disposed = false;
  let pendingScope: CatalogRefreshScope | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let retryAttempts = 0;
  let generation = 0;

  const scheduleFlush = (delayMs: number) => {
    if (disposed || timer || !pendingScope) return;
    timer = schedule(() => {
      timer = null;
      if (disposed || !pendingScope) return;
      const scope = pendingScope;
      const requestGeneration = generation;
      pendingScope = null;
      void Promise.resolve(reconcile(scope))
        .then(() => {
          retryAttempts = 0;
        })
        .catch(() => {
          if (disposed || requestGeneration !== generation) return;
          if (retryAttempts >= maxRetryAttempts) {
            retryAttempts = 0;
            return;
          }
          retryAttempts += 1;
          pendingScope = mergeCatalogRefreshScopes(pendingScope, scope);
          scheduleFlush(retryBaseDelayMs * 2 ** (retryAttempts - 1));
        });
    }, delayMs);
  };

  return {
    request(scope = { kind: 'all' }) {
      if (disposed) return;
      generation += 1;
      pendingScope = mergeCatalogRefreshScopes(pendingScope, scope);
      scheduleFlush(fallbackDelayMs);
    },
    getGeneration() {
      return generation;
    },
    acknowledge(scope = { kind: 'all' }, acknowledgedGeneration = generation) {
      if (disposed || acknowledgedGeneration !== generation) return;
      if (pendingScope?.kind === 'all' && scope.kind !== 'all') return;
      generation += 1;
      pendingScope = null;
      retryAttempts = 0;
      if (timer) cancel(timer);
      timer = null;
    },
    dispose() {
      disposed = true;
      generation += 1;
      pendingScope = null;
      if (timer) cancel(timer);
      timer = null;
    },
  };
}
