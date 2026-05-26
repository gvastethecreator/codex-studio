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
});
