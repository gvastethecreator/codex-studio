import type {
  CreateSpriteAtlasRowJobsResponse,
  CreateSpriteAtlasRunRequest,
  ImportSpriteAtlasRowRequest,
  SpriteAtlasPresetSummary,
  SpriteAtlasRowHandoffJob,
  SpriteAtlasRowPromptResponse,
  SpriteAtlasRun,
} from '../../packages/shared/src';
import { resolveStudioApiBase } from '../studioRuntime';
import { request } from './http';

export async function listSpriteAtlasPresets() {
  return request<{ presets: SpriteAtlasPresetSummary[] }>('/api/sprite-atlas/presets');
}

export async function listSpriteAtlasRuns() {
  return request<{ runs: SpriteAtlasRun[] }>('/api/sprite-atlas/runs');
}

export async function getSpriteAtlasRun(runId: string) {
  return request<SpriteAtlasRun>(`/api/sprite-atlas/runs/${encodeURIComponent(runId)}`);
}

export async function createSpriteAtlasRun(input: CreateSpriteAtlasRunRequest) {
  return request<SpriteAtlasRun>('/api/sprite-atlas/runs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function createSpriteAtlasRowJob(runId: string, rowId: string) {
  return request<SpriteAtlasRowHandoffJob>(
    `/api/sprite-atlas/runs/${encodeURIComponent(runId)}/row-jobs`,
    { method: 'POST', body: JSON.stringify({ rowId }) },
  );
}

export async function createSpriteAtlasRowJobs(runId: string, rowIds?: string[]) {
  return request<CreateSpriteAtlasRowJobsResponse>(
    `/api/sprite-atlas/runs/${encodeURIComponent(runId)}/row-jobs/batch`,
    { method: 'POST', body: JSON.stringify({ rowIds }) },
  );
}

export async function getSpriteAtlasRowPrompt(runId: string, rowId: string) {
  return request<SpriteAtlasRowPromptResponse>(
    `/api/sprite-atlas/runs/${encodeURIComponent(runId)}/rows/${encodeURIComponent(rowId)}/prompt`,
  );
}

export async function importSpriteAtlasRow(runId: string, input: ImportSpriteAtlasRowRequest) {
  return request<SpriteAtlasRun>(`/api/sprite-atlas/runs/${encodeURIComponent(runId)}/import-row`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function composeSpriteAtlasFixture(runId: string) {
  return request<SpriteAtlasRun>(
    `/api/sprite-atlas/runs/${encodeURIComponent(runId)}/compose-fixture`,
    { method: 'POST' },
  );
}

export async function runSpriteAtlasQa(runId: string) {
  return request<SpriteAtlasRun>(`/api/sprite-atlas/runs/${encodeURIComponent(runId)}/qa`, {
    method: 'POST',
  });
}

export function getSpriteAtlasLayoutGuideUrl(runId: string, rowId: string) {
  return `${resolveStudioApiBase()}/api/sprite-atlas/runs/${encodeURIComponent(runId)}/files/layout-guide/${encodeURIComponent(rowId)}`;
}

export function getSpriteAtlasAtlasUrl(runId: string) {
  return `${resolveStudioApiBase()}/api/sprite-atlas/runs/${encodeURIComponent(runId)}/files/atlas`;
}
