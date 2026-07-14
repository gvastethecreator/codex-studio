import type {
  CreateJobRequest,
  EditableStudioSettings,
  GenerationTaskSpec,
  Job,
  JobLibraryContext,
} from '../../../packages/shared/src';
import { createDefaultEditableStudioSettings } from '../../../packages/shared/src/studioSettings';
import { validateGenerationTaskSpec } from '../../../packages/shared/src/generationContracts';
import type { publishEvent } from './events';
import { validateManagedGenerationAssets } from './managedAssetPolicy';
import { resolveEffectiveJobExecutionOptions } from './providerExecutionPolicy';
import { resolveBootstrapProviderExecutionOptions } from './providers/providerExecutionDefaults';

interface ProcessReferencesResult {
  augmentedPrompt: string;
  persistedRefs: unknown[];
}

export interface ReferenceProcessingErrorLike {
  message: string;
  referenceName: string | null;
  reason: string;
}

export interface PersistentJobIntakeDependencies {
  ensureDefaultProjectId: () => string;
  createJobId: () => string;
  createJob: (input: {
    id: string;
    projectId: string;
    kind: Job['kind'];
    providerId: Job['providerId'];
    sourceSpec: GenerationTaskSpec | null;
    prompt: string;
    execution: Job['execution'];
    libraryContext?: JobLibraryContext | null;
  }) => Job;
  updateJobFinalPrompt: (jobId: string, finalPrompt: string) => Job | null;
  processReferences: (
    jobId: string,
    prompt: string,
    references: CreateJobRequest['references'],
    libraryDir: string,
  ) => Promise<ProcessReferencesResult>;
  hydrateSourceSpecAssetPaths: (
    sourceSpec: GenerationTaskSpec | null,
    references: CreateJobRequest['references'],
    persistedRefs: unknown[],
    libraryDir: string,
    libraryContext?: JobLibraryContext,
  ) => GenerationTaskSpec | null;
  readLibraryDir: () => string;
  readLibraryContext?: () => JobLibraryContext;
  readEditableSettings?: () => EditableStudioSettings;
  resolveBootstrapExecution?: typeof resolveBootstrapProviderExecutionOptions;
  validateManagedAssets?: typeof validateManagedGenerationAssets;
  resolveProviderExecutionBlocker: (
    providerId: string,
  ) => Record<string, unknown> | null | Promise<Record<string, unknown> | null>;
  isReferenceProcessingError: (error: unknown) => error is ReferenceProcessingErrorLike;
  publishEvent: typeof publishEvent;
  logJobCreated: (kind: string, jobId: string) => void;
  enqueueJob: (job: Job) => void;
}

export type PersistentJobIntakeError = {
  status: 400;
  body: Record<string, unknown>;
};

export type PersistentJobIntakeResult =
  | { ok: true; status: 201; job: Job }
  | { ok: false; error: PersistentJobIntakeError };

