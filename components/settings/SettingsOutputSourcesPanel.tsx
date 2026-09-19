import {
  IconPhoto as FileImage,
  IconFolderPlus as FolderPlus,
  IconLoader as LoaderCircle,
  IconUpload as Upload,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import type {
  ExternalOutputSourceCandidate,
  ExternalOutputSourceFile,
  ExternalOutputSourcesResponse,
  RegisterExternalOutputSourceInput,
} from '../../packages/shared/src/outputSources';
function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
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

export function SettingsOutputSourcesPanel({
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

  useEffect(() => {
    setSelectedOutputFiles((current) => {
      let changed = false;
      const next = { ...current };
      for (const [sourceId, selected] of Object.entries(current)) {
        const files = outputSourceFiles[sourceId];
        if (!files) continue;
        const available = new Set(files.map((file) => file.relativePath));
        const remaining = selected.filter((file) => available.has(file));
        if (remaining.length !== selected.length) {
          next[sourceId] = remaining;
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [outputSourceFiles]);

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
    const available = new Set((outputSourceFiles[sourceId] ?? []).map((file) => file.relativePath));
    const selected = (selectedOutputFiles[sourceId] ?? []).filter((file) => available.has(file));
    if (selected.length === 0) return;
    await onImportOutputSourceFiles(sourceId, selected);
  };

  return (
    <div className="mt-4 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
            External Output Sources
          </h3>
          <p className="mt-1 text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-dim)]">
            Detect, Register, Import Copy
          </p>
        </div>
        {isLoadingOutputSources ? (
          <LoaderCircle size={16} className="animate-spin text-[color:var(--wb-muted)]" />
        ) : (
          <FolderPlus size={16} className="text-[color:var(--wb-muted)]" />
        )}
      </div>

      <div className="space-y-3">
        {outputSources?.registry.sources.map((source) => {
          const files = outputSourceFiles[source.id] ?? [];
          const available = new Set(files.map((file) => file.relativePath));
          const selected = (selectedOutputFiles[source.id] ?? []).filter((file) =>
            available.has(file),
          );
          const selectedSet = new Set(selected);
          const isScanning = Boolean(loadingOutputSourceFiles[source.id]);
          const isImporting = Boolean(importingOutputSources[source.id]);

          return (
            <div
              key={source.id}
              className="rounded-[var(--wb-radius)] border border-emerald-500/2 bg-emerald-500/8 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-success)] ">
                    {source.label}
                  </div>
                  <div className="truncate font-mono text-[length:var(--wbp-label)] text-[color:var(--wb-success)] ">
                    {source.path}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void onLoadOutputSourceFiles(source.id)}
                    disabled={isScanning || isImporting}
                    className="flex h-8 items-center gap-2 rounded-[var(--wb-radius)] border border-emerald-400/2 px-3 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-success)]  transition-colors hover:bg-emerald-400/10 disabled:opacity-40"
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
                    disabled={isImporting || isScanning || selected.length === 0}
                    className="flex h-8 items-center gap-2 rounded-[var(--wb-radius)] bg-emerald-600 px-3 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)] transition-colors hover:bg-emerald-500 disabled:opacity-40"
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

              <p role="status" className="mt-2 text-xs text-[color:var(--wb-muted)]">
                {isScanning
                  ? 'Scanning files…'
                  : outputSourceFiles[source.id] === undefined
                    ? 'Scan this source to choose files to import.'
                    : files.length === 0
                      ? 'No files available to import.'
                      : `${files.length} files available to import.`}
              </p>
              {files.length > 0 ? (
                <div className="mt-3 flex items-center gap-3 text-xs text-[color:var(--wb-muted)]">
                  <button
                    type="button"
                    disabled={isImporting || isScanning}
                    aria-label={`Select all files from ${source.label}`}
                    onClick={() =>
                      setSelectedOutputFiles((current) => ({
                        ...current,
                        [source.id]: files.map((file) => file.relativePath),
                      }))
                    }
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    disabled={isImporting || isScanning || selected.length === 0}
                    aria-label={`Clear file selection from ${source.label}`}
                    onClick={() =>
                      setSelectedOutputFiles((current) => ({ ...current, [source.id]: [] }))
                    }
                  >
                    Clear selection
                  </button>
                  <span>
                    {selected.length} of {files.length} selected
                  </span>
                </div>
              ) : null}
              {files.length > 0 ? (
                <div className="mt-3 max-h-48 space-y-1 overflow-y-auto pr-1">
                  {files.map((file) => (
                    <label
                      key={file.relativePath}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 py-2 transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)]"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedSet.has(file.relativePath)}
                          disabled={isImporting || isScanning}
                          onChange={() => toggleOutputFile(source.id, file.relativePath)}
                          aria-label={`Select ${file.relativePath}`}
                          className="size-3.5 accent-emerald-400"
                        />
                        <span className="truncate font-mono text-[length:var(--wbp-label)] text-[color:var(--wb-ink)]">
                          {file.relativePath}
                        </span>
                      </span>
                      <span className="shrink-0 text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-dim)]">
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
            className="flex items-center justify-between gap-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 py-2"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
                <span>{candidate.label}</span>
                <span className="text-[color:var(--wb-dim)]">{candidate.status}</span>
              </div>
              <div className="truncate font-mono text-[length:var(--wbp-label)] text-[color:var(--wb-muted)]">
                {candidate.path}
              </div>
            </div>
            <button
              type="button"
              aria-label={`Register output source ${candidate.label}`}
              onClick={() => handleRegisterOutputSource(candidate)}
              disabled={
                isRegisteringOutputSource ||
                candidate.status !== 'detected' ||
                candidate.isInsideStudioLibrary
              }
              className="h-8 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] px-3 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] disabled:opacity-40"
            >
              Register
            </button>
          </div>
        ))}

        {outputSources &&
        outputSources.registry.sources.length === 0 &&
        outputSourceCandidates.length === 0 ? (
          <div className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3 text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-dim)]">
            No external output sources detected.
          </div>
        ) : null}
      </div>
    </div>
  );
}
