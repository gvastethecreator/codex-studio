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
    options?: { force?: boolean; preventModal?: boolean; useCurrentAttachments?: boolean },
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

export interface StudioSystemOverlayFlags {
  isDebugPanelOpen: boolean;
  isDashboardModalOpen: boolean;
  isLoadingSelectedJob: boolean;
  isCheckingOnboarding: boolean;
  isDesktopRuntime: boolean;
  isOnboardingOpen: boolean;
  isOnboardingReady: boolean;
  isStartingAppServer: boolean;
  isSettingsModalOpen: boolean;
  isLoadingSettings: boolean;
  isSavingSettings: boolean;
  isLoadingOutputSources: boolean;
  isRegisteringOutputSource: boolean;
  isBackgroundEnabled: boolean;
  isResettingStudio: boolean;
}

export interface StudioSystemOverlaysProps {
  flags: StudioSystemOverlayFlags;
  closeDebugPanel: () => void;
  mergedLogs: LogEntry[];
  closeDashboard: () => void;
  visualGroupsCount: number;
  workspaces: Workspace[];
  studioJobs: StudioJob[];
  imagesCount: number;
  selectedJobDetail: JobDetailResponse | null;
  onInspectJob: (jobId: string) => void;
  onClearSelectedJob: () => void;
  onRetryJob?: (jobId: string) => void;
  handleExportLegacyVisualBatchSnapshot: () => void;
  handleDeepScan: () => void | Promise<void>;
  apiBase: string;
  onboardingError: string | null;
  onboardingHealth: HealthResponse | null;
  localCodexSession: LocalCodexSessionResponse | null;
  readiness: StudioReadinessSnapshot;
  closeOnboarding: () => void;
  completeOnboarding: () => void;
  refreshOnboardingHealth: () => void;
  ensureAppServer: () => void;
  settingsModule: {
    close: () => void;
    settingsDomain: {
      settings: EditableStudioSettings | null;
      error: string | null;
      isLoading: boolean;
      isSaving: boolean;
      refresh: () => void | Promise<void>;
      update: (patch: EditableStudioSettingsPatch) => void | Promise<void>;
    };
    providerDomain: {
      capabilities: GenerationProviderCapabilitiesResponse | null;
      runtimePreflight: GenerationProviderRuntimePreflightResponse | null;
    };
    outputSourcesDomain: {
      outputSources: ExternalOutputSourcesResponse | null;
      outputSourceFiles: Record<string, ExternalOutputSourceFile[]>;
      isLoadingOutputSources: boolean;
      loadingOutputSourceFiles: Record<string, boolean>;
      isRegisteringOutputSource: boolean;
      importingOutputSources: Record<string, boolean>;
      registerOutputSource: (input: RegisterExternalOutputSourceInput) => void | Promise<void>;
      loadOutputSourceFiles: (sourceId: string) => void | Promise<void>;
      importOutputSourceFiles: (
        sourceId: string,
        files: string[],
        workspaceId?: string | null,
      ) => void | Promise<void>;
    };
    libraryDir: string | null;
    isBackgroundEnabled: boolean;
    onToggleBackground: () => void;
    onResetStudio: () => void | Promise<void>;
    isResettingStudio: boolean;
  };
}

export interface StudioWorkspaceOverlaysProps {
  isTrashModalOpen: boolean;
  closeTrash: () => void;
  trash: ArchivedImageGroup[];
  restoreFromTrash: (batchId: string) => void;
  restoreAllFromTrash: () => void;
  emptyTrash: () => void;
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
