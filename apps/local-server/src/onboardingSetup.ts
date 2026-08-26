import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  detectCloudSyncLibraryPath,
  parseOnboardingSetupRequest,
  type OnboardingProbe,
  type OnboardingProgressEvent,
  type OnboardingSetupErrorBody,
  type OnboardingSetupRequest,
  type OnboardingSetupResult,
} from '../../../packages/shared/src';
import { getEnvLocalPath, resolveDefaultLibraryDir } from './config';
import { initStudio } from './init';

export class OnboardingSetupError extends Error {
  readonly status: 400 | 409;
  readonly body: OnboardingSetupErrorBody;

  constructor(status: 400 | 409, body: OnboardingSetupErrorBody) {
    super(body.error);
    this.name = 'OnboardingSetupError';
    this.status = status;
    this.body = body;
  }
}

export type { OnboardingSetupResult };

export interface OnboardingSetupDependencies {
  resolveDefaultLibraryPath?: () => string;
  readEnvLocalPath?: () => string;
  readFile?: (filePath: string) => string | null;
  writeFile?: (filePath: string, contents: string) => void;
  setProcessEnv?: (key: string, value: string) => void;
  initLibrary?: () => void;
  repoRoot?: string;
  depsNeedInstall?: (repoRoot: string) => boolean;
  installRepoDeps?: (repoRoot: string) => void;
  isAbsolutePath?: (value: string) => boolean;
  readExistingLibraryDir?: () => string | null;
  report?: (event: OnboardingProgressEvent) => void;
}

function defaultReadFile(filePath: string) {
  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : null;
}

export function repoDepsNeedInstall(repoRoot: string) {
  return !existsSync(path.join(repoRoot, 'node_modules'));
}

export function readStudioLibraryDirFromEnv(contents: string | null): string | null {
  if (!contents) return null;
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (!trimmed.startsWith('STUDIO_LIBRARY_DIR=')) continue;
    const value = trimmed
      .slice('STUDIO_LIBRARY_DIR='.length)
      .trim()
      .replace(/^["']|["']$/g, '');
    return value || null;
  }
  return null;
}

export function upsertStudioLibraryDir(envFileContents: string | null, libraryPath: string) {
  const line = `STUDIO_LIBRARY_DIR=${libraryPath}`;
  if (!envFileContents) {
    return `${line}\n`;
  }
  const lines = envFileContents.split(/\r?\n/);
  let replaced = false;
  const next = lines.map((current) => {
    if (!current.startsWith('STUDIO_LIBRARY_DIR=')) return current;
    replaced = true;
    return line;
  });
  if (!replaced) {
    const prefix = envFileContents.endsWith('\n') ? envFileContents : `${envFileContents}\n`;
    return `${prefix}${line}\n`;
  }
  return `${next.join('\n').replace(/\n*$/, '\n')}`;
}

function resolveRequestedLibraryPath(
  request: OnboardingSetupRequest,
  resolveDefaultLibraryPath: () => string,
  isAbsolutePath: (value: string) => boolean,
  existingLibraryDir: string | null,
) {
  const libraryPath = request.libraryPath || existingLibraryDir || resolveDefaultLibraryPath();
  if (!isAbsolutePath(libraryPath)) {
    throw new OnboardingSetupError(400, {
      error: 'Studio Library path must be absolute.',
      code: 'invalid_library_path',
    });
  }
  return libraryPath;
}

export function applyOnboardingSetup(
  rawRequest: unknown,
  dependencies: OnboardingSetupDependencies = {},
): OnboardingSetupResult {
  const request = parseOnboardingSetupRequest(rawRequest);
  if (!request.consent) {
    throw new OnboardingSetupError(400, {
      error: 'Setup requires explicit consent.',
      code: 'consent_required',
    });
  }

  const resolveDefaultLibraryPath =
    dependencies.resolveDefaultLibraryPath ?? resolveDefaultLibraryDir;
  const isAbsolutePath = dependencies.isAbsolutePath ?? path.isAbsolute;
  const envPath = dependencies.readEnvLocalPath?.() ?? getEnvLocalPath();
  const readFile = dependencies.readFile ?? defaultReadFile;
  const existingLibraryDir = dependencies.readExistingLibraryDir
    ? dependencies.readExistingLibraryDir()
    : process.env.STUDIO_LIBRARY_DIR?.trim() || readStudioLibraryDirFromEnv(readFile(envPath));
  const libraryPath = resolveRequestedLibraryPath(
    request,
    resolveDefaultLibraryPath,
    isAbsolutePath,
    existingLibraryDir,
  );
  const cloudSyncProvider = detectCloudSyncLibraryPath(libraryPath);
  if (cloudSyncProvider && !request.confirmCloudSync) {
    throw new OnboardingSetupError(409, {
      error: `This folder looks like it syncs through ${cloudSyncProvider}. Confirm to continue.`,
      code: 'cloud_sync_confirm_required',
      cloudSyncProvider,
    });
  }

  const writeFile = dependencies.writeFile ?? writeFileSync;
  const setProcessEnv =
    dependencies.setProcessEnv ??
    ((key, value) => {
      process.env[key] = value;
    });

  let wroteEnv = false;
  let initializedLibrary = false;
  let installedDeps = false;
  let skippedDepInstall = false;
  const report = dependencies.report;

  if (request.initLibrary) {
    report?.({
      kind: 'stage',
      stage: 'write_bootstrap',
      message: 'Writing Bootstrap Configuration.',
    });
    writeFile(envPath, upsertStudioLibraryDir(readFile(envPath), libraryPath));
    setProcessEnv('STUDIO_LIBRARY_DIR', libraryPath);
    wroteEnv = true;
    report?.({ kind: 'log', message: 'Wrote STUDIO_LIBRARY_DIR into .env.local.' });
    report?.({
      kind: 'stage',
      stage: 'init_library',
      message: 'Initializing the Studio Library.',
    });
    (dependencies.initLibrary ?? initStudio)();
    initializedLibrary = true;
    report?.({ kind: 'log', message: 'Studio Library is initialized.' });
  }

  if (request.installDeps) {
    const repoRoot = dependencies.repoRoot ?? process.cwd();
    const needsInstall = (dependencies.depsNeedInstall ?? repoDepsNeedInstall)(repoRoot);
    if (needsInstall) {
      report?.({
        kind: 'stage',
        stage: 'install_deps',
        message: 'Installing repo dependencies.',
      });
      (dependencies.installRepoDeps ?? installRepoDeps)(repoRoot);
      installedDeps = true;
      report?.({ kind: 'log', message: 'bun install finished.' });
    } else {
      skippedDepInstall = true;
      report?.({ kind: 'log', message: 'Dependencies already present; skipped bun install.' });
    }
  }

  return {
    ok: true,
    libraryPath,
    wroteEnv,
    initializedLibrary,
    installedDeps,
    skippedDepInstall,
    cloudSyncProvider,
  };
}

function installRepoDeps(repoRoot: string) {
  const result = Bun.spawnSync(['bun', 'install'], {
    cwd: repoRoot,
    stdout: 'pipe',
    stderr: 'pipe',
  });
  if (result.exitCode !== 0) {
    throw new Error('bun install failed');
  }
}

export function setupResultWithProbe(result: OnboardingSetupResult, probe: OnboardingProbe) {
  return { ...result, probe };
}
