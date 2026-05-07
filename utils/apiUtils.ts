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
    } catch (error: any) {
      const status = error?.status || error?.response?.status;
      const message = error?.message?.toLowerCase() || '';

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
        console.warn(
          `Attempt ${attempt} failed with ${status || error.message}. Retrying in ${Math.round(delay)}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }
  throw new Error('Operation failed after multiple attempts.');
};
