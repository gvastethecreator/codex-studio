import React from 'react';
import { Trash2, ArrowLeft, Home, Activity, Layers, Settings, Server } from 'lucide-react';
import Tooltip from './Tooltip';
import Logo from './Logo';
import { TopToolbar } from './ui/TopToolbar';
import type { StudioUsageSummary } from '../lib/studioDiagnostics';
import type { Workspace, RecipeId } from '../types';
import { UsageStatusCard } from './header/UsageStatusCard';
import { WorkspaceStrip } from './header/WorkspaceStrip';

export interface HeaderToolbarProps {
  queueResultPreviews?: Array<{
    id: string;
    src: string;
  }>;
  isGenerating: boolean;
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
  usage: StudioUsageSummary;
  activeProviderId: string;
  runtimeStatus: {
    label: string;
    tone: 'success' | 'warning' | 'danger';
  };
  queueCount: number;
  isQueueOpen: boolean;
  onToggleQueue: () => void;
  onOpenSettings: () => void;
}

const EMPTY_QUEUE_PREVIEWS: Array<{ id: string; src: string }> = [];

const RECIPE_DATA: Record<Exclude<RecipeId, null>, { name: string }> = {
  remaster: { name: 'Remaster' },
  spritesheet: { name: 'Sprite Sheet' },
  cinematic: { name: 'Cinematic' },
  character: { name: 'Character' },
  styles: { name: 'Styles' },
  camera: { name: 'Camera' },
  timeline: { name: 'Timeline' },
};

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
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
  usage,
  activeProviderId,
  runtimeStatus,
  queueResultPreviews = EMPTY_QUEUE_PREVIEWS,
  queueCount,
  isQueueOpen,
  onToggleQueue,
  onOpenSettings,
}) => {
  const activeRecipeData = activeRecipe ? RECIPE_DATA[activeRecipe] : null;
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const workspaceLabel = activeWorkspace?.name || 'Studio';
  const hasQueueResultPreviews = queueResultPreviews.length > 0;
  const runtimeToneClass =
    runtimeStatus.tone === 'success'
      ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-200'
      : runtimeStatus.tone === 'warning'
        ? 'border-amber-500/20 bg-amber-500/8 text-amber-200'
        : 'border-rose-500/20 bg-rose-500/8 text-rose-200';

  return (
    <TopToolbar className="w-full h-14 bg-black/80 backdrop-blur-sm flex items-center px-6 z-40 shrink-0 border-b border-white/5">
      <div className="w-full max-w-480 mx-auto flex items-center justify-between gap-4 relative z-50">
        <div className="flex min-w-0 items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo isGenerating={isGenerating} />
            <Tooltip content="Help & setup" position="bottom">
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-colors hover:border-accent-500/30 hover:bg-accent-500/10 hover:text-white cursor-pointer"
              >
                Help
              </button>
            </Tooltip>
            <Tooltip content="Studio activity" position="bottom">
              <button
                type="button"
                onClick={onToggleDebug}
                aria-label="Open studio activity"
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Activity size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Archived images" position="bottom">
              <button
                type="button"
                onClick={onOpenTrash}
                aria-label="Open archived images"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${trashCount > 0 ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <Trash2 size={16} />
                {trashCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 size-2 bg-red-500 rounded-full border border-black animate-pulse" />
                )}
              </button>
            </Tooltip>
          </div>

          {activeRecipeData ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <button
                  type="button"
                  onClick={() => onViewChange('studio')}
                  style={{ viewTransitionName: 'nav-studio' } as React.CSSProperties}
                  className="vt-nav-studio p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Home size={14} />
                </button>
                <span className="opacity-50">/</span>
                <button
                  type="button"
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
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => onViewChange('studio')}
                style={{ viewTransitionName: 'nav-studio' } as React.CSSProperties}
                className={`vt-nav-studio px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${currentView === 'studio' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
              >
                {workspaceLabel}
              </button>
              <button
                type="button"
                onClick={() => onViewChange('recipes')}
                style={{ viewTransitionName: 'nav-recipes' } as React.CSSProperties}
                className={`vt-nav-recipes px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${currentView === 'recipes' ? 'bg-accent-600 text-white shadow-lg' : 'text-zinc-500'}`}
              >
                Recipes
              </button>
            </div>
          )}

          <WorkspaceStrip
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            onSwitchWorkspace={onSwitchWorkspace}
            onAddWorkspace={onAddWorkspace}
            onDeleteWorkspace={onDeleteWorkspace}
            onRenameWorkspace={onRenameWorkspace}
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <UsageStatusCard usage={usage} onOpenDashboard={onOpenDashboard} />

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <Tooltip content={`Runtime status: ${runtimeStatus.label}`} position="bottom">
              <button
                type="button"
                onClick={onOpenDashboard}
                aria-label={`Open runtime status: ${runtimeStatus.label}`}
                className={`flex h-10 items-center gap-2 rounded-xl border px-3 transition-all hover:border-white/20 hover:bg-white/8 ${runtimeToneClass}`}
              >
                <Server size={15} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {runtimeStatus.label}
                </span>
              </button>
            </Tooltip>
            <Tooltip content={`Active provider: ${activeProviderId}`} position="bottom">
              <button
                type="button"
                onClick={onOpenSettings}
                aria-label={`Open provider settings for ${activeProviderId}`}
                className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-zinc-300 transition-all hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {activeProviderId}
                </span>
              </button>
            </Tooltip>
            <Tooltip content="Generation queue" position="bottom">
              <button
                type="button"
                onClick={onToggleQueue}
                aria-label="Toggle generation queue"
                className={`flex h-10 items-center gap-2 rounded-xl border px-3 transition-all ${isQueueOpen ? 'border-accent-500/30 bg-accent-500/12 text-white' : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/8 hover:text-white'}`}
              >
                <Layers size={15} />
                {hasQueueResultPreviews && (
                  <div className="flex items-center [&>*+*]:-ml-2">
                    {queueResultPreviews.slice(0, 3).map((preview) => (
                      <span
                        key={preview.id}
                        className="size-6 overflow-hidden rounded-lg border border-black/40 bg-black/40 shadow-sm"
                      >
                        <img
                          src={preview.src}
                          alt=""
                          className="size-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                    ))}
                  </div>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {queueCount}
                </span>
              </button>
            </Tooltip>
            <Tooltip content="Studio settings" position="bottom">
              <button
                type="button"
                onClick={onOpenSettings}
                aria-label="Open Studio Settings"
                className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white"
              >
                <Settings size={16} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </TopToolbar>
  );
};
