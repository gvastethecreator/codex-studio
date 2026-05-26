export function buildCatalogWorkspaceClause(workspaceId?: string | null) {
  if (!workspaceId) {
    return null;
  }

  if (workspaceId === 'default') {
    return {
      clause: '(workspace_id = ? OR workspace_id IS NULL)',
      params: ['default'],
    };
  }

  return {
    clause: 'workspace_id = ?',
    params: [workspaceId],
  };
}