import {
  detectCloudSyncLibraryPath,
  type OnboardingHostActionResult,
  type OnboardingProbe,
  type OnboardingSetupResult,
} from '../packages/shared/src';
import { applyOnboardingSetup } from '../apps/local-server/src/onboardingSetup';
import { applyOnboardingHostAction } from '../apps/local-server/src/hostTerminal';
import { readLocalOnboardingProbe } from '../apps/local-server/src/onboardingProbe';
import { CODEX_STUDIO_SETUP_SKILL_PATH } from '../lib/onboardingSetupPrompt';

export const STUDIO_ONBOARD_USAGE = `Usage:
  bun run studio:onboard --probe
  bun run studio:onboard --setup --yes [--library-path <abs>] [--confirm-cloud-sync] [--no-install-deps]
  bun run studio:onboard --login --yes
  bun run studio:onboard --ask-codex --yes

--yes records explicit consent for an already-authorized agent.
Without --yes, Setup and host terminals ask yes or no on a TTY, or exit 2 so you can re-run with --yes.`;

export type StudioOnboardCommand = 'probe' | 'setup' | 'login' | 'ask_codex' | null;

export interface StudioOnboardSetupFlags {
  yes: boolean;
  libraryPath: string | null;
  confirmCloudSync: boolean;
  installDeps: boolean;
}

export function resolveStudioOnboardCommand(argv: string[]): StudioOnboardCommand {
  if (argv.includes('--setup')) return 'setup';
  if (argv.includes('--login')) return 'login';
  if (argv.includes('--ask-codex')) return 'ask_codex';
  if (argv.includes('--probe')) return 'probe';
  return null;
}

export function parseStudioOnboardSetupFlags(argv: string[]): StudioOnboardSetupFlags {
  const libraryPathIndex = argv.indexOf('--library-path');
  const next = libraryPathIndex >= 0 ? argv[libraryPathIndex + 1] : undefined;
  const libraryPath = next && !next.startsWith('--') ? next : null;
  return {
    yes: argv.includes('--yes'),
    libraryPath,
    confirmCloudSync: argv.includes('--confirm-cloud-sync'),
    installDeps: !argv.includes('--no-install-deps'),
  };
}

export function resolveStudioOnboardConsent(input: {
  yes: boolean;
  isTty: boolean;
}): 'proceed' | 'ask' | 'needs_yes' {
  if (input.yes) return 'proceed';
  if (input.isTty) return 'ask';
  return 'needs_yes';
}

export async function loadStudioOnboardProbe(options?: {
  apiBase?: string;
  fetchImpl?: typeof fetch;
  fallback?: () => OnboardingProbe;
}): Promise<OnboardingProbe> {
  const apiBase = (options?.apiBase ?? process.env.VITE_STUDIO_API_BASE ?? 'http://127.0.0.1:17223')
    .trim()
    .replace(/\/+$/, '');
  const fetchImpl = options?.fetchImpl ?? fetch;
  const fallback = options?.fallback ?? readLocalOnboardingProbe;

  try {
    const response = await fetchImpl(`${apiBase}/api/onboarding/probe`);
    if (response.ok) {
      return (await response.json()) as OnboardingProbe;
    }
  } catch {
    // Fall back to a local collect when the backend is not up.
  }

  return fallback();
}

export async function runStudioOnboardSetup(options: {
  flags: StudioOnboardSetupFlags;
  isTty: boolean;
  askConsent?: (question: string) => Promise<boolean>;
  applySetup?: typeof applyOnboardingSetup;
}): Promise<
  { ok: true; result: OnboardingSetupResult } | { ok: false; status: 1 | 2; error: string }
