import React, { Suspense } from 'react';

import { useStudioShell } from '../hooks/useStudioShell';

import { HeaderToolbar } from './HeaderToolbar';
import { StudioOperationsRail } from './studio/StudioOperationsRail';
import { StudioGenerationDock } from './shell/StudioGenerationDock';
import { StudioViewport } from './shell/StudioViewport';
import { ErrorBoundary } from './ErrorBoundary';
import ToastContainer from './ToastContainer';
import { LazySurfaceFallback } from './ui/LazySurfaceFallback';

const AppOverlays = React.lazy(() =>
  import('./AppOverlays').then((m) => ({ default: m.AppOverlays })),
);

interface AppContentProps {}

export const AppContent: React.FC<AppContentProps> = () => {
  const shell = useStudioShell();

  return (
    <div
      className="fixed inset-0 text-white font-sans flex flex-col selection:bg-accent-500/35 selection:text-white overflow-hidden"
      data-ui-chrome-suppressed={shell.root.isUiChromeSuppressed ? 'true' : 'false'}
      onDragOver={shell.root.onDragOver}
      onDragLeave={shell.root.onDragLeave}
      onDrop={shell.root.onDrop}
    >
      <ToastContainer toasts={shell.toasts.items} onDismiss={shell.toasts.onDismiss} />

      {shell.headerToolbar.isVisible && <HeaderToolbar {...shell.headerToolbar.props} />}

      <div
        className="relative z-10 flex w-full flex-1 min-h-0 overflow-hidden appearance-none border-none p-0 m-0 bg-transparent"
        onPointerDownCapture={shell.root.onMainClick}
      >
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <StudioViewport {...shell.viewport} />
        </div>
        <StudioOperationsRail {...shell.viewport.studioPageController.operations} />
      </div>

      <StudioGenerationDock {...shell.generationDock} />

      <ErrorBoundary fallbackMessage="Could not load studio overlays.">
        <Suspense
          fallback={
            <LazySurfaceFallback
              label="Loading overlays"
              className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-black/20 text-zinc-400"
            />
          }
        >
          <AppOverlays controller={shell.overlays} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
