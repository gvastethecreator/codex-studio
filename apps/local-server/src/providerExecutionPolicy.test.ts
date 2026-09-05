import { describe, expect, it, vi } from 'vite-plus/test';
import { createDefaultEditableStudioSettings } from '../../../packages/shared/src';
import { resolveEffectiveJobExecutionOptions } from './providerExecutionPolicy';
import { resolveJobExecutionOptions } from './codex/executionOptions';
vi.mock('./config', () => ({
  getSettings: () => ({
    codexImagegenModel: 'changed-model',
    codexImagegenReasoningEffort: 'high',
    codexImagegenServiceTier: 'fast',
  }),
}));

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
  it('preserves captured standard speed after global defaults change', () => {
    expect(
      resolveJobExecutionOptions({
        model: 'accepted-model',
        reasoningEffort: 'low',
        serviceTier: null,
      }),
    ).toEqual({ model: 'accepted-model', reasoningEffort: 'low', serviceTier: null });
  });
});
