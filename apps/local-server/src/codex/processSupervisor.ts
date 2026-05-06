import { ensureAppServer, getAppServerDiagnostics, isAppServerRunning } from '../codexClient';

export interface ProcessInfo {
  pid: number | null;
  status: 'running' | 'stopped' | 'error';
  lastExitCode: number | null;
  lastExitAt: string | null;
  lastStartError: string | null;
}

export interface ProcessSupervisor {
  ensureAppServer(wsPort?: number): Promise<ProcessInfo>;
  stopAppServer(): Promise<void>;
  onDiagnostics(cb: (info: ProcessInfo) => void): () => void;
}

function currentInfo(): ProcessInfo {
  const diagnostics = getAppServerDiagnostics();
  return {
    pid: diagnostics.pid,
    status: isAppServerRunning() ? 'running' : diagnostics.lastStartError ? 'error' : 'stopped',
    lastExitCode: diagnostics.lastExitCode,
    lastExitAt: diagnostics.lastExitAt,
    lastStartError: diagnostics.lastStartError,
  };
}

export function createProcessSupervisor(): ProcessSupervisor {
  const listeners = new Set<(info: ProcessInfo) => void>();
  const publish = () => listeners.forEach((listener) => listener(currentInfo()));
  return {
    async ensureAppServer() {
      ensureAppServer();
      publish();
      return currentInfo();
    },
    async stopAppServer() {
      publish();
    },
    onDiagnostics(cb) {
      listeners.add(cb);
      cb(currentInfo());
      return () => listeners.delete(cb);
    },
  };
}
