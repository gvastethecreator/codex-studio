import { Effect } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createGenerationTaskSpec, type Job } from '../../../packages/shared/src';
import type { PromptTransportSnapshot } from '../../../packages/shared/src/promptTransport';
import type { EmbedResult, ImageGenMetadata } from './metadataEmbedder';
import { createWorkerAssetFinalizer } from './workerAssetFinalizer';
import { jobImageMetadata } from './providers/jobImageMetadata';

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: overrides.id ?? 'job-finalizer-1',
    workspaceId: overrides.workspaceId ?? 'default',
    kind: overrides.kind ?? 'image_generate',
    providerId: overrides.providerId ?? 'codex',
    sourceSpec: overrides.sourceSpec ?? null,
    status: overrides.status ?? 'running',
    execution: overrides.execution ?? null,
    finalization: overrides.finalization ?? null,
    libraryContext: overrides.libraryContext ?? null,
    originalPrompt: overrides.originalPrompt ?? 'prompt',
    expandedPrompt: overrides.expandedPrompt ?? null,
    finalPromptUsed: overrides.finalPromptUsed ?? 'prompt',
    error: overrides.error ?? null,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
    completedAt: overrides.completedAt ?? null,
  };
}

describe('workerAssetFinalizer', () => {
  it('uses the compiled Codex prompt without calling the coordinator an image model', () => {
    const result = jobImageMetadata(
      createJob({
        providerId: 'codex',
        execution: { model: 'gpt-5.5', reasoningEffort: 'medium' },
        sourceSpec: createGenerationTaskSpec({
          id: 'job-codex',
          providerId: 'codex',
          task: 'image_generate',
          prompt: 'A brass key',
          negativePrompt: 'text',
        }),
      }),
    );
    expect(result.prompt).toContain('A brass key');
    expect(result.prompt).toContain('Avoid:\ntext');
    expect(result.model).toBe('unknown');
  });

  it('finalizes asset using organized path for file and public URL', async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'worker-asset-finalizer-'));
    const organizedPath = path.join(tempRoot, 'outputs', 'final.png');
    mkdirSync(path.dirname(organizedPath), { recursive: true });
    writeFileSync(organizedPath, 'png', 'utf8');

    const addAsset = vi.fn(() => ({
      id: 'asset-1',
      workspaceId: 'default',
      jobId: 'job-finalizer-1',
      filePath: organizedPath,
      thumbnailPath: `${organizedPath}.thumb.webp`,
      publicUrl: '/library/outputs/final.png',
      prompt: 'prompt',
      width: null,
      height: null,
      mimeType: 'image/png',
      createdAt: new Date().toISOString(),
      deletedAt: null,
    }));
    const registerCatalogImage = vi.fn(() => ({
      id: 'catalog-1',
      libraryId: 'library-1',
      filePath: organizedPath,
      thumbnailPath: `${organizedPath}.thumb.webp`,
      publicUrl: '/library/outputs/final.png',
      thumbnailUrl: '/library/outputs/final.thumb.webp',
      prompt: 'prompt',
      negativePrompt: null,
      aspectRatio: null,
      imageSize: null,
      width: null,
      height: null,
      mimeType: 'image/png',
      fileSizeBytes: 3,
      jobId: 'job-finalizer-1',
      workspaceId: 'workspace-1',
      batchId: 'batch-1',
      recipeId: null,
      isFavorite: false,
      isDeleted: false,
      deletedAt: null,
      tags: [],
      generationConfig: null,
      createdAt: new Date().toISOString(),
    }));
    const publishEvent = vi.fn();
    const updateJobStatus = vi.fn();
    const updateJobFinalization = vi.fn();
    const getJob = vi.fn(() => createJob());
    const toPublicAssetUrl = vi.fn(() => '/library/outputs/final.png');
    const addJobEvent = vi.fn();
    const logger = vi.fn();
    const embedMetadataMock = vi.fn<
      (filePath: string, metadata: ImageGenMetadata) => Promise<EmbedResult>
    >(async () => {
      writeFileSync(organizedPath, 'png with metadata', 'utf8');
      return { filePath: organizedPath, bytesWritten: 17, format: 'png' };
    });
    const parsePromptTransportMock = vi.fn<
      (prompt: string | null | undefined) => PromptTransportSnapshot
    >(() => ({
      prompt: 'prompt',
      negativePrompt: '',
      aspectRatio: '1:1',
      imageSize: '1024x1024',
      recipeId: null,
      recipeContext: '',
    }));

    const finalizer = createWorkerAssetFinalizer({
      registerCatalogImage,
      getCatalogImageByJobId: vi.fn(() => null),
      updateCatalogImageFileSize: vi.fn(),
      addAsset,
      getAssetByJobId: vi.fn(() => null),
      addJobEvent,
      updateJobStatus,
      updateJobFinalization,
      publishEvent,
      getJob,
      toPublicAssetUrl,
      logger,
      embedMetadata: embedMetadataMock,
      parsePromptTransport: parsePromptTransportMock,
      resolveCatalogGenerationConfig: vi.fn(() => ({
        prompt: 'prompt',
      })),
      resolveGeneratedAssetTargetPath: vi.fn(() => organizedPath),
      moveGeneratedAssetToPath: vi.fn(() => organizedPath),
      inferGeneratedAssetMimeType: vi.fn(() => 'image/png'),
      ensureThumbnailVariant: vi.fn(async () => `${organizedPath}.thumb.webp`),
    });

    try {
      await Effect.runPromise(
        Effect.scoped(
          finalizer.finalizeJobAsset({
            job: createJob({
              providerId: 'chatgpt',
              finalPromptUsed: 'Un faro al amanecer',
              sourceSpec: createGenerationTaskSpec({
                id: 'job-finalizer-1',
                task: 'image_generate',
                providerId: 'chatgpt',
                prompt: 'Un faro al amanecer',
                negativePrompt: 'sin texto',
              }),
              execution: {
                model: 'gpt-5.5',
                reasoningEffort: 'medium',
                providerOptions: { chatgpt: { imageModel: 'gpt-image-2.5-sunburst' } },
              },
              libraryContext: { libraryId: 'library-1', rootPath: tempRoot },
            }),
            catalogContext: {
              workspaceId: 'workspace-1',
              batchId: 'batch-1',
            },
            discoveredImagePath: 'D:/tmp/discovered.png',
            providerId: 'chatgpt',
            options: {
              logPrefix: 'External provider',
            },
          }),
        ),
      );

      expect(toPublicAssetUrl).toHaveBeenCalledWith(organizedPath, {
        libraryId: 'library-1',
        rootPath: tempRoot,
      });
      expect(addAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          filePath: organizedPath,
          thumbnailPath: `${organizedPath}.thumb.webp`,
          publicUrl: '/library/outputs/final.png',
        }),
      );
      expect(registerCatalogImage).toHaveBeenCalledWith(
        expect.objectContaining({
          libraryId: 'library-1',
          filePath: organizedPath,
          thumbnailPath: `${organizedPath}.thumb.webp`,
          fileSizeBytes: 17,
        }),
      );
      expect(embedMetadataMock).toHaveBeenCalledWith(
        organizedPath,
        expect.objectContaining({
          prompt: expect.stringContaining('Un faro al amanecer'),
          model: 'gpt-image-2.5-sunburst',
        }),
      );
      expect(embedMetadataMock.mock.calls[0][1].prompt).toContain('Avoid:\nsin texto');
      expect(updateJobStatus).toHaveBeenCalledWith('job-finalizer-1', 'completed');
      expect(updateJobFinalization.mock.calls.map((call) => call[1].state)).toEqual([
        'moving_asset',
        'asset_moved',
        'asset_recorded',
        'catalog_recorded',
        'completed',
      ]);
      expect(publishEvent).toHaveBeenCalledWith('job.completed', expect.anything());
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it('resumes after an Asset checkpoint without duplicating Asset or Catalog rows', async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'worker-asset-resume-'));
    const organizedPath = path.join(tempRoot, 'outputs', 'final.png');
    mkdirSync(path.dirname(organizedPath), { recursive: true });
    writeFileSync(organizedPath, 'png', 'utf8');
    const existingAsset = {
      id: 'asset-existing',
      workspaceId: 'default',
      jobId: 'job-finalizer-1',
      filePath: organizedPath,
      thumbnailPath: null,
      publicUrl: '/library/library-1/outputs/final.png',
      prompt: 'prompt',
      width: null,
      height: null,
      mimeType: 'image/png',
      createdAt: new Date().toISOString(),
      deletedAt: null,
    };
    const existingCatalog = {
      id: 'catalog-existing',
      libraryId: 'library-1',
      filePath: organizedPath,
      thumbnailPath: null,
      publicUrl: existingAsset.publicUrl,
      thumbnailUrl: null,
      prompt: 'prompt',
      negativePrompt: null,
      aspectRatio: null,
      imageSize: null,
      width: null,
      height: null,
      mimeType: 'image/png',
      fileSizeBytes: 3,
      jobId: 'job-finalizer-1',
      workspaceId: null,
      batchId: null,
      recipeId: null,
      isFavorite: false,
      isDeleted: false,
      deletedAt: null,
      tags: [],
      generationConfig: null,
      createdAt: new Date().toISOString(),
    };
    const addAsset = vi.fn();
    const registerCatalogImage = vi.fn();
    const publishEvent = vi.fn();
    const updateJobStatus = vi.fn();
    const updateJobFinalization = vi.fn();
    const job = createJob({
      providerId: 'google',
      execution: { model: 'gemini-image', reasoningEffort: 'medium' },
      sourceSpec: createGenerationTaskSpec({
        id: 'job-finalizer-1',
        providerId: 'google',
        task: 'image_generate',
        prompt: 'prompt',
        metadata: { variationBrief: 'Warm light' },
        negativePrompt: 'text',
      }),
      libraryContext: { libraryId: 'library-1', rootPath: tempRoot },
      finalization: {
        state: 'asset_recorded',
        sourcePath: 'D:/provider/result.png',
        filePath: organizedPath,
        assetId: existingAsset.id,
        catalogId: null,
      },
    });
    const embedMetadata = vi.fn(async () => {
      writeFileSync(organizedPath, 'png with metadata', 'utf8');
      return { filePath: organizedPath, bytesWritten: 17, format: 'png' as const };
    });
    const updateCatalogImageFileSize = vi.fn(() => ({ ...existingCatalog, fileSizeBytes: 17 }));
    const finalizer = createWorkerAssetFinalizer({
      registerCatalogImage,
      getCatalogImageByJobId: vi.fn(() => existingCatalog),
      updateCatalogImageFileSize,
      addAsset,
      getAssetByJobId: vi.fn(() => existingAsset),
      addJobEvent: vi.fn(),
      updateJobStatus,
      updateJobFinalization,
      publishEvent,
      getJob: vi.fn(() => job),
      toPublicAssetUrl: vi.fn(() => existingAsset.publicUrl),
      logger: vi.fn(),
      embedMetadata,
      parsePromptTransport: vi.fn(() => ({
        prompt: 'prompt',
        negativePrompt: '',
        aspectRatio: null,
        imageSize: null,
        recipeId: null,
        recipeContext: '',
      })),
      resolveCatalogGenerationConfig: vi.fn(() => ({})),
      resolveGeneratedAssetTargetPath: vi.fn(() => organizedPath),
      moveGeneratedAssetToPath: vi.fn(() => organizedPath),
      inferGeneratedAssetMimeType: vi.fn(() => 'image/png'),
      ensureThumbnailVariant: vi.fn(async () => organizedPath),
    });

    try {
      await Effect.runPromise(
        Effect.scoped(
          finalizer.finalizeJobAsset({
            job,
            catalogContext: { workspaceId: 'project-1', batchId: null },
            discoveredImagePath: organizedPath,
            providerId: 'google',
            options: { logPrefix: 'Recovered' },
          }),
        ),
      );

      expect(addAsset).not.toHaveBeenCalled();
      expect(registerCatalogImage).not.toHaveBeenCalled();
      expect(embedMetadata).toHaveBeenCalledWith(
        organizedPath,
        expect.objectContaining({
          prompt: 'prompt\n\nVariation brief:\nWarm light\n\nAvoid: text',
          model: 'gemini-image',
        }),
      );
      expect(updateCatalogImageFileSize).toHaveBeenCalledWith('catalog-existing', 17);
      expect(publishEvent).toHaveBeenCalledWith(
        'catalog.updated',
        expect.objectContaining({ fileSizeBytes: 17 }),
      );
      expect(publishEvent).not.toHaveBeenCalledWith('asset.created', expect.anything());
      expect(publishEvent).not.toHaveBeenCalledWith('catalog.created', expect.anything());
      expect(updateJobFinalization).toHaveBeenLastCalledWith(
        'job-finalizer-1',
        expect.objectContaining({
          state: 'completed',
          assetId: 'asset-existing',
          catalogId: 'catalog-existing',
        }),
      );
      expect(updateJobStatus).toHaveBeenCalledWith('job-finalizer-1', 'completed');
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
