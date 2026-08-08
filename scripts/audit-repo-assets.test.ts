import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vite-plus/test';

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe('repo asset audit', () => {
  it('keeps ignored generation failure ledgers out of optional pack locks', () => {
    const cwd = mkdtempSync(path.join(tmpdir(), 'codex-studio-assets-'));
    temporaryDirectories.push(cwd);
    const assetsDirectory = path.join(cwd, 'assets');
    const defaultsDirectory = path.join(assetsDirectory, 'recipes', 'styles', 'defaults');
    mkdirSync(defaultsDirectory, { recursive: true });
    writeFileSync(
      path.join(assetsDirectory, 'asset-policy.json'),
      JSON.stringify({
        schemaVersion: 1,
        excludePrefixes: ['assets/recipes/styles/defaults/failures-pack_'],
        core: {
          maxBytes: 1024,
          includePaths: ['assets/asset-pack-lock.json', 'assets/asset-policy.json'],
          includePrefixes: [],
        },
        optionalPacks: [
          {
            id: 'style-defaults',
            version: '1.0.0',
            includePrefixes: ['assets/recipes/styles/defaults/'],
          },
        ],
      }),
    );
    writeFileSync(
      path.join(assetsDirectory, 'asset-pack-lock.json'),
      '{"schemaVersion":1,"packs":[]}',
    );
    writeFileSync(path.join(defaultsDirectory, 'SP01-001.webp'), 'pack input');
    writeFileSync(path.join(defaultsDirectory, 'failures-pack_01.json'), '{"local":true}');

    const auditScript = path.resolve(import.meta.dirname, 'audit-repo-assets.ts');
    execFileSync('bun', ['run', auditScript, '--update-lock'], { cwd, stdio: 'pipe' });

    const lock = JSON.parse(
      readFileSync(path.join(assetsDirectory, 'asset-pack-lock.json'), 'utf8'),
    ) as {
      packs: Array<{
        id: string;
        version: string;
        sha256: string;
        fileCount: number;
        totalBytes: number;
      }>;
    };
    expect(lock.packs).toEqual([
      {
        id: 'style-defaults',
        version: '1.0.0',
        sha256: expect.any(String),
        fileCount: 1,
        totalBytes: 10,
      },
    ]);

    writeFileSync(path.join(defaultsDirectory, 'failures-pack_01.json'), '{"changed":true}');
    expect(() =>
      execFileSync('bun', ['run', auditScript, '--verify'], { cwd, stdio: 'pipe' }),
    ).not.toThrow();
  });
});
