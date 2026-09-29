import { describe, expect, it } from 'vitest';
import path from 'node:path';
import {
  applyOnboardingSetup,
  OnboardingSetupError,
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
    expect(path.basename(resolveDefaultImagesDir({}))).toBe('Cozy Studio');
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
        libraryPath: 'D:/tmp/codex-studio-lib',
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
      libraryPath: 'D:/tmp/codex-studio-lib',
      wroteEnv: true,
      initializedLibrary: true,
    });
    expect(files.get('D:/repo/.env.local')).toContain('STUDIO_LIBRARY_DIR=D:/tmp/codex-studio-lib');
    expect(env.STUDIO_LIBRARY_DIR).toBe('D:/tmp/codex-studio-lib');
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
      { consent: true, libraryPath: 'D:/tmp/codex-studio-lib', initLibrary: false },
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
