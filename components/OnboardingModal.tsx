import { useDialogFocus } from '../hooks/useDialogFocus';
import React from 'react';
import { AnimatePresence, MotionDiv } from '../lib/gsapMotion';
import {
  IconArrowRight as ArrowRight,
  IconCircleCheck as CheckCircle2,
  IconAlertCircle as CircleAlert,
  IconCircleDashed as CircleDashed,
  IconClipboard as Clipboard,
  IconClipboardCheck as ClipboardCheck,
  IconFolder as Folder,
  IconPhoto as ImageIcon,
  IconPlayerPlay as Play,
  IconRefresh as RefreshCw,
  IconSparkles as Sparkles,
  IconTerminal as Terminal,
  IconX as X,
} from '@tabler/icons-react';
import fallbackStyleRecipePreview from '../assets/recipes/styles/defaults/SP01-001.webp?url';
import stylePreviewSp01005 from '../assets/recipes/styles/defaults/SP01-005.webp?url';
import stylePreviewSp02001 from '../assets/recipes/styles/defaults/SP02-001.webp?url';
import stylePreviewSp02003 from '../assets/recipes/styles/defaults/SP02-003.webp?url';
import stylePreviewSp02004 from '../assets/recipes/styles/defaults/SP02-004.webp?url';
import stylePreviewSp06082 from '../assets/recipes/styles/defaults/SP06-082.webp?url';
import stylePreviewSp06095 from '../assets/recipes/styles/defaults/SP06-095.webp?url';
import stylePreviewSp11047 from '../assets/recipes/styles/defaults/SP11-047.webp?url';
import stylePreviewSp11050 from '../assets/recipes/styles/defaults/SP11-050.webp?url';
import {
  buildCodexStudioSetupPrompt,
  CODEX_STUDIO_SETUP_SKILL_PATH,
} from '../lib/onboardingSetupPrompt';
import {
  buildOnboardingStyleCarouselEntries,
  pickNextOnboardingStyleCarouselIndex,
  type OnboardingStyleCarouselEntry,
} from '../lib/onboardingStyleCarousel';
import { getOnboardingPreviewImage } from '../lib/onboardingPreviewCatalog';
import {
  ONBOARDING_ASK_CODEX_LABEL,
  type HealthResponse,
  type LocalCodexSessionResponse,
  type OnboardingCheck,
  type OnboardingProbe,
  type StudioReadinessSnapshot,
} from '../packages/shared/src';
import { resolveOnboardingPrimaryAction } from '../lib/onboardingPrimaryAction';
import { ProviderBrandMark } from './ProviderBrandMark';
import {
  buildInAppSetupRequest,
  inAppSetupCanSubmit,
  inAppSetupCloudProvider,
  resolveInAppSetupDraftPath,
} from '../lib/onboardingInAppSetup';
import { shouldShowAskCodex } from '../lib/onboardingHostActions';
import {
  grokRowNeedsInstall,
  grokRowNeedsLogin,
  ONBOARDING_GROK_INSTALL_URL,
} from '../lib/onboardingGrokRow';
import { StudioApiError } from '../services/studio-api/http';
import { runOnboardingHostAction, runOnboardingSetup } from '../services/studio-api/runtime';
import { createStudioEventStream } from '../services/studioEventSource';
import {
  appendOnboardingLogLine,
  ONBOARDING_LOG_PANEL_EMPTY,
  onboardingLogLineFromStage,
  onboardingLogLineFromSystemLog,
  type OnboardingLogLine,
} from '../lib/onboardingEventLog';

const ONBOARDING_STYLE_PREVIEW_IMAGES = {
  'SP01-005': getOnboardingPreviewImage('SP01-005', stylePreviewSp01005),
  'SP02-001': getOnboardingPreviewImage('SP02-001', stylePreviewSp02001),
  'SP02-003': getOnboardingPreviewImage('SP02-003', stylePreviewSp02003),
  'SP02-004': getOnboardingPreviewImage('SP02-004', stylePreviewSp02004),
  'SP06-082': getOnboardingPreviewImage('SP06-082', stylePreviewSp06082),
  'SP06-095': getOnboardingPreviewImage('SP06-095', stylePreviewSp06095),
  'SP11-047': getOnboardingPreviewImage('SP11-047', stylePreviewSp11047),
  'SP11-050': getOnboardingPreviewImage('SP11-050', stylePreviewSp11050),
};

type OnboardingStatus = 'idle' | 'checking' | 'starting' | 'ready';
type CheckTone = 'ready' | 'warning' | 'error' | 'pending';

const CODEX_RUNTIME_REPAIR_COMMANDS = [
  {
    label: 'Remove old shim',
    command: 'npm uninstall -g codex',
  },
  {
    label: 'Login ChatGPT',
    command: 'codex login',
  },
  {
    label: 'Check runtime',
    command: 'bun run runtime:doctor',
  },
] as const;

