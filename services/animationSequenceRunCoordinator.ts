import type { AnimationSequenceRunView, JobSummary } from '../packages/shared/src';
import { attachAnimationSequenceFrame, listStudioJobs, queryCatalog } from './localStudioService';

interface AnimationSequenceRunCoordinatorDependencies {
  attachFrame?: typeof attachAnimationSequenceFrame;
  listJobs?: () => Promise<JobSummary[]>;
  queryCatalogByJob?: (jobId: string) => ReturnType<typeof queryCatalog>;
}

export function createAnimationSequenceRunCoordinator({
  attachFrame = attachAnimationSequenceFrame,
  listJobs = listStudioJobs,
  queryCatalogByJob = (jobId) => queryCatalog({ jobId, limit: 1 }),
}: AnimationSequenceRunCoordinatorDependencies = {}) {
  return {
    recordDispatch(runId: string, frameId: string, jobId: string) {
      return attachFrame(runId, { frameId, jobId });
    },

    async reconcile(run: AnimationSequenceRunView) {
      const jobs = await listJobs();
      const jobsById = new Map(jobs.map((job) => [job.id, job]));
      const completedFrames = run.frames.flatMap((frame) => {
        if (!frame.jobId || frame.catalogImageId) return [];
        const job = jobsById.get(frame.jobId);
        return job?.status === 'completed' ? [{ frame, job }] : [];
      });
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
