import { describe, expect, it } from 'vite-plus/test';
import { stopDevProcesses, waitForFirstDevProcessExit } from './devProcessPolicy';

describe('development process exit policy', () => {
  it('preserves the first child exit code and stops every sibling', async () => {
    const killed: string[] = [];
    const firstExitCode = await waitForFirstDevProcessExit([
      { exited: Promise.resolve(7), kill: () => killed.push('server') },
      { exited: new Promise<number>(() => {}), kill: () => killed.push('ui') },
    ]);

    expect(firstExitCode).toBe(7);
    expect(killed).toEqual(['server', 'ui']);
  });

  it('kills Windows process trees so command wrappers cannot orphan their children', () => {
    const killedDirectly: number[] = [];
    const killedTrees: number[] = [];
    const processes = [
      { pid: 101, exited: Promise.resolve(0), kill: () => killedDirectly.push(101) },
      { pid: 202, exited: Promise.resolve(0), kill: () => killedDirectly.push(202) },
    ];

    stopDevProcesses(processes, {
      platform: 'win32',
      killProcessTree: (pid) => {
        killedTrees.push(pid);
        return pid === 202;
      },
    });

    expect(killedTrees).toEqual([101, 202]);
    expect(killedDirectly).toEqual([101]);
  });
});
