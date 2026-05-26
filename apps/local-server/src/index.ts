import { getSettings } from './config';
import { listRecoverableJobs } from './db';
import { createStudioApp } from './appFactory';
import { log } from './logger';
import { enqueueJob } from './worker';

export { createStudioApp } from './appFactory';

if (import.meta.main) {
  const studio = await createStudioApp();
  const port = getSettings().serverPort;

  log(
    'info',
    'server',
    `Local server starting on http://localhost:${port}. Library: ${studio.config.libraryDir}`,
  );

  Bun.serve({
    port,
    fetch(req, server) {
      if (new URL(req.url).pathname === '/api/events') {
        server.timeout(req, 0);
      }

      return studio.app.fetch(req);
    },
  });

  console.log(`Codex Studio local-server listening on http://localhost:${port}`);

  const recoverableJobs = listRecoverableJobs();
  for (const job of recoverableJobs) {
    enqueueJob(job);
  }
  if (recoverableJobs.length > 0) {
    log(
      'info',
      'worker',
      `Recovered ${recoverableJobs.length} queued/running job(s) from the local database.`,
    );
  }
}
