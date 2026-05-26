import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type {
  CatalogImage,
  EditableStudioSettings,
  ExternalOutputSourceCandidate,
  ExternalOutputSourceFile,
  ExternalOutputSourceRegistry,
  GenerationProviderId,
  ImportExternalOutputSourceInput,
  RegisterExternalOutputSourceInput,
} from '../../../packages/shared/src';
import {
  createDefaultExternalOutputSourceRegistry,
  normalizeExternalOutputSourceRegistry,
  sanitizeRegisterExternalOutputSourceInput,
} from '../../../packages/shared/src';
import { resolveLibraryPathFromRoot } from './library';
import type { StudioSettingsStorage } from './studioSettingsStore';

export const EXTERNAL_OUTPUT_SOURCES_KEY = 'external_output_sources';

export interface DetectExternalOutputSourcesInput {
  libraryDir: string;
  settings: EditableStudioSettings;
  env?: Record<string, string | undefined>;
  pathExists?: (sourcePath: string) => boolean;
}

export interface RegisterExternalOutputSourceDependencies {
  storage: StudioSettingsStorage;
  libraryDir: string;
  input: RegisterExternalOutputSourceInput;
  now?: string;
  pathExists?: (sourcePath: string) => boolean;
}

export interface ListExternalOutputSourceFilesDependencies {
  storage: StudioSettingsStorage;
  sourceId: string;
  limit?: number;
  readDir?: typeof readdirSync;
  statPath?: typeof statSync;
}

