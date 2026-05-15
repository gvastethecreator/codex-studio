import type { ChangeEvent } from 'react';
import type {
  HealthResponse,
  Job as StudioJob,
  JobDetailResponse,
  LocalCodexSessionResponse,
  StudioReadinessSnapshot,
} from '../../packages/shared/src';
import type {
  Attachment,
  GeneratedImageWithConfig,
  GenerationBatch,
  ImageGenerationConfig,
  LogEntry,
  Workspace,
} from '../../types';
import type { ConfirmationRequest } from '../../hooks/useStudioActionConfirmations';

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
  handleExecuteEdit: (original: Attachment, mask: string, prompt: string) => Promise<unknown>;
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
  localCodexSession: LocalCodexSessionResponse | null;
  readiness: StudioReadinessSnapshot;
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

export interface StudioConfirmationOverlayProps {
  pendingConfirmation: ConfirmationRequest | null;
  closeConfirmation: () => void;
  confirmPendingAction: () => void | Promise<void>;
}

export interface StudioOverlayController {
  imageOverlays: StudioImageOverlaysProps;
  systemOverlays: StudioSystemOverlaysProps;
  workspaceOverlays: StudioWorkspaceOverlaysProps;
  confirmationOverlay: StudioConfirmationOverlayProps;
}
