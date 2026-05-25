import React, { Suspense } from 'react';

import type { StudioWorkspaceOverlaysProps } from './types';

const TrashModal = React.lazy(() =>
  import('../TrashModal').then((m) => ({ default: m.TrashModal })),
);
const LimitReachedModal = React.lazy(() =>
  import('../LimitReachedModal').then((m) => ({ default: m.LimitReachedModal })),
);

export const StudioWorkspaceOverlays: React.FC<StudioWorkspaceOverlaysProps> = ({
  isTrashModalOpen,
  closeTrash,
  trash,
  restoreFromTrash,
  restoreAllFromTrash,
  emptyTrash,
  isLimitModalOpen,
  handleDismissLimitModal,
  handleDownloadAndClear,
  batchCount,
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
      {isLimitModalOpen && (
        <Suspense fallback={null}>
          <LimitReachedModal
            isOpen={isLimitModalOpen}
            onClose={handleDismissLimitModal}
            onDownloadAndClear={() => void handleDownloadAndClear()}
            batchCount={batchCount}
          />
        </Suspense>
      )}
    </>
  );
};
