import { describe, expect, it } from 'vite-plus/test';
import { inspectGrokRuntime, parseAvailableGrokModels } from './grokRuntimeDoctor';

function readySpawn(command: string, args: string[]) {
  const invocation = [command, ...args].join(' ');
  if (args.includes('version')) {
    return { status: 0, stdout: 'grok 1.0.0 (build) [stable]\n', stderr: '' };
  }
  if (args.includes('--help')) {
    return {
      status: 0,
      stdout: '--prompt-file --output-format --tools --session-id\n',
      stderr: '',
    };
  }
  if (args.includes('models')) {
    return {
      status: 0,
      stdout:
        'You are logged in with grok.com.\n\nDefault model: grok-4.6\n\nAvailable models:\n  * grok-4.6 (default)\n  - grok-4.5\n',
      stderr: '',
    };
  }
  if (args.includes('inspect')) {
    return {
      status: 0,
      stdout: JSON.stringify({ skills: [{ name: 'imagine' }] }),
      stderr: '',
    };
  }
  throw new Error(`Unexpected probe: ${invocation}`);
}

describe('grokRuntimeDoctor', () => {
  it('reports a locally authenticated Imagine runtime without exposing auth data', () => {
    const report = inspectGrokRuntime({
      now: () => new Date('2026-08-08T00:00:00.000Z'),
      env: { USERPROFILE: 'C:\\Users\\studio' },
      exists: () => true,
      resolveExecutable: () => 'C:\\Users\\studio\\.grok\\bin\\grok.exe',
      listCandidates: () => [
        { path: 'C:\\Users\\studio\\.grok\\bin\\grok.exe', source: 'Grok Build install' },
      ],
      spawnSync: readySpawn,
    });

    expect(report).toMatchObject({
      status: 'ready',
      canRunJobs: true,
      selectedVersionNumber: '1.0.0',
      defaultModel: 'grok-4.6',
      availableModels: ['grok-4.6', 'grok-4.5'],
      headlessSupported: true,
      imagineAvailable: true,
      issues: [],
    });
    expect(JSON.stringify(report)).not.toContain('grok.com');
  });

  it('blocks execution when local login is missing', () => {
    const report = inspectGrokRuntime({
      env: { USERPROFILE: 'C:\\Users\\studio' },
      exists: () => true,
      resolveExecutable: () => 'grok.exe',
      listCandidates: () => [{ path: 'grok.exe', source: 'test' }],
      spawnSync: (command, args) => {
        if (args.includes('models')) {
          return { status: 1, stdout: '', stderr: 'Not logged in. Run grok login.' };
        }
        return readySpawn(command, args);
      },
    });

    expect(report).toMatchObject({ status: 'blocked', canRunJobs: false });
    expect(report.issues[0]).toMatchObject({ code: 'grok_login_required' });
    expect(report.recommendedAction).toContain('grok login');
  });

  it('parses current model output and its default', () => {
    expect(
      parseAvailableGrokModels('Available models:\n  * grok-4.5 (default)\n    grok-next\n'),
    ).toEqual({ models: ['grok-4.5', 'grok-next'], defaultModel: 'grok-4.5' });
  });

  it('parses Grok Build 1.0.4 dash lists and the Default model header', () => {
    expect(
      parseAvailableGrokModels(
        'You are logged in with grok.com.\n\nDefault model: grok-4.6\n\nAvailable models:\n  * grok-4.6 (default)\n  - grok-4.5\n',
      ),
    ).toEqual({ models: ['grok-4.6', 'grok-4.5'], defaultModel: 'grok-4.6' });
  });
});
