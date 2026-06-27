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
  const codexVersion = renderValue(health?.codexCli.version, 'Codex CLI not detected yet');
  const bunVersion = renderValue(health?.runtime.bunVersion, 'Bun version not detected yet');
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
    `- Bun: ${bunVersion}`,
    `- Codex CLI: ${codexVersion}`,
    `- codex app-server: ${appServerState}`,
    `- Local Codex Session: ${localSessionState}`,
    `- Readiness stage: ${readiness.stage}`,
    `- Next action: ${readiness.nextAction ?? 'none'}`,
    '',
    'Readiness checks:',
    renderReadinessChecks(readiness),
    '',
    'Work rules:',
    '- Read AGENTS.md, CONTEXT.md, docs/ARCHITECTURE.md, docs/active/professionalization-roadmap.md, docs/TECHNICAL_DEBT.md, and SKILLS.md before editing.',
    '- Preserve dirty worktree changes you did not make.',
    '- Keep Provider Secrets out of SQLite, catalog metadata, logs, screenshots, docs, and committed files.',
    '- Do not delete, move, compact, or rewrite Studio Library data unless the user explicitly confirms it.',
    '- Use Bun scripts from package.json and run broad checks only at closeout.',
    '',
    'Setup tasks:',
    '1. Audit prerequisites: git status, Bun, Codex CLI, ports, .env.local, Studio Library, and /api/health when reachable.',
    '2. Run or repair `bun run studio:init` if local bootstrap files or library folders are missing; keep existing .env.local values unless they are clearly invalid.',
    '3. Verify the local backend and Codex Product Runtime with `bun run dev` or separate backend/UI commands as needed.',
    '4. Verify the Local Codex Session through `/api/codex/session`. If ChatGPT login requires interactive auth, stop and give the exact `codex login` action for the user.',
    '5. Start or verify `codex app-server` through the local backend when possible; avoid leaving orphaned processes.',
    '6. Run closeout once: `bun run test`, `bun run check`, and `bun run build`, or report exact blockers and risk.',
    '7. Finish with changed files, commands run, current health/readiness, and remaining user-only actions.',
  ].join('\n');
}
