import { useCallback, useEffect, useMemo, useState } from 'react';
import type { HealthResponse } from '../packages/shared/src';
import {
  getStudioApiBase,
  getStudioHealth,
  startStudioAppServer,
} from '../services/localStudioService';
import { isDesktopStudioRuntime } from '../services/studioRuntime';
import { useLocalStorage } from './useLocalStorage';

interface UseStudioOnboardingProps {
  log: (message: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  shouldAutoOpen: boolean;
}

export function useStudioOnboarding({ log, addToast, shouldAutoOpen }: UseStudioOnboardingProps) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage(
    'studio-onboarding-complete',
    false,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isStartingAppServer, setIsStartingAppServer] = useState(false);

  const apiBase = useMemo(() => getStudioApiBase(), []);
  const isDesktopRuntime = useMemo(() => isDesktopStudioRuntime(), []);
  const isReady = Boolean(health?.ok && health.checks.onboardingReady);

  const refreshHealth = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    try {
      const nextHealth = await getStudioHealth();
      setHealth(nextHealth);
      log(
        `Studio onboarding health refreshed: cli=${nextHealth.codexCli.available ? nextHealth.codexCli.version || 'available' : 'missing'}, appServer=${nextHealth.appServer.running ? 'running' : 'stopped'}, libraryReady=${nextHealth.checks.libraryReady}, envLocal=${nextHealth.runtime.envLocalPresent}`,
      );
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : 'Could not query the local backend';
      setError(message);
      log(`Studio onboarding health failed: ${message}`);
    } finally {
      setIsChecking(false);
    }
  }, [log]);

  useEffect(() => {
    if (!hasSeenOnboarding && shouldAutoOpen) {
      setHasSeenOnboarding(true);
      setIsOpen(true);
      void refreshHealth();
    }
  }, [hasSeenOnboarding, refreshHealth, setHasSeenOnboarding, shouldAutoOpen]);

  const openOnboarding = useCallback(() => {
    setIsOpen(true);
    void refreshHealth();
  }, [refreshHealth]);

  const closeOnboarding = useCallback(() => {
    setIsOpen(false);
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasSeenOnboarding(true);
    setIsOpen(false);
  }, [setHasSeenOnboarding]);

  const ensureAppServer = useCallback(async () => {
    setIsStartingAppServer(true);
    try {
      const result = await startStudioAppServer();
      await refreshHealth();
      addToast(
        result.running ? 'Codex app-server started' : 'Could not start Codex app-server',
        result.running ? 'success' : 'warning',
      );
    } catch (startError) {
      const message =
        startError instanceof Error ? startError.message : 'Could not start codex app-server';
      addToast(message, 'error');
      log(`Studio onboarding failed to start app-server: ${message}`);
    } finally {
      setIsStartingAppServer(false);
    }
  }, [addToast, log, refreshHealth]);

  return {
    apiBase,
    closeOnboarding,
    completeOnboarding,
    ensureAppServer,
    error,
    health,
    isChecking,
    isDesktopRuntime,
    isOpen,
    isReady,
    isStartingAppServer,
    openOnboarding,
    refreshHealth,
  };
}
