import React, { Suspense } from 'react';

import { ErrorBoundary } from '../ErrorBoundary';
import { LazySurfaceFallback } from '../ui/LazySurfaceFallback';
import type { StudioWorkspaceOverlaysProps } from './types';

const TrashModal = React.lazy(() =>
  import('../TrashModal').then((m) => ({ default: m.TrashModal })),
);

export const StudioWorkspaceOverlays: React.FC<StudioWorkspaceOverlaysProps> = ({
  isTrashModalOpen,
  closeTrash,
  trash,
  restoreFromTrash,
  restoreAllFromTrash,
  emptyTrash,
}) => {
  return (
    <>
      {isTrashModalOpen && (
        <ErrorBoundary fallbackMessage="Could not load archived images.">
          <Suspense
            fallback={
              <LazySurfaceFallback
                label="Loading archive"
                className="fixed inset-0 z-50 grid place-items-center bg-black/60 text-zinc-400"
              />
            }
          >
            <TrashModal
              isOpen={isTrashModalOpen}
              onClose={closeTrash}
              trash={trash}
              onRestore={restoreFromTrash}
              onRestoreAll={restoreAllFromTrash}
              onEmpty={emptyTrash}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
};
