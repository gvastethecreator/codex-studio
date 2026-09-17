import React from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import type { RecipeAliasId } from '../../lib/recipeAliases';
import type { RecipeCatalogDisplayEntry } from '../../lib/recipeCatalog';
import { RECIPE_CARD_IMAGES } from '../../lib/recipeCardCatalog';
import { createRecipesGridProjection } from '../../lib/recipeDiscoveryProjection';
import type { RecipeId } from '../../types';

export interface RecipeDiscoveryListProps {
  entries?: RecipeCatalogDisplayEntry[];
  density?: 'page' | 'compact';
  onSelectRecipe: (id: RecipeId, aliasId?: RecipeAliasId | null) => void;
  onPreviewRecipe: (id: RecipeId) => void;
}

export const RecipeDiscoveryList: React.FC<RecipeDiscoveryListProps> = ({
  entries,
  density = 'page',
  onSelectRecipe,
  onPreviewRecipe,
}) => {
  const recipeDiscovery = React.useMemo(
    () => (entries ? { entries } : createRecipesGridProjection()),
    [entries],
  );
  const isCompact = density === 'compact';

  return (
    <div className={isCompact ? 'grid gap-1' : 'grid gap-2'}>
      {recipeDiscovery.entries.map((recipe) => {
        const image = RECIPE_CARD_IMAGES[recipe.cardImageKey];
        return (
          <button
            key={recipe.id}
            type="button"
            role={isCompact ? 'option' : undefined}
            aria-label={`Open ${recipe.title.toLowerCase()}`}
            onClick={() => onSelectRecipe(recipe.targetRecipeId, recipe.routeAliasId)}
            onFocus={() => onPreviewRecipe(recipe.targetRecipeId)}
            onPointerEnter={() => onPreviewRecipe(recipe.targetRecipeId)}
            className={
              isCompact
                ? 'flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-accent-400'
                : 'flex min-w-0 items-center gap-3 rounded-xl bg-white/[0.035] p-2 text-left transition-colors hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-accent-400'
            }
          >
            {image && (
              <img
                src={image.src}
                srcSet={image.srcSet}
                sizes={isCompact ? '32px' : '48px'}
                alt=""
                loading="lazy"
                decoding="async"
                className={
                  isCompact
                    ? 'size-8 shrink-0 rounded-md object-cover'
                    : 'size-12 shrink-0 rounded-lg object-cover'
                }
              />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold capitalize">
                {recipe.title.toLowerCase()}
              </span>
              <span className="mt-0.5 block truncate text-xs text-zinc-400">
                {recipe.description}
              </span>
            </span>
            <IconArrowRight size={16} className="shrink-0 text-zinc-500" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
};
