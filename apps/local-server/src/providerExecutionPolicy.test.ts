import { describe, expect, it } from 'vite-plus/test';
import { createDefaultEditableStudioSettings } from '../../../packages/shared/src';
import { resolveEffectiveJobExecutionOptions } from './providerExecutionPolicy';

describe('resolveEffectiveJobExecutionOptions', () => {
  const bootstrap = {
    model: 'bootstrap-model',
    reasoningEffort: 'medium',
    serviceTier: null,
  } as const;

  it('resolves each field through explicit override, provider default, then bootstrap', () => {
    const settings = createDefaultEditableStudioSettings();
    settings.providerDefaults.codex = {
      providerId: 'codex',
      model: 'provider-model',
      reasoningEffort: 'high',
      serviceTier: 'flex',
    };

    expect(
      resolveEffectiveJobExecutionOptions({
        providerId: 'codex',
        explicit: {
          model: 'explicit-model',
          reasoningEffort: '',
          serviceTier: null,
        },
        settings,
        bootstrap,
      }),
    ).toEqual({
      model: 'explicit-model',
      reasoningEffort: 'high',
      serviceTier: null,
    });
  });

  it('uses bootstrap values after nullable provider defaults are cleared', () => {
    const settings = createDefaultEditableStudioSettings();

    expect(
      resolveEffectiveJobExecutionOptions({
        providerId: 'codex',
        settings,
        bootstrap,
      }),
    ).toEqual(bootstrap);
  });
});
