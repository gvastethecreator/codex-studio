import { describe, expect, it } from 'vite-plus/test';

import { shouldMountDemandDropdown } from './demandMountedGsapDropdownPolicy';

describe('shouldMountDemandDropdown', () => {
  it('keeps the animation runtime out of the tree until the first open', () => {
    expect(shouldMountDemandDropdown(false, false)).toBe(false);
    expect(shouldMountDemandDropdown(true, false)).toBe(true);
  });

  it('keeps the dropdown mounted after opening so close animations can finish', () => {
    expect(shouldMountDemandDropdown(false, true)).toBe(true);
  });
});
