import React from 'react';
import {
  IconTrash as Trash2,
  IconArrowLeft as ArrowLeft,
  IconHelpCircle as CircleHelp,
  IconHome as Home,
  IconActivity as Activity,
  IconBriefcase as Briefcase,
  IconLayoutSidebarRight as SidebarRight,
  IconMenu2 as Menu2,
  IconMessage as MessageSquare,
  IconSettings as Settings,
  IconServer as Server,
} from '@tabler/icons-react';
import Tooltip from './Tooltip';
import Logo from './Logo';
import { TopToolbar } from './ui/TopToolbar';
import { GsapDropdown } from './ui/GsapDropdown';
import { resolveRecipeAlias, type RecipeAliasId } from '../lib/recipeAliases';
import type { StudioUsageSummary } from '../lib/studioDiagnostics';
import type { Workspace, RecipeId } from '../types';
import { UsageStatusCard } from './header/UsageStatusCard';
import { WorkspaceStrip } from './header/WorkspaceStrip';
import type { StudioCommandCenterProjection } from '../lib/commandCenterProjection';
import { getRecipeModule } from '../lib/recipeModules';

export interface HeaderToolbarProps {
  isGenerating: boolean;
  workspaces: (Workspace & { imageCount?: number })[];
  activeWorkspaceId: string;
  onSwitchWorkspace: (id: string) => void;
  onAddWorkspace: () => void;
  onDeleteWorkspace: (id: string) => void;
  onRenameWorkspace: (id: string, name: string) => void;
  routeView: 'studio' | 'recipes' | 'recipe';
  currentView: 'studio' | 'recipes';
  onViewChange: (view: 'studio' | 'recipes') => void;
  activeRecipe: RecipeId | null;
  activeRecipeAliasId?: RecipeAliasId | null;
  onCloseRecipe: () => void;
  onOpenDashboard: () => void;
  onOpenOnboarding: () => void;
  onOpenChat: () => void;
  onOpenTrash: () => void;
  trashCount: number;
  onToggleDebug: () => void;
  usage: StudioUsageSummary;
  commandCenter: StudioCommandCenterProjection;
  isQueueOpen: boolean;
  onToggleQueue: () => void;
  onOpenSettings: () => void;
  generationStartTime: number | null;
}

const EMPTY_QUEUE_PREVIEWS: StudioCommandCenterProjection['queue']['resultPreviews'] = [];

