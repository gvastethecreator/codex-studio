import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type PlatformPathKey =
  | 'codex-binary'
  | 'codex-skills-dir'
  | 'codex-generated-images'
  | 'codex-config-dir';

function homeDir() {
  return process.env.USERPROFILE || os.homedir();
}

function firstExisting(paths: string[], fallback: string) {
  return paths.find((candidate) => existsSync(candidate)) ?? fallback;
}

function resolveWindowsPath(key: PlatformPathKey) {
  const home = homeDir();
  const codexConfig = path.join(home, '.codex');
  if (key === 'codex-config-dir') return codexConfig;
  if (key === 'codex-skills-dir') return path.join(codexConfig, 'skills');
  if (key === 'codex-generated-images') return path.join(codexConfig, 'generated_images');

  const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
  const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
  return firstExisting(
    [
      path.join(
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
      path.join(
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
      path.join(home, 'AppData', 'Roaming', 'npm', 'codex.cmd'),
      path.join(appData, 'npm', 'codex.cmd'),
      path.join(appData, 'npm', 'codex.exe'),
      path.join(appData, 'npm', 'codex'),
      path.join(localAppData, 'Microsoft', 'WindowsApps', 'codex.exe'),
    ],
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
    [
      path.join(home, '.local', 'bin', 'codex'),
      path.join(home, '.local', 'share', 'npm', 'bin', 'codex'),
      path.join(home, '.npm-global', 'bin', 'codex'),
    ],
    'codex',
  );
}

export function resolvePlatformPath(key: PlatformPathKey) {
  return process.platform === 'win32' ? resolveWindowsPath(key) : resolveUnixPath(key);
}

function getPlatformPathSeparator() {
  return path.sep;
}
