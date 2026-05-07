import React, { useRef } from "react";
import { FolderSync, Share, Sparkles, Layers } from "lucide-react";
import { SidePanel } from "./SidePanel";

interface RightSystemPanelProps {
  onImportVault: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onExportVault: () => void;
  isBackgroundEnabled: boolean;
  onToggleBackground: () => void;
  isQueueOpen: boolean;
  onToggleQueue: () => void;
  queueCount: number;
}

export const RightSystemPanel: React.FC<RightSystemPanelProps> = React.memo(
  ({
    onImportVault,
    onExportVault,
    isBackgroundEnabled,
    onToggleBackground,
    isQueueOpen,
    onToggleQueue,
    queueCount,
  }) => {
    const vaultInputRef = useRef<HTMLInputElement>(null);

    return (
      <SidePanel position="right" label="SYSTEM">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Data Vault
            </h3>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                ref={vaultInputRef}
                onChange={onImportVault}
                className="hidden"
                accept=".json"
              />
              <button
                onClick={() => vaultInputRef.current?.click()}
                className="group flex h-10 w-full items-center gap-3 rounded-xl bg-white/5 px-4 transition-all hover:bg-white/10"
              >
                <FolderSync
                  size={16}
                  className="text-zinc-500 transition-colors group-hover:text-white"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-white">
                  Import Vault
                </span>
              </button>
              <button
                onClick={onExportVault}
                className="group flex h-10 w-full items-center gap-3 rounded-xl bg-white/5 px-4 transition-all hover:bg-white/10"
              >
                <Share
                  size={16}
                  className="text-zinc-500 transition-colors group-hover:text-white"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-white">
                  Export Vault
                </span>
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-white/5" />

          <div>
            <h3 className="mb-3 px-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Environment
            </h3>

            <button
              onClick={onToggleQueue}
              className={`group mb-2 flex h-10 w-full items-center justify-between rounded-xl px-4 transition-all ${isQueueOpen ? "border border-accent-500/20 bg-accent-500/10" : "bg-white/5 hover:bg-white/10"}`}
            >
              <div className="flex items-center gap-3">
                <Layers size={16} className={isQueueOpen ? "text-accent-400" : "text-zinc-500"} />
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${isQueueOpen ? "text-accent-400" : "text-zinc-300"}`}
                >
                  Generation Queue
                </span>
              </div>
              <div className="flex items-center gap-2">
                {queueCount > 0 && (
                  <span className="text-[10px] font-bold text-accent-400">{queueCount}</span>
                )}
                <div
                  className={`h-2 w-2 rounded-full ${isQueueOpen ? "bg-accent-400 shadow-[0_0_8px_rgba(var(--accent-500),0.8)]" : "bg-zinc-700"}`}
                />
              </div>
            </button>

            <button
              onClick={onToggleBackground}
              className={`group mb-4 flex h-10 w-full items-center justify-between rounded-xl px-4 transition-all ${isBackgroundEnabled ? "border border-accent-500/20 bg-accent-500/10" : "bg-white/5 hover:bg-white/10"}`}
            >
              <div className="flex items-center gap-3">
                <Sparkles
                  size={16}
                  className={isBackgroundEnabled ? "text-accent-400" : "text-zinc-500"}
                />
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${isBackgroundEnabled ? "text-accent-400" : "text-zinc-300"}`}
                >
                  Animated Background
                </span>
              </div>
              <div
                className={`h-2 w-2 rounded-full ${isBackgroundEnabled ? "bg-accent-400 shadow-[0_0_8px_rgba(var(--accent-500),0.8)]" : "bg-zinc-700"}`}
              />
            </button>
          </div>
        </div>
      </SidePanel>
    );
  },
);
