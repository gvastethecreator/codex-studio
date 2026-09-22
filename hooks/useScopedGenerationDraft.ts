import { useCallback, useMemo } from 'react';
import type { ImageGenerationConfig } from '../types';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import useIndexedDBStorage from './useIndexedDBStorage';

const EMPTY_DRAFTS: Record<string, ImageGenerationConfig> = {};

function getWorkspaceScope(scope: string) {
  return scope.slice(0, scope.lastIndexOf(':'));
}

function collectWorkspaceAttachments(
  drafts: Record<string, ImageGenerationConfig>,
  workspace: string,
  active: ImageGenerationConfig,
) {
  const attachments = [
    ...active.attachments,
    ...Object.entries(drafts)
      .filter(([key]) => key.startsWith(`${workspace}:`))
      .flatMap(([, draft]) => draft.attachments),
  ];
  return attachments.filter(
    (attachment, index) => attachments.findIndex((item) => item.id === attachment.id) === index,
  );
}

function shareWorkspaceAttachments(
  drafts: Record<string, ImageGenerationConfig>,
  workspace: string,
  attachments: ImageGenerationConfig['attachments'],
) {
  return Object.fromEntries(
    Object.entries(drafts).map(([key, draft]) => [
      key,
      key.startsWith(`${workspace}:`) ? { ...draft, attachments } : draft,
    ]),
  );
}

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
  const workspace = useMemo(() => getWorkspaceScope(scope), [scope]);
  const config = useMemo(() => {
    const active = drafts[scope] ?? initial;
    return {
      ...active,
      attachments: collectWorkspaceAttachments(drafts, workspace, active),
    };
  }, [drafts, initial, scope, workspace]);
  const setConfig = useCallback(
    (
      update: ImageGenerationConfig | ((current: ImageGenerationConfig) => ImageGenerationConfig),
    ) => {
      if (!legacyReady || !draftsReady) return;
      setDrafts((current) => {
        const active = current[scope] ?? initial;
        const sharedAttachments = collectWorkspaceAttachments(current, workspace, active);
        const updated =
          typeof update === 'function'
            ? update({ ...active, attachments: sharedAttachments })
            : update;
        return {
          ...shareWorkspaceAttachments(current, workspace, updated.attachments),
          [scope]: updated,
        };
      });
    },
    [scope, initial, setDrafts, legacyReady, draftsReady, workspace],
  );
  const setRecipeDraft = useCallback(
    (recipeId: ImageGenerationConfig['recipeId'], value: ImageGenerationConfig) => {
      setDrafts((current) => ({
        ...shareWorkspaceAttachments(current, workspace, value.attachments),
        [`${workspace}:${recipeId ?? 'studio'}`]: value,
      }));
    },
    [workspace, setDrafts],
  );
  return [config, setConfig, setRecipeDraft, legacyReady && draftsReady] as const;
}