interface OnboardingModalProps {
  apiBase: string;
  error: string | null;
  health: HealthResponse | null;
  probe: OnboardingProbe | null;
  localCodexSession: LocalCodexSessionResponse | null;
  readiness: StudioReadinessSnapshot;
  status: OnboardingStatus;
  isDesktopRuntime: boolean;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onRefresh: () => void;
  onStartAppServer: () => void;
  onOpenSettings: () => void;
}

function getToneIcon(tone: CheckTone) {
  if (tone === 'ready') return CheckCircle2;
  if (tone === 'pending') return CircleDashed;
  return CircleAlert;
}

function CheckRow({
  detail,
  icon,
  meta,
  status,
  title,
  tone,
}: {
  detail: string;
  icon: React.ReactNode;
  meta?: string | null;
  status: string;
  title: string;
  tone: CheckTone;
}) {
  const StatusIcon = getToneIcon(tone);
  const toneClass = {
    ready: 'text-emerald-300',
    warning: 'text-amber-300',
    error: 'text-rose-300',
    pending: 'text-[color:var(--wb-muted)]',
  }[tone];

  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-start gap-4 border-b border-[color:var(--wb-line)] py-5 last:border-b-0 xl:grid-cols-[36px_minmax(0,1fr)_auto] xl:gap-3 xl:py-3">
      <div className="grid size-11 place-items-center rounded-2xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] text-blue-300 xl:size-9 xl:rounded-xl">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-[color:var(--wb-ink)] xl:text-sm">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[color:var(--wb-muted)] xl:mt-0.5 xl:text-xs xl:leading-5">
          {detail}
        </p>
        {meta ? (
          <p className="mt-2 inline-flex max-w-full rounded-lg border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-2.5 py-1 font-mono text-[11px] text-[color:var(--wb-muted)] xl:mt-1 xl:max-w-[18rem] xl:text-[10px]">
            <span className="truncate">{meta}</span>
          </p>
        ) : null}
      </div>
      <div className={`flex items-center gap-2 pt-1 text-sm xl:text-xs ${toneClass}`}>
        <span className="hidden sm:inline">{status}</span>
        <StatusIcon size={16} />
      </div>
    </div>
  );
}

