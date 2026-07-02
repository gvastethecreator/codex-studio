import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolvePlatformPath } from './platformPaths';
import { resolveUserHome } from './platformHome';

export function resolveCodexExecutable() {
  if (process.platform !== 'win32') return resolvePlatformPath('codex-binary');

  const home = resolveUserHome({ platform: 'win32' });
  const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
  const shimCandidates = [
    resolvePlatformPath('codex-binary'),
    path.join(home, 'AppData', 'Roaming', 'npm', 'codex.cmd'),
    path.join(appData, 'npm', 'codex.cmd'),
    path.join(appData, 'npm', 'codex.exe'),
    path.join(appData, 'npm', 'codex'),
  ];

  return (
    shimCandidates.find((candidate) => existsSync(candidate)) ?? resolvePlatformPath('codex-binary')
  );
}

export function resolveCodexInvocation(args: string[]) {
  const executable = resolveCodexExecutable();
  if (process.platform === 'win32' && executable.endsWith('.cmd')) {
    const quotedExecutable = `"${executable}"`;
    return ['cmd.exe', '/d', '/s', '/c', `${quotedExecutable} ${args.join(' ')}`];
  }
  return [executable, ...args];
}
