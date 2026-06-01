import {
  Database,
  FileImage,
  FolderOpen,
  FolderPlus,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  Upload,
  X,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useRef, useState } from 'react';

import {
  BUILT_IN_GENERATION_PROVIDERS,
  type GenerationProviderId,
} from '../packages/shared/src/generationContracts';
import type {
  ExternalOutputSourceCandidate,
  ExternalOutputSourceFile,
  ExternalOutputSourcesResponse,
  RegisterExternalOutputSourceInput,
} from '../packages/shared/src/outputSources';
import type {
  GenerationProviderCapabilitiesResponse,
  GenerationProviderRuntimePreflightResponse,
} from '../packages/shared/src/providerCapabilities';
import type {
  EditableStudioSettings,
  EditableStudioSettingsPatch,
  StudioOutputMode,
  StudioOutputSubfolderToken,
} from '../packages/shared/src/studioSettings';

interface StudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditableStudioSettings | null;
  libraryDir: string | null;
  isLoading: boolean;
  isSaving: boolean;
  providerCapabilities: GenerationProviderCapabilitiesResponse | null;
  providerRuntimePreflight: GenerationProviderRuntimePreflightResponse | null;
  outputSources: ExternalOutputSourcesResponse | null;
  outputSourceFiles: Record<string, ExternalOutputSourceFile[]>;
  isLoadingOutputSources: boolean;
  loadingOutputSourceFiles: Record<string, boolean>;
  isRegisteringOutputSource: boolean;
  importingOutputSources: Record<string, boolean>;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onUpdate: (patch: EditableStudioSettingsPatch) => void | Promise<void>;
  onRegisterOutputSource: (input: RegisterExternalOutputSourceInput) => void | Promise<void>;
  onLoadOutputSourceFiles: (sourceId: string) => void | Promise<void>;
  onImportOutputSourceFiles: (
    sourceId: string,
    files: string[],
    workspaceId?: string | null,
  ) => void | Promise<void>;
  onResetStudio: () => void | Promise<void>;
  isResettingStudio: boolean;
}

