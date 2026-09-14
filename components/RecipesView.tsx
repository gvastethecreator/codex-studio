import React from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import type { RecipeAliasId } from '../lib/recipeAliases';
import type { RecipeId } from '../types';
import { RECIPE_CARD_IMAGES } from '../lib/recipeCardCatalog';
import { createRecipesGridProjection } from '../lib/recipeDiscoveryProjection';

interface RecipesViewProps {
  onSelectRecipe: (id: RecipeId, aliasId?: RecipeAliasId | null) => void;
  onPreviewRecipe: (id: RecipeId) => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({ onSelectRecipe, onPreviewRecipe }) => {
  const recipeDiscovery = React.useMemo(() => createRecipesGridProjection(), []);
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4">
      <h2 className="text-lg font-semibold">Recipes</h2>
      <p className="mt-1 mb-4 text-sm text-zinc-400">Choose a guided workflow.</p>
      <div className="grid gap-2">
        {recipeDiscovery.entries.map((recipe) => {
          const image = RECIPE_CARD_IMAGES[recipe.cardImageKey];
          return (
            <button
              key={recipe.id}
              type="button"
              aria-label={`Open ${recipe.title.toLowerCase()}`}
              onClick={() => onSelectRecipe(recipe.targetRecipeId, recipe.routeAliasId)}
              onFocus={() => onPreviewRecipe(recipe.targetRecipeId)}
              onPointerEnter={() => onPreviewRecipe(recipe.targetRecipeId)}
              className="flex min-w-0 items-center gap-3 rounded-xl bg-white/[0.035] p-2 text-left transition-colors hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-accent-400"
            >
              {image && (
                <img
                  src={image.src}
                  srcSet={image.srcSet}
                  sizes="48px"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-12 shrink-0 rounded-lg object-cover"
                />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold capitalize">
                  {recipe.title.toLowerCase()}
                </span>
                <span className="mt-1 block truncate text-xs text-zinc-400">
                  {recipe.description}
                </span>
              </span>
              <IconArrowRight size={16} className="shrink-0 text-zinc-500" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
