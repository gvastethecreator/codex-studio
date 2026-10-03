import { describe, expect, it } from 'vitest';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import net from 'node:net';
import os from 'node:os';

describe('development launcher', () => {
  it('rejects an occupied UI port without stopping its existing server', async () => {
    const existingServer = spawn(
      process.execPath,
      [
        '-e',
        "const net=require('node:net'); const server=net.createServer(socket=>socket.end()); server.listen(0,'127.0.0.1',()=>console.log(server.address().port)); process.stdin.once('data',()=>server.close(()=>process.exit(0)));",
      ],
      { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true },
    );
    try {
      const [output] = await once(existingServer.stdout!, 'data');
      const port = Number(String(output).trim());
      let error: { status?: number; stderr?: string } | undefined;
      try {
        execFileSync('bun', ['scripts/dev.ts'], {
          cwd: path.resolve(import.meta.dirname, '..'),
          env: {
            ...process.env,
            STUDIO_UI_PORT: String(port),
            STUDIO_SERVER_PORT: String(port),
            STUDIO_LIBRARY_DIR: path.join(os.tmpdir(), `cozy-dev-port-${process.pid}-${port}`),
            STUDIO_IMAGES_DIR: path.join(os.tmpdir(), `cozy-dev-images-${process.pid}-${port}`),
          },
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
          timeout: 3000,
        });
      } catch (caught) {
        error = caught as typeof error;
      }
      expect(error?.status).toBe(1);
      expect(error?.stderr).toContain(`Studio UI port ${port} is already in use`);
      const connected = await new Promise<boolean>((resolve) => {
        const socket = net.connect(port, '127.0.0.1');
        socket.once('connect', () => {
          socket.destroy();
          resolve(true);
        });
        socket.once('error', () => resolve(false));
      });
      expect(connected).toBe(true);
    } finally {
      existingServer.kill();
    }
  });
});
