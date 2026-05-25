import { describe, expect, it } from 'vite-plus/test';

import { resolveLocalGenerationProviderId } from './localGenerationRun';

describe('localGenerationRun', () => {
  it('uses the explicit provider before Studio Settings defaults', () => {
    expect(
      resolveLocalGenerationProviderId({
        providerId: 'dry_run',
        settings: { defaultProviderId: 'fal' },
      }),
    ).toBe('dry_run');
  });

  it('uses the Studio Settings default provider when no override is provided', () => {
    expect(
      resolveLocalGenerationProviderId({
        settings: { defaultProviderId: 'fal' },
      }),
    ).toBe('fal');
  });

  it('falls back to Codex when settings are unavailable', () => {
    expect(resolveLocalGenerationProviderId({ settings: null })).toBe('codex');
  });
});
