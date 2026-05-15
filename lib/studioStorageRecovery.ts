import type { GenerationBatch } from '../types';
import { validateVault } from '../utils/fileUtils';

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
  'catalog-cache',
  'catalog-trash',
  'user-wallet-balance',
  'bg-config',
  'isBackgroundEnabled',
  'generation-config',
] as const;

function appendRecoverableCandidates(target: GenerationBatch[], value: unknown) {
  if (Array.isArray(value) && validateVault(value)) {
    target.push(...value);
    return;
  }

  const singleBatchCandidate = [value];
  if (validateVault(singleBatchCandidate)) {
    target.push(singleBatchCandidate[0]);
  }
}

export function collectRecoverableBatches(options: {
  idbEntries: RecoverableIdbEntry[];
  storageEntries: RecoverableStorageEntry[];
  ignoredKeys?: readonly string[];
  existingBatchIds?: Iterable<string>;
}): GenerationBatch[] {
  const ignoredKeys = new Set(options.ignoredKeys ?? DEFAULT_RECOVERY_IGNORED_KEYS);
  const existingBatchIds = new Set(options.existingBatchIds ?? []);
  const recoveredCandidates: GenerationBatch[] = [];

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

  return recoveredCandidates.filter((batch) => {
    if (seenBatchIds.has(batch.id)) {
      return false;
    }

    seenBatchIds.add(batch.id);
    return true;
  });
}
