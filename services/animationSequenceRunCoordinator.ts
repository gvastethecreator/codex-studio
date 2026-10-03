import {
  isAnimationSequenceFrameAwaitingJob,
  type AnimationSequenceBlockedReason,
  type AnimationSequenceRunView,
  type JobStatusSnapshot,
} from '../packages/shared/src';
import { attachAnimationSequenceFrame } from './studio-api/animationSequences';
import { getStudioJobStatus } from './studio-api/jobs';
import { StudioApiError } from './studio-api/http';
import { queryCatalog } from './studio-api/catalog';

interface AnimationSequenceRunCoordinatorDependencies {
  attachFrame?: typeof attachAnimationSequenceFrame;
  readJobStatus?: typeof getStudioJobStatus;
  queryCatalogByJob?: (jobId: string) => ReturnType<typeof queryCatalog>;
}

function blockedReason(
  reasonKind: AnimationSequenceBlockedReason['reasonKind'],
  userMessage: string,
  suggestion: string,
): AnimationSequenceBlockedReason {
  return { status: 'blocked', reasonKind, userMessage, suggestion };
}

const RETRY_SUGGESTION = 'Select Retry to queue this frame again.';

/** Terminal jobs that produced no frame image. Queued and running jobs stay linked. */
function describeUnfinishedJob(job: JobStatusSnapshot | null) {
  if (!job) {
    return blockedReason('unknown', 'The frame job no longer exists.', RETRY_SUGGESTION);
  }
  if (job.status === 'failed') {
    return blockedReason(
      'runner_failed',
      job.error ? `The frame job failed: ${job.error}` : 'The frame job failed.',
      RETRY_SUGGESTION,
    );
  }
  if (job.status === 'cancelled') {
    return blockedReason('runner_failed', 'The frame job was cancelled.', RETRY_SUGGESTION);
  }
  if (job.status === 'needs_review') {
    return blockedReason(
      'no_image_returned',
      'The frame job needs review: the provider did not confirm an image.',
      'Resolve the job in Queue, then select Sync. Or select Retry to queue the frame again.',
    );
  }
  if (job.status === 'completed') {
    return blockedReason(
      'no_image_returned',
      'The frame job completed, but its image is not in the Catalog.',
      RETRY_SUGGESTION,
    );
  }
  return null;
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
      // Blocked frames stay linked so a job resumed or retried from Queue can still land.
      const linkedFrames = run.frames.filter(
        (frame) =>
          frame.jobId && (isAnimationSequenceFrameAwaitingJob(frame) || frame.status === 'blocked'),
      );
      const updates = await Promise.all(
        linkedFrames.map(async (frame) => {
          const jobId = frame.jobId!;
          let job: JobStatusSnapshot | null;
          try {
            job = await readJobStatus(jobId);
          } catch (error) {
            if (!(error instanceof StudioApiError && error.status === 404)) throw error;
            job = null;
          }
          const image =
            job?.status === 'completed'
              ? ((await queryCatalogByJob(jobId)).images[0] ?? null)
              : null;
          if (image) {
            return image.id === frame.catalogImageId && frame.status === 'blocked'
              ? null
              : { frameId: frame.id, jobId, catalogImageId: image.id };
          }
          const blocked = isAnimationSequenceFrameAwaitingJob(frame)
            ? describeUnfinishedJob(job)
            : null;
          return blocked ? { frameId: frame.id, jobId, blocked } : null;
        }),
      );
      let current = run;
      // Revisions of one run must serialize so later writes cannot overwrite earlier frame links.
      for (const update of updates) {
        if (!update) continue;
        // react-doctor-disable-next-line react-doctor/async-await-in-loop
        current = await attachFrame(run.id, update);
      }
      return current;
    },
  };
}

export const animationSequenceRunCoordinator = createAnimationSequenceRunCoordinator();
