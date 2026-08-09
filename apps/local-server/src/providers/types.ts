import type {
  GenerationProviderId,
  GenerationTaskSpec,
  JobExecutionOptions,
  JobLibraryContext,
} from '../../../../packages/shared/src';
import type { TurnResult } from '../codex/turn';

export interface GenerationProviderJob {
  id: string;
  workspaceId: string;
  libraryContext?: JobLibraryContext | null;
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
