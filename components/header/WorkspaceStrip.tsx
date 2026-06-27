import React from 'react';
import { IconPlus as Plus, IconTrash as Trash2 } from '@tabler/icons-react';
import { isDefaultWorkspace } from '../../lib/workspaceLifecycle';
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
  const [workspaceUi, setWorkspaceUi] = React.useState<{
    editingWorkspaceId: string | null;
    contextMenuWorkspaceId: string | null;
  }>({
    editingWorkspaceId: null,
    contextMenuWorkspaceId: null,
  });
  const { editingWorkspaceId, contextMenuWorkspaceId } = workspaceUi;
  const [editingName, setEditingName] = React.useState('');
  const workspacesContainerRef = React.useRef<HTMLDivElement>(null);
  const isCompact = layout === 'compact';

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        (editingWorkspaceId || contextMenuWorkspaceId) &&
        workspacesContainerRef.current &&
        !workspacesContainerRef.current.contains(event.target as Node)
      ) {
        setWorkspaceUi({ editingWorkspaceId: null, contextMenuWorkspaceId: null });
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setWorkspaceUi({ editingWorkspaceId: null, contextMenuWorkspaceId: null });
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenuWorkspaceId, editingWorkspaceId]);

  const handleRenameSubmit = (id: string) => {
    if (editingName.trim()) {
      onRenameWorkspace(id, editingName.trim());
    }
    setWorkspaceUi((prev) => ({ ...prev, editingWorkspaceId: null }));
  };

  return (
    <div
      ref={workspacesContainerRef}
      className={`vt-workspace-list items-center gap-1 px-1 ${isCompact ? 'flex max-w-[min(82vw,340px)] overflow-x-auto py-1 no-scrollbar' : 'hidden md:flex'}`}
    >
      {workspaces.map((workspace, index) => {
        const label = getWorkspaceLabel(workspace, index);
        const gradientClass = getWorkspaceGradient(index);
        const isActive = activeWorkspaceId === workspace.id;
        const workspaceName = workspace.name || `Workspace ${label}`;
        const canDeleteWorkspace = workspaces.length > 1 && !isDefaultWorkspace(workspace.id);
        const tooltipContent = `${workspaceName} · created ${new Date(workspace.createdAt).toLocaleDateString()}`;
        const workspaceButtonClassName = `studio-hit-target size-8 rounded-lg border-2 transition-[color,background-color,border-color,opacity,transform,box-shadow] overflow-hidden relative flex items-center justify-center cursor-pointer ${
          isActive ? 'border-accent-500 scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
        }`;

        return (
          <div key={workspace.id} className="relative group shrink-0">
            <Tooltip
              content={tooltipContent}
              contentClassName={contextMenuWorkspaceId === workspace.id ? 'hidden' : ''}
              position="bottom"
            >
              <button
                type="button"
                aria-current={isActive ? 'page' : undefined}
                aria-expanded={contextMenuWorkspaceId === workspace.id ? true : undefined}
                aria-haspopup="menu"
                aria-label={
                  isActive
                    ? `Rename workspace ${workspaceName}`
                    : `Switch to workspace ${workspaceName}`
                }
                onClick={() => {
                  if (isActive) {
                    setWorkspaceUi({
                      editingWorkspaceId: workspace.id,
                      contextMenuWorkspaceId: null,
                    });
                    setEditingName(workspaceName);
                  } else {
                    setWorkspaceUi({
                      editingWorkspaceId: null,
                      contextMenuWorkspaceId: null,
                    });
                    onSwitchWorkspace(workspace.id);
                  }
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setWorkspaceUi({
                    editingWorkspaceId: null,
                    contextMenuWorkspaceId: workspace.id,
                  });
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
                    event.preventDefault();
                    setWorkspaceUi({
                      editingWorkspaceId: null,
                      contextMenuWorkspaceId: workspace.id,
                    });
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
              <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 p-1.5 rounded-lg shadow-xl z-50 flex gap-2 animate-in fade-in zoom-in duration-200">
                <input
                  ref={(el) => el?.focus()}
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleRenameSubmit(workspace.id);
                    if (event.key === 'Escape') {
                      setWorkspaceUi((prev) => ({ ...prev, editingWorkspaceId: null }));
                    }
                  }}
                  aria-label="Rename workspace"
                  className="bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-accent-500 w-36"
                  placeholder="Workspace name"
                />
              </div>
            )}
            {contextMenuWorkspaceId === workspace.id && (
              <div
                role="menu"
                aria-label={`Workspace actions for ${workspaceName}`}
                className="absolute top-full left-1/2 z-50 mt-1.5 min-w-40 -translate-x-1/2 rounded-lg border border-white/10 bg-zinc-950/95 p-1 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-150"
              >
                <button
                  type="button"
                  role="menuitem"
                  disabled={!canDeleteWorkspace}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!canDeleteWorkspace) return;
                    setWorkspaceUi((prev) => ({ ...prev, contextMenuWorkspaceId: null }));
                    onDeleteWorkspace(workspace.id);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[10px] font-black uppercase tracking-widest text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:text-red-200/35 disabled:hover:bg-transparent"
                >
                  <Trash2 size={13} />
                  <span>{canDeleteWorkspace ? 'Delete workspace' : 'Default locked'}</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
      <Tooltip content="Create workspace" position="bottom">
        <button
          type="button"
          onClick={() => {
            setWorkspaceUi((prev) => ({ ...prev, contextMenuWorkspaceId: null }));
            onAddWorkspace();
          }}
          aria-label="Create workspace"
          className="studio-hit-target flex size-8 cursor-pointer items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/5 text-zinc-600 transition-[color,background-color,border-color,opacity,transform] hover:bg-accent-500/20 hover:text-zinc-200"
        >
          <Plus size={16} />
        </button>
      </Tooltip>
    </div>
  );
}
