import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getSettings, loadDotEnvLocal } from './config';
import { ensureDefaultProject, ensureDefaultWorkspace, migrateDb } from './db';
import { ensureLibrary, resolveLibraryPath } from './library';
import { ensureDefaultLibrary } from './libraries';
import { log } from './logger';

export function initStudio() {
  loadDotEnvLocal();
  ensureLibrary();
  migrateDb();
  ensureDefaultLibrary();
  // Project row may still exist for legacy columns; Workspace is product authority.
  ensureDefaultProject();
  const defaultWorkspace = ensureDefaultWorkspace();
  const envPath = path.resolve(process.cwd(), '.env.local');
  const codexVersion = null;

  if (!existsSync(envPath)) {
    const settings = getSettings();
    writeFileSync(
      envPath,
      [
        `STUDIO_LIBRARY_DIR=${settings.libraryDir}`,
        `STUDIO_SERVER_PORT=${settings.serverPort}`,
        `STUDIO_CODEX_WS_PORT=${settings.codexWsPort}`,
        `VITE_STUDIO_API_BASE=http://127.0.0.1:${settings.serverPort}`,
        `STUDIO_MAX_CONCURRENT_CODEX_JOBS=${settings.codexMaxConcurrentJobs}`,
        `CODEX_IMAGEGEN_MODEL=${settings.codexImagegenModel}`,
        `CODEX_IMAGEGEN_REASONING_EFFORT=${settings.codexImagegenReasoningEffort}`,
        '',
      ].join('\n'),
      'utf8',
    );
  }

  const workspaceId = defaultWorkspace?.id ?? 'default';
  const message = `Studio initialized. Default workspace: ${workspaceId}. Runtime readiness refresh scheduled.`;

  log('info', 'init', message);
  writeFileSync(
    resolveLibraryPath('logs', 'init.log'),
    `${new Date().toISOString()} ${message}\n`,
    { flag: 'a' },
  );

  return {
    settings: getSettings(),
    defaultWorkspaceId: workspaceId,
    codexVersion,
  };
}
