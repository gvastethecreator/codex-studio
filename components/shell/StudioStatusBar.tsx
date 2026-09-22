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
  if (tone === 'success')
    return 'border-emerald-500/2 bg-emerald-500/8 text-[color:var(--wb-success)]';
  if (tone === 'warning') return 'border-amber-500/2 bg-amber-500/8 text-[color:var(--wb-warning)]';
  return 'border-rose-500/2 bg-rose-500/8 text-[color:var(--wb-danger)]';
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
    <footer className="studio-status-bar studio-bar" aria-label="Studio status">
      <ul className="studio-status-providers m-0 list-none p-0" aria-label="Provider status">
        {commandCenter.providerOptions.map((provider) => (
          <li
            key={provider.id}
            data-tooltip={provider.tooltip}
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
          </li>
        ))}
      </ul>

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
          className={`studio-command-surface studio-hit-target flex h-7 items-center justify-center gap-1.5 rounded-[var(--wb-radius)] border px-2 ${runtimeToneClass(runtimeStatus.tone)}`}
        >
          <Server size={13} />
          <span className="hidden text-[length:var(--wbp-label)] font-semibold tracking-normal sm:inline">
            {runtimeStatus.label}
          </span>
        </button>
      </Tooltip>

      <Tooltip content={`Jobs · ${queueLabel}`} position="top" hidden>
        <button
          type="button"
          onClick={onToggleQueue}
          aria-label={`${isQueueOpen ? 'Close' : 'Open'} jobs (${queueLabel})`}
          aria-pressed={isQueueOpen}
          className={cn(
            'studio-command-surface studio-hit-target flex h-7 items-center justify-center gap-1.5 rounded-[var(--wb-radius)] border px-2 text-xs transition-colors',
            isQueueOpen
              ? 'border-[color:var(--wb-accent)] bg-[color-mix(in_srgb,var(--wb-accent)_18%,transparent)] text-[color:var(--wb-ink)]'
              : 'border-[color:var(--wb-border)] text-[color:var(--wb-muted)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)]',
          )}
        >
          <SidebarRight size={13} />
          <span>Jobs</span>
          {queueCount > 0 ? (
            <span className="tabular-nums text-accent-200">{queueCount} active</span>
          ) : null}
          {reviewCount > 0 ? (
            <span className="border-l border-[color:var(--wb-line)] pl-1.5 text-[color:var(--wb-warning)]">
              {reviewCount} review
            </span>
          ) : null}
        </button>
      </Tooltip>
    </footer>
  );
}
