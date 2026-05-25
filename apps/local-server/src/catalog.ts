import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getDb } from './db';
import { getDefaultLibrary, getLibrary } from './libraries';
import { toPublicAssetUrl } from './library';

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

function mapCatalogImage(row: any): CatalogImage {
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
    generationConfig: parseJson<Record<string, unknown> | null>(row.generation_config, null),
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
  return row ? mapCatalogImage(row) : null;
}

export function queryCatalog(
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
): CatalogPage {
  const clauses: string[] = [];
  const params: any[] = [];
  if (filters.libraryId) {
    clauses.push('library_id = ?');
    params.push(filters.libraryId);
  }
  if (filters.workspaceId) {
    clauses.push('workspace_id = ?');
    params.push(filters.workspaceId);
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
    .query(`SELECT * FROM catalog_images ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset)
    .map(mapCatalogImage);
  return { images, total, hasMore: offset + images.length < total };
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
  const trashDir = path.join(path.dirname(path.dirname(image.filePath)), '.trash', 'assets');
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
  const assetsDir = path.join(library.path, 'assets');
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
