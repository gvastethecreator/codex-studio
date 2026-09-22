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
  selectedId?: string;
  onSelectRecipe: (id: RecipeId, aliasId?: RecipeAliasId | null) => void;
  onPreviewRecipe: (id: RecipeId) => void;
}

export const RecipeDiscoveryList: React.FC<RecipeDiscoveryListProps> = ({
  entries,
  density = 'page',
  selectedId,
  onSelectRecipe,
  onPreviewRecipe,
}) => {
  const recipeDiscovery = React.useMemo(
    () => (entries ? { entries } : createRecipesGridProjection()),
    [entries],
  );
  const isCompact = density === 'compact';

  return (
    <div className={isCompact ? 'create-workflow-options' : 'grid gap-2'}>
      {recipeDiscovery.entries.map((recipe) => {
        const image = RECIPE_CARD_IMAGES[recipe.cardImageKey];
        return (
          <button
            key={recipe.id}
            type="button"
            role={isCompact ? 'option' : undefined}
            aria-selected={isCompact ? recipe.id === selectedId : undefined}
            tabIndex={isCompact ? -1 : undefined}
            aria-label={`Open ${recipe.title.toLowerCase()}`}
            onClick={() => onSelectRecipe(recipe.targetRecipeId, recipe.routeAliasId)}
            onFocus={() => onPreviewRecipe(recipe.targetRecipeId)}
            onPointerEnter={() => onPreviewRecipe(recipe.targetRecipeId)}
            className={
              isCompact
                ? 'create-workflow-option'
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
                    ? 'create-workflow-option-thumbnail'
                    : 'size-12 shrink-0 rounded-lg object-cover'
                }
              />
            )}
            <span className={isCompact ? 'create-workflow-option-text' : 'min-w-0 flex-1'}>
              <span className="block truncate text-sm font-semibold capitalize">
                {recipe.title.toLowerCase()}
              </span>
              <span className="mt-0.5 block truncate text-xs text-[color:var(--wb-muted)]">
                {recipe.description}
              </span>
            </span>
            <IconArrowRight
              size={16}
              className={
                isCompact ? 'create-workflow-option-arrow' : 'shrink-0 text-[color:var(--wb-muted)]'
              }
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
};
