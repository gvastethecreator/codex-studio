import React from 'react';
import { AnimatePresence, MotionDiv } from 'motion/react';
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
import {
  buildCodexStudioSetupPrompt,
  CODEX_STUDIO_SETUP_SKILL_PATH,
} from '../lib/onboardingSetupPrompt';
import {
  buildOnboardingStyleCarouselEntries,
  pickNextOnboardingStyleCarouselIndex,
  type OnboardingStyleCarouselEntry,
} from '../lib/onboardingStyleCarousel';
import { STYLE_AVAILABLE_DEFAULT_IMAGES } from '../lib/recipeAssetCatalog';
import type {
  HealthResponse,
  LocalCodexSessionResponse,
  StudioReadinessSnapshot,
} from '../packages/shared/src';

type OnboardingStatus = 'idle' | 'checking' | 'starting' | 'ready';
type CheckTone = 'ready' | 'warning' | 'error' | 'pending';

interface OnboardingModalProps {
  apiBase: string;
  error: string | null;
  health: HealthResponse | null;
  localCodexSession: LocalCodexSessionResponse | null;
  readiness: StudioReadinessSnapshot;
  status: OnboardingStatus;
  isDesktopRuntime: boolean;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onRefresh: () => void;
  onStartAppServer: () => void;
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
    pending: 'text-zinc-500',
  }[tone];

  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-start gap-4 border-b border-white/8 py-5 last:border-b-0">
      <div className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-blue-300">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-zinc-400">{detail}</p>
        {meta ? (
          <p className="mt-2 inline-flex max-w-full rounded-lg border border-white/8 bg-black/30 px-2.5 py-1 font-mono text-[11px] text-zinc-500">
            <span className="truncate">{meta}</span>
          </p>
        ) : null}
      </div>
      <div className={`flex items-center gap-2 pt-1 text-sm ${toneClass}`}>
        <span className="hidden sm:inline">{status}</span>
        <StatusIcon size={16} />
      </div>
    </div>
  );
}

