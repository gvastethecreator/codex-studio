import {
  validateGenerationTaskSpec,
  type CreateJobRequest,
  type CreateJobBatchRequest,
} from '../packages/shared/src';
import {
  cancelJob,
  createJob,
  createBatch,
  getBatch,
  getAnimationReviewRuns,
  retryJob,
  emptyOutputSources,
  getAuthStatus,
  getCatalogImage,
  getHealth,
  getJob,
  getJobDetail,
  getOnboardingProbe,
  getProviderCapabilities,
  getProviderPreflight,
  getReadiness,
  getRuntimeSnapshot,
  getSettings,
  listJobs,
  listLibraries,
  listLogs,
  listUserStyles,
  listWorkspaces,
  patchCatalogImage,
  patchSettings,
  queryCatalog,
  removeWorkspace,
  upsertWorkspace,
} from './demo-store';

export class StudioApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly reason: string | null;

  constructor(
    message: string,
    options: { status: number; code?: string | null; reason?: string | null },
  ) {
    super(message);
    this.name = 'StudioApiError';
    this.status = options.status;
    this.code = options.code ?? null;
    this.reason = options.reason ?? null;
  }
}

export function readLocalStudioErrorMessage(text: string, status: number) {
  return text.trim() || `Local studio request failed: ${status}`;
}

export function getStudioApiBase() {
  return '';
}

function json(value: unknown) {
  return value;
}

function notFound(path: string): never {
  throw new StudioApiError(`Demo has no handler for ${path}`, { status: 404, code: 'not_found' });
}

function parseUrl(path: string) {
  const url = new URL(path, 'http://review.local');
  return { pathname: url.pathname, search: url.searchParams };
}

