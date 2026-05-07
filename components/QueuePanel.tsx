import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
    AlertTriangle,
    BrainCircuit,
    CheckCircle2,
    ChevronRight,
    Clock,
    Layers,
    Loader2,
    RotateCcw,
    Trash2,
    XCircle,
    Zap,
} from "lucide-react";

import { cn } from "../lib/utils";
import type { Job as StudioJob } from "../packages/shared/src";
import type { QueueJob } from "../types";

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

const localStatusConfig: Record<
    QueueJob["status"],
    {
        icon: React.ComponentType<{ size?: number; className?: string }>;
        color: string;
        bg: string;
        border: string;
        spin?: boolean;
    }
> = {
    pending: {
        icon: Clock,
        color: "text-white/50",
        bg: "bg-black/20",
        border: "border-white/10",
    },
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
        icon: AlertTriangle,
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
    },
    cancelled: {
        icon: XCircle,
        color: "text-rose-300",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
    },
};

function getServerStatusColor(status: StudioJob["status"]) {
    switch (status) {
        case "completed":
            return "text-emerald-400";
        case "failed":
        case "cancelled":
            return "text-rose-400";
        case "needs_review":
            return "text-amber-300";
        default:
            return "text-accent-400";
    }
}

const StatItem = ({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) => (
    <div className="flex flex-col items-center justify-center bg-black/20 p-2">
        <span className={cn("text-xs font-bold", color)}>{value}</span>
        <span className="text-[8px] font-bold uppercase tracking-tighter text-white/30">{label}</span>
    </div>
);

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

        const pendingCount = jobs.filter((job) => job.status === "pending").length;
        const processingCount = jobs.filter((job) => job.status === "processing").length;
        const completedCount = jobs.filter((job) => job.status === "completed").length;
        const failedCount = jobs.filter(
            (job) => job.status === "failed" || job.status === "cancelled",
        ).length;
        const totalJobs = jobs.length + serverJobs.length;

        return (
            <div className="flex h-full w-80 flex-col border-l border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4">
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
                        {(completedCount > 0 || jobs.some((job) => job.status === "cancelled")) && (
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

                <div className="grid grid-cols-4 gap-px border-b border-white/10 bg-white/10">
                    <StatItem label="Wait" value={pendingCount} color="text-white/40" />
                    <StatItem label="Active" value={processingCount} color="text-accent-400" />
                    <StatItem label="Done" value={completedCount} color="text-emerald-400" />
                    <StatItem label="Fail/X" value={failedCount} color="text-rose-400" />
                </div>

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

                <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
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
                                    className={cn(
                                        "text-zinc-500 transition-transform",
                                        isServerQueueOpen && "rotate-90",
                                    )}
                                />
                            </div>
                        </button>

                        <AnimatePresence initial={false}>
                            {isServerQueueOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
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

                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
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
                                    className={cn(
                                        "text-zinc-500 transition-transform",
                                        isLocalQueueOpen && "rotate-90",
                                    )}
                                />
                            </div>
                        </button>

                        <AnimatePresence initial={false}>
                            {isLocalQueueOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
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
                                                        onInspect={
                                                            job.serverJobId
                                                                ? () => onInspectJob(job.serverJobId as string)
                                                                : undefined
                                                        }
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
    const canCancel = job.status === "queued" || job.status === "running";
    const statusColor = getServerStatusColor(job.status);

    const icon = canCancel ? (
        <Loader2 size={13} className="mt-0.5 shrink-0 animate-spin text-accent-400" />
    ) : job.status === "completed" ? (
        <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-400" />
    ) : job.status === "failed" || job.status === "cancelled" ? (
        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-rose-400" />
    ) : (
        <Clock size={13} className="mt-0.5 shrink-0 text-white/30" />
    );

    return (
        <div
            className={cn(
                "flex items-start gap-2 rounded-lg border p-2 transition-colors",
                isSelected
                    ? "border-accent-500/30 bg-accent-500/10"
                    : "border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/5",
            )}
        >
            <button onClick={onInspect} className="flex min-w-0 flex-1 items-start gap-2 text-left">
                {icon}

                <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium text-white/90">{job.originalPrompt}</p>
                    <div className="mt-1 flex items-center gap-2">
                        <span className={cn("text-[9px] font-black uppercase tracking-wider", statusColor)}>
                            {job.status}
                        </span>
                        <span className="text-[9px] text-white/25">{job.kind}</span>
                        {job.execution?.model ? (
                            <span className="text-[9px] text-zinc-500">{job.execution.model}</span>
                        ) : null}
                    </div>
                    {job.error && (
                        <p className="mt-1 rounded border border-rose-500/10 bg-rose-500/5 p-1 text-[9px] text-rose-300/80">
                            {job.error}
                        </p>
                    )}
                </div>
            </button>

            <div className="flex shrink-0 flex-col items-end gap-1">
                <BrainCircuit size={13} className="text-zinc-500" />
                {canCancel ? (
                    <button
                        onClick={onCancel}
                        className="rounded-lg p-1.5 text-white/35 transition-colors hover:bg-white/10 hover:text-rose-400"
                        title="Cancel backend job"
                    >
                        <XCircle size={13} />
                    </button>
                ) : null}
            </div>
        </div>
    );
};

const JobItem: React.FC<{
    job: QueueJob;
    isSelected: boolean;
    onInspect?: () => void;
    onRetry: () => void;
    onCancel: () => void;
    onRemove: () => void;
}> = ({ job, isSelected, onInspect, onRetry, onCancel, onRemove }) => {
    const config = localStatusConfig[job.status];
    const Icon = config.icon;

    const content = (
        <>
            <div className={cn("mt-0.5", config.color)}>
                <Icon size={16} className={cn(config.spin && "animate-spin")} />
            </div>

            <div className="min-w-0 flex-1">
                <p className="mb-1 line-clamp-2 text-xs font-medium leading-relaxed text-white/80">
                    {job.prompt}
                </p>

                <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", config.color)}>
                        {job.status}
                    </span>
                    <span className="text-[10px] text-white/20">
                        {new Date(job.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                    {job.serverJobId ? (
                        <span className="text-[10px] text-accent-400">#{job.serverJobId.slice(0, 8)}</span>
                    ) : null}
                </div>

                {job.error && (
                    <p className="mt-2 rounded border border-rose-500/10 bg-rose-500/5 p-1.5 text-[10px] leading-tight text-rose-400/80">
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
        </>
    );

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "group relative rounded-xl border p-3 transition-all duration-300",
                config.bg,
                isSelected ? "border-accent-500/30 ring-1 ring-accent-500/20" : config.border,
            )}
        >
            <div className="flex items-start gap-3">
                {onInspect ? (
                    <button onClick={onInspect} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                        {content}
                    </button>
                ) : (
                    <div className="flex min-w-0 flex-1 items-start gap-3">{content}</div>
                )}

                <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {(job.status === "processing" || job.status === "pending") && (
                        <button
                            onClick={onCancel}
                            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-rose-400"
                            title="Cancel"
                        >
                            <XCircle size={14} />
                        </button>
                    )}

                    {(job.status === "failed" || job.status === "cancelled") && (
                        <button
                            onClick={onRetry}
                            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-accent-400"
                            title="Retry"
                        >
                            <RotateCcw size={14} />
                        </button>
                    )}

                    <button
                        onClick={onRemove}
                        className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-rose-400"
                        title="Remove"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
