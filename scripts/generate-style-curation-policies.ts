import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { validateSnapshot } from '../packages/shared/src/styles/intentional-v1/validation';
import { loadStylePresetManifestRecords } from './style-manifest-files';

const outputPath = path.resolve('components/recipes/styles/curation-v2/policies.generated.json');
const projected: Record<string, unknown> = {};
for (const { manifest } of await loadStylePresetManifestRecords()) {
  const policy = manifest.attributes?.intentionalPolicy;
  if (policy === undefined) continue;
  const snapshot = {
    presetId: manifest.id,
    packId: manifest.packId,
    version: manifest.version,
    name: manifest.displayName || manifest.name,
    dna: manifest.visualDna,
    policy,
  };
  validateSnapshot(snapshot);
  projected[manifest.id] = {
    ...snapshot.policy,
    presetVersion: manifest.version,
    packId: manifest.packId,
    name: snapshot.name,
  };
}
if (process.argv.includes('--check')) {
  const actual = JSON.parse(await readFile(outputPath, 'utf8'));
  if (JSON.stringify(actual) !== JSON.stringify(projected))
    throw new Error('Curation policy projection is stale. Run bun run styles:curation:policies.');
} else {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(projected, null, 2)}\n`, 'utf8');
}
console.log(`[styles:curation:policies] ${Object.keys(projected).length} manifest-owned policies`);
