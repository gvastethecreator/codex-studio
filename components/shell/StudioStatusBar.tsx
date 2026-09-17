import React from 'react';
import { IconLayoutSidebarRight as SidebarRight, IconServer as Server } from '@tabler/icons-react';

import type { StudioCommandCenterProjection } from '../../lib/commandCenterProjection';
import type { StudioUsageSummary } from '../../lib/studioDiagnostics';
import { cn } from '../../lib/utils';
import { UsageStatusCard } from '../header/UsageStatusCard';
import { ProviderBrandMark } from '../ProviderBrandMark';
import Tooltip from '../Tooltip';

export interface StudioStatusBarProps {
  usage: StudioUsageSummary;
  commandCenter: StudioCommandCenterProjection;
  isQueueOpen: boolean;
  onToggleQueue: () => void;
  onOpenDashboard: () => void;
  onOpenOnboarding: () => void;
}

function runtimeToneClass(tone: StudioCommandCenterProjection['runtimeStatus']['tone']) {
  if (tone === 'success') return 'border-emerald-500/2 bg-emerald-500/8 text-emerald-200';
  if (tone === 'warning') return 'border-amber-500/2 bg-amber-500/8 text-amber-200';
  return 'border-rose-500/2 bg-rose-500/8 text-rose-200';
}

export function StudioStatusBar({
  usage,
  commandCenter,
  isQueueOpen,
  onToggleQueue,
  onOpenDashboard,
  onOpenOnboarding,
}: StudioStatusBarProps) {
  const runtimeStatus = commandCenter.runtimeStatus;
  const queueCount = commandCenter.queue.activeCount;
  const reviewCount = commandCenter.queue.reviewCount;
  const queueLabel = `${queueCount} active, ${reviewCount} need review`;

  return (
    <footer className="studio-status-bar" aria-label="Studio status">
      <div className="studio-status-providers" role="list" aria-label="Provider status">
        {commandCenter.providerOptions.map((provider) => (
          <div
            key={provider.id}
            role="listitem"
            title={provider.tooltip}
            aria-label={`${provider.shortLabel}: ${provider.statusDetail}`}
            className={cn(
              'studio-status-provider',
              provider.id === commandCenter.provider.id && 'is-active',
            )}
          >
            <ProviderBrandMark
              providerId={provider.id}
              size="xs"
              canExecute={provider.canExecute}
              status={provider.status}
            />
            <span className="studio-status-provider-label">{provider.shortLabel}</span>
          </div>
        ))}
      </div>

      <div className="studio-status-spacer" />

      <UsageStatusCard
        usage={usage}
        onOpenDashboard={onOpenDashboard}
        className="relative flex h-7 shrink-0 items-center"
        popoverPlacement="top"
      />

      <Tooltip content={runtimeStatus.tooltip} position="top">
        <button
          type="button"
          onClick={onOpenOnboarding}
          aria-label={`Open runtime status: ${runtimeStatus.label}`}
          className={`studio-command-surface studio-hit-target flex h-7 items-center justify-center gap-1.5 rounded-md border px-2 ${runtimeToneClass(runtimeStatus.tone)}`}
        >
          <Server size={13} />
          <span className="hidden text-[10px] font-black uppercase tracking-[0.16em] sm:inline">
            {runtimeStatus.label}
          </span>
        </button>
      </Tooltip>

      <Tooltip content={`Jobs · ${queueLabel}`} position="top">
        <button
          type="button"
          onClick={onToggleQueue}
          aria-label={`${isQueueOpen ? 'Close' : 'Open'} jobs (${queueLabel})`}
          aria-pressed={isQueueOpen}
          className={cn(
            'studio-command-surface studio-hit-target flex h-7 items-center justify-center gap-1.5 rounded-md border px-2 text-xs transition-colors',
            isQueueOpen
              ? 'border-accent-500/20 bg-accent-500/12 text-white'
              : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10',
          )}
        >
          <SidebarRight size={13} />
          <span>Jobs</span>
          {queueCount > 0 ? (
            <span className="tabular-nums text-accent-200">{queueCount} active</span>
          ) : null}
          {reviewCount > 0 ? (
            <span className="border-l border-white/15 pl-1.5 text-amber-300">
              {reviewCount} review
            </span>
          ) : null}
        </button>
      </Tooltip>
    </footer>
  );
}
