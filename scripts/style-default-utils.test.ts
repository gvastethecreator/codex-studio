import { describe, expect, it } from 'vite-plus/test';

import { IMAGEGEN_DENOISE_SUFFIX, sanitizeStylePromptName } from './style-default-utils';

describe('sanitizeStylePromptName', () => {
  it('keeps ordinary preset names intact', () => {
    expect(sanitizeStylePromptName('Veiled Grimoire Secrecy')).toBe('Veiled Grimoire Secrecy');
  });

  it('softens conflict-heavy weapon terms for generation labels only', () => {
    expect(sanitizeStylePromptName('Oath Knife Binding')).toBe('Oath Seal Binding');
    expect(sanitizeStylePromptName('Ceremonial Blades of Sacrifice')).toBe(
      'Ceremonial Edges of Rite',
    );
  });
});

describe('IMAGEGEN_DENOISE_SUFFIX', () => {
  it('does not make anime a global fallback style', () => {
    expect(IMAGEGEN_DENOISE_SUFFIX).not.toContain('anime-inspired illustration when useful');
    expect(IMAGEGEN_DENOISE_SUFFIX).toContain(
      'unless the preset, pack, or category explicitly calls for anime',
    );
  });
});
