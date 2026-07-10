import { describe, expect, it } from 'vite-plus/test';

import { getStudioGenerationDockToolbarMode } from './studioGenerationDockMode';

describe('getStudioGenerationDockToolbarMode', () => {
  it('keeps frame generation actions inside Animation Sequence', () => {
    expect(getStudioGenerationDockToolbarMode('animation-sequence')).toBe('context-only');
  });

  it('preserves the full composer for Studio and other recipes', () => {
    expect(getStudioGenerationDockToolbarMode(null)).toBe('full');
    expect(getStudioGenerationDockToolbarMode('styles')).toBe('full');
  });
});
