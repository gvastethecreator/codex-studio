import { beforeAll, describe, expect, it, vi } from 'vite-plus/test';

vi.mock('../config', () => ({
  getCodexWsUrl: () => 'ws://127.0.0.1:4317',
}));

vi.mock('../codexExecutable', () => ({
  resolveCodexInvocation: () => ['codex', 'app-server'],
}));

vi.mock('../library', () => ({
  resolveLibraryPath: () => 'D:/studio/logs/app-server.log',
}));

vi.mock('../logger', () => ({
  log: () => {},
}));

let AppServerStartError: typeof import('./processSupervisor').AppServerStartError;
let resolveAppServerProcessStatus: typeof import('./processSupervisor').resolveAppServerProcessStatus;

beforeAll(async () => {
  ({ AppServerStartError, resolveAppServerProcessStatus } = await import('./processSupervisor'));
});

describe('processSupervisor', () => {
  it('resolves process status from running and last start error fields', () => {
    expect(resolveAppServerProcessStatus({ running: true, lastStartError: null })).toBe('running');
    expect(resolveAppServerProcessStatus({ running: false, lastStartError: 'boom' })).toBe('error');
    expect(resolveAppServerProcessStatus({ running: false, lastStartError: null })).toBe('stopped');
  });

  it('preserves cause on AppServerStartError', () => {
    const cause = new Error('spawn failed');
    const error = new AppServerStartError('Failed to start codex app-server', cause);

    expect(error.name).toBe('AppServerStartError');
    expect(error.message).toContain('Failed to start codex app-server');
    expect(error.causeValue).toBe(cause);
  });
});
