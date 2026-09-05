import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLatestRef } from '../../hooks/useLatestRef';
import { listUserStylePresets } from '../../services/studio-api/userStyles';
import type {
  UserStylePreset,
  UserStylePresetDraft,
  UserStylePresetSource,
} from '../../packages/shared/src';
import type { UserStyleEditorIntent } from './userStyleDraftBuilders';
import { createUserStyleRuntimePack } from './userStyleRuntimeAdapter';

interface UserStyleEditorSession {
  id: number;
  mode: 'create' | 'edit';
  draft: UserStylePresetDraft;
  source: UserStylePresetSource | null;
  editingStyleId?: string;
}

/** Owns user-style reads and editor identity; browsing owns navigation and selection. */
export function useUserStyleLibrary(callbacks: {
  onReconciled: (style: UserStylePreset, archived: boolean) => void;
  onSaved: (style: UserStylePreset) => void;
  onArchived: (style: UserStylePreset) => void;
}) {
  const callbacksRef = useLatestRef(callbacks);
  const [presets, setPresets] = useState<UserStylePreset[]>([]);
  const presetsRef = useLatestRef(presets);
  const [loading, setLoading] = useState(true);
  const [readError, setReadError] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const observedVersions = useRef(
    new Map<string, { updatedAt: string; sessionId: number; archived: boolean }>(),
  );
  const [session, setSession] = useState<UserStyleEditorSession | null>(null);
  const currentSession = useRef<number | null>(null);
  const intentRevision = useRef(0);
  const readController = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    readController.current?.abort();
    const controller = new AbortController();
    readController.current = controller;
    setLoading(true);
    setReadError(null);
    try {
      const response = await listUserStylePresets({ signal: controller.signal });
      if (!controller.signal.aborted) {
        for (const style of response.styles) {
          const known = observedVersions.current.get(style.id);
          if (!known || style.updatedAt > known.updatedAt)
            observedVersions.current.set(style.id, {
              updatedAt: style.updatedAt,
              sessionId: 0,
              archived: style.isArchived,
            });
        }
        setPresets(response.styles);
      }
    } catch (failure) {
      if (!controller.signal.aborted)
        setReadError(failure instanceof Error ? failure.message : 'Could not load user styles.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return () => {
      readController.current?.abort();
      intentRevision.current += 1;
      currentSession.current = null;
    };
  }, [refresh]);

  const open = useCallback(
    async (intent: UserStyleEditorIntent) => {
      const id = ++intentRevision.current;
      try {
        const builders = await import('./userStyleDraftBuilders');
        if (intentRevision.current !== id) return;
        const next = builders.prepareUserStyleEditorSession(intent, presetsRef.current);
        if (!next) return;
        setEditorError(null);
        currentSession.current = id;
        setSession({ id, ...next });
      } catch (failure) {
        if (intentRevision.current === id)
          setEditorError(
            failure instanceof Error ? failure.message : 'Could not open the style editor.',
          );
      }
    },
    [presetsRef],
  );

  const close = useCallback(() => {
    intentRevision.current += 1;
    currentSession.current = null;
    setSession(null);
  }, []);

  const reconcile = useCallback(
    (sessionId: number, style: UserStylePreset, archived: boolean) => {
      const known = observedVersions.current.get(style.id);
      if (
        known &&
        (known.updatedAt > style.updatedAt ||
          (known.updatedAt === style.updatedAt &&
            (known.sessionId > sessionId || (known.archived && !archived))))
      )
        return;
      observedVersions.current.set(style.id, { updatedAt: style.updatedAt, sessionId, archived });
      readController.current?.abort();
      setLoading(false);
      setPresets((current) =>
        archived
          ? current.filter((item) => item.id !== style.id)
          : [style, ...current.filter((item) => item.id !== style.id)],
      );
      callbacksRef.current.onReconciled(style, archived);
      void refresh();
      if (currentSession.current !== sessionId) return;
      close();
      if (archived) callbacksRef.current.onArchived(style);
      else callbacksRef.current.onSaved(style);
    },
    [callbacksRef, close, refresh],
  );

  const runtimePack = useMemo(() => createUserStyleRuntimePack(presets), [presets]);
  const byId = useMemo(() => new Map(presets.map((style) => [style.id, style])), [presets]);
  return {
    presets,
    loading,
    error: readError ?? editorError,
    session,
    runtimePack,
    byId,
    refresh,
    open,
    close,
    reconcile,
  };
}
