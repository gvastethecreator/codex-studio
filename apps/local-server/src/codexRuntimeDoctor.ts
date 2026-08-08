import { existsSync, readFileSync } from 'node:fs';
import { spawn, spawnSync as nodeSpawnSync } from 'node:child_process';
import path from 'node:path';
import type {
  CodexRuntimeDoctorIssue,
  CodexRuntimeDoctorReport,
} from '../../../packages/shared/src';
import {
  resolveCodexExecutable,
  resolveCodexInvocation,
  resolveCodexInvocationForExecutable,
  resolveWindowsCommandInvocation,
} from './codexExecutable';
import { listPlatformPathCandidates } from './platformPaths';
import { terminateOwnedProcessTree } from './ownedProcessTree';

interface SpawnResultLike {
  status: number | null;
  stdout?: string | Buffer | null;
  stderr?: string | Buffer | null;
  error?: Error | null;
}

interface SpawnOptionsLike {
  encoding: 'utf8';
  timeout: number;
  shell?: boolean;
  windowsVerbatimArguments?: boolean;
}

type SpawnSyncLike = (
  command: string,
  args: string[],
  options: SpawnOptionsLike,
) => SpawnResultLike;

export interface CodexRuntimeDoctorDependencies {
  now?: () => Date;
  exists?: (path: string) => boolean;
  spawnSync?: SpawnSyncLike;
  resolveExecutable?: () => string;
  resolveInvocation?: (args: string[], executable?: string) => string[];
  listCandidates?: () => Array<{ path: string; source: string }>;
}

export interface AsyncCodexRuntimeDoctorDependencies extends Omit<
  CodexRuntimeDoctorDependencies,
  'spawnSync'
> {
  run?: (command: string, args: string[]) => Promise<SpawnResultLike>;
}

const PROBE_TIMEOUT_MS = 10_000;
const DEFAULT_DOCTOR_CACHE_MS = 10_000;

let cachedReport: { expiresAt: number; report: CodexRuntimeDoctorReport } | null = null;
let inFlightReport: Promise<CodexRuntimeDoctorReport> | null = null;

function runAsyncProcess(command: string, args: string[]): Promise<SpawnResultLike> {
  return new Promise((resolve) => {
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn(command, args, {
        shell: process.platform === 'win32' && /\.(?:cmd|bat)$/i.test(command),
        windowsVerbatimArguments: process.platform === 'win32' && command === 'cmd.exe',
        windowsHide: true,
      });
    } catch (error) {
      resolve({
        status: null,
        stdout: '',
        stderr: '',
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return;
    }
    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (result: SpawnResultLike) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(result);
    };
    const timeout = setTimeout(() => {
      try {
        terminateOwnedProcessTree(child);
      } catch {
        // The probe may have exited between the deadline and termination.
      }
      finish({ status: null, stdout, stderr, error: new Error('Codex probe timed out') });
    }, PROBE_TIMEOUT_MS);

    child.stdout?.on('data', (chunk) => {
      stdout += String(chunk);
    });
    child.stderr?.on('data', (chunk) => {
      stderr += String(chunk);
    });
    child.once('error', (error) => finish({ status: null, stdout, stderr, error }));
    child.once('close', (code) => finish({ status: code, stdout, stderr }));
  });
}

function outputText(result: SpawnResultLike) {
  return [result.stdout, result.stderr]
    .map((value) => (value == null ? '' : String(value)))
    .join('\n')
    .trim();
}

function parseVersionNumber(raw: string | null) {
  return raw?.match(/(?:codex-cli\s*)?v?(\d+\.\d+(?:\.\d+)?)/i)?.[1] ?? null;
}

function isLegacyCodexCli({
  rawVersion,
  versionNumber,
  executable,
}: {
  rawVersion: string | null;
  versionNumber: string | null;
  executable: string;
}) {
  if (!versionNumber) return false;
  const looksBranded = /codex-cli/i.test(rawVersion ?? '');
  const looksLikeNpmShim = /[\\/]npm[\\/](codex(?:\.cmd|\.exe)?|node_modules[\\/])/i.test(
    executable,
  );
  return looksLikeNpmShim && !looksBranded;
}

