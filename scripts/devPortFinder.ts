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
  excludedPorts: readonly number[] = [],
): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (excludedPorts.includes(port)) continue;
    if (await isPortAvailable(port, hostname)) {
      return port;
    }
  }

  throw new Error(
    `No available port found between ${startPort} and ${startPort + maxAttempts - 1} on ${hostname}.`,
  );
}

/** Windows may report a wrapper exit before its children release their sockets. */
export async function waitForPortRelease(ports: readonly number[]) {
  const deadline = Date.now() + 10_000;
  while (true) {
    const available = await Promise.all(
      ports.map(
        async (port) => (await isPortAvailable(port)) && (await isPortAvailable(port, '0.0.0.0')),
      ),
    );
    if (available.every(Boolean)) return;
    if (Date.now() >= deadline) {
      throw new Error(
        `Studio could not release ports ${ports.filter((_, index) => !available[index]).join(', ')}. Close the remaining Studio processes before restarting.`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
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
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { Connection: 'close' },
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/** A new backend instance is published only after the renderer can accept a reload. */
export async function waitForRendererReady(
  url: string,
  child: { readonly exitCode: number | null },
) {
  function assertRunning() {
    const exitCode = child.exitCode;
    if (exitCode !== null)
      throw new Error(`Studio UI exited before becoming ready (code ${exitCode}).`);
  }
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    assertRunning();
    const ready = await probeUrl(url, Math.max(1, Math.min(2_000, deadline - Date.now())));
    assertRunning();
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Studio UI did not become ready at ${url}. Check the renderer output.`);
}
