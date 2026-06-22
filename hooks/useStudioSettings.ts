import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  EditableStudioSettings,
  EditableStudioSettingsPatch,
  ExternalOutputSourceFile,
  ExternalOutputSourcesResponse,
  GenerationProviderCapabilitiesResponse,
  GenerationProviderRuntimePreflightResponse,
  RegisterExternalOutputSourceInput,
  StorageMaintenanceAuditReport,
  StorageMaintenanceCompactResult,
  StorageMaintenanceThumbnailBackfillResult,
  ToolingLogsPruneResult,
} from '../packages/shared/src';
import {
  getExternalOutputSources,
  getEditableStudioSettings,
  getGenerationProviderCapabilities,
  getGenerationProviderRuntimePreflight,
  getStorageMaintenanceAudit,
  importExternalOutputSourceFiles,
  listExternalOutputSourceFiles,
  pruneToolingLogsMaintenance,
  registerExternalOutputSource,
  runStorageCompactMaintenance,
  runThumbnailBackfillMaintenance,
  updateEditableStudioSettings,
} from '../services/localStudioService';
import type { Toast } from '../types';

interface UseStudioSettingsOptions {
  addToast?: (message: string, type?: Toast['type']) => void;
}

export interface StudioSettingsController {
  data: {
    settingsDomain: {
      settings: EditableStudioSettings | null;
      isLoading: boolean;
      isSaving: boolean;
      error: string | null;
      refresh: () => Promise<void>;
      update: (patch: EditableStudioSettingsPatch) => Promise<void>;
    };
    providerDomain: {
      capabilities: GenerationProviderCapabilitiesResponse | null;
      runtimePreflight: GenerationProviderRuntimePreflightResponse | null;
    };
    outputSourcesDomain: {
      outputSources: ExternalOutputSourcesResponse | null;
      outputSourceFiles: Record<string, ExternalOutputSourceFile[]>;
      isLoadingOutputSources: boolean;
      loadingOutputSourceFiles: Record<string, boolean>;
      isRegisteringOutputSource: boolean;
      importingOutputSources: Record<string, boolean>;
      refreshOutputSources: () => Promise<void>;
      registerOutputSource: (input: RegisterExternalOutputSourceInput) => Promise<void>;
      loadOutputSourceFiles: (sourceId: string) => Promise<void>;
      importOutputSourceFiles: (
        sourceId: string,
        files: string[],
        workspaceId?: string | null,
      ) => Promise<void>;
    };
    maintenanceDomain: {
      audit: StorageMaintenanceAuditReport | null;
      compactResult: StorageMaintenanceCompactResult | null;
      thumbnailBackfillResult: StorageMaintenanceThumbnailBackfillResult | null;
      toolingLogsPruneResult: ToolingLogsPruneResult | null;
      isLoadingAudit: boolean;
      runningAction: 'compact' | 'thumbnails' | 'tooling-logs' | null;
      refreshAudit: () => Promise<void>;
      compactStorage: (input?: {
        write?: boolean;
        vacuum?: boolean;
        confirm?: string | null;
      }) => Promise<void>;
      backfillThumbnails: (input?: {
        write?: boolean;
        confirm?: string | null;
        limit?: number;
      }) => Promise<void>;
      pruneToolingLogs: (input?: { retainPerTask?: number }) => Promise<void>;
    };
  };
}