function appServerHelpSupported(result: SpawnResultLike) {
  if (result.status !== 0) return false;
  const text = outputText(result);
  if (/\b(?:unknown|unrecognized|unrecognised|invalid)\s+(?:command|subcommand)\b/i.test(text)) {
    return false;
  }
  return /app-server|--listen|websocket/i.test(text);
}

function buildIssue(
  issue: Pick<CodexRuntimeDoctorIssue, 'code' | 'message' | 'action'>,
): CodexRuntimeDoctorIssue {
  return {
    ...issue,
    severity: 'error',
  };
}

function dedupeCandidates(candidates: Array<{ path: string; source: string }>) {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = candidate.path.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function readKnownLegacyNpmShimIssue(executable: string): CodexRuntimeDoctorIssue | null {
  if (process.platform !== 'win32') return null;
  if (!/[\\/]npm[\\/]codex(?:\.cmd|\.exe)?$/i.test(executable)) return null;

  const manifestPath = path.join(path.dirname(executable), 'node_modules', 'codex', 'package.json');
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      name?: string;
      version?: string;
      description?: string;
    };
    if (manifest.name !== 'codex') return null;

    return buildIssue({
      code: 'codex_cli_legacy',
      message: `Selected Codex CLI shim points to legacy npm package codex ${manifest.version ?? 'unknown version'}.`,
      action:
        'Remove the old global `codex` npm package, install `@openai/codex`, then restart the local backend.',
    });
  } catch {
    return null;
  }
}

function runProbe(
  spawnSync: SpawnSyncLike,
  resolveInvocation: (args: string[]) => string[],
  args: string[],
) {
  const [command, ...commandArgs] = resolveInvocation(args);
  const result = spawnSync(command, commandArgs, {
    encoding: 'utf8',
    timeout: PROBE_TIMEOUT_MS,
    windowsVerbatimArguments: process.platform === 'win32' && command === 'cmd.exe',
  });

  return {
    command: [command, ...commandArgs],
    result,
    text: outputText(result),
  };
}

function shouldTryWindowsShellFallback(result: SpawnResultLike, command: string[]) {
  if (process.platform !== 'win32') return false;
  const executable = command[0] ?? '';
  if (!executable || executable === 'cmd.exe' || executable === 'codex') return false;
  return result.status !== 0;
}

function runProbeWithFallback({
  spawnSync,
  resolveInvocation,
  selectedExecutable,
  args,
}: {
  spawnSync: SpawnSyncLike;
  resolveInvocation: (args: string[]) => string[];
  selectedExecutable: string;
  args: string[];
}) {
  const probe = runProbe(spawnSync, resolveInvocation, args);
  if (!shouldTryWindowsShellFallback(probe.result, probe.command)) return probe;

  const [fallbackCommand, ...fallbackArgs] = resolveWindowsCommandInvocation(
    selectedExecutable,
    args,
  );
  const fallbackResult = spawnSync(fallbackCommand, fallbackArgs, {
    encoding: 'utf8',
    timeout: PROBE_TIMEOUT_MS,
    windowsVerbatimArguments: true,
  });
  if (fallbackResult.status !== 0) return probe;

  return {
    command: [fallbackCommand, ...fallbackArgs],
    result: fallbackResult,
    text: outputText(fallbackResult),
  };
}

interface CandidateProbe {
  executable: string;
  source: string;
  exists: boolean;
  versionCommand: string[];
  selectedVersion: string | null;
  selectedVersionNumber: string | null;
  appServerSupported: boolean;
  issues: CodexRuntimeDoctorIssue[];
  canRunJobs: boolean;
}

