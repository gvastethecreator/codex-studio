import type { RepositoryUpdateStatus } from '../../packages/shared/src/repositoryUpdates';
import { request } from './http';

export function getRepositoryUpdateStatus() {
  return request<RepositoryUpdateStatus>('/api/updates', { signal: AbortSignal.timeout(5000) });
}

export function checkRepositoryUpdates() {
  return request<RepositoryUpdateStatus>('/api/updates/check', { method: 'POST', body: '{}' });
}

export function applyRepositoryUpdate(commit: string) {
  return request<RepositoryUpdateStatus>('/api/updates/apply', {
    method: 'POST',
    body: JSON.stringify({ commit }),
  });
}

export function restartStudio() {
  return request<RepositoryUpdateStatus>('/api/updates/restart', { method: 'POST', body: '{}' });
}

const RESTART_KEY = 'studio-pending-restart';
export function rememberStudioRestart(instanceId: string) {
  sessionStorage.setItem(RESTART_KEY, JSON.stringify({ instanceId, startedAt: Date.now() }));
}
export function forgetStudioRestart() {
  sessionStorage.removeItem(RESTART_KEY);
}
export function readPendingStudioRestart(): { instanceId: string; startedAt: number } | null {
  try {
    return JSON.parse(sessionStorage.getItem(RESTART_KEY) ?? 'null');
  } catch {
    forgetStudioRestart();
    return null;
  }
}
