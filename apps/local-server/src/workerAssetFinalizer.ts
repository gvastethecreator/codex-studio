import { statSync } from 'node:fs';
import path from 'node:path';
import type { registerCatalogImage } from './catalog';
import type { addAsset, addJobEvent, getJob, updateJobStatus } from './db';
import type { publishEvent } from './events';
import type { toPublicAssetUrl } from './library';
import type { log } from './logger';
import type { embedMetadata } from './metadataEmbedder';
import type { parsePromptTransport } from '../../../packages/shared/src/promptTransport';
import type { Job } from '../../../packages/shared/src/types';
import type { resolveJobExecutionOptions } from './codex/executionOptions';
import type { resolveJobCatalogContext } from './workerCatalogContext';

interface WorkerAssetFinalizerDependencies {
  registerCatalogImage: typeof registerCatalogImage;
  addAsset: typeof addAsset;
  addJobEvent: typeof addJobEvent;
  updateJobStatus: typeof updateJobStatus;
  publishEvent: typeof publishEvent;
  getJob: typeof getJob;
  toPublicAssetUrl: typeof toPublicAssetUrl;
  logger: typeof log;
  embedMetadata: typeof embedMetadata;
  parsePromptTransport: typeof parsePromptTransport;
  resolveExecutionOptions: typeof resolveJobExecutionOptions;
  resolveCatalogGenerationConfig: (job: Job) => Record<string, unknown>;
  organizeGeneratedAssetPath: (job: Job, filePath: string, providerId: string | null) => string;
  inferGeneratedAssetMimeType: (filePath: string) => string;
}

interface FinalizeWorkerAssetOptions {
  logPrefix: string;
  embedMetadata?: boolean;
  executionOptions?: ReturnType<typeof resolveJobExecutionOptions>;
}

export function createWorkerAssetFinalizer({
  registerCatalogImage,
  addAsset,
  addJobEvent,
  updateJobStatus,
  publishEvent,
  getJob,
  toPublicAssetUrl,
  logger,
  embedMetadata,
  parsePromptTransport,
  resolveCatalogGenerationConfig,
  organizeGeneratedAssetPath,
  inferGeneratedAssetMimeType,
}: WorkerAssetFinalizerDependencies) {
  async function finalizeJobAsset({
    job,
    catalogContext,
    discoveredImagePath,
    providerId,
    options,
  }: {
    job: Job;
    catalogContext: ReturnType<typeof resolveJobCatalogContext>;
    discoveredImagePath: string;
    providerId: string;
    options: FinalizeWorkerAssetOptions;
  }) {
    const mimeType = inferGeneratedAssetMimeType(discoveredImagePath);
    const organizedImagePath = organizeGeneratedAssetPath(job, discoveredImagePath, providerId);

    const asset = addAsset({
      projectId: job.projectId,
      jobId: job.id,
      filePath: organizedImagePath,
      thumbnailPath: null,
      publicUrl: toPublicAssetUrl(organizedImagePath),
      prompt: job.finalPromptUsed,
      width: null,
      height: null,
      mimeType,
    });

    const parsedPrompt = job.sourceSpec
      ? {
          prompt: job.sourceSpec.prompt,
          negativePrompt: job.sourceSpec.negativePrompt,
          aspectRatio: job.sourceSpec.output.aspectRatio,
          imageSize: job.sourceSpec.output.imageSize,
          recipeId: job.sourceSpec.recipeId,
        }
      : parsePromptTransport(job.finalPromptUsed);

    const catalogImage = registerCatalogImage({
      filePath: asset.filePath,
      thumbnailPath: asset.thumbnailPath,
      prompt: asset.prompt,
      negativePrompt: parsedPrompt.negativePrompt || null,
      aspectRatio: parsedPrompt.aspectRatio,
      imageSize: parsedPrompt.imageSize,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
      fileSizeBytes: statSync(asset.filePath).size,
      jobId: asset.jobId,
      workspaceId: catalogContext.workspaceId,
      batchId: catalogContext.batchId,
      recipeId: parsedPrompt.recipeId,
      generationConfig: resolveCatalogGenerationConfig(job),
    });

    if (options.embedMetadata && options.executionOptions) {
      void embedMetadata(asset.filePath, {
        prompt: job.finalPromptUsed,
        negativePrompt: parsedPrompt.negativePrompt || null,
        aspectRatio: parsedPrompt.aspectRatio,
        imageSize: parsedPrompt.imageSize,
        model: options.executionOptions.model,
        recipe: parsedPrompt.recipeId,
        batchId: catalogContext.batchId ?? job.id,
        generatedAt: new Date().toISOString(),
        studioVersion: '0.0.0',
        libraryId: catalogImage.libraryId,
        catalogId: catalogImage.id,
      }).catch((error) => {
        logger(
          'warn',
          'metadata',
          `Metadata embed failed: ${error instanceof Error ? error.message : String(error)}`,
          job.id,
        );
      });
    }

    addJobEvent(job.id, 'asset.created', `${options.logPrefix} asset imported.`, {
      assetId: asset.id,
    });
    publishEvent('asset.created', asset);
    publishEvent('catalog.created', catalogImage);
    updateJobStatus(job.id, 'completed');
    publishEvent('job.completed', getJob(job.id));
    logger(
      'info',
      'worker',
      `${options.logPrefix} job completed. Asset: ${path.basename(asset.filePath)}`,
      job.id,
    );
  }

  return {
    finalizeJobAsset,
  };
}
