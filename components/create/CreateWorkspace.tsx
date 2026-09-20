import React, { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';

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
  action?: React.ReactNode;
  stage?: React.ReactNode;
  images?: GeneratedImageWithConfig[];
  routeKey?: string;
  workspaceTab?: 'configure' | 'preview';
  onNarrowChange?: (narrow: boolean) => void;
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
  action,
  stage,
  images,
  routeKey = 'recipes-list',
  workspaceTab = 'configure',
  onNarrowChange,
  onSidePanelTarget,
}) => {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<'wide' | 'split' | 'single'>('split');
  const [catalogPane, setCatalogPane] = useState(true);
  useLayoutEffect(() => {
    const element = workspaceRef.current;
    if (!element) return;
    const resize = () => {
      const width = element.clientWidth;
      setLayout(width >= 1128 ? 'wide' : width >= 800 ? 'split' : 'single');
      onNarrowChange?.(width < 800);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const panel = element.querySelector('.create-side-panel');
    const contentObserver = new MutationObserver(() => {
      if (panel?.childElementCount) setCatalogPane(true);
    });
    if (panel) contentObserver.observe(panel, { childList: true });
    return () => {
      observer.disconnect();
      contentObserver.disconnect();
    };
  }, [onNarrowChange]);
  const stageImages = images ?? recipePageProps.imagesWithConfig;

  useEffect(() => {
    const plan = buildRoutePreloadPlan({ routeView: 'recipes', activeRecipe: null });
    const timeoutId = window.setTimeout(() => preloadStudioViewportPlan(plan), plan.delayMs);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div
      ref={workspaceRef}
      className="create-workspace"
      data-route-key={routeKey}
      data-layout={layout}
      data-catalog-pane={catalogPane}
      data-workspace-view={workspaceTab}
    >
      <div className="create-tray-stack">
        <div className="create-pane-switch" role="group" aria-label="Configure panel">
          <button type="button" aria-pressed={!catalogPane} onClick={() => setCatalogPane(false)}>
            Configure
          </button>
          <button type="button" aria-pressed={catalogPane} onClick={() => setCatalogPane(true)}>
            Catalog
          </button>
        </div>
        <aside
          className={`create-tools studio-surface${tools ? ' workbench-config' : ''}`}
          aria-label="Create tools"
        >
          {hasGenerationDock ? (
            <Suspense fallback={<StudioGenerationDockFallback />}>
              <GenerationDock
                {...generationDockProps}
                layout="rail"
                railTools={tools}
                railAction={action}
              />
            </Suspense>
          ) : (
            tools
          )}
        </aside>
        <div ref={onSidePanelTarget} className="create-side-panel" />
      </div>
      <section className="create-stage studio-well" aria-label="Create canvas">
        {stage ?? (
          <CreateResults
            recipePageProps={recipePageProps}
            images={stageImages}
            onToggleFavorite={onToggleFavorite}
            onUseAsReference={onUseAsReference}
          />
        )}
      </section>
    </div>
  );
};

export function CreateResults({
  recipePageProps,
  images,
  onToggleFavorite,
  onUseAsReference,
  title,
}: Pick<
  CreateWorkspaceProps,
  'recipePageProps' | 'images' | 'onToggleFavorite' | 'onUseAsReference'
> & { title?: string }) {
  const draft = useGenerationDraft();
  return (
    <RecipeResultPreview
      variant="stage"
      images={images ?? recipePageProps.imagesWithConfig}
      reference={draft.generationConfig.attachments[0]}
      onOpen={recipePageProps.openModal}
      onToggleFavorite={onToggleFavorite}
      onUseAsReference={onUseAsReference}
      emptyTitle={title ? `${title} results` : undefined}
      isGenerating={recipePageProps.isGenerating}
    />
  );
}
