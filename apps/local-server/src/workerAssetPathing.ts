import { existsSync, mkdirSync, renameSync } from 'node:fs';
import path from 'node:path';
import {
  buildOutputAssetRelativePath,
  workspaceOutputSlug,
  workspaceOutputSlugMap,
} from './outputOrganization';
import { DEFAULT_WORKSPACE_ID } from '../../../packages/shared/src/workspaceContracts';
import type { Job } from '../../../packages/shared/src/types';
import type { resolveJobExecutionOptions } from './codex/executionOptions';
import type { readEditableStudioSettings } from './studioSettingsStore';
import type { getSettingValue, setSettingValue } from './db/settings';
import { resolveLibraryPathFromRoot, type resolveLibraryPath } from './library';

export interface WorkerAssetWorkspace {
  id: string;
  name: string;
  libraryId?: string | null;
}

function resolveUniquePath(filePath: string) {
  if (!existsSync(filePath)) return filePath;
  const targetPathParts = path.parse(filePath);
  for (let index = 2; index < 1000; index += 1) {
    const candidate = path.join(
      targetPathParts.dir,
      `${targetPathParts.name}-${index}${targetPathParts.ext}`,
    );
    if (!existsSync(candidate)) return candidate;
  }
  return path.join(
    targetPathParts.dir,
    `${targetPathParts.name}-${Date.now()}${targetPathParts.ext}`,
  );
}

export function inferGeneratedAssetMimeType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.svg') return 'image/svg+xml';
  return 'image/png';
}

export function moveGeneratedAssetToPath(filePath: string, targetPath: string) {
  if (path.resolve(filePath) === path.resolve(targetPath)) return targetPath;
  if (existsSync(targetPath)) return targetPath;
  mkdirSync(path.dirname(targetPath), { recursive: true });
  if (existsSync(filePath)) {
    renameSync(filePath, targetPath);
    return targetPath;
  }
  return filePath;
}

interface CreateWorkerAssetPathingDependencies {
  resolveExecutionOptions: typeof resolveJobExecutionOptions;
  readEditableStudioSettings: typeof readEditableStudioSettings;
  getSetting: typeof getSettingValue;
  setSetting: typeof setSettingValue;
  resolveLibraryPath: typeof resolveLibraryPath;
  getWorkspace?: (id: string) => WorkerAssetWorkspace | null;
  listWorkspaces?: () => WorkerAssetWorkspace[];
}

function resolveJobWorkspaceSlug(
  job: Job,
  getWorkspace?: (id: string) => WorkerAssetWorkspace | null,
  listWorkspaces?: () => WorkerAssetWorkspace[],
) {
  const listed = listWorkspaces?.() ?? [];
  const current =
    getWorkspace?.(job.workspaceId) ??
    listed.find((workspace) => workspace.id === job.workspaceId) ??
    ({
      id: job.workspaceId || DEFAULT_WORKSPACE_ID,
      name: job.workspaceId === DEFAULT_WORKSPACE_ID ? 'Default' : job.workspaceId,
    } satisfies WorkerAssetWorkspace);

  if (listed.length === 0) {
    return workspaceOutputSlug(current);
  }

  const roster = listed.some((workspace) => workspace.id === current.id)
    ? listed
    : [...listed, current];

  return workspaceOutputSlugMap(roster).get(current.id) ?? workspaceOutputSlug(current);
}

export function createWorkerAssetPathing({
  resolveExecutionOptions,
  readEditableStudioSettings,
  getSetting,
  setSetting,
  resolveLibraryPath,
  getWorkspace,
  listWorkspaces,
}: CreateWorkerAssetPathingDependencies) {
  function resolveGeneratedAssetTargetPath(job: Job, providerId: string | null, extension: string) {
    const executionOptions = resolveExecutionOptions(job.execution);
    const settings = readEditableStudioSettings({
      getSetting,
      setSetting,
    });
    const relativePath = buildOutputAssetRelativePath(settings, {
      jobId: job.id,
      workspaceSlug: resolveJobWorkspaceSlug(job, getWorkspace, listWorkspaces),
      providerId,
      model: executionOptions.model,
      recipeId: job.sourceSpec?.recipeId ?? null,
      extension,
    });
    const targetPath = job.libraryContext
      ? resolveLibraryPathFromRoot(job.libraryContext.rootPath, ...relativePath.split(/[\\/]/))
      : resolveLibraryPath(...relativePath.split(/[\\/]/));
    return resolveUniquePath(targetPath);
  }

  function organizeGeneratedAssetPath(job: Job, filePath: string, providerId: string | null) {
    const ext = path.extname(filePath).toLowerCase() || '.png';
    const targetPath = resolveGeneratedAssetTargetPath(job, providerId, ext);
    return moveGeneratedAssetToPath(filePath, targetPath);
  }

  return {
    resolveGeneratedAssetTargetPath,
    moveGeneratedAssetToPath,
    organizeGeneratedAssetPath,
  };
}
