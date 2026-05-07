import type {
  CatalogPage,
  CreateJobRequest,
  HealthResponse,
  Job,
  Project,
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
 * Ask the local backend to bootstrap `codex app-server` when possible.
 */
export async function startStudioAppServer() {
  return request<{ running: boolean; wsUrl: string }>('/api/app-server/start', {
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

/**
 * Retrieve structured backend logs surfaced inside the debug panel.
 */
export async function listStudioLogs() {
  return request<SystemLog[]>('/api/logs');
}
