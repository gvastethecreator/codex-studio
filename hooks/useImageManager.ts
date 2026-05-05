
import { useState, useCallback, useMemo } from 'react';
import type { GeneratedImage, GenerationBatch, GeneratedImageWithConfig } from '../types';

import { startViewTransition } from '../utils/transitionUtils';

interface UseImageManagerProps {
    log: (message: string) => void;
    handleCloseModal: () => void;
    modalImage?: GeneratedImageWithConfig | null;
    batches: GenerationBatch[];
    setBatches: (value: GenerationBatch[] | ((val: GenerationBatch[]) => GenerationBatch[])) => void;
    setTrash: (value: GenerationBatch[] | ((val: GenerationBatch[]) => GenerationBatch[])) => void;
}

/**
 * A custom hook to manage the state and actions related to the image gallery.
 * This includes handling image selection, deletion (single and multiple),
 * and providing a flattened list of all images for rendering.
 */
export const useImageManager = ({ log, handleCloseModal, modalImage, batches, setBatches, setTrash }: UseImageManagerProps) => {
    const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);

    const handleSelectionChange = useCallback((id: string, selected: boolean) => {
        startViewTransition(() => {
            setSelectedImageIds(prev =>
                selected ? [...prev, id] : prev.filter(imageId => imageId !== id)
            );
        });
    }, []);

    const handleDelete = useCallback((imageId: string) => {
        const performDelete = () => {
            const batchToDeleteFrom = batches.find(b => b.images.some(img => img.id === imageId));
            if (!batchToDeleteFrom) return;

            // Move the entire batch to trash if it's the last image, or just copy it?
            // Usually, if we delete an image, we might want to keep the batch structure.
            // But if we delete the last image of a batch, the batch is gone.
            // Let's move the batch to trash if it's being removed from active batches.
            
            const newBatches = batches.map(batch => {
                const newImages = batch.images.filter(img => img.id !== imageId);
                if (newImages.length === 0) {
                    // Move to trash
                    setTrash(prev => {
                        if (prev.some(b => b.id === batch.id)) return prev;
                        return [batch, ...prev];
                    });
                }
                return { ...batch, images: newImages };
            }).filter(batch => batch.images.length > 0);
            
            setBatches(newBatches);

            setSelectedImageIds(prev => prev.filter(id => id !== imageId));
            if (modalImage?.id === imageId) {
                handleCloseModal();
            }
            log(`Moved image ${imageId} to archives`);
        };

        startViewTransition(performDelete);
    }, [batches, modalImage, setBatches, setTrash, handleCloseModal, log]);
    
    const handleDeleteSelected = useCallback(() => {
        const performDelete = () => {
            let batchesModified = false;
            const batchesToTrash: GenerationBatch[] = [];

            const newBatches = batches.map(batch => {
                const originalImageCount = batch.images.length;
                const newImages = batch.images.filter(img => !selectedImageIds.includes(img.id));
                
                if (newImages.length < originalImageCount) {
                    batchesModified = true;
                    if (newImages.length === 0) {
                        batchesToTrash.push(batch);
                    }
                }
                return { ...batch, images: newImages };
            }).filter(batch => batch.images.length > 0); 

            if(batchesModified) {
                if (batchesToTrash.length > 0) {
                    setTrash(prev => {
                        const existingIds = new Set(prev.map(b => b.id));
                        const uniqueBatches = batchesToTrash.filter(b => !existingIds.has(b.id));
                        return [...uniqueBatches, ...prev];
                    });
                }
                setBatches(newBatches);
                log(`Moved ${selectedImageIds.length} selected images to archives.`);
                if (modalImage && selectedImageIds.includes(modalImage.id)) {
                    handleCloseModal();
                }
                setSelectedImageIds([]);
            }
        };
        startViewTransition(performDelete);
    }, [batches, selectedImageIds, setBatches, setTrash, log, modalImage, handleCloseModal]);

    // OPTIMIZATION: Memoize allImages to prevent new references on every render
    const allImages = useMemo(() => {
        return batches.flatMap(b => b.images);
    }, [batches]);
    
    const handleSelectAll = useCallback((images: GeneratedImage[]) => {
        startViewTransition(() => {
            setSelectedImageIds(images.map(img => img.id));
            log(`Selected all ${images.length} images.`);
        });
    }, [log]);

    const handleDeselectAll = useCallback(() => {
        startViewTransition(() => {
            setSelectedImageIds([]);
            log('Deselected all images.');
        });
    }, [log]);

    const handleToggleFavorite = useCallback((imgId: string) => {
        setBatches(prev => prev.map(batch => ({
            ...batch,
            images: batch.images.map(img => 
                img.id === imgId ? { ...img, isFavorite: !img.isFavorite } : img
            )
        })));
    }, [setBatches]);

    const handleClearWorkspace = useCallback((activeWorkspaceId: string) => {
        if (window.confirm("Are you sure you want to move all images in this workspace to the archives?")) {
            startViewTransition(() => {
                const batchesInWorkspace = batches.filter(batch => batch.workspaceId === activeWorkspaceId);
                if (batchesInWorkspace.length > 0) {
                    setTrash(prev => {
                        const existingIds = new Set(prev.map(b => b.id));
                        const uniqueBatches = batchesInWorkspace.filter(b => !existingIds.has(b.id));
                        return [...uniqueBatches, ...prev];
                    });
                }
                setBatches(prev => prev.filter(batch => batch.workspaceId !== activeWorkspaceId));
                setSelectedImageIds([]);
                log(`Moved workspace ${activeWorkspaceId} batches to archives.`);
            });
        }
    }, [batches, setBatches, setTrash, log]);

    return {
        allImages,
        selectedImageIds,
        handleSelectionChange,
        handleDelete,
        handleDeleteSelected,
        handleSelectAll,
        handleDeselectAll,
        handleToggleFavorite,
        handleClearWorkspace
    };
};