function PreviewCard({ entry }: { entry: OnboardingStyleCarouselEntry }) {
  return (
    <div className="mt-6 grid grid-cols-[minmax(7.5rem,0.42fr)_minmax(0,1fr)] items-start gap-3 sm:grid-cols-1 sm:gap-4 lg:grid-cols-[minmax(15rem,0.7fr)_minmax(0,1fr)] xl:gap-5">
      <div className="mx-auto w-full max-w-[8.75rem] sm:max-w-[22rem] lg:max-w-[24rem]">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/45 shadow-2xl shadow-black/40">
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
                  alt={entry.alt}
                  className="h-full w-full object-contain"
                  loading="eager"
                  decoding="async"
                />
              </MotionDiv>
            </AnimatePresence>
          </div>
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/8" />
        </div>
        <div className="mt-2 flex flex-col gap-0.5 px-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <span className="min-w-0 truncate text-[10px] font-black uppercase tracking-[0.2em] text-white">
            {entry.styleName}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-zinc-400">{entry.presetId}</span>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/35 p-3 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4">
          <span className="inline-flex items-center gap-2 rounded-lg border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
            <Sparkles size={13} />
            <span className="hidden sm:inline">Styles recipe</span>
            <span className="sm:hidden">Style</span>
          </span>
          <span className="hidden rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 sm:inline-flex">
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
            <p className="text-sm font-semibold text-white">{entry.styleName}</p>
            <p className="mt-2 rounded-lg border border-white/8 bg-black/35 p-2.5 font-mono text-[10px] leading-5 text-zinc-300 sm:mt-3 sm:p-3 sm:text-[12px] sm:leading-6">
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
    <div className="mt-6 rounded-2xl border border-blue-500/18 bg-blue-500/[0.06] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-300">
            Codex setup handoff
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Prepared prompt for the repo-local setup skill.
          </p>
        </div>
        <button
          type="button"
          onClick={copyPrompt}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/12 px-3 text-[10px] font-black uppercase tracking-widest text-blue-100 transition-colors hover:bg-blue-500/20"
        >
          <CopyIcon size={15} />
          {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Failed' : 'Copy'}
        </button>
      </div>
      <p className="mt-3 truncate rounded-lg border border-white/8 bg-black/30 px-2.5 py-1 font-mono text-[11px] text-zinc-500">
        {CODEX_STUDIO_SETUP_SKILL_PATH}
      </p>
      <textarea
        readOnly
        value={prompt}
        aria-label="Codex Studio setup prompt"
        className="custom-scrollbar mt-3 h-52 w-full resize-none rounded-xl border border-white/8 bg-black/35 p-3 font-mono text-[11px] leading-5 text-zinc-300 outline-none"
      />
    </div>
  );
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  apiBase,
  error,
  health,
  localCodexSession,
  readiness,
  status,
  isDesktopRuntime,
  isOpen,
  onClose,
  onComplete,
  onRefresh,
  onStartAppServer,
}) => {
  const isChecking = status === 'checking';
  const isReady = status === 'ready';
  const isStartingAppServer = status === 'starting';
  const backendReachable = !error && Boolean(health);
  const canStartAppServer = backendReachable && !health?.appServer.running;
  const libraryReady = Boolean(health?.checks.libraryReady);
  const codexReady = Boolean(localCodexSession?.canRunLocalJobs);
  const appServerReady = Boolean(health?.appServer.running);

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
      : 'warning';
  const runtimeLabel = isDesktopRuntime ? 'Desktop runtime' : 'Web runtime';
  const headline = isReady
    ? 'Welcome to Codex Studio'
    : readiness.title || 'Welcome to Codex Studio';
  const intro = isReady
    ? 'Create images locally with Codex. Your data stays on your machine.'
    : readiness.description;
  const previewEntries = React.useMemo(
    () =>
      buildOnboardingStyleCarouselEntries(
        STYLE_AVAILABLE_DEFAULT_IMAGES,
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
    : localCodexSession?.reason === 'chatgpt_login_required'
      ? 'Run codex login and choose ChatGPT.'
      : localCodexSession?.error || 'Connect your local Codex session.';

  React.useEffect(() => {
    if (!isOpen) return;

    setPreviewIndex((currentIndex) =>
      pickNextOnboardingStyleCarouselIndex(previewEntries.length, currentIndex),
    );
  }, [isOpen, previewEntries.length]);

  React.useEffect(() => {
    if (!isOpen || previewEntries.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setPreviewIndex((currentIndex) =>
        pickNextOnboardingStyleCarouselIndex(previewEntries.length, currentIndex),
      );
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [isOpen, previewEntries.length]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-120">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          <MotionDiv
            initial={{ opacity: 0, scale: 0.98, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 16 }}
            className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-zinc-950 shadow-[0_40px_160px_rgba(0,0,0,0.75)]"
          >
            <header className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-14">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-blue-300">
                  <ImageIcon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-black uppercase tracking-widest text-white">
                    Codex <span className="font-semibold text-zinc-500">Studio</span>
                  </p>
                  <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                    {runtimeLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isChecking}
                  className="hidden h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
                >
                  <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
                  Status
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close onboarding"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            <main className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
              <div className="mx-auto w-full max-w-[100rem]">
                <section className="border-b border-white/8 pb-7 sm:pb-9">
                  <h2 className="max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-5xl xl:text-6xl">
                    {headline}
                  </h2>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400 sm:text-lg">
                    {error ? 'Could not query the local backend.' : intro}
                  </p>
                  {error ? (
                    <p className="mt-3 max-w-3xl rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 py-3 text-sm leading-6 text-rose-200">
                      {error}
                    </p>
                  ) : null}
                </section>

                <section className="grid gap-7 py-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(21rem,0.78fr)] xl:grid-cols-[minmax(0,1.12fr)_minmax(24rem,0.72fr)]">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-300">
                      Create images locally with Codex
                    </p>
                    <p className="mt-5 max-w-xl text-base leading-7 text-zinc-200">
                      Describe what you want. Codex turns the prompt into images while your library
                      and outputs stay on this machine.
                    </p>
                    <PreviewCard entry={previewEntry} />
                    <p className="mt-5 flex items-start gap-2 text-sm leading-6 text-zinc-500">
                      <Folder size={15} />
                      Everything runs locally. Nothing leaves your Studio Library unless you move
                      it.
                    </p>
                  </div>

                  <div className="min-w-0 lg:border-l lg:border-white/8 lg:pl-7 xl:pl-10">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-300">
                      Local environment check
                    </p>
                    <div className="mt-4">
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
                        detail={
                          appServerReady
                            ? 'Codex app-server is running and reachable.'
                            : 'Start the local app-server when the backend is ready.'
                        }
                        meta={appServerReady ? health?.appServer.wsUrl : apiBase}
                        status={appServerReady ? 'Running' : 'Not running'}
                        tone={serverTone}
                      />
                    </div>
                    <SetupPromptCard prompt={setupPrompt} />
                  </div>
                </section>
              </div>
            </main>

            <footer className="border-t border-white/8 px-5 py-4 sm:px-14 sm:py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={onComplete}
                    className="inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.28)] transition-colors hover:bg-blue-500"
                  >
                    {isReady ? 'Open Studio' : 'Got it'}
                    <ArrowRight size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isChecking}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                  {canStartAppServer ? (
                    <button
                      type="button"
                      onClick={onStartAppServer}
                      disabled={isStartingAppServer}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-200 transition-colors hover:bg-blue-500/18 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Play size={16} />
                      {isStartingAppServer ? 'Starting' : 'Start app-server'}
                    </button>
                  ) : null}
                </div>
                <div className="hidden items-center gap-2 text-sm text-zinc-500 md:flex">
                  <Folder size={15} />
                  Local-first. Private by design. Built for creators.
                </div>
              </div>
            </footer>
          </MotionDiv>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
