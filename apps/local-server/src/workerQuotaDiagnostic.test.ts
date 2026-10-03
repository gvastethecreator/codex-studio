import { providerSync } from './providers/providerEffect';
import { describe, expect, it, vi } from 'vitest';

import type { Job } from '../../../packages/shared/src';
import { BUILT_IN_GENERATION_PROVIDERS } from '../../../packages/shared/src/generationContracts';
import type { GenerationProvider } from './providers/types';
import { ProviderExecutionUncertainError } from './workerErrors';
import { SubscriptionHttpError } from './providers/subscriptionHttpError';
import { extractSubscriptionHttpDiagnostic } from './providers/subscriptionHttpDiagnostic';

vi.mock('./db/outputGenerations', () => ({ getOutputGeneration: () => 1 }));

vi.mock('./catalog', () => ({
  getCatalogImageByJobId: vi.fn(() => null),
  registerCatalogImage: vi.fn(() => null),
  updateCatalogImageFileSize: vi.fn(() => null),
}));

vi.mock('./db/assets', () => ({
  addAsset: vi.fn(() => null),
  getAssetByJobId: vi.fn(() => null),
}));

vi.mock('./db/events', () => ({
  addJobEvent: vi.fn(),
}));

vi.mock('./db/jobs', () => ({
  getJob: vi.fn(() => null),
  updateJobFinalization: vi.fn(() => null),
  updateJobStatus: vi.fn(() => null),
  updateJobRemoteExecution: vi.fn(),
}));

vi.mock('./db/settings', () => ({
  getSettingValue: vi.fn(() => null),
  setSettingValue: vi.fn(),
}));

vi.mock('./db/codexTurns', () => ({
  upsertCodexTurn: vi.fn(() => 'turn-record-default'),
}));

import { createWorkerController } from './worker';

function createJob(id: string): Job {
  return {
    id,
    workspaceId: 'default',
    kind: 'image_generate',
    providerId: 'chatgpt',
    sourceSpec: null,
    status: 'queued',
    execution: null,
    originalPrompt: 'PRIVATE_PROMPT_SENTINEL',
    expandedPrompt: null,
    finalPromptUsed: 'PRIVATE_PROMPT_SENTINEL',
    error: null,
    createdAt: '2026-09-25T22:00:00.000Z',
    updatedAt: '2026-09-25T22:00:00.000Z',
    completedAt: null,
  };
}

function createHarness(run: GenerationProvider['run']) {
  const jobs = new Map<string, Job>();
  const addJobEvent = vi.fn();
  const updateJobStatus = vi.fn((id: string, status: Job['status'], error?: string | null) => {
    const current = jobs.get(id);
    if (!current) return null;
    const updated = { ...current, status, error: error ?? null };
    jobs.set(id, updated);
    return updated;
  });
  const controller = createWorkerController({
    createGenerationProvider: () => ({ id: 'codex', run }),
    createExternalProvider: () => ({ id: 'chatgpt', run }),
    getSettings: () =>
      ({
        workerLimits: {
          global: 1,
          providers: Object.fromEntries(
            BUILT_IN_GENERATION_PROVIDERS.map((provider) => [provider, 1]),
          ),
        },
      }) as never,
    addJobEvent,
    getJob: (id) => jobs.get(id) ?? null,
    updateJobStatus,
    updateJobRemoteExecution: vi.fn(),
    upsertCodexTurn: vi.fn(() => 'turn-record-1'),
    publishEvent: vi.fn(),
    logger: vi.fn(),
  });
  return { addJobEvent, controller, jobs };
}

function quotaDiagnostic() {
  return extractSubscriptionHttpDiagnostic({
    schemaVersion: 1,
    receivedAt: '2026-09-25T22:00:00.000Z',
    provider: 'chatgpt',
    transport: 'subscription_http',
    channel: 'http_json',
    httpStatus: 429,
    headers: { 'Retry-After': '30' },
    payload: {
      error: {
        code: 'usage_limit_reached',
        message: 'PRIVATE_PROMPT_SENTINEL',
      },
    },
    synthetic: true,
  });
}

