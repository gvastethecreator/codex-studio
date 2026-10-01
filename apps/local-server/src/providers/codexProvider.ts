import { Effect } from 'effect';
import { providerOperation, providerPromise, type ProviderEffect } from './providerEffect';
import type { CodexTurn, TurnResult } from '../codex/turn';
import type { GenerationProvider, GenerationProviderJob } from './types';
import { readCodexRuntimeDoctor } from '../codexRuntimeDoctor';
import { isCodexHttpCredentialReady } from '../auth/tokens';
import { ProviderExecutionUncertainError } from '../workerErrors';
import { compileCodexImagegenInput } from './openaiImageInput';
export {
  compileCodexImagegenInput,
  type CodexImagegenInputItem,
  type CodexImagegenCompiledInput,
} from './openaiImageInput';
export { CODEX_IMAGEGEN_DENOISE_INSTRUCTION } from '../codex/imagegenContract';

export interface CreateCodexGenerationProviderDependencies {
  turn: CodexTurn;
  runHttp?: (job: GenerationProviderJob) => ProviderEffect<TurnResult>;
  isHttpReady?: () => boolean;
  canUseCli?: () => boolean;
}

export function createCodexGenerationProvider({
  turn,
  runHttp,
  isHttpReady = () => isCodexHttpCredentialReady(),
  canUseCli = () => readCodexRuntimeDoctor().canRunJobs,
}: CreateCodexGenerationProviderDependencies): GenerationProvider {
  return {
    id: 'codex',
    run(job) {
      return providerOperation(
        Effect.gen(function* () {
          const compiledInput = compileCodexImagegenInput(job);
          const policy = job.execution?.providerOptions?.codex;
          if (!policy)
            throw new ProviderExecutionUncertainError(
              'The Codex execution policy was not captured. Review the existing job before creating another request.',
            );
          if (policy.transport === 'subscription_http') {
            if (!isHttpReady())
              throw new Error(
                'This job requires its accepted ChatGPT HTTP session. Sign in again and retry.',
              );
            const http =
              runHttp ??
              (yield* providerPromise(
                () => import('./chatgptResponsesImageExecutor'),
              )).createChatgptResponsesImageExecutor();
            return yield* http(job);
          }
          if (policy.transport !== 'codex_app_server')
            throw new Error('The saved Codex execution route is invalid.');
          if (!canUseCli())
            throw new Error(
              'This job requires its accepted Codex app-server runtime. Start it and retry.',
            );
          return yield* turn.runTurn({
            jobId: job.id,
            prompt: job.prompt,
            execution: job.execution,
            signal: job.signal,
            compiledInput,
          });
        }),
      );
    },
  };
}
