import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  ExternalLink,
  HardDrive,
  Play,
  RefreshCw,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import type { HealthResponse } from '../packages/shared/src';

interface OnboardingModalProps {
  apiBase: string;
  error: string | null;
  health: HealthResponse | null;
  isChecking: boolean;
  isDesktopRuntime: boolean;
  isOpen: boolean;
  isReady: boolean;
  isStartingAppServer: boolean;
  onClose: () => void;
  onComplete: () => void;
  onRefresh: () => void;
  onStartAppServer: () => void;
}

type StepTone = 'ready' | 'warning' | 'error' | 'pending';

function StepRow({
  detail,
  icon,
  title,
  tone,
}: {
  detail: string;
  icon: React.ReactNode;
  title: string;
  tone: StepTone;
}) {
  const toneClasses = {
    ready: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300',
    warning: 'border-amber-500/20 bg-amber-500/5 text-amber-300',
    error: 'border-red-500/20 bg-red-500/5 text-red-300',
    pending: 'border-white/10 bg-white/5 text-zinc-300',
  } as const;

  const dotClasses = {
    ready: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
    pending: 'bg-zinc-600',
  } as const;

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/20">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${dotClasses[tone]}`} />
            <p className="text-[11px] font-black uppercase tracking-widest text-white">{title}</p>
          </div>
          <p className="mt-2 wrap-break-word font-mono text-[11px] leading-relaxed text-current/85">
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  apiBase,
  error,
  health,
  isChecking,
  isDesktopRuntime,
  isOpen,
  isReady,
  isStartingAppServer,
  onClose,
  onComplete,
  onRefresh,
  onStartAppServer,
}) => {
  if (!isOpen) return null;

  const backendReachable = !error && Boolean(health);
  const canStartAppServer = backendReachable && !health?.appServer.running;
  const missingFolders = health?.library.missingFolders ?? [];
  const libraryDetail = !backendReachable
    ? 'La ruta de biblioteca se mostrara cuando el health-check responda.'
    : health?.checks.libraryReady
      ? `${health.libraryDir} (escritura OK)`
      : `${health?.libraryDir || 'ruta no informada'}${missingFolders.length > 0 ? ` · faltan: ${missingFolders.join(', ')}` : ''}${health?.library.writable ? '' : ' · sin permiso de escritura'}`;
  const appServerDetail = !backendReachable
    ? 'El backend local debe responder antes de iniciar app-server.'
    : health?.appServer.running
      ? `Escuchando en ${health.appServer.wsUrl}${health.appServer.pid ? ` · pid ${health.appServer.pid}` : ''}`
      : health?.appServer.lastStartError
        ? `No arranco: ${health.appServer.lastStartError}`
        : 'Todavia no esta corriendo. Puedes iniciarlo desde aqui.';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-120 flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/5 bg-white/3 px-6 py-5 md:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-400">
                <Sparkles size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black uppercase tracking-widest text-white md:text-xl">
                    Primer arranque
                  </h2>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {isDesktopRuntime ? 'Desktop runtime' : 'Web runtime'}
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                  Verifica que el studio local pueda hablar con Codex, que la biblioteca este
                  accesible y que el runtime actual quede listo para una futura build Electron sin
                  reescribir el renderer.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)] md:px-8 md:py-7">
            <div className="space-y-4">
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-red-300">
                    No pude consultar el backend local
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-red-100/85">{error}</p>
                  <div className="mt-3 rounded-xl bg-black/20 p-3 font-mono text-[11px] leading-relaxed text-zinc-300">
                    <div>bun run studio:init</div>
                    <div>bun run dev</div>
                  </div>
                </div>
              )}

              <div className="grid gap-3">
                <StepRow
                  icon={<Activity size={16} />}
                  title="Backend local"
                  tone={backendReachable ? 'ready' : error ? 'error' : 'pending'}
                  detail={
                    backendReachable
                      ? `Disponible en ${apiBase}`
                      : `Pendiente: necesito poder consultar ${apiBase}`
                  }
                />
                <StepRow
                  icon={<Terminal size={16} />}
                  title="Codex CLI"
                  tone={
                    !backendReachable ? 'pending' : health?.codexCli.available ? 'ready' : 'warning'
                  }
                  detail={
                    !backendReachable
                      ? 'Primero necesito alcanzar el backend local.'
                      : health?.codexCli.available
                        ? `Detectado: ${health.codexCli.version || 'version no informada'} · ${health.codexCli.command}`
                        : `Instala o reautentica Codex en esta maquina. Intento actual: ${health?.codexCli.command || 'codex --version'}`
                  }
                />
                <StepRow
                  icon={<Activity size={16} />}
                  title="codex app-server"
                  tone={
                    !backendReachable ? 'pending' : health?.appServer.running ? 'ready' : 'warning'
                  }
                  detail={appServerDetail}
                />
                <StepRow
                  icon={<HardDrive size={16} />}
                  title="Biblioteca local"
                  tone={!backendReachable ? 'pending' : health?.libraryDir ? 'ready' : 'warning'}
                  detail={libraryDetail}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                  Checklist rapido
                </p>
                <ul className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-300">
                  <li>1. Instala Bun y Codex CLI.</li>
                  <li>2. Ejecuta `bun run studio:init` la primera vez.</li>
                  <li>3. Levanta `bun run dev` para UI + backend.</li>
                  <li>4. Si falta `app-server`, inícialo desde este modal.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                  Siguiente paso
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  {isReady
                    ? 'Todo listo: escribe un prompt, añade referencias si quieres y dispara tu primer job local.'
                    : 'Aunque la UI cargue, la generacion real no estara lista hasta que Codex CLI y app-server respondan bien.'}
                </p>
              </div>

              {health && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                    Runtime actual
                  </p>
                  <div className="mt-3 space-y-2 font-mono text-[11px] leading-relaxed text-zinc-300">
                    <div className="wrap-break-word">API base: {apiBase}</div>
                    <div className="wrap-break-word">
                      Env local:{' '}
                      {health.runtime.envLocalPresent
                        ? health.runtime.envLocalPath
                        : `faltante (${health.runtime.envLocalPath})`}
                    </div>
                    <div>
                      Puertos: HTTP {health.config.serverPort} · WS {health.config.codexWsPort}
                    </div>
                    <div>
                      Runtime: Bun {health.runtime.bunVersion || 'desconocida'} · Node{' '}
                      {health.runtime.nodeVersion}
                    </div>
                    <div>
                      {health.runtime.platform} · {health.runtime.arch}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                  Pensando en Electron
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  El renderer ya puede resolver su API base desde runtime en lugar de asumir siempre
                  `localhost`. Eso nos deja una costura limpia para que un preload de Electron
                  inyecte configuracion sin abrir la puerta a Node en la UI.
                </p>
                <a
                  href="https://www.electronjs.org/docs/latest/tutorial/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-accent-400 transition-colors hover:text-accent-300"
                >
                  Guia oficial de seguridad de Electron <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/5 bg-black/20 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8">
            <div className="text-xs text-zinc-500">
              {isChecking
                ? 'Actualizando estado del studio...'
                : isReady
                  ? 'Estado listo para generar.'
                  : 'Aun faltan checks antes de la primera generacion.'}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={onRefresh}
                disabled={isChecking}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={15} className={isChecking ? 'animate-spin' : ''} />
                Actualizar estado
              </button>

              {canStartAppServer && (
                <button
                  onClick={onStartAppServer}
                  disabled={isStartingAppServer}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500/15 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-accent-300 transition-all hover:bg-accent-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Play size={15} />
                  {isStartingAppServer ? 'Iniciando app-server' : 'Iniciar app-server'}
                </button>
              )}

              <button
                onClick={onComplete}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-accent-400"
              >
                <ArrowRight size={15} />
                {isReady ? 'Ir al studio' : 'Marcar guia como vista'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
