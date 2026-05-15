import React from 'react';

import type { Job as StudioJob } from '../packages/shared/src';
import type { LogEntry, Workspace } from '../types';
import { SessionOverview } from './SessionOverview';
import { SidePanel } from './SidePanel';

export interface LeftDebugPanelProps {
  workspaces: Workspace[];
  logs: LogEntry[];
  studioJobs: StudioJob[];
  batchesCount: number;
  imagesCount: number;
  onInspectJob?: (jobId: string) => void;
  selectedJobId?: string | null;
}

export const LeftDebugPanel: React.FC<LeftDebugPanelProps> = ({
  workspaces,
  logs,
  studioJobs,
  batchesCount,
  imagesCount,
  onInspectJob,
  selectedJobId,
}) => {
  return (
    <SidePanel position="left" label="SESSION">
      <SessionOverview
        variant="sidebar"
        workspaces={workspaces}
        logs={logs}
        studioJobs={studioJobs}
        batchesCount={batchesCount}
        imagesCount={imagesCount}
        onInspectJob={onInspectJob}
        selectedJobId={selectedJobId}
      />
    </SidePanel>
  );
};
