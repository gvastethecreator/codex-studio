import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useReducer,
} from 'react';
import type { LegacyVisualBatchSnapshot } from '../lib/studioLegacyVisualSnapshotImport';
import {
  createInitialLegacyVisualBatchState,
  type LegacyVisualBatchRef,
  legacyVisualBatchReducer,
} from './legacyVisualBatchReducer';

interface LegacyVisualBatchContextType {
  legacyVisualBatchIds: string[];
  registerGeneratedLegacyVisualBatchRef: (
    ref: LegacyVisualBatchRef,
    options?: { maxPerWorkspace?: number },
  ) => void;
  mergeLegacyVisualBatches: (
    batches: LegacyVisualBatchSnapshot,
    options?: { prepend?: boolean; maxTotal?: number; ensureWorkspaces?: boolean },
  ) => void;
  clearLegacyVisualWorkspace: (workspaceId: string) => void;
  clearAllLegacyVisualBatches: () => void;
  resetLegacyVisualBatches: () => void;
}

const LegacyVisualBatchContext = createContext<LegacyVisualBatchContextType | undefined>(undefined);

export const LegacyVisualBatchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(
    legacyVisualBatchReducer,
    undefined,
    createInitialLegacyVisualBatchState,
  );

  const registerGeneratedLegacyVisualBatchRef = useCallback(
    (ref: LegacyVisualBatchRef, options?: { maxPerWorkspace?: number }) => {
      dispatch({
        type: 'REGISTER_GENERATED_LEGACY_VISUAL_BATCH_REF',
        ref,
        maxPerWorkspace: options?.maxPerWorkspace,
      });
    },
    [],
  );

  const mergeLegacyVisualBatches = useCallback(
    (
      batches: LegacyVisualBatchSnapshot,
      options?: { prepend?: boolean; maxTotal?: number; ensureWorkspaces?: boolean },
    ) => {
      dispatch({
        type: 'REGISTER_RECOVERED_LEGACY_VISUAL_BATCH_IDS',
        batches,
        prepend: options?.prepend,
        maxTotal: options?.maxTotal,
      });
    },
    [],
  );

  const clearLegacyVisualWorkspace = useCallback((workspaceId: string) => {
    dispatch({ type: 'CLEAR_LEGACY_VISUAL_WORKSPACE_IDS', workspaceId });
  }, []);

  const clearAllLegacyVisualBatches = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_LEGACY_VISUAL_BATCH_IDS' });
  }, []);

  const resetLegacyVisualBatches = useCallback(() => {
    dispatch({ type: 'RESET_LEGACY_VISUAL_BATCH_IDS' });
  }, []);

  const value = useMemo<LegacyVisualBatchContextType>(
    () => ({
      legacyVisualBatchIds: state.legacyVisualBatchRefs.map((batch) => batch.id),
      registerGeneratedLegacyVisualBatchRef,
      mergeLegacyVisualBatches,
      clearLegacyVisualWorkspace,
      clearAllLegacyVisualBatches,
      resetLegacyVisualBatches,
    }),
    [
      state.legacyVisualBatchRefs,
      registerGeneratedLegacyVisualBatchRef,
      mergeLegacyVisualBatches,
      clearLegacyVisualWorkspace,
      clearAllLegacyVisualBatches,
      resetLegacyVisualBatches,
    ],
  );

  return (
    <LegacyVisualBatchContext.Provider value={value}>{children}</LegacyVisualBatchContext.Provider>
  );
};

export const useLegacyVisualBatches = () => {
  const context = useContext(LegacyVisualBatchContext);
  if (context === undefined) {
    throw new Error('useLegacyVisualBatches must be used within a LegacyVisualBatchProvider');
  }
  return context;
};
