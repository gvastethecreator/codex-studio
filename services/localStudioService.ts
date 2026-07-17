import type {
  CatalogPage,
  CatalogImage,
  CatalogWorkspaceSummary,
  CatalogBatchCommandResult,
  CatalogCommandFilter,
  CodexRuntimeDoctorReport,
  CodexAccountStatusResponse,
  CodexModelCatalogResponse,
  LocalCodexSessionResponse,
  JobDetailResponse,
  CreateJobRequest,
  EditableStudioSettings,
  EditableStudioSettingsPatch,
  ExternalOutputSourcesResponse,
  ExternalOutputSourceFile,
  GenerationProviderCapabilitiesResponse,
  GenerationProviderRuntimePreflightResponse,
  HealthResponse,
  StudioReadinessEnvelope,
  StudioReadinessRefreshReason,
  StudioRuntimeSnapshotResponse,
  ImportExternalOutputSourceInput,
  ImportExternalOutputSourceResult,
  Job,
  JobSummary,
  Project,
  ReferenceHandoffRequest,
  ReferenceHandoffResponse,
  StudioResetResponse,
  StudioLibrary,
  RegisteredExternalOutputSource,
  RegisterExternalOutputSourceInput,
  StorageMaintenanceAuditReport,
  StorageMaintenanceCompactResult,
  StorageMaintenanceThumbnailBackfillResult,
  SystemLog,
  ToolingLogsPruneResult,
  CodexStyleDraftRequest,
  CodexStyleDraftResponse,
  AnimationSequenceFramePromptResponse,
  AnimationSequenceRunView,
  AttachAnimationSequenceFrameRequest,
  CreateAnimationSequenceRunRequest,
  ExportAnimationSequenceGifRequest,
  ExportAnimationSequenceGifResponse,
  CreateSpriteAtlasRowJobsResponse,
  CreateSpriteAtlasRunRequest,
  CreateUserStylePresetInput,
  ImportSpriteAtlasRowRequest,
  SpriteAtlasRowHandoffJob,
  SpriteAtlasRowPromptResponse,
  SpriteAtlasRun,
  SpriteAtlasPresetSummary,
  UpdateUserStylePresetInput,
  UserStylePreset,
} from '../packages/shared/src';
import { resolveStudioApiBase } from './studioRuntime';

export function readLocalStudioErrorMessage(text: string, status: number) {
  const trimmed = text.trim();
  if (trimmed) {
    try {
      const payload = JSON.parse(trimmed) as { error?: unknown; message?: unknown };
      if (typeof payload.error === 'string' && payload.error.trim()) return payload.error.trim();
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message.trim();
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  return `Local studio request failed: ${status}`;
}

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
    throw new Error(readLocalStudioErrorMessage(text, response.status));
  }

  return response.json() as Promise<T>;
}

/**
 * Expose the resolved API base so UI layers and tests can generate stable URLs.
 */
export function getStudioApiBase() {
  return resolveStudioApiBase();
}

export interface StudioAssetUrlOptions {
  variant?: 'thumb';
  maxEdge?: number;
}

/**
 * Convert a backend-relative asset URL into an absolute local studio asset URL.
 */
