import React from 'react';
import { Database, Terminal, Activity } from 'lucide-react';
import { SidePanel } from './SidePanel';
import type { Workspace, LogEntry } from '../types';

interface LeftDebugPanelProps {
  workspaces: Workspace[];
  logs: LogEntry[];
  batchesCount: number;
  imagesCount: number;
}

export const LeftDebugPanel: React.FC<LeftDebugPanelProps> = ({
  workspaces,
  logs,
  batchesCount,
  imagesCount,
}) => {
  return (
    <SidePanel position="left" label="STUDIO STATUS">
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Database size={14} className="text-accent-400" />
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Workspaces
            </h3>
          </div>
          <div className="space-y-2">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/5"
              >
                <span className="text-[9px] font-mono text-zinc-300">
                  {ws.name || ws.id.slice(0, 8)}
                </span>
                <span className="text-[8px] font-black text-zinc-600">
                  {new Date(ws.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <Terminal size={14} className="text-accent-400" />
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Recent Activity
            </h3>
          </div>
          <div className="relative font-mono text-[9px] leading-relaxed space-y-1.5 p-2 rounded-lg bg-black/40 border border-white/5 max-h-100 overflow-y-auto custom-scrollbar">
            {logs.length > 0 ? (
              logs.slice(0, 50).map((l) => (
                <div key={l.id} className="flex gap-2">
                  <span className="text-zinc-600 shrink-0 select-none">
                    {new Date(l.timestamp).toLocaleTimeString([], { hour12: false })}
                  </span>
                  <span className="text-zinc-400 wrap-break-word">{l.message}</span>
                </div>
              ))
            ) : (
              <span className="text-zinc-700 italic">No recent activity</span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-accent-400" />
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Local Metrics
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-white/5 rounded border border-white/5">
              <span className="block text-[8px] text-zinc-600 uppercase">Total Batches</span>
              <span className="text-lg font-black text-zinc-300">{batchesCount}</span>
            </div>
            <div className="p-2 bg-white/5 rounded border border-white/5">
              <span className="block text-[8px] text-zinc-600 uppercase">Image Count</span>
              <span className="text-lg font-black text-zinc-300">{imagesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </SidePanel>
  );
};
