import { IconCheck, IconCopy, IconExternalLink } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import type {
  SubscriptionAuthPublicStatus,
  SubscriptionProviderId,
} from '../../packages/shared/src/subscriptionAuth';
import {
  cancelSubscriptionAuth,
  getSubscriptionAuthStatus,
  logoutSubscriptionAuth,
  startSubscriptionAuth,
} from '../../services/studio-api/auth';
import { createStudioEventStream } from '../../services/studioEventSource';
import { subscriptionAuthPillClass } from '../../lib/providerBrand';
import {
  subscriptionAuthOpenLabel,
  subscriptionAuthStatusLabel,
} from '../../lib/subscriptionAuthUi';

const controlBase =
  'inline-flex h-9 items-center justify-center gap-2 rounded-[var(--wb-radius)] px-3 text-[11px] font-semibold transition-[color,background-color,border-color,transform] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60';
const controlPrimary = `${controlBase} studio-primary-control`;
const controlGhost = `${controlBase} studio-ghost-control`;
const controlQuiet = `${controlBase} border border-[color:var(--wb-line)] bg-transparent text-[color:var(--wb-muted)] hover:border-rose-500/2 hover:bg-rose-500/10 hover:text-[color:var(--wb-danger)] `;

export function SubscriptionAuthControls({ providerId }: { providerId: SubscriptionProviderId }) {
  const [status, setStatus] = useState<SubscriptionAuthPublicStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadStatus = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoadingStatus(true);
      setError(null);
      try {
        const next = await getSubscriptionAuthStatus(providerId, { signal });
        if (signal?.aborted) return;
        setStatus(next);
      } catch (loadError) {
        if (signal?.aborted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load Sign in status.');
      } finally {
        if (!signal?.aborted) setIsLoadingStatus(false);
      }
    },
    [providerId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadStatus(controller.signal);
    return () => controller.abort();
  }, [loadStatus]);

  useEffect(() => {
    const stream = createStudioEventStream();
    const unsubscribe = stream.onAuthUpdated((payload) => {
      if (payload.providerId !== providerId) return;
      void getSubscriptionAuthStatus(providerId)
        .then((next) => {
          setStatus(next);
          setError(null);
        })
        .catch(() => undefined);
    });
    return () => {
      unsubscribe();
      stream.close();
    };
  }, [providerId]);

  useEffect(() => {
    if (status?.status !== 'pending') return;
    let tickController: AbortController | null = null;
    const timer = window.setInterval(() => {
      tickController?.abort();
      tickController = new AbortController();
      const signal = tickController.signal;
      void getSubscriptionAuthStatus(providerId, { signal })
        .then((next) => {
          setStatus(next);
          setError(null);
        })
        .catch(() => undefined);
    }, 1500);
    return () => {
      window.clearInterval(timer);
      tickController?.abort();
    };
  }, [status?.status, providerId]);

  const statusLabel = subscriptionAuthStatusLabel(status?.status ?? null);
  const browserUrl = status?.authorizationUrl || status?.verificationUrl || null;
  const signInDisabled = busy || isLoadingStatus || status?.status === 'pending';

  const run = async (work: () => Promise<SubscriptionAuthPublicStatus>) => {
    setBusy(true);
    setError(null);
    try {
      const next = await work();
      setStatus(next);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async () => {
    if (!status?.userCode) return;
    try {
      await navigator.clipboard.writeText(status.userCode);
      setError(null);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      setError('Unable to copy. Copy the code manually.');
    }
  };

  return (
    <div className="settings-account-auth">
      {status?.status === 'pending' && browserUrl ? (
        <div className="grid gap-3 rounded-[var(--wb-radius)] border border-accent-400/2 bg-accent-500/10 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[12px] leading-relaxed text-[color:var(--wb-ink)]">
              {status.userCode
                ? 'Confirm this code in the browser. Studio finishes Sign in automatically.'
                : 'Approve access in the browser. Studio finishes Sign in automatically.'}
            </p>
            <span
              className={`inline-flex h-6 shrink-0 items-center rounded-[var(--wb-radius)] border px-2 text-[length:var(--wbp-label)] font-semibold ${subscriptionAuthPillClass(status.status)}`}
            >
              {statusLabel}
            </span>
          </div>
          {status.userCode ? (
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-[var(--wb-radius)] bg-[color:var(--wb-well)] px-3 py-2 font-mono text-sm tracking-normal text-[color:var(--wb-ink)]">
                {status.userCode}
              </code>
              <button
                type="button"
                onClick={() => void copyCode()}
                aria-label="Copy user code"
                className={`${controlGhost} size-9 shrink-0 px-0`}
              >
                {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
              </button>
            </div>
          ) : null}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <a href={browserUrl} target="_blank" rel="noreferrer" className={controlPrimary}>
              <IconExternalLink size={14} />
              {subscriptionAuthOpenLabel(providerId)}
            </a>
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(() => cancelSubscriptionAuth(providerId))}
              className={controlGhost}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="settings-account-auth-row">
          <div className="settings-account-identity">
            <span className="settings-account-label">Web account</span>
            <span
              className={`settings-account-status ${subscriptionAuthPillClass(status?.status)}`}
            >
              {statusLabel}
            </span>
            {status?.accountLabel && (
              <span className="settings-account-name">{status.accountLabel}</span>
            )}
          </div>
          {status?.status === 'logged_in' ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(() => logoutSubscriptionAuth(providerId))}
              className={controlQuiet}
            >
              Sign out
            </button>
          ) : status === null ? (
            <button
              type="button"
              disabled={busy || isLoadingStatus}
              onClick={() => void loadStatus()}
              className={controlGhost}
            >
              {isLoadingStatus ? 'Loading status' : 'Retry status'}
            </button>
          ) : (
            <button
              type="button"
              disabled={signInDisabled}
              onClick={() => void run(() => startSubscriptionAuth(providerId))}
              className={controlPrimary}
            >
              Sign in
            </button>
          )}
        </div>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'User code copied.' : ''}
      </span>
      {error || status?.lastError ? (
        <p role="alert" className="text-[12px] leading-relaxed text-[color:var(--wb-danger)] ">
          {error || status?.lastError}
        </p>
      ) : null}
      {providerId === 'google' && (
        <p className="settings-account-note">
          Uses your Google Cloud project for billing and quota.
        </p>
      )}
    </div>
  );
}
