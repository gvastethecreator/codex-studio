#!/usr/bin/env bun
/** Reproducible Core Asset Set and optional pack integrity audit. */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

interface AssetPolicy {
  schemaVersion: number;
  excludePrefixes: string[];
  core: {
    maxBytes: number;
    includePaths: string[];
    includePrefixes: string[];
  };
  optionalPacks: Array<{
    id: string;
    version: string;
    includePrefixes: string[];
  }>;
}

interface AssetFile {
  path: string;
  bytes: number;
  ext: string;
  sha256: string;
}

interface PackLockEntry {
  id: string;
  version: string;
  sha256: string;
  fileCount: number;
  totalBytes: number;
}

interface AssetPackLock {
  schemaVersion: number;
  packs: PackLockEntry[];
}

const root = process.cwd();
const assetsRoot = path.resolve(root, 'assets');
const policyPath = path.join(assetsRoot, 'asset-policy.json');
const lockPath = path.join(assetsRoot, 'asset-pack-lock.json');
const outDir = path.resolve(root, '.scratch', 'codex-studio-hardening');
const verify = process.argv.includes('--verify');
const updateLock = process.argv.includes('--update-lock');

function normalizePath(filePath: string) {
  return filePath.replaceAll('\\', '/');
}

function sha256File(filePath: string) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function walk(dir: string, acc: AssetFile[] = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
      continue;
    }
    const stats = statSync(full);
    acc.push({
      path: normalizePath(path.relative(root, full)),
      bytes: stats.size,
      ext: path.extname(entry.name).toLowerCase() || '(none)',
      sha256: sha256File(full),
    });
  }
  return acc;
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

function matchesPrefix(filePath: string, prefixes: string[]) {
  return prefixes.some((prefix) => filePath.startsWith(prefix));
}

function groupBy<T, K>(values: T[], keyFor: (value: T) => K) {
  const groups = new Map<K, T[]>();
  for (const value of values) {
    const key = keyFor(value);
    const group = groups.get(key) ?? [];
    group.push(value);
    groups.set(key, group);
  }
  return groups;
}

function summarizePack(id: string, version: string, files: AssetFile[]): PackLockEntry {
  const sorted = [...files].sort((left, right) => left.path.localeCompare(right.path));
  const digest = createHash('sha256');
  for (const file of sorted) digest.update(`${file.path}\0${file.sha256}\n`);
  return {
    id,
    version,
    sha256: digest.digest('hex'),
    fileCount: sorted.length,
    totalBytes: sorted.reduce((sum, file) => sum + file.bytes, 0),
  };
}

if (!existsSync(policyPath)) {
  throw new Error('Missing assets/asset-policy.json');
}

const policy = readJson<AssetPolicy>(policyPath);
const files = walk(assetsRoot).filter(
  (file) => !matchesPrefix(file.path, policy.excludePrefixes ?? []),
);
const corePathSet = new Set(policy.core.includePaths);
const coreFiles: AssetFile[] = [];
const optionalFiles = new Map(policy.optionalPacks.map((pack) => [pack.id, [] as AssetFile[]]));
const unclassified: AssetFile[] = [];

for (const file of files) {
  if (corePathSet.has(file.path) || matchesPrefix(file.path, policy.core.includePrefixes)) {
    coreFiles.push(file);
    continue;
  }
  const pack = policy.optionalPacks.find((candidate) =>
    matchesPrefix(file.path, candidate.includePrefixes),
  );
  if (pack) {
    optionalFiles.get(pack.id)!.push(file);
  } else {
    unclassified.push(file);
  }
}

const coreSummary = summarizePack('core', String(policy.schemaVersion), coreFiles);
const packSummaries = policy.optionalPacks.map((pack) =>
  summarizePack(pack.id, pack.version, optionalFiles.get(pack.id) ?? []),
);
const nextLock: AssetPackLock = { schemaVersion: 1, packs: packSummaries };

if (updateLock) {
  writeFileSync(lockPath, `${JSON.stringify(nextLock, null, 2)}\n`);
}

