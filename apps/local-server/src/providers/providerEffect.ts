import { Effect, type Scope } from 'effect';
import { ProviderExecutionUncertainError, WorkerError } from '../workerErrors';
import { SubscriptionHttpError } from './subscriptionHttpError';

export class ProviderOperationError extends Error {
  readonly _tag = 'ProviderOperationError';

  constructor(error: unknown) {
    super(error instanceof Error ? error.message : String(error), { cause: error });
    this.name = error instanceof Error ? error.name : 'ProviderOperationError';
  }
}

export class ExternalProviderImageError extends Error {
  readonly _tag = 'ExternalProviderImageError';

  constructor(message: string) {
    super(message);
    this.name = 'ExternalProviderImageError';
  }
}

export type ProviderFailure =
  | ProviderOperationError
  | ExternalProviderImageError
  | ProviderExecutionUncertainError
  | WorkerError
  | SubscriptionHttpError;

export function providerFailure(error: unknown): ProviderFailure {
  if (
    error instanceof ProviderOperationError ||
    error instanceof ExternalProviderImageError ||
    error instanceof ProviderExecutionUncertainError ||
    error instanceof WorkerError ||
    error instanceof SubscriptionHttpError
  )
    return error;
  return new ProviderOperationError(error);
}

export const providerSync = <A>(operation: () => A) =>
  Effect.try({ try: operation, catch: providerFailure });

/** Native asynchronous resources must settle their cleanup before the fiber releases capacity. */
export function providerPromise<A>(
  operation: (signal: AbortSignal) => PromiseLike<A>,
  interrupt?: () => PromiseLike<unknown> | void,
) {
  return Effect.callback<A, ProviderFailure>((resume, signal) => {
    let pending: Promise<A>;
    try {
      pending = Promise.resolve(operation(signal));
    } catch (error) {
      resume(Effect.fail(providerFailure(error)));
      return;
    }
    pending.then(
      (value) => resume(Effect.succeed(value)),
      (error: unknown) => resume(Effect.fail(providerFailure(error))),
    );
    return Effect.promise(async () => {
      await interrupt?.();
      await pending.then(
        () => undefined,
        () => undefined,
      );
    });
  });
}

/** Normalize synchronous validation and native failures at the provider boundary. */
export function providerOperation<A, E, R>(operation: Effect.Effect<A, E, R>) {
  return operation.pipe(
    Effect.mapError(providerFailure),
    Effect.catchDefect((error) => Effect.fail(providerFailure(error))),
  );
}

export function combineProviderSignals(signal: AbortSignal, requested?: AbortSignal | null) {
  return requested ? AbortSignal.any([signal, requested]) : signal;
}

export type ProviderSleep = (durationMs: number) => Effect.Effect<unknown, ProviderFailure>;
export type ProviderEffect<A> = Effect.Effect<A, ProviderFailure, Scope.Scope>;

export function providerFetch<A extends { body?: ReadableStream<Uint8Array> | null }>(
  fetch: (input: string | URL | Request, init?: RequestInit) => Promise<A>,
  input: string | URL | Request,
  init?: RequestInit,
) {
  return Effect.gen(function* () {
    const controller = yield* Effect.acquireRelease(
      Effect.sync(() => new AbortController()),
      (controller) => Effect.sync(() => controller.abort()),
    );
    return yield* Effect.acquireRelease(
      providerPromise((signal) =>
        fetch(input, {
          ...init,
          signal: AbortSignal.any([
            controller.signal,
            combineProviderSignals(signal, init?.signal),
          ]),
        }),
      ),
      (response) =>
        Effect.promise(async () => {
          controller.abort();
          await response.body?.cancel().catch(() => undefined);
        }),
      { interruptible: true },
    );
  });
}

/** The request scope owns cancellation of a response body, including a locked JSON reader. */
export const providerBody = <A>(read: () => PromiseLike<A>) =>
  Effect.tryPromise({ try: () => Promise.resolve(read()), catch: providerFailure });

export const providerTimeout = (durationMs: number) =>
  Effect.timeoutOrElse({
    duration: durationMs,
    orElse: () =>
      Effect.fail(providerFailure(new DOMException('The operation timed out.', 'TimeoutError'))),
  });
