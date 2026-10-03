import { randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readFile, realpath, rm } from 'node:fs/promises';
import path from 'node:path';
import type { CatalogImage, Job, JobLibraryContext } from '../../../packages/shared/src';
import type {
  ImageConversionRequest,
  ImageConversionResult,
} from '../../../packages/shared/src/imageConversion';
import { cleanOutputPathPart } from '../../../packages/shared/src/outputLayout';
import type { StudioCatalogStore } from './catalogStore';
import type { StudioLibrary } from './libraries';
import { catalogImageMetadata, jobImageMetadata } from './providers/jobImageMetadata';
import { embedMetadata, extractMetadata, type ImageGenMetadata } from './metadataEmbedder';
import { reserveOutputPath } from './outputDestination';
import { authoringSharp } from './sharpAuthoringAdapter';

export class ImageConversionError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 404 | 409,
  ) {
    super(message);
  }
}

export interface ImageConversionDependencies {
  catalogStore: Pick<StudioCatalogStore, 'getCatalogImage' | 'registerCatalogImage'>;
  getLibrary: (id: string) => StudioLibrary | null;
  getJob: (id: string) => Job | null;
  readLibraryContext: (workspaceId?: string) => JobLibraryContext;
  readLibraryDir: () => string;
  publishEvent: (type: string, payload: unknown) => void;
}

type ConversionOutput =
  | { kind: 'library'; result: ImageConversionResult }
  | {
      kind: 'download';
      bytes: Buffer;
      filename: string;
      sourceBytes: number;
      outputBytes: number;
      mimeType: string;
    };

