import React from 'react';
import { IconCheck as Check, IconChevronDown as ChevronDown } from '@tabler/icons-react';

import { cn } from '../../lib/utils';
import type { CommandCenterProviderProjection } from '../../lib/commandCenterProjection';
import type { GenerationProviderId } from '../../packages/shared/src';
import { ProviderBrandMark } from '../ProviderBrandMark';
import Tooltip from '../Tooltip';
import { DemandMountedGsapDropdown } from '../ui/DemandMountedGsapDropdown';

export interface ProviderQuickSwitchProps {
  provider: CommandCenterProviderProjection;
  providerOptions: CommandCenterProviderProjection[];
  compactMode?: boolean;
  isProviderSaving: boolean;
  onSelectProvider: (providerId: GenerationProviderId) => Promise<void> | void;
  onOpenSettings?: () => void;
  placement?: 'bottom-right' | 'top-left' | 'top-right';
  triggerClassName?: string;
  showLabel?: boolean;
  className?: string;
  variant?: 'toolbar' | 'rail';
}

export function ProviderQuickSwitch({
  provider,
  providerOptions,
  compactMode = false,
  isProviderSaving,
  onSelectProvider,
  onOpenSettings,
  placement = 'bottom-right',
  triggerClassName,
  showLabel = true,
  className,
  variant = 'toolbar',
}: ProviderQuickSwitchProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const providerLabel = provider.id === 'codex' ? 'Codex' : provider.label;
  const isRail = variant === 'rail';

  const selectProvider = React.useCallback(
    (providerId: GenerationProviderId) => {
      if (providerId === provider.id || isProviderSaving) return;
      setOpen(false);
      void onSelectProvider(providerId);
    },
    [isProviderSaving, onSelectProvider, provider.id],
  );

  return (
    <div className={cn('relative min-w-0', isRail ? 'flex w-full min-w-0' : null, className)}>
      <Tooltip
        content="Change image generation provider"
        position="top"
        hidden={open || isRail}
        className="flex w-full min-w-0"
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={`Image generation provider: ${providerLabel}. Change provider`}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="provider-quick-switch"
          className={
            triggerClassName ??
            `studio-command-surface studio-hit-target flex h-8 w-8 items-center justify-center gap-1 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-1 text-[color:var(--wb-ink)] transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/2 hover:bg-accent-500/10 hover:text-[color:var(--wb-ink)] lg:w-auto lg:justify-start lg:gap-1.5 lg:px-2 ${compactMode ? 'lg:max-w-20' : 'lg:max-w-32'}`
          }
        >
          <ProviderBrandMark providerId={provider.id} size="xs" />
          {showLabel ? (
            <span
              className={
                isRail
                  ? 'create-engine-name'
                  : `hidden min-w-0 truncate text-[length:var(--wbp-label)] font-semibold tracking-normal lg:inline`
              }
            >
              {isRail ? providerLabel : provider.toolbarLabel}
            </span>
          ) : null}
          <ChevronDown
            size={12}
            aria-hidden="true"
            className={
              isRail
                ? `shrink-0 transition-transform ${open ? 'rotate-180' : ''}`
                : `hidden shrink-0 transition-transform lg:block ${open ? 'rotate-180' : ''}`
            }
          />
        </button>
      </Tooltip>
      <DemandMountedGsapDropdown
        id="provider-quick-switch"
        open={open}
        onOpenChange={setOpen}
        triggerRef={triggerRef}
        placement={placement}
        portal
        role="dialog"
        aria-label="Image generation provider"
        className="w-72 p-2"
      >
        <div className="px-2 pb-2 pt-1">
          <div className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
            Image provider
          </div>
          <div className="mt-1 text-[11px] font-semibold text-[color:var(--wb-ink)]">
            Applies to the next generation.
          </div>
        </div>
        <div className="space-y-1">
          {providerOptions.map((option) => {
            const isSelected = option.id === provider.id;
            const isUnavailable = !option.canExecute;
            return (
              <button
                key={option.id}
                type="button"
                data-dropdown-item
                aria-pressed={isSelected}
                aria-label={option.label}
                disabled={isProviderSaving || isUnavailable}
                data-tooltip={option.tooltip}
                onClick={() => selectProvider(option.id)}
                className={`flex min-h-12 w-full items-center gap-3 rounded-[var(--wb-radius)] border px-3 py-2 text-left transition-[color,background-color,border-color,opacity,transform] ${
                  isSelected
                    ? 'border-accent-400/2 bg-accent-500/12 text-[color:var(--wb-ink)]'
                    : 'border-transparent bg-[color-mix(in_srgb,var(--wb-ink)_3%,transparent)] text-[color:var(--wb-ink)] hover:border-[color:var(--wb-border)] hover:bg-white/[0.07]'
                } disabled:cursor-not-allowed disabled:opacity-55`}
              >
                <ProviderBrandMark
                  providerId={option.id}
                  size="sm"
                  canExecute={option.canExecute}
                  status={option.status}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[length:var(--wbp-label)] font-semibold tracking-normal">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[length:var(--wbp-label)] font-bold text-[color:var(--wb-muted)]">
                    {option.statusDetail}
                  </span>
                </span>
                {isSelected ? <Check size={15} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
        {onOpenSettings ? (
          <button
            type="button"
            data-dropdown-item
            onClick={() => {
              setOpen(false);
              onOpenSettings();
            }}
            className="mt-2 w-full rounded-[var(--wb-radius)] border-t border-[color:var(--wb-line)] px-3 py-2 text-left text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)] transition-colors hover:text-[color:var(--wb-ink)]"
          >
            Provider settings and diagnostics
          </button>
        ) : null}
      </DemandMountedGsapDropdown>
    </div>
  );
}
