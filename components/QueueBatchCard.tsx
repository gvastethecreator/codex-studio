import { useEffect, useRef, useState } from 'react';
import type { JobBatchSummary, RetryJobBatchRequest } from '../packages/shared/src';
import { getStudioJobBatchSummary, retryStudioJobBatch } from '../services/studio-api/jobs';
import { StudioApiError } from '../services/studio-api/http';

export function QueueBatchCard({ batchId, revision }: { batchId: string; revision: string }) {
  const [batch, setBatch] = useState<JobBatchSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const retryRequest = useRef<RetryJobBatchRequest | null>(null);
  const readVersion = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    const version = ++readVersion.current;
    void getStudioJobBatchSummary(batchId, controller.signal)
      .then((next) => {
        if (controller.signal.aborted || readVersion.current !== version) return;
        setBatch(next);
        setError(null);
      })
      .catch((failure) => {
        if (controller.signal.aborted || readVersion.current !== version) return;
        // Old metadata records do not establish a requested membership count.
        if (failure instanceof StudioApiError && failure.status === 404) return;
        setError(failure instanceof Error ? failure.message : 'Batch counts are unavailable.');
      });
    return () => controller.abort();
  }, [batchId, revision, refresh]);

  const retryFailed = async () => {
    if (!batch || busy) return;
    retryRequest.current ??= { requestId: crypto.randomUUID(), items: batch.retryable };
    setBusy(true);
    setRetryError(null);
    try {
      await retryStudioJobBatch(batchId, retryRequest.current);
      setRefresh((value) => value + 1);
      retryRequest.current = null;
    } catch (failure) {
      setRetryError(failure instanceof Error ? failure.message : 'Unable to retry failed items.');
    } finally {
      setBusy(false);
    }
  };
  if (!batch && !error) return null;
  return (
    <section
      aria-label={`Batch ${batchId}`}
      className="space-y-1 rounded-lg border border-[color:var(--wb-border)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] p-2 text-[11px] text-[color:var(--wb-muted)]"
    >
      <div className="flex justify-between gap-2">
        <span>Batch · {batch?.requestedCount ?? '—'} requested</span>
        <strong className="capitalize">{batch?.status.replace('_', ' ') ?? 'Unavailable'}</strong>
      </div>
      {batch ? (
        <p>
          {batch.counts.completed} of {batch.requestedCount} completed
          {Object.entries(batch.counts)
            .filter(([status, count]) => status !== 'completed' && count > 0)
            .map(
              ([status, count]) =>
                ` · ${count} ${status === 'needs_review' ? 'need review' : status}`,
            )
            .join('')}
          {error ? ' (last confirmed)' : ''}
        </p>
      ) : null}
      {error ? (
        <p role="alert">
          {error}{' '}
          <button
            type="button"
            className="underline"
            onClick={() => setRefresh((value) => value + 1)}
          >
            Refresh batch
          </button>
        </p>
      ) : null}
      {retryError ? (
        <p role="alert" className="text-rose-300">
          {retryError}
        </p>
      ) : null}
      {batch && (batch.retryable.length > 0 || retryRequest.current) ? (
        <button
          type="button"
          disabled={busy || Boolean(error)}
          onClick={() => void retryFailed()}
          className="rounded bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] px-2 py-1 disabled:opacity-50"
        >
          {busy
            ? 'Queuing retry…'
            : retryRequest.current
              ? 'Retry request'
              : `Retry failed (${batch.retryable.length})`}
        </button>
      ) : null}
    </section>
  );
}
