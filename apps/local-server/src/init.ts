import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getSettings, loadDotEnvLocal } from './config';
import { resolveCodexInvocation } from './codexExecutable';
import { ensureDefaultProject, migrateDb } from './db';
import { ensureLibrary, resolveLibraryPath } from './library';
import { ensureDefaultLibrary } from './libraries';
import { log } from './logger';

export function initStudio() {
  loadDotEnvLocal();
  ensureLibrary();
  migrateDb();
  ensureDefaultLibrary();
  const defaultProject = ensureDefaultProject();
  const envPath = path.resolve(process.cwd(), '.env.local');
  const [command, ...args] = resolveCodexInvocation(['--version']);
  const codex = spawnSync(command, args, { encoding: 'utf8' });
  const codexVersion = codex.status === 0 ? codex.stdout.trim() : null;

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

  const message = codexVersion
    ? `Studio initialized. Default project: ${defaultProject.id}. Codex: ${codexVersion}`
    : `Studio initialized. Default project: ${defaultProject.id}. Codex CLI was not found in PATH.`;

  log(codexVersion ? 'info' : 'warn', 'init', message);
  writeFileSync(
    resolveLibraryPath('logs', 'init.log'),
    `${new Date().toISOString()} ${message}\n`,
    { flag: 'a' },
  );

  return {
    settings: getSettings(),
    defaultProject,
    codexVersion,
  };
}
