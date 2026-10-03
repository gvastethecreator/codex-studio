import { getSettings } from './config';
import { listRecoverableJobs } from './db/jobs';
import { createStudioApp } from './appFactory';
import { providerDispatchHeld, scheduleRecoverableJobs } from './providerDispatchHold';
import { log } from './logger';
import { serveWithPortFallback } from './portUtils';
import { beginSignalShutdown, shutdownStudioServer } from './serverShutdown';
import { STUDIO_RESTART_EXIT_CODE } from '../../../packages/shared/src/repositoryUpdates';

export { createStudioApp } from './appFactory';

if (import.meta.main) {
  const studio = await createStudioApp({
    restart:
      process.env.STUDIO_MANAGED_RESTART === '1'
        ? () => {
            void beginSignalShutdown({
              shutdown,
              exit: (code) => process.exit(code === 0 ? STUDIO_RESTART_EXIT_CODE : code),
              reportError: (error) => console.error('Studio restart failed:', error),
            });
          }
        : undefined,
  });
  const configuredPort = getSettings().serverPort;
  const hostname = '127.0.0.1';

  const { server, port: boundPort } = serveWithPortFallback({
    hostname,
    port: configuredPort,
    onPortConflict(attemptedPort, nextPort) {
      if (process.env.STUDIO_MANAGED_RESTART === '1') {
        throw new Error(
          `Studio backend port ${attemptedPort} is already in use. Close the conflicting server and restart Studio. The managed launcher must keep its configured API port.`,
        );
      }
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

  console.log(`Cozy Studio local-server listening on http://${hostname}:${boundPort}`);

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
            `Cozy Studio shutdown failed: ${error instanceof Error ? error.message : String(error)}`,
          );
        },
      });
    });
  }

  const recoverableJobs = listRecoverableJobs();
  // Runs repair from durable job state before any recovered job can settle.
  await studio.reconcileWorkflowRuns(recoverableJobs);
  const recovery = scheduleRecoverableJobs(
    recoverableJobs,
    (job) => studio.workerController.enqueueJob(job),
    providerDispatchHeld(),
  );
  if (recovery.held > 0) {
    log(
      'info',
      'worker',
      `Provider dispatch is held. Left ${recovery.held} queued/running job(s) unscheduled.`,
    );
  } else if (recovery.scheduled > 0) {
    log(
      'info',
      'worker',
      `Recovered ${recovery.scheduled} queued/running job(s) from the local database.`,
    );
  }
}
