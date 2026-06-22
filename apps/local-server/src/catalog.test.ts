import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vite-plus/test';

import { buildCatalogWorkspaceClause } from './catalogWorkspaceClause';

describe('buildCatalogWorkspaceClause', () => {
  it('treats the default workspace as default plus legacy null entries', () => {
    expect(buildCatalogWorkspaceClause('default')).toEqual({
      clause: "COALESCE(workspace_id, 'default') = ?",
      params: ['default'],
    });
  });

  it('keeps named workspaces exact and skips empty filters', () => {
    expect(buildCatalogWorkspaceClause('concepts')).toEqual({
      clause: "COALESCE(workspace_id, 'default') = ?",
      params: ['concepts'],
    });
    expect(buildCatalogWorkspaceClause(undefined)).toBeNull();
  });

  it('keeps catalog page queries on explicit summary columns', () => {
    const source = readFileSync(fileURLToPath(new URL('./catalog.ts', import.meta.url)), 'utf8');

    const summaryColumns = source.match(
      /const CATALOG_IMAGE_SUMMARY_COLUMNS = \[[\s\S]*?\]\.join/,
    )?.[0];

    expect(summaryColumns).toBeTruthy();
    expect(summaryColumns).not.toContain('generation_config');
    expect(source).toContain('options.includeGenerationConfig ?');
    expect(source).toContain('includeGenerationConfig: true');
  });
});
