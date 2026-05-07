import type {
  BackgroundConfig,
  GeneratedImage,
  GenerationBatch,
  LogEntry,
  Workspace,
} from "../types";

export interface GlobalState {
  logs: LogEntry[];
  workspaces: Workspace[];
  activeWorkspaceId: string;
  batches: GenerationBatch[];
  trash: GenerationBatch[];
  isBackgroundEnabled: boolean;
  bgConfig: BackgroundConfig;
}

export type GlobalAction =
  | { type: "HYDRATE_STATE"; state: Partial<GlobalState> }
  | { type: "ADD_LOG"; entry: LogEntry }
  | { type: "CREATE_WORKSPACE"; workspace: Workspace; activate?: boolean }
  | { type: "DELETE_WORKSPACE"; id: string }
  | { type: "RENAME_WORKSPACE"; id: string; name: string }
  | { type: "SET_ACTIVE_WORKSPACE"; id: string }
  | { type: "PREPEND_BATCH"; batch: GenerationBatch; maxPerWorkspace?: number }
  | {
      type: "MERGE_BATCHES";
      batches: GenerationBatch[];
      prepend?: boolean;
      maxTotal?: number;
      ensureWorkspaces?: boolean;
    }
  | { type: "REPLACE_BATCHES"; batches: GenerationBatch[]; ensureWorkspaces?: boolean }
  | { type: "ARCHIVE_BATCHES"; batches: GenerationBatch[] }
  | { type: "DELETE_IMAGE"; imageId: string }
  | { type: "DELETE_IMAGES"; imageIds: string[] }
  | { type: "TOGGLE_IMAGE_FAVORITE"; imageId: string }
  | { type: "CLEAR_WORKSPACE"; workspaceId: string }
  | { type: "CLEAR_ALL_BATCHES" }
  | { type: "RESTORE_FROM_TRASH"; batchId: string }
  | { type: "RESTORE_ALL_FROM_TRASH" }
  | { type: "EMPTY_TRASH" }
  | { type: "SET_BACKGROUND_ENABLED"; enabled: boolean }
  | { type: "UPDATE_BACKGROUND_CONFIG"; patch: Partial<BackgroundConfig> };

export function createInitialGlobalState(): GlobalState {
  return {
    logs: [],
    workspaces: ensureDefaultWorkspace([{ id: "default", createdAt: Date.now() }]),
    activeWorkspaceId: "default",
    batches: [],
    trash: [],
    isBackgroundEnabled: true,
    bgConfig: { density: 0.4, speed: 0.002 },
  };
}

export function ensureDefaultWorkspace(workspaces: Workspace[]): Workspace[] {
  if (workspaces.some((workspace) => workspace.id === "default")) {
    return workspaces;
  }

  return [{ id: "default", createdAt: Date.now() }, ...workspaces];
}

function normalizeWorkspaceId(workspaceId?: string | null) {
  return workspaceId || "default";
}

function belongsToWorkspace(batch: GenerationBatch, workspaceId: string) {
  return normalizeWorkspaceId(batch.workspaceId) === normalizeWorkspaceId(workspaceId);
}

function mergeImages(existing: GeneratedImage[], incoming: GeneratedImage[]) {
  const order: string[] = [];
  const imageMap = new Map<string, GeneratedImage>();

  const visit = (image: GeneratedImage) => {
    if (!order.includes(image.id)) {
      order.push(image.id);
    }
    const previous = imageMap.get(image.id);
    imageMap.set(image.id, previous ? { ...previous, ...image } : image);
  };

  incoming.forEach(visit);
  existing.forEach((image) => {
    if (!imageMap.has(image.id)) {
      visit(image);
    }
  });

  return order.map((id) => imageMap.get(id)!);
}

function mergeBatch(existing: GenerationBatch, incoming: GenerationBatch): GenerationBatch {
  return {
    ...existing,
    ...incoming,
    workspaceId: incoming.workspaceId || existing.workspaceId,
    createdAt: Math.max(existing.createdAt, incoming.createdAt),
    config: incoming.config || existing.config,
    images: mergeImages(existing.images, incoming.images),
  };
}

