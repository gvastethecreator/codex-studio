import React, { Suspense, useState } from 'react';

import { useStudioShell } from '../hooks/useStudioShell';
import { hasMountedStudioOverlay } from '../lib/studioOverlayVisibility';

import { useGenerationDraft } from '../contexts/GenerationContext';
import { RecipeResultPreview } from './recipes/RecipeResultPreview';
import { HeaderToolbar } from './HeaderToolbar';
import { StudioOperationsRail } from './studio/StudioOperationsRail';
import { StudioViewport } from './shell/StudioViewport';
import { ErrorBoundary } from './ErrorBoundary';
import { RecipeWorkbenchContext } from './recipes/RecipeWorkbenchContext';
import ToastContainer from './ToastContainer';

const AppOverlays = React.lazy(() =>
  import('./AppOverlays').then((m) => ({ default: m.AppOverlays })),
);
const StudioGenerationDock = React.lazy(() =>
  import('./shell/StudioGenerationDock').then((module) => ({
    default: module.StudioGenerationDock,
  })),
);

const StudioFirstReadyScrim: React.FC = () => (
  <div
    className="pointer-events-none fixed inset-0 z-[45] flex items-center justify-center bg-zinc-950"
    aria-hidden="true"
  >
    <div className="grid w-full max-w-5xl gap-8 px-6 sm:grid-cols-[minmax(0,0.9fr)_minmax(20rem,0.7fr)]">
      <div className="space-y-5">
        <div className="h-8 w-64 rounded-lg bg-white/[0.055]" />
        <div className="h-4 w-96 max-w-full rounded bg-white/[0.04]" />
        <div className="grid max-w-2xl grid-cols-[7rem_minmax(0,1fr)] gap-4">
          <div className="aspect-[2/3] rounded-xl bg-white/[0.05]" />
          <div className="space-y-3 rounded-xl bg-black/30 p-4">
            <div className="h-5 w-40 rounded bg-white/[0.06]" />
            <div className="h-3 w-full rounded bg-white/[0.04]" />
            <div className="h-3 w-5/6 rounded bg-white/[0.035]" />
            <div className="h-3 w-2/3 rounded bg-white/[0.03]" />
          </div>
        </div>
      </div>
      <div className="hidden space-y-3 sm:block">
        <div className="h-4 w-52 rounded bg-white/[0.055]" />
        <div className="h-16 rounded-xl bg-white/[0.04]" />
        <div className="h-16 rounded-xl bg-white/[0.035]" />
        <div className="h-28 rounded-xl bg-white/[0.03]" />
      </div>
    </div>
  </div>
);

const StudioGenerationDockFallback: React.FC = () => (
  <div
    className="h-[106px] w-full shrink-0 bg-black/80 sm:h-[56px]"
    data-generation-dock-loading="true"
    aria-hidden="true"
  />
);

