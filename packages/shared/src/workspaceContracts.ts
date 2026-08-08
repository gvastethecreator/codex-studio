export const DEFAULT_WORKSPACE_ID = 'default';

export type StudioWorkspaceSortOrder = 'newest' | 'oldest' | 'favorite';

export interface StudioWorkspace {
  id: string;
  name: string;
  libraryId: string | null;
  filter: Record<string, unknown>;
  sortOrder: StudioWorkspaceSortOrder;
  createdAt: string;
  updatedAt: string;
}

export function isDefaultWorkspaceId(workspaceId: string | null | undefined): boolean {
  return (workspaceId ?? '').trim() === DEFAULT_WORKSPACE_ID;
}

export function normalizeWorkspaceId(workspaceId: string | null | undefined): string {
  const trimmed = typeof workspaceId === 'string' ? workspaceId.trim() : '';
  return trimmed || DEFAULT_WORKSPACE_ID;
}

export function readWorkspaceIdFromSourceSpecMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }
  const workspaceId = (metadata as Record<string, unknown>).workspaceId;
  if (typeof workspaceId !== 'string') return null;
  const trimmed = workspaceId.trim();
  return trimmed || null;
}

export function resolveJobWorkspaceId(input: {
  columnWorkspaceId?: string | null;
  sourceSpecMetadata?: unknown;
}): string {
  const fromColumn =
    typeof input.columnWorkspaceId === 'string' ? input.columnWorkspaceId.trim() : '';
  if (fromColumn) return fromColumn;
  return normalizeWorkspaceId(readWorkspaceIdFromSourceSpecMetadata(input.sourceSpecMetadata));
}

export function withWorkspaceMetadata<T extends { metadata?: Record<string, unknown> | null }>(
  sourceSpec: T | null | undefined,
  workspaceId: string,
): T | null | undefined {
  if (!sourceSpec) return sourceSpec;
  const metadata =
    sourceSpec.metadata &&
    typeof sourceSpec.metadata === 'object' &&
    !Array.isArray(sourceSpec.metadata)
      ? { ...sourceSpec.metadata }
      : {};
  return {
    ...sourceSpec,
    metadata: {
      ...metadata,
      workspaceId: normalizeWorkspaceId(workspaceId),
    },
  };
}
