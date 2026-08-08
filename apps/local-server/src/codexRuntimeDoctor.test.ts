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
      listCandidates: () => [
        { path: executable, source: 'test' },
        { path: 'C:/Codex/fallback-one.exe', source: 'fallback one' },
        { path: 'C:/Codex/fallback-two.exe', source: 'fallback two' },
      ],
    });

    expect(report).toMatchObject({ canRunJobs: true, selectedVersionNumber: '1.2.3' });
    expect(run).toHaveBeenCalledTimes(2);
    expect(report.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ executable: 'C:/Codex/fallback-one.exe', selected: false }),
        expect.objectContaining({ executable: 'C:/Codex/fallback-two.exe', selected: false }),
      ]),
    );
  });

  it('scans fallback candidates only after the resolved executable fails', async () => {
    const resolvedExecutable = 'C:/Codex/resolved.exe';
    const fallbackExecutable = 'C:/Codex/fallback.exe';
    const unusedExecutable = 'C:/Codex/unused.exe';
    const run = vi.fn(async (command: string, args: string[]) => {
      const commandText = [command, ...args].join(' ');
      if (commandText.includes(resolvedExecutable) && args.includes('--version')) {
        return { status: 0, stdout: 'codex-cli 1.0.0', stderr: '' };
      }
      if (commandText.includes(resolvedExecutable) && args.join(' ').includes('app-server')) {
        return { status: 0, stdout: 'unknown command app-server', stderr: '' };
      }
      if (commandText.includes(fallbackExecutable) && args.includes('--version')) {
        return { status: 0, stdout: 'codex-cli 1.1.0', stderr: '' };
      }
      if (commandText.includes(fallbackExecutable) && args.join(' ').includes('app-server')) {
        return { status: 0, stdout: 'codex app-server --listen <ws-url>', stderr: '' };
      }
      return { status: 0, stdout: 'codex-cli 9.9.9', stderr: '' };
    });

    const report = await inspectCodexRuntimeAsync({
      now: () => new Date('2026-07-10T00:00:00.000Z'),
      exists: (candidate) =>
        [resolvedExecutable, fallbackExecutable, unusedExecutable].includes(candidate),
      run,
      resolveExecutable: () => resolvedExecutable,
      resolveInvocation: (args) => [resolvedExecutable, ...args],
      listCandidates: () => [
        { path: fallbackExecutable, source: 'fallback' },
        { path: unusedExecutable, source: 'unused' },
      ],
    });

    expect(report).toMatchObject({
      status: 'ready',
      canRunJobs: true,
      selectedExecutable: fallbackExecutable,
    });
    expect(run).toHaveBeenCalledTimes(4);
    expect(
      run.mock.calls.some(([command, args]) =>
        [command, ...args].join(' ').includes(unusedExecutable),
      ),
    ).toBe(false);
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

  it('accepts an app-server-capable CLI regardless of its version number', () => {
    const deps = createDeps({ versionText: 'codex-cli 0.2.3' });

    const report = inspectCodexRuntime(deps);

    expect(report).toMatchObject({
      status: 'ready',
      canRunJobs: true,
      selectedVersionNumber: '0.2.3',
      appServerSupported: true,
    });
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
    const spawnSync = vi.fn((command: string, args: string[]) => {
      if (command.endsWith('codex.exe')) {
        return { status: null, stdout: '', stderr: 'ETIMEDOUT' };
      }
      if (command === 'cmd.exe' && args.join(' ').includes('--version')) {
        return { status: 0, stdout: 'codex-cli 0.142.4', stderr: '' };
      }
      if (command === 'cmd.exe' && args.join(' ').includes('app-server')) {
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
      'cmd.exe',
      expect.arrayContaining(['/d', '/s', '/c']),
      expect.objectContaining({ windowsVerbatimArguments: true }),
    );
  });

  it.each([
    'unknown command app-server',
    'unrecognized command app-server',
    'invalid command app-server',
  ])('blocks a CLI when app-server help reports %s', (helpText) => {
    const report = inspectCodexRuntime(createDeps({ helpText }));

    expect(report.status).toBe('blocked');
    expect(report.issues[0]).toEqual(
      expect.objectContaining({
        code: 'codex_app_server_unsupported',
      }),
    );
  });
});
