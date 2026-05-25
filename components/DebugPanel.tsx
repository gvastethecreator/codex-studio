import React from 'react';
import { Activity, BrainCircuit, Clock3, Layers3, X } from 'lucide-react';

import type { Job as StudioJob, JobDetailResponse } from '../packages/shared/src';
import type { LogEntry, Workspace } from '../types';
import { cn } from '../lib/utils';
import { SessionOverview } from './SessionOverview';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  workspaces: Workspace[];
  studioJobs: StudioJob[];
  batchesCount: number;
  imagesCount: number;
  selectedJobDetail: JobDetailResponse | null;
  isLoadingSelectedJob: boolean;
  onInspectJob: (jobId: string) => void;
  onClearSelectedJob: () => void;
}

function toneForTranscript(kind: JobDetailResponse['transcriptEntries'][number]['kind']) {
  switch (kind) {
    case 'reasoning':
      return 'border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-100';
    case 'tool':
      return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100';
    case 'message':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100';
    default:
      return 'border-white/10 bg-white/5 text-zinc-200';
  }
}

function toneForStatus(status: StudioJob['status']) {
  switch (status) {
    case 'completed':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200';
    case 'failed':
    case 'cancelled':
      return 'border-rose-500/20 bg-rose-500/10 text-rose-200';
    case 'needs_review':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-100';
    default:
      return 'border-accent-500/20 bg-accent-500/10 text-accent-200';
  }
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  isOpen,
  onClose,
  logs,
  workspaces,
  studioJobs,
  batchesCount,
  imagesCount,
  selectedJobDetail,
  isLoadingSelectedJob,
  onInspectJob,
  onClearSelectedJob,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-y-0 left-0 z-50 w-full max-w-270 border-r border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl"
      style={{ viewTransitionName: 'debug-panel' }}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
            Studio Activity
          </div>
          <h2 className="mt-1 text-xl font-semibold text-white">Activity Inspector</h2>
        </div>
        <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-white/5">
          <X />
        </button>
      </div>
      <div className="grid h-[calc(100%-81px)] grid-cols-1 overflow-hidden xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="custom-scrollbar overflow-y-auto border-b border-white/5 px-5 py-5 xl:border-b-0 xl:border-r">
          <SessionOverview
            variant="drawer"
            workspaces={workspaces}
            logs={logs}
            studioJobs={studioJobs}
            batchesCount={batchesCount}
            imagesCount={imagesCount}
            selectedJobId={selectedJobDetail?.job.id ?? null}
            onInspectJob={onInspectJob}
          />
        </div>

        <div className="custom-scrollbar overflow-y-auto px-5 py-5">
          {selectedJobDetail ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider',
                        toneForStatus(selectedJobDetail.job.status),
                      )}
                    >
                      {selectedJobDetail.job.status}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600">
                      {selectedJobDetail.job.kind.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Job Inspector</h3>
                  <p className="mt-1 text-[11px] text-zinc-500">{selectedJobDetail.job.id}</p>
                </div>
                <button
                  onClick={onClearSelectedJob}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Back to overview
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-zinc-500">
                    <Clock3 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em]">Timing</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-zinc-300">
                    <div>Created: {new Date(selectedJobDetail.job.createdAt).toLocaleString()}</div>
                    <div>Updated: {new Date(selectedJobDetail.job.updatedAt).toLocaleString()}</div>
                    <div>
                      Completed:{' '}
                      {selectedJobDetail.job.completedAt
                        ? new Date(selectedJobDetail.job.completedAt).toLocaleString()
                        : '—'}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-zinc-500">
                    <BrainCircuit size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em]">Execution</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-zinc-300">
                    <div>Model: {selectedJobDetail.job.execution?.model || 'default'}</div>
                    <div>
                      Thinking: {selectedJobDetail.job.execution?.reasoningEffort || 'default'}
                    </div>
                    <div>
                      Speed: {selectedJobDetail.job.execution?.serviceTier || 'standard'}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-zinc-500">
                    <Layers3 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em]">Turn</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-zinc-300">
                    <div>Status: {selectedJobDetail.turn?.status || 'n/a'}</div>
                    <div>Thread: {selectedJobDetail.turn?.codexThreadId || '—'}</div>
                    <div>Turn ID: {selectedJobDetail.turn?.codexTurnId || '—'}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                  Prompt used
                </div>
                <pre className="custom-scrollbar overflow-x-auto whitespace-pre-wrap wrap-break-word rounded-xl border border-white/5 bg-black/30 p-3 text-[11px] leading-relaxed text-zinc-300">
                  {selectedJobDetail.job.finalPromptUsed || selectedJobDetail.job.originalPrompt}
                </pre>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <section className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="mb-3 flex items-center gap-2 text-zinc-500">
                    <Activity size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                      Job events
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedJobDetail.events.length > 0 ? (
                      selectedJobDetail.events.map((event) => (
                        <div
                          key={event.id}
                          className="rounded-xl border border-white/5 bg-white/5 px-3 py-2.5"
                        >
                          <div className="mb-1 flex items-center justify-between gap-3">
                            <span className="text-[9px] font-black uppercase tracking-wider text-accent-300">
                              {event.type}
                            </span>
                            <span className="text-[9px] text-zinc-600">
                              {new Date(event.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-zinc-300">{event.message}</p>
                          {event.metadata ? (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                metadata
                              </summary>
                              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/30 p-2 text-[10px] text-zinc-400">
                                {JSON.stringify(event.metadata, null, 2)}
                              </pre>
                            </details>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/5 bg-black/20 px-3 py-4 text-[10px] text-zinc-600">
                        No recorded job events yet.
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="mb-3 flex items-center gap-2 text-zinc-500">
                    <BrainCircuit size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                      Transcript / thinking
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedJobDetail.transcriptEntries.length > 0 ? (
                      selectedJobDetail.transcriptEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={cn(
                            'rounded-xl border px-3 py-2.5',
                            toneForTranscript(entry.kind),
                          )}
                        >
                          <div className="mb-1 flex items-center justify-between gap-3">
                            <span className="text-[9px] font-black uppercase tracking-wider">
                              {entry.label}
                            </span>
                            <span className="text-[9px] text-white/45">{entry.source}</span>
                          </div>
                          <p className="whitespace-pre-wrap wrap-break-word text-[11px] leading-relaxed">
                            {entry.text}
                          </p>
                          {entry.raw ? (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-[9px] font-bold uppercase tracking-wider text-white/45">
                                raw payload
                              </summary>
                              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/30 p-2 text-[10px] text-zinc-300/80">
                                {JSON.stringify(entry.raw, null, 2)}
                              </pre>
                            </details>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/5 bg-black/20 px-3 py-4 text-[10px] text-zinc-600">
                        No transcript or reasoning data was recorded for this job.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : isLoadingSelectedJob ? (
            <div className="flex h-full min-h-80 items-center justify-center text-zinc-500">
              Loading job detail…
            </div>
          ) : (
            <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-white/5 bg-black/20 p-8 text-center">
              <BrainCircuit size={28} className="mb-4 text-accent-400" />
              <h3 className="text-lg font-semibold text-white">Select a job</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                Click any backend job from the queue or the session overview to inspect events,
                assistant output, thinking-like entries, and raw transcript payloads.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
