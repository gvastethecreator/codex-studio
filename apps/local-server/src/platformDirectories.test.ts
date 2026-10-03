import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveDefaultImagesDir } from './config';
import { resolvePicturesDir } from './platformDirectories';

vi.mock('node:child_process', () => ({ execFileSync: vi.fn() }));
vi.mock('node:fs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:fs')>()),
  readFileSync: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Pictures directory detection', () => {
  it('uses the Windows Known Folder, including redirected Unicode and network locations', () => {
    vi.mocked(execFileSync).mockReturnValue('\\\\server\\Fotos de Jos\u00e9\\Im\u00e1genes\r\n');
    expect(resolveDefaultImagesDir({}, 'win32', 'C:\\Users\\jose')).toBe(
      '\\\\server\\Fotos de Jos\u00e9\\Im\u00e1genes\\Cozy Studio',
    );
    expect(execFileSync).toHaveBeenCalledWith(
      'powershell.exe',
      expect.arrayContaining([expect.stringContaining('[Environment+SpecialFolder]::MyPictures')]),
      expect.objectContaining({ windowsHide: true, timeout: 5_000, encoding: 'utf8' }),
    );
  });

  it('keeps an explicit images folder and reports an unavailable Windows Known Folder', () => {
    vi.mocked(execFileSync).mockImplementation(() => {
      throw new Error('unavailable');
    });
    expect(
      resolveDefaultImagesDir(
        { STUDIO_IMAGES_DIR: 'B:\\#OUTPUTS\\CozyStudio' },
        'win32',
        'C:\\Users\\a',
      ),
    ).toBe('B:\\#OUTPUTS\\CozyStudio');
    expect(execFileSync).not.toHaveBeenCalled();
    expect(() => resolvePicturesDir({}, 'win32', 'C:\\Users\\a')).toThrow('Set STUDIO_IMAGES_DIR');
  });

  it('reads localized XDG pictures from the configured directory without evaluating shell content', () => {
    vi.mocked(readFileSync).mockReturnValue(
      '# comment\nXDG_PICTURES_DIR="$HOME/Im\u00e1genes/Arte \\"2026\\""\n',
    );
    expect(resolvePicturesDir({ XDG_CONFIG_HOME: '/config/user' }, 'linux', '/home/a')).toBe(
      '/home/a/Im\u00e1genes/Arte "2026"',
    );
    expect(readFileSync).toHaveBeenCalledWith('/config/user/user-dirs.dirs', 'utf8');
    vi.mocked(readFileSync).mockReturnValue('XDG_PICTURES_DIR="$(touch /tmp/not-run)"');
    expect(resolvePicturesDir({}, 'linux', '/home/a')).toBe('/home/a/Pictures');
    expect(execFileSync).not.toHaveBeenCalled();
  });

  it('respects XDG absolute paths, disabled Pictures folders, and a missing user config', () => {
    expect(resolvePicturesDir({ XDG_PICTURES_DIR: '/mnt/photos' }, 'linux', '/home/a')).toBe(
      '/mnt/photos',
    );
    expect(readFileSync).not.toHaveBeenCalled();
    vi.mocked(readFileSync).mockReturnValue('XDG_PICTURES_DIR="$HOME"');
    expect(() => resolvePicturesDir({}, 'linux', '/home/a')).toThrow(
      'XDG Pictures folder is disabled',
    );
    vi.mocked(readFileSync).mockReturnValue('XDG_PICTURES_DIR="/mnt/Fotograf\u00edas"');
    expect(resolvePicturesDir({}, 'linux', '/home/a')).toBe('/mnt/Fotograf\u00edas');
    vi.mocked(readFileSync).mockImplementation(() => {
      throw Object.assign(new Error('missing'), { code: 'ENOENT' });
    });
    expect(resolvePicturesDir({ XDG_CONFIG_HOME: 'relative' }, 'linux', '/home/a')).toBe(
      '/home/a/Pictures',
    );
    expect(readFileSync).toHaveBeenLastCalledWith('/home/a/.config/user-dirs.dirs', 'utf8');
  });

  it('uses the user home on macOS without consulting Windows or Linux settings', () => {
    expect(
      resolveDefaultImagesDir(
        { HOME: '/Users/ren\u00e9', XDG_PICTURES_DIR: '/mnt/photos' },
        'darwin',
      ),
    ).toBe('/Users/ren\u00e9/Pictures/Cozy Studio');
    expect(execFileSync).not.toHaveBeenCalled();
    expect(readFileSync).not.toHaveBeenCalled();
  });
});
