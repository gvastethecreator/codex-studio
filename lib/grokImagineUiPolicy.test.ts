import { describe, expect, it } from 'vite-plus/test';
import {
  describeGrokImagineEditNotice,
  formatCarouselPromptPreview,
  formatCarouselSourceLabel,
  isImageEditorApplyDisabled,
  listGrokImagineRatioOptions,
  resolveGrokCanExecute,
  resolveGrokImagineGenerateBlock,
  resolveGrokImagineToolbarAspectRatio,
  resolveImageEditorRequiresMask,
  summarizeGrokProviderStatusLine,
} from './grokImagineUiPolicy';

describe('grokImagineUiPolicy', () => {
  it('keeps Home and Styles unblocked for a ready Grok runtime', () => {
    expect(
      resolveGrokImagineGenerateBlock({
        providerId: 'grok',
        recipeId: null,
        aspectRatio: '1:1',
        canExecute: true,
      }),
    ).toBeNull();
    expect(
      resolveGrokImagineGenerateBlock({
        providerId: 'grok',
        recipeId: 'styles',
        aspectRatio: '16:9',
        canExecute: true,
      }),
    ).toBeNull();
  });

  it('blocks Camera and an unsupported ratio before Generate', () => {
    expect(
      resolveGrokImagineGenerateBlock({
        providerId: 'grok',
        recipeId: 'camera',
        aspectRatio: '1:1',
        canExecute: true,
      }),
    ).toMatchObject({ code: 'unsupported_grok_recipe' });
    expect(
      resolveGrokImagineGenerateBlock({
        providerId: 'grok',
        recipeId: null,
        aspectRatio: '2:3',
        canExecute: true,
      }),
    ).toMatchObject({ code: 'invalid_grok_aspect_ratio' });
  });

  it('lists only Grok-supported ratios and names login blockers', () => {
    expect(listGrokImagineRatioOptions().map((option) => option.ratio)).toEqual([
      '16:9',
      '4:3',
      '1:1',
      '3:4',
      '9:16',
    ]);
    expect(
      summarizeGrokProviderStatusLine({
        canExecute: false,
        status: 'not_configured',
        diagnostics: ['Grok Build does not have a usable local login. Run `grok login`.'],
      }),
    ).toBe('Run grok login');
    expect(resolveGrokImagineToolbarAspectRatio('2:3')).toBe('1:1');
    expect(resolveGrokImagineToolbarAspectRatio('16:9')).toBe('16:9');
    expect(describeGrokImagineEditNotice('grok')).toMatch(/painted mask/);
    expect(describeGrokImagineEditNotice('codex')).toBeNull();
    expect(resolveGrokCanExecute({ canExecute: true, canAttemptExecution: true })).toBe(true);
    expect(resolveGrokCanExecute({ canExecute: true })).toBe(false);
    expect(
      summarizeGrokProviderStatusLine({
        canExecute: false,
        status: 'not_configured',
        diagnostics: ['Grok Build did not report an available model. grok_model_unavailable'],
      }),
    ).toBe('Choose a current Grok model');
    expect(
      resolveGrokImagineGenerateBlock({
        providerId: 'grok',
        canExecute: false,
        status: 'not_configured',
        diagnostics: ['Grok Build did not report an available model. grok_model_unavailable'],
      }),
    ).toEqual({
      code: 'grok_not_ready',
      message: 'Grok Imagine is blocked. Choose a current Grok model.',
    });
    expect(
      formatCarouselPromptPreview(
        'GROK OUTPUT OVERRIDE: create exactly one portrait 3:4 image. TARGET STYLE: Expressive Performance Spin Style.',
      ),
    ).toBe('Expressive Performance Spin Style');
    expect(
      formatCarouselSourceLabel({
        model: 'codex-imagegen',
        prompt: 'GROK OUTPUT OVERRIDE: keep one card.',
      }),
    ).toBe('Grok Imagine');
    expect(resolveImageEditorRequiresMask('grok')).toBe(false);
    expect(
      isImageEditorApplyDisabled({
        isGenerating: false,
        editPrompt: 'softer light',
        historyIndex: -1,
      }),
    ).toBe(true);
    expect(
      isImageEditorApplyDisabled({
        isGenerating: false,
        editPrompt: 'softer light',
        historyIndex: -1,
        requireMask: false,
      }),
    ).toBe(false);
  });
});
