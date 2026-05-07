import React from 'react';
import { Trash2, X, Plus, ArrowLeft, Home, Activity, Coins, WifiOff } from 'lucide-react';
import Tooltip from './Tooltip';
import Logo from './Logo';
import { TopToolbar } from './ui/TopToolbar';
import type { Workspace, RecipeId } from '../types';
import type { CodexAccountStatusResponse } from '../packages/shared/src';

interface HeaderToolbarProps {
  imageCount: number;
  selectedImageCount: number;
  isGenerating: boolean;
  isToolbarVisible: boolean;
  onToggleToolbar: () => void;
  workspaces: (Workspace & { imageCount?: number })[];
  activeWorkspaceId: string;
  onSwitchWorkspace: (id: string) => void;
  onAddWorkspace: () => void;
  onDeleteWorkspace: (id: string) => void;
  onRenameWorkspace: (id: string, name: string) => void;
  currentView: 'studio' | 'recipes';
  onViewChange: (view: 'studio' | 'recipes') => void;
  activeRecipe: RecipeId | null;
  onCloseRecipe: () => void;
  onOpenDashboard: () => void;
  onOpenOnboarding: () => void;
  onOpenTrash: () => void;
  trashCount: number;
  onToggleDebug: () => void;
  codexAccountStatus: CodexAccountStatusResponse | null;
  isUsageLoading: boolean;
  isBackendConnected: boolean;
}

// Predefined compatible gradient pairs
const WORKSPACE_GRADIENTS = [
  'from-rose-500/50 to-orange-500/50', // 0
  'from-violet-600/50 to-indigo-600/50', // 1
  'from-cyan-500/50 to-blue-600/50', // 2
  'from-emerald-500/50 to-teal-600/50', // 3
  'from-fuchsia-600/50 to-purple-600/50', // 4
  'from-amber-500/50 to-orange-600/50', // 5
  'from-blue-500 to-indigo-500/50', // 6
  'from-pink-500/50 to-rose-500/50', // 7
  'from-lime-500/50 to-green-600/50', // 8
  'from-sky-500/50 to-cyan-500/50', // 9
];

const RECIPE_DATA: Record<Exclude<RecipeId, null>, { name: string }> = {
  remaster: { name: 'Remaster' },
  spritesheet: { name: 'Sprite Sheet' },
  cinematic: { name: 'Cinematic' },
  character: { name: 'Character' },
  styles: { name: 'Styles' },
  camera: { name: 'Camera' },
  timeline: { name: 'Timeline' },
};

const getWorkspaceGradient = (index: number) => {
  const stride = 3;
  const safeIndex = (index * stride) % WORKSPACE_GRADIENTS.length;
  return WORKSPACE_GRADIENTS[safeIndex];
};

const getWorkspaceLabel = (ws: Workspace, index: number) => {
  if (ws.name) return ws.name.slice(0, 2).toUpperCase();
  const letterIndex = index % 26;
  return String.fromCharCode(65 + letterIndex);
};

