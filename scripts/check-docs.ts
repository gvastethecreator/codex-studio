#!/usr/bin/env bun
/**
 * Fail when README/AGENTS/CONTRIBUTING link to missing local markdown paths.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const roots = ['README.md', 'AGENTS.md', 'Agents.md', 'CONTRIBUTING.md'];
const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
const errors: string[] = [];

for (const root of roots) {
  const filePath = path.resolve(process.cwd(), root);
  if (!existsSync(filePath)) continue;
  const text = readFileSync(filePath, 'utf8');
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(text))) {
    const href = match[1].trim();
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
      continue;
    }
    const cleaned = href.split('#')[0]?.split('?')[0] ?? '';
    if (!cleaned) continue;
    const target = path.resolve(path.dirname(filePath), cleaned);
    if (!existsSync(target)) {
      errors.push(`${root} -> missing ${href}`);
    }
  }
}

if (errors.length > 0) {
  console.error('docs:check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('docs:check passed');
