import { describe, expect, it } from 'vite-plus/test';

import {
  catalogRefreshScopeFromImage,
  describeCatalogOperationResult,
  mergeCatalogRefreshScopes,
} from './catalogOperationResult';

describe('catalogOperationResult', () => {
  it('describes catalog command summaries for shell toasts', () => {
    expect(
      describeCatalogOperationResult({
        ok: true,
        action: 'archive',
        matchedCount: 4,
        changedCount: 3,
        failed: [{ id: 'img-4', reason: 'operation_failed' }],
      }),
    ).toEqual({
      type: 'error',
      message: 'Archive: 3 items changed, 1 item failed.',
    });

    expect(
      describeCatalogOperationResult({
        ok: true,
        action: 'restore',
        matchedCount: 2,
        changedCount: 2,
        failed: [],
      }),
    ).toEqual({
      type: 'success',
      message: 'Restore: 2 items changed.',
    });
  });

  it('derives scoped refresh from catalog images', () => {
    expect(
      catalogRefreshScopeFromImage({
        id: 'img-1',
        workspaceId: 'studio',
        isDeleted: false,
      } as never),
    ).toEqual({
      kind: 'workspace',
      workspaceId: 'studio',
    });
    expect(
      catalogRefreshScopeFromImage({ id: 'img-1', workspaceId: null, isDeleted: true } as never),
    ).toEqual({
      kind: 'trash',
    });
    expect(
      mergeCatalogRefreshScopes([
        { kind: 'workspace', workspaceId: 'studio' },
        { kind: 'workspace', workspaceId: 'studio' },
      ]),
    ).toEqual({ kind: 'workspace', workspaceId: 'studio' });
    expect(
      mergeCatalogRefreshScopes([{ kind: 'workspace', workspaceId: 'studio' }, { kind: 'trash' }]),
    ).toEqual({ kind: 'all' });
  });
});