> {
  const consentMode = resolveStudioOnboardConsent({
    yes: options.flags.yes,
    isTty: options.isTty,
  });
  if (consentMode === 'needs_yes') {
    return {
      ok: false,
      status: 2,
      error: 'Setup needs explicit consent. Re-run with --yes.',
    };
  }
  if (consentMode === 'ask') {
    const agreed = options.askConsent
      ? await options.askConsent('Write STUDIO_LIBRARY_DIR and create the Studio Library? [y/N] ')
      : false;
    if (!agreed) {
      return { ok: false, status: 1, error: 'Setup cancelled.' };
    }
  }

  const libraryPath = options.flags.libraryPath;
  const cloudSyncProvider = libraryPath ? detectCloudSyncLibraryPath(libraryPath) : null;
  let confirmCloudSync = options.flags.confirmCloudSync;
  if (cloudSyncProvider && !confirmCloudSync) {
    if (!options.isTty) {
      return {
        ok: false,
        status: 2,
        error: `This folder looks like it syncs through ${cloudSyncProvider}. Re-run with --confirm-cloud-sync.`,
      };
    }
    confirmCloudSync = options.askConsent
      ? await options.askConsent(
          `This folder looks like it syncs through ${cloudSyncProvider}. Continue? [y/N] `,
        )
      : false;
    if (!confirmCloudSync) {
      return { ok: false, status: 1, error: 'Setup cancelled.' };
    }
  }

  const applySetup = options.applySetup ?? applyOnboardingSetup;
  const result = applySetup({
    consent: true,
    libraryPath,
    confirmCloudSync,
    initLibrary: true,
    installDeps: options.flags.installDeps,
  });
  return { ok: true, result };
}

export async function runStudioOnboardHostAction(options: {
  action: 'codex_login' | 'ask_codex';
  yes: boolean;
  isTty: boolean;
  prompt?: string;
  askConsent?: (question: string) => Promise<boolean>;
  applyHostAction?: typeof applyOnboardingHostAction;
}): Promise<
  { ok: true; result: OnboardingHostActionResult } | { ok: false; status: 1 | 2; error: string }
> {
  const consentMode = resolveStudioOnboardConsent({
    yes: options.yes,
    isTty: options.isTty,
  });
  if (consentMode === 'needs_yes') {
    return {
      ok: false,
      status: 2,
      error: 'Opening a visible Codex terminal needs explicit consent. Re-run with --yes.',
    };
  }
  if (consentMode === 'ask') {
    const question =
      options.action === 'codex_login'
        ? 'Open a visible terminal running `codex login`? [y/N] '
        : 'Open a visible interactive Codex CLI with the Setup Prompt? [y/N] ';
    const agreed = options.askConsent ? await options.askConsent(question) : false;
    if (!agreed) {
      return { ok: false, status: 1, error: 'Cancelled.' };
    }
  }

  const applyHostAction = options.applyHostAction ?? applyOnboardingHostAction;
  const prompt =
    options.action === 'ask_codex'
      ? (options.prompt ??
        `Use the repo-local skill at \`${CODEX_STUDIO_SETUP_SKILL_PATH}\` to complete Codex Studio setup.`)
      : null;
  const result = applyHostAction({
    consent: true,
    action: options.action,
    prompt,
  });
  return { ok: true, result };
}

async function askYesNo(question: string): Promise<boolean> {
  const readline = await import('node:readline/promises');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(question);
    return /^y(es)?$/i.test(answer.trim());
  } finally {
    rl.close();
  }
}

const isMain = typeof Bun !== 'undefined' && Bun.main === import.meta.path;

if (isMain) {
  const argv = process.argv.slice(2);
  const command = resolveStudioOnboardCommand(argv);
  if (command === 'probe') {
    const probe = await loadStudioOnboardProbe();
    console.log(JSON.stringify(probe, null, 2));
  } else if (command === 'setup') {
    const outcome = await runStudioOnboardSetup({
      flags: parseStudioOnboardSetupFlags(argv),
      isTty: Boolean(process.stdin.isTTY),
      askConsent: askYesNo,
    });
    if (!outcome.ok) {
      console.error(outcome.error);
      process.exit(outcome.status);
    }
    const probe = await loadStudioOnboardProbe();
    console.log(JSON.stringify({ ...outcome.result, probe }, null, 2));
  } else if (command === 'login' || command === 'ask_codex') {
    const outcome = await runStudioOnboardHostAction({
      action: command === 'login' ? 'codex_login' : 'ask_codex',
      yes: argv.includes('--yes'),
      isTty: Boolean(process.stdin.isTTY),
      askConsent: askYesNo,
    });
    if (!outcome.ok) {
      console.error(outcome.error);
      process.exit(outcome.status);
    }
    console.log(JSON.stringify(outcome.result, null, 2));
  } else {
    console.error(STUDIO_ONBOARD_USAGE);
    process.exit(1);
  }
}
