import type { CreateJobRequest, Job, JobDetailResponse } from '../packages/shared/src';
import { buildGenerationVariationBrief, createGenerationVariationKey } from './generationVariation';

const RETRYABLE_JOB_STATUSES = new Set<Job['status']>([
  'queued',
  'running',
  'needs_review',
  'completed',
  'failed',
  'cancelled',
]);

function createRetryBatchId() {
  return `retry-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function canRetryStudioJob(status: Job['status']) {
  return RETRYABLE_JOB_STATUSES.has(status);
}

export function buildStudioJobRetryRequest(
  detail: JobDetailResponse,
  options: { batchId?: string } = {},
): CreateJobRequest {
  const batchId = options.batchId ?? createRetryBatchId();
  const variationKey = createGenerationVariationKey('retry');
  const sourceSpec = detail.job.sourceSpec
    ? {
        ...detail.job.sourceSpec,
        assets: detail.job.sourceSpec.assets.map((asset) => ({ ...asset })),
        metadata: {
          ...(detail.job.sourceSpec.metadata ?? {}),
          batchId,
          variationKey,
          variationBrief: buildGenerationVariationBrief({
            batchIndex: 1,
            batchCount: 1,
            variationKey,
          }),
        },
      }
    : null;

  const prompt =
    sourceSpec?.prompt?.trim() ||
    detail.job.originalPrompt.trim() ||
    detail.job.finalPromptUsed.trim() ||
    '';

  if (!prompt) {
    throw new Error('Unable to retry this job because no prompt was recorded.');
  }

  return {
    projectId: detail.job.projectId,
    kind: sourceSpec?.task ?? detail.job.kind,
    providerId: detail.job.providerId ?? sourceSpec?.providerId ?? undefined,
    sourceSpec,
    prompt,
    execution: detail.job.execution ? { ...detail.job.execution } : undefined,
    references: sourceSpec?.assets.flatMap((asset) =>
      asset.dataUrl
        ? [
            {
              name: asset.name,
              dataUrl: asset.dataUrl,
              strength: asset.strength ?? 0,
            },
          ]
        : [],
    ),
  };
}
