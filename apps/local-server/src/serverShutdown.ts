export interface StudioServerShutdownDependencies {
  stopHttpServer: () => void | Promise<void>;
  stopStudio: () => void | Promise<void>;
}

export async function shutdownStudioServer({
  stopHttpServer,
  stopStudio,
}: StudioServerShutdownDependencies) {
  const results = await Promise.allSettled([
    Promise.resolve().then(stopHttpServer),
    Promise.resolve().then(stopStudio),
  ]);
  const errors = results.flatMap((result) => (result.status === 'rejected' ? [result.reason] : []));
  if (errors.length > 0) {
    throw new AggregateError(errors, 'Codex Studio shutdown failed');
  }
}

export interface SignalShutdownDependencies {
  shutdown: () => Promise<void>;
  exit: (code: number) => void;
  reportError: (error: unknown) => void;
  timeoutMs?: number;
  setTimeoutFn?: (callback: () => void, delayMs: number) => ReturnType<typeof setTimeout>;
  clearTimeoutFn?: (timer: ReturnType<typeof setTimeout>) => void;
}

export function beginSignalShutdown({
  shutdown,
  exit,
  reportError,
  timeoutMs = 5_000,
  setTimeoutFn = (callback, delayMs) => setTimeout(callback, delayMs),
  clearTimeoutFn = (timer) => clearTimeout(timer),
}: SignalShutdownDependencies) {
  let finished = false;
  const finish = (code: number, timer: ReturnType<typeof setTimeout>) => {
    if (finished) return;
    finished = true;
    clearTimeoutFn(timer);
    exit(code);
  };
  const timer = setTimeoutFn(() => {
    if (finished) return;
    reportError(new Error(`Codex Studio shutdown timed out after ${timeoutMs}ms`));
    finish(1, timer);
  }, timeoutMs);

  return Promise.resolve()
    .then(shutdown)
    .then(
      () => finish(0, timer),
      (error) => {
        reportError(error);
        finish(1, timer);
      },
    );
}
