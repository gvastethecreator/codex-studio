import {
  createAnimationSequenceContract,
  createAnimationSequenceFramePlan,
  type AnimationSequenceRunView,
} from '../packages/shared/src/animationSequenceContracts';
import {
  createGenerationProviderCapabilities,
  summarizeJobBatch,
  type CreateJobRequest,
  type CreateJobBatchRequest,
  type JobBatchDetail,
  type CatalogImage,
  type EditableStudioSettings,
  type GenerationProviderRuntimePreflightResponse,
  type HealthResponse,
  type Job,
  type JobDetailResponse,
  type JobListPage,
  type JobSummary,
  type OnboardingProbe,
  type StudioEvent,
  type StudioLibrary,
  type StudioReadinessEnvelope,
  type StudioRuntimeSnapshotResponse,
  type StudioWorkspace,
  type SubscriptionAuthPublicStatus,
  type SystemLog,
} from '../packages/shared/src';
import stylesCard from '../assets/recipes/cards/recipe-styles.webp?url';
import cinematicCard from '../assets/recipes/cards/recipe-cinematic.webp?url';
import characterCard from '../assets/recipes/cards/recipe-character.webp?url';
import cameraCard from '../assets/recipes/cards/recipe-camera.webp?url';
import remasterCard from '../assets/recipes/cards/recipe-remaster.webp?url';
import spritesheetCard from '../assets/recipes/cards/recipe-spritesheet.webp?url';

export type DemoCatalogMode = 'ready' | 'empty' | 'error';
export type DemoProviderMode = 'ready' | 'blocked';

export interface DemoSeed {
  catalog: DemoCatalogMode;
  provider: DemoProviderMode;
  runningJob: boolean;
  animationPartial?: boolean;
  cameraUnavailable?: boolean;
  outcome?: 'failed' | 'needs_review' | 'cancelled' | 'retry' | 'partial';
}

const NOW = '2026-09-20T12:00:00.000Z';
const LIBRARY_ID = 'library-demo';
const DEFAULT_WORKSPACE = 'default';
const SECOND_WORKSPACE = 'ws-noir';

type Listener = (event: StudioEvent) => void;

let revision = 1;
let catalogMode: DemoCatalogMode = 'ready';
let providerMode: DemoProviderMode = 'ready';
const jobs = new Map<string, Job>();
const batches = new Map<string, string[]>();
let demoOutcome: DemoSeed['outcome'];
let animationPartial = false;
const catalog = new Map<string, CatalogImage>();
const workspaces = new Map<string, StudioWorkspace>();
const listeners = new Set<Listener>();
const timers: number[] = [];
let jobSeq = 0;
let settings: EditableStudioSettings;

function iso(offsetMs = 0) {
  return new Date(Date.parse(NOW) + offsetMs).toISOString();
}

function emit(type: StudioEvent['type'], payload: StudioEvent['payload']) {
  revision += 1;
  const event = { type, payload, createdAt: iso(), revision } as StudioEvent;
  listeners.forEach((listener) => listener(event));
}

