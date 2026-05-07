import type { ChangeEvent } from 'react';
import type {
  HealthResponse,
  Job as StudioJob,
  JobDetailResponse,
} from '../../packages/shared/src';
import type {
  Attachment,
  GeneratedImageWithConfig,
  GenerationBatch,
  ImageGenerationConfig,
  LogEntry,
  Workspace,
} from '../../types';

export interface StudioImageOverlaysProps {
  modalImage: GeneratedImageWithConfig | null;
  imagesWithConfig: GeneratedImageWithConfig[];
  activeGenerationConfig: ImageGenerationConfig | null;
  closeModal: () => void;
  handleDelete: (imageId: string) => void;
  handleGenerate: (
    promptOverride?: string,
    configOverrides?: Partial<ImageGenerationConfig>,
    options?: { force?: boolean; preventModal?: boolean },
  ) => void;
  handleAddToContext: (image: GeneratedImageWithConfig) => void;
  handleLoadRecipe: (config: ImageGenerationConfig) => void;
  handleToggleFavorite: (imageId: string) => void;
  setActiveCarouselId: (imageId: string) => void;
  isEditorOpen: boolean;
  closeEditor: () => void;
  imageToEdit: Attachment | null;
  handleExecuteEdit: (original: Attachment, mask: string, prompt: string) => Promise<void>;
  isEditingImage: boolean;
}

export interface StudioSystemOverlaysProps {
  isDebugPanelOpen: boolean;
  closeDebugPanel: () => void;
  mergedLogs: LogEntry[];
  isDashboardModalOpen: boolean;
  closeDashboard: () => void;
  batches: GenerationBatch[];
  workspaces: Workspace[];
  studioJobs: StudioJob[];
  imagesCount: number;
  selectedJobDetail: JobDetailResponse | null;
  isLoadingSelectedJob: boolean;
  onInspectJob: (jobId: string) => void;
  onClearSelectedJob: () => void;
  handleImportVault: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  handleDeepScan: () => void | Promise<void>;
  apiBase: string;
  onboardingError: string | null;
  onboardingHealth: HealthResponse | null;
  isCheckingOnboarding: boolean;
  isDesktopRuntime: boolean;
  isOnboardingOpen: boolean;
  isOnboardingReady: boolean;
  isStartingAppServer: boolean;
  closeOnboarding: () => void;
  completeOnboarding: () => void;
  refreshOnboardingHealth: () => void;
  ensureAppServer: () => void;
}

export interface StudioWorkspaceOverlaysProps {
  isTrashModalOpen: boolean;
  closeTrash: () => void;
  trash: GenerationBatch[];
  restoreFromTrash: (batchId: string) => void;
  restoreAllFromTrash: () => void;
  emptyTrash: () => void;
  isLimitModalOpen: boolean;
  handleDismissLimitModal: () => void;
  handleDownloadAndClear: () => void | Promise<void>;
  batchCount: number;
}
