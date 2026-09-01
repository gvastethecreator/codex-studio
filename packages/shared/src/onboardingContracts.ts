export type OnboardingPrimaryCta =
  | 'open_bun_install'
  | 'open_codex_install'
  | 'codex_login'
  | 'in_app_setup'
  | 'start_app_server'
  | 'ready';

export const ONBOARDING_STAGE_IDS = [
  'setup_start',
  'write_bootstrap',
  'init_library',
  'install_deps',
  'spawn_host',
  'reprobe',
  'complete',
  'failed',
] as const;

export type OnboardingStageId = (typeof ONBOARDING_STAGE_IDS)[number];
export type OnboardingStreamAction = 'setup' | 'host_action';

export interface OnboardingStagePayload {
  action: OnboardingStreamAction;
  stage: OnboardingStageId;
  message: string;
}

export type OnboardingProgressEvent =
  | { kind: 'stage'; stage: OnboardingStageId; message: string }
  | { kind: 'log'; message: string; level?: 'info' | 'warn' | 'error' };

export const ONBOARDING_ACTION_IDS = [
  'init_library',
  'install_deps',
  'start_app_server',
  'open_url',
  'spawn_codex_login',
  'spawn_ask_codex',
  'spawn_grok_login',
] as const;

export type OnboardingActionId = (typeof ONBOARDING_ACTION_IDS)[number];

export type OnboardingCheckId =
  | 'bun'
  | 'codex_cli'
  | 'chatgpt_login'
  | 'studio_library'
  | 'bootstrap_config'
  | 'app_server';

export const ONBOARDING_BUN_INSTALL_URL = 'https://bun.sh/docs/installation';
export const ONBOARDING_CODEX_INSTALL_URL = 'https://github.com/openai/codex';
export const ONBOARDING_GROK_INSTALL_URL = 'https://docs.x.ai/build/overview';

export const ONBOARDING_PRIMARY_CTA_LABEL: Record<OnboardingPrimaryCta, string> = {
  open_bun_install: 'Install Bun',
  open_codex_install: 'Install Codex CLI',
  codex_login: 'Log in with ChatGPT',
  in_app_setup: 'Set up Studio',
  start_app_server: 'Start app-server',
  ready: 'Open Studio',
};

export interface OnboardingFacts {
  bunAvailable: boolean;
  codexCliAvailable: boolean;
  chatgptLoggedIn: boolean;
  codexSubscriptionReady?: boolean;
  studioLibraryReady: boolean;
  studioLibraryPath: string;
  bootstrapConfigReady: boolean;
  appServerReady: boolean;
  grokCliAvailable: boolean;
  grokLoggedIn: boolean;
}

export interface OnboardingCheck {
  id: OnboardingCheckId;
  ready: boolean;
  label: string;
  detail: string;
  meta: string | null;
}

export interface OnboardingGrokRow {
  cliAvailable: boolean;
  loggedIn: boolean;
  label: string;
  detail: string;
}

export interface OnboardingProbe {
  facts: OnboardingFacts;
  checks: OnboardingCheck[];
  primaryCta: OnboardingPrimaryCta;
  studioLibraryPath: string;
  grok: OnboardingGrokRow;
}

export function resolvePrimaryCta(facts: OnboardingFacts): OnboardingPrimaryCta {
  if (!facts.bunAvailable) return 'open_bun_install';
  if (!facts.codexCliAvailable && !facts.codexSubscriptionReady) return 'open_codex_install';
  if (!facts.chatgptLoggedIn) return 'codex_login';
  if (!facts.studioLibraryReady || !facts.bootstrapConfigReady) return 'in_app_setup';
  if (!facts.appServerReady && !facts.codexSubscriptionReady) return 'start_app_server';
  return 'ready';
}

function check(
  id: OnboardingCheckId,
  ready: boolean,
  label: string,
  detail: string,
  meta: string | null,
): OnboardingCheck {
  return { id, ready, label, detail, meta };
}

export function buildOnboardingProbe(facts: OnboardingFacts): OnboardingProbe {
  const studioLibraryPath = facts.studioLibraryPath.trim();
  return {
    facts: {
      ...facts,
      studioLibraryPath,
    },
    studioLibraryPath,
    primaryCta: resolvePrimaryCta(facts),
    checks: [
      check(
        'bun',
        facts.bunAvailable,
        'Bun',
        facts.bunAvailable
          ? 'The local Bun runtime is available.'
          : 'Install Bun from the official installer, then restart Codex Studio.',
        null,
      ),
      check(
        'codex_cli',
        facts.codexCliAvailable || Boolean(facts.codexSubscriptionReady),
        'Codex CLI',
        facts.codexCliAvailable
          ? 'Codex CLI is on this machine.'
          : facts.codexSubscriptionReady
            ? 'Studio Sign in is ready. Codex CLI stays as fallback.'
            : 'Install Codex CLI, then return here.',
        null,
      ),
      check(
        'chatgpt_login',
        facts.chatgptLoggedIn,
        'ChatGPT login',
        facts.chatgptLoggedIn
          ? 'ChatGPT login is ready for Studio image jobs.'
          : 'Sign in from Studio Settings, or run `codex login` and choose ChatGPT.',
        null,
      ),
      check(
        'studio_library',
        facts.studioLibraryReady,
        'Studio Library',
        facts.studioLibraryReady
          ? 'Assets and generations stay in this folder.'
          : 'Create or repair the Studio Library folder.',
        studioLibraryPath || null,
      ),
      check(
        'bootstrap_config',
        facts.bootstrapConfigReady,
        'Bootstrap Configuration',
        facts.bootstrapConfigReady
          ? '.env.local is present.'
          : 'Run Setup to write Bootstrap Configuration.',
        null,
      ),
      check(
        'app_server',
        facts.appServerReady || Boolean(facts.codexSubscriptionReady),
        'Codex Product Runtime',
        facts.appServerReady
          ? 'codex app-server is running.'
          : facts.codexSubscriptionReady
            ? 'Studio Sign in is ready. Codex Product Runtime stays as fallback.'
            : 'Start app-server after Codex CLI and ChatGPT login are ready.',
        null,
      ),
    ],
    grok: {
      cliAvailable: facts.grokCliAvailable,
      loggedIn: facts.grokLoggedIn,
      label: 'Grok Imagine',
      detail: facts.grokLoggedIn
        ? 'Grok Imagine is signed in.'
        : facts.grokCliAvailable
          ? 'Optional. Sign in from Studio Settings, or run grok login.'
          : 'Optional. Sign in from Studio Settings, or install Grok Build.',
    },
  };
}

