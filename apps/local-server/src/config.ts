import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { StudioSettings } from '../../../packages/shared/src';
import { resolveUserHome } from './platformHome';

const DEFAULT_SERVER_PORT = 17223;
const DEFAULT_CODEX_WS_PORT = 17224;
const DEFAULT_CODEX_IMAGEGEN_MODEL = 'gpt-5.4-mini';
const DEFAULT_CODEX_IMAGEGEN_REASONING_EFFORT: StudioSettings['codexImagegenReasoningEffort'] =
  'low';
const DEFAULT_CODEX_IMAGEGEN_SERVICE_TIER: StudioSettings['codexImagegenServiceTier'] = null;
const DEFAULT_MAX_CONCURRENT_CODEX_JOBS = 4;

let envLocalLoaded = false;

export function getEnvLocalPath() {
  return path.resolve(process.cwd(), '.env.local');
}

export function resolveDefaultLibraryDir() {
  return path.join(resolveUserHome(), 'AI-Studio-Library');
}

export function hasEnvLocalFile() {
  return existsSync(getEnvLocalPath());
}

export function loadDotEnvLocal() {
  if (envLocalLoaded) return;
  envLocalLoaded = true;

  const envPath = getEnvLocalPath();
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorMatch = /=/.exec(trimmed);
    if (!separatorMatch) continue;
    const separator = separatorMatch.index;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
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
    libraryDir: readStringSetting('STUDIO_LIBRARY_DIR', resolveDefaultLibraryDir()),
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
    codexMaxConcurrentJobs: readPositiveIntSetting(
      'STUDIO_MAX_CONCURRENT_CODEX_JOBS',
      DEFAULT_MAX_CONCURRENT_CODEX_JOBS,
    ),
  };
}

export function getCodexWsUrl() {
  const { codexWsPort } = getSettings();
  return `ws://127.0.0.1:${codexWsPort}`;
}
