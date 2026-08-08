#!/usr/bin/env bun
/**
 * Reproducible asset size audit for Core Asset Set policy.
 */
import { readdirSync, statSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const assetsRoot = path.resolve(process.cwd(), 'assets');
const outDir = path.resolve(process.cwd(), '.scratch', 'codex-studio-hardening');

function walk(dir: string, acc: { path: string; bytes: number; ext: string }[] = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
      continue;
    }
    const st = statSync(full);
    acc.push({
      path: path.relative(process.cwd(), full).replaceAll('\\', '/'),
      bytes: st.size,
      ext: path.extname(entry.name).toLowerCase() || '(none)',
    });
  }
  return acc;
}

const files = walk(assetsRoot);
const byExt = new Map<string, { count: number; bytes: number }>();
let totalBytes = 0;
for (const file of files) {
  totalBytes += file.bytes;
  const bucket = byExt.get(file.ext) ?? { count: 0, bytes: 0 };
  bucket.count += 1;
  bucket.bytes += file.bytes;
  byExt.set(file.ext, bucket);
}

const top = [...files].sort((a, b) => b.bytes - a.bytes).slice(0, 25);
const report = {
  generatedAt: new Date().toISOString(),
  root: 'assets',
  fileCount: files.length,
  totalBytes,
  byExtension: Object.fromEntries([...byExt.entries()].sort((a, b) => b[1].bytes - a[1].bytes)),
  topFiles: top,
  coreAssetSetNote:
    'Core first-run assets must remain small enough for clone; optional packs stay versioned outside Git history rewrite.',
};

mkdirSync(outDir, { recursive: true });
const jsonPath = path.join(outDir, 'assets-audit.json');
const mdPath = path.join(outDir, 'assets-audit.md');
writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(
  mdPath,
  [
    '# Repo assets audit',
    '',
    `- Files: ${report.fileCount}`,
    `- Total bytes: ${report.totalBytes}`,
    `- Generated: ${report.generatedAt}`,
    '',
    '## Top files',
    ...top.map((file) => `- ${file.bytes} ${file.path}`),
    '',
  ].join('\n'),
);

console.log(
  JSON.stringify({ ok: true, jsonPath, mdPath, totalBytes, fileCount: files.length }, null, 2),
);
