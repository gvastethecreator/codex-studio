import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BrainCircuit,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
  Trash2,
  Layers,
  ChevronRight,
  Zap,
} from "lucide-react";
import type { QueueJob } from "../types";
import type { Job as StudioJob } from "../packages/shared/src";
import { cn } from "../lib/utils";

interface QueuePanelProps {
  jobs: QueueJob[];
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
  onClearCompleted: () => void;
  isResting: boolean;
  serverJobs?: StudioJob[];
  selectedJobId?: string | null;
  onInspectJob: (jobId: string) => void;
  onCancelServerJob: (jobId: string) => void;
  onClose: () => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = React.memo(
  ({
    jobs,
    onRetry,
    onCancel,
    onRemove,
    onClearCompleted,
    isResting,
    serverJobs = [],
    selectedJobId,
    onInspectJob,
    onCancelServerJob,
    onClose,
  }) => {
    const [isLocalQueueOpen, setIsLocalQueueOpen] = useState(true);
    const [isServerQueueOpen, setIsServerQueueOpen] = useState(true);
    const pendingCount = jobs.filter((j) => j.status === "pending").length;
    const processingCount = jobs.filter((j) => j.status === "processing").length;
    const completedCount = jobs.filter((j) => j.status === "completed").length;
    const failedCount = jobs.filter(
      (j) => j.status === "failed" || j.status === "cancelled",
    ).length;
    const totalJobs = jobs.length + serverJobs.length;

    return (
      <div className="flex h-full w-80 flex-col border-l border-white/10 bg-black/40 backdrop-blur-xl">
        {/* Header */}
        <div className="border-bottom flex items-center justify-between border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-accent-500/20 p-1.5 text-accent-400">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/90">Generation Queue</h3>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                {totalJobs} visible jobs • 3 local concurrent
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {(completedCount > 0 || jobs.some((j) => j.status === "cancelled")) && (
              <button
                onClick={onClearCompleted}
                className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
                title="Clear completed"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
              title="Collapse queue"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-px border-b border-white/10 bg-white/10">
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
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-2 overflow-hidden border-b border-accent-500/20 bg-accent-500/10 px-4 py-2"
            >
              <Zap size={12} className="animate-pulse text-accent-400" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-accent-400">
                Cooling down (1s)
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job List */}
        <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
            <button
              onClick={() => setIsServerQueueOpen((value) => !value)}
              className="mb-2 flex w-full items-center justify-between rounded-lg px-1 py-1 text-left transition-colors hover:bg-white/5"
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-white/35">
                Backend Session Jobs
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-accent-400">{serverJobs.length}</span>
                <ChevronRight
                  size={14}
                  className={cn('text-zinc-500 transition-transform', isServerQueueOpen && 'rotate-90')}
                />
              </div>
            </button>
            <AnimatePresence initial={false}>
              {isServerQueueOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    {serverJobs.length > 0 ? (
                      serverJobs.slice(0, 20).map((job) => (
                        <ServerJobItem
                          key={job.id}
                          job={job}
                          isSelected={selectedJobId === job.id}
                          onInspect={() => onInspectJob(job.id)}
                          onCancel={() => onCancelServerJob(job.id)}
                        />
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-white/5 bg-black/20 px-3 py-3 text-[10px] text-zinc-600">
                        No persistent backend jobs yet.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
            <button
              onClick={() => setIsLocalQueueOpen((value) => !value)}
              className="mb-2 flex w-full items-center justify-between rounded-lg px-1 py-1 text-left transition-colors hover:bg-white/5"
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-white/35">
                Browser Queue
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-accent-400">{jobs.length}</span>
                <ChevronRight
                  size={14}
                  className={cn('text-zinc-500 transition-transform', isLocalQueueOpen && 'rotate-90')}
                />
              </div>
            </button>
            <AnimatePresence initial={false}>
              {isLocalQueueOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {jobs.length === 0 && serverJobs.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex h-full flex-col items-center justify-center p-8 text-center opacity-20"
                        >
                          <Layers size={48} className="mb-4" />
                          <p className="text-sm font-medium">Queue is empty</p>
                          <p className="text-xs">Jobs will appear here</p>
                        </motion.div>
                      ) : jobs.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-white/5 bg-black/20 px-3 py-3 text-[10px] text-zinc-600">
                          No browser-side queued items.
                        </div>
                      ) : (
                        [...jobs].reverse().map((job) => (
                          <JobItem
                            key={job.id}
                            job={job}
                            isSelected={selectedJobId === job.serverJobId}
                            onInspect={job.serverJobId ? () => onInspectJob(job.serverJobId!) : undefined}
                            onRetry={() => onRetry(job.id)}
                            onCancel={() => onCancel(job.id)}
                            onRemove={() => onRemove(job.id)}
                          />
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  },
);

const ServerJobItem: React.FC<{
  job: StudioJob;
  isSelected: boolean;
  onInspect: () => void;
  onCancel: () => void;
}> = ({ job, isSelected, onInspect, onCancel }) => {
  const isActive =
    job.status === "queued" || job.status === "running";
  const statusColor =
    job.status === "completed"
      ? "text-emerald-400"
      : job.status === "failed" || job.status === "cancelled"
        ? "text-rose-400"
        : "text-accent-400";

  return (
    <button
      onClick={onInspect}
      className={cn(
        'w-full rounded-lg border p-2 text-left transition-colors',
        isSelected
          ? 'border-accent-500/30 bg-accent-500/10'
          : 'border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/5',
      )}
    >
      <div className="flex items-start gap-2">
        {isActive ? (
          <Loader2 size={13} className="mt-0.5 shrink-0 animate-spin text-accent-400" />
        ) : job.status === "completed" ? (
          <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-400" />
        ) : (
          <XCircle size={13} className="mt-0.5 shrink-0 text-rose-400" />
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[10px] leading-relaxed text-white/65">
            {job.originalPrompt}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn("text-[9px] font-black uppercase tracking-wider", statusColor)}>
              {job.status}
            </span>
            <span className="text-[9px] text-white/25">{job.kind}</span>
            {job.execution?.model ? <span className="text-[9px] text-zinc-500">{job.execution.model}</span> : null}
          </div>
          {job.error && (
            <p className="mt-1 rounded border border-rose-500/10 bg-rose-500/5 p-1 text-[9px] text-rose-300/80">
              {job.error}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <BrainCircuit size={13} className="text-zinc-500" />
          {isActive ? (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onCancel();
              }}
              className="rounded-lg p-1.5 text-white/35 transition-colors hover:bg-white/10 hover:text-rose-400"
              title="Cancel backend job"
            >
              <XCircle size={13} />
            </button>
          ) : null}
        </div>
      </div>
    </button>
  );
};

const StatItem = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="bg-black/20 p-2 flex flex-col items-center justify-center">
    <span className={cn("text-xs font-bold", color)}>{value}</span>
    <span className="text-[8px] uppercase tracking-tighter text-white/30 font-bold">{label}</span>
  </div>
);

const JobItem: React.FC<{
  job: QueueJob;
  isSelected: boolean;
  onInspect?: () => void;
  onRetry: () => void;
  onCancel: () => void;
  onRemove: () => void;
}> = ({ job, isSelected, onInspect, onRetry, onCancel, onRemove }) => {
  const statusConfig: Record<
    string,
    { icon: any; color: string; bg: string; border: string; spin?: boolean }
  > = {
    pending: { icon: Clock, color: "text-white/40", bg: "bg-white/5", border: "border-white/5" },
    processing: {
      icon: Loader2,
      color: "text-accent-400",
      bg: "bg-accent-500/10",
      border: "border-accent-500/20",
      spin: true,
    },
    completed: {
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    failed: {
      icon: XCircle,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    cancelled: {
      icon: XCircle,
      color: "text-white/20",
      bg: "bg-white/5",
      border: "border-white/5",
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
        "group relative rounded-xl border p-3 transition-all duration-300",
        config.bg,
        isSelected ? 'border-accent-500/30 ring-1 ring-accent-500/20' : config.border,
        onInspect && 'cursor-pointer hover:border-white/15',
      )}
      onClick={onInspect}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5", config.color)}>
          <Icon size={16} className={cn(config.spin && "animate-spin")} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white/80 line-clamp-2 leading-relaxed mb-1">
            {job.prompt}
          </p>

          <div className="flex items-center gap-2">
            <span className={cn("text-[10px] uppercase tracking-wider font-bold", config.color)}>
              {job.status}
            </span>
            <span className="text-[10px] text-white/20">
              {new Date(job.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {job.serverJobId ? <span className="text-[10px] text-accent-400">#{job.serverJobId.slice(0, 8)}</span> : null}
          </div>

          {job.error && (
            <p className="mt-2 text-[10px] text-rose-400/80 leading-tight bg-rose-500/5 p-1.5 rounded border border-rose-500/10">
              {job.error}
            </p>
          )}

          {job.serverJobId ? (
            <div className="mt-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
              <BrainCircuit size={11} className="text-accent-400" />
              Click to inspect backend transcript
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {(job.status === "processing" || job.status === "pending") && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onCancel();
              }}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-rose-400 transition-colors"
              title="Cancel"
            >
              <XCircle size={14} />
            </button>
          )}
          {(job.status === "failed" || job.status === "cancelled") && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onRetry();
              }}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-accent-400 transition-colors"
              title="Retry"
            >
              <RotateCcw size={14} />
            </button>
          )}
          <button
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
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
