import type { CatalogPage, CreateJobRequest, HealthResponse, Job, Project, StudioLibrary, SystemLog } from '../packages/shared/src';
import { resolveStudioApiBase } from './studioRuntime';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const apiBase = resolveStudioApiBase();
  const response = await fetch(`${apiBase}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Local studio request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getStudioApiBase() {
  return resolveStudioApiBase();
}

export function toStudioAssetUrl(publicUrl: string) {
  return `${resolveStudioApiBase()}${publicUrl}`;
}

export async function listProjects() {
  return request<Project[]>('/api/projects');
}

export async function getStudioHealth() {
  return request<HealthResponse>('/api/health');
}

export async function startStudioAppServer() {
  return request<{ running: boolean; wsUrl: string }>('/api/app-server/start', {
    method: 'POST',
  });
}

export async function createStudioJob(body: CreateJobRequest) {
  return request<Job>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function listStudioJobs() {
  return request<Job[]>('/api/jobs');
}

export async function listLibraries() {
  return request<StudioLibrary[]>('/api/libraries');
}

export async function queryCatalog(params: { workspaceId?: string; libraryId?: string; favorite?: boolean; deleted?: boolean; q?: string; offset?: number; limit?: number } = {}) {
  const search = new URLSearchParams();
  if (params.workspaceId) search.set('workspace_id', params.workspaceId);
  if (params.libraryId) search.set('library_id', params.libraryId);
  if (params.favorite !== undefined) search.set('favorite', String(params.favorite));
  if (params.deleted !== undefined) search.set('deleted', String(params.deleted));
  if (params.q) search.set('q', params.q);
  if (params.offset !== undefined) search.set('offset', String(params.offset));
  if (params.limit !== undefined) search.set('limit', String(params.limit));
  return request<CatalogPage>(`/api/catalog${search.size > 0 ? `?${search.toString()}` : ''}`);
}

export async function listStudioLogs() {
  return request<SystemLog[]>('/api/logs');
}
