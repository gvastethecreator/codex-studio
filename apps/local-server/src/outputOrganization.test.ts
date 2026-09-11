import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createDefaultEditableStudioSettings,
  type StudioOutputSubfolderToken,
} from '../../../packages/shared/src';
import { DEFAULT_WORKSPACE_ID } from '../../../packages/shared/src/workspaceContracts';

import {
  DEFAULT_WORKSPACE_OUTPUT_SLUG,
  buildOutputAssetRelativePath,
  workspaceOutputSlug,
  workspaceOutputSlugMap,
} from './outputOrganization';

describe('outputOrganization', () => {
  it('defaults new generations under the Workspace slug', () => {
    const settings = createDefaultEditableStudioSettings();

    expect(settings.outputOrganization.subfolderTokens).toEqual(['workspace']);
    expect(
      buildOutputAssetRelativePath(settings, {
        jobId: 'job-123',
        workspaceSlug: DEFAULT_WORKSPACE_OUTPUT_SLUG,
        providerId: 'codex',
        model: 'gpt-5.4-mini',
        recipeId: 'styles',
        createdAt: new Date(2026, 4, 26, 2, 3, 4),
        extension: '.png',
      }),
    ).toBe(path.join('outputs', 'default', '20260526-020304-codex-job-123.png'));
  });

  it('uses a named Workspace slug when that token is selected', () => {
    const settings = createDefaultEditableStudioSettings();

    expect(
      buildOutputAssetRelativePath(settings, {
        jobId: 'job-123',
        workspaceSlug: 'Pixel-Art',
        providerId: 'codex',
        model: 'gpt-5.4-mini',
        recipeId: 'styles',
        createdAt: new Date(2026, 4, 26, 2, 3, 4),
        extension: '.png',
      }),
    ).toBe(path.join('outputs', 'Pixel-Art', '20260526-020304-codex-job-123.png'));
  });

  it('keeps date provider and recipe tokens as optional layout', () => {
    const settings = {
      outputOrganization: {
        subfolderTokens: ['date', 'provider', 'recipe'] as StudioOutputSubfolderToken[],
        fileNameTemplate: '{timestamp}-{provider}-{jobId}',
      },
    };

    expect(
      buildOutputAssetRelativePath(settings, {
        jobId: 'job-123',
        workspaceSlug: 'Pixel-Art',
        providerId: 'codex',
        model: 'gpt-5.4-mini',
        recipeId: 'styles',
        createdAt: new Date(2026, 4, 26, 2, 3, 4),
        extension: '.png',
      }),
    ).toBe(
      path.join('outputs', '2026-05-26', 'codex', 'styles', '20260526-020304-codex-job-123.png'),
    );
  });

  it('sanitizes provider model and recipe path parts', () => {
    const settings = {
      outputOrganization: {
        subfolderTokens: ['provider', 'model', 'recipe'] as StudioOutputSubfolderToken[],
        fileNameTemplate: '{recipe}-{jobId}',
      },
    };

    expect(
      buildOutputAssetRelativePath(settings, {
        jobId: 'job:1',
        providerId: 'fal.ai',
        model: 'fal/image model',
        recipeId: 'texture:tiles',
        createdAt: new Date(2026, 4, 26, 2, 3, 4),
        extension: 'bad',
      }),
    ).toBe(
      path.join('outputs', 'fal.ai', 'fal-image-model', 'texture-tiles', 'texture-tiles-job-1.png'),
    );
  });

  it('uses a stable readable slug for the default Workspace', () => {
    expect(workspaceOutputSlug({ id: DEFAULT_WORKSPACE_ID, name: 'Default' })).toBe(
      DEFAULT_WORKSPACE_OUTPUT_SLUG,
    );
  });

  it('sanitizes named Workspace slugs and keeps them unique in a library', () => {
    const slugs = workspaceOutputSlugMap([
      { id: DEFAULT_WORKSPACE_ID, name: 'Default' },
      { id: 'ws-heroes-a', name: 'Heroes' },
      { id: 'ws-heroes-b', name: 'Heroes' },
      { id: 'ws-unsafe', name: 'A / B:*?' },
    ]);

    expect(slugs.get(DEFAULT_WORKSPACE_ID)).toBe('default');
    expect(slugs.get('ws-heroes-a')).toBe('Heroes');
    expect(slugs.get('ws-heroes-b')).toBe('Heroes-2');
    expect(slugs.get('ws-unsafe')).toBe('A-B');
    expect(new Set(slugs.values()).size).toBe(slugs.size);
  });

  it('gives the earlier listed Workspace the unsuffixed slug', () => {
    const slugs = workspaceOutputSlugMap([
      { id: 'ws-later-id', name: 'Heroes' },
      { id: 'ws-earlier-id', name: 'Heroes' },
    ]);

    expect(slugs.get('ws-later-id')).toBe('Heroes');
    expect(slugs.get('ws-earlier-id')).toBe('Heroes-2');
  });

  it('does not let another Workspace take the default slug', () => {
    expect(workspaceOutputSlug({ id: 'ws-other', name: 'Default' })).toBe('Default-2');
  });
});
