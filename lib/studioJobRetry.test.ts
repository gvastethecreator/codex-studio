import { describe, expect, it } from 'vite-plus/test';

import type { JobDetailResponse } from '../packages/shared/src';
import { buildStudioJobRetryRequest, canRetryStudioJob } from './studioJobRetry';

function createDetail(overrides: Partial<JobDetailResponse> = {}): JobDetailResponse {
  return {
    job: {
      id: 'job-1',
      projectId: 'project-1',
      kind: 'image_generate',
      providerId: 'codex',
      sourceSpec: {
        id: 'spec-1',
        version: 'generation-task-spec/v1',
        task: 'image_generate',
        providerId: 'codex',
        prompt: 'Retry this scene',
        negativePrompt: 'low quality',
        recipeId: 'styles',
        recipeParams: { style: 'retro' },
        stylePresetId: null,
        assets: [
          {
            role: 'reference',
            name: 'ref.png',
            localPath: 'D:/AI-Studio-Library/references/ref.png',
            strength: 0.35,
          },
        ],
        quality: null,
        output: {
          count: 1,
          aspectRatio: '1:1',
          imageSize: '1K',
          mimeType: 'image/png',
          requiresLocalAsset: true,
          requiresCatalogEntry: true,
          requiresExactPath: true,
        },
        metadata: {
          workspaceId: 'workspace-1',
          batchId: 'batch-old',
        },
      },
      status: 'needs_review',
      execution: {
        model: 'gpt-5.4-mini',
        reasoningEffort: 'medium',
        serviceTier: 'fast',
      },
      originalPrompt: 'Retry this scene',
      expandedPrompt: null,
      finalPromptUsed: 'Retry this scene',
      error: null,
      createdAt: '2026-05-27T10:00:00.000Z',
      updatedAt: '2026-05-27T10:00:10.000Z',
      completedAt: null,
    },
    events: [],
    turn: null,
    transcriptEntries: [],
    catalogImages: [],
    metrics: {
      timings: [
        { id: 'total', label: 'Total', durationMs: 10_000 },
        { id: 'queued', label: 'Queued', durationMs: 500 },
        { id: 'provider', label: 'Provider', durationMs: 9_000 },
        { id: 'asset_import', label: 'Import', durationMs: 500 },
      ],
      tokenUsage: null,
      estimatedPromptTokens: 20,
    },
    ...overrides,
  };
}

describe('canRetryStudioJob', () => {
  it('allows retrying any persisted job state', () => {
    expect(canRetryStudioJob('queued')).toBe(true);
    expect(canRetryStudioJob('running')).toBe(true);
    expect(canRetryStudioJob('needs_review')).toBe(true);
    expect(canRetryStudioJob('completed')).toBe(true);
    expect(canRetryStudioJob('failed')).toBe(true);
    expect(canRetryStudioJob('cancelled')).toBe(true);
  });
});

describe('buildStudioJobRetryRequest', () => {
  it('rebuilds a create-job payload with a fresh batch id', () => {
    const detail = createDetail();

    const request = buildStudioJobRetryRequest(detail, {
      batchId: 'batch-retry-1',
    });

    expect(request).toEqual({
      projectId: 'project-1',
      kind: 'image_generate',
      providerId: 'codex',
      prompt: 'Retry this scene',
      execution: {
        model: 'gpt-5.4-mini',
        reasoningEffort: 'medium',
        serviceTier: 'fast',
      },
      references: [],
      sourceSpec: expect.objectContaining({
        id: 'spec-1',
        prompt: 'Retry this scene',
        assets: [
          expect.objectContaining({
            role: 'reference',
            name: 'ref.png',
            localPath: 'D:/AI-Studio-Library/references/ref.png',
          }),
        ],
        metadata: expect.objectContaining({
          workspaceId: 'workspace-1',
          batchId: 'batch-retry-1',
          variationKey: expect.stringMatching(/^retry-/),
          variationBrief: expect.stringContaining('fresh interpretation'),
        }),
      }),
    });

    expect(request.sourceSpec).not.toBe(detail.job.sourceSpec);
    expect(request.sourceSpec?.assets[0]).not.toBe(detail.job.sourceSpec?.assets[0]);
  });

  it('replays inline task assets through references so the backend can persist local paths', () => {
    const detail = createDetail({
      job: {
        ...createDetail().job,
        sourceSpec: {
          ...createDetail().job.sourceSpec!,
          assets: [
            {
              role: 'input',
              name: 'uploaded.png',
              dataUrl: 'data:image/png;base64,UPLOAD',
              strength: 1,
            },
            {
              role: 'reference',
              name: 'style.png',
              dataUrl: 'data:image/png;base64,STYLE',
              strength: 0.25,
            },
          ],
        },
      },
    });

    const request = buildStudioJobRetryRequest(detail, { batchId: 'batch-retry-inline' });

    expect(request.references).toEqual([
      {
        name: 'uploaded.png',
        dataUrl: 'data:image/png;base64,UPLOAD',
        strength: 1,
      },
      {
        name: 'style.png',
        dataUrl: 'data:image/png;base64,STYLE',
        strength: 0.25,
      },
    ]);
  });

  it('falls back to recorded prompts when a source spec is unavailable', () => {
    const detail = createDetail({
      job: {
        ...createDetail().job,
        sourceSpec: null,
        providerId: null,
        kind: 'dry_run',
        originalPrompt: 'Fallback prompt',
        finalPromptUsed: 'Fallback prompt final',
      },
    });

    const request = buildStudioJobRetryRequest(detail);

    expect(request.kind).toBe('dry_run');
    expect(request.providerId).toBeUndefined();
    expect(request.prompt).toBe('Fallback prompt');
    expect(request.sourceSpec).toBeNull();
    expect(request.references).toBeUndefined();
  });
});
