import React, { useEffect, useMemo, useState } from 'react';
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
  Sparkles,
  Upload,
  X,
} from 'lucide-react';

import {
  BUILT_IN_GENERATION_PROVIDERS,
  type EditableStudioSettings,
  type EditableStudioSettingsPatch,
  type ExternalOutputSourceCandidate,
  type ExternalOutputSourceFile,
  type ExternalOutputSourcesResponse,
  type GenerationProviderId,
  type RegisterExternalOutputSourceInput,
  type StudioOutputMode,
} from '../packages/shared/src';

interface StudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditableStudioSettings | null;
  libraryDir: string | null;
  isLoading: boolean;
  isSaving: boolean;
  outputSources: ExternalOutputSourcesResponse | null;
  outputSourceFiles: Record<string, ExternalOutputSourceFile[]>;
  isLoadingOutputSources: boolean;
  loadingOutputSourceFiles: Record<string, boolean>;
  isRegisteringOutputSource: boolean;
  importingOutputSources: Record<string, boolean>;
  error: string | null;
  isBackgroundEnabled: boolean;
  onToggleBackground: () => void;
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

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export const StudioSettingsModal: React.FC<StudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  libraryDir,
  isLoading,
  isSaving,
  outputSources,
  outputSourceFiles,
  isLoadingOutputSources,
  loadingOutputSourceFiles,
  isRegisteringOutputSource,
  importingOutputSources,
  error,
  isBackgroundEnabled,
  onToggleBackground,
  onRefresh,
  onUpdate,
  onRegisterOutputSource,
  onLoadOutputSourceFiles,
  onImportOutputSourceFiles,
  onResetStudio,
  isResettingStudio,
}) => {
  const [defaultProviderId, setDefaultProviderId] = useState<GenerationProviderId>('codex');
  const [defaultOutputMode, setDefaultOutputMode] =
    useState<StudioOutputMode>('studio_library');
  const [preferredOutputPath, setPreferredOutputPath] = useState('');
  const [autoDetectOutputSources, setAutoDetectOutputSources] = useState(true);
  const [commandCenterCompactMode, setCommandCenterCompactMode] = useState(false);
  const [selectedOutputFiles, setSelectedOutputFiles] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isOpen || !settings) return;

    setDefaultProviderId(settings.defaultProviderId);
    setDefaultOutputMode(settings.defaultOutputMode);
    setPreferredOutputPath(settings.preferredOutputPath ?? '');
    setAutoDetectOutputSources(settings.autoDetectOutputSources);
    setCommandCenterCompactMode(settings.commandCenterCompactMode);
  }, [isOpen, settings]);

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
      autoDetectOutputSources,
      commandCenterCompactMode,
    });
  };

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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/10 text-accent-300">
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
              onClick={() => void onRefresh()}
              disabled={isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 disabled:opacity-60"
            >
              {isLoading ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
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

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/4 p-4">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <FolderOpen size={14} />
                Current Library
              </span>
              <span className="truncate font-mono text-xs text-zinc-300">
                {libraryDir ?? 'Unavailable'}
              </span>
            </label>

            <label className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/4 p-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Preferred Output Path
              </span>
              <input
                value={preferredOutputPath}
                onChange={(event) => setPreferredOutputPath(event.target.value)}
                placeholder={libraryDir ?? 'D:/outputs'}
                className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 font-mono text-xs text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-accent-400/50"
              />
            </label>

            <label className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/4 p-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Default Provider
              </span>
              <select
                value={defaultProviderId}
                onChange={(event) =>
                  setDefaultProviderId(event.target.value as GenerationProviderId)
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
                  setDefaultOutputMode(event.target.value as StudioOutputMode)
                }
                className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-xs font-black uppercase tracking-widest text-white outline-none transition-colors focus:border-accent-400/50"
              >
                <option value="studio_library">Studio Library</option>
                <option value="external_source">External Source</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => setAutoDetectOutputSources((value) => !value)}
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
                className={`h-2.5 w-2.5 rounded-full ${autoDetectOutputSources ? 'bg-accent-300' : 'bg-zinc-700'}`}
              />
            </button>

            <button
              type="button"
              onClick={() => setCommandCenterCompactMode((value) => !value)}
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
                className={`h-2.5 w-2.5 rounded-full ${commandCenterCompactMode ? 'bg-accent-300' : 'bg-zinc-700'}`}
              />
            </button>

            <button
              type="button"
              onClick={onToggleBackground}
              className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${isBackgroundEnabled ? 'border-accent-500/20 bg-accent-500/10' : 'border-white/8 bg-white/4 hover:bg-white/8'}`}
            >
              <span className="flex items-center gap-3">
                <Sparkles
                  size={16}
                  className={isBackgroundEnabled ? 'text-accent-300' : 'text-zinc-500'}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                  Animated Background
                </span>
              </span>
              <span
                className={`h-2.5 w-2.5 rounded-full ${isBackgroundEnabled ? 'bg-accent-300' : 'bg-zinc-700'}`}
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
                          {isScanning ? <LoaderCircle size={13} className="animate-spin" /> : <FileImage size={13} />}
                          Scan
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleImportSelected(source.id)}
                          disabled={isImporting || selected.length === 0}
                          className="flex h-8 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-[9px] font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
                        >
                          {isImporting ? <LoaderCircle size={13} className="animate-spin" /> : <Upload size={13} />}
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
                                className="h-3.5 w-3.5 accent-emerald-400"
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
                    <div className="truncate font-mono text-[10px] text-zinc-500">
                      {candidate.path}
                    </div>
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
                <div className="rounded-lg border border-white/8 bg-black/20 px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  No external output sources detected.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/8 px-5 py-4">
          <button
            onClick={onClose}
            className="h-10 rounded-lg px-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            Close
          </button>
          <button
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
