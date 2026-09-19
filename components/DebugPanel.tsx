import { useDialogFocus } from '../hooks/useDialogFocus';
import React from 'react';
import { IconBrain as BrainCircuit, IconX as X } from '@tabler/icons-react';

import type { JobDetailResponse } from '../packages/shared/src';
import type { ShellActivityJob as StudioJob } from '../lib/shellActivityJob';
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
  const dialogRef = useDialogFocus(isOpen, onClose);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      tabIndex={-1}
      className="fixed inset-0 z-50 m-0 h-full w-full max-h-none max-w-none bg-transparent p-0"
      aria-label="Studio activity inspector"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close activity inspector"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full studio-scrim backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="studio-dialog absolute inset-y-3 right-3 left-3 lg:left-auto lg:w-[min(960px,90vw)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[color:var(--wb-line)] px-6 py-5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--wb-muted)]">
              Studio activity
            </div>
            <h2 className="mt-1 text-xl font-semibold text-[color:var(--wb-ink)]">Job details</h2>
          </div>
          <button
            type="button"
            aria-label="Close job inspector"
            onClick={onClose}
            className="rounded-full border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] p-2.5 text-[color:var(--wb-ink)] transition-colors hover:border-[color:var(--wb-border)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex h-[calc(100%-88px)] flex-col overflow-y-auto">
          <details className="custom-scrollbar overflow-y-auto border-b border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-5 py-5 xl:border-b-0 xl:border-r xl:px-6">
            <summary className="cursor-pointer text-sm">Workspace activity and logs</summary>
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
          </details>

          <main className="custom-scrollbar overflow-y-auto px-5 py-5 xl:px-6">
            {selectedJobDetail ? (
              <JobInspectorDetail
                detail={selectedJobDetail}
                onClearSelectedJob={onClearSelectedJob}
                onRetryJob={onRetryJob}
              />
            ) : isLoadingSelectedJob ? (
              <div className="flex h-full min-h-80 items-center justify-center rounded-[28px] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_3%,transparent)] text-[color:var(--wb-muted)]">
                Loading job detail…
              </div>
            ) : (
              <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-[28px] border border-dashed border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_3%,transparent)] p-8 text-center">
                <BrainCircuit size={30} className="mb-4 text-accent-400" />
                <h3 className="text-xl font-semibold text-[color:var(--wb-ink)]">Pick a job to inspect</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--wb-muted)]">
                  Select any backend job from the session rail to open a readable timeline with
                  formatted transcript steps, structured event facts, and any images or file
                  references we can detect from the recorded payloads.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