function mergeBatchCollections(
  current: GenerationBatch[],
  incoming: GenerationBatch[],
  options?: { prepend?: boolean; maxTotal?: number },
) {
  const prepend = options?.prepend ?? false;
  const order: string[] = [];
  const batchMap = new Map<string, GenerationBatch>();

  const visit = (batch: GenerationBatch) => {
    if (!order.includes(batch.id)) {
      order.push(batch.id);
    }

    const previous = batchMap.get(batch.id);
    batchMap.set(batch.id, previous ? mergeBatch(previous, batch) : batch);
  };

  const first = prepend ? incoming : current;
  const second = prepend ? current : incoming;

  first.forEach(visit);
  second.forEach((batch) => {
    if (batchMap.has(batch.id)) {
      const previous = batchMap.get(batch.id)!;
      batchMap.set(batch.id, mergeBatch(previous, batch));
      return;
    }
    visit(batch);
  });

  const merged = order.map((id) => batchMap.get(id)!).filter(Boolean);
  return typeof options?.maxTotal === "number" ? merged.slice(0, options.maxTotal) : merged;
}

function withWorkspaceLimit(
  batches: GenerationBatch[],
  workspaceId: string,
  maxPerWorkspace?: number,
) {
  if (!maxPerWorkspace || maxPerWorkspace <= 0) {
    return batches;
  }

  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId);
  let seenInWorkspace = 0;

  return batches.filter((batch) => {
    if (!belongsToWorkspace(batch, normalizedWorkspaceId)) {
      return true;
    }

    seenInWorkspace += 1;
    return seenInWorkspace <= maxPerWorkspace;
  });
}

function ensureWorkspacesForBatches(workspaces: Workspace[], batches: GenerationBatch[]) {
  const existingIds = new Set(workspaces.map((workspace) => workspace.id));
  const missing: Workspace[] = [];

  for (const batch of batches) {
    const workspaceId = normalizeWorkspaceId(batch.workspaceId);
    if (existingIds.has(workspaceId)) {
      continue;
    }

    missing.push({
      id: workspaceId,
      createdAt: Date.now(),
      name: workspaceId === "default" ? undefined : `Imported (${workspaceId.slice(-4)})`,
    });
    existingIds.add(workspaceId);
  }

  return ensureDefaultWorkspace([...workspaces, ...missing]);
}

function archiveBatches(state: GlobalState, batchesToArchive: GenerationBatch[]) {
  if (batchesToArchive.length === 0) {
    return state;
  }

  return {
    ...state,
    trash: mergeBatchCollections(state.trash, batchesToArchive, { prepend: true }),
  };
}

function deleteImages(state: GlobalState, imageIds: string[]) {
  const ids = new Set(imageIds);
  if (ids.size === 0) {
    return state;
  }

  const batchesToArchive: GenerationBatch[] = [];
  const nextBatches = state.batches
    .map((batch) => {
      const remainingImages = batch.images.filter((image) => !ids.has(image.id));
      if (remainingImages.length === 0 && batch.images.length > 0) {
        batchesToArchive.push(batch);
      }
      return remainingImages.length === batch.images.length
        ? batch
        : { ...batch, images: remainingImages };
    })
    .filter((batch) => batch.images.length > 0);

  return archiveBatches(
    {
      ...state,
      batches: nextBatches,
    },
    batchesToArchive,
  );
}

