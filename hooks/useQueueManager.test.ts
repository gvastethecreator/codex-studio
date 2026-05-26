import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import { createQueueJob } from './useQueueManager';

describe('createQueueJob', () => {
  it('binds the queued job to the workspace active at enqueue time', () => {
    const job = createQueueJob(
      'A neon alley',
      { ...DEFAULT_GENERATION_CONFIG, prompt: 'Original prompt' },
      'workspace-42',
    );

    expect(job.workspaceId).toBe('workspace-42');
    expect(job.prompt).toBe('A neon alley');
    expect(job.config.prompt).toBe('A neon alley');
    expect(job.status).toBe('pending');
  });

  it('snapshots attachments so clearing the composer does not mutate queued jobs', () => {
    const attachment = {
      id: 'att-1',
      name: 'ref.png',
      dataUrl: 'data:image/png;base64,AAAA',
      strength: 0.25,
    };
    const job = createQueueJob(
      'A neon alley',
      { ...DEFAULT_GENERATION_CONFIG, attachments: [attachment] },
      'workspace-42',
    );

    attachment.strength = 0.75;

    expect(job.config.attachments).toEqual([
      {
        id: 'att-1',
        name: 'ref.png',
        dataUrl: 'data:image/png;base64,AAAA',
        strength: 0.25,
      },
    ]);
  });
});
