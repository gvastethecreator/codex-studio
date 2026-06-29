import { describe, expect, it } from 'vite-plus/test';
import { resolveUserHome } from './platformHome';

describe('resolveUserHome', () => {
  it('prefers USERPROFILE on Windows', () => {
    expect(
      resolveUserHome({
        env: { USERPROFILE: 'C:\\Users\\ava', HOME: '/home/ava' },
        platform: 'win32',
        fallback: '/fallback',
      }),
    ).toBe('C:\\Users\\ava');
  });

  it('prefers HOME on Unix platforms', () => {
    expect(
      resolveUserHome({
        env: { USERPROFILE: 'C:\\Users\\ava', HOME: '/Users/ava' },
        platform: 'darwin',
        fallback: '/fallback',
      }),
    ).toBe('/Users/ava');
  });

  it('falls back when env home values are absent', () => {
    expect(
      resolveUserHome({
        env: {},
        platform: 'linux',
        fallback: '/fallback',
      }),
    ).toBe('/fallback');
  });
});