export function useStudioSettings({
  addToast,
}: UseStudioSettingsOptions = {}): StudioSettingsController {
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
  const [maintenanceAudit, setMaintenanceAudit] = useState<StorageMaintenanceAuditReport | null>(
    null,
  );
  const [compactResult, setCompactResult] = useState<StorageMaintenanceCompactResult | null>(null);
  const [thumbnailBackfillResult, setThumbnailBackfillResult] =
    useState<StorageMaintenanceThumbnailBackfillResult | null>(null);
  const [toolingLogsPruneResult, setToolingLogsPruneResult] =
    useState<ToolingLogsPruneResult | null>(null);
  const [isLoadingMaintenanceAudit, setIsLoadingMaintenanceAudit] = useState(false);
  const [runningMaintenanceAction, setRunningMaintenanceAction] = useState<
    'compact' | 'thumbnails' | 'tooling-logs' | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshSettingsSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextSettings = await getEditableStudioSettings();
      if (isMountedRef.current) {
        setSettings(nextSettings);
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

  const refreshMaintenanceAudit = useCallback(async () => {
    setIsLoadingMaintenanceAudit(true);
    setError(null);

    try {
      const nextAudit = await getStorageMaintenanceAudit();
      if (isMountedRef.current) {
        setMaintenanceAudit(nextAudit);
      }
    } catch (auditError) {
      const message =
        auditError instanceof Error ? auditError.message : 'Unable to run storage audit';
      if (isMountedRef.current) {
        setError(message);
        addToast?.(message, 'error');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingMaintenanceAudit(false);
      }
    }
  }, [addToast]);

  const compactStorage = useCallback(
    async (input: { write?: boolean; vacuum?: boolean; confirm?: string | null } = {}) => {
      setRunningMaintenanceAction('compact');
      setError(null);

      try {
        const result = await runStorageCompactMaintenance(input);
        if (isMountedRef.current) {
          setCompactResult(result);
          addToast?.(
            result.mode === 'write' ? 'Storage compaction completed' : 'Storage compaction planned',
            result.mode === 'write' ? 'success' : 'info',
          );
        }
        await refreshMaintenanceAudit();
      } catch (compactError) {
        const message =
          compactError instanceof Error ? compactError.message : 'Unable to compact storage';
        if (isMountedRef.current) {
          setError(message);
          addToast?.(message, 'error');
        }
      } finally {
        if (isMountedRef.current) {
          setRunningMaintenanceAction(null);
        }
      }
    },
    [addToast, refreshMaintenanceAudit],
  );

  const backfillThumbnails = useCallback(
    async (input: { write?: boolean; confirm?: string | null; limit?: number } = {}) => {
      setRunningMaintenanceAction('thumbnails');
      setError(null);

      try {
        const result = await runThumbnailBackfillMaintenance(input);
        if (isMountedRef.current) {
          setThumbnailBackfillResult(result);
          addToast?.(
            result.mode === 'write'
              ? `Backfilled ${result.wroteRows} thumbnail${result.wroteRows === 1 ? '' : 's'}`
              : `Planned ${result.plannedRows} thumbnail${result.plannedRows === 1 ? '' : 's'}`,
            result.errors > 0 ? 'info' : result.mode === 'write' ? 'success' : 'info',
          );
        }
        await refreshMaintenanceAudit();
      } catch (thumbnailError) {
        const message =
          thumbnailError instanceof Error
            ? thumbnailError.message
            : 'Unable to backfill thumbnails';
        if (isMountedRef.current) {
          setError(message);
          addToast?.(message, 'error');
        }
      } finally {
        if (isMountedRef.current) {
          setRunningMaintenanceAction(null);
        }
      }
    },
    [addToast, refreshMaintenanceAudit],
  );

  const pruneToolingLogs = useCallback(
    async (input: { retainPerTask?: number } = {}) => {
      setRunningMaintenanceAction('tooling-logs');
      setError(null);

      try {
        const result = await pruneToolingLogsMaintenance(input);
        if (isMountedRef.current) {
          setToolingLogsPruneResult(result);
          addToast?.(
            `Pruned ${result.pruned} tooling log${result.pruned === 1 ? '' : 's'}`,
            'success',
          );
        }
        await refreshMaintenanceAudit();
      } catch (pruneError) {
        const message =
          pruneError instanceof Error ? pruneError.message : 'Unable to prune tooling logs';
        if (isMountedRef.current) {
          setError(message);
          addToast?.(message, 'error');
        }
      } finally {
        if (isMountedRef.current) {
          setRunningMaintenanceAction(null);
        }
      }
    },
    [addToast, refreshMaintenanceAudit],
  );

  useEffect(() => {
    void refreshSettingsSummary();
  }, [refreshSettingsSummary]);

  return useMemo(
    () => ({
      data: {
        settingsDomain: {
          settings,
          isLoading,
          isSaving,
          error,
          refresh: refreshSettings,
          update: updateSettings,
        },
        providerDomain: {
          capabilities: providerCapabilities,
          runtimePreflight: providerRuntimePreflight,
        },
        outputSourcesDomain: {
          outputSources,
          outputSourceFiles,
          isLoadingOutputSources,
          loadingOutputSourceFiles,
          isRegisteringOutputSource,
          importingOutputSources,
          refreshOutputSources,
          registerOutputSource,
          loadOutputSourceFiles,
          importOutputSourceFiles,
        },
        maintenanceDomain: {
          audit: maintenanceAudit,
          compactResult,
          thumbnailBackfillResult,
          toolingLogsPruneResult,
          isLoadingAudit: isLoadingMaintenanceAudit,
          runningAction: runningMaintenanceAction,
          refreshAudit: refreshMaintenanceAudit,
          compactStorage,
          backfillThumbnails,
          pruneToolingLogs,
        },
      },
    }),
    [
      error,
      importOutputSourceFiles,
      importingOutputSources,
      isLoading,
      isLoadingOutputSources,
      isRegisteringOutputSource,
      isSaving,
      backfillThumbnails,
      compactResult,
      compactStorage,
      loadOutputSourceFiles,
      loadingOutputSourceFiles,
      isLoadingMaintenanceAudit,
      maintenanceAudit,
      outputSourceFiles,
      outputSources,
      pruneToolingLogs,
      providerCapabilities,
      providerRuntimePreflight,
      refreshMaintenanceAudit,
      refreshOutputSources,
      refreshSettings,
      registerOutputSource,
      runningMaintenanceAction,
      settings,
      thumbnailBackfillResult,
      toolingLogsPruneResult,
      updateSettings,
    ],
  );
}
