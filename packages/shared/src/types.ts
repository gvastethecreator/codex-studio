import type {
  GenerationProviderId,
  GenerationTaskKind,
  GenerationTaskSpec,
} from './generationContracts';

export type JobStatus =
  | 'queued'
  | 'running'
  | 'needs_review'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type JobKind = 'dry_run' | 'codex_imagegen' | GenerationTaskKind;

export type CodexReasoningEffort = string;
export type CodexServiceTier = 'standard' | 'fast' | 'flex';
export type CodexAuthMode = 'apikey' | 'chatgpt' | 'chatgptAuthTokens' | null;
export type AppServerEnsureReason = 'user' | 'rpc' | 'health' | 'session';
export type LocalCodexSessionState =
  | 'ready'
  | 'requires_chatgpt_login'
  | 'unsupported_auth'
  | 'unavailable';
export type LocalCodexSessionReason =
  | 'chatgpt_login_required'
  | 'api_key_not_supported'
  | 'external_tokens_not_supported'
  | 'app_server_unavailable'
  | 'unknown'
  | null;
export type StudioReadinessStage = 'checking' | 'ready' | 'action_required' | 'offline';
export type StudioReadinessAction =
  | 'retry'
  | 'install-codex'
  | 'start-app-server'
  | 'login-chatgpt'
  | 'fix-library'
  | null;
export type StudioReadinessCheckKey =
  | 'backend'
  | 'library'
  | 'codexCli'
  | 'appServer'
  | 'localCodexSession';

export interface JobExecutionOptions {
  model: string;
  reasoningEffort: CodexReasoningEffort;
  serviceTier?: Exclude<CodexServiceTier, 'standard'> | null;
}

export interface CodexModelReasoningOption {
  reasoningEffort: CodexReasoningEffort;
  description: string | null;
}

export interface CodexModel {
  id: string;
  model: string;
  displayName: string;
  description: string | null;
  hidden: boolean;
  defaultReasoningEffort: CodexReasoningEffort | null;
  supportedReasoningEfforts: CodexModelReasoningOption[];
  additionalSpeedTiers: Exclude<CodexServiceTier, 'standard'>[];
  inputModalities: string[];
  supportsPersonality: boolean;
  isDefault: boolean;
}

export interface CodexModelCatalogResponse {
  models: CodexModel[];
  authMode: CodexAuthMode;
  planType: string | null;
  recommendedDefaultModel: string | null;
  source: 'app-server' | 'fallback';
  fetchedAt: string;
  error: string | null;
}

export interface CodexUsageLimitWindow {
  id: string;
  label: string;
  usedPercent: number;
  availablePercent: number;
  windowMinutes: number | null;
  resetsAt: number | null;
  path: string | null;
}

export interface CodexUsageSnapshot {
  available: number | string | null;
  unit: string | null;
  display: string | null;
  path: string | null;
  limits?: CodexUsageLimitWindow[];
  raw: unknown;
}

export interface LocalCodexSessionResponse {
  authMode: CodexAuthMode;
  planType: string | null;
  usage: CodexUsageSnapshot | null;
  source: 'app-server' | 'fallback';
  fetchedAt: string;
  error: string | null;
  authLabel: string;
  state: LocalCodexSessionState;
  reason: LocalCodexSessionReason;
  isChatgptLogin: boolean;
  isSupportedAuthMode: boolean;
  canRunLocalJobs: boolean;
}

export type CodexAccountStatusResponse = LocalCodexSessionResponse;

export interface StudioReadinessCheck {
  key: StudioReadinessCheckKey;
  label: string;
  ok: boolean;
  detail: string;
  blocking: boolean;
}

export interface StudioReadinessSnapshot {
  stage: StudioReadinessStage;
  isReady: boolean;
  nextAction: StudioReadinessAction;
  title: string;
  description: string;
  checks: StudioReadinessCheck[];
}

