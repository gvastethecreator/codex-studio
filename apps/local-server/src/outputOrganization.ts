import path from 'node:path';
import type { EditableStudioSettings } from '../../../packages/shared/src';
import { DEFAULT_WORKSPACE_ID } from '../../../packages/shared/src/workspaceContracts';
import { resolveLibraryPath } from './library';

export const DEFAULT_WORKSPACE_OUTPUT_SLUG = 'default';

export interface WorkspaceSlugInput {
  id: string;
  name?: string | null;
}

export interface OutputAssetPathContext {
  jobId: string;
  workspaceSlug?: string | null;
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
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 80);
  return cleaned || fallback;
}

function nextUniqueSlug(base: string, occupiedLower: Set<string>) {
  if (!occupiedLower.has(base.toLowerCase())) return base;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = cleanPathPart(`${base}-${n}`, `${n}`);
    if (!occupiedLower.has(candidate.toLowerCase())) return candidate;
  }
  return cleanPathPart(`${base}-${Date.now()}`, base);
}

export function workspaceOutputSlug(
  workspace: WorkspaceSlugInput,
  occupiedSlugs: Iterable<string> = [],
) {
  if (workspace.id === DEFAULT_WORKSPACE_ID) {
    return DEFAULT_WORKSPACE_OUTPUT_SLUG;
  }

  const occupiedLower = new Set(
    [...occupiedSlugs, DEFAULT_WORKSPACE_OUTPUT_SLUG].map((slug) => slug.toLowerCase()),
  );
  const base = cleanPathPart(workspace.name, workspace.id);
  return nextUniqueSlug(base, occupiedLower);
}

export function workspaceOutputSlugMap(workspaces: WorkspaceSlugInput[]) {
  const slugs = new Map<string, string>();
  const occupied: string[] = [];
  const seen = new Set<string>();
  const ordered: WorkspaceSlugInput[] = [];

  for (const workspace of workspaces) {
    if (workspace.id === DEFAULT_WORKSPACE_ID && !seen.has(workspace.id)) {
      ordered.push(workspace);
      seen.add(workspace.id);
    }
  }
  for (const workspace of workspaces) {
    if (workspace.id !== DEFAULT_WORKSPACE_ID && !seen.has(workspace.id)) {
      ordered.push(workspace);
      seen.add(workspace.id);
    }
  }

  for (const workspace of ordered) {
    const slug = workspaceOutputSlug(workspace, occupied);
    slugs.set(workspace.id, slug);
    occupied.push(slug);
  }

  return slugs;
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
    workspace: cleanPathPart(context.workspaceSlug, DEFAULT_WORKSPACE_OUTPUT_SLUG),
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
