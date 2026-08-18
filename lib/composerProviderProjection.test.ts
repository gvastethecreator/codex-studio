import { describe, expect, it } from 'vite-plus/test';
import { buildComposerProviderProjection } from './composerProviderProjection';

const emptyAttachments: never[] = [];

describe('composerProviderProjection', () => {
  it('keeps Codex generate unblocked and shows Codex chrome', () => {
    const projection = buildComposerProviderProjection({
      providerId: 'codex',
      recipeId: null,
      aspectRatio: '2:3',
      attachments: emptyAttachments,
      grokCanExecute: false,
      codexModelCatalog: null,
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
});
