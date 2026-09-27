import path from 'node:path';
import type { EditableStudioSettings } from '../../../packages/shared/src';
import { DEFAULT_WORKSPACE_ID } from '../../../packages/shared/src/workspaceContracts';
import {
  cleanOutputPathPart as cleanPathPart,
  formatOutputRelativePath,
} from '../../../packages/shared/src/outputLayout';

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

export function buildOutputAssetRelativePath(
  settings: Pick<EditableStudioSettings, 'outputOrganization'>,
  context: OutputAssetPathContext,
) {
  return path.join('outputs', formatOutputRelativePath(settings.outputOrganization, context));
}
