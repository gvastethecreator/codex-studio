import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Workspace } from '../types';
import { runtimeLogger } from '../utils/runtimeLogger';
import { set } from '../utils/idb';
import {
  createWorkspace as createWorkspaceApi,
  deleteWorkspace as deleteWorkspaceApi,
  updateWorkspace as updateWorkspaceApi,
} from '../services/localStudioService';
import {
  loadDurableWorkspacesFromApi,
  migrateIndexedDbWorkspacesToServer,
} from '../lib/workspaceIdbMigration';
import { DEFAULT_WORKSPACE_ID } from '../packages/shared/src/workspaceContracts';
import { useToastUi } from './ToastUiContext';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
}

type WorkspaceAction =
  | { type: 'HYDRATE'; workspaces?: Workspace[]; activeWorkspaceId?: string }
  | { type: 'RESET' }
  | { type: 'CREATE'; workspace: Workspace; activate?: boolean }
  | { type: 'DELETE'; id: string }
  | { type: 'RENAME'; id: string; name: string }
  | { type: 'SET_ACTIVE'; id: string };

function ensureDefaultWorkspace(workspaces: Workspace[]): Workspace[] {
  if (workspaces.some((workspace) => workspace.id === DEFAULT_WORKSPACE_ID)) {
    return workspaces;
  }
  return [{ id: DEFAULT_WORKSPACE_ID, createdAt: Date.now() }, ...workspaces];
}

function createInitialWorkspaceState(): WorkspaceState {
  return {
    workspaces: ensureDefaultWorkspace([{ id: DEFAULT_WORKSPACE_ID, createdAt: Date.now() }]),
    activeWorkspaceId: DEFAULT_WORKSPACE_ID,
  };
}

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'HYDRATE': {
      const workspaces = ensureDefaultWorkspace(action.workspaces ?? state.workspaces);
      const activeWorkspaceId = workspaces.some((w) => w.id === action.activeWorkspaceId)
        ? action.activeWorkspaceId!
        : workspaces.some((w) => w.id === state.activeWorkspaceId)
          ? state.activeWorkspaceId
          : DEFAULT_WORKSPACE_ID;
      return { workspaces, activeWorkspaceId };
    }
    case 'RESET':
      return createInitialWorkspaceState();
    case 'CREATE': {
      const workspaces = ensureDefaultWorkspace(
        state.workspaces.some((w) => w.id === action.workspace.id)
          ? state.workspaces
          : [...state.workspaces, action.workspace],
      );
      return {
        workspaces,
        activeWorkspaceId:
          (action.activate ?? true) ? action.workspace.id : state.activeWorkspaceId,
      };
    }
    case 'DELETE': {
      if (action.id === DEFAULT_WORKSPACE_ID) return state;
      const workspaces = ensureDefaultWorkspace(state.workspaces.filter((w) => w.id !== action.id));
      return {
        workspaces,
        activeWorkspaceId:
          state.activeWorkspaceId === action.id ? DEFAULT_WORKSPACE_ID : state.activeWorkspaceId,
      };
    }
    case 'RENAME':
      return {
        ...state,
        workspaces: state.workspaces.map((w) =>
          w.id === action.id ? { ...w, name: action.name } : w,
        ),
      };
    case 'SET_ACTIVE':
      return {
        ...state,
        activeWorkspaceId: state.workspaces.some((w) => w.id === action.id)
          ? action.id
          : state.activeWorkspaceId,
      };
    default:
      return state;
  }
}

