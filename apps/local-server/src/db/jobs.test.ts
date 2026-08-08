import { describe, expect, it, vi } from 'vite-plus/test';

import { listJobSummariesFromDb } from './jobs';

describe('listJobSummariesFromDb', () => {
  it('uses projected columns without reading the Generation Task Spec', () => {
    const query = vi.fn((sql: string) => {
      expect(sql).not.toContain('source_spec_json');
      return {
        all: () => [
          {
            id: 'job-1',
            workspace_id: 'workspace-1',
            recipe_id: 'styles',
            batch_id: 'batch-1',
            aspect_ratio: '2:3',
            kind: 'image_generate',
            provider_id: 'codex',
            status: 'completed',
            execution_json: null,
            original_prompt: 'original prompt',
            final_prompt_used: 'final prompt',
            error: null,
            created_at: '2026-08-08T00:00:00.000Z',
            updated_at: '2026-08-08T00:00:01.000Z',
            completed_at: '2026-08-08T00:00:01.000Z',
          },
        ],
      };
    });

    const summaries = listJobSummariesFromDb({ query } as never);

    expect(summaries).toEqual([
      expect.objectContaining({
        id: 'job-1',
        workspaceId: 'workspace-1',
        recipeId: 'styles',
        batchId: 'batch-1',
        aspectRatio: '2:3',
        promptPreview: 'final prompt',
      }),
    ]);
  });
});
