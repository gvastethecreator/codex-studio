export type JobStatus = 'queued' | 'running' | 'needs_review' | 'completed' | 'failed' | 'cancelled';

export type JobKind = 'dry_run' | 'codex_imagegen';

export interface StudioSettings {
  libraryDir: string;
  serverPort: number;
  codexWsPort: number;
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
  status: JobStatus;
  originalPrompt: string;
  expandedPrompt: string | null;
  finalPromptUsed: string;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
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

export interface SystemLog {
  id: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  scope: string;
  message: string;
  jobId: string | null;
  createdAt: string;
}

export interface StudioEvent<T = unknown> {
  type: string;
  payload: T;
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
  };
  checks: {
    libraryReady: boolean;
    codexReady: boolean;
    onboardingReady: boolean;
  };
}

export interface CreateJobRequest {
  projectId?: string;
  kind: JobKind;
  prompt: string;
  references?: {
    name: string;
    dataUrl: string;
    strength: number;
  }[];
}