function inspectCandidate({
  candidate,
  exists,
  resolveInvocation,
  selectedExecutable,
  spawnSync,
}: {
  candidate: { path: string; source: string };
  exists: (path: string) => boolean;
  resolveInvocation: (args: string[], executable?: string) => string[];
  selectedExecutable: string;
  spawnSync: SpawnSyncLike;
}): CandidateProbe {
  const candidateExists =
    candidate.path === 'codex' ? process.platform !== 'win32' : exists(candidate.path);
  const fallbackProbe = {
    executable: candidate.path,
    source: candidate.source,
    exists: candidateExists,
    versionCommand: [candidate.path, '--version'],
    selectedVersion: null,
    selectedVersionNumber: null,
    appServerSupported: false,
    issues: [] as CodexRuntimeDoctorIssue[],
    canRunJobs: false,
  };

  if (!candidateExists) return fallbackProbe;

  const legacyShimIssue = readKnownLegacyNpmShimIssue(candidate.path);
  if (legacyShimIssue) {
    return {
      ...fallbackProbe,
      versionCommand: resolveCodexInvocationForExecutable(candidate.path, ['--version']),
      issues: [legacyShimIssue],
    };
  }

  const probeInvocation =
    candidate.path === selectedExecutable
      ? (args: string[]) => resolveInvocation(args, candidate.path)
      : (args: string[]) => resolveCodexInvocationForExecutable(candidate.path, args);
  const versionProbe = runProbeWithFallback({
    spawnSync,
    resolveInvocation: probeInvocation,
    selectedExecutable: candidate.path,
    args: ['--version'],
  });
  const selectedVersion = versionProbe.result.status === 0 ? versionProbe.text : null;
  const selectedVersionNumber = parseVersionNumber(selectedVersion);
  const issues: CodexRuntimeDoctorIssue[] = [];

  if (versionProbe.result.status !== 0) {
    const errorText = versionProbe.result.error?.message || versionProbe.text;
    issues.push(
      buildIssue({
        code: 'codex_cli_unavailable',
        message: errorText
          ? `Codex CLI is not available: ${errorText}`
          : 'Codex CLI is not available from the selected command.',
        action: 'Install Codex CLI or fix PATH, then restart the local backend.',
      }),
    );
  }

  if (
    versionProbe.result.status === 0 &&
    isLegacyCodexCli({
      rawVersion: selectedVersion,
      versionNumber: selectedVersionNumber,
      executable: candidate.path,
    })
  ) {
    issues.push(
      buildIssue({
        code: 'codex_cli_legacy',
        message: `Selected Codex CLI looks legacy (${selectedVersion ?? 'unknown version'}).`,
        action:
          'Use the OpenAI Codex desktop CLI binary or update/remove the old npm shim, then restart the local backend.',
      }),
    );
  }

  let appServerSupported = false;
  if (versionProbe.result.status === 0 && issues.length === 0) {
    const helpProbe = runProbeWithFallback({
      spawnSync,
      resolveInvocation: probeInvocation,
      selectedExecutable: candidate.path,
      args: ['app-server', '--help'],
    });
    appServerSupported = appServerHelpSupported(helpProbe.result);

    if (!appServerSupported) {
      issues.push(
        buildIssue({
          code: 'codex_app_server_unsupported',
          message: 'Selected Codex CLI does not expose `codex app-server`.',
          action:
            'Update Codex CLI to a build with app-server support, then restart the local backend.',
        }),
      );
    }
  }

  const canRunJobs = issues.length === 0 && appServerSupported;
  return {
    executable: candidate.path,
    source: candidate.source,
    exists: candidateExists,
    versionCommand: versionProbe.command,
    selectedVersion,
    selectedVersionNumber,
    appServerSupported,
    issues,
    canRunJobs,
  };
}

