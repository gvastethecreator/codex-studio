import React from 'react';

import { useStudioShell } from '../hooks/useStudioShell';

import { AppOverlays } from './AppOverlays';
import { HeaderToolbar } from './HeaderToolbar';
import LiquidBlackBackground from './LiquidBlackBackground';
import { StudioGenerationDock } from './shell/StudioGenerationDock';
import { StudioViewport } from './shell/StudioViewport';
import ToastContainer from './ToastContainer';

interface AppContentProps {}

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
        <LiquidBlackBackground
          isGenerating={shell.background.isGenerating}
          activeModel={shell.background.activeModel}
          config={shell.background.config}
        />
      )}
      <ToastContainer toasts={shell.toasts.items} onDismiss={shell.toasts.onDismiss} />

      {shell.headerToolbar.isVisible && <HeaderToolbar {...shell.headerToolbar.props} />}

      <main
        className="flex-1 relative overflow-hidden z-10 w-full min-h-0"
        onClick={shell.root.onMainClick}
      >
        <StudioViewport {...shell.viewport} />
      </main>

      <StudioGenerationDock {...shell.generationDock} />

      <AppOverlays controller={shell.overlays} />
    </div>
  );
};
