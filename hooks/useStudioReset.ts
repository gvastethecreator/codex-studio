import { useCallback, useEffect, useRef, useState } from 'react';
import { resetStudioData as requestStudioResetData } from '../services/localStudioService';
import { clearAll as clearAllIndexedDb } from '../utils/idb';
import { startViewTransition } from '../utils/transitionUtils';

const DEFAULT_RESET_LOCAL_STORAGE_KEYS = [
  'generation-config',
  'isBackgroundEnabled',
  'user-wallet-balance',
] as const;

interface UseStudioResetProps {
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  resetStudioState: () => void;
  resetQueue: () => void;
  refreshRuntime: () => Promise<unknown>;
  clearGenerationState: () => void;
  clearUiState: () => void;
  localStorageKeys?: readonly string[];
}

interface PerformStudioResetOptions {
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  resetStudioState: () => void;
  resetQueue: () => void;
  refreshRuntime: () => Promise<unknown>;
  clearGenerationState: () => void;
  clearUiState: () => void;
  localStorageKeys?: readonly string[];
  requestStudioReset?: () => Promise<unknown>;
  clearIndexedDb?: () => Promise<unknown>;
  removeLocalStorageItem?: (key: string) => void;
  startTransition?: (callback: () => void) => void;
}

export async function performStudioReset({
  addToast,
  resetStudioState,
  resetQueue,
  refreshRuntime,
  clearGenerationState,
  clearUiState,
  localStorageKeys = DEFAULT_RESET_LOCAL_STORAGE_KEYS,
  requestStudioReset = requestStudioResetData,
  clearIndexedDb = clearAllIndexedDb,
  removeLocalStorageItem = (key: string) => window.localStorage.removeItem(key),
  startTransition = startViewTransition,
}: PerformStudioResetOptions) {
  try {
    await requestStudioReset();
    await clearIndexedDb();

    for (const key of localStorageKeys) {
      try {
        removeLocalStorageItem(key);
      } catch {
        // Ignore storage cleanup failures; state reset still proceeds.
      }
    }

    resetQueue();
    clearGenerationState();

    startTransition(() => {
      resetStudioState();
      clearUiState();
    });

    await refreshRuntime();
    addToast(
      'Studio reset complete. The local library, workspace cache, and database were rebuilt.',
      'success',
    );
    return true;
  } catch (error) {
    addToast(error instanceof Error ? error.message : 'Studio reset failed', 'error');
    return false;
  }
}

/**
 * Own the destructive studio reset choreography behind one seam so the app
 * shell only provides adapters for local UI state and generation state.
 */
export function useStudioReset({
  addToast,
  resetStudioState,
  resetQueue,
  refreshRuntime,
  clearGenerationState,
  clearUiState,
  localStorageKeys = DEFAULT_RESET_LOCAL_STORAGE_KEYS,
}: UseStudioResetProps) {
  const [isResettingStudio, setIsResettingStudio] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resetStudio = useCallback(async () => {
    if (isResettingStudio) return;

    setIsResettingStudio(true);

    try {
      await performStudioReset({
        addToast,
        resetStudioState,
        resetQueue,
        refreshRuntime,
        clearGenerationState,
        clearUiState,
        localStorageKeys,
      });
    } finally {
      if (isMountedRef.current) {
        setIsResettingStudio(false);
      }
    }
  }, [
    addToast,
    clearGenerationState,
    clearUiState,
    isResettingStudio,
    localStorageKeys,
    refreshRuntime,
    resetQueue,
    resetStudioState,
  ]);

  return {
    isResettingStudio,
    resetStudio,
  };
}
