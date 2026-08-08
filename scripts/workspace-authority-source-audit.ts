#!/usr/bin/env bun
/** Prevent product code from reintroducing the retired Project contract. */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { containsRetiredProjectContract } from './workspace-authority-source-audit-rules';

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

// 1) Product surfaces must use Workspace only.
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

const productRoots = [
  'packages/shared/src',
  'services',
  'hooks',
  'contexts',
  'components',
  'lib',
  'apps/local-server/src',
];
const legacyMigrationFiles = new Set([
  'apps/local-server/src/db/migrations.ts',
  'apps/local-server/src/dbMigrationFixture.ts',
]);

for (const entry of productRoots.flatMap((dir) => walk(path.resolve(root, dir)))) {
  if (entry.endsWith('.test.ts') || entry.endsWith('.test.tsx')) continue;
  const relativePath = path.relative(root, entry).replaceAll('\\', '/');
  if (legacyMigrationFiles.has(relativePath)) continue;
  const source = readFileSync(entry, 'utf8');
  if (containsRetiredProjectContract(source)) {
    hits.push(`${relativePath} contains Project contract residue`);
  }
}

// 2) Automation scripts must not list /api/projects for job setup.
const scriptRoot = path.resolve(root, 'scripts');
for (const file of walk(scriptRoot)) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  // Audit script itself may mention the forbidden string.
  if (rel.endsWith('workspace-authority-source-audit.ts')) continue;
  if (rel.includes('.test.')) continue;
  const source = readFileSync(file, 'utf8');
  if (source.includes("'/api/projects'") || source.includes('"/api/projects"')) {
    hits.push(`${rel} calls /api/projects`);
  }
  if (source.includes('listProjects(') && !rel.includes('.test.')) {
    hits.push(`${rel} calls listProjects(`);
  }
}

// 3) The live DB write path must not write legacy project columns.
const jobsSource = readFileSync(path.resolve(root, 'apps/local-server/src/db/jobs.ts'), 'utf8');
const liveDbWritePath = jobsSource.slice(jobsSource.indexOf('export function createJob'));
if (/project_id|projectId|\bProject\b/.test(liveDbWritePath)) {
  hits.push('apps/local-server/src/db/jobs.ts live write path contains Project residue');
}

// 4) Completed modularization must not regress to the retired client or DB facade.
if (existsSync(path.resolve(root, 'services/localStudioService.ts'))) {
  hits.push('services/localStudioService.ts facade has returned');
}
if (existsSync(path.resolve(root, 'apps/local-server/src/db.ts'))) {
  hits.push('apps/local-server/src/db.ts facade has returned');
}
if (existsSync(path.resolve(root, 'apps/local-server/src/dbStore.ts'))) {
  hits.push('apps/local-server/src/dbStore.ts facade has returned');
}
const sharedSchemas = readFileSync(
  path.resolve(root, 'packages/shared/src/studioApiSchemas.ts'),
  'utf8',
);
for (const schema of ['StudioWorkspaceSchema', 'CreateJobRequestBoundarySchema']) {
  if (!sharedSchemas.includes(`export const ${schema}`)) {
    hits.push(`shared API schema missing: ${schema}`);
  }
}

if (hits.length > 0) {
  console.error(JSON.stringify({ ok: false, hits }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checked: [
        'product contracts',
        'generation path',
        'scripts/**',
        'live DB write path',
        'domain module boundaries',
        'shared Effect schemas',
      ],
    },
    null,
    2,
  ),
);
