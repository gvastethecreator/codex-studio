import type {
  CreateJobRequest,
  Job,
  JobDetailResponse,
  JobListQuery,
  JobListPage,
  JobStatusSnapshot,
  ReferenceHandoffRequest,
  ReferenceHandoffResponse,
} from '../../packages/shared/src';
import { request } from './http';

export async function createStudioJob(body: CreateJobRequest) {
  return request<Job>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createReferenceHandoff(input: ReferenceHandoffRequest) {
  return request<ReferenceHandoffResponse>('/api/references/handoff', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function listStudioJobs(query: JobListQuery = {}, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (query.workspaceId) params.set('workspaceId', query.workspaceId);
  if (query.status) params.set('status', query.status);
  if (query.cursor) params.set('cursor', query.cursor);
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  const suffix = params.size ? `?${params}` : '';
  return request<JobListPage>(`/api/jobs${suffix}`, { signal });
}

export async function getStudioJobDetail(jobId: string) {
  return request<JobDetailResponse>(`/api/jobs/${encodeURIComponent(jobId)}`);
}

export async function getStudioJobStatus(jobId: string, signal?: AbortSignal) {
  return request<JobStatusSnapshot>(`/api/jobs/${encodeURIComponent(jobId)}/status`, { signal });
}

export async function retryStudioJobById(jobId: string) {
  return request<Job>(`/api/jobs/${encodeURIComponent(jobId)}/retry`, { method: 'POST' });
}

export async function cancelStudioJob(jobId: string) {
  return request<Job>(`/api/jobs/${encodeURIComponent(jobId)}/cancel`, { method: 'POST' });
}
