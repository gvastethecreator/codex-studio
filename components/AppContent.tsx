import React, { Suspense } from 'react';

import { useStudioShell } from '../hooks/useStudioShell';
import { hasMountedStudioOverlay } from '../lib/studioOverlayVisibility';

import { HeaderToolbar } from './HeaderToolbar';
import { StudioOperationsRail } from './studio/StudioOperationsRail';
import { StudioViewport } from './shell/StudioViewport';
import { ErrorBoundary } from './ErrorBoundary';
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
  const hasGenerationDock =
    !shell.generationDock.isModalOpen &&
    !shell.generationDock.isUiChromeSuppressed &&
    (shell.generationDock.currentView === 'studio' || !!shell.generationDock.activeRecipe);
  const hasActiveOverlay = hasMountedStudioOverlay(shell.overlays);

  return (
    <div
      className="fixed inset-0 text-white font-sans flex flex-col selection:bg-accent-500/35 selection:text-white overflow-hidden"
      data-ui-chrome-suppressed={shell.root.isUiChromeSuppressed ? 'true' : 'false'}
      onDragOver={shell.root.onDragOver}
      onDragLeave={shell.root.onDragLeave}
      onDrop={shell.root.onDrop}
    >
      <ToastContainer />

      {shell.headerToolbar.isVisible && <HeaderToolbar {...shell.headerToolbar.props} />}

      <div
        className="relative z-10 flex w-full flex-1 min-h-0 overflow-hidden appearance-none border-none p-0 m-0 bg-transparent"
        onPointerDownCapture={shell.root.onMainClick}
      >
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <StudioViewport {...shell.viewport} />
        </div>
        <StudioOperationsRail
          {...shell.viewport.studioPageController.operations}
          hasGenerationDock={hasGenerationDock}
        />
      </div>

      {hasGenerationDock ? (
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
  );
};
