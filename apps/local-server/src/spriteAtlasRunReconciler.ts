import type { Job, SpriteAtlasRun } from '../../../packages/shared/src';
import { getCatalogImageByJobId } from './catalog';
import { getJob } from './db/jobs';
import type { SpriteAtlasJobLookup, SpriteAtlasService } from './spriteAtlasService';
import type { WorkflowRunParticipant } from './workflowRunReconciler';

export const defaultSpriteAtlasJobLookup: SpriteAtlasJobLookup = {
  getJob: (jobId) => getJob(jobId),
  getCatalogImageByJobId: (jobId) => getCatalogImageByJobId(jobId),
};

export interface SpriteAtlasRunParticipant extends WorkflowRunParticipant {
  /** Settles one run from stored job state. Used at startup and by manual Sync. */
  reconcileRun(runId: string): Promise<SpriteAtlasRun | null>;
}

function readRowTarget(params: Record<string, unknown> | null | undefined) {
  const runId = params?.runId;
  const rowId = params?.rowId;
  return typeof runId === 'string' && runId && typeof rowId === 'string' && rowId
    ? { runId, rowId }
    : null;
}

function groupByRow(jobs: Job[]) {
  const groups = new Map<string, { runId: string; rowId: string; jobs: Job[] }>();
  for (const job of jobs) {
    const target = readRowTarget(job.sourceSpec?.recipeParams);
    if (!target) continue;
    const key = JSON.stringify([target.runId, target.rowId]);
    const group = groups.get(key) ?? { ...target, jobs: [] };
    group.jobs.push(job);
    groups.set(key, group);
  }
  return [...groups.values()];
}

/** Sprite Atlas lane of the workflow run reconciler. */
export function createSpriteAtlasRunParticipant(
  service: SpriteAtlasService,
  lookup: SpriteAtlasJobLookup = defaultSpriteAtlasJobLookup,
): SpriteAtlasRunParticipant {
  async function reconcileRun(runId: string) {
    return (await service.reconcileRun(runId, lookup))?.run ?? null;
  }

  return {
    recipeId: 'sprite-atlas',

    async validateDispatch(spec) {
      const target = readRowTarget(spec.recipeParams);
      return target ? service.validateRowDispatch(target.runId, target.rowId) : null;
    },

    async recordDispatch(jobs) {
      for (const group of groupByRow(jobs)) {
        await service.recordRowDispatch(
          group.runId,
          group.rowId,
          group.jobs.map((job) => job.id),
        );
      }
    },

    async settle(job) {
      const target = readRowTarget(job.sourceSpec?.recipeParams);
      if (!target) return false;
      return service.settleRowJob(target.runId, target.rowId, job, lookup);
    },

    async recover(jobs) {
      // A job accepted just before a restart may be missing from its row.
      for (const group of groupByRow(jobs)) {
        const run = await service.getRun(group.runId);
        const dispatch = run?.rows.find((row) => row.id === group.rowId)?.dispatch;
        const missing = group.jobs.filter(
          (job) =>
            !dispatch ||
            (!dispatch.jobIds.includes(job.id) && job.createdAt > dispatch.dispatchedAt),
        );
        if (missing.length > 0) {
          await service.recordRowDispatch(
            group.runId,
            group.rowId,
            missing.map((job) => job.id),
          );
        }
      }
      for (const run of await service.listRuns()) {
        const awaiting = run.rows.some(
          (row) => row.dispatch && (row.status === 'generating' || row.status === 'blocked'),
        );
        if (awaiting) await reconcileRun(run.id);
      }
    },

    reconcileRun,
  };
}
