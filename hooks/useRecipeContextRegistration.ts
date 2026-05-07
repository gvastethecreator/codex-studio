import { useEffect, useMemo } from 'react';
import type { ImageGenerationConfig, RecipeId } from '../types';

type RegisteredRecipeId = Exclude<RecipeId, null>;

type UpdateConfig = <K extends keyof ImageGenerationConfig>(key: K, value: ImageGenerationConfig[K]) => void;

export function useRecipeContextRegistration(
  updateConfig: UpdateConfig,
  recipeId: RegisteredRecipeId,
  params: Record<string, unknown>,
) {
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    updateConfig('recipeId', recipeId);
    updateConfig('recipeParams', params);
    updateConfig('recipeContext', '');

    return () => {
      updateConfig('recipeId', null);
      updateConfig('recipeParams', null);
      updateConfig('recipeContext', '');
    };
  }, [paramsKey, params, recipeId, updateConfig]);
}
