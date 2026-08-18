import net from 'node:net';

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

export async function probeHttpHealth(url: string, timeoutMs = 2_000): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return false;
    const json = (await response.json()) as { ok?: boolean };
    return json?.ok === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function probeUrl(url: string, timeoutMs = 2_000): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.ok || response.status < 500;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
