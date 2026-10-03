import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import type { StudioSettings } from '../../../packages/shared/src';
import { BUILT_IN_GENERATION_PROVIDERS } from '../../../packages/shared/src/generationContracts';
import { validateWorkerLimits } from '../../../packages/shared/src/workerContracts';
import { DEFAULT_STUDIO_IMAGES_FOLDER_NAME } from '../../../packages/shared/src/onboardingContracts';
import { isAbsolutePlatformPath, resolveUserHome } from './platformHome';
import { resolvePicturesDir } from './platformDirectories';

const DEFAULT_SERVER_PORT = 17223;
const DEFAULT_CODEX_WS_PORT = 17224;
const DEFAULT_CODEX_IMAGEGEN_MODEL = 'gpt-5.4';
const DEFAULT_CODEX_IMAGEGEN_REASONING_EFFORT: StudioSettings['codexImagegenReasoningEffort'] =
  'medium';
const DEFAULT_CODEX_IMAGEGEN_SERVICE_TIER: StudioSettings['codexImagegenServiceTier'] = null;

let envLocalLoaded = false;

export function getEnvLocalPath() {
  return path.resolve(process.cwd(), '.env.local');
}

function absoluteEnvPath(value: string | undefined, platform: NodeJS.Platform) {
  const trimmed = value?.trim();
  return trimmed && isAbsolutePlatformPath(trimmed, platform) ? trimmed : null;
}

/**
 * Private per-user folder for Cozy Studio's own data: the Studio Library (SQLite, settings, logs,
 * thumbnails, references) and installed style packs. Generated images go elsewhere.
 */
export function resolveStudioDataRoot(
  env: Record<string, string | undefined> = process.env,
  platform: NodeJS.Platform = process.platform,
  home = resolveUserHome({ env: env as NodeJS.ProcessEnv, platform }),
) {
  if (platform === 'win32')
    return path.win32.join(
      absoluteEnvPath(env.LOCALAPPDATA, platform) ?? path.win32.join(home, 'AppData', 'Local'),
      'Cozy Studio',
    );
  if (platform === 'darwin')
    return path.posix.join(home, 'Library', 'Application Support', 'Cozy Studio');
  return path.posix.join(
    absoluteEnvPath(env.XDG_DATA_HOME, platform) ?? path.posix.join(home, '.local', 'share'),
    'cozy-studio',
  );
}

export function resolveDefaultLibraryDir() {
  return path.join(resolveStudioDataRoot(), 'Library');
}

/** Where generated images go by default: `STUDIO_IMAGES_DIR`, else the OS Pictures directory. */
export function resolveDefaultImagesDir(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  home?: string,
) {
  const configured = env.STUDIO_IMAGES_DIR?.trim();
  if (configured) {
    if (!isAbsolutePlatformPath(configured, platform)) {
      throw new Error('STUDIO_IMAGES_DIR must be an absolute path for this operating system.');
    }
    return configured;
  }
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  return pathApi.join(resolvePicturesDir(env, platform, home), DEFAULT_STUDIO_IMAGES_FOLDER_NAME);
}

export function hasEnvLocalFile() {
  return existsSync(getEnvLocalPath());
}

/** Bun expands dollar signs even in quoted dotenv values. Keep filesystem paths literal. */
export function serializeEnvPath(value: string) {
  if (/[\0\r\n]/.test(value)) throw new Error('A bootstrap path must fit on one line.');
  if (!/[#$]/.test(value)) return value;
  const quote = ["'", '`', '"'].find(
    (candidate) => !value.includes(candidate) && (candidate !== '"' || !/\\[nr]/.test(value)),
  );
  if (!quote) throw new Error('This path cannot be quoted safely in .env.local.');
  return `${quote}${value.replaceAll('$', '\\$')}${quote}`;
}

export function readBootstrapEnv(contents: string) {
  return Object.fromEntries(
    Object.entries(parseEnv(contents)).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, value.replaceAll('\\$', '$')]],
    ),
  );
}