function shouldRequireLocalRunIds(sourceSpec: GenerationTaskSpec | null) {
  const metadata =
    sourceSpec?.metadata &&
    typeof sourceSpec.metadata === 'object' &&
    !Array.isArray(sourceSpec.metadata)
      ? sourceSpec.metadata
      : {};
  return Boolean(
    sourceSpec &&
    (typeof metadata.batchId === 'string' || typeof metadata.workspaceId === 'string'),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function readSourceSpecPrompt(sourceSpec: unknown) {
  return isRecord(sourceSpec) && typeof sourceSpec.prompt === 'string' ? sourceSpec.prompt : '';
}

function readSourceSpecProviderId(sourceSpec: unknown): Job['providerId'] | null {
  if (!isRecord(sourceSpec)) return null;
  return typeof sourceSpec.providerId === 'string'
    ? (sourceSpec.providerId as Job['providerId'])
    : null;
}

function createValidationErrorResponse(
  sourceSpec: GenerationTaskSpec,
  providerId: Job['providerId'],
  { requireHydratedAssets = true } = {},
) {
  const issues = validateGenerationTaskSpec(sourceSpec, {
    requireLocalRunIds: shouldRequireLocalRunIds(sourceSpec),
    requireHydratedAssets,
    expectedProviderId: providerId,
  });
  if (issues.length === 0) return null;

  return {
    error: 'Invalid Generation Task Spec',
    code: issues[0].code,
    field: issues[0].field,
    reason: issues[0].message,
    issues,
  };
}

function createSourceSpecDraft(sourceSpec: unknown, providerId: Job['providerId']) {
  if (sourceSpec == null) return null;
  const draft = isRecord(sourceSpec) ? sourceSpec : {};
  return {
    ...draft,
    providerId: draft.providerId == null ? providerId : draft.providerId,
  } as GenerationTaskSpec;
}

function cloneValidatedSourceSpec(sourceSpec: GenerationTaskSpec) {
  return {
    ...sourceSpec,
    assets: sourceSpec.assets.map((asset) => ({ ...asset })),
  };
}

export function resolvePersistentJobIntakeKind(
  requestKind: CreateJobRequest['kind'],
  sourceSpec: GenerationTaskSpec | null | undefined,
): Job['kind'] {
  if (requestKind === 'codex_imagegen') {
    return sourceSpec?.task ?? 'image_generate';
  }
  return requestKind;
}

export function createPersistentJobIntake({
  ensureDefaultProjectId,
  createJobId,
  createJob,
  updateJobFinalPrompt,
  processReferences,
  hydrateSourceSpecAssetPaths,
  readLibraryDir,
  readLibraryContext,
  readEditableSettings = createDefaultEditableStudioSettings,
  resolveBootstrapExecution = resolveBootstrapProviderExecutionOptions,
  validateManagedAssets = validateManagedGenerationAssets,
  resolveProviderExecutionBlocker,
  isReferenceProcessingError,
  publishEvent,
  logJobCreated,
  enqueueJob,
}: PersistentJobIntakeDependencies) {
  return {
    async createJob(request: CreateJobRequest): Promise<PersistentJobIntakeResult> {
      const projectId = request.projectId || ensureDefaultProjectId();
      const prompt = (request.prompt || readSourceSpecPrompt(request.sourceSpec) || '').trim();
      if (!prompt)
        return { ok: false, error: { status: 400, body: { error: 'Prompt is required' } } };
      const jobId = createJobId();

      const providerId: Job['providerId'] =
        request.kind === 'dry_run'
          ? 'dry_run'
          : (request.providerId ?? readSourceSpecProviderId(request.sourceSpec) ?? 'codex');

      let sourceSpec = createSourceSpecDraft(request.sourceSpec, providerId);
      if (sourceSpec) {
        const structuralValidationError = createValidationErrorResponse(sourceSpec, providerId, {
          requireHydratedAssets: false,
        });
        if (structuralValidationError) {
          return { ok: false, error: { status: 400, body: structuralValidationError } };
        }
        sourceSpec = cloneValidatedSourceSpec(sourceSpec);
      }

      const providerBlocker = await resolveProviderExecutionBlocker(providerId);
      if (providerBlocker) {
        return {
          ok: false,
          error: { status: 400, body: providerBlocker as Record<string, unknown> },
        };
      }

      let finalPrompt = prompt;
      const libraryContext = readLibraryContext?.() ?? {
        libraryId: 'legacy-default',
        rootPath: readLibraryDir(),
      };
      try {
        const libraryDir = libraryContext.rootPath;
        const processedReferences = await processReferences(
          jobId,
          prompt,
          request.references || [],
          libraryDir,
        );
        finalPrompt = processedReferences.augmentedPrompt;
        sourceSpec = hydrateSourceSpecAssetPaths(
          sourceSpec,
          request.references || [],
          processedReferences.persistedRefs,
          libraryDir,
          libraryContext,
        );
      } catch (error) {
        if (isReferenceProcessingError(error)) {
          return {
            ok: false,
            error: {
              status: 400,
              body: {
                error: error.message,
                referenceName: error.referenceName,
                reason: error.reason,
              },
            },
          };
        }
        throw error;
      }

      if (sourceSpec) {
        const validationError = createValidationErrorResponse(sourceSpec, providerId);
        if (validationError) {
          return { ok: false, error: { status: 400, body: validationError } };
        }
        const managedAssetIssues = validateManagedAssets(sourceSpec, libraryContext);
        if (managedAssetIssues.length > 0) {
          return {
            ok: false,
            error: {
              status: 400,
              body: {
                error: 'Unmanaged Generation Task asset',
                code: managedAssetIssues[0].code,
                field: managedAssetIssues[0].field,
                reason: managedAssetIssues[0].message,
                issues: managedAssetIssues,
              },
            },
          };
        }
      }

      const job = createJob({
        id: jobId,
        projectId,
        kind: resolvePersistentJobIntakeKind(request.kind, sourceSpec),
        providerId,
        sourceSpec,
        prompt,
        execution: resolveEffectiveJobExecutionOptions({
          providerId,
          explicit: request.execution,
          settings: readEditableSettings(),
          bootstrap: resolveBootstrapExecution(providerId),
        }),
        libraryContext,
      });

      const queuedJob =
        finalPrompt === prompt ? job : (updateJobFinalPrompt(job.id, finalPrompt) ?? job);

      publishEvent('job.created', queuedJob);
      logJobCreated(queuedJob.kind, queuedJob.id);
      enqueueJob(queuedJob);
      return { ok: true, status: 201, job: queuedJob };
    },
  };
}
