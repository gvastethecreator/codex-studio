import { useDialogFocus } from '../hooks/useDialogFocus';
import React from 'react';
import {
  IconX as X,
  IconUser as User,
  IconDownload as Download,
  IconDatabase as Database,
  IconStack as Layers,
  IconDeviceDesktop as HardDrive,
} from '@tabler/icons-react';
import type { Workspace } from '../types';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  imagesCount: number;
  workspaces: Workspace[];
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  imagesCount,
  workspaces,
}) => {
  const dialogRef = useDialogFocus(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-0 backdrop-blur-sm sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Library summary"
        tabIndex={-1}
        className="vt-dashboard-modal flex h-full w-full max-w-xl flex-col overflow-hidden bg-zinc-900 shadow-2xl sm:h-auto sm:max-h-[88vh] sm:rounded-3xl sm:border sm:border-white/2"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/2 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400">
              <User size={20} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">
              Library summary
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close dashboard"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="custom-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:gap-8 sm:p-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/2 bg-zinc-800 text-zinc-400 sm:size-20">
              <User size={34} />
              <div className="absolute inset-0 bg-linear-to-tr from-accent-500/20 to-transparent" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                Local Session
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-md bg-accent-500/10 text-accent-400 text-[10px] font-black uppercase tracking-widest">
                  Local Codex
                </span>
                <span className="size-1 rounded-full bg-zinc-700" />
                <span className="text-xs text-zinc-500 font-medium">Active Session</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/2 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <HardDrive size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Library
                </span>
              </div>
              <p className="text-lg font-mono font-black text-white">Local</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/2 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Images loaded
                </span>
              </div>
              <p className="text-lg font-mono font-black text-white">{imagesCount}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/2 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-purple-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Workspaces
                </span>
              </div>
              <p className="text-lg font-mono font-black text-white">{workspaces.length}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/2 flex justify-end">
            <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
              Codex Studio Preview
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
