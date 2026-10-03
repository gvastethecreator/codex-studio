import { describe, expect, it } from 'vitest';

import { createEvaluationSummary, evaluateRecipePrompts } from './evaluate-recipe-prompts';

describe('recipe prompt evaluation', () => {
  it('compares a bare prompt with the directives prompt for every recipe', () => {
    const session = evaluateRecipePrompts();

    expect(session.pairs.length).toBeGreaterThanOrEqual(5);
    for (const pair of session.pairs) {
      expect(pair.variants.map((v) => v.name)).toEqual(['bare', 'directives']);
      const [bare, directives] = pair.variants;
      expect(directives.metadata.usesProviderDirectives).toBe(true);
      expect(directives.recipeDirectivesChars).toBeGreaterThan(0);
      expect(bare.promptChars).toBeLessThan(directives.promptChars);
    }
  });

  it('verifies the session without failures', () => {
    const session = evaluateRecipePrompts();
    const summary = createEvaluationSummary(session);

    expect(summary.totalPairs).toBe(session.pairs.length);
    expect(summary.failures).toEqual([]);
  });
});
