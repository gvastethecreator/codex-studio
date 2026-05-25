import { appendFileSync } from 'node:fs';
import { getCodexWsUrl } from '../config';
import { resolveCodexInvocation } from '../codexExecutable';
import { resolveLibraryPath } from '../library';
import { log } from '../logger';
import type { AppServerEnsureReason } from '../../../../packages/shared/src';

export interface ProcessInfo {
  pid: number | null;
  status: 'running' | 'stopped' | 'error';
  lastExitCode: number | null;
  lastExitAt: string | null;
  lastEnsureAt: string | null;
  lastEnsureReason: AppServerEnsureReason | null;
  lastStartError: string | null;
  lastInvocation: string[] | null;
  lastStartAt: string | null;
}

export interface ProcessSupervisor {
  ensureAppServer(reason?: AppServerEnsureReason): Promise<ProcessInfo>;
  stopAppServer(): Promise<void>;
  onDiagnostics(cb: (info: ProcessInfo) => void): () => void;
}

let appServerProcess: ReturnType<typeof Bun.spawn> | null = null;
const diagnostics: Omit<ProcessInfo, 'status'> = {
  pid: null,
  lastExitCode: null,
  lastExitAt: null,
  lastEnsureAt: null,
  lastEnsureReason: null,
  lastInvocation: null,
  lastStartAt: null,
  lastStartError: null,
};

function isProcessRunning() {
  return appServerProcess !== null && appServerProcess.exitCode === null;
}

export function isAppServerRunning() {
  return isProcessRunning();
}

export function getAppServerDiagnostics() {
  return {
    ...diagnostics,
    lastInvocation: diagnostics.lastInvocation ? [...diagnostics.lastInvocation] : null,
  };
}

function currentInfo(): ProcessInfo {
  return {
    ...getAppServerDiagnostics(),
    status: isAppServerRunning() ? 'running' : diagnostics.lastStartError ? 'error' : 'stopped',
  };
}

export function ensureAppServer(reason: AppServerEnsureReason = 'session') {
  diagnostics.lastEnsureAt = new Date().toISOString();
  diagnostics.lastEnsureReason = reason;

  if (process.env.STUDIO_ASSUME_APP_SERVER_RUNNING === '1') {
    diagnostics.lastStartError = null;
    diagnostics.lastStartAt = diagnostics.lastStartAt || new Date().toISOString();
    diagnostics.lastInvocation = diagnostics.lastInvocation || ['existing app-server'];
    return;
  }

  if (isAppServerRunning()) return;

  const logPath = resolveLibraryPath('logs', 'app-server.log');
  const invocation = resolveCodexInvocation(['app-server', '--listen', getCodexWsUrl()]);
  diagnostics.lastInvocation = invocation;
  diagnostics.lastStartError = null;
  diagnostics.lastStartAt = new Date().toISOString();
  diagnostics.lastExitCode = null;
  diagnostics.lastExitAt = null;

  try {
    appServerProcess = Bun.spawn(invocation, {
      stdout: 'pipe',
      stderr: 'pipe',
      stdin: 'ignore',
      env: process.env,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    diagnostics.pid = null;
    diagnostics.lastStartError = message;
    log('error', 'app-server', `Failed to start codex app-server: ${message}`);
    throw error;
  }

  diagnostics.pid = appServerProcess.pid ?? null;

  const pipeOutput = async (stream: ReadableStream<Uint8Array> | null) => {
    if (!stream) return;
    const reader = stream.getReader();
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      appendFileSync(logPath, Buffer.from(chunk.value).toString('utf8'));
    }
  };
  if (appServerProcess.stdout instanceof ReadableStream) void pipeOutput(appServerProcess.stdout);
  if (appServerProcess.stderr instanceof ReadableStream) void pipeOutput(appServerProcess.stderr);

  log(
    'info',
    'app-server',
    `Started codex app-server on ${getCodexWsUrl()} with ${invocation.join(' ')} (pid ${appServerProcess.pid})`,
  );
  void appServerProcess.exited.then((code) => {
    diagnostics.pid = null;
    diagnostics.lastExitCode = code;
    diagnostics.lastExitAt = new Date().toISOString();
    log('warn', 'app-server', `codex app-server exited with code ${code}`);
    appServerProcess = null;
  });
}

export async function stopAppServer() {
  if (!appServerProcess) return;

  const currentProcess = appServerProcess;
  appServerProcess = null;
  diagnostics.pid = null;

  try {
    currentProcess.kill();
  } catch {
    // Ignore kill failures for already-terminated processes.
  }

  try {
    await currentProcess.exited;
  } catch {
    // Ignore exit await failures; diagnostics are updated best-effort.
  }
}

export function createProcessSupervisor(): ProcessSupervisor {
  const listeners = new Set<(info: ProcessInfo) => void>();
  const publish = () => listeners.forEach((listener) => listener(currentInfo()));
  return {
    async ensureAppServer(reason) {
      ensureAppServer(reason);
      publish();
      return currentInfo();
    },
    async stopAppServer() {
      await stopAppServer();
      publish();
    },
    onDiagnostics(cb) {
      listeners.add(cb);
      cb(currentInfo());
      return () => listeners.delete(cb);
    },
  };
}
