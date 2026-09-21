/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';

import {
  STUDIO_JOBS_LIST_CLEARED_AT_KEY,
  isStudioJobVisibleAfterListClear,
  readStudioJobsListClearedAt,
  writeStudioJobsListClearedAt,
} from './studioJobsListClear';

afterEach(() => {
  window.localStorage.removeItem(STUDIO_JOBS_LIST_CLEARED_AT_KEY);
});

describe('studioJobsListClear', () => {
  it('hides jobs created at or before the clear time', () => {
    expect(isStudioJobVisibleAfterListClear('2026-07-18T00:00:00.000Z', 0)).toBe(true);
    const clearedAt = Date.parse('2026-07-18T12:00:00.000Z');
    expect(isStudioJobVisibleAfterListClear('2026-07-18T00:00:00.000Z', clearedAt)).toBe(false);
    expect(isStudioJobVisibleAfterListClear('2026-07-18T12:00:00.000Z', clearedAt)).toBe(false);
    expect(isStudioJobVisibleAfterListClear('2026-07-18T12:00:01.000Z', clearedAt)).toBe(true);
  });

  it('round-trips the stored cutoff', () => {
    writeStudioJobsListClearedAt(1_700_000_000_000);
    expect(readStudioJobsListClearedAt()).toBe(1_700_000_000_000);
  });
});
