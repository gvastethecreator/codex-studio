import { spawn } from 'node:child_process';
import { Effect } from 'effect';
import { terminateOwnedProcessTree } from '../ownedProcessTree';
import { createAbortWorkerError } from '../workerErrors';
import { combineProviderSignals, providerFailure, type ProviderFailure } from './providerEffect';

export interface ProviderCliProcessInput {
  executable: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  stdin?: string;
  signal?: AbortSignal;
  timeoutMs: number;
  timeoutMessage: string;
  outputLimitMessage: string;
  maxOutputBytes: number;
}

export function runProviderCliProcess(input: ProviderCliProcessInput) {
  return Effect.suspend(() => {
    if (input.signal?.aborted) return Effect.fail(createAbortWorkerError());
    return Effect.callback<{ status: number; stdout: string; stderr: string }, ProviderFailure>(
      (resume, effectSignal) => {
        const signal = combineProviderSignals(effectSignal, input.signal);
        const child = spawn(input.executable, input.args, {
          cwd: input.cwd,
          env: input.env,
          windowsHide: true,
          stdio: [input.stdin === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
        });
        let stdout = '';
        let stderr = '';
        let outputBytes = 0;
        let terminalError: Error | null = null;
        let stopped = false;
        let settled = false;
        const stop = () => {
          if (settled || stopped) return;
          stopped = true;
          try {
            terminateOwnedProcessTree(child);
          } catch {
            child.kill();
          }
        };
        signal.addEventListener('abort', stop, { once: true });
        const append = (target: 'stdout' | 'stderr', chunk: unknown) => {
          const text = String(chunk);
          outputBytes += Buffer.byteLength(text);
          if (outputBytes > input.maxOutputBytes) {
            terminalError = new Error(input.outputLimitMessage);
            stop();
            return;
          }
          if (target === 'stdout') stdout += text;
          else stderr += text;
        };
        child.stdout?.on('data', (chunk) => append('stdout', chunk));
        child.stderr?.on('data', (chunk) => append('stderr', chunk));
        child.stdin?.on('error', (error) => {
          terminalError ??= error;
        });
        child.once('error', (error) => {
          terminalError = error;
        });
        const closed = new Promise<void>((resolve) => {
          child.once('close', (code) => {
            settled = true;
            signal.removeEventListener('abort', stop);
            if (signal.aborted) resume(Effect.fail(createAbortWorkerError()));
            else if (terminalError) resume(Effect.fail(providerFailure(terminalError)));
            else resume(Effect.succeed({ status: code ?? 1, stdout, stderr }));
            resolve();
          });
        });
        if (signal.aborted) stop();
        if (input.stdin !== undefined) child.stdin?.end(input.stdin, 'utf8');
        return Effect.promise(async () => {
          stop();
          await closed;
        });
      },
    ).pipe(
      Effect.timeoutOrElse({
        duration: input.timeoutMs,
        orElse: () => Effect.fail(providerFailure(new Error(input.timeoutMessage))),
      }),
    );
  });
}
