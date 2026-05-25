import type {
  CatalogPage,
  CatalogImage,
  CodexAccountStatusResponse,
  CodexModelCatalogResponse,
  LocalCodexSessionResponse,
  JobDetailResponse,
  CreateJobRequest,
  HealthResponse,
  Job,
  Project,
  StudioResetResponse,
  StudioLibrary,
  SystemLog,
} from '../packages/shared/src';
import { resolveStudioApiBase } from './studioRuntime';

/**
 * Execute a JSON request against the local studio backend and surface readable
 * failures for both UI and tests.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const apiBase = resolveStudioApiBase();
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Local studio request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Expose the resolved API base so UI layers and tests can generate stable URLs.
 */
export function getStudioApiBase() {
  return resolveStudioApiBase();
}

/**
 * Convert a backend-relative asset URL into an absolute local studio asset URL.
 */
export function toStudioAssetUrl(publicUrl: string) {
  return `${resolveStudioApiBase()}${publicUrl}`;
}

/**
 * Read the known studio projects from the Bun/Hono backend.
 */
export async function listProjects() {
  return request<Project[]>('/api/projects');
}

/**
 * Return the current backend health snapshot used by onboarding and diagnostics.
 */
export async function getStudioHealth() {
  return request<HealthResponse>('/api/health');
}

/**
 * Discover the Codex execution models available to the local app-server.
 */
export async function getCodexModelCatalog() {
  return request<CodexModelCatalogResponse>('/api/codex/models');
}

/**
 * Read the Local Codex Session that powers local-only ChatGPT login flows.
 */
export async function getLocalCodexSession() {
  return request<LocalCodexSessionResponse>('/api/codex/session');
}

/**
 * Read account plan and available usage data from the Codex app-server.
 */
export async function getCodexAccountStatus() {
  return request<CodexAccountStatusResponse>('/api/codex/account');
}

/**
 * Ask the local backend to bootstrap `codex app-server` when possible.
 */
export async function startStudioAppServer() {
  return request<{ running: boolean; wsUrl: string }>('/api/app-server/start', {
    method: 'POST',
  });
}

/**
 * Reset the local studio database, assets, logs, and backend-managed workspace state.
 */
export async function resetStudioData() {
  return request<StudioResetResponse>('/api/studio/reset', {
    method: 'POST',
  });
}

/**
 * Create a persistent backend job that survives UI refreshes.
 */
export async function createStudioJob(body: CreateJobRequest) {
  return request<Job>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * List persistent jobs tracked by the local backend.
 */
export async function listStudioJobs() {
  return request<Job[]>('/api/jobs');
}

/**
 * Fetch the detailed session/events/transcript view for one backend job.
 */
export async function getStudioJobDetail(jobId: string) {
  return request<JobDetailResponse>(`/api/jobs/${jobId}`);
}

/**
 * Ask the backend worker to cancel a queued or running job.
 */
export async function cancelStudioJob(jobId: string) {
  return request<Job>(`/api/jobs/${jobId}/cancel`, {
    method: 'POST',
  });
}

/**
 * List the registered studio libraries managed by the backend.
 */
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

/**
 * Build a stable catalog query string from optional search filters.
 */
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

/**
 * Query the catalog page exposed by the local backend.
 */
export async function queryCatalog(params: CatalogQueryParams = {}) {
  return request<CatalogPage>(`/api/catalog${buildCatalogQuery(params)}`);
}

export async function updateCatalogImage(
  imageId: string,
  patch: { isFavorite?: boolean; tags?: string[]; workspaceId?: string | null },
) {
  return request<CatalogImage>(`/api/catalog/${imageId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteCatalogImage(imageId: string) {
  return request<CatalogImage>(`/api/catalog/${imageId}`, {
    method: 'DELETE',
  });
}

export async function restoreCatalogImage(imageId: string) {
  return request<CatalogImage>(`/api/catalog/${imageId}/restore`, {
    method: 'POST',
  });
}

export async function purgeCatalogImage(imageId: string) {
  return request<CatalogImage>(`/api/catalog/${imageId}/permanent`, {
    method: 'DELETE',
  });
}

/**
 * Retrieve structured backend logs surfaced inside the debug panel.
 */
export async function listStudioLogs() {
  return request<SystemLog[]>('/api/logs');
}
