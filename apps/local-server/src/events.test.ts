import { describe, expect, it } from 'vite-plus/test';
import { getCurrentEventRevision, publishEvent } from './events';

describe('Studio event revisions', () => {
  it('publishes monotonically ordered revisions', () => {
    const before = getCurrentEventRevision();
    const first = publishEvent('test.first', null);
    const second = publishEvent('test.second', null);

    expect(first.revision).toBe(before + 1);
    expect(second.revision).toBe(before + 2);
    expect(getCurrentEventRevision()).toBe(before + 2);
  });
});
