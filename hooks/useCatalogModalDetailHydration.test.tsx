/** @vitest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vite-plus/test';

import type { CatalogImage } from '../packages/shared/src';
import { useCatalogModalDetailHydration } from './useCatalogModalDetailHydration';

describe('useCatalogModalDetailHydration', () => {
  it('hydrates the active summary when its modal opens', async () => {
    const hydrateCatalogDetail = vi.fn(async () => {});
    const summary = { id: 'image-1', detailLevel: 'summary' } as CatalogImage;

    renderHook(() =>
      useCatalogModalDetailHydration({
        isModalOpen: true,
        activeImageId: summary.id,
        catalogById: new Map([[summary.id, summary]]),
        hydrateCatalogDetail,
        log: vi.fn(),
      }),
    );

    await waitFor(() => expect(hydrateCatalogDetail).toHaveBeenCalledWith(summary.id));
  });
});
