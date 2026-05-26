import React from 'react';
import { Activity, Database, Layers3, Terminal } from 'lucide-react';

import type { Job as StudioJob } from '../packages/shared/src';
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
      return 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10';
    case 'failed':
    case 'cancelled':
      return 'text-rose-300 border-rose-500/20 bg-rose-500/10';
    case 'needs_review':
      return 'text-amber-200 border-amber-500/20 bg-amber-500/10';
    default:
      return 'text-accent-300 border-accent-500/20 bg-accent-500/10';
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
  const activeJobCount = studioJobs.filter(
    (job) => job.status === 'queued' || job.status === 'running' || job.status === 'needs_review',
  ).length;

  const sectionTitleClass = isDrawer
    ? 'text-[11px] font-black text-zinc-400 uppercase tracking-[0.18em]'
    : 'text-[10px] font-black text-zinc-400 uppercase tracking-widest';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Activity size={14} className="text-accent-400" />
          <h3 className={sectionTitleClass}>Session Metrics</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/5 bg-white/5 p-3">
            <span className="block text-[8px] uppercase tracking-widest text-zinc-600">Groups</span>
            <span className="text-lg font-black text-zinc-200">{visualGroupsCount}</span>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-3">
            <span className="block text-[8px] uppercase tracking-widest text-zinc-600">Images</span>
            <span className="text-lg font-black text-zinc-200">{imagesCount}</span>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-3">
            <span className="block text-[8px] uppercase tracking-widest text-zinc-600">
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
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2"
              >
                <span className="min-w-0 truncate text-[10px] font-mono text-zinc-300">
                  {workspace.name || workspace.id.slice(0, 8)}
                </span>
                <span className="text-[8px] font-black uppercase tracking-wider text-zinc-600">
                  {new Date(workspace.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-white/5 bg-black/20 px-3 py-4 text-[10px] text-zinc-600">
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
                    <span className="text-[8px] uppercase tracking-widest text-zinc-600">
                      {new Date(job.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="line-clamp-2 text-[10px] leading-relaxed text-zinc-300">
                    {job.originalPrompt}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[8px] font-bold uppercase tracking-wider text-zinc-600">
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
                        ? 'border-accent-500/30 bg-accent-500/10'
                        : 'border-white/5 bg-black/20',
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
                      ? 'border-accent-500/30 bg-accent-500/10'
                      : 'border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/5',
                  )}
                >
                  {content}
                </button>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-white/5 bg-black/20 px-3 py-4 text-[10px] text-zinc-600">
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
        <div className="custom-scrollbar max-h-110 space-y-1.5 overflow-y-auto rounded-xl border border-white/5 bg-black/30 p-3 font-mono text-[10px] leading-relaxed">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="shrink-0 select-none text-zinc-600">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                </span>
                <span className="wrap-break-word text-zinc-400">{log.message}</span>
              </div>
            ))
          ) : (
            <span className="italic text-zinc-700">No recent activity</span>
          )}
        </div>
      </div>
    </div>
  );
};
