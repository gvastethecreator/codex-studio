import { useEffect, useState } from 'react';
import type { WorkerStatus } from '../packages/shared/src/workerContracts';
import { getStudioHealth } from '../services/studio-api/runtime';

/** Queue-only diagnostics; no overlapping reads, and no stale capacity claims. */
export function useWorkerDiagnostics() {
  const [status, setStatus] = useState<WorkerStatus | null>(null);
  const [error, setError] = useState(false);
  // The recursive one-shot timer is cleared below and the request is aborted on cleanup.
  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refresh = async () => {
      try {
        const health = await getStudioHealth(
          AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]),
        );
        if (!controller.signal.aborted) {
          setStatus(health.worker);
          setError(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setStatus(null);
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(refresh, 3_000);
      }
    };
    void refresh();
    return () => {
      controller.abort();
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };
  }, []);
  return { status, error };
}
