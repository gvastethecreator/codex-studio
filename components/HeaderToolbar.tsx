import React from 'react';
import { Trash2, ArrowLeft, Home, Activity } from 'lucide-react';
import Tooltip from './Tooltip';
import Logo from './Logo';
import { TopToolbar } from './ui/TopToolbar';
import type { Workspace, RecipeId } from '../types';
import type { CodexAccountStatusResponse } from '../packages/shared/src';
import { UsageStatusCard } from './header/UsageStatusCard';
import { WorkspaceStrip } from './header/WorkspaceStrip';

interface HeaderToolbarProps {
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
  codexAccountStatus: CodexAccountStatusResponse | null;
  isUsageLoading: boolean;
  isBackendConnected: boolean;
}

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
  codexAccountStatus,
  isUsageLoading,
  isBackendConnected,
}) => {
  const activeRecipeData = activeRecipe ? RECIPE_DATA[activeRecipe] : null;

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

          <WorkspaceStrip
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            onSwitchWorkspace={onSwitchWorkspace}
            onAddWorkspace={onAddWorkspace}
            onDeleteWorkspace={onDeleteWorkspace}
            onRenameWorkspace={onRenameWorkspace}
          />

          <UsageStatusCard
            codexAccountStatus={codexAccountStatus}
            isUsageLoading={isUsageLoading}
            isBackendConnected={isBackendConnected}
            onOpenDashboard={onOpenDashboard}
          />
        </div>
      </div>
    </TopToolbar>
  );
};
