import React from 'react';
import { X, User, Settings, Activity, Download, Database, Layers, HardDrive } from 'lucide-react';
import type { Workspace } from '../types';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  imagesCount: number;
  workspaces: Workspace[];
  onExportLegacyVisualBatchSnapshot: () => void;
  onDeepScan: () => void;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  imagesCount,
  workspaces,
  onExportLegacyVisualBatchSnapshot,
  onDeepScan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="vt-dashboard-modal bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400">
              <User size={20} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">
              Studio Dashboard
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex flex-col gap-8">
          <div className="flex items-center gap-6">
            <div className="size-20 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 relative overflow-hidden">
              <User size={40} />
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

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <HardDrive size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Library
                </span>
              </div>
              <p className="text-lg font-mono font-black text-white">Local</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Images
                </span>
              </div>
              <p className="text-lg font-mono font-black text-white">{imagesCount}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-purple-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Workspaces
                </span>
              </div>
              <p className="text-lg font-mono font-black text-white">{workspaces.length}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">
              Legacy Workspace Snapshot
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={onExportLegacyVisualBatchSnapshot}
                className="flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white transition-all text-xs font-black uppercase tracking-widest cursor-pointer group"
              >
                <Download
                  size={16}
                  className="text-blue-400 group-hover:scale-110 transition-transform"
                />
                Export Legacy Snapshot
              </button>
            </div>
            <button
              type="button"
              onClick={onDeepScan}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-accent-500/5 hover:bg-accent-500/10 border border-accent-500/10 text-accent-400 hover:text-accent-300 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer group mt-2"
            >
              <Activity size={14} className="animate-pulse" />
              Recover Saved Snapshots
            </button>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest cursor-pointer"
            >
              <Settings size={16} />
              Settings
            </button>
            <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
              Codex Studio Preview
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
