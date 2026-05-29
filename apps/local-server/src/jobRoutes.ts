import { Hono } from "hono";
import type {
  CreateJobRequest,
  GenerationTaskSpec,
  Job,
  JobDetailResponse,
} from "../../../packages/shared/src";
import type { publishEvent } from "./events";

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
  listJobs: () => Job[];
  getJob: (jobId: string) => Job | null;
  getJobDetail: (jobId: string) => Promise<JobDetailResponse | null>;
  cancelQueuedOrRunningJob: (jobId: string) => Job | null;
  ensureDefaultProjectId: () => string;
  createJobId: () => string;
  createJob: (input: {
    id: string;
    projectId: string;
    kind: Job["kind"];
    providerId: Job["providerId"];
    sourceSpec: GenerationTaskSpec | null;
    prompt: string;
    execution: Job["execution"];
  }) => Job;
  updateJobFinalPrompt: (jobId: string, finalPrompt: string) => Job | null;
  processReferences: (
    jobId: string,
    prompt: string,
    references: CreateJobRequest["references"],
    libraryDir: string,
  ) => Promise<ProcessReferencesResult>;
  hydrateSourceSpecAssetPaths: (
    sourceSpec: GenerationTaskSpec | null,
    references: CreateJobRequest["references"],
    persistedRefs: unknown[],
  ) => GenerationTaskSpec | null;
  readLibraryDir: () => string;
  resolveProviderExecutionBlocker: (providerId: string) => unknown;
  isReferenceProcessingError: (error: unknown) => error is ReferenceProcessingErrorLike;
  publishEvent: typeof publishEvent;
  logJobCreated: (kind: string, jobId: string) => void;
  enqueueJob: (job: Job) => void;
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

  routes.get("/", (c) => c.json(listJobs()));

  routes.get("/:id", async (c) => {
    const detail = await getJobDetail(c.req.param("id"));
    if (!detail) return c.json({ error: "Job not found" }, 404);
    return c.json(detail);
  });

  routes.post("/:id/cancel", (c) => {
    const jobId = c.req.param("id");
    const job = getJob(jobId);
    if (!job) return c.json({ error: "Job not found" }, 404);

    if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
      return c.json(job);
    }

    const updatedJob = cancelQueuedOrRunningJob(jobId);
    if (!updatedJob) {
      return c.json({ error: "Job cannot be cancelled right now" }, 409);
    }

    return c.json(updatedJob);
  });

  routes.post("/", async (c) => {
    const body = (await c.req.json()) as CreateJobRequest;
    const projectId = body.projectId || ensureDefaultProjectId();
    const prompt = (body.prompt || body.sourceSpec?.prompt || "").trim();
    if (!prompt) return c.json({ error: "Prompt is required" }, 400);
    const jobId = createJobId();

    const providerId =
      body.kind === "dry_run"
        ? "dry_run"
        : (body.providerId ?? body.sourceSpec?.providerId ?? "codex");

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

    publishEvent("job.created", queuedJob);
    logJobCreated(queuedJob.kind, queuedJob.id);
    enqueueJob(queuedJob);
    return c.json(queuedJob, 201);
  });

  return routes;
}