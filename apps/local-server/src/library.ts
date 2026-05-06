import { accessSync, constants, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getSettings } from './config';

export const LIBRARY_FOLDERS = [
  'assets',
  'thumbnails',
  'references',
  'masks',
  'exports',
  'transcripts',
  'logs',
  'logs/history',
  '.trash',
  '.trash/assets',
  '.trash/thumbnails',
  '.trash/transcripts',
] as const;

export function resolveLibraryPath(...segments: string[]) {
  return path.join(getSettings().libraryDir, ...segments);
}

export function ensureLibrary() {
  const { libraryDir } = getSettings();
  mkdirSync(libraryDir, { recursive: true });
  for (const folder of LIBRARY_FOLDERS) {
    mkdirSync(path.join(libraryDir, folder), { recursive: true });
  }

  const readmePath = path.join(libraryDir, 'README.txt');
  if (!existsSync(readmePath)) {
    writeFileSync(
      readmePath,
      'Codex Image Studio local library. Assets, SQLite, logs and transcripts are managed by the local studio server.\n',
      'utf8',
    );
  }
}

export function inspectLibrary() {
  const { libraryDir } = getSettings();
  const readmePath = path.join(libraryDir, 'README.txt');
  const exists = existsSync(libraryDir);
  let writable = false;

  if (exists) {
    try {
      accessSync(libraryDir, constants.W_OK);
      writable = true;
    } catch {
      writable = false;
    }
  }

  const missingFolders = LIBRARY_FOLDERS.filter((folder) => !existsSync(path.join(libraryDir, folder)));

  return {
    exists,
    writable,
    readmePresent: existsSync(readmePath),
    missingFolders,
  };
}

export function toPublicAssetUrl(filePath: string) {
  const relative = path.relative(getSettings().libraryDir, filePath).replaceAll(path.sep, '/');
  return `/library/${encodeURIComponent(relative).replaceAll('%2F', '/')}`;
}
