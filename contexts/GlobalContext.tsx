import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect, useMemo } from 'react';
import useIndexedDBStorage from '../hooks/useIndexedDBStorage';
import { useToasts, ToastMessage } from '../hooks/useToasts';
import { usePanelManager } from '../hooks/usePanelManager';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { addLogEntry } from '../utils/logger';
import { DEFAULT_BACKGROUND_CONFIG } from '../constants';
import type { LogEntry, Workspace, GenerationBatch, BackgroundConfig, Toast } from '../types';

interface GlobalContextType {
    logs: LogEntry[];
    log: (message: string) => void;
    
    workspaces: Workspace[];
    setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
    activeWorkspaceId: string;
    setActiveWorkspaceId: React.Dispatch<React.SetStateAction<string>>;
    
    batches: GenerationBatch[];
    setBatches: React.Dispatch<React.SetStateAction<GenerationBatch[]>>;
    
    trash: GenerationBatch[];
    setTrash: React.Dispatch<React.SetStateAction<GenerationBatch[]>>;
    restoreFromTrash: (batchId: string) => void;
    restoreAllFromTrash: () => void;
    
    isBackgroundEnabled: boolean;
    setIsBackgroundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    
    bgConfig: BackgroundConfig;
    setBgConfig: React.Dispatch<React.SetStateAction<BackgroundConfig>>;
    
    toasts: ToastMessage[];
    addToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
    removeToast: (id: string) => void;
    
    isDebugPanelOpen: boolean;
    toggleDebugPanel: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- Persistent States ---
    const [logs, setLogs] = useIndexedDBStorage<LogEntry[]>('session-logs', []);
    const [workspaces, setWorkspaces] = useIndexedDBStorage<Workspace[]>('app-workspaces', [{ id: 'default', createdAt: Date.now() }]);
    const [batches, setBatches] = useIndexedDBStorage<GenerationBatch[]>('catalog-cache', []);
    const [trash, setTrash] = useIndexedDBStorage<GenerationBatch[]>('catalog-trash', []);
    
    const [isBackgroundEnabled, setIsBackgroundEnabled] = useLocalStorage('isBackgroundEnabled', true);

    const [bgConfig, setBgConfig] = useIndexedDBStorage<BackgroundConfig>('bg-config', DEFAULT_BACKGROUND_CONFIG);
    
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('default');

    // Deduplicate batches and trash
    useEffect(() => {
        setBatches(prev => {
            const seen = new Set();
            const unique = prev.filter(b => {
                if (seen.has(b.id)) return false;
                seen.add(b.id);
                return true;
            });
            return unique.length === prev.length ? prev : unique;
        });
    }, [batches, setBatches]);

    useEffect(() => {
        setTrash(prev => {
            const seen = new Set();
            const unique = prev.filter(b => {
                if (seen.has(b.id)) return false;
                seen.add(b.id);
                return true;
            });
            return unique.length === prev.length ? prev : unique;
        });
    }, [trash, setTrash]);

    const log = useCallback((message: string) => {
        setLogs(prev => [addLogEntry(message), ...prev.slice(0, 499)]);
    }, [setLogs]);

    const { toasts, addToast, removeToast } = useToasts();
    const { isDebugPanelOpen, toggleDebugPanel } = usePanelManager();

    const restoreFromTrash = useCallback((batchId: string) => {
        setTrash(prevTrash => {
            const batchToRestore = prevTrash.find(b => b.id === batchId);
            if (!batchToRestore) return prevTrash;
            
            setBatches(prevBatches => {
                if (prevBatches.some(b => b.id === batchToRestore.id)) return prevBatches;
                return [batchToRestore, ...prevBatches];
            });
            return prevTrash.filter(b => b.id !== batchId);
        });
        addToast('Batch restored from archives', 'success');
    }, [setTrash, setBatches, addToast]);

    const restoreAllFromTrash = useCallback(() => {
        setTrash(prevTrash => {
            if (prevTrash.length === 0) return prevTrash;
            setBatches(prevBatches => {
                const existingIds = new Set(prevBatches.map(b => b.id));
                const uniqueTrash = prevTrash.filter(b => {
                    if (existingIds.has(b.id)) return false;
                    existingIds.add(b.id);
                    return true;
                });
                return [...uniqueTrash, ...prevBatches];
            });
            return [];
        });
        addToast('All batches restored from archives', 'success');
    }, [setTrash, setBatches, addToast]);

    const value = {
        logs, log,
        workspaces, setWorkspaces,
        activeWorkspaceId, setActiveWorkspaceId,
        batches, setBatches,
        trash, setTrash,
        restoreFromTrash, restoreAllFromTrash,
        isBackgroundEnabled, setIsBackgroundEnabled,
        bgConfig, setBgConfig,
        toasts, addToast, removeToast,
        isDebugPanelOpen, toggleDebugPanel
    };

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
