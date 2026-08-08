import { getSettings } from './config';
import { listRecoverableJobs } from './db/jobs';
import { createStudioApp } from './appFactory';
import { log } from './logger';
import { beginSignalShutdown, shutdownStudioServer } from './serverShutdown';

export { createStudioApp } from './appFactory';

if (import.meta.main) {
  const studio = await createStudioApp();
  const port = getSettings().serverPort;
  const hostname = '127.0.0.1';

  log(
    'info',
    'server',
    `Local server starting on http://${hostname}:${port}. Library: ${studio.config.libraryDir}`,
  );

  const server = Bun.serve({
    hostname,
    port,
    fetch(req, server) {
      if (new URL(req.url).pathname === '/api/events') {
        server.timeout(req, 0);
      }

      return studio.app.fetch(req);
    },
  });

  console.log(`Codex Studio local-server listening on http://${hostname}:${port}`);

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
