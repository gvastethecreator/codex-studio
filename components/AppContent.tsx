import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { useImageManager } from '../hooks/useImageManager';
import { useHashRouter } from '../hooks/useHashRouter';

import { exportToJson, readJsonFile, validateVault, downloadMultipleImagesAsZip } from '../utils/fileUtils';
import { detectRecipeFromContext } from '../utils/recipeUtils';
import { startViewTransition } from '../utils/transitionUtils';

import type { ImageGenerationConfig, GeneratedImageWithConfig, Attachment, AspectRatio, RecipeId } from '../types';

import { AppOverlays } from './AppOverlays';
import { BottomToolbar } from './ui/BottomToolbar';
import { Toolbar } from './Toolbar';
import { HeaderToolbar } from './HeaderToolbar';
import LiquidBlackBackground from './LiquidBlackBackground';
import ToastContainer from './ToastContainer';
import DropZoneOverlay from './DropZoneOverlay';
import { RecipePage } from './RecipePage';
import { RecipesView } from './RecipesView';
import { StudioPage } from './StudioPage';
import { useGlobal } from '../contexts/GlobalContext';
import { useGeneration } from '../contexts/GenerationContext';
import { useQueueManager } from '../hooks/useQueueManager';
import { useStudioOnboarding } from '../hooks/useStudioOnboarding';
import { useLocalStudioSync } from '../hooks/useLocalStudioSync';

const viewVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.98,
        filter: 'blur(4px)'
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            x: { type: "spring" as const, stiffness: 260, damping: 26 },
            opacity: { duration: 0.3 },
            scale: { duration: 0.4 },
            filter: { duration: 0.4 }
        }
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? '50%' : '-50%',
        opacity: 0,
        scale: 0.98,
        filter: 'blur(4px)',
        transition: {
            x: { type: "spring" as const, stiffness: 260, damping: 26 },
            opacity: { duration: 0.3 },
            scale: { duration: 0.4 },
            filter: { duration: 0.4 }
        }
    })
};

interface AppContentProps { }

