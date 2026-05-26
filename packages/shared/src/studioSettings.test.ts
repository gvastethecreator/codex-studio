import { describe, expect, it } from 'vite-plus/test';

import {
  createDefaultEditableStudioSettings,
  mergeEditableStudioSettingsPatch,
  sanitizeEditableStudioSettingsPatch,
} from './studioSettings';

describe('studioSettings', () => {
  it('creates non-secret editable settings separate from bootstrap config', () => {
    expect(createDefaultEditableStudioSettings()).toEqual({
      schemaVersion: 'editable-studio-settings/v1',
      defaultProviderId: 'codex',
      defaultOutputMode: 'studio_library',
      autoDetectOutputSources: true,
      commandCenterCompactMode: false,
      preferredLibraryId: null,
      preferredOutputPath: null,
      outputOrganization: {
        subfolderTokens: ['date', 'provider', 'recipe'],
        fileNameTemplate: '{timestamp}-{provider}-{jobId}',
      },
      providerDefaults: {
        codex: {
          providerId: 'codex',
          model: null,
          reasoningEffort: null,
          serviceTier: null,
        },
      },
      updatedAt: null,
    });
  });

  it('sanitizes unknown and secret-like fields before persistence', () => {
    const patch = sanitizeEditableStudioSettingsPatch({
      defaultProviderId: 'fal',
      apiKey: 'must-not-persist',
      providerDefaults: {
        fal: {
          providerId: 'fal',
          model: 'fal-ai/nano-banana/edit',
          token: 'must-not-persist',
        },
      },
    });

    expect(patch).toEqual({
      defaultProviderId: 'fal',
      providerDefaults: {
        fal: {
          providerId: 'fal',
          model: 'fal-ai/nano-banana/edit',
        },
      },
    });
  });

  it('merges patches while preserving safe provider defaults', () => {
    const settings = mergeEditableStudioSettingsPatch(
      createDefaultEditableStudioSettings(),
      {
        defaultProviderId: 'comfy',
        commandCenterCompactMode: true,
        preferredOutputPath: 'D:/DEV/codex-studio/outputs',
        outputOrganization: {
          subfolderTokens: ['date', 'model', 'recipe', 'invalid'],
          fileNameTemplate: '{recipe}/{bad:name}-{jobId}',
        },
        providerDefaults: {
          comfy: {
            providerId: 'comfy',
            model: 'local-workflow',
            reasoningEffort: 'none',
          },
        },
      },
      '2026-05-25T00:00:00.000Z',
    );

    expect(settings.defaultProviderId).toBe('comfy');
    expect(settings.commandCenterCompactMode).toBe(true);
    expect(settings.preferredOutputPath).toBe('D:/DEV/codex-studio/outputs');
    expect(settings.outputOrganization).toEqual({
      subfolderTokens: ['date', 'model', 'recipe'],
      fileNameTemplate: '{recipe}-{bad-name}-{jobId}',
    });
    expect(settings.providerDefaults.codex.providerId).toBe('codex');
    expect(settings.providerDefaults.comfy).toEqual({
      providerId: 'comfy',
      model: 'local-workflow',
      reasoningEffort: 'none',
      serviceTier: null,
    });
    expect(settings.updatedAt).toBe('2026-05-25T00:00:00.000Z');
  });
});
