import { useCallback, useMemo } from 'react';
import type { ImageGenerationConfig } from '../types';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import useIndexedDBStorage from './useIndexedDBStorage';

const EMPTY_DRAFTS: Record<string, ImageGenerationConfig> = {};

export function useScopedGenerationDraft(
  scope: string,
  prepare: (config: ImageGenerationConfig) => ImageGenerationConfig,
) {
  // Preserve the original draft at its existing key; recipe drafts have explicit scopes.
  const [legacy, , legacyReady] = useIndexedDBStorage<ImageGenerationConfig>(
    'generation-config',
    DEFAULT_GENERATION_CONFIG,
  );
  const prepareDrafts = useCallback(
    (drafts: Record<string, ImageGenerationConfig>) =>
      Object.fromEntries(Object.entries(drafts).map(([key, value]) => [key, prepare(value)])),
    [prepare],
  );
  const [drafts, setDrafts, draftsReady] = useIndexedDBStorage('generation-drafts', EMPTY_DRAFTS, {
    prepareForPersist: prepareDrafts,
  });
  const initial = useMemo(
    () =>
      scope === 'default:studio'
        ? legacy
        : {
            ...DEFAULT_GENERATION_CONFIG,
            executionModel: legacy.executionModel,
            executionReasoningEffort: legacy.executionReasoningEffort,
            executionSpeed: legacy.executionSpeed,
            codexTransport: legacy.codexTransport,
            codexImageModel: legacy.codexImageModel,
          },
    [scope, legacy],
  );
  const config = drafts[scope] ?? initial;
  const setConfig = useCallback(
    (
      update: ImageGenerationConfig | ((current: ImageGenerationConfig) => ImageGenerationConfig),
    ) => {
      if (!legacyReady || !draftsReady) return;
      setDrafts((current) => ({
        ...current,
        [scope]: typeof update === 'function' ? update(current[scope] ?? initial) : update,
      }));
    },
    [scope, initial, setDrafts, legacyReady, draftsReady],
  );
  const setRecipeDraft = useCallback(
    (recipeId: ImageGenerationConfig['recipeId'], value: ImageGenerationConfig) => {
      const workspace = scope.slice(0, scope.lastIndexOf(':'));
      setDrafts((current) => ({ ...current, [`${workspace}:${recipeId ?? 'studio'}`]: value }));
    },
    [scope, setDrafts],
  );
  return [config, setConfig, setRecipeDraft, legacyReady && draftsReady] as const;
}