export function subscribeDemoEvents(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDemoRevision() {
  return revision;
}

function makeWorkspace(id: string, name: string): StudioWorkspace {
  return {
    id,
    name,
    libraryId: LIBRARY_ID,
    filter: {},
    sortOrder: 'newest',
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function makeImage(
  id: string,
  prompt: string,
  publicUrl: string,
  recipeId: string | null,
): CatalogImage {
  return {
    id,
    libraryId: LIBRARY_ID,
    filePath: `demo/${id}.webp`,
    thumbnailPath: `demo/${id}.webp`,
    publicUrl,
    thumbnailUrl: publicUrl,
    sourceExists: true,
    thumbnailExists: true,
    prompt,
    negativePrompt: null,
    aspectRatio: '1:1',
    imageSize: '1K',
    width: 1024,
    height: 1024,
    mimeType: 'image/webp',
    fileSizeBytes: 48_000,
    jobId: `job-${id}`,
    workspaceId: DEFAULT_WORKSPACE,
    batchId: null,
    recipeId,
    isFavorite: id === 'img-styles',
    isDeleted: false,
    deletedAt: null,
    tags: recipeId ? [recipeId] : [],
    generationConfig: { prompt, recipeId, aspectRatio: '1:1', model: 'gpt-image-1' },
    createdAt: NOW,
    detailLevel: 'detail',
  };
}

function makeJob(partial: Partial<Job> & Pick<Job, 'id' | 'status' | 'originalPrompt'>): Job {
  return {
    attempt: 1,
    workspaceId: DEFAULT_WORKSPACE,
    recipeId: null,
    batchId: null,
    aspectRatio: '1:1',
    kind: 'image_generate',
    providerId: 'codex',
    sourceSpec: null,
    execution: { model: 'gpt-image-1', reasoningEffort: 'low' },
    expandedPrompt: partial.originalPrompt,
    finalPromptUsed: partial.originalPrompt,
    error: null,
    createdAt: NOW,
    updatedAt: NOW,
    completedAt: partial.status === 'completed' ? NOW : null,
    ...partial,
  };
}

function toSummary(job: Job): JobSummary {
  return {
    id: job.id,
    attempt: job.attempt,
    kind: job.kind,
    providerId: job.providerId,
    workspaceId: job.workspaceId,
    recipeId: job.recipeId ?? null,
    batchId: job.batchId,
    aspectRatio: job.aspectRatio ?? null,
    status: job.status,
    execution: job.execution,
    error: job.error,
    promptPreview: job.originalPrompt.slice(0, 80),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
  };
}

function seedCatalog() {
  catalog.clear();
  if (catalogMode === 'empty') return;
  const rows: CatalogImage[] = [
    makeImage(
      'img-styles',
      'Studio portrait in a transferable photographic preset',
      stylesCard,
      'styles',
    ),
    makeImage(
      'img-cinematic',
      'Wide night street with wet asphalt and sodium light',
      cinematicCard,
      'cinematic',
    ),
    makeImage(
      'img-character',
      'Character turnaround on a clean backdrop',
      characterCard,
      'character',
    ),
    makeImage('img-camera', 'Same subject, three camera heights', cameraCard, 'camera'),
    makeImage('img-remaster', 'Restore a soft archival still', remasterCard, 'remaster'),
    makeImage(
      'img-sprites',
      'Walk cycle sprite strip on transparent ground',
      spritesheetCard,
      'spritesheet',
    ),
  ];
  for (const row of rows) catalog.set(row.id, row);
}

function seedJobs() {
  jobs.clear();
  batches.clear();
  for (const image of catalog.values()) {
    if (!image.jobId) continue;
    jobs.set(
      image.jobId,
      makeJob({
        id: image.jobId,
        status: 'completed',
        originalPrompt: image.prompt ?? '',
        recipeId: image.recipeId,
      }),
    );
  }
  if (demoOutcome) {
    const id = 'job-scenario';
    const status = demoOutcome === 'partial' || demoOutcome === 'retry' ? 'failed' : demoOutcome;
    jobs.set(
      id,
      makeJob({
        id,
        status,
        originalPrompt: 'Simulated review scenario: a quiet mountain lake',
        createdAt: iso(1000),
        updatedAt: iso(2000),
        completedAt: status === 'needs_review' ? null : iso(2000),
        error: status === 'failed' ? 'Simulated provider failure. Retry this job.' : null,
        attempt: demoOutcome === 'retry' ? 2 : 1,
      }),
    );
    if (demoOutcome === 'partial') {
      const completed = makeJob({
        id: 'job-scenario-complete',
        status: 'completed',
        originalPrompt: 'Simulated review scenario: a quiet mountain lake',
        batchId: 'batch-partial',
        createdAt: iso(1000),
        updatedAt: iso(2000),
        completedAt: iso(2000),
      });
      jobs.set(completed.id, completed);
      jobs.get(id)!.batchId = 'batch-partial';
      const image = makeImage('img-partial', completed.originalPrompt, stylesCard, null);
      image.jobId = completed.id;
      image.batchId = completed.batchId ?? null;
      image.createdAt = completed.completedAt!;
      catalog.set(image.id, image);
      batches.set('batch-partial', [completed.id, id]);
    }
  }
}

export function resetDemoStore(
  seed: DemoSeed = { catalog: 'ready', provider: 'ready', runningJob: false },
) {
  for (const timer of timers) window.clearTimeout(timer);
  timers.length = 0;
  catalogMode = seed.catalog;
  demoOutcome = seed.outcome;
  animationPartial = Boolean(seed.animationPartial);
  providerMode = seed.provider;
  revision = 1;
  jobSeq = 0;
  workspaces.clear();
  workspaces.set(DEFAULT_WORKSPACE, makeWorkspace(DEFAULT_WORKSPACE, 'Studio'));
  workspaces.set(SECOND_WORKSPACE, makeWorkspace(SECOND_WORKSPACE, 'Noir tests'));
  settings = {
    schemaVersion: 'editable-studio-settings/v1',
    defaultProviderId: 'codex',
    defaultOutputMode: 'studio_library',
    autoDetectOutputSources: true,
    commandCenterCompactMode: false,
    preferredLibraryId: LIBRARY_ID,
    preferredOutputPath: null,
    outputOrganization: {
      subfolderTokens: ['workspace', 'date'],
      fileNameTemplate: '{recipe}-{date}',
    },
    providerDefaults: {
      codex: {
        providerId: 'codex',
        model: 'gpt-image-1',
        reasoningEffort: 'low',
        serviceTier: null,
      },
    },
    updatedAt: NOW,
  };
  seedCatalog();
  seedJobs();
  if (seed.runningJob) {
    jobs.set(
      'job-running',
      makeJob({
        id: 'job-running',
        status: 'running',
        originalPrompt: 'Simulated in-flight generation for the Jobs rail',
        updatedAt: iso(1_000),
      }),
    );
  }
}

resetDemoStore();

export function getHealth(): HealthResponse {
  const ready = providerMode === 'ready';
  return {
    ok: ready,
    checkedAt: NOW,
    libraryDir: 'Review Library (synthetic)',
    runtime: {
      platform: 'review',
      arch: 'x64',
      bunVersion: null,
      nodeVersion: 'review',
      cwd: 'review',
      envLocalPath: 'review',
      envLocalPresent: true,
    },
    config: { serverPort: 0, codexWsPort: 0 },
    library: { exists: true, writable: true, readmePresent: true, missingFolders: [] },
    codexCli: { available: ready, version: ready ? 'review' : null, command: 'demo' },
    codexRuntime: {
      status: ready ? 'ready' : 'blocked',
      canRunJobs: ready,
      checkedAt: NOW,
      selectedExecutable: 'demo',
      selectedCommand: 'demo',
      selectedVersion: 'review',
      selectedVersionNumber: '0',
      appServerSupported: ready,
      recommendedAction: ready
        ? 'Review demo runtime is ready.'
        : 'This scenario blocks the simulated Codex session.',
      issues: ready
        ? []
        : [
            {
              code: 'codex_cli_unavailable',
              severity: 'error',
              message: 'Simulated provider outage for review.',
              action: 'Use Reset in the review chrome.',
            },
          ],
      candidates: [],
    },
    appServer: {
      running: ready,
      wsUrl: 'demo://review',
      pid: ready ? 1 : null,
      lastExitCode: null,
      lastExitAt: null,
      lastInvocation: 'demo',
      lastStartAt: NOW,
      lastStartError: null,
      lastEnsureAt: NOW,
      lastEnsureReason: 'health',
    },
    checks: {
      libraryReady: true,
      codexReady: ready,
      onboardingReady: true,
    },
    worker: {
      maxConcurrentJobs: 1,
      activeWorkerCount: [...jobs.values()].filter((job) => job.status === 'running').length,
      queuedJobs: [...jobs.values()].filter((job) => job.status === 'queued').length,
      trackedJobs: jobs.size,
      providerLimits: { codex: 1 },
      activeByProvider: {
        codex: [...jobs.values()].some((job) => job.status === 'running') ? 1 : 0,
      },
      waiting: [],
      stopping: false,
    },
  };
}

export function getOnboardingProbe(): OnboardingProbe {
  const ready = providerMode === 'ready';
  return {
    facts: {
      bunAvailable: true,
      codexCliAvailable: ready,
      chatgptLoggedIn: ready,
      codexSubscriptionReady: ready,
      studioLibraryReady: true,
      studioLibraryPath: 'Review Library (synthetic)',
      bootstrapConfigReady: true,
      appServerReady: ready,
      grokCliAvailable: true,
      grokLoggedIn: ready,
    },
    checks: [
      {
        id: 'bun',
        ready: true,
        label: 'Bun',
        detail: 'Present in this review fixture.',
        meta: null,
      },
      {
        id: 'codex_cli',
        ready,
        label: 'Codex CLI',
        detail: ready ? 'Simulated ready.' : 'Simulated blocked.',
        meta: null,
      },
      {
        id: 'chatgpt_login',
        ready,
        label: 'ChatGPT login',
        detail: ready ? 'Simulated signed in.' : 'Simulated signed out.',
        meta: null,
      },
      {
        id: 'studio_library',
        ready: true,
        label: 'Studio Library',
        detail: 'Synthetic review library.',
        meta: null,
      },
      {
        id: 'bootstrap_config',
        ready: true,
        label: 'Bootstrap',
        detail: 'Not required in the demo.',
        meta: null,
      },
      {
        id: 'app_server',
        ready,
        label: 'app-server',
        detail: ready ? 'Simulated connected.' : 'Simulated stopped.',
        meta: null,
      },
    ],
    primaryCta: ready ? 'ready' : 'codex_login',
    studioLibraryPath: 'Review Library (synthetic)',
    grok: {
      cliAvailable: true,
      loggedIn: ready,
      label: 'Grok',
      detail: ready ? 'Simulated ready.' : 'Simulated signed out.',
    },
  };
}

export function getReadiness(): StudioReadinessEnvelope {
  const health = getHealth();
  return {
    revision,
    observedAt: NOW,
    freshness: 'fresh',
    refreshState: 'idle',
    lastAttemptAt: NOW,
    lastSuccessAt: NOW,
    codexRuntime: health.codexRuntime,
    localCodexSession: {
      authMode: 'chatgpt',
      planType: 'chatgpt_plus',
      usage: {
        available: 24,
        unit: 'credits',
        display: '24',
        path: '/account/usage',
        raw: { available: 24 },
      },
      source: 'app-server',
      fetchedAt: NOW,
      error: null,
      authLabel: 'ChatGPT login (simulated)',
      state: providerMode === 'ready' ? 'ready' : 'requires_chatgpt_login',
      reason: providerMode === 'ready' ? null : 'chatgpt_login_required',
      isChatgptLogin: true,
      isSupportedAuthMode: true,
      canRunLocalJobs: providerMode === 'ready',
    },
  };
}

export function getRuntimeSnapshot(): StudioRuntimeSnapshotResponse {
  return {
    health: getHealth(),
    readiness: getReadiness(),
    onboarding: getOnboardingProbe(),
  };
}

export function listLibraries(): StudioLibrary[] {
  return [
    { id: LIBRARY_ID, name: 'Review Library', path: 'review', isDefault: true, createdAt: NOW },
  ];
}

export function listWorkspaces(): StudioWorkspace[] {
  return [...workspaces.values()];
}

export function upsertWorkspace(input: { id?: string; name: string }): StudioWorkspace {
  const id = input.id?.trim() || `ws-${workspaces.size + 1}`;
  const current = workspaces.get(id);
  const next = makeWorkspace(id, input.name);
  if (current) {
    next.createdAt = current.createdAt;
    next.updatedAt = iso(500);
  }
  workspaces.set(id, next);
  return next;
}

export function removeWorkspace(id: string) {
  if (id === DEFAULT_WORKSPACE) return { ok: false };
  workspaces.delete(id);
  return { ok: true };
}

export function queryCatalog(params: {
  workspaceId?: string;
  q?: string;
  deleted?: boolean;
  offset?: number;
  limit?: number;
}) {
  if (catalogMode === 'error')
    throw new Error('Simulated catalog error. Retry or choose another review scenario.');
  let images = [...catalog.values()].filter(
    (image) => Boolean(image.isDeleted) === Boolean(params.deleted),
  );
  if (params.workspaceId)
    images = images.filter((image) => image.workspaceId === params.workspaceId);
  if (params.q) {
    const q = params.q.toLowerCase();
    images = images.filter((image) => (image.prompt ?? '').toLowerCase().includes(q));
  }
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 40;
  const slice = images.slice(offset, offset + limit);
  return { images: slice, total: images.length, hasMore: offset + slice.length < images.length };
}

export function getCatalogImage(id: string) {
  return catalog.get(id) ?? null;
}

export function patchCatalogImage(
  id: string,
  patch: Partial<Pick<CatalogImage, 'isFavorite' | 'tags' | 'workspaceId' | 'isDeleted'>>,
) {
  const current = catalog.get(id);
  if (!current) return null;
  const next = { ...current, ...patch };
  catalog.set(id, next);
  emit(next.isDeleted ? 'catalog.deleted' : 'catalog.updated', next);
  return next;
}

export function getSettings() {
  return settings;
}

export function patchSettings(patch: Partial<EditableStudioSettings>) {
  settings = { ...settings, ...patch, updatedAt: iso(200) };
  return settings;
}

export function getProviderCapabilities() {
  const ready = providerMode === 'ready';
  return createGenerationProviderCapabilities({
    settings: { defaultProviderId: settings.defaultProviderId },
    localRuntimeConfigured: { codex: ready, grok: ready, antigravity: false, comfy: false },
    subscriptionAuthConfigured: { codex: ready, grok: ready, google: false },
    secretConfigured: { google: false, fal: false },
  });
}

export function getProviderPreflight(): GenerationProviderRuntimePreflightResponse {
  const capabilities = getProviderCapabilities();
  return {
    providers: capabilities.providers.map((provider) => ({
      providerId: provider.providerId,
      runtimeKind: provider.runtimeKind,
      availableRuntimeKinds: [provider.runtimeKind],
      secretState: provider.secretState,
      secretSource: null,
      localRuntimeState: provider.canExecute ? 'configured' : 'missing',
      localRuntimeSource: provider.canExecute ? 'review-fixture' : null,
      canAttemptExecution: provider.canExecute,
      diagnostics: provider.canExecute ? [] : [provider.detail],
      availableModels: provider.providerId === 'codex' ? ['gpt-image-1'] : [],
      defaultModel: provider.providerId === 'codex' ? 'gpt-image-1' : null,
    })),
  };
}

export function getAuthStatus(providerId: string): SubscriptionAuthPublicStatus {
  const ready = providerMode === 'ready';
  return {
    providerId: providerId as SubscriptionAuthPublicStatus['providerId'],
    status: ready ? 'logged_in' : 'logged_out',
    accountLabel: ready ? 'review@local' : null,
    expiresAt: ready ? iso(86_400_000) : null,
    lastError: null,
    verificationUrl: null,
    authorizationUrl: null,
    userCode: null,
  };
}

export function listLogs(): SystemLog[] {
  return [
    {
      id: 1,
      level: 'info',
      scope: 'review',
      message: 'Demo adapters replaced production IO.',
      jobId: null,
      createdAt: NOW,
    },
    {
      id: 2,
      level: 'info',
      scope: 'jobs',
      message: 'Simulated catalog contains fixture stills.',
      jobId: 'job-img-styles',
      createdAt: NOW,
    },
  ];
}

export function listJobs(): JobListPage {
  const openStatuses = new Set(['queued', 'running', 'needs_review']);
  const all = [...jobs.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const open = all.filter((job) => openStatuses.has(job.status)).map(toSummary);
  const history = all.filter((job) => !openStatuses.has(job.status)).map(toSummary);
  const counts = {
    queued: all.filter((job) => job.status === 'queued').length,
    running: all.filter((job) => job.status === 'running').length,
    needs_review: all.filter((job) => job.status === 'needs_review').length,
    completed: all.filter((job) => job.status === 'completed').length,
    failed: all.filter((job) => job.status === 'failed').length,
    cancelled: all.filter((job) => job.status === 'cancelled').length,
    open: open.length,
    history: history.length,
    total: all.length,
  };
  return {
    open,
    history,
    counts,
    globalOpenCount: open.length,
    nextCursor: null,
    workspaces: listWorkspaces().map((workspace) => ({ id: workspace.id, name: workspace.name })),
  };
}

export function getJob(id: string) {
  return jobs.get(id) ?? null;
}

export function getJobDetail(id: string): JobDetailResponse | null {
  const job = jobs.get(id);
  if (!job) return null;
  const images = [...catalog.values()].filter((image) => image.jobId === id);
  return {
    job,
    events: [
      {
        id: 1,
        jobId: id,
        type: 'job.created',
        message: 'Simulated job created.',
        metadata: null,
        createdAt: job.createdAt,
      },
    ],
    turn: null,
    transcriptEntries: [],
    catalogImages: images,
    metrics: { timings: [], tokenUsage: null, estimatedPromptTokens: 0 },
    traceSummary: {
      providerId: job.providerId,
      model: job.execution?.model ?? null,
      task: job.kind,
      status: job.status,
      durationMs: job.status === 'completed' ? 900 : null,
      assetCount: images.length,
      tokenUsage: null,
      transcriptPath: null,
      completedAt: job.completedAt,
    },
  };
}

export function cancelJob(id: string) {
  const job = jobs.get(id);
  if (!job) return null;
  const next = {
    ...job,
    status: 'cancelled' as const,
    updatedAt: new Date(Date.parse(job.updatedAt) + 1).toISOString(),
    completedAt: new Date(Date.parse(job.updatedAt) + 1).toISOString(),
  };
  jobs.set(id, next);
  emit('job.cancelled', next);
  return next;
}

function schedule<T extends Job['status']>(
  id: string,
  status: T,
  delay: number,
  extra: Partial<Job> = {},
) {
  const scheduledAt = Date.parse(jobs.get(id)?.updatedAt ?? NOW);
  const timer = window.setTimeout(() => {
    const job = jobs.get(id);
    if (!job || job.status === 'cancelled') return;
    const next = {
      ...job,
      ...extra,
      status,
      updatedAt: new Date(scheduledAt + delay).toISOString(),
      completedAt:
        status === 'completed' || status === 'failed'
          ? new Date(scheduledAt + delay).toISOString()
          : job.completedAt,
    };
    jobs.set(id, next);
    const eventType =
      status === 'running'
        ? 'job.running'
        : status === 'completed'
          ? 'job.completed'
          : status === 'failed'
            ? 'job.failed'
            : 'job.progress';
    if (status === 'completed') {
      const image = makeImage(`img-${id}`, job.originalPrompt, stylesCard, job.recipeId ?? null);
      image.jobId = id;
      image.workspaceId = job.workspaceId;
      image.batchId = job.batchId ?? null;
      image.createdAt = next.completedAt!;
      image.generationConfig = {
        ...image.generationConfig,
        recipeParams: job.sourceSpec?.recipeParams,
        prompt: job.originalPrompt,
      };
      catalog.set(image.id, image);
      emit('catalog.created', image);
    }
    emit(eventType, next);
  }, delay);
  timers.push(timer);
}

export function createJob(body: Partial<CreateJobRequest>, outcome = demoOutcome): Job {
  jobSeq += 1;
  const id = `job-demo-${jobSeq}`;
  const job = makeJob({
    id,
    status: 'queued',
    originalPrompt: body.sourceSpec?.prompt ?? body.prompt?.trim() ?? '',
    workspaceId: body.workspaceId || DEFAULT_WORKSPACE,
    kind: body.kind ?? 'image_generate',
    sourceSpec: body.sourceSpec ?? null,
    recipeId: body.sourceSpec?.recipeId ?? null,
    providerId: body.providerId ?? 'codex',
    execution: body.execution ?? null,
    batchId:
      typeof body.sourceSpec?.metadata.batchId === 'string'
        ? body.sourceSpec.metadata.batchId
        : null,
    createdAt: iso(jobSeq * 10000),
    updatedAt: iso(jobSeq * 10000),
  });
  jobs.set(id, job);
  emit('job.created', job);
  schedule(id, 'running', 350);
  schedule(
    id,
    outcome === 'failed' ? 'failed' : outcome === 'needs_review' ? 'needs_review' : 'completed',
    1100,
    outcome === 'failed' ? { error: 'Simulated provider failure.' } : {},
  );
  return job;
}

export function listUserStyles() {
  return { styles: [] };
}

export function emptyList() {
  return { runs: [], presets: [], styles: [], files: [] };
}

export function emptyOutputSources() {
  return {
    registry: { schemaVersion: 'external-output-sources/v1', sources: [] },
    candidates: [],
  };
}

export function getBatch(id: string): JobBatchDetail | null {
  const ids = batches.get(id);
  if (!ids) return null;
  const items = ids.map((jobId) => jobs.get(jobId)!);
  return {
    ...summarizeJobBatch(
      {
        id,
        workspaceId: items[0].workspaceId,
        requestedCount: items.length,
        createdAt: items[0].createdAt,
      },
      items,
    ),
    jobs: items,
  };
}
export function createBatch(body: CreateJobBatchRequest): JobBatchDetail {
  const existing = getBatch(body.requestId);
  if (existing) return existing;
  const items = body.items.map((item, index) =>
    createJob(item, demoOutcome === 'partial' && index > 0 ? 'failed' : demoOutcome),
  );
  for (const job of items) job.batchId = body.requestId;
  batches.set(
    body.requestId,
    items.map((job) => job.id),
  );
  return getBatch(body.requestId)!;
}
export function retryJob(id: string): Job | null {
  const previous = jobs.get(id);
  if (!previous) return null;
  const job = {
    ...previous,
    status: 'queued' as const,
    attempt: (previous.attempt ?? 1) + 1,
    error: null,
    completedAt: null,
    updatedAt: new Date(Date.parse(previous.updatedAt) + 1000).toISOString(),
  };
  jobs.set(id, job);
  emit('job.created', job);
  schedule(id, 'running', 350);
  schedule(id, 'completed', 1100);
  return job;
}

export function getAnimationReviewRuns(): { runs: AnimationSequenceRunView[] } {
  if (!animationPartial) return { runs: [] };
  const contract = createAnimationSequenceContract({
    prompt: 'Simulated animation: a character turns toward the camera.',
    frameCount: 4,
    fps: 2,
  });
  const framePlan = createAnimationSequenceFramePlan(contract);
  return {
    runs: [
      {
        id: 'animation-partial-demo',
        title: 'Simulated partial sequence',
        status: 'planned',
        createdAt: NOW,
        updatedAt: NOW,
        contract,
        framePlan,
        frames: framePlan.frames.map((frame, index) => ({
          id: frame.id,
          index,
          ordinal: index + 1,
          status: index % 2 === 0 ? 'generated' : 'planned',
          catalogImageId: index === 0 ? 'img-character' : index === 2 ? 'img-camera' : null,
          jobId: null,
          width: index % 2 === 0 ? 1024 : null,
          height: index % 2 === 0 ? 1024 : null,
          blocked: null,
          updatedAt: NOW,
        })),
        exports: [],
        qa: null,
      },
    ],
  };
}
