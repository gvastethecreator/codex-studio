import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { findBrokenDocLinks } from './check-docs';

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe('findBrokenDocLinks', () => {
  it('rejects missing and untracked local targets', () => {
    const cwd = mkdtempSync(path.join(tmpdir(), 'codex-studio-docs-'));
    temporaryDirectories.push(cwd);
    mkdirSync(path.join(cwd, '.scratch'), { recursive: true });
    writeFileSync(
      path.join(cwd, 'README.md'),
      '[tracked](docs.md) [missing](missing.md) [local evidence](.scratch/evidence.md)',
    );
    writeFileSync(path.join(cwd, 'docs.md'), '# Tracked');
    writeFileSync(path.join(cwd, '.scratch', 'evidence.md'), '# Local only');

    expect(
      findBrokenDocLinks({
        cwd,
        markdownFiles: ['README.md'],
        trackedFiles: new Set(['README.md', 'docs.md']),
      }),
    ).toEqual(['README.md -> missing missing.md', 'README.md -> untracked .scratch/evidence.md']);
  });
});
