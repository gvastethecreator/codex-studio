import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { ImageGenerationConfig } from '../types';
import {
  buildLocalGenerationFailureOutcome,
  buildJobAssets,
  buildLocalGenerationTaskPrompt,
  classifyLocalGenerationFailureReason,
  createLocalRunBatchId,
  createLocalRunTaskSpecId,
  resolveLocalGenerationProviderId,
} from './localGenerationRun';

describe('localGenerationRun', () => {
  it('uses app-server-safe local generation identifiers', () => {
    const batchId = createLocalRunBatchId(
      () => 1234,
      () => 0.5,
    );
    const specId = createLocalRunTaskSpecId({
      batchId,
      batchIndex: 2,
      now: () => 5678,
    });

    expect(batchId).toMatch(/^batch-\d+-[a-z0-9]+$/);
    expect(batchId).toBe('batch-1234-i');
    expect(specId).toBe('spec-batch-1234-i-2-5678');
  });

  it('uses the explicit provider before Studio Settings defaults', () => {
    expect(
      resolveLocalGenerationProviderId({
        providerId: 'dry_run',
        settings: { defaultProviderId: 'fal' },
      }),
    ).toBe('dry_run');
  });

  it('uses the Studio Settings default provider when no override is provided', () => {
    expect(
      resolveLocalGenerationProviderId({
        settings: { defaultProviderId: 'fal' },
      }),
    ).toBe('fal');
  });

  it('falls back to Codex when settings are unavailable', () => {
    expect(resolveLocalGenerationProviderId({ settings: null })).toBe('codex');
  });

  it('keeps image-guided task prompt compact instead of embedding recipe transport text', () => {
    const config: ImageGenerationConfig = {
      ...DEFAULT_GENERATION_CONFIG,
      prompt: '',
      recipeId: 'styles',
      recipeContext: '--- CODEX RECIPE CONTEXT --- legacy block',
      negativePrompt: 'explicit, harsh',
      attachments: [
        {
          id: 'att-1',
          name: 'download.jpg',
          dataUrl: 'data:image/jpeg;base64,AAA',
          strength: 0.15,
        },
      ],
    };
    const prompt = buildLocalGenerationTaskPrompt({
      config,
    });

    expect(prompt).toBe('Apply the selected style using the provided reference image.');
    expect(prompt).not.toContain('CODEX RECIPE CONTEXT');
    expect(prompt).not.toContain('Avoid:');
  });

  it('materializes queued attachments as backend task assets', async () => {
    const assets = await buildJobAssets({
      config: {
        ...DEFAULT_GENERATION_CONFIG,
        attachments: [
          {
            id: 'att-1',
            name: 'download.jpg',
            dataUrl: 'data:image/jpeg;base64,AAA',
            strength: 0.15,
          },
        ],
      },
    });

    expect(assets).toEqual([
      {
        role: 'reference',
        name: 'download.jpg',
        dataUrl: 'data:image/jpeg;base64,AAA',
        strength: 0.15,
      },
    ]);
  });

  it('keeps edit-mode assets scoped to input image plus mask attachments', async () => {
    const assets = await buildJobAssets({
      config: {
        ...DEFAULT_GENERATION_CONFIG,
        attachments: [
          {
            id: 'att-stale',
            name: 'old-reference.png',
            dataUrl: 'data:image/png;base64,OLD',
            strength: 0.3,
          },
          {
            id: 'mask-123',
            name: 'edit-mask.png',
            dataUrl: 'data:image/png;base64,MASK',
            strength: 1,
          },
        ],
      },
      inputImage: {
        src: 'data:image/png;base64,INPUT',
        prompt: 'Apply edit',
      },
    });

    expect(assets).toEqual([
      {
        role: 'input',
        name: 'input-image.png',
        dataUrl: 'data:image/png;base64,INPUT',
        strength: 1,
      },
      {
        role: 'mask',
        name: 'edit-mask.png',
        dataUrl: 'data:image/png;base64,MASK',
        strength: 1,
      },
    ]);
  });

  it('classifies lifecycle failures as cancelled, timeout, or failed', () => {
    const cancelled = new Error('Operation cancelled by user');
    cancelled.name = 'AbortError';

    expect(classifyLocalGenerationFailureReason(cancelled)).toBe('cancelled');
    expect(
      classifyLocalGenerationFailureReason(new Error('Timed out waiting for job completion')),
    ).toBe('timeout');
    expect(classifyLocalGenerationFailureReason(new Error('provider failed'))).toBe('failed');
  });

  it('builds typed lifecycle failure outcomes', () => {
    const timeoutOutcome = buildLocalGenerationFailureOutcome({
      error: new Error('timeout during watch'),
      durationMs: 1200,
    });

    expect(timeoutOutcome).toMatchObject({
      status: 'failed',
      reason: 'timeout',
      message: 'timeout during watch',
      durationMs: 1200,
    });

    const cancelled = new Error('Operation cancelled by user');
    cancelled.name = 'AbortError';

    const cancelledOutcome = buildLocalGenerationFailureOutcome({
      error: cancelled,
      durationMs: 350,
    });

    expect(cancelledOutcome).toMatchObject({
      status: 'cancelled',
      reason: 'cancelled',
      message: 'Operation cancelled by user',
      durationMs: 350,
    });
  });
});
