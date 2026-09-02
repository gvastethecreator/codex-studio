import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { createDefaultEditableStudioSettings } from '../packages/shared/src';
import {
  buildStudioSettingsPatch,
  EXTERNAL_SCAN_PATH_HELP,
  EXTERNAL_SCAN_PATH_LABEL,
  getStudioSettingsFormState,
  OUTPUT_SUBFOLDER_PRESETS,
} from '../lib/studioSettingsForm';

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

  it('labels preferredOutputPath as an external scan folder, not generate destination', () => {
    expect(EXTERNAL_SCAN_PATH_LABEL).toBe('External folder to scan');
    expect(EXTERNAL_SCAN_PATH_HELP).toContain('External Output Sources');
    expect(EXTERNAL_SCAN_PATH_HELP).toContain('Studio Library');
    expect(EXTERNAL_SCAN_PATH_LABEL.toLowerCase()).not.toContain('preferred output');

    const settingsSource = readFileSync(
      path.join(import.meta.dirname, 'StudioSettingsModal.tsx'),
      'utf8',
    );
    expect(settingsSource).toContain('EXTERNAL_SCAN_PATH_LABEL');
    expect(settingsSource).toContain('EXTERNAL_SCAN_PATH_HELP');
    expect(settingsSource).not.toMatch(/Preferred Output Path/);
    expect(settingsSource).toContain('STUDIO_SETTINGS_DOMAIN_TABS');
    expect(settingsSource).toContain('Accounts');
    expect(settingsSource).toContain('ProviderBrandMark');
    expect(settingsSource).toContain('type="radio"');
    expect(settingsSource).toContain('overflow-x-auto');
    expect(
      readFileSync(path.join(import.meta.dirname, '..', 'lib', 'studioSettingsDomains.ts'), 'utf8'),
    ).toContain("label: 'Providers'");
  });

  it('keeps Workspace-first output presets alongside date provider model and recipe', () => {
    expect(OUTPUT_SUBFOLDER_PRESETS[0]).toEqual({ label: 'Workspace', value: ['workspace'] });
    expect(OUTPUT_SUBFOLDER_PRESETS.map((preset) => preset.value)).toContainEqual([
      'date',
      'provider',
      'recipe',
    ]);
    expect(OUTPUT_SUBFOLDER_PRESETS.map((preset) => preset.value)).toContainEqual([
      'date',
      'model',
      'recipe',
    ]);
  });

  it('does not offer a second generate output folder during onboarding', () => {
    const onboardingSource = readFileSync(
      path.join(import.meta.dirname, 'OnboardingModal.tsx'),
      'utf8',
    );
    expect(onboardingSource).not.toMatch(/preferredOutputPath/);
    expect(onboardingSource).not.toMatch(/Preferred Output Path/);
    expect(onboardingSource).not.toMatch(/External folder to scan/);
  });
});
