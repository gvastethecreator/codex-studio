import { resolvePlatformPath } from './platformPaths';

export function resolveCodexInvocation(args: string[]) {
  const executable = resolvePlatformPath('codex-binary');
  if (process.platform === 'win32' && executable.endsWith('.cmd')) {
    return ['cmd.exe', '/d', '/s', '/c', `${executable} ${args.map((arg) => `"${arg}"`).join(' ')}`];
  }
  return [executable, ...args];
}
