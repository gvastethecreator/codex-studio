import { describe, expect, it, vi } from 'vitest';

import {
  createDefaultEditableStudioSettings,
  createGenerationTaskSpec,
  type GenerationTaskSpec,
  type Job,
} from '../../../packages/shared/src';
import {
  createPersistentJobIntake,
  resolvePersistentJobIntakeKind,
  type ReferenceProcessingErrorLike,
} from './persistentJobIntake';
import { hydrateSourceSpecAssetPaths } from './referenceManager';

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: overrides.id ?? 'job-1',
    workspaceId: overrides.workspaceId ?? 'default',
    kind: overrides.kind ?? 'image_generate',
    providerId: overrides.providerId ?? 'codex',
    sourceSpec: overrides.sourceSpec ?? null,
    status: overrides.status ?? 'queued',
    execution: overrides.execution ?? null,
    originalPrompt: overrides.originalPrompt ?? 'prompt',
    expandedPrompt: overrides.expandedPrompt ?? null,
    finalPromptUsed: overrides.finalPromptUsed ?? 'prompt',
    error: overrides.error ?? null,
    createdAt: overrides.createdAt ?? '2026-06-28T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-06-28T00:00:00.000Z',
    completedAt: overrides.completedAt ?? null,
  };
}

type CreateJobInput = {
  id: string;
  workspaceId?: string | null;
  kind: Job['kind'];
  providerId: Job['providerId'];
  sourceSpec: GenerationTaskSpec | null;
  prompt: string;
  execution: Job['execution'];
};

