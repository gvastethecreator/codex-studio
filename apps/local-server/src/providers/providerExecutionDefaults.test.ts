import { describe, expect, it } from 'vite-plus/test';
import { resolveBootstrapProviderExecutionOptions } from './providerExecutionDefaults';

describe('resolveBootstrapProviderExecutionOptions', () => {
  it('uses the Grok Runtime Doctor default instead of Codex toolbar values', () => {
    expect(
      resolveBootstrapProviderExecutionOptions(
        'grok',
        {},
        { grokRuntime: { defaultModel: 'grok-4.6' } },
      ),
    ).toEqual({
      model: 'grok-4.6',
      reasoningEffort: 'low',
      serviceTier: null,
    });
  });

  it('omits a Grok model when the Runtime Doctor has no default', () => {
    expect(
      resolveBootstrapProviderExecutionOptions('grok', {}, { grokRuntime: { defaultModel: null } }),
    ).toEqual({
      model: '',
      reasoningEffort: 'low',
      serviceTier: null,
    });
  });

  it('accepts a backend Grok model override without storing credentials in Studio Settings', () => {
    expect(
      resolveBootstrapProviderExecutionOptions(
        'grok',
        { GROK_IMAGE_MODEL: 'grok-next' },
        { grokRuntime: { defaultModel: 'grok-4.6' } },
      ),
    ).toEqual({
      model: 'grok-next',
      reasoningEffort: 'low',
      serviceTier: null,
    });
  });
});
