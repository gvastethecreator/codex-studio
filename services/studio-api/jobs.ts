import type {
  CreateJobRequest,
  Job,
  JobDetailResponse,
  JobSummary,
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

export async function listStudioJobs() {
  return request<JobSummary[]>('/api/jobs');
}

export async function getStudioJobDetail(jobId: string) {
  return request<JobDetailResponse>(`/api/jobs/${encodeURIComponent(jobId)}`);
}

export async function retryStudioJob(detail: JobDetailResponse) {
  return retryStudioJobById(detail.job.id);
}

export async function retryStudioJobById(jobId: string) {
  return request<Job>(`/api/jobs/${encodeURIComponent(jobId)}/retry`, { method: 'POST' });
}

export async function cancelStudioJob(jobId: string) {
  return request<Job>(`/api/jobs/${encodeURIComponent(jobId)}/cancel`, { method: 'POST' });
}
