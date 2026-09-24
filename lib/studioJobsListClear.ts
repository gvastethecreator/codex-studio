export const STUDIO_JOBS_LIST_CLEARED_AT_KEY = 'studio-jobs-history-cleared-at';
export const STUDIO_JOBS_ATTENTION_CLEARED_AT_KEY = 'studio-jobs-attention-cleared-at';
const STUDIO_JOBS_LIST_CLEARED_EVENT = 'studio-jobs-list-cleared';

export function readStudioJobsListClearedAt(): number {
  if (typeof window === 'undefined') return 0;
  const stored = Number(window.localStorage.getItem(STUDIO_JOBS_LIST_CLEARED_AT_KEY) ?? 0);
  return Number.isFinite(stored) ? stored : 0;
}

export function writeStudioJobsListClearedAt(at: number): void {
  window.localStorage.setItem(STUDIO_JOBS_LIST_CLEARED_AT_KEY, String(at));
  window.dispatchEvent(new Event(STUDIO_JOBS_LIST_CLEARED_EVENT));
}

export function readStudioJobsAttentionClearedAt(): number {
  if (typeof window === 'undefined') return 0;
  const stored = Number(window.localStorage.getItem(STUDIO_JOBS_ATTENTION_CLEARED_AT_KEY) ?? 0);
  return Number.isFinite(stored) ? stored : 0;
}

export function writeStudioJobsAttentionClearedAt(at: number): void {
  window.localStorage.setItem(STUDIO_JOBS_ATTENTION_CLEARED_AT_KEY, String(at));
  window.dispatchEvent(new Event(STUDIO_JOBS_LIST_CLEARED_EVENT));
}

export function isStudioJobVisibleAfterListClear(createdAt: string, clearedAt: number): boolean {
  if (clearedAt <= 0) return true;
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) return true;
  return created > clearedAt;
}

export function isStudioJobVisibleAfterAttentionClear(
  status: string,
  updatedAt: string,
  clearedAt: number,
): boolean {
  if (status !== 'failed' && status !== 'needs_review') return true;
  return isStudioJobVisibleAfterListClear(updatedAt, clearedAt);
}

export function subscribeStudioJobsListCleared(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(STUDIO_JOBS_LIST_CLEARED_EVENT, listener);
  return () => window.removeEventListener(STUDIO_JOBS_LIST_CLEARED_EVENT, listener);
}
