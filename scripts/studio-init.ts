import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { initStudio } from '../apps/local-server/src/init';

const result = initStudio();
console.log(JSON.stringify(result, null, 2));

// Styles load from installed extensions (ADR 0011); build the built-in ones on first setup.
const builtInExtensions = path.resolve(import.meta.dir, '..', '.local', 'extensions', 'builtin');
if (!existsSync(builtInExtensions)) {
  const build = spawnSync('bun', ['run', 'scripts/build-style-extensions.ts'], {
    cwd: path.resolve(import.meta.dir, '..'),
    stdio: 'inherit',
  });
  if (build.status !== 0) process.exit(build.status ?? 1);
}
