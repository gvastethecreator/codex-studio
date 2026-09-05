import type { CatalogImage, CatalogWorkspaceSummary } from '../packages/shared/src';
import type { Workspace } from '../types';
import { resolveCatalogEntryThumbnailUrl } from './studioCatalogImageAdapter';
import type { StudioCatalogView } from './studioCatalogView';

export interface WorkspaceWithThumbs extends Workspace {
  lastImage?: string;
  imageCount: number;
  totalFileSizeBytes: number;
  knownFileSizeCount: number;
  libraryIds: string[];
  locationPath?: string;
  firstImageCreatedAt?: string;
  latestImageCreatedAt?: string;
}

interface BuildWorkspacesWithThumbsOptions {
  workspaces: Workspace[];
  catalogView?: StudioCatalogView;
  workspaceSummaries?: CatalogWorkspaceSummary[];
}

function resolveCatalogThumb(entry: CatalogImage) {
  return resolveCatalogEntryThumbnailUrl(entry, 96);
}

function parseCatalogWorkspaceCreatedAt(entry: CatalogImage) {
  const createdAt = Date.parse(entry.createdAt);
  return Number.isFinite(createdAt) ? createdAt : Date.now();
}

interface WorkspaceCatalogSummary {
  imageCount: number;
  isExactCount: boolean;
  lastImage?: string;
  totalFileSizeBytes: number;
  knownFileSizeCount: number;
  libraryIds: string[];
  locationPath?: string;
  firstImageCreatedAt?: string;
  latestImageCreatedAt?: string;
}

function buildWorkspaceCatalogSummaries(
  catalogView?: StudioCatalogView,
  workspaceSummaries: CatalogWorkspaceSummary[] = [],
): Map<string, WorkspaceCatalogSummary> {
  const summaries = new Map<string, WorkspaceCatalogSummary>();

  for (const summary of workspaceSummaries) {
    summaries.set(summary.workspaceId, {
      imageCount: summary.imageCount,
      isExactCount: true,
      lastImage: summary.lastImage ? resolveCatalogThumb(summary.lastImage) : undefined,
      totalFileSizeBytes: summary.totalFileSizeBytes,
      knownFileSizeCount: summary.knownFileSizeCount,
      libraryIds: summary.libraryIds,
      locationPath: summary.sampleFilePath ?? undefined,
      firstImageCreatedAt: summary.firstCreatedAt ?? undefined,
      latestImageCreatedAt: summary.latestCreatedAt ?? undefined,
    });
  }

  if (!catalogView) {
    return summaries;
  }

  const libraryIdsByWorkspace = new Map(
    [...summaries].map(([workspaceId, summary]) => [workspaceId, new Set(summary.libraryIds)]),
  );

  for (const entry of catalogView.entries) {
    const workspaceId = entry.workspaceId || 'default';
    const existing = summaries.get(workspaceId);

    if (existing) {
      if (!existing.isExactCount) {
        existing.imageCount += 1;
        existing.totalFileSizeBytes += entry.fileSizeBytes ?? 0;
        existing.knownFileSizeCount += entry.fileSizeBytes === null ? 0 : 1;
        const libraryIds = libraryIdsByWorkspace.get(workspaceId) ?? new Set<string>();
        if (!libraryIds.has(entry.libraryId)) {
          libraryIds.add(entry.libraryId);
          libraryIdsByWorkspace.set(workspaceId, libraryIds);
          existing.libraryIds.push(entry.libraryId);
        }
      }
      existing.lastImage ??= resolveCatalogThumb(entry);
      existing.locationPath ??= entry.filePath;
      existing.latestImageCreatedAt ??= entry.createdAt;
      continue;
    }

    summaries.set(workspaceId, {
      imageCount: 1,
      isExactCount: false,
      lastImage: resolveCatalogThumb(entry),
      totalFileSizeBytes: entry.fileSizeBytes ?? 0,
      knownFileSizeCount: entry.fileSizeBytes === null ? 0 : 1,
      libraryIds: [entry.libraryId],
      locationPath: entry.filePath,
      firstImageCreatedAt: entry.createdAt,
      latestImageCreatedAt: entry.createdAt,
    });
    libraryIdsByWorkspace.set(workspaceId, new Set([entry.libraryId]));
  }

  return summaries;
}

export function mergeWorkspacesWithCatalogEntries(
  workspaces: Workspace[],
  catalogView?: StudioCatalogView,
  workspaceSummaries: CatalogWorkspaceSummary[] = [],
): Workspace[] {
  if (!catalogView && workspaceSummaries.length === 0) {
    return workspaces;
  }

  const existingIds = new Set(workspaces.map((workspace) => workspace.id));
  const catalogDerivedWorkspaces: Workspace[] = [];

  for (const summary of workspaceSummaries) {
    const workspaceId = summary.workspaceId;
    if (existingIds.has(workspaceId)) {
      continue;
    }

    existingIds.add(workspaceId);
    catalogDerivedWorkspaces.push({
      id: workspaceId,
      createdAt: summary.firstCreatedAt ? Date.parse(summary.firstCreatedAt) : Date.now(),
      name: workspaceId === 'default' ? undefined : `Imported (${workspaceId.slice(-4)})`,
    });
  }

  for (const entry of catalogView?.entries ?? []) {
    const workspaceId = entry.workspaceId || 'default';
    if (existingIds.has(workspaceId)) {
      continue;
    }

    existingIds.add(workspaceId);
    catalogDerivedWorkspaces.push({
      id: workspaceId,
      createdAt: parseCatalogWorkspaceCreatedAt(entry),
      name: workspaceId === 'default' ? undefined : `Imported (${workspaceId.slice(-4)})`,
    });
  }

  return catalogDerivedWorkspaces.length > 0
    ? [...workspaces, ...catalogDerivedWorkspaces]
    : workspaces;
}

export function buildWorkspacesWithThumbs({
  workspaces,
  catalogView,
  workspaceSummaries = [],
}: BuildWorkspacesWithThumbsOptions): WorkspaceWithThumbs[] {
  if (catalogView || workspaceSummaries.length > 0) {
    const catalogSummaries = buildWorkspaceCatalogSummaries(catalogView, workspaceSummaries);

    return workspaces.map((workspace) => {
      const summary = catalogSummaries.get(workspace.id);

      return {
        ...workspace,
        lastImage: summary?.lastImage,
        imageCount: summary?.imageCount ?? 0,
        totalFileSizeBytes: summary?.totalFileSizeBytes ?? 0,
        knownFileSizeCount: summary?.knownFileSizeCount ?? 0,
        libraryIds: summary?.libraryIds ?? [],
        locationPath: summary?.locationPath,
        firstImageCreatedAt: summary?.firstImageCreatedAt,
        latestImageCreatedAt: summary?.latestImageCreatedAt,
      };
    });
  }

  return workspaces.map((workspace) => ({
    ...workspace,
    lastImage: undefined,
    imageCount: 0,
    totalFileSizeBytes: 0,
    knownFileSizeCount: 0,
    libraryIds: [],
  }));
}
