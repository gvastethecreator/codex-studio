import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { StudioSettings } from '../../../packages/shared/src';

const DEFAULT_LIBRARY_DIR = 'D:\\AI-Studio-Library';
const DEFAULT_SERVER_PORT = 4317;
const DEFAULT_CODEX_WS_PORT = 4318;

function loadDotEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnvLocal();

export function getSettings(): StudioSettings {
  return {
    libraryDir: process.env.STUDIO_LIBRARY_DIR || DEFAULT_LIBRARY_DIR,
    serverPort: Number(process.env.STUDIO_SERVER_PORT || DEFAULT_SERVER_PORT),
    codexWsPort: Number(process.env.STUDIO_CODEX_WS_PORT || DEFAULT_CODEX_WS_PORT),
  };
}

export function getCodexWsUrl() {
  const { codexWsPort } = getSettings();
  return `ws://127.0.0.1:${codexWsPort}`;
}
