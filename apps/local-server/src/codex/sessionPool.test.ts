import { describe, expect, it } from 'vite-plus/test';
import { vi } from 'vite-plus/test';
import { createSessionPool } from './sessionPool';

vi.mock('../logger', () => ({
  log: vi.fn(),
}));

vi.mock('../library', () => ({
  resolveLibraryPath: (...parts: string[]) => `D:/tmp/${parts.join('/')}`,
}));

describe('createSessionPool.getSessionKey', () => {
  it('prefers explicit SESSION field over PACK field', () => {
    const pool = createSessionPool();

    expect(
      pool.getSessionKey(`PACK: Fashion & Costume
CATEGORY: 5. Fabric & Texture Focus
SESSION: fashion_costume_retry_a`),
    ).toBe('fashion_costume_retry_a');
  });

  it('falls back to PACK field when SESSION is absent', () => {
    const pool = createSessionPool();

    expect(
      pool.getSessionKey(`PACK: Fashion & Costume
CATEGORY: 5. Fabric & Texture Focus`),
    ).toBe('fashion_costume');
  });
});
