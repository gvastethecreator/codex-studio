import { spawnSync as nodeSpawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import {
  createAntigravityChildEnvironment,
  listAntigravityExecutableCandidates,
  resolveAntigravityExecutable,
  type AntigravityExecutableCandidate,
} from './antigravityExecutable';

export type AntigravityRuntimeDoctorIssueCode =
  | 'antigravity_cli_unavailable'
  | 'antigravity_cli_outdated'
  | 'antigravity_headless_unsupported'
  | 'antigravity_login_required'
  | 'antigravity_model_unavailable';

export interface AntigravityRuntimeDoctorIssue {
  code: AntigravityRuntimeDoctorIssueCode;
  message: string;
  action: string;
}

export interface AntigravityRuntimeDoctorReport {
  status: 'ready' | 'blocked';
  canRunJobs: boolean;
  checkedAt: string;
  selectedExecutable: string;
  selectedVersion: string | null;
  selectedVersionNumber: string | null;
  defaultModel: string | null;
  availableModels: string[];
  headlessSupported: boolean;
  generateImageSupported: boolean;
  recommendedAction: string;
  issues: AntigravityRuntimeDoctorIssue[];
  candidates: Array<AntigravityExecutableCandidate & { exists: boolean; selected: boolean }>;
}

interface SpawnResultLike {
  status: number | null;
  stdout?: string | Buffer | null;
  stderr?: string | Buffer | null;
  error?: Error | null;
}

type SpawnSyncLike = (
  command: string,
  args: string[],
  options: {
    cwd: string;
    encoding: 'utf8';
    env: NodeJS.ProcessEnv;
    maxBuffer: number;
    timeout: number;
    windowsHide: boolean;
  },
) => SpawnResultLike;

export interface AntigravityRuntimeDoctorDependencies {
  now?: () => Date;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  exists?: (filePath: string) => boolean;
  spawnSync?: SpawnSyncLike;
  resolveExecutable?: (env: NodeJS.ProcessEnv) => string;
  listCandidates?: (env: NodeJS.ProcessEnv) => AntigravityExecutableCandidate[];
}

const MINIMUM_ANTIGRAVITY_VERSION = '1.1.23';
const PROBE_TIMEOUT_MS = 10_000;
const DEFAULT_DOCTOR_CACHE_MS = 30_000;
const MAX_PROBE_OUTPUT_BYTES = 4 * 1024 * 1024;
const MODEL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;

let cachedReport: { expiresAt: number; report: AntigravityRuntimeDoctorReport } | null = null;

function outputText(result: SpawnResultLike) {
  return [result.stdout, result.stderr]
    .map((value) => (value == null ? '' : String(value)))
    .join('\n')
    .trim();
}

function parseVersionNumber(raw: string | null) {
  return raw?.match(/\b(\d+\.\d+\.\d+)\b/)?.[1] ?? null;
}

function semverParts(value: string | null) {
  const match = value?.match(/^(\d+)\.(\d+)\.(\d+)$/);
  return match ? match.slice(1).map(Number) : null;
}

function isVersionAtLeast(actual: string | null, minimum: string) {
  const actualParts = semverParts(actual);
  const minimumParts = semverParts(minimum);
  if (!actualParts || !minimumParts) return false;
  for (let index = 0; index < minimumParts.length; index += 1) {
    if (actualParts[index]! > minimumParts[index]!) return true;
    if (actualParts[index]! < minimumParts[index]!) return false;
  }
  return true;
}

export function parseAvailableAntigravityModels(output: string) {
  const models = output.split(/\r?\n/).flatMap((line) => {
    const model = line.split('\t', 1)[0]?.trim() ?? '';
    return MODEL_ID_PATTERN.test(model) && model.includes('-') ? [model] : [];
  });
  return [...new Set(models)];
}

function runProbe(
  spawnSync: SpawnSyncLike,
  executable: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
) {
  return spawnSync(executable, args, {
    cwd,
    encoding: 'utf8',
    env,
    maxBuffer: MAX_PROBE_OUTPUT_BYTES,
    timeout: PROBE_TIMEOUT_MS,
    windowsHide: true,
  });
}

function inspectCandidate({
  executable,
  cwd,
  env,
  spawnSync,
}: {
  executable: string;
  cwd: string;
  env: NodeJS.ProcessEnv;
  spawnSync: SpawnSyncLike;
}) {
  const issues: AntigravityRuntimeDoctorIssue[] = [];
  const versionResult = runProbe(spawnSync, executable, ['--version'], cwd, env);
  const versionText = outputText(versionResult);
  const selectedVersion = versionResult.status === 0 ? versionText.split(/\r?\n/)[0]!.trim() : null;
  const selectedVersionNumber = parseVersionNumber(selectedVersion);
  if (versionResult.status !== 0) {
    issues.push({
      code: 'antigravity_cli_unavailable',
      message: 'Antigravity CLI is not available from the selected executable.',
      action: 'Install Antigravity CLI or configure STUDIO_ANTIGRAVITY_CLI_PATH.',
    });
  } else if (!isVersionAtLeast(selectedVersionNumber, MINIMUM_ANTIGRAVITY_VERSION)) {
    issues.push({
      code: 'antigravity_cli_outdated',
      message: `Antigravity CLI ${selectedVersionNumber ?? 'unknown'} is older than the verified ${MINIMUM_ANTIGRAVITY_VERSION} headless contract.`,
      action: 'Run `agy update`, then restart Studio.',
    });
  }

  let headlessSupported = false;
  if (issues.length === 0) {
    const help = runProbe(spawnSync, executable, ['--help'], cwd, env);
    const helpText = outputText(help);
    headlessSupported =
      help.status === 0 &&
      [
        '--input-format',
        '--output-format',
        '--print-timeout',
        '--sandbox',
        '--disable-slash-commands',
        '--mode',
      ].every((flag) => helpText.includes(flag));
    if (!headlessSupported) {
      issues.push({
        code: 'antigravity_headless_unsupported',
        message: 'Antigravity CLI does not expose the required bounded headless controls.',
        action: 'Update Antigravity CLI to a release with stream JSON and sandbox controls.',
      });
    }
  }

  let availableModels: string[] = [];
  if (issues.length === 0) {
    const models = runProbe(spawnSync, executable, ['models'], cwd, env);
    const modelsText = outputText(models);
    availableModels = parseAvailableAntigravityModels(String(models.stdout ?? ''));
    const loginBlocked = /authentication required|not logged in|login required|sign in/i.test(
      modelsText,
    );
    if (models.status !== 0 || loginBlocked || availableModels.length === 0) {
      issues.push({
        code: loginBlocked ? 'antigravity_login_required' : 'antigravity_model_unavailable',
        message: loginBlocked
          ? 'Antigravity CLI does not have a usable local login.'
          : 'Antigravity CLI did not report an available reasoning model.',
        action: loginBlocked
          ? 'Open `agy`, complete Google authentication, then retry provider preflight.'
          : 'Run `agy models` and confirm that at least one model is available.',
      });
    }
  }

  const generateImageSupported = isVersionAtLeast(
    selectedVersionNumber,
    MINIMUM_ANTIGRAVITY_VERSION,
  );
  return {
    canRunJobs: issues.length === 0 && generateImageSupported,
    selectedVersion,
    selectedVersionNumber,
    defaultModel: null,
    availableModels,
    headlessSupported,
    generateImageSupported,
    issues,
  };
}

export function inspectAntigravityRuntime({
  now = () => new Date(),
  cwd = process.cwd(),
  env = process.env,
  exists = existsSync,
  spawnSync = nodeSpawnSync,
  resolveExecutable = resolveAntigravityExecutable,
  listCandidates = listAntigravityExecutableCandidates,
}: AntigravityRuntimeDoctorDependencies = {}): AntigravityRuntimeDoctorReport {
  const initialExecutable = resolveExecutable(env);
  const candidates = listCandidates(env);
  const childEnv = createAntigravityChildEnvironment(env);
  const ordered = [
    ...candidates.filter((candidate) => candidate.path === initialExecutable),
    ...candidates.filter((candidate) => candidate.path !== initialExecutable),
  ];
  let selectedExecutable = initialExecutable;
  let selected = inspectCandidate({ executable: initialExecutable, cwd, env: childEnv, spawnSync });
  for (const candidate of ordered) {
    if (selected.canRunJobs || candidate.path === initialExecutable) continue;
    if (candidate.path !== 'agy' && !exists(candidate.path)) continue;
    const probe = inspectCandidate({ executable: candidate.path, cwd, env: childEnv, spawnSync });
    if (probe.canRunJobs) {
      selectedExecutable = candidate.path;
      selected = probe;
    }
  }

  return {
    status: selected.canRunJobs ? 'ready' : 'blocked',
    canRunJobs: selected.canRunJobs,
    checkedAt: now().toISOString(),
    selectedExecutable,
    selectedVersion: selected.selectedVersion,
    selectedVersionNumber: selected.selectedVersionNumber,
    defaultModel: selected.defaultModel,
    availableModels: selected.availableModels,
    headlessSupported: selected.headlessSupported,
    generateImageSupported: selected.generateImageSupported,
    recommendedAction: selected.canRunJobs
      ? 'Antigravity image generation is ready through the local CLI login.'
      : (selected.issues[0]?.action ?? 'Install Antigravity CLI and complete its login.'),
    issues: selected.issues,
    candidates: candidates.map((candidate) => ({
      ...candidate,
      exists: candidate.path === 'agy' || exists(candidate.path),
      selected: candidate.path === selectedExecutable,
    })),
  };
}

export function readAntigravityRuntimeDoctor({ maxAgeMs = DEFAULT_DOCTOR_CACHE_MS } = {}) {
  const now = Date.now();
  if (maxAgeMs > 0 && cachedReport && cachedReport.expiresAt > now) return cachedReport.report;
  const report = inspectAntigravityRuntime();
  cachedReport = { report, expiresAt: now + maxAgeMs };
  return report;
}

export function clearAntigravityRuntimeDoctorCache() {
  cachedReport = null;
}
