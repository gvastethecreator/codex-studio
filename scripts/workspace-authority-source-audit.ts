#!/usr/bin/env bun
/**
 * Prevent generate path and automation scripts from reintroducing Project listing.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hits: string[] = [];

function walk(dir: string, acc: string[] = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
      continue;
    }
    if (!/\.(ts|tsx|mjs|js)$/.test(entry.name)) continue;
    acc.push(full);
  }
  return acc;
}

// 1) Product generate path
const generateRunPath = path.resolve(root, 'services/localGenerationRun.ts');
const generateSource = readFileSync(generateRunPath, 'utf8');
if (generateSource.includes('listProjects')) {
  hits.push('listProjects is referenced in localGenerationRun.ts');
}
if (/createStudioJob\(\{[\s\S]*projectId/.test(generateSource)) {
  hits.push('createStudioJob still passes projectId in localGenerationRun.ts');
}
if (!generateSource.includes('workspaceId')) {
  hits.push('workspaceId missing from localGenerationRun.ts');
}

// 2) Automation scripts must not list /api/projects for job setup
const scriptRoot = path.resolve(root, 'scripts');
for (const file of walk(scriptRoot)) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  // Audit script itself may mention the forbidden string.
  if (rel.endsWith('workspace-authority-source-audit.ts')) continue;
  const source = readFileSync(file, 'utf8');
  if (source.includes("'/api/projects'") || source.includes('"/api/projects"')) {
    hits.push(`${rel} calls /api/projects`);
  }
  if (source.includes('listProjects(') && !rel.includes('.test.')) {
    hits.push(`${rel} calls listProjects(`);
  }
}

// 3) Client product service should not offer a working projects list
const clientService = readFileSync(path.resolve(root, 'services/localStudioService.ts'), 'utf8');
if (/export async function listProjects\(\)[\s\S]{0,200}request<Project/.test(clientService)) {
  hits.push('localStudioService.listProjects still requests /api/projects');
}

if (hits.length > 0) {
  console.error(JSON.stringify({ ok: false, hits }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checked: ['services/localGenerationRun.ts', 'scripts/**', 'services/localStudioService.ts'],
    },
    null,
    2,
  ),
);
