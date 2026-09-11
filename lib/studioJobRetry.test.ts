import { describe, expect, it } from 'vitest';
import { canRetryStudioJob } from './studioJobRetry';

describe('canRetryStudioJob', () => {
  it('offers a fresh attempt only for confirmed failure or cancellation', () => {
    const job = { providerId: 'comfy' as const, execution: null };
    expect(canRetryStudioJob({ ...job, status: 'queued' })).toBe(false);
    expect(canRetryStudioJob({ ...job, status: 'running' })).toBe(false);
    expect(canRetryStudioJob({ ...job, status: 'needs_review' })).toBe(false);
    expect(canRetryStudioJob({ ...job, status: 'completed' })).toBe(false);
    expect(canRetryStudioJob({ ...job, status: 'failed' })).toBe(true);
    expect(canRetryStudioJob({ ...job, status: 'cancelled' })).toBe(true);
    expect(canRetryStudioJob({ providerId: 'codex', status: 'failed', execution: null })).toBe(
      false,
    );
    expect(
      canRetryStudioJob({
        providerId: 'codex',
        status: 'failed',
        execution: {
          model: 'gpt-5.5',
          reasoningEffort: 'medium',
          providerOptions: { codex: { transport: 'codex_app_server' } },
        },
      }),
    ).toBe(true);
  });
});
