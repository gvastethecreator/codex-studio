import os from 'node:os';

export interface ResolveUserHomeOptions {
  env?: NodeJS.ProcessEnv;
  platform?: NodeJS.Platform;
  fallback?: string;
}

export function resolveUserHome(options: ResolveUserHomeOptions = {}) {
  const env = options.env ?? process.env;
  const platform = options.platform ?? process.platform;
  const fallback = options.fallback ?? os.homedir();

  const primary =
    platform === 'win32'
      ? env.USERPROFILE?.trim() || env.HOME?.trim()
      : env.HOME?.trim() || env.USERPROFILE?.trim();

  return primary || fallback || process.cwd();
}
