import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isAbsolutePlatformPath, resolveUserHome } from './platformHome';

function windowsPicturesDir(env: NodeJS.ProcessEnv) {
  const systemRoot = env.SystemRoot ?? env.SYSTEMROOT;
  const powershell =
    systemRoot && isAbsolutePlatformPath(systemRoot, 'win32')
      ? path.win32.join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
      : 'powershell.exe';
  try {
    const folder = execFileSync(
      powershell,
      [
        '-NoLogo',
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        '[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false); ' +
          '[Environment]::GetFolderPath([Environment+SpecialFolder]::MyPictures, [Environment+SpecialFolderOption]::DoNotVerify)',
      ],
      { encoding: 'utf8', windowsHide: true, timeout: 5_000, maxBuffer: 64 * 1024 },
    ).trim();
    if (isAbsolutePlatformPath(folder, 'win32')) return folder;
  } catch {
    // Do not guess a different folder when Windows cannot report the user's Known Folder.
  }
  throw new Error(
    'Unable to locate the Windows Pictures folder. Set STUDIO_IMAGES_DIR to an absolute path.',
  );
}

function xdgPicturesDir(env: NodeJS.ProcessEnv, home: string) {
  const requirePicturesFolder = (folder: string) => {
    if (path.posix.resolve(folder) === path.posix.resolve(home)) {
      throw new Error(
        'The XDG Pictures folder is disabled. Set STUDIO_IMAGES_DIR to an absolute path.',
      );
    }
    return folder;
  };
  const configured = env.XDG_PICTURES_DIR?.trim();
  if (configured && isAbsolutePlatformPath(configured, 'linux'))
    return requirePicturesFolder(configured);
  const configHome = env.XDG_CONFIG_HOME?.trim();
  const configDir =
    configHome && isAbsolutePlatformPath(configHome, 'linux')
      ? configHome
      : path.posix.join(home, '.config');
  let contents: string;
  try {
    contents = readFileSync(path.posix.join(configDir, 'user-dirs.dirs'), 'utf8');
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'ENOTDIR') return path.posix.join(home, 'Pictures');
    throw error;
  }
  const match = /^\s*XDG_PICTURES_DIR\s*=\s*"((?:\\.|[^"\\])*)"\s*(?:#.*)?$/m.exec(contents);
  if (match) {
    const homePrefix = /^(?:\$HOME|\$\{HOME\})(?=\/|$)/.exec(match[1]);
    const suffix = match[1].slice(homePrefix?.[0].length ?? 0);
    // user-dirs.dirs is data. Expand HOME only; never source it as a shell script.
    if (!/(^|[^\\])(?:\\\\)*[$`]/.test(suffix)) {
      const folder = (homePrefix ? home : '') + suffix.replace(/\\(["\\$`])/g, '$1');
      if (isAbsolutePlatformPath(folder, 'linux')) return requirePicturesFolder(folder);
    }
  }
  return path.posix.join(home, 'Pictures');
}

/** Resolve the OS Pictures directory, including Windows redirection and Linux XDG settings. */
export function resolvePicturesDir(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  home = resolveUserHome({ env, platform }),
) {
  if (platform === 'win32') return windowsPicturesDir(env);
  if (platform === 'darwin') return path.posix.join(home, 'Pictures');
  return xdgPicturesDir(env, home);
}
