import { CozyLoader as LoaderCircle } from '../CozyMascot';
import { SettingsAppearancePanel } from './SettingsAppearancePanel';
import { SettingsOutputPanel } from './SettingsOutputPanel';
import {
  Database,
  Folder as FolderOpen,
  RefreshCircle as RotateCcw,
  Settings,
} from 'iconoir-react';
import type React from 'react';
import { type GenerationProviderId } from '../../packages/shared/src/generationContracts';
import type {
  GenerationProviderCapabilitiesResponse,
  GenerationProviderRuntimePreflightResponse,
} from '../../packages/shared/src/providerCapabilities';
import {
  EXTERNAL_SCAN_PATH_HELP,
  EXTERNAL_SCAN_PATH_LABEL,
  type StudioSettingsFormState,
} from '../../lib/studioSettingsForm';
import { type StudioSettingsDomainId } from '../../lib/studioSettingsDomains';
import { SettingsProvidersPanel } from './SettingsProvidersPanel';

interface SettingsFormPanelProps {
  domain: Extract<StudioSettingsDomainId, 'appearance' | 'library' | 'providers' | 'output'>;
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
    preferredOutputPath,
    autoDetectOutputSources,
    commandCenterCompactMode,
    intentionalStylesV1,
  } = formState;

  return (
    <div className={domain === 'library' ? 'grid gap-4 md:grid-cols-2' : 'settings-form-stack'}>
      {domain === 'library' ? (
        <>
          <div className="md:col-span-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] p-4">
            <div className="flex items-center gap-3">
              <FolderOpen width={16} height={16} className="text-[color:var(--wb-muted)]" />
              <div className="min-w-0">
                <div className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
                  Studio Library
                </div>
                <div className="truncate font-mono text-[length:var(--wbp-label)] text-[color:var(--wb-ink)]">
                  {libraryDir ?? 'Waiting for local library path...'}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void onResetStudio()}
            disabled={isResettingStudio}
            className="flex items-center justify-between rounded-[var(--wb-radius)] border border-rose-500/2 bg-rose-500/10 p-4 text-left transition-colors hover:bg-rose-500/15 disabled:opacity-60"
          >
            <span className="flex items-center gap-3">
              <Database width={16} height={16} className="text-[color:var(--wb-danger)] " />
              <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-danger)] ">
                Rebuild Library
              </span>
            </span>
            {isResettingStudio ? (
              <LoaderCircle size={16} className="animate-spin text-[color:var(--wb-danger)] " />
            ) : (
              <RotateCcw width={16} height={16} className="text-[color:var(--wb-danger)] " />
            )}
          </button>
        </>
      ) : null}

      {domain === 'library' ? (
        <>
          <label className="md:col-span-2 flex flex-col gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] p-4">
            <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
              {EXTERNAL_SCAN_PATH_LABEL}
            </span>
            <p className="text-[11px] leading-relaxed text-[color:var(--wb-muted)]">
              {EXTERNAL_SCAN_PATH_HELP}
            </p>
            <input
              value={preferredOutputPath}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, preferredOutputPath: event.target.value }))
              }
              placeholder={libraryDir ?? 'D:/outputs'}
              aria-label={EXTERNAL_SCAN_PATH_LABEL}
              className="h-10 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 font-mono text-xs text-[color:var(--wb-ink)] outline-none transition-colors placeholder:text-[color:var(--wb-dim)] focus:border-accent-400/2"
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
            aria-pressed={autoDetectOutputSources}
            className={`flex items-center justify-between rounded-[var(--wb-radius)] border p-4 text-left transition-colors ${autoDetectOutputSources ? 'border-accent-500/2 bg-accent-500/10' : 'border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)]'}`}
          >
            <span className="flex items-center gap-3">
              <FolderOpen
                width={16}
                height={16}
                className={
                  autoDetectOutputSources ? 'text-accent-300' : 'text-[color:var(--wb-muted)]'
                }
              />
              <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
                Discover external images
              </span>
            </span>
            <span
              className={`size-2.5 rounded-full ${autoDetectOutputSources ? 'bg-accent-300' : 'bg-[color:var(--wb-dim)]'}`}
            />
          </button>
        </>
      ) : null}

      {domain === 'appearance' ? (
        <>
          <label className="studio-setting-toggle">
            <span>
              <strong>Show workspace history in carousel</strong>
              <small>On: all workflows in this workspace. Off: only the current workflow.</small>
            </span>
            <input
              type="checkbox"
              checked={formState.showWorkspaceHistoryInCarousel}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  showWorkspaceHistoryInCarousel: event.target.checked,
                }))
              }
            />
          </label>
          <SettingsAppearancePanel />
          <button
            type="button"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                commandCenterCompactMode: !prev.commandCenterCompactMode,
              }))
            }
            aria-pressed={commandCenterCompactMode}
            className={`flex items-center justify-between rounded-[var(--wb-radius)] border p-4 text-left transition-colors ${commandCenterCompactMode ? 'border-accent-500/2 bg-accent-500/10' : 'border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)]'}`}
          >
            <span className="flex items-center gap-3">
              <Settings
                width={16}
                height={16}
                className={
                  commandCenterCompactMode ? 'text-accent-300' : 'text-[color:var(--wb-muted)]'
                }
              />
              <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
                Compact workspace controls
              </span>
            </span>
            <span
              className={`size-2.5 rounded-full ${commandCenterCompactMode ? 'bg-accent-300' : 'bg-[color:var(--wb-dim)]'}`}
            />
          </button>
          <button
            type="button"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                intentionalStylesV1: !prev.intentionalStylesV1,
              }))
            }
            aria-pressed={intentionalStylesV1}
            className={`flex items-center justify-between rounded-[var(--wb-radius)] border p-4 text-left transition-colors ${intentionalStylesV1 ? 'border-accent-500/2 bg-accent-500/10' : 'border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)]'}`}
          >
            <span className="flex min-w-0 flex-col gap-1 text-left">
              <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
                Intentional style compiler
              </span>
              <span className="text-xs text-[color:var(--wb-muted)]">
                Apply selected style fields without hidden restage. Off keeps the current Styles
                path.
              </span>
            </span>
            <span
              className={`size-2.5 shrink-0 rounded-full ${intentionalStylesV1 ? 'bg-accent-300' : 'bg-[color:var(--wb-dim)]'}`}
            />
          </button>
        </>
      ) : null}

      {domain === 'providers' ? (
        <SettingsProvidersPanel
          formState={formState}
          onFormChange={setFormState}
          providerOptions={providerOptions}
          providerCapabilities={providerCapabilities}
          providerRuntimePreflight={providerRuntimePreflight}
        />
      ) : null}

      {domain === 'output' ? (
        <SettingsOutputPanel value={formState} onChange={setFormState} libraryDir={libraryDir} />
      ) : null}
    </div>
  );
}
