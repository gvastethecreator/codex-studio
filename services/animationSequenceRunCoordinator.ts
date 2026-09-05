import type { AnimationSequenceRunView } from '../packages/shared/src';
import { attachAnimationSequenceFrame } from './studio-api/animationSequences';
import { getStudioJobStatus } from './studio-api/jobs';
import { StudioApiError } from './studio-api/http';
import { queryCatalog } from './studio-api/catalog';

interface AnimationSequenceRunCoordinatorDependencies {
  attachFrame?: typeof attachAnimationSequenceFrame;
  readJobStatus?: typeof getStudioJobStatus;
  queryCatalogByJob?: (jobId: string) => ReturnType<typeof queryCatalog>;
}

export function createAnimationSequenceRunCoordinator({
  attachFrame = attachAnimationSequenceFrame,
  readJobStatus = getStudioJobStatus,
  queryCatalogByJob = (jobId) => queryCatalog({ jobId, limit: 1 }),
}: AnimationSequenceRunCoordinatorDependencies = {}) {
  return {
    recordDispatch(runId: string, frameId: string, jobId: string) {
      return attachFrame(runId, { frameId, jobId });
    },

    async reconcile(run: AnimationSequenceRunView) {
      const pendingFrames = run.frames.filter((frame) => frame.jobId && !frame.catalogImageId);
      const snapshots = await Promise.all(
        pendingFrames.map(async (frame) => {
          try {
            return { frame, job: await readJobStatus(frame.jobId!) };
          } catch (error) {
            if (error instanceof StudioApiError && error.status === 404) return null;
            throw error;
          }
        }),
      );
      const completedFrames = snapshots.flatMap((entry) =>
        entry?.job.status === 'completed' ? [entry] : [],
      );
      const resolvedFrames = await Promise.all(
        completedFrames.map(async ({ frame, job }) => ({
          frame,
          job,
          image: (await queryCatalogByJob(job.id)).images[0] ?? null,
        })),
      );
      let current = run;
      // Revisions of one run must serialize so later writes cannot overwrite earlier frame links.
      for (const { frame, job, image } of resolvedFrames) {
        if (!image) continue;
        // react-doctor-disable-next-line react-doctor/async-await-in-loop
        current = await attachFrame(run.id, {
          frameId: frame.id,
          jobId: job.id,
          catalogImageId: image.id,
        });
      }
      return current;
    },
  };
}

export const animationSequenceRunCoordinator = createAnimationSequenceRunCoordinator();
