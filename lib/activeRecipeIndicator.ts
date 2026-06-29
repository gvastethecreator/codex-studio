import type { RecipeId } from '../types';

type RegisteredRecipeId = Exclude<RecipeId, null>;

export interface ActiveRecipeIndicator {
  id: RegisteredRecipeId;
  title: string;
  summary: string;
  toneClassName: string;
  dotClassName: string;
}

const ACTIVE_RECIPE_INDICATORS: Record<RegisteredRecipeId, ActiveRecipeIndicator> = {
  styles: {
    id: 'styles',
    title: 'Styles',
    summary: 'Style locked',
    toneClassName: 'border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-100',
    dotClassName: 'bg-fuchsia-300',
  },
  remaster: {
    id: 'remaster',
    title: 'Remaster',
    summary: 'Restore flow',
    toneClassName: 'border-amber-400/25 bg-amber-500/10 text-amber-100',
    dotClassName: 'bg-amber-300',
  },
  spritesheet: {
    id: 'spritesheet',
    title: 'Sprite Sheet',
    summary: 'Sprite grid',
    toneClassName: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100',
    dotClassName: 'bg-emerald-300',
  },
  cinematic: {
    id: 'cinematic',
    title: 'Cinematic',
    summary: 'Shot plan',
    toneClassName: 'border-rose-400/25 bg-rose-500/10 text-rose-100',
    dotClassName: 'bg-rose-300',
  },
  'character-lab': {
    id: 'character-lab',
    title: 'Character Lab',
    summary: 'Action set',
    toneClassName: 'border-cyan-400/25 bg-cyan-500/10 text-cyan-100',
    dotClassName: 'bg-cyan-300',
  },
  character: {
    id: 'character',
    title: 'Character',
    summary: 'Sheet spec',
    toneClassName: 'border-violet-400/25 bg-violet-500/10 text-violet-100',
    dotClassName: 'bg-violet-300',
  },
  camera: {
    id: 'camera',
    title: 'Camera',
    summary: 'View orbit',
    toneClassName: 'border-sky-400/25 bg-sky-500/10 text-sky-100',
    dotClassName: 'bg-sky-300',
  },
  timeline: {
    id: 'timeline',
    title: 'Timeline',
    summary: 'Frame chain',
    toneClassName: 'border-lime-400/25 bg-lime-500/10 text-lime-100',
    dotClassName: 'bg-lime-300',
  },
};

export function getActiveRecipeIndicator(
  recipeId: RecipeId | null | undefined,
): ActiveRecipeIndicator | null {
  if (!recipeId) return null;
  return ACTIVE_RECIPE_INDICATORS[recipeId] ?? null;
}

export function listActiveRecipeIndicators() {
  return Object.values(ACTIVE_RECIPE_INDICATORS);
}
