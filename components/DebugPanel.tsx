import React from 'react';
import { X } from 'lucide-react';
import type { LogEntry } from '../types';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  appState: object;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ isOpen, onClose, logs, appState }) => {
  if (!isOpen) {
    return null;
  }

  const hasAppState = Object.keys(appState).length > 0;

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-zinc-800 shadow-2xl z-50 transition-transform duration-300 ease-in-out w-full max-w-md`}
      style={{ viewTransitionName: 'debug-panel' }}
    >
      <div className="flex justify-between items-center p-4">
        <h2 className="text-xl font-semibold">Session Activity</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-700">
          <X />
        </button>
      </div>
      <div className="h-[calc(100%-65px)] overflow-y-auto custom-scrollbar">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">Recent Events</h3>
          <div className="bg-zinc-900 rounded-md p-2 space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            {logs.length > 0 ? [...logs].reverse().map((log) => (
              <div key={log.id} className="text-xs text-zinc-400 font-mono pb-1">
                <span className="text-cyan-400">{new Date(log.timestamp).toLocaleTimeString()}</span>: {log.message}
              </div>
            )) : <p className="text-xs text-zinc-500">No events recorded yet.</p>}
          </div>
        </div>
        {hasAppState && (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-zinc-300 mb-2">Session Snapshot</h3>
            <pre className="bg-zinc-900 rounded-md p-2 text-xs text-yellow-300 overflow-auto custom-scrollbar">
              {JSON.stringify(appState, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};