import { describe, expect, it } from 'vite-plus/test';
import {
  DEFAULT_GROK_IMAGE_MODEL,
  resolveBootstrapProviderExecutionOptions,
} from './providerExecutionDefaults';

describe('resolveBootstrapProviderExecutionOptions', () => {
  it('uses Grok-owned execution defaults instead of Codex toolbar values', () => {
    expect(resolveBootstrapProviderExecutionOptions('grok', {})).toEqual({
      model: DEFAULT_GROK_IMAGE_MODEL,
      reasoningEffort: 'low',
      serviceTier: null,
    });
  });

  it('accepts a backend Grok model override without storing credentials in Studio Settings', () => {
    expect(
      resolveBootstrapProviderExecutionOptions('grok', { GROK_IMAGE_MODEL: 'grok-next' }),
    ).toEqual({
      model: 'grok-next',
      reasoningEffort: 'low',
      serviceTier: null,
    });
  });
});
