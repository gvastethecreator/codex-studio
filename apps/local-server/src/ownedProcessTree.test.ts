import { describe, expect, it, vi } from 'vite-plus/test';

import { terminateOwnedProcessTree } from './ownedProcessTree';

describe('owned process tree termination', () => {
  it('kills the whole Windows wrapper tree when taskkill succeeds', () => {
    const kill = vi.fn();
    const killWindowsProcessTree = vi.fn(() => true);

    expect(
      terminateOwnedProcessTree({ pid: 4321, kill }, { platform: 'win32', killWindowsProcessTree }),
    ).toBe('tree');
    expect(killWindowsProcessTree).toHaveBeenCalledWith(4321);
    expect(kill).not.toHaveBeenCalled();
  });

  it('falls back to the direct handle outside Windows or when tree kill fails', () => {
    const windowsKill = vi.fn();
    const killWindowsProcessTree = vi.fn(() => false);
    const posixKill = vi.fn();

    expect(
      terminateOwnedProcessTree(
        { pid: 4321, kill: windowsKill },
        { platform: 'win32', killWindowsProcessTree },
      ),
    ).toBe('process');
    expect(windowsKill).toHaveBeenCalledOnce();

    expect(
      terminateOwnedProcessTree(
        { pid: 9876, kill: posixKill },
        { platform: 'linux', killWindowsProcessTree },
      ),
    ).toBe('process');
    expect(posixKill).toHaveBeenCalledOnce();
  });
});
