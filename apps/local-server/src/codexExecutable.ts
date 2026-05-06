import { resolvePlatformPath } from './platformPaths';

export function resolveCodexInvocation(args: string[]) {
  const executable = resolvePlatformPath('codex-binary');
  if (process.platform === 'win32' && executable.endsWith('.cmd')) {
    const quotedExecutable = `"${executable}"`;
    return ['cmd.exe', '/d', '/s', '/c', `${quotedExecutable} ${args.join(' ')}`];
  }
  return [executable, ...args];
}
