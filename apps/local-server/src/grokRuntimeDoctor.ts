import { existsSync } from 'node:fs';
import { spawnSync as nodeSpawnSync } from 'node:child_process';
import {
  listGrokExecutableCandidates,
  resolveGrokExecutable,
  resolveGrokHome,
  type GrokExecutableCandidate,
} from './grokExecutable';

export type GrokRuntimeDoctorIssueCode =
  | 'grok_cli_unavailable'
  | 'grok_cli_outdated'
  | 'grok_headless_unsupported'
  | 'grok_login_required'
  | 'grok_model_unavailable'
  | 'grok_imagine_unavailable';

export interface GrokRuntimeDoctorIssue {
  code: GrokRuntimeDoctorIssueCode;
  message: string;
  action: string;
}

export interface GrokRuntimeDoctorReport {
  status: 'ready' | 'blocked';
  canRunJobs: boolean;
  checkedAt: string;
  selectedExecutable: string;
  selectedVersion: string | null;
  selectedVersionNumber: string | null;
  defaultModel: string | null;
  availableModels: string[];
  headlessSupported: boolean;
  imagineAvailable: boolean;
  recommendedAction: string;
  issues: GrokRuntimeDoctorIssue[];
  candidates: Array<GrokExecutableCandidate & { exists: boolean; selected: boolean }>;
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

export interface GrokRuntimeDoctorDependencies {
  now?: () => Date;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  exists?: (filePath: string) => boolean;
  spawnSync?: SpawnSyncLike;
  resolveExecutable?: (env: NodeJS.ProcessEnv) => string;
  listCandidates?: (env: NodeJS.ProcessEnv) => GrokExecutableCandidate[];
}

const MINIMUM_GROK_VERSION = '0.2.114';
const PROBE_TIMEOUT_MS = 10_000;
const DEFAULT_DOCTOR_CACHE_MS = 30_000;
const MAX_PROBE_OUTPUT_BYTES = 4 * 1024 * 1024;

let cachedReport: { expiresAt: number; report: GrokRuntimeDoctorReport } | null = null;

function outputText(result: SpawnResultLike) {
  return [result.stdout, result.stderr]
    .map((value) => (value == null ? '' : String(value)))
    .join('\n')
    .trim();
}

function parseVersionNumber(raw: string | null) {
  return raw?.match(/\bgrok\s+(\d+\.\d+\.\d+)\b/i)?.[1] ?? null;
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

const MODEL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;

export function parseAvailableGrokModels(output: string) {
  const lines = output.split(/\r?\n/);
  const models: string[] = [];
  let defaultModel: string | null = null;
  let inModels = false;
  for (const line of lines) {
    const trimmed = line.trim();
    const headerDefault = trimmed.match(/^Default model:\s+(\S+)/i);
    if (headerDefault) {
      const headerModel = headerDefault[1]!;
      if (MODEL_ID_PATTERN.test(headerModel)) defaultModel = headerModel;
      continue;
    }
    if (/^Available models:\s*$/i.test(trimmed)) {
      inModels = true;
      continue;
    }
    if (!inModels || !trimmed) continue;
    const match = trimmed.match(/^(?:[-*]\s+)?(\S+?)(?:\s+\(default\))?\s*$/i);
    if (!match) continue;
    const model = match[1]!;
    if (!MODEL_ID_PATTERN.test(model)) continue;
    models.push(model);
    if (/\(default\)/i.test(trimmed)) defaultModel = model;
  }
  if (defaultModel && !models.includes(defaultModel)) models.unshift(defaultModel);
  return { models: [...new Set(models)], defaultModel };
}

function parseImagineAvailability(stdout: string) {
  try {
    const report = JSON.parse(stdout) as { skills?: Array<{ name?: unknown }> };
    return Array.isArray(report.skills) && report.skills.some((skill) => skill.name === 'imagine');
  } catch {
    return false;
  }
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
  const issues: GrokRuntimeDoctorIssue[] = [];
  const versionResult = runProbe(spawnSync, executable, ['version'], cwd, env);
  const versionText = outputText(versionResult);
  const selectedVersion = versionResult.status === 0 ? versionText.split(/\r?\n/)[0]!.trim() : null;
  const selectedVersionNumber = parseVersionNumber(selectedVersion);

  if (versionResult.status !== 0) {
    issues.push({
      code: 'grok_cli_unavailable',
      message: 'Grok Build CLI is not available from the selected executable.',
      action: 'Install Grok Build or configure STUDIO_GROK_CLI_PATH, then restart Studio.',
    });
  } else if (!isVersionAtLeast(selectedVersionNumber, MINIMUM_GROK_VERSION)) {
    issues.push({
      code: 'grok_cli_outdated',
      message: `Grok Build ${selectedVersionNumber ?? 'unknown'} is older than the verified ${MINIMUM_GROK_VERSION} media contract.`,
      action: 'Update Grok Build, then restart Studio.',
    });
  }

  let headlessSupported = false;
  let availableModels: string[] = [];
  let defaultModel: string | null = null;
  let imagineAvailable = false;

  if (issues.length === 0) {
    const helpResult = runProbe(spawnSync, executable, ['--no-auto-update', '--help'], cwd, env);
    const helpText = outputText(helpResult);
    headlessSupported =
      helpResult.status === 0 &&
      ['--prompt-file', '--output-format', '--tools', '--session-id'].every((flag) =>
        helpText.includes(flag),
      );
    if (!headlessSupported) {
      issues.push({
        code: 'grok_headless_unsupported',
        message: 'Grok Build does not expose the required bounded headless controls.',
        action: 'Update Grok Build to a release with headless prompt, tool, and session controls.',
      });
    }
  }

  if (issues.length === 0) {
    const modelsResult = runProbe(spawnSync, executable, ['--no-auto-update', 'models'], cwd, env);
    const modelsText = outputText(modelsResult);
    ({ models: availableModels, defaultModel } = parseAvailableGrokModels(
      String(modelsResult.stdout ?? ''),
    ));
    const loginBlocked = /not logged in|login required|run\s+`?grok login`?/i.test(modelsText);
    if (modelsResult.status !== 0 || loginBlocked || availableModels.length === 0) {
      issues.push({
        code: loginBlocked ? 'grok_login_required' : 'grok_model_unavailable',
        message: loginBlocked
          ? 'Grok Build does not have a usable local login.'
          : 'Grok Build did not report an available model.',
        action: loginBlocked
          ? 'Run `grok login`, complete browser authentication, then retry provider preflight.'
          : 'Open Grok Build and confirm that at least one model is available.',
      });
    }
  }

  if (issues.length === 0) {
    const inspectResult = runProbe(
      spawnSync,
      executable,
      ['--no-auto-update', 'inspect', '--json'],
      cwd,
      env,
    );
    imagineAvailable =
      inspectResult.status === 0 && parseImagineAvailability(String(inspectResult.stdout ?? ''));
    if (!imagineAvailable) {
      issues.push({
        code: 'grok_imagine_unavailable',
        message: 'The installed Grok Build runtime does not expose the bundled Imagine capability.',
        action: 'Update or repair Grok Build, then retry provider preflight.',
      });
    }
  }

  return {
    canRunJobs: issues.length === 0,
    selectedVersion,
    selectedVersionNumber,
    defaultModel,
    availableModels,
    headlessSupported,
    imagineAvailable,
    issues,
  };
}

export function inspectGrokRuntime({
  now = () => new Date(),
  cwd = process.cwd(),
  env = process.env,
  exists = existsSync,
  spawnSync = nodeSpawnSync,
  resolveExecutable = resolveGrokExecutable,
  listCandidates = listGrokExecutableCandidates,
}: GrokRuntimeDoctorDependencies = {}): GrokRuntimeDoctorReport {
  const initialExecutable = resolveExecutable(env);
  const candidates = listCandidates(env);
  const ordered = [
    ...candidates.filter((candidate) => candidate.path === initialExecutable),
    ...candidates.filter((candidate) => candidate.path !== initialExecutable),
  ];
  let selectedExecutable = initialExecutable;
  let selected = inspectCandidate({
    executable: initialExecutable,
    cwd,
    env: { ...env, GROK_HOME: resolveGrokHome(env) },
    spawnSync,
  });

  for (const candidate of ordered) {
    if (selected.canRunJobs || candidate.path === initialExecutable) continue;
    if (candidate.path !== 'grok' && !exists(candidate.path)) continue;
    const probe = inspectCandidate({
      executable: candidate.path,
      cwd,
      env: { ...env, GROK_HOME: resolveGrokHome(env) },
      spawnSync,
    });
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
    imagineAvailable: selected.imagineAvailable,
    recommendedAction: selected.canRunJobs
      ? 'Grok Imagine is ready through the local Grok Build login.'
      : (selected.issues[0]?.action ?? 'Install Grok Build and run `grok login`.'),
    issues: selected.issues,
    candidates: candidates.map((candidate) => ({
      ...candidate,
      exists: candidate.path === 'grok' || exists(candidate.path),
      selected: candidate.path === selectedExecutable,
    })),
  };
}

export function readGrokRuntimeDoctor({ maxAgeMs = DEFAULT_DOCTOR_CACHE_MS } = {}) {
  const now = Date.now();
  if (maxAgeMs > 0 && cachedReport && cachedReport.expiresAt > now) return cachedReport.report;
  const report = inspectGrokRuntime();
  cachedReport = { report, expiresAt: now + maxAgeMs };
  return report;
}

export function clearGrokRuntimeDoctorCache() {
  cachedReport = null;
}
