import { describe, expect, it, vi } from 'vite-plus/test';
import { findAvailablePort, isPortAvailable, serveWithPortFallback } from './portUtils';
import net from 'node:net';

describe('portUtils', () => {
  describe('isPortAvailable', () => {
    it('returns true when a port is not in use', async () => {
      const port = await findAvailablePort(28100);
      const available = await isPortAvailable(port);
      expect(available).toBe(true);
    });

    it('returns false when a port is occupied by a TCP server', async () => {
      const server = net.createServer();
      const port = await findAvailablePort(28200);

      await new Promise<void>((resolve) => {
        server.listen({ port, host: '127.0.0.1' }, () => resolve());
      });

      try {
        const available = await isPortAvailable(port);
        expect(available).toBe(false);
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  });

  describe('findAvailablePort', () => {
    it('finds an open port starting from a base port', async () => {
      const port = await findAvailablePort(28300);
      expect(port).toBeGreaterThanOrEqual(28300);
    });
  });

  describe('serveWithPortFallback', () => {
    it('uses injected serveFn and binds to the initial port when available', () => {
      const mockServer = { port: 17223, stop: vi.fn() };
      const serveFn = vi.fn(() => mockServer);

      const result = serveWithPortFallback({
        port: 17223,
        serveFn: serveFn as any,
        fetch: vi.fn() as any,
      });

      expect(result.port).toBe(17223);
      expect(result.server).toBe(mockServer);
      expect(serveFn).toHaveBeenCalledWith(expect.objectContaining({ port: 17223 }));
    });

    it('automatically increments and retries when EADDRINUSE is thrown', () => {
      const mockServer = { port: 17225, stop: vi.fn() };
      const conflicts: { from: number; to: number }[] = [];

      let calls = 0;
      const serveFn = vi.fn((opts: { port: number }) => {
        calls++;
        if (opts.port === 17223 || opts.port === 17224) {
          const err = new Error('address in use') as any;
          err.code = 'EADDRINUSE';
          throw err;
        }
        return mockServer;
      });

      const result = serveWithPortFallback({
        port: 17223,
        serveFn: serveFn as any,
        onPortConflict(from, to) {
          conflicts.push({ from, to });
        },
        fetch: vi.fn() as any,
      });

      expect(result.port).toBe(17225);
      expect(calls).toBe(3);
      expect(conflicts).toEqual([
        { from: 17223, to: 17224 },
        { from: 17224, to: 17225 },
      ]);
    });
  });
});
