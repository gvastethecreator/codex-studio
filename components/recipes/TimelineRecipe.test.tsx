/** @vitest-environment jsdom */
import React, { useCallback, useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { CatalogImage } from '../../packages/shared/src';
import type { Attachment, ImageGenerationConfig } from '../../types';
import { DEFAULT_GENERATION_CONFIG } from '../../constants';
import { useCatalogPage } from '../../hooks/useCatalogPage';
import { RecipeWorkbenchContext } from './RecipeWorkbenchContext';
import { TimelineRecipe } from './TimelineRecipe';

const api = vi.hoisted(() => ({ query: vi.fn(), detail: vi.fn() }));
vi.mock('../../services/studio-api/catalog', () => ({
  queryCatalog: api.query,
  getCatalogImageDetail: api.detail,
}));
const originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  if (originalScrollTo) Object.defineProperty(HTMLElement.prototype, 'scrollTo', originalScrollTo);
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo');
});

const summary: CatalogImage = {
  id: 'frame-1',
  libraryId: 'library',
  filePath: 'frame-1.svg',
  thumbnailPath: null,
  publicUrl: '/frame-1.svg',
  thumbnailUrl: null,
  prompt: 'A robot waves',
  negativePrompt: null,
  aspectRatio: '1:1',
  imageSize: '1K',
  width: 1024,
  height: 1024,
  mimeType: 'image/svg+xml',
  fileSizeBytes: null,
  jobId: null,
  workspaceId: 'default',
  batchId: null,
  recipeId: 'timeline',
  isFavorite: false,
  isDeleted: false,
  deletedAt: null,
  tags: [],
  generationConfig: null,
  detailLevel: 'summary',
  createdAt: '2026-10-02T12:00:00Z',
};

function TimelineWithCatalog({
  onAttachments,
  onRecipeParams,
}: {
  onAttachments: (value: Attachment[]) => void;
  onRecipeParams: (value: ImageGenerationConfig['recipeParams']) => void;
}) {
  const history = useCatalogPage({ workspaceId: 'default', preserveLoadedPages: true });
  const [config, setConfig] = useState<ImageGenerationConfig>({
    ...DEFAULT_GENERATION_CONFIG,
    recipeId: 'timeline',
    attachments: [
      { id: 'origin', name: 'Origin', dataUrl: 'blob:origin', strength: 1, isProcessing: true },
    ],
  });
  const updateConfig = useCallback(
    <K extends keyof ImageGenerationConfig>(key: K, value: ImageGenerationConfig[K]) => {
      setConfig((previous) => ({ ...previous, [key]: value }));
      if (key === 'attachments') onAttachments(value as Attachment[]);
      if (key === 'recipeParams') onRecipeParams(value as ImageGenerationConfig['recipeParams']);
    },
    [onAttachments, onRecipeParams],
  );
  return (
    <RecipeWorkbenchContext
      value={{
        controls: null,
        action: null,
        overlay: null,
        sidePanel: null,
        compare: null,
        setCompare: () => {},
        history,
      }}
    >
      <button type="button" onClick={() => void history.refresh()}>
        Refresh catalog
      </button>
      <div role="tablist" aria-label="Other widget">
        <button type="button" role="tab" aria-selected>
          Other tab
        </button>
      </div>
      <TimelineRecipe
        config={config}
        updateConfig={updateConfig}
        updateAttachment={() => {}}
        onFileSelect={() => {}}
        onGenerate={() => {}}
        isGenerating={false}
      />
    </RecipeWorkbenchContext>
  );
}

