import { IconGauge as Gauge, IconWifiOff as WifiOff } from '@tabler/icons-react';
import type { StudioUsageSummary } from '../../lib/studioDiagnostics';
import Tooltip from '../Tooltip';

interface UsageStatusCardProps {
  usage: StudioUsageSummary;
  onOpenDashboard: () => void;
}

function getUsageBarClass(availablePercent: number) {
  if (availablePercent <= 15) return 'bg-rose-400';
  if (availablePercent <= 35) return 'bg-amber-300';
  return 'bg-emerald-300';
}

export function UsageStatusCard({ usage, onOpenDashboard }: UsageStatusCardProps) {
  const visibleLimits = usage.limits.slice(0, 2);
  const usageToneClasses =
    usage.tone === 'offline'
      ? 'border-rose-500/20 bg-rose-500/8 text-rose-200'
      : usage.tone === 'available'
        ? 'border-accent-500/20 bg-accent-500/8 text-white'
        : 'border-white/10 bg-white/5 text-zinc-200';
  const tooltip =
    visibleLimits.length > 0
      ? `${usage.tooltip} · ${visibleLimits
          .map(
            (limit) =>
              `${limit.label}: ${Math.round(limit.availablePercent)}% available${limit.resetLabel ? `, ${limit.resetLabel}` : ''}`,
          )
          .join(' · ')}`
      : usage.tooltip;

  return (
    <div className="hidden h-8 shrink-0 items-center lg:flex">
      <Tooltip content={tooltip} position="bottom">
        <button
          type="button"
          onClick={onOpenDashboard}
          className={`studio-hit-target flex h-8 items-center gap-1.5 rounded-lg border px-2 text-left transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/30 hover:bg-white/8 cursor-pointer ${usageToneClasses}`}
        >
          <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-black/20 text-inherit">
            {usage.tone === 'offline' ? <WifiOff size={13} /> : <Gauge size={13} />}
          </div>
          {visibleLimits.length > 0 ? (
            <div className="flex h-7 items-center gap-2">
              {visibleLimits.map((limit) => (
                <div key={limit.id} className="grid w-20 gap-1 leading-none">
                  <span className="flex min-w-0 items-center justify-between gap-1">
                    <span className="truncate text-[8px] font-black uppercase tracking-widest text-zinc-400">
                      {limit.label}
                    </span>
                    <span className="text-[9px] font-black tabular-nums text-white">
                      {Math.round(limit.availablePercent)}%
                    </span>
                  </span>
                  <span className="h-1 overflow-hidden rounded-full bg-zinc-700/70">
                    <span
                      className={`block h-full rounded-full transition-[width] duration-200 ${getUsageBarClass(limit.availablePercent)}`}
                      style={{ width: `${Math.max(0, Math.min(limit.availablePercent, 100))}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                Codex Usage
              </p>
              <div className="flex items-center gap-2 leading-none">
                <span className="max-w-28 truncate text-[11px] font-black tabular-nums text-white">
                  {usage.value}
                </span>
                {!usage.isLoading && usage.unitLabel && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    {usage.unitLabel}
                  </span>
                )}
              </div>
            </div>
          )}
        </button>
      </Tooltip>
    </div>
  );
}
