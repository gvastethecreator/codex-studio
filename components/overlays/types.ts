import type { ChangeEvent } from 'react';
import type {
  HealthResponse,
  EditableStudioSettings,
  EditableStudioSettingsPatch,
  ExternalOutputSourcesResponse,
  ExternalOutputSourceFile,
  GenerationProviderCapabilitiesResponse,
  GenerationProviderRuntimePreflightResponse,
  Job as StudioJob,
  JobDetailResponse,
  LocalCodexSessionResponse,
  RegisterExternalOutputSourceInput,
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
import type { ArchivedImageGroup } from '../../lib/studioCatalogTrashView';

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
  visualGroupsCount: number;
  workspaces: Workspace[];
  studioJobs: StudioJob[];
  imagesCount: number;
  selectedJobDetail: JobDetailResponse | null;
  isLoadingSelectedJob: boolean;
  onInspectJob: (jobId: string) => void;
  onClearSelectedJob: () => void;
  handleImportVault: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  handleExportWorkspaceSnapshot: () => void;
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
  isSettingsModalOpen: boolean;
  closeSettings: () => void;
  settings: EditableStudioSettings | null;
  settingsError: string | null;
  isLoadingSettings: boolean;
  isSavingSettings: boolean;
  providerCapabilities: GenerationProviderCapabilitiesResponse | null;
  providerRuntimePreflight: GenerationProviderRuntimePreflightResponse | null;
  outputSources: ExternalOutputSourcesResponse | null;
  outputSourceFiles: Record<string, ExternalOutputSourceFile[]>;
  isLoadingOutputSources: boolean;
  loadingOutputSourceFiles: Record<string, boolean>;
  isRegisteringOutputSource: boolean;
  importingOutputSources: Record<string, boolean>;
  settingsLibraryDir: string | null;
  refreshSettings: () => void | Promise<void>;
  updateSettings: (patch: EditableStudioSettingsPatch) => void | Promise<void>;
  registerOutputSource: (input: RegisterExternalOutputSourceInput) => void | Promise<void>;
  loadOutputSourceFiles: (sourceId: string) => void | Promise<void>;
  importOutputSourceFiles: (
    sourceId: string,
    files: string[],
    workspaceId?: string | null,
  ) => void | Promise<void>;
  isBackgroundEnabled: boolean;
  onToggleBackground: () => void;
  onResetStudio: () => void | Promise<void>;
  isResettingStudio: boolean;
}

export interface StudioWorkspaceOverlaysProps {
  isTrashModalOpen: boolean;
  closeTrash: () => void;
  trash: ArchivedImageGroup[];
  restoreFromTrash: (batchId: string) => void;
  restoreAllFromTrash: () => void;
  emptyTrash: () => void;
  isLimitModalOpen: boolean;
  handleDismissLimitModal: () => void;
  handleDownloadAndClear: () => void | Promise<void>;
  visualGroupCount: number;
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