export function loadDotEnvLocal() {
  if (envLocalLoaded) return;
  envLocalLoaded = true;

  const envPath = getEnvLocalPath();
  if (!existsSync(envPath)) return;

  for (const [key, value] of Object.entries(readBootstrapEnv(readFileSync(envPath, 'utf8')))) {
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function warnInvalidSetting(
  key: string,
  value: string | undefined,
  fallback: string | number | null,
) {
  const renderedValue = value === undefined ? 'undefined' : JSON.stringify(value);
  console.warn(
    `[studio-config] Invalid ${key}=${renderedValue}. Using ${JSON.stringify(fallback)}.`,
  );
}

function readStringSetting(key: string, fallback: string) {
  const value = process.env[key]?.trim();
  return value ? value : fallback;
}

function readLibraryDirSetting() {
  const configured = process.env.STUDIO_LIBRARY_DIR?.trim();
  if (!configured) return resolveDefaultLibraryDir();
  if (!isAbsolutePlatformPath(configured)) {
    throw new Error('STUDIO_LIBRARY_DIR must be an absolute path for this operating system.');
  }
  return configured;
}

function readPositiveIntSetting(key: string, fallback: number) {
  const raw = process.env[key]?.trim();
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    warnInvalidSetting(key, raw, fallback);
    return fallback;
  }

  return parsed;
}

function readReasoningEffortSetting(
  key: string,
  fallback: StudioSettings['codexImagegenReasoningEffort'],
) {
  const raw = process.env[key]?.trim().toLowerCase();
  if (!raw) return fallback;
  if (raw === 'low' || raw === 'medium' || raw === 'high' || raw === 'xhigh') return raw;
  warnInvalidSetting(key, raw, fallback);
  return fallback;
}

function readServiceTierSetting(key: string, fallback: StudioSettings['codexImagegenServiceTier']) {
  const raw = process.env[key]?.trim().toLowerCase();
  if (!raw) return fallback;
  if (raw === 'fast' || raw === 'flex') return raw;
  if (raw === 'standard' || raw === 'default' || raw === 'auto' || raw === 'none') return null;
  warnInvalidSetting(key, raw, fallback);
  return fallback;
}

export function getSettings(): StudioSettings {
  loadDotEnvLocal();

  return {
    libraryDir: readLibraryDirSetting(),
    serverPort: readPositiveIntSetting('STUDIO_SERVER_PORT', DEFAULT_SERVER_PORT),
    codexWsPort: readPositiveIntSetting('STUDIO_CODEX_WS_PORT', DEFAULT_CODEX_WS_PORT),
    codexImagegenModel: readStringSetting('CODEX_IMAGEGEN_MODEL', DEFAULT_CODEX_IMAGEGEN_MODEL),
    codexImagegenReasoningEffort: readReasoningEffortSetting(
      'CODEX_IMAGEGEN_REASONING_EFFORT',
      DEFAULT_CODEX_IMAGEGEN_REASONING_EFFORT,
    ),
    codexImagegenServiceTier: readServiceTierSetting(
      'CODEX_IMAGEGEN_SERVICE_TIER',
      DEFAULT_CODEX_IMAGEGEN_SERVICE_TIER,
    ),
    workerLimits: validateWorkerLimits({
      global: Number(process.env.STUDIO_MAX_CONCURRENT_JOBS ?? 4),
      providers: Object.fromEntries(
        BUILT_IN_GENERATION_PROVIDERS.map((provider) => [
          provider,
          Number(process.env[`STUDIO_MAX_CONCURRENT_${provider.toUpperCase()}_JOBS`] ?? 1),
        ]),
      ),
    }),
  };
}

export function getCodexWsUrl() {
  const { codexWsPort } = getSettings();
  return `ws://127.0.0.1:${codexWsPort}`;
}
