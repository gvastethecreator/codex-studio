type ManagedProcess = {
  child: ReturnType<typeof Bun.spawn>;
  label: string;
};

interface HttpProbeOptions {
  expectedText?: string;
  timeoutMs?: number;
}

export function spawnManagedProcess(label: string, command: string[], env?: Record<string, string | undefined>) {
  const child = Bun.spawn(command, {
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
    env: {
      ...process.env,
      ...(env || {}),
    },
  });

  return { child, label } satisfies ManagedProcess;
}

export async function probeHttp(url: string, options: HttpProbeOptions = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 3_000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok && response.status >= 500) {
      return false;
    }

    if (!options.expectedText) {
      return true;
    }

    const body = await response.text();
    return body.includes(options.expectedText);
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function waitForHttp(url: string, label: string, timeoutMs = 90_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) {
        return;
      }
    } catch {
      // Keep waiting; the process may still be booting.
    }

    await Bun.sleep(500);
  }

  throw new Error(`Timed out waiting for ${label} at ${url}`);
}

export function stopManagedProcesses(processes: ManagedProcess[]) {
  for (const processRef of processes) {
    if (processRef.child.exitCode === null) {
      processRef.child.kill();
    }
  }
}

export function installShutdownHandlers(processes: ManagedProcess[]) {
  const shutdown = () => stopManagedProcesses(processes);

  process.on('SIGINT', () => {
    shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    shutdown();
    process.exit(0);
  });

  return shutdown;
}

export async function waitForFirstProcessExit(processes: ManagedProcess[]) {
  return Promise.race(
    processes.map(async (processRef) => ({
      code: await processRef.child.exited,
      label: processRef.label,
    })),
  );
}