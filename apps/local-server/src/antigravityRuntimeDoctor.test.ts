import { describe, expect, it } from 'vite-plus/test';

import {
  inspectAntigravityRuntime,
  parseAvailableAntigravityModels,
} from './antigravityRuntimeDoctor';
import { createAntigravityChildEnvironment } from './antigravityExecutable';

const HELP = [
  '--input-format',
  '--output-format',
  '--print-timeout',
  '--sandbox',
  '--disable-slash-commands',
  '--mode',
].join('\n');

describe('Antigravity runtime doctor', () => {
  it('parses the tab-separated model catalog', () => {
    expect(
      parseAvailableAntigravityModels(
        'Fetching available models...\ngemini-3.8-flash-low\tGemini 3.8 Flash\nclaude-sonnet-4-6\tClaude Sonnet',
      ),
    ).toEqual(['gemini-3.8-flash-low', 'claude-sonnet-4-6']);
  });

  it('reports a ready authenticated headless runtime', () => {
    const report = inspectAntigravityRuntime({
      now: () => new Date('2026-09-02T00:00:00.000Z'),
      resolveExecutable: () => 'agy',
      listCandidates: () => [{ path: 'agy', source: 'test' }],
      spawnSync: ((_command: string, args: string[]) => {
        if (args[0] === '--version') return { status: 0, stdout: '1.1.24\n' };
        if (args[0] === '--help') return { status: 0, stdout: HELP };
        return {
          status: 0,
          stdout: 'gemini-3.8-flash-low\tGemini 3.8 Flash (Low)\n',
        };
      }) as never,
    });

    expect(report).toMatchObject({
      status: 'ready',
      canRunJobs: true,
      selectedVersionNumber: '1.1.24',
      headlessSupported: true,
      generateImageSupported: true,
      availableModels: ['gemini-3.8-flash-low'],
    });
  });

  it('blocks an outdated runtime before login probes', () => {
    const calls: string[][] = [];
    const report = inspectAntigravityRuntime({
      resolveExecutable: () => 'agy',
      listCandidates: () => [{ path: 'agy', source: 'test' }],
      spawnSync: ((_command: string, args: string[]) => {
        calls.push(args);
        return { status: 0, stdout: '1.1.22\n' };
      }) as never,
    });

    expect(report.canRunJobs).toBe(false);
    expect(report.issues[0]?.code).toBe('antigravity_cli_outdated');
    expect(calls).toEqual([['--version']]);
  });

  it('does not pass unrelated provider credentials to the CLI', () => {
    expect(
      createAntigravityChildEnvironment({
        PATH: 'C:\\tools',
        USERPROFILE: 'C:\\Users\\dev',
        GOOGLE_API_KEY: 'google-secret',
        XAI_API_KEY: 'xai-secret',
        HTTPS_PROXY: 'https://proxy.example',
        HTTP_PROXY: 'http://user:pass@proxy.example',
      }),
    ).toEqual({
      PATH: 'C:\\tools',
      USERPROFILE: 'C:\\Users\\dev',
      HTTPS_PROXY: 'https://proxy.example',
      NO_COLOR: '1',
    });
  });
});
