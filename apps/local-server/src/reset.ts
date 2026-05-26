import { existsSync, rmSync } from 'node:fs';
import { getSettings } from './config';
import { stopAppServer } from './codex';
import { closeDb, ensureDefaultProject, migrateDb } from './db';
import { LIBRARY_FOLDERS, ensureLibrary, resolveLibraryPath } from './library';
import { ensureDefaultLibrary } from './libraries';
import { log } from './logger';
import { resetWorkerState } from './worker';

const LIBRARY_RESET_TARGETS = ['library.sqlite', ...LIBRARY_FOLDERS] as const;

export async function resetStudioData() {
  await resetWorkerState();
  await stopAppServer();
  closeDb();

  for (const target of LIBRARY_RESET_TARGETS) {
    const targetPath = resolveLibraryPath(target);
    if (existsSync(targetPath)) {
      rmSync(targetPath, { recursive: true, force: true });
    }
  }

  ensureLibrary();
  migrateDb();
  ensureDefaultLibrary();
  const defaultProject = ensureDefaultProject();
  const settings = getSettings();

  log(
    'warn',
    'reset',
    `Studio reset complete. Library recreated at ${settings.libraryDir}. Default project: ${defaultProject.id}`,
  );

  return {
    ok: true,
    resetAt: new Date().toISOString(),
    libraryDir: settings.libraryDir,
    defaultProjectId: defaultProject.id,
  };
}
