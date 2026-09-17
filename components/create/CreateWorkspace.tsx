import React, { Suspense, useCallback, useEffect } from 'react';

import { useGenerationDraft } from '../../contexts/GenerationContext';
import {
  buildRecipeIntentPreloadPlan,
  buildRoutePreloadPlan,
  type RoutePreloadPlan,
} from '../../lib/routePreloadBudget';
import { preloadRecipeComponent } from '../../lib/recipeRouteModules';
import { preloadStudioViewportSurface } from '../../lib/studioViewportRouteSurfaces';
import type { RecipeAliasId } from '../../lib/recipeAliases';
import type { GeneratedImageWithConfig, RecipeId } from '../../types';
import type { RecipePageRuntimeProps } from '../RecipePage';
import { RecipeResultPreview } from '../recipes/RecipeResultPreview';
import type { StudioGenerationDockProps } from '../shell/StudioGenerationDock';
import { CreateWorkflowPicker } from './CreateWorkflowPicker';

function preloadStudioViewportPlan(plan: RoutePreloadPlan) {
  for (const surface of plan.surfaces) {
    void preloadStudioViewportSurface(surface);
  }
  for (const recipeId of plan.recipeIds) {
    void preloadRecipeComponent(recipeId);
  }
}

const StudioGenerationDockFallback: React.FC = () => (
  <div
    className="create-tool-dock-loading min-h-0 flex-1"
    data-generation-dock-loading="true"
    aria-hidden="true"
  />
);

export interface CreateWorkspaceProps {
  recipePageProps: RecipePageRuntimeProps;
  onSelectRecipe: (recipeId: RecipeId, aliasId?: RecipeAliasId | null) => void;
  hasGenerationDock: boolean;
  GenerationDock: React.LazyExoticComponent<React.ComponentType<StudioGenerationDockProps>>;
  generationDockProps: StudioGenerationDockProps;
  onToggleFavorite?: (imageId: string) => void;
  onUseAsReference?: (image: GeneratedImageWithConfig) => void;
}

export const CreateWorkspace: React.FC<CreateWorkspaceProps> = ({
  recipePageProps,
  onSelectRecipe,
  hasGenerationDock,
  GenerationDock,
  generationDockProps,
  onToggleFavorite,
  onUseAsReference,
}) => {
  const draft = useGenerationDraft();

  const handlePreviewRecipe = useCallback((recipeId: RecipeId) => {
    preloadStudioViewportPlan(buildRecipeIntentPreloadPlan(recipeId));
  }, []);

  useEffect(() => {
    const plan = buildRoutePreloadPlan({ routeView: 'recipes', activeRecipe: null });
    const timeoutId = window.setTimeout(() => preloadStudioViewportPlan(plan), plan.delayMs);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="create-workspace" data-route-key="recipes-list">
      <aside className="create-tools" aria-label="Create tools">
        <CreateWorkflowPicker
          onSelectRecipe={onSelectRecipe}
          onPreviewRecipe={handlePreviewRecipe}
        />
        {hasGenerationDock ? (
          <Suspense fallback={<StudioGenerationDockFallback />}>
            <GenerationDock {...generationDockProps} layout="rail" />
          </Suspense>
        ) : null}
      </aside>
      <section className="create-stage" aria-label="Create canvas">
        <RecipeResultPreview
          variant="stage"
          images={recipePageProps.imagesWithConfig}
          reference={draft.generationConfig.attachments[0]}
          onOpen={recipePageProps.openModal}
          onToggleFavorite={onToggleFavorite}
          onUseAsReference={onUseAsReference}
        />
      </section>
    </div>
  );
};
