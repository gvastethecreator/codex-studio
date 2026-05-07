import React, { useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";

import type {
  AspectRatio,
  GeneratedImage,
  GeneratedImageWithConfig,
  LogEntry,
  QueueJob,
  Workspace,
} from "../types";
import type { Job as StudioJob } from "../packages/shared/src";

import { downloadMultipleImagesAsZip, exportToJson } from "../utils/fileUtils";
import { ErrorBoundary } from "./ErrorBoundary";
import { FormatPreview } from "./FormatPreview";
import { ImageGrid } from "./ImageGrid";
import { LeftDebugPanel } from "./LeftDebugPanel";
import { QueuePanel } from "./QueuePanel";
import { RightSystemPanel } from "./RightSystemPanel";

interface StudioPageProps {
  isModalOpen: boolean;
  workspaces: Workspace[];
  mergedLogs: LogEntry[];
  batchesCount: number;
  allImages: GeneratedImage[];
  imagesWithConfig: GeneratedImageWithConfig[];
  selectedImageIds: string[];
  activeWorkspaceId: string;
  openModal: (image: GeneratedImageWithConfig) => void;
  handleSelectionChange: (id: string, selected: boolean) => void;
  handleGenerate: (
    promptOverride?: string,
    configOverrides?: Partial<GeneratedImageWithConfig["config"]>,
    options?: { force?: boolean; preventModal?: boolean },
  ) => void;
  handleAddToContext: (image: GeneratedImageWithConfig) => void;
  handleLoadRecipe: (config: GeneratedImageWithConfig["config"]) => void;
  handleDelete: (imageId: string) => void;
  handleToggleFavorite: (imageId: string) => void;
  isGenerating: boolean;
  transitioningImageId: string | null;
  activeModalImageId: string | null;
  handleSelectAll: (images: GeneratedImage[]) => void;
  handleDeselectAll: () => void;
  handleDeleteSelected: () => void;
  handleClearWorkspace: (workspaceId: string) => void;
  previewRatio: AspectRatio | null;
  generationAspectRatio: AspectRatio;
  isInteractingWithToolbar: boolean;
  isQueueOpen: boolean;
  setIsQueueOpen: React.Dispatch<React.SetStateAction<boolean>>;
  jobs: QueueJob[];
  studioJobs: StudioJob[];
  retry: (jobId: string) => void;
  cancelJob: (jobId: string) => void;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;
  isResting: boolean;
  batchesForExport: GeneratedImageWithConfig[];
  exportBatches: () => void;
  handleImportVault: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  isBackgroundEnabled: boolean;
  setBackgroundEnabled: (enabled: boolean) => void;
  activeServerJobCount: number;
}

export const StudioPage: React.FC<StudioPageProps> = ({
  isModalOpen,
  workspaces,
  mergedLogs,
  batchesCount,
  allImages,
  imagesWithConfig,
  selectedImageIds,
  activeWorkspaceId,
  openModal,
  handleSelectionChange,
  handleGenerate,
  handleAddToContext,
  handleLoadRecipe,
  handleDelete,
  handleToggleFavorite,
  isGenerating,
  transitioningImageId,
  activeModalImageId,
  handleSelectAll,
  handleDeselectAll,
  handleDeleteSelected,
  handleClearWorkspace,
  previewRatio,
  generationAspectRatio,
  isInteractingWithToolbar,
  isQueueOpen,
  setIsQueueOpen,
  jobs,
  studioJobs,
  retry,
  cancelJob,
  removeJob,
  clearCompleted,
  isResting,
  exportBatches,
  handleImportVault,
  isBackgroundEnabled,
  setBackgroundEnabled,
  activeServerJobCount,
}) => {
  const handleGridRegenerate = useCallback(
    (config: GeneratedImageWithConfig["config"]) => {
      handleGenerate(config.prompt, config, { preventModal: true });
    },
    [handleGenerate],
  );

  const handleGridSelectAll = useCallback(() => {
    handleSelectAll(allImages);
  }, [allImages, handleSelectAll]);

  const handleGridDownloadSelected = useCallback(() => {
    const selectedImages = imagesWithConfig.filter((image) => selectedImageIds.includes(image.id));
    if (selectedImages.length > 0) {
      void downloadMultipleImagesAsZip(selectedImages, `assets-${Date.now()}.zip`);
    }
  }, [imagesWithConfig, selectedImageIds]);

  const handleGridDownloadAll = useCallback(() => {
    if (imagesWithConfig.length > 0) {
      void downloadMultipleImagesAsZip(imagesWithConfig, `assets-${Date.now()}.zip`);
    }
  }, [imagesWithConfig]);

  const handleGridClearWorkspace = useCallback(() => {
    handleClearWorkspace(activeWorkspaceId);
  }, [activeWorkspaceId, handleClearWorkspace]);

  const handleToggleBackground = useCallback(() => {
    setBackgroundEnabled(!isBackgroundEnabled);
  }, [isBackgroundEnabled, setBackgroundEnabled]);

  const handleToggleQueue = useCallback(() => {
    setIsQueueOpen((previous) => !previous);
  }, [setIsQueueOpen]);

  return (
    <>
      {!isModalOpen && (
        <LeftDebugPanel
          workspaces={workspaces}
          logs={mergedLogs}
          batchesCount={batchesCount}
          imagesCount={allImages.length}
        />
      )}

      <div className="flex-1 h-full relative overflow-hidden flex flex-col">
        <div className="flex-1 relative min-h-0">
          <ErrorBoundary fallbackMessage="Failed to render the image grid.">
            <ImageGrid
              key={activeWorkspaceId}
              images={imagesWithConfig}
              selectedImageIds={selectedImageIds}
              onImageClick={openModal}
              onSelectionChange={handleSelectionChange}
              onRegenerate={handleGridRegenerate}
              onAddToContext={handleAddToContext}
              onLoadConfig={handleLoadRecipe}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              isGenerating={isGenerating || jobs.some((job) => job.status === "processing")}
              transitioningImageId={transitioningImageId}
              activeModalImageId={activeModalImageId}
              onSelectAll={handleGridSelectAll}
              onDeselectAll={handleDeselectAll}
              onDownloadSelected={handleGridDownloadSelected}
              onDownloadAll={handleGridDownloadAll}
              onDeleteSelected={handleDeleteSelected}
              onClearWorkspace={handleGridClearWorkspace}
            />
          </ErrorBoundary>
        </div>
        <FormatPreview
          ratio={previewRatio || generationAspectRatio}
          isVisible={!isModalOpen && (isInteractingWithToolbar || !!previewRatio)}
          isWorkspaceEmpty={allImages.length === 0}
        />
      </div>

      {!isModalOpen && (
        <div className="flex h-full">
          <AnimatePresence>
            {isQueueOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-full overflow-hidden"
              >
                <QueuePanel
                  jobs={jobs}
                  serverJobs={studioJobs}
                  onRetry={retry}
                  onCancel={cancelJob}
                  onRemove={removeJob}
                  onClearCompleted={clearCompleted}
                  isResting={isResting}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <RightSystemPanel
            onImportVault={handleImportVault}
            onExportVault={exportBatches}
            isBackgroundEnabled={isBackgroundEnabled}
            onToggleBackground={handleToggleBackground}
            isQueueOpen={isQueueOpen}
            onToggleQueue={handleToggleQueue}
            queueCount={jobs.length + activeServerJobCount}
          />
        </div>
      )}
    </>
  );
};
