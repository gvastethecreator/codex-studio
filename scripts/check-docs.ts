#!/usr/bin/env bun
/** Fail when tracked Markdown entrypoints link to missing or untracked local paths. */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

function normalizeRepoPath(value: string) {
  return value.replaceAll('\\', '/').replace(/^\.\//, '');
}

function readTrackedFiles(cwd: string) {
  const output = execFileSync('git', ['ls-files', '-z'], { cwd, encoding: 'utf8' });
  return output.split('\0').map(normalizeRepoPath).filter(Boolean);
}

export function findBrokenDocLinks({
  cwd,
  markdownFiles,
  trackedFiles,
}: {
  cwd: string;
  markdownFiles: string[];
  trackedFiles: ReadonlySet<string>;
}) {
  const errors: string[] = [];

  for (const markdownFile of markdownFiles) {
    const filePath = path.resolve(cwd, markdownFile);
    if (!existsSync(filePath)) {
      errors.push(`${markdownFile} -> tracked source is missing`);
      continue;
    }

    const text = readFileSync(filePath, 'utf8');
    let match: RegExpExecArray | null;
    while ((match = linkPattern.exec(text))) {
      const href = match[1].trim().replace(/^<|>$/g, '');
      if (!href || href.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(href)) continue;

      const encodedPath = href.split('#')[0]?.split('?')[0] ?? '';
      if (!encodedPath) continue;

      let cleaned = encodedPath;
      try {
        cleaned = decodeURIComponent(encodedPath);
      } catch {
        errors.push(`${markdownFile} -> invalid encoded link ${href}`);
        continue;
      }

      const target = path.resolve(path.dirname(filePath), cleaned);
      const targetRepoPath = normalizeRepoPath(path.relative(cwd, target));
      const targetIsTracked =
        trackedFiles.has(targetRepoPath) ||
        [...trackedFiles].some((trackedFile) => trackedFile.startsWith(`${targetRepoPath}/`));

      if (!existsSync(target)) {
        errors.push(`${markdownFile} -> missing ${href}`);
      } else if (!targetIsTracked) {
        errors.push(`${markdownFile} -> untracked ${href}`);
      }
    }
  }

  return errors;
}

if (import.meta.main) {
  const cwd = process.cwd();
  const trackedFileList = readTrackedFiles(cwd);
  const trackedFiles = new Set(trackedFileList);
  const markdownFiles = trackedFileList.filter((file) => file.toLowerCase().endsWith('.md'));
  const errors = findBrokenDocLinks({ cwd, markdownFiles, trackedFiles });

  if (errors.length > 0) {
    console.error('docs:check failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`docs:check passed (${markdownFiles.length} tracked Markdown files)`);
}
