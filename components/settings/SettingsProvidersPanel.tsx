import type { GenerationProviderId } from '../../packages/shared/src/generationContracts';
import type {
  GenerationProviderCapabilitiesResponse,
  GenerationProviderRuntimePreflightResponse,
} from '../../packages/shared/src/providerCapabilities';
import { subscriptionProviderIdForGeneration } from '../../packages/shared/src/subscriptionAuth';
import type { ProviderDefaultSettings } from '../../packages/shared/src/studioSettings';
import type { StudioSettingsFormState } from '../../lib/studioSettingsForm';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import {
  providerReadyLabel,
  providerRuntimeLabel,
  providerSecretLabel,
} from '../../lib/subscriptionAuthUi';
import { providerBrandChipLabel, providerReadyPillClass } from '../../lib/providerBrand';
import { ProviderBrandMark } from '../ProviderBrandMark';
import { SubscriptionAuthControls } from './SubscriptionAuthControls';
import { ProviderExecutionDefaultsFields } from './ProviderExecutionDefaultsFields';

interface SettingsProvidersPanelProps {
  formState: StudioSettingsFormState;
  onFormChange: Dispatch<SetStateAction<StudioSettingsFormState>>;
  providerOptions: GenerationProviderId[];
  providerCapabilities: GenerationProviderCapabilitiesResponse | null;
  providerRuntimePreflight: GenerationProviderRuntimePreflightResponse | null;
}

function StatusPill({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-md border px-2 text-[10px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export function SettingsProvidersPanel({
  formState,
  onFormChange: setFormState,
  providerOptions,
  providerCapabilities,
  providerRuntimePreflight,
}: SettingsProvidersPanelProps) {
  const { defaultProviderId, providerDefaults } = formState;
  const selectedProviderDefaults: ProviderDefaultSettings = providerDefaults[defaultProviderId] ?? {
    providerId: defaultProviderId,
    model: null,
    reasoningEffort: null,
    serviceTier: null,
  };
  const updateSelectedProviderDefaults = (patch: Partial<ProviderDefaultSettings>) => {
    setFormState((prev) => {
      const current = prev.providerDefaults[prev.defaultProviderId] ?? {
        providerId: prev.defaultProviderId,
        model: null,
        reasoningEffort: null,
        serviceTier: null,
      };
      return {
        ...prev,
        providerDefaults: {
          ...prev.providerDefaults,
          [prev.defaultProviderId]: {
            ...current,
            ...patch,
            providerId: prev.defaultProviderId,
          },
        },
      };
    });
  };

  const preflightByProvider = new Map(
    providerRuntimePreflight?.providers.map((p) => [p.providerId, p]) ?? [],
  );

  return (
    <>
      <div className="md:col-span-2 flex flex-col gap-2 rounded-xl border border-white/2 bg-white/[0.03] p-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Default Provider
        </div>
        <fieldset className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <legend className="sr-only">Default provider</legend>
          {providerOptions.map((providerId) => {
            const isSelected = providerId === defaultProviderId;
            return (
              <label
                key={providerId}
                className={`flex h-11 min-w-0 cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 text-left transition-[color,background-color,border-color,transform] focus-within:ring-2 focus-within:ring-accent-300 active:scale-[0.98] ${
                  isSelected
                    ? 'border-accent-400/2 bg-accent-500/14 text-white'
                    : 'border-white/2 bg-white/[0.03] text-zinc-300 hover:border-white/2 hover:bg-white/[0.06]'
                }`}
              >
                <input
                  type="radio"
                  name="default-provider"
                  value={providerId}
                  checked={isSelected}
                  onChange={() =>
                    setFormState((prev) => ({
                      ...prev,
                      defaultProviderId: providerId,
                    }))
                  }
                  className="sr-only"
                />
                <ProviderBrandMark providerId={providerId} size="sm" />
                <span className="min-w-0 truncate text-[11px] font-semibold">
                  {providerBrandChipLabel(providerId)}
                </span>
              </label>
            );
          })}
        </fieldset>
      </div>

      <ProviderExecutionDefaultsFields
        value={selectedProviderDefaults}
        onChange={updateSelectedProviderDefaults}
        availableModels={preflightByProvider.get(defaultProviderId)?.availableModels}
        providerDefaultModel={preflightByProvider.get(defaultProviderId)?.defaultModel}
        codexTransport={
          preflightByProvider.get('codex')?.runtimeKind === 'subscription_http'
            ? 'subscription_http'
            : 'codex_app_server'
        }
      />

      {providerCapabilities ? (
        <div className="md:col-span-2 grid gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Accounts
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
              Connect HTTP accounts here. Local CLI providers keep their own authenticated sessions.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {providerCapabilities.providers.map((provider) => {
              const preflight = preflightByProvider.get(provider.providerId);
              const subscriptionId = subscriptionProviderIdForGeneration(provider.providerId);
              const runtimeLabel = providerRuntimeLabel(preflight?.localRuntimeState);
              const secretLabel = subscriptionId
                ? null
                : providerSecretLabel(preflight?.secretState, preflight?.secretSource);
              const readyLabel = providerReadyLabel({
                canExecute: provider.canExecute,
                status: provider.status,
              });

              return (
                <div
                  key={provider.providerId}
                  className={`rounded-xl border p-4 ${
                    provider.isDefault
                      ? 'border-accent-400/2 bg-accent-500/[0.06]'
                      : 'border-white/2 bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ProviderBrandMark
                      providerId={provider.providerId}
                      size="md"
                      canExecute={provider.canExecute}
                      status={provider.status}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">
                            {provider.label}
                          </div>
                          {provider.isDefault ? (
                            <p className="mt-0.5 text-[11px] text-zinc-500">Default provider</p>
                          ) : null}
                        </div>
                        <StatusPill
                          className={providerReadyPillClass({
                            canExecute: provider.canExecute,
                            status: provider.status,
                          })}
                        >
                          {readyLabel}
                        </StatusPill>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-zinc-400">
                    {provider.detail}
                  </p>
                  {runtimeLabel || secretLabel ? (
                    <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
                      {[runtimeLabel, secretLabel].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  {preflight?.diagnostics.length ? (
                    <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
                      {preflight.diagnostics.join(' ')}
                    </p>
                  ) : null}
                  {subscriptionId ? <SubscriptionAuthControls providerId={subscriptionId} /> : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="md:col-span-2 text-[12px] leading-relaxed text-zinc-500">
          Provider status loads with Studio Settings.
        </p>
      )}
    </>
  );
}
