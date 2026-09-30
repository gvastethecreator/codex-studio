import { describe, expect, it, vi } from 'vitest';

import { listJobSummariesFromDb, mapJobRow } from './jobs';

describe('listJobSummariesFromDb', () => {
  it('uses projected columns without reading the Generation Task Spec', () => {
    const query = vi.fn((sql: string) => {
      expect(sql).not.toContain('source_spec_json');
      if (sql.includes('GROUP BY status'))
        return { all: () => [{ status: 'completed', count: 1 }] };
      if (sql.includes('COUNT(*)')) return { get: () => ({ count: 0 }) };
      if (sql.includes('SELECT DISTINCT') || !sql.includes("'completed', 'failed', 'cancelled'"))
        return { all: () => [] };
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
            prompt_preview: 'final prompt',
            error: null,
            created_at: '2026-08-08T00:00:00.000Z',
            updated_at: '2026-08-08T00:00:01.000Z',
            completed_at: '2026-08-08T00:00:01.000Z',
          },
        ],
      };
    });

    const summaries = listJobSummariesFromDb({
      query,
      transaction: (read: () => unknown) => read,
    } as never);

    expect(summaries.history).toEqual([
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

describe('mapJobRow', () => {
  it('keeps the output folder and naming captured when the job was created', () => {
    const job = mapJobRow({
      id: 'job-1',
      kind: 'image_generate',
      status: 'queued',
      original_prompt: 'owl',
      final_prompt_used: 'owl',
      created_at: '2026-09-28T00:00:00.000Z',
      updated_at: '2026-09-28T00:00:00.000Z',
      library_id: 'library-1',
      library_root: 'D:/library',
      library_context_json: JSON.stringify({
        libraryId: 'stale',
        rootPath: 'D:/stale',
        output: { libraryId: 'pictures', rootPath: 'C:/Users/a/Pictures/Cozy Studio' },
        outputOrganization: { subfolderTokens: [], fileNameTemplate: '{date}_{style}_{prompt}' },
      }),
    });

    expect(job.libraryContext).toEqual({
      libraryId: 'library-1',
      rootPath: 'D:/library',
      output: { libraryId: 'pictures', rootPath: 'C:/Users/a/Pictures/Cozy Studio' },
      outputOrganization: { subfolderTokens: [], fileNameTemplate: '{date}_{style}_{prompt}' },
    });
  });
});
