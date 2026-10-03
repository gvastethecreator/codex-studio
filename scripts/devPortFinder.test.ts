import { describe, expect, it } from 'vitest';
import {
  findAvailablePort,
  isPortAvailable,
  probeHttpHealth,
  probeUrl,
  waitForPortRelease,
  waitForRendererReady,
} from './devPortFinder';
import http from 'node:http';

describe('devPortFinder', () => {
  it('finds an open port starting from a given base port', async () => {
    const port = await findAvailablePort(29100);
    expect(port).toBeGreaterThanOrEqual(29100);
    expect(await isPortAvailable(port)).toBe(true);
    const backendPort = await findAvailablePort(port, 50, '127.0.0.1', [port]);
    expect(backendPort).toBeGreaterThan(port);
    expect(await isPortAvailable(backendPort)).toBe(true);
    const server = http.createServer();
    await new Promise<void>((resolve) => server.listen(port, '127.0.0.1', resolve));
    let released = false;
    const waiting = waitForPortRelease([port]).then(() => {
      released = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(released).toBe(false);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await waiting;
    expect(released).toBe(true);
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

  it('waits for successful renderer responses and rejects a renderer that exits', async () => {
    const port = await findAvailablePort(29300);
    let ready = false;
    const methods: string[] = [];
    let notifyRequest: () => void = () => {};
    const requested = new Promise<void>((resolve) => {
      notifyRequest = resolve;
    });
    const server = http.createServer((req, res) => {
      methods.push(req.method!);
      res.writeHead(ready ? 200 : 503, { 'Content-Type': 'text/html' });
      res.end('<h1>Codex Studio</h1>');
      notifyRequest();
    });

    await new Promise<void>((resolve) => server.listen(port, '127.0.0.1', () => resolve()));

    try {
      const url = `http://127.0.0.1:${port}`;
      let connected = false;
      const waiting = waitForRendererReady(url, { exitCode: null }).then(() => {
        connected = true;
      });
      await requested;
      expect(connected).toBe(false);
      ready = true;
      await waiting;
      expect(connected).toBe(true);
      expect(await probeUrl(url)).toBe(true);
      expect(methods.every((method) => method === 'HEAD')).toBe(true);
      await expect(waitForRendererReady(url, { exitCode: 1 })).rejects.toThrow('UI exited');
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
