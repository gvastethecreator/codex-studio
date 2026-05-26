import { accessSync, constants, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getSettings } from './config';

export const LIBRARY_FOLDERS = [
  '.studio',
  '.studio/references',
  '.studio/masks',
  '.studio/transcripts',
  '.studio/state',
  '.studio/logs',
  '.studio/logs/history',
  '.studio/.trash',
  '.studio/.trash/transcripts',
  'outputs',
  'outputs/external',
  'outputs/thumbnails',
  'outputs/exports',
  'outputs/.trash',
  'outputs/.trash/assets',
  'outputs/.trash/thumbnails',
] as const;

const LOGICAL_LIBRARY_PATHS: Record<string, string[]> = {
  'library.sqlite': ['.studio', 'studio.sqlite'],
  'studio.sqlite': ['.studio', 'studio.sqlite'],
  assets: ['outputs'],
  thumbnails: ['outputs', 'thumbnails'],
  exports: ['outputs', 'exports'],
  references: ['.studio', 'references'],
  masks: ['.studio', 'masks'],
  transcripts: ['.studio', 'transcripts'],
  state: ['.studio', 'state'],
  logs: ['.studio', 'logs'],
  'logs/history': ['.studio', 'logs', 'history'],
  '.trash': ['outputs', '.trash'],
  '.trash/assets': ['outputs', '.trash', 'assets'],
  '.trash/thumbnails': ['outputs', '.trash', 'thumbnails'],
  '.trash/transcripts': ['.studio', '.trash', 'transcripts'],
};

function normalizeSegments(segments: string[]) {
  return segments.join('/').replaceAll('\\', '/').replace(/^\/+/, '');
}

export function resolveLibraryPathFromRoot(libraryDir: string, ...segments: string[]) {
  if (segments.length === 0) return libraryDir;

  const logicalPath = normalizeSegments(segments);
  const [first, ...rest] = logicalPath.split('/');
  const mappedFirst = LOGICAL_LIBRARY_PATHS[first];
  const mappedExact = LOGICAL_LIBRARY_PATHS[logicalPath];

  if (mappedExact) return path.join(libraryDir, ...mappedExact);
  if (mappedFirst) return path.join(libraryDir, ...mappedFirst, ...rest);

  return path.join(libraryDir, ...segments);
}

export function resolveLibraryPath(...segments: string[]) {
  return resolveLibraryPathFromRoot(getSettings().libraryDir, ...segments);
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
      [
        'Codex Studio workspace.',
        '.studio stores local state, settings, SQLite, logs, references, and transcripts.',
        'outputs stores generated images and user-facing exports.',
        '',
      ].join('\n'),
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

  const missingFolders = LIBRARY_FOLDERS.filter(
    (folder) => !existsSync(path.join(libraryDir, folder)),
  );

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

export function resolvePublicLibraryPath(relativePath: string) {
  const { libraryDir } = getSettings();
  const normalized = relativePath.replaceAll('\\', '/').replace(/^\/+/, '');
  return path.join(libraryDir, ...normalized.split('/'));
}
