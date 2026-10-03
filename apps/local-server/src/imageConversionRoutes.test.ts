import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_IMAGE_CONVERSION_OPTIONS } from '../../../packages/shared/src/imageConversion';
import type { ImageConversionResult } from '../../../packages/shared/src/imageConversion';
import { createMemoryCatalogStore } from './catalogRoutes';
import { createImageConversionRoutes } from './imageConversionRoutes';
import { embedMetadata, extractMetadata } from './metadataEmbedder';

vi.mock('./db/outputGenerations', () => ({ getOutputGeneration: () => 1 }));

describe('Catalog image conversion', () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), 'studio-conversion-'));
    await mkdir(path.join(root, 'outputs'));
  });
  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  async function fixture(bytes?: Buffer) {
    const filePath = path.join(root, '2026-10-03_183042Z_000127_image.png');
    await writeFile(
      filePath,
      bytes ??
        (await sharp({
          create: {
            width: 16,
            height: 12,
            channels: 4,
            background: { r: 100, g: 50, b: 20, alpha: 0.4 },
          },
        })
          .png()
          .toBuffer()),
    );
    const store = createMemoryCatalogStore([]);
    const source = store.registerCatalogImage({
      libraryId: 'library-1',
      filePath,
      mimeType: 'image/png',
      prompt: 'Catalog prompt',
      workspaceId: 'workspace-1',
      jobId: 'job-1',
      generationConfig: { model: 'known-image-model' },
    });
    const publishEvent = vi.fn();
    const readLibraryContext = vi.fn(() => ({ libraryId: 'library-1', rootPath: root }));
    const routes = createImageConversionRoutes({
      catalogStore: store,
      getLibrary: (id) =>
        id === 'library-1'
          ? {
              id,
              path: root,
              name: 'Test Library',
              isDefault: true,
              createdAt: '2026-10-03T00:00:00Z',
            }
          : null,
      getJob: () => null,
      readLibraryContext,
      readLibraryDir: () => root,
      publishEvent,
    });
    const convert = (options: unknown, id = source.id) =>
      routes.request(`/${id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
    return { source, store, routes, publishEvent, readLibraryContext, convert };
  }

  it.each(['jpeg', 'webp', 'png'] as const)(
    'creates a %s copy with exact generation metadata and leaves the original intact',
    async (format) => {
      const { source, store, convert, publishEvent } = await fixture();
      await embedMetadata(source.filePath, {
        prompt: 'Actual request — 日本語 🦊',
        model: 'actual-image-model',
        generatedAt: '2026-10-03T18:30:42Z',
        studioVersion: '0.0.0',
      });
      const original = await readFile(source.filePath);
      const response = await convert({
        ...DEFAULT_IMAGE_CONVERSION_OPTIONS,
        format,
        lossless: true,
        destination: 'library',
      });
      expect(response.status).toBe(200);
      const result = (await response.json()) as ImageConversionResult;
      expect(result.filename).toMatch(
        /^2026-10-03_183042Z_000127_image-converted\.(jpg|webp|png)$/,
      );
      expect(result.image).toMatchObject({
        jobId: null,
        workspaceId: 'workspace-1',
        width: 16,
        height: 12,
        generationConfig: {
          imageConversion: {
            sourceCatalogId: source.id,
            sourceJobId: 'job-1',
            originalModel: 'actual-image-model',
          },
        },
      });
      expect(await extractMetadata(result.image.filePath)).toMatchObject({
        prompt: 'Actual request — 日本語 🦊',
        model: 'actual-image-model',
      });
      const output = await readFile(result.image.filePath);
      expect(result).toMatchObject({ sourceBytes: original.length, outputBytes: output.length });
      expect(result.image.fileSizeBytes).toBe(output.length);
      expect(await sharp(output).metadata()).toMatchObject({
        format,
        width: 16,
        height: 12,
        hasAlpha: format !== 'jpeg',
      });
      if (format !== 'jpeg') {
        expect(await sharp(output).raw().toBuffer()).toEqual(
          await sharp(original).raw().toBuffer(),
        );
      } else {
        const pixels = await sharp(output).raw().toBuffer();
        expect(pixels[0]).toBeGreaterThan(180); // Explicit white matte, never the encoder's black default.
      }
      expect(await readFile(source.filePath)).toEqual(original);
      expect(store.listCatalogImageIds()).toHaveLength(2);
      expect(publishEvent).toHaveBeenCalledWith('catalog.created', result.image);
    },
  );

  it('downloads without generation metadata or catalog writes while preserving its color profile', async () => {
    const profileImage = await sharp({
      create: { width: 4, height: 2, channels: 3, background: '#ab2345' },
    })
      .withIccProfile('p3')
      .png()
      .toBuffer();
    const { source, convert, store, publishEvent, readLibraryContext } =
      await fixture(profileImage);
    await embedMetadata(source.filePath, {
      prompt: 'private prompt',
      model: 'image-model',
      generatedAt: source.createdAt,
      studioVersion: '0.0.0',
    });
    readLibraryContext.mockImplementation(() => {
      throw new Error('Removed output directory');
    });
    const original = await readFile(source.filePath);
    const response = await convert({
      destination: 'download',
      format: 'png',
      preserveMetadata: false,
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Content-Disposition')).toContain(
      "filename*=UTF-8''2026-10-03_183042Z_000127_image-converted.png",
    );
    expect(response.headers.get('X-Source-Bytes')).toBe(String(original.length));
    expect(response.headers.get('Access-Control-Expose-Headers')).toContain('X-Source-Bytes');
    const output = Buffer.from(await response.arrayBuffer());
    const meta = await sharp(output).metadata();
    expect(meta.xmp).toBeUndefined();
    expect(meta.exif).toBeUndefined();
    expect(meta.icc).toEqual((await sharp(original).metadata()).icc);
    expect(await sharp(output).raw().toBuffer()).toEqual(await sharp(original).raw().toBuffer());
    expect(output.toString('utf8')).not.toContain('private prompt');
    expect(await readFile(source.filePath)).toEqual(original);
    expect(store.listCatalogImageIds()).toHaveLength(1);
    expect(publishEvent).not.toHaveBeenCalled();
    expect(await readdir(path.join(root, 'outputs'))).toEqual([]);
    expect(await readdir(path.join(root, '.studio', 'state'))).toEqual([]);
  });

  it('keeps separate copies for concurrent requests and reconstructs a known catalog model', async () => {
    const { source, convert } = await fixture();
    const responses = await Promise.all([convert({ format: 'png' }), convert({ format: 'png' })]);
    const results = await Promise.all(
      responses.map(async (response) => {
        expect(response.status).toBe(200);
        return response.json() as Promise<ImageConversionResult>;
      }),
    );
    expect(new Set(results.map((result) => result.image.filePath)).size).toBe(2);
    for (const { image } of results) {
      expect(image.filePath).not.toBe(source.filePath);
      expect(await extractMetadata(image.filePath)).toMatchObject({
        prompt: 'Catalog prompt',
        model: 'known-image-model',
      });
    }
  });

  it('preserves all 16-bit PNG pixel values', async () => {
    const bytes = await sharp(
      new Uint16Array([12, 456, 789, 1111, 2222, 3333, 4444, 5555, 6666, 30001, 40002, 50003]),
      {
        raw: { width: 2, height: 2, channels: 3 },
      },
    )
      .toColourspace('rgb16')
      .png()
      .toBuffer();
    const { convert } = await fixture(bytes);
    expect((await sharp(bytes).metadata()).depth).toBe('ushort');
    const webp = await convert({ format: 'webp', lossless: true });
    expect(webp.status).toBe(400);
    await expect(webp.json()).resolves.toMatchObject({
      error: expect.stringContaining('Choose PNG'),
    });
    const response = await convert({ format: 'png' });
    expect(response.status).toBe(200);
    const result = (await response.json()) as ImageConversionResult;
    const output = await readFile(result.image.filePath);
    expect((await sharp(output).metadata()).depth).toBe('ushort');
    expect(await sharp(output).toColourspace('rgb16').raw({ depth: 'ushort' }).toBuffer()).toEqual(
      await sharp(bytes).toColourspace('rgb16').raw({ depth: 'ushort' }).toBuffer(),
    );
  });

  it('applies EXIF orientation and keeps the color profile without double rotation', async () => {
    const bytes = await sharp({
      create: { width: 4, height: 2, channels: 3, background: '#765432' },
    })
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();
    const { convert } = await fixture(bytes);
    const response = await convert({ format: 'png' });
    expect(response.status).toBe(200);
    const { image } = (await response.json()) as ImageConversionResult;
    expect(image).toMatchObject({ width: 2, height: 4 });
    const metadata = await sharp(image.filePath).metadata();
    expect(metadata.orientation ?? 1).toBe(1);
    expect(metadata.icc).toEqual((await sharp(bytes).metadata()).icc);
    expect(await sharp(image.filePath).raw().toBuffer()).toEqual(
      await sharp(bytes).autoOrient().raw().toBuffer(),
    );
  });

  it('cleans a failed catalog save without changing the original', async () => {
    const { source, store, convert, publishEvent } = await fixture();
    const original = await readFile(source.filePath);
    vi.spyOn(store, 'registerCatalogImage').mockImplementation(() => {
      throw new Error('Catalog unavailable');
    });
    const response = await convert({ format: 'png' });
    expect(response.status).toBe(500);
    expect(await readFile(source.filePath)).toEqual(original);
    expect(await readdir(path.join(root, 'outputs'))).toEqual([]);
    expect(
      (await readdir(path.join(root, '.studio', 'state'))).filter((name) =>
        name.startsWith('image-conversion-'),
      ),
    ).toEqual([]);
    expect(publishEvent).not.toHaveBeenCalled();
  });

  it('rejects malformed requests, missing or deleted images, escaped paths and animations', async () => {
    const { source, store, convert } = await fixture();
    for (const options of [null, { quality: 101 }, { format: 'gif' }]) {
      expect((await convert(options)).status).toBe(400);
    }
    expect((await convert({}, 'missing')).status).toBe(404);
    store.softDeleteCatalogImage(source.id);
    expect((await convert({})).status).toBe(404);
    store.restoreCatalogImage(source.id);
    const outside = await mkdtemp(path.join(os.tmpdir(), 'studio-conversion-external-'));
    try {
      await writeFile(path.join(outside, 'image.png'), await readFile(source.filePath));
      await symlink(outside, path.join(root, 'junction'), 'junction');
      const escaped = store.registerCatalogImage({
        libraryId: 'library-1',
        filePath: path.join(root, 'junction', 'image.png'),
        mimeType: 'image/png',
      });
      expect((await convert({}, escaped.id)).status).toBe(400);
    } finally {
      await rm(path.join(root, 'junction'), { force: true, recursive: true });
      await rm(outside, { force: true, recursive: true });
    }
    const animated = await sharp({
      create: { width: 2, height: 4, channels: 4, background: '#ff0000' },
    })
      .raw()
      .toBuffer();
    for (let offset = animated.length / 2; offset < animated.length; offset += 4) {
      animated[offset] = 0;
      animated[offset + 2] = 255;
    }
    const animatedPath = path.join(root, 'animated.webp');
    await sharp(animated, { raw: { width: 2, height: 4, channels: 4, pageHeight: 2 } })
      .webp({ delay: [50, 50] })
      .toFile(animatedPath);
    const animation = store.registerCatalogImage({
      libraryId: 'library-1',
      filePath: animatedPath,
      mimeType: 'image/webp',
    });
    expect((await convert({}, animation.id)).status).toBe(400);
    expect(await readdir(path.join(root, 'outputs'))).toEqual([]);
  });
});