export interface ImportExternalOutputSourceFilesDependencies {
  storage: StudioSettingsStorage;
  sourceId: string;
  libraryDir: string;
  input: ImportExternalOutputSourceInput;
  registerCatalogImage: (input: {
    filePath: string;
    prompt?: string | null;
    mimeType: string;
    fileSizeBytes?: number | null;
    workspaceId?: string | null;
    tags?: string[];
    generationConfig?: Record<string, unknown> | null;
  }) => CatalogImage;
  copyFile?: typeof copyFileSync;
  makeDir?: typeof mkdirSync;
  statPath?: typeof statSync;
  now?: string;
}

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function toStableId(sourcePath: string) {
  return sourcePath
    .replace(/^[A-Za-z]:/, (drive) => drive.toLowerCase())
    .replace(/\\/g, '/')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function normalizePath(sourcePath: string) {
  return path.resolve(sourcePath);
}

function isInside(parentPath: string, candidatePath: string) {
  const relative = path.relative(parentPath, candidatePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function inferProviderId(sourcePath: string): GenerationProviderId | null {
  const normalized = sourcePath.replace(/\\/g, '/').toLowerCase();
  if (normalized.includes('/.codex/')) return 'codex';
  if (normalized.includes('comfy')) return 'comfy';
  if (normalized.includes('fal')) return 'fal';
  if (normalized.includes('google') || normalized.includes('nano-banana')) return 'google';
  return null;
}

function inferLabel(sourcePath: string, providerId: GenerationProviderId | null) {
  if (providerId === 'codex') return 'Codex generated images';
  if (providerId === 'comfy') return 'Comfy output';
  if (providerId === 'fal') return 'fal.ai output';
  if (providerId === 'google') return 'Google image output';
  return path.basename(sourcePath) || 'External output source';
}

function safeExists(sourcePath: string, pathExists: (sourcePath: string) => boolean) {
  try {
    return pathExists(sourcePath);
  } catch {
    return false;
  }
}

function defaultPathExists(sourcePath: string) {
  return existsSync(sourcePath) && statSync(sourcePath).isDirectory();
}

function mimeForPath(sourcePath: string) {
  const ext = path.extname(sourcePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'image/png';
}

function findRegisteredSource(storage: StudioSettingsStorage, sourceId: string) {
  return readExternalOutputSourceRegistry(storage).sources.find((source) => source.id === sourceId);
}

function isImageFile(filePath: string) {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function toSafeAssetFileName(sourceId: string, relativePath: string) {
  const parsed = path.parse(relativePath);
  const stem = parsed.name.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'asset';
  return `${sourceId}-${stem}${parsed.ext.toLowerCase()}`;
}

function resolveSourceFile(sourceRoot: string, relativePath: string) {
  const resolved = path.resolve(sourceRoot, relativePath);
  if (!isInside(sourceRoot, resolved) || resolved === sourceRoot) {
    return null;
  }
  return resolved;
}

function splitEnvPaths(value: string | undefined) {
  if (!value) return [];
  return value
    .split(path.delimiter)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function clampLimit(value: number | undefined, fallback: number, max: number) {
  const numeric = Number.isFinite(value) ? Math.floor(value as number) : fallback;
  return Math.min(Math.max(numeric, 1), max);
}

export function readExternalOutputSourceRegistry(
  storage: StudioSettingsStorage,
): ExternalOutputSourceRegistry {
  const raw = storage.getSetting(EXTERNAL_OUTPUT_SOURCES_KEY);
  if (!raw) return createDefaultExternalOutputSourceRegistry();

  try {
    return normalizeExternalOutputSourceRegistry(JSON.parse(raw));
  } catch {
    return createDefaultExternalOutputSourceRegistry();
  }
}

function writeExternalOutputSourceRegistry(
  storage: StudioSettingsStorage,
  registry: ExternalOutputSourceRegistry,
  updatedAt: string,
) {
  storage.setSetting(EXTERNAL_OUTPUT_SOURCES_KEY, JSON.stringify(registry), updatedAt);
}

export function detectExternalOutputSourceCandidates({
  libraryDir,
  settings,
  env = process.env,
  pathExists = defaultPathExists,
}: DetectExternalOutputSourcesInput): ExternalOutputSourceCandidate[] {
  if (!settings.autoDetectOutputSources) return [];

  const homeDir = os.homedir();
  const candidatePaths = [
    settings.preferredOutputPath,
    ...splitEnvPaths(env.STUDIO_EXTERNAL_OUTPUT_SOURCES),
    path.join(homeDir, '.codex', 'generated_images'),
    path.join(homeDir, 'ComfyUI', 'output'),
    path.join(homeDir, 'comfy', 'output'),
  ].filter((sourcePath): sourcePath is string => Boolean(sourcePath));

  const libraryPath = normalizePath(libraryDir);
  const seen = new Set<string>();
  const candidates: ExternalOutputSourceCandidate[] = [];

  for (const sourcePath of candidatePaths) {
    const normalizedPath = normalizePath(sourcePath);
    const id = toStableId(normalizedPath);
    if (seen.has(id)) continue;
    seen.add(id);

    const exists = safeExists(normalizedPath, pathExists);
    const isInsideStudioLibrary = isInside(libraryPath, normalizedPath);
    const providerId = inferProviderId(normalizedPath);
    candidates.push({
      id,
      label: inferLabel(normalizedPath, providerId),
      path: normalizedPath,
      providerId,
      status: isInsideStudioLibrary ? 'blocked' : exists ? 'detected' : 'missing',
      reason: isInsideStudioLibrary
        ? 'Path is inside the Studio Library; it is already managed storage.'
        : exists
          ? 'Detected as a read-only import candidate. Register before import.'
          : 'Path does not exist yet.',
      exists,
      isInsideStudioLibrary,
    });
  }

  return candidates;
}

export function registerExternalOutputSource({
  storage,
  libraryDir,
  input,
  now = new Date().toISOString(),
  pathExists = defaultPathExists,
}: RegisterExternalOutputSourceDependencies) {
  const sanitized = sanitizeRegisterExternalOutputSourceInput(input);
  if (!sanitized.path) {
    return { ok: false as const, reason: 'path_required' as const };
  }

  const normalizedPath = normalizePath(sanitized.path);
  if (!path.isAbsolute(normalizedPath)) {
    return { ok: false as const, reason: 'path_must_be_absolute' as const };
  }
  if (isInside(normalizePath(libraryDir), normalizedPath)) {
    return { ok: false as const, reason: 'inside_studio_library' as const };
  }
  if (!safeExists(normalizedPath, pathExists)) {
    return { ok: false as const, reason: 'path_not_found' as const };
  }

  const registry = readExternalOutputSourceRegistry(storage);
  const providerId = sanitized.providerId ?? inferProviderId(normalizedPath);
  const id = toStableId(normalizedPath);
  const existing = registry.sources.find((source) => source.id === id);
  const source = {
    id,
    label: sanitized.label ?? existing?.label ?? inferLabel(normalizedPath, providerId),
    path: normalizedPath,
    providerId,
    status: 'registered' as const,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const sources = [...registry.sources.filter((item) => item.id !== id), source].sort((a, b) =>
    a.label.localeCompare(b.label),
  );
  const nextRegistry = {
    schemaVersion: registry.schemaVersion,
    sources,
  };

  writeExternalOutputSourceRegistry(storage, nextRegistry, now);
  return { ok: true as const, registry: nextRegistry, source };
}

export function listExternalOutputSourceFiles({
  storage,
  sourceId,
  limit = 100,
  readDir = readdirSync,
  statPath = statSync,
}: ListExternalOutputSourceFilesDependencies) {
  const source = findRegisteredSource(storage, sourceId);
  if (!source) return { ok: false as const, reason: 'source_not_found' as const };
  const sourcePath = source.path;

  const files: ExternalOutputSourceFile[] = [];
  const maxFiles = clampLimit(limit, 100, 500);

  function walk(currentPath: string) {
    if (files.length >= maxFiles) return;
    for (const entry of readDir(currentPath, { withFileTypes: true })) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }
      if (!entry.isFile() || !isImageFile(entryPath)) continue;
      const stat = statPath(entryPath);
      files.push({
        relativePath: path.relative(sourcePath, entryPath).replaceAll(path.sep, '/'),
        fileName: entry.name,
        sizeBytes: stat.size,
        modifiedAt: stat.mtime ? stat.mtime.toISOString() : null,
        mimeType: mimeForPath(entryPath),
      });
      if (files.length >= maxFiles) return;
    }
  }

  try {
    walk(sourcePath);
  } catch {
    return { ok: false as const, reason: 'source_unavailable' as const };
  }

  return {
    ok: true as const,
    source,
    files,
  };
}

export function importExternalOutputSourceFiles({
  storage,
  sourceId,
  libraryDir,
  input,
  registerCatalogImage,
  copyFile = copyFileSync,
  makeDir = mkdirSync,
  statPath = statSync,
  now = new Date().toISOString(),
}: ImportExternalOutputSourceFilesDependencies) {
  const source = findRegisteredSource(storage, sourceId);
  if (!source) return { ok: false as const, reason: 'source_not_found' as const };

  const requestedFiles = Array.isArray(input.files) ? input.files : [];
  if (requestedFiles.length === 0) {
    return { ok: false as const, reason: 'files_required' as const };
  }

  const maxFiles = clampLimit(input.limit, requestedFiles.length, 100);
  const destinationDir = resolveLibraryPathFromRoot(libraryDir, 'outputs', 'external', source.id);
  makeDir(destinationDir, { recursive: true });

  const imported = [];
  const skipped = [];

  for (const relativePath of requestedFiles.slice(0, maxFiles)) {
    const sourceFile = resolveSourceFile(source.path, relativePath);
    if (!sourceFile) {
      skipped.push({ sourceFile: relativePath, reason: 'path_outside_source' });
      continue;
    }
    if (!isImageFile(sourceFile)) {
      skipped.push({ sourceFile: relativePath, reason: 'unsupported_file_type' });
      continue;
    }

    try {
      const stat = statPath(sourceFile);
      if (!stat.isFile()) {
        skipped.push({ sourceFile: relativePath, reason: 'not_a_file' });
        continue;
      }

      const destination = path.join(destinationDir, toSafeAssetFileName(source.id, relativePath));
      copyFile(sourceFile, destination);
      const image = registerCatalogImage({
        filePath: destination,
        prompt: `Imported from ${source.label}: ${relativePath}`,
        mimeType: mimeForPath(destination),
        fileSizeBytes: stat.size,
        workspaceId: input.workspaceId ?? null,
        tags: ['external-output-source', source.providerId ?? 'unknown-provider', source.id],
        generationConfig: {
          importedFromExternalOutputSource: {
            sourceId: source.id,
            sourceLabel: source.label,
            sourcePath: source.path,
            relativePath,
            importedAt: now,
          },
        },
      });
      imported.push({
        sourceFile: relativePath,
        catalogId: image.id,
        filePath: image.filePath,
        publicUrl: image.publicUrl,
      });
    } catch (error) {
      skipped.push({
        sourceFile: relativePath,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    ok: true as const,
    result: {
      sourceId: source.id,
      imported,
      skipped,
    },
  };
}
