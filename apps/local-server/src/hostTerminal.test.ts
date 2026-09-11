import { describe, expect, it, vi } from 'vitest';
import {
  applyOnboardingHostAction,
  compileVisibleHostSpawn,
  OnboardingHostActionError,
  publicHostCommand,
  resolveHostTerminalLaunch,
} from './hostTerminal';
import { CODEX_STUDIO_SETUP_SKILL_PATH } from '../../../lib/onboardingSetupPrompt';

const setupPrompt = `Use the repo-local skill at \`${CODEX_STUDIO_SETUP_SKILL_PATH}\` to complete Codex Studio setup.`;

describe('host terminal launches', () => {
  it('opens visible codex login in the repo root, not exec or app-server', () => {
    const launch = resolveHostTerminalLaunch({
      action: 'codex_login',
      cwd: 'D:/codex-studio',
    });
    expect(launch).toEqual({
      action: 'codex_login',
      title: 'Codex login',
      cwd: 'D:/codex-studio',
      argv: ['codex', 'login'],
      visible: true,
    });
    expect(launch.argv.join(' ')).not.toContain('exec');
    expect(launch.argv.join(' ')).not.toContain('app-server');
    expect(publicHostCommand('codex_login')).toBe('codex login');
  });

  it('opens visible grok login, never Ask Grok', () => {
    const launch = resolveHostTerminalLaunch({
      action: 'grok_login',
      cwd: 'D:/codex-studio',
    });
    expect(launch.argv).toEqual(['grok', 'login']);
    expect(launch.visible).toBe(true);
    expect(publicHostCommand('grok_login')).toBe('grok login');
    expect(launch.title).not.toMatch(/ask grok/i);
  });

  it('opens visible interactive Codex with the Setup Prompt', () => {
    const launch = resolveHostTerminalLaunch({
      action: 'ask_codex',
      cwd: 'D:/codex-studio',
      prompt: setupPrompt,
    });
    expect(launch.argv[0]).toBe('codex');
    expect(launch.argv[1]).toContain(CODEX_STUDIO_SETUP_SKILL_PATH);
    expect(launch.argv.join(' ')).not.toContain('exec');
    expect(launch.visible).toBe(true);
    expect(launch.cwd).toBe('D:/codex-studio');
  });

  it('compiles a visible Windows cmd or PowerShell window', () => {
    const login = compileVisibleHostSpawn(
      resolveHostTerminalLaunch({ action: 'codex_login', cwd: 'D:/codex-studio' }),
      { platform: 'win32' },
    );
    expect(login.command).toBe('cmd.exe');
    expect(login.args).toContain('start');
    expect(login.args.join(' ')).toContain('codex login');
    expect(login.windowsHide).toBe(false);
    expect(login.detached).toBe(true);

    const files = new Map<string, string>();
    const ask = compileVisibleHostSpawn(
      resolveHostTerminalLaunch({
        action: 'ask_codex',
        cwd: 'D:/codex-studio',
        prompt: setupPrompt,
      }),
      {
        platform: 'win32',
        tmpDir: 'D:/tmp',
        writePromptFile: (filePath, contents) => {
          files.set(filePath, contents);
        },
      },
    );
    expect(ask.args).toContain('start');
    expect(ask.args).toContain('powershell.exe');
    expect(ask.args.join(' ')).not.toContain('codex exec');
    expect([...files.values()].join('\n')).toContain(CODEX_STUDIO_SETUP_SKILL_PATH);
  });
});

describe('applyOnboardingHostAction', () => {
  it('does not spawn without consent', () => {
    const runner = vi.fn();
    expect(() =>
      applyOnboardingHostAction(
        { consent: false, action: 'codex_login' },
        { runner, resolveCwd: () => 'D:/codex-studio' },
      ),
    ).toThrow(OnboardingHostActionError);
    expect(runner).not.toHaveBeenCalled();
  });

  it('spawns after consent and returns the hand-run command on failure', () => {
    const runner = vi.fn();
    expect(
      applyOnboardingHostAction(
        { consent: true, action: 'codex_login' },
        { runner, resolveCwd: () => 'D:/codex-studio', platform: 'win32' },
      ),
    ).toMatchObject({
      ok: true,
      action: 'codex_login',
      command: 'codex login',
      cwd: 'D:/codex-studio',
    });
    expect(runner).toHaveBeenCalledTimes(1);

    const failing = vi.fn(() => {
      throw new Error('spawn failed');
    });
    expect(
      applyOnboardingHostAction(
        { consent: true, action: 'codex_login' },
        { runner: failing, resolveCwd: () => 'D:/codex-studio', platform: 'win32' },
      ),
    ).toMatchObject({
      ok: false,
      command: 'codex login',
      error: expect.stringContaining('codex login'),
    });
  });
});
