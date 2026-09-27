import { existsSync, mkdirSync, copyFileSync, unlinkSync, readFileSync, constants } from 'node:fs';
import { reserveOutputPath } from './outputDestination';
import { formatOutputRelativePath } from '../../../packages/shared/src/outputLayout';
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
  if (existsSync(targetPath)) {
    if (!existsSync(filePath)) return targetPath;
    // Resume a copy completed before interruption, only when both files have identical bytes.
    if (readFileSync(filePath).equals(readFileSync(targetPath))) {
      unlinkSync(filePath);
      return targetPath;
    }
    throw new Error('The reserved output path already contains a file. It was not overwritten.');
  }
  mkdirSync(path.dirname(targetPath), { recursive: true });
  if (existsSync(filePath)) {
    copyFileSync(filePath, targetPath, constants.COPYFILE_EXCL);
    unlinkSync(filePath);
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
    const settings = job.libraryContext?.outputOrganization
      ? { outputOrganization: job.libraryContext.outputOrganization }
      : readEditableStudioSettings({
          getSetting,
          setSetting,
        });
    const context = {
      jobId: job.id,
      workspaceSlug:
        job.libraryContext?.workspaceSlug ??
        resolveJobWorkspaceSlug(job, getWorkspace, listWorkspaces),
      providerId,
      model: job.execution?.providerOptions?.chatgpt?.image?.model ?? executionOptions.model,
      recipeId: job.sourceSpec?.recipeId ?? null,
      extension,
      createdAt: new Date(job.createdAt),
    };
    const relativePath = buildOutputAssetRelativePath(settings, context);
    const targetPath = job.libraryContext?.output
      ? path.resolve(
          job.libraryContext.output.rootPath,
          formatOutputRelativePath(settings.outputOrganization, context),
        )
      : job.libraryContext
        ? resolveLibraryPathFromRoot(job.libraryContext.rootPath, ...relativePath.split(/[\\/]/))
        : resolveLibraryPath(...relativePath.split(/[\\/]/));
    if (!job.libraryContext?.outputOrganization) return resolveUniquePath(targetPath);
    const root =
      job.libraryContext.output?.rootPath ?? path.join(job.libraryContext.rootPath, 'outputs');
    mkdirSync(root, { recursive: true });
    return reserveOutputPath(
      root,
      targetPath,
      resolveLibraryPath('state', 'output-reservations'),
      job.id,
    );
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
