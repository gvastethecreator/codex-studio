const RECIPE_PROVIDER_DIRECTIVES_PROTOCOL = 'recipe-provider-directives/v1' as const;

export interface RecipeProviderDirective {
  label: string;
  value: string;
}

export interface RecipeProviderDirectiveSection {
  title: string;
  directives: RecipeProviderDirective[];
}

export interface RecipeProviderDirectives {
  protocol: typeof RECIPE_PROVIDER_DIRECTIVES_PROTOCOL;
  recipeId: string;
  title: string;
  sections: RecipeProviderDirectiveSection[];
}

export interface CreateRecipeProviderDirectivesInput {
  recipeId: string;
  title: string;
  sections: RecipeProviderDirectiveSection[];
}

function cleanString(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cleanDirective(directive: RecipeProviderDirective) {
  const label = cleanString(directive.label);
  const value = cleanString(directive.value);
  return label && value ? { label, value } : null;
}

function isRecipeProviderDirective(
  directive: RecipeProviderDirective | null,
): directive is RecipeProviderDirective {
  return Boolean(directive);
}

export function createRecipeProviderDirectives({
  recipeId,
  title,
  sections,
}: CreateRecipeProviderDirectivesInput): RecipeProviderDirectives {
  return {
    protocol: RECIPE_PROVIDER_DIRECTIVES_PROTOCOL,
    recipeId: cleanString(recipeId),
    title: cleanString(title),
    sections: sections.reduce<RecipeProviderDirectiveSection[]>((acc, section) => {
      const title = cleanString(section.title);
      const directives = section.directives.reduce<RecipeProviderDirective[]>((dAcc, d) => {
        const cleaned = cleanDirective(d);
        if (isRecipeProviderDirective(cleaned)) dAcc.push(cleaned);
        return dAcc;
      }, []);
      if (title && directives.length > 0) acc.push({ title, directives });
      return acc;
    }, []),
  };
}

export function isRecipeProviderDirectives(value: unknown): value is RecipeProviderDirectives {
  if (!isRecord(value)) return false;
  if (value.protocol !== RECIPE_PROVIDER_DIRECTIVES_PROTOCOL) return false;
  if (typeof value.recipeId !== 'string' || typeof value.title !== 'string') return false;
  if (!Array.isArray(value.sections)) return false;

  return value.sections.every((section) => {
    if (!isRecord(section) || typeof section.title !== 'string') return false;
    if (!Array.isArray(section.directives)) return false;
    return section.directives.every(
      (directive) =>
        isRecord(directive) &&
        typeof directive.label === 'string' &&
        typeof directive.value === 'string',
    );
  });
}

export function serializeRecipeProviderDirectives(directives: RecipeProviderDirectives) {
  return [
    ...directives.sections.flatMap((section) => [
      `${section.title}:`,
      ...section.directives.map((directive) => `- ${directive.label}: ${directive.value}`),
    ]),
  ].join('\n');
}
