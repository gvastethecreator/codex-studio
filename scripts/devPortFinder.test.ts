import { describe, expect, it } from 'vite-plus/test';
import { findAvailablePort, isPortAvailable, probeHttpHealth, probeUrl } from './devPortFinder';
import http from 'node:http';

describe('devPortFinder', () => {
  it('finds an open port starting from a given base port', async () => {
    const port = await findAvailablePort(29100);
    expect(port).toBeGreaterThanOrEqual(29100);
    expect(await isPortAvailable(port)).toBe(true);
  });

  it('probeHttpHealth returns true for a server returning { ok: true } and false otherwise', async () => {
    const port = await findAvailablePort(29200);
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });

    await new Promise<void>((resolve) => server.listen(port, '127.0.0.1', () => resolve()));

    try {
      const isHealthy = await probeHttpHealth(`http://127.0.0.1:${port}`);
      expect(isHealthy).toBe(true);

      const isUnreachable = await probeHttpHealth(`http://127.0.0.1:${port + 1}`, 300);
      expect(isUnreachable).toBe(false);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('probeUrl returns true for any successful HTTP status', async () => {
    const port = await findAvailablePort(29300);
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Codex Studio</h1>');
    });

    await new Promise<void>((resolve) => server.listen(port, '127.0.0.1', () => resolve()));

    try {
      const isUp = await probeUrl(`http://127.0.0.1:${port}`);
      expect(isUp).toBe(true);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
