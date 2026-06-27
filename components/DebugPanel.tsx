import React from 'react';
import { IconBrain as BrainCircuit, IconX as X } from '@tabler/icons-react';

import type { Job as StudioJob, JobDetailResponse } from '../packages/shared/src';
import type { LogEntry, Workspace } from '../types';
import { JobInspectorDetail } from './JobInspectorDetail';
import { SessionOverview } from './SessionOverview';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  workspaces: Workspace[];
  studioJobs: StudioJob[];
  visualGroupsCount: number;
  imagesCount: number;
  selectedJobDetail: JobDetailResponse | null;
  isLoadingSelectedJob: boolean;
  onInspectJob: (jobId: string) => void;
  onClearSelectedJob: () => void;
  onRetryJob?: (jobId: string) => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  isOpen,
  onClose,
  logs,
  workspaces,
  studioJobs,
  visualGroupsCount,
  imagesCount,
  selectedJobDetail,
  isLoadingSelectedJob,
  onInspectJob,
  onClearSelectedJob,
  onRetryJob,
}) => {
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      className="fixed inset-0 z-50 m-0 h-full w-full max-h-none max-w-none bg-transparent p-0"
      aria-label="Studio activity inspector"
      aria-modal="true"
      open
    >
      <button
        type="button"
        aria-label="Close activity inspector"
        className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="absolute inset-4 overflow-hidden rounded-[30px] border border-white/10 bg-zinc-950/96 shadow-[0_40px_160px_rgba(0,0,0,0.65)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
              Studio activity
            </div>
            <h2 className="mt-1 text-xl font-semibold text-white">Readable job inspector</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2.5 text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid h-[calc(100%-88px)] grid-cols-1 overflow-hidden xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="custom-scrollbar overflow-y-auto border-b border-white/8 bg-black/20 px-5 py-5 xl:border-b-0 xl:border-r xl:px-6">
            <SessionOverview
              variant="drawer"
              workspaces={workspaces}
              logs={logs}
              studioJobs={studioJobs}
              visualGroupsCount={visualGroupsCount}
              imagesCount={imagesCount}
              selectedJobId={selectedJobDetail?.job.id ?? null}
              onInspectJob={onInspectJob}
            />
          </aside>

          <main className="custom-scrollbar overflow-y-auto px-5 py-5 xl:px-6">
            {selectedJobDetail ? (
              <JobInspectorDetail
                detail={selectedJobDetail}
                onClearSelectedJob={onClearSelectedJob}
                onRetryJob={onRetryJob}
              />
            ) : isLoadingSelectedJob ? (
              <div className="flex h-full min-h-80 items-center justify-center rounded-[28px] border border-white/8 bg-white/[0.03] text-zinc-500">
                Loading job detail…
              </div>
            ) : (
              <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-[28px] border border-dashed border-white/8 bg-white/[0.03] p-8 text-center">
                <BrainCircuit size={30} className="mb-4 text-accent-400" />
                <h3 className="text-xl font-semibold text-white">Pick a job to inspect</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
                  Select any backend job from the session rail to open a readable timeline with
                  formatted transcript steps, structured event facts, and any images or file
                  references we can detect from the recorded payloads.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </dialog>
  );
};
