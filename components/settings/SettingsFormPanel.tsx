import { useTheme } from '../../hooks/useTheme';
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
import {
  encodeSubfolderTokens,
  EXTERNAL_SCAN_PATH_HELP,
  EXTERNAL_SCAN_PATH_LABEL,
  OUTPUT_SUBFOLDER_PRESETS,
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
  const { appearance, toggleAppearance, currentTheme, cycleTheme } = useTheme();
  const {
    preferredOutputPath,
    outputSubfolderPreset,
    outputFileNameTemplate,
    autoDetectOutputSources,
    commandCenterCompactMode,
  } = formState;

  return (
    <div className={domain === 'providers' ? 'grid gap-4' : 'grid gap-4 md:grid-cols-2'}>
      {domain === 'library' ? (
        <>
          <div className="md:col-span-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] p-4">
            <div className="flex items-center gap-3">
              <FolderOpen size={16} className="text-[color:var(--wb-muted)]" />
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
              <Database size={16} className="text-[color:var(--wb-danger)] " />
              <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-danger)] ">
                Rebuild Library
              </span>
            </span>
            {isResettingStudio ? (
              <LoaderCircle size={16} className="animate-spin text-[color:var(--wb-danger)] " />
            ) : (
              <RotateCcw size={16} className="text-[color:var(--wb-danger)] " />
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
            className={`flex items-center justify-between rounded-[var(--wb-radius)] border p-4 text-left transition-colors ${autoDetectOutputSources ? 'border-accent-500/2 bg-accent-500/10' : 'border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)]'}`}
          >
            <span className="flex items-center gap-3">
              <FolderOpen
                size={16}
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
          <div className="grid gap-3">
            <button
              type="button"
              onClick={toggleAppearance}
              className="studio-ghost-control p-4 text-left"
            >
              Appearance: {appearance === 'light' ? 'Light' : 'Dark'} · Switch
            </button>
            <button
              type="button"
              onClick={cycleTheme}
              className="studio-ghost-control p-4 text-left"
            >
              Accent: {currentTheme} · Change color
            </button>
            <p className="text-xs text-[color:var(--wb-muted)]">
              Theme and accent changes apply immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                commandCenterCompactMode: !prev.commandCenterCompactMode,
              }))
            }
            className={`flex items-center justify-between rounded-[var(--wb-radius)] border p-4 text-left transition-colors ${commandCenterCompactMode ? 'border-accent-500/2 bg-accent-500/10' : 'border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)]'}`}
          >
            <span className="flex items-center gap-3">
              <Settings
                size={16}
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
        <>
          <div className="md:col-span-2 rounded border border-[color:var(--wb-line)] p-4">
            <h3 className="text-sm font-semibold">Generation destination</h3>
            <p className="mt-1 text-xs">Studio Library</p>
            <p className="mt-1 break-all font-mono text-xs text-[color:var(--wb-muted)]">
              {libraryDir ?? 'Waiting for Studio Library…'}
            </p>
            <p className="mt-2 text-xs text-[color:var(--wb-muted)]">
              To discover images from another folder, open Library &amp; imports.
            </p>
          </div>

          <label className="flex flex-col gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] p-4">
            <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
              Output Subfolders
            </span>
            <select
              value={outputSubfolderPreset}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, outputSubfolderPreset: event.target.value }))
              }
              className="h-10 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 text-xs font-semibold tracking-normal text-[color:var(--wb-ink)] outline-none transition-colors focus:border-accent-400/2"
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

          <label className="flex flex-col gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] p-4">
            <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
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
              className="h-10 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 font-mono text-xs text-[color:var(--wb-ink)] outline-none transition-colors placeholder:text-[color:var(--wb-dim)] focus:border-accent-400/2"
            />
            {fileNameError ? (
              <span id="output-filename-error" className="text-xs text-[color:var(--wb-danger)] ">
                {fileNameError}
              </span>
            ) : null}
          </label>
        </>
      ) : null}
    </div>
  );
}
