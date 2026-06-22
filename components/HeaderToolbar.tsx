import React from 'react';
import {
  Trash2,
  ArrowLeft,
  CircleHelp,
  Home,
  Activity,
  Briefcase,
  Layers,
  MessageSquare,
  Settings,
  Server,
} from 'lucide-react';
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
  onOpenChat: () => void;
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

const HeaderToolbarFn: React.FC<HeaderToolbarProps> = ({
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
  onOpenChat,
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
  const [isMobileWorkspaceOpen, setIsMobileWorkspaceOpen] = React.useState(false);
  const mobileWorkspaceRef = React.useRef<HTMLDivElement>(null);
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

  React.useEffect(() => {
    if (!isMobileWorkspaceOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        mobileWorkspaceRef.current &&
        !mobileWorkspaceRef.current.contains(event.target as Node)
      ) {
        setIsMobileWorkspaceOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMobileWorkspaceOpen]);

  return (
    <TopToolbar className="w-full min-h-14 bg-black/80 backdrop-blur-sm flex items-center px-3 py-2 sm:px-6 sm:py-0 z-40 shrink-0 border-b border-white/5">
      <div className="w-full max-w-480 mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4 relative z-50">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:gap-6">
          <div className="flex shrink-0 items-center gap-2">
            <Logo isGenerating={isGenerating} />
            <div ref={mobileWorkspaceRef} className="relative sm:hidden">
              <Tooltip content="Workspaces" position="bottom">
                <button
                  type="button"
                  onClick={() => setIsMobileWorkspaceOpen((isOpen) => !isOpen)}
                  aria-label={`Open workspace switcher: ${workspaceLabel}`}
                  aria-expanded={isMobileWorkspaceOpen}
                  className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white"
                >
                  <Briefcase size={16} />
                </button>
              </Tooltip>
              {isMobileWorkspaceOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-md">
                  <WorkspaceStrip
                    layout="compact"
                    workspaces={workspaces}
                    activeWorkspaceId={activeWorkspaceId}
                    onSwitchWorkspace={(id) => {
                      onSwitchWorkspace(id);
                      setIsMobileWorkspaceOpen(false);
                    }}
                    onAddWorkspace={() => {
                      onAddWorkspace();
                      setIsMobileWorkspaceOpen(false);
                    }}
                    onDeleteWorkspace={onDeleteWorkspace}
                    onRenameWorkspace={onRenameWorkspace}
                  />
                </div>
              )}
            </div>
          </div>

          {activeRecipeData ? (
            <div className="order-3 flex basis-full items-center gap-4 sm:order-none sm:basis-auto">
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
            <div className="order-3 flex basis-full items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-1 sm:order-none sm:basis-auto">
              <button
                type="button"
                onClick={() => onViewChange('studio')}
                style={{ viewTransitionName: 'nav-studio' } as React.CSSProperties}
                className={`vt-nav-studio px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-[color,background-color,border-color,opacity,transform,box-shadow] cursor-pointer ${currentView === 'studio' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
              >
                {workspaceLabel}
              </button>
              <button
                type="button"
                onClick={() => onViewChange('recipes')}
                style={{ viewTransitionName: 'nav-recipes' } as React.CSSProperties}
                className={`vt-nav-recipes px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-[color,background-color,border-color,opacity,transform,box-shadow] cursor-pointer ${currentView === 'recipes' ? 'bg-accent-600 text-white shadow-lg' : 'text-zinc-500'}`}
              >
                Recipes
              </button>
            </div>
          )}

          <div className="hidden min-w-0 md:block">
            <WorkspaceStrip
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              onSwitchWorkspace={onSwitchWorkspace}
              onAddWorkspace={onAddWorkspace}
              onDeleteWorkspace={onDeleteWorkspace}
              onRenameWorkspace={onRenameWorkspace}
            />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <UsageStatusCard usage={usage} onOpenDashboard={onOpenDashboard} />

          <div className="flex shrink-0 items-center gap-2">
            <Tooltip content={`Runtime status: ${runtimeStatus.label}`} position="bottom">
              <button
                type="button"
                onClick={onOpenDashboard}
                aria-label={`Open runtime status: ${runtimeStatus.label}`}
                className={`flex size-10 items-center justify-center gap-2 rounded-xl border transition-[color,background-color,border-color,opacity,transform] hover:border-white/20 hover:bg-white/8 xl:w-auto xl:px-3 ${runtimeToneClass}`}
              >
                <Server size={15} />
                <span className="hidden text-[10px] font-black uppercase tracking-widest xl:inline">
                  {runtimeStatus.label}
                </span>
              </button>
            </Tooltip>
            <Tooltip content={`Active provider: ${activeProviderId}`} position="bottom">
              <button
                type="button"
                onClick={onOpenSettings}
                aria-label={`Open provider settings for ${activeProviderId}`}
                className="hidden h-10 max-w-28 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white lg:flex"
              >
                <span className="truncate text-[10px] font-black uppercase tracking-widest">
                  {activeProviderId}
                </span>
              </button>
            </Tooltip>
            <Tooltip content="Generation queue" position="bottom">
              <button
                type="button"
                onClick={onToggleQueue}
                aria-label="Toggle generation queue"
                className={`flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl border px-2 transition-[color,background-color,border-color,opacity,transform] xl:px-3 ${isQueueOpen ? 'border-accent-500/30 bg-accent-500/12 text-white' : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/8 hover:text-white'}`}
              >
                <Layers size={15} />
                {hasQueueResultPreviews && (
                  <div className="hidden items-center sm:flex [&>*+*]:-ml-2">
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
                <span className="text-[10px] font-black tabular-nums uppercase tracking-widest">
                  {queueCount}
                </span>
              </button>
            </Tooltip>
            <Tooltip content="Help & setup" position="bottom">
              <button
                type="button"
                onClick={onOpenOnboarding}
                aria-label="Open help and setup"
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white"
              >
                <CircleHelp size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Studio activity" position="bottom">
              <button
                type="button"
                onClick={onToggleDebug}
                aria-label="Open studio activity"
                className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white"
              >
                <Activity size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Archived images" position="bottom">
              <button
                type="button"
                onClick={onOpenTrash}
                aria-label="Open archived images"
                className={`relative flex size-10 items-center justify-center rounded-xl border transition-[color,background-color,border-color,opacity,transform] ${trashCount > 0 ? 'border-red-500/20 bg-red-500/10 text-red-300 hover:border-red-400/30 hover:bg-red-500/15 hover:text-red-200' : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/8 hover:text-white'}`}
              >
                <Trash2 size={16} />
                {trashCount > 0 && (
                  <span className="absolute right-2 top-2 size-2 rounded-full border border-black bg-red-500 animate-pulse" />
                )}
              </button>
            </Tooltip>
            <Tooltip content="Codex chat" position="bottom">
              <button
                type="button"
                onClick={onOpenChat}
                aria-label="Open Codex chat"
                className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white"
              >
                <MessageSquare size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Studio settings" position="bottom">
              <button
                type="button"
                onClick={onOpenSettings}
                aria-label="Open Studio Settings"
                className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white"
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

export const HeaderToolbar = React.memo(HeaderToolbarFn);
