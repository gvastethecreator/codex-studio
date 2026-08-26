import path from 'node:path';
import {
  ONBOARDING_BUN_INSTALL_URL,
  ONBOARDING_CODEX_INSTALL_URL,
  PORTABLE_STUDIO_LIBRARY_FOLDER_NAME,
} from '../packages/shared/src';

export const PORTABLE_LOGIN_DISCLAIMER =
  'This launcher does not bundle ChatGPT login. Run `codex login` and choose ChatGPT when Codex CLI asks.';

export function missingBunMessage() {
  return `Codex Studio needs Bun. Install it from ${ONBOARDING_BUN_INSTALL_URL} then run this launcher again.`;
}

export function missingCodexCliMessage() {
  return `Codex Studio needs Codex CLI. Install it from ${ONBOARDING_CODEX_INSTALL_URL} then run this launcher again.`;
}

export function resolvePortableLibraryDir(input: {
  studioLibraryDir?: string | null;
  portable: boolean;
  unpackRoot: string;
  homeDefault: string;
}) {
  const existing = input.studioLibraryDir?.trim();
  if (existing) return existing;
  if (input.portable) {
    return path.join(input.unpackRoot, PORTABLE_STUDIO_LIBRARY_FOLDER_NAME);
  }
  return input.homeDefault;
}

export function portableServerArgv() {
  return ['apps/local-server/src/index.ts'];
}

export function portableStudioUrl(port: number) {
  return `http://127.0.0.1:${port}`;
}

export function parseListeningUrl(output: string) {
  const match = output.match(/https?:\/\/127\.0\.0\.1:\d+/);
  return match?.[0] ?? null;
}
