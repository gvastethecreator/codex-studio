import type { SpriteAtlasRun } from '../packages/shared/src';
import { getStudioJobStatus } from './studio-api/jobs';
import { StudioApiError } from './studio-api/http';
import { queryCatalog } from './studio-api/catalog';
import { recordSpriteAtlasRowDispatch } from './studio-api/spriteAtlas';

export interface SpriteAtlasReadyImport {
  rowId: string;
  jobId: string;
  catalogImageId: string;
}

interface SpriteAtlasRunCoordinatorDependencies {
  recordDispatchCall?: typeof recordSpriteAtlasRowDispatch;
  readJobStatus?: typeof getStudioJobStatus;
  queryCatalogByJob?: (jobId: string) => ReturnType<typeof queryCatalog>;
}

export function createSpriteAtlasRunCoordinator({
  recordDispatchCall = recordSpriteAtlasRowDispatch,
  readJobStatus = getStudioJobStatus,
  queryCatalogByJob = (jobId) => queryCatalog({ jobId, limit: 1 }),
}: SpriteAtlasRunCoordinatorDependencies = {}) {
  return {
    recordDispatch(runId: string, rowId: string, jobId: string) {
      return recordDispatchCall(runId, rowId, jobId);
    },

    async reconcile(run: SpriteAtlasRun) {
      const pendingRows = run.rows.filter(
        (row) => row.jobId && row.status === 'generating' && !row.catalogImageId && !row.rawPath,
      );
      const snapshots = await Promise.all(
        pendingRows.map(async (row) => {
          try {
            return { row, job: await readJobStatus(row.jobId!) };
          } catch (error) {
            if (error instanceof StudioApiError && error.status === 404) return null;
            throw error;
          }
        }),
      );
      const ready = (
        await Promise.all(
          snapshots.flatMap((entry) =>
            entry?.job.status === 'completed'
              ? [
                  queryCatalogByJob(entry.job.id).then((page) => {
                    const image = page.images[0];
                    if (!image) return null;
                    return {
                      rowId: entry.row.id,
                      jobId: entry.job.id,
                      catalogImageId: image.id,
                    } satisfies SpriteAtlasReadyImport;
                  }),
                ]
              : [],
          ),
        )
      ).flatMap((item) => (item ? [item] : []));
      return { run, ready };
    },
  };
}

export const spriteAtlasRunCoordinator = createSpriteAtlasRunCoordinator();
