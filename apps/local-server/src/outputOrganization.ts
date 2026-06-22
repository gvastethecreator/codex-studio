import path from 'node:path';
import type { EditableStudioSettings } from '../../../packages/shared/src';
import { resolveLibraryPath } from './library';

export interface OutputAssetPathContext {
  jobId: string;
  providerId: string | null | undefined;
  model: string | null | undefined;
  recipeId: string | null | undefined;
  createdAt?: Date;
  extension: string;
}

function pad(value: number) {
  return `${value}`.padStart(2, '0');
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTimestamp(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function cleanPathPart(value: string | null | undefined, fallback: string) {
  const cleaned = (value || fallback)
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 80);
  return cleaned || fallback;
}

function normalizeExtension(extension: string) {
  const ext = extension.trim().toLowerCase();
  if (/^\.[a-z0-9]+$/.test(ext)) return ext;
  return '.png';
}

export function buildOutputAssetRelativePath(
  settings: Pick<EditableStudioSettings, 'outputOrganization'>,
  context: OutputAssetPathContext,
) {
  const createdAt = context.createdAt ?? new Date();
  const values = {
    date: formatDate(createdAt),
    timestamp: formatTimestamp(createdAt),
    provider: cleanPathPart(context.providerId, 'provider'),
    model: cleanPathPart(context.model, 'model'),
    recipe: cleanPathPart(context.recipeId, 'no-recipe'),
    jobId: cleanPathPart(context.jobId, 'job'),
  };
  const subfolders = settings.outputOrganization.subfolderTokens.map((token) => values[token]);
  const rawName = settings.outputOrganization.fileNameTemplate.replace(
    /\{(timestamp|provider|model|recipe|jobId)\}/g,
    (_, token: keyof typeof values) => values[token],
  );
  const fileNameBase = cleanPathPart(
    rawName.includes(values.jobId) ? rawName : `${rawName}-${values.jobId}`,
    values.jobId,
  );

  return path.join(
    'outputs',
    ...subfolders,
    `${fileNameBase}${normalizeExtension(context.extension)}`,
  );
}

function resolveOutputAssetPath(
  settings: Pick<EditableStudioSettings, 'outputOrganization'>,
  context: OutputAssetPathContext,
) {
  return resolveLibraryPath(buildOutputAssetRelativePath(settings, context));
}
