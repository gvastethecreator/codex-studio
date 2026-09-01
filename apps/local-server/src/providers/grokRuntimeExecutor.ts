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
  return async (context) => {
    if (isHttpReady()) {
      try {
        return await http(context);
      } catch (error) {
        if (isAbortError(error) || !isSubscriptionHttpFallbackAllowed(error) || !canUseCli()) {
          throw error;
        }
      }
    }
    return cli(context);
  };
}
