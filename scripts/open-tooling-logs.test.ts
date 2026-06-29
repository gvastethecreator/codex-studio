import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

import { resolveOpenCommand, resolveToolingLogDir } from './open-tooling-logs';

describe('resolveToolingLogDir', () => {
  it('resolves the repo-local tooling log dir', () => {
    expect(resolveToolingLogDir('/repo')).toBe(path.resolve('/repo', 'logs', 'tooling'));
  });
});

describe('resolveOpenCommand', () => {
  it('uses cmd start on Windows', () => {
    expect(resolveOpenCommand('C:\\repo\\logs\\tooling', 'win32')).toEqual({
      command: 'cmd.exe',
      args: ['/d', '/s', '/c', 'start', '', 'C:\\repo\\logs\\tooling'],
    });
  });

  it('uses open on macOS', () => {
    expect(resolveOpenCommand('/repo/logs/tooling', 'darwin')).toEqual({
      command: 'open',
      args: ['/repo/logs/tooling'],
    });
  });

  it('uses xdg-open on Linux and other Unix platforms', () => {
    expect(resolveOpenCommand('/repo/logs/tooling', 'linux')).toEqual({
      command: 'xdg-open',
      args: ['/repo/logs/tooling'],
    });
  });
});
