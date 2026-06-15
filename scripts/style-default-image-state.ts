import { existsSync } from 'node:fs';
import path from 'node:path';

export function resolveStyleDefaultImageFilePath(rootDir: string, defaultImage?: string) {
  if (!defaultImage) return null;
  const normalized = defaultImage.trim();
  if (!normalized) return null;
  const repoRelative = normalized.replace(/^\/+/, '').replaceAll('/', path.sep);
  return path.join(rootDir, repoRelative);
}

export function hasStyleDefaultImageFile(
  rootDir: string,
  preset: { assets?: { defaultImage?: string } },
) {
  const filePath = resolveStyleDefaultImageFilePath(rootDir, preset.assets?.defaultImage);
  return filePath ? existsSync(filePath) : false;
}