export const AppContent: React.FC<AppContentProps> = () => {
    const {
        logs, log,
        workspaces,
        createWorkspace, deleteWorkspace, renameWorkspace,
        activeWorkspaceId, setActiveWorkspace,
        batches,
        mergeBatches, replaceBatches, archiveBatches,
        deleteImage, deleteImages, toggleImageFavorite, clearWorkspace, clearAllBatches,
        trash,
        restoreFromTrash, restoreAllFromTrash, emptyTrash,
        isBackgroundEnabled, setBackgroundEnabled,
        bgConfig,
        toasts, removeToast, addToast,
        isDebugPanelOpen, toggleDebugPanel
    } = useGlobal();

    const { route, navigateToStudio, navigateToRecipes, navigateToRecipe, openEditor: openEditorRoute, openModal: openModalRoute, closeOverlay } = useHashRouter();

    const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [hasDismissedLimitModal, setHasDismissedLimitModal] = useState(false);

    const { config, pipeline, recipe, ui, modal } = useGeneration();

    const {
        jobs,
        enqueue,
        retry,
        cancelJob,
        removeJob,
        clearCompleted,
        isResting
    } = useQueueManager({
        executeGeneration: pipeline.executeGeneration,
        isGenerating: pipeline.isGenerating,
        addToast
    });

    const [isQueueOpen, setIsQueueOpen] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [imageToEdit, setImageToEdit] = useState<Attachment | null>(null);
    const [previewRatio, setPreviewRatio] = useState<AspectRatio | null>(null);
    const [isToolbarVisible, setIsToolbarVisible] = useState(true);
    const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
    const { studioJobs, mergedLogs, activeServerJobCount, verifyCodexSession, recoverOrphanedBatches } = useLocalStudioSync({
        logs,
        log,
        batches,
        mergeBatches,
        addToast,
    });
    const {
        apiBase,
        closeOnboarding,
        completeOnboarding,
        ensureAppServer,
        error: onboardingError,
        health: onboardingHealth,
        isChecking: isCheckingOnboarding,
        isDesktopRuntime,
        isOpen: isOnboardingOpen,
        isReady: isOnboardingReady,
        isStartingAppServer,
        openOnboarding,
        refreshHealth: refreshOnboardingHealth,
    } = useStudioOnboarding({
        log,
        addToast,
        shouldAutoOpen: batches.length === 0,
    });

    const [direction, setDirection] = useState(0);
    const previousViewIndexRef = useRef(0);

    const handleViewChange = useCallback((newView: 'studio' | 'recipes') => {
        if (newView === 'studio') {
            navigateToStudio();
            return;
        }

        navigateToRecipes();
    }, [navigateToRecipes, navigateToStudio]);

    const handleRecipeSelection = useCallback((id: RecipeId) => {
        if (!id) return;
        navigateToRecipe(id);
    }, [navigateToRecipe]);

    const handleCloseRecipe = useCallback(() => {
        navigateToRecipes();
    }, [navigateToRecipes]);

    const handleOpenModal = useCallback((image: GeneratedImageWithConfig) => {
        modal.openModal(image);
        openModalRoute();
    }, [modal, openModalRoute]);

    const handleCloseModal = useCallback(() => {
        modal.closeModal();
        closeOverlay();
    }, [closeOverlay, modal]);

    useEffect(() => {
        const currentIndex = route.view === 'studio' ? 0 : route.view === 'recipes' ? 1 : 2;
        if (currentIndex !== previousViewIndexRef.current) {
            setDirection(currentIndex > previousViewIndexRef.current ? 1 : -1);
            previousViewIndexRef.current = currentIndex;
        }
    }, [route.view]);

    useEffect(() => {
        startViewTransition(() => {
            if (route.view === 'recipe' && route.activeRecipeId) {
                if (recipe.activeRecipe !== route.activeRecipeId) {
                    recipe.setActiveRecipe(route.activeRecipeId);
                }
                return;
            }

            if (recipe.activeRecipe) {
                recipe.setActiveRecipe(null);
            }
        });
    }, [recipe, route.activeRecipeId, route.view]);

    useEffect(() => {
        startViewTransition(() => {
            if (route.overlay === 'editor') {
                if (!imageToEdit) {
                    closeOverlay();
                    return;
                }

                setIsEditorOpen(true);
                return;
            }

            if (route.overlay === 'modal') {
                if (!modal.modalImage) {
                    closeOverlay();
                }
                return;
            }

            if (modal.isModalOpen) {
                modal.closeModal();
            }

            if (isEditorOpen) {
                setIsEditorOpen(false);
                setImageToEdit(null);
            }
        });
    }, [closeOverlay, imageToEdit, isEditorOpen, modal, route.overlay]);

    const workspaceBatches = useMemo(() => {
        return batches.filter(b => b.workspaceId === activeWorkspaceId || (!b.workspaceId && activeWorkspaceId === 'default'));
    }, [batches, activeWorkspaceId]);

    const {
        allImages,
        selectedImageIds,
        handleSelectionChange,
        handleDelete,
        handleDeleteSelected,
        handleSelectAll,
        handleDeselectAll,
        handleToggleFavorite,
        handleClearWorkspace
    } = useImageManager({
        batches: workspaceBatches,
        deleteImage,
        deleteImages,
        toggleImageFavorite,
        clearWorkspace,
        log,
        modalImage: modal.modalImage,
        handleCloseModal
    });

    const imagesWithConfig = useMemo(() => {
        return allImages
            .map(img => {
                const batch = batches.find(b => b.id === img.batchId);
                return { ...img, config: batch?.config } as GeneratedImageWithConfig;
            })
            .sort((a, b) => {
                if (a.isFavorite === b.isFavorite) return b.createdAt - a.createdAt;
                return a.isFavorite ? -1 : 1;
            });
    }, [allImages, batches]);

    const workspacesWithThumbs = useMemo(() => {
        return workspaces.map(ws => {
            const wBatches = batches.filter(b => b.workspaceId === ws.id || (!b.workspaceId && ws.id === 'default'));
            const sorted = wBatches.sort((a, b) => b.createdAt - a.createdAt);
            const lastBatch = sorted[0];
            const lastImg = lastBatch?.images[0]?.thumbnail || lastBatch?.images[0]?.src;
            const count = wBatches.reduce((acc, b) => acc + b.images.length, 0);
            return { ...ws, lastImage: lastImg, imageCount: count };
        });
    }, [workspaces, batches]);

    useEffect(() => {
        const handleGlobalPaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (!items) return;

            const files: File[] = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) files.push(file);
                }
            }

            if (files.length > 0) {
                config.handlePastedFiles(files);
            }
        };

        window.addEventListener('paste', handleGlobalPaste);
        return () => window.removeEventListener('paste', handleGlobalPaste);
    }, [config]);

    const handleAddWorkspace = useCallback(() => {
        startViewTransition(() => {
            const newId = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            createWorkspace({ id: newId, createdAt: Date.now() }, { activate: true });
            addToast('New workspace synthesized', 'success');
        });
    }, [createWorkspace, addToast]);

    const handleDeleteWorkspace = useCallback((id: string) => {
        if (id === 'default') {
            addToast('The Default Matrix cannot be purged', 'error');
            return;
        }
        startViewTransition(() => {
            deleteWorkspace(id);
            addToast('Workspace purged from archives', 'info');
        });
    }, [deleteWorkspace, addToast]);

    const handleRenameWorkspace = useCallback((id: string, newName: string) => {
        startViewTransition(() => {
            renameWorkspace(id, newName);
            addToast('Workspace renamed', 'success');
        });
    }, [renameWorkspace, addToast]);

    const handleGenerate = useCallback((promptOverride?: string, configOverrides?: Partial<ImageGenerationConfig>, options?: { force?: boolean; preventModal?: boolean }) => {
        if (modal.isModalOpen && !options?.preventModal) {
            handleCloseModal();
        }

        const finalPrompt = (promptOverride !== undefined ? promptOverride : config.generationConfig.prompt)?.trim() ?? '';
        if (!finalPrompt) {
            addToast('Escribe un prompt antes de generar', 'info');
            return;
        }

        const finalConfig: ImageGenerationConfig = { ...config.generationConfig, ...configOverrides, prompt: finalPrompt };
        enqueue(finalPrompt, finalConfig, options?.force);
    }, [addToast, config.generationConfig, enqueue, handleCloseModal, modal.isModalOpen]);

    const handleEnhancePrompt = useCallback(async () => {
        if (isEnhancingPrompt) return;
        setIsEnhancingPrompt(true);
        try {
            const currentPrompt = (config.generationConfig.prompt ?? '').trim();
            if (!currentPrompt) {
                addToast('Escribe un prompt antes de refinarlo', 'info');
                return;
            }

            config.updateGenerationConfig('prompt', [
                currentPrompt,
                '',
                'Refinement notes:',
                '- High-quality local image generation through Codex ImageGen.',
                '- Preserve the requested subject, composition, lighting, material detail, and aspect ratio.',
            ].join('\n'));
            addToast('Prompt preparado para Codex ImageGen', 'success');
        } catch (error) { addToast(error instanceof Error ? error.message : 'Prompt refinement failed', 'error'); }
        finally { setIsEnhancingPrompt(false); }
    }, [addToast, config, isEnhancingPrompt]);

    const handleExecuteEdit = useCallback(async (original: Attachment, mask: string, prompt: string) => {
        setIsEditingImage(true);
        try {
            await pipeline.executeEdit(original, mask, prompt);
            closeOverlay();
            setIsEditorOpen(false);
            setImageToEdit(null);
        } catch {
            // Pipeline already reports failures.
        } finally {
            setIsEditingImage(false);
        }
    }, [closeOverlay, pipeline]);

    const handleLoadRecipe = useCallback((nextConfig: ImageGenerationConfig) => {
        config.setGenerationConfig(nextConfig);
        addToast('Recipe restored', 'success');

        const detectedRecipe = nextConfig.recipeId ?? detectRecipeFromContext(nextConfig.recipeContext);
        if (detectedRecipe) {
            handleRecipeSelection(detectedRecipe);
        } else {
            handleViewChange('studio');
        }
    }, [addToast, config, handleRecipeSelection, handleViewChange]);

    const handleImportVault = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const data = await readJsonFile(file);

            if (!validateVault(data)) {
                throw new Error("Invalid vault format");
            }

            replaceBatches(data, { ensureWorkspaces: true });
            addToast('Vault Imported Successfully', 'success');
        } catch (err: unknown) {
            addToast('Invalid Vault File', 'error');
        }
    }, [addToast, replaceBatches]);

    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (batches.length > 100 && !hasDismissedLimitModal && !isLimitModalOpen) {
            setIsLimitModalOpen(true);
        }
    }, [batches.length, hasDismissedLimitModal, isLimitModalOpen]);

    const handleDownloadAndClear = async () => {
        try {
            const allImages = batches.flatMap(b => b.images.map(img => ({ ...img, config: b.config } as GeneratedImageWithConfig)));
            if (allImages.length > 0) {
                await downloadMultipleImagesAsZip(allImages, `workspace-export-${Date.now()}.zip`);
            }

            // Move all to trash
            archiveBatches(batches);
            clearAllBatches();

            setIsLimitModalOpen(false);
            setHasDismissedLimitModal(true);
            addToast('Workspace cleared and downloaded successfully', 'success');
        } catch (error) {
            console.error('Failed to download and clear:', error);
            addToast('Failed to download and clear workspace', 'error');
        }
    };

    const handleDismissLimitModal = () => {
        setIsLimitModalOpen(false);
        setHasDismissedLimitModal(true);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    }, [isDragging]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files as Iterable<File>).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            config.handlePastedFiles(files);
        }
    }, [config]);

    const currentView = route.view === 'studio' ? 'studio' : 'recipes';

    return (
        <div
            className="fixed inset-0 text-white font-sans flex flex-col selection:bg-accent-500/35 selection:text-white overflow-hidden"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isBackgroundEnabled && (
                <LiquidBlackBackground
                    isGenerating={pipeline.isGenerating}
                    activeModel={config.generationConfig.model}
                    config={bgConfig}
                />
            )}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />

            {!modal.isModalOpen && !pipeline.isGenerating && (
                <HeaderToolbar
                    imageCount={allImages.length}
                    selectedImageCount={selectedImageIds.length}
                    isGenerating={pipeline.isGenerating}
                    isToolbarVisible={isToolbarVisible}
                    onToggleToolbar={() => startViewTransition(() => setIsToolbarVisible(p => !p))}
                    workspaces={workspacesWithThumbs}
                    activeWorkspaceId={activeWorkspaceId}
                    onSwitchWorkspace={(id) => startViewTransition(() => setActiveWorkspace(id))}
                    onAddWorkspace={handleAddWorkspace}
                    onDeleteWorkspace={handleDeleteWorkspace}
                    onRenameWorkspace={handleRenameWorkspace}
                    currentView={currentView}
                    onViewChange={handleViewChange}
                    activeRecipe={recipe.activeRecipe}
                    onCloseRecipe={handleCloseRecipe}
                    onOpenDashboard={() => startViewTransition(() => setIsDashboardModalOpen(true))}
                    onOpenOnboarding={() => startViewTransition(() => openOnboarding())}
                    onOpenTrash={() => startViewTransition(() => setIsTrashModalOpen(true))}
                    trashCount={trash.length}
                    onToggleDebug={toggleDebugPanel}
                />
            )}

            <main
                className="flex-1 relative overflow-hidden z-10 w-full min-h-0"
                onClick={() => { ui.setIsInteractingWithToolbar(false); ui.setIsKeyPopoverOpen(false); }}
            >
                <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                    {route.view === 'recipe' && recipe.activeRecipe ? (
                        <motion.div
                            key={`recipe-${recipe.activeRecipe}`}
                            custom={direction}
                            variants={viewVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="absolute inset-0 w-full h-full overflow-hidden"
                        >
                            <RecipePage
                                activeRecipe={recipe.activeRecipe}
                                generationConfig={config.generationConfig}
                                updateGenerationConfig={config.updateGenerationConfig}
                                updateAttachment={config.updateAttachment}
                                handlePastedFiles={config.handlePastedFiles}
                                handleGenerate={handleGenerate}
                                isGenerating={pipeline.isGenerating}
                                imagesWithConfig={imagesWithConfig}
                                openModal={handleOpenModal}
                                handleAddToContext={config.handleAddToContext}
                            />
                        </motion.div>
                    ) : route.view === 'studio' ? (
                        <motion.div
                            key="studio"
                            custom={direction}
                            variants={viewVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="absolute inset-0 w-full h-full flex flex-row overflow-hidden"
                        >
                            <StudioPage
                                isModalOpen={modal.isModalOpen}
                                workspaces={workspaces}
                                mergedLogs={mergedLogs}
                                batchesCount={batches.length}
                                allImages={allImages}
                                imagesWithConfig={imagesWithConfig}
                                selectedImageIds={selectedImageIds}
                                activeWorkspaceId={activeWorkspaceId}
                                openModal={handleOpenModal}
                                handleSelectionChange={handleSelectionChange}
                                handleGenerate={handleGenerate}
                                handleAddToContext={config.handleAddToContext}
                                handleLoadRecipe={handleLoadRecipe}
                                handleDelete={handleDelete}
                                handleToggleFavorite={handleToggleFavorite}
                                isGenerating={pipeline.isGenerating}
                                transitioningImageId={modal.transitioningImageId}
                                activeModalImageId={modal.activeCarouselId}
                                handleSelectAll={handleSelectAll}
                                handleDeselectAll={handleDeselectAll}
                                handleDeleteSelected={handleDeleteSelected}
                                handleClearWorkspace={handleClearWorkspace}
                                previewRatio={previewRatio}
                                generationAspectRatio={config.generationConfig.aspectRatio}
                                isInteractingWithToolbar={ui.isInteractingWithToolbar}
                                isQueueOpen={isQueueOpen}
                                setIsQueueOpen={setIsQueueOpen}
                                jobs={jobs}
                                studioJobs={studioJobs}
                                retry={retry}
                                cancelJob={cancelJob}
                                removeJob={removeJob}
                                clearCompleted={clearCompleted}
                                isResting={isResting}
                                batchesForExport={imagesWithConfig}
                                exportBatches={() => exportToJson(batches, `vault-${Date.now()}.json`)}
                                handleImportVault={handleImportVault}
                                isBackgroundEnabled={isBackgroundEnabled}
                                setBackgroundEnabled={setBackgroundEnabled}
                                activeServerJobCount={activeServerJobCount}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="recipes-list"
                            custom={direction}
                            variants={viewVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="absolute inset-0 w-full h-full overflow-hidden"
                        >
                            <RecipesView onSelectRecipe={handleRecipeSelection} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {isToolbarVisible && !modal.isModalOpen && (route.view === 'studio' || recipe.activeRecipe) && (
                <BottomToolbar className="w-full relative z-30 shrink-0">
                    <DropZoneOverlay isVisible={isDragging} />
                    <Toolbar
                        generationConfig={config.generationConfig}
                        updateConfig={config.updateGenerationConfig}
                        updateAttachment={config.updateAttachment}
                        onGenerate={handleGenerate}
                        isGenerating={pipeline.isGenerating}
                        generationStartTime={pipeline.generationStartTime}
                        onFileSelect={config.handleFileSelect}
                        onFilesDrop={config.handlePastedFiles}
                        onRemoveAttachment={config.handleRemoveAttachment}
                        isEnhancingPrompt={isEnhancingPrompt}
                        onEnhancePrompt={handleEnhancePrompt}
                        setPreviewRatio={setPreviewRatio}
                        setIsInteracting={ui.setIsInteractingWithToolbar}
                        onOpenEditor={(att) => {
                            startViewTransition(() => {
                                setImageToEdit(att);
                                setIsEditorOpen(true);
                                openEditorRoute();
                            });
                        }}
                        isKeyPopoverOpen={ui.isKeyPopoverOpen}
                        onOpenKeySelector={() => startViewTransition(() => ui.setIsKeyPopoverOpen(!ui.isKeyPopoverOpen))}
                        onSelectKey={async () => {
                            await verifyCodexSession();
                            startViewTransition(() => ui.setIsKeyPopoverOpen(false));
                        }}
                        maxAttachments={config.maxAttachments}
                    />
                </BottomToolbar>
            )}

            <AppOverlays
                modalImage={modal.modalImage}
                imagesWithConfig={imagesWithConfig}
                activeGenerationConfig={pipeline.activeGenerationConfig}
                closeModal={handleCloseModal}
                handleDelete={handleDelete}
                handleGenerate={handleGenerate}
                handleAddToContext={config.handleAddToContext}
                handleLoadRecipe={handleLoadRecipe}
                handleToggleFavorite={handleToggleFavorite}
                setActiveCarouselId={modal.setActiveCarouselId}
                isEditorOpen={isEditorOpen}
                closeEditor={() => {
                    startViewTransition(() => {
                        setIsEditorOpen(false);
                        setImageToEdit(null);
                        closeOverlay();
                    });
                }}
                imageToEdit={imageToEdit}
                handleExecuteEdit={handleExecuteEdit}
                isEditingImage={isEditingImage}
                isDebugPanelOpen={isDebugPanelOpen}
                toggleDebugPanel={toggleDebugPanel}
                mergedLogs={mergedLogs}
                isDashboardModalOpen={isDashboardModalOpen}
                closeDashboard={() => startViewTransition(() => setIsDashboardModalOpen(false))}
                batches={batches}
                workspaces={workspaces}
                handleImportVault={handleImportVault}
                handleDeepScan={recoverOrphanedBatches}
                apiBase={apiBase}
                onboardingError={onboardingError}
                onboardingHealth={onboardingHealth}
                isCheckingOnboarding={isCheckingOnboarding}
                isDesktopRuntime={isDesktopRuntime}
                isOnboardingOpen={isOnboardingOpen}
                isOnboardingReady={isOnboardingReady}
                isStartingAppServer={isStartingAppServer}
                closeOnboarding={() => startViewTransition(() => closeOnboarding())}
                completeOnboarding={() => startViewTransition(() => completeOnboarding())}
                refreshOnboardingHealth={() => void refreshOnboardingHealth()}
                ensureAppServer={() => void ensureAppServer()}
                isTrashModalOpen={isTrashModalOpen}
                closeTrash={() => startViewTransition(() => setIsTrashModalOpen(false))}
                trash={trash}
                restoreFromTrash={restoreFromTrash}
                restoreAllFromTrash={restoreAllFromTrash}
                emptyTrash={emptyTrash}
                isLimitModalOpen={isLimitModalOpen}
                handleDismissLimitModal={handleDismissLimitModal}
                handleDownloadAndClear={handleDownloadAndClear}
            />
        </div>
    );
};
