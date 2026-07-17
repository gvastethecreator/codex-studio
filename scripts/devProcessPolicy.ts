export interface DevChildProcess {
  exited: Promise<number>;
  pid?: number;
  kill(): void;
}

interface DevProcessStopOptions {
  platform?: NodeJS.Platform;
  killProcessTree?: (pid: number) => boolean;
}

export function stopDevProcesses(
  processes: readonly DevChildProcess[],
  { platform = process.platform, killProcessTree }: DevProcessStopOptions = {},
) {
  for (const child of processes) {
    try {
      if (platform === 'win32' && child.pid && killProcessTree?.(child.pid)) continue;
      child.kill();
    } catch {
      // A sibling may already have exited between the race and shutdown.
    }
  }
}

export async function waitForFirstDevProcessExit(
  processes: readonly DevChildProcess[],
  stopOptions?: DevProcessStopOptions,
) {
  const exitCode = await Promise.race(processes.map((child) => child.exited));
  stopDevProcesses(processes, stopOptions);
  return exitCode;
}
