import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveUserHome } from './platformHome';

export interface GrokExecutableCandidate {
  path: string;
  source: string;
}

function pathCandidates(env: NodeJS.ProcessEnv) {
  return (env.PATH ?? '')
    .split(path.delimiter)
    .filter(Boolean)
    .map((directory) => ({
      path: path.join(directory, process.platform === 'win32' ? 'grok.exe' : 'grok'),
      source: 'PATH executable',
    }))
    .filter((candidate) => existsSync(candidate.path));
}

export function listGrokExecutableCandidates(
  env: NodeJS.ProcessEnv = process.env,
): GrokExecutableCandidate[] {
  const home = resolveUserHome({ env });
  const configured =
    env.STUDIO_GROK_CLI_PATH?.trim() || env.GROK_CLI_PATH?.trim() || env.GROK_BIN?.trim();
  const configuredPath =
    configured && (path.isAbsolute(configured) || !/[\\/]/.test(configured))
      ? configured
      : configured
        ? path.resolve(configured)
        : null;
  const candidates: GrokExecutableCandidate[] = [
    ...(configuredPath
      ? [
          {
            path: configuredPath,
            source: env.STUDIO_GROK_CLI_PATH?.trim()
              ? 'STUDIO_GROK_CLI_PATH'
              : env.GROK_CLI_PATH?.trim()
                ? 'GROK_CLI_PATH'
                : 'GROK_BIN',
          },
        ]
      : []),
    {
      path: path.join(home, '.grok', 'bin', process.platform === 'win32' ? 'grok.exe' : 'grok'),
      source: 'Grok Build install',
    },
    ...pathCandidates(env),
    { path: 'grok', source: 'PATH fallback' },
  ];
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = candidate.path.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function resolveGrokExecutable(env: NodeJS.ProcessEnv = process.env) {
  const candidates = listGrokExecutableCandidates(env);
  return (
    candidates.find((candidate) => candidate.path !== 'grok' && existsSync(candidate.path))?.path ??
    'grok'
  );
}

export function resolveGrokHome(env: NodeJS.ProcessEnv = process.env) {
  const configured = env.GROK_HOME?.trim();
  return configured ? path.resolve(configured) : path.join(resolveUserHome({ env }), '.grok');
}
