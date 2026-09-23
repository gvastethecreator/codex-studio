import type {
  CreateJobRequest,
  EditableStudioSettings,
  GenerationTaskSpec,
  Job,
  JobLibraryContext,
  CodexExecutionTransport,
} from '../../../packages/shared/src';
import {
  CODEX_HTTP_EXECUTION_DEFAULTS,
  resolveCodexExecutionPolicy,
  resolveChatgptExecutionPolicy,
} from '../../../packages/shared/src/codexExecutionContract';
import { collectGrokImagineJobIssues } from '../../../packages/shared/src/grokImagineContract';
import { createDefaultEditableStudioSettings } from '../../../packages/shared/src/studioSettings';
import { validateGenerationTaskSpec } from '../../../packages/shared/src/generationContracts';
import { readGrokRuntimeDoctor } from './grokRuntimeDoctor';
import {
  normalizeWorkspaceId,
  readWorkspaceIdFromSourceSpecMetadata,
  withWorkspaceMetadata,
} from '../../../packages/shared/src/workspaceContracts';
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
  ensureDefaultWorkspaceId?: () => string;
  createJobId: () => string;
  createJob: (input: {
    id: string;
    workspaceId?: string | null;
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
  readCodexTransportAvailability?: () => Partial<Record<CodexExecutionTransport, boolean>>;
  validateManagedAssets?: typeof validateManagedGenerationAssets;
  resolveProviderExecutionBlocker: (
    providerId: string,
  ) => Record<string, unknown> | null | Promise<Record<string, unknown> | null>;
  readGrokAvailableModels?: () => string[];
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

export interface PreparedPersistentJob {
  input: Parameters<PersistentJobIntakeDependencies['createJob']>[0];
  finalPrompt: string;
}
type PreparedResult =
  | { ok: true; prepared: PreparedPersistentJob }
  | { ok: false; error: PersistentJobIntakeError };

function shouldRequireLocalRunIds(sourceSpec: GenerationTaskSpec | null) {
  const metadata =
    sourceSpec?.metadata &&
    typeof sourceSpec.metadata === 'object' &&
    !Array.isArray(sourceSpec.metadata)
      ? sourceSpec.metadata
      : {};
  // Workspace id is always dual-written for durable authority. Only batch runs
  // require the local queued id/batchId contract.
  return Boolean(sourceSpec && typeof metadata.batchId === 'string' && metadata.batchId.trim());
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
  ensureDefaultWorkspaceId = () => normalizeWorkspaceId(undefined),
  createJobId,
  createJob,
  updateJobFinalPrompt,
  processReferences,
  hydrateSourceSpecAssetPaths,
  readLibraryDir,
  readLibraryContext,
  readEditableSettings = createDefaultEditableStudioSettings,
  resolveBootstrapExecution = resolveBootstrapProviderExecutionOptions,
  readCodexTransportAvailability,
  validateManagedAssets = validateManagedGenerationAssets,
  resolveProviderExecutionBlocker,
  readGrokAvailableModels = () => readGrokRuntimeDoctor().availableModels,
  isReferenceProcessingError,
  publishEvent,
  logJobCreated,
  enqueueJob,
}: PersistentJobIntakeDependencies) {
  async function prepareJob(request: CreateJobRequest): Promise<PreparedResult> {
    const workspaceId = normalizeWorkspaceId(
      request.workspaceId ||
        readWorkspaceIdFromSourceSpecMetadata(
          request.sourceSpec &&
            typeof request.sourceSpec === 'object' &&
            !Array.isArray(request.sourceSpec)
            ? (request.sourceSpec as GenerationTaskSpec).metadata
            : null,
        ) ||
        ensureDefaultWorkspaceId(),
    );
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
      sourceSpec = withWorkspaceMetadata(sourceSpec, workspaceId) ?? sourceSpec;
    }
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

    const execution = resolveEffectiveJobExecutionOptions({
      providerId,
      explicit: request.execution,
      settings: readEditableSettings(),
      bootstrap:
        providerId === 'chatgpt'
          ? CODEX_HTTP_EXECUTION_DEFAULTS
          : resolveBootstrapExecution(providerId),
    });
    if (providerId === 'codex' || providerId === 'chatgpt') {
      const transport = providerId === 'chatgpt' ? 'subscription_http' : 'codex_app_server';
      if (
        providerId === 'codex' &&
        request.execution?.providerOptions?.codex?.transport === 'subscription_http'
      ) {
        return {
          ok: false,
          error: {
            status: 400,
            body: {
              error: 'Select the ChatGPT provider for direct HTTP generation.',
              code: 'codex_transport_unavailable',
            },
          },
        };
      }
      const availability = readCodexTransportAvailability?.();
      if (availability && availability[transport] !== true) {
        return {
          ok: false,
          error: {
            status: 400,
            body: {
              error: `${providerId === 'chatgpt' ? 'ChatGPT Sign in' : 'Codex app-server'} is not ready. Open Studio Settings and complete its setup before generating.`,
              code: `${providerId}_transport_unavailable`,
              transport,
            },
          },
        };
      }
      try {
        execution.providerOptions =
          providerId === 'chatgpt'
            ? {
                chatgpt: resolveChatgptExecutionPolicy(
                  { ...execution, providerOptions: request.execution?.providerOptions },
                  sourceSpec,
                ),
              }
            : { codex: resolveCodexExecutionPolicy(execution, sourceSpec, 'codex_app_server') };
      } catch (error) {
        return {
          ok: false,
          error: {
            status: 400,
            body: {
              error: error instanceof Error ? error.message : 'Invalid execution options.',
              code: `${providerId}_execution_unsupported`,
            },
          },
        };
      }
    }
    if (providerId === 'grok') {
      const grokIssues = collectGrokImagineJobIssues({
        sourceSpec,
        execution,
        availableModels: readGrokAvailableModels(),
      });
      if (grokIssues.length > 0) {
        return {
          ok: false,
          error: {
            status: 400,
            body: {
              error: grokIssues[0]!.message,
              code: grokIssues[0]!.code,
              field: grokIssues[0]!.field,
              reason: grokIssues[0]!.message,
              issues: grokIssues,
            },
          },
        };
      }
    }

    return {
      ok: true,
      prepared: {
        input: {
          id: jobId,
          workspaceId,
          kind: resolvePersistentJobIntakeKind(request.kind, sourceSpec),
          providerId,
          sourceSpec,
          prompt,
          execution,
          libraryContext,
        },
        finalPrompt,
      },
    };
  }
  function dispatchJobs(jobs: Job[]) {
    // Notifications and log I/O cannot strand already accepted members.
    for (const job of jobs) enqueueJob(job);
    for (const job of jobs) {
      try {
        publishEvent('job.created', job);
        logJobCreated(job.kind, job.id);
      } catch {
        console.warn(
          'An accepted job was queued, but its intake notification could not be delivered.',
        );
      }
    }
  }
  return {
    prepareJob,
    dispatchJobs,
    async createJob(request: CreateJobRequest): Promise<PersistentJobIntakeResult> {
      const prepared = await prepareJob(request);
      if (!prepared.ok) return prepared;
      const { input, finalPrompt } = prepared.prepared;
      const job = createJob(input);
      const queuedJob =
        finalPrompt === input.prompt ? job : (updateJobFinalPrompt(job.id, finalPrompt) ?? job);
      dispatchJobs([queuedJob]);
      return { ok: true, status: 201, job: queuedJob };
    },
  };
}