describe('worker quota diagnostic metadata', () => {
  it('projects the allowlisted diagnostic onto job.failed', async () => {
    const diagnostic = quotaDiagnostic();
    const job = createJob('failed-quota');
    const harness = createHarness(() =>
      providerSync(() => {
        throw new SubscriptionHttpError(
          'ChatGPT reported an exhausted usage limit. PRIVATE_PROMPT_SENTINEL',
          {
            code: 'source_limit',
            fallbackAllowed: false,
            httpStatus: 429,
            providerCode: 'usage_limit_reached',
            retryAfterSeconds: 30,
            diagnostic,
          },
        );
      }),
    );
    harness.jobs.set(job.id, job);
    harness.controller.enqueueJob(job);
    await vi.waitFor(() => expect(harness.jobs.get(job.id)?.status).toBe('failed'));
    const failed = harness.addJobEvent.mock.calls.find((call) => call[1] === 'job.failed');
    expect(failed?.[3]).toMatchObject({
      code: 'source_limit',
      providerCode: 'usage_limit_reached',
      httpStatus: 429,
      retryAfterSeconds: 30,
      transport: 'chatgpt',
      diagnostic: {
        transport: 'subscription_http',
        classification: { category: 'source_limit' },
        reset: { atUtc: null },
      },
    });
    expect(JSON.stringify(failed?.[3].diagnostic)).not.toContain('PRIVATE_PROMPT_SENTINEL');
    expect(failed?.[3].diagnostic).not.toHaveProperty('prompt');
    await harness.controller.shutdown();
  });

  it('projects the cause diagnostic onto job.needs_review', async () => {
    const diagnostic = quotaDiagnostic();
    const job = createJob('review-quota');
    const harness = createHarness(() =>
      providerSync(() => {
        throw new ProviderExecutionUncertainError(
          'Review this job before sending another request.',
          {
            cause: new SubscriptionHttpError('service failure', {
              code: 'http_error',
              fallbackAllowed: false,
              httpStatus: 503,
              diagnostic,
            }),
          },
        );
      }),
    );
    harness.jobs.set(job.id, job);
    harness.controller.enqueueJob(job);
    await vi.waitFor(() => expect(harness.jobs.get(job.id)?.status).toBe('needs_review'));
    const review = harness.addJobEvent.mock.calls.find((call) => call[1] === 'job.needs_review');
    expect(review?.[3]).toMatchObject({
      code: 'http_error',
      httpStatus: 503,
      diagnostic: { schemaVersion: 1 },
    });
    expect(JSON.stringify(review?.[3].diagnostic)).not.toContain('PRIVATE_PROMPT_SENTINEL');
    await harness.controller.shutdown();
  });

  it('still fails the job when the attached diagnostic is not exportable', async () => {
    const job = createJob('invalid-diagnostic');
    const harness = createHarness(() =>
      providerSync(() => {
        throw new SubscriptionHttpError('limit', {
          code: 'source_limit',
          fallbackAllowed: false,
          diagnostic: { schemaVersion: 9, prompt: 'PRIVATE_PROMPT_SENTINEL' } as never,
        });
      }),
    );
    harness.jobs.set(job.id, job);
    harness.controller.enqueueJob(job);
    await vi.waitFor(() => expect(harness.jobs.get(job.id)?.status).toBe('failed'));
    const failed = harness.addJobEvent.mock.calls.find((call) => call[1] === 'job.failed');
    expect(failed?.[3]).toMatchObject({ code: 'source_limit' });
    expect(failed?.[3].diagnostic).toBeUndefined();
    expect(JSON.stringify(failed?.[3])).not.toContain('PRIVATE_PROMPT_SENTINEL');
    await harness.controller.shutdown();
  });
});
