import { useCallback, useEffect, useRef, useState } from 'react';
import { resetStudioData as requestStudioReset } from '../services/localStudioService';
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
  refreshOnboardingHealth: () => Promise<unknown>;
  refreshDiagnostics: () => Promise<unknown>;
  clearGenerationState: () => void;
  clearUiState: () => void;
  localStorageKeys?: readonly string[];
}

/**
 * Own the destructive studio reset choreography behind one seam so the app
 * shell only provides adapters for local UI state and generation state.
 */
export function useStudioReset({
  addToast,
  resetStudioState,
  resetQueue,
  refreshOnboardingHealth,
  refreshDiagnostics,
  clearGenerationState,
  clearUiState,
  localStorageKeys = DEFAULT_RESET_LOCAL_STORAGE_KEYS,
}: UseStudioResetProps) {
  const [isResettingStudio, setIsResettingStudio] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resetStudio = useCallback(async () => {
    if (isResettingStudio) return;

    const confirmed =
      typeof window === 'undefined'
        ? true
        : window.confirm(
            'This will erase local workspaces, cached assets, backend jobs, logs, and the Codex Studio database. Continue?',
          );

    if (!confirmed) return;

    setIsResettingStudio(true);

    try {
      await requestStudioReset();
      await clearAllIndexedDb();

      for (const key of localStorageKeys) {
        try {
          window.localStorage.removeItem(key);
        } catch {
          // Ignore storage cleanup failures; state reset still proceeds.
        }
      }

      resetQueue();
      clearGenerationState();

      startViewTransition(() => {
        resetStudioState();
        clearUiState();
      });

      await Promise.allSettled([refreshOnboardingHealth(), refreshDiagnostics()]);
      addToast('Studio reset complete. Local workspace and database were rebuilt.', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Studio reset failed', 'error');
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
    refreshDiagnostics,
    refreshOnboardingHealth,
    resetQueue,
    resetStudioState,
  ]);

  return {
    isResettingStudio,
    resetStudio,
  };
}