import { summarizePersistentJobs } from '../lib/persistentJobSummary';
import React from 'react';
import {
  IconActivity as Activity,
  IconDatabase as Database,
  IconStack3 as Layers3,
  IconTerminal as Terminal,
} from '@tabler/icons-react';

import type { ShellActivityJob as StudioJob } from '../lib/shellActivityJob';
import type { LogEntry, Workspace } from '../types';
import { cn } from '../lib/utils';

interface SessionOverviewProps {
  workspaces: Workspace[];
  logs: LogEntry[];
  studioJobs: StudioJob[];
  visualGroupsCount: number;
  imagesCount: number;
  selectedJobId?: string | null;
  onInspectJob?: (jobId: string) => void;
  variant?: 'sidebar' | 'drawer';
}

function getJobTone(job: StudioJob) {
  switch (job.status) {
    case 'completed':
      return 'text-emerald-300 border-emerald-500/2 bg-emerald-500/10';
    case 'cancelled':
      return 'text-[color:var(--wb-ink)] border-[color:var(--wb-border)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)]';
    case 'failed':
      return 'text-rose-300 border-rose-500/2 bg-rose-500/10';
    case 'needs_review':
      return 'text-amber-200 border-amber-500/2 bg-amber-500/10';
    default:
      return 'text-accent-300 border-accent-500/2 bg-accent-500/10';
  }
}

export const SessionOverview: React.FC<SessionOverviewProps> = ({
  workspaces,
  logs,
  studioJobs,
  visualGroupsCount,
  imagesCount,
  selectedJobId,
  onInspectJob,
  variant = 'sidebar',
}) => {
  const isDrawer = variant === 'drawer';
  const recentJobs = studioJobs.slice(0, isDrawer ? 10 : 6);
  const recentLogs = logs.slice(0, isDrawer ? 80 : 30);
  const jobSummary = summarizePersistentJobs(studioJobs);
  const activeJobCount = jobSummary.queued + jobSummary.running;

  const sectionTitleClass = isDrawer
    ? 'text-[11px] font-black text-[color:var(--wb-muted)] uppercase tracking-[0.18em]'
    : 'text-[10px] font-black text-[color:var(--wb-muted)] uppercase tracking-widest';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Activity size={14} className="text-accent-400" />
          <h3 className={sectionTitleClass}>Session Metrics</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] p-3">
            <span className="block text-[8px] uppercase tracking-widest text-[color:var(--wb-dim)]">Groups</span>
            <span className="text-lg font-black text-[color:var(--wb-ink)]">{visualGroupsCount}</span>
          </div>
          <div className="rounded-xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] p-3">
            <span className="block text-[8px] uppercase tracking-widest text-[color:var(--wb-dim)]">Images</span>
            <span className="text-lg font-black text-[color:var(--wb-ink)]">{imagesCount}</span>
          </div>
          <div className="rounded-xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] p-3">
            <span className="block text-[8px] uppercase tracking-widest text-[color:var(--wb-dim)]">
              Active Jobs
            </span>
            <span className="text-lg font-black text-accent-300">{activeJobCount}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Database size={14} className="text-accent-400" />
          <h3 className={sectionTitleClass}>Workspaces</h3>
        </div>
        <div className="space-y-2">
          {workspaces.length > 0 ? (
            workspaces.slice(0, isDrawer ? 12 : 8).map((workspace) => (
              <div
                key={workspace.id}
                className="flex items-center justify-between rounded-xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-3 py-2"
              >
                <span className="min-w-0 truncate text-[10px] font-mono text-[color:var(--wb-ink)]">
                  {workspace.name || workspace.id.slice(0, 8)}
                </span>
                <span className="text-[8px] font-black uppercase tracking-wider text-[color:var(--wb-dim)]">
                  {new Date(workspace.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 py-4 text-[10px] text-[color:var(--wb-dim)]">
              No workspaces yet.
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Layers3 size={14} className="text-accent-400" />
          <h3 className={sectionTitleClass}>Recent Jobs</h3>
        </div>
        <div className="space-y-2">
          {recentJobs.length > 0 ? (
            recentJobs.map((job) => {
              const tone = getJobTone(job);
              const isSelected = selectedJobId === job.id;
              const content = (
                <>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider',
                        tone,
                      )}
                    >
                      {job.status}
                    </span>
                    <span className="text-[8px] uppercase tracking-widest text-[color:var(--wb-dim)]">
                      {new Date(job.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="line-clamp-2 text-[10px] leading-relaxed text-[color:var(--wb-ink)]">
                    {job.originalPrompt}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[8px] font-bold uppercase tracking-wider text-[color:var(--wb-dim)]">
                    <span>{job.kind.replace('_', ' ')}</span>
                    {job.execution?.model ? <span>{job.execution.model}</span> : null}
                  </div>
                </>
              );

              if (!onInspectJob) {
                return (
                  <div
                    key={job.id}
                    className={cn(
                      'rounded-xl border px-3 py-2.5',
                      isSelected
                        ? 'border-accent-500/2 bg-accent-500/10'
                        : 'border-[color:var(--wb-line)] bg-[color:var(--wb-well)]',
                    )}
                  >
                    {content}
                  </div>
                );
              }

              return (
                <button
                  type="button"
                  key={job.id}
                  onClick={() => onInspectJob(job.id)}
                  className={cn(
                    'w-full rounded-xl border px-3 py-2.5 text-left transition-colors',
                    isSelected
                      ? 'border-accent-500/2 bg-accent-500/10'
                      : 'border-[color:var(--wb-line)] bg-[color:var(--wb-well)] hover:border-[color:var(--wb-border)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)]',
                  )}
                >
                  {content}
                </button>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 py-4 text-[10px] text-[color:var(--wb-dim)]">
              No backend jobs yet.
            </div>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <div className="mb-3 flex items-center gap-2">
          <Terminal size={14} className="text-accent-400" />
          <h3 className={sectionTitleClass}>Recent Activity</h3>
        </div>
        <div className="custom-scrollbar max-h-110 space-y-1.5 overflow-y-auto rounded-xl border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3 font-mono text-[10px] leading-relaxed">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="shrink-0 select-none text-[color:var(--wb-dim)]">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                </span>
                <span className="wrap-break-word text-[color:var(--wb-muted)]">{log.message}</span>
              </div>
            ))
          ) : (
            <span className="italic text-[color:var(--wb-dim)]">No recent activity</span>
          )}
        </div>
      </div>
    </div>
  );
};
