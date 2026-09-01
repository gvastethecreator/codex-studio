import type {
  HealthResponse,
  LocalCodexSessionResponse,
  StudioReadinessSnapshot,
} from '../packages/shared/src';

export const CODEX_STUDIO_SETUP_SKILL_PATH = 'skills/codex-studio-setup/SKILL.md';

interface BuildCodexStudioSetupPromptArgs {
  apiBase: string;
  health: HealthResponse | null;
  isDesktopRuntime: boolean;
  localCodexSession: LocalCodexSessionResponse | null;
  readiness: StudioReadinessSnapshot;
}

function renderBool(value: boolean | null | undefined) {
  if (value === true) return 'yes';
  if (value === false) return 'no';
  return 'unknown';
}

function renderValue(value: string | number | null | undefined, fallback = 'unknown') {
  if (typeof value === 'number') return String(value);
  return value && value.trim().length > 0 ? value : fallback;
}

function renderReadinessChecks(readiness: StudioReadinessSnapshot) {
  if (readiness.checks.length === 0) return '- No readiness checks were available yet.';

  return readiness.checks
    .map((check) => {
      const state = check.ok ? 'ready' : check.blocking ? 'blocking' : 'attention';
      return `- ${check.label}: ${state}. ${check.detail}`;
    })
    .join('\n');
}

export function buildCodexStudioSetupPrompt({
  apiBase,
  health,
  isDesktopRuntime,
  localCodexSession,
  readiness,
}: BuildCodexStudioSetupPromptArgs) {
  const projectRoot = renderValue(health?.runtime.cwd, 'Codex Studio repository root');
  const envLocalPath = renderValue(health?.runtime.envLocalPath, '.env.local');
  const libraryDir = renderValue(health?.libraryDir, 'Studio Library not detected yet');
  const codexCliState = health?.codexCli.available ? 'available' : 'missing';
  const codexMetadata = renderValue(health?.codexCli.version, 'not reported');
  const codexRuntimeAction = renderValue(
    health?.codexRuntime.recommendedAction,
    'Codex runtime capability not checked yet',
  );
  const codexRuntimeState = renderValue(health?.codexRuntime.status, 'unknown');
  const codexAppServerSupport = renderBool(health?.codexRuntime.appServerSupported);
  const bunMetadata = renderValue(health?.runtime.bunVersion, 'not reported');
  const appServerState = health?.appServer.running ? 'running' : 'not running';
  const localSessionState = localCodexSession?.canRunLocalJobs
    ? 'ready'
    : localCodexSession?.reason || localCodexSession?.state || 'unknown';

  return [
    `Use the repo-local skill at \`${CODEX_STUDIO_SETUP_SKILL_PATH}\` to complete Codex Studio setup.`,
    '',
    'Goal: make this checkout ready for local image generation with the Codex Product Runtime.',
    '',
    'Current snapshot:',
    `- Project root: ${projectRoot}`,
    `- Runtime: ${isDesktopRuntime ? 'Desktop runtime' : 'Web runtime'}`,
    `- Local API: ${apiBase}`,
    `- Studio Library: ${libraryDir}`,
    `- .env.local: ${envLocalPath} (present: ${renderBool(health?.runtime.envLocalPresent)})`,
    `- Bun runtime metadata: ${bunMetadata}`,
    `- Codex CLI: ${codexCliState}; metadata: ${codexMetadata}`,
    `- Codex Runtime Capability: ${codexRuntimeState}; app-server support: ${codexAppServerSupport}`,
    `- Codex Runtime Action: ${codexRuntimeAction}`,
    `- codex app-server: ${appServerState}`,
    `- Local Codex Session: ${localSessionState}`,
    `- Readiness stage: ${readiness.stage}`,
    `- Next action: ${readiness.nextAction ?? 'none'}`,
    '',
    'Readiness checks:',
    renderReadinessChecks(readiness),
    '',
    'Work rules:',
    '- Read AGENTS.md and README.md before editing.',
    '- Preserve dirty worktree changes you did not make.',
    '- Keep Provider Secrets out of SQLite, catalog metadata, logs, screenshots, docs, and committed files.',
    '- Do not delete, move, compact, or rewrite Studio Library data unless the user explicitly confirms it.',
    '- Never silent-install Bun or Codex CLI. ChatGPT login is Studio Settings Sign in, or a user-only `codex login` step.',
    '- Default Studio Library is Codex Studio in the user home unless STUDIO_LIBRARY_DIR is already set. Do not treat Preferred Output Path as the generate destination.',
    '- Use Bun scripts from package.json and run broad checks only at closeout.',
    '- Treat Bun and Codex command output as diagnostic metadata only. Do not block setup on an exact tool release when app readiness, supported scripts, app-server support, and Local Codex Session are healthy.',
    '',
    'Setup tasks:',
    '1. Audit app readiness: git status, supported Bun scripts, Codex Runtime Doctor capability, ports, .env.local, Studio Library, and `/api/health` when reachable.',
    '2. If Studio Library or Bootstrap Configuration is missing, run in-app Setup or `bun run studio:onboard` after consent. Then run or repair `bun run studio:init` if local bootstrap files or library folders are still missing; keep existing .env.local values unless they are clearly invalid.',
    '3. Verify the local backend and Codex Product Runtime with `bun run dev` or separate backend/UI commands as needed.',
    '4. Verify ChatGPT auth through Studio Settings Sign in or `/api/codex/session`. If login requires interactive auth, stop and give Settings Sign in or the exact `codex login` action for the user.',
    '5. Start or verify `codex app-server` through the local backend when possible; avoid leaving orphaned processes.',
    '6. Run closeout once: `bun run test`, `bun run check`, and `bun run build`, or report exact blockers and risk.',
    '7. Finish with changed files, commands run, current health/readiness, and remaining user-only actions.',
  ].join('\n');
}
