import type { Asset, CreateJobRequest, HealthResponse, Job, Project, SystemLog } from '../packages/shared/src';

const API_BASE = 'http://localhost:4317';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Local studio request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function toStudioAssetUrl(publicUrl: string) {
  return `${API_BASE}${publicUrl}`;
}

export async function listProjects() {
  return request<Project[]>('/api/projects');
}

export async function getStudioHealth() {
  return request<HealthResponse>('/api/health');
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

export async function listStudioAssets() {
  return request<Asset[]>('/api/assets');
}

export async function listStudioLogs() {
  return request<SystemLog[]>('/api/logs');
}

export async function waitForStudioJob(jobId: string, signal?: AbortSignal) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 240_000) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled by user');
    }

    const jobs = await listStudioJobs();
    const job = jobs.find((candidate) => candidate.id === jobId);
    if (!job) {
      throw new Error(`Local studio job not found: ${jobId}`);
    }

    if (job.status === 'completed' || job.status === 'needs_review') {
      return job;
    }

    if (job.status === 'failed' || job.status === 'cancelled') {
      throw new Error(job.error || `Local studio job ${job.status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  throw new Error('Local studio job timed out after 240 seconds');
}
