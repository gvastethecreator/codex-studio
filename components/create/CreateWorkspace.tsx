import React, { Suspense, useEffect } from 'react';

import { useGenerationDraft } from '../../contexts/GenerationContext';
import { buildRoutePreloadPlan, type RoutePreloadPlan } from '../../lib/routePreloadBudget';
import { preloadRecipeComponent } from '../../lib/recipeRouteModules';
import { preloadStudioViewportSurface } from '../../lib/studioViewportRouteSurfaces';
import type { GeneratedImageWithConfig } from '../../types';
import type { RecipePageRuntimeProps } from '../RecipePage';
import { RecipeResultPreview } from '../recipes/RecipeResultPreview';
import type { StudioGenerationDockProps } from '../shell/StudioGenerationDock';

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
  hasGenerationDock: boolean;
  GenerationDock: React.LazyExoticComponent<React.ComponentType<StudioGenerationDockProps>>;
  generationDockProps: StudioGenerationDockProps;
  onToggleFavorite?: (imageId: string) => void;
  onUseAsReference?: (image: GeneratedImageWithConfig) => void;
  tools?: React.ReactNode;
  images?: GeneratedImageWithConfig[];
  routeKey?: string;
  onSidePanelTarget?: (node: HTMLElement | null) => void;
}

export const CreateWorkspace: React.FC<CreateWorkspaceProps> = ({
  recipePageProps,
  hasGenerationDock,
  GenerationDock,
  generationDockProps,
  onToggleFavorite,
  onUseAsReference,
  tools,
  images,
  routeKey = 'recipes-list',
  onSidePanelTarget,
}) => {
  const draft = useGenerationDraft();
  const stageImages = images ?? recipePageProps.imagesWithConfig;

  useEffect(() => {
    const plan = buildRoutePreloadPlan({ routeView: 'recipes', activeRecipe: null });
    const timeoutId = window.setTimeout(() => preloadStudioViewportPlan(plan), plan.delayMs);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="create-workspace" data-route-key={routeKey}>
      <div className="create-tray-stack">
        <aside
          className={`create-tools studio-surface${tools ? ' workbench-config' : ''}`}
          aria-label="Create tools"
        >
          {tools}
          {hasGenerationDock ? (
            <Suspense fallback={<StudioGenerationDockFallback />}>
              <GenerationDock {...generationDockProps} layout="rail" />
            </Suspense>
          ) : null}
        </aside>
        <div ref={onSidePanelTarget} className="create-side-panel" />
      </div>
      <section className="create-stage studio-well" aria-label="Create canvas">
        <RecipeResultPreview
          variant="stage"
          images={stageImages}
          reference={draft.generationConfig.attachments[0]}
          onOpen={recipePageProps.openModal}
          onToggleFavorite={onToggleFavorite}
          onUseAsReference={onUseAsReference}
        />
      </section>
    </div>
  );
};
