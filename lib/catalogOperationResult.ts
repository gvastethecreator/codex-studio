import type { CatalogBatchCommandResult, CatalogImage } from '../packages/shared/src';

export type CatalogRefreshScope =
  | { kind: 'all' }
  | { kind: 'active' }
  | { kind: 'trash' }
  | { kind: 'workspace'; workspaceId: string | null };

export interface CatalogOperationToast {
  message: string;
  type: 'success' | 'error' | 'info';
}

function isCatalogBatchCommandResult(value: unknown): value is CatalogBatchCommandResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as CatalogBatchCommandResult).ok === true &&
    typeof (value as CatalogBatchCommandResult).action === 'string' &&
    typeof (value as CatalogBatchCommandResult).matchedCount === 'number' &&
    typeof (value as CatalogBatchCommandResult).changedCount === 'number' &&
    Array.isArray((value as CatalogBatchCommandResult).failed)
  );
}

function plural(count: number, singular: string, many = `${singular}s`) {
  return `${count} ${count === 1 ? singular : many}`;
}

export function describeCatalogOperationResult(value: unknown): CatalogOperationToast | null {
  if (!isCatalogBatchCommandResult(value)) return null;

  const action = value.action[0].toUpperCase() + value.action.slice(1);
  if (value.failed.length > 0) {
    return {
      type: 'error',
      message: `${action}: ${plural(value.changedCount, 'item')} changed, ${plural(value.failed.length, 'item')} failed.`,
    };
  }

  if (value.changedCount > 0) {
    return {
      type: 'success',
      message: `${action}: ${plural(value.changedCount, 'item')} changed.`,
    };
  }

  return {
    type: 'info',
    message: `${action}: no matching items changed.`,
  };
}

export function mergeCatalogRefreshScopes(scopes: CatalogRefreshScope[]): CatalogRefreshScope {
  if (scopes.some((scope) => scope.kind === 'all')) return { kind: 'all' };
  if (scopes.some((scope) => scope.kind === 'trash')) return { kind: 'all' };
  const workspaceScopes = scopes.filter(
    (scope): scope is Extract<CatalogRefreshScope, { kind: 'workspace' }> =>
      scope.kind === 'workspace',
  );
  if (workspaceScopes.length > 0) {
    const workspaceId = workspaceScopes[0].workspaceId;
    if (workspaceScopes.every((scope) => scope.workspaceId === workspaceId)) {
      return { kind: 'workspace', workspaceId };
    }
  }
  return { kind: 'active' };
}

export function catalogRefreshScopeFromImage(image: CatalogImage): CatalogRefreshScope {
  if (image.isDeleted) return { kind: 'trash' };
  return { kind: 'workspace', workspaceId: image.workspaceId ?? null };
}
