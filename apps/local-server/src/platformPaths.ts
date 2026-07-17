import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveUserHome } from './platformHome';

export type PlatformPathKey =
  | 'codex-binary'
  | 'codex-skills-dir'
  | 'codex-generated-images'
  | 'codex-config-dir';

function homeDir() {
  return resolveUserHome();
}

function firstExisting(paths: string[], fallback: string) {
  return paths.find((candidate) => existsSync(candidate)) ?? fallback;
}

export interface PlatformPathCandidate {
  path: string;
  source: string;
}

function windowsCodexBinaryCandidates() {
  const home = homeDir();
  const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
  const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
  const pathCandidates = (process.env.PATH || '')
    .split(path.delimiter)
    .filter(Boolean)
    .flatMap((dir) => [
      {
        path: path.join(dir, 'codex.exe'),
        source: 'PATH executable',
      },
      {
        path: path.join(dir, 'codex.cmd'),
        source: 'PATH command shim',
      },
      {
        path: path.join(dir, 'codex'),
        source: 'PATH shell shim',
      },
    ])
    .filter((candidate) => existsSync(candidate.path));

  return [
    ...(process.env.STUDIO_CODEX_CLI_PATH
      ? [{ path: process.env.STUDIO_CODEX_CLI_PATH, source: 'STUDIO_CODEX_CLI_PATH' }]
      : []),
    ...(process.env.CODEX_CLI_PATH
      ? [{ path: process.env.CODEX_CLI_PATH, source: 'CODEX_CLI_PATH' }]
      : []),
    {
      path: path.join(localAppData, 'Programs', 'OpenAI', 'Codex', 'bin', 'codex.exe'),
      source: 'OpenAI desktop install',
    },
    {
      path: path.join(home, 'AppData', 'Roaming', 'npm', 'codex.cmd'),
      source: 'npm command shim',
    },
    {
      path: path.join(appData, 'npm', 'codex.cmd'),
      source: 'npm command shim',
    },
    {
      path: path.join(appData, 'npm', 'codex.exe'),
      source: 'npm executable shim',
    },
    {
      path: path.join(appData, 'npm', 'codex'),
      source: 'npm shell shim',
    },
    {
      path: path.join(home, '.bun', 'bin', 'codex.exe'),
      source: 'Bun global executable shim',
    },
    {
      path: path.join(localAppData, 'Microsoft', 'WindowsApps', 'codex.exe'),
      source: 'WindowsApps alias',
    },
    ...pathCandidates,
    // Package-internal vendor paths are recovery fallbacks only. Their layout
    // changes across Codex releases, while the launchers above are stable.
    {
      path: path.join(
        appData,
        'npm',
        'node_modules',
        '@openai',
        'codex',
        'node_modules',
        '@openai',
        'codex-win32-x64',
        'vendor',
        'x86_64-pc-windows-msvc',
        'codex.exe',
      ),
      source: 'npm package vendor binary',
    },
    {
      path: path.join(
        appData,
        'npm',
        'node_modules',
        '@openai',
        'codex',
        'node_modules',
        '@openai',
        'codex-win32-x64',
        'vendor',
        'x86_64-pc-windows-msvc',
        'bin',
        'codex.exe',
      ),
      source: 'npm package bin vendor binary',
    },
    {
      path: 'codex',
      source: 'PATH fallback',
    },
  ] satisfies PlatformPathCandidate[];
}

function unixCodexBinaryCandidates() {
  const home = homeDir();
  return [
    { path: path.join(home, '.local', 'bin', 'codex'), source: 'local bin' },
    { path: path.join(home, '.local', 'share', 'npm', 'bin', 'codex'), source: 'npm local bin' },
    { path: path.join(home, '.npm-global', 'bin', 'codex'), source: 'npm global bin' },
    { path: 'codex', source: 'PATH fallback' },
  ] satisfies PlatformPathCandidate[];
}

function resolveWindowsPath(key: PlatformPathKey) {
  const home = homeDir();
  const codexConfig = path.join(home, '.codex');
  if (key === 'codex-config-dir') return codexConfig;
  if (key === 'codex-skills-dir') return path.join(codexConfig, 'skills');
  if (key === 'codex-generated-images') return path.join(codexConfig, 'generated_images');

  return firstExisting(
    windowsCodexBinaryCandidates()
      .map((candidate) => candidate.path)
      .filter((candidate) => candidate !== 'codex'),
    'codex',
  );
}

function resolveUnixPath(key: PlatformPathKey) {
  const home = homeDir();
  const codexConfig = path.join(home, '.codex');
  if (key === 'codex-config-dir') return codexConfig;
  if (key === 'codex-skills-dir') return path.join(codexConfig, 'skills');
  if (key === 'codex-generated-images') return path.join(codexConfig, 'generated_images');

  return firstExisting(
    unixCodexBinaryCandidates()
      .map((candidate) => candidate.path)
      .filter((candidate) => candidate !== 'codex'),
    'codex',
  );
}

export function resolvePlatformPath(key: PlatformPathKey) {
  return process.platform === 'win32' ? resolveWindowsPath(key) : resolveUnixPath(key);
}

export function listPlatformPathCandidates(key: PlatformPathKey): PlatformPathCandidate[] {
  if (key !== 'codex-binary') return [{ path: resolvePlatformPath(key), source: 'resolved path' }];
  return process.platform === 'win32'
    ? windowsCodexBinaryCandidates()
    : unixCodexBinaryCandidates();
}
