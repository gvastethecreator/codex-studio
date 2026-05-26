import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

import type { StylePack } from '../components/recipes/styles/types';

const defaultRootDir = process.cwd();

const legacyMarkers = ['LEGACY_STYLE_PACKS', 'legacyStylesData', 'styles/packs'] as const;

const ignoredPathParts = new Set(['.git', 'dist', 'logs', 'node_modules', 'tmp']);

const allowedLegacyFiles = new Set([
  'components/recipes/stylePresetManifests.test.ts',
  'scripts/split-style-preset-manifests.ts',
  'scripts/style-authoring-source-audit.ts',
  'scripts/style-authoring-source-audit.test.ts',
]);

export interface StyleAuthoringSourceAuditUsage {
  filePath: string;
  markers: string[];
}

export interface StyleAuthoringSourceAuditReport {
  scannedFiles: number;
  usages: StyleAuthoringSourceAuditUsage[];
  violations: StyleAuthoringSourceAuditUsage[];
  generatedTempFiles: string[];
  legacyPresetCount: number;
  manifestPresetCount: number;
  legacyOnlyPresetIds: string[];
}

function toRepoPath(rootDir: string, filePath: string) {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

function shouldScan(repoPath: string) {
  const parts = repoPath.split('/');
  if (parts.some((part) => ignoredPathParts.has(part))) return false;
  return /\.(ts|tsx)$/.test(repoPath);
}

function isAllowedLegacyFile(repoPath: string) {
  return allowedLegacyFiles.has(repoPath);
}

function isGeneratedTempFile(repoPath: string) {
  return (
    (repoPath.startsWith('components/recipes/styleRuntimeData.generated.check.') ||
      (repoPath.startsWith('components/recipes/styleRuntimePacks.generated/') &&
        repoPath.includes('.check.'))) &&
    repoPath.endsWith('.tmp.ts')
  );
}

async function listSourceFiles(rootDir: string, currentDir = rootDir): Promise<string[]> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const repoPath = toRepoPath(rootDir, absolutePath);
    if (entry.isDirectory()) {
      if (repoPath.split('/').some((part) => ignoredPathParts.has(part))) continue;
      files.push(...(await listSourceFiles(rootDir, absolutePath)));
      continue;
    }
    if (entry.isFile() && shouldScan(repoPath)) {
      files.push(absolutePath);
    }
  }

  return files;
}

async function readDirIfExists(dirPath: string) {
  try {
    return await readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function collectStylePresetManifestIds(rootDir: string) {
  const presetDir = path.join(rootDir, 'components', 'recipes', 'styles', 'manifests', 'presets');
  const ids = new Set<string>();

  for (const packEntry of await readDirIfExists(presetDir)) {
    if (!packEntry.isDirectory()) continue;
    const packDir = path.join(presetDir, packEntry.name);
    for (const presetEntry of await readDirIfExists(packDir)) {
      if (presetEntry.isFile() && presetEntry.name.endsWith('.yaml')) {
        ids.add(path.basename(presetEntry.name, '.yaml'));
      }
    }
  }

  return ids;
}

async function collectLegacyStylePresetIds(rootDir: string) {
  const packsDir = path.join(rootDir, 'components', 'recipes', 'styles', 'packs');
  const ids = new Set<string>();

  for (const entry of await readDirIfExists(packsDir)) {
    if (!entry.isFile() || !entry.name.endsWith('.yaml')) continue;
    const raw = await readFile(path.join(packsDir, entry.name), 'utf8');
    const packs = yaml.load(raw) as StylePack[] | undefined;
    for (const pack of packs ?? []) {
      for (const preset of pack.presets ?? []) {
        ids.add(preset.id);
      }
    }
  }

  return ids;
}

export async function createStyleAuthoringSourceAuditReport(
  rootDir = defaultRootDir,
): Promise<StyleAuthoringSourceAuditReport> {
  const usages: StyleAuthoringSourceAuditUsage[] = [];
  const files = await listSourceFiles(rootDir);
  const generatedTempFiles: string[] = [];
  const [legacyPresetIds, manifestPresetIds] = await Promise.all([
    collectLegacyStylePresetIds(rootDir),
    collectStylePresetManifestIds(rootDir),
  ]);

  for (const absolutePath of files) {
    const repoPath = toRepoPath(rootDir, absolutePath);
    if (isGeneratedTempFile(repoPath)) {
      generatedTempFiles.push(repoPath);
      continue;
    }
    const source = await readFile(absolutePath, 'utf8');
    const markers = legacyMarkers.filter((marker) => source.includes(marker));
    if (markers.length > 0) {
      usages.push({ filePath: repoPath, markers: [...markers] });
    }
  }

  return {
    scannedFiles: files.length,
    usages,
    violations: usages.filter((usage) => !isAllowedLegacyFile(usage.filePath)),
    generatedTempFiles,
    legacyPresetCount: legacyPresetIds.size,
    manifestPresetCount: manifestPresetIds.size,
    legacyOnlyPresetIds: [...legacyPresetIds]
      .filter((presetId) => !manifestPresetIds.has(presetId))
      .sort(),
  };
}

if (import.meta.main) {
  const report = await createStyleAuthoringSourceAuditReport();

  console.log(
    `[styles:source] scanned=${report.scannedFiles} legacyUsages=${report.usages.length}`,
  );
  console.log(
    `[styles:source] legacyPresets=${report.legacyPresetCount} manifestPresets=${report.manifestPresetCount} legacyOnly=${report.legacyOnlyPresetIds.length}`,
  );
  for (const usage of report.usages) {
    console.log(`- ${usage.filePath} markers=${usage.markers.join(',')}`);
  }

  if (report.violations.length > 0) {
    console.error(`[styles:source] violations=${report.violations.length}`);
    for (const usage of report.violations) {
      console.error(`- ${usage.filePath} markers=${usage.markers.join(',')}`);
    }
    process.exitCode = 1;
  }

  if (report.generatedTempFiles.length > 0) {
    console.error(`[styles:source] generatedTempFiles=${report.generatedTempFiles.length}`);
    for (const filePath of report.generatedTempFiles) {
      console.error(`- ${filePath}`);
    }
    process.exitCode = 1;
  }

  if (report.legacyOnlyPresetIds.length > 0) {
    console.error(`[styles:source] legacyOnlyPresets=${report.legacyOnlyPresetIds.length}`);
    console.error(
      report.legacyOnlyPresetIds
        .slice(0, 20)
        .map((presetId) => `- ${presetId}`)
        .join('\n'),
    );
    console.error(
      '[styles:source] Add new presets under components/recipes/styles/manifests/presets/**, not legacy pack YAML.',
    );
    process.exitCode = 1;
  }

  if (!process.exitCode) {
    console.log('[styles:source] ok');
  } else {
    console.error('[styles:source] failed');
  }
}
