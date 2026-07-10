import { describe, expect, it, vi } from 'vite-plus/test';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inspectCodexRuntime, inspectCodexRuntimeAsync } from './codexRuntimeDoctor';

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
  it('probes asynchronously without requiring the synchronous adapter', async () => {
    const executable = 'C:/Codex/codex.exe';
    const run = vi.fn(async (_command: string, args: string[]) =>
      args.includes('--version')
        ? { status: 0, stdout: 'codex-cli 1.2.3', stderr: '' }
        : { status: 0, stdout: 'codex app-server --listen <ws-url>', stderr: '' },
    );

    const report = await inspectCodexRuntimeAsync({
      now: () => new Date('2026-07-10T00:00:00.000Z'),
      exists: (candidate) => candidate === executable,
      run,
      resolveExecutable: () => executable,
      resolveInvocation: (args) => [executable, ...args],
      listCandidates: () => [{ path: executable, source: 'test' }],
    });

    expect(report).toMatchObject({ canRunJobs: true, selectedVersionNumber: '1.2.3' });
    expect(run).toHaveBeenCalledTimes(2);
  });

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

  it('selects a later app-server-capable Codex CLI when the first candidate is legacy', () => {
    const legacyExecutable = 'C:/Users/dev/AppData/Roaming/npm/codex.cmd';
    const modernExecutable = 'C:/Users/dev/AppData/Local/Programs/OpenAI/Codex/bin/codex.exe';
    const spawnSync = vi.fn((command: string, args: string[]) => {
      const commandText = [command, ...args].join(' ');
      if (commandText.includes(legacyExecutable) && commandText.includes('--version')) {
        return { status: 0, stdout: 'codex 0.2.3', stderr: '' };
      }
      if (commandText.includes(modernExecutable) && commandText.includes('--version')) {
        return { status: 0, stdout: 'codex-cli 0.142.4', stderr: '' };
      }
      if (commandText.includes(modernExecutable) && commandText.includes('app-server')) {
        return { status: 0, stdout: 'codex app-server --listen <ws-url>', stderr: '' };
      }
      return { status: 1, stdout: '', stderr: 'unexpected command' };
    });

    const report = inspectCodexRuntime({
      now: () => new Date('2026-05-31T00:00:00.000Z'),
      exists: (candidate: string) =>
        candidate === legacyExecutable || candidate === modernExecutable,
      spawnSync,
      resolveExecutable: () => legacyExecutable,
      resolveInvocation: (args, executable = legacyExecutable) => [executable, ...args],
      listCandidates: () => [
        { path: legacyExecutable, source: 'npm command shim' },
        { path: modernExecutable, source: 'OpenAI desktop install' },
      ],
    });

    expect(report.status).toBe('ready');
    expect(report.selectedExecutable).toBe(modernExecutable);
    expect(report.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ executable: legacyExecutable, selected: false }),
        expect.objectContaining({ executable: modernExecutable, selected: true }),
      ]),
    );
  });

  it('detects the unrelated legacy npm codex package without executing its shim', () => {
    if (process.platform !== 'win32') return;

    const root = path.join(os.tmpdir(), `codex-runtime-${Date.now()}`);
    const npmRoot = path.join(root, 'npm');
    const executable = path.join(npmRoot, 'codex.cmd');
    mkdirSync(path.join(npmRoot, 'node_modules', 'codex'), { recursive: true });
    writeFileSync(executable, '@echo off\n');
    writeFileSync(
      path.join(npmRoot, 'node_modules', 'codex', 'package.json'),
      JSON.stringify({ name: 'codex', version: '0.2.3' }),
    );
    const spawnSync = vi.fn();

    const report = inspectCodexRuntime({
      now: () => new Date('2026-05-31T00:00:00.000Z'),
      exists: existsSync,
      spawnSync,
      resolveExecutable: () => executable,
      resolveInvocation: (args) => [executable, ...args],
      listCandidates: () => [{ path: executable, source: 'npm command shim' }],
    });

    expect(report.status).toBe('blocked');
    expect(report.issues[0]).toEqual(
      expect.objectContaining({
        code: 'codex_cli_legacy',
        message: expect.stringContaining('codex 0.2.3'),
      }),
    );
    expect(spawnSync).not.toHaveBeenCalled();
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
