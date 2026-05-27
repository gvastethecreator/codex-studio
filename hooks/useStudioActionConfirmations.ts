import { useCallback, useState } from 'react';

export type ConfirmationTone = 'danger' | 'warning' | 'accent';

export interface ConfirmationRequest {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmationTone;
  details?: string[];
  note?: string;
}

interface PendingConfirmation extends ConfirmationRequest {
  onConfirm: () => void | Promise<void>;
}

interface UseStudioActionConfirmationsProps {
  clearWorkspace: (workspaceId: string) => void;
  deleteWorkspace: (workspaceId: string) => void;
  resetStudio: () => void | Promise<void>;
  restoreAllFromTrash: () => void;
  emptyTrash: () => void;
}

export function useStudioActionConfirmations({
  clearWorkspace,
  deleteWorkspace,
  resetStudio,
  restoreAllFromTrash,
  emptyTrash,
}: UseStudioActionConfirmationsProps) {
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);

  const closeConfirmation = useCallback(() => {
    setPendingConfirmation(null);
  }, []);

  const requestConfirmation = useCallback(
    (request: ConfirmationRequest, onConfirm: () => void | Promise<void>) => {
      setPendingConfirmation({ ...request, onConfirm });
    },
    [],
  );

  const confirmPendingAction = useCallback(async () => {
    if (!pendingConfirmation) return;

    const { onConfirm } = pendingConfirmation;
    setPendingConfirmation(null);

    try {
      await onConfirm();
    } catch {
      // Callers already own their error reporting.
    }
  }, [pendingConfirmation]);

  const requestClearWorkspace = useCallback(
    (workspaceId: string, imageCount: number) => {
      requestConfirmation(
        {
          title: 'Archive workspace images',
          description:
            'This removes the current workspace images from the active canvas and moves them to Archived Images so you can start clean.',
          confirmLabel: 'Archive workspace',
          tone: 'warning',
          details: [
            `${imageCount} image${imageCount === 1 ? '' : 's'} will leave the active workspace.`,
            'Archived images can still be restored later from Archived Images.',
          ],
          note: 'No local library files are deleted permanently by this action.',
        },
        () => clearWorkspace(workspaceId),
      );
    },
    [clearWorkspace, requestConfirmation],
  );

  const requestDeleteWorkspace = useCallback(
    (workspace: { id: string; name?: string; imageCount?: number }) => {
      const workspaceLabel = workspace.name || workspace.id;
      const imageCount = workspace.imageCount ?? 0;

      requestConfirmation(
        {
          title: 'Delete workspace',
          description:
            'This removes the workspace from the active Studio and clears its current catalog images from the canvas.',
          confirmLabel: 'Delete workspace',
          tone: 'danger',
          details: [
            `Workspace: ${workspaceLabel}`,
            `${imageCount} image${imageCount === 1 ? '' : 's'} in this workspace will no longer appear in the active Studio.`,
          ],
          note: 'The default workspace is protected. This UI action does not delete local library files from disk.',
        },
        () => deleteWorkspace(workspace.id),
      );
    },
    [deleteWorkspace, requestConfirmation],
  );

  const requestRestoreAllTrash = useCallback(
    (groupCount: number) => {
      requestConfirmation(
        {
          title: 'Restore archived images',
          description:
            'This brings every archived catalog image group back into the active Studio workspaces.',
          confirmLabel: 'Restore all',
          tone: 'accent',
          details: [
            `${groupCount} archived image group${groupCount === 1 ? '' : 's'} will return to active workspaces.`,
            'Existing workspaces will be recreated automatically if needed.',
          ],
        },
        restoreAllFromTrash,
      );
    },
    [requestConfirmation, restoreAllFromTrash],
  );

  const requestEmptyTrash = useCallback(
    (groupCount: number) => {
      requestConfirmation(
        {
          title: 'Permanently empty Archived Images',
          description:
            'This permanently removes archived catalog image groups from the in-app archive and they will no longer be recoverable from the Studio UI.',
          confirmLabel: 'Empty bin',
          tone: 'danger',
          details: [
            `${groupCount} archived image group${groupCount === 1 ? '' : 's'} will be purged.`,
            'This action cannot be undone from the Studio interface.',
          ],
        },
        emptyTrash,
      );
    },
    [emptyTrash, requestConfirmation],
  );

  const requestResetStudio = useCallback(() => {
    requestConfirmation(
      {
        title: 'Rebuild local studio library',
        description:
          'Use this when the local library, queue state, or SQLite index got stuck and you want Codex Studio to recreate a clean local workspace.',
        confirmLabel: 'Rebuild local studio',
        tone: 'danger',
        details: [
          'Local assets, thumbnails, references, masks, exports, transcripts, archived items, logs, and the SQLite library database will be deleted and recreated.',
          'The Studio UI cache and queue state will also be cleared, then diagnostics will refresh automatically.',
        ],
        note: 'Export a legacy workspace snapshot first if you need the current visual workspace metadata. This reset removes local library files from disk.',
      },
      resetStudio,
    );
  }, [requestConfirmation, resetStudio]);

  return {
    pendingConfirmation,
    closeConfirmation,
    confirmPendingAction,
    requestClearWorkspace,
    requestDeleteWorkspace,
    requestRestoreAllTrash,
    requestEmptyTrash,
    requestResetStudio,
  };
}
