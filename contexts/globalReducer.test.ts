import { describe, expect, it } from "vite-plus/test";

import { DEFAULT_GENERATION_CONFIG } from "../constants";
import type { GenerationBatch } from "../types";
import { createInitialGlobalState, globalReducer } from "./globalReducer";

function createBatch(
  id: string,
  workspaceId = "default",
  imageIds: string[] = [id],
): GenerationBatch {
  return {
    id,
    workspaceId,
    createdAt: 1,
    config: {
      ...DEFAULT_GENERATION_CONFIG,
      batchCount: 1,
      useThinkingAndSearch: false,
    },
    images: imageIds.map((imageId, index) => ({
      id: imageId,
      src: `${imageId}.png`,
      batchId: id,
      createdAt: index,
      isFavorite: false,
    })),
  };
}

describe("globalReducer", () => {
  it("merges images when prepending an existing batch id", () => {
    const initial = {
      ...createInitialGlobalState(),
      batches: [createBatch("batch-1", "default", ["img-1"])],
    };

    const next = globalReducer(initial, {
      type: "PREPEND_BATCH",
      batch: createBatch("batch-1", "default", ["img-2"]),
    });

    expect(next.batches).toHaveLength(1);
    expect(next.batches[0].images.map((image) => image.id)).toEqual(["img-1", "img-2"]);
  });

  it("respects maxPerWorkspace when prepending a batch", () => {
    const initial = {
      ...createInitialGlobalState(),
      batches: [createBatch("older", "default", ["old"])],
    };

    const next = globalReducer(initial, {
      type: "PREPEND_BATCH",
      batch: createBatch("newer", "default", ["new"]),
      maxPerWorkspace: 1,
    });

    expect(next.batches.map((batch) => batch.id)).toEqual(["newer"]);
  });

  it("archives a batch when its last image is deleted", () => {
    const initialBatch = createBatch("batch-1", "default", ["img-1"]);
    const initial = {
      ...createInitialGlobalState(),
      batches: [initialBatch],
    };

    const next = globalReducer(initial, {
      type: "DELETE_IMAGE",
      imageId: "img-1",
    });

    expect(next.batches).toHaveLength(0);
    expect(next.trash).toHaveLength(1);
    expect(next.trash[0].id).toBe("batch-1");
  });

  it("clears one workspace and preserves others", () => {
    const initial = {
      ...createInitialGlobalState(),
      batches: [
        createBatch("default-batch", "default", ["default-img"]),
        createBatch("other-batch", "ws-1", ["other-img"]),
      ],
    };

    const next = globalReducer(initial, {
      type: "CLEAR_WORKSPACE",
      workspaceId: "ws-1",
    });

    expect(next.batches.map((batch) => batch.id)).toEqual(["default-batch"]);
    expect(next.trash.map((batch) => batch.id)).toEqual(["other-batch"]);
  });

  it("restores one batch from trash back into batches", () => {
    const trashedBatch = createBatch("trashed", "default", ["img-1"]);
    const initial = {
      ...createInitialGlobalState(),
      trash: [trashedBatch],
    };

    const next = globalReducer(initial, {
      type: "RESTORE_FROM_TRASH",
      batchId: "trashed",
    });

    expect(next.trash).toHaveLength(0);
    expect(next.batches.map((batch) => batch.id)).toEqual(["trashed"]);
  });

  it("preserves existing slices when hydrate payload contains undefined values", () => {
    const initial = {
      ...createInitialGlobalState(),
      logs: [{ id: "log-1", timestamp: 1, message: "ready" }],
      batches: [createBatch("batch-1", "default", ["img-1"])],
      trash: [createBatch("trash-1", "default", ["trash-img"])],
      bgConfig: { density: 0.2, speed: 0.01 },
      isBackgroundEnabled: false,
    };

    const next = globalReducer(initial, {
      type: "HYDRATE_STATE",
      state: {
        logs: undefined,
        batches: undefined,
        trash: undefined,
        bgConfig: undefined,
        workspaces: undefined,
      },
    });

    expect(next.logs).toEqual(initial.logs);
    expect(next.batches).toEqual(initial.batches);
    expect(next.trash).toEqual(initial.trash);
    expect(next.bgConfig).toEqual(initial.bgConfig);
    expect(next.isBackgroundEnabled).toBe(false);
    expect(next.workspaces).toEqual(initial.workspaces);
    expect(next.activeWorkspaceId).toBe(initial.activeWorkspaceId);
  });
});
