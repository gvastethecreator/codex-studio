import { describe, expect, it } from 'vitest';
import { CODEX_HTTP_MODEL } from '../packages/shared/src/codexExecutionContract';
import {
  buildComposerProviderProjection,
  resolveProviderMaxInputImages,
} from './composerProviderProjection';

const emptyAttachments: never[] = [];

describe('composerProviderProjection', () => {
  it('keeps Codex generate unblocked and shows Codex chrome', () => {
    const projection = buildComposerProviderProjection({
      providerId: 'codex',
      codexTransport: 'codex_app_server',
      recipeId: null,
      aspectRatio: '2:3',
      attachments: emptyAttachments,
      grokCanExecute: false,
      codexModelCatalog: {
        models: [
          {
            ...CODEX_HTTP_MODEL,
            id: 'gpt-5.4-mini',
            supportedReasoningEfforts: [{ reasoningEffort: 'low', description: null }],
          },
        ],
        source: 'app-server',
        authMode: 'chatgpt',
        fetchedAt: '2026-09-05',
        planType: null,
        error: null,
        recommendedDefaultModel: 'gpt-5.4-mini',
      },
      executionModel: 'gpt-5.4-mini',
      executionReasoningEffort: 'low',
      executionSpeed: 'standard',
      catalogError: null,
    });

    expect(projection.kind).toBe('codex');
    expect(projection.showCodexModelChrome).toBe(true);
    expect(projection.showCodexPromptTools).toBe(true);
    expect(projection.maxOutputCount).toBe(10);
    expect(projection.generateBlock).toBeNull();
    expect(resolveProviderMaxInputImages('codex')).toBe(10);
    expect(resolveProviderMaxInputImages('grok')).toBe(5);
  });

  it('blocks Grok generate for an unsupported recipe and hides Codex chrome', () => {
    const projection = buildComposerProviderProjection({
      providerId: 'grok',
      recipeId: 'camera',
      aspectRatio: '1:1',
      attachments: emptyAttachments,
      grokCanExecute: true,
      codexModelCatalog: null,
      executionModel: 'gpt-5.4-mini',
      executionReasoningEffort: 'low',
      executionSpeed: 'standard',
      catalogError: null,
    });

    expect(projection.kind).toBe('grok');
    expect(projection.showCodexModelChrome).toBe(false);
    expect(projection.showCodexPromptTools).toBe(false);
    expect(projection.maxOutputCount).toBe(1);
    expect(projection.generateBlock).toMatchObject({ code: 'unsupported_grok_recipe' });
  });
  it('projects ChatGPT independently of the Codex catalog and keeps app-server settings', () => {
    const input = {
      providerId: 'chatgpt' as const,
      codexTransport: 'subscription_http' as const,
      codexAvailableTransports: ['subscription_http'] as const,
      recipeId: null,
      aspectRatio: '16:9' as const,
      attachments: [],
      grokCanExecute: false,
      codexModelCatalog: null,
      executionModel: 'gpt-5.6-luna',
      executionReasoningEffort: 'max',
      executionSpeed: 'fast' as const,
      catalogError: null,
    };
    const projection = buildComposerProviderProjection(input);
    expect(projection.generateBlock).toBeNull();
    expect(projection.execution.selectedModel?.id).toBe('gpt-5.5');
    expect(projection.execution.summary).toContain('Flare');
    expect(projection.execution.selectedImageModel?.id).toBe('gpt-image-2.5-flare');
    expect(projection.execution.imageModels.map((model) => model.id)).toEqual([
      'gpt-image-2.5-flare',
      'gpt-image-2.5-sunburst',
      'gpt-image-2',
    ]);
    expect(projection.execution.showImageSizeControl).toBe(true);
    expect(projection.execution.imageSizeOptions.map((option) => option.tier)).toEqual([
      '1K',
      '2K',
      '4K',
    ]);
    expect(projection.execution.selectedImageSize).toMatchObject({
      tier: '1K',
      size: '1536x864',
    });
    expect(projection.execution.summary).toContain('1K');
    expect(projection.execution.reasoningOptions).toEqual(['provider_default']);
    expect(projection.execution.speedOptions).toEqual(['standard']);
    expect(projection.execution.availableTransports).toEqual(['subscription_http']);

    const appProjection = buildComposerProviderProjection({
      ...input,
      providerId: 'codex',
      codexAvailableTransports: ['codex_app_server'],
      codexTransport: 'codex_app_server',
      codexModelCatalog: {
        models: [
          {
            ...CODEX_HTTP_MODEL,
            id: 'gpt-5.6-luna',
            displayName: 'GPT-5.6-LUNA',
            supportedReasoningEfforts: [{ reasoningEffort: 'max', description: null }],
            additionalSpeedTiers: ['fast'],
          },
        ],
        source: 'app-server',
        authMode: 'chatgpt',
        fetchedAt: '2026-09-05',
        planType: 'pro',
        error: null,
        recommendedDefaultModel: 'gpt-5.6-luna',
      },
    });
    expect(appProjection.generateBlock).toBeNull();
    expect(appProjection.execution.selectedModel?.id).toBe('gpt-5.6-luna');
    expect(appProjection.execution.summary).toContain('MAX');
    expect(appProjection.execution.showImageSizeControl).toBe(false);
    expect(appProjection.execution.imageSizeOptions).toEqual([]);

    expect(
      buildComposerProviderProjection({ ...input, codexAvailableTransports: ['codex_app_server'] })
        .generateBlock?.code,
    ).toBe('codex_transport_unavailable');
  });

  it('caps fal output count at 4 and google at 1', () => {
    expect(
      buildComposerProviderProjection({
        providerId: 'fal',
        recipeId: null,
        aspectRatio: '1:1',
        attachments: emptyAttachments,
        grokCanExecute: false,
        codexModelCatalog: null,
        executionModel: 'gpt-5.4-mini',
        executionReasoningEffort: 'low',
        executionSpeed: 'standard',
        catalogError: null,
      }).maxOutputCount,
    ).toBe(4);
    expect(
      buildComposerProviderProjection({
        providerId: 'google',
        recipeId: null,
        aspectRatio: '1:1',
        attachments: emptyAttachments,
        grokCanExecute: false,
        codexModelCatalog: null,
        executionModel: 'gpt-5.4-mini',
        executionReasoningEffort: 'low',
        executionSpeed: 'standard',
        catalogError: null,
      }).maxOutputCount,
    ).toBe(1);
  });
});
