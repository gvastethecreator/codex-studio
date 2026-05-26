import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useToasts, ToastMessage } from '../hooks/useToasts';
import { usePanelManager } from '../hooks/usePanelManager';
import { addLogEntry } from '../utils/logger';
import { runtimeLogger } from '../utils/runtimeLogger';
import { DEFAULT_BACKGROUND_CONFIG } from '../constants';
import { get, set } from '../utils/idb';
import type { LogEntry, Workspace, GenerationBatch, BackgroundConfig } from '../types';
import { createInitialGlobalState, globalReducer } from './globalReducer';

interface GlobalContextType {
  logs: LogEntry[];
  log: (message: string) => void;

  workspaces: Workspace[];
  createWorkspace: (workspace: Workspace, options?: { activate?: boolean }) => void;
  deleteWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  activeWorkspaceId: string;
  setActiveWorkspace: (id: string) => void;

  legacyVisualBatches: GenerationBatch[];
  prependGeneratedVisualBatch: (
    batch: GenerationBatch,
    options?: { maxPerWorkspace?: number },
  ) => void;
  mergeLegacyVisualBatches: (
    batches: GenerationBatch[],
    options?: { prepend?: boolean; maxTotal?: number; ensureWorkspaces?: boolean },
  ) => void;
  importLegacyVisualBatches: (
    batches: GenerationBatch[],
    options?: { ensureWorkspaces?: boolean },
  ) => void;
  archiveLegacyVisualBatches: (batches: GenerationBatch[]) => void;
  deleteLegacyVisualImage: (imageId: string) => void;
  deleteLegacyVisualImages: (imageIds: string[]) => void;
  toggleLegacyVisualImageFavorite: (imageId: string) => void;
  clearLegacyVisualWorkspace: (workspaceId: string) => void;
  clearAllLegacyVisualBatches: () => void;
  resetStudioState: () => void;

  legacyVisualTrash: GenerationBatch[];
  restoreLegacyVisualBatchFromTrash: (batchId: string) => void;
  restoreAllLegacyVisualBatchesFromTrash: () => void;
  emptyLegacyVisualTrash: () => void;

  isBackgroundEnabled: boolean;
  setBackgroundEnabled: (enabled: boolean) => void;

  bgConfig: BackgroundConfig;
  updateBackgroundConfig: (patch: Partial<BackgroundConfig>) => void;

  toasts: ToastMessage[];
  addToast: (
    msg: string,
    type?: 'success' | 'error' | 'info' | 'warning',
    duration?: number,
  ) => void;
  removeToast: (id: string) => void;

