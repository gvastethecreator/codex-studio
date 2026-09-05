import { act, cleanup, renderHook } from '@testing-library/react';
/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import type { CatalogImage } from '../packages/shared/src';
import { createCatalogView } from '../lib/studioCatalogView';
import { buildStudioGalleryImages, useStudioGallery } from './useStudioGallery';

function catalogImage(overrides: Partial<CatalogImage> = {}): CatalogImage {
  const id = overrides.id ?? 'catalog-image';

  return {
    id,
    libraryId: overrides.libraryId ?? 'library-1',
    filePath: overrides.filePath ?? `C:/library/assets/${id}.png`,
    thumbnailPath: overrides.thumbnailPath ?? null,
    publicUrl: overrides.publicUrl ?? `/library/assets/${id}.png`,
    thumbnailUrl: overrides.thumbnailUrl ?? null,
    prompt: overrides.prompt ?? 'Catalog prompt',
    negativePrompt: overrides.negativePrompt ?? null,
    aspectRatio: overrides.aspectRatio ?? '1:1',
    imageSize: overrides.imageSize ?? '1K',
    width: overrides.width ?? null,
    height: overrides.height ?? null,
    mimeType: overrides.mimeType ?? 'image/png',
    fileSizeBytes: overrides.fileSizeBytes ?? null,
    jobId: overrides.jobId ?? 'job-1',
    workspaceId: overrides.workspaceId ?? 'default',
    batchId: overrides.batchId ?? 'catalog-batch',
    recipeId: overrides.recipeId ?? null,
    isFavorite: overrides.isFavorite ?? false,
    isDeleted: overrides.isDeleted ?? false,
    deletedAt: overrides.deletedAt ?? null,
    tags: overrides.tags ?? [],
    generationConfig: overrides.generationConfig ?? null,
    createdAt: overrides.createdAt ?? '2026-05-24T00:00:00.000Z',
  };
}

describe('buildStudioGalleryImages', () => {
  it('builds images from Catalog Entries when a Catalog View is provided', () => {
    const catalogView = createCatalogView([
      catalogImage({
        id: 'catalog-image',
        generationConfig: { prompt: 'Catalog config prompt' },
      }),
    ]);

    const images = buildStudioGalleryImages(catalogView);

    expect(images.map((image) => image.id)).toEqual(['catalog-image']);
    expect(images[0].config.prompt).toBe('Catalog config prompt');
  });

  it('preserves catalog ordering so the grid can own visible sorting once', () => {
    const catalogView = createCatalogView([
      catalogImage({
        id: 'older-favorite',
        isFavorite: true,
        createdAt: '2026-05-24T00:00:00.000Z',
      }),
      catalogImage({
        id: 'newer-plain',
        isFavorite: false,
        createdAt: '2026-05-25T00:00:00.000Z',
      }),
    ]);

    const images = buildStudioGalleryImages(catalogView);

    expect(images.map((image) => image.id)).toEqual(catalogView.entries.map((entry) => entry.id));
  });
});

afterEach(cleanup);
it('reuses gallery images for the same entries and keeps selection unique and visible', () => {
  const view = createCatalogView([catalogImage({ id: 'one' }), catalogImage({ id: 'two' })]);
  const props = {
    activeWorkspaceId: 'default',
    deleteImage: vi.fn(),
    deleteImages: vi.fn(),
    toggleImageFavorite: vi.fn(),
    clearWorkspace: vi.fn(),
    log: vi.fn(),
    modalImage: null,
    closeModal: vi.fn(),
  };
  const { result, rerender } = renderHook(
    ({ catalogView }) => useStudioGallery({ ...props, catalogView }),
    { initialProps: { catalogView: view } },
  );
  const images = result.current.imagesWithConfig;
  act(() => {
    result.current.handleSelectionChange('one', true);
    result.current.handleSelectionChange('one', true);
  });
  expect(result.current.selectedImageIds).toEqual(['one']);
  rerender({ catalogView: { ...view } });
  expect(result.current.imagesWithConfig).toBe(images);
  rerender({ catalogView: createCatalogView([catalogImage({ id: 'two' })]) });
  expect(result.current.selectedImageIds).toEqual([]);
  act(() => result.current.handleDeleteSelected(['one', 'two', 'two']));
  expect(props.deleteImages).toHaveBeenCalledWith(['two']);
});
