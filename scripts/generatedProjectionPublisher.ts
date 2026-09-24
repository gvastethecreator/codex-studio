import { randomUUID } from 'node:crypto';
import { access, copyFile, cp, lstat, mkdir, readdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';

export interface PreparedProjection {
  target: string;
  staged: string;
  kind: 'file' | 'directory';
}

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function validateProjectionPaths(items: readonly PreparedProjection[]) {
  const targets = new Set<string>();
  for (const item of items) {
    const target = path.resolve(item.target);
    const staged = path.resolve(item.staged);
    if (
      targets.has(target) ||
      path.dirname(target) !== path.dirname(staged) ||
      !path.basename(staged).startsWith(`${path.basename(target)}.stage-`)
    ) {
      throw new Error(`Invalid generated projection publication target: ${target}`);
    }
    targets.add(target);
  }
}

async function listFiles(root: string, relative = ''): Promise<string[]> {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(root, child)));
    else if (entry.isFile()) files.push(child);
    else throw new Error(`Generated projection contains unsupported entry: ${child}`);
  }
  return files;
}

async function verifyStagedProjections(items: readonly PreparedProjection[]) {
  for (const item of items) {
    const staged = await lstat(item.staged);
    if (item.kind === 'file' ? !staged.isFile() : !staged.isDirectory()) {
      throw new Error(`Generated projection has the wrong staged kind: ${item.staged}`);
    }
    if (item.kind === 'directory') await listFiles(item.staged);
  }
}

async function replaceFileFrom(source: string, target: string, token: string) {
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.writing-${token}`;
  try {
    await copyFile(source, temporary);
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function installItem(item: PreparedProjection, token: string) {
  if (item.kind === 'file') {
    await replaceFileFrom(item.staged, item.target, token);
    return;
  }
  await mkdir(item.target, { recursive: true });
  const stagedFiles = await listFiles(item.staged);
  const previousFiles = await listFiles(item.target);
  for (const relative of stagedFiles) {
    await replaceFileFrom(
      path.join(item.staged, relative),
      path.join(item.target, relative),
      token,
    );
  }
  const stagedSet = new Set(stagedFiles);
  for (const relative of previousFiles) {
    if (!stagedSet.has(relative)) await rm(path.join(item.target, relative));
  }
}

async function restoreItem(item: PreparedProjection, backup: string | null, token: string) {
  if (!backup) {
    await rm(item.target, { recursive: item.kind === 'directory', force: true });
    return;
  }
  if (item.kind === 'file') {
    await replaceFileFrom(backup, item.target, token);
    return;
  }
  const previousFiles = await listFiles(backup);
  const installedFiles = await listFiles(item.target);
  const previousSet = new Set(previousFiles);
  for (const relative of installedFiles) {
    if (!previousSet.has(relative)) await rm(path.join(item.target, relative));
  }
  for (const relative of previousFiles) {
    await replaceFileFrom(path.join(backup, relative), path.join(item.target, relative), token);
  }
}

export async function publishPreparedProjections(items: readonly PreparedProjection[]) {
  validateProjectionPaths(items);
  await verifyStagedProjections(items);
  const token = `${process.pid}-${randomUUID()}`;
  const backups: Array<{ item: PreparedProjection; backup: string | null }> = [];
  try {
    for (const item of items) {
      const backup = (await exists(item.target)) ? `${item.target}.backup-${token}` : null;
      if (backup) {
        try {
          if (item.kind === 'directory') await cp(item.target, backup, { recursive: true });
          else await copyFile(item.target, backup);
        } catch (error) {
          await rm(backup, { recursive: item.kind === 'directory', force: true });
          throw error;
        }
      }
      backups.push({ item, backup });
    }
    for (const item of items) await installItem(item, token);
  } catch (error) {
    const restoreErrors: unknown[] = [];
    for (const { item, backup } of backups.reverse()) {
      try {
        await restoreItem(item, backup, token);
      } catch (restoreError) {
        restoreErrors.push(restoreError);
      }
    }
    if (restoreErrors.length) {
      throw new AggregateError(
        [error, ...restoreErrors],
        'Generated projections could not be fully restored.',
      );
    }
    for (const { item, backup } of backups) {
      if (backup) await rm(backup, { recursive: item.kind === 'directory', force: true });
    }
    throw error;
  }
  for (const { item, backup } of backups) {
    if (backup) await rm(backup, { recursive: item.kind === 'directory', force: true });
  }
}
