import React from 'react';

import { ConfirmationModal } from '../ConfirmationModal';
import type { StudioConfirmationOverlayProps } from './types';

export const StudioConfirmationOverlay: React.FC<StudioConfirmationOverlayProps> = ({
    pendingConfirmation,
    closeConfirmation,
    confirmPendingAction,
}) => {
    return (
        <ConfirmationModal
            isOpen={!!pendingConfirmation}
            title={pendingConfirmation?.title ?? ''}
            description={pendingConfirmation?.description ?? ''}
            confirmLabel={pendingConfirmation?.confirmLabel ?? 'Confirm'}
            cancelLabel={pendingConfirmation?.cancelLabel}
            tone={pendingConfirmation?.tone}
            details={pendingConfirmation?.details}
            note={pendingConfirmation?.note}
            onClose={closeConfirmation}
            onConfirm={confirmPendingAction}
        />
    );
};
