import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const defaultRootDir = process.cwd();

const legacyMigrationPacksRepoPath = 'scripts/style-migration/legacy-packs';
const retiredLegacyPacksPathMarker = 'styles/packs';

const legacyMarkers = [
  'LEGACY_STYLE_PACKS',
  'legacyStylesData',
  retiredLegacyPacksPathMarker,
] as const;
const retiredRuntimeAliasMarkers = [
  { label: 'StylePack', pattern: /\bStylePack\b/ },
  { label: 'StylePresetDef', pattern: /\bStylePresetDef\b/ },
  { label: 'STYLE_PACK_SUMMARIES', pattern: /\bSTYLE_PACK_SUMMARIES\b/ },
  { label: 'loadStylePack', pattern: /\bloadStylePack\b/ },
  { label: 'loadStylePacks', pattern: /\bloadStylePacks\b/ },
  { label: 'loadGeneratedStylePack', pattern: /\bloadGeneratedStylePack\b/ },
  { label: 'loadGeneratedStylePacks', pattern: /\bloadGeneratedStylePacks\b/ },
  {
    label: 'composeStylePacksFromManifests',
    pattern: /\bcomposeStylePacksFromManifests\b/,
  },
] as const;
const compatibilityTypeBarrelMarkers = [
  './styles/types',
  '../styles/types',
  '../../styles/types',
  'components/recipes/styles/types',
  'recipes/styles/types',
] as const;

const ignoredPathParts = new Set(['.git', 'dist', 'logs', 'node_modules', 'tmp']);

const allowedLegacyFiles = new Set([
  'components/recipes/stylePresetManifests.test.ts',
  'scripts/split-style-preset-manifests.ts',
  'scripts/split-style-preset-manifests.test.ts',
  'scripts/style-authoring-source-audit.ts',
  'scripts/style-authoring-source-audit.test.ts',
]);

const allowedRetiredRuntimeAliasFiles = new Set([
  'scripts/style-authoring-source-audit.ts',
  'scripts/style-authoring-source-audit.test.ts',
]);