const missingCorePaths = policy.core.includePaths.filter(
  (filePath) => !files.some((file) => file.path === filePath),
);
const emptyCorePrefixes = policy.core.includePrefixes.filter(
  (prefix) => !files.some((file) => file.path.startsWith(prefix)),
);
const existingLock = existsSync(lockPath) ? readJson<AssetPackLock>(lockPath) : null;
const lockMismatch = !existingLock || JSON.stringify(existingLock) !== JSON.stringify(nextLock);
const duplicateGroups = [...groupBy(files, (file) => file.sha256).values()]
  .filter((group) => group.length > 1)
  .sort(
    (left, right) =>
      right.reduce((sum, file) => sum + file.bytes, 0) -
      left.reduce((sum, file) => sum + file.bytes, 0),
  );
const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
const byExt = groupBy(files, (file) => file.ext);
const errors = [
  ...(coreSummary.totalBytes > policy.core.maxBytes
    ? [`Core Asset Set exceeds ${policy.core.maxBytes} bytes.`]
    : []),
  ...(missingCorePaths.length > 0 ? [`Missing core paths: ${missingCorePaths.join(', ')}`] : []),
  ...(emptyCorePrefixes.length > 0 ? [`Empty core prefixes: ${emptyCorePrefixes.join(', ')}`] : []),
  ...(unclassified.length > 0
    ? [`Unclassified assets: ${unclassified.map((file) => file.path).join(', ')}`]
    : []),
  ...(verify && lockMismatch ? ['Optional asset pack lock is stale. Run with --update-lock.'] : []),
];
const top = [...files].sort((left, right) => right.bytes - left.bytes).slice(0, 25);
const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  total: { fileCount: files.length, totalBytes },
  core: { ...coreSummary, maxBytes: policy.core.maxBytes },
  optionalPacks: packSummaries,
  unclassified: unclassified.map((file) => file.path),
  duplicateGroupCount: duplicateGroups.length,
  duplicateBytes: duplicateGroups.reduce(
    (sum, group) => sum + group.slice(1).reduce((groupSum, file) => groupSum + file.bytes, 0),
    0,
  ),
  byExtension: Object.fromEntries(
    [...byExt.entries()]
      .map(([ext, extFiles]) => [
        ext,
        {
          count: extFiles.length,
          bytes: extFiles.reduce((sum, file) => sum + file.bytes, 0),
        },
      ])
      .sort(
        (left, right) =>
          Number((right[1] as { bytes: number }).bytes) -
          Number((left[1] as { bytes: number }).bytes),
      ),
  ),
  topFiles: top.map(({ path: filePath, bytes }) => ({ path: filePath, bytes })),
  errors,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'assets-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(
  path.join(outDir, 'assets-audit.md'),
  [
    '# Repo assets audit',
    '',
    `- Status: ${report.ok ? 'pass' : 'fail'}`,
    `- Files: ${report.total.fileCount}`,
    `- Total bytes: ${report.total.totalBytes}`,
    `- Core bytes: ${report.core.totalBytes} / ${report.core.maxBytes}`,
    `- Optional packs: ${report.optionalPacks.length}`,
    `- Duplicate groups: ${report.duplicateGroupCount}`,
    '',
    '## Optional packs',
    ...report.optionalPacks.map(
      (pack) =>
        `- ${pack.id}@${pack.version}: ${pack.fileCount} files, ${pack.totalBytes} bytes, sha256 ${pack.sha256}`,
    ),
    '',
    '## Top files',
    ...top.map((file) => `- ${file.bytes} ${file.path}`),
    ...(errors.length > 0 ? ['', '## Errors', ...errors.map((error) => `- ${error}`)] : []),
    '',
  ].join('\n'),
);

console.log(
  JSON.stringify(
    {
      ok: report.ok,
      totalBytes: report.total.totalBytes,
      fileCount: report.total.fileCount,
      coreBytes: report.core.totalBytes,
      coreMaxBytes: report.core.maxBytes,
      optionalPacks: report.optionalPacks,
      duplicateGroupCount: report.duplicateGroupCount,
      errors,
    },
    null,
    2,
  ),
);

if (errors.length > 0) process.exit(1);
