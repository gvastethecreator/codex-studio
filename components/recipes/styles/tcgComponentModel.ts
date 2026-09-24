import atlas from './atlas/tcg-catalog.source.json';

export type TcgFinish = (typeof atlas.finishes)[number];
export type TcgLayout = (typeof atlas.layouts)[number];
export type TcgRecipe = (typeof atlas.recipes)[number];

export const TCG_FINISHES = atlas.finishes;
export const TCG_LAYOUTS = atlas.layouts;
export const TCG_RECIPES = atlas.recipes;

export function tcgPresetIdForSourceId(sourceId: string): string {
  const match = /^TCG-S(\d{3})$/.exec(sourceId);
  const index = match ? Number(match[1]) : NaN;
  if (!Number.isInteger(index) || index < 1 || atlas.styles[index - 1]?.id !== sourceId) {
    throw new Error(`Unknown TCG style: ${sourceId}`);
  }
  return `SP22-${String(index + 100).padStart(3, '0')}`;
}

export function resolveTcgRecipe(recipeId: string) {
  const recipe = TCG_RECIPES.find((entry) => entry.id === recipeId);
  if (!recipe) throw new Error(`Unknown TCG recipe: ${recipeId}`);
  const finish = TCG_FINISHES.find((entry) => entry.id === recipe.finishId);
  const layout = TCG_LAYOUTS.find((entry) => entry.id === recipe.layoutId);
  if (!finish || !layout) throw new Error(`Incomplete TCG recipe: ${recipeId}`);
  return {
    recipe,
    finish,
    layout,
    primaryPresetId: tcgPresetIdForSourceId(recipe.primaryStyleId),
    secondaryPresetId: tcgPresetIdForSourceId(recipe.secondaryStyleId),
  };
}

export function buildTcgRecipeArtPrompt(recipeId: string, subjectPrompt: string): string {
  const subject = subjectPrompt.trim();
  if (!subject) throw new Error('Describe the card subject before generating its artwork.');
  const { recipe } = resolveTcgRecipe(recipeId);
  // Layout, lettering and surface finish are composed after the art is generated.
  return `${subject}\n\n${recipe.promptDraft}`;
}
