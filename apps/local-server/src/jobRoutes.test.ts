import { describe, expect, it, vi } from "vite-plus/test";
import type { GenerationTaskSpec, Job, JobDetailResponse } from "../../../packages/shared/src";
import { createJobRoutes } from "./jobRoutes";

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: overrides.id ?? "job-1",
    projectId: overrides.projectId ?? "project-1",
    kind: overrides.kind ?? "codex_imagegen",
    providerId: overrides.providerId ?? "codex",
    sourceSpec: overrides.sourceSpec ?? null,
    status: overrides.status ?? "queued",
    execution: overrides.execution ?? null,
    originalPrompt: overrides.originalPrompt ?? "orig",
    expandedPrompt: overrides.expandedPrompt ?? null,
    finalPromptUsed: overrides.finalPromptUsed ?? "orig",
    error: overrides.error ?? null,
    createdAt: overrides.createdAt ?? "2026-05-29T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-05-29T00:00:00.000Z",
    completedAt: overrides.completedAt ?? null,
  };
}

function createSourceSpec(overrides: Partial<GenerationTaskSpec> = {}): GenerationTaskSpec {
  return {
    kind: overrides.kind ?? "codex_imagegen",
    providerId: overrides.providerId ?? "codex",
    prompt: overrides.prompt ?? "draw a lighthouse",
    normalizedPrompt: overrides.normalizedPrompt ?? null,
    model: overrides.model ?? null,
    reasoningEffort: overrides.reasoningEffort ?? null,
    serviceTier: overrides.serviceTier ?? null,
    output: overrides.output ?? { format: "png", count: 1, size: null, aspectRatio: null },
    assets: overrides.assets ?? [],
    metadata: overrides.metadata ?? null,
  };
}

function createJobDetail(job: Job): JobDetailResponse {
  return {
    job,
    events: [],
    turn: null,
    transcriptEntries: [],
    catalogImages: [],
    metrics: {
      timings: [],
      tokenUsage: null,
      estimatedPromptTokens: 0,
    },
  };
}

describe("jobRoutes", () => {
  it("lists jobs and returns detail when found", async () => {
    const job = createJob({ id: "job-1" });
    const routes = createJobRoutes({
      listJobs: () => [job],
      getJob: () => null,
      getJobDetail: async (jobId) => (jobId === "job-1" ? createJobDetail(job) : null),
      cancelQueuedOrRunningJob: () => null,
      ensureDefaultProjectId: () => "project-1",
      createJobId: () => "job-new",
      createJob: () => job,
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({ augmentedPrompt: "x", persistedRefs: [] }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,
      readLibraryDir: () => "D:/library",
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError: () => false,
      publishEvent: () => {},
      logJobCreated: () => {},
      enqueueJob: () => {},
    });

    const listResponse = await routes.request("/");
    expect(listResponse.status).toBe(200);
    await expect(listResponse.json()).resolves.toEqual([job]);

    const detailResponse = await routes.request("/job-1");
    expect(detailResponse.status).toBe(200);
    await expect(detailResponse.json()).resolves.toEqual(expect.objectContaining({ job }));

    const missingResponse = await routes.request("/missing");
    expect(missingResponse.status).toBe(404);
  });

  it("cancels queued jobs and keeps terminal jobs unchanged", async () => {
    const queued = createJob({ id: "job-q", status: "queued" });
    const cancelled = createJob({ id: "job-q", status: "cancelled" });
    const completed = createJob({ id: "job-done", status: "completed" });

    const getJob = vi
      .fn<(...args: [string]) => Job | null>()
      .mockImplementation((jobId) => {
        if (jobId === "job-q") return queued;
        if (jobId === "job-done") return completed;
        return null;
      });

    const cancelQueuedOrRunningJob = vi
      .fn<(...args: [string]) => Job | null>()
      .mockImplementation((jobId) => (jobId === "job-q" ? cancelled : null));

    const routes = createJobRoutes({
      listJobs: () => [],
      getJob,
      getJobDetail: async () => null,
      cancelQueuedOrRunningJob,
      ensureDefaultProjectId: () => "project-1",
      createJobId: () => "job-new",
      createJob: () => queued,
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({ augmentedPrompt: "x", persistedRefs: [] }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,
      readLibraryDir: () => "D:/library",
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError: () => false,
      publishEvent: () => {},
      logJobCreated: () => {},
      enqueueJob: () => {},
    });

    const cancelledResponse = await routes.request("/job-q/cancel", { method: "POST" });
    expect(cancelledResponse.status).toBe(200);
    await expect(cancelledResponse.json()).resolves.toEqual(cancelled);

    const terminalResponse = await routes.request("/job-done/cancel", { method: "POST" });
    expect(terminalResponse.status).toBe(200);
    await expect(terminalResponse.json()).resolves.toEqual(completed);

    const missingResponse = await routes.request("/missing/cancel", { method: "POST" });
    expect(missingResponse.status).toBe(404);
  });

  it("creates jobs with reference processing and provider blocker checks", async () => {
    const publishEvent = vi.fn();
    const enqueueJob = vi.fn();
    const logJobCreated = vi.fn();
    const created = createJob({ id: "job-new", kind: "codex_imagegen" });

    const routes = createJobRoutes({
      listJobs: () => [],
      getJob: () => null,
      getJobDetail: async () => null,
      cancelQueuedOrRunningJob: () => null,
      ensureDefaultProjectId: () => "project-default",
      createJobId: () => "job-new",
      createJob: () => created,
      updateJobFinalPrompt: () => created,
      processReferences: async () => ({
        augmentedPrompt: "draw a lighthouse with refs",
        persistedRefs: [{ id: "ref-1" }],
      }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,
      readLibraryDir: () => "D:/library",
      resolveProviderExecutionBlocker: (providerId) =>
        providerId === "blocked" ? { error: "provider_blocked" } : null,
      isReferenceProcessingError: (error): error is { message: string; referenceName: string | null; reason: string } =>
        typeof error === "object" && error !== null && "reason" in error,
      publishEvent,
      logJobCreated,
      enqueueJob,
    });

    const blockedResponse = await routes.request("/", {
      method: "POST",
      body: JSON.stringify({ kind: "codex_imagegen", prompt: "x", providerId: "blocked" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(blockedResponse.status).toBe(400);

    const createResponse = await routes.request("/", {
      method: "POST",
      body: JSON.stringify({
        kind: "codex_imagegen",
        prompt: "draw a lighthouse",
        sourceSpec: createSourceSpec(),
      }),
      headers: { "Content-Type": "application/json" },
    });

    expect(createResponse.status).toBe(201);
    await expect(createResponse.json()).resolves.toEqual(created);
    expect(publishEvent).toHaveBeenCalledWith("job.created", created);
    expect(logJobCreated).toHaveBeenCalledWith("codex_imagegen", "job-new");
    expect(enqueueJob).toHaveBeenCalledWith(created);

    const invalidPromptResponse = await routes.request("/", {
      method: "POST",
      body: JSON.stringify({ kind: "codex_imagegen", prompt: "   " }),
      headers: { "Content-Type": "application/json" },
    });
    expect(invalidPromptResponse.status).toBe(400);
  });
});