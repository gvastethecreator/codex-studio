import React, { Suspense } from 'react';

import { useStudioShell } from '../hooks/useStudioShell';

import { HeaderToolbar } from './HeaderToolbar';
import { StudioOperationsRail } from './studio/StudioOperationsRail';
import { StudioGenerationDock } from './shell/StudioGenerationDock';
import { StudioViewport } from './shell/StudioViewport';
import ToastContainer from './ToastContainer';

const LiquidBlackBackground = React.lazy(() => import('./LiquidBlackBackground'));

const AppOverlays = React.lazy(() =>
  import('./AppOverlays').then((m) => ({ default: m.AppOverlays })),
);

interface AppContentProps { }

export const AppContent: React.FC<AppContentProps> = () => {
  const shell = useStudioShell();

  return (
    <div
      className="fixed inset-0 text-white font-sans flex flex-col selection:bg-accent-500/35 selection:text-white overflow-hidden"
      onDragOver={shell.root.onDragOver}
      onDragLeave={shell.root.onDragLeave}
      onDrop={shell.root.onDrop}
    >
      {shell.background && (
        <Suspense fallback={null}>
          <LiquidBlackBackground
            isGenerating={shell.background.isGenerating}
            activeModel={shell.background.activeModel}
            config={shell.background.config}
          />
        </Suspense>
      )}
      <ToastContainer toasts={shell.toasts.items} onDismiss={shell.toasts.onDismiss} />

      {shell.headerToolbar.isVisible && <HeaderToolbar {...shell.headerToolbar.props} />}

      <main
        className="relative z-10 flex w-full flex-1 min-h-0 overflow-hidden"
        onClick={shell.root.onMainClick}
      >
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <StudioViewport {...shell.viewport} />
        </div>
        <StudioOperationsRail {...shell.viewport.studioPageController.operations} />
      </main>

      <StudioGenerationDock {...shell.generationDock} />

      <Suspense fallback={null}>
        <AppOverlays controller={shell.overlays} />
      </Suspense>
    </div>
  );
};
