import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, RotateCcw, X, Trash, AlertCircle } from 'lucide-react';
import type { ArchivedImageGroup } from '../lib/studioCatalogTrashView';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  trash: ArchivedImageGroup[];
  onRestore: (batchId: string) => void;
  onRestoreAll: () => void;
  onEmpty: () => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({
  isOpen,
  onClose,
  trash,
  onRestore,
  onRestoreAll,
  onEmpty,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[80vh] bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                <Trash2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-white">
                  Recycle Bin
                </h2>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  {trash.length} image groups archived • Auto-purges after 100 items
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {trash.length > 0 && (
                <>
                  <button
                    onClick={onRestoreAll}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-500/10 hover:bg-accent-500/20 text-accent-400 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Restore All</span>
                  </button>
                  <button
                    onClick={onEmpty}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <Trash size={14} />
                    <span>Empty Bin</span>
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {trash.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-700 mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-1">
                  Bin is Empty
                </h3>
                <p className="text-zinc-600 text-xs max-w-[240px]">
                  Deleted generations and archived image groups will appear here for recovery.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {trash.map((group) => (
                  <div
                    key={group.id}
                    className="group bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 transition-all"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/5">
                      {group.thumbnail && (
                        <img
                          src={group.thumbnail}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                          alt=""
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          {new Date(group.createdAt).toLocaleString()}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-[10px] font-bold text-accent-500 uppercase tracking-widest">
                          {group.workspaceId || 'Default'}
                        </span>
                      </div>
                      <h4 className="text-xs text-zinc-300 font-medium line-clamp-1 mb-2">
                        {group.prompt}
                      </h4>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                          {group.imageCount} Images
                        </div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">
                          {group.model}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRestore(group.id)}
                      className="p-3 rounded-xl bg-accent-500/10 hover:bg-accent-500 text-accent-400 hover:text-white transition-all active:scale-90 cursor-pointer"
                      title="Restore Batch"
                    >
                      <RotateCcw size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-black/20 border-t border-white/5 flex items-center gap-3">
            <AlertCircle size={14} className="text-zinc-600" />
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
              Archived items do not count towards your active workspace limits.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
