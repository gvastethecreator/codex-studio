import { validateLegacyVisualBatchVault } from './studioLegacyVisualBatchStore';
import type { LegacyVisualBatchSnapshot } from './studioLegacyVisualBatchTypes';
export type { LegacyVisualBatch, LegacyVisualBatchSnapshot } from './studioLegacyVisualBatchTypes';

export class LegacyVisualSnapshotImportError extends Error {
  constructor(message = 'Invalid legacy Visual Batch snapshot') {
    super(message);
    this.name = 'LegacyVisualSnapshotImportError';
  }
}

export function parseLegacyVisualBatchSnapshot(data: unknown): LegacyVisualBatchSnapshot {
  if (!validateLegacyVisualBatchVault(data)) {
    throw new LegacyVisualSnapshotImportError();
  }

  return data;
}

export function parseRecoverableLegacyVisualBatches(data: unknown): LegacyVisualBatchSnapshot {
  try {
    return parseLegacyVisualBatchSnapshot(data);
  } catch {
    try {
      return parseLegacyVisualBatchSnapshot([data]);
    } catch {
      return [];
    }
  }
}

export async function readLegacyVisualBatchSnapshot(
  file: File,
  readJsonFile: (file: File) => Promise<unknown>,
) {
  return parseLegacyVisualBatchSnapshot(await readJsonFile(file));
}
