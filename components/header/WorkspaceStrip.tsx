import React from 'react';
import { Plus, X } from 'lucide-react';
import type { Workspace } from '../../types';
import Tooltip from '../Tooltip';

interface WorkspaceStripProps {
    workspaces: (Workspace & { imageCount?: number })[];
    activeWorkspaceId: string;
    onSwitchWorkspace: (id: string) => void;
    onAddWorkspace: () => void;
    onDeleteWorkspace: (id: string) => void;
    onRenameWorkspace: (id: string, name: string) => void;
}

const WORKSPACE_GRADIENTS = [
    'from-rose-500/50 to-orange-500/50',
    'from-violet-600/50 to-indigo-600/50',
    'from-cyan-500/50 to-blue-600/50',
    'from-emerald-500/50 to-teal-600/50',
    'from-fuchsia-600/50 to-purple-600/50',
    'from-amber-500/50 to-orange-600/50',
    'from-blue-500 to-indigo-500/50',
    'from-pink-500/50 to-rose-500/50',
    'from-lime-500/50 to-green-600/50',
    'from-sky-500/50 to-cyan-500/50',
];

const getWorkspaceGradient = (index: number) => {
    const stride = 3;
    const safeIndex = (index * stride) % WORKSPACE_GRADIENTS.length;
    return WORKSPACE_GRADIENTS[safeIndex];
};

const getWorkspaceLabel = (workspace: Workspace, index: number) => {
    if (workspace.name) return workspace.name.slice(0, 2).toUpperCase();
    const letterIndex = index % 26;
    return String.fromCharCode(65 + letterIndex);
};

export function WorkspaceStrip({
    workspaces,
    activeWorkspaceId,
    onSwitchWorkspace,
    onAddWorkspace,
    onDeleteWorkspace,
    onRenameWorkspace,
}: WorkspaceStripProps) {
    const [editingWorkspaceId, setEditingWorkspaceId] = React.useState<string | null>(null);
    const [editingName, setEditingName] = React.useState('');
    const workspacesContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                editingWorkspaceId &&
                workspacesContainerRef.current &&
                !workspacesContainerRef.current.contains(event.target as Node)
            ) {
                setEditingWorkspaceId(null);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [editingWorkspaceId]);

    const handleRenameSubmit = (id: string) => {
        if (editingName.trim()) {
            onRenameWorkspace(id, editingName.trim());
        }
        setEditingWorkspaceId(null);
    };

    return (
        <div
            ref={workspacesContainerRef}
            className="vt-workspace-list hidden md:flex items-center gap-2 px-2"
        >
            {workspaces.map((workspace, index) => {
                const label = getWorkspaceLabel(workspace, index);
                const gradientClass = getWorkspaceGradient(index);
                const isActive = activeWorkspaceId === workspace.id;

                return (
                    <div key={workspace.id} className="relative group shrink-0">
                        <Tooltip
                            content={`Workspace ${workspace.name || label}: ${new Date(workspace.createdAt).toLocaleDateString()}`}
                            position="bottom"
                        >
                            <button
                                onClick={() => {
                                    if (isActive) {
                                        setEditingWorkspaceId(workspace.id);
                                        setEditingName(workspace.name || `Workspace ${label}`);
                                    } else {
                                        onSwitchWorkspace(workspace.id);
                                    }
                                }}
                                className={
                                    `w-9 h-9 rounded-xl border-2 transition-all overflow-hidden relative flex items-center justify-center cursor-pointer ${isActive
                                        ? 'border-accent-500 shadow-lg scale-105'
                                        : 'border-white/10 opacity-60 hover:opacity-100'
                                    }`
                                }
                            >
                                {workspace.lastImage ? (
                                    <img src={workspace.lastImage} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div
                                        className={`w-full h-full bg-linear-to-br ${gradientClass} flex items-center justify-center`}
                                    >
                                        <span className="text-[10px] font-black text-white drop-shadow-md">{label}</span>
                                    </div>
                                )}
                            </button>
                        </Tooltip>
                        {editingWorkspaceId === workspace.id && (
                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 p-2 rounded-xl shadow-xl z-50 flex gap-2 animate-in fade-in zoom-in duration-200">
                                <input
                                    autoFocus
                                    value={editingName}
                                    onChange={(event) => setEditingName(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') handleRenameSubmit(workspace.id);
                                        if (event.key === 'Escape') setEditingWorkspaceId(null);
                                    }}
                                    className="bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-accent-500 w-40"
                                    placeholder="Workspace Name"
                                />
                            </div>
                        )}
                        {workspaces.length > 1 && (
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDeleteWorkspace(workspace.id);
                                }}
                                className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm cursor-pointer"
                                title="Delete Workspace"
                            >
                                <X size={11} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                );
            })}
            <Tooltip content="Synthesize New Workspace" position="bottom">
                <button
                    onClick={onAddWorkspace}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-accent-500/20 text-zinc-600 border border-dashed border-white/10 transition-all cursor-pointer"
                >
                    <Plus size={18} />
                </button>
            </Tooltip>
        </div>
    );
}
