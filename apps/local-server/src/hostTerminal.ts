import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  isOnboardingHostActionId,
  parseOnboardingHostActionRequest,
  type OnboardingHostActionErrorBody,
  type OnboardingHostActionId,
  type OnboardingHostActionResult,
  type OnboardingProgressEvent,
} from '../../../packages/shared/src';

export class OnboardingHostActionError extends Error {
  readonly status: 400;
  readonly body: OnboardingHostActionErrorBody;

  constructor(body: OnboardingHostActionErrorBody) {
    super(body.error);
    this.name = 'OnboardingHostActionError';
    this.status = 400;
    this.body = body;
  }
}

export interface HostTerminalLaunch {
  action: OnboardingHostActionId;
  title: string;
  cwd: string;
  argv: string[];
  visible: true;
}

export interface HostTerminalSpawnRequest {
  command: string;
  args: string[];
  cwd: string;
  detached: true;
  windowsHide: false;
}

export type HostTerminalRunner = (request: HostTerminalSpawnRequest) => void;

export function publicHostCommand(action: OnboardingHostActionId) {
  if (action === 'codex_login') return 'codex login';
  if (action === 'grok_login') return 'grok login';
  return 'codex';
}

export function resolveHostTerminalLaunch(input: {
  action: OnboardingHostActionId;
  cwd: string;
  prompt?: string | null;
}): HostTerminalLaunch {
  if (input.action === 'codex_login') {
    return {
      action: 'codex_login',
      title: 'Codex login',
      cwd: input.cwd,
      argv: ['codex', 'login'],
      visible: true,
    };
  }
  if (input.action === 'grok_login') {
    return {
      action: 'grok_login',
      title: 'Grok login',
      cwd: input.cwd,
      argv: ['grok', 'login'],
      visible: true,
    };
  }
  const prompt = input.prompt?.trim() ?? '';
  return {
    action: 'ask_codex',
    title: 'Ask Codex',
    cwd: input.cwd,
    argv: prompt ? ['codex', prompt] : ['codex'],
    visible: true,
  };
}

function quotePowerShellSingle(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function quoteSh(value: string) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function writeAskCodexPromptFile(
  prompt: string,
  writePromptFile: (filePath: string, contents: string) => void,
  tmpDir: string,
) {
  const promptPath = path.join(tmpDir, 'codex-studio-ask-codex.txt');
  writePromptFile(promptPath, prompt);
  return promptPath;
}

export function compileVisibleHostSpawn(
  launch: HostTerminalLaunch,
  options: {
    platform?: NodeJS.Platform;
    writePromptFile?: (filePath: string, contents: string) => void;
    tmpDir?: string;
  } = {},
): HostTerminalSpawnRequest {
  const platform = options.platform ?? process.platform;
  const writePromptFile = options.writePromptFile ?? writeFileSync;
  const tmpDir = options.tmpDir ?? os.tmpdir();
  const prompt = launch.action === 'ask_codex' ? launch.argv.slice(1).join('\n') : '';

  if (platform === 'win32') {
    if (prompt) {
      const promptPath = writeAskCodexPromptFile(prompt, writePromptFile, tmpDir);
      const command = [
        `Set-Location -LiteralPath ${quotePowerShellSingle(launch.cwd)};`,
        `$prompt = Get-Content -Raw -LiteralPath ${quotePowerShellSingle(promptPath)};`,
        '& codex $prompt',
      ].join(' ');
      return {
        command: 'cmd.exe',
        args: ['/c', 'start', launch.title, 'powershell.exe', '-NoExit', '-Command', command],
        cwd: launch.cwd,
        detached: true,
        windowsHide: false,
      };
    }
    return {
      command: 'cmd.exe',
      args: ['/c', 'start', launch.title, '/D', launch.cwd, 'cmd.exe', '/k', launch.argv.join(' ')],
      cwd: launch.cwd,
      detached: true,
      windowsHide: false,
    };
  }

  const inner = prompt
    ? `cd ${quoteSh(launch.cwd)} && prompt=$(cat ${quoteSh(writeAskCodexPromptFile(prompt, writePromptFile, tmpDir))}) && exec codex "$prompt"`
    : `cd ${quoteSh(launch.cwd)} && exec ${launch.argv.map(quoteSh).join(' ')}`;

  if (platform === 'darwin') {
    return {
      command: 'osascript',
      args: ['-e', `tell application "Terminal" to do script ${quoteSh(inner)}`],
      cwd: launch.cwd,
      detached: true,
      windowsHide: false,
    };
  }

  return {
    command: 'x-terminal-emulator',
    args: ['-e', 'bash', '-lc', inner],
    cwd: launch.cwd,
    detached: true,
    windowsHide: false,
  };
}

export function defaultHostTerminalRunner(request: HostTerminalSpawnRequest) {
  const child = spawn(request.command, request.args, {
    cwd: request.cwd,
    detached: true,
    stdio: 'ignore',
    windowsHide: request.windowsHide,
  });
  child.unref();
}

export interface OnboardingHostActionDependencies {
  resolveCwd?: () => string;
  runner?: HostTerminalRunner;
  platform?: NodeJS.Platform;
  writePromptFile?: (filePath: string, contents: string) => void;
  tmpDir?: string;
  report?: (event: OnboardingProgressEvent) => void;
}

export function applyOnboardingHostAction(
  rawRequest: unknown,
  dependencies: OnboardingHostActionDependencies = {},
): OnboardingHostActionResult {
  const request = parseOnboardingHostActionRequest(rawRequest);
  if (!request.consent) {
    throw new OnboardingHostActionError({
      error: 'Opening a visible Codex terminal requires explicit consent.',
      code: 'consent_required',
    });
  }
  if (!isOnboardingHostActionId(request.action)) {
    throw new OnboardingHostActionError({
      error: 'Unknown host action.',
      code: 'invalid_host_action',
    });
  }
  if (request.action === 'ask_codex' && !request.prompt) {
    throw new OnboardingHostActionError({
      error: 'Ask Codex needs the Setup Prompt.',
      code: 'missing_setup_prompt',
    });
  }

  const cwd = dependencies.resolveCwd?.() ?? process.cwd();
  const launch = resolveHostTerminalLaunch({
    action: request.action,
    cwd,
    prompt: request.prompt,
  });
  const command = publicHostCommand(launch.action);
  dependencies.report?.({
    kind: 'stage',
    stage: 'spawn_host',
    message: `Opening a visible terminal for ${command}.`,
  });
  try {
    const spawnRequest = compileVisibleHostSpawn(launch, {
      platform: dependencies.platform,
      writePromptFile: dependencies.writePromptFile,
      tmpDir: dependencies.tmpDir,
    });
    (dependencies.runner ?? defaultHostTerminalRunner)(spawnRequest);
    dependencies.report?.({ kind: 'log', message: `Opened: ${command}` });
    return { ok: true, action: launch.action, command, cwd, error: null };
  } catch {
    dependencies.report?.({
      kind: 'log',
      message: `Could not open a visible terminal. Run this in the repo root: ${command}`,
      level: 'error',
    });
    return {
      ok: false,
      action: launch.action,
      command,
      cwd,
      error: `Could not open a visible terminal. Run this in the repo root: ${command}`,
    };
  }
}
