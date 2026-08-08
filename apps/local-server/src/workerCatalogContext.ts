import type { Job } from '../../../packages/shared/src';
import { normalizeWorkspaceId } from '../../../packages/shared/src/workspaceContracts';

export interface JobCatalogContext {
  workspaceId: string;
  batchId: string | null;
}

function readMetadataString(job: Pick<Job, 'sourceSpec'>, key: string) {
  const metadata = job.sourceSpec?.metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null;
  const candidate = (metadata as Record<string, unknown>)[key];
  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
}

export function resolveJobCatalogContext(
  job: Pick<Job, 'workspaceId' | 'sourceSpec' | 'batchId'>,
): JobCatalogContext {
  const fromColumn =
    typeof job.workspaceId === 'string' && job.workspaceId.trim() ? job.workspaceId.trim() : null;
  const fromMetadata = readMetadataString(job, 'workspaceId');
  return {
    workspaceId: normalizeWorkspaceId(fromColumn ?? fromMetadata),
    batchId:
      (typeof job.batchId === 'string' && job.batchId.trim() ? job.batchId.trim() : null) ??
      readMetadataString(job, 'batchId'),
  };
}
