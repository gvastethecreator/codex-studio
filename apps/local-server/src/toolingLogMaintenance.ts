import { mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import path from 'node:path';

import type { ToolingLogsPruneResult } from '../../../packages/shared/src';

const DEFAULT_TOOLING_LOG_RETENTION = 20;

function parseTimestampedToolingLogName(name: string) {
  const match = name.match(/^(.+)-(\d{4}-\d{2}-\d{2}T.*Z)\.log$/);
  if (!match) return null;
  return { group: match[1], stamp: match[2] };
}

export function pruneToolingLogs(
  retainPerTask = DEFAULT_TOOLING_LOG_RETENTION,
  logDir = path.resolve(process.cwd(), 'logs', 'tooling'),
): ToolingLogsPruneResult {
  mkdirSync(logDir, { recursive: true });
  const keep = Math.max(1, Math.floor(retainPerTask));
  const groups = new Map<string, Array<{ path: string; mtimeMs: number; stamp: string }>>();

  for (const entry of readdirSync(logDir, { withFileTypes: true })) {
    if (!entry.isFile() || entry.name.endsWith('.latest.log')) continue;
    const parsed = parseTimestampedToolingLogName(entry.name);
    if (!parsed) continue;
    const filePath = path.join(logDir, entry.name);
    const files = groups.get(parsed.group) ?? [];
    files.push({ path: filePath, mtimeMs: statSync(filePath).mtimeMs, stamp: parsed.stamp });
    groups.set(parsed.group, files);
  }

  let pruned = 0;
  for (const files of groups.values()) {
    files
      .sort((left, right) => right.mtimeMs - left.mtimeMs || right.stamp.localeCompare(left.stamp))
      .slice(keep)
      .forEach((file) => {
        unlinkSync(file.path);
        pruned += 1;
      });
  }

  return {
    logDir,
    retainPerTask: keep,
    pruned,
  };
}
