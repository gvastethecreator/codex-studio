import { describe, expect, it } from 'vite-plus/test';
import { CODEX_HTTP_MODEL } from '../packages/shared/src/codexExecutionContract';
import { buildComposerProviderProjection } from './composerProviderProjection';

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
    expect(projection.generateBlock).toBeNull();
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
    expect(projection.generateBlock).toMatchObject({ code: 'unsupported_grok_recipe' });
  });
  it('requires explicit HTTP settings and previews exact output after an auth change', () => {
    const input = {
      providerId: 'codex' as const,
      codexTransport: 'subscription_http' as const,
      recipeId: null,
      aspectRatio: '16:9' as const,
      attachments: [],
      grokCanExecute: false,
      codexModelCatalog: null,
      executionModel: 'gpt-5.4',
      executionReasoningEffort: 'high',
      executionSpeed: 'fast' as const,
      catalogError: null,
    };
    expect(buildComposerProviderProjection(input).generateBlock?.code).toBe(
      'codex_execution_unsupported',
    );
    const ready = {
      ...input,
      executionModel: 'gpt-5.5',
      executionReasoningEffort: 'provider_default',
      executionSpeed: 'standard' as const,
    };
    const projection = buildComposerProviderProjection(ready);
    expect(projection.generateBlock).toBeNull();
    expect(projection.execution.summary).toContain('1536x864');
    expect(projection.execution.reasoningOptions).toEqual(['provider_default']);
    expect(projection.execution.speedOptions).toEqual(['standard']);
    expect(
      buildComposerProviderProjection({ ...ready, codexTransport: 'codex_app_server' })
        .generateBlock?.code,
    ).toBe('codex_execution_unsupported');
  });
});