it('hydrates timeline indices, retries failures, and keeps later history pages navigable', async () => {
  HTMLElement.prototype.scrollTo = vi.fn();
  const second = { ...summary, id: 'frame-2', filePath: 'frame-2.svg', publicUrl: '/frame-2.svg' };
  const unrelated = { ...summary, id: 'style-image', recipeId: 'styles' };
  const otherStory = { ...summary, id: 'story-b', filePath: 'b.svg', publicUrl: '/b.svg' };
  api.query.mockImplementation(async ({ offset = 0 }) => ({
    images: offset === 0 ? [summary, unrelated, otherStory] : [second],
    total: 4,
    hasMore: offset === 0,
  }));
  const detailFor = (id: string) => ({
    ...[summary, second, otherStory].find((image) => image.id === id)!,
    detailLevel: 'detail',
    generationConfig: {
      recipeId: 'timeline',
      recipeParams:
        id === otherStory.id
          ? { nextIndex: 1, sequenceId: 'another-origin' }
          : { nextIndex: id === summary.id ? 1 : 2, sequenceId: 'origin' },
    },
  });
  let releaseStaleDetail = () => {};
  api.detail.mockImplementation(async (id: string) => detailFor(id));
  api.detail.mockRejectedValueOnce(new Error('Temporary detail failure'));
  api.detail.mockImplementationOnce(
    (id: string) =>
      new Promise((resolve) => {
        releaseStaleDetail = () => resolve(detailFor(id));
      }),
  );

  const onAttachments = vi.fn();
  const onRecipeParams = vi.fn();
  render(<TimelineWithCatalog onAttachments={onAttachments} onRecipeParams={onRecipeParams} />);
  expect((await screen.findByRole('alert')).textContent).toContain(
    'Could not load timeline frames.',
  );
  expect(screen.queryByRole('button', { name: 'SEQ.0' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  // A refresh discards the in-flight detail; hydration must start again instead of stalling.
  fireEvent.click(screen.getByRole('button', { name: 'Refresh catalog' }));
  releaseStaleDetail();
  await screen.findByRole('button', { name: 'SEQ.1' });
  // Frames from another sequence stay out of this strip.
  await waitFor(() => expect(screen.queryByText('Loading frames...')).toBeNull());
  expect(screen.getAllByRole('button', { name: 'SEQ.1' })).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'SEQ.1' }));
  expect(screen.getByText('Frame: 1')).toBeTruthy();
  // Summaries from a refresh must not drop the known index of the selected frame.
  fireEvent.click(screen.getByRole('button', { name: 'Refresh catalog' }));
  await waitFor(() => expect(api.query).toHaveBeenCalledTimes(3));
  await waitFor(() => expect(screen.queryByText('Loading frames...')).toBeNull());
  expect(screen.getByText('Frame: 1')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Load more frames' }));
  await screen.findByRole('button', { name: 'SEQ.2' });
  // Frame 2 already exists, so the next frame after frame 1 goes to the end of the sequence.
  expect(onRecipeParams).toHaveBeenLastCalledWith(
    expect.objectContaining({ nextIndex: 3, sequenceId: 'origin', sourceFrameId: 'frame-1' }),
  );
  fireEvent.click(await screen.findByRole('button', { name: 'SEQ.2' }));
  expect(screen.getByText('Frame: 2')).toBeTruthy();
  expect(onAttachments).toHaveBeenLastCalledWith([
    expect.objectContaining({
      localPath: 'frame-2.svg',
      sourceUrl: expect.stringContaining('/frame-2.svg'),
    }),
    expect.objectContaining({ id: 'origin', dataUrl: 'blob:origin', isProcessing: true }),
  ]);
  // Arrows inside another widget belong to that widget.
  fireEvent.keyDown(screen.getByRole('tab', { name: 'Other tab' }), { key: 'ArrowLeft' });
  expect(screen.getByText('Frame: 2')).toBeTruthy();
  fireEvent.keyDown(window, { key: 'ArrowLeft' });
  expect(screen.getByText('Frame: 1')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'ORIGIN' }));
  expect(screen.getByText('Frame: 0')).toBeTruthy();
  expect(onAttachments).toHaveBeenLastCalledWith([
    expect.objectContaining({ id: 'origin', dataUrl: 'blob:origin', isProcessing: true }),
  ]);
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'Load more frames' })).toBeNull(),
  );
  expect(api.detail.mock.calls.map(([id]) => id)).toEqual([
    'frame-1',
    'frame-1',
    'frame-1',
    'story-b',
    'frame-2',
  ]);
});
