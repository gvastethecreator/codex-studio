import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  applyOnboardingSetup,
  OnboardingSetupError,
  readStudioLibraryDirFromEnv,
  upsertStudioLibraryDir,
} from './onboardingSetup';
import { resolveDefaultImagesDir, resolveStudioDataRoot } from './config';

describe('onboardingSetup', () => {
  it('keeps Studio data in the private app-data folder and images in Pictures', () => {
    expect(
      resolveStudioDataRoot(
        { LOCALAPPDATA: String.raw`C:\Users\a\AppData\Local` },
        'win32',
        String.raw`C:\Users\a`,
      ),
    ).toBe(String.raw`C:\Users\a\AppData\Local\Cozy Studio`);
    expect(resolveStudioDataRoot({}, 'darwin', '/Users/a')).toBe(
      '/Users/a/Library/Application Support/Cozy Studio',
    );
    expect(resolveStudioDataRoot({ XDG_DATA_HOME: '/data' }, 'linux', '/home/a')).toBe(
      '/data/cozy-studio',
    );
    const imagesDir = path.resolve('/art/cozy');
    expect(resolveDefaultImagesDir({ STUDIO_IMAGES_DIR: imagesDir })).toBe(imagesDir);
    expect(resolveDefaultImagesDir({ HOME: '/Users/a' }, 'darwin')).toBe(
      '/Users/a/Pictures/Cozy Studio',
    );
    expect(resolveStudioDataRoot({ LOCALAPPDATA: '\\AppData' }, 'win32', 'C:\\Users\\a')).toBe(
      'C:\\Users\\a\\AppData\\Local\\Cozy Studio',
    );
    expect(resolveStudioDataRoot({ XDG_DATA_HOME: 'relative' }, 'linux', '/home/a')).toBe(
      '/home/a/.local/share/cozy-studio',
    );
    expect(() =>
      resolveDefaultImagesDir({ STUDIO_IMAGES_DIR: 'C:\\Images' }, 'linux', '/home/a'),
    ).toThrow('absolute path for this operating system');
  });

  it('rejects mutating Setup without consent and does not write', () => {
    const writes: string[] = [];
    expect(() =>
      applyOnboardingSetup(
        { consent: false, libraryPath: 'D:/tmp/studio-lib' },
        {
          writeFile: (filePath) => writes.push(filePath),
          initLibrary: () => writes.push('init'),
        },
      ),
    ).toThrow(OnboardingSetupError);
    expect(writes).toEqual([]);
  });

  it('writes STUDIO_LIBRARY_DIR and initializes the library after consent', () => {
    const files = new Map<string, string>();
    const env: Record<string, string> = {};
    let initialized = 0;

    const result = applyOnboardingSetup(
      {
        consent: true,
        libraryPath: 'D:/tmp/cozy-studio-lib',
        initLibrary: true,
      },
      {
        readEnvLocalPath: () => 'D:/repo/.env.local',
        readFile: (filePath) => files.get(filePath) ?? null,
        writeFile: (filePath, contents) => {
          files.set(filePath, contents);
        },
        setProcessEnv: (key, value) => {
          env[key] = value;
        },
        initLibrary: () => {
          initialized += 1;
        },
        isAbsolutePath: () => true,
      },
    );

    expect(result).toMatchObject({
      ok: true,
      libraryPath: 'D:/tmp/cozy-studio-lib',
      wroteEnv: true,
      initializedLibrary: true,
    });
    expect(files.get('D:/repo/.env.local')).toContain('STUDIO_LIBRARY_DIR=D:/tmp/cozy-studio-lib');
    expect(env.STUDIO_LIBRARY_DIR).toBe('D:/tmp/cozy-studio-lib');
    expect(initialized).toBe(1);
  });

  it('keeps an existing STUDIO_LIBRARY_DIR line when Setup is not asked to change it', () => {
    const next = upsertStudioLibraryDir(
      'STUDIO_LIBRARY_DIR=D:/existing-library\nSTUDIO_SERVER_PORT=17223\n',
      'D:/existing-library',
    );
    expect(next).toContain('STUDIO_LIBRARY_DIR=D:/existing-library');
    expect(next).toContain('STUDIO_SERVER_PORT=17223');
  });

  it('keeps literal paths with comments and variables intact when Bun restarts', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'cozy-bootstrap-path-'));
    const env = { ...process.env };
    delete env.STUDIO_LIBRARY_DIR;
    try {
      for (const libraryPath of [
        String.raw`D:\new\#OUTPUTS\Cozy Studio`,
        '/home/artist/$HOME #pictures',
        String.raw`D:\Jos\u00e9's #pictures\$drafts`,
      ]) {
        const contents = upsertStudioLibraryDir(
          'export STUDIO_LIBRARY_DIR = /old\nSTUDIO_SERVER_PORT=17223\n',
          libraryPath,
        );
        expect(contents.match(/STUDIO_LIBRARY_DIR/g)).toHaveLength(1);
        expect(readStudioLibraryDirFromEnv(contents)).toBe(libraryPath);
        writeFileSync(path.join(root, '.env'), contents);
        const actual = execFileSync(
          'bun',
          ['-e', 'console.log(JSON.stringify(process.env.STUDIO_LIBRARY_DIR))'],
          { cwd: root, env, encoding: 'utf8', timeout: 10_000, windowsHide: true },
        );
        expect(JSON.parse(actual)).toBe(libraryPath);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('requires confirm before writing a OneDrive-like path, then proceeds', () => {
    const writes: string[] = [];
    try {
      applyOnboardingSetup(
        { consent: true, libraryPath: 'C:/Users/a/OneDrive/Codex Studio' },
        {
          writeFile: () => writes.push('env'),
          initLibrary: () => writes.push('init'),
          isAbsolutePath: () => true,
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(OnboardingSetupError);
      expect((error as OnboardingSetupError).status).toBe(409);
      expect((error as OnboardingSetupError).body.code).toBe('cloud_sync_confirm_required');
    }
    expect(writes).toEqual([]);

    const result = applyOnboardingSetup(
      {
        consent: true,
        confirmCloudSync: true,
        libraryPath: 'C:/Users/a/OneDrive/Codex Studio',
      },
      {
        readEnvLocalPath: () => 'D:/repo/.env.local',
        readFile: () => null,
        writeFile: () => writes.push('env'),
        initLibrary: () => writes.push('init'),
        isAbsolutePath: () => true,
        setProcessEnv: () => {},
      },
    );
    expect(result.cloudSyncProvider).toBe('OneDrive');
    expect(writes).toEqual(['env', 'init']);
  });

  it('keeps an existing STUDIO_LIBRARY_DIR when Setup omits a new path', () => {
    const files = new Map<string, string>([
      ['D:/repo/.env.local', 'STUDIO_LIBRARY_DIR=D:/existing-library\n'],
    ]);
    const result = applyOnboardingSetup(
      { consent: true },
      {
        resolveDefaultLibraryPath: () => 'D:/Codex Studio',
        readExistingLibraryDir: () => 'D:/existing-library',
        readEnvLocalPath: () => 'D:/repo/.env.local',
        readFile: (filePath) => files.get(filePath) ?? null,
        writeFile: (filePath, contents) => {
          files.set(filePath, contents);
        },
        setProcessEnv: () => {},
        initLibrary: () => {},
        isAbsolutePath: () => true,
      },
    );
    expect(result.libraryPath).toBe('D:/existing-library');
    expect(files.get('D:/repo/.env.local')).toContain('STUDIO_LIBRARY_DIR=D:/existing-library');
    expect(result.libraryPath).not.toBe('D:/Codex Studio');
  });

  it('does not put provider secrets on the Setup result', () => {
    const result = applyOnboardingSetup(
      { consent: true, libraryPath: 'D:/tmp/cozy-studio-lib', initLibrary: false },
      {
        isAbsolutePath: () => true,
        readExistingLibraryDir: () => null,
      },
    );
    expect(JSON.stringify(result)).not.toMatch(/api[_-]?key/i);
    expect(result).not.toHaveProperty('envContents');
  });

  it('runs bun install only when node_modules is missing', () => {
    const installs: string[] = [];
    const skipped = applyOnboardingSetup(
      { consent: true, initLibrary: false, installDeps: true },
      {
        resolveDefaultLibraryPath: () => 'D:/Codex Studio',
        readExistingLibraryDir: () => null,
        isAbsolutePath: () => true,
        depsNeedInstall: () => false,
        installRepoDeps: (root) => installs.push(root),
      },
    );
    expect(skipped.skippedDepInstall).toBe(true);
    expect(installs).toEqual([]);

    const ran = applyOnboardingSetup(
      { consent: true, initLibrary: false, installDeps: true },
      {
        resolveDefaultLibraryPath: () => 'D:/Codex Studio',
        readExistingLibraryDir: () => null,
        isAbsolutePath: () => true,
        depsNeedInstall: () => true,
        installRepoDeps: (root) => installs.push(root),
        repoRoot: 'D:/repo',
      },
    );
    expect(ran.installedDeps).toBe(true);
    expect(installs).toEqual(['D:/repo']);
  });
});
