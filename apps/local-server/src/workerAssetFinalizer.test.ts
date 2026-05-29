import { describe, expect, it, vi } from "vite-plus/test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Job } from "../../../packages/shared/src";
import { createWorkerAssetFinalizer } from "./workerAssetFinalizer";

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: overrides.id ?? "job-finalizer-1",
    projectId: overrides.projectId ?? "project-1",
    kind: overrides.kind ?? "image_generate",
    providerId: overrides.providerId ?? "codex",
    sourceSpec: overrides.sourceSpec ?? null,
    status: overrides.status ?? "running",
    execution: overrides.execution ?? null,
    originalPrompt: overrides.originalPrompt ?? "prompt",
    expandedPrompt: overrides.expandedPrompt ?? null,
    finalPromptUsed: overrides.finalPromptUsed ?? "prompt",
    error: overrides.error ?? null,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
    completedAt: overrides.completedAt ?? null,
  };
}

describe("workerAssetFinalizer", () => {
  it("finalizes asset using organized path for file and public URL", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "worker-asset-finalizer-"));
    const organizedPath = path.join(tempRoot, "outputs", "final.png");
    mkdirSync(path.dirname(organizedPath), { recursive: true });
    writeFileSync(organizedPath, "png", "utf8");

    const addAsset = vi.fn(() => ({
      id: "asset-1",
      projectId: "project-1",
      jobId: "job-finalizer-1",
      filePath: organizedPath,
      thumbnailPath: null,
      publicUrl: "/library/outputs/final.png",
      prompt: "prompt",
      width: null,
      height: null,
      mimeType: "image/png",
      createdAt: new Date().toISOString(),
      deletedAt: null,
    }));
    const registerCatalogImage = vi.fn(() => ({
      id: "catalog-1",
      libraryId: "library-1",
    }));
    const publishEvent = vi.fn();
    const updateJobStatus = vi.fn();
    const getJob = vi.fn(() => createJob());
    const toPublicAssetUrl = vi.fn(() => "/library/outputs/final.png");
    const addJobEvent = vi.fn();
    const logger = vi.fn();

    const finalizer = createWorkerAssetFinalizer({
      registerCatalogImage,
      addAsset,
      addJobEvent,
      updateJobStatus,
      publishEvent,
      getJob,
      toPublicAssetUrl,
      logger,
      embedMetadata: vi.fn(async () => {}),
      parsePromptTransport: vi.fn(() => ({
        prompt: "prompt",
        negativePrompt: null,
        aspectRatio: "1:1",
        imageSize: "1024x1024",
        recipeId: null,
        recipeContext: null,
      })),
      resolveExecutionOptions: vi.fn(() => ({
        model: "gpt-5.4-mini",
        reasoningEffort: "medium",
        serviceTier: null,
      })),
      resolveCatalogGenerationConfig: vi.fn(() => ({
        prompt: "prompt",
      })),
      organizeGeneratedAssetPath: vi.fn(() => organizedPath),
      inferGeneratedAssetMimeType: vi.fn(() => "image/png"),
    });

    try {
      await finalizer.finalizeJobAsset({
        job: createJob(),
        catalogContext: {
          workspaceId: "workspace-1",
          batchId: "batch-1",
        },
        discoveredImagePath: "D:/tmp/discovered.png",
        providerId: "codex",
        options: {
          logPrefix: "Codex",
        },
      });

      expect(toPublicAssetUrl).toHaveBeenCalledWith(organizedPath);
      expect(addAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          filePath: organizedPath,
          publicUrl: "/library/outputs/final.png",
        }),
      );
      expect(updateJobStatus).toHaveBeenCalledWith("job-finalizer-1", "completed");
      expect(publishEvent).toHaveBeenCalledWith("job.completed", expect.anything());
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
