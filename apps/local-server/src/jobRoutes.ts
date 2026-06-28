import { Hono } from 'hono';
import { Either, Schema } from 'effect';
import type {
  CreateJobRequest,
  Job,
  JobDetailResponse,
  JobSummary,
} from '../../../packages/shared/src';
import {
  createPersistentJobIntake,
  type PersistentJobIntakeDependencies,
} from './persistentJobIntake';

interface JobRoutesDependencies extends PersistentJobIntakeDependencies {
  listJobs: () => Array<Job | JobSummary>;
  getJob: (jobId: string) => Job | null;
  getJobDetail: (jobId: string) => Promise<JobDetailResponse | null>;
  cancelQueuedOrRunningJob: (jobId: string) => Job | null;
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
  const persistentJobIntake = createPersistentJobIntake({
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
  });

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

    const result = await persistentJobIntake.createJob(body);
    if (!result.ok) return c.json(result.error.body, result.error.status);
    return c.json(result.job, result.status);
  });

  return routes;
}
