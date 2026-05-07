import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useToasts, ToastMessage } from '../hooks/useToasts';
import { usePanelManager } from '../hooks/usePanelManager';
import { addLogEntry } from '../utils/logger';
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

    batches: GenerationBatch[];
    prependBatch: (batch: GenerationBatch, options?: { maxPerWorkspace?: number }) => void;
    mergeBatches: (batches: GenerationBatch[], options?: { prepend?: boolean; maxTotal?: number; ensureWorkspaces?: boolean }) => void;
    replaceBatches: (batches: GenerationBatch[], options?: { ensureWorkspaces?: boolean }) => void;
    archiveBatches: (batches: GenerationBatch[]) => void;
    deleteImage: (imageId: string) => void;
    deleteImages: (imageIds: string[]) => void;
    toggleImageFavorite: (imageId: string) => void;
    clearWorkspace: (workspaceId: string) => void;
    clearAllBatches: () => void;

    trash: GenerationBatch[];
    restoreFromTrash: (batchId: string) => void;
    restoreAllFromTrash: () => void;
    emptyTrash: () => void;

    isBackgroundEnabled: boolean;
    setBackgroundEnabled: (enabled: boolean) => void;

    bgConfig: BackgroundConfig;
    updateBackgroundConfig: (patch: Partial<BackgroundConfig>) => void;

    toasts: ToastMessage[];
    addToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
    removeToast: (id: string) => void;

    isDebugPanelOpen: boolean;
    toggleDebugPanel: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

