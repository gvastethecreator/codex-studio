import { describe, expect, it } from 'vitest';

import {
  createDefaultEditableStudioSettings,
  mergeEditableStudioSettingsPatch,
  normalizeEditableStudioSettings,
  sanitizeEditableStudioSettingsPatch,
} from './studioSettings';

describe('studioSettings', () => {
  it('creates non-secret editable settings separate from bootstrap config', () => {
    expect(createDefaultEditableStudioSettings()).toEqual({
      schemaVersion: 'editable-studio-settings/v2',
      preferredWorkflow: 'default',
      outputDirectory: null,
      outputDirectoryId: null,
      defaultProviderId: 'chatgpt',
      defaultOutputMode: 'studio_library',
      autoDetectOutputSources: true,
      notifyOnUpdates: false,
      commandCenterCompactMode: false,
      intentionalStylesV1: false,
      disabledWorkflowModules: [],
      showWorkspaceHistoryInCarousel: true,
      preferredLibraryId: null,
      preferredOutputPath: null,
      outputOrganization: {
        subfolderTokens: [],
        fileNameTemplate: '{timestampUtc}_{generation}_{style}_{prompt}',
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
    const previous = {
      ...createDefaultEditableStudioSettings(),
      schemaVersion: 'editable-studio-settings/v1',
      outputOrganization: {
        subfolderTokens: ['workspace'],
        fileNameTemplate: '{date}_{style}_{prompt}',
      },
    };
    expect(normalizeEditableStudioSettings(previous).outputOrganization).toEqual({
      subfolderTokens: ['workspace'],
      fileNameTemplate: '{timestampUtc}_{generation}_{style}_{prompt}',
    });
    for (const settings of [
      { ...previous, schemaVersion: 'editable-studio-settings/v2' },
      { ...previous, outputOrganization: { fileNameTemplate: '{jobId}' } },
    ]) {
      expect(normalizeEditableStudioSettings(settings).outputOrganization.fileNameTemplate).toBe(
        settings.outputOrganization.fileNameTemplate,
      );
    }
  });

  it('sanitizes unknown and secret-like fields before persistence', () => {
    const patch = sanitizeEditableStudioSettingsPatch({
      defaultProviderId: 'fal',
      apiKey: 'must-not-persist',
      disabledWorkflowModules: ['timeline', 'not-a-module', 'remaster', 'timeline'],
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
      disabledWorkflowModules: ['remaster', 'timeline'],
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
        notifyOnUpdates: true,
        showWorkspaceHistoryInCarousel: false,
        preferredOutputPath: 'D:/DEV/cozy-studio/outputs',
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
    expect(settings.notifyOnUpdates).toBe(true);
    expect(
      mergeEditableStudioSettingsPatch(settings, { notifyOnUpdates: 'false' }).notifyOnUpdates,
    ).toBe(true);
    expect(
      mergeEditableStudioSettingsPatch(settings, { notifyOnUpdates: false }).notifyOnUpdates,
    ).toBe(false);
    expect(settings.showWorkspaceHistoryInCarousel).toBe(false);
    expect(mergeEditableStudioSettingsPatch(settings, {}).showWorkspaceHistoryInCarousel).toBe(
      false,
    );
    expect(
      mergeEditableStudioSettingsPatch(createDefaultEditableStudioSettings(), {})
        .showWorkspaceHistoryInCarousel,
    ).toBe(true);
    expect(settings.preferredOutputPath).toBe('D:/DEV/cozy-studio/outputs');
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

  it('keeps workspace as a valid output subfolder token', () => {
    const settings = mergeEditableStudioSettingsPatch(createDefaultEditableStudioSettings(), {
      outputOrganization: {
        subfolderTokens: ['workspace', 'date', 'invalid'],
      },
    });

    expect(settings.outputOrganization.subfolderTokens).toEqual(['workspace', 'date']);
  });

  it('preserves explicit nulls so provider defaults can be cleared', () => {
    const current = mergeEditableStudioSettingsPatch(createDefaultEditableStudioSettings(), {
      providerDefaults: {
        codex: {
          model: 'gpt-custom',
          reasoningEffort: 'high',
          serviceTier: 'fast',
        },
      },
    });

    const cleared = mergeEditableStudioSettingsPatch(current, {
      providerDefaults: {
        codex: {
          model: null,
          reasoningEffort: null,
          serviceTier: null,
        },
      },
    });

    expect(cleared.providerDefaults.codex).toEqual({
      providerId: 'codex',
      model: null,
      reasoningEffort: null,
      serviceTier: null,
    });
  });
});