function isInside(root: string, filePath: string) {
  const relative = path.relative(root, filePath);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

async function sourceMetadata(image: CatalogImage, getJob: ImageConversionDependencies['getJob']) {
  const embedded = await extractMetadata(image.filePath);
  if (embedded) return embedded;
  const job = image.jobId ? getJob(image.jobId) : null;
  return {
    ...(job ? jobImageMetadata(job) : catalogImageMetadata(image)),
    negativePrompt: image.negativePrompt,
    aspectRatio: image.aspectRatio,
    imageSize: image.imageSize,
    recipe: image.recipeId,
    batchId: image.batchId,
    generatedAt: image.createdAt,
    studioVersion: '0.0.0',
  } satisfies ImageGenMetadata;
}

export function createImageConversion({
  catalogStore,
  getLibrary,
  getJob,
  readLibraryContext,
  readLibraryDir,
  publishEvent,
}: ImageConversionDependencies) {
  return async (id: string, options: ImageConversionRequest): Promise<ConversionOutput> => {
    const source = catalogStore.getCatalogImage(id);
    if (!source || source.isDeleted) {
      throw new ImageConversionError('Catalog image not found.', 404);
    }
    const library = getLibrary(source.libraryId);
    if (!library) throw new ImageConversionError('The image library is not registered.', 400);
    let sourcePath: string;
    try {
      sourcePath = await realpath(source.filePath);
      if (!isInside(await realpath(library.path), sourcePath)) {
        throw new ImageConversionError('The image must stay inside its registered library.', 400);
      }
    } catch (error) {
      if (error instanceof ImageConversionError) throw error;
      throw new ImageConversionError('The source image is no longer available.', 404);
    }
    const originalBytes = await readFile(sourcePath);
    const pipeline = authoringSharp(originalBytes).autoOrient().keepIccProfile();
    const info = await pipeline.metadata();
    if ((info.pages ?? 1) > 1) {
      throw new ImageConversionError(
        'Animated images cannot be converted with these controls.',
        400,
      );
    }
    if (!info.format || !['png', 'jpeg', 'webp', 'avif', 'heif'].includes(info.format)) {
      throw new ImageConversionError('Choose a PNG, JPG, WebP or AVIF image.', 400);
    }
    if (
      options.format === 'webp' &&
      options.lossless &&
      (info.depth === 'ushort' || (info.bitsPerSample ?? 8) > 8)
    ) {
      throw new ImageConversionError(
        "Lossless WebP supports 8-bit images. Choose PNG to preserve this image's higher bit depth.",
        400,
      );
    }
    const metadata = await sourceMetadata(source, getJob);
    if (options.preserveMetadata) pipeline.keepMetadata();
    if (options.format === 'jpeg') {
      pipeline.flatten({ background: options.background }).jpeg({
        quality: options.quality,
        mozjpeg: true,
      });
    } else if (options.format === 'webp') {
      pipeline.webp({ quality: options.quality, lossless: options.lossless, alphaQuality: 100 });
    } else {
      if (info.depth === 'ushort') {
        pipeline.toColourspace(info.space === 'grey16' ? 'grey16' : 'rgb16');
      }
      pipeline.png({
        compressionLevel: options.pngCompressionLevel,
        adaptiveFiltering: true,
        palette: false,
      });
    }

    const context =
      options.destination === 'library'
        ? readLibraryContext(source.workspaceId ?? undefined)
        : null;
    const stateRoot = path.join(context?.rootPath ?? readLibraryDir(), '.studio', 'state');
    await mkdir(stateRoot, { recursive: true });
    const temporaryDirectory = await mkdtemp(path.join(stateRoot, 'image-conversion-'));
    const extension = options.format === 'jpeg' ? 'jpg' : options.format;
    const filename = `${cleanOutputPathPart(path.parse(source.filePath).name, 'image')}-converted.${extension}`;
    const temporaryPath = path.join(temporaryDirectory, `image.${extension}`);
    const mimeType = `image/${options.format}`;
    try {
      const encoded = await pipeline.toFile(temporaryPath);
      const output = context
        ? (context.output ?? {
            libraryId: context.libraryId,
            rootPath: path.join(context.rootPath, 'outputs'),
          })
        : null;
      if (options.preserveMetadata) {
        await embedMetadata(temporaryPath, {
          ...metadata,
          libraryId: output?.libraryId ?? null,
          catalogId: null,
        });
      }
      const bytes = await readFile(temporaryPath);
      if (options.destination === 'download') {
        return {
          kind: 'download',
          bytes,
          filename,
          mimeType,
          sourceBytes: originalBytes.length,
          outputBytes: bytes.length,
        };
      }

      if (!output) throw new ImageConversionError('Choose a registered output directory.', 409);
      const outputLibrary = getLibrary(output.libraryId);
      if (!outputLibrary) {
        throw new ImageConversionError(
          'The selected output directory is no longer registered.',
          409,
        );
      }
      await mkdir(output.rootPath, { recursive: true });
      const root = await realpath(output.rootPath);
      const registeredRoot = await realpath(outputLibrary.path);
      if (root !== registeredRoot && !isInside(registeredRoot, root)) {
        throw new ImageConversionError('The output must stay inside its registered library.', 400);
      }
      const destinationPath = reserveOutputPath(
        root,
        path.join(root, filename),
        path.join(stateRoot, 'output-reservations'),
        `conversion:${randomUUID()}`,
      );
      await copyFile(temporaryPath, destinationPath, constants.COPYFILE_EXCL);
      let image: CatalogImage;
      try {
        image = catalogStore.registerCatalogImage({
          libraryId: output.libraryId,
          filePath: destinationPath,
          mimeType,
          fileSizeBytes: bytes.length,
          width: encoded.width,
          height: encoded.height,
          prompt: source.prompt,
          negativePrompt: source.negativePrompt,
          aspectRatio: source.aspectRatio,
          imageSize: source.imageSize,
          workspaceId: source.workspaceId,
          batchId: source.batchId,
          recipeId: source.recipeId,
          tags: source.tags,
          jobId: null,
          generationConfig: {
            ...source.generationConfig,
            imageConversion: {
              sourceCatalogId: source.id,
              sourceJobId: source.jobId,
              originalPrompt: metadata.prompt,
              originalModel: metadata.model,
              options,
            },
          },
        });
      } catch (error) {
        await rm(destinationPath, { force: true });
        throw error;
      }
      publishEvent('catalog.created', image);
      return {
        kind: 'library',
        result: {
          image,
          filename: path.basename(destinationPath),
          sourceBytes: originalBytes.length,
          outputBytes: bytes.length,
        },
      };
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  };
}
