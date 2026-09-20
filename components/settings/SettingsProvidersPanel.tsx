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
      className={`inline-flex h-6 shrink-0 items-center rounded-[var(--wb-radius)] border px-2 text-[length:var(--wbp-label)] font-semibold ${className}`}
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
      <div className="settings-provider-section">
        <div className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
          Default provider
        </div>
        <fieldset className="settings-provider-picker">
          <legend className="sr-only">Default provider</legend>
          {providerOptions.map((providerId) => {
            const isSelected = providerId === defaultProviderId;
            return (
              <label
                key={providerId}
                className="studio-ghost-control settings-provider-option"
                data-selected={isSelected}
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
                <span className="min-w-0 text-xs font-medium">
                  {providerBrandChipLabel(providerId)}
                </span>
              </label>
            );
          })}
        </fieldset>
      </div>

      {providerCapabilities ? (
        <div className="settings-provider-section">
          <div>
            <div className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
              Accounts
            </div>
          </div>
          <div className="settings-provider-accounts">
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
                <div key={provider.providerId} className="settings-provider-account">
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
                          <div className="text-xs font-semibold text-[color:var(--wb-ink)]">
                            {provider.label}
                          </div>
                          {provider.isDefault ? (
                            <p className="mt-0.5 text-[11px] text-[color:var(--wb-muted)]">
                              Default provider
                            </p>
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
                  {runtimeLabel || secretLabel ? (
                    <p className="settings-provider-runtime">
                      {[runtimeLabel, secretLabel].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  {!provider.canExecute && (
                    <p className="settings-provider-attention">{provider.detail}</p>
                  )}
                  {subscriptionId ? <SubscriptionAuthControls providerId={subscriptionId} /> : null}
                  <details className="settings-provider-details">
                    <summary>Connection details</summary>
                    {provider.canExecute && <p>{provider.detail}</p>}
                    {preflight?.diagnostics.length ? (
                      <p>{preflight.diagnostics.join(' ')}</p>
                    ) : null}
                  </details>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="md:col-span-2 text-[12px] leading-relaxed text-[color:var(--wb-muted)]">
          Provider status loads with Studio Settings.
        </p>
      )}
      <details className="settings-provider-defaults">
        <summary>
          Generation defaults <span>{providerBrandChipLabel(defaultProviderId)}</span>
        </summary>
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
      </details>
    </>
  );
}
