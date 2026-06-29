import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getDb } from './db';
import { getDefaultLibrary, getLibrary } from './libraries';
import { resolveLibraryPathFromRoot, toPublicAssetUrl } from './library';
import { buildCatalogWorkspaceClause } from './catalogWorkspaceClause';
import type { CatalogCommandFilter, CatalogWorkspaceSummary } from '../../../packages/shared/src';

export interface CatalogImage {
  id: string;
  libraryId: string;
  filePath: string;
  thumbnailPath: string | null;
  publicUrl: string;
  thumbnailUrl: string | null;
  prompt: string | null;
  negativePrompt: string | null;
  aspectRatio: string | null;
  imageSize: string | null;
  width: number | null;
  height: number | null;
  mimeType: string;
  fileSizeBytes: number | null;
  jobId: string | null;
  workspaceId: string | null;
  batchId: string | null;
  recipeId: string | null;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  tags: string[];
  generationConfig: Record<string, unknown> | null;
  createdAt: string;
}

export interface CatalogPage {
  images: CatalogImage[];
  total: number;
  hasMore: boolean;
}

function now() {
  return new Date().toISOString();
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

const CATALOG_IMAGE_SUMMARY_COLUMNS = [
  'id',
  'library_id',
  'file_path',
  'thumbnail_path',
  'public_url',
  'thumbnail_url',
  'prompt',
  'negative_prompt',
  'aspect_ratio',
  'image_size',
  'width',
  'height',
  'mime_type',
  'file_size_bytes',
  'job_id',
  'workspace_id',
  'batch_id',
  'recipe_id',
  'is_favorite',
  'is_deleted',
  'deleted_at',
  'tags',
  'created_at',
].join(', ');

function mapCatalogImage(
  row: any,
  options: { includeGenerationConfig?: boolean } = {},
): CatalogImage {
  return {
    id: row.id,
    libraryId: row.library_id,
    filePath: row.file_path,
    thumbnailPath: row.thumbnail_path,
    publicUrl: row.public_url,
    thumbnailUrl: row.thumbnail_url,
    prompt: row.prompt,
    negativePrompt: row.negative_prompt,
    aspectRatio: row.aspect_ratio,
    imageSize: row.image_size,
    width: row.width,
    height: row.height,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    jobId: row.job_id,
    workspaceId: row.workspace_id,
    batchId: row.batch_id,
    recipeId: row.recipe_id,
    isFavorite: Boolean(row.is_favorite),
    isDeleted: Boolean(row.is_deleted),
    deletedAt: row.deleted_at,
    tags: parseJson<string[]>(row.tags, []),
    generationConfig: options.includeGenerationConfig
      ? parseJson<Record<string, unknown> | null>(row.generation_config, null)
      : null,
    createdAt: row.created_at,
  };
}

export function registerCatalogImage(input: {
  libraryId?: string | null;
  filePath: string;
  thumbnailPath?: string | null;
  prompt?: string | null;
  negativePrompt?: string | null;
  aspectRatio?: string | null;
  imageSize?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType: string;
  fileSizeBytes?: number | null;
  jobId?: string | null;
  workspaceId?: string | null;
  batchId?: string | null;
  recipeId?: string | null;
  tags?: string[];
  generationConfig?: Record<string, unknown> | null;
}) {
  const library = input.libraryId ? getLibrary(input.libraryId) : getDefaultLibrary();
  if (!library) throw new Error('No studio library registered.');
  const id = randomUUID();
  const createdAt = now();
  const publicUrl = toPublicAssetUrl(input.filePath);
  const thumbnailUrl = input.thumbnailPath ? toPublicAssetUrl(input.thumbnailPath) : null;
  getDb()
    .query(`
      INSERT INTO catalog_images (
        id, library_id, file_path, thumbnail_path, public_url, thumbnail_url,
        prompt, negative_prompt, aspect_ratio, image_size, width, height, mime_type,
        file_size_bytes, job_id, workspace_id, batch_id, recipe_id, tags, generation_config, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      id,
      library.id,
      input.filePath,
      input.thumbnailPath ?? null,
      publicUrl,
      thumbnailUrl,
      input.prompt ?? null,
      input.negativePrompt ?? null,
      input.aspectRatio ?? null,
      input.imageSize ?? null,
      input.width ?? null,
      input.height ?? null,
      input.mimeType,
      input.fileSizeBytes ?? null,
      input.jobId ?? null,
      input.workspaceId ?? null,
      input.batchId ?? null,
      input.recipeId ?? null,
      JSON.stringify(input.tags ?? []),
      input.generationConfig === undefined ? null : JSON.stringify(input.generationConfig),
      createdAt,
    );
  return getCatalogImage(id)!;
}

export function getCatalogImage(id: string) {
  const row = getDb().query('SELECT * FROM catalog_images WHERE id = ?').get(id);
  return row ? mapCatalogImage(row, { includeGenerationConfig: true }) : null;
}

function queryCatalogInternal(
  filters: {
    libraryId?: string | null;
    workspaceId?: string | null;
    jobId?: string | null;
    batchId?: string | null;
    favorite?: boolean;
    isDeleted?: boolean;
    q?: string | null;
    offset?: number;
    limit?: number;
  } = {},
  options: { includeGenerationConfig?: boolean } = {},
): CatalogPage {
  const clauses: string[] = [];
  const params: any[] = [];
  if (filters.libraryId) {
    clauses.push('library_id = ?');
    params.push(filters.libraryId);
  }
  const workspaceClause = buildCatalogWorkspaceClause(filters.workspaceId);
  if (workspaceClause) {
    clauses.push(workspaceClause.clause);
    params.push(...workspaceClause.params);
  }
  if (filters.jobId) {
    clauses.push('job_id = ?');
    params.push(filters.jobId);
  }
  if (filters.batchId) {
    clauses.push('batch_id = ?');
    params.push(filters.batchId);
  }
  if (filters.favorite !== undefined) {
    clauses.push('is_favorite = ?');
    params.push(filters.favorite ? 1 : 0);
  }
  clauses.push('is_deleted = ?');
  params.push(filters.isDeleted ? 1 : 0);
  if (filters.q) {
    clauses.push('(prompt LIKE ? OR tags LIKE ?)');
    params.push(`%${filters.q}%`, `%${filters.q}%`);
  }
  const where = `WHERE ${clauses.join(' AND ')}`;
  const limit = Math.min(Math.max(Number(filters.limit ?? 50), 1), 200);
  const offset = Math.max(Number(filters.offset ?? 0), 0);
  const total =
    (
      getDb()
        .query(`SELECT COUNT(*) as count FROM catalog_images ${where}`)
        .get(...params) as any
    )?.count ?? 0;
  const images = getDb()
    .query(
      `SELECT ${
        options.includeGenerationConfig ? '*' : CATALOG_IMAGE_SUMMARY_COLUMNS
      } FROM catalog_images ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset)
    .map((row) => mapCatalogImage(row, options));
  return { images, total, hasMore: offset + images.length < total };
}

export function queryCatalog(filters: Parameters<typeof queryCatalogInternal>[0] = {}) {
  return queryCatalogInternal(filters, { includeGenerationConfig: false });
}

export function queryCatalogDetails(filters: Parameters<typeof queryCatalogInternal>[0] = {}) {
  return queryCatalogInternal(filters, { includeGenerationConfig: true });
}

export function queryCatalogWorkspaceSummaries(
  filters: { isDeleted?: boolean; libraryId?: string | null } = {},
): CatalogWorkspaceSummary[] {
  const clauses = ['is_deleted = ?'];
  const params: any[] = [filters.isDeleted ? 1 : 0];

  if (filters.libraryId) {
    clauses.push('library_id = ?');
    params.push(filters.libraryId);
  }

  const where = `WHERE ${clauses.join(' AND ')}`;
  const rows = getDb()
    .query(
      `
        WITH filtered AS (
          SELECT
            ${CATALOG_IMAGE_SUMMARY_COLUMNS},
            COALESCE(workspace_id, 'default') AS normalized_workspace_id
          FROM catalog_images
          ${where}
        ),
        ranked AS (
          SELECT
            *,
            ROW_NUMBER() OVER (
              PARTITION BY normalized_workspace_id
              ORDER BY created_at DESC, id DESC
            ) AS workspace_rank
          FROM filtered
        ),
        summaries AS (
          SELECT
            normalized_workspace_id,
            COUNT(*) AS image_count,
            COALESCE(SUM(file_size_bytes), 0) AS total_file_size_bytes,
            COUNT(file_size_bytes) AS known_file_size_count,
            GROUP_CONCAT(DISTINCT library_id) AS library_ids,
            MIN(created_at) AS first_created_at,
            MAX(created_at) AS latest_created_at
          FROM filtered
          GROUP BY normalized_workspace_id
        )
        SELECT
          summaries.normalized_workspace_id,
          summaries.image_count,
          summaries.total_file_size_bytes,
          summaries.known_file_size_count,
          summaries.library_ids,
          summaries.first_created_at,
          summaries.latest_created_at,
          ranked.${CATALOG_IMAGE_SUMMARY_COLUMNS.replaceAll(', ', ', ranked.')}
        FROM summaries
        LEFT JOIN ranked
          ON ranked.normalized_workspace_id = summaries.normalized_workspace_id
         AND ranked.workspace_rank = 1
        ORDER BY summaries.latest_created_at DESC
      `,
    )
    .all(...params) as any[];

  return rows.map((row) => {
    const lastImage: CatalogWorkspaceSummary['lastImage'] = row.id
      ? { ...mapCatalogImage(row, { includeGenerationConfig: false }), generationConfig: null }
      : null;

    return {
      workspaceId: row.normalized_workspace_id,
      imageCount: row.image_count ?? 0,
      totalFileSizeBytes: row.total_file_size_bytes ?? 0,
      knownFileSizeCount: row.known_file_size_count ?? 0,
      libraryIds:
        typeof row.library_ids === 'string' && row.library_ids.length > 0
          ? row.library_ids.split(',').filter(Boolean)
          : [],
      firstCreatedAt: row.first_created_at ?? null,
      latestCreatedAt: row.latest_created_at ?? null,
      sampleFilePath: lastImage?.filePath ?? null,
      lastImage,
    };
  });
}

export function listCatalogImageIds(filters: CatalogCommandFilter = {}) {
  const clauses: string[] = [];
  const params: any[] = [];

  if (filters.ids && filters.ids.length > 0) {
    clauses.push(`id IN (${filters.ids.map(() => '?').join(', ')})`);
    params.push(...filters.ids);
  }

  const workspaceClause = buildCatalogWorkspaceClause(filters.workspaceId);
  if (workspaceClause) {
    clauses.push(workspaceClause.clause);
    params.push(...workspaceClause.params);
  }

  if (filters.batchId) {
    clauses.push('batch_id = ?');
    params.push(filters.batchId);
  }

  if (filters.isDeleted !== undefined) {
    clauses.push('is_deleted = ?');
    params.push(filters.isDeleted ? 1 : 0);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  return getDb()
    .query(`SELECT id FROM catalog_images ${where} ORDER BY created_at DESC`)
    .all(...params)
    .map((row: any) => String(row.id));
}

export function updateCatalogImage(
  id: string,
  patch: { isFavorite?: boolean; tags?: string[]; workspaceId?: string | null },
) {
  const image = getCatalogImage(id);
  if (!image) return null;
  getDb()
    .query(`
      UPDATE catalog_images
      SET is_favorite = COALESCE(?, is_favorite),
          tags = COALESCE(?, tags),
          workspace_id = ?,
          created_at = created_at
      WHERE id = ?
    `)
    .run(
      patch.isFavorite === undefined ? null : patch.isFavorite ? 1 : 0,
      patch.tags === undefined ? null : JSON.stringify(patch.tags),
      patch.workspaceId === undefined ? image.workspaceId : patch.workspaceId,
      id,
    );
  return getCatalogImage(id);
}

export function softDeleteCatalogImage(id: string) {
  const image = getCatalogImage(id);
  if (!image || image.isDeleted) return image;
  const library = getLibrary(image.libraryId) ?? getDefaultLibrary();
  const trashDir = resolveLibraryPathFromRoot(library.path, '.trash', 'assets');
  mkdirSync(trashDir, { recursive: true });
  const trashedPath = path.join(trashDir, `${id}-${path.basename(image.filePath)}`);
  if (existsSync(image.filePath)) {
    renameSync(image.filePath, trashedPath);
  }
  getDb()
    .query(
      'UPDATE catalog_images SET is_deleted = 1, deleted_at = ?, file_path = ?, public_url = ? WHERE id = ?',
    )
    .run(now(), trashedPath, toPublicAssetUrl(trashedPath), id);
  return getCatalogImage(id);
}

export function restoreCatalogImage(id: string) {
  const image = getCatalogImage(id);
  if (!image || !image.isDeleted) return image;
  const library = getLibrary(image.libraryId) ?? getDefaultLibrary();
  const assetsDir = resolveLibraryPathFromRoot(library.path, 'assets');
  mkdirSync(assetsDir, { recursive: true });
  const restoredPath = path.join(assetsDir, path.basename(image.filePath).replace(`${id}-`, ''));
  if (existsSync(image.filePath)) {
    renameSync(image.filePath, restoredPath);
  }
  getDb()
    .query(
      'UPDATE catalog_images SET is_deleted = 0, deleted_at = NULL, file_path = ?, public_url = ? WHERE id = ?',
    )
    .run(restoredPath, toPublicAssetUrl(restoredPath), id);
  return getCatalogImage(id);
}

export function purgeCatalogImage(id: string) {
  const image = getCatalogImage(id);
  if (!image) return null;

  for (const filePath of [image.filePath, image.thumbnailPath]) {
    if (filePath && existsSync(filePath)) {
      rmSync(filePath, { force: true });
    }
  }

  getDb().query('DELETE FROM catalog_images WHERE id = ?').run(id);
  return image;
}
