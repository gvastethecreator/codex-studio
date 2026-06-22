import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

import { appendRotatingLog } from './rotatingLog';

describe('appendRotatingLog', () => {
  it('rotates oversized logs into bounded history before appending', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'codex-studio-log-'));
    try {
      const logPath = path.join(root, 'studio.log');
      writeFileSync(logPath, 'x'.repeat(24), 'utf8');

      appendRotatingLog(logPath, 'new line\n', {
        maxBytes: 8,
        maxHistoryFiles: 1,
        now: () => new Date('2026-06-21T00:00:00.000Z'),
      });

      expect(readFileSync(logPath, 'utf8')).toBe('new line\n');
      const historyDir = path.join(root, 'history');
      expect(existsSync(historyDir)).toBe(true);
      expect(readdirSync(historyDir)).toHaveLength(1);
      expect(readdirSync(historyDir)[0]).toMatch(/^studio\.2026-06-21T00-00-00-000Z\.log$/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
