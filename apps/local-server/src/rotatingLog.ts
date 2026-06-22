import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from 'node:fs';
import path from 'node:path';

export interface RotatingLogOptions {
  maxBytes?: number;
  maxHistoryFiles?: number;
  now?: () => Date;
}

export const DEFAULT_ROTATING_LOG_MAX_BYTES = 10 * 1024 * 1024;
export const DEFAULT_ROTATING_LOG_HISTORY_FILES = 20;

function readPositiveIntegerEnv(name: string, fallback: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function resolveRotatingLogOptions(options: RotatingLogOptions = {}) {
  return {
    maxBytes:
      options.maxBytes ??
      readPositiveIntegerEnv('STUDIO_LOG_MAX_BYTES', DEFAULT_ROTATING_LOG_MAX_BYTES),
    maxHistoryFiles:
      options.maxHistoryFiles ??
      readPositiveIntegerEnv('STUDIO_LOG_HISTORY_FILES', DEFAULT_ROTATING_LOG_HISTORY_FILES),
    now: options.now ?? (() => new Date()),
  };
}

function createHistoryFilePath(filePath: string, now: Date) {
  const directory = path.dirname(filePath);
  const historyDirectory = path.join(directory, 'history');
  const logPathParts = path.parse(filePath);
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  return path.join(
    historyDirectory,
    `${logPathParts.name}.${timestamp}${logPathParts.ext || '.log'}`,
  );
}

function pruneHistory(filePath: string, maxHistoryFiles: number) {
  if (maxHistoryFiles <= 0) return;

  const directory = path.dirname(filePath);
  const historyDirectory = path.join(directory, 'history');
  if (!existsSync(historyDirectory)) return;

  const logPathParts = path.parse(filePath);
  const historyFiles = readdirSync(historyDirectory)
    .flatMap((name) => {
      if (!name.startsWith(`${logPathParts.name}.`)) return [];
      const fullPath = path.join(historyDirectory, name);
      return [
        {
          path: fullPath,
          mtimeMs: statSync(fullPath).mtimeMs,
        },
      ];
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  for (const file of historyFiles.slice(maxHistoryFiles)) {
    rmSync(file.path, { force: true });
  }
}

function rotateLogIfNeeded(filePath: string, options: RotatingLogOptions = {}) {
  const resolved = resolveRotatingLogOptions(options);
  if (!existsSync(filePath)) return false;
  const size = statSync(filePath).size;
  if (size < resolved.maxBytes) return false;

  const historyPath = createHistoryFilePath(filePath, resolved.now());
  mkdirSync(path.dirname(historyPath), { recursive: true });
  renameSync(filePath, historyPath);
  pruneHistory(filePath, resolved.maxHistoryFiles);
  return true;
}

export function appendRotatingLog(
  filePath: string,
  text: string,
  options: RotatingLogOptions = {},
) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  rotateLogIfNeeded(filePath, options);
  appendFileSync(filePath, text, 'utf8');
}
