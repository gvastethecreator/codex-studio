import { Effect, Result } from 'effect';
import { providerOperation, providerPromise } from './providers/providerEffect';
import { readFileSync, statSync } from 'node:fs';
import { authoringSharp } from './sharpAuthoringAdapter';
import path from 'node:path';
import type {
  getCatalogImageByJobId,
  registerCatalogImage,
  updateCatalogImageFileSize,
} from './catalog';
import type { addAsset, getAssetByJobId } from './db/assets';
import type { addJobEvent } from './db/events';
import type { getJob, updateJobFinalization, updateJobStatus } from './db/jobs';
import type { publishEvent } from './events';
import type { toPublicAssetUrl } from './library';
import { ensureThumbnailVariant as ensureThumbnailVariantDefault } from './libraryAssetVariants';
import type { log } from './logger';
import type { embedMetadata } from './metadataEmbedder';
import type { parsePromptTransport } from '../../../packages/shared/src/promptTransport';
import type { Job } from '../../../packages/shared/src/types';
import { jobImageMetadata } from './providers/jobImageMetadata';
import type { resolveJobCatalogContext } from './workerCatalogContext';

interface WorkerAssetFinalizerDependencies {
  registerCatalogImage: typeof registerCatalogImage;
  getCatalogImageByJobId: typeof getCatalogImageByJobId;
  updateCatalogImageFileSize: typeof updateCatalogImageFileSize;
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
  width?: number | null;
  height?: number | null;
}

export function createWorkerAssetFinalizer({
  registerCatalogImage,
  getCatalogImageByJobId,
  updateCatalogImageFileSize,
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
  function finalizeJobAsset({
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
    return Effect.uninterruptible(
      providerOperation(
        Effect.gen(function* () {
          addJobEvent(job.id, 'asset.import.started', 'Asset import started.');
          const assetLibrary = job.libraryContext?.output ?? job.libraryContext;
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
          if (job.sourceSpec?.output.background === 'transparent') {
            const stats = Result.getOrThrowWith(
              yield* Effect.result(
                providerPromise(() => authoringSharp(readFileSync(organizedImagePath)).stats()),
              ),
              (error) => error,
            );
            if (stats.isOpaque)
              addJobEvent(
                job.id,
                'asset.transparency.warning',
                'Transparent output was requested, but this image is opaque. The original result was preserved.',
              );
          }
          updateJobFinalization(job.id, {
            state: 'asset_moved',
            sourcePath,
            filePath: organizedImagePath,
            assetId: checkpoint?.assetId ?? null,
            catalogId: checkpoint?.catalogId ?? null,
          });
          let thumbnailPath: string | null = null;

          try {
            thumbnailPath = Result.getOrThrowWith(
              yield* Effect.result(
                providerPromise(() =>
                  ensureThumbnailVariant(organizedImagePath, {
                    libraryDir: job.libraryContext?.rootPath,
                  }),
                ),
              ),
              (error) => error,
            );
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
              jobId: job.id,
              filePath: organizedImagePath,
              thumbnailPath,
              publicUrl: assetLibrary
                ? toPublicAssetUrl(organizedImagePath, assetLibrary)
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
          let metadataEmbedded = false;
          if (
            ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(asset.filePath).toLowerCase())
          ) {
            yield* providerPromise(async () => {
              try {
                await embedMetadata(asset.filePath, {
                  ...jobImageMetadata(job),
                  negativePrompt: parsedPrompt.negativePrompt || null,
                  aspectRatio: parsedPrompt.aspectRatio,
                  imageSize: parsedPrompt.imageSize,
                  recipe: parsedPrompt.recipeId,
                  batchId: catalogContext.batchId ?? job.id,
                  generatedAt: asset.createdAt,
                  studioVersion: '0.0.0',
                  libraryId: assetLibrary?.libraryId ?? null,
                });
                metadataEmbedded = true;
              } catch (error) {
                logger(
                  'warn',
                  'metadata',
                  `Metadata embed failed: ${error instanceof Error ? error.message : String(error)}`,
                  job.id,
                );
              }
            });
          }
          const fileSizeBytes = statSync(asset.filePath).size;
          if (
            existingCatalogImage &&
            metadataEmbedded &&
            existingCatalogImage.fileSizeBytes !== fileSizeBytes
          ) {
            const updated = updateCatalogImageFileSize(existingCatalogImage.id, fileSizeBytes);
            if (updated) publishEvent('catalog.updated', updated);
          }
          const catalogImage =
            existingCatalogImage ??
            registerCatalogImage({
              libraryId: assetLibrary?.libraryId ?? null,
              filePath: asset.filePath,
              thumbnailPath: asset.thumbnailPath,
              prompt: asset.prompt,
              negativePrompt: parsedPrompt.negativePrompt || null,
              aspectRatio: parsedPrompt.aspectRatio,
              imageSize: parsedPrompt.imageSize,
              width: asset.width,
              height: asset.height,
              mimeType: asset.mimeType,
              fileSizeBytes,
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

          if (!existingAsset) {
            addJobEvent(job.id, 'asset.created', `${options.logPrefix} asset imported.`, {
              assetId: asset.id,
            });
            publishEvent('asset.created', asset);
          }
          if (!existingCatalogImage) {
            publishEvent('catalog.created', catalogImage);
          }
          addJobEvent(job.id, 'asset.import.completed', 'Asset import completed.');
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
        }),
      ),
    );
  }

  return {
    finalizeJobAsset,
  };
}
