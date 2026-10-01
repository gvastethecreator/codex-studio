import { Effect } from 'effect';
import { readGrokRuntimeDoctor } from '../grokRuntimeDoctor';
import { isGrokHttpCredentialReady } from '../auth/tokens';
import type { ExternalProviderExecutor } from './externalProvider';
import { createGrokImagineExecutor } from './grokImagineExecutor';
import { createGrokImagineHttpExecutor } from './grokImagineHttpExecutor';
import { isAbortError, isSubscriptionHttpFallbackAllowed } from './subscriptionHttpError';

export interface GrokRuntimeExecutorDependencies {
  http?: ExternalProviderExecutor;
  cli?: ExternalProviderExecutor;
  isHttpReady?: () => boolean;
  canUseCli?: () => boolean;
}

export function createGrokRuntimeExecutor({
  http = createGrokImagineHttpExecutor(),
  cli = createGrokImagineExecutor(),
  isHttpReady = () => isGrokHttpCredentialReady(),
  canUseCli = () => readGrokRuntimeDoctor().canRunJobs,
}: GrokRuntimeExecutorDependencies = {}): ExternalProviderExecutor {
  return (context) =>
    Effect.suspend(() => {
      if (!isHttpReady()) return cli(context);
      return http(context).pipe(
        Effect.catch((error) => {
          if (isAbortError(error) || !isSubscriptionHttpFallbackAllowed(error) || !canUseCli()) {
            return Effect.fail(error);
          }
          return cli(context);
        }),
      );
    });
}