function PreviewCard({ entry }: { entry: OnboardingStyleCarouselEntry }) {
  return (
    <div className="mt-6 grid grid-cols-[minmax(7.5rem,0.42fr)_minmax(0,1fr)] items-start gap-3 sm:grid-cols-1 sm:gap-4 lg:grid-cols-[minmax(15rem,0.7fr)_minmax(0,1fr)] xl:mt-4 xl:grid-cols-[minmax(9rem,0.32fr)_minmax(0,1fr)] xl:gap-4">
      <div className="mx-auto w-full max-w-[8.75rem] sm:max-w-[22rem] lg:max-w-[24rem] xl:max-w-[12rem] 2xl:max-w-[14rem]">
        <div className="relative overflow-hidden rounded-xl border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] shadow-2xl shadow-black/40">
          <div className="aspect-[2/3] w-full">
            <AnimatePresence mode="wait">
              <MotionDiv
                key={entry.presetId}
                initial={{ opacity: 0, scale: 1.035, x: 18, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.42, ease: 'power3.out' }}
                className="absolute inset-0 grid place-items-center"
              >
                <img
                  src={entry.imageUrl}
                  srcSet={entry.imageSrcSet}
                  sizes="(min-width: 1536px) 224px, (min-width: 1280px) 192px, (min-width: 1024px) 384px, (min-width: 640px) 352px, 140px"
                  alt={entry.alt}
                  width={1024}
                  height={1536}
                  className="h-full w-full object-contain"
                  loading="eager"
                  decoding="async"
                />
              </MotionDiv>
            </AnimatePresence>
          </div>
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/8" />
        </div>
        <div className="mt-2 flex flex-col gap-0.5 px-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2 xl:mt-1">
          <span className="min-w-0 truncate text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--wb-ink)]">
            {entry.styleName}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-[color:var(--wb-muted)]">{entry.presetId}</span>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3 sm:p-5 xl:p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 xl:mb-2">
          <span className="inline-flex items-center gap-2 rounded-lg border border-blue-400/2 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
            <Sparkles size={13} />
            <span className="hidden sm:inline">Styles recipe</span>
            <span className="sm:hidden">Style</span>
          </span>
          <span className="hidden rounded-lg border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--wb-muted)] sm:inline-flex">
            {entry.packName}
          </span>
        </div>
        <AnimatePresence mode="wait">
          <MotionDiv
            key={`${entry.presetId}-prompt`}
            initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.32, ease: 'power2.out' }}
          >
            <p className="text-sm font-semibold text-[color:var(--wb-ink)] xl:text-xs">{entry.styleName}</p>
            <p className="mt-2 rounded-lg border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-2.5 font-mono text-[10px] leading-5 text-[color:var(--wb-ink)] sm:mt-3 sm:p-3 sm:text-[12px] sm:leading-6 xl:mt-2 xl:max-h-28 xl:overflow-hidden xl:p-2 xl:text-[10px] xl:leading-5">
              {entry.prompt}
            </p>
          </MotionDiv>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SetupPromptCard({ prompt }: { prompt: string }) {
  const [copyState, setCopyState] = React.useState<'idle' | 'copied' | 'failed'>('idle');
  const CopyIcon = copyState === 'copied' ? ClipboardCheck : Clipboard;

  const copyPrompt = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2200);
    }
  }, [prompt]);

  return (
    <div className="mt-6 rounded-2xl border border-blue-500/2 bg-blue-500/[0.06] p-4 xl:mt-3 xl:p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-300 xl:text-[10px]">
            Codex setup handoff
          </p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--wb-muted)] xl:mt-1 xl:text-xs xl:leading-5">
            Prepared prompt for the repo-local setup skill.
          </p>
        </div>
        <button
          type="button"
          onClick={copyPrompt}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-400/2 bg-blue-500/12 px-3 text-[10px] font-black uppercase tracking-widest text-blue-100 transition-colors hover:bg-blue-500/20 xl:h-9 xl:px-2.5"
        >
          <CopyIcon size={15} />
          {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Failed' : 'Copy'}
        </button>
      </div>
      <p className="mt-3 truncate rounded-lg border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-2.5 py-1 font-mono text-[11px] text-[color:var(--wb-muted)] xl:mt-2 xl:text-[10px]">
        {CODEX_STUDIO_SETUP_SKILL_PATH}
      </p>
      <textarea
        readOnly
        value={prompt}
        aria-label="Codex Studio setup prompt"
        className="custom-scrollbar mt-3 h-52 w-full resize-none rounded-xl border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3 font-mono text-[11px] leading-5 text-[color:var(--wb-ink)] outline-none xl:hidden"
      />
      <details className="hidden xl:block">
        <summary className="mt-2 cursor-pointer rounded-lg border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-[color:var(--wb-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] hover:text-[color:var(--wb-ink)]">
          Prompt preview
        </summary>
        <textarea
          readOnly
          value={prompt}
          aria-label="Codex Studio setup prompt preview"
          className="custom-scrollbar mt-2 h-20 w-full resize-none rounded-xl border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-2 font-mono text-[10px] leading-4 text-[color:var(--wb-ink)] outline-none"
        />
      </details>
    </div>
  );
}

function CopyCommandButton({ command, label }: { command: string; label: string }) {
  const [copyState, setCopyState] = React.useState<'idle' | 'copied' | 'failed'>('idle');
  const CopyIcon = copyState === 'copied' ? ClipboardCheck : Clipboard;

  const copyCommand = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2200);
    }
  }, [command]);

  return (
    <button
      type="button"
      onClick={copyCommand}
      className="flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-3 text-left transition-colors hover:border-blue-400/2 hover:bg-blue-500/10 xl:min-h-9 xl:px-2.5"
    >
      <span className="min-w-0">
        <span className="block text-[10px] font-black uppercase tracking-widest text-[color:var(--wb-ink)]">
          {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : label}
        </span>
        <span className="mt-1 block truncate font-mono text-[11px] text-[color:var(--wb-muted)] xl:mt-0.5 xl:text-[10px]">
          {command}
        </span>
      </span>
      <CopyIcon size={15} className="shrink-0 text-blue-200" />
    </button>
  );
}

