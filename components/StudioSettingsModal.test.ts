import { describe, expect, it } from 'vite-plus/test';
import { createDefaultEditableStudioSettings } from '../packages/shared/src';
import { buildStudioSettingsPatch, getStudioSettingsFormState } from '../lib/studioSettingsForm';

describe('StudioSettingsModal provider defaults', () => {
  it('round-trips editable provider defaults including nullable resets', () => {
    const settings = createDefaultEditableStudioSettings();
    settings.providerDefaults.codex = {
      providerId: 'codex',
      model: null,
      reasoningEffort: null,
      serviceTier: null,
    };

    const patch = buildStudioSettingsPatch(getStudioSettingsFormState(settings));

    expect(patch.providerDefaults?.codex).toEqual(settings.providerDefaults.codex);
  });
});
