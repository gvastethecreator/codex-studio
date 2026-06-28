import {
  isGenerationTaskKind,
  type GenerationTaskKind,
} from '../../../packages/shared/src/generationContracts';
import type { Job } from '../../../packages/shared/src/types';
import {
  resolveProviderWorkerRuntimeTarget,
  type WorkerRuntimeTarget,
} from './providers/providerRegistry';

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
  const providerTarget = resolveProviderWorkerRuntimeTarget(providerId);

  if (job.kind === 'dry_run' || providerTarget === 'dry_run') {
    return 'dry_run';
  }

  if (providerTarget === 'external') {
    return 'external';
  }

  if (providerId && providerTarget !== 'codex') {
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
