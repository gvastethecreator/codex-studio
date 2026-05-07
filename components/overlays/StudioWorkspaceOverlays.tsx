import React from 'react';

import { LimitReachedModal } from '../LimitReachedModal';
import { TrashModal } from '../TrashModal';
import type { StudioWorkspaceOverlaysProps } from './types';

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
            <TrashModal
                isOpen={isTrashModalOpen}
                onClose={closeTrash}
                trash={trash}
                onRestore={restoreFromTrash}
                onRestoreAll={restoreAllFromTrash}
                onEmpty={emptyTrash}
            />
            <LimitReachedModal
                isOpen={isLimitModalOpen}
                onClose={handleDismissLimitModal}
                onDownloadAndClear={() => void handleDownloadAndClear()}
                batchCount={batchCount}
            />
        </>
    );
};