function usePersistedIdbValue<T>(key: string, value: T, isHydrated: boolean) {
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isHydrated) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            set(key, value).catch((error) => {
                console.error(`Error setting IndexedDB key “${key}”:`, error);
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
                const [logs, workspaces, batches, trash, bgConfig] = await Promise.all([
                    get<LogEntry[]>('session-logs').catch(() => undefined),
                    get<Workspace[]>('app-workspaces').catch(() => undefined),
                    get<GenerationBatch[]>('catalog-cache').catch(() => undefined),
                    get<GenerationBatch[]>('catalog-trash').catch(() => undefined),
                    get<BackgroundConfig>('bg-config').catch(() => undefined),
                ]);

                const storedBackgroundEnabled = window.localStorage.getItem('isBackgroundEnabled');
                const isBackgroundEnabled = storedBackgroundEnabled ? JSON.parse(storedBackgroundEnabled) : true;

                if (cancelled) return;

                dispatch({
                    type: 'HYDRATE_STATE',
                    state: {
                        logs: logs ?? [],
                        workspaces,
                        batches,
                        trash,
                        bgConfig: bgConfig ?? DEFAULT_BACKGROUND_CONFIG,
                        isBackgroundEnabled,
                    },
                });
            } catch (error) {
                console.error('Error hydrating global state:', error);
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
    usePersistedIdbValue('catalog-cache', state.batches, isHydrated);
    usePersistedIdbValue('catalog-trash', state.trash, isHydrated);
    usePersistedIdbValue('bg-config', state.bgConfig, isHydrated);

    useEffect(() => {
        if (!isHydrated) return;

        try {
            window.localStorage.setItem('isBackgroundEnabled', JSON.stringify(state.isBackgroundEnabled));
        } catch (error) {
            console.warn('Error setting localStorage key "isBackgroundEnabled":', error);
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

    const prependBatch = useCallback((batch: GenerationBatch, options?: { maxPerWorkspace?: number }) => {
        dispatch({ type: 'PREPEND_BATCH', batch, maxPerWorkspace: options?.maxPerWorkspace });
    }, []);

    const mergeBatches = useCallback((batches: GenerationBatch[], options?: { prepend?: boolean; maxTotal?: number; ensureWorkspaces?: boolean }) => {
        dispatch({ type: 'MERGE_BATCHES', batches, prepend: options?.prepend, maxTotal: options?.maxTotal, ensureWorkspaces: options?.ensureWorkspaces });
    }, []);

    const replaceBatches = useCallback((batches: GenerationBatch[], options?: { ensureWorkspaces?: boolean }) => {
        dispatch({ type: 'REPLACE_BATCHES', batches, ensureWorkspaces: options?.ensureWorkspaces });
    }, []);

    const archiveBatches = useCallback((batchesToArchive: GenerationBatch[]) => {
        dispatch({ type: 'ARCHIVE_BATCHES', batches: batchesToArchive });
    }, []);

    const deleteImage = useCallback((imageId: string) => {
        dispatch({ type: 'DELETE_IMAGE', imageId });
    }, []);

    const deleteImages = useCallback((imageIds: string[]) => {
        dispatch({ type: 'DELETE_IMAGES', imageIds });
    }, []);

    const toggleImageFavorite = useCallback((imageId: string) => {
        dispatch({ type: 'TOGGLE_IMAGE_FAVORITE', imageId });
    }, []);

    const clearWorkspace = useCallback((workspaceId: string) => {
        dispatch({ type: 'CLEAR_WORKSPACE', workspaceId });
    }, []);

    const clearAllBatches = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL_BATCHES' });
    }, []);

    const { toasts, addToast, removeToast } = useToasts();
    const { isDebugPanelOpen, toggleDebugPanel } = usePanelManager();

    const restoreFromTrash = useCallback((batchId: string) => {
        dispatch({ type: 'RESTORE_FROM_TRASH', batchId });
        addToast('Batch restored from archives', 'success');
    }, [addToast]);

    const restoreAllFromTrash = useCallback(() => {
        dispatch({ type: 'RESTORE_ALL_FROM_TRASH' });
        addToast('All batches restored from archives', 'success');
    }, [addToast]);

    const emptyTrash = useCallback(() => {
        dispatch({ type: 'EMPTY_TRASH' });
    }, []);

    const setBackgroundEnabled = useCallback((enabled: boolean) => {
        dispatch({ type: 'SET_BACKGROUND_ENABLED', enabled });
    }, []);

    const updateBackgroundConfig = useCallback((patch: Partial<BackgroundConfig>) => {
        dispatch({ type: 'UPDATE_BACKGROUND_CONFIG', patch });
    }, []);

    const value = useMemo<GlobalContextType>(() => ({
        logs: state.logs,
        log,
        workspaces: state.workspaces,
        createWorkspace,
        deleteWorkspace,
        renameWorkspace,
        activeWorkspaceId: state.activeWorkspaceId,
        setActiveWorkspace,
        batches: state.batches,
        prependBatch,
        mergeBatches,
        replaceBatches,
        archiveBatches,
        deleteImage,
        deleteImages,
        toggleImageFavorite,
        clearWorkspace,
        clearAllBatches,
        trash: state.trash,
        restoreFromTrash,
        restoreAllFromTrash,
        emptyTrash,
        isBackgroundEnabled: state.isBackgroundEnabled,
        setBackgroundEnabled,
        bgConfig: state.bgConfig,
        updateBackgroundConfig,
        toasts, addToast, removeToast,
        isDebugPanelOpen, toggleDebugPanel
    }), [
        state.logs,
        state.workspaces,
        state.activeWorkspaceId,
        state.batches,
        state.trash,
        state.isBackgroundEnabled,
        state.bgConfig,
        log,
        createWorkspace,
        deleteWorkspace,
        renameWorkspace,
        setActiveWorkspace,
        prependBatch,
        mergeBatches,
        replaceBatches,
        archiveBatches,
        deleteImage,
        deleteImages,
        toggleImageFavorite,
        clearWorkspace,
        clearAllBatches,
        restoreFromTrash,
        restoreAllFromTrash,
        emptyTrash,
        setBackgroundEnabled,
        updateBackgroundConfig,
        toasts,
        addToast,
        removeToast,
        isDebugPanelOpen,
        toggleDebugPanel,
    ]);

    return (
        <GlobalContext.Provider value={value}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
};
