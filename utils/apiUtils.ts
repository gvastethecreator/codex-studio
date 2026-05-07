import { formatErrorMessage, runtimeLogger } from './runtimeLogger';

type RetryCandidate = {
  status?: number;
  response?: {
    status?: number;
  };
  message?: string;
};

function getRetryMetadata(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as RetryCandidate;
    return {
      status: candidate.status ?? candidate.response?.status,
      message: candidate.message?.toLowerCase() ?? '',
    };
  }

  return {
    status: undefined,
    message: formatErrorMessage(error).toLowerCase(),
  };
}

/**
 * Executes an async operation with exponential backoff retry logic.
 * Useful for handling transient API errors (429, 503).
 */
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
): Promise<T> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const { status, message } = getRetryMetadata(error);

      // Do not retry if the error is due to quota exhaustion
      if (message.includes('quota') || message.includes('resource exhausted')) {
        throw error;
      }

      const isRetryable =
        status === 500 ||
        status === 503 ||
        status === 429 ||
        message.includes('500') ||
        message.includes('503') ||
        message.includes('429');

      if (isRetryable && attempt < maxAttempts) {
        const delay = Math.pow(2, attempt) * baseDelay + Math.random() * 1000;
        runtimeLogger.warn(
          `Attempt ${attempt} failed with ${status || formatErrorMessage(error)}. Retrying in ${Math.round(delay)}ms...`,
          error,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }
  throw new Error('Operation failed after multiple attempts.');
};
