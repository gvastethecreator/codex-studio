import { spawnSync } from 'node:child_process';

interface OwnedProcessHandle {
  pid?: number | null;
  kill(): unknown;
}

export type OwnedProcessTermination = 'tree' | 'process';

function defaultKillWindowsProcessTree(pid: number) {
  return (
    spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    }).status === 0
  );
}

export function terminateOwnedProcessTree(
  processHandle: OwnedProcessHandle,
  {
    platform = process.platform,
    killWindowsProcessTree = defaultKillWindowsProcessTree,
  }: {
    platform?: NodeJS.Platform;
    killWindowsProcessTree?: (pid: number) => boolean;
  } = {},
): OwnedProcessTermination {
  if (
    platform === 'win32' &&
    typeof processHandle.pid === 'number' &&
    killWindowsProcessTree(processHandle.pid)
  ) {
    return 'tree';
  }

  processHandle.kill();
  return 'process';
}
