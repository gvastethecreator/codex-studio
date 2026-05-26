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
});