import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ONBOARDING_BUN_INSTALL_URL,
  ONBOARDING_CODEX_INSTALL_URL,
  PORTABLE_STUDIO_LIBRARY_FOLDER_NAME,
} from '../packages/shared/src';
import {
  missingBunMessage,
  missingCodexCliMessage,
  parseListeningUrl,
  PORTABLE_LOGIN_DISCLAIMER,
  portableServerArgv,
  portableStudioUrl,
  resolvePortableLibraryDir,
} from './portableLaunch';
import { runPortableStart } from './portable-start';

const repoRoot = path.resolve(import.meta.dirname, '..');
const windowsLauncher = path.join(repoRoot, 'Codex Studio.bat');
const macLauncher = path.join(repoRoot, 'Codex Studio.command');
const portableNote = path.join(repoRoot, 'PORTABLE.txt');

describe('portable launchers', () => {
  it('uses Codex Studio Library beside the unpack root when portable and env is unset', () => {
    expect(
      resolvePortableLibraryDir({
        studioLibraryDir: undefined,
        portable: true,
        unpackRoot: 'D:/unzipped/codex-studio',
        homeDefault: 'C:/Users/a/Codex Studio',
      }),
    ).toBe(path.join('D:/unzipped/codex-studio', PORTABLE_STUDIO_LIBRARY_FOLDER_NAME));
    expect(
      resolvePortableLibraryDir({
        studioLibraryDir: 'E:/custom-library',
        portable: true,
        unpackRoot: 'D:/unzipped/codex-studio',
        homeDefault: 'C:/Users/a/Codex Studio',
      }),
    ).toBe('E:/custom-library');
    expect(
      resolvePortableLibraryDir({
        studioLibraryDir: undefined,
        portable: false,
        unpackRoot: 'D:/unzipped/codex-studio',
        homeDefault: 'C:/Users/a/Codex Studio',
      }),
    ).toBe('C:/Users/a/Codex Studio');
  });

  it('starts local-server in production mode and opens the browser', async () => {
    let opened = '';
    const env: NodeJS.ProcessEnv = { STUDIO_PORTABLE: '1' };
    const started = await runPortableStart({
      env,
      cwd: 'D:/unzipped/codex-studio',
      distReady: () => true,
      waitMs: async () => undefined,
      forwardOutput: () => undefined,
      openBrowser: (url) => {
        opened = url;
      },
      spawnServer: (_argv, options) => {
        expect(_argv).toEqual(portableServerArgv());
        expect(options.env.STUDIO_LIBRARY_DIR).toBe(
          path.join('D:/unzipped/codex-studio', PORTABLE_STUDIO_LIBRARY_FOLDER_NAME),
        );
        return {
          stdout: {
            on(_event: string, callback: (chunk: string) => void) {
              callback('Codex Studio local-server listening on http://127.0.0.1:17229\n');
            },
          },
          stderr: { on() {} },
          exitCode: null,
          once() {},
        } as never;
      },
    });

    expect(started.url).toBe('http://127.0.0.1:17229');
    expect(opened).toBe('http://127.0.0.1:17229');
    expect(parseListeningUrl('ready on http://127.0.0.1:17223 today')).toBe(
      portableStudioUrl(17223),
    );
  });

  it('refuses to start when the production UI dist is missing', async () => {
    await expect(
      runPortableStart({
        env: { STUDIO_PORTABLE: '1' },
        cwd: 'D:/unzipped/codex-studio',
        distReady: () => false,
        spawnServer: () => {
          throw new Error('should not spawn');
        },
      }),
    ).rejects.toThrow(/bun run build/);
  });

  it('keeps missing-runtime copy and the ChatGPT login disclaimer in both launchers', () => {
    const bat = readFileSync(windowsLauncher, 'utf8');
    const command = readFileSync(macLauncher, 'utf8');
    const note = readFileSync(portableNote, 'utf8');
    for (const source of [bat, command]) {
      expect(source).toContain(ONBOARDING_BUN_INSTALL_URL);
      expect(source).toContain(ONBOARDING_CODEX_INSTALL_URL);
      expect(source).toContain('does not bundle ChatGPT login');
      expect(source).toContain('STUDIO_PORTABLE=1');
      expect(source).toContain(PORTABLE_STUDIO_LIBRARY_FOLDER_NAME);
      expect(source).toContain('scripts/portable-start.ts');
      expect(source).toMatch(/STUDIO_PORTABLE_NONINTERACTIVE/);
      expect(source).not.toMatch(/electron/i);
    }
    expect(note).toMatch(/Linux/i);
    expect(note).toMatch(/best-effort/i);
    expect(note).toContain('does not bundle ChatGPT login');
    expect(missingBunMessage()).toContain(ONBOARDING_BUN_INSTALL_URL);
    expect(missingCodexCliMessage()).toContain(ONBOARDING_CODEX_INSTALL_URL);
    expect(PORTABLE_LOGIN_DISCLAIMER).toMatch(/does not bundle ChatGPT login/);
  });
});

describe('Windows portable dry-run', () => {
  it('prints a readable Bun message and pauses when bun is missing from PATH', () => {
    if (process.platform !== 'win32') return;
    const result = spawnSync('cmd.exe', ['/c', `"${windowsLauncher}"`], {
      cwd: repoRoot,
      encoding: 'utf8',
      input: '\n',
      timeout: 20_000,
      windowsVerbatimArguments: true,
      env: {
        ...process.env,
        PATH: 'C:\\Windows\\System32',
        PATHEXT: '.COM;.EXE;.BAT;.CMD',
        STUDIO_PORTABLE_NONINTERACTIVE: '1',
      },
    });
    const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
    expect(result.status).not.toBe(0);
    expect(output).toMatch(/needs Bun/i);
    expect(output).toContain(ONBOARDING_BUN_INSTALL_URL);
    expect(output).toMatch(/does not bundle ChatGPT login/i);
  });
});
