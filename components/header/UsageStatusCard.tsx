import { useState, useEffect, useRef } from 'react';
import { IconGauge as Gauge, IconWifiOff as WifiOff } from '@tabler/icons-react';
import type { StudioUsageSummary } from '../../lib/studioDiagnostics';
import Tooltip from '../Tooltip';

interface UsageStatusCardProps {
  usage: StudioUsageSummary;
  onOpenDashboard: () => void;
  className?: string;
  popoverPlacement?: 'bottom' | 'top';
}

function getUsageBarClass(availablePercent: number) {
  if (availablePercent <= 15) return 'bg-rose-400';
  if (availablePercent <= 35) return 'bg-amber-300';
  return 'bg-emerald-300';
}

function getUsageDetailLabel(label: string, meta: string) {
  const scope = meta.split(' · ').at(-1)?.trim();
  return scope && label.startsWith(`${scope} · `) ? label.slice(scope.length + 3) : label;
}

export function UsageStatusCard({
  usage,
  onOpenDashboard,
  className,
  popoverPlacement = 'bottom',
}: UsageStatusCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        trigger.current?.focus();
      }
    };
    const pointerdown = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('keydown', keydown);
    document.addEventListener('pointerdown', pointerdown);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('pointerdown', pointerdown);
    };
  }, [isOpen]);
  const visibleLimits = usage.limits.slice(0, 2);
  const usageToneClasses =
    usage.tone === 'offline'
      ? 'border-rose-500/2 bg-rose-500/8 text-rose-200'
      : usage.tone === 'available'
        ? 'border-accent-500/2 bg-accent-500/8 text-[color:var(--wb-ink)]'
        : 'border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] text-[color:var(--wb-ink)]';
  const tooltip =
    visibleLimits.length > 0
      ? `${usage.tooltip} · ${visibleLimits
          .map(
            (limit) =>
              `${getUsageDetailLabel(limit.label, usage.meta)}: ${Math.round(limit.availablePercent)}% available${limit.resetLabel ? `, ${limit.resetLabel}` : ''}`,
          )
          .join(' · ')}`
      : usage.tooltip;

  return (
    <div ref={root} className={className ?? 'relative hidden h-8 shrink-0 items-center lg:flex'}>
      <Tooltip content={tooltip} position={popoverPlacement === 'top' ? 'top' : 'bottom'}>
        <button
          type="button"
          ref={trigger}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className={`studio-hit-target flex items-center gap-1.5 rounded-lg border px-2 text-left transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/2 hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] cursor-pointer ${popoverPlacement === 'top' ? 'h-7' : 'h-8'} ${usageToneClasses}`}
          aria-label="Usage status"
        >
          <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[color:var(--wb-well)] text-inherit">
            {usage.tone === 'offline' ? <WifiOff size={13} /> : <Gauge size={13} />}
          </div>
          {visibleLimits.length > 0 ? (
            <div className="flex h-7 items-center gap-2">
              {visibleLimits.map((limit) => (
                <div key={limit.id} className="grid w-20 gap-1 leading-none">
                  <span className="flex min-w-0 items-center justify-between gap-1">
                    <span className="truncate text-[8px] font-black uppercase tracking-widest text-[color:var(--wb-muted)]">
                      {limit.label}
                    </span>
                    <span className="text-[9px] font-black tabular-nums text-[color:var(--wb-ink)]">
                      {Math.round(limit.availablePercent)}%
                    </span>
                  </span>
                  <span className="h-1 overflow-hidden rounded-full bg-zinc-700/70">
                    <span
                      className={`block h-full w-full origin-left rounded-full transition-transform duration-200 ${getUsageBarClass(limit.availablePercent)}`}
                      style={{
                        transform: `scaleX(${Math.max(0, Math.min(limit.availablePercent, 100)) / 100})`,
                      }}
                    />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-[color:var(--wb-muted)]">
                Codex Usage
              </p>
              <div className="flex items-center gap-2 leading-none">
                <span className="max-w-28 truncate text-[11px] font-black tabular-nums text-[color:var(--wb-ink)]">
                  {usage.value}
                </span>
                {!usage.isLoading && usage.unitLabel && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-[color:var(--wb-muted)]">
                    {usage.unitLabel}
                  </span>
                )}
              </div>
            </div>
          )}
        </button>
      </Tooltip>
      {isOpen && (
        <div
          role="region"
          aria-label="Account usage"
          className={`absolute right-0 z-[100] w-80 rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-panel)] p-4 shadow-xl ${popoverPlacement === 'top' ? 'bottom-9' : 'top-11'}`}
        >
          <div className="flex items-center justify-between">
            <strong>Account usage</strong>
            <button type="button" aria-label="Close usage" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>
          <p className="my-3 text-sm text-[color:var(--wb-ink)]">{usage.tooltip}</p>
          {usage.limits.map((limit) => (
            <p key={limit.id} className="my-2 text-sm">
              {limit.label}: {Math.round(limit.availablePercent)}% available · {limit.resetLabel}
            </p>
          ))}
          <button
            type="button"
            className="mt-3 text-sm underline"
            onClick={() => {
              setIsOpen(false);
              onOpenDashboard();
            }}
          >
            Library summary
          </button>
        </div>
      )}
    </div>
  );
}
