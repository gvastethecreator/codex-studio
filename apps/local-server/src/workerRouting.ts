import {
  isGenerationTaskKind,
  type GenerationTaskKind,
  type Job,
} from '../../../packages/shared/src';

export type WorkerRuntimeTarget = 'dry_run' | 'codex' | 'external';

function resolveGenerationTaskFromJob(
  job: Pick<Job, 'kind' | 'sourceSpec'>,
): GenerationTaskKind | null {
  const sourceTask = job.sourceSpec?.task;
  if (sourceTask && isGenerationTaskKind(sourceTask)) {
    return sourceTask;
  }

  return isGenerationTaskKind(job.kind) ? job.kind : null;
}

export function resolveWorkerRuntimeTarget(
  job: Pick<Job, 'kind' | 'providerId' | 'sourceSpec'>,
): WorkerRuntimeTarget | null {
  const providerId = job.providerId ?? job.sourceSpec?.providerId ?? null;

  if (job.kind === 'dry_run' || providerId === 'dry_run') {
    return 'dry_run';
  }

  if (providerId === 'google' || providerId === 'fal' || providerId === 'comfy') {
    return 'external';
  }

  if (providerId && providerId !== 'codex') {
    return null;
  }

  if (job.kind === 'codex_imagegen') {
    return 'codex';
  }

  if (resolveGenerationTaskFromJob(job)) {
    return 'codex';
  }

  return providerId === 'codex' ? 'codex' : null;
}
