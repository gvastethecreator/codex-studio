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
    expect(source).toContain('row.prompt.slice(0, 240)');
    expect(source).toContain("detailLevel: summary ? 'summary' : 'detail'");
  });

  it('keeps workspace aggregation free of large prompt payloads', () => {
    const source = readFileSync(fileURLToPath(new URL('./catalog.ts', import.meta.url)), 'utf8');

    const aggregateColumns = source.match(
      /const CATALOG_WORKSPACE_AGGREGATE_COLUMNS = \[[\s\S]*?\]\.join/,
    )?.[0];

    expect(aggregateColumns).toBeTruthy();
    expect(aggregateColumns).not.toContain('prompt');
    expect(aggregateColumns).not.toContain('negative_prompt');
    expect(aggregateColumns).not.toContain('file_path');
    expect(source).toContain('LEFT JOIN catalog_images AS latest_image');
  });
});
