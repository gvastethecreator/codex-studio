import { describe, expect, it } from 'vite-plus/test';

import { buildCatalogWorkspaceClause } from './catalogWorkspaceClause';

describe('buildCatalogWorkspaceClause', () => {
  it('treats the default workspace as default plus legacy null entries', () => {
    expect(buildCatalogWorkspaceClause('default')).toEqual({
      clause: '(workspace_id = ? OR workspace_id IS NULL)',
      params: ['default'],
    });
  });

  it('keeps named workspaces exact and skips empty filters', () => {
    expect(buildCatalogWorkspaceClause('concepts')).toEqual({
      clause: 'workspace_id = ?',
      params: ['concepts'],
    });
    expect(buildCatalogWorkspaceClause(undefined)).toBeNull();
  });
});