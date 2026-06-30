import { describe, expect, it, vi } from 'vite-plus/test';

import {
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
    projectId: overrides.projectId ?? 'project-1',
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
  projectId: string;
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
        projectId: input.projectId,
        kind: input.kind,
        providerId: input.providerId,
        sourceSpec: input.sourceSpec,
        originalPrompt: input.prompt,
        finalPromptUsed: input.prompt,
      }),
    );
    const intake = createPersistentJobIntake({
      ensureDefaultProjectId: () => 'project-default',
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
      expect.objectContaining({ kind: 'image_generate', providerId: 'codex' }),
    );
    expect(publishEvent).toHaveBeenCalledWith(
      'job.created',
      expect.objectContaining({ kind: 'image_generate' }),
    );
    expect(logJobCreated).toHaveBeenCalledWith('image_generate', 'job-new');
    expect(enqueueJob).toHaveBeenCalledWith(expect.objectContaining({ id: 'job-new' }));
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
        projectId: input.projectId,
        kind: input.kind,
        providerId: input.providerId,
        sourceSpec: input.sourceSpec,
        originalPrompt: input.prompt,
        finalPromptUsed: input.prompt,
      }),
    );
    const intake = createPersistentJobIntake({
      ensureDefaultProjectId: () => 'project-default',
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
      ensureDefaultProjectId: () => 'project-default',
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

  it('rejects malformed source specs before reference persistence', async () => {
    const processReferences = vi.fn(async () => ({ augmentedPrompt: 'x', persistedRefs: [] }));
    const intake = createPersistentJobIntake({
      ensureDefaultProjectId: () => 'project-default',
      createJobId: () => 'job-new',
      createJob: () => createJob(),
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
      sourceSpec: { prompt: 'draw' } as GenerationTaskSpec,
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
  });
});
