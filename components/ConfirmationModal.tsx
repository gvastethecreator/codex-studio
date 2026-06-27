import React from 'react';
import { AnimatePresence, MotionDiv } from 'motion/react';
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
    shell: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
    button:
      'bg-rose-500/15 text-rose-100 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-400/30',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    shell: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    button:
      'bg-amber-500/15 text-amber-100 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-400/30',
  },
  accent: {
    icon: <RotateCcw size={18} />,
    shell: 'bg-accent-500/10 text-accent-300 border border-accent-500/20',
    button:
      'bg-accent-500/15 text-accent-100 border border-accent-500/20 hover:bg-accent-500/20 hover:border-accent-400/30',
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
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        <MotionDiv
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/5 p-6 bg-zinc-900/50">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${toneStyles.shell}`}
              >
                {toneStyles.icon}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-[0.22em] text-white">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {(details?.length || note) && (
            <div className="border-b border-white/5 px-6 py-5">
              {details?.length ? (
                <ul className="space-y-2">
                  {details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2 text-[11px] leading-relaxed text-zinc-400"
                    >
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-white/20" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {note ? (
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {note}
                </p>
              ) : null}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 p-6 bg-black/20">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-300 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => void onConfirm()}
              className={`h-11 rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${toneStyles.button}`}
            >
              {confirmLabel}
            </button>
          </div>
        </MotionDiv>
      </div>
    </AnimatePresence>
  );
};
