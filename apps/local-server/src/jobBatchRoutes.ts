import { createHash } from 'node:crypto';
import { Hono } from 'hono';
import { Either, Schema } from 'effect';
import { CreateJobRequestBoundarySchema } from '../../../packages/shared/src/studioApiSchemas';
import type { CreateJobRequest, RetryJobBatchRequest } from '../../../packages/shared/src';
import type {
  createPersistentJobIntake,
  PersistentJobIntakeDependencies,
  PreparedPersistentJob,
} from './persistentJobIntake';
import { BatchRequestConflictError, type JobBatchStore } from './db/jobBatches';

function requestHash(value: unknown): string {
  const canonical = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(canonical);
    if (item && typeof item === 'object')
      return Object.fromEntries(
        Object.entries(item)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, child]) => [key, canonical(child)]),
      );
    return item;
  };
  return createHash('sha256')
    .update(JSON.stringify(canonical(value)))
    .digest('hex');
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
function validRequestId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9-]{8,128}$/i.test(value);
}

export function createJobBatchRoutes({
  store,
  intake,
  resolveProviderExecutionBlocker,
}: {
  store: JobBatchStore;
  intake: ReturnType<typeof createPersistentJobIntake>;
  resolveProviderExecutionBlocker: PersistentJobIntakeDependencies['resolveProviderExecutionBlocker'];
}) {
  const routes = new Hono();
  routes.onError((error, c) => {
    if (error instanceof BatchRequestConflictError) return c.json({ error: error.message }, 409);
    throw error;
  });
  routes.get('/:id', (c) => {
    const batch = store.getJobBatch(c.req.param('id'));
    return batch ? c.json(batch) : c.json({ error: 'Batch not found' }, 404);
  });
  routes.get('/:id/summary', (c) => {
    const batch = store.getJobBatchSummary(c.req.param('id'));
    return batch ? c.json(batch) : c.json({ error: 'Batch not found' }, 404);
  });
  routes.post('/', async (c) => {
    const body: unknown = await c.req.json().catch(() => null);
    if (
      !isRecord(body) ||
      !validRequestId(body.requestId) ||
      !body.requestId.startsWith('batch-') ||
      !Array.isArray(body.items) ||
      !body.items.length ||
      body.items.length > 16
    )
      return c.json({ error: 'A batch needs a request identity and between 1 and 16 items.' }, 400);
    const hash = requestHash(body.items);
    const accepted = store.findAcceptedJobBatch(body.requestId, hash);
    if (accepted) return c.json(accepted);
    const requests: CreateJobRequest[] = [];
    for (const item of body.items) {
      const decoded = Schema.decodeUnknownEither(CreateJobRequestBoundarySchema)(item);
      if (Either.isLeft(decoded))
        return c.json({ error: 'Invalid batch item. No jobs were accepted.' }, 400);
      requests.push(decoded.right as CreateJobRequest);
    }
    const prepared: PreparedPersistentJob[] = [];
    for (const item of requests) {
      const result = await intake.prepareJob(item);
      if (!result.ok) return c.json(result.error.body, result.error.status);
      prepared.push(result.prepared);
    }
    const result = store.createJobBatch(body.requestId, hash, prepared);
    // SQLite commits every member before the first worker can start.
    if (result.created) intake.dispatchJobs(result.batch.jobs);
    return c.json(result.batch, result.created ? 201 : 200);
  });
  routes.post('/:id/retry', async (c) => {
    const raw: unknown = await c.req.json().catch(() => null);
    if (
      !isRecord(raw) ||
      !validRequestId(raw.requestId) ||
      !Array.isArray(raw.items) ||
      !raw.items.length ||
      raw.items.length > 16 ||
      raw.items.some(
        (item) =>
          !isRecord(item) ||
          typeof item.jobId !== 'string' ||
          !Number.isInteger(item.attempt) ||
          Number(item.attempt) < 1,
      )
    )
      return c.json(
        { error: 'Retry requires a request identity and the failed attempt identities.' },
        400,
      );
    const request = raw as unknown as RetryJobBatchRequest;
    if (new Set(request.items.map((item) => item.jobId)).size !== request.items.length)
      return c.json({ error: 'Retry items must be unique.' }, 400);
    const id = c.req.param('id');
    const batch = store.getJobBatch(id);
    if (!batch) return c.json({ error: 'Batch not found' }, 404);
    for (const providerId of new Set(
      batch.jobs
        .filter(
          (job) =>
            request.items.some((item) => item.jobId === job.id && item.attempt === job.attempt) &&
            job.status === 'failed',
        )
        .map((job) => job.providerId),
    )) {
      const blocker = await resolveProviderExecutionBlocker(providerId ?? 'codex');
      if (blocker) return c.json(blocker, 400);
    }
    const result = store.retryFailedJobBatch(id, request, requestHash(request.items));
    if (!result) return c.json({ error: 'Batch not found' }, 404);
    intake.dispatchJobs(result.queued);
    return c.json(result.batch);
  });
  return routes;
}
