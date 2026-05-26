import type {
  LegacyVisualBatch,
  LegacyVisualBatchSnapshot,
} from '../lib/studioLegacyVisualSnapshotImport';

export interface LegacyVisualBatchRef {
  id: string;
  workspaceId: string;
}

export interface LegacyVisualBatchState {
  legacyVisualBatchRefs: LegacyVisualBatchRef[];
}

export type LegacyVisualBatchAction =
  | {
      type: 'REGISTER_GENERATED_LEGACY_VISUAL_BATCH_REF';
      ref: LegacyVisualBatchRef;
      maxPerWorkspace?: number;
    }
  | {
      type: 'REGISTER_RECOVERED_LEGACY_VISUAL_BATCH_IDS';
      batches: LegacyVisualBatchSnapshot;
      prepend?: boolean;
      maxTotal?: number;
      ensureWorkspaces?: boolean;
    }
  | { type: 'CLEAR_LEGACY_VISUAL_WORKSPACE_IDS'; workspaceId: string }
  | { type: 'CLEAR_ALL_LEGACY_VISUAL_BATCH_IDS' }
  | { type: 'RESET_LEGACY_VISUAL_BATCH_IDS' };

function normalizeWorkspaceId(workspaceId?: string | null) {
  return workspaceId || 'default';
}

function toBatchRef(batch: Pick<LegacyVisualBatch, 'id' | 'workspaceId'>): LegacyVisualBatchRef {
  return {
    id: batch.id,
    workspaceId: normalizeWorkspaceId(batch.workspaceId),
  };
}

function mergeBatchRefs(
  current: LegacyVisualBatchRef[],
  incoming: LegacyVisualBatchRef[],
  options?: { prepend?: boolean; maxTotal?: number },
) {
  const prepend = options?.prepend ?? false;
  const ordered = prepend ? [...incoming, ...current] : [...current, ...incoming];
  const seen = new Set<string>();
  const merged: LegacyVisualBatchRef[] = [];

  for (const ref of ordered) {
    if (seen.has(ref.id)) continue;
    seen.add(ref.id);
    merged.push(ref);
  }

  return typeof options?.maxTotal === 'number' ? merged.slice(0, options.maxTotal) : merged;
}

function withWorkspaceLimit(
  refs: LegacyVisualBatchRef[],
  workspaceId: string,
  maxPerWorkspace?: number,
) {
  if (!maxPerWorkspace || maxPerWorkspace <= 0) {
    return refs;
  }

  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId);
  let seenInWorkspace = 0;

  return refs.filter((ref) => {
    if (ref.workspaceId !== normalizedWorkspaceId) {
      return true;
    }

    seenInWorkspace += 1;
    return seenInWorkspace <= maxPerWorkspace;
  });
}

export function createInitialLegacyVisualBatchState(): LegacyVisualBatchState {
  return {
    legacyVisualBatchRefs: [],
  };
}

export function legacyVisualBatchReducer(
  state: LegacyVisualBatchState,
  action: LegacyVisualBatchAction,
): LegacyVisualBatchState {
  switch (action.type) {
    case 'RESET_LEGACY_VISUAL_BATCH_IDS':
      return createInitialLegacyVisualBatchState();

    case 'REGISTER_GENERATED_LEGACY_VISUAL_BATCH_REF': {
      const refs = mergeBatchRefs(state.legacyVisualBatchRefs, [toBatchRef(action.ref)], {
        prepend: true,
      });
      return {
        ...state,
        legacyVisualBatchRefs: withWorkspaceLimit(
          refs,
          action.ref.workspaceId,
          action.maxPerWorkspace,
        ),
      };
    }

    case 'REGISTER_RECOVERED_LEGACY_VISUAL_BATCH_IDS':
      return {
        ...state,
        legacyVisualBatchRefs: mergeBatchRefs(
          state.legacyVisualBatchRefs,
          action.batches.map(toBatchRef),
          {
            prepend: action.prepend,
            maxTotal: action.maxTotal,
          },
        ),
      };

    case 'CLEAR_LEGACY_VISUAL_WORKSPACE_IDS':
      return {
        ...state,
        legacyVisualBatchRefs: state.legacyVisualBatchRefs.filter(
          (ref) => ref.workspaceId !== normalizeWorkspaceId(action.workspaceId),
        ),
      };

    case 'CLEAR_ALL_LEGACY_VISUAL_BATCH_IDS':
      return {
        ...state,
        legacyVisualBatchRefs: [],
      };

    default:
      return state;
  }
}
