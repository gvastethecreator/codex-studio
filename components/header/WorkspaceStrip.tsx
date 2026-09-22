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
import { DemandMountedGsapDropdown } from '../ui/DemandMountedGsapDropdown';

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
      className={`vt-workspace-list gap-1 px-1 ${isCompact ? 'grid max-h-[min(70vh,26rem)] w-[min(82vw,22rem)] overflow-y-auto py-1 custom-scrollbar' : 'hidden max-w-[44vw] items-center overflow-x-auto py-0.5 no-scrollbar md:flex xl:max-w-[52vw]'}`}
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
        const workspaceButtonClassName = `studio-command-surface studio-hit-target min-h-10 ${isCompact ? 'w-full min-w-0 max-w-none' : 'min-w-[8.5rem] max-w-[11rem]'} rounded-[var(--wb-radius)] border transition-[color,background-color,border-color,opacity,transform,box-shadow] relative flex items-center gap-2 overflow-hidden px-1.5 pr-2 text-left cursor-pointer ${
          isActive
            ? 'border-accent-500/2 bg-accent-500/12 text-[color:var(--wb-ink)] shadow-[0_0_18px_rgba(var(--accent-500),0.12)]'
            : 'border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] text-[color:var(--wb-muted)] opacity-75 hover:border-[color:var(--wb-border)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)] hover:opacity-100'
        }`;

        return (
          <div
            key={workspace.id}
            className={`relative group flex shrink-0 items-center gap-1 ${isCompact ? 'w-full' : ''}`}
          >
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
                <span className="size-6 shrink-0 overflow-hidden rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)]">
                  {workspace.lastImage ? (
                    <img
                      src={workspace.lastImage}
                      className="size-full object-cover"
                      alt=""
                      width={24}
                      height={24}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span
                      className={`flex size-full items-center justify-center bg-linear-to-br ${gradientClass}`}
                    >
                      <span className="text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-ink)] drop-shadow-md">
                        {label}
                      </span>
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-[length:var(--wbp-label)] font-semibold tracking-normal">
                  {workspaceName}
                </span>
                <span
                  aria-label={`${imageCount} images`}
                  className={`shrink-0 rounded-[var(--wb-radius)] px-1.5 py-0.5 text-[length:var(--wbp-label)] font-semibold tabular-nums ${
                    isActive
                      ? 'bg-accent-400/18 text-accent-100'
                      : 'bg-[color:var(--wb-well)] text-[color:var(--wb-muted)]'
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
                className={`studio-command-surface studio-hit-target flex size-10 cursor-pointer items-center justify-center rounded-[var(--wb-radius)] border transition-[color,background-color,border-color,opacity] ${
                  contextMenuWorkspaceId === workspace.id
                    ? 'border-accent-400/2 bg-accent-500/15 text-accent-100'
                    : 'border-[color:var(--wb-line)] bg-white/[0.035] text-[color:var(--wb-muted)] opacity-75 hover:border-[color:var(--wb-border)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)] hover:opacity-100'
                }`}
              >
                <DotsVertical size={15} />
              </button>
            </Tooltip>
            {editingWorkspaceId === workspace.id && (
              <DemandMountedGsapDropdown
                open={editingWorkspaceId === workspace.id}
                onOpenChange={(open) => {
                  if (!open) setWorkspaceUi((prev) => ({ ...prev, editingWorkspaceId: null }));
                }}
                placement="bottom-right"
                role="dialog"
                aria-label="Rename workspace"
                className="absolute left-1/2 top-full z-50 mt-1.5 flex -translate-x-1/2 gap-2 rounded-[var(--wb-radius)] p-1.5"
              >
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
                  className="w-36 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-2 py-1.5 text-xs text-[color:var(--wb-ink)] outline-none focus:border-accent-500/2"
                  placeholder="Workspace name"
                />
              </DemandMountedGsapDropdown>
            )}
            {contextMenuWorkspaceId === workspace.id && (
              <DemandMountedGsapDropdown
                open={contextMenuWorkspaceId === workspace.id}
                onOpenChange={(open) => {
                  if (!open) {
                    setWorkspaceUi((prev) => ({ ...prev, contextMenuWorkspaceId: null }));
                    setContextMenuPosition(null);
                  }
                }}
                role="menu"
                aria-label={`Workspace actions for ${workspaceName}`}
                className="fixed z-50 max-h-[min(80vh,420px)] w-80 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-[var(--wb-radius)] p-2"
                style={{
                  left: contextMenuPosition?.left ?? 8,
                  top: contextMenuPosition?.top ?? 44,
                }}
              >
                <div className="border-b border-[color:var(--wb-line)] pb-2">
                  <div className="truncate text-[11px] font-semibold tracking-normal text-[color:var(--wb-ink)]">
                    {workspaceName}
                  </div>
                  <div className="mt-1 truncate text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-muted)]">
                    {workspace.id}
                  </div>
                </div>
                <div className="space-y-1 py-2 text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-ink)]">
                  <div className="flex items-start gap-2 rounded-[var(--wb-radius)] bg-white/[0.025] px-2 py-1.5">
                    <Folder size={13} className="mt-0.5 shrink-0 text-[color:var(--wb-muted)]" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold tracking-normal text-[color:var(--wb-muted)]">
                        Location
                      </div>
                      <div
                        className="truncate text-[color:var(--wb-ink)]"
                        data-tooltip={workspaceLocation}
                      >
                        {workspaceLocation}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="rounded-[var(--wb-radius)] bg-white/[0.025] px-2 py-1.5">
                      <div className="flex items-center gap-1.5 font-semibold tracking-normal text-[color:var(--wb-muted)]">
                        <Photo size={12} />
                        Images
                      </div>
                      <div className="mt-1 text-[color:var(--wb-ink)] tabular-nums">
                        {formattedImageCount}
                      </div>
                    </div>
                    <div className="rounded-[var(--wb-radius)] bg-white/[0.025] px-2 py-1.5">
                      <div className="flex items-center gap-1.5 font-semibold tracking-normal text-[color:var(--wb-muted)]">
                        <Database size={12} />
                        Storage
                      </div>
                      <div className="mt-1 truncate text-[color:var(--wb-ink)]">{storageLabel}</div>
                    </div>
                    <div className="rounded-[var(--wb-radius)] bg-white/[0.025] px-2 py-1.5">
                      <div className="flex items-center gap-1.5 font-semibold tracking-normal text-[color:var(--wb-muted)]">
                        <Clock size={12} />
                        Updated
                      </div>
                      <div className="mt-1 text-[color:var(--wb-ink)]">{updatedLabel}</div>
                    </div>
                    <div className="rounded-[var(--wb-radius)] bg-white/[0.025] px-2 py-1.5">
                      <div className="font-semibold tracking-normal text-[color:var(--wb-muted)]">
                        Created
                      </div>
                      <div className="mt-1 text-[color:var(--wb-ink)]">{createdLabel}</div>
                    </div>
                  </div>
                  <div className="rounded-[var(--wb-radius)] bg-white/[0.025] px-2 py-1.5">
                    <div className="font-semibold tracking-normal text-[color:var(--wb-muted)]">
                      Libraries
                    </div>
                    <div
                      className="mt-1 truncate text-[color:var(--wb-ink)]"
                      data-tooltip={workspace.libraryIds?.join(', ')}
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
                  className="flex w-full items-center gap-2 rounded-[var(--wb-radius)] px-2 py-1.5 text-left text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-danger)] transition-colors hover:bg-red-500/10 hover:text-[color:var(--wb-danger)] disabled:cursor-not-allowed disabled:text-[color:var(--wb-danger)] disabled:hover:bg-transparent"
                >
                  <Trash2 size={13} />
                  <span>{canDeleteWorkspace ? 'Delete workspace' : 'Default locked'}</span>
                </button>
              </DemandMountedGsapDropdown>
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
          className={`studio-command-surface studio-hit-target flex size-10 cursor-pointer items-center justify-center rounded-[var(--wb-radius)] border border-dashed border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] text-[color:var(--wb-dim)] transition-[color,background-color,border-color,opacity,transform] hover:bg-accent-500/20 hover:text-[color:var(--wb-ink)] ${isCompact ? 'w-full' : ''}`}
        >
          <Plus size={16} />
        </button>
      </Tooltip>
    </div>
  );
}
