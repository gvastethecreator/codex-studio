import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

import { pruneToolingLogs } from './tooling-task';

describe('pruneToolingLogs', () => {
  it('keeps latest logs and rolling latest files', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'codex-tooling-logs-'));
    try {
      for (let index = 0; index < 3; index += 1) {
        const file = path.join(dir, `build-2026-06-21T00-00-0${index}-000Z.log`);
        writeFileSync(file, String(index));
      }
      writeFileSync(path.join(dir, 'build.latest.log'), 'latest');

      expect(pruneToolingLogs(2, dir)).toBe(1);
      expect(readdirSync(dir).sort()).toEqual([
        'build-2026-06-21T00-00-01-000Z.log',
        'build-2026-06-21T00-00-02-000Z.log',
        'build.latest.log',
      ]);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });
});
