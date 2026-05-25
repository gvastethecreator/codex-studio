import type {
  GenerationProviderId,
  GenerationTaskSpec,
  JobExecutionOptions,
} from '../../../../packages/shared/src';
import type { TurnResult } from '../codex/turn';

export interface GenerationProviderJob {
  id: string;
  projectId: string;
  providerId?: GenerationProviderId | null;
  sourceSpec?: GenerationTaskSpec | null;
  prompt: string;
  execution?: JobExecutionOptions | null;
  signal?: AbortSignal;
}

export interface GenerationProvider {
  readonly id: string;
  run(job: GenerationProviderJob): Promise<TurnResult>;
}
