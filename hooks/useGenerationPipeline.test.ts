import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import {
  buildEditGenerationConfig,
  getCurrentActiveGenerationRun,
  removeActiveGenerationRun,
  resolveGenerationWorkspaceId,
  type ActiveGenerationRun,
} from './useGenerationPipeline';

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

describe('buildEditGenerationConfig', () => {
  it('does not carry stale composer attachments into edit jobs', () => {
    const config = buildEditGenerationConfig({
      generationConfig: {
        ...DEFAULT_GENERATION_CONFIG,
        attachments: [
          {
            id: 'att-old',
            name: 'stale-ref.png',
            dataUrl: 'data:image/png;base64,AAAA',
            strength: 0.2,
          },
        ],
      },
      original: {
        id: 'img-1',
        name: 'base.png',
        dataUrl: 'data:image/png;base64,BBBB',
        strength: 1,
      },
      mask: 'data:image/png;base64,MASK',
      prompt: '  keep the face and change only the jacket  ',
    });

    expect(config.prompt).toBe('keep the face and change only the jacket');
    expect(config.attachments).toHaveLength(1);
    expect(config.attachments[0]?.id.startsWith('mask-')).toBe(true);
    expect(config.attachments[0]?.dataUrl).toBe('data:image/png;base64,MASK');
  });
});

describe('active generation run projection', () => {
  const createRun = (id: number, prompt: string): ActiveGenerationRun => ({
    id,
    config: { ...DEFAULT_GENERATION_CONFIG, prompt },
    startedAt: id * 100,
  });

  it('keeps the newest active run visible when an older run finishes first', () => {
    const first = createRun(1, 'first');
    const second = createRun(2, 'second');

    expect(
      getCurrentActiveGenerationRun(removeActiveGenerationRun([first, second], first.id)),
    ).toBe(second);
  });

  it('falls back to the older active run when the newest run finishes first', () => {
    const first = createRun(1, 'first');
    const second = createRun(2, 'second');
    const remaining = removeActiveGenerationRun([first, second], second.id);

    expect(getCurrentActiveGenerationRun(remaining)).toBe(first);
    expect(
      getCurrentActiveGenerationRun(removeActiveGenerationRun(remaining, first.id)),
    ).toBeNull();
  });
});
