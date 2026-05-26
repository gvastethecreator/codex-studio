import { describe, expect, it } from 'vite-plus/test';

import { createEvaluationSummary, evaluateRecipePrompts } from './evaluate-recipe-prompts';

describe('recipe prompt evaluation', () => {
  it('generates all three variants per recipe with savings for directives', () => {
    const session = evaluateRecipePrompts();

    expect(session.pairs.length).toBeGreaterThanOrEqual(5);
    expect(session.pairs.every((p) => p.variants.length === 3)).toBe(true);

    const variantNames = new Set(session.pairs.flatMap((p) => p.variants.map((v) => v.name)));
    expect(variantNames).toContain('bare');
    expect(variantNames).toContain('legacy');
    expect(variantNames).toContain('directives');

    for (const pair of session.pairs) {
      const directives = pair.variants.find((v) => v.name === 'directives');
      const legacy = pair.variants.find((v) => v.name === 'legacy');
      if (!directives || !legacy) continue;

      expect(directives.metadata.usesProviderDirectives).toBe(true);
      expect(legacy.metadata.usesLegacyContext).toBe(true);
      expect(directives.recipeDirectivesChars).toBeGreaterThan(0);
      expect(legacy.recipeContextChars).toBeGreaterThan(0);
      expect(directives.promptChars).toBeLessThan(legacy.promptChars);
    }
  });

  it('produces smaller bare variants than enriched variants', () => {
    const session = evaluateRecipePrompts();
    for (const pair of session.pairs) {
      const bare = pair.variants.find((v) => v.name === 'bare');
      const directives = pair.variants.find((v) => v.name === 'directives');
      if (!bare || !directives) continue;
      expect(bare.promptChars).toBeLessThan(directives.promptChars);
    }
  });

  it('verifies directive savings above the minimum threshold', () => {
    const session = evaluateRecipePrompts();
    const summary = createEvaluationSummary(session);

    expect(summary.totalPairs).toBe(session.pairs.length);
    expect(summary.minDirectiveSavingsPercent).toBe(30);
    expect(summary.failures).toEqual([]);
  });
});
