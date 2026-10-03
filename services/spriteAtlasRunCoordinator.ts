import type {
  JobStatusSnapshot,
  SpriteAtlasBlockedReason,
  SpriteAtlasRun,
} from '../packages/shared/src';
import { getStudioJobStatus } from './studio-api/jobs';
import { StudioApiError } from './studio-api/http';
import { queryCatalog } from './studio-api/catalog';
import { importSpriteAtlasRow, recordSpriteAtlasRowDispatch } from './studio-api/spriteAtlas';

export interface SpriteAtlasReadyImport {
  rowId: string;
  jobId: string;
  catalogImageId: string;
}

interface SpriteAtlasRunCoordinatorDependencies {
  recordDispatchCall?: typeof recordSpriteAtlasRowDispatch;
  recordBlockedCall?: (
    runId: string,
    rowId: string,
    blocked: SpriteAtlasBlockedReason,
  ) => Promise<SpriteAtlasRun>;
  readJobStatus?: typeof getStudioJobStatus;
  queryCatalogByJob?: (jobId: string) => ReturnType<typeof queryCatalog>;
}

/** A finished job without an image blocks its row. Queue is the retry path. */
function blockedReasonForJob(
  rowId: string,
  job: JobStatusSnapshot | null,
): SpriteAtlasBlockedReason | null {
  const suggestion = `Queue ${rowId} again to retry.`;
  if (!job) {
    return {
      status: 'blocked',
      reasonKind: 'no_image_returned',
      userMessage: `The ${rowId} job no longer exists.`,
      suggestion,
    };
  }
  if (job.status === 'failed') {
    return {
      status: 'blocked',
      reasonKind: 'runner_failed',
      userMessage: `The ${rowId} job failed.${job.error ? ` ${job.error}` : ''}`,
      suggestion,
    };
  }
  if (job.status === 'cancelled') {
    return {
      status: 'blocked',
      reasonKind: 'runner_failed',
      userMessage: `The ${rowId} job was cancelled.`,
      suggestion,
    };
  }
  return null;
}

export function createSpriteAtlasRunCoordinator({
  recordDispatchCall = recordSpriteAtlasRowDispatch,
  recordBlockedCall = (runId, rowId, blocked) => importSpriteAtlasRow(runId, { rowId, blocked }),
  readJobStatus = getStudioJobStatus,
  queryCatalogByJob = (jobId) => queryCatalog({ jobId, limit: 1 }),
}: SpriteAtlasRunCoordinatorDependencies = {}) {
  return {
    recordDispatch(runId: string, rowId: string, jobId: string) {
      return recordDispatchCall(runId, rowId, jobId);
    },

    async reconcile(run: SpriteAtlasRun) {
      const pendingRows = run.rows.filter((row) => row.jobId && row.status === 'generating');
      const snapshots = await Promise.all(
        pendingRows.map(async (row) => {
          try {
            return { row, job: await readJobStatus(row.jobId!) };
          } catch (error) {
            if (error instanceof StudioApiError && error.status === 404) return { row, job: null };
            throw error;
          }
        }),
      );
      let current = run;
      for (const { row, job } of snapshots) {
        const blocked = blockedReasonForJob(row.id, job);
        if (blocked) current = await recordBlockedCall(run.id, row.id, blocked);
      }
      const ready = (
        await Promise.all(
          snapshots.flatMap(({ row, job }) =>
            job?.status === 'completed'
              ? [
                  queryCatalogByJob(job.id).then((page) => {
                    const image = page.images[0];
                    if (!image) return null;
                    return {
                      rowId: row.id,
                      jobId: job.id,
                      catalogImageId: image.id,
                    } satisfies SpriteAtlasReadyImport;
                  }),
                ]
              : [],
          ),
        )
      ).flatMap((item) => (item ? [item] : []));
      return { run: current, ready };
    },
  };
}

export const spriteAtlasRunCoordinator = createSpriteAtlasRunCoordinator();
