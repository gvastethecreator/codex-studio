import React, { Suspense, useLayoutEffect, useState } from 'react';

import { useStudioShell } from '../hooks/useStudioShell';
import { hasMountedStudioOverlay } from '../lib/studioOverlayVisibility';

import { HeaderToolbar } from './HeaderToolbar';
import { SupportProjectPage } from './SupportProjectPage';
import { StudioOperationsRail } from './studio/StudioOperationsRail';
import { StudioViewport } from './shell/StudioViewport';
import { ErrorBoundary } from './ErrorBoundary';
import { LazySurfaceFallback } from './ui/LazySurfaceFallback';
import { RecipeWorkbenchContext, type CanvasCompareChrome } from './recipes/RecipeWorkbenchContext';
import ToastContainer from './ToastContainer';
import { materializeCatalogEntryImageWithConfig } from '../lib/studioCatalogImageAdapter';
import { ControlTooltips } from './Tooltip';
import { CreateWorkspace, CreateResults } from './create/CreateWorkspace';
import { getRecipeShellTitle } from '../lib/recipeShellMetadata';
import { StudioStatusBar } from './shell/StudioStatusBar';
import {
  applyWorkbenchAmbientToDocument,
  workbenchAmbientRootProps,
} from '../lib/workbenchAmbient';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

const AppOverlays = React.lazy(() =>
  import('./AppOverlays').then((m) => ({ default: m.AppOverlays })),
);
const StudioGenerationDock = React.lazy(() =>
  import('./shell/StudioGenerationDock').then((module) => ({
    default: module.StudioGenerationDock,
  })),
);

const StudioGenerationDockFallback: React.FC = () => (
  <div
    className="h-[106px] w-full shrink-0 bg-[color:var(--wb-panel)] sm:h-[56px]"
    data-generation-dock-loading="true"
    aria-hidden="true"
  />
);

