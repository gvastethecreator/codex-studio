import { describe, expect, it } from 'vite-plus/test';

import { createStudioReadinessPublicationPolicy } from './studioReadinessPublicationPolicy';

describe('studioReadinessPublicationPolicy', () => {
  it('rejects a passive snapshot that resolves after a newer manual snapshot', () => {
    const policy = createStudioReadinessPublicationPolicy();
    const passiveRequest = policy.beginSnapshotRead();
    const manualRequest = policy.beginSnapshotRead();

    expect(policy.shouldPublishSnapshot(manualRequest)).toBe(true);
    expect(policy.shouldPublishSnapshot(passiveRequest)).toBe(false);
  });

  it('keeps refreshing true until all overlapping refreshes finish', () => {
    const policy = createStudioReadinessPublicationPolicy();
    policy.beginRefresh();
    policy.beginRefresh();

    expect(policy.endRefresh()).toBe(true);
    expect(policy.endRefresh()).toBe(false);
  });

  it('rejects error or success state from an older refresh request', () => {
    const policy = createStudioReadinessPublicationPolicy();
    const passiveRequest = policy.beginRefresh();
    const manualRequest = policy.beginRefresh();

    expect(policy.shouldPublishRefresh(manualRequest)).toBe(true);
    expect(policy.shouldPublishRefresh(passiveRequest)).toBe(false);
  });
});
