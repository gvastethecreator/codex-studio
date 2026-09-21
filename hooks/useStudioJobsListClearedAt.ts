import { useCallback, useEffect, useState } from 'react';

import {
  readStudioJobsListClearedAt,
  subscribeStudioJobsListCleared,
  writeStudioJobsListClearedAt,
} from '../lib/studioJobsListClear';

export function useStudioJobsListClearedAt() {
  const [clearedAt, setClearedAt] = useState(readStudioJobsListClearedAt);

  useEffect(
    () => subscribeStudioJobsListCleared(() => setClearedAt(readStudioJobsListClearedAt())),
    [],
  );

  const clearListedJobs = useCallback(() => {
    writeStudioJobsListClearedAt(Date.now());
  }, []);

  return { clearedAt, clearListedJobs };
}