export function onboardingFactsFromHealth(input: {
  bunVersion: string | null;
  codexCliAvailable: boolean;
  chatgptLoggedIn: boolean;
  codexSubscriptionReady?: boolean;
  studioLibraryReady: boolean;
  studioLibraryPath: string;
  bootstrapConfigReady: boolean;
  appServerReady: boolean;
  grokCliAvailable?: boolean;
  grokLoggedIn?: boolean;
}): OnboardingFacts {
  return {
    bunAvailable: Boolean(input.bunVersion),
    codexCliAvailable: input.codexCliAvailable,
    chatgptLoggedIn: input.chatgptLoggedIn,
    codexSubscriptionReady: Boolean(input.codexSubscriptionReady),
    studioLibraryReady: input.studioLibraryReady,
    studioLibraryPath: input.studioLibraryPath,
    bootstrapConfigReady: input.bootstrapConfigReady,
    appServerReady: input.appServerReady,
    grokCliAvailable: Boolean(input.grokCliAvailable),
    grokLoggedIn: Boolean(input.grokLoggedIn),
  };
}

export const DEFAULT_STUDIO_LIBRARY_FOLDER_NAME = 'Codex Studio';
export const PORTABLE_STUDIO_LIBRARY_FOLDER_NAME = 'Codex Studio Library';

const CLOUD_SYNC_MARKERS: Array<{ needle: string; label: string }> = [
  { needle: '/onedrive', label: 'OneDrive' },
  { needle: '/dropbox', label: 'Dropbox' },
  { needle: '/google drive', label: 'Google Drive' },
  { needle: '/googledrive', label: 'Google Drive' },
  { needle: '/icloud drive', label: 'iCloud' },
  { needle: '/mobile documents/', label: 'iCloud' },
];

export function detectCloudSyncLibraryPath(libraryPath: string): string | null {
  const normalized = `/${libraryPath.trim().replace(/\\/g, '/').toLowerCase()}`;
  for (const marker of CLOUD_SYNC_MARKERS) {
    if (normalized.includes(marker.needle)) return marker.label;
  }
  return null;
}

export interface OnboardingSetupRequest {
  consent: boolean;
  libraryPath: string | null;
  confirmCloudSync: boolean;
  initLibrary: boolean;
  installDeps: boolean;
}

export interface OnboardingSetupErrorBody {
  error: string;
  code: 'consent_required' | 'cloud_sync_confirm_required' | 'invalid_library_path';
  cloudSyncProvider?: string;
}

export interface OnboardingSetupResult {
  ok: true;
  libraryPath: string;
  wroteEnv: boolean;
  initializedLibrary: boolean;
  installedDeps: boolean;
  skippedDepInstall: boolean;
  cloudSyncProvider: string | null;
}

export interface OnboardingSetupSuccessResponse extends OnboardingSetupResult {
  probe: OnboardingProbe;
}

export type OnboardingHostActionId = 'codex_login' | 'ask_codex' | 'grok_login';

export const ONBOARDING_ASK_CODEX_LABEL = 'Ask Codex';

export interface OnboardingHostActionRequest {
  consent: boolean;
  action: OnboardingHostActionId | null;
  prompt: string | null;
}

export interface OnboardingHostActionResult {
  ok: boolean;
  action: OnboardingHostActionId;
  command: string;
  cwd: string;
  error: string | null;
  probe?: OnboardingProbe;
}

export interface OnboardingHostActionErrorBody {
  error: string;
  code: 'consent_required' | 'invalid_host_action' | 'missing_setup_prompt';
}

export function parseOnboardingHostActionRequest(value: unknown): OnboardingHostActionRequest {
  const input = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const action =
    input.action === 'codex_login' || input.action === 'ask_codex' || input.action === 'grok_login'
      ? input.action
      : null;
  const prompt =
    typeof input.prompt === 'string' && input.prompt.trim() ? input.prompt.trim() : null;
  return {
    consent: input.consent === true,
    action,
    prompt,
  };
}

export function isOnboardingHostActionId(value: unknown): value is OnboardingHostActionId {
  return value === 'codex_login' || value === 'ask_codex' || value === 'grok_login';
}

export function looksLikeAbsoluteLibraryPath(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') || trimmed.startsWith('\\\\')) return true;
  return /^[A-Za-z]:[\\/]/.test(trimmed);
}

export function parseOnboardingSetupRequest(value: unknown): OnboardingSetupRequest {
  const input = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const libraryPath =
    typeof input.libraryPath === 'string' && input.libraryPath.trim()
      ? input.libraryPath.trim()
      : null;
  return {
    consent: input.consent === true,
    libraryPath,
    confirmCloudSync: input.confirmCloudSync === true,
    initLibrary: input.initLibrary !== false,
    installDeps: input.installDeps === true,
  };
}
