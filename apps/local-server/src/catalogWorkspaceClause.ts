export function buildCatalogWorkspaceClause(workspaceId?: string | null) {
  if (!workspaceId) {
    return null;
  }

  return {
    clause: "COALESCE(workspace_id, 'default') = ?",
    params: [workspaceId],
  };
}
