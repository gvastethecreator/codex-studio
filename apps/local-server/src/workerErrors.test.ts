import { describe, expect, it } from 'vite-plus/test';
import {
  WorkerError,
  createAbortWorkerError,
  createUnsupportedRuntimeTargetError,
  formatWorkerErrorMessage,
} from './workerErrors';

describe('workerErrors', () => {
  it('creates abort error with AbortError name and code', () => {
    const error = createAbortWorkerError({ jobId: 'job-1' });
    expect(error.name).toBe('AbortError');
    expect(error.code).toBe('abort');
    expect(error.meta).toMatchObject({ jobId: 'job-1' });
  });

  it('creates unsupported runtime target error with structured metadata', () => {
    const error = createUnsupportedRuntimeTargetError(
      {
        kind: 'unknown-kind',
        providerId: 'local-experiment',
        sourceTask: null,
      },
      { jobId: 'job-2' },
    );

    expect(error).toBeInstanceOf(WorkerError);
    expect(error.code).toBe('unsupported_runtime_target');
    expect(error.message).toContain('Unsupported job kind received by worker');
    expect(error.meta).toMatchObject({
      jobId: 'job-2',
      jobKind: 'unknown-kind',
      providerId: 'local-experiment',
      sourceTask: null,
    });
  });

  it('formats worker and non-worker errors safely', () => {
    expect(formatWorkerErrorMessage(new Error('boom'))).toBe('boom');
    expect(formatWorkerErrorMessage('plain string')).toBe('plain string');
    expect(formatWorkerErrorMessage({ detail: 1 })).toBe('[object Object]');
  });
});
