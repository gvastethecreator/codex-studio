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
  layout?: 'desktop' | 'compact';
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
  layout = 'desktop',
}: WorkspaceStripProps) {
  const [editingWorkspaceId, setEditingWorkspaceId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState('');
  const workspacesContainerRef = React.useRef<HTMLDivElement>(null);
  const isCompact = layout === 'compact';

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
      className={`vt-workspace-list items-center gap-2 px-2 ${isCompact ? 'flex max-w-[min(82vw,360px)] overflow-x-auto py-1 no-scrollbar' : 'hidden md:flex'}`}
    >
      {workspaces.map((workspace, index) => {
        const label = getWorkspaceLabel(workspace, index);
        const gradientClass = getWorkspaceGradient(index);
        const isActive = activeWorkspaceId === workspace.id;
        const workspaceName = workspace.name || `Workspace ${label}`;
        const tooltipContent = `${workspaceName} · created ${new Date(workspace.createdAt).toLocaleDateString()}`;
        const workspaceButtonClassName = `size-10 rounded-xl border-2 transition-[color,background-color,border-color,opacity,transform,box-shadow] overflow-hidden relative flex items-center justify-center cursor-pointer ${
          isActive
            ? 'border-accent-500 shadow-lg scale-105'
            : 'border-white/10 opacity-60 hover:opacity-100'
        }`;

        return (
          <div key={workspace.id} className="relative group shrink-0">
            <Tooltip content={tooltipContent} position="bottom">
              <button
                type="button"
                aria-current={isActive ? 'page' : undefined}
                aria-label={
                  isActive
                    ? `Rename workspace ${workspaceName}`
                    : `Switch to workspace ${workspaceName}`
                }
                onClick={() => {
                  if (isActive) {
                    setEditingWorkspaceId(workspace.id);
                    setEditingName(workspaceName);
                  } else {
                    onSwitchWorkspace(workspace.id);
                  }
                }}
                className={workspaceButtonClassName}
              >
                {workspace.lastImage ? (
                  <img
                    src={workspace.lastImage}
                    className="size-full object-cover"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div
                    className={`size-full bg-linear-to-br ${gradientClass} flex items-center justify-center`}
                  >
                    <span className="text-[10px] font-black text-white drop-shadow-md">
                      {label}
                    </span>
                  </div>
                )}
              </button>
            </Tooltip>
            {editingWorkspaceId === workspace.id && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 p-2 rounded-xl shadow-xl z-50 flex gap-2 animate-in fade-in zoom-in duration-200">
                <input
                  ref={(el) => el?.focus()}
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleRenameSubmit(workspace.id);
                    if (event.key === 'Escape') setEditingWorkspaceId(null);
                  }}
                  aria-label="Rename workspace"
                  className="bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-accent-500 w-40"
                  placeholder="Workspace name"
                />
              </div>
            )}
            {workspaces.length > 1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteWorkspace(workspace.id);
                }}
                aria-label={`Delete workspace ${workspaceName}`}
                className="absolute -top-2.5 -right-2.5 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 hover:bg-red-400"
              >
                <X size={13} strokeWidth={3} />
              </button>
            )}
          </div>
        );
      })}
      <Tooltip content="Create workspace" position="bottom">
        <button
          type="button"
          onClick={onAddWorkspace}
          aria-label="Create workspace"
          className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 text-zinc-600 transition-[color,background-color,border-color,opacity,transform] hover:bg-accent-500/20 hover:text-zinc-200"
        >
          <Plus size={18} />
        </button>
      </Tooltip>
    </div>
  );
}
