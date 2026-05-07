import React from "react";

import type { StudioDiagnosticsSnapshot } from '../lib/studioDiagnostics';
import type {
  AspectRatio,
  GeneratedImage,
  GeneratedImageWithConfig,
  LogEntry,
  QueueJob,
  Workspace,
} from "../types";
import type { Job as StudioJob } from "../packages/shared/src";

import { LeftDebugPanel } from "./LeftDebugPanel";
import { StudioGridSurface } from "./studio/StudioGridSurface";
import { StudioOperationsRail } from "./studio/StudioOperationsRail";

export interface StudioPageProps {
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
  selectedStudioJobId: string | null;
  retry: (jobId: string) => void;
  cancelJob: (jobId: string) => void;
  cancelPersistentJob: (jobId: string) => void;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;
  isResting: boolean;
  exportBatches: () => void;
  handleImportVault: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  isBackgroundEnabled: boolean;
  setBackgroundEnabled: (enabled: boolean) => void;
  activeServerJobCount: number;
  onInspectJob: (jobId: string) => void;
  diagnostics: StudioDiagnosticsSnapshot;
  onResetStudio: () => void | Promise<void>;
  isResettingStudio: boolean;
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
  selectedStudioJobId,
  retry,
  cancelJob,
  cancelPersistentJob,
  removeJob,
  clearCompleted,
  isResting,
  exportBatches,
  handleImportVault,
  isBackgroundEnabled,
  setBackgroundEnabled,
  activeServerJobCount,
  onInspectJob,
  diagnostics,
  onResetStudio,
  isResettingStudio,
}) => {
  const hasProcessingJobs = jobs.some((job) => job.status === "processing");

  return (
    <>
      {!isModalOpen && (
        <LeftDebugPanel
          workspaces={workspaces}
          logs={mergedLogs}
          studioJobs={studioJobs}
          batchesCount={batchesCount}
          imagesCount={allImages.length}
          onInspectJob={onInspectJob}
          selectedJobId={selectedStudioJobId}
        />
      )}

      <StudioGridSurface
        isModalOpen={isModalOpen}
        activeWorkspaceId={activeWorkspaceId}
        allImages={allImages}
        imagesWithConfig={imagesWithConfig}
        selectedImageIds={selectedImageIds}
        openModal={openModal}
        handleSelectionChange={handleSelectionChange}
        handleGenerate={handleGenerate}
        handleAddToContext={handleAddToContext}
        handleLoadRecipe={handleLoadRecipe}
        handleDelete={handleDelete}
        handleToggleFavorite={handleToggleFavorite}
        isGenerating={isGenerating}
        hasProcessingJobs={hasProcessingJobs}
        transitioningImageId={transitioningImageId}
        activeModalImageId={activeModalImageId}
        handleSelectAll={handleSelectAll}
        handleDeselectAll={handleDeselectAll}
        handleDeleteSelected={handleDeleteSelected}
        handleClearWorkspace={handleClearWorkspace}
        previewRatio={previewRatio}
        generationAspectRatio={generationAspectRatio}
        isInteractingWithToolbar={isInteractingWithToolbar}
      />

      <StudioOperationsRail
        isModalOpen={isModalOpen}
        isQueueOpen={isQueueOpen}
        setIsQueueOpen={setIsQueueOpen}
        jobs={jobs}
        studioJobs={studioJobs}
        selectedStudioJobId={selectedStudioJobId}
        retry={retry}
        cancelJob={cancelJob}
        cancelPersistentJob={cancelPersistentJob}
        removeJob={removeJob}
        clearCompleted={clearCompleted}
        isResting={isResting}
        exportBatches={exportBatches}
        handleImportVault={handleImportVault}
        isBackgroundEnabled={isBackgroundEnabled}
        setBackgroundEnabled={setBackgroundEnabled}
        activeServerJobCount={activeServerJobCount}
        onInspectJob={onInspectJob}
        diagnostics={diagnostics}
        onResetStudio={onResetStudio}
        isResettingStudio={isResettingStudio}
      />
    </>
  );
};
