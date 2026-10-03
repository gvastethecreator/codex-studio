import { describe, expect, it } from 'vitest';
import { isAbsolutePlatformPath, resolveUserHome } from './platformHome';

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

  it('ignores home paths from a different platform and accepts Windows network homes', () => {
    expect(
      resolveUserHome({
        env: { HOME: 'C:\\Users\\ava' },
        platform: 'linux',
        fallback: '/home/ava',
      }),
    ).toBe('/home/ava');
    expect(
      resolveUserHome({
        env: { USERPROFILE: '\\Users\\ava', HOMEDRIVE: 'D:', HOMEPATH: '\\Users\\ava' },
        platform: 'win32',
        fallback: 'C:\\Users\\ava',
      }),
    ).toBe('D:\\Users\\ava');
    expect(isAbsolutePlatformPath('\\\\server\\users\\ava', 'win32')).toBe(true);
    expect(isAbsolutePlatformPath('C:Pictures', 'win32')).toBe(false);
    expect(isAbsolutePlatformPath('/Pictures', 'win32')).toBe(false);
    expect(isAbsolutePlatformPath('C:\\Pictures', 'linux')).toBe(false);
  });
});
