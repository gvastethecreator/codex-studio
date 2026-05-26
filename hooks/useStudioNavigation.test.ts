import { describe, expect, it } from 'vite-plus/test';

import { shouldCloseModalForOverlay } from './useStudioNavigation';

describe('shouldCloseModalForOverlay', () => {
  it('keeps the modal route open while modal image state catches up', () => {
    expect(shouldCloseModalForOverlay('modal', false)).toBe(false);
  });

  it('closes an existing modal once the route leaves the modal overlay', () => {
    expect(shouldCloseModalForOverlay('none', true)).toBe(true);
  });
});
