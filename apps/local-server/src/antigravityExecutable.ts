import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveUserHome } from './platformHome';

const SAFE_CHILD_ENV_NAMES = new Set(
  [
    'ANTIGRAVITY_CLI_HOME',
    'APPDATA',
    'COLORTERM',
    'COMSPEC',
    'HOME',
    'LANG',
    'LC_ALL',
    'LOCALAPPDATA',
    'NODE_EXTRA_CA_CERTS',
    'PATH',
    'PATHEXT',
    'SSL_CERT_DIR',
    'SSL_CERT_FILE',
    'SYSTEMROOT',
    'TEMP',
    'TERM',
    'TMP',
    'TMPDIR',
    'USERPROFILE',
    'WINDIR',
    'XDG_CACHE_HOME',
    'XDG_CONFIG_HOME',
    'XDG_DATA_HOME',
  ].map((name) => name.toLowerCase()),
);

const SAFE_PROXY_ENV_NAMES = new Set(
  ['ALL_PROXY', 'HTTPS_PROXY', 'HTTP_PROXY', 'NO_PROXY'].map((name) => name.toLowerCase()),
);

function isCredentialFreeProxyValue(name: string, value: string) {
  if (name.toLowerCase() === 'no_proxy') return !/[\u0000-\u001f\u007f]/.test(value);
  try {
    const url = new URL(value);
    return (
      !url.username && !url.password && (url.protocol === 'http:' || url.protocol === 'https:')
    );
  } catch {
    return false;
  }
}

export function createAntigravityChildEnvironment(env: NodeJS.ProcessEnv = process.env) {
  const childEnv: NodeJS.ProcessEnv = {};
  for (const [name, value] of Object.entries(env)) {
    if (!value) continue;
    const normalized = name.toLowerCase();
    if (
      SAFE_CHILD_ENV_NAMES.has(normalized) ||
      (SAFE_PROXY_ENV_NAMES.has(normalized) && isCredentialFreeProxyValue(name, value))
    ) {
      childEnv[name] = value;
    }
  }
  childEnv.NO_COLOR = '1';
  return childEnv;
}

export interface AntigravityExecutableCandidate {
  path: string;
  source: string;
}

function pathCandidates(env: NodeJS.ProcessEnv) {
  return (env.PATH ?? '')
    .split(path.delimiter)
    .filter(Boolean)
    .map((directory) => ({
      path: path.join(directory, process.platform === 'win32' ? 'agy.exe' : 'agy'),
      source: 'PATH executable',
    }))
    .filter((candidate) => existsSync(candidate.path));
}

export function listAntigravityExecutableCandidates(
  env: NodeJS.ProcessEnv = process.env,
): AntigravityExecutableCandidate[] {
  const home = resolveUserHome({ env });
  const configured =
    env.STUDIO_ANTIGRAVITY_CLI_PATH?.trim() ||
    env.ANTIGRAVITY_CLI_PATH?.trim() ||
    env.AGY_BIN?.trim();
  const configuredPath = configured
    ? path.isAbsolute(configured)
      ? configured
      : path.resolve(configured)
    : null;
  const localAppData = env.LOCALAPPDATA?.trim();
  const candidates: AntigravityExecutableCandidate[] = [
    ...(configuredPath
      ? [
          {
            path: configuredPath,
            source: env.STUDIO_ANTIGRAVITY_CLI_PATH?.trim()
              ? 'STUDIO_ANTIGRAVITY_CLI_PATH'
              : env.ANTIGRAVITY_CLI_PATH?.trim()
                ? 'ANTIGRAVITY_CLI_PATH'
                : 'AGY_BIN',
          },
        ]
      : []),
    ...(localAppData
      ? [
          {
            path: path.join(
              localAppData,
              'agy',
              'bin',
              process.platform === 'win32' ? 'agy.exe' : 'agy',
            ),
            source: 'Antigravity CLI install',
          },
        ]
      : []),
    {
      path: path.join(home, '.local', 'bin', process.platform === 'win32' ? 'agy.exe' : 'agy'),
      source: 'User-local install',
    },
    ...pathCandidates(env),
    { path: 'agy', source: 'PATH fallback' },
  ];
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = candidate.path.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function resolveAntigravityExecutable(env: NodeJS.ProcessEnv = process.env) {
  const candidates = listAntigravityExecutableCandidates(env);
  return (
    candidates.find((candidate) => candidate.path !== 'agy' && existsSync(candidate.path))?.path ??
    'agy'
  );
}

export function resolveAntigravityHome(env: NodeJS.ProcessEnv = process.env) {
  const configured = env.ANTIGRAVITY_CLI_HOME?.trim();
  return configured
    ? path.resolve(configured)
    : path.join(resolveUserHome({ env }), '.gemini', 'antigravity-cli');
}
