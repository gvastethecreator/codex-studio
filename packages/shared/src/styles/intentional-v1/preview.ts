export interface PreviewEvidence {
  presetId: string;
  presetVersion: number;
  snapshotHash: string;
  state: 'missing' | 'unknown' | 'stale' | 'verified';
  provider: string | null;
  model: string | null;
  benchmarkId: string | null;
  verified: boolean;
}
/** Existing bytes alone never establish that a preview represents the current DNA. */
export function previewStatus(
  record: PreviewEvidence | null,
  current: { presetId: string; version: number; snapshotHash: string },
  hasImage: boolean,
): PreviewEvidence['state'] {
  if (!hasImage) return 'missing';
  if (!record) return 'unknown';
  if (
    record.presetId !== current.presetId ||
    record.presetVersion !== current.version ||
    record.snapshotHash !== current.snapshotHash
  )
    return 'stale';
  if (record.state === 'stale') return 'stale';
  if (
    record.state === 'verified' &&
    record.verified &&
    record.provider &&
    record.model &&
    record.benchmarkId
  )
    return 'verified';
  return 'unknown';
}
