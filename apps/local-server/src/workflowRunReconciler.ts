import type {
  GenerationTaskSpec,
  Job,
  StudioEvent,
  UnknownStudioEvent,
  WorkflowRunUpdatedEventPayload,
} from '../../../packages/shared/src';
import type { publishEvent } from './events';
import type { log } from './logger';

export interface WorkflowRunDispatchIssue {
  code: string;
  message: string;
}

/**
 * One backend-owned workflow lane. Its run state follows the jobs whose
 * `sourceSpec.recipeId` matches `recipeId`.
 */
export interface WorkflowRunParticipant {
  recipeId: string;
  /** Rejects a job before it is committed. Null accepts it. */
  validateDispatch?(
    spec: GenerationTaskSpec,
  ): WorkflowRunDispatchIssue | null | Promise<WorkflowRunDispatchIssue | null>;
  /** Records accepted jobs on their runs before the worker can start them. */
  recordDispatch(jobs: Job[]): Promise<void>;
  /** Folds a settled or requeued job into its run. True when the run changed. */
  settle(job: Job): Promise<boolean>;
  /** Repairs runs at startup. Receives this lane's queued and running jobs. */
  recover(jobs: Job[]): Promise<void>;
}

export interface WorkflowRunReconcilerDependencies {
  participants: WorkflowRunParticipant[];
  getJob: (jobId: string) => Job | null;
  logger: typeof log;
  publishEvent: typeof publishEvent;
}

export interface WorkflowRunReconciler {
  jobsAccepted(jobs: Job[]): Promise<void>;
  /** Event listener. It never throws and defers all work. */
  onStudioEvent: (event: StudioEvent | UnknownStudioEvent) => void;
  recover(recoverableJobs: Job[]): Promise<void>;
  validateDispatch(spec: GenerationTaskSpec): Promise<WorkflowRunDispatchIssue | null>;
  /** Resolves once no reconciliation work is in flight. */
  drain(): Promise<void>;
}

const SETTLED_JOB_EVENT_TYPES = new Set([
  'job.progress',
  'job.completed',
  'job.failed',
  'job.cancelled',
]);
const SETTLED_JOB_STATUSES = new Set<Job['status']>([
  'completed',
  'failed',
  'cancelled',
  'needs_review',
  'queued',
]);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function readRunId(job: Job) {
  const runId = job.sourceSpec?.recipeParams?.runId;
  return typeof runId === 'string' && runId ? runId : null;
}

function readEventJob(event: StudioEvent | UnknownStudioEvent): Job | null {
  if (!SETTLED_JOB_EVENT_TYPES.has(event.type)) return null;
  const job = event.payload as Job | null;
  if (!job || typeof job !== 'object' || typeof job.id !== 'string') return null;
  return SETTLED_JOB_STATUSES.has(job.status) ? job : null;
}

export function createWorkflowRunReconciler({
  participants,
  getJob,
  logger,
  publishEvent,
}: WorkflowRunReconcilerDependencies): WorkflowRunReconciler {
  const participantsByRecipe = new Map(
    participants.map((participant) => [participant.recipeId, participant]),
  );
  const inFlight = new Set<Promise<void>>();

  function participantFor(recipeId: string | null | undefined) {
    return recipeId ? (participantsByRecipe.get(recipeId) ?? null) : null;
  }

  function groupByParticipant(jobs: Job[]) {
    const groups = new Map<WorkflowRunParticipant, Job[]>();
    for (const job of jobs) {
      const participant = participantFor(job.sourceSpec?.recipeId);
      if (!participant) continue;
      groups.set(participant, [...(groups.get(participant) ?? []), job]);
    }
    return groups;
  }

  function warn(message: string, jobId?: string) {
    try {
      logger('warn', 'workflow', message, jobId);
    } catch {
      // Logging must not turn a reconciliation failure into a crash.
    }
  }

  function track(work: Promise<void>) {
    const tracked = work.catch((error) => {
      warn(`Workflow run reconciliation failed: ${errorMessage(error)}`);
    });
    inFlight.add(tracked);
    void tracked.finally(() => inFlight.delete(tracked));
    return tracked;
  }

  async function settle(eventJob: Job) {
    const participant = participantFor(eventJob.sourceSpec?.recipeId);
    if (!participant) return;
    // Read the stored job: the event may be older than the latest write.
    const job = getJob(eventJob.id) ?? eventJob;
    if (!SETTLED_JOB_STATUSES.has(job.status)) return;
    let changed: boolean;
    try {
      changed = await participant.settle(job);
    } catch (error) {
      warn(`${participant.recipeId} run could not settle job: ${errorMessage(error)}`, job.id);
      return;
    }
    const runId = readRunId(job);
    if (!changed || !runId) return;
    const payload: WorkflowRunUpdatedEventPayload = { recipeId: participant.recipeId, runId };
    publishEvent('workflow-run.updated', payload);
  }

  return {
    jobsAccepted(jobs) {
      const groups = [...groupByParticipant(jobs)];
      return track(
        Promise.all(
          groups.map(async ([participant, participantJobs]) => {
            try {
              await participant.recordDispatch(participantJobs);
            } catch (error) {
              warn(`${participant.recipeId} run could not record dispatch: ${errorMessage(error)}`);
            }
          }),
        ).then(() => undefined),
      );
    },

    onStudioEvent(event) {
      try {
        const job = readEventJob(event);
        if (!job || !participantFor(job.sourceSpec?.recipeId)) return;
        // Listeners run inside the publisher's write; settle in a later microtask.
        void track(Promise.resolve().then(() => settle(job)));
      } catch {
        // A malformed event must never reach the publisher.
      }
    },

    recover(recoverableJobs) {
      const groups = groupByParticipant(recoverableJobs);
      return track(
        Promise.all(
          participants.map(async (participant) => {
            try {
              await participant.recover(groups.get(participant) ?? []);
            } catch (error) {
              warn(`${participant.recipeId} runs could not recover: ${errorMessage(error)}`);
            }
          }),
        ).then(() => undefined),
      );
    },

    async validateDispatch(spec) {
      return (await participantFor(spec.recipeId)?.validateDispatch?.(spec)) ?? null;
    },

    async drain() {
      while (inFlight.size > 0) await Promise.allSettled(inFlight);
    },
  };
}
