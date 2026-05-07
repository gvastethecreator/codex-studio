import React from 'react';

import type { Attachment, GeneratedImageWithConfig, GenerationBatch, ImageGenerationConfig, LogEntry, Workspace } from '../types';
import { exportToJson } from '../utils/fileUtils';
import { DashboardModal } from './DashboardModal';
import { DebugPanel } from './DebugPanel';
import ImageCarousel from './ImageCarousel';
import { ImageEditorModal } from './ImageEditorModal';
import { LimitReachedModal } from './LimitReachedModal';
import { OnboardingModal } from './OnboardingModal';
import { TrashModal } from './TrashModal';

interface AppOverlaysProps {
  modalImage: GeneratedImageWithConfig | null;
  imagesWithConfig: GeneratedImageWithConfig[];
  activeGenerationConfig: ImageGenerationConfig | null;
  closeModal: () => void;
  handleDelete: (imageId: string) => void;
  handleGenerate: (promptOverride?: string, configOverrides?: Partial<ImageGenerationConfig>, options?: { force?: boolean; preventModal?: boolean }) => void;
  handleAddToContext: (image: GeneratedImageWithConfig) => void;
  handleLoadRecipe: (config: ImageGenerationConfig) => void;
  handleToggleFavorite: (imageId: string) => void;
  setActiveCarouselId: (imageId: string) => void;
  isEditorOpen: boolean;
  closeEditor: () => void;
  imageToEdit: Attachment | null;
  handleExecuteEdit: (original: Attachment, mask: string, prompt: string) => Promise<void>;
  isEditingImage: boolean;
  isDebugPanelOpen: boolean;
  toggleDebugPanel: () => void;
  mergedLogs: LogEntry[];
  isDashboardModalOpen: boolean;
  closeDashboard: () => void;
  batches: GenerationBatch[];
  workspaces: Workspace[];
  handleImportVault: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeepScan: () => void | Promise<void>;
  apiBase: string;
  onboardingError: string | null;
  onboardingHealth: any;
  isCheckingOnboarding: boolean;
  isDesktopRuntime: boolean;
  isOnboardingOpen: boolean;
  isOnboardingReady: boolean;
  isStartingAppServer: boolean;
  closeOnboarding: () => void;
  completeOnboarding: () => void;
  refreshOnboardingHealth: () => void;
  ensureAppServer: () => void;
  isTrashModalOpen: boolean;
  closeTrash: () => void;
  trash: GenerationBatch[];
  restoreFromTrash: (batchId: string) => void;
  restoreAllFromTrash: () => void;
  emptyTrash: () => void;
  isLimitModalOpen: boolean;
  handleDismissLimitModal: () => void;
  handleDownloadAndClear: () => void | Promise<void>;
}

export const AppOverlays: React.FC<AppOverlaysProps> = ({
  modalImage,
  imagesWithConfig,
  activeGenerationConfig,
  closeModal,
  handleDelete,
  handleGenerate,
  handleAddToContext,
  handleLoadRecipe,
  handleToggleFavorite,
  setActiveCarouselId,
  isEditorOpen,
  closeEditor,
  imageToEdit,
  handleExecuteEdit,
  isEditingImage,
  isDebugPanelOpen,
  toggleDebugPanel,
  mergedLogs,
  isDashboardModalOpen,
  closeDashboard,
  batches,
  workspaces,
  handleImportVault,
  handleDeepScan,
  apiBase,
  onboardingError,
  onboardingHealth,
  isCheckingOnboarding,
  isDesktopRuntime,
  isOnboardingOpen,
  isOnboardingReady,
  isStartingAppServer,
  closeOnboarding,
  completeOnboarding,
  refreshOnboardingHealth,
  ensureAppServer,
  isTrashModalOpen,
  closeTrash,
  trash,
  restoreFromTrash,
  restoreAllFromTrash,
  emptyTrash,
  isLimitModalOpen,
  handleDismissLimitModal,
  handleDownloadAndClear,
}) => {
  return (
    <>
      {modalImage && (
        <ImageCarousel
          activeImage={modalImage}
          allImages={imagesWithConfig}
          activeGenerationConfig={activeGenerationConfig}
          onClose={closeModal}
          onDelete={handleDelete}
          onRegenerate={(config) => handleGenerate(config.prompt, config, { preventModal: true })}
          onAddToContext={(image) => {
            handleAddToContext(image);
            closeModal();
          }}
          onLoadConfig={(config) => {
            handleLoadRecipe(config);
            closeModal();
          }}
          onToggleFavorite={handleToggleFavorite}
          onActiveImageChange={setActiveCarouselId}
          transitionName="master-canvas"
        />
      )}
      <ImageEditorModal
        isOpen={isEditorOpen}
        onClose={closeEditor}
        image={imageToEdit}
        onGenerate={handleExecuteEdit}
        isGenerating={isEditingImage}
      />
      <DebugPanel isOpen={isDebugPanelOpen} onClose={toggleDebugPanel} logs={mergedLogs} appState={{}} />
      <DashboardModal
        isOpen={isDashboardModalOpen}
        onClose={closeDashboard}
        batches={batches}
        workspaces={workspaces}
        onImportVault={handleImportVault}
        onExportVault={() => exportToJson(batches, `vault-export-${Date.now()}.json`)}
        onDeepScan={handleDeepScan}
      />
      <OnboardingModal
        apiBase={apiBase}
        error={onboardingError}
        health={onboardingHealth}
        isChecking={isCheckingOnboarding}
        isDesktopRuntime={isDesktopRuntime}
        isOpen={isOnboardingOpen}
        isReady={isOnboardingReady}
        isStartingAppServer={isStartingAppServer}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
        onRefresh={refreshOnboardingHealth}
        onStartAppServer={ensureAppServer}
      />
      <TrashModal
        isOpen={isTrashModalOpen}
        onClose={closeTrash}
        trash={trash}
        onRestore={restoreFromTrash}
        onRestoreAll={restoreAllFromTrash}
        onEmpty={emptyTrash}
      />
      <LimitReachedModal
        isOpen={isLimitModalOpen}
        onClose={handleDismissLimitModal}
        onDownloadAndClear={() => void handleDownloadAndClear()}
        batchCount={batches.length}
      />
    </>
  );
};
