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
}: ProviderQuickSwitchProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const providerLabel = provider.id === 'codex' ? 'Codex' : provider.label;

  const selectProvider = React.useCallback(
    (providerId: GenerationProviderId) => {
      if (providerId === provider.id || isProviderSaving) return;
      setOpen(false);
      void onSelectProvider(providerId);
    },
    [isProviderSaving, onSelectProvider, provider.id],
  );

  return (
    <div className={cn('relative min-w-0', className)}>
      <Tooltip
        content="Change image generation provider"
        position="top"
        hidden={open}
        className="w-full"
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
            `studio-command-surface studio-hit-target flex h-8 w-8 items-center justify-center gap-1 rounded-lg border border-white/2 bg-white/5 px-1 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/2 hover:bg-accent-500/10 hover:text-white lg:w-auto lg:justify-start lg:gap-1.5 lg:px-2 ${compactMode ? 'lg:max-w-20' : 'lg:max-w-32'}`
          }
        >
          <ProviderBrandMark providerId={provider.id} size="xs" />
          {showLabel ? (
            <span className="hidden min-w-0 truncate text-[10px] font-black uppercase tracking-[0.16em] lg:inline">
              {provider.toolbarLabel}
            </span>
          ) : null}
          <ChevronDown
            size={12}
            aria-hidden="true"
            className={`hidden shrink-0 transition-transform lg:block ${open ? 'rotate-180' : ''}`}
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
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
            Image provider
          </div>
          <div className="mt-1 text-[11px] font-semibold text-zinc-300">
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
                title={option.tooltip}
                onClick={() => selectProvider(option.id)}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-[color,background-color,border-color,opacity,transform] ${
                  isSelected
                    ? 'border-accent-400/2 bg-accent-500/12 text-white'
                    : 'border-transparent bg-white/[0.03] text-zinc-300 hover:border-white/2 hover:bg-white/[0.07]'
                } disabled:cursor-not-allowed disabled:opacity-55`}
              >
                <ProviderBrandMark
                  providerId={option.id}
                  size="sm"
                  canExecute={option.canExecute}
                  status={option.status}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10px] font-black uppercase tracking-[0.14em]">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[9px] font-bold text-zinc-500">
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
            className="mt-2 w-full rounded-lg border-t border-white/2 px-3 py-2 text-left text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500 transition-colors hover:text-zinc-200"
          >
            Provider settings and diagnostics
          </button>
        ) : null}
      </DemandMountedGsapDropdown>
    </div>
  );
}
