import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  EditableStudioSettings,
  EditableStudioSettingsPatch,
  ExternalOutputSourceFile,
  ExternalOutputSourcesResponse,
  GenerationProviderCapabilitiesResponse,
  GenerationProviderRuntimePreflightResponse,
  RegisterExternalOutputSourceInput,
} from '../packages/shared/src';
import {
  getExternalOutputSources,
  getEditableStudioSettings,
  getGenerationProviderCapabilities,
  getGenerationProviderRuntimePreflight,
  importExternalOutputSourceFiles,
  listExternalOutputSourceFiles,
  registerExternalOutputSource,
  updateEditableStudioSettings,
} from '../services/localStudioService';
import type { Toast } from '../types';

interface UseStudioSettingsOptions {
  addToast?: (message: string, type?: Toast['type']) => void;
}

export function useStudioSettings({ addToast }: UseStudioSettingsOptions = {}) {
  const [settings, setSettings] = useState<EditableStudioSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [outputSources, setOutputSources] = useState<ExternalOutputSourcesResponse | null>(null);
  const [providerCapabilities, setProviderCapabilities] =
    useState<GenerationProviderCapabilitiesResponse | null>(null);
  const [providerRuntimePreflight, setProviderRuntimePreflight] =
    useState<GenerationProviderRuntimePreflightResponse | null>(null);
  const [outputSourceFiles, setOutputSourceFiles] = useState<
    Record<string, ExternalOutputSourceFile[]>
  >({});
  const [isLoadingOutputSources, setIsLoadingOutputSources] = useState(false);
  const [loadingOutputSourceFiles, setLoadingOutputSourceFiles] = useState<Record<string, boolean>>(
    {},
  );
  const [isRegisteringOutputSource, setIsRegisteringOutputSource] = useState(false);
  const [importingOutputSources, setImportingOutputSources] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshOutputSources = useCallback(async () => {
    setIsLoadingOutputSources(true);
    setError(null);

    try {
      const nextOutputSources = await getExternalOutputSources();
      if (isMountedRef.current) {
        setOutputSources(nextOutputSources);
      }
    } catch (refreshError) {
      const message =
        refreshError instanceof Error ? refreshError.message : 'Unable to load output sources';
      if (isMountedRef.current) {
        setError(message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingOutputSources(false);
      }
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        nextSettings,
        nextOutputSources,
        nextProviderCapabilities,
        nextProviderRuntimePreflight,
      ] = await Promise.all([
        getEditableStudioSettings(),
        getExternalOutputSources(),
        getGenerationProviderCapabilities(),
        getGenerationProviderRuntimePreflight(),
      ]);
      if (isMountedRef.current) {
        setSettings(nextSettings);
        setOutputSources(nextOutputSources);
        setProviderCapabilities(nextProviderCapabilities);
        setProviderRuntimePreflight(nextProviderRuntimePreflight);
      }
    } catch (refreshError) {
      const message =
        refreshError instanceof Error ? refreshError.message : 'Unable to load Studio Settings';
      if (isMountedRef.current) {
        setError(message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const updateSettings = useCallback(
    async (patch: EditableStudioSettingsPatch) => {
      setIsSaving(true);
      setError(null);

      try {
        const nextSettings = await updateEditableStudioSettings(patch);
        const [nextOutputSources, nextProviderCapabilities, nextProviderRuntimePreflight] =
          await Promise.all([
            getExternalOutputSources(),
            getGenerationProviderCapabilities(),
            getGenerationProviderRuntimePreflight(),
          ]);
        if (isMountedRef.current) {
          setSettings(nextSettings);
          setOutputSources(nextOutputSources);
          setProviderCapabilities(nextProviderCapabilities);
          setProviderRuntimePreflight(nextProviderRuntimePreflight);
          addToast?.('Studio Settings saved', 'success');
        }
      } catch (saveError) {
        const message =
          saveError instanceof Error ? saveError.message : 'Unable to save Studio Settings';
        if (isMountedRef.current) {
          setError(message);
          addToast?.(message, 'error');
        }
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    },
    [addToast],
  );

  const registerOutputSource = useCallback(
    async (input: RegisterExternalOutputSourceInput) => {
      setIsRegisteringOutputSource(true);
      setError(null);

      try {
        await registerExternalOutputSource(input);
        const nextOutputSources = await getExternalOutputSources();
        if (isMountedRef.current) {
          setOutputSources(nextOutputSources);
          addToast?.('Output Source registered', 'success');
        }
      } catch (registerError) {
        const message =
          registerError instanceof Error
            ? registerError.message
            : 'Unable to register output source';
        if (isMountedRef.current) {
          setError(message);
          addToast?.(message, 'error');
        }
      } finally {
        if (isMountedRef.current) {
          setIsRegisteringOutputSource(false);
        }
      }
    },
    [addToast],
  );

  const loadOutputSourceFiles = useCallback(
    async (sourceId: string) => {
      setLoadingOutputSourceFiles((current) => ({ ...current, [sourceId]: true }));
      setError(null);

      try {
        const response = await listExternalOutputSourceFiles(sourceId, 100);
        if (isMountedRef.current) {
          setOutputSourceFiles((current) => ({ ...current, [sourceId]: response.files }));
        }
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : 'Unable to load output source files';
        if (isMountedRef.current) {
          setError(message);
          addToast?.(message, 'error');
        }
      } finally {
        if (isMountedRef.current) {
          setLoadingOutputSourceFiles((current) => ({ ...current, [sourceId]: false }));
        }
      }
    },
    [addToast],
  );

  const importOutputSourceFiles = useCallback(
    async (sourceId: string, files: string[], workspaceId?: string | null) => {
      if (files.length === 0) return;
      setImportingOutputSources((current) => ({ ...current, [sourceId]: true }));
      setError(null);

      try {
        const result = await importExternalOutputSourceFiles(sourceId, { files, workspaceId });
        if (isMountedRef.current) {
          const importedFiles = new Set(result.imported.map((item) => item.sourceFile));
          setOutputSourceFiles((current) => ({
            ...current,
            [sourceId]: (current[sourceId] ?? []).filter(
              (file) => !importedFiles.has(file.relativePath),
            ),
          }));
          addToast?.(
            `Imported ${result.imported.length} file${result.imported.length === 1 ? '' : 's'}`,
            result.skipped.length > 0 ? 'info' : 'success',
          );
        }
      } catch (importError) {
        const message =
          importError instanceof Error ? importError.message : 'Unable to import output files';
        if (isMountedRef.current) {
          setError(message);
          addToast?.(message, 'error');
        }
      } finally {
        if (isMountedRef.current) {
          setImportingOutputSources((current) => ({ ...current, [sourceId]: false }));
        }
      }
    },
    [addToast],
  );

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  return {
    settings,
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
    refreshSettings,
    refreshOutputSources,
    updateSettings,
    registerOutputSource,
    loadOutputSourceFiles,
    importOutputSourceFiles,
  };
}
