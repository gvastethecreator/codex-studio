import {
  IconDatabase as Database,
  IconFolderOpen as FolderOpen,
  IconLoader as LoaderCircle,
  IconRotate as RotateCcw,
  IconSettings as Settings,
} from '@tabler/icons-react';
import type React from 'react';
import { type GenerationProviderId } from '../../packages/shared/src/generationContracts';
import type {
  GenerationProviderCapabilitiesResponse,
  GenerationProviderRuntimePreflightResponse,
} from '../../packages/shared/src/providerCapabilities';
import { subscriptionProviderIdForGeneration } from '../../packages/shared/src/subscriptionAuth';
import type {
  ProviderDefaultSettings,
  StudioOutputMode,
} from '../../packages/shared/src/studioSettings';
import {
  encodeSubfolderTokens,
  EXTERNAL_SCAN_PATH_HELP,
  EXTERNAL_SCAN_PATH_LABEL,
  OUTPUT_SUBFOLDER_PRESETS,
  type StudioSettingsFormState,
} from '../../lib/studioSettingsForm';
import { type StudioSettingsDomainId } from '../../lib/studioSettingsDomains';
import {
  providerReadyLabel,
  providerRuntimeLabel,
  providerSecretLabel,
} from '../../lib/subscriptionAuthUi';
import { providerBrandChipLabel, providerReadyPillClass } from '../../lib/providerBrand';
import { ProviderBrandMark } from '../ProviderBrandMark';
import { SubscriptionAuthControls } from './SubscriptionAuthControls';
interface SettingsFormPanelProps {
  domain: Extract<StudioSettingsDomainId, 'library' | 'providers' | 'output'>;
  formState: StudioSettingsFormState;
  fileNameError: string | null;
  onFormChange: React.Dispatch<React.SetStateAction<StudioSettingsFormState>>;
  libraryDir: string | null;
  providerOptions: GenerationProviderId[];
  providerCapabilities: GenerationProviderCapabilitiesResponse | null;
  providerRuntimePreflight: GenerationProviderRuntimePreflightResponse | null;
  onResetStudio: () => void | Promise<void>;
  isResettingStudio: boolean;
}

