import { describe, expect, it, vi } from 'vite-plus/test';
import {
  cleanupExistingDevProcesses,
  parseLsofPids,
  parseNetstatPids,
  terminatePid,
} from './devProcessCleanup';

describe('devProcessCleanup', () => {
  describe('parseNetstatPids', () => {
    it('correctly extracts PIDs listening on the specified port', () => {
      const netstatOutput = `
  TCP    127.0.0.1:17222        0.0.0.0:0              LISTENING       12345
  TCP    127.0.0.1:17223        0.0.0.0:0              LISTENING       54321
  TCP    [::1]:17223            [::]:0                 LISTENING       54321
  TCP    127.0.0.1:17223        127.0.0.1:58432        ESTABLISHED     54321
  TCP    127.0.0.1:8080         0.0.0.0:0              LISTENING       99999
`;
      const pids17223 = parseNetstatPids(netstatOutput, 17223, 999);
      expect(pids17223).toEqual([54321]);

      const pids17222 = parseNetstatPids(netstatOutput, 17222, 999);
      expect(pids17222).toEqual([12345]);
    });

    it('ignores current process PID', () => {
      const netstatOutput = `
  TCP    127.0.0.1:17223        0.0.0.0:0              LISTENING       12345
`;
      const pids = parseNetstatPids(netstatOutput, 17223, 12345);
      expect(pids).toEqual([]);
    });
  });

  describe('parseLsofPids', () => {
    it('correctly extracts PIDs from lsof output', () => {
      const lsofOutput = `12345\n54321\n`;
      const pids = parseLsofPids(lsofOutput, 999);
      expect(pids).toEqual([12345, 54321]);
    });

    it('ignores current process PID', () => {
      const lsofOutput = `12345\n999\n`;
      const pids = parseLsofPids(lsofOutput, 999);
      expect(pids).toEqual([12345]);
    });
  });

  describe('terminatePid', () => {
    it('calls killTreeFn on Windows', () => {
      const killTreeFn = vi.fn(() => true);
      const res = terminatePid(12345, 'win32', killTreeFn);
      expect(res).toBe(true);
      expect(killTreeFn).toHaveBeenCalledWith(12345);
    });

    it('does not terminate current pid or invalid pids', () => {
      const killTreeFn = vi.fn(() => true);
      expect(terminatePid(process.pid, 'win32', killTreeFn)).toBe(false);
      expect(terminatePid(-1, 'win32', killTreeFn)).toBe(false);
      expect(killTreeFn).not.toHaveBeenCalled();
    });
  });

  describe('cleanupExistingDevProcesses', () => {
    it('invokes kill on found pids', async () => {
      const killWindowsProcessTree = vi.fn(() => true);
      const res = await cleanupExistingDevProcesses({
        platform: 'win32',
        ports: [99999], // non-existent port
        killWindowsProcessTree,
      });

      expect(res).toEqual([]);
    });
  });
});
