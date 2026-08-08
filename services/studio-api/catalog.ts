import type {
  CatalogBatchCommandResult,
  CatalogCommandFilter,
  CatalogImage,
  CatalogPage,
  CatalogWorkspaceSummary,
  StudioLibrary,
} from '../../packages/shared/src';
import { request } from './http';

export async function listLibraries() {
  return request<StudioLibrary[]>('/api/libraries');
}

export interface CatalogQueryParams {
  workspaceId?: string;
  libraryId?: string;
  jobId?: string;
  batchId?: string;
  favorite?: boolean;
  deleted?: boolean;
  q?: string;
  offset?: number;
  limit?: number;
}

export function buildCatalogQuery(params: CatalogQueryParams = {}) {
  const search = new URLSearchParams();
  if (params.workspaceId) search.set('workspace_id', params.workspaceId);
  if (params.libraryId) search.set('library_id', params.libraryId);
  if (params.jobId) search.set('job_id', params.jobId);
  if (params.batchId) search.set('batch_id', params.batchId);
  if (params.favorite !== undefined) search.set('favorite', String(params.favorite));
  if (params.deleted !== undefined) search.set('deleted', String(params.deleted));
  if (params.q) search.set('q', params.q);
  if (params.offset !== undefined) search.set('offset', String(params.offset));
  if (params.limit !== undefined) search.set('limit', String(params.limit));
  return search.size > 0 ? `?${search.toString()}` : '';
}

export async function queryCatalog(params: CatalogQueryParams = {}) {
  return request<CatalogPage>(`/api/catalog${buildCatalogQuery(params)}`);
}

export async function getCatalogImageDetail(imageId: string) {
  return request<CatalogImage>(`/api/catalog/${encodeURIComponent(imageId)}`);
}

export async function queryCatalogWorkspaceSummaries(
  params: Pick<CatalogQueryParams, 'deleted'> = {},
) {
  const search = new URLSearchParams();
  if (params.deleted !== undefined) search.set('deleted', String(params.deleted));
  return request<CatalogWorkspaceSummary[]>(
    `/api/catalog/workspaces${search.size > 0 ? `?${search.toString()}` : ''}`,
  );
}

export async function updateCatalogImage(
  imageId: string,
  patch: { isFavorite?: boolean; tags?: string[]; workspaceId?: string | null },
) {
  return request<CatalogImage>(`/api/catalog/${encodeURIComponent(imageId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteCatalogImage(imageId: string) {
  return request<CatalogImage>(`/api/catalog/${encodeURIComponent(imageId)}`, { method: 'DELETE' });
}

export async function restoreCatalogImage(imageId: string) {
  return request<CatalogImage>(`/api/catalog/${encodeURIComponent(imageId)}/restore`, {
    method: 'POST',
  });
}

export async function purgeCatalogImage(imageId: string) {
  return request<CatalogImage>(`/api/catalog/${encodeURIComponent(imageId)}/permanent`, {
    method: 'DELETE',
  });
}

export async function archiveCatalogByFilter(filter: CatalogCommandFilter) {
  return request<CatalogBatchCommandResult>('/api/catalog/commands/archive', {
    method: 'POST',
    body: JSON.stringify(filter),
  });
}

export async function restoreCatalogByFilter(filter: CatalogCommandFilter) {
  return request<CatalogBatchCommandResult>('/api/catalog/commands/restore', {
    method: 'POST',
    body: JSON.stringify(filter),
  });
}

export async function purgeCatalogByFilter(filter: CatalogCommandFilter) {
  return request<CatalogBatchCommandResult>('/api/catalog/commands/purge', {
    method: 'POST',
    body: JSON.stringify(filter),
  });
}