async function inspectCandidateAsync({
  candidate,
  exists,
  resolveInvocation,
  selectedExecutable,
  run,
}: {
  candidate: { path: string; source: string };
  exists: (path: string) => boolean;
  resolveInvocation: (args: string[], executable?: string) => string[];
  selectedExecutable: string;
  run: (command: string, args: string[]) => Promise<SpawnResultLike>;
}): Promise<CandidateProbe> {
  const candidateExists =
    candidate.path === 'codex' ? process.platform !== 'win32' : exists(candidate.path);
  const fallbackProbe: CandidateProbe = {
    executable: candidate.path,
    source: candidate.source,
    exists: candidateExists,
    versionCommand: [candidate.path, '--version'],
    selectedVersion: null,
    selectedVersionNumber: null,
    appServerSupported: false,
    issues: [],
    canRunJobs: false,
  };

  if (!candidateExists) return fallbackProbe;
  const legacyShimIssue = readKnownLegacyNpmShimIssue(candidate.path);
  if (legacyShimIssue) {
    return {
      ...fallbackProbe,
      versionCommand: resolveCodexInvocationForExecutable(candidate.path, ['--version']),
      issues: [legacyShimIssue],
    };
  }

  const invocation =
    candidate.path === selectedExecutable
      ? resolveInvocation(['--version'], candidate.path)
      : resolveCodexInvocationForExecutable(candidate.path, ['--version']);
  const [versionCommand, ...versionArgs] = invocation;
  const versionResult = await run(versionCommand, versionArgs);
  const versionText = outputText(versionResult);
  const selectedVersion = versionResult.status === 0 ? versionText : null;
  const selectedVersionNumber = parseVersionNumber(selectedVersion);
  const issues: CodexRuntimeDoctorIssue[] = [];

  if (versionResult.status !== 0) {
    const errorText = versionResult.error?.message || versionText;
    issues.push(
      buildIssue({
        code: 'codex_cli_unavailable',
        message: errorText
          ? `Codex CLI is not available: ${errorText}`
          : 'Codex CLI is not available from the selected command.',
        action: 'Install Codex CLI or fix PATH, then restart the local backend.',
      }),
    );
  }

  if (
    versionResult.status === 0 &&
    isLegacyCodexCli({
      rawVersion: selectedVersion,
      versionNumber: selectedVersionNumber,
      executable: candidate.path,
    })
  ) {
    issues.push(
      buildIssue({
        code: 'codex_cli_legacy',
        message: `Selected Codex CLI looks legacy (${selectedVersion ?? 'unknown version'}).`,
        action:
          'Use the OpenAI Codex desktop CLI binary or update/remove the old npm shim, then restart the local backend.',
      }),
    );
  }

  let appServerSupported = false;
  if (versionResult.status === 0 && issues.length === 0) {
    const helpInvocation =
      candidate.path === selectedExecutable
        ? resolveInvocation(['app-server', '--help'], candidate.path)
        : resolveCodexInvocationForExecutable(candidate.path, ['app-server', '--help']);
    const [helpCommand, ...helpArgs] = helpInvocation;
    const helpResult = await run(helpCommand, helpArgs);
    appServerSupported = appServerHelpSupported(helpResult);
    if (!appServerSupported) {
      issues.push(
        buildIssue({
          code: 'codex_app_server_unsupported',
          message: 'Selected Codex CLI does not expose `codex app-server`.',
          action:
            'Update Codex CLI to a build with app-server support, then restart the local backend.',
        }),
      );
    }
  }

  return {
    executable: candidate.path,
    source: candidate.source,
    exists: candidateExists,
    versionCommand: invocation,
    selectedVersion,
    selectedVersionNumber,
    appServerSupported,
    issues,
    canRunJobs: issues.length === 0 && appServerSupported,
  };
}

function buildDoctorReport({
  initialExecutable,
  rawCandidates,
  probes,
  exists,
  now,
}: {
  initialExecutable: string;
  rawCandidates: Array<{ path: string; source: string }>;
  probes: CandidateProbe[];
  exists: (path: string) => boolean;
  now: () => Date;
}): CodexRuntimeDoctorReport {
  const selectedProbe =
    probes.find((probe) => probe.canRunJobs) ??
    probes.find((probe) => probe.executable === initialExecutable) ??
    probes.find((probe) => probe.exists) ??
    probes[0];
  const issues =
    selectedProbe?.issues.length || selectedProbe?.exists
      ? (selectedProbe?.issues ?? [])
      : [
          buildIssue({
            code: 'codex_cli_unavailable',
            message: 'Codex CLI is not available from any known command.',
            action: 'Install Codex CLI or fix PATH, then restart the local backend.',
          }),
        ];
  const canRunJobs = Boolean(selectedProbe?.canRunJobs);
  const selectedExecutable = selectedProbe?.executable ?? initialExecutable;

  return {
    status: canRunJobs ? 'ready' : 'blocked',
    canRunJobs,
    checkedAt: now().toISOString(),
    selectedExecutable,
    selectedCommand: (selectedProbe?.versionCommand ?? [selectedExecutable, '--version']).join(' '),
    selectedVersion: selectedProbe?.selectedVersion ?? null,
    selectedVersionNumber: selectedProbe?.selectedVersionNumber ?? null,
    appServerSupported: selectedProbe?.appServerSupported ?? false,
    recommendedAction: canRunJobs ? 'Codex Product Runtime is ready.' : issues[0].action,
    issues,
    candidates: rawCandidates.map((candidate) => ({
      executable: candidate.path,
      source: candidate.source,
      exists: candidate.path === 'codex' ? process.platform !== 'win32' : exists(candidate.path),
      selected: candidate.path === selectedExecutable,
    })),
  };
}

