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
  getEditableStudioSettings,
  updateEditableStudioSettings,
} from '../services/studio-api/settings';
import {
  getGenerationProviderCapabilities,
  getGenerationProviderRuntimePreflight,
  invalidateGenerationProviderReads,
} from '../services/studio-api/providers';
import {
  getExternalOutputSources,
  importExternalOutputSourceFiles,
  listExternalOutputSourceFiles,
  registerExternalOutputSource,
} from '../services/studio-api/outputSources';
import {
  getStorageMaintenanceAudit,
  pruneToolingLogsMaintenance,
  runStorageCompactMaintenance,
  runThumbnailBackfillMaintenance,
} from '../services/studio-api/maintenance';
import { createStudioEventStream } from '../services/studioEventSource';
import type { Toast } from '../types';
import {
  removeImportedOutputSourceFiles,
  summarizeImportOperationResult,
} from '../lib/importOperation';

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

  const revisions = useRef({ settings: 0, outputSources: 0, capabilities: 0, preflight: 0 });
  const refreshRevision = useRef(0);
  const savingRef = useRef(false);
  const readResource = useCallback(
    async <T>(
      key: keyof typeof revisions.current,
      load: () => Promise<T>,
      apply: (value: T) => void,
    ): Promise<string | null> => {
      const revision = ++revisions.current[key];
      try {
        const value = await load();
        if (
          isMountedRef.current &&
          revisions.current[key] === revision &&
          !(key === 'settings' && savingRef.current)
        )
          apply(value);
        return null;
      } catch (cause) {
        if (!isMountedRef.current || revisions.current[key] !== revision) return null;
        return cause instanceof Error ? cause.message : String(cause);
      }
    },
    [],
  );

  const refreshProviders = useCallback(
    () =>
      Promise.all([
        readResource('capabilities', getGenerationProviderCapabilities, setProviderCapabilities),
        readResource(
          'preflight',
          getGenerationProviderRuntimePreflight,
          setProviderRuntimePreflight,
        ),
      ]),
    [readResource],
  );

  const refreshDomains = useCallback(
    async (includeOutputSources: boolean, includeSettings = true) => {
      const revision = ++refreshRevision.current;
      setIsLoading(true);
      setError(null);
      const errors = await Promise.all([
        ...(includeSettings
          ? [readResource('settings', getEditableStudioSettings, setSettings)]
          : []),
        ...(includeOutputSources
          ? [readResource('outputSources', getExternalOutputSources, setOutputSources)]
          : []),
        ...[refreshProviders().then((results) => results.filter(Boolean).join('; ') || null)],
      ]);
      if (isMountedRef.current && refreshRevision.current === revision) {
        const message = errors.filter(Boolean).join('; ');
        setError(message ? `Some settings could not refresh: ${message}` : null);
        setIsLoading(false);
      }
    },
    [readResource, refreshProviders],
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      for (const key of Object.keys(revisions.current) as Array<keyof typeof revisions.current>)
        revisions.current[key] += 1;
      refreshRevision.current += 1;
    };
  }, []);

  const refreshSettingsSummary = useCallback(() => refreshDomains(false), [refreshDomains]);

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

  const refreshSettings = useCallback(() => refreshDomains(true), [refreshDomains]);

  const updateSettings = useCallback(
    async (patch: EditableStudioSettingsPatch) => {
      if (savingRef.current) return;
      savingRef.current = true;
      revisions.current.settings += 1;
      setIsSaving(true);
      setError(null);
      try {
        const nextSettings = await updateEditableStudioSettings(patch);
        revisions.current.settings += 1;
        if (!isMountedRef.current) return;
        setSettings(nextSettings);
        addToast?.('Studio Settings saved', 'success');
        invalidateGenerationProviderReads();
        await refreshDomains(true, false);
      } catch (cause) {
        if (!isMountedRef.current) return;
        const message = cause instanceof Error ? cause.message : 'Unable to save Studio Settings';
        setError(message);
        addToast?.(message, 'error');
      } finally {
        savingRef.current = false;
        if (isMountedRef.current) setIsSaving(false);
      }
    },
    [addToast, refreshDomains],
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
          const summary = summarizeImportOperationResult(result);
          setOutputSourceFiles((current) => ({
            ...current,
            [sourceId]: removeImportedOutputSourceFiles(current[sourceId] ?? [], summary),
          }));
          addToast?.(summary.toast.message, summary.toast.type);
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

  useEffect(() => {
    const stream = createStudioEventStream();
    const unsubscribe = stream.onAuthUpdated(() => {
      invalidateGenerationProviderReads();
      void refreshProviders();
    });
    return () => {
      unsubscribe();
      stream.close();
    };
  }, [refreshProviders]);

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
