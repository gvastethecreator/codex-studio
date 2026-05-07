import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
  Trash2,
  Layers,
  ChevronRight,
  Zap,
} from 'lucide-react';
import type { QueueJob } from '../types';
import type { Job as StudioJob } from '../packages/shared/src';
import { cn } from '../lib/utils';

interface QueuePanelProps {
  jobs: QueueJob[];
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
  onClearCompleted: () => void;
  isResting: boolean;
  serverJobs?: StudioJob[];
}

export const QueuePanel: React.FC<QueuePanelProps> = ({
  jobs,
  onRetry,
  onCancel,
  onRemove,
  onClearCompleted,
  isResting,
  serverJobs = [],
}) => {
  const pendingCount = jobs.filter((j) => j.status === 'pending').length;
  const processingCount = jobs.filter((j) => j.status === 'processing').length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;
  const failedCount = jobs.filter((j) => j.status === 'failed' || j.status === 'cancelled').length;

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl border-l border-white/10 w-80">
      {/* Header */}
      <div className="p-4 border-bottom border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent-500/20 text-accent-400">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/90">Generation Queue</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
              {jobs.length} total jobs • 3 max concurrent
            </p>
          </div>
        </div>
        {(completedCount > 0 || jobs.some((j) => j.status === 'cancelled')) && (
          <button
            onClick={onClearCompleted}
            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white/80 transition-colors"
            title="Clear completed"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-px bg-white/10 border-b border-white/10">
        <StatItem label="Wait" value={pendingCount} color="text-white/40" />
        <StatItem label="Active" value={processingCount} color="text-accent-400" />
        <StatItem label="Done" value={completedCount} color="text-emerald-400" />
        <StatItem label="Fail/X" value={failedCount} color="text-rose-400" />
      </div>

      {/* Resting Indicator */}
      <AnimatePresence>
        {isResting && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-accent-500/10 border-b border-accent-500/20 px-4 py-2 flex items-center gap-2 overflow-hidden"
          >
            <Zap size={12} className="text-accent-400 animate-pulse" />
            <span className="text-[10px] font-medium text-accent-400 uppercase tracking-widest">
              Cooling down (1s)
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {serverJobs.length > 0 && (
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] p-2">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/35">
                Persistent Backend
              </span>
              <span className="text-[9px] font-bold text-accent-400">{serverJobs.length}</span>
            </div>
            <div className="space-y-2">
              {serverJobs.slice(0, 10).map((job) => (
                <ServerJobItem key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}
        <AnimatePresence initial={false}>
          {jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20"
            >
              <Layers size={48} className="mb-4" />
              <p className="text-sm font-medium">Queue is empty</p>
              <p className="text-xs">Jobs will appear here</p>
            </motion.div>
          ) : (
            [...jobs]
              .reverse()
              .map((job) => (
                <JobItem
                  key={job.id}
                  job={job}
                  onRetry={() => onRetry(job.id)}
                  onCancel={() => onCancel(job.id)}
                  onRemove={() => onRemove(job.id)}
                />
              ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ServerJobItem: React.FC<{ job: StudioJob }> = ({ job }) => {
  const isActive =
    job.status === 'queued' || job.status === 'running' || job.status === 'needs_review';
  const statusColor =
    job.status === 'completed'
      ? 'text-emerald-400'
      : job.status === 'failed' || job.status === 'cancelled'
        ? 'text-rose-400'
        : 'text-accent-400';

  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-2">
      <div className="flex items-start gap-2">
        {isActive ? (
          <Loader2 size={13} className="mt-0.5 shrink-0 animate-spin text-accent-400" />
        ) : job.status === 'completed' ? (
          <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-400" />
        ) : (
          <XCircle size={13} className="mt-0.5 shrink-0 text-rose-400" />
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[10px] leading-relaxed text-white/65">
            {job.originalPrompt}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn('text-[9px] font-black uppercase tracking-wider', statusColor)}>
              {job.status}
            </span>
            <span className="text-[9px] text-white/25">{job.kind}</span>
          </div>
          {job.error && (
            <p className="mt-1 rounded border border-rose-500/10 bg-rose-500/5 p-1 text-[9px] text-rose-300/80">
              {job.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="bg-black/20 p-2 flex flex-col items-center justify-center">
    <span className={cn('text-xs font-bold', color)}>{value}</span>
    <span className="text-[8px] uppercase tracking-tighter text-white/30 font-bold">{label}</span>
  </div>
);

const JobItem: React.FC<{
  job: QueueJob;
  onRetry: () => void;
  onCancel: () => void;
  onRemove: () => void;
}> = ({ job, onRetry, onCancel, onRemove }) => {
  const statusConfig: Record<
    string,
    { icon: any; color: string; bg: string; border: string; spin?: boolean }
  > = {
    pending: { icon: Clock, color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/5' },
    processing: {
      icon: Loader2,
      color: 'text-accent-400',
      bg: 'bg-accent-500/10',
      border: 'border-accent-500/20',
      spin: true,
    },
    completed: {
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    failed: {
      icon: XCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
    },
    cancelled: {
      icon: XCircle,
      color: 'text-white/20',
      bg: 'bg-white/5',
      border: 'border-white/5',
    },
  };

  const config = statusConfig[job.status];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'group relative p-3 rounded-xl border transition-all duration-300',
        config.bg,
        config.border,
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', config.color)}>
          <Icon size={16} className={cn(config.spin && 'animate-spin')} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white/80 line-clamp-2 leading-relaxed mb-1">
            {job.prompt}
          </p>

          <div className="flex items-center gap-2">
            <span className={cn('text-[10px] uppercase tracking-wider font-bold', config.color)}>
              {job.status}
            </span>
            <span className="text-[10px] text-white/20">
              {new Date(job.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {job.error && (
            <p className="mt-2 text-[10px] text-rose-400/80 leading-tight bg-rose-500/5 p-1.5 rounded border border-rose-500/10">
              {job.error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {(job.status === 'processing' || job.status === 'pending') && (
            <button
              onClick={onCancel}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-rose-400 transition-colors"
              title="Cancel"
            >
              <XCircle size={14} />
            </button>
          )}
          {(job.status === 'failed' || job.status === 'cancelled') && (
            <button
              onClick={onRetry}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-accent-400 transition-colors"
              title="Retry"
            >
              <RotateCcw size={14} />
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-rose-400 transition-colors"
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
