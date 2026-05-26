import React from 'react';
import { MotionDiv, AnimatePresence } from 'motion/react';
import { AlertTriangle, Download, Trash2, X } from 'lucide-react';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadAndClear: () => void;
  visualGroupCount: number;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({
  isOpen,
  onClose,
  onDownloadAndClear,
  visualGroupCount,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
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
          className="relative w-full max-w-md bg-zinc-900 border border-red-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-red-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-white">
                  Storage Limit Reached
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
              You have reached the maximum recommended number of visual groups ({visualGroupCount}
              ). To prevent performance issues and data loss, we recommend downloading your images
              as a ZIP file and clearing your workspace.
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={onDownloadAndClear}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-accent-500 hover:bg-accent-400 text-black font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                <Download size={18} />
                <span>Download ZIP & Clear</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest transition-all cursor-pointer"
              >
                <span>Dismiss for now</span>
              </button>
            </div>
          </div>
        </MotionDiv>
      </div>
    </AnimatePresence>
  );
};