export const AppContent: React.FC = () => {
  const shell = useStudioShell();
  const draft = useGenerationDraft();
  const isCreate = shell.viewport.routeView === 'recipes';
  const [actionTarget, setActionTarget] = useState<HTMLElement | null>(null);
  const [controlsTarget, setControlsTarget] = useState<HTMLElement | null>(null);
  const [workbenchTab, setWorkbenchTab] = useState<'result' | 'configure'>('result');
  const isRecipe = shell.viewport.routeView === 'recipe';
  const hasGenerationDock =
    !shell.generationDock.isModalOpen &&
    !shell.generationDock.isUiChromeSuppressed &&
    (isCreate || isRecipe);
  const hasActiveOverlay = hasMountedStudioOverlay(shell.overlays);

  return (
    <RecipeWorkbenchContext value={{ controls: controlsTarget, action: actionTarget }}>
      <div
        className="studio-experience fixed inset-0 text-white font-sans flex flex-col selection:bg-accent-500/35 selection:text-white overflow-hidden"
        data-ui-chrome-suppressed={shell.root.isUiChromeSuppressed ? 'true' : 'false'}
        onDragOver={shell.root.onDragOver}
        onDragLeave={shell.root.onDragLeave}
        onDrop={shell.root.onDrop}
      >
        <ToastContainer />

        {shell.headerToolbar.isVisible && <HeaderToolbar {...shell.headerToolbar.props} />}

        {shell.viewport.routeView === 'studio' && (
          <div className="flex items-center gap-3 px-4 py-2">
            <label className="flex flex-1 items-center gap-3 text-sm text-zinc-300">
              Search library
              <input
                type="search"
                aria-label="Search library"
                placeholder="Search all images in this workspace"
                value={shell.librarySearch.query}
                onChange={(event) => shell.librarySearch.setQuery(event.target.value)}
                className="h-10 w-full max-w-xl rounded-lg bg-white/5 px-3 text-white"
              />
            </label>
          </div>
        )}
        {isRecipe && (
          <div className="workbench-tabs" role="tablist" aria-label="Recipe workspace">
            <button
              role="tab"
              aria-selected={workbenchTab === 'result'}
              onClick={() => setWorkbenchTab('result')}
            >
              Result
            </button>
            <button
              role="tab"
              data-configure-tab
              aria-selected={workbenchTab === 'configure'}
              onClick={() => setWorkbenchTab('configure')}
            >
              Configure
            </button>
          </div>
        )}
        <div
          data-workbench={isRecipe ? 'recipe' : isCreate ? 'create' : 'library'}
          data-workbench-tab={workbenchTab}
          className="studio-workbench relative z-10 flex w-full flex-1 min-h-0 overflow-hidden appearance-none border-none p-0 m-0 bg-transparent"
          onPointerDownCapture={shell.root.onMainClick}
        >
          {isCreate ? (
            <div className="create-workspace">
              <section className="create-studio" aria-label="Text and image workspace">
                <header className="px-5 pt-4 pb-2">
                  <h1 className="text-xl font-semibold">Create an image</h1>
                  <p className="mt-1 text-sm text-zinc-400">
                    Start with a prompt, or add an image as a reference.
                  </p>
                </header>
                <div className="min-h-0 flex-1 overflow-hidden">
                  <RecipeResultPreview
                    images={shell.viewport.recipePageProps.imagesWithConfig.filter(
                      (image) => !image.config.recipeId,
                    )}
                    reference={draft.generationConfig.attachments[0]}
                    onOpen={shell.viewport.recipePageProps.openModal}
                  />
                </div>
                {hasGenerationDock && (
                  <Suspense fallback={<StudioGenerationDockFallback />}>
                    <StudioGenerationDock {...shell.generationDock} />
                  </Suspense>
                )}
              </section>
              <aside className="create-recipes" aria-label="Recipes">
                <StudioViewport {...shell.viewport} />
              </aside>
            </div>
          ) : (
            <div className="workbench-canvas relative min-w-0 flex-1 overflow-hidden">
              <StudioViewport {...shell.viewport} />
            </div>
          )}
          {isRecipe && (
            <aside className="workbench-config custom-scrollbar" aria-label="Recipe configuration">
              <div ref={setControlsTarget} />
              <div className="recipe-primary-action" ref={setActionTarget} />
              {hasGenerationDock && (
                <Suspense fallback={<StudioGenerationDockFallback />}>
                  <StudioGenerationDock {...shell.generationDock} />
                </Suspense>
              )}
            </aside>
          )}
          <StudioOperationsRail
            {...shell.viewport.studioPageController.operations}
            hasGenerationDock={hasGenerationDock}
          />
        </div>

        {hasGenerationDock && !isRecipe && !isCreate ? (
          <Suspense fallback={<StudioGenerationDockFallback />}>
            <StudioGenerationDock {...shell.generationDock} />
          </Suspense>
        ) : null}

        {shell.overlays.systemOverlays.flags.isOnboardingOpen ? <StudioFirstReadyScrim /> : null}

        {hasActiveOverlay ? (
          <ErrorBoundary fallbackMessage="Could not load studio overlays.">
            <Suspense fallback={null}>
              <AppOverlays controller={shell.overlays} />
            </Suspense>
          </ErrorBoundary>
        ) : null}
      </div>
    </RecipeWorkbenchContext>
  );
};