export const AppContent: React.FC = () => {
  const shell = useStudioShell();
  const { appearance } = useTheme();
  const isCreate = shell.viewport.routeView === 'recipes';
  const isRecipe = shell.viewport.routeView === 'recipe';
  const isWorkspace = isCreate || isRecipe;
  const [actionTarget, setActionTarget] = useState<HTMLElement | null>(null);
  const [controlsTarget, setControlsTarget] = useState<HTMLElement | null>(null);
  const [overlayTarget, setOverlayTarget] = useState<HTMLElement | null>(null);
  const [sidePanelTarget, setSidePanelTarget] = useState<HTMLElement | null>(null);
  const [isNarrowWorkbench, setIsNarrowWorkbench] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<'configure' | 'preview'>('configure');
  const [compare, setCompare] = useState<CanvasCompareChrome>(null);
  const ambient = workbenchAmbientRootProps(appearance);

  useLayoutEffect(() => {
    applyWorkbenchAmbientToDocument(document, appearance);
  }, [appearance]);
  const hasGenerationDock =
    !shell.generationDock.isModalOpen && !shell.generationDock.isUiChromeSuppressed && isWorkspace;
  const activeRecipe = shell.viewport.activeRecipe;
  const workflowImages = shell.viewport.recipePageProps.imagesWithConfig;
  const stageImages = React.useMemo(
    () => shell.history.entries.map(materializeCatalogEntryImageWithConfig),
    [shell.history.entries],
  );
  const hasActiveOverlay = hasMountedStudioOverlay(shell.overlays);

  return (
    <RecipeWorkbenchContext
      value={{
        controls: controlsTarget,
        action: actionTarget,
        overlay: overlayTarget,
        sidePanel: sidePanelTarget,
        compare,
        setCompare,
        history: isWorkspace ? shell.history : undefined,
        latestResultId: workflowImages.find(
          (image) => (image.config.recipeId ?? null) === (activeRecipe ?? null),
        )?.id,
        results: (
          <CreateResults
            key={`${shell.headerToolbar.props.activeWorkspaceId}:${activeRecipe ?? 'default'}`}
            title={activeRecipe ? getRecipeShellTitle(activeRecipe) : undefined}
            recipePageProps={shell.viewport.recipePageProps}
            images={stageImages}
            history={shell.history}
            selectedId={shell.historySelection.id}
            onSelectId={shell.historySelection.setId}
            onToggleFavorite={shell.viewport.studioPageController.grid.handleToggleFavorite}
            onUseAsReference={shell.viewport.studioPageController.grid.handleAddToContext}
          />
        ),
      }}
    >
      <div
        {...ambient}
        className={cn(
          'studio-experience fixed inset-0 font-sans flex flex-col selection:bg-accent-500/35 overflow-hidden',
          ambient.className,
        )}
        data-ui-chrome-suppressed={shell.root.isUiChromeSuppressed ? 'true' : 'false'}
        onDragOver={shell.root.onDragOver}
        onDragLeave={shell.root.onDragLeave}
        onDrop={shell.root.onDrop}
      >
        <ToastContainer />
        <ControlTooltips />

        {shell.headerToolbar.isVisible && <HeaderToolbar {...shell.headerToolbar.props} />}
        <SupportProjectPage isOpen={shell.support.isOpen} onClose={shell.support.close} />

        {isWorkspace && (
          <div
            className="workbench-tabs"
            data-narrow={isNarrowWorkbench}
            role="tablist"
            aria-label={isRecipe ? 'Recipe workspace' : 'Create workspace'}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const next =
                event.key === 'Home'
                  ? 'configure'
                  : event.key === 'End'
                    ? 'preview'
                    : workspaceTab === 'configure'
                      ? 'preview'
                      : 'configure';
              setWorkspaceTab(next);
              event.currentTarget
                .querySelector<HTMLButtonElement>(`[data-workspace-tab="${next}"]`)
                ?.focus();
            }}
          >
            <button
              type="button"
              role="tab"
              data-configure-tab
              data-workspace-tab="configure"
              tabIndex={workspaceTab === 'configure' ? 0 : -1}
              aria-selected={workspaceTab === 'configure'}
              onClick={() => setWorkspaceTab('configure')}
            >
              Configure
            </button>
            <button
              type="button"
              role="tab"
              data-workspace-tab="preview"
              tabIndex={workspaceTab === 'preview' ? 0 : -1}
              aria-selected={workspaceTab === 'preview'}
              onClick={() => setWorkspaceTab('preview')}
            >
              Preview
            </button>
          </div>
        )}
        <div
          data-workbench={isRecipe ? 'recipe' : isCreate ? 'create' : 'library'}
          data-workbench-tab={isWorkspace ? workspaceTab : undefined}
          data-jobs-open={shell.headerToolbar.props.isQueueOpen ? 'true' : undefined}
          className="studio-workbench relative z-10 flex w-full flex-1 min-h-0 overflow-hidden appearance-none border-none p-0 m-0 bg-transparent"
          onPointerDownCapture={shell.root.onMainClick}
        >
          {isWorkspace ? (
            <CreateWorkspace
              workspaceTab={workspaceTab}
              onNarrowChange={setIsNarrowWorkbench}
              recipePageProps={shell.viewport.recipePageProps}
              hasGenerationDock={hasGenerationDock}
              GenerationDock={StudioGenerationDock}
              generationDockProps={shell.generationDock}
              onToggleFavorite={shell.viewport.studioPageController.grid.handleToggleFavorite}
              onUseAsReference={shell.viewport.studioPageController.grid.handleAddToContext}
              images={stageImages}
              history={shell.history}
              selectedId={shell.historySelection.id}
              onSelectId={shell.historySelection.setId}
              routeKey={isRecipe ? `recipe-${activeRecipe ?? 'active'}` : 'recipes-list'}
              onSidePanelTarget={setSidePanelTarget}
              stage={<StudioViewport {...shell.viewport} />}
              action={<div className="recipe-primary-action" ref={setActionTarget} />}
              tools={<div ref={setControlsTarget} className="create-recipe-controls" />}
            />
          ) : (
            <div className="workbench-canvas relative min-w-0 flex-1 overflow-hidden">
              <StudioViewport {...shell.viewport} />
            </div>
          )}
          <StudioOperationsRail
            {...shell.viewport.studioPageController.operations}
            hasGenerationDock={hasGenerationDock}
          />
          <div ref={setOverlayTarget} className="studio-recipe-overlay" />
        </div>

        {hasGenerationDock && !isRecipe && !isCreate ? (
          <Suspense fallback={<StudioGenerationDockFallback />}>
            <StudioGenerationDock {...shell.generationDock} />
          </Suspense>
        ) : null}

        {shell.headerToolbar.isVisible ? (
          <StudioStatusBar
            usage={shell.headerToolbar.props.usage}
            commandCenter={shell.headerToolbar.props.commandCenter}
            imageHistory={isWorkspace ? shell.history : undefined}
            isQueueOpen={shell.headerToolbar.props.isQueueOpen}
            onToggleQueue={shell.headerToolbar.props.onToggleQueue}
            onOpenDashboard={shell.headerToolbar.props.onOpenDashboard}
            onOpenOnboarding={shell.headerToolbar.props.onOpenOnboarding}
          />
        ) : null}

        {hasActiveOverlay ? (
          <ErrorBoundary
            fallbackMessage="Could not load studio overlays. Your workspace is still available."
            onDismiss={() => {
              const { imageOverlays, systemOverlays, workspaceOverlays, confirmationOverlay } =
                shell.overlays;
              imageOverlays.closeModal();
              imageOverlays.closeEditor();
              systemOverlays.closeDebugPanel();
              systemOverlays.closeChatPanel();
              systemOverlays.closeDashboard();
              systemOverlays.closeOnboarding();
              systemOverlays.settingsModule.close();
              workspaceOverlays.closeTrash();
              confirmationOverlay.closeConfirmation();
            }}
          >
            <Suspense
              fallback={
                <LazySurfaceFallback
                  label="Loading studio controls"
                  className="pointer-events-none fixed inset-0 z-50 grid place-items-center studio-scrim"
                />
              }
            >
              <AppOverlays controller={shell.overlays} />
            </Suspense>
          </ErrorBoundary>
        ) : null}
      </div>
    </RecipeWorkbenchContext>
  );
};
