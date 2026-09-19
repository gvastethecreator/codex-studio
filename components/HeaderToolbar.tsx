import React from 'react';
import {
  IconTrash as Trash2,
  IconHelpCircle as CircleHelp,
  IconActivity as Activity,
  IconBriefcase as Briefcase,
  IconMenu2 as Menu2,
  IconMessage as MessageSquare,
  IconSettings as Settings,
  IconSun as Sun,
  IconMoon as Moon,
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
import { useTheme } from '../hooks/useTheme';
import { CreateWorkflowPicker } from './create/CreateWorkflowPicker';
import { RecipeWorkbenchContext } from './recipes/RecipeWorkbenchContext';

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
  onSelectRecipe: (id: RecipeId, aliasId?: RecipeAliasId | null) => void;
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
  onCloseRecipe,
  onOpenOnboarding,
  onOpenTrash,
  trashCount,
  onToggleDebug,
  onOpenSettings,
  onSelectRecipe,
}) => {
  const { appearance, toggleAppearance } = useTheme();
  const { compare } = React.useContext(RecipeWorkbenchContext);
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
    <TopToolbar className="studio-toolbar-shell studio-bar w-full min-h-10 flex items-center px-2 py-1 z-40 shrink-0">
      <div className="relative z-50 grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 sm:gap-2">
        <div className="flex min-w-0 flex-nowrap items-center gap-1 sm:gap-1.5 lg:gap-2">
          <Logo isGenerating={isGenerating} />
          <nav className="flex min-w-0 items-center gap-1" aria-label="Studio navigation">
            <button
              type="button"
              className="studio-nav-tab studio-control"
              aria-label="Open recipes"
              aria-current={currentView !== 'studio' ? 'page' : undefined}
              onClick={() => onViewChange('recipes')}
            >
              Create
            </button>
            <button
              type="button"
              className="studio-nav-tab studio-control"
              aria-label="Go to studio"
              aria-current={currentView === 'studio' ? 'page' : undefined}
              onClick={() => onViewChange('studio')}
            >
              Library
            </button>
            {compare ? (
              <button
                type="button"
                className="studio-nav-tab studio-control"
                aria-pressed={compare.showReference}
                onClick={compare.toggle}
              >
                {compare.showReference ? 'Show result' : 'Compare reference'}
              </button>
            ) : null}
          </nav>
        </div>

        <CreateWorkflowPicker
          selectedLabel={isRecipeView && activeRecipeData ? activeRecipeData.name : 'Default'}
          onSelectRecipe={onSelectRecipe}
          onSelectDefault={() => {
            if (isRecipeView) onCloseRecipe();
            else if (currentView === 'studio') onViewChange('recipes');
          }}
        />

        <div className="flex shrink-0 items-center justify-end gap-1">
          <Tooltip
            content={appearance === 'light' ? 'Dark appearance' : 'Light appearance'}
            position="bottom"
          >
            <button
              type="button"
              onClick={toggleAppearance}
              aria-label={
                appearance === 'light' ? 'Switch to dark appearance' : 'Switch to light appearance'
              }
              className="studio-command-surface studio-control studio-hit-target flex size-8 items-center justify-center rounded"
            >
              {appearance === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          </Tooltip>
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
                className="studio-command-surface studio-control studio-hit-target flex h-8 w-auto cursor-pointer items-center justify-center gap-1.5 rounded px-2 transition-[color,background-color,border-color,opacity,transform]"
              >
                <Briefcase size={15} />
                <span className="hidden max-w-28 truncate text-xs font-medium lg:inline">
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
            <summary className="studio-nav-tab studio-control cursor-pointer">
              Tools
            </summary>
            <div className="studio-popover absolute right-0 top-11 z-50 grid w-48 gap-2 rounded-md p-3">
              <button
                type="button"
                className="studio-menu-item rounded p-2 text-left"
                onClick={onOpenOnboarding}
                aria-label="Open help and setup"
              >
                Help &amp; setup
              </button>
              <button
                type="button"
                className="studio-menu-item rounded p-2 text-left"
                onClick={onToggleDebug}
                aria-label="Open studio activity"
              >
                Activity
              </button>
              <button
                type="button"
                className="studio-menu-item rounded p-2 text-left"
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
              className="studio-command-surface studio-control studio-hit-target hidden size-8 items-center justify-center rounded sm:flex"
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
                className="studio-command-surface studio-control studio-hit-target flex size-10 touch-manipulation items-center justify-center rounded"
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
                  className="studio-ghost-control flex min-h-12 w-full items-center gap-2 px-3 text-left"
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
                  className="studio-ghost-control flex min-h-12 w-full items-center gap-2 px-3 text-left"
                >
                  <MessageSquare size={15} />
                  Compose
                </button>
                <button
                  type="button"
                  aria-label="Open studio activity"
                  data-dropdown-item
                  onClick={() => runMobileCommand(onToggleDebug)}
                  className="studio-ghost-control flex min-h-12 w-full items-center gap-2 px-3 text-left"
                >
                  <Activity size={15} />
                  Activity
                </button>
                <button
                  type="button"
                  aria-label="Open archived images"
                  data-dropdown-item
                  onClick={() => runMobileCommand(onOpenTrash)}
                  className="studio-ghost-control relative flex min-h-12 items-center gap-2 px-3 text-left"
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
                  className="studio-ghost-control flex min-h-12 w-full items-center gap-2 px-3 text-left"
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
