import { LEGACY_VISUAL_BATCH_CACHE_KEYS } from './studioLegacyVisualBatchStore';
import {
  type LegacyVisualBatch,
  type LegacyVisualBatchSnapshot,
  parseRecoverableLegacyVisualBatches,
} from './studioLegacyVisualSnapshotImport';

export interface RecoverableIdbEntry {
  key: IDBValidKey;
  value: unknown;
}

export interface RecoverableStorageEntry {
  key: string;
  value: string | null;
}

export const DEFAULT_RECOVERY_IGNORED_KEYS = [
  'session-logs',
  'app-workspaces',
  ...LEGACY_VISUAL_BATCH_CACHE_KEYS,
  'user-wallet-balance',
  'generation-config',
] as const;

function appendRecoverableCandidates(target: LegacyVisualBatchSnapshot, value: unknown) {
  target.push(...parseRecoverableLegacyVisualBatches(value));
}

export function collectRecoverableLegacyVisualSnapshot(options: {
  idbEntries: RecoverableIdbEntry[];
  storageEntries: RecoverableStorageEntry[];
  ignoredKeys?: readonly string[];
  existingBatchIds?: Iterable<string>;
}): LegacyVisualBatchSnapshot {
  const ignoredKeys = new Set(options.ignoredKeys ?? DEFAULT_RECOVERY_IGNORED_KEYS);
  const existingBatchIds = new Set(options.existingBatchIds ?? []);
  const recoveredCandidates: LegacyVisualBatchSnapshot = [];

  for (const entry of options.idbEntries) {
    if (typeof entry.key === 'string' && ignoredKeys.has(entry.key)) {
      continue;
    }

    appendRecoverableCandidates(recoveredCandidates, entry.value);
  }

  for (const entry of options.storageEntries) {
    if (!entry.key || ignoredKeys.has(entry.key) || !entry.value) {
      continue;
    }

    try {
      appendRecoverableCandidates(recoveredCandidates, JSON.parse(entry.value));
    } catch {
      // Ignore invalid storage payloads.
    }
  }

  const seenBatchIds = new Set(existingBatchIds);

  return recoveredCandidates.filter((batch): batch is LegacyVisualBatch => {
    if (seenBatchIds.has(batch.id)) {
      return false;
    }

    seenBatchIds.add(batch.id);
    return true;
  });
}
