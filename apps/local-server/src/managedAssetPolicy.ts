import { existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import type { GenerationTaskSpec, JobLibraryContext } from '../../../packages/shared/src';

const MANAGED_ASSET_ROOTS = [['outputs'], ['.studio', 'references'], ['.studio', 'masks']] as const;

function isInside(rootPath: string, candidatePath: string) {
  const relative = path.relative(rootPath, candidatePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function canonicalPath(filePath: string) {
  return existsSync(filePath) ? realpathSync(filePath) : path.resolve(filePath);
}

export function isManagedGenerationAssetPath(filePath: string, libraryContext: JobLibraryContext) {
  const libraryRoot = canonicalPath(libraryContext.rootPath);
  const candidate = canonicalPath(filePath);
  if (!isInside(libraryRoot, candidate)) return false;

  return MANAGED_ASSET_ROOTS.some((segments) => {
    const managedRoot = canonicalPath(path.join(libraryRoot, ...segments));
    return isInside(managedRoot, candidate);
  });
}

export function validateManagedGenerationAssets(
  sourceSpec: GenerationTaskSpec | null,
  libraryContext: JobLibraryContext,
) {
  if (!sourceSpec) return [];

  return sourceSpec.assets.flatMap((asset, index) => {
    const localPath = asset.localPath?.trim();
    if (!localPath || isManagedGenerationAssetPath(localPath, libraryContext)) return [];
    return [
      {
        code: 'unmanaged_asset_path',
        field: `sourceSpec.assets.${index}.localPath`,
        message: `Generation asset "${asset.name}" must resolve inside the selected Studio Library outputs, references, or masks.`,
      },
    ];
  });
}
