import type { LogEntry } from '../types';
import type { Job as StudioJob, SystemLog as StudioLog } from '../packages/shared/src';

export interface LocalStudioSyncBackendState {
  jobs: StudioJob[];
  logs: StudioLog[];
  connected: boolean;
}

export const INITIAL_LOCAL_STUDIO_SYNC_BACKEND_STATE: LocalStudioSyncBackendState = {
  jobs: [],
  logs: [],
  connected: false,
};

export type LocalStudioSyncBackendAction =
  | { type: 'refresh'; jobs: StudioJob[]; logs: StudioLog[] }
  | { type: 'job_update'; job: StudioJob }
  | { type: 'log_added'; entry: StudioLog }
  | { type: 'connection_change'; connected: boolean }
  | { type: 'disconnect' };

export function localStudioSyncBackendReducer(
  state: LocalStudioSyncBackendState,
  action: LocalStudioSyncBackendAction,
): LocalStudioSyncBackendState {
  switch (action.type) {
    case 'refresh':
      return { jobs: action.jobs, logs: action.logs, connected: true };
    case 'job_update':
      return {
        ...state,
        jobs: [
          action.job,
          ...state.jobs.filter((candidate) => candidate.id !== action.job.id),
        ].slice(0, 100),
      };
    case 'log_added':
      return {
        ...state,
        logs: [
          action.entry,
          ...state.logs.filter((candidate) => candidate.id !== action.entry.id),
        ].slice(0, 300),
      };
    case 'connection_change':
      return { ...state, connected: action.connected };
    case 'disconnect':
      return { ...state, connected: false };
  }
}

function mapStudioLogToUi(entry: StudioLog): LogEntry {
  return {
    id: `studio-log-${entry.id}`,
    timestamp: Date.parse(entry.createdAt) || Date.now(),
    message: `[${entry.scope}${entry.jobId ? `:${entry.jobId.slice(0, 8)}` : ''}] ${entry.message}`,
  };
}

export function buildMergedStudioLogs(studioLogs: StudioLog[], logs: LogEntry[]) {
  return [...studioLogs.map(mapStudioLogToUi), ...logs]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 100);
}

export function countActiveServerJobs(jobs: StudioJob[]) {
  return jobs.filter(
    (job) => job.status === 'queued' || job.status === 'running' || job.status === 'needs_review',
  ).length;
}
