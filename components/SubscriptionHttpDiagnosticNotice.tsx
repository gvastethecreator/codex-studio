import React, { useState } from 'react';

import { describeSubscriptionHttpDiagnostic } from '../lib/subscriptionHttpDiagnosticView';

export function SubscriptionHttpDiagnosticNotice({ value }: { value: unknown }) {
  const view = describeSubscriptionHttpDiagnostic(value);
  const [status, setStatus] = useState<string | null>(null);
  const [manualCopy, setManualCopy] = useState(false);
  const copyText = view?.copyText ?? '';
  if (!view) return null;

  async function copyDiagnostic() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard_unavailable');
      await navigator.clipboard.writeText(copyText);
      setManualCopy(false);
      setStatus('Diagnostic copied.');
    } catch {
      setManualCopy(true);
      setStatus('Clipboard is unavailable. Select the diagnostic and copy it.');
    }
  }

  const rows = [
    ['Classification', view.classification],
    ['Basis', view.basis],
    ['HTTP status', view.httpStatus],
    ['Minimum wait', view.minimumWait],
    ['Reset', view.reset],
    ['Quota scope', view.scope],
  ] as const;

  return (
    <div className="mt-3 space-y-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 py-2.5">
      <dl className="space-y-2">
        {rows.map(([label, text]) => (
          <div key={label}>
            <dt className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
              {label}
            </dt>
            <dd className="mt-0.5 text-[12px] leading-5 text-[color:var(--wb-ink)] [overflow-wrap:anywhere]">
              {text}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-[12px] leading-5 text-[color:var(--wb-muted)]">
        No recovery time is guaranteed.
      </p>
      <button
        type="button"
        onClick={() => void copyDiagnostic()}
        className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] px-3 py-1.5 text-[12px] font-semibold text-[color:var(--wb-ink)]"
      >
        Copy diagnostic
      </button>
      <p
        role="status"
        aria-live="polite"
        className={status ? 'text-[12px] leading-5 text-[color:var(--wb-ink)]' : 'sr-only'}
      >
        {status ?? ''}
      </p>
      {manualCopy ? (
        <textarea
          readOnly
          value={view.copyText}
          aria-label="Quota diagnostic"
          rows={8}
          className="w-full rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-2 font-mono text-[11px] leading-5 text-[color:var(--wb-ink)]"
        />
      ) : null}
    </div>
  );
}
