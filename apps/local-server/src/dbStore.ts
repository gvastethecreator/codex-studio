import type {
  Asset,
  GenerationProviderId,
  GenerationTaskSpec,
  Job,
  JobExecutionOptions,
  JobKind,
  JobLibraryContext,
  JobSummary,
  Project,
  SystemLog,
} from '../../../packages/shared/src';

export interface StudioDbStore {
  ensureDefaultProject(): Project;
  createProject(name: string, description?: string | null): Project;
  listProjects(): Project[];
  createJob(input: {
    id?: string;
    projectId?: string | null;
    workspaceId?: string | null;
    kind: JobKind;
    providerId?: GenerationProviderId | null;
    sourceSpec?: GenerationTaskSpec | null;
    prompt: string;
    execution?: JobExecutionOptions | null;
    libraryContext?: JobLibraryContext | null;
  }): Job;
  updateJobFinalPrompt(id: string, finalPrompt: string): Job | null;
  requeueJob(id: string): Job | null;
  getJob(id: string): Job | null;
  listJobSummaries(): JobSummary[];
  listAssets(): Asset[];
  listLogs(): SystemLog[];
}

export async function createDefaultDbStore(): Promise<StudioDbStore> {
  const {
    createJob,
    createProject,
    ensureDefaultProject,
    getJob,
    listAssets,
    listJobSummaries,
    listLogs,
    listProjects,
    requeueJob,
    updateJobFinalPrompt,
  } = await import('./db');

  return {
    ensureDefaultProject,
    createProject,
    listProjects,
    createJob,
    updateJobFinalPrompt,
    requeueJob,
    getJob,
    listJobSummaries,
    listAssets,
    listLogs,
  };
}
