import { describe, expect, it } from 'vite-plus/test';
import {
  DEFAULT_WORKSPACE_ID,
  isDefaultWorkspaceId,
  normalizeWorkspaceId,
  readWorkspaceIdFromSourceSpecMetadata,
  resolveJobWorkspaceId,
  withWorkspaceMetadata,
} from './workspaceContracts';

describe('workspaceContracts', () => {
  it('normalizes empty workspace ids to default', () => {
    expect(normalizeWorkspaceId(null)).toBe(DEFAULT_WORKSPACE_ID);
    expect(normalizeWorkspaceId('')).toBe(DEFAULT_WORKSPACE_ID);
    expect(normalizeWorkspaceId('  studio  ')).toBe('studio');
    expect(isDefaultWorkspaceId('default')).toBe(true);
    expect(isDefaultWorkspaceId('other')).toBe(false);
  });

  it('prefers durable column over source-spec metadata', () => {
    expect(
      resolveJobWorkspaceId({
        columnWorkspaceId: 'column-ws',
        sourceSpecMetadata: { workspaceId: 'meta-ws' },
      }),
    ).toBe('column-ws');
    expect(
      resolveJobWorkspaceId({
        columnWorkspaceId: null,
        sourceSpecMetadata: { workspaceId: 'meta-ws' },
      }),
    ).toBe('meta-ws');
    expect(
      resolveJobWorkspaceId({
        columnWorkspaceId: null,
        sourceSpecMetadata: {},
      }),
    ).toBe(DEFAULT_WORKSPACE_ID);
  });

  it('reads workspace metadata and dual-writes it onto source specs', () => {
    expect(readWorkspaceIdFromSourceSpecMetadata({ workspaceId: 'ws-1' })).toBe('ws-1');
    expect(readWorkspaceIdFromSourceSpecMetadata(null)).toBe(null);
    const next = withWorkspaceMetadata({ prompt: 'x', metadata: { batchId: 'b1' } }, 'ws-2');
    expect(next?.metadata).toEqual({ batchId: 'b1', workspaceId: 'ws-2' });
  });
});
