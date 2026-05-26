import { describe, expect, it } from 'vite-plus/test';

import { resolveGenerationWorkspaceId } from './useGenerationPipeline';

describe('resolveGenerationWorkspaceId', () => {
  it('prefers an explicit queued workspace over the current active workspace', () => {
    expect(resolveGenerationWorkspaceId('workspace-new', 'workspace-queued')).toBe(
      'workspace-queued',
    );
  });

  it('falls back to the current active workspace when no override is provided', () => {
    expect(resolveGenerationWorkspaceId('workspace-active')).toBe('workspace-active');
  });
});
