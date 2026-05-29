import React from 'react';
import { AnimatePresence, MotionDiv } from 'motion/react';
import {
  Activity,
  ArrowRight,
  HardDrive,
  Play,
  RefreshCw,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import type {
  HealthResponse,
  LocalCodexSessionResponse,
  StudioReadinessSnapshot,
} from '../packages/shared/src';

type OnboardingStatus = 'idle' | 'checking' | 'starting' | 'ready';

interface OnboardingModalProps {
  apiBase: string;
  error: string | null;
  health: HealthResponse | null;
  localCodexSession: LocalCodexSessionResponse | null;
  readiness: StudioReadinessSnapshot;
  /** Collapsed status replaces isChecking/isReady/isStartingAppServer booleans */
  status: OnboardingStatus;
  isDesktopRuntime: boolean;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onRefresh: () => void;
  onStartAppServer: () => void;
}

type StepTone = 'ready' | 'warning' | 'error' | 'pending';

function StepRow({
  detail,
  icon,
  meta,
  title,
  tone,
}: {
  detail: string;
  icon: React.ReactNode;
  meta?: string;
  title: string;
  tone: StepTone;
}) {
  const toneClasses = {
    ready: 'border-emerald-500/20 bg-emerald-500/6 text-emerald-200',
    warning: 'border-amber-500/20 bg-amber-500/6 text-amber-200',
    error: 'border-red-500/20 bg-red-500/6 text-red-200',
    pending: 'border-white/10 bg-white/5 text-zinc-300',
  } as const;

  const dotClasses = {
    ready: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
    pending: 'bg-zinc-600',
  } as const;

  return (
    <div className={`rounded-2xl border p-3.5 sm:p-4 ${toneClasses[tone]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-black/20">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`size-2.5 rounded-full ${dotClasses[tone]}`} />
            <p className="text-[11px] font-black uppercase tracking-widest text-white">{title}</p>
          </div>
          <p className="mt-2 wrap-break-word text-sm leading-relaxed text-current/90">{detail}</p>
          {meta ? (
            <p className="mt-1 wrap-break-word font-mono text-[11px] leading-relaxed text-current/70">
              {meta}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface OnboardingStatusPanelProps {
  apiBase: string;
  health: HealthResponse | null;
  readiness: StudioReadinessSnapshot;
  statusMessage: string;
  commandHints: string[];
  quickHint: string;
}

function OnboardingStatusPanel({
  apiBase,
  health,
  readiness,
  statusMessage,
  commandHints,
  quickHint,
}: OnboardingStatusPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Resumen</p>
        <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-accent-300">
          {readiness.title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-200">{statusMessage}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium text-zinc-300">
            API {apiBase}
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium text-zinc-300">
            {health?.runtime.envLocalPresent ? '.env local OK' : '.env local missing'}
          </span>
          {health ? (
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium text-zinc-300">
              HTTP {health.config.serverPort} · WS {health.config.codexWsPort}
            </span>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
          Quick Actions
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {commandHints.map((command) => (
            <span
              key={command}
              className="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-mono text-[11px] text-zinc-300"
            >
              {command}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{quickHint}</p>
      </div>
    </div>
  );
}

interface OnboardingActionsProps {
  status: OnboardingStatus;
  canStartAppServer: boolean;
  onRefresh: () => void;
  onComplete: () => void;
  onStartAppServer: () => void;
}

function OnboardingActions({
  status,
  canStartAppServer,
  onRefresh,
  onComplete,
  onStartAppServer,
}: OnboardingActionsProps) {
  const isReady = status === 'ready';
  const isChecking = status === 'checking';
  const isStartingAppServer = status === 'starting';
  return (
    <div className="border-t border-white/5 bg-black/20 p-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs leading-relaxed text-zinc-500">
          {isReady
            ? 'Ready. The guide will remain available from Help.'
            : 'This guide will appear automatically only this once.'}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isChecking}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={15} className={isChecking ? 'animate-spin' : ''} />
            Refresh
          </button>

          {canStartAppServer ? (
            <button
              type="button"
              onClick={onStartAppServer}
              disabled={isStartingAppServer}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500/15 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-accent-300 transition-all hover:bg-accent-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play size={15} />
              {isStartingAppServer ? 'Starting app-server' : 'Start app-server'}
            </button>
          ) : null}

          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-accent-400"
          >
            <ArrowRight size={15} />
            {isReady ? 'Open Studio' : 'Got it'}
          </button>
        </div>
      </div>
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
  const missingFolders = health?.library.missingFolders ?? [];
  const runtimeLabel = isDesktopRuntime ? 'Desktop runtime' : 'Web runtime';
  const libraryDetail = !backendReachable
    ? 'Waiting for health-check response.'
    : health?.checks.libraryReady
      ? 'Ready for read and write.'
      : missingFolders.length > 0
        ? `Missing folders: ${missingFolders.join(', ')}`
        : health?.library.writable
          ? 'Path detected, but checks are missing.'
          : 'The path does not have write permission.';
  const appServerDetail = !backendReachable
    ? 'Local backend required first.'
    : health?.appServer.running
      ? 'Running and ready to generate.'
      : health?.appServer.lastStartError
        ? 'Failed to start correctly.'
        : 'Not running yet.';
  const cliDetail = !backendReachable
    ? 'Waiting for local backend.'
    : health?.codexCli.available
      ? `Available${health.codexCli.version ? ` · ${health.codexCli.version}` : ''}`
      : 'Install or re-authenticate Codex CLI.';
  const sessionDetail = !backendReachable
    ? 'Waiting for the local backend.'
    : localCodexSession?.canRunLocalJobs
      ? localCodexSession.planType
        ? `ChatGPT login active · ${localCodexSession.planType}`
        : 'ChatGPT login active in the local Codex CLI.'
      : localCodexSession?.reason === 'chatgpt_login_required'
        ? 'Run `codex login` and choose ChatGPT.'
        : localCodexSession?.reason === 'api_key_not_supported'
          ? 'API key mode is unsupported here; re-authenticate with ChatGPT.'
          : localCodexSession?.reason === 'external_tokens_not_supported'
            ? 'Externally managed ChatGPT tokens are unsupported in this local-only flow.'
            : localCodexSession?.error || 'Local session unavailable.';
  const statusMessage = isChecking
    ? 'Updating studio status...'
    : isReady
      ? readiness.description
      : error
        ? 'Could not query the local backend.'
        : readiness.description;
  const quickHint = isReady
    ? 'You can reopen this guide from Help anytime.'
    : readiness.nextAction === 'start-app-server'
      ? 'If everything else is ready, start the app-server from here.'
      : readiness.nextAction === 'login-chatgpt'
        ? 'This product only supports ChatGPT login inside the local Codex CLI.'
        : readiness.nextAction === 'install-codex'
          ? 'Install or restore Codex CLI first, then refresh the checks.'
          : readiness.nextAction === 'fix-library'
            ? 'Repair the Studio Library path and permissions, then refresh.'
            : 'Fix what is missing and then refresh the status.';
  const commandHints = [
    'bun run studio:init',
    'bun run dev',
    !health?.codexCli.available || !localCodexSession?.canRunLocalJobs ? 'codex login' : null,
  ].filter(Boolean) as string[];

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-120 p-3 sm:p-6">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <MotionDiv
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            className="relative z-10 mx-auto flex h-full max-h-[calc(100vh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/95 shadow-2xl sm:max-h-[min(88vh,860px)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/5 bg-white/3 p-4 sm:px-6 sm:py-5">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-400 sm:h-12 sm:w-12">
                  <Sparkles size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-black uppercase tracking-widest text-white sm:text-lg">
                      First Launch
                    </h2>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {runtimeLabel}
                    </span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                    Check the minimum setup to get the studio ready. You can reopen this guide from
                    Help later.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:px-6 sm:py-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
                <div className="space-y-4">
                  {error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/6 p-4 sm:p-5">
                      <p className="text-[11px] font-black uppercase tracking-widest text-red-300">
                        Local backend unavailable
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-red-100/85">{error}</p>
                    </div>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <StepRow
                      icon={<Activity size={16} />}
                      title="Backend local"
                      tone={backendReachable ? 'ready' : error ? 'error' : 'pending'}
                      detail={
                        backendReachable ? 'Connected and responding.' : 'Not responding yet.'
                      }
                      meta={apiBase}
                    />
                    <StepRow
                      icon={<Terminal size={16} />}
                      title="Codex CLI"
                      tone={
                        !backendReachable
                          ? 'pending'
                          : health?.codexCli.available
                            ? 'ready'
                            : 'warning'
                      }
                      detail={cliDetail}
                      meta={
                        backendReachable ? health?.codexCli.command || 'codex --version' : undefined
                      }
                    />
                    <StepRow
                      icon={<Activity size={16} />}
                      title="codex app-server"
                      tone={
                        !backendReachable
                          ? 'pending'
                          : health?.appServer.running
                            ? 'ready'
                            : 'warning'
                      }
                      detail={appServerDetail}
                      meta={
                        health?.appServer.running
                          ? `${health.appServer.wsUrl}${health.appServer.pid ? ` · pid ${health.appServer.pid}` : ''}`
                          : health?.appServer.lastStartError || undefined
                      }
                    />
                    <StepRow
                      icon={<HardDrive size={16} />}
                      title="Local Library"
                      tone={
                        !backendReachable
                          ? 'pending'
                          : health?.checks.libraryReady
                            ? 'ready'
                            : 'warning'
                      }
                      detail={libraryDetail}
                      meta={health?.libraryDir || 'path not set'}
                    />
                    <StepRow
                      icon={<Sparkles size={16} />}
                      title="Local Codex Session"
                      tone={
                        !backendReachable
                          ? 'pending'
                          : localCodexSession?.canRunLocalJobs
                            ? 'ready'
                            : localCodexSession?.state === 'unsupported_auth'
                              ? 'error'
                              : 'warning'
                      }
                      detail={sessionDetail}
                      meta={localCodexSession?.authLabel}
                    />
                  </div>
                </div>

                <OnboardingStatusPanel
                  apiBase={apiBase}
                  health={health}
                  readiness={readiness}
                  statusMessage={statusMessage}
                  commandHints={commandHints}
                  quickHint={quickHint}
                />
              </div>
            </div>

            <OnboardingActions
              status={status}
              canStartAppServer={canStartAppServer}
              onRefresh={onRefresh}
              onComplete={onComplete}
              onStartAppServer={onStartAppServer}
            />
          </MotionDiv>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