describe('persistentJobIntake', () => {
  it('treats codex_imagegen as a transport alias instead of a durable new-job kind', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-1',
      task: 'style_preset_card',
      providerId: 'codex',
      prompt: 'card',
    });

    expect(resolvePersistentJobIntakeKind('codex_imagegen', null)).toBe('image_generate');
    expect(resolvePersistentJobIntakeKind('codex_imagegen', sourceSpec)).toBe('style_preset_card');
    expect(resolvePersistentJobIntakeKind('dry_run', null)).toBe('dry_run');
  });

  it('creates, publishes, and enqueues normalized jobs behind one intake seam', async () => {
    const publishEvent = vi.fn();
    const logJobCreated = vi.fn();
    const enqueueJob = vi.fn();
    const createJobFn = vi.fn((input: CreateJobInput) =>
      createJob({
        id: input.id,
        kind: input.kind,
        providerId: input.providerId,
        sourceSpec: input.sourceSpec,
        originalPrompt: input.prompt,
        finalPromptUsed: input.prompt,
      }),
    );
    const intake = createPersistentJobIntake({
      createJobId: () => 'job-new',
      createJob: createJobFn,
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({ augmentedPrompt: 'draw', persistedRefs: [] }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,

      readLibraryDir: () => 'D:/library',
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError: (_error): _error is ReferenceProcessingErrorLike => false,
      publishEvent,
      logJobCreated,
      enqueueJob,
    });

    const result = await intake.createJob({ kind: 'codex_imagegen', prompt: 'draw' });

    expect(result.ok).toBe(true);
    expect(createJobFn).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'image_generate',
        providerId: 'codex',
        libraryContext: { libraryId: 'legacy-default', rootPath: 'D:/library' },
      }),
    );
    expect(publishEvent).toHaveBeenCalledWith(
      'job.created',
      expect.objectContaining({ kind: 'image_generate' }),
    );
    expect(logJobCreated).toHaveBeenCalledWith('image_generate', 'job-new');
    expect(enqueueJob).toHaveBeenCalledWith(expect.objectContaining({ id: 'job-new' }));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      publishEvent.mockImplementationOnce(() => {
        throw new Error('Notification disconnected');
      });
      intake.dispatchJobs([createJob({ id: 'accepted-one' }), createJob({ id: 'accepted-two' })]);
      expect(enqueueJob.mock.calls.slice(-2).map(([job]) => job.id)).toEqual([
        'accepted-one',
        'accepted-two',
      ]);
      expect(warn).toHaveBeenCalledOnce();
    } finally {
      warn.mockRestore();
    }
  });

  it('captures the selected execution route and validates its availability', async () => {
    let httpReady = true;
    const createJobFn = vi.fn((input: CreateJobInput) =>
      createJob({
        providerId: input.providerId,
        execution: input.execution,
      }),
    );
    const intake = createPersistentJobIntake({
      createJobId: () => 'job-policy',
      createJob: createJobFn,
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({ augmentedPrompt: 'draw', persistedRefs: [] }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,

      readCodexTransportAvailability: () => ({
        codex_app_server: true,
        subscription_http: httpReady,
      }),
      readLibraryDir: () => 'D:/library',
      readEditableSettings: () => ({
        ...createDefaultEditableStudioSettings(),
        providerDefaults: {
          codex: {
            providerId: 'codex',
            model: 'provider-model',
            reasoningEffort: 'high',
            serviceTier: 'fast',
          },
        },
      }),
      resolveBootstrapExecution: () => ({
        model: 'bootstrap-model',
        reasoningEffort: 'medium',
        serviceTier: null,
      }),
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError: (_error): _error is ReferenceProcessingErrorLike => false,
      publishEvent: vi.fn(),
      logJobCreated: vi.fn(),
      enqueueJob: vi.fn(),
    });

    await intake.createJob({
      kind: 'codex_imagegen',
      prompt: 'draw',
      execution: {
        model: 'explicit-model',
        reasoningEffort: '',
      },
    });

    expect(createJobFn).toHaveBeenCalledWith(
      expect.objectContaining({
        execution: {
          model: 'explicit-model',
          reasoningEffort: 'high',
          serviceTier: 'fast',
          providerOptions: { codex: { transport: 'codex_app_server' } },
        },
      }),
    );

    const captured = createJobFn.mock.calls[0][0].execution!;
    const changed = await intake.createJob({
      kind: 'image_generate',
      prompt: 'draw',
      execution: captured,
    });
    expect(changed).toMatchObject({
      ok: true,
      job: { execution: { providerOptions: { codex: { transport: 'codex_app_server' } } } },
    });
    const unsupported = await intake.createJob({
      kind: 'image_generate',
      providerId: 'chatgpt',
      prompt: 'draw',
      execution: { model: 'gpt-5.4', reasoningEffort: 'high', serviceTier: 'fast' },
    });
    expect(unsupported).toMatchObject({
      ok: false,
      error: { body: { code: 'chatgpt_execution_unsupported' } },
    });
    expect(createJobFn).toHaveBeenCalledTimes(2);
    const accepted = await intake.createJob({
      kind: 'image_generate',
      providerId: 'chatgpt',
      prompt: 'draw',
      execution: {
        model: 'gpt-5.5',
        reasoningEffort: 'provider_default',
        serviceTier: null,
        providerOptions: {
          chatgpt: { imageModel: 'gpt-image-2.5-sunburst' },
        },
      },
      sourceSpec: createGenerationTaskSpec({
        id: 'http-wide',
        task: 'image_generate',
        providerId: 'chatgpt',
        prompt: 'draw',
        output: { aspectRatio: '16:9' },
      }),
    });
    expect(accepted).toMatchObject({
      ok: true,
      job: {
        execution: {
          providerOptions: {
            chatgpt: {
              image: { model: 'gpt-image-2.5-sunburst', size: '1536x864', quality: 'medium' },
            },
          },
        },
      },
    });
    expect(captured.providerOptions?.codex?.transport).toBe('codex_app_server');

    httpReady = false;
    const unavailable = await intake.createJob({
      kind: 'image_generate',
      providerId: 'chatgpt',
      prompt: 'draw',
      execution: {
        model: 'gpt-5.5',
        reasoningEffort: 'provider_default',
        serviceTier: null,
        providerOptions: { chatgpt: {} },
      },
      sourceSpec: createGenerationTaskSpec({
        id: 'http-unavailable',
        task: 'image_generate',
        providerId: 'chatgpt',
        prompt: 'draw',
      }),
    });
    expect(unavailable).toMatchObject({
      ok: false,
      error: { body: { code: 'chatgpt_transport_unavailable', transport: 'subscription_http' } },
    });
    expect(createJobFn).toHaveBeenCalledTimes(3);
  });

  it('hydrates Studio Library recipe retry assets before final source spec validation', async () => {
    const publishEvent = vi.fn();
    const logJobCreated = vi.fn();
    const enqueueJob = vi.fn();
    const processReferences = vi.fn(async () => ({
      augmentedPrompt: 'retry image',
      persistedRefs: [],
    }));
    const createJobFn = vi.fn((input: CreateJobInput) =>
      createJob({
        id: input.id,
        kind: input.kind,
        providerId: input.providerId,
        sourceSpec: input.sourceSpec,
        originalPrompt: input.prompt,
        finalPromptUsed: input.prompt,
      }),
    );
    const intake = createPersistentJobIntake({
      createJobId: () => 'job-retry',
      createJob: createJobFn,
      updateJobFinalPrompt: () => null,
      processReferences,
      hydrateSourceSpecAssetPaths: (sourceSpec, references, persistedRefs, libraryDir) =>
        hydrateSourceSpecAssetPaths(
          sourceSpec,
          references ?? [],
          persistedRefs as Parameters<typeof hydrateSourceSpecAssetPaths>[2],
          libraryDir,
        ),

      readLibraryDir: () => 'D:/AI-Studio-Library',
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError: (_error): _error is ReferenceProcessingErrorLike => false,
      publishEvent,
      logJobCreated,
      enqueueJob,
    });
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-batch-retry-1-1-12345',
      task: 'image_generate',
      providerId: 'codex',
      prompt: 'retry image',
      assets: [
        {
          role: 'reference',
          name: 'past-result.webp',
          sourceUrl: 'http://127.0.0.1:17223/library/outputs/past-result.webp',
          strength: 0.5,
        },
      ],
      metadata: {
        workspaceId: 'workspace-1',
        batchId: 'batch-retry-1',
      },
    });

    const result = await intake.createJob({
      kind: 'image_generate',
      providerId: 'codex',
      prompt: 'retry image',
      sourceSpec,
    });

    expect(result.ok).toBe(true);
    expect(processReferences).toHaveBeenCalledWith(
      'job-retry',
      'retry image',
      [],
      'D:/AI-Studio-Library',
    );
    expect(createJobFn).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceSpec: expect.objectContaining({
          assets: [
            expect.objectContaining({
              sourceUrl: undefined,
              localPath: expect.stringContaining('past-result.webp'),
            }),
          ],
        }),
      }),
    );
    expect(enqueueJob).toHaveBeenCalledWith(expect.objectContaining({ id: 'job-retry' }));
  });

  it('rejects provider blockers before reference persistence', async () => {
    const processReferences = vi.fn(async () => ({ augmentedPrompt: 'x', persistedRefs: [] }));
    const intake = createPersistentJobIntake({
      createJobId: () => 'job-new',
      createJob: () => createJob(),
      updateJobFinalPrompt: () => null,
      processReferences,
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,

      readLibraryDir: () => 'D:/library',
      resolveProviderExecutionBlocker: (providerId) =>
        providerId === 'google' ? { error: 'blocked' } : null,
      isReferenceProcessingError: (_error): _error is ReferenceProcessingErrorLike => false,
      publishEvent: () => ({ type: 'job.created', payload: {}, createdAt: '' }),
      logJobCreated: () => {},
      enqueueJob: () => {},
    });

    const result = await intake.createJob({
      kind: 'image_generate',
      providerId: 'google',
      prompt: 'draw',
    });

    expect(result).toEqual({ ok: false, error: { status: 400, body: { error: 'blocked' } } });
    expect(processReferences).not.toHaveBeenCalled();
  });

  it.each([
    { prompt: 'draw' } as GenerationTaskSpec,
    createGenerationTaskSpec({
      id: 'missing-source',
      task: 'image_generate',
      prompt: 'restore the photograph',
      recipeId: 'remaster',
    }),
  ])(
    'rejects invalid input before reference persistence or job creation: %j',
    async (sourceSpec) => {
      const createJobFn = vi.fn(() => createJob());
      const processReferences = vi.fn(async () => ({ augmentedPrompt: 'x', persistedRefs: [] }));
      const intake = createPersistentJobIntake({
        createJobId: () => 'job-new',
        createJob: createJobFn,
        updateJobFinalPrompt: () => null,
        processReferences,
        hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,

        readLibraryDir: () => 'D:/library',
        resolveProviderExecutionBlocker: () => null,
        isReferenceProcessingError: (_error): _error is ReferenceProcessingErrorLike => false,
        publishEvent: () => ({ type: 'job.created', payload: {}, createdAt: '' }),
        logJobCreated: () => {},
        enqueueJob: () => {},
      });

      const result = await intake.createJob({
        kind: 'image_generate',
        prompt: 'draw',
        sourceSpec,
        references: [
          {
            name: 'ref.png',
            dataUrl: `data:image/png;base64,${Buffer.from('abc').toString('base64')}`,
            strength: 0.5,
          },
        ],
      });

      expect(result).toEqual({
        ok: false,
        error: {
          status: 400,
          body: expect.objectContaining({
            error: 'Invalid Generation Task Spec',
            code: 'invalid_task_spec',
          }),
        },
      });
      expect(processReferences).not.toHaveBeenCalled();
      expect(createJobFn).not.toHaveBeenCalled();
    },
  );

  it('rejects hydrated provider assets outside the captured Library Context', async () => {
    const createJobFn = vi.fn();
    const intake = createPersistentJobIntake({
      createJobId: () => 'job-hostile-path',
      createJob: createJobFn,
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({ augmentedPrompt: 'edit', persistedRefs: [] }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,

      readLibraryDir: () => 'D:/StudioLibrary',
      readLibraryContext: () => ({
        libraryId: 'library-1',
        rootPath: 'D:/StudioLibrary',
      }),
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError: (_error): _error is ReferenceProcessingErrorLike => false,
      publishEvent: () => ({ type: 'job.created', payload: {}, createdAt: '' }),
      logJobCreated: () => {},
      enqueueJob: () => {},
    });

    const result = await intake.createJob({
      kind: 'image_edit',
      providerId: 'google',
      prompt: 'edit',
      sourceSpec: createGenerationTaskSpec({
        id: 'spec-hostile-path',
        task: 'image_edit',
        providerId: 'google',
        prompt: 'edit',
        assets: [{ role: 'input', name: 'secret.png', localPath: 'D:/secrets/secret.png' }],
      }),
    });

    expect(result).toEqual({
      ok: false,
      error: {
        status: 400,
        body: expect.objectContaining({
          code: 'unmanaged_asset_path',
          field: 'sourceSpec.assets.0.localPath',
        }),
      },
    });
    expect(createJobFn).not.toHaveBeenCalled();
  });

  it('rejects a Grok job with an unsupported ratio before enqueue', async () => {
    const createJobFn = vi.fn();
    const enqueueJob = vi.fn();
    const intake = createPersistentJobIntake({
      createJobId: () => 'job-grok-ratio',
      createJob: createJobFn,
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({ augmentedPrompt: 'draw', persistedRefs: [] }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,

      readLibraryDir: () => 'D:/library',
      resolveBootstrapExecution: () => ({
        model: 'grok-4.6',
        reasoningEffort: 'low',
        serviceTier: null,
      }),
      readGrokAvailableModels: () => ['grok-4.6', 'grok-4.5'],
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError: (_error): _error is ReferenceProcessingErrorLike => false,
      publishEvent: vi.fn(),
      logJobCreated: vi.fn(),
      enqueueJob,
    });

    const result = await intake.createJob({
      kind: 'image_generate',
      providerId: 'grok',
      prompt: 'A red paper boat.',
      sourceSpec: createGenerationTaskSpec({
        id: 'spec-grok-ratio',
        task: 'image_generate',
        providerId: 'grok',
        prompt: 'A red paper boat.',
        output: { count: 1, aspectRatio: '2:3' },
      }),
    });

    expect(result).toEqual({
      ok: false,
      error: {
        status: 400,
        body: expect.objectContaining({
          code: 'invalid_grok_aspect_ratio',
          field: 'sourceSpec.output.aspectRatio',
        }),
      },
    });
    expect(createJobFn).not.toHaveBeenCalled();
    expect(enqueueJob).not.toHaveBeenCalled();
  });

  it('rejects a Grok job that has no Generation Task Spec', async () => {
    const createJobFn = vi.fn();
    const intake = createPersistentJobIntake({
      createJobId: () => 'job-grok-no-spec',
      createJob: createJobFn,
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({ augmentedPrompt: 'draw', persistedRefs: [] }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,

      readLibraryDir: () => 'D:/library',
      resolveBootstrapExecution: () => ({
        model: 'grok-4.6',
        reasoningEffort: 'low',
        serviceTier: null,
      }),
      readGrokAvailableModels: () => ['grok-4.6'],
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError: (_error): _error is ReferenceProcessingErrorLike => false,
      publishEvent: vi.fn(),
      logJobCreated: vi.fn(),
      enqueueJob: vi.fn(),
    });

    const result = await intake.createJob({
      kind: 'image_generate',
      providerId: 'grok',
      prompt: 'A red paper boat.',
    });

    expect(result).toEqual({
      ok: false,
      error: {
        status: 400,
        body: expect.objectContaining({
          code: 'missing_source_spec',
          field: 'sourceSpec',
        }),
      },
    });
    expect(createJobFn).not.toHaveBeenCalled();
  });

  it('rejects a Grok job whose model is missing from the Runtime Doctor list', async () => {
    const createJobFn = vi.fn();
    const intake = createPersistentJobIntake({
      createJobId: () => 'job-grok-model',
      createJob: createJobFn,
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({ augmentedPrompt: 'draw', persistedRefs: [] }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,

      readLibraryDir: () => 'D:/library',
      resolveBootstrapExecution: () => ({
        model: 'grok-next-missing',
        reasoningEffort: 'low',
        serviceTier: null,
      }),
      readGrokAvailableModels: () => ['grok-4.6', 'grok-4.5'],
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError: (_error): _error is ReferenceProcessingErrorLike => false,
      publishEvent: vi.fn(),
      logJobCreated: vi.fn(),
      enqueueJob: vi.fn(),
    });

    const result = await intake.createJob({
      kind: 'image_generate',
      providerId: 'grok',
      prompt: 'A red paper boat.',
      sourceSpec: createGenerationTaskSpec({
        id: 'spec-grok-model',
        task: 'image_generate',
        providerId: 'grok',
        prompt: 'A red paper boat.',
      }),
    });

    expect(result).toEqual({
      ok: false,
      error: {
        status: 400,
        body: expect.objectContaining({
          code: 'unavailable_grok_model',
          field: 'execution.model',
        }),
      },
    });
    expect(createJobFn).not.toHaveBeenCalled();
  });
});
