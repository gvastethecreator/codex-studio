/** @vitest-environment jsdom */
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { CatalogImage, CatalogPage } from '../packages/shared/src';
import { useCatalogPage } from './useCatalogPage';
import { useStudioCatalogController } from './useCatalog';
import { useCatalogWorkspaceSummaries } from './useCatalogWorkspaceSummaries';

const api = vi.hoisted(() => ({ query: vi.fn(), detail: vi.fn(), summaries: vi.fn() }));
vi.mock('../services/studio-api/catalog', () => ({
  queryCatalog: api.query,
  getCatalogImageDetail: api.detail,
  queryCatalogWorkspaceSummaries: api.summaries,
  deleteCatalogImage: vi.fn(),
  archiveCatalogByFilter: vi.fn(),
  purgeCatalogByFilter: vi.fn(),
  restoreCatalogByFilter: vi.fn(),
  updateCatalogImage: vi.fn(),
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
const emptyPage = {
  images: [],
  total: 0,
  hasMore: false,
} satisfies CatalogPage;

it('shares detail reads and rejects detail responses from a previous filter generation', async () => {
  const entry = { id: 'one', createdAt: '2026-09-01', batchId: 'batch' } as CatalogImage;
  api.query.mockResolvedValue({ ...emptyPage, images: [entry], total: 1 });
  let resolve!: (value: CatalogImage) => void;
  api.detail.mockImplementation(
    () =>
      new Promise<CatalogImage>((done) => {
        resolve = done;
      }),
  );
  const { result, rerender } = renderHook(({ workspaceId }) => useCatalogPage({ workspaceId }), {
    initialProps: { workspaceId: 'a' },
  });
  await waitFor(() => expect(result.current.entries).toHaveLength(1));
  let first!: Promise<void>;
  act(() => {
    first = result.current.hydrateDetail('one');
    void result.current.hydrateDetail('one');
  });
  expect(api.detail).toHaveBeenCalledTimes(1);
  api.query.mockResolvedValue(emptyPage);
  rerender({ workspaceId: 'b' });
  await waitFor(() => expect(result.current.entries).toHaveLength(0));
  await act(async () => {
    resolve(entry);
    await first;
  });
  expect(result.current.entries).toHaveLength(0);
});

it('queries trash only when it opens, including after an all-catalog refresh', async () => {
  api.query.mockResolvedValue(emptyPage);
  api.summaries.mockResolvedValue([]);
  const addToast = vi.fn();
  const { result, rerender } = renderHook(
    ({ isTrashOpen }) =>
      useStudioCatalogController({ activeWorkspaceId: 'default', isTrashOpen, addToast }),
    { initialProps: { isTrashOpen: false } },
  );
  await waitFor(() => expect(api.query).toHaveBeenCalledTimes(1));
  await act(async () => {
    await result.current.refreshCatalogs();
  });
  expect(api.query.mock.calls.filter(([query]) => query.deleted)).toHaveLength(0);
  rerender({ isTrashOpen: true });
  await waitFor(() =>
    expect(api.query.mock.calls.filter(([query]) => query.deleted)).toHaveLength(1),
  );
});

it('ignores a workspace summary response older than the latest refresh', async () => {
  let resolveOld!: (value: never[]) => void;
  api.summaries
    .mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolveOld = done;
        }),
    )
    .mockResolvedValue([{ workspaceId: 'new' }]);
  const { result } = renderHook(() => useCatalogWorkspaceSummaries());
  await act(async () => {
    await result.current.refresh();
  });
  await act(async () => {
    resolveOld([]);
  });
  expect(result.current.summaries).toEqual([{ workspaceId: 'new' }]);
});