function StatusPill({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-md border px-2 text-[10px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

import { ProviderExecutionDefaultsFields } from './ProviderExecutionDefaultsFields';

export function SettingsFormPanel({
  domain,
  formState,
  fileNameError,
  onFormChange: setFormState,
  libraryDir,
  providerOptions,
  providerCapabilities,
  providerRuntimePreflight,
  onResetStudio,
  isResettingStudio,
}: SettingsFormPanelProps) {
  const {
    defaultProviderId,
    defaultOutputMode,
    preferredOutputPath,
    outputSubfolderPreset,
    outputFileNameTemplate,
    autoDetectOutputSources,
    commandCenterCompactMode,
    providerDefaults,
  } = formState;
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
    <div className={domain === 'providers' ? 'grid gap-4' : 'grid gap-4 md:grid-cols-2'}>
      {domain === 'library' ? (
        <>
          <div className="md:col-span-2 rounded-lg border border-white/2 bg-white/4 p-4">
            <div className="flex items-center gap-3">
              <FolderOpen size={16} className="text-zinc-500" />
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Studio Library
                </div>
                <div className="truncate font-mono text-[10px] text-zinc-300">
                  {libraryDir ?? 'Waiting for local library path...'}
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                commandCenterCompactMode: !prev.commandCenterCompactMode,
              }))
            }
            className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${commandCenterCompactMode ? 'border-accent-500/2 bg-accent-500/10' : 'border-white/2 bg-white/4 hover:bg-white/8'}`}
          >
            <span className="flex items-center gap-3">
              <Settings
                size={16}
                className={commandCenterCompactMode ? 'text-accent-300' : 'text-zinc-500'}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                Compact Command Center
              </span>
            </span>
            <span
              className={`size-2.5 rounded-full ${commandCenterCompactMode ? 'bg-accent-300' : 'bg-zinc-700'}`}
            />
          </button>
          <button
            type="button"
            onClick={() => void onResetStudio()}
            disabled={isResettingStudio}
            className="flex items-center justify-between rounded-lg border border-rose-500/2 bg-rose-500/10 p-4 text-left transition-colors hover:bg-rose-500/15 disabled:opacity-60"
          >
            <span className="flex items-center gap-3">
              <Database size={16} className="text-rose-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-100">
                Rebuild Library
              </span>
            </span>
            {isResettingStudio ? (
              <LoaderCircle size={16} className="animate-spin text-rose-300" />
            ) : (
              <RotateCcw size={16} className="text-rose-300" />
            )}
          </button>
        </>
      ) : null}

      {domain === 'providers' ? (
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
          />

          {providerCapabilities ? (
            <div className="md:col-span-2 grid gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Accounts
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
                  Connect HTTP accounts here. Local CLI providers keep their own authenticated
                  sessions.
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
                      {subscriptionId ? (
                        <SubscriptionAuthControls providerId={subscriptionId} />
                      ) : null}
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
      ) : null}

      {domain === 'output' ? (
        <>
          <label className="flex flex-col gap-2 rounded-lg border border-white/2 bg-white/4 p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Output Mode
            </span>
            <select
              value={defaultOutputMode}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  defaultOutputMode: event.target.value as StudioOutputMode,
                }))
              }
              className="h-10 rounded-lg border border-white/2 bg-black/30 px-3 text-xs font-black uppercase tracking-widest text-white outline-none transition-colors focus:border-accent-400/2"
            >
              <option value="studio_library">Studio Library</option>
              <option value="external_source">External Source</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 rounded-lg border border-white/2 bg-white/4 p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Output Subfolders
            </span>
            <select
              value={outputSubfolderPreset}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, outputSubfolderPreset: event.target.value }))
              }
              className="h-10 rounded-lg border border-white/2 bg-black/30 px-3 text-xs font-black uppercase tracking-widest text-white outline-none transition-colors focus:border-accent-400/2"
            >
              {OUTPUT_SUBFOLDER_PRESETS.map((preset) => (
                <option
                  key={encodeSubfolderTokens(preset.value)}
                  value={encodeSubfolderTokens(preset.value)}
                >
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 rounded-lg border border-white/2 bg-white/4 p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              File Name Template
            </span>
            <input
              value={outputFileNameTemplate}
              aria-invalid={Boolean(fileNameError)}
              aria-describedby={fileNameError ? 'output-filename-error' : undefined}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, outputFileNameTemplate: event.target.value }))
              }
              placeholder="{timestamp}-{provider}-{jobId}"
              aria-label="File name template"
              className="h-10 rounded-lg border border-white/2 bg-black/30 px-3 font-mono text-xs text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-accent-400/2"
            />
            {fileNameError ? (
              <span id="output-filename-error" className="text-xs text-rose-300">
                {fileNameError}
              </span>
            ) : null}
          </label>

          <label className="md:col-span-2 flex flex-col gap-2 rounded-lg border border-white/2 bg-white/4 p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {EXTERNAL_SCAN_PATH_LABEL}
            </span>
            <p className="text-[11px] leading-relaxed text-zinc-500">{EXTERNAL_SCAN_PATH_HELP}</p>
            <input
              value={preferredOutputPath}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, preferredOutputPath: event.target.value }))
              }
              placeholder={libraryDir ?? 'D:/outputs'}
              aria-label={EXTERNAL_SCAN_PATH_LABEL}
              className="h-10 rounded-lg border border-white/2 bg-black/30 px-3 font-mono text-xs text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-accent-400/2"
            />
          </label>

          <button
            type="button"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                autoDetectOutputSources: !prev.autoDetectOutputSources,
              }))
            }
            className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${autoDetectOutputSources ? 'border-accent-500/2 bg-accent-500/10' : 'border-white/2 bg-white/4 hover:bg-white/8'}`}
          >
            <span className="flex items-center gap-3">
              <FolderOpen
                size={16}
                className={autoDetectOutputSources ? 'text-accent-300' : 'text-zinc-500'}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                Auto Detect Outputs
              </span>
            </span>
            <span
              className={`size-2.5 rounded-full ${autoDetectOutputSources ? 'bg-accent-300' : 'bg-zinc-700'}`}
            />
          </button>
        </>
      ) : null}
    </div>
  );
}
