import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec, type Job } from '../../../packages/shared/src';
import { resolveWorkerRuntimeTarget } from './workerRouting';

function job(overrides: Partial<Job> = {}): Job {
  return {
    id: overrides.id ?? 'job-1',
    projectId: overrides.projectId ?? 'project-1',
    kind: overrides.kind ?? 'image_generate',
    providerId: overrides.providerId ?? null,
    sourceSpec: overrides.sourceSpec ?? null,
    status: overrides.status ?? 'queued',
    execution: overrides.execution ?? null,
    originalPrompt: overrides.originalPrompt ?? 'prompt',
    expandedPrompt: overrides.expandedPrompt ?? null,
    finalPromptUsed: overrides.finalPromptUsed ?? 'prompt',
    error: overrides.error ?? null,
    createdAt: overrides.createdAt ?? '2026-05-25T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-05-25T00:00:00.000Z',
    completedAt: overrides.completedAt ?? null,
  };
}

describe('worker routing', () => {
  it('routes legacy Generation Task jobs without provider ids through Codex', () => {
    expect(resolveWorkerRuntimeTarget(job({ kind: 'image_generate' }))).toBe('codex');
    expect(resolveWorkerRuntimeTarget(job({ kind: 'image_edit' }))).toBe('codex');
    expect(resolveWorkerRuntimeTarget(job({ kind: 'style_preset_card' }))).toBe('codex');
    expect(resolveWorkerRuntimeTarget(job({ kind: 'sprite_sheet' }))).toBe('codex');
    expect(resolveWorkerRuntimeTarget(job({ kind: 'texture_generate' }))).toBe('codex');
  });

  it('routes source-spec tasks through Codex even when the stored kind is legacy codex_imagegen', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-1',
      task: 'style_preset_card',
      prompt: 'glass owl on a plinth',
    });

    expect(
      resolveWorkerRuntimeTarget(job({ kind: 'codex_imagegen', providerId: null, sourceSpec })),
    ).toBe('codex');
  });

  it('keeps dry runs on the dry-run path', () => {
    expect(resolveWorkerRuntimeTarget(job({ kind: 'dry_run' }))).toBe('dry_run');
  });

  it('does not route unsupported non-codex providers through the Codex worker', () => {
    expect(resolveWorkerRuntimeTarget(job({ kind: 'image_generate', providerId: 'fal' }))).toBe(
      null,
    );
  });
});
