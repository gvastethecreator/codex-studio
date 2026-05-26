import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec, type Job } from '../../../packages/shared/src';
import { resolveJobCatalogContext } from './workerCatalogContext';

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

describe('resolveJobCatalogContext', () => {
  it('prefers workspace and batch metadata from the Generation Task Spec', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-1',
      task: 'image_generate',
      prompt: 'prompt',
      metadata: {
        workspaceId: 'concepts',
        batchId: 'batch-9',
      },
    });

    expect(
      resolveJobCatalogContext(job({ projectId: 'project-1', sourceSpec })),
    ).toEqual({
      workspaceId: 'concepts',
      batchId: 'batch-9',
    });
  });

  it('falls back to the project id when workspace metadata is absent or blank', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-1',
      task: 'image_generate',
      prompt: 'prompt',
      metadata: {
        workspaceId: '   ',
        batchId: 42,
      },
    });

    expect(
      resolveJobCatalogContext(job({ projectId: 'project-fallback', sourceSpec })),
    ).toEqual({
      workspaceId: 'project-fallback',
      batchId: null,
    });
  });
});