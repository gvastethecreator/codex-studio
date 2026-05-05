import React, { useRef } from 'react';
import { FolderSync, Share, Sparkles, Layers } from 'lucide-react';
import { SidePanel } from './SidePanel';

interface RightSystemPanelProps {
    onImportVault: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    onExportVault: () => void;
    isBackgroundEnabled: boolean;
    onToggleBackground: () => void;
    isQueueOpen: boolean;
    onToggleQueue: () => void;
    queueCount: number;
}

export const RightSystemPanel: React.FC<RightSystemPanelProps> = ({
    onImportVault,
    onExportVault,
    isBackgroundEnabled,
    onToggleBackground,
    isQueueOpen,
    onToggleQueue,
    queueCount
}) => {
    const vaultInputRef = useRef<HTMLInputElement>(null);

    return (
        <SidePanel position="right" label="SYSTEM">
            <div className="flex flex-col gap-6">
                <div>
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Data Vault</h3>
                    <div className="flex flex-col gap-2">
                        <input type="file" ref={vaultInputRef} onChange={onImportVault} className="hidden" accept=".json" />
                        <button 
                            onClick={() => vaultInputRef.current?.click()}
                            className="w-full h-10 flex items-center px-4 gap-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                        >
                            <FolderSync size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest group-hover:text-white">Import Vault</span>
                        </button>
                        <button 
                            onClick={onExportVault}
                            className="w-full h-10 flex items-center px-4 gap-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                        >
                            <Share size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest group-hover:text-white">Export Vault</span>
                        </button>
                    </div>
                </div>

                <div className="h-px bg-white/5 w-full" />

                <div>
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Environment</h3>
                    
                    <button 
                        onClick={onToggleQueue}
                        className={`w-full h-10 flex items-center justify-between px-4 rounded-xl transition-all group mb-2 ${isQueueOpen ? 'bg-accent-500/10 border border-accent-500/20' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Layers size={16} className={isQueueOpen ? 'text-accent-400' : 'text-zinc-500'} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isQueueOpen ? 'text-accent-400' : 'text-zinc-300'}`}>Generation Queue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {queueCount > 0 && <span className="text-[10px] font-bold text-accent-400">{queueCount}</span>}
                            <div className={`w-2 h-2 rounded-full ${isQueueOpen ? 'bg-accent-400 shadow-[0_0_8px_rgba(var(--accent-500),0.8)]' : 'bg-zinc-700'}`} />
                        </div>
                    </button>

                    <button 
                        onClick={onToggleBackground}
                        className={`w-full h-10 flex items-center justify-between px-4 rounded-xl transition-all group mb-4 ${isBackgroundEnabled ? 'bg-accent-500/10 border border-accent-500/20' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles size={16} className={isBackgroundEnabled ? 'text-accent-400' : 'text-zinc-500'} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isBackgroundEnabled ? 'text-accent-400' : 'text-zinc-300'}`}>Animated Background</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${isBackgroundEnabled ? 'bg-accent-400 shadow-[0_0_8px_rgba(var(--accent-500),0.8)]' : 'bg-zinc-700'}`} />
                    </button>
                </div>
            </div>
        </SidePanel>
    );
};
