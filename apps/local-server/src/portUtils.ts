import net from 'node:net';
import type { Server } from 'bun';

export interface ServeWithPortFallbackOptions {
  hostname?: string;
  port?: number;
  maxPortAttempts?: number;
  serveFn?: (options: any) => Server<any>;
  onPortConflict?: (attemptedPort: number, nextPort: number) => void;
  fetch: (req: Request, server: any) => Response | Promise<Response>;
}

/**
 * Checks if a TCP port is currently available on the given host.
 */
export function isPortAvailable(port: number, hostname = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();

    server.once('error', () => {
      resolve(false);
    });

    server.listen({ port, host: hostname }, () => {
      server.close(() => {
        resolve(true);
      });
    });
  });
}

/**
 * Finds the first available TCP port starting from startPort up to maxAttempts.
 */
export async function findAvailablePort(
  startPort = 17223,
  maxAttempts = 50,
  hostname = '127.0.0.1',
): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port, hostname)) {
      return port;
    }
  }

  throw new Error(
    `No available port found between ${startPort} and ${startPort + maxAttempts - 1} on ${hostname}.`,
  );
}

/**
 * Attempts to start a Bun HTTP server on the requested port, falling back to
 * subsequent available ports if the port is already in use (EADDRINUSE).
 */
export function serveWithPortFallback(options: ServeWithPortFallbackOptions): {
  server: Server<any>;
  port: number;
} {
  const initialPort = options.port ?? 17223;
  const maxAttempts = options.maxPortAttempts ?? 30;
  const serve = options.serveFn ?? (typeof Bun !== 'undefined' ? Bun.serve : undefined);

  if (!serve) {
    throw new Error('Bun.serve is not available in the current environment.');
  }

  let currentPort = initialPort;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const server = serve({
        ...options,
        port: currentPort,
      });

      return {
        server,
        port: currentPort,
      };
    } catch (error: unknown) {
      const isAddrInUse =
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: string }).code === 'EADDRINUSE';

      if (isAddrInUse && attempt < maxAttempts - 1) {
        const nextPort = currentPort + 1;
        options.onPortConflict?.(currentPort, nextPort);
        currentPort = nextPort;
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    `Failed to bind server after ${maxAttempts} attempts starting from port ${initialPort}.`,
  );
}