function normalizeOutputPath(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

const OUTPUT_SUBFOLDER_PRESETS: {
  label: string;
  value: StudioOutputSubfolderToken[];
}[] = [
    { label: 'Date / Provider / Recipe', value: ['date', 'provider', 'recipe'] },
    { label: 'Date / Model / Recipe', value: ['date', 'model', 'recipe'] },
    { label: 'Provider / Recipe', value: ['provider', 'recipe'] },
    { label: 'Recipe / Date', value: ['recipe', 'date'] },
    { label: 'No Subfolders', value: [] },
  ];

function encodeSubfolderTokens(value: StudioOutputSubfolderToken[]) {
  return value.join('/');
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function providerStatusClass(status: string) {
  if (status === 'active') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200';
  if (status === 'planned') return 'border-amber-500/20 bg-amber-500/10 text-amber-200';
  return 'border-white/8 bg-white/4 text-zinc-400';
}

interface FormState {
  defaultProviderId: GenerationProviderId;
  defaultOutputMode: StudioOutputMode;
  preferredOutputPath: string;
  outputSubfolderPreset: string;
  outputFileNameTemplate: string;
  autoDetectOutputSources: boolean;
  commandCenterCompactMode: boolean;
}

function getInitialFormState(): FormState {
  return {
    defaultProviderId: 'codex',
    defaultOutputMode: 'studio_library',
    preferredOutputPath: '',
    outputSubfolderPreset: encodeSubfolderTokens(['date', 'provider', 'recipe']),
    outputFileNameTemplate: '{timestamp}-{provider}-{jobId}',
    autoDetectOutputSources: true,
    commandCenterCompactMode: false,
  };
}

function getFormStateFromSettings(s: EditableStudioSettings): FormState {
  return {
    defaultProviderId: s.defaultProviderId,
    defaultOutputMode: s.defaultOutputMode,
    preferredOutputPath: s.preferredOutputPath ?? '',
    outputSubfolderPreset: encodeSubfolderTokens(s.outputOrganization.subfolderTokens),
    outputFileNameTemplate: s.outputOrganization.fileNameTemplate,
    autoDetectOutputSources: s.autoDetectOutputSources,
    commandCenterCompactMode: s.commandCenterCompactMode,
  };
}

interface SettingsFormPanelProps {
  formState: FormState;
  onFormChange: React.Dispatch<React.SetStateAction<FormState>>;
  libraryDir: string | null;
  providerOptions: GenerationProviderId[];
  providerCapabilities: GenerationProviderCapabilitiesResponse | null;
  providerRuntimePreflight: GenerationProviderRuntimePreflightResponse | null;
  onResetStudio: () => void | Promise<void>;
  isResettingStudio: boolean;
}

function SettingsFormPanel({
  formState,
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
  } = formState;

  const preflightByProvider = new Map(
    providerRuntimePreflight?.providers.map((p) => [p.providerId, p]) ?? [],
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2 rounded-lg border border-white/8 bg-white/4 p-4">
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

      <label className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/4 p-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Default Provider
        </span>
        <select
          value={defaultProviderId}
          onChange={(event) =>
            setFormState((prev) => ({
              ...prev,
              defaultProviderId: event.target.value as GenerationProviderId,
            }))
          }
          className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-xs font-black uppercase tracking-widest text-white outline-none transition-colors focus:border-accent-400/50"
        >
          {providerOptions.map((providerId) => (
            <option key={providerId} value={providerId}>
              {providerId}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/4 p-4">
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
          className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-xs font-black uppercase tracking-widest text-white outline-none transition-colors focus:border-accent-400/50"
        >
          <option value="studio_library">Studio Library</option>
          <option value="external_source">External Source</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/4 p-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Output Subfolders
        </span>
        <select
          value={outputSubfolderPreset}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, outputSubfolderPreset: event.target.value }))
          }
          className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-xs font-black uppercase tracking-widest text-white outline-none transition-colors focus:border-accent-400/50"
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

      <label className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/4 p-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          File Name Template
        </span>
        <input
          value={outputFileNameTemplate}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, outputFileNameTemplate: event.target.value }))
          }
          placeholder="{timestamp}-{provider}-{jobId}"
          aria-label="File name template"
          className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 font-mono text-xs text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-accent-400/50"
        />
      </label>

      <label className="md:col-span-2 flex flex-col gap-2 rounded-lg border border-white/8 bg-white/4 p-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Preferred Output Path
        </span>
        <input
          value={preferredOutputPath}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, preferredOutputPath: event.target.value }))
          }
          placeholder={libraryDir ?? 'D:/outputs'}
          aria-label="Preferred output path"
          className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 font-mono text-xs text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-accent-400/50"
        />
      </label>

      {providerCapabilities ? (
        <div className="md:col-span-2 rounded-lg border border-white/8 bg-white/4 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Provider Capability Status
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">
              Non-secret
            </span>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {providerCapabilities.providers.map((provider) => {
              const preflight = preflightByProvider.get(provider.providerId);

              return (
                <div
                  key={provider.providerId}
                  className={`rounded-lg border px-3 py-2 ${providerStatusClass(provider.status)}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[10px] font-black uppercase tracking-widest">
                        {provider.label}
                      </div>
                      <div className="mt-1 truncate text-[9px] font-bold uppercase tracking-widest opacity-70">
                        {provider.runtimeKind}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-[9px] font-black uppercase tracking-widest">
                      {provider.isDefault ? <span>Default</span> : null}
                      <span>{provider.status}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] leading-relaxed opacity-80">{provider.detail}</p>
                  {preflight ? (
                    <div className="mt-2 grid gap-1 border-t border-white/10 pt-2 text-[9px] font-bold uppercase tracking-widest opacity-80">
                      <div className="flex justify-between gap-2">
                        <span>Secret</span>
                        <span className="truncate text-right">
                          {preflight.secretState}
                          {preflight.secretSource ? ` / ${preflight.secretSource}` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>Runtime</span>
                        <span className="truncate text-right">
                          {preflight.localRuntimeState}
                          {preflight.localRuntimeSource ? ` / ${preflight.localRuntimeSource}` : ''}
                        </span>
                      </div>
                      {preflight.diagnostics.length > 0 ? (
                        <div className="pt-1 text-[9px] leading-relaxed normal-case tracking-normal opacity-70">
                          {preflight.diagnostics.join(' ')}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() =>
          setFormState((prev) => ({
            ...prev,
            autoDetectOutputSources: !prev.autoDetectOutputSources,
          }))
        }
        className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${autoDetectOutputSources ? 'border-accent-500/20 bg-accent-500/10' : 'border-white/8 bg-white/4 hover:bg-white/8'}`}
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

      <button
        type="button"
        onClick={() =>
          setFormState((prev) => ({
            ...prev,
            commandCenterCompactMode: !prev.commandCenterCompactMode,
          }))
        }
        className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${commandCenterCompactMode ? 'border-accent-500/20 bg-accent-500/10' : 'border-white/8 bg-white/4 hover:bg-white/8'}`}
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
        className="flex items-center justify-between rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-left transition-colors hover:bg-rose-500/15 disabled:opacity-60"
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
    </div>
  );
}

interface SettingsOutputSourcesPanelProps {
  outputSources: ExternalOutputSourcesResponse | null;
  outputSourceFiles: Record<string, ExternalOutputSourceFile[]>;
  loadingOutputSourceFiles: Record<string, boolean>;
  importingOutputSources: Record<string, boolean>;
  isLoadingOutputSources: boolean;
  isRegisteringOutputSource: boolean;
  onLoadOutputSourceFiles: (sourceId: string) => void | Promise<void>;
  onImportOutputSourceFiles: (
    sourceId: string,
    files: string[],
    workspaceId?: string | null,
  ) => void | Promise<void>;
  onRegisterOutputSource: (input: RegisterExternalOutputSourceInput) => void | Promise<void>;
}

function SettingsOutputSourcesPanel({
  outputSources,
  outputSourceFiles,
  loadingOutputSourceFiles,
  importingOutputSources,
  isLoadingOutputSources,
  isRegisteringOutputSource,
  onLoadOutputSourceFiles,
  onImportOutputSourceFiles,
  onRegisterOutputSource,
}: SettingsOutputSourcesPanelProps) {
  const [selectedOutputFiles, setSelectedOutputFiles] = useState<Record<string, string[]>>({});

  const registeredOutputPaths = new Set(
    outputSources?.registry.sources.map((source) => source.path) ?? [],
  );
  const outputSourceCandidates =
    outputSources?.candidates.filter((candidate) => !registeredOutputPaths.has(candidate.path)) ??
    [];

  const handleRegisterOutputSource = (candidate: ExternalOutputSourceCandidate) => {
    void onRegisterOutputSource({
      label: candidate.label,
      path: candidate.path,
      providerId: candidate.providerId,
    });
  };

  const toggleOutputFile = (sourceId: string, relativePath: string) => {
    setSelectedOutputFiles((current) => {
      const selected = current[sourceId] ?? [];
      return {
        ...current,
        [sourceId]: selected.includes(relativePath)
          ? selected.filter((item) => item !== relativePath)
          : [...selected, relativePath],
      };
    });
  };

  const handleImportSelected = async (sourceId: string) => {
    const selected = selectedOutputFiles[sourceId] ?? [];
    if (selected.length === 0) return;
    await onImportOutputSourceFiles(sourceId, selected);
    setSelectedOutputFiles((current) => ({ ...current, [sourceId]: [] }));
  };

  return (
    <div className="mt-4 rounded-lg border border-white/8 bg-white/4 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
            External Output Sources
          </h3>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Detect, Register, Import Copy
          </p>
        </div>
        {isLoadingOutputSources ? (
          <LoaderCircle size={16} className="animate-spin text-zinc-500" />
        ) : (
          <FolderPlus size={16} className="text-zinc-500" />
        )}
      </div>

      <div className="space-y-3">
        {outputSources?.registry.sources.map((source) => {
          const files = outputSourceFiles[source.id] ?? [];
          const selected = selectedOutputFiles[source.id] ?? [];
          const isScanning = Boolean(loadingOutputSourceFiles[source.id]);
          const isImporting = Boolean(importingOutputSources[source.id]);

          return (
            <div
              key={source.id}
              className="rounded-lg border border-emerald-500/15 bg-emerald-500/8 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
                    {source.label}
                  </div>
                  <div className="truncate font-mono text-[10px] text-emerald-100/70">
                    {source.path}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void onLoadOutputSourceFiles(source.id)}
                    disabled={isScanning}
                    className="flex h-8 items-center gap-2 rounded-lg border border-emerald-400/20 px-3 text-[9px] font-black uppercase tracking-widest text-emerald-200 transition-colors hover:bg-emerald-400/10 disabled:opacity-40"
                  >
                    {isScanning ? (
                      <LoaderCircle size={13} className="animate-spin" />
                    ) : (
                      <FileImage size={13} />
                    )}
                    Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleImportSelected(source.id)}
                    disabled={isImporting || selected.length === 0}
                    className="flex h-8 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-[9px] font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
                  >
                    {isImporting ? (
                      <LoaderCircle size={13} className="animate-spin" />
                    ) : (
                      <Upload size={13} />
                    )}
                    Import {selected.length || ''}
                  </button>
                </div>
              </div>

              {files.length > 0 ? (
                <div className="mt-3 max-h-48 space-y-1 overflow-y-auto pr-1">
                  {files.slice(0, 25).map((file) => (
                    <label
                      key={file.relativePath}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-white/8 bg-black/20 px-3 py-2 transition-colors hover:bg-white/8"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected.includes(file.relativePath)}
                          onChange={() => toggleOutputFile(source.id, file.relativePath)}
                          aria-label={`Select ${file.relativePath}`}
                          className="size-3.5 accent-emerald-400"
                        />
                        <span className="truncate font-mono text-[10px] text-zinc-300">
                          {file.relativePath}
                        </span>
                      </span>
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                        {formatBytes(file.sizeBytes)}
                      </span>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}

        {outputSourceCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-black/20 px-3 py-2"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                <span>{candidate.label}</span>
                <span className="text-zinc-600">{candidate.status}</span>
              </div>
              <div className="truncate font-mono text-[10px] text-zinc-500">{candidate.path}</div>
            </div>
            <button
              type="button"
              onClick={() => handleRegisterOutputSource(candidate)}
              disabled={
                isRegisteringOutputSource ||
                candidate.status !== 'detected' ||
                candidate.isInsideStudioLibrary
              }
              className="h-8 rounded-lg border border-white/10 px-3 text-[9px] font-black uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/8 disabled:opacity-40"
            >
              Register
            </button>
          </div>
        ))}

        {outputSources &&
          outputSources.registry.sources.length === 0 &&
          outputSourceCandidates.length === 0 ? (
          <div className="rounded-lg border border-white/8 bg-black/20 p-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            No external output sources detected.
          </div>
        ) : null}
      </div>
    </div>
  );
}

// react-doctor-disable-next-line react-doctor/no-many-boolean-props -- settings dialog boundary intentionally receives explicit UI/loading flags
export const StudioSettingsModal: React.FC<StudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  libraryDir,
  isLoading,
  isSaving,
  providerCapabilities,
  providerRuntimePreflight,
  outputSources,
  outputSourceFiles,
  isLoadingOutputSources,
  loadingOutputSourceFiles,
  isRegisteringOutputSource,
  importingOutputSources,
  error,
  onRefresh,
  onUpdate,
  onRegisterOutputSource,
  onLoadOutputSourceFiles,
  onImportOutputSourceFiles,
  onResetStudio,
  isResettingStudio,
}) => {
  const [formState, setFormState] = useState<FormState>(getInitialFormState);

  const prevSettingsRef = useRef(settings);
  if (isOpen && settings && settings !== prevSettingsRef.current) {
    prevSettingsRef.current = settings;
    setFormState(getFormStateFromSettings(settings));
  }
  if (!isOpen && prevSettingsRef.current !== null) {
    prevSettingsRef.current = null;
  }

  const {
    defaultProviderId,
    defaultOutputMode,
    preferredOutputPath,
    outputSubfolderPreset,
    outputFileNameTemplate,
    autoDetectOutputSources,
    commandCenterCompactMode,
  } = formState;

  const providerOptions = useMemo(
    () =>
      [...BUILT_IN_GENERATION_PROVIDERS, defaultProviderId].filter(
        (providerId, index, all) => all.indexOf(providerId) === index,
      ),
    [defaultProviderId],
  );
  if (!isOpen) return null;

  const handleSave = () => {
    void onUpdate({
      defaultProviderId,
      defaultOutputMode,
      preferredOutputPath: normalizeOutputPath(preferredOutputPath),
      outputOrganization: {
        subfolderTokens:
          OUTPUT_SUBFOLDER_PRESETS.find(
            (preset) => encodeSubfolderTokens(preset.value) === outputSubfolderPreset,
          )?.value ?? [],
        fileNameTemplate: outputFileNameTemplate,
      },
      autoDetectOutputSources,
      commandCenterCompactMode,
    });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent-500/10 text-accent-300">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                Studio Settings
              </h2>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Local Library Config
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void onRefresh()}
              disabled={isLoading}
              className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 disabled:opacity-60"
            >
              {isLoading ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-100">
              {error}
            </div>
          )}

          <SettingsFormPanel
            formState={formState}
            onFormChange={setFormState}
            libraryDir={libraryDir}
            providerOptions={providerOptions}
            providerCapabilities={providerCapabilities}
            providerRuntimePreflight={providerRuntimePreflight}
            onResetStudio={onResetStudio}
            isResettingStudio={isResettingStudio}
          />
          <SettingsOutputSourcesPanel
            outputSources={outputSources}
            outputSourceFiles={outputSourceFiles}
            loadingOutputSourceFiles={loadingOutputSourceFiles}
            importingOutputSources={importingOutputSources}
            isLoadingOutputSources={isLoadingOutputSources}
            isRegisteringOutputSource={isRegisteringOutputSource}
            onLoadOutputSourceFiles={onLoadOutputSourceFiles}
            onImportOutputSourceFiles={onImportOutputSourceFiles}
            onRegisterOutputSource={onRegisterOutputSource}
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/8 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg px-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex h-10 items-center gap-2 rounded-lg bg-accent-600 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-accent-500 disabled:opacity-60"
          >
            {isSaving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
