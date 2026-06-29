import type {
  CatalogCommandFilter,
  CatalogImage,
  CatalogPage,
  CatalogWorkspaceSummary,
} from '../../../packages/shared/src';

export interface RegisterCatalogImageInput {
  libraryId?: string | null;
  filePath: string;
  thumbnailPath?: string | null;
  prompt?: string | null;
  negativePrompt?: string | null;
  aspectRatio?: string | null;
  imageSize?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType: string;
  fileSizeBytes?: number | null;
  jobId?: string | null;
  workspaceId?: string | null;
  batchId?: string | null;
  recipeId?: string | null;
  tags?: string[];
  generationConfig?: Record<string, unknown> | null;
}

export interface QueryCatalogFilters {
  libraryId?: string | null;
  workspaceId?: string | null;
  jobId?: string | null;
  batchId?: string | null;
  favorite?: boolean;
  isDeleted?: boolean;
  q?: string | null;
  offset?: number;
  limit?: number;
}

export type CatalogUpdatePatch = {
  isFavorite?: boolean;
  tags?: string[];
  workspaceId?: string | null;
};

export interface StudioCatalogStore {
  getCatalogImage(id: string): CatalogImage | null;
  queryCatalog(filters?: QueryCatalogFilters): CatalogPage;
  queryWorkspaceSummaries(filters?: {
    libraryId?: string | null;
    isDeleted?: boolean;
  }): CatalogWorkspaceSummary[];
  listCatalogImageIds(filters?: CatalogCommandFilter): string[];
  registerCatalogImage(input: RegisterCatalogImageInput): CatalogImage;
  updateCatalogImage(id: string, patch: CatalogUpdatePatch): CatalogImage | null;
  softDeleteCatalogImage(id: string): CatalogImage | null;
  restoreCatalogImage(id: string): CatalogImage | null;
  purgeCatalogImage(id: string): CatalogImage | null;
}

export async function createDefaultCatalogStore(): Promise<StudioCatalogStore> {
  const {
    getCatalogImage,
    listCatalogImageIds,
    purgeCatalogImage,
    queryCatalog,
    queryCatalogWorkspaceSummaries,
    registerCatalogImage,
    restoreCatalogImage,
    softDeleteCatalogImage,
    updateCatalogImage,
  } = await import('./catalog');

  return {
    getCatalogImage,
    listCatalogImageIds,
    queryCatalog,
    queryWorkspaceSummaries: queryCatalogWorkspaceSummaries,
    registerCatalogImage,
    updateCatalogImage,
    softDeleteCatalogImage,
    restoreCatalogImage,
    purgeCatalogImage,
  };
}
