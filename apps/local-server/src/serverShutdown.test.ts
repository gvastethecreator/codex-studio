import { describe, expect, it, vi } from 'vite-plus/test';
import { beginSignalShutdown, shutdownStudioServer } from './serverShutdown';

describe('server shutdown', () => {
  it('attempts Studio shutdown even when stopping the HTTP server fails', async () => {
    const stopStudio = vi.fn(async () => {});

    await expect(
      shutdownStudioServer({
        stopHttpServer: () => {
          throw new Error('listener stuck');
        },
        stopStudio,
      }),
    ).rejects.toThrow('Codex Studio shutdown failed');
    expect(stopStudio).toHaveBeenCalledTimes(1);
  });

  it('reports signal shutdown failures and exits non-zero', async () => {
    const exit = vi.fn();
    const reportError = vi.fn();
    const clearTimeoutFn = vi.fn();

    await beginSignalShutdown({
      shutdown: async () => {
        throw new Error('shutdown failed');
      },
      exit,
      reportError,
      setTimeoutFn: () => 123 as unknown as ReturnType<typeof setTimeout>,
      clearTimeoutFn,
    });

    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'shutdown failed' }),
    );
    expect(clearTimeoutFn).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('forces a non-zero exit when graceful shutdown exceeds the deadline', () => {
    const exit = vi.fn();
    const reportError = vi.fn();
    let timeoutCallback: (() => void) | null = null;

    void beginSignalShutdown({
      shutdown: () => new Promise<void>(() => {}),
      exit,
      reportError,
      timeoutMs: 25,
      setTimeoutFn: (callback) => {
        timeoutCallback = callback;
        return 123 as unknown as ReturnType<typeof setTimeout>;
      },
      clearTimeoutFn: () => {},
    });
    expect(timeoutCallback).not.toBeNull();
    (timeoutCallback as unknown as () => void)();

    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Codex Studio shutdown timed out after 25ms' }),
    );
    expect(exit).toHaveBeenCalledWith(1);
  });
});
