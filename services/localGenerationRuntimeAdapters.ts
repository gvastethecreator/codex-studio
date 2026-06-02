function createAbortError() {
  const error = new Error('Operation cancelled by user');
  error.name = 'AbortError';
  return error;
}

export function throwIfGenerationAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw createAbortError();
  }
}

export function waitForGenerationDelay(durationMs: number, signal?: AbortSignal) {
  if (!signal) {
    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, durationMs);
    });
  }

  throwIfGenerationAborted(signal);

  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    }, durationMs);

    const handleAbort = () => {
      window.clearTimeout(timeout);
      signal.removeEventListener('abort', handleAbort);
      reject(createAbortError());
    };

    signal.addEventListener('abort', handleAbort, { once: true });
  });
}

/**
 * Convert an image source into a data URL payload accepted by the local
 * generation backend.
 */
export async function toGenerationDataUrl(src: string) {
  if (src.startsWith('data:')) return src;
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Unable to read input image: ${response.status}`);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to encode input image'));
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to encode input image as a data URL'));
        return;
      }

      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

export function isGenerationCancellationError(error: unknown) {
  return error instanceof Error && (error.name === 'AbortError' || /cancel/i.test(error.message));
}
