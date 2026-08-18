import { spawnSync } from 'node:child_process';

export interface ProcessCleanupOptions {
  ports?: number[];
  platform?: NodeJS.Platform;
  killWindowsProcessTree?: (pid: number) => boolean;
  killUnixProcess?: (pid: number) => boolean;
}

export function parseNetstatPids(stdout: string, port: number, currentPid = process.pid): number[] {
  const lines = stdout.split(/\r?\n/);
  const pids = new Set<number>();
  const portPattern = new RegExp(`[:.]${port}\\s+.*(?:LISTENING|LISTEN)`, 'i');

  for (const line of lines) {
    if (portPattern.test(line)) {
      const parts = line.trim().split(/\s+/);
      const lastPart = parts[parts.length - 1];
      const pid = Number.parseInt(lastPart, 10);
      if (Number.isFinite(pid) && pid > 0 && pid !== currentPid) {
        pids.add(pid);
      }
    }
  }

  return Array.from(pids);
}

export function parseLsofPids(stdout: string, currentPid = process.pid): number[] {
  const lines = stdout.trim().split(/\r?\n/);
  const pids = new Set<number>();

  for (const line of lines) {
    const pid = Number.parseInt(line.trim(), 10);
    if (Number.isFinite(pid) && pid > 0 && pid !== currentPid) {
      pids.add(pid);
    }
  }

  return Array.from(pids);
}

export function findPidsOnPortWindows(port: number, currentPid = process.pid): number[] {
  try {
    const result = spawnSync('netstat', ['-ano', '-p', 'tcp'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    if (result.status !== 0 || !result.stdout) return [];
    return parseNetstatPids(result.stdout, port, currentPid);
  } catch {
    return [];
  }
}

export function findPidsOnPortUnix(port: number, currentPid = process.pid): number[] {
  try {
    const result = spawnSync('lsof', ['-ti', `:${port}`, '-sTCP:LISTEN'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    if (result.status !== 0 || !result.stdout) return [];
    return parseLsofPids(result.stdout, currentPid);
  } catch {
    return [];
  }
}

export function terminatePid(
  pid: number,
  platform = process.platform,
  killTreeFn?: (pid: number) => boolean,
): boolean {
  if (pid === process.pid || pid <= 0) return false;

  try {
    if (platform === 'win32') {
      if (killTreeFn) return killTreeFn(pid);
      const res = spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      });
      return res.status === 0;
    }

    process.kill(pid, 'SIGKILL');
    return true;
  } catch {
    return false;
  }
}

export async function cleanupExistingDevProcesses(
  options: ProcessCleanupOptions = {},
): Promise<number[]> {
  const platform = options.platform ?? process.platform;
  const ports = options.ports ?? [17222, 17223];
  const terminatedPids: number[] = [];

  for (const port of ports) {
    const pids = platform === 'win32' ? findPidsOnPortWindows(port) : findPidsOnPortUnix(port);

    for (const pid of pids) {
      if (!terminatedPids.includes(pid)) {
        if (terminatePid(pid, platform, options.killWindowsProcessTree)) {
          terminatedPids.push(pid);
        }
      }
    }
  }

  if (terminatedPids.length > 0) {
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  return terminatedPids;
}
