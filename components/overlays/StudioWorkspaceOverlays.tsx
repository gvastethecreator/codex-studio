import React, { Suspense } from 'react';

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
        <Suspense fallback={null}>
          <TrashModal
            isOpen={isTrashModalOpen}
            onClose={closeTrash}
            trash={trash}
            onRestore={restoreFromTrash}
            onRestoreAll={restoreAllFromTrash}
            onEmpty={emptyTrash}
          />
        </Suspense>
      )}
    </>
  );
};
