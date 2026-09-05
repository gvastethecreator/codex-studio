export type WorkerErrorCode =
  | 'abort'
  | 'unsupported_runtime_target'
  | 'unknown_worker_error'
  | 'execution_uncertain';

/** A provider may have accepted work. Retrying or confirming cancellation is unsafe. */
export class ProviderExecutionUncertainError extends Error {
  readonly code = 'execution_uncertain';

  constructor(message: string) {
    super(message);
    this.name = 'ProviderExecutionUncertainError';
  }
}

export interface WorkerErrorMeta {
  jobId?: string;
  jobKind?: string;
  providerId?: string | null;
  sourceTask?: string | null;
}

export class WorkerError extends Error {
  readonly code: WorkerErrorCode;
  readonly meta: WorkerErrorMeta;

  constructor(code: WorkerErrorCode, message: string, meta: WorkerErrorMeta = {}) {
    super(message);
    this.name = 'WorkerError';
    this.code = code;
    this.meta = meta;
  }
}

export function createAbortWorkerError(meta: WorkerErrorMeta = {}) {
  const error = new WorkerError('abort', 'Operation cancelled by user', meta);
  error.name = 'AbortError';
  return error;
}

export function createUnsupportedRuntimeTargetError(
  input: {
    kind: string;
    providerId: string | null;
    sourceTask: string | null;
  },
  meta: WorkerErrorMeta = {},
) {
  return new WorkerError(
    'unsupported_runtime_target',
    `Unsupported job kind received by worker: kind=${input.kind} provider=${input.providerId ?? 'null'} sourceTask=${input.sourceTask ?? 'null'}`,
    {
      ...meta,
      jobKind: input.kind,
      providerId: input.providerId,
      sourceTask: input.sourceTask,
    },
  );
}

export function formatWorkerErrorMessage(error: unknown) {
  if (error instanceof WorkerError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
