import type { LogEntry } from '../types';
import type { Job as StudioJob, JobSummary, SystemLog as StudioLog } from '../packages/shared/src';
import {
  countActiveShellActivityJobs,
  mergeShellActivityJobs,
  toShellActivityJob,
  type ShellActivityJob,
} from '../lib/shellActivityJob';

export interface LocalStudioSyncBackendState {
  jobs: ShellActivityJob[];
  logs: StudioLog[];
  connected: boolean;
}

export const INITIAL_LOCAL_STUDIO_SYNC_BACKEND_STATE: LocalStudioSyncBackendState = {
  jobs: [],
  logs: [],
  connected: false,
};

export type LocalStudioSyncBackendAction =
  | { type: 'refresh'; jobs: Array<StudioJob | JobSummary>; logs: StudioLog[] }
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
      return {
        jobs: action.jobs.map((job) => toShellActivityJob(job, 'backend_summary')),
        logs: action.logs,
        connected: true,
      };
    case 'job_update':
      return {
        ...state,
        jobs: mergeShellActivityJobs(state.jobs, toShellActivityJob(action.job, 'backend_event')),
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

export const countActiveServerJobs = countActiveShellActivityJobs;
