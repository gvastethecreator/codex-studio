import { Coins, WifiOff } from 'lucide-react';
import type { CodexAccountStatusResponse } from '../../packages/shared/src';
import Tooltip from '../Tooltip';

interface UsageStatusCardProps {
    codexAccountStatus: CodexAccountStatusResponse | null;
    isUsageLoading: boolean;
    isBackendConnected: boolean;
    onOpenDashboard: () => void;
}

const formatCodexPlan = (planType: string | null | undefined) => {
    if (!planType) return 'Account';

    return planType.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export function UsageStatusCard({
    codexAccountStatus,
    isUsageLoading,
    isBackendConnected,
    onOpenDashboard,
}: UsageStatusCardProps) {
    const usageValue = !isBackendConnected
        ? 'Offline'
        : isUsageLoading
            ? 'Syncing...'
            : codexAccountStatus?.usage?.display ?? 'Unavailable';
    const usageMeta = !isBackendConnected
        ? 'Local backend unreachable'
        : codexAccountStatus?.planType
            ? formatCodexPlan(codexAccountStatus.planType)
            : codexAccountStatus?.authMode === 'apikey'
                ? 'API Key'
                : 'Codex Account';
    const usageToneClasses = !isBackendConnected
        ? 'border-rose-500/20 bg-rose-500/8 text-rose-200'
        : codexAccountStatus?.usage?.display
            ? 'border-accent-500/20 bg-accent-500/8 text-white'
            : 'border-white/10 bg-white/5 text-zinc-200';

    return (
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <Tooltip
                content={
                    codexAccountStatus?.error && isBackendConnected
                        ? `Usage unavailable: ${codexAccountStatus.error}`
                        : `Available usage for ${usageMeta}`
                }
                position="bottom"
            >
                <button
                    onClick={onOpenDashboard}
                    className={`flex min-w-45 items-center gap-3 rounded-2xl border px-3.5 py-2 text-left transition-all hover:border-accent-400/30 hover:bg-white/8 ${usageToneClasses}`}
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/20 text-inherit">
                        {!isBackendConnected ? <WifiOff size={16} /> : <Coins size={16} />}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-zinc-400">
                            Usage Available
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="truncate text-sm font-black text-white">{usageValue}</span>
                            {!isUsageLoading && codexAccountStatus?.usage?.unit === 'credits' && (
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                    credits
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 truncate text-[10px] uppercase tracking-widest text-zinc-400">
                            {usageMeta}
                        </p>
                    </div>
                </button>
            </Tooltip>
        </div>
    );
}
