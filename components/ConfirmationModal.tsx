import { useDialogFocus } from '../hooks/useDialogFocus';
import React from 'react';
import { AnimatePresence, MotionDiv } from '../lib/gsapMotion';
import {
  IconAlertTriangle as AlertTriangle,
  IconRotate as RotateCcw,
  IconShieldExclamation as ShieldAlert,
  IconX as X,
} from '@tabler/icons-react';

import type { ConfirmationTone } from '../hooks/useStudioActionConfirmations';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmationTone;
  details?: string[];
  note?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

const TONE_STYLES: Record<
  ConfirmationTone,
  { icon: React.ReactNode; shell: string; button: string }
> = {
  danger: {
    icon: <ShieldAlert size={18} />,
    shell: 'bg-rose-500/10 text-rose-300 border border-rose-500/2',
    button:
      'bg-rose-500/15 text-rose-100 border border-rose-500/2 hover:bg-rose-500/20 hover:border-rose-400/2',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    shell: 'bg-amber-500/10 text-amber-300 border border-amber-500/2',
    button:
      'bg-amber-500/15 text-amber-100 border border-amber-500/2 hover:bg-amber-500/20 hover:border-amber-400/2',
  },
  accent: {
    icon: <RotateCcw size={18} />,
    shell: 'bg-accent-500/10 text-accent-300 border border-accent-500/2',
    button:
      'bg-accent-500/15 text-accent-100 border border-accent-500/2 hover:bg-accent-500/20 hover:border-accent-400/2',
  },
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'danger',
  details,
  note,
  onClose,
  onConfirm,
}) => {
  const dialogRef = useDialogFocus(isOpen, onClose);
  if (!isOpen) return null;

  const toneStyles = TONE_STYLES[tone];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-110 flex items-center justify-center p-4 md:p-8">
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 studio-scrim backdrop-blur-md"
        />

        <MotionDiv
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="studio-dialog relative w-full max-w-lg overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[color:var(--wb-line)] p-6 bg-[color:var(--wb-panel)]">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${toneStyles.shell}`}
              >
                {toneStyles.icon}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-[0.22em] text-[color:var(--wb-ink)]">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--wb-ink)]">{description}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close confirmation"
              onClick={onClose}
              className="rounded-xl p-2 text-[color:var(--wb-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] hover:text-[color:var(--wb-ink)] cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {(details?.length || note) && (
            <div className="border-b border-[color:var(--wb-line)] px-6 py-5">
              {details?.length ? (
                <ul className="space-y-2">
                  {details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2 text-[11px] leading-relaxed text-[color:var(--wb-muted)]"
                    >
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-white/20" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {note ? (
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-[color:var(--wb-muted)]">
                  {note}
                </p>
              ) : null}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 p-6 bg-[color:var(--wb-well)]">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-2xl border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-4 text-[10px] font-black uppercase tracking-widest text-[color:var(--wb-ink)] transition-[color,background-color,border-color,opacity,box-shadow,transform] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)] cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => void onConfirm()}
              className={`h-11 rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest transition-[color,background-color,border-color,opacity,box-shadow,transform] cursor-pointer ${toneStyles.button}`}
            >
              {confirmLabel}
            </button>
          </div>
        </MotionDiv>
      </div>
    </AnimatePresence>
  );
};
