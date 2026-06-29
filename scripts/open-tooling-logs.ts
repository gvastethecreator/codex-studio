import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

export interface OpenCommand {
  command: string;
  args: string[];
}

export function resolveToolingLogDir(rootDir = process.cwd()) {
  return path.resolve(rootDir, 'logs', 'tooling');
}

export function resolveOpenCommand(
  targetPath: string,
  platform: NodeJS.Platform = process.platform,
): OpenCommand {
  if (platform === 'win32') {
    return {
      command: 'cmd.exe',
      args: ['/d', '/s', '/c', 'start', '', targetPath],
    };
  }

  if (platform === 'darwin') {
    return { command: 'open', args: [targetPath] };
  }

  return { command: 'xdg-open', args: [targetPath] };
}

export async function openToolingLogs({
  rootDir = process.cwd(),
  platform = process.platform,
  printOnly = false,
}: {
  rootDir?: string;
  platform?: NodeJS.Platform;
  printOnly?: boolean;
} = {}) {
  const logDir = resolveToolingLogDir(rootDir);
  mkdirSync(logDir, { recursive: true });

  if (printOnly) {
    console.log(logDir);
    return;
  }

  const { command, args } = resolveOpenCommand(logDir, platform);
  const child = spawn(command, args, {
    cwd: rootDir,
    detached: true,
    stdio: 'ignore',
    shell: false,
  });
  child.unref();
}

if (import.meta.main) {
  await openToolingLogs({ printOnly: process.argv.includes('--print') });
}