export function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case "HYDRATE_STATE": {
      const hydratedWorkspaces = ensureDefaultWorkspace(
        action.state.workspaces ?? state.workspaces,
      );
      const hydratedActiveWorkspaceId = hydratedWorkspaces.some(
        (workspace) => workspace.id === action.state.activeWorkspaceId,
      )
        ? action.state.activeWorkspaceId!
        : hydratedWorkspaces.some((workspace) => workspace.id === state.activeWorkspaceId)
          ? state.activeWorkspaceId
          : "default";

      return {
        logs: action.state.logs ?? state.logs,
        workspaces: hydratedWorkspaces,
        activeWorkspaceId: hydratedActiveWorkspaceId,
        batches: action.state.batches ?? state.batches,
        trash: action.state.trash ?? state.trash,
        isBackgroundEnabled: action.state.isBackgroundEnabled ?? state.isBackgroundEnabled,
        bgConfig: action.state.bgConfig ?? state.bgConfig,
      };
    }

    case "ADD_LOG":
      return {
        ...state,
        logs: [action.entry, ...state.logs].slice(0, 500),
      };

    case "CREATE_WORKSPACE": {
      const workspaces = ensureDefaultWorkspace(
        state.workspaces.some((workspace) => workspace.id === action.workspace.id)
          ? state.workspaces
          : [...state.workspaces, action.workspace],
      );

      return {
        ...state,
        workspaces,
        activeWorkspaceId:
          (action.activate ?? true) ? action.workspace.id : state.activeWorkspaceId,
      };
    }

    case "DELETE_WORKSPACE": {
      if (action.id === "default") {
        return state;
      }

      const workspaces = ensureDefaultWorkspace(
        state.workspaces.filter((workspace) => workspace.id !== action.id),
      );

      return {
        ...state,
        workspaces,
        batches: state.batches.filter((batch) => !belongsToWorkspace(batch, action.id)),
        activeWorkspaceId:
          state.activeWorkspaceId === action.id ? "default" : state.activeWorkspaceId,
      };
    }

    case "RENAME_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) =>
          workspace.id === action.id ? { ...workspace, name: action.name } : workspace,
        ),
      };

    case "SET_ACTIVE_WORKSPACE":
      return {
        ...state,
        activeWorkspaceId: state.workspaces.some((workspace) => workspace.id === action.id)
          ? action.id
          : state.activeWorkspaceId,
      };

    case "PREPEND_BATCH": {
      const batches = mergeBatchCollections(state.batches, [action.batch], { prepend: true });
      return {
        ...state,
        workspaces: ensureWorkspacesForBatches(state.workspaces, [action.batch]),
        batches: withWorkspaceLimit(batches, action.batch.workspaceId, action.maxPerWorkspace),
      };
    }

    case "MERGE_BATCHES":
      return {
        ...state,
        workspaces: action.ensureWorkspaces
          ? ensureWorkspacesForBatches(state.workspaces, action.batches)
          : state.workspaces,
        batches: mergeBatchCollections(state.batches, action.batches, {
          prepend: action.prepend,
          maxTotal: action.maxTotal,
        }),
      };

    case "REPLACE_BATCHES":
      return {
        ...state,
        workspaces: action.ensureWorkspaces
          ? ensureWorkspacesForBatches(state.workspaces, action.batches)
          : state.workspaces,
        batches: mergeBatchCollections([], action.batches, { prepend: true }),
      };

    case "ARCHIVE_BATCHES":
      return archiveBatches(state, action.batches);

    case "DELETE_IMAGE":
      return deleteImages(state, [action.imageId]);

    case "DELETE_IMAGES":
      return deleteImages(state, action.imageIds);

    case "TOGGLE_IMAGE_FAVORITE":
      return {
        ...state,
        batches: state.batches.map((batch) => ({
          ...batch,
          images: batch.images.map((image) =>
            image.id === action.imageId ? { ...image, isFavorite: !image.isFavorite } : image,
          ),
        })),
      };

    case "CLEAR_WORKSPACE": {
      const batchesToArchive = state.batches.filter((batch) =>
        belongsToWorkspace(batch, action.workspaceId),
      );
      const nextState = {
        ...state,
        batches: state.batches.filter((batch) => !belongsToWorkspace(batch, action.workspaceId)),
      };
      return archiveBatches(nextState, batchesToArchive);
    }

    case "CLEAR_ALL_BATCHES":
      return {
        ...state,
        batches: [],
      };

    case "RESTORE_FROM_TRASH": {
      const batchToRestore = state.trash.find((batch) => batch.id === action.batchId);
      if (!batchToRestore) {
        return state;
      }

      return {
        ...state,
        trash: state.trash.filter((batch) => batch.id !== action.batchId),
        batches: mergeBatchCollections(state.batches, [batchToRestore], { prepend: true }),
        workspaces: ensureWorkspacesForBatches(state.workspaces, [batchToRestore]),
      };
    }

    case "RESTORE_ALL_FROM_TRASH":
      return {
        ...state,
        trash: [],
        batches: mergeBatchCollections(state.batches, state.trash, { prepend: true }),
        workspaces: ensureWorkspacesForBatches(state.workspaces, state.trash),
      };

    case "EMPTY_TRASH":
      return {
        ...state,
        trash: [],
      };

    case "SET_BACKGROUND_ENABLED":
      return {
        ...state,
        isBackgroundEnabled: action.enabled,
      };

    case "UPDATE_BACKGROUND_CONFIG":
      return {
        ...state,
        bgConfig: {
          ...state.bgConfig,
          ...action.patch,
        },
      };

    default:
      return state;
  }
}