const allowedCompatibilityTypeBarrelFiles = new Set([
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
  retiredRuntimeAliasUsages: StyleAuthoringSourceAuditUsage[];
  retiredRuntimeAliasViolations: StyleAuthoringSourceAuditUsage[];
  compatibilityTypeBarrelUsages: StyleAuthoringSourceAuditUsage[];
  compatibilityTypeBarrelViolations: StyleAuthoringSourceAuditUsage[];
  generatedTempFiles: string[];
  retiredLegacyPackFiles: string[];
  legacyMigrationPackFiles: string[];
  unexpectedStyleYamlFiles: string[];
  manifestPresetCount: number;
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

function isAllowedRetiredRuntimeAliasFile(repoPath: string) {
  return allowedRetiredRuntimeAliasFiles.has(repoPath);
}

function isAllowedCompatibilityTypeBarrelFile(repoPath: string) {
  return allowedCompatibilityTypeBarrelFiles.has(repoPath);
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

async function collectRetiredLegacyPackFiles(rootDir: string) {
  const packsDir = path.join(rootDir, 'components', 'recipes', 'styles', 'packs');
  const files: string[] = [];

  for (const entry of await readDirIfExists(packsDir)) {
    if (entry.isFile() && entry.name.endsWith('.yaml')) {
      files.push(toRepoPath(rootDir, path.join(packsDir, entry.name)));
    }
  }

  return files.sort();
}

async function collectLegacyMigrationPackFiles(rootDir: string) {
  const packsDir = path.join(rootDir, legacyMigrationPacksRepoPath);
  const files: string[] = [];

  for (const entry of await readDirIfExists(packsDir)) {
    if (entry.isFile() && entry.name.endsWith('.yaml')) {
      files.push(toRepoPath(rootDir, path.join(packsDir, entry.name)));
    }
  }

  return files.sort();
}

async function collectUnexpectedStyleYamlFiles(rootDir: string, currentDir?: string) {
  const stylesDir = path.join(rootDir, 'components', 'recipes', 'styles');
  const dir = currentDir ?? stylesDir;
  const files: string[] = [];

  for (const entry of await readDirIfExists(dir)) {
    const absolutePath = path.join(dir, entry.name);
    const repoPath = toRepoPath(rootDir, absolutePath);
    if (entry.isDirectory()) {
      files.push(...(await collectUnexpectedStyleYamlFiles(rootDir, absolutePath)));
      continue;
    }
    if (!entry.isFile() || !/\.ya?ml$/.test(entry.name)) continue;
    if (!repoPath.startsWith('components/recipes/styles/manifests/')) {
      files.push(repoPath);
    }
  }

  return files.sort();
}

export async function createStyleAuthoringSourceAuditReport(
  rootDir = defaultRootDir,
): Promise<StyleAuthoringSourceAuditReport> {
  const usages: StyleAuthoringSourceAuditUsage[] = [];
  const retiredRuntimeAliasUsages: StyleAuthoringSourceAuditUsage[] = [];
  const compatibilityTypeBarrelUsages: StyleAuthoringSourceAuditUsage[] = [];
  const files = await listSourceFiles(rootDir);
  const generatedTempFiles: string[] = [];
  const [
    manifestPresetIds,
    retiredLegacyPackFiles,
    legacyMigrationPackFiles,
    unexpectedStyleYamlFiles,
  ] = await Promise.all([
    collectStylePresetManifestIds(rootDir),
    collectRetiredLegacyPackFiles(rootDir),
    collectLegacyMigrationPackFiles(rootDir),
    collectUnexpectedStyleYamlFiles(rootDir),
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
    const aliasMarkers = retiredRuntimeAliasMarkers
      .filter((marker) => marker.pattern.test(source))
      .map((marker) => marker.label);
    if (aliasMarkers.length > 0) {
      retiredRuntimeAliasUsages.push({ filePath: repoPath, markers: [...aliasMarkers] });
    }
    const compatibilityTypeMarkers = compatibilityTypeBarrelMarkers.filter((marker) =>
      source.includes(marker),
    );
    if (compatibilityTypeMarkers.length > 0) {
      compatibilityTypeBarrelUsages.push({
        filePath: repoPath,
        markers: [...compatibilityTypeMarkers],
      });
    }
  }

  const retiredRuntimeAliasViolations = retiredRuntimeAliasUsages.filter(
    (usage) => !isAllowedRetiredRuntimeAliasFile(usage.filePath),
  );
  const compatibilityTypeBarrelViolations = compatibilityTypeBarrelUsages.filter(
    (usage) => !isAllowedCompatibilityTypeBarrelFile(usage.filePath),
  );

  return {
    scannedFiles: files.length,
    usages,
    violations: usages.filter((usage) => !isAllowedLegacyFile(usage.filePath)),
    retiredRuntimeAliasUsages,
    retiredRuntimeAliasViolations,
    compatibilityTypeBarrelUsages,
    compatibilityTypeBarrelViolations,
    generatedTempFiles,
    retiredLegacyPackFiles,
    legacyMigrationPackFiles,
    unexpectedStyleYamlFiles,
    manifestPresetCount: manifestPresetIds.size,
  };
}

if (import.meta.main) {
  const report = await createStyleAuthoringSourceAuditReport();

  console.log(
    `[styles:source] scanned=${report.scannedFiles} legacyUsages=${report.usages.length}`,
  );
  console.log(`[styles:source] manifestPresets=${report.manifestPresetCount}`);
  for (const usage of report.usages) {
    console.log(`- ${usage.filePath} markers=${usage.markers.join(',')}`);
  }
  if (report.retiredRuntimeAliasUsages.length > 0) {
    console.log(
      `[styles:source] retiredRuntimeAliasUsages=${report.retiredRuntimeAliasUsages.length}`,
    );
    for (const usage of report.retiredRuntimeAliasUsages) {
      console.log(`- ${usage.filePath} markers=${usage.markers.join(',')}`);
    }
  }
  if (report.compatibilityTypeBarrelUsages.length > 0) {
    console.log(
      `[styles:source] compatibilityTypeBarrelUsages=${report.compatibilityTypeBarrelUsages.length}`,
    );
    for (const usage of report.compatibilityTypeBarrelUsages) {
      console.log(`- ${usage.filePath} markers=${usage.markers.join(',')}`);
    }
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

  if (report.retiredRuntimeAliasViolations.length > 0) {
    console.error(
      `[styles:source] retiredRuntimeAliasViolations=${report.retiredRuntimeAliasViolations.length}`,
    );
    for (const usage of report.retiredRuntimeAliasViolations) {
      console.error(`- ${usage.filePath} markers=${usage.markers.join(',')}`);
    }
    console.error(
      '[styles:source] Use StyleRuntimePack, StyleRuntimePreset, and composeStyleRuntimePacksFromManifests in new code.',
    );
    process.exitCode = 1;
  }

  if (report.compatibilityTypeBarrelViolations.length > 0) {
    console.error(
      `[styles:source] compatibilityTypeBarrelViolations=${report.compatibilityTypeBarrelViolations.length}`,
    );
    for (const usage of report.compatibilityTypeBarrelViolations) {
      console.error(`- ${usage.filePath} markers=${usage.markers.join(',')}`);
    }
    console.error(
      '[styles:source] Import style runtime contracts from runtimeTypes and manifest authoring contracts from manifestTypes.',
    );
    process.exitCode = 1;
  }

  if (report.retiredLegacyPackFiles.length > 0) {
    console.error(`[styles:source] retiredLegacyPackFiles=${report.retiredLegacyPackFiles.length}`);
    for (const filePath of report.retiredLegacyPackFiles) {
      console.error(`- ${filePath}`);
    }
    console.error('[styles:source] Remove retired legacy pack YAML; use granular manifests.');
    process.exitCode = 1;
  }

  if (report.legacyMigrationPackFiles.length > 0) {
    console.error(
      `[styles:source] legacyMigrationPackFiles=${report.legacyMigrationPackFiles.length}`,
    );
    for (const filePath of report.legacyMigrationPackFiles) {
      console.error(`- ${filePath}`);
    }
    console.error(
      '[styles:source] Legacy monolithic style packs are retired; keep presets in granular manifests only.',
    );
    process.exitCode = 1;
  }

  if (report.unexpectedStyleYamlFiles.length > 0) {
    console.error(
      `[styles:source] unexpectedStyleYamlFiles=${report.unexpectedStyleYamlFiles.length}`,
    );
    for (const filePath of report.unexpectedStyleYamlFiles) {
      console.error(`- ${filePath}`);
    }
    console.error(
      '[styles:source] Style YAML under components/recipes/styles/ must live in manifests/.',
    );
    process.exitCode = 1;
  }

  if (!process.exitCode) {
    console.log('[styles:source] ok');
  } else {
    console.error('[styles:source] failed');
  }
}
