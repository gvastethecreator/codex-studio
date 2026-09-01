import { IconCheck, IconCopy, IconExternalLink } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

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
import {
  subscriptionAccountTitle,
  subscriptionAccountUsedBy,
  subscriptionAuthOpenLabel,
  subscriptionAuthStatusLabel,
} from '../../lib/subscriptionAuthUi';

export function SubscriptionAuthControls({
  providerId,
  onChanged,
}: {
  providerId: SubscriptionProviderId;
  onChanged: () => void;
}) {
  const [status, setStatus] = useState<SubscriptionAuthPublicStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;

  useEffect(() => {
    const controller = new AbortController();
    void getSubscriptionAuthStatus(providerId, { signal: controller.signal })
      .then((next) => {
        setStatus(next);
      })
      .catch((loadError) => {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load Sign in status.');
      });
    return () => controller.abort();
  }, [providerId]);

  useEffect(() => {
    const stream = createStudioEventStream();
    const unsubscribe = stream.onAuthUpdated((payload) => {
      if (payload.providerId !== providerId) return;
      void getSubscriptionAuthStatus(providerId)
        .then((next) => {
          setStatus(next);
          if (next.status === 'logged_in' || next.status === 'logged_out') {
            onChangedRef.current();
          }
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
          if (next.status === 'logged_in') onChangedRef.current();
        })
        .catch(() => undefined);
    }, 1500);
    return () => {
      window.clearInterval(timer);
      tickController?.abort();
    };
  }, [status?.status, providerId]);

  const label = subscriptionAccountTitle(providerId);
  const statusLabel = subscriptionAuthStatusLabel(status?.status ?? null);
  const signInDisabled = busy || status === null || status.status === 'pending';

  const run = async (work: () => Promise<SubscriptionAuthPublicStatus>) => {
    setBusy(true);
    setError(null);
    try {
      const next = await work();
      setStatus(next);
      onChangedRef.current();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async () => {
    if (!status?.userCode) return;
    await navigator.clipboard.writeText(status.userCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mt-3 grid gap-3 border-t border-white/10 pt-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-white">{label}</div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
            {subscriptionAccountUsedBy(providerId)}
          </p>
        </div>
        <span className="shrink-0 text-[11px] font-medium text-zinc-300">{statusLabel}</span>
      </div>
      {status?.accountLabel ? (
        <p className="truncate text-[12px] leading-relaxed text-zinc-300">{status.accountLabel}</p>
      ) : null}
      {status?.status === 'pending' && status.verificationUrl ? (
        <div className="grid gap-2 rounded-lg border border-accent-500/20 bg-accent-500/8 p-3">
          <p className="text-[12px] leading-relaxed text-zinc-300">
            Confirm this code in the browser. Studio finishes Sign in automatically.
          </p>
          {status.userCode ? (
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md bg-black/40 px-2 py-1.5 font-mono text-sm tracking-[0.18em] text-white">
                {status.userCode}
              </code>
              <button
                type="button"
                onClick={() => void copyCode()}
                aria-label="Copy user code"
                className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-200 transition-colors hover:bg-white/10"
              >
                {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
              </button>
            </div>
          ) : null}
          <a
            href={status.verificationUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-accent-400/30 bg-accent-500/15 px-3 text-[11px] font-semibold text-accent-100 transition-colors hover:bg-accent-500/25"
          >
            <IconExternalLink size={14} />
            {subscriptionAuthOpenLabel(providerId)}
          </a>
        </div>
      ) : null}
      {error || status?.lastError ? (
        <p className="text-[12px] leading-relaxed text-rose-300">{error || status?.lastError}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {status?.status === 'logged_in' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => logoutSubscriptionAuth(providerId))}
            className="h-9 rounded-lg border border-white/15 px-3 text-[11px] font-semibold text-zinc-200 transition-colors hover:bg-white/8 disabled:opacity-60"
          >
            Sign out
          </button>
        ) : status?.status === 'pending' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => cancelSubscriptionAuth(providerId))}
            className="h-9 rounded-lg border border-white/15 px-3 text-[11px] font-semibold text-zinc-200 transition-colors hover:bg-white/8 disabled:opacity-60"
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            disabled={signInDisabled}
            onClick={() => void run(() => startSubscriptionAuth(providerId))}
            className="h-9 rounded-lg border border-accent-500/30 bg-accent-500/10 px-3 text-[11px] font-semibold text-accent-100 transition-colors hover:bg-accent-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign in
          </button>
        )}
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-600">
        Tokens stay in the Studio Library. CLI stays as automatic fallback.
      </p>
    </div>
  );
}
