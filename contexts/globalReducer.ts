import type { BackgroundConfig, LogEntry, Workspace } from '../types';

export interface GlobalState {
  logs: LogEntry[];
  workspaces: Workspace[];
  activeWorkspaceId: string;
  isBackgroundEnabled: boolean;
  bgConfig: BackgroundConfig;
}

export type GlobalAction =
  | { type: 'HYDRATE_STATE'; state: Partial<GlobalState> }
  | { type: 'RESET_STATE' }
  | { type: 'ADD_LOG'; entry: LogEntry }
  | { type: 'CREATE_WORKSPACE'; workspace: Workspace; activate?: boolean }
  | { type: 'DELETE_WORKSPACE'; id: string }
  | { type: 'RENAME_WORKSPACE'; id: string; name: string }
  | { type: 'SET_ACTIVE_WORKSPACE'; id: string }
  | { type: 'SET_BACKGROUND_ENABLED'; enabled: boolean }
  | { type: 'UPDATE_BACKGROUND_CONFIG'; patch: Partial<BackgroundConfig> };

export function createInitialGlobalState(): GlobalState {
  return {
    logs: [],
    workspaces: ensureDefaultWorkspace([{ id: 'default', createdAt: Date.now() }]),
    activeWorkspaceId: 'default',
    isBackgroundEnabled: true,
    bgConfig: { density: 0.4, speed: 0.002 },
  };
}

export function ensureDefaultWorkspace(workspaces: Workspace[]): Workspace[] {
  if (workspaces.some((workspace) => workspace.id === 'default')) {
    return workspaces;
  }

  return [{ id: 'default', createdAt: Date.now() }, ...workspaces];
}

export function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case 'HYDRATE_STATE': {
      const hydratedWorkspaces = ensureDefaultWorkspace(
        action.state.workspaces ?? state.workspaces,
      );
      const hydratedActiveWorkspaceId = hydratedWorkspaces.some(
        (workspace) => workspace.id === action.state.activeWorkspaceId,
      )
        ? action.state.activeWorkspaceId!
        : hydratedWorkspaces.some((workspace) => workspace.id === state.activeWorkspaceId)
          ? state.activeWorkspaceId
          : 'default';

      return {
        logs: action.state.logs ?? state.logs,
        workspaces: hydratedWorkspaces,
        activeWorkspaceId: hydratedActiveWorkspaceId,
        isBackgroundEnabled: action.state.isBackgroundEnabled ?? state.isBackgroundEnabled,
        bgConfig: action.state.bgConfig ?? state.bgConfig,
      };
    }

    case 'RESET_STATE':
      return createInitialGlobalState();

    case 'ADD_LOG':
      return {
        ...state,
        logs: [action.entry, ...state.logs].slice(0, 500),
      };

    case 'CREATE_WORKSPACE': {
      const workspaces = ensureDefaultWorkspace(
        state.workspaces.some((workspace) => workspace.id === action.workspace.id)
          ? state.workspaces
          : [...state.workspaces, action.workspace],
      );

      return {
        ...state,
        workspaces,
        activeWorkspaceId:
          (action.activate ?? true) ? action.workspace.id : state.activeWorkspaceId,
      };
    }

    case 'DELETE_WORKSPACE': {
      if (action.id === 'default') {
        return state;
      }

      const workspaces = ensureDefaultWorkspace(
        state.workspaces.filter((workspace) => workspace.id !== action.id),
      );

      return {
        ...state,
        workspaces,
        activeWorkspaceId:
          state.activeWorkspaceId === action.id ? 'default' : state.activeWorkspaceId,
      };
    }

    case 'RENAME_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) =>
          workspace.id === action.id ? { ...workspace, name: action.name } : workspace,
        ),
      };

    case 'SET_ACTIVE_WORKSPACE':
      return {
        ...state,
        activeWorkspaceId: state.workspaces.some((workspace) => workspace.id === action.id)
          ? action.id
          : state.activeWorkspaceId,
      };

    case 'SET_BACKGROUND_ENABLED':
      return {
        ...state,
        isBackgroundEnabled: action.enabled,
      };

    case 'UPDATE_BACKGROUND_CONFIG':
      return {
        ...state,
        bgConfig: {
          ...state.bgConfig,
          ...action.patch,
        },
      };

    default:
      return state;
  }
}
