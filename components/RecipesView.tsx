import React from 'react';
import type { RecipeAliasId } from '../lib/recipeAliases';
import type { RecipeId } from '../types';
import { RecipeDiscoveryList } from './recipes/RecipeDiscoveryList';

interface RecipesViewProps {
  onSelectRecipe: (id: RecipeId, aliasId?: RecipeAliasId | null) => void;
  onPreviewRecipe: (id: RecipeId) => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({ onSelectRecipe, onPreviewRecipe }) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4">
      <h2 className="text-lg font-semibold">Recipes</h2>
      <p className="mt-1 mb-4 text-sm text-[color:var(--wb-muted)]">Choose a guided workflow.</p>
      <RecipeDiscoveryList onSelectRecipe={onSelectRecipe} onPreviewRecipe={onPreviewRecipe} />
    </div>
  );
};
