import os from 'node:os';
import path from 'node:path';

export function isAbsolutePlatformPath(
  value: string,
  platform: NodeJS.Platform = process.platform,
) {
  if (value.includes('\0')) return false;
  if (platform !== 'win32') return path.posix.isAbsolute(value);
  // A rooted Windows path without a drive still depends on the current drive.
  return /^(?:[a-z]:[\\/]|[\\/]{2}[^\\/]+[\\/][^\\/]+)/i.test(value);
}

export interface ResolveUserHomeOptions {
  env?: NodeJS.ProcessEnv;
  platform?: NodeJS.Platform;
  fallback?: string;
}

export function resolveUserHome(options: ResolveUserHomeOptions = {}) {
  const env = options.env ?? process.env;
  const platform = options.platform ?? process.platform;
  const fallback = options.fallback ?? os.homedir();

  const candidates =
    platform === 'win32'
      ? [
          env.USERPROFILE,
          env.HOMEDRIVE && env.HOMEPATH ? `${env.HOMEDRIVE}${env.HOMEPATH}` : undefined,
          env.HOME,
          fallback,
        ]
      : [env.HOME, fallback];

  const home = candidates
    .map((candidate) => candidate?.trim())
    .find((candidate): candidate is string =>
      Boolean(candidate && isAbsolutePlatformPath(candidate, platform)),
    );
  if (!home) throw new Error('Unable to locate an absolute user home directory.');
  return home;
}
