import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

function resolveBunExecutable() {
  if (process.platform !== 'win32') return 'bun';
  const candidates = execFileSync('where.exe', ['bun'], { encoding: 'utf8' })
    .split(/\r?\n/)
    .map((candidate) => candidate.trim())
    .filter(Boolean);
  return candidates.find((candidate) => candidate.toLowerCase().endsWith('bun.exe')) ?? 'bun';
}

describe('database migrations', () => {
  it('migrates real legacy SQLite fixtures idempotently and transactionally', () => {
    const fixturePath = path.resolve(process.cwd(), 'apps/local-server/src/dbMigrationFixture.ts');
    const output = execFileSync(resolveBunExecutable(), ['run', fixturePath], {
      cwd: process.cwd(),
      encoding: 'utf8',
      windowsHide: true,
    });

    expect(JSON.parse(output.trim())).toEqual({
      idempotent: true,
      sentinelPreserved: true,
      projectContractRemoved: true,
      indexesPresent: true,
      foreignKeysValid: true,
      referencingRowsPreserved: true,
      transactionRolledBack: true,
      recoverableCheckpoint: true,
      summaryProjection: true,
      schemaVersion: 6,
    });
  });
});
