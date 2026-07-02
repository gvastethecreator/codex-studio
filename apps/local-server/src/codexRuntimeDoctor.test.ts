import { describe, expect, it, vi } from 'vite-plus/test';
import { inspectCodexRuntime } from './codexRuntimeDoctor';

function createDeps({
  versionStatus = 0,
  versionText = 'codex-cli 0.142.4',
  helpStatus = 0,
  helpText = 'codex app-server --listen <ws-url>',
  executable = 'C:/Users/dev/AppData/Local/Programs/OpenAI/Codex/bin/codex.exe',
} = {}) {
  const spawnSync = vi.fn((_: string, args: string[]) => {
    const commandText = args.join(' ');
    if (commandText.includes('--version')) {
      return { status: versionStatus, stdout: versionText, stderr: '' };
    }
    if (commandText.includes('app-server')) {
      return { status: helpStatus, stdout: helpText, stderr: '' };
    }
    return { status: 1, stdout: '', stderr: 'unexpected command' };
  });

  return {
    now: () => new Date('2026-05-31T00:00:00.000Z'),
    exists: (candidate: string) => candidate === executable,
    spawnSync,
    resolveExecutable: () => executable,
    resolveInvocation: (args: string[]) => [executable, ...args],
    listCandidates: () => [
      { path: executable, source: 'OpenAI desktop install' },
      { path: 'C:/Users/dev/AppData/Roaming/npm/codex.cmd', source: 'npm command shim' },
    ],
  };
}

describe('codexRuntimeDoctor', () => {
  it('marks a modern app-server-capable Codex CLI ready', () => {
    const deps = createDeps();

    const report = inspectCodexRuntime(deps);

    expect(report).toMatchObject({
      status: 'ready',
      canRunJobs: true,
      selectedVersion: 'codex-cli 0.142.4',
      appServerSupported: true,
      recommendedAction: 'Codex Product Runtime is ready.',
    });
    expect(deps.spawnSync).toHaveBeenCalledTimes(2);
  });

  it('blocks the legacy npm Codex CLI shim before app-server start', () => {
    const deps = createDeps({
      executable: 'C:/Users/dev/AppData/Roaming/npm/codex.cmd',
      versionText: 'codex 0.2.3',
    });

    const report = inspectCodexRuntime(deps);

    expect(report.status).toBe('blocked');
    expect(report.canRunJobs).toBe(false);
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'codex_cli_legacy',
          action: expect.stringContaining('OpenAI Codex desktop CLI binary'),
        }),
      ]),
    );
    expect(deps.spawnSync).toHaveBeenCalledTimes(1);
  });

  it('uses a Windows shell fallback when direct executable probing fails', () => {
    if (process.platform !== 'win32') return;

    const executable = 'C:/Users/dev/AppData/Local/Programs/OpenAI/Codex/bin/codex.exe';
    const spawnSync = vi.fn((command: string, args: string[], options?: { shell?: boolean }) => {
      if (command.endsWith('codex.exe') && !options?.shell) {
        return { status: null, stdout: '', stderr: 'ETIMEDOUT' };
      }
      if (command.endsWith('codex.exe') && options?.shell && args.join(' ').includes('--version')) {
        return { status: 0, stdout: 'codex-cli 0.142.4', stderr: '' };
      }
      if (
        command.endsWith('codex.exe') &&
        options?.shell &&
        args.join(' ').includes('app-server')
      ) {
        return { status: 0, stdout: 'codex app-server --listen <ws-url>', stderr: '' };
      }
      return { status: 1, stdout: '', stderr: 'unexpected command' };
    });

    const report = inspectCodexRuntime({
      ...createDeps({ executable }),
      spawnSync,
    });

    expect(report.status).toBe('ready');
    expect(spawnSync).toHaveBeenCalledWith(
      executable,
      expect.arrayContaining(['--version']),
      expect.objectContaining({ shell: true }),
    );
  });

  it('blocks a CLI that does not expose app-server support', () => {
    const report = inspectCodexRuntime(
      createDeps({
        helpStatus: 1,
        helpText: 'unknown command app-server',
      }),
    );

    expect(report.status).toBe('blocked');
    expect(report.issues[0]).toEqual(
      expect.objectContaining({
        code: 'codex_app_server_unsupported',
      }),
    );
  });
});
