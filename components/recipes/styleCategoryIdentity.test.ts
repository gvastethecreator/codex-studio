import { describe, expect, it } from 'vitest';

import { resolveStyleCategoryIdentity } from './styleCategoryIdentity';

describe('resolveStyleCategoryIdentity', () => {
  it('keeps pack_12 icons and pack accent colors', () => {
    const neon = resolveStyleCategoryIdentity('pack_12', '1. Neon Urban And Night Ops');
    expect(neon.iconId).toBe('tv');
    expect(neon.accentClassName).toBe('bg-emerald-500');
    expect(neon.titleClassName).toBe('text-emerald-300');
  });

  it('maps other packs by category keywords and pack theme', () => {
    const portrait = resolveStyleCategoryIdentity('pack_01', 'portrait-and-studio');
    expect(portrait.iconId).toBe('user');
    expect(portrait.accentClassName).toBe('bg-cyan-500');
    const lighting = resolveStyleCategoryIdentity('pack_01', 'Lighting Techniques');
    expect(lighting.iconId).toBe('sun');
  });
});
