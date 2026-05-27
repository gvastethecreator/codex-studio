import { Gauge, WifiOff } from 'lucide-react';
import type { StudioUsageSummary } from '../../lib/studioDiagnostics';
import Tooltip from '../Tooltip';

interface UsageStatusCardProps {
  usage: StudioUsageSummary;
  onOpenDashboard: () => void;
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
    <div className="hidden h-10 shrink-0 items-center lg:flex">
      <Tooltip content={tooltip} position="bottom">
        <button
          type="button"
          onClick={onOpenDashboard}
          className={`flex h-10 items-center gap-2 rounded-lg border px-2.5 text-left transition-all hover:border-accent-400/30 hover:bg-white/8 cursor-pointer ${usageToneClasses}`}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-black/20 text-inherit">
            {usage.tone === 'offline' ? <WifiOff size={14} /> : <Gauge size={14} />}
          </div>
          {visibleLimits.length > 0 ? (
            <div className="flex h-8 items-center gap-2">
              {visibleLimits.map((limit) => (
                <div key={limit.id} className="flex items-center gap-1.5">
                  <span
                    className="relative block size-6 shrink-0 rounded-full"
                    style={{
                      background: `conic-gradient(rgb(52 211 153) ${Math.round(limit.availablePercent * 3.6)}deg, rgb(63 63 70 / 0.65) 0deg)`,
                    }}
                  >
                    <span className="absolute inset-1 rounded-full bg-black/80" />
                  </span>
                  <span className="grid min-w-10 gap-0.5 leading-none">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      {limit.label}
                    </span>
                    <span className="text-[11px] font-black text-white">
                      {Math.round(limit.availablePercent)}%
                    </span>
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
                <span className="max-w-28 truncate text-[11px] font-black text-white">
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
