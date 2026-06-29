import React from 'react';
import {
  IconClock as Clock,
  IconDatabase as Database,
  IconDotsVertical as DotsVertical,
  IconFolder as Folder,
  IconPhoto as Photo,
  IconPlus as Plus,
  IconTrash as Trash2,
} from '@tabler/icons-react';
import { isDefaultWorkspace } from '../../lib/workspaceLifecycle';
import type { Workspace } from '../../types';
import Tooltip from '../Tooltip';

interface WorkspaceStripWorkspace extends Workspace {
  lastImage?: string;
  imageCount?: number;
  totalFileSizeBytes?: number;
  knownFileSizeCount?: number;
  libraryIds?: string[];
  locationPath?: string;
  firstImageCreatedAt?: string;
  latestImageCreatedAt?: string;
}

interface WorkspaceStripProps {
  workspaces: WorkspaceStripWorkspace[];
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

const getWorkspaceDisplayName = (workspace: Workspace, label: string) =>
  workspace.name || `Workspace ${label}`;

const formatWorkspaceImageCount = (count: number | undefined) => {
  return (count ?? 0).toLocaleString();
};

const formatWorkspaceStorage = (
  totalFileSizeBytes: number | undefined,
  knownFileSizeCount: number | undefined,
) => {
  if (!knownFileSizeCount) return 'Unknown';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = totalFileSizeBytes ?? 0;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
};

const formatWorkspaceDate = (value: string | number | undefined) => {
  if (!value) return 'None';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getWorkspaceLocationLabel = (filePath: string | undefined) => {
  if (!filePath) return 'No catalog files yet';

  const normalized = filePath.replaceAll('\\', '/');
  const lastSeparatorIndex = normalized.lastIndexOf('/');
  return lastSeparatorIndex > 0 ? normalized.slice(0, lastSeparatorIndex) : normalized;
};

const formatWorkspaceLibraries = (libraryIds: string[] | undefined) => {
  const count = libraryIds?.length ?? 0;
  if (count === 0) return 'None';
  if (count === 1) return libraryIds?.[0] ?? 'Unknown';
  return `${count} libraries`;
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
  const [contextMenuPosition, setContextMenuPosition] = React.useState<{
    left: number;
    top: number;
  } | null>(null);
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
        setContextMenuPosition(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setWorkspaceUi({ editingWorkspaceId: null, contextMenuWorkspaceId: null });
        setContextMenuPosition(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenuWorkspaceId, editingWorkspaceId]);

  const openContextMenu = React.useCallback(
    (workspaceId: string, anchor: HTMLElement | { clientX: number; clientY: number }) => {
      const menuWidth = 320;
      const margin = 8;
      const viewportWidth = typeof window === 'undefined' ? 1280 : window.innerWidth;
      const rawPosition =
        'getBoundingClientRect' in anchor
          ? (() => {
              const rect = anchor.getBoundingClientRect();
              return { left: rect.left, top: rect.bottom + 6 };
            })()
          : { left: anchor.clientX, top: anchor.clientY };

      setWorkspaceUi({ editingWorkspaceId: null, contextMenuWorkspaceId: workspaceId });
      setContextMenuPosition({
        left: Math.max(margin, Math.min(rawPosition.left, viewportWidth - menuWidth - margin)),
        top: Math.max(margin, rawPosition.top),
      });
    },
    [],
  );

  const handleRenameSubmit = (id: string) => {
    if (editingName.trim()) {
      onRenameWorkspace(id, editingName.trim());
    }
    setWorkspaceUi((prev) => ({ ...prev, editingWorkspaceId: null }));
  };

  return (
    <div
      ref={workspacesContainerRef}
      className={`vt-workspace-list items-center gap-1 px-1 ${isCompact ? 'flex max-w-[min(82vw,360px)] overflow-x-auto py-1 no-scrollbar' : 'hidden max-w-[44vw] overflow-x-auto py-0.5 no-scrollbar md:flex xl:max-w-[52vw]'}`}
    >
      {workspaces.map((workspace, index) => {
        const label = getWorkspaceLabel(workspace, index);
        const gradientClass = getWorkspaceGradient(index);
        const isActive = activeWorkspaceId === workspace.id;
        const workspaceName = getWorkspaceDisplayName(workspace, label);
        const imageCount = workspace.imageCount ?? 0;
        const formattedImageCount = formatWorkspaceImageCount(imageCount);
        const canDeleteWorkspace = workspaces.length > 1 && !isDefaultWorkspace(workspace.id);
        const workspaceLocation = getWorkspaceLocationLabel(workspace.locationPath);
        const storageLabel = formatWorkspaceStorage(
          workspace.totalFileSizeBytes,
          workspace.knownFileSizeCount,
        );
        const librariesLabel = formatWorkspaceLibraries(workspace.libraryIds);
        const updatedLabel = formatWorkspaceDate(
          workspace.latestImageCreatedAt ?? workspace.createdAt,
        );
        const createdLabel = formatWorkspaceDate(
          workspace.firstImageCreatedAt ?? workspace.createdAt,
        );
        const tooltipContent = `${workspaceName} - ${formattedImageCount} images - updated ${updatedLabel}`;
        const workspaceButtonClassName = `studio-hit-target h-8 min-w-[8.5rem] max-w-[11rem] rounded-lg border transition-[color,background-color,border-color,opacity,transform,box-shadow] relative flex items-center gap-2 overflow-hidden px-1.5 pr-2 text-left cursor-pointer ${
          isActive
            ? 'border-accent-500/55 bg-accent-500/12 text-white shadow-[0_0_18px_rgba(var(--accent-500),0.12)]'
            : 'border-white/10 bg-white/[0.04] text-zinc-400 opacity-75 hover:border-white/20 hover:bg-white/8 hover:text-zinc-100 hover:opacity-100'
        }`;

        return (
          <div key={workspace.id} className="relative group flex shrink-0 items-center gap-1">
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
                    setContextMenuPosition(null);
                    setEditingName(workspaceName);
                  } else {
                    setWorkspaceUi({
                      editingWorkspaceId: null,
                      contextMenuWorkspaceId: null,
                    });
                    setContextMenuPosition(null);
                    onSwitchWorkspace(workspace.id);
                  }
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  openContextMenu(workspace.id, {
                    clientX: event.clientX,
                    clientY: event.clientY,
                  });
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
                    event.preventDefault();
                    openContextMenu(workspace.id, event.currentTarget);
                  }
                }}
                className={workspaceButtonClassName}
              >
                <span className="size-6 shrink-0 overflow-hidden rounded-md border border-white/10 bg-zinc-900">
                  {workspace.lastImage ? (
                    <img
                      src={workspace.lastImage}
                      className="size-full object-cover"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span
                      className={`flex size-full items-center justify-center bg-linear-to-br ${gradientClass}`}
                    >
                      <span className="text-[9px] font-black text-white drop-shadow-md">
                        {label}
                      </span>
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-[10px] font-black uppercase tracking-widest">
                  {workspaceName}
                </span>
                <span
                  aria-label={`${imageCount} images`}
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-black tabular-nums ${
                    isActive ? 'bg-accent-400/18 text-accent-100' : 'bg-black/30 text-zinc-500'
                  }`}
                >
                  {formattedImageCount}
                </span>
              </button>
            </Tooltip>
            <Tooltip
              content="Workspace menu"
              contentClassName={contextMenuWorkspaceId === workspace.id ? 'hidden' : ''}
              position="bottom"
            >
              <button
                type="button"
                aria-label={`Open workspace menu for ${workspaceName}`}
                aria-expanded={contextMenuWorkspaceId === workspace.id ? true : undefined}
                aria-haspopup="menu"
                onClick={(event) => {
                  event.stopPropagation();
                  if (contextMenuWorkspaceId === workspace.id) {
                    setWorkspaceUi({ editingWorkspaceId: null, contextMenuWorkspaceId: null });
                    setContextMenuPosition(null);
                    return;
                  }
                  openContextMenu(workspace.id, event.currentTarget);
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  openContextMenu(workspace.id, {
                    clientX: event.clientX,
                    clientY: event.clientY,
                  });
                }}
                className={`studio-hit-target flex size-8 cursor-pointer items-center justify-center rounded-lg border transition-[color,background-color,border-color,opacity] ${
                  contextMenuWorkspaceId === workspace.id
                    ? 'border-accent-400/40 bg-accent-500/15 text-accent-100'
                    : 'border-white/10 bg-white/[0.035] text-zinc-500 opacity-75 hover:border-white/20 hover:bg-white/8 hover:text-zinc-200 hover:opacity-100'
                }`}
              >
                <DotsVertical size={15} />
              </button>
            </Tooltip>
            {editingWorkspaceId === workspace.id && (
              <div className="absolute left-1/2 top-full z-50 mt-1.5 flex -translate-x-1/2 gap-2 rounded-lg border border-white/10 bg-zinc-900 p-1.5 shadow-xl animate-in fade-in zoom-in duration-200">
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
                  className="w-36 rounded-lg border border-white/10 bg-black/50 px-2 py-1.5 text-xs text-white outline-none focus:border-accent-500"
                  placeholder="Workspace name"
                />
              </div>
            )}
            {contextMenuWorkspaceId === workspace.id && (
              <div
                role="menu"
                aria-label={`Workspace actions for ${workspaceName}`}
                className="fixed z-50 max-h-[min(80vh,420px)] w-80 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-lg border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-150"
                style={{
                  left: contextMenuPosition?.left ?? 8,
                  top: contextMenuPosition?.top ?? 44,
                }}
              >
                <div className="border-b border-white/10 pb-2">
                  <div className="truncate text-[11px] font-black uppercase tracking-widest text-zinc-100">
                    {workspaceName}
                  </div>
                  <div className="mt-1 truncate text-[10px] font-semibold text-zinc-500">
                    {workspace.id}
                  </div>
                </div>
                <div className="space-y-1 py-2 text-[10px] font-semibold text-zinc-300">
                  <div className="flex items-start gap-2 rounded-md bg-white/[0.025] px-2 py-1.5">
                    <Folder size={13} className="mt-0.5 shrink-0 text-zinc-500" />
                    <div className="min-w-0 flex-1">
                      <div className="font-black uppercase tracking-widest text-zinc-500">
                        Location
                      </div>
                      <div className="truncate text-zinc-200" title={workspaceLocation}>
                        {workspaceLocation}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="rounded-md bg-white/[0.025] px-2 py-1.5">
                      <div className="flex items-center gap-1.5 font-black uppercase tracking-widest text-zinc-500">
                        <Photo size={12} />
                        Images
                      </div>
                      <div className="mt-1 text-zinc-100 tabular-nums">{formattedImageCount}</div>
                    </div>
                    <div className="rounded-md bg-white/[0.025] px-2 py-1.5">
                      <div className="flex items-center gap-1.5 font-black uppercase tracking-widest text-zinc-500">
                        <Database size={12} />
                        Storage
                      </div>
                      <div className="mt-1 truncate text-zinc-100">{storageLabel}</div>
                    </div>
                    <div className="rounded-md bg-white/[0.025] px-2 py-1.5">
                      <div className="flex items-center gap-1.5 font-black uppercase tracking-widest text-zinc-500">
                        <Clock size={12} />
                        Updated
                      </div>
                      <div className="mt-1 text-zinc-100">{updatedLabel}</div>
                    </div>
                    <div className="rounded-md bg-white/[0.025] px-2 py-1.5">
                      <div className="font-black uppercase tracking-widest text-zinc-500">
                        Created
                      </div>
                      <div className="mt-1 text-zinc-100">{createdLabel}</div>
                    </div>
                  </div>
                  <div className="rounded-md bg-white/[0.025] px-2 py-1.5">
                    <div className="font-black uppercase tracking-widest text-zinc-500">
                      Libraries
                    </div>
                    <div
                      className="mt-1 truncate text-zinc-100"
                      title={workspace.libraryIds?.join(', ')}
                    >
                      {librariesLabel}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  disabled={!canDeleteWorkspace}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!canDeleteWorkspace) return;
                    setWorkspaceUi((prev) => ({ ...prev, contextMenuWorkspaceId: null }));
                    setContextMenuPosition(null);
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
            setContextMenuPosition(null);
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