const HeaderToolbarFn: React.FC<HeaderToolbarProps> = ({
  isGenerating,
  workspaces,
  activeWorkspaceId,
  onSwitchWorkspace,
  onAddWorkspace,
  onDeleteWorkspace,
  onRenameWorkspace,
  routeView,
  currentView,
  onViewChange,
  activeRecipe,
  activeRecipeAliasId = null,
  onCloseRecipe,
  onOpenOnboarding,
  onOpenChat,
  onOpenDashboard,
  onOpenTrash,
  trashCount,
  onToggleDebug,
  usage,
  commandCenter,
  isQueueOpen,
  onToggleQueue,
  onOpenSettings,
  generationStartTime,
}) => {
  const [isMobileWorkspaceOpen, setIsMobileWorkspaceOpen] = React.useState(false);
  const [isMobileCommandOpen, setIsMobileCommandOpen] = React.useState(false);
  const [queueProgressTick, setQueueProgressTick] = React.useState(0);
  const mobileWorkspaceRef = React.useRef<HTMLDivElement>(null);
  const mobileWorkspaceButtonRef = React.useRef<HTMLButtonElement>(null);
  const mobileCommandRef = React.useRef<HTMLDivElement>(null);
  const mobileCommandButtonRef = React.useRef<HTMLButtonElement>(null);
  const activeRecipeAlias = resolveRecipeAlias(activeRecipeAliasId);
  const activeRecipeData = activeRecipe
    ? { name: activeRecipeAlias?.title ?? getRecipeModule(activeRecipe)?.title ?? activeRecipe }
    : null;
  const isRecipeView = routeView === 'recipe' && Boolean(activeRecipeData);
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const workspaceLabel = activeWorkspace?.name || 'Studio';
  const runtimeStatus = commandCenter.runtimeStatus;
  const activeProvider = commandCenter.provider;
  const queueResultPreviews = commandCenter.queue.resultPreviews ?? EMPTY_QUEUE_PREVIEWS;
  const queueCount = commandCenter.queue.count;
  const hasQueueResultPreviews = commandCenter.queue.hasResultPreviews;
  const showCollapsedQueueProgress = commandCenter.queue.showCollapsedProgress;
  const providerToolbarLabel = commandCenter.compactMode
    ? activeProvider.id.slice(0, 3)
    : activeProvider.id;
  const queueProgressPercent = (() => {
    if (!showCollapsedQueueProgress) return 0;
    void queueProgressTick;
    if (!generationStartTime) return 18;
    return Math.min(Math.max(((Date.now() - generationStartTime) / 120_000) * 100, 6), 100);
  })();
  const runtimeToneClass =
    runtimeStatus.tone === 'success'
      ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-200'
      : runtimeStatus.tone === 'warning'
        ? 'border-amber-500/20 bg-amber-500/8 text-amber-200'
        : 'border-rose-500/20 bg-rose-500/8 text-rose-200';

  React.useEffect(() => {
    if (!showCollapsedQueueProgress) return;

    const interval = window.setInterval(() => setQueueProgressTick((tick) => tick + 1), 250);
    return () => window.clearInterval(interval);
  }, [showCollapsedQueueProgress]);

  React.useEffect(() => {
    if (!isMobileWorkspaceOpen && !isMobileCommandOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        mobileWorkspaceRef.current &&
        !mobileWorkspaceRef.current.contains(event.target as Node) &&
        isMobileWorkspaceOpen
      ) {
        setIsMobileWorkspaceOpen(false);
      }
      if (
        mobileCommandRef.current &&
        !mobileCommandRef.current.contains(event.target as Node) &&
        isMobileCommandOpen
      ) {
        setIsMobileCommandOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMobileCommandOpen, isMobileWorkspaceOpen]);

  const runMobileCommand = React.useCallback((action: () => void) => {
    setIsMobileCommandOpen(false);
    action();
  }, []);

  return (
    <TopToolbar className="studio-toolbar-shell w-full min-h-10 bg-black/80 flex items-center px-2 py-1 z-40 shrink-0 border-b border-white/5">
      <div className="w-full flex flex-nowrap items-center justify-between gap-1 sm:gap-2 relative z-50">
        <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 sm:gap-1.5 lg:gap-2">
          <div className="flex shrink-0 items-center gap-1.5">
            <Logo isGenerating={isGenerating} />
            <div
              ref={mobileWorkspaceRef}
              className={`relative ${isRecipeView ? 'hidden sm:block' : 'sm:hidden'}`}
            >
              <Tooltip content="Workspaces" position="bottom">
                <button
                  ref={mobileWorkspaceButtonRef}
                  type="button"
                  onClick={() => setIsMobileWorkspaceOpen((isOpen) => !isOpen)}
                  aria-label={`Open workspace switcher: ${workspaceLabel}`}
                  aria-haspopup="menu"
                  aria-expanded={isMobileWorkspaceOpen}
                  aria-controls="mobile-workspace-menu"
                  className={`studio-command-surface studio-hit-target flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white ${isRecipeView ? 'h-8 w-auto gap-1.5 px-2' : 'size-8'}`}
                >
                  <Briefcase size={15} />
                  {isRecipeView ? (
                    <span className="hidden max-w-28 truncate text-[10px] font-black uppercase tracking-[0.14em] lg:inline">
                      {workspaceLabel}
                    </span>
                  ) : null}
                </button>
              </Tooltip>
              <GsapDropdown
                id="mobile-workspace-menu"
                open={isMobileWorkspaceOpen}
                onOpenChange={setIsMobileWorkspaceOpen}
                triggerRef={mobileWorkspaceButtonRef}
                placement="bottom-left"
                role="menu"
                aria-label="Mobile workspace switcher"
                className="absolute left-0 top-full z-50 mt-1.5 p-1.5"
              >
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
              </GsapDropdown>
            </div>
          </div>

          {isRecipeView && activeRecipeData ? (
            <div className="flex min-w-0 items-center gap-1 sm:gap-2">
              <div className="flex min-w-0 items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                <button
                  type="button"
                  onClick={() => onViewChange('studio')}
                  aria-label="Go to studio"
                  title="Studio"
                  className="vt-nav-studio studio-command-surface studio-hit-target flex size-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white cursor-pointer"
                >
                  <Home size={14} />
                </button>
                <span className="hidden opacity-50 sm:inline">/</span>
                <button
                  type="button"
                  onClick={onCloseRecipe}
                  aria-label="Back to recipes"
                  className="vt-nav-recipes studio-command-surface studio-hit-target flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-zinc-800 px-2 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white group cursor-pointer sm:px-2.5"
                >
                  <ArrowLeft size={14} />
                  <span className="hidden sm:inline">Recipes</span>
                </button>
                <span className="opacity-50">/</span>
                <span
                  aria-current="page"
                  className="min-w-0 max-w-[7.5rem] truncate text-white sm:max-w-none"
                >
                  {activeRecipeData.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="studio-command-group flex shrink-0 items-center gap-1 rounded-lg border border-white/5 bg-white/5 p-0.5">
              <button
                type="button"
                onClick={() => onViewChange('studio')}
                aria-label={`Open studio workspace ${workspaceLabel}`}
                aria-current={currentView === 'studio' ? 'page' : undefined}
                className={`vt-nav-studio studio-hit-target rounded-md px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] transition-[color,background-color,border-color,opacity,transform,box-shadow] cursor-pointer sm:px-3 ${currentView === 'studio' ? 'studio-command-active bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <span className="sm:hidden">Studio</span>
                <span className="hidden sm:inline">{workspaceLabel}</span>
              </button>
              <button
                type="button"
                onClick={() => onViewChange('recipes')}
                aria-label="Open recipes"
                aria-current={currentView === 'recipes' ? 'page' : undefined}
                className={`vt-nav-recipes studio-hit-target rounded-md px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] transition-[color,background-color,border-color,opacity,transform,box-shadow] cursor-pointer sm:px-3 ${currentView === 'recipes' ? 'studio-command-active bg-accent-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Recipes
              </button>
            </div>
          )}

          <div className={`${isRecipeView ? 'hidden' : 'hidden min-w-0 md:block'}`}>
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

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <div className="hidden sm:block">
            <UsageStatusCard usage={usage} onOpenDashboard={onOpenDashboard} />
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Tooltip content={runtimeStatus.tooltip} position="bottom">
              <button
                type="button"
                onClick={onOpenDashboard}
                aria-label={`Open runtime status: ${runtimeStatus.label}`}
                className={`studio-command-surface studio-hit-target hidden size-8 items-center justify-center gap-1.5 rounded-lg border transition-[color,background-color,border-color,opacity,transform] hover:border-white/20 hover:bg-white/8 sm:flex xl:w-auto xl:px-2 ${runtimeToneClass}`}
              >
                <Server size={14} />
                <span className="hidden text-[10px] font-black uppercase tracking-[0.16em] xl:inline">
                  {runtimeStatus.label}
                </span>
              </button>
            </Tooltip>
            <Tooltip content={activeProvider.tooltip} position="bottom">
              <button
                type="button"
                onClick={onOpenSettings}
                aria-label={`Open provider settings for ${activeProvider.label}`}
                className={`studio-command-surface studio-hit-target hidden h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white lg:flex ${commandCenter.compactMode ? 'max-w-12' : 'max-w-24'}`}
              >
                <span className="truncate text-[10px] font-black uppercase tracking-[0.16em]">
                  {providerToolbarLabel}
                </span>
              </button>
            </Tooltip>
            <Tooltip content="Help & setup" position="bottom">
              <button
                type="button"
                onClick={onOpenOnboarding}
                aria-label="Open help and setup"
                className="studio-command-surface studio-hit-target hidden size-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white sm:flex"
              >
                <CircleHelp size={15} />
              </button>
            </Tooltip>
            <Tooltip content="Studio activity" position="bottom">
              <button
                type="button"
                onClick={onToggleDebug}
                aria-label="Open studio activity"
                className="studio-command-surface studio-hit-target hidden size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white sm:flex"
              >
                <Activity size={15} />
              </button>
            </Tooltip>
            <Tooltip content="Archived images" position="bottom">
              <button
                type="button"
                onClick={onOpenTrash}
                aria-label="Open archived images"
                className={`studio-hit-target relative hidden size-8 items-center justify-center rounded-lg border transition-[color,background-color,border-color,opacity,transform] sm:flex ${trashCount > 0 ? 'studio-command-danger border-red-500/20 bg-red-500/10 text-red-300 hover:border-red-400/30 hover:bg-red-500/15 hover:text-red-200' : 'studio-command-surface border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/8 hover:text-white'}`}
              >
                <Trash2 size={15} />
                {trashCount > 0 && (
                  <span className="absolute right-1 top-1 size-2 rounded-full border border-black bg-red-500 animate-pulse" />
                )}
              </button>
            </Tooltip>
            <Tooltip content="Codex chat" position="bottom">
              <button
                type="button"
                onClick={onOpenChat}
                aria-label="Open Codex chat"
                className="studio-command-surface studio-hit-target hidden size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white sm:flex"
              >
                <MessageSquare size={15} />
              </button>
            </Tooltip>
            <Tooltip content="Studio settings" position="bottom">
              <button
                type="button"
                onClick={onOpenSettings}
                aria-label="Open Studio Settings"
                className="studio-command-surface studio-hit-target hidden size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/30 hover:bg-accent-500/10 hover:text-white sm:flex"
              >
                <Settings size={15} />
              </button>
            </Tooltip>
            <Tooltip content="Generation queue" position="bottom">
              <button
                type="button"
                onClick={onToggleQueue}
                aria-label={`${isQueueOpen ? 'Close' : 'Open'} generation queue (${queueCount} jobs)`}
                aria-pressed={isQueueOpen}
                className={`studio-command-surface studio-hit-target relative flex h-8 min-w-8 items-center justify-center gap-1.5 overflow-hidden rounded-lg border px-2 transition-[color,background-color,border-color,opacity,transform,box-shadow] xl:px-2.5 ${
                  isQueueOpen
                    ? 'border-accent-500/30 bg-accent-500/12 text-white'
                    : showCollapsedQueueProgress
                      ? 'border-accent-400/35 bg-accent-500/15 text-white shadow-[0_0_18px_rgba(var(--accent-500),0.16)]'
                      : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/8 hover:text-white'
                }`}
              >
                {showCollapsedQueueProgress && (
                  <span className="absolute inset-x-1 bottom-1 h-0.5 overflow-hidden rounded-full bg-black/60">
                    <span
                      className="block h-full w-full origin-left rounded-full bg-accent-300 transition-transform duration-200 ease-linear"
                      style={{ transform: `scaleX(${queueProgressPercent / 100})` }}
                    />
                  </span>
                )}
                <SidebarRight
                  size={15}
                  className={showCollapsedQueueProgress ? 'text-accent-200' : undefined}
                />
                {hasQueueResultPreviews && (
                  <div className="hidden items-center sm:flex [&>*+*]:-ml-2">
                    {queueResultPreviews.slice(0, 3).map((preview) => (
                      <span
                        key={preview.id}
                        className="size-5 overflow-hidden rounded-md border border-black/40 bg-black/40 shadow-sm"
                      >
                        <img
                          src={preview.src}
                          alt=""
                          width={20}
                          height={20}
                          className="size-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                    ))}
                  </div>
                )}
                <span className="text-[10px] font-black tabular-nums uppercase tracking-[0.16em]">
                  {queueCount}
                </span>
              </button>
            </Tooltip>
            <div ref={mobileCommandRef} className="relative sm:hidden">
              <Tooltip content="Commands" position="bottom">
                <button
                  ref={mobileCommandButtonRef}
                  type="button"
                  onClick={() => setIsMobileCommandOpen((isOpen) => !isOpen)}
                  aria-label="Open mobile commands"
                  aria-expanded={isMobileCommandOpen}
                  aria-haspopup="menu"
                  aria-controls="mobile-command-menu"
                  className="studio-command-surface studio-hit-target flex size-10 touch-manipulation items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:bg-white/10 hover:text-white"
                >
                  <Menu2 size={15} />
                </button>
              </Tooltip>
              <GsapDropdown
                id="mobile-command-menu"
                open={isMobileCommandOpen}
                onOpenChange={setIsMobileCommandOpen}
                triggerRef={mobileCommandButtonRef}
                placement="bottom-right"
                className="fixed left-2 right-2 top-12 z-[60] p-2"
              >
                {isRecipeView && (
                  <div className="mb-2 border-b border-white/8 pb-2">
                    <div className="mb-1 px-1 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
                      Workspace
                    </div>
                    <WorkspaceStrip
                      layout="compact"
                      workspaces={workspaces}
                      activeWorkspaceId={activeWorkspaceId}
                      onSwitchWorkspace={(id) => runMobileCommand(() => onSwitchWorkspace(id))}
                      onAddWorkspace={() => runMobileCommand(onAddWorkspace)}
                      onDeleteWorkspace={onDeleteWorkspace}
                      onRenameWorkspace={onRenameWorkspace}
                    />
                  </div>
                )}
                <div className="mb-2 grid grid-cols-2 gap-2 rounded-xl border border-white/6 bg-white/[0.03] p-2">
                  <button
                    type="button"
                    aria-label={`Open runtime status: ${runtimeStatus.label}`}
                    data-dropdown-item
                    onClick={() => runMobileCommand(onOpenDashboard)}
                    className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 text-left text-[10px] font-black uppercase tracking-widest ${runtimeToneClass}`}
                  >
                    <Server size={15} />
                    <span className="truncate">{runtimeStatus.label}</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Open Studio Settings"
                    data-dropdown-item
                    onClick={() => runMobileCommand(onOpenSettings)}
                    className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-300"
                  >
                    <Settings size={15} />
                    <span className="truncate">{activeProvider.label}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    aria-label="Open Codex chat"
                    data-dropdown-item
                    onClick={() => runMobileCommand(onOpenChat)}
                    className="flex min-h-12 items-center gap-2 rounded-xl bg-white/5 px-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-300"
                  >
                    <MessageSquare size={15} />
                    Chat
                  </button>
                  <button
                    type="button"
                    aria-label="Open studio activity"
                    data-dropdown-item
                    onClick={() => runMobileCommand(onToggleDebug)}
                    className="flex min-h-12 items-center gap-2 rounded-xl bg-white/5 px-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-300"
                  >
                    <Activity size={15} />
                    Activity
                  </button>
                  <button
                    type="button"
                    aria-label="Open archived images"
                    data-dropdown-item
                    onClick={() => runMobileCommand(onOpenTrash)}
                    className="relative flex min-h-12 items-center gap-2 rounded-xl bg-white/5 px-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-300"
                  >
                    <Trash2 size={15} />
                    Archive
                    {trashCount > 0 && (
                      <span className="ml-auto rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] text-red-200">
                        {trashCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label="Open help and setup"
                    data-dropdown-item
                    onClick={() => runMobileCommand(onOpenOnboarding)}
                    className="flex min-h-12 items-center gap-2 rounded-xl bg-white/5 px-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-300"
                  >
                    <CircleHelp size={15} />
                    Help
                  </button>
                </div>
              </GsapDropdown>
            </div>
          </div>
        </div>
      </div>
    </TopToolbar>
  );
};

export const HeaderToolbar = React.memo(HeaderToolbarFn);
