import type {
  CreateJobRequest,
  Job,
  JobDetailResponse,
  JobListQuery,
  JobListPage,
  JobStatusSnapshot,
  ReferenceHandoffRequest,
  ReferenceHandoffResponse,
  CreateJobBatchRequest,
  JobBatchDetail,
  JobBatchSummary,
  RetryJobBatchRequest,
} from '../../packages/shared/src';
import { request, StudioApiError } from './http';

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
  const { job } = await getStudioJobDetail(jobId);
  return request<Job>(`/api/jobs/${encodeURIComponent(jobId)}/retry`, {
    method: 'POST',
    body: JSON.stringify({ attempt: job.attempt }),
  });
}

export class BatchSubmissionUncertainError extends Error {
  constructor(readonly batchId: string) {
    super(
      `Batch ${batchId} may have been accepted, but its acknowledgement was lost. Open Queue to reconcile it before generating again.`,
    );
    this.name = 'BatchSubmissionUncertainError';
  }
}
export async function createStudioJobBatch(body: CreateJobBatchRequest) {
  const submit = () =>
    request<JobBatchDetail>('/api/jobs/batches', { method: 'POST', body: JSON.stringify(body) });
  try {
    return await submit();
  } catch (error) {
    if (error instanceof StudioApiError && error.status < 500) throw error;
    // A lost acknowledgement repeats only this accepted request identity.
    try {
      return await submit();
    } catch {
      try {
        return await getStudioJobBatch(body.requestId);
      } catch {
        throw new BatchSubmissionUncertainError(body.requestId);
      }
    }
  }
}
export async function getStudioJobBatch(batchId: string) {
  return request<JobBatchDetail>(`/api/jobs/batches/${encodeURIComponent(batchId)}`);
}
export async function getStudioJobBatchSummary(batchId: string, signal?: AbortSignal) {
  return request<JobBatchSummary>(`/api/jobs/batches/${encodeURIComponent(batchId)}/summary`, {
    signal,
  });
}
export async function retryStudioJobBatch(batchId: string, body: RetryJobBatchRequest) {
  return request<JobBatchDetail>(`/api/jobs/batches/${encodeURIComponent(batchId)}/retry`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function cancelStudioJob(jobId: string) {
  return request<Job>(`/api/jobs/${encodeURIComponent(jobId)}/cancel`, { method: 'POST' });
}
