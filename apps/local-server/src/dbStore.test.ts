import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../packages/shared/src';
import { createSqliteDbStore, type SqliteDatabaseLike } from './dbStore';

function createMemoryDb(): SqliteDatabaseLike {
  const projects: Record<string, any> = {};
  const jobs: Record<string, any> = {};
  const queries: string[] = [];

  const database: SqliteDatabaseLike & { queries: string[] } = {
    queries,
    run() {},
    query(sql: string) {
      queries.push(sql);
      return {
        all() {
          if (sql.startsWith('PRAGMA table_info')) return [];
          if (sql.includes('FROM projects ORDER BY')) return Object.values(projects);
          if (sql.includes('FROM jobs') && sql.includes('ORDER BY')) return Object.values(jobs);
          return [];
        },
        get(...params: unknown[]) {
          if (sql.includes('FROM projects WHERE id = ?'))
            return projects[String(params[0])] ?? null;
          if (sql.includes('FROM projects ORDER BY')) return Object.values(projects)[0] ?? null;
          if (sql.includes('FROM jobs WHERE id = ?')) return jobs[String(params[0])] ?? null;
          return null;
        },
        run(...params: unknown[]) {
          if (sql.includes('INSERT INTO projects')) {
            const [id, name, description, createdAt, updatedAt] = params;
            projects[String(id)] = {
              id,
              name,
              description,
              created_at: createdAt,
              updated_at: updatedAt,
            };
            return;
          }

          if (sql.includes('INSERT INTO jobs')) {
            const [
              id,
              projectId,
              kind,
              providerId,
              sourceSpecJson,
              status,
              executionJson,
              originalPrompt,
              expandedPrompt,
              finalPromptUsed,
              error,
              createdAt,
              updatedAt,
              completedAt,
            ] = params;
            jobs[String(id)] = {
              id,
              project_id: projectId,
              kind,
              provider_id: providerId,
              source_spec_json: sourceSpecJson,
              status,
              execution_json: executionJson,
              original_prompt: originalPrompt,
              expanded_prompt: expandedPrompt,
              final_prompt_used: finalPromptUsed,
              error,
              created_at: createdAt,
              updated_at: updatedAt,
              completed_at: completedAt,
            };
          }
        },
      };
    },
  };

  return database;
}

describe('dbStore', () => {
  it('persists provider id and source Generation Task Spec on jobs', () => {
    const database = createMemoryDb();
    const store = createSqliteDbStore({ database });
    const project = store.ensureDefaultProject();
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-1',
      task: 'image_generate',
      providerId: 'codex',
      prompt: 'small brass key',
    });

    const created = store.createJob({
      projectId: project.id,
      kind: 'image_generate',
      providerId: 'codex',
      sourceSpec,
      prompt: sourceSpec.prompt,
    });

    expect(created.providerId).toBe('codex');
    expect(created.sourceSpec?.id).toBe('spec-1');
    expect(store.getJob(created.id)).toMatchObject({
      providerId: 'codex',
      sourceSpec: {
        id: 'spec-1',
        task: 'image_generate',
        prompt: 'small brass key',
      },
    });
  });

  it('lists job summaries without selecting or parsing source specs', () => {
    const database = createMemoryDb();
    const store = createSqliteDbStore({ database });
    const project = store.ensureDefaultProject();
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-large',
      task: 'image_generate',
      providerId: 'codex',
      prompt: 'large historical payload',
      assets: [
        {
          role: 'reference',
          name: 'ref.png',
          dataUrl: `data:image/png;base64,${'a'.repeat(1024)}`,
        },
      ],
    });

    store.createJob({
      projectId: project.id,
      kind: 'image_generate',
      providerId: 'codex',
      sourceSpec,
      prompt: sourceSpec.prompt,
    });

    const summaries = store.listJobSummaries?.() ?? [];
    const summaryQuery = (database as SqliteDatabaseLike & { queries: string[] }).queries.at(-1);

    expect(summaryQuery).not.toContain('source_spec_json');
    expect(summaries[0]).toMatchObject({
      sourceSpec: null,
      promptPreview: 'large historical payload',
    });
  });
});