  isDebugPanelOpen: boolean;
  toggleDebugPanel: () => void;
  openDebugPanel: () => void;
  closeDebugPanel: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

/**
 * Persist a hydrated slice of global state into IndexedDB with a small debounce
 * so rapid UI changes do not spam writes.
 */
function usePersistedIdbValue<T>(key: string, value: T, isHydrated: boolean) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isHydrated) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      set(key, value).catch((error) => {
        runtimeLogger.error(`Error setting IndexedDB key "${key}"`, error);
      });
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHydrated, key, value]);
}

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, undefined, createInitialGlobalState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        const [logs, workspaces, bgConfig] = await Promise.all([
          get<LogEntry[]>('session-logs').catch(() => undefined),
          get<Workspace[]>('app-workspaces').catch(() => undefined),
          get<BackgroundConfig>('bg-config').catch(() => undefined),
        ]);

        const storedBackgroundEnabled = window.localStorage.getItem('isBackgroundEnabled');
        const isBackgroundEnabled = storedBackgroundEnabled
          ? JSON.parse(storedBackgroundEnabled)
          : true;

        if (cancelled) return;

        dispatch({
          type: 'HYDRATE_STATE',
          state: {
            logs: logs ?? [],
            workspaces,
            legacyVisualBatches: [],
            legacyVisualTrash: [],
            bgConfig: bgConfig ?? DEFAULT_BACKGROUND_CONFIG,
            isBackgroundEnabled,
          },
        });
      } catch (error) {
        runtimeLogger.error('Error hydrating global state', error);
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  usePersistedIdbValue('session-logs', state.logs, isHydrated);
  usePersistedIdbValue('app-workspaces', state.workspaces, isHydrated);
  usePersistedIdbValue('bg-config', state.bgConfig, isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem('isBackgroundEnabled', JSON.stringify(state.isBackgroundEnabled));
    } catch (error) {
      runtimeLogger.warn('Error setting localStorage key "isBackgroundEnabled"', error);
    }
  }, [isHydrated, state.isBackgroundEnabled]);

  const log = useCallback((message: string) => {
    dispatch({ type: 'ADD_LOG', entry: addLogEntry(message) });
  }, []);

  const createWorkspace = useCallback((workspace: Workspace, options?: { activate?: boolean }) => {
    dispatch({ type: 'CREATE_WORKSPACE', workspace, activate: options?.activate ?? true });
  }, []);

  const deleteWorkspace = useCallback((id: string) => {
    dispatch({ type: 'DELETE_WORKSPACE', id });
  }, []);

  const renameWorkspace = useCallback((id: string, name: string) => {
    dispatch({ type: 'RENAME_WORKSPACE', id, name });
  }, []);

  const setActiveWorkspace = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE_WORKSPACE', id });
  }, []);

  const prependGeneratedVisualBatch = useCallback(
    (batch: GenerationBatch, options?: { maxPerWorkspace?: number }) => {
      dispatch({
        type: 'PREPEND_GENERATED_VISUAL_BATCH',
        batch,
        maxPerWorkspace: options?.maxPerWorkspace,
      });
    },
    [],
  );

  const mergeLegacyVisualBatches = useCallback(
    (
      batches: GenerationBatch[],
      options?: { prepend?: boolean; maxTotal?: number; ensureWorkspaces?: boolean },
    ) => {
      dispatch({
        type: 'MERGE_LEGACY_VISUAL_BATCHES',
        batches,
        prepend: options?.prepend,
        maxTotal: options?.maxTotal,
        ensureWorkspaces: options?.ensureWorkspaces,
      });
    },
    [],
  );

  const importLegacyVisualBatches = useCallback(
    (batches: GenerationBatch[], options?: { ensureWorkspaces?: boolean }) => {
      dispatch({
        type: 'IMPORT_LEGACY_VISUAL_BATCHES',
        batches,
        ensureWorkspaces: options?.ensureWorkspaces,
      });
    },
    [],
  );

  const archiveLegacyVisualBatches = useCallback((batchesToArchive: GenerationBatch[]) => {
    dispatch({ type: 'ARCHIVE_LEGACY_VISUAL_BATCHES', batches: batchesToArchive });
  }, []);

  const deleteLegacyVisualImage = useCallback((imageId: string) => {
    dispatch({ type: 'DELETE_LEGACY_VISUAL_IMAGE', imageId });
  }, []);

  const deleteLegacyVisualImages = useCallback((imageIds: string[]) => {
    dispatch({ type: 'DELETE_LEGACY_VISUAL_IMAGES', imageIds });
  }, []);

  const toggleLegacyVisualImageFavorite = useCallback((imageId: string) => {
    dispatch({ type: 'TOGGLE_LEGACY_VISUAL_IMAGE_FAVORITE', imageId });
  }, []);

  const clearLegacyVisualWorkspace = useCallback((workspaceId: string) => {
    dispatch({ type: 'CLEAR_LEGACY_VISUAL_WORKSPACE', workspaceId });
  }, []);

  const clearAllLegacyVisualBatches = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_LEGACY_VISUAL_BATCHES' });
  }, []);

  const resetStudioState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const { toasts, addToast, removeToast } = useToasts();
  const { isDebugPanelOpen, toggleDebugPanel, openDebugPanel, closeDebugPanel } = usePanelManager();

  const restoreLegacyVisualBatchFromTrash = useCallback(
    (batchId: string) => {
      dispatch({ type: 'RESTORE_LEGACY_VISUAL_BATCH_FROM_TRASH', batchId });
      addToast('Batch restored from archives', 'success');
    },
    [addToast],
  );

  const restoreAllLegacyVisualBatchesFromTrash = useCallback(() => {
    dispatch({ type: 'RESTORE_ALL_LEGACY_VISUAL_BATCHES_FROM_TRASH' });
    addToast('All batches restored from archives', 'success');
  }, [addToast]);

  const emptyLegacyVisualTrash = useCallback(() => {
    dispatch({ type: 'EMPTY_LEGACY_VISUAL_TRASH' });
  }, []);

  const setBackgroundEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_BACKGROUND_ENABLED', enabled });
  }, []);

  const updateBackgroundConfig = useCallback((patch: Partial<BackgroundConfig>) => {
    dispatch({ type: 'UPDATE_BACKGROUND_CONFIG', patch });
  }, []);

  const value = useMemo<GlobalContextType>(
    () => ({
      logs: state.logs,
      log,
      workspaces: state.workspaces,
      createWorkspace,
      deleteWorkspace,
      renameWorkspace,
      activeWorkspaceId: state.activeWorkspaceId,
      setActiveWorkspace,
      legacyVisualBatches: state.legacyVisualBatches,
      prependGeneratedVisualBatch,
      mergeLegacyVisualBatches,
      importLegacyVisualBatches,
      archiveLegacyVisualBatches,
      deleteLegacyVisualImage,
      deleteLegacyVisualImages,
      toggleLegacyVisualImageFavorite,
      clearLegacyVisualWorkspace,
      clearAllLegacyVisualBatches,
      resetStudioState,
      legacyVisualTrash: state.legacyVisualTrash,
      restoreLegacyVisualBatchFromTrash,
      restoreAllLegacyVisualBatchesFromTrash,
      emptyLegacyVisualTrash,
      isBackgroundEnabled: state.isBackgroundEnabled,
      setBackgroundEnabled,
      bgConfig: state.bgConfig,
      updateBackgroundConfig,
      toasts,
      addToast,
      removeToast,
      isDebugPanelOpen,
      toggleDebugPanel,
      openDebugPanel,
      closeDebugPanel,
    }),
    [
      state.logs,
      state.workspaces,
      state.activeWorkspaceId,
      state.legacyVisualBatches,
      state.legacyVisualTrash,
      state.isBackgroundEnabled,
      state.bgConfig,
      log,
      createWorkspace,
      deleteWorkspace,
      renameWorkspace,
      setActiveWorkspace,
      prependGeneratedVisualBatch,
      mergeLegacyVisualBatches,
      importLegacyVisualBatches,
      archiveLegacyVisualBatches,
      deleteLegacyVisualImage,
      deleteLegacyVisualImages,
      toggleLegacyVisualImageFavorite,
      clearLegacyVisualWorkspace,
      clearAllLegacyVisualBatches,
      resetStudioState,
      restoreLegacyVisualBatchFromTrash,
      restoreAllLegacyVisualBatchesFromTrash,
      emptyLegacyVisualTrash,
      setBackgroundEnabled,
      updateBackgroundConfig,
      toasts,
      addToast,
      removeToast,
      isDebugPanelOpen,
      toggleDebugPanel,
      openDebugPanel,
      closeDebugPanel,
    ],
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};
