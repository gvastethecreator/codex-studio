import { describe, expect, it } from 'vite-plus/test';
import { canRetryStudioJob } from './studioJobRetry';

describe('canRetryStudioJob', () => {
  it('offers a fresh attempt only for confirmed failure or cancellation', () => {
    expect(canRetryStudioJob('queued')).toBe(false);
    expect(canRetryStudioJob('running')).toBe(false);
    expect(canRetryStudioJob('needs_review')).toBe(false);
    expect(canRetryStudioJob('completed')).toBe(false);
    expect(canRetryStudioJob('failed')).toBe(true);
    expect(canRetryStudioJob('cancelled')).toBe(true);
  });
});