function InAppSetupForm({
  cloudProvider,
  confirmCloudSync,
  consent,
  error,
  libraryPath,
  onConfirmCloudSyncChange,
  onConsentChange,
  onLibraryPathChange,
}: {
  cloudProvider: string | null;
  confirmCloudSync: boolean;
  consent: boolean;
  error: string | null;
  libraryPath: string;
  onConfirmCloudSyncChange: (value: boolean) => void;
  onConsentChange: (value: boolean) => void;
  onLibraryPathChange: (value: string) => void;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-blue-500/2 bg-blue-500/[0.06] p-4 xl:mt-3 xl:p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-300 xl:text-[10px]">
        Studio Library
      </p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--wb-muted)] xl:mt-1 xl:text-xs xl:leading-5">
        Choose an absolute folder. Codex Studio stays in your home unless you pick another path.
      </p>
      <label className="mt-3 block xl:mt-2">
        <span className="sr-only">Studio Library path</span>
        <input
          type="text"
          value={libraryPath}
          onChange={(event) => onLibraryPathChange(event.target.value)}
          aria-label="Studio Library path"
          className="w-full rounded-xl border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 py-2.5 font-mono text-sm text-[color:var(--wb-ink)] outline-none focus:border-blue-400/2 xl:py-2 xl:text-xs"
        />
      </label>
      {cloudProvider ? (
        <label className="mt-3 flex items-start gap-2 text-sm leading-6 text-amber-200 xl:mt-2 xl:text-xs xl:leading-5">
          <input
            type="checkbox"
            checked={confirmCloudSync}
            onChange={(event) => onConfirmCloudSyncChange(event.target.checked)}
            className="mt-1"
          />
          <span>
            This folder looks like it syncs through {cloudProvider}. SQLite and images can break if
            the folder syncs. Continue anyway.
          </span>
        </label>
      ) : null}
      <label className="mt-3 flex items-start gap-2 text-sm leading-6 text-[color:var(--wb-ink)] xl:mt-2 xl:text-xs xl:leading-5">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => onConsentChange(event.target.checked)}
          className="mt-1"
        />
        <span>Create this Studio Library and write Bootstrap Configuration on this machine.</span>
      </label>
      {error ? (
        <p className="mt-3 rounded-xl border border-rose-500/2 bg-rose-500/8 px-3 py-2 text-sm leading-6 text-rose-200 xl:mt-2 xl:text-xs xl:leading-5">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function OptionalGrokRow({
  busy,
  onInstall,
  onLogin,
  row,
}: {
  busy: boolean;
  onInstall: () => void;
  onLogin: () => void;
  row: NonNullable<OnboardingProbe['grok']>;
}) {
  const needsInstall = grokRowNeedsInstall(row);
  const needsLogin = grokRowNeedsLogin(row);
  return (
    <div className="mt-5 rounded-2xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_3%,transparent)] p-4 xl:mt-3 xl:p-3">
      <div className="flex items-start gap-3">
        <ProviderBrandMark providerId="grok" size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--wb-muted)] xl:text-[10px]">
            Optional provider
          </p>
          <p className="mt-2 text-sm font-semibold text-[color:var(--wb-ink)] xl:mt-1 xl:text-xs">{row.label}</p>
          <p className="mt-1 text-sm leading-6 text-[color:var(--wb-muted)] xl:text-xs xl:leading-5">
            {row.detail}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 xl:mt-2">
        {needsLogin ? (
          <button
            type="button"
            onClick={onLogin}
            disabled={busy}
            className="inline-flex h-10 items-center rounded-xl border border-accent-400/2 bg-accent-500/18 px-3 text-[10px] font-black uppercase tracking-widest text-accent-50 transition-colors hover:bg-accent-500/28 disabled:cursor-not-allowed disabled:opacity-60 xl:h-9"
          >
            {busy ? 'Opening settings' : 'Sign in'}
          </button>
        ) : null}
        {needsInstall ? (
          <button
            type="button"
            onClick={onInstall}
            className="inline-flex h-10 items-center rounded-xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-3 text-[10px] font-black uppercase tracking-widest text-[color:var(--wb-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] xl:h-9"
          >
            Install Grok Build
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CodexRuntimeRepairCard({
  health,
  subscriptionReady,
  onRefresh,
}: {
  health: HealthResponse | null;
  subscriptionReady: boolean;
  onRefresh: () => void;
}) {
  const runtime = health?.codexRuntime ?? null;
  if (!runtime || runtime.canRunJobs || subscriptionReady) return null;

  const primaryIssue = runtime.issues[0];
  const selectedCandidate = runtime.candidates.find((candidate) => candidate.selected);

  return (
    <div className="mt-5 rounded-2xl border border-rose-500/2 bg-rose-500/[0.06] p-4 xl:mt-3 xl:p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-rose-200 xl:text-[10px]">
            Codex runtime repair
          </p>
          <p className="mt-2 text-sm leading-6 text-rose-100 xl:mt-1 xl:text-xs xl:leading-5">
            {primaryIssue?.message ?? runtime.recommendedAction}
          </p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--wb-muted)] xl:mt-1 xl:text-xs xl:leading-5">
            {runtime.recommendedAction}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-3 text-[10px] font-black uppercase tracking-widest text-[color:var(--wb-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)] xl:h-9"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-2 xl:mt-3 xl:grid-cols-3">
        <p className="truncate rounded-lg border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-2.5 py-1 font-mono text-[11px] text-[color:var(--wb-muted)] xl:text-[10px]">
          selected: {runtime.selectedExecutable}
        </p>
        <p className="truncate rounded-lg border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-2.5 py-1 font-mono text-[11px] text-[color:var(--wb-muted)] xl:text-[10px]">
          command: {runtime.selectedCommand}
        </p>
        {selectedCandidate ? (
          <p className="truncate rounded-lg border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-2.5 py-1 font-mono text-[11px] text-[color:var(--wb-muted)] xl:text-[10px]">
            source: {selectedCandidate.source}
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:mt-3 xl:grid-cols-3">
        {CODEX_RUNTIME_REPAIR_COMMANDS.map((item) => (
          <CopyCommandButton key={item.command} label={item.label} command={item.command} />
        ))}
      </div>

      <div className="mt-4 grid gap-1.5 xl:hidden">
        {runtime.candidates.slice(0, 5).map((candidate) => (
          <div
            key={`${candidate.source}-${candidate.executable}`}
            className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2 rounded-lg border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-2.5 py-1.5 font-mono text-[10px] text-[color:var(--wb-muted)]"
          >
            <span className={candidate.selected ? 'text-rose-200' : 'text-[color:var(--wb-dim)]'}>
              {candidate.selected ? 'selected' : candidate.exists ? 'exists' : 'missing'}
            </span>
            <span className="truncate">{candidate.executable}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OnboardingLogPanel({ lines }: { lines: OnboardingLogLine[] }) {
  const endRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  return (
    <section
      aria-live="polite"
      aria-label="Setup log"
      className="mt-4 rounded-xl border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 py-3 xl:mt-3"
    >
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--wb-muted)] xl:text-[10px]">
        Setup log
      </p>
      <div className="custom-scrollbar mt-2 max-h-36 overflow-y-auto font-mono text-[11px] leading-5 text-[color:var(--wb-muted)] xl:max-h-28 xl:text-[10px] xl:leading-4">
        {lines.length === 0 ? (
          <p>{ONBOARDING_LOG_PANEL_EMPTY}</p>
        ) : (
          lines.map((line) => (
            <p key={line.id} className={line.kind === 'stage' ? 'text-[color:var(--wb-ink)]' : undefined}>
              {line.text}
            </p>
          ))
        )}
        <div ref={endRef} />
      </div>
    </section>
  );
}

function checkIcon(id: OnboardingCheck['id']) {
  if (id === 'studio_library' || id === 'bootstrap_config') return <Folder size={18} />;
  if (id === 'chatgpt_login') return <Sparkles size={18} />;
  return <Terminal size={18} />;
}

function checkTone(ready: boolean, backendReachable: boolean): CheckTone {
  if (!backendReachable) return 'pending';
  return ready ? 'ready' : 'warning';
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  apiBase,
  error,
  health,
  probe,
  localCodexSession,
  readiness,
  status,
  isDesktopRuntime,
  isOpen,
  onClose,
  onComplete,
  onRefresh,
  onStartAppServer,
  onOpenSettings,
}) => {
  const isChecking = status === 'checking';
  const isReady = status === 'ready';
  const isStartingAppServer = status === 'starting';
  const dialogRef = useDialogFocus(isOpen, onClose, '[aria-label^="Open runtime status:"]');
  const backendReachable = !error && Boolean(health);
  const codexRuntimeBlocked = Boolean(health?.codexRuntime && !health.codexRuntime.canRunJobs);
  const canStartAppServer = backendReachable && !health?.appServer.running && !codexRuntimeBlocked;
  const subscriptionReady = Boolean(probe?.facts.codexSubscriptionReady);
  const libraryReady = Boolean(health?.checks.libraryReady);
  const codexReady = Boolean(localCodexSession?.canRunLocalJobs || subscriptionReady);
  const appServerReady = Boolean(health?.appServer.running || subscriptionReady);
  const [libraryPathDraft, setLibraryPathDraft] = React.useState('');
  const [consent, setConsent] = React.useState(false);
  const [confirmCloudSync, setConfirmCloudSync] = React.useState(false);
  const [setupBusy, setSetupBusy] = React.useState(false);
  const [setupError, setSetupError] = React.useState<string | null>(null);
  const [hostBusy, setHostBusy] = React.useState(false);
  const [hostError, setHostError] = React.useState<string | null>(null);
  const [logLines, setLogLines] = React.useState<OnboardingLogLine[]>([]);
  const lastProbePath = React.useRef<string | null>(null);
  const primaryAction = probe ? resolveOnboardingPrimaryAction(probe.primaryCta) : null;
  const showLegacyStartAppServer = canStartAppServer && primaryAction?.type !== 'start_app_server';
  const showInAppSetup = primaryAction?.type === 'in_app_setup';
  const cloudProvider = inAppSetupCloudProvider(libraryPathDraft);
  const canSubmitSetup = inAppSetupCanSubmit({
    consent,
    libraryPath: libraryPathDraft,
    confirmCloudSync,
  });
  const showAskCodex = shouldShowAskCodex(probe?.facts);

  const libraryTone: CheckTone = !backendReachable ? 'pending' : libraryReady ? 'ready' : 'warning';
  const sessionTone: CheckTone = !backendReachable
    ? 'pending'
    : codexReady
      ? 'ready'
      : localCodexSession?.state === 'unsupported_auth'
        ? 'error'
        : 'warning';
  const serverTone: CheckTone = !backendReachable
    ? 'pending'
    : appServerReady
      ? 'ready'
      : codexRuntimeBlocked
        ? 'error'
        : 'warning';
  const runtimeLabel = isDesktopRuntime ? 'Desktop runtime' : 'Web runtime';
  const headline = isReady
    ? 'Welcome to Codex Studio'
    : readiness.title || 'Welcome to Codex Studio';
  const intro = isReady
    ? 'Create images with Codex and manage your library on this machine.'
    : readiness.description;
  const previewEntries = React.useMemo(
    () =>
      buildOnboardingStyleCarouselEntries(
        ONBOARDING_STYLE_PREVIEW_IMAGES,
        fallbackStyleRecipePreview,
      ),
    [],
  );
  const [previewIndex, setPreviewIndex] = React.useState(0);
  const previewEntry = previewEntries[previewIndex] ?? previewEntries[0];
  const setupPrompt = React.useMemo(
    () =>
      buildCodexStudioSetupPrompt({
        apiBase,
        health,
        isDesktopRuntime,
        localCodexSession,
        readiness,
      }),
    [apiBase, health, isDesktopRuntime, localCodexSession, readiness],
  );
  const sessionDetail = codexReady
    ? 'You are signed in and ready to generate.'
    : codexRuntimeBlocked
      ? (health?.codexRuntime.recommendedAction ?? 'Repair the local Codex runtime.')
      : localCodexSession?.reason === 'chatgpt_login_required'
        ? 'Run codex login and choose ChatGPT.'
        : localCodexSession?.error || 'Connect your local Codex session.';
  const appServerDetail = appServerReady
    ? 'Codex app-server is running and reachable.'
    : codexRuntimeBlocked
      ? (health?.codexRuntime.recommendedAction ?? 'Repair the local Codex runtime.')
      : 'Start the local app-server when the backend is ready.';

  React.useEffect(() => {
    if (!isOpen || previewEntries.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setPreviewIndex((currentIndex) =>
        pickNextOnboardingStyleCarouselIndex(previewEntries.length, currentIndex),
      );
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [isOpen, previewEntries.length]);

  React.useEffect(() => {
    const next = resolveInAppSetupDraftPath(probe);
    if (lastProbePath.current === next) return;
    lastProbePath.current = next;
    setLibraryPathDraft(next);
    setConfirmCloudSync(false);
    setSetupError(null);
  }, [probe]);

  React.useEffect(() => {
    if (!isOpen) return;
    const stream = createStudioEventStream(apiBase);
    const unstage = stream.onOnboardingStage((payload) => {
      setLogLines((lines) => appendOnboardingLogLine(lines, onboardingLogLineFromStage(payload)));
    });
    const unlog = stream.onLogAdded((entry) => {
      const line = onboardingLogLineFromSystemLog(entry);
      if (!line) return;
      setLogLines((lines) => appendOnboardingLogLine(lines, line));
    });
    return () => {
      unstage();
      unlog();
      stream.close();
    };
  }, [apiBase, isOpen]);

  const runSetup = React.useCallback(async () => {
    if (!inAppSetupCanSubmit({ consent, libraryPath: libraryPathDraft, confirmCloudSync })) {
      return;
    }
    setSetupBusy(true);
    setSetupError(null);
    try {
      await runOnboardingSetup(
        buildInAppSetupRequest({
          consent,
          libraryPath: libraryPathDraft,
          confirmCloudSync,
        }),
      );
      onRefresh();
    } catch (caught) {
      setSetupError(
        caught instanceof StudioApiError || caught instanceof Error
          ? caught.message
          : 'Setup failed.',
      );
    } finally {
      setSetupBusy(false);
    }
  }, [confirmCloudSync, consent, libraryPathDraft, onRefresh]);

  const runHostAction = React.useCallback(
    async (action: 'codex_login' | 'ask_codex' | 'grok_login') => {
      setHostBusy(true);
      setHostError(null);
      try {
        const result = await runOnboardingHostAction({
          consent: true,
          action,
          prompt: action === 'ask_codex' ? setupPrompt : null,
        });
        if (!result.ok) {
          setHostError(result.error ?? `Run this in the repo root: ${result.command}`);
        }
        onRefresh();
      } catch (caught) {
        setHostError(
          caught instanceof StudioApiError || caught instanceof Error
            ? caught.message
            : 'Could not open a visible terminal.',
        );
      } finally {
        setHostBusy(false);
      }
    },
    [onRefresh, setupPrompt],
  );

  const handlePrimaryCta = React.useCallback(() => {
    if (!primaryAction) {
      onComplete();
      return;
    }
    if (primaryAction.type === 'open_url') {
      window.open(primaryAction.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (primaryAction.type === 'start_app_server') {
      onStartAppServer();
      return;
    }
    if (primaryAction.type === 'in_app_setup') {
      void runSetup();
      return;
    }
    if (primaryAction.type === 'codex_login') {
      onOpenSettings();
      return;
    }
    if (primaryAction.type === 'complete') {
      onComplete();
    }
  }, [onComplete, onOpenSettings, onStartAppServer, primaryAction, runSetup]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-120">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 studio-scrim backdrop-blur-md"
          />

          <MotionDiv
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Help and setup"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.98, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 16 }}
            className="studio-dialog relative z-10 flex h-full w-full flex-col overflow-hidden"
          >
            <header className="flex items-center justify-between border-b border-[color:var(--wb-line)] px-5 py-4 sm:px-14 xl:px-10 xl:py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] text-blue-300 xl:size-9 xl:rounded-xl">
                  <ImageIcon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-black uppercase tracking-widest text-[color:var(--wb-ink)] xl:text-base">
                    Codex <span className="font-semibold text-[color:var(--wb-muted)]">Studio</span>
                  </p>
                  <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--wb-dim)]">
                    {runtimeLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isChecking}
                  className="hidden h-10 items-center gap-2 rounded-xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-3 text-[10px] font-black uppercase tracking-widest text-[color:var(--wb-ink)] transition-colors hover:border-[color:var(--wb-border)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)] disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
                >
                  <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
                  Status
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid size-10 place-items-center rounded-xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] text-[color:var(--wb-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
                  aria-label="Close onboarding"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            <main className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-8 sm:py-8 lg:px-10 xl:overflow-hidden xl:px-8 xl:py-4">
              <div className="mx-auto w-full max-w-[100rem] xl:flex xl:h-full xl:max-w-[92rem] xl:flex-col">
                <section className="border-b border-[color:var(--wb-line)] pb-7 sm:pb-9 xl:flex xl:items-end xl:justify-between xl:gap-8 xl:pb-3">
                  <div className="min-w-0">
                    <h2 className="max-w-4xl text-3xl font-semibold leading-tight text-[color:var(--wb-ink)] sm:text-5xl xl:text-4xl">
                      {headline}
                    </h2>
                    <p className="mt-4 max-w-3xl text-base leading-7 text-[color:var(--wb-muted)] sm:text-lg xl:mt-2 xl:max-w-2xl xl:text-sm xl:leading-6">
                      {error ? 'Could not query the local backend.' : intro}
                    </p>
                    {error ? (
                      <p className="mt-3 max-w-3xl rounded-xl border border-rose-500/2 bg-rose-500/8 px-4 py-3 text-sm leading-6 text-rose-200 xl:mt-2 xl:py-2 xl:text-xs xl:leading-5">
                        {error}
                      </p>
                    ) : null}
                  </div>
                </section>

                <section className="grid gap-7 py-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(21rem,0.78fr)] xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(28rem,0.75fr)] xl:gap-5 xl:py-4 2xl:grid-cols-[minmax(0,1.05fr)_minmax(30rem,0.7fr)]">
                  <div className="min-w-0 xl:flex xl:min-h-0 xl:flex-col">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-300 xl:text-[10px]">
                      Create images with Codex
                    </p>
                    <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--wb-ink)] xl:mt-3 xl:text-sm xl:leading-6">
                      Describe what you want. Codex turns the prompt into images while your library
                      and outputs stay on this machine.
                    </p>
                    <PreviewCard entry={previewEntry} />
                    <p className="mt-5 flex items-start gap-2 text-sm leading-6 text-[color:var(--wb-muted)] xl:mt-3 xl:text-xs xl:leading-5">
                      <Folder size={15} />
                      Your library is stored locally. Generation sends prompts and selected
                      references to your chosen provider.
                    </p>
                  </div>

                  <div className="min-w-0 lg:border-l lg:border-[color:var(--wb-line)] lg:pl-7 xl:min-h-0 xl:pl-6">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-300 xl:text-[10px]">
                      Local environment check
                    </p>
                    <div className="mt-4 xl:mt-3">
                      {probe ? (
                        probe.checks.map((row) => (
                          <CheckRow
                            key={row.id}
                            icon={checkIcon(row.id)}
                            title={row.label}
                            detail={row.detail}
                            meta={row.meta}
                            status={row.ready ? 'Ready' : 'Needs attention'}
                            tone={checkTone(row.ready, backendReachable)}
                          />
                        ))
                      ) : (
                        <>
                          <CheckRow
                            icon={<Folder size={18} />}
                            title="Studio Library"
                            detail={
                              libraryReady
                                ? 'Your assets and generations are stored locally.'
                                : 'Repair the local library path or permissions.'
                            }
                            meta={health?.libraryDir || 'path not set'}
                            status={libraryReady ? 'Ready' : 'Needs attention'}
                            tone={libraryTone}
                          />
                          <CheckRow
                            icon={<Sparkles size={18} />}
                            title="ChatGPT Codex login"
                            detail={sessionDetail}
                            meta={localCodexSession?.authLabel}
                            status={codexReady ? 'Ready' : 'Action needed'}
                            tone={sessionTone}
                          />
                          <CheckRow
                            icon={<Terminal size={18} />}
                            title="app-server connection"
                            detail={appServerDetail}
                            meta={appServerReady ? health?.appServer.wsUrl : apiBase}
                            status={
                              appServerReady
                                ? 'Running'
                                : codexRuntimeBlocked
                                  ? 'Blocked'
                                  : 'Not running'
                            }
                            tone={serverTone}
                          />
                        </>
                      )}
                    </div>
                    <OnboardingLogPanel lines={logLines} />
                    <CodexRuntimeRepairCard
                      health={health}
                      subscriptionReady={subscriptionReady}
                      onRefresh={onRefresh}
                    />
                    {probe?.grok ? (
                      <OptionalGrokRow
                        row={probe.grok}
                        busy={false}
                        onInstall={() => {
                          window.open(ONBOARDING_GROK_INSTALL_URL, '_blank', 'noopener,noreferrer');
                        }}
                        onLogin={onOpenSettings}
                      />
                    ) : null}
                    {showInAppSetup ? (
                      <InAppSetupForm
                        libraryPath={libraryPathDraft}
                        consent={consent}
                        confirmCloudSync={confirmCloudSync}
                        cloudProvider={cloudProvider}
                        error={setupError}
                        onLibraryPathChange={setLibraryPathDraft}
                        onConsentChange={setConsent}
                        onConfirmCloudSyncChange={setConfirmCloudSync}
                      />
                    ) : null}
                    <SetupPromptCard prompt={setupPrompt} />
                  </div>
                </section>
              </div>
            </main>

            <footer className="border-t border-[color:var(--wb-line)] px-5 py-4 sm:px-14 sm:py-5 xl:px-10 xl:py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handlePrimaryCta}
                    disabled={
                      (primaryAction?.type === 'start_app_server' && isStartingAppServer) ||
                      (primaryAction?.type === 'in_app_setup' && (!canSubmitSetup || setupBusy))
                    }
                    className="inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-[color:var(--wb-ink)] shadow-[0_14px_40px_rgba(37,99,235,0.28)] transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 xl:px-5 xl:py-2.5"
                  >
                    {primaryAction?.type === 'start_app_server' && isStartingAppServer
                      ? 'Starting'
                      : primaryAction?.type === 'in_app_setup' && setupBusy
                        ? 'Setting up'
                        : primaryAction?.type === 'codex_login'
                          ? primaryAction.label
                          : (primaryAction?.label ?? (isReady ? 'Open Studio' : 'Got it'))}
                    <ArrowRight size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isChecking}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-5 py-3 text-sm font-semibold text-[color:var(--wb-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)] disabled:cursor-not-allowed disabled:opacity-60 xl:px-4 xl:py-2.5"
                  >
                    <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                  {showAskCodex ? (
                    <button
                      type="button"
                      onClick={() => void runHostAction('ask_codex')}
                      disabled={hostBusy}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-5 py-3 text-sm font-semibold text-[color:var(--wb-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)] disabled:cursor-not-allowed disabled:opacity-60 xl:px-4 xl:py-2.5"
                    >
                      <Terminal size={16} />
                      {hostBusy ? 'Opening terminal' : ONBOARDING_ASK_CODEX_LABEL}
                    </button>
                  ) : null}
                  {showLegacyStartAppServer ? (
                    <button
                      type="button"
                      onClick={onStartAppServer}
                      disabled={isStartingAppServer}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/2 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-200 transition-colors hover:bg-blue-500/18 disabled:cursor-not-allowed disabled:opacity-60 xl:px-4 xl:py-2.5"
                    >
                      <Play size={16} />
                      {isStartingAppServer ? 'Starting' : 'Start app-server'}
                    </button>
                  ) : null}
                </div>
                {hostError ? (
                  <p className="rounded-xl border border-rose-500/2 bg-rose-500/8 px-3 py-2 text-sm leading-6 text-rose-200 xl:text-xs xl:leading-5">
                    {hostError}
                  </p>
                ) : (
                  <div className="hidden items-center gap-2 text-sm text-[color:var(--wb-muted)] md:flex">
                    <Folder size={15} />
                    Local-first. Private by design. Built for creators.
                  </div>
                )}
              </div>
            </footer>
          </MotionDiv>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
