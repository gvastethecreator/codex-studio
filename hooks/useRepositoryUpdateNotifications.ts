import { useEffect, useRef } from 'react';
import {
  checkRepositoryUpdates,
  forgetStudioRestart,
  getRepositoryUpdateStatus,
  readPendingStudioRestart,
} from '../services/studio-api/updates';

export function useRepositoryUpdateNotifications(
  enabled: boolean,
  addToast: (message: string, type?: 'info' | 'error') => void,
) {
  const notifiedCommit = useRef<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let checking = false;
    async function check() {
      if (checking || document.visibilityState === 'hidden') return;
      checking = true;
      try {
        const result = await checkRepositoryUpdates();
        if (
          !disposed &&
          !result.error &&
          result.behind > 0 &&
          result.latestCommit !== notifiedCommit.current
        ) {
          notifiedCommit.current = result.latestCommit;
          addToast(
            'A Studio update is available. Open Settings → General to update and restart.',
            'info',
          );
        }
      } catch {
        /* Manual checks in Settings show network errors. */
      } finally {
        checking = false;
      }
    }
    void check();
    const timer = setInterval(() => void check(), 60 * 60 * 1000);
    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [enabled, addToast]);

  useEffect(() => {
    let disposed = false;
    let polling = false;
    async function pollRestart() {
      const pending = readPendingStudioRestart();
      if (!pending || polling) return;
      if (Date.now() - pending.startedAt > 8 * 60 * 1000) {
        forgetStudioRestart();
        addToast(
          'Studio did not reconnect. Check Settings → General or the launch terminal.',
          'error',
        );
        return;
      }
      polling = true;
      try {
        const status = await getRepositoryUpdateStatus();
        if (disposed) return;
        if (status.instanceId !== pending.instanceId) {
          // The managed launcher starts this backend only after the renderer is ready.
          forgetStudioRestart();
          window.location.reload();
        } else if (status.phase === 'error') {
          forgetStudioRestart();
          addToast(status.error ?? 'Studio could not update. Open Settings → General.', 'error');
        }
      } catch {
        /* The server is expected to disconnect during restart. */
      } finally {
        polling = false;
      }
    }
    void pollRestart();
    const timer = setInterval(() => void pollRestart(), 1500);
    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [addToast]);
}
