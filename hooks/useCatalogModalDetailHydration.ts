import { useEffect } from 'react';

import type { StudioCatalogView } from '../lib/studioCatalogView';

interface UseCatalogModalDetailHydrationProps {
  isModalOpen: boolean;
  activeImageId: string | null;
  catalogById: StudioCatalogView['byId'];
  hydrateCatalogDetail: (imageId: string) => Promise<void>;
  log: (message: string) => void;
}

/** Hydrate a summary Catalog Entry only while its image modal is active. */
export function useCatalogModalDetailHydration({
  isModalOpen,
  activeImageId,
  catalogById,
  hydrateCatalogDetail,
  log,
}: UseCatalogModalDetailHydrationProps) {
  useEffect(() => {
    if (!isModalOpen || !activeImageId) return;
    const entry = catalogById.get(activeImageId);
    if (!entry || entry.detailLevel === 'detail') return;

    void hydrateCatalogDetail(activeImageId).catch((error) => {
      log(
        `Catalog detail hydration failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
  }, [activeImageId, catalogById, hydrateCatalogDetail, isModalOpen, log]);
}
