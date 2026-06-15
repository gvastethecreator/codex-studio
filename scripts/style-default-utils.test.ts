import { describe, expect, it } from 'vite-plus/test';

import { sanitizeStylePromptName } from './style-default-utils';

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
