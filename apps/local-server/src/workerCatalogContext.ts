import type { Job } from '../../../packages/shared/src';

interface JobCatalogContext {
  workspaceId: string;
  batchId: string | null;
}

function readMetadataString(job: Pick<Job, 'sourceSpec'>, key: string) {
  const value = job.sourceSpec?.metadata?.[key];
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function resolveJobCatalogContext(
  job: Pick<Job, 'projectId' | 'sourceSpec'>,
): JobCatalogContext {
  return {
    workspaceId: readMetadataString(job, 'workspaceId') ?? job.projectId,
    batchId: readMetadataString(job, 'batchId'),
  };
}
