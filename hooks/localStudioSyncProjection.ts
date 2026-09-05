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
  eventVersion: number;
  jobEventVersions: Record<string, number>;
}

export const INITIAL_LOCAL_STUDIO_SYNC_BACKEND_STATE: LocalStudioSyncBackendState = {
  jobs: [],
  logs: [],
  connected: false,
  eventVersion: 0,
  jobEventVersions: {},
};

export type LocalStudioSyncBackendAction =
  | {
      type: 'refresh';
      jobs: Array<StudioJob | JobSummary>;
      logs: StudioLog[];
      requestedAtVersion: number;
    }
  | { type: 'job_update'; job: StudioJob }
  | { type: 'log_added'; entry: StudioLog }
  | { type: 'connection_change'; connected: boolean }
  | { type: 'disconnect' };

export function localStudioSyncBackendReducer(
  state: LocalStudioSyncBackendState,
  action: LocalStudioSyncBackendAction,
): LocalStudioSyncBackendState {
  switch (action.type) {
    case 'refresh': {
      const jobs = new Map(
        action.jobs.map((job) => [job.id, toShellActivityJob(job, 'backend_summary')]),
      );
      for (const job of state.jobs) {
        if ((state.jobEventVersions[job.id] ?? 0) <= action.requestedAtVersion) continue;
        const snapshot = jobs.get(job.id);
        if (!snapshot || Date.parse(job.updatedAt) >= Date.parse(snapshot.updatedAt))
          jobs.set(job.id, job);
      }
      return {
        ...state,
        jobs: [...jobs.values()].sort(
          (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || b.id.localeCompare(a.id),
        ),
        jobEventVersions: Object.fromEntries(
          [...jobs.keys()].map((id) => [id, state.jobEventVersions[id] ?? 0]),
        ),
        logs: action.logs,
        connected: true,
      };
    }
    case 'job_update':
      return {
        ...state,
        eventVersion: state.eventVersion + 1,
        jobEventVersions: { ...state.jobEventVersions, [action.job.id]: state.eventVersion + 1 },
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
