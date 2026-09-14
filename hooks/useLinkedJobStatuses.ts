import { useEffect, useState } from 'react';
import { getStudioJobStatus } from '../services/studio-api/jobs';
import type { Job } from '../packages/shared/src';

/** Read execution truth for recipe frames; saved recipe stages are not live job status. */
export function useLinkedJobStatuses(ids: string[]) {
  const key = [...new Set(ids)].sort().join(',');
  const [snapshot, setSnapshot] = useState<{
    key: string;
    jobs: Record<string, Job['status'] | 'unavailable'>;
  }>({ key: '', jobs: {} });
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      const entries = await Promise.all(
        key
          .split(',')
          .filter(Boolean)
          .map(async (id) => {
            try {
              return [id, (await getStudioJobStatus(id)).status] as const;
            } catch {
              return [id, 'unavailable'] as const;
            }
          }),
      );
      if (cancelled) return;
      setSnapshot({ key, jobs: Object.fromEntries(entries) });
      if (
        entries.some(
          ([, status]) => status === 'queued' || status === 'running' || status === 'unavailable',
        )
      )
        timer = setTimeout(refresh, 5000);
    };
    void refresh();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key]);
  return snapshot.key === key ? snapshot.jobs : {};
}