const formatCodexPlan = (planType: string | null | undefined) => {
  if (!planType) return 'Account';

  return planType
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  imageCount,
  selectedImageCount,
  isGenerating,
  workspaces,
  activeWorkspaceId,
  onSwitchWorkspace,
  onAddWorkspace,
  onDeleteWorkspace,
  onRenameWorkspace,
  currentView,
  onViewChange,
  activeRecipe,
  onCloseRecipe,
  onOpenOnboarding,
  onOpenDashboard,
  onOpenTrash,
  trashCount,
  onToggleDebug,
  codexAccountStatus,
  isUsageLoading,
  isBackendConnected,
}) => {
  const isAllSelected = imageCount > 0 && selectedImageCount === imageCount;
  const activeRecipeData = activeRecipe ? RECIPE_DATA[activeRecipe] : null;

  const [editingWorkspaceId, setEditingWorkspaceId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState('');
  const workspacesContainerRef = React.useRef<HTMLDivElement>(null);
  const usageValue = !isBackendConnected
    ? 'Offline'
    : isUsageLoading
      ? 'Syncing...'
      : codexAccountStatus?.usage?.display ?? 'Unavailable';
  const usageMeta = !isBackendConnected
    ? 'Local backend unreachable'
    : codexAccountStatus?.planType
      ? formatCodexPlan(codexAccountStatus.planType)
      : codexAccountStatus?.authMode === 'apikey'
        ? 'API Key'
        : 'Codex Account';
  const usageToneClasses = !isBackendConnected
    ? 'border-rose-500/20 bg-rose-500/8 text-rose-200'
    : codexAccountStatus?.usage?.display
      ? 'border-accent-500/20 bg-accent-500/8 text-white'
      : 'border-white/10 bg-white/5 text-zinc-200';

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
    <TopToolbar className="w-full h-14 bg-black/80 backdrop-blur-sm flex items-center px-6 z-40 shrink-0 border-b border-white/5">
      <div className="w-full max-w-480 mx-auto flex items-center justify-between gap-4 relative z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo isGenerating={isGenerating} />
            <Tooltip content="Help" position="bottom">
              <button
                onClick={onOpenOnboarding}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-colors hover:border-accent-500/30 hover:bg-accent-500/10 hover:text-white cursor-pointer"
              >
                Help
              </button>
            </Tooltip>
            <Tooltip content="Session Activity" position="bottom">
              <button
                onClick={onToggleDebug}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Activity size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Recycle Bin" position="bottom">
              <button
                onClick={onOpenTrash}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${trashCount > 0 ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <Trash2 size={16} />
                {trashCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-black animate-pulse" />
                )}
              </button>
            </Tooltip>
          </div>

          {activeRecipeData ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <button
                  onClick={() => onViewChange('studio')}
                  style={{ viewTransitionName: 'nav-studio' } as React.CSSProperties}
                  className="vt-nav-studio p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Home size={14} />
                </button>
                <span className="opacity-50">/</span>
                <button
                  onClick={onCloseRecipe}
                  style={{ viewTransitionName: 'nav-recipes' } as React.CSSProperties}
                  className="vt-nav-recipes flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors group cursor-pointer"
                >
                  <ArrowLeft
                    size={14}
                    className="group-hover:-translate-x-0.5 transition-transform"
                  />
                  <span>Recipes</span>
                </button>
                <span className="opacity-50">/</span>
                <span className="text-white">{activeRecipeData.name}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/5">
              <button
                onClick={() => onViewChange('studio')}
                style={{ viewTransitionName: 'nav-studio' } as React.CSSProperties}
                className={`vt-nav-studio px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${currentView === 'studio' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
              >
                Studio
              </button>
              <button
                onClick={() => onViewChange('recipes')}
                style={{ viewTransitionName: 'nav-recipes' } as React.CSSProperties}
                className={`vt-nav-recipes px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${currentView === 'recipes' ? 'bg-accent-600 text-white shadow-lg' : 'text-zinc-500'}`}
              >
                Recipes
              </button>
            </div>
          )}

          {/* Workspaces */}
          <div
            ref={workspacesContainerRef}
            className="vt-workspace-list hidden md:flex items-center gap-2 px-2"
          >
            {workspaces.map((ws, index) => {
              const label = getWorkspaceLabel(ws, index);
              const gradientClass = getWorkspaceGradient(index);
              const isActive = activeWorkspaceId === ws.id;

              return (
                <div key={ws.id} className="relative group shrink-0">
                  <Tooltip
                    content={`Workspace ${ws.name || label}: ${new Date(ws.createdAt).toLocaleDateString()}`}
                    position="bottom"
                  >
                    <button
                      onClick={() => {
                        if (isActive) {
                          setEditingWorkspaceId(ws.id);
                          setEditingName(ws.name || `Workspace ${label}`);
                        } else {
                          onSwitchWorkspace(ws.id);
                        }
                      }}
                      className={`
                                        w-9 h-9 rounded-xl border-2 transition-all overflow-hidden relative flex items-center justify-center cursor-pointer
                                        ${isActive ? 'border-accent-500 shadow-lg scale-105' : 'border-white/10 opacity-60 hover:opacity-100'}
                                    `}
                    >
                      {ws.lastImage ? (
                        <img src={ws.lastImage} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div
                          className={`w-full h-full bg-linear-to-br ${gradientClass} flex items-center justify-center`}
                        >
                          <span className="text-[10px] font-black text-white drop-shadow-md">
                            {label}
                          </span>
                        </div>
                      )}
                    </button>
                  </Tooltip>
                  {editingWorkspaceId === ws.id && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 p-2 rounded-xl shadow-xl z-50 flex gap-2 animate-in fade-in zoom-in duration-200">
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit(ws.id);
                          if (e.key === 'Escape') setEditingWorkspaceId(null);
                        }}
                        className="bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-accent-500 w-40"
                        placeholder="Workspace Name"
                      />
                    </div>
                  )}
                  {workspaces.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWorkspace(ws.id);
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

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <Tooltip
              content={
                codexAccountStatus?.error && isBackendConnected
                  ? `Usage unavailable: ${codexAccountStatus.error}`
                  : `Available usage for ${usageMeta}`
              }
              position="bottom"
            >
              <button
                onClick={onOpenDashboard}
                className={`flex min-w-45 items-center gap-3 rounded-2xl border px-3.5 py-2 text-left transition-all hover:border-accent-400/30 hover:bg-white/8 ${usageToneClasses}`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/20 text-inherit">
                  {!isBackendConnected ? <WifiOff size={16} /> : <Coins size={16} />}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.24em] text-zinc-400">
                    Usage Available
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="truncate text-sm font-black text-white">{usageValue}</span>
                    {!isUsageLoading && codexAccountStatus?.usage?.unit === 'credits' && (
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        credits
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[10px] uppercase tracking-widest text-zinc-400">
                    {usageMeta}
                  </p>
                </div>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </TopToolbar>
  );
};
