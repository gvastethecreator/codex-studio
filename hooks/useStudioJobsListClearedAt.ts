import { useCallback, useEffect, useState } from 'react';

import {
  readStudioJobsAttentionClearedAt,
  readStudioJobsListClearedAt,
  subscribeStudioJobsListCleared,
  writeStudioJobsAttentionClearedAt,
  writeStudioJobsListClearedAt,
} from '../lib/studioJobsListClear';

export function useStudioJobsListClearedAt() {
  const [clearedAt, setClearedAt] = useState(readStudioJobsListClearedAt);
  const [attentionClearedAt, setAttentionClearedAt] = useState(readStudioJobsAttentionClearedAt);

  useEffect(
    () =>
      subscribeStudioJobsListCleared(() => {
        setClearedAt(readStudioJobsListClearedAt());
        setAttentionClearedAt(readStudioJobsAttentionClearedAt());
      }),
    [],
  );

  const clearListedJobs = useCallback(() => {
    writeStudioJobsListClearedAt(Date.now());
  }, []);

  const clearAttentionJobs = useCallback(() => {
    writeStudioJobsAttentionClearedAt(Date.now());
  }, []);

  const showAttentionJobs = useCallback(() => {
    writeStudioJobsAttentionClearedAt(0);
  }, []);

  return { clearedAt, clearListedJobs, attentionClearedAt, clearAttentionJobs, showAttentionJobs };
}