export function toStudioAssetUrl(publicUrl: string, options: StudioAssetUrlOptions = {}) {
  const url = new URL(`${resolveStudioApiBase()}${publicUrl}`);

  if (options.variant) {
    url.searchParams.set('variant', options.variant);
  }

  if (options.maxEdge) {
    url.searchParams.set('max', String(options.maxEdge));
  }

  return url.toString();
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

export interface StudioReadinessRefreshOptions {
  reason?: StudioReadinessRefreshReason;
  force?: boolean;
}

const runtimeSnapshotCacheTtlMs = 1_000;
let runtimeSnapshotCache: { value: StudioRuntimeSnapshotResponse; cachedAt: number } | null = null;
let runtimeSnapshotGeneration = 0;
let runtimeSnapshotInFlight: {
  generation: number;
  promise: Promise<StudioRuntimeSnapshotResponse>;
} | null = null;
let passiveReadinessRefreshInFlight: Promise<StudioReadinessEnvelope> | null = null;
let forcedReadinessRefreshInFlight: Promise<StudioReadinessEnvelope> | null = null;

function invalidateRuntimeSnapshot() {
  runtimeSnapshotGeneration += 1;
  runtimeSnapshotCache = null;
}

/**
 * Read readiness without starting a new Runtime Doctor probe. The short-lived
 * cache protects React StrictMode/remounts and concurrent shell consumers from
 * issuing duplicate snapshot requests while the server lifecycle owns the
 * actual probe cache.
 */
export async function getStudioRuntimeSnapshot({
  bypassCache = false,
}: { bypassCache?: boolean } = {}) {
  if (bypassCache) invalidateRuntimeSnapshot();

  const now = Date.now();
  if (
    !bypassCache &&
    runtimeSnapshotCache &&
    now - runtimeSnapshotCache.cachedAt < runtimeSnapshotCacheTtlMs
  ) {
    return runtimeSnapshotCache.value;
  }

  const generation = runtimeSnapshotGeneration;
  if (runtimeSnapshotInFlight?.generation === generation) {
    return runtimeSnapshotInFlight.promise;
  }

  const promise = request<StudioRuntimeSnapshotResponse>('/api/runtime/snapshot')
    .then((value) => {
      if (runtimeSnapshotGeneration === generation) {
        runtimeSnapshotCache = { value, cachedAt: Date.now() };
      }
      return value;
    })
    .finally(() => {
      if (runtimeSnapshotInFlight?.promise === promise) {
        runtimeSnapshotInFlight = null;
      }
    });
  runtimeSnapshotInFlight = { generation, promise };

  return promise;
}

export async function refreshStudioReadiness({
  reason = 'passive',
  force = false,
}: StudioReadinessRefreshOptions = {}) {
  const inFlight = force ? forcedReadinessRefreshInFlight : passiveReadinessRefreshInFlight;
  if (inFlight) return inFlight;
  if (force) invalidateRuntimeSnapshot();

  const refreshRequest = request<StudioReadinessEnvelope>('/api/readiness/refresh', {
    method: 'POST',
    body: JSON.stringify({ reason, force }),
  })
    .then((value) => {
      invalidateRuntimeSnapshot();
      return value;
    })
    .finally(() => {
      if (force) forcedReadinessRefreshInFlight = null;
      else passiveReadinessRefreshInFlight = null;
    });

  if (force) forcedReadinessRefreshInFlight = refreshRequest;
  else passiveReadinessRefreshInFlight = refreshRequest;
  return refreshRequest;
}

export async function getCodexRuntimeDoctor() {
  return request<CodexRuntimeDoctorReport>('/api/runtime/doctor');
}

/**
 * Read non-secret editable Studio Settings stored with the local Studio Library.
 */
export async function getEditableStudioSettings() {
  return request<EditableStudioSettings>('/api/settings');
}

/**
 * Read non-secret provider capability status. Secret values never leave backend config.
 */
export async function getGenerationProviderCapabilities() {
  return request<GenerationProviderCapabilitiesResponse>('/api/providers');
}

/**
 * Read non-secret provider runtime preflight state. Sources are env/config names only.
 */
export async function getGenerationProviderRuntimePreflight() {
  return request<GenerationProviderRuntimePreflightResponse>('/api/providers/preflight');
}

/**
 * Persist non-secret editable Studio Settings. Provider secrets stay outside this API.
 */
export async function updateEditableStudioSettings(patch: EditableStudioSettingsPatch) {
  return request<EditableStudioSettings>('/api/settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function listUserStylePresets(options: { includeArchived?: boolean } = {}) {
  const search = new URLSearchParams();
  if (options.includeArchived) search.set('include_archived', 'true');
  const suffix = search.size > 0 ? `?${search.toString()}` : '';
  return request<{ styles: UserStylePreset[] }>(`/api/styles/user${suffix}`);
}

export async function createUserStylePreset(input: CreateUserStylePresetInput) {
  return request<UserStylePreset>('/api/styles/user', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateUserStylePreset(id: string, patch: UpdateUserStylePresetInput) {
  return request<UserStylePreset>(`/api/styles/user/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function archiveUserStylePreset(id: string) {
  return request<UserStylePreset>(`/api/styles/user/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function duplicateUserStylePreset(id: string) {
  return request<UserStylePreset>(`/api/styles/user/${encodeURIComponent(id)}/duplicate`, {
    method: 'POST',
  });
}

export async function draftUserStylePreset(input: CodexStyleDraftRequest) {
  return request<CodexStyleDraftResponse>('/api/styles/draft', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

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
    {
      method: 'POST',
      body: JSON.stringify({ rowId }),
    },
  );
}

export async function createSpriteAtlasRowJobs(runId: string, rowIds?: string[]) {
  return request<CreateSpriteAtlasRowJobsResponse>(
    `/api/sprite-atlas/runs/${encodeURIComponent(runId)}/row-jobs/batch`,
    {
      method: 'POST',
      body: JSON.stringify({ rowIds }),
    },
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
    {
      method: 'POST',
    },
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

export async function listAnimationSequenceRuns() {
  return request<{ runs: AnimationSequenceRunView[] }>('/api/animation-sequence/runs');
}

export async function getAnimationSequenceRun(runId: string) {
  return request<AnimationSequenceRunView>(
    `/api/animation-sequence/runs/${encodeURIComponent(runId)}`,
  );
}

export async function createAnimationSequenceRun(input: CreateAnimationSequenceRunRequest) {
  return request<AnimationSequenceRunView>('/api/animation-sequence/runs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getAnimationSequenceFramePrompt(runId: string, frameId: string) {
  return request<AnimationSequenceFramePromptResponse>(
    `/api/animation-sequence/runs/${encodeURIComponent(runId)}/frames/${encodeURIComponent(frameId)}/prompt`,
  );
}

export async function attachAnimationSequenceFrame(
  runId: string,
  input: AttachAnimationSequenceFrameRequest,
) {
  return request<AnimationSequenceRunView>(
    `/api/animation-sequence/runs/${encodeURIComponent(runId)}/attach-frame`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export async function exportAnimationSequenceGif(
  runId: string,
  input: ExportAnimationSequenceGifRequest = {},
) {
  return request<ExportAnimationSequenceGifResponse>(
    `/api/animation-sequence/runs/${encodeURIComponent(runId)}/export-gif`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export async function runAnimationSequenceQa(runId: string) {
  return request<AnimationSequenceRunView>(
    `/api/animation-sequence/runs/${encodeURIComponent(runId)}/qa`,
    {
      method: 'POST',
    },
  );
}

export function getAnimationSequenceGifUrl(runId: string) {
  return `${resolveStudioApiBase()}/api/animation-sequence/runs/${encodeURIComponent(runId)}/files/gif`;
}

/**
 * Read registered and detected External Output Sources. Detection is read-only.
 */
export async function getExternalOutputSources() {
  return request<ExternalOutputSourcesResponse>('/api/output-sources');
}

/**
 * Register an existing External Output Source before future import workflows.
 */
export async function registerExternalOutputSource(input: RegisterExternalOutputSourceInput) {
  return request<RegisteredExternalOutputSource>('/api/output-sources', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function listExternalOutputSourceFiles(sourceId: string, limit = 100) {
  const search = new URLSearchParams({ limit: String(limit) });
  return request<{ files: ExternalOutputSourceFile[] }>(
    `/api/output-sources/${sourceId}/files?${search.toString()}`,
  );
}

export async function importExternalOutputSourceFiles(
  sourceId: string,
  input: ImportExternalOutputSourceInput,
) {
  return request<ImportExternalOutputSourceResult>(`/api/output-sources/${sourceId}/import`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
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
  return request<{
    running: boolean;
    wsUrl: string;
    pid?: number | null;
    lastStartError?: string | null;
    codexRuntime?: CodexRuntimeDoctorReport;
  }>('/api/app-server/start', {
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

export async function getStorageMaintenanceAudit() {
  return request<StorageMaintenanceAuditReport>('/api/maintenance/storage/audit');
}

export async function runStorageCompactMaintenance(
  input: {
    write?: boolean;
    vacuum?: boolean;
    confirm?: string | null;
  } = {},
) {
  return request<StorageMaintenanceCompactResult>('/api/maintenance/storage/compact', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function runThumbnailBackfillMaintenance(
  input: {
    write?: boolean;
    confirm?: string | null;
    limit?: number;
  } = {},
) {
  return request<StorageMaintenanceThumbnailBackfillResult>(
    '/api/maintenance/storage/thumbnails/backfill',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export async function pruneToolingLogsMaintenance(input: { retainPerTask?: number } = {}) {
  return request<ToolingLogsPruneResult>('/api/maintenance/tooling/logs/prune', {
    method: 'POST',
    body: JSON.stringify(input),
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

export async function createReferenceHandoff(input: ReferenceHandoffRequest) {
  return request<ReferenceHandoffResponse>('/api/references/handoff', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/**
 * List persistent jobs tracked by the local backend.
 */
export async function listStudioJobs() {
  return request<JobSummary[]>('/api/jobs');
}

/**
 * Fetch the detailed session/events/transcript view for one backend job.
 */
export async function getStudioJobDetail(jobId: string) {
  return request<JobDetailResponse>(`/api/jobs/${jobId}`);
}

/**
 * Requeue an existing backend job from its detail payload without copying it.
 */
export async function retryStudioJob(detail: JobDetailResponse) {
  return retryStudioJobById(detail.job.id);
}

/**
 * Requeue an existing backend job in place so failed tasks do not duplicate rows.
 */
export async function retryStudioJobById(jobId: string) {
  return request<Job>(`/api/jobs/${jobId}/retry`, {
    method: 'POST',
  });
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

export async function getCatalogImageDetail(imageId: string) {
  return request<CatalogImage>(`/api/catalog/${imageId}`);
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

/**
 * Retrieve structured backend logs surfaced inside the debug panel.
 */
export async function listStudioLogs() {
  return request<SystemLog[]>('/api/logs');
}