async function readBody(init?: RequestInit) {
  if (init?.body == null) return {};
  if (typeof init.body === 'string') {
    try {
      return JSON.parse(init.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const { pathname, search } = parseUrl(path);
  const body = await readBody(init);

  if (pathname === '/api/health' && method === 'GET') return json(getHealth()) as T;
  if (pathname === '/api/runtime/snapshot' && method === 'GET')
    return json(getRuntimeSnapshot()) as T;
  if (pathname === '/api/readiness/refresh' && method === 'POST') return json(getReadiness()) as T;
  if (pathname === '/api/runtime/doctor' && method === 'GET')
    return json(getHealth().codexRuntime) as T;
  if (pathname === '/api/onboarding/probe' && method === 'GET')
    return json(getOnboardingProbe()) as T;
  if (pathname === '/api/onboarding/setup' && method === 'POST') {
    return json({ ok: true, probe: getOnboardingProbe() }) as T;
  }
  if (pathname === '/api/onboarding/host-action' && method === 'POST') {
    return json({ ok: true, probe: getOnboardingProbe() }) as T;
  }
  if (pathname === '/api/studio/reset' && method === 'POST') {
    return json({
      ok: true,
      resetAt: new Date().toISOString(),
      libraryDir: 'Review Library (synthetic)',
      defaultWorkspaceId: 'default',
    }) as T;
  }

  if (pathname === '/api/libraries' && method === 'GET') return json(listLibraries()) as T;
  if (pathname === '/api/workspaces' && method === 'GET') return json(listWorkspaces()) as T;
  if (pathname === '/api/workspaces' && method === 'POST') {
    return json(
      upsertWorkspace({ name: typeof body.name === 'string' ? body.name : 'Workspace' }),
    ) as T;
  }
  const workspaceMatch = pathname.match(/^\/api\/workspaces\/([^/]+)$/);
  if (workspaceMatch && method === 'PATCH') {
    return json(
      upsertWorkspace({
        id: decodeURIComponent(workspaceMatch[1]),
        name: typeof body.name === 'string' ? body.name : 'Workspace',
      }),
    ) as T;
  }
  if (workspaceMatch && method === 'DELETE') {
    return json(removeWorkspace(decodeURIComponent(workspaceMatch[1]))) as T;
  }

  if (pathname === '/api/catalog' && method === 'GET') {
    return json(
      queryCatalog({
        workspaceId: search.get('workspace_id') ?? undefined,
        q: search.get('q') ?? undefined,
        deleted: search.get('deleted') === 'true',
        offset: search.get('offset') ? Number(search.get('offset')) : undefined,
        limit: search.get('limit') ? Number(search.get('limit')) : undefined,
      }),
    ) as T;
  }
  if (pathname === '/api/catalog/workspaces' && method === 'GET') {
    const page = queryCatalog({ deleted: search.get('deleted') === 'true' });
    return json(
      listWorkspaces().map((workspace) => ({
        workspaceId: workspace.id,
        imageCount: page.images.filter((image) => image.workspaceId === workspace.id).length,
        totalFileSizeBytes: 0,
        knownFileSizeCount: 0,
        libraryIds: ['library-demo'],
        firstCreatedAt: null,
        latestCreatedAt: null,
        sampleFilePath: null,
        lastImage: null,
      })),
    ) as T;
  }
  const catalogMatch = pathname.match(/^\/api\/catalog\/([^/]+)(?:\/(restore|permanent))?$/);
  if (catalogMatch && catalogMatch[1] !== 'commands' && catalogMatch[1] !== 'workspaces') {
    const id = decodeURIComponent(catalogMatch[1]);
    const action = catalogMatch[2];
    if (method === 'GET') {
      const image = getCatalogImage(id);
      if (!image) notFound(path);
      return json(image) as T;
    }
    if (method === 'PATCH') {
      const image = patchCatalogImage(id, {
        isFavorite: typeof body.isFavorite === 'boolean' ? body.isFavorite : undefined,
        tags: Array.isArray(body.tags) ? (body.tags as string[]) : undefined,
        workspaceId: typeof body.workspaceId === 'string' ? body.workspaceId : undefined,
      });
      if (!image) notFound(path);
      return json(image) as T;
    }
    if (method === 'DELETE') {
      const image = patchCatalogImage(id, { isDeleted: true });
      if (!image) notFound(path);
      return json(image) as T;
    }
    if (action === 'restore' && method === 'POST') {
      const image = patchCatalogImage(id, { isDeleted: false });
      if (!image) notFound(path);
      return json(image) as T;
    }
  }

  if (pathname === '/api/settings' && method === 'GET') return json(getSettings()) as T;
  if (pathname === '/api/settings' && method === 'PATCH') return json(patchSettings(body)) as T;
  if (pathname === '/api/providers' && method === 'GET')
    return json(getProviderCapabilities()) as T;
  if (pathname === '/api/providers/preflight' && method === 'GET')
    return json(getProviderPreflight()) as T;
  if (pathname === '/api/logs' && method === 'GET') return json(listLogs()) as T;
  if (pathname === '/api/codex/session' && method === 'GET')
    return json(getReadiness().localCodexSession) as T;
  if (pathname === '/api/codex/models' && method === 'GET') {
    return json({
      models: [
        {
          id: 'gpt-image-1',
          model: 'gpt-image-1',
          displayName: 'gpt-image-1',
          description: 'Simulated image model',
          hidden: false,
          defaultReasoningEffort: 'low',
          supportedReasoningEfforts: [{ reasoningEffort: 'low', description: null }],
          additionalSpeedTiers: [],
          inputModalities: ['text', 'image'],
          supportsPersonality: false,
          isDefault: true,
        },
      ],
      authMode: 'chatgpt',
      planType: 'chatgpt_plus',
      recommendedDefaultModel: 'gpt-image-1',
      source: 'fallback',
      fetchedAt: '2026-09-20T12:00:00.000Z',
      error: null,
    }) as T;
  }

  const authMatch = pathname.match(/^\/api\/auth\/([^/]+)(?:\/(start|cancel|logout))?$/);
  if (authMatch && method === 'GET')
    return json(getAuthStatus(decodeURIComponent(authMatch[1]))) as T;
  if (authMatch && method === 'POST')
    return json(getAuthStatus(decodeURIComponent(authMatch[1]))) as T;

  if (pathname === '/api/jobs' && method === 'GET') return json(listJobs()) as T;
  const validateItem = (item: Partial<CreateJobRequest>) => {
    if (!item.sourceSpec) return;
    const issues = validateGenerationTaskSpec(item.sourceSpec);
    if (issues.length)
      throw new StudioApiError(issues[0].message, { status: 400, code: 'invalid_task_spec' });
  };
  if (pathname === '/api/jobs' && method === 'POST') {
    const item = body as unknown as CreateJobRequest;
    validateItem(item);
    return json(createJob(item)) as T;
  }
  if (pathname === '/api/jobs/batches' && method === 'POST') {
    const batch = body as unknown as CreateJobBatchRequest;
    batch.items.forEach(validateItem);
    return json(createBatch(batch)) as T;
  }
  const batchMatch = pathname.match(/^\/api\/jobs\/batches\/([^/]+)(?:\/(summary|retry))?$/);
  if (batchMatch) {
    const id = decodeURIComponent(batchMatch[1]);
    if (batchMatch[2] === 'retry' && method === 'POST') {
      for (const item of (body.items ?? []) as Array<{ jobId: string }>) retryJob(item.jobId);
    }
    const batch = getBatch(id);
    if (!batch) notFound(path);
    return json(batch) as T;
  }
  if (pathname === '/api/references/handoff' && method === 'POST') {
    return json({ handoffId: 'handoff-demo', references: [] }) as T;
  }
  const jobMatch = pathname.match(/^\/api\/jobs\/([^/]+)(?:\/(status|retry|cancel))?$/);
  if (jobMatch) {
    const id = decodeURIComponent(jobMatch[1]);
    const action = jobMatch[2];
    if (action === 'status' && method === 'GET') {
      const job = getJob(id);
      if (!job) notFound(path);
      return json({
        id: job.id,
        status: job.status,
        error: job.error,
        updatedAt: job.updatedAt,
      }) as T;
    }
    if (action === 'cancel' && method === 'POST') {
      const job = cancelJob(id);
      if (!job) notFound(path);
      return json(job) as T;
    }
    if (action === 'retry' && method === 'POST') {
      return json(retryJob(id)) as T;
    }
    if (method === 'GET') {
      const detail = getJobDetail(id);
      if (!detail) notFound(path);
      return json(detail) as T;
    }
  }

  if (pathname === '/api/output-sources' && method === 'GET')
    return json(emptyOutputSources()) as T;
  if (pathname === '/api/styles/user' && method === 'GET') return json(listUserStyles()) as T;
  if (pathname === '/api/animation-sequence/runs' && method === 'GET')
    return json(getAnimationReviewRuns()) as T;
  const framePrompt = pathname.match(
    /^\/api\/animation-sequence\/runs\/([^/]+)\/frames\/([^/]+)\/prompt$/,
  );
  if (framePrompt && method === 'GET') {
    const run = getAnimationReviewRuns().runs.find((item) => item.id === framePrompt[1]);
    const frame = run?.framePlan.frames.find((item) => item.id === framePrompt[2]);
    if (!frame) notFound(path);
    return json({ frameId: frame.id, prompt: frame.prompt }) as T;
  }
  if (pathname === '/api/sprite-atlas/runs' && method === 'GET') return json({ runs: [] }) as T;
  if (pathname.startsWith('/api/maintenance')) {
    return json({ ok: true, message: 'Maintenance is simulated and does not touch a disk.' }) as T;
  }

  notFound(path);
}
