import { Hono } from 'hono';
import { Either, Schema } from 'effect';
import type {
  CreateJobRequest,
  GenerationTaskSpec,
  Job,
  JobDetailResponse,
  JobSummary,
} from '../../../packages/shared/src';
import { validateGenerationTaskSpec } from '../../../packages/shared/src/generationContracts';
import type { publishEvent } from './events';

interface ProcessReferencesResult {
  augmentedPrompt: string;
  persistedRefs: unknown[];
}

interface ReferenceProcessingErrorLike {
  message: string;
  referenceName: string | null;
  reason: string;
}

interface JobRoutesDependencies {
  listJobs: () => Array<Job | JobSummary>;
  getJob: (jobId: string) => Job | null;
  getJobDetail: (jobId: string) => Promise<JobDetailResponse | null>;
  cancelQueuedOrRunningJob: (jobId: string) => Job | null;
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
  ) => GenerationTaskSpec | null;
  readLibraryDir: () => string;
  resolveProviderExecutionBlocker: (providerId: string) => unknown;
  isReferenceProcessingError: (error: unknown) => error is ReferenceProcessingErrorLike;
  publishEvent: typeof publishEvent;
  logJobCreated: (kind: string, jobId: string) => void;
  enqueueJob: (job: Job) => void;
}

const CreateJobRequestBoundarySchema = Schema.Struct({
  projectId: Schema.optional(Schema.String),
  kind: Schema.Union(
    Schema.Literal('dry_run'),
    Schema.Literal('codex_imagegen'),
    Schema.Literal('image_generate'),
    Schema.Literal('image_edit'),
    Schema.Literal('style_preset_card'),
    Schema.Literal('sprite_sheet'),
    Schema.Literal('texture_generate'),
  ),
  providerId: Schema.optional(Schema.Union(Schema.String, Schema.Null)),
  sourceSpec: Schema.optional(Schema.Union(Schema.Unknown, Schema.Null)),
  prompt: Schema.optional(Schema.String),
  execution: Schema.optional(Schema.Union(Schema.Unknown, Schema.Null)),
  references: Schema.optional(
    Schema.Array(
      Schema.Struct({
        name: Schema.String,
        dataUrl: Schema.String,
        strength: Schema.Number,
      }),
    ),
  ),
});

type CreateJobRequestBoundary = Schema.Schema.Type<typeof CreateJobRequestBoundarySchema>;

function decodeCreateJobRequestBoundary(body: unknown) {
  return Schema.decodeUnknownEither(CreateJobRequestBoundarySchema)(body);
}

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

function createValidationErrorResponse(
  sourceSpec: GenerationTaskSpec,
  providerId: Job['providerId'],
) {
  const issues = validateGenerationTaskSpec(sourceSpec, {
    requireLocalRunIds: shouldRequireLocalRunIds(sourceSpec),
    requireHydratedAssets: true,
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

export function createJobRoutes({
  listJobs,
  getJob,
  getJobDetail,
  cancelQueuedOrRunningJob,
  ensureDefaultProjectId,
  createJobId,
  createJob,
  updateJobFinalPrompt,
  processReferences,
  hydrateSourceSpecAssetPaths,
  readLibraryDir,
  resolveProviderExecutionBlocker,
  isReferenceProcessingError,
  publishEvent,
  logJobCreated,
  enqueueJob,
}: JobRoutesDependencies) {
  const routes = new Hono();

  routes.get('/', (c) => c.json(listJobs()));

  routes.get('/:id', async (c) => {
    const detail = await getJobDetail(c.req.param('id'));
    if (!detail) return c.json({ error: 'Job not found' }, 404);
    return c.json(detail);
  });

  routes.post('/:id/cancel', (c) => {
    const jobId = c.req.param('id');
    const job = getJob(jobId);
    if (!job) return c.json({ error: 'Job not found' }, 404);

    if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
      return c.json(job);
    }

    const updatedJob = cancelQueuedOrRunningJob(jobId);
    if (!updatedJob) {
      return c.json({ error: 'Job cannot be cancelled right now' }, 409);
    }

    return c.json(updatedJob);
  });

  routes.post('/', async (c) => {
    const rawBody = await c.req
      .json()
      .catch(() => ({ __invalidJson: true }) as { __invalidJson: true });
    if ('__invalidJson' in rawBody) {
      return c.json(
        {
          error: 'Invalid request body',
          code: 'invalid_json',
          reason: 'Request body must be valid JSON.',
        },
        400,
      );
    }

    const decodedBody = decodeCreateJobRequestBoundary(rawBody);
    if (Either.isLeft(decodedBody)) {
      return c.json(
        {
          error: 'Invalid request body',
          code: 'invalid_request_body',
          reason: 'Request payload does not match CreateJobRequest boundary schema.',
        },
        400,
      );
    }

    const boundaryBody: CreateJobRequestBoundary = decodedBody.right;
    const body: CreateJobRequest = {
      projectId: boundaryBody.projectId,
      kind: boundaryBody.kind,
      providerId: boundaryBody.providerId,
      sourceSpec: boundaryBody.sourceSpec as CreateJobRequest['sourceSpec'],
      prompt: boundaryBody.prompt ?? '',
      execution: boundaryBody.execution as CreateJobRequest['execution'],
      references: boundaryBody.references as CreateJobRequest['references'],
    };

    const projectId = body.projectId || ensureDefaultProjectId();
    const prompt = (body.prompt || body.sourceSpec?.prompt || '').trim();
    if (!prompt) return c.json({ error: 'Prompt is required' }, 400);
    const jobId = createJobId();

    const providerId =
      body.kind === 'dry_run'
        ? 'dry_run'
        : (body.providerId ?? body.sourceSpec?.providerId ?? 'codex');

    let sourceSpec: GenerationTaskSpec | null = body.sourceSpec
      ? {
          ...body.sourceSpec,
          providerId: body.sourceSpec.providerId ?? providerId,
          assets: body.sourceSpec.assets.map((asset) => ({ ...asset })),
        }
      : null;

    const providerBlocker = resolveProviderExecutionBlocker(providerId);
    if (providerBlocker) {
      return c.json(providerBlocker, 400);
    }

    let finalPrompt = prompt;
    try {
      const processedReferences = await processReferences(
        jobId,
        prompt,
        body.references || [],
        readLibraryDir(),
      );
      finalPrompt = processedReferences.augmentedPrompt;
      sourceSpec = hydrateSourceSpecAssetPaths(
        sourceSpec,
        body.references || [],
        processedReferences.persistedRefs,
      );
    } catch (error) {
      if (isReferenceProcessingError(error)) {
        return c.json(
          { error: error.message, referenceName: error.referenceName, reason: error.reason },
          400,
        );
      }
      throw error;
    }

    if (sourceSpec) {
      const validationError = createValidationErrorResponse(sourceSpec, providerId);
      if (validationError) {
        return c.json(validationError, 400);
      }
    }

    const job = createJob({
      id: jobId,
      projectId,
      kind: body.kind,
      providerId,
      sourceSpec,
      prompt,
      execution: body.execution ?? null,
    });

    const queuedJob =
      finalPrompt === prompt ? job : (updateJobFinalPrompt(job.id, finalPrompt) ?? job);

    publishEvent('job.created', queuedJob);
    logJobCreated(queuedJob.kind, queuedJob.id);
    enqueueJob(queuedJob);
    return c.json(queuedJob, 201);
  });

  return routes;
}
