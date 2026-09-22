import { useCallback, useEffect, useState } from 'react';

/** The preview selection survives closing the expanded viewer. */
export function useCarouselSelection(
  workspaceId: string,
  modalImageId: string | null,
  modalOpen: boolean,
) {
  const [selection, setSelection] = useState<{ workspaceId: string; id: string } | null>(null);
  const id = selection?.workspaceId === workspaceId ? selection.id : null;
  const select = useCallback((id: string) => setSelection({ workspaceId, id }), [workspaceId]);
  useEffect(() => {
    if (modalOpen && modalImageId) select(modalImageId);
  }, [modalOpen, modalImageId, select]);
  return { id, select };
}
