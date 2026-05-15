import { useCallback } from 'react';
import type { Toast } from '../types';
import { buildStudioReadinessSnapshot } from '../lib/studioReadiness';
import { getLocalCodexSession, getStudioHealth } from '../services/localStudioService';
import { resolveStudioRuntime } from '../services/studioRuntime';

interface UseStudioSessionVerifierProps {
  addToast: (message: string, type: Toast['type']) => void;
  log: (message: string) => void;
}

export function useStudioSessionVerifier({ addToast, log }: UseStudioSessionVerifierProps) {
  const verifyCodexSession = useCallback(async () => {
    try {
      const [health, localCodexSession] = await Promise.all([
        getStudioHealth(),
        getLocalCodexSession(),
      ]);
      const readiness = buildStudioReadinessSnapshot({
        health,
        isBackendConnected: true,
        localCodexSession,
        runtime: resolveStudioRuntime(),
      });
      addToast(
        readiness.isReady ? 'Local Codex session available' : readiness.description,
        readiness.isReady ? 'success' : 'error',
      );
      log(
        `Codex readiness: stage=${readiness.stage}, nextAction=${readiness.nextAction ?? 'none'}, auth=${localCodexSession.authMode ?? 'none'}, session=${localCodexSession.state}, appServer=${health.appServer.running ? health.appServer.wsUrl : 'stopped'}, libraryReady=${health.checks.libraryReady}`,
      );
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Could not verify local Codex', 'error');
    }
  }, [addToast, log]);

  return {
    verifyCodexSession,
  };
}
