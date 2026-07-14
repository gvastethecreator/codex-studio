import { statSync } from 'node:fs';
import path from 'node:path';
import type { getCatalogImageByJobId, registerCatalogImage } from './catalog';
import type {
  addAsset,
  addJobEvent,
  getAssetByJobId,
  getJob,
  updateJobFinalization,
  updateJobStatus,
} from './db';
import type { publishEvent } from './events';
import type { toPublicAssetUrl } from './library';
import { ensureThumbnailVariant as ensureThumbnailVariantDefault } from './libraryAssetVariants';
import type { log } from './logger';
import type { embedMetadata } from './metadataEmbedder';
import type { parsePromptTransport } from '../../../packages/shared/src/promptTransport';
import type { Job } from '../../../packages/shared/src/types';
import type { resolveJobExecutionOptions } from './codex/executionOptions';
import type { resolveJobCatalogContext } from './workerCatalogContext';

interface WorkerAssetFinalizerDependencies {
  registerCatalogImage: typeof registerCatalogImage;
  getCatalogImageByJobId: typeof getCatalogImageByJobId;
  addAsset: typeof addAsset;
  getAssetByJobId: typeof getAssetByJobId;
  addJobEvent: typeof addJobEvent;
  updateJobStatus: typeof updateJobStatus;
  updateJobFinalization: typeof updateJobFinalization;
  publishEvent: typeof publishEvent;
  getJob: typeof getJob;
  toPublicAssetUrl: typeof toPublicAssetUrl;
  logger: typeof log;
  embedMetadata: typeof embedMetadata;
  parsePromptTransport: typeof parsePromptTransport;
  resolveExecutionOptions: typeof resolveJobExecutionOptions;
  resolveCatalogGenerationConfig: (job: Job) => Record<string, unknown>;
  resolveGeneratedAssetTargetPath: (
    job: Job,
    providerId: string | null,
    extension: string,
  ) => string;
  moveGeneratedAssetToPath: (filePath: string, targetPath: string) => string;
  inferGeneratedAssetMimeType: (filePath: string) => string;
  ensureThumbnailVariant?: typeof ensureThumbnailVariantDefault;
}

interface FinalizeWorkerAssetOptions {
  logPrefix: string;
  embedMetadata?: boolean;
  executionOptions?: ReturnType<typeof resolveJobExecutionOptions>;
  width?: number | null;
  height?: number | null;
}

export function createWorkerAssetFinalizer({
  registerCatalogImage,
  getCatalogImageByJobId,
  addAsset,
  getAssetByJobId,
  addJobEvent,
  updateJobStatus,
  updateJobFinalization,
  publishEvent,
  getJob,
  toPublicAssetUrl,
  logger,
  embedMetadata,
  parsePromptTransport,
  resolveCatalogGenerationConfig,
  resolveGeneratedAssetTargetPath,
  moveGeneratedAssetToPath,
  inferGeneratedAssetMimeType,
  ensureThumbnailVariant = ensureThumbnailVariantDefault,
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
    const checkpoint = job.finalization ?? null;
    const sourcePath = checkpoint?.sourcePath ?? discoveredImagePath;
    const targetPath =
      checkpoint?.filePath ??
      resolveGeneratedAssetTargetPath(
        job,
        providerId,
        path.extname(discoveredImagePath).toLowerCase() || '.png',
      );
    updateJobFinalization(job.id, {
      state: 'moving_asset',
      sourcePath,
      filePath: targetPath,
      assetId: checkpoint?.assetId ?? null,
      catalogId: checkpoint?.catalogId ?? null,
    });
    const organizedImagePath = moveGeneratedAssetToPath(sourcePath, targetPath);
    const mimeType = inferGeneratedAssetMimeType(organizedImagePath);
    updateJobFinalization(job.id, {
      state: 'asset_moved',
      sourcePath,
      filePath: organizedImagePath,
      assetId: checkpoint?.assetId ?? null,
      catalogId: checkpoint?.catalogId ?? null,
    });
    let thumbnailPath: string | null = null;

    try {
      thumbnailPath = await ensureThumbnailVariant(organizedImagePath);
    } catch (error) {
      logger(
        'warn',
        'thumbnail',
        `Thumbnail generation failed: ${error instanceof Error ? error.message : String(error)}`,
        job.id,
      );
    }

    const existingAsset = getAssetByJobId(job.id, organizedImagePath);
    const asset =
      existingAsset ??
      addAsset({
        projectId: job.projectId,
        jobId: job.id,
        filePath: organizedImagePath,
        thumbnailPath,
        publicUrl: job.libraryContext
          ? toPublicAssetUrl(organizedImagePath, job.libraryContext)
          : toPublicAssetUrl(organizedImagePath),
        prompt: job.finalPromptUsed,
        width: options.width ?? null,
        height: options.height ?? null,
        mimeType,
      });
    updateJobFinalization(job.id, {
      state: 'asset_recorded',
      sourcePath,
      filePath: organizedImagePath,
      assetId: asset.id,
      catalogId: checkpoint?.catalogId ?? null,
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

    const existingCatalogImage = getCatalogImageByJobId(job.id, asset.filePath);
    const catalogImage =
      existingCatalogImage ??
      registerCatalogImage({
        libraryId: job.libraryContext?.libraryId ?? null,
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
    updateJobFinalization(job.id, {
      state: 'catalog_recorded',
      sourcePath,
      filePath: organizedImagePath,
      assetId: asset.id,
      catalogId: catalogImage.id,
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

    if (!existingAsset) {
      addJobEvent(job.id, 'asset.created', `${options.logPrefix} asset imported.`, {
        assetId: asset.id,
      });
      publishEvent('asset.created', asset);
    }
    if (!existingCatalogImage) {
      publishEvent('catalog.created', catalogImage);
    }
    updateJobFinalization(job.id, {
      state: 'completed',
      sourcePath,
      filePath: organizedImagePath,
      assetId: asset.id,
      catalogId: catalogImage.id,
    });
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
