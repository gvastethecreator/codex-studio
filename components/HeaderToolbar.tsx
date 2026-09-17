import React from 'react';
import {
  IconTrash as Trash2,
  IconHelpCircle as CircleHelp,
  IconActivity as Activity,
  IconBriefcase as Briefcase,
  IconMenu2 as Menu2,
  IconMessage as MessageSquare,
  IconSettings as Settings,
} from '@tabler/icons-react';
import Tooltip from './Tooltip';
import Logo from './Logo';
import { TopToolbar } from './ui/TopToolbar';
import { DemandMountedGsapDropdown } from './ui/DemandMountedGsapDropdown';
import { resolveRecipeAlias, type RecipeAliasId } from '../lib/recipeAliases';
import type { StudioUsageSummary } from '../lib/studioDiagnostics';
import type { Workspace, RecipeId } from '../types';
import { WorkspaceStrip } from './header/WorkspaceStrip';
import type { StudioCommandCenterProjection } from '../lib/commandCenterProjection';
import { getRecipeShellTitle } from '../lib/recipeShellMetadata';
import type { GenerationProviderId } from '../packages/shared/src';

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
  onSelectProvider: (providerId: GenerationProviderId) => Promise<void>;
  isProviderSaving: boolean;
}

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
  onOpenOnboarding,
  onOpenTrash,
  trashCount,
  onToggleDebug,
  onOpenSettings,
}) => {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = React.useState(false);
  const [isMobileCommandOpen, setIsMobileCommandOpen] = React.useState(false);
  const workspaceRef = React.useRef<HTMLDivElement>(null);
  const workspaceButtonRef = React.useRef<HTMLButtonElement>(null);
  const mobileCommandRef = React.useRef<HTMLDivElement>(null);
  const mobileCommandButtonRef = React.useRef<HTMLButtonElement>(null);
  const activeRecipeAlias = resolveRecipeAlias(activeRecipeAliasId);
  const activeRecipeData = activeRecipe
    ? { name: activeRecipeAlias?.title ?? getRecipeShellTitle(activeRecipe) }
    : null;
  const isRecipeView = routeView === 'recipe' && Boolean(activeRecipeData);
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const workspaceLabel = activeWorkspace?.name || 'Studio';

  React.useEffect(() => {
    if (!isWorkspaceOpen && !isMobileCommandOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        workspaceRef.current &&
        !workspaceRef.current.contains(event.target as Node) &&
        isWorkspaceOpen
      ) {
        setIsWorkspaceOpen(false);
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
  }, [isMobileCommandOpen, isWorkspaceOpen]);

  const runMobileCommand = React.useCallback((action: () => void) => {
    setIsMobileCommandOpen(false);
    action();
  }, []);

  return (
    <TopToolbar className="studio-toolbar-shell w-full min-h-10 bg-black/80 flex items-center px-2 py-1 z-40 shrink-0 border-b border-white/2">
      <div className="w-full flex flex-nowrap items-center justify-between gap-1 sm:gap-2 relative z-50">
        <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 sm:gap-1.5 lg:gap-2">
          <Logo isGenerating={isGenerating} />
          <nav className="flex min-w-0 items-center gap-1" aria-label="Studio navigation">
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm hover:bg-white/10"
              aria-label="Open recipes"
              aria-current={currentView !== 'studio' ? 'page' : undefined}
              onClick={() => onViewChange('recipes')}
            >
              Create
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm hover:bg-white/10"
              aria-label="Go to studio"
              aria-current={currentView === 'studio' ? 'page' : undefined}
              onClick={() => onViewChange('studio')}
            >
              Library
            </button>
            {isRecipeView && activeRecipeData && (
              <span className="hidden truncate border-l border-white/10 pl-3 text-sm text-zinc-400 lg:inline">
                {activeRecipeData.name}
              </span>
            )}
          </nav>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <div ref={workspaceRef} className="relative">
            <Tooltip content="Workspaces" position="bottom">
              <button
                ref={workspaceButtonRef}
                type="button"
                onClick={() => setIsWorkspaceOpen((isOpen) => !isOpen)}
                aria-label={`Open workspace switcher: ${workspaceLabel}`}
                aria-haspopup="menu"
                aria-expanded={isWorkspaceOpen}
                aria-controls="studio-workspace-menu"
                className="studio-command-surface studio-hit-target flex h-8 w-auto cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/2 bg-white/5 px-2 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/2 hover:bg-accent-500/10 hover:text-white"
              >
                <Briefcase size={15} />
                <span className="hidden max-w-28 truncate text-[10px] font-black uppercase tracking-[0.14em] lg:inline">
                  {workspaceLabel}
                </span>
              </button>
            </Tooltip>
            <DemandMountedGsapDropdown
              id="studio-workspace-menu"
              open={isWorkspaceOpen}
              onOpenChange={setIsWorkspaceOpen}
              triggerRef={workspaceButtonRef}
              placement="bottom-right"
              role="menu"
              aria-label="Workspace switcher"
              className="absolute right-0 top-full z-50 mt-1.5 p-1.5"
            >
              <WorkspaceStrip
                layout="compact"
                workspaces={workspaces}
                activeWorkspaceId={activeWorkspaceId}
                onSwitchWorkspace={(id) => {
                  onSwitchWorkspace(id);
                  setIsWorkspaceOpen(false);
                }}
                onAddWorkspace={() => {
                  onAddWorkspace();
                  setIsWorkspaceOpen(false);
                }}
                onDeleteWorkspace={onDeleteWorkspace}
                onRenameWorkspace={onRenameWorkspace}
              />
            </DemandMountedGsapDropdown>
          </div>
          <details className="relative hidden sm:block">
            <summary className="cursor-pointer rounded-lg px-3 py-2 text-sm text-zinc-300">
              Tools
            </summary>
            <div className="absolute right-0 top-11 z-50 grid w-48 gap-2 rounded-xl border border-white/10 bg-zinc-900 p-3 shadow-xl">
              <button
                type="button"
                className="rounded p-2 text-left hover:bg-white/10"
                onClick={onOpenOnboarding}
                aria-label="Open help and setup"
              >
                Help &amp; setup
              </button>
              <button
                type="button"
                className="rounded p-2 text-left hover:bg-white/10"
                onClick={onToggleDebug}
                aria-label="Open studio activity"
              >
                Activity
              </button>
              <button
                type="button"
                className="rounded p-2 text-left hover:bg-white/10"
                onClick={onOpenTrash}
                aria-label="Open archived images"
              >
                Trash
              </button>
            </div>
          </details>
          <Tooltip content="Studio settings" position="bottom">
            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Open Studio Settings"
              className="studio-command-surface studio-hit-target hidden size-8 items-center justify-center rounded-lg border border-white/2 bg-white/5 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:border-accent-400/2 hover:bg-accent-500/10 hover:text-white sm:flex"
            >
              <Settings size={15} />
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
                className="studio-command-surface studio-hit-target flex size-10 touch-manipulation items-center justify-center rounded-lg border border-white/2 bg-white/5 text-zinc-300 transition-[color,background-color,border-color,opacity,transform] hover:bg-white/10 hover:text-white"
              >
                <Menu2 size={15} />
              </button>
            </Tooltip>
            <DemandMountedGsapDropdown
              id="mobile-command-menu"
              open={isMobileCommandOpen}
              onOpenChange={setIsMobileCommandOpen}
              triggerRef={mobileCommandButtonRef}
              placement="bottom-right"
              className="fixed left-2 right-2 top-12 z-[60] p-2"
            >
              <div className="mb-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-label="Open Studio Settings"
                  data-dropdown-item
                  onClick={() => runMobileCommand(onOpenSettings)}
                  className="flex min-h-12 items-center gap-2 rounded-xl bg-white/5 px-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-300"
                >
                  <Settings size={15} />
                  Settings
                </button>
                <button
                  type="button"
                  aria-label="Focus generation prompt"
                  data-dropdown-item
                  onClick={() =>
                    runMobileCommand(() =>
                      document
                        .querySelector<HTMLTextAreaElement>('[aria-label="Prompt input"]')
                        ?.focus(),
                    )
                  }
                  className="flex min-h-12 items-center gap-2 rounded-xl bg-white/5 px-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-300"
                >
                  <MessageSquare size={15} />
                  Compose
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
            </DemandMountedGsapDropdown>
          </div>
        </div>
      </div>
    </TopToolbar>
  );
};

export const HeaderToolbar = React.memo(HeaderToolbarFn);
