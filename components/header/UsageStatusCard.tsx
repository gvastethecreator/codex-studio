import { Coins, WifiOff } from 'lucide-react';
import type { StudioUsageSummary } from '../../lib/studioDiagnostics';
import Tooltip from '../Tooltip';

interface UsageStatusCardProps {
    usage: StudioUsageSummary;
    onOpenDashboard: () => void;
}

export function UsageStatusCard({
    usage,
    onOpenDashboard,
}: UsageStatusCardProps) {
    const usageToneClasses = usage.tone === 'offline'
        ? 'border-rose-500/20 bg-rose-500/8 text-rose-200'
        : usage.tone === 'available'
            ? 'border-accent-500/20 bg-accent-500/8 text-white'
            : 'border-white/10 bg-white/5 text-zinc-200';

    return (
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <Tooltip content={usage.tooltip} position="bottom">
                <button
                    onClick={onOpenDashboard}
                    className={`flex min-w-45 items-center gap-3 rounded-2xl border px-3.5 py-2 text-left transition-all hover:border-accent-400/30 hover:bg-white/8 ${usageToneClasses}`}
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/20 text-inherit">
                        {usage.tone === 'offline' ? <WifiOff size={16} /> : <Coins size={16} />}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-zinc-400">
                            Codex Usage
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="truncate text-sm font-black text-white">{usage.value}</span>
                            {!usage.isLoading && usage.unitLabel && (
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                    {usage.unitLabel}
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 truncate text-[10px] uppercase tracking-widest text-zinc-400">
                            {usage.meta}
                        </p>
                    </div>
                </button>
            </Tooltip>
        </div>
    );
}
