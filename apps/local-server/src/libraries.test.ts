import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { registerOutputDirectory } from './libraries';

const stored = vi.hoisted(() => ({ path: '', insert: vi.fn() }));

vi.mock('./db/connection', () => ({
  getDb: () => ({
    query: () => ({
      all: () => [
        {
          id: 'existing-output',
          name: 'Photos',
          kind: 'output',
          path: stored.path,
          is_default: 0,
          created_at: '2026-10-03T00:00:00Z',
        },
      ],
      run: stored.insert,
    }),
  }),
}));
vi.mock('node:fs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:fs')>()),
  mkdirSync: vi.fn(),
}));

describe('registerOutputDirectory', () => {
  it('reuses the same output path while respecting native path case sensitivity', () => {
    stored.path = path.resolve('tmp', 'photos');
    expect(registerOutputDirectory(`${stored.path}${path.sep}`).id).toBe('existing-output');
    const differentlyCased = path.resolve('tmp', 'Photos');
    const result = registerOutputDirectory(differentlyCased);
    if (process.platform === 'win32') {
      expect(result.id).toBe('existing-output');
      expect(stored.insert).not.toHaveBeenCalled();
    } else {
      expect(result.id).not.toBe('existing-output');
      expect(result.path).toBe(differentlyCased);
      expect(stored.insert).toHaveBeenCalledOnce();
    }
  });
});
