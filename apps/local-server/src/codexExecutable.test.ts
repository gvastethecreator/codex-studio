import { describe, expect, it } from 'vite-plus/test';

import { resolveCodexInvocationForExecutable } from './codexExecutable';

describe('Codex executable invocation', () => {
  it('uses call for Windows command shims so cmd does not misparse a quoted path', () => {
    const executable = 'C:\\Users\\Studio User\\AppData\\Roaming\\npm\\codex.cmd';
    const invocation = resolveCodexInvocationForExecutable(executable, ['app-server', '--help']);

    if (process.platform === 'win32') {
      expect(invocation).toEqual([
        'cmd.exe',
        '/d',
        '/s',
        '/c',
        `call "${executable}" app-server --help`,
      ]);
      return;
    }

    expect(invocation).toEqual([executable, 'app-server', '--help']);
  });
});