export interface WorkspaceContextValue {
  workspaces: Workspace[];
  createWorkspace: (workspace: Workspace, options?: { activate?: boolean }) => void;
  deleteWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  activeWorkspaceId: string;
  setActiveWorkspace: (id: string) => void;
  resetWorkspaces: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, createInitialWorkspaceState);
  const [isHydrated, setIsHydrated] = useState(false);
  const { addToast } = useToastUi();
  const activePersistRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        let workspaces: Workspace[] | undefined;
        let activeWorkspaceId: string | undefined;
        try {
          const migrated = await migrateIndexedDbWorkspacesToServer();
          workspaces = migrated.workspaces;
          activeWorkspaceId = migrated.activeWorkspaceId;
        } catch (error) {
          runtimeLogger.error('Workspace API migration failed; loading remote list only', error);
          try {
            const remote = await loadDurableWorkspacesFromApi();
            workspaces = remote.workspaces;
            activeWorkspaceId = remote.activeWorkspaceId;
          } catch (remoteError) {
            runtimeLogger.error('Workspace API unavailable; keeping local defaults', remoteError);
          }
        }
        if (cancelled) return;
        dispatch({ type: 'HYDRATE', workspaces, activeWorkspaceId });
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (activePersistRef.current) clearTimeout(activePersistRef.current);
    activePersistRef.current = window.setTimeout(() => {
      set('app-active-workspace-id', state.activeWorkspaceId).catch((error) => {
        runtimeLogger.error('Error setting active workspace preference', error);
      });
    }, 300);
    return () => {
      if (activePersistRef.current) clearTimeout(activePersistRef.current);
    };
  }, [isHydrated, state.activeWorkspaceId]);

  const createWorkspace = useCallback(
    (workspace: Workspace, options?: { activate?: boolean }) => {
      dispatch({ type: 'CREATE', workspace, activate: options?.activate ?? true });
      void createWorkspaceApi({
        id: workspace.id,
        name: workspace.name?.trim() || 'Untitled Workspace',
      })
        .then((created) => {
          dispatch({ type: 'RENAME', id: workspace.id, name: created.name });
          if (created.id !== workspace.id) {
            dispatch({ type: 'DELETE', id: workspace.id });
            dispatch({
              type: 'CREATE',
              workspace: {
                id: created.id,
                name: created.name,
                createdAt: workspace.createdAt,
              },
              activate: options?.activate ?? true,
            });
          }
        })
        .catch((error) => {
          runtimeLogger.error('Failed to persist workspace', error);
          dispatch({ type: 'DELETE', id: workspace.id });
          addToast(
            'Unable to create workspace. Check that the studio backend is running.',
            'error',
          );
        });
    },
    [addToast],
  );

  const deleteWorkspace = useCallback(
    (id: string) => {
      if (id === DEFAULT_WORKSPACE_ID) {
        addToast('The default workspace cannot be deleted.', 'warning');
        return;
      }
      const previous = state.workspaces;
      dispatch({ type: 'DELETE', id });
      void deleteWorkspaceApi(id).catch((error) => {
        runtimeLogger.error('Failed to delete workspace', error);
        dispatch({ type: 'HYDRATE', workspaces: previous });
        addToast('Unable to delete workspace. Try again.', 'error');
      });
    },
    [addToast, state.workspaces],
  );

  const renameWorkspace = useCallback(
    (id: string, name: string) => {
      const previousName = state.workspaces.find((workspace) => workspace.id === id)?.name;
      dispatch({ type: 'RENAME', id, name });
      void updateWorkspaceApi(id, { name }).catch((error) => {
        runtimeLogger.error('Failed to rename workspace', error);
        if (previousName !== undefined) {
          dispatch({ type: 'RENAME', id, name: previousName });
        }
        addToast(
          'Unable to rename workspace. Check that the studio backend is running and try again.',
          'error',
        );
      });
    },
    [addToast, state.workspaces],
  );

  const setActiveWorkspace = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE', id });
  }, []);

  const resetWorkspaces = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaces: state.workspaces,
      createWorkspace,
      deleteWorkspace,
      renameWorkspace,
      activeWorkspaceId: state.activeWorkspaceId,
      setActiveWorkspace,
      resetWorkspaces,
    }),
    [
      state.workspaces,
      state.activeWorkspaceId,
      createWorkspace,
      deleteWorkspace,
      renameWorkspace,
      setActiveWorkspace,
      resetWorkspaces,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export function useWorkspaceState() {
  const context = use(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceState must be used within a WorkspaceProvider');
  }
  return context;
}
