import { describe, expect, it } from 'vite-plus/test';

import {
  extractRecipeContextFromPrompt,
  parsePromptTransport,
  stripPromptTransportSections,
} from './promptTransport';

describe('promptTransport', () => {
  const recipeContext = [
    '--- CODEX RECIPE CONTEXT ---',
    'protocol: codex-recipe-v1',
    'recipe: styles',
    'title: STYLE TRANSFER PROTOCOL',
    '',
    'TARGET STYLE: NEO NOIR',
    '--- END CODEX RECIPE CONTEXT ---',
  ].join('\n');

  const finalPrompt = [
    'Create a neon alley portrait of a masked courier.',
    ['Recipe instructions:', recipeContext].join('\n'),
    'Avoid:\nlow quality, blurry',
    'ImageGen output size: 1024x1536',
    'Aspect ratio: 2:3 (portrait)',
  ].join('\n\n');

  it('extracts the recipe envelope from final prompts', () => {
    const context = extractRecipeContextFromPrompt(finalPrompt);

    expect(context).toContain('protocol: codex-recipe-v1');
    expect(context).toContain('recipe: styles');
    expect(context.startsWith('--- CODEX RECIPE CONTEXT ---')).toBe(true);
  });

  it('parses transport sections into a structured snapshot', () => {
    const snapshot = parsePromptTransport(finalPrompt);

    expect(snapshot.prompt).toBe('Create a neon alley portrait of a masked courier.');
    expect(snapshot.recipeId).toBe('styles');
    expect(snapshot.recipeContext).toContain('STYLE TRANSFER PROTOCOL');
    expect(snapshot.negativePrompt).toBe('low quality, blurry');
    expect(snapshot.aspectRatio).toBe('2:3');
    expect(snapshot.imageSize).toBe('1024x1536');
  });

  it('leaves plain prompts untouched', () => {
    const plainPrompt = 'Simple portrait study';

    expect(stripPromptTransportSections(plainPrompt)).toBe(plainPrompt);
    expect(parsePromptTransport(plainPrompt)).toEqual({
      prompt: plainPrompt,
      recipeContext: '',
      recipeId: null,
      negativePrompt: '',
      aspectRatio: null,
      imageSize: null,
    });
  });
});
