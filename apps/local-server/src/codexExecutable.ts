import { existsSync } from 'node:fs';
import path from 'node:path';
import { listPlatformPathCandidates, resolvePlatformPath } from './platformPaths';

function resolveEnvCodexExecutable() {
  return process.env.STUDIO_CODEX_CLI_PATH || process.env.CODEX_CLI_PATH || null;
}

export function resolveCodexExecutable() {
  const envExecutable = resolveEnvCodexExecutable();
  if (envExecutable) return envExecutable;

  const candidates = listPlatformPathCandidates('codex-binary')
    .map((candidate) => candidate.path)
    .filter((candidate) => candidate !== 'codex');

  return (
    candidates.find((candidate) => existsSync(candidate)) ?? resolvePlatformPath('codex-binary')
  );
}

export function resolveCodexInvocationForExecutable(executable: string, args: string[]) {
  if (process.platform === 'win32' && executable.endsWith('.cmd')) {
    const quotedExecutable = `"${executable}"`;
    return ['cmd.exe', '/d', '/s', '/c', `${quotedExecutable} ${args.join(' ')}`];
  }
  if (process.platform === 'win32' && path.extname(executable) === '') {
    return ['cmd.exe', '/d', '/s', '/c', `"${executable}" ${args.join(' ')}`];
  }
  return [executable, ...args];
}

export function resolveCodexInvocation(args: string[]) {
  return resolveCodexInvocationForExecutable(resolveCodexExecutable(), args);
}
