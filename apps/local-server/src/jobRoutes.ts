import { Hono } from 'hono';
import { Either, Schema } from 'effect';
import type {
  CreateJobRequest,
  Job,
  JobDetailResponse,
  JobListPage,
  JobListQuery,
  JobStatusSnapshot,
} from '../../../packages/shared/src/types';
import {
  CreateJobRequestBoundarySchema,
  type CreateJobRequestBoundary,
} from '../../../packages/shared/src/studioApiSchemas';
import { collectGrokImagineJobIssues } from '../../../packages/shared/src/grokImagineContract';
import { canResumeStudioJob } from '../../../packages/shared/src/jobRecovery';
import {
  createPersistentJobIntake,
  type PersistentJobIntakeDependencies,
} from './persistentJobIntake';

interface JobRoutesDependencies extends PersistentJobIntakeDependencies {
  listJobs: (query: JobListQuery) => JobListPage;
  getJob: (jobId: string) => Job | null;
  getJobStatus?: (jobId: string) => JobStatusSnapshot | null;
  getJobDetail: (jobId: string) => Promise<JobDetailResponse | null>;
  requeueJob?: (jobId: string) => Job | null;
  cancelQueuedOrRunningJob: (jobId: string) => Job | null;
}

const ACTIVE_RETRY_STATUSES = new Set<Job['status']>(['queued', 'running']);
const REQUEUEABLE_STATUSES = new Set<Job['status']>(['failed', 'cancelled']);

function decodeCreateJobRequestBoundary(body: unknown) {
  return Schema.decodeUnknownEither(CreateJobRequestBoundarySchema)(body);
}

function resolveJobProviderId(job: Pick<Job, 'providerId' | 'sourceSpec'>) {
  return job.providerId ?? job.sourceSpec?.providerId ?? 'codex';
}

export function createJobRoutes({
  listJobs,
  getJob,
  getJobStatus = (id) => {
    const job = getJob(id);
    return job && { id: job.id, status: job.status, error: job.error, updatedAt: job.updatedAt };
  },
  getJobDetail,
  requeueJob,
  cancelQueuedOrRunningJob,
  ensureDefaultWorkspaceId,
  createJobId,
  createJob,
  updateJobFinalPrompt,
  processReferences,
  hydrateSourceSpecAssetPaths,
  readLibraryDir,
  readLibraryContext,
  validateManagedAssets,
  resolveProviderExecutionBlocker,
  readGrokAvailableModels,
  readCodexTransport,
  resolveBootstrapExecution,
  readEditableSettings,
  isReferenceProcessingError,
  publishEvent,
  logJobCreated,
  enqueueJob,
}: JobRoutesDependencies) {
  const routes = new Hono();
  const persistentJobIntake = createPersistentJobIntake({
    ensureDefaultWorkspaceId,
    createJobId,
    createJob,
    updateJobFinalPrompt,
    processReferences,
    hydrateSourceSpecAssetPaths,
    readLibraryDir,
    readLibraryContext,
    validateManagedAssets,
    resolveProviderExecutionBlocker,
    readGrokAvailableModels,
    readCodexTransport,
    resolveBootstrapExecution,
    readEditableSettings,
    isReferenceProcessingError,
    publishEvent,
    logJobCreated,
    enqueueJob,
  });

  routes.get('/', (c) => {
    const status = c.req.query('status');
    const limit = c.req.query('limit');
    const cursor = c.req.query('cursor');
    const workspaceId = c.req.query('workspaceId');
    if (
      (status && !['completed', 'failed', 'cancelled'].includes(status)) ||
      (limit && (!/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 100)) ||
      (cursor && cursor.length > 1024) ||
      (workspaceId && workspaceId.length > 512)
    ) {
      return c.json({ error: 'Invalid job history filter.' }, 400);
    }
    try {
      return c.json(
        listJobs({
          workspaceId,
          status: status as JobListQuery['status'],
          cursor,
          limit: limit ? Number(limit) : undefined,
        }),
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid job history cursor.')
        return c.json({ error: error.message }, 400);
      throw error;
    }
  });

  routes.get('/:id/status', (c) => {
    const snapshot = getJobStatus(c.req.param('id'));
    if (!snapshot) return c.json({ error: 'Job not found' }, 404);
    return c.json(snapshot);
  });

  routes.get('/:id', async (c) => {
    const detail = await getJobDetail(c.req.param('id'));
    if (!detail) return c.json({ error: 'Job not found' }, 404);
    return c.json(detail);
  });

  routes.post('/:id/cancel', (c) => {
    const jobId = c.req.param('id');
    const job = getJob(jobId);
    if (!job) return c.json({ error: 'Job not found' }, 404);

    if (job.status === 'needs_review') {
      return c.json(
        {
          error: 'Review the job and reconcile its provider result before taking another action.',
          code: 'job_requires_review',
          status: job.status,
        },
        409,
      );
    }

    if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
      return c.json(job);
    }

    const updatedJob = cancelQueuedOrRunningJob(jobId);
    if (!updatedJob) {
      return c.json({ error: 'Job cannot be cancelled right now' }, 409);
    }

    return c.json(updatedJob);
  });

  routes.post('/:id/retry', async (c) => {
    const jobId = c.req.param('id');
    const job = getJob(jobId);
    if (!job) return c.json({ error: 'Job not found' }, 404);

    if (ACTIVE_RETRY_STATUSES.has(job.status)) {
      return c.json(job);
    }

    const resumeRemoteExecution = canResumeStudioJob(job);
    if (!REQUEUEABLE_STATUSES.has(job.status) && !resumeRemoteExecution) {
      return c.json(
        {
          error: 'Job cannot be retried from its current status',
          code: 'invalid_retry_status',
          status: job.status,
        },
        409,
      );
    }

    const providerId = resolveJobProviderId(job);
    if (providerId === 'codex' && !job.execution?.providerOptions?.codex) {
      return c.json(
        {
          error:
            'This job has no captured execution policy. Review its result and create a new job.',
          code: 'codex_execution_missing',
        },
        409,
      );
    }
    const providerBlocker = resumeRemoteExecution
      ? null
      : await resolveProviderExecutionBlocker(providerId);
    if (providerBlocker) {
      return c.json(providerBlocker as Record<string, unknown>, 400);
    }

    if (providerId === 'grok') {
      const grokIssues = collectGrokImagineJobIssues({
        sourceSpec: job.sourceSpec,
        execution: job.execution,
        availableModels: readGrokAvailableModels?.() ?? [],
      });
      if (grokIssues.length > 0) {
        return c.json(
          {
            error: grokIssues[0]!.message,
            code: grokIssues[0]!.code,
            field: grokIssues[0]!.field,
            reason: grokIssues[0]!.message,
            issues: grokIssues,
          },
          400,
        );
      }
    }

    const updatedJob = requeueJob?.(jobId);
    if (!updatedJob) {
      return c.json({ error: 'Job retry is unavailable' }, 409);
    }

    publishEvent('job.progress', updatedJob);
    enqueueJob(updatedJob);
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
      workspaceId: boundaryBody.workspaceId,
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