export interface StudioSettings {
  libraryDir: string;
  serverPort: number;
  codexWsPort: number;
  codexImagegenModel: string;
  codexImagegenReasoningEffort: CodexReasoningEffort;
  codexImagegenServiceTier: Exclude<CodexServiceTier, 'standard'> | null;
  codexMaxConcurrentJobs: number;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  projectId: string;
  kind: JobKind;
  providerId: GenerationProviderId | null;
  sourceSpec: GenerationTaskSpec | null;
  status: JobStatus;
  execution: JobExecutionOptions | null;
  originalPrompt: string;
  expandedPrompt: string | null;
  finalPromptUsed: string;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface JobSummary extends Omit<Job, 'sourceSpec'> {
  sourceSpec: null;
  promptPreview: string;
}

export interface JobEventRecord {
  id: number;
  jobId: string | null;
  type: string;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface CodexTurnRecord {
  id: string;
  jobId: string;
  codexThreadId: string | null;
  codexTurnId: string | null;
  transcriptPath: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobTranscriptEntry {
  id: string;
  kind: 'reasoning' | 'message' | 'tool' | 'event';
  label: string;
  text: string;
  source: string;
  timestamp: string | null;
  raw: Record<string, unknown> | null;
}

export interface JobTokenUsageSummary {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  source: string;
}

export interface JobTimingSegment {
  id: 'queued' | 'provider' | 'asset_import' | 'total';
  label: string;
  durationMs: number | null;
}

export interface JobMetricSummary {
  timings: JobTimingSegment[];
  tokenUsage: JobTokenUsageSummary | null;
  estimatedPromptTokens: number;
}

export interface JobTraceSummary {
  providerId: GenerationProviderId | null;
  model: string | null;
  task: string;
  status: JobStatus;
  durationMs: number | null;
  assetCount: number;
  tokenUsage: JobTokenUsageSummary | null;
  transcriptPath: string | null;
  completedAt: string | null;
}

export interface JobDetailResponse {
  job: Job;
  events: JobEventRecord[];
  turn: CodexTurnRecord | null;
  transcriptEntries: JobTranscriptEntry[];
  catalogImages: CatalogImage[];
  metrics: JobMetricSummary;
  traceSummary: JobTraceSummary;
}

export interface Asset {
  id: string;
  projectId: string;
  jobId: string;
  filePath: string;
  thumbnailPath: string | null;
  publicUrl: string;
  prompt: string;
  width: number | null;
  height: number | null;
  mimeType: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface StudioLibrary {
  id: string;
  name: string;
  path: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CatalogImage {
  id: string;
  libraryId: string;
  filePath: string;
  thumbnailPath: string | null;
  publicUrl: string;
  thumbnailUrl: string | null;
  prompt: string | null;
  negativePrompt: string | null;
  aspectRatio: string | null;
  imageSize: string | null;
  width: number | null;
  height: number | null;
  mimeType: string;
  fileSizeBytes: number | null;
  jobId: string | null;
  workspaceId: string | null;
  batchId: string | null;
  recipeId: string | null;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  tags: string[];
  generationConfig: Record<string, unknown> | null;
  createdAt: string;
}

export interface CatalogImageSummary extends Omit<CatalogImage, 'generationConfig'> {
  generationConfig: null;
}

export interface CatalogPage {
  images: CatalogImage[];
  total: number;
  hasMore: boolean;
}

export interface CatalogCommandFilter {
  ids?: string[];
  workspaceId?: string | null;
  batchId?: string | null;
  isDeleted?: boolean;
}

export interface CatalogBatchCommandResult {
  ok: true;
  action: 'archive' | 'restore' | 'purge';
  matchedCount: number;
  changedCount: number;
  failed: Array<{
    id: string;
    reason: 'not_found' | 'operation_failed';
    message?: string;
  }>;
}

export interface SystemLog {
  id: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  scope: string;
  message: string;
  jobId: string | null;
  createdAt: string;
}

export type StudioEvent =
  | {
      type: 'server.connected';
      payload: { ok: true };
      createdAt: string;
    }
  | {
      type:
        | 'job.created'
        | 'job.running'
        | 'job.progress'
        | 'job.completed'
        | 'job.failed'
        | 'job.cancelled';
      payload: Job | null;
      createdAt: string;
    }
  | {
      type: 'asset.created';
      payload: Asset;
      createdAt: string;
    }
  | {
      type: 'catalog.created' | 'catalog.updated' | 'catalog.deleted';
      payload: CatalogImage;
      createdAt: string;
    }
  | {
      type: 'log.created' | 'log.appended';
      payload: SystemLog;
      createdAt: string;
    }
  | {
      type:
        | 'library.created'
        | 'library.default'
        | 'output-source.registered'
        | 'output-source.imported'
        | 'project.created';
      payload: unknown;
      createdAt: string;
    };

export interface UnknownStudioEvent {
  type: string;
  payload: unknown;
  createdAt: string;
}

export interface HealthResponse {
  ok: boolean;
  checkedAt: string;
  libraryDir: string;
  runtime: {
    platform: string;
    arch: string;
    bunVersion: string | null;
    nodeVersion: string;
    cwd: string;
    envLocalPath: string;
    envLocalPresent: boolean;
  };
  config: {
    serverPort: number;
    codexWsPort: number;
  };
  library: {
    exists: boolean;
    writable: boolean;
    readmePresent: boolean;
    missingFolders: string[];
  };
  codexCli: {
    available: boolean;
    version: string | null;
    command: string;
  };
  appServer: {
    running: boolean;
    wsUrl: string;
    pid: number | null;
    lastExitCode: number | null;
    lastExitAt: string | null;
    lastInvocation: string | null;
    lastStartAt: string | null;
    lastStartError: string | null;
    lastEnsureAt: string | null;
    lastEnsureReason: AppServerEnsureReason | null;
  };
  checks: {
    libraryReady: boolean;
    codexReady: boolean;
    onboardingReady: boolean;
  };
}

export interface StudioResetResponse {
  ok: boolean;
  resetAt: string;
  libraryDir: string;
  defaultProjectId: string;
}

export interface CreateJobRequest {
  projectId?: string;
  kind: JobKind;
  providerId?: GenerationProviderId | null;
  sourceSpec?: GenerationTaskSpec | null;
  prompt: string;
  execution?: JobExecutionOptions | null;
  references?: {
    name: string;
    dataUrl: string;
    strength: number;
  }[];
}
