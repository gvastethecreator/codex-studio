import { existsSync } from 'node:fs';
import { spawnSync as nodeSpawnSync } from 'node:child_process';
import type {
  CodexRuntimeDoctorIssue,
  CodexRuntimeDoctorReport,
} from '../../../packages/shared/src';
import { resolveCodexExecutable, resolveCodexInvocation } from './codexExecutable';
import { listPlatformPathCandidates } from './platformPaths';

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
  resolveInvocation?: (args: string[]) => string[];
  listCandidates?: () => Array<{ path: string; source: string }>;
}

const PROBE_TIMEOUT_MS = 10_000;
const DEFAULT_DOCTOR_CACHE_MS = 10_000;

let cachedReport: { expiresAt: number; report: CodexRuntimeDoctorReport } | null = null;

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
  if (/^0\.2\./.test(versionNumber)) return true;
  const looksBranded = /codex-cli/i.test(rawVersion ?? '');
  const looksLikeNpmShim = /[\\/]npm[\\/](codex(?:\.cmd|\.exe)?|node_modules[\\/])/i.test(
    executable,
  );
  return looksLikeNpmShim && !looksBranded;
}

function buildIssue(
  issue: Pick<CodexRuntimeDoctorIssue, 'code' | 'message' | 'action'>,
): CodexRuntimeDoctorIssue {
  return {
    ...issue,
    severity: 'error',
  };
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

  const fallbackResult = spawnSync(selectedExecutable, args, {
    encoding: 'utf8',
    shell: true,
    timeout: PROBE_TIMEOUT_MS,
  });
  if (fallbackResult.status !== 0) return probe;

  return {
    command: [selectedExecutable, ...args],
    result: fallbackResult,
    text: outputText(fallbackResult),
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
  const selectedExecutable = resolveExecutable();
  const candidates = listCandidates().map((candidate) => ({
    executable: candidate.path,
    source: candidate.source,
    exists: candidate.path === 'codex' ? false : exists(candidate.path),
    selected: candidate.path === selectedExecutable,
  }));
  const versionProbe = runProbeWithFallback({
    spawnSync,
    resolveInvocation,
    selectedExecutable,
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
      executable: selectedExecutable,
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
      resolveInvocation,
      selectedExecutable,
      args: ['app-server', '--help'],
    });
    appServerSupported =
      helpProbe.result.status === 0 && /app-server|--listen|websocket/i.test(helpProbe.text);

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
    status: canRunJobs ? 'ready' : 'blocked',
    canRunJobs,
    checkedAt: now().toISOString(),
    selectedExecutable,
    selectedCommand: versionProbe.command.join(' '),
    selectedVersion,
    selectedVersionNumber,
    appServerSupported,
    recommendedAction: canRunJobs ? 'Codex Product Runtime is ready.' : issues[0].action,
    issues,
    candidates,
  };
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
