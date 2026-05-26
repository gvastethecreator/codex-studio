import React, { useMemo } from 'react';
import {
  Cpu,
  Database,
  Layers,
  LoaderCircle,
  RotateCcw,
  Server,
  Share,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react';
import type { StudioDiagnosticsSnapshot, StudioRuntimeStatusItem } from '../lib/studioDiagnostics';
import { SidePanel } from './SidePanel';

type StatusTone = 'success' | 'warning' | 'danger';

interface StatusItem {
  label: string;
  value: string;
  detail: string;
  tone: StatusTone;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface RightSystemPanelProps {
  onExportWorkspaceSnapshot: () => void;
  isBackgroundEnabled: boolean;
  onToggleBackground: () => void;
  isQueueOpen: boolean;
  onToggleQueue: () => void;
  queueCount: number;
  diagnostics: StudioDiagnosticsSnapshot;
  onResetStudio: () => void | Promise<void>;
  isResettingStudio: boolean;
}

const STATUS_ICONS: Record<
  StudioRuntimeStatusItem['key'],
  React.ComponentType<{ size?: number; className?: string }>
> = {
  backend: Server,
  codexCli: Terminal,
  appServer: Cpu,
  localCodexSession: ShieldCheck,
};

const STATUS_TONE_STYLES: Record<StatusTone, { dot: string; value: string }> = {
  success: {
    dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]',
    value: 'text-emerald-300',
  },
  warning: {
    dot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.45)]',
    value: 'text-amber-300',
  },
  danger: {
    dot: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.45)]',
    value: 'text-rose-300',
  },
};

function StatusCard({ label, value, detail, tone, icon: Icon }: StatusItem) {
  const toneStyles = STATUS_TONE_STYLES[tone];

  return (
    <div className="rounded-2xl border border-white/6 bg-white/4 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/25 text-zinc-300">
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
              {label}
            </p>
            <p
              className={`mt-1 text-[11px] font-black uppercase tracking-widest ${toneStyles.value}`}
            >
              {value}
            </p>
          </div>
        </div>
        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toneStyles.dot}`} />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">{detail}</p>
    </div>
  );
}

export const RightSystemPanel: React.FC<RightSystemPanelProps> = React.memo(
  ({
    onExportWorkspaceSnapshot,
    isBackgroundEnabled,
    onToggleBackground,
    isQueueOpen,
    onToggleQueue,
    queueCount,
    diagnostics,
    onResetStudio,
    isResettingStudio,
  }) => {
    const statusItems = useMemo<StatusItem[]>(() => {
      return diagnostics.statusItems.map((item) => ({
        ...item,
        icon: STATUS_ICONS[item.key],
      }));
    }, [diagnostics.statusItems]);

    return (
      <SidePanel position="right" label="SYSTEM">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Workspace Snapshot
            </h3>
            <p className="mb-3 px-1 text-[11px] leading-relaxed text-zinc-500">
              Export current workspace metadata as JSON. Image files stay in local library storage.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={onExportWorkspaceSnapshot}
                className="group flex h-10 w-full items-center gap-3 rounded-xl bg-white/5 px-4 transition-all hover:bg-white/10"
              >
                <Share
                  size={16}
                  className="text-zinc-500 transition-colors group-hover:text-white"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-white">
                  Export Snapshot
                </span>
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-white/5" />

          <div>
            <h3 className="mb-3 px-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Runtime Status
            </h3>
            <div className="flex flex-col gap-2">
              {statusItems.map((item) => (
                <StatusCard key={item.label} {...item} />
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-white/5" />

          <div>
            <h3 className="mb-3 px-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Environment
            </h3>

            <button
              onClick={onToggleQueue}
              className={`group mb-2 flex h-10 w-full items-center justify-between rounded-xl px-4 transition-all ${isQueueOpen ? 'border border-accent-500/20 bg-accent-500/10' : 'bg-white/5 hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-3">
                <Layers size={16} className={isQueueOpen ? 'text-accent-400' : 'text-zinc-500'} />
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${isQueueOpen ? 'text-accent-400' : 'text-zinc-300'}`}
                >
                  Generation Queue
                </span>
              </div>
              <div className="flex items-center gap-2">
                {queueCount > 0 && (
                  <span className="text-[10px] font-bold text-accent-400">{queueCount}</span>
                )}
                <div
                  className={`h-2 w-2 rounded-full ${isQueueOpen ? 'bg-accent-400 shadow-[0_0_8px_rgba(var(--accent-500),0.8)]' : 'bg-zinc-700'}`}
                />
              </div>
            </button>

            <button
              onClick={onToggleBackground}
              className={`group mb-4 flex h-10 w-full items-center justify-between rounded-xl px-4 transition-all ${isBackgroundEnabled ? 'border border-accent-500/20 bg-accent-500/10' : 'bg-white/5 hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-3">
                <Sparkles
                  size={16}
                  className={isBackgroundEnabled ? 'text-accent-400' : 'text-zinc-500'}
                />
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${isBackgroundEnabled ? 'text-accent-400' : 'text-zinc-300'}`}
                >
                  Animated Background
                </span>
              </div>
              <div
                className={`h-2 w-2 rounded-full ${isBackgroundEnabled ? 'bg-accent-400 shadow-[0_0_8px_rgba(var(--accent-500),0.8)]' : 'bg-zinc-700'}`}
              />
            </button>
          </div>

          <div className="h-px w-full bg-white/5" />

          <div>
            <h3 className="mb-3 px-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Danger Zone
            </h3>

            <div className="rounded-2xl border border-rose-500/15 bg-rose-500/6 p-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300">
                  <Database size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-rose-300/85">
                    Rebuild Local Studio
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-300/85">
                    Deletes the local library folders, archived items, queue state, logs, exports,
                    and SQLite state, then recreates a clean Codex Studio library.
                  </p>
                </div>
              </div>

              <button
                onClick={() => void onResetStudio()}
                disabled={isResettingStudio}
                className="group mt-4 flex h-11 w-full items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 transition-all hover:border-rose-400/30 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <div className="flex items-center gap-3">
                  {isResettingStudio ? (
                    <LoaderCircle size={16} className="animate-spin text-rose-300" />
                  ) : (
                    <RotateCcw
                      size={16}
                      className="text-rose-300 transition-transform group-hover:-rotate-90"
                    />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-100">
                    {isResettingStudio ? 'Rebuilding Studio...' : 'Rebuild Library + Database'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </SidePanel>
    );
  },
);
