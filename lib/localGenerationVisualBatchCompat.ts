import type { LocalGenerationRunResult } from '../services/localGenerationRun';
import type { LegacyVisualBatchRef } from '../contexts/legacyVisualBatchReducer';
import type { LegacyVisualBatch } from './studioLegacyVisualBatchTypes';

export type RegisterGeneratedLegacyVisualBatchRef = (
  ref: LegacyVisualBatchRef,
  options?: { maxPerWorkspace?: number },
) => void;

/**
 * Compatibility edge while the current grid still consumes Visual Batches.
 * Local Generation Run already persisted Catalog Entries before returning.
 */
export function buildLegacyVisualBatchFromLocalGenerationResult(
  result: LocalGenerationRunResult,
): LegacyVisualBatch {
  return {
    id: result.batchId,
    workspaceId: result.workspaceId,
    config: result.config,
    images: result.images,
    createdAt: result.createdAt,
  };
}

export function appendLocalGenerationResultToLegacyVisualBatches(
  result: LocalGenerationRunResult,
  registerGeneratedLegacyVisualBatchRef: RegisterGeneratedLegacyVisualBatchRef,
  options?: { maxPerWorkspace?: number },
) {
  const legacyVisualBatch = buildLegacyVisualBatchFromLocalGenerationResult(result);
  registerGeneratedLegacyVisualBatchRef(
    {
      id: legacyVisualBatch.id,
      workspaceId: legacyVisualBatch.workspaceId,
    },
    options,
  );
  return legacyVisualBatch;
}