export function inspectCodexRuntime({
  now = () => new Date(),
  exists = existsSync,
  spawnSync = nodeSpawnSync,
  resolveExecutable = resolveCodexExecutable,
  resolveInvocation = resolveCodexInvocation,
  listCandidates = () => listPlatformPathCandidates('codex-binary'),
}: CodexRuntimeDoctorDependencies = {}): CodexRuntimeDoctorReport {
  const initialExecutable = resolveExecutable();
  const rawCandidates = dedupeCandidates([
    { path: initialExecutable, source: 'resolved executable' },
    ...listCandidates(),
  ]);
  const probes = rawCandidates.map((candidate) =>
    inspectCandidate({
      candidate,
      exists,
      resolveInvocation,
      selectedExecutable: initialExecutable,
      spawnSync,
    }),
  );
  return buildDoctorReport({ initialExecutable, rawCandidates, probes, exists, now });
}

export async function inspectCodexRuntimeAsync({
  now = () => new Date(),
  exists = existsSync,
  run = runAsyncProcess,
  resolveExecutable = resolveCodexExecutable,
  resolveInvocation = resolveCodexInvocation,
  listCandidates = () => listPlatformPathCandidates('codex-binary'),
}: AsyncCodexRuntimeDoctorDependencies = {}): Promise<CodexRuntimeDoctorReport> {
  const initialExecutable = resolveExecutable();
  const rawCandidates = dedupeCandidates([
    { path: initialExecutable, source: 'resolved executable' },
    ...listCandidates(),
  ]);
  const initialCandidate = rawCandidates[0] ?? {
    path: initialExecutable,
    source: 'resolved executable',
  };
  const probes = [
    await inspectCandidateAsync({
      candidate: initialCandidate,
      exists,
      resolveInvocation,
      selectedExecutable: initialExecutable,
      run,
    }),
  ];

  if (!probes[0].canRunJobs) {
    for (const candidate of rawCandidates.slice(1)) {
      const probe = await inspectCandidateAsync({
        candidate,
        exists,
        resolveInvocation,
        selectedExecutable: initialExecutable,
        run,
      });
      probes.push(probe);
      if (probe.canRunJobs) break;
    }
  }
  return buildDoctorReport({ initialExecutable, rawCandidates, probes, exists, now });
}

export function readCodexRuntimeDoctor({ maxAgeMs = DEFAULT_DOCTOR_CACHE_MS } = {}) {
  const nowMs = Date.now();
  if (maxAgeMs > 0 && cachedReport && cachedReport.expiresAt > nowMs) {
    return cachedReport.report;
  }

  const report = inspectCodexRuntime();
  cachedReport = { report, expiresAt: nowMs + maxAgeMs };
  return report;
}

export function refreshCodexRuntimeDoctor() {
  if (inFlightReport) return inFlightReport;
  inFlightReport = inspectCodexRuntimeAsync()
    .then((report) => {
      cachedReport = { report, expiresAt: Date.now() + DEFAULT_DOCTOR_CACHE_MS };
      return report;
    })
    .finally(() => {
      inFlightReport = null;
    });
  return inFlightReport;
}
