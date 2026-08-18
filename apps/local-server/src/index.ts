import { getSettings } from './config';
import { listRecoverableJobs } from './db/jobs';
import { createStudioApp } from './appFactory';
import { log } from './logger';
import { serveWithPortFallback } from './portUtils';
import { beginSignalShutdown, shutdownStudioServer } from './serverShutdown';

export { createStudioApp } from './appFactory';

if (import.meta.main) {
  const studio = await createStudioApp();
  const configuredPort = getSettings().serverPort;
  const hostname = '127.0.0.1';

  const { server, port: boundPort } = serveWithPortFallback({
    hostname,
    port: configuredPort,
    onPortConflict(attemptedPort, nextPort) {
      log('warn', 'server', `Port ${attemptedPort} is in use; attempting next port ${nextPort}...`);
    },
    fetch(req: Request, server: any) {
      if (new URL(req.url).pathname === '/api/events') {
        server.timeout(req, 0);
      }

      return studio.app.fetch(req);
    },
  });

  log(
    'info',
    'server',
    `Local server listening on http://${hostname}:${boundPort}. Library: ${studio.config.libraryDir}`,
  );

  console.log(`Codex Studio local-server listening on http://${hostname}:${boundPort}`);

  let shutdownPromise: Promise<void> | null = null;
  const shutdown = () => {
    if (!shutdownPromise) {
      shutdownPromise = shutdownStudioServer({
        stopHttpServer: () => server.stop(true),
        stopStudio: () => studio.shutdown(),
      });
    }
    return shutdownPromise;
  };

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void beginSignalShutdown({
        shutdown,
        exit: (code) => process.exit(code),
        reportError: (error) => {
          console.error(
            `Codex Studio shutdown failed: ${error instanceof Error ? error.message : String(error)}`,
          );
        },
      });
    });
  }

  const recoverableJobs = listRecoverableJobs();
  for (const job of recoverableJobs) {
    studio.workerController.enqueueJob(job);
  }
  if (recoverableJobs.length > 0) {
    log(
      'info',
      'worker',
      `Recovered ${recoverableJobs.length} queued/running job(s) from the local database.`,
    );
  }
}
