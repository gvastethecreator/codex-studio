import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Bug, FolderSync, Share, Sparkles, Terminal, Activity, Database } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { usePanelManager } from '../hooks/usePanelManager';
import { useImageManager } from '../hooks/useImageManager';
import { useModalManager } from '../hooks/useModalManager';

import { exportToJson, readJsonFile, validateVault, downloadMultipleImagesAsZip } from '../utils/fileUtils';
import { detectRecipeFromContext } from '../utils/recipeUtils';
import { startViewTransition } from '../utils/transitionUtils';
import { MODELS } from '../constants';
import { createStudioJob, listProjects, listStudioAssets, toStudioAssetUrl, waitForStudioJob } from '../services/localStudioService';

import type { ImageGenerationConfig, GenerationBatch, GeneratedImageWithConfig, Attachment, AspectRatio, Workspace, RecipeId } from '../types';

import { ImageGrid } from './ImageGrid';
import { Toolbar } from './Toolbar';
import { HeaderToolbar } from './HeaderToolbar';
import { DebugPanel } from './DebugPanel';
import LiquidBlackBackground from './LiquidBlackBackground';
import ImageCarousel from './ImageCarousel';
import ToastContainer from './ToastContainer';
import DropZoneOverlay from './DropZoneOverlay';
import { ImageEditorModal } from './ImageEditorModal';
import { FormatPreview } from './FormatPreview';
import { SidePanel } from './SidePanel';
import { RecipesView } from './RecipesView';
import { ErrorBoundary } from './ErrorBoundary';
import { RecipeRouter } from './RecipeRouter';
import { TrashModal } from './TrashModal';
import { LimitReachedModal } from './LimitReachedModal';

import { LeftDebugPanel } from './LeftDebugPanel';
import { RightSystemPanel } from './RightSystemPanel';
import { QueuePanel } from './QueuePanel';
import { DashboardModal } from './DashboardModal';
import { useGlobal } from '../contexts/GlobalContext';
import { useGeneration } from '../contexts/GenerationContext';
import { useQueueManager } from '../hooks/useQueueManager';
import { useLocalStudioSync } from '../hooks/useLocalStudioSync';

import { BottomToolbar } from './ui/BottomToolbar';

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

interface AppContentProps {}

export const AppContent: React.FC<AppContentProps> = () => {
    // Global Context
    const {
        logs, log,
        workspaces, setWorkspaces,
        activeWorkspaceId, setActiveWorkspaceId,
        batches, setBatches,
        trash, setTrash,
        restoreFromTrash, restoreAllFromTrash,
        isBackgroundEnabled, setIsBackgroundEnabled,
        bgConfig,
        toasts, removeToast, addToast,
        isDebugPanelOpen, toggleDebugPanel
    } = useGlobal();

    const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [hasDismissedLimitModal, setHasDismissedLimitModal] = useState(false);

    // Generation Context
    const {
        activeRecipe, setActiveRecipe,
        modalImage, setModalImage,
        activeCarouselId, setActiveCarouselId,
        transitioningImageId,
        openModal, closeModal, isModalOpen,
        isInteractingWithToolbar, setIsInteractingWithToolbar,
        isKeyPopoverOpen, setIsKeyPopoverOpen,
        generationConfig,
        setGenerationConfig,
        updateGenerationConfig,
        updateAttachment,
        handleFileSelect,
        handlePastedFiles,
        handleRemoveAttachment,
        handleAddToContext,
        maxAttachments,
        isGenerating,
        executeGeneration,
        activeGenerationConfig,
        generationStartTime
    } = useGeneration();

    // Queue Manager
    const { 
        jobs, 
        enqueue, 
        retry, 
        cancelJob,
        removeJob, 
        clearCompleted, 
        isResting 
    } = useQueueManager({ 
        executeGeneration, 
        isGenerating, 
        addToast 
    });

    // Local UI States
    const [currentView, setCurrentView] = useState<'studio' | 'recipes'>('studio');
    const [isQueueOpen, setIsQueueOpen] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [imageToEdit, setImageToEdit] = useState<Attachment | null>(null);
    const [previewRatio, setPreviewRatio] = useState<AspectRatio | null>(null);
    const [isToolbarVisible, setIsToolbarVisible] = useState(true);
    const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
    const { studioJobs, mergedLogs, activeServerJobCount, verifyCodexSession } = useLocalStudioSync({
        logs,
        log,
        setBatches,
        addToast,
    });
    
    // Navigation Direction Logic
    const [navIndex, setNavIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const handleViewChange = useCallback((newView: 'studio' | 'recipes') => {
        window.location.hash = newView === 'studio' ? '' : 'recipes';
    }, []);

    const handleRecipeSelection = useCallback((id: RecipeId) => {
        window.location.hash = `recipe-${id}`;
    }, []);

    const handleCloseRecipe = useCallback(() => {
        window.location.hash = 'recipes';
    }, []);

    useEffect(() => {
        // Initial sync on mount
        const hash = window.location.hash.replace('#', '');
        if (hash === 'modal' || hash === 'editor') {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } else if (hash.startsWith('recipe-')) {
            const recipeId = hash.replace('recipe-', '') as RecipeId;
            setActiveRecipe(recipeId);
        } else if (hash === 'recipes') {
            setCurrentView('recipes');
        }
    }, [setActiveRecipe]);

    useEffect(() => {
        const handleHashChange = () => {
            startViewTransition(() => {
                const hash = window.location.hash.replace('#', '');
                
                if (hash === 'editor') {
                    if (!imageToEdit) {
                        window.history.replaceState(null, '', window.location.pathname + window.location.search);
                    } else {
                        setIsEditorOpen(true);
                    }
                } 
                else if (hash === 'modal') {
                    if (!modalImage) {
                        window.history.replaceState(null, '', window.location.pathname + window.location.search);
                    }
                }
                else if (hash.startsWith('recipe-')) {
                    const recipeId = hash.replace('recipe-', '') as RecipeId;
                    if (isEditorOpen) { setIsEditorOpen(false); setImageToEdit(null); }
                    if (isModalOpen) closeModal();
                    
                    if (activeRecipe !== recipeId) {
                        setDirection(1);
                        setNavIndex(2);
                        setActiveRecipe(recipeId);
                    }
                }
                else if (hash === 'recipes') {
                    if (isEditorOpen) { setIsEditorOpen(false); setImageToEdit(null); }
                    if (isModalOpen) closeModal();
                    
                    if (activeRecipe) {
                        setDirection(-1);
                        setNavIndex(1);
                        setActiveRecipe(null);
                    }
                    if (currentView !== 'recipes') {
                        setDirection(1);
                        setNavIndex(1);
                        setCurrentView('recipes');
                    }
                }
                else {
                    // empty hash -> studio
                    if (isEditorOpen) { setIsEditorOpen(false); setImageToEdit(null); }
                    if (isModalOpen) closeModal();
                    
                    if (activeRecipe) {
                        setDirection(-1);
                        setNavIndex(0);
                        setActiveRecipe(null);
                    }
                    if (currentView !== 'studio') {
                        setDirection(-1);
                        setNavIndex(0);
                        setCurrentView('studio');
                    }
                }
            });
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [imageToEdit, modalImage, isEditorOpen, isModalOpen, activeRecipe, currentView, closeModal, setActiveRecipe]);

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
        setBatches: (valOrFn) => {
            setBatches(prev => {
                const next = typeof valOrFn === 'function' ? valOrFn(workspaceBatches) : valOrFn;
                const otherBatches = prev.filter(b => b.workspaceId !== activeWorkspaceId && (b.workspaceId || activeWorkspaceId !== 'default'));
                return [...otherBatches, ...next];
            });
        }, 
        setTrash,
        log, 
        modalImage, 
        handleCloseModal: closeModal
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
            handlePastedFiles(files);
        }
        };

        window.addEventListener('paste', handleGlobalPaste);
        return () => window.removeEventListener('paste', handleGlobalPaste);
    }, [handlePastedFiles]);

    const handleAddWorkspace = useCallback(() => {
        startViewTransition(() => {
            const newId = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            setWorkspaces(prev => [...prev, { id: newId, createdAt: Date.now() }]);
            setActiveWorkspaceId(newId);
            addToast('New workspace synthesized', 'success');
        });
    }, [setWorkspaces, addToast, setActiveWorkspaceId]);

    const handleDeleteWorkspace = useCallback((id: string) => {
        if (id === 'default') {
            addToast('The Default Matrix cannot be purged', 'error');
            return;
        }
        startViewTransition(() => {
            setWorkspaces(prev => prev.filter(ws => ws.id !== id));
            setBatches(prev => prev.filter(b => b.workspaceId !== id));
            if (activeWorkspaceId === id) setActiveWorkspaceId('default');
            addToast('Workspace purged from archives', 'info');
        });
    }, [activeWorkspaceId, setWorkspaces, setBatches, addToast, setActiveWorkspaceId]);

    const handleRenameWorkspace = useCallback((id: string, newName: string) => {
        startViewTransition(() => {
            setWorkspaces(prev => prev.map(ws => ws.id === id ? { ...ws, name: newName } : ws));
            addToast('Workspace renamed', 'success');
        });
    }, [setWorkspaces, addToast]);

    const handleGenerate = useCallback((promptOverride?: string, configOverrides?: Partial<ImageGenerationConfig>, options?: { force?: boolean; preventModal?: boolean }) => { 
        if (isModalOpen && !options?.preventModal) {
            closeModal();
        }
        
        const finalPrompt = promptOverride !== undefined ? promptOverride : generationConfig.prompt;
        const finalConfig = { ...generationConfig, ...configOverrides };

        // If it's a manual generate from toolbar (no promptOverride), we enqueue
        // If it's a regenerate (promptOverride provided), we might want to enqueue too or execute immediately
        // The user said "todos los trabajos que iremos enviando", so let's enqueue everything
        enqueue(finalPrompt, finalConfig, options?.force);
    }, [enqueue, generationConfig, isModalOpen, closeModal]);

    const handleEnhancePrompt = useCallback(async () => {
        if (isEnhancingPrompt) return;
        setIsEnhancingPrompt(true);
        try {
            const currentPrompt = generationConfig.prompt.trim();
            if (!currentPrompt) {
                addToast('Escribe un prompt antes de refinarlo', 'info');
                return;
            }

            updateGenerationConfig('prompt', [
                currentPrompt,
                '',
                'Refinement notes:',
                '- High-quality local image generation through Codex ImageGen.',
                '- Preserve the requested subject, composition, lighting, material detail, and aspect ratio.',
            ].join('\n'));
            addToast('Prompt preparado para Codex ImageGen', 'success');
        } catch (error) { addToast(error instanceof Error ? error.message : 'Prompt refinement failed', 'error'); }
        finally { setIsEnhancingPrompt(false); }
    }, [isEnhancingPrompt, generationConfig.prompt, addToast, updateGenerationConfig]);

    const handleExecuteEdit = useCallback(async (original: Attachment, mask: string, prompt: string) => {
        setIsEditingImage(true);
        try {
            const projects = await listProjects();
            const projectId = projects[0]?.id;
            const job = await createStudioJob({
                projectId,
                kind: 'codex_imagegen',
                prompt: [
                    prompt,
                    '',
                    'Use the original image and mask reference files as edit context.',
                    `Original attachment: ${original.name}`,
                    `Mask reference: ${mask ? 'provided' : 'not provided'}`,
                ].join('\n'),
                references: [
                    {
                        name: original.name,
                        dataUrl: original.dataUrl,
                        strength: original.strength,
                    },
                    ...(mask ? [{
                        name: `${original.name.replace(/\.[^.]+$/, '')}-mask.png`,
                        dataUrl: mask,
                        strength: 1,
                    }] : []),
                ],
            });
            const completed = await waitForStudioJob(job.id);
            const assets = await listStudioAssets();
            const asset = assets.find(candidate => candidate.jobId === completed.id);
            if (!asset) throw new Error('Codex edit completed without a local asset');

            const url = toStudioAssetUrl(asset.publicUrl);
            const batchId = `edit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const newBatch: GenerationBatch = { 
                id: batchId, 
                workspaceId: activeWorkspaceId,
                config: { ...generationConfig, prompt, model: MODELS.CODEX_IMAGEGEN }, 
                images: [{ id: asset.id, src: url, batchId, createdAt: Date.now(), isFavorite: false }], 
                createdAt: Date.now() 
            };
            setBatches(p => {
                const newBatches = [newBatch, ...p];
                const workspaceBatches = newBatches.filter(b => b.workspaceId === activeWorkspaceId);
                const otherBatches = newBatches.filter(b => b.workspaceId !== activeWorkspaceId);
                return [...workspaceBatches.slice(0, 20), ...otherBatches];
            });
            addToast('Matrix edit complete', 'success');
            if (window.location.hash === '#editor') {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
            setIsEditorOpen(false);
            setImageToEdit(null);
        } catch (e) {
            addToast(e instanceof Error ? e.message : 'Local Codex edit failed', 'error');
        } finally {
            setIsEditingImage(false);
        }
    }, [generationConfig, activeWorkspaceId, setBatches, addToast]);

    const handleLoadRecipe = useCallback((config: ImageGenerationConfig) => {
        setGenerationConfig(config);
        addToast('Recipe restored', 'success');
        
        // Intelligent Recipe Redirection
        const detectedRecipe = detectRecipeFromContext(config.recipeContext);
        if (detectedRecipe) {
            handleRecipeSelection(detectedRecipe);
        } else {
            handleViewChange('studio');
        }
    }, [setGenerationConfig, addToast, handleRecipeSelection, handleViewChange]);

    const handleImportVault = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const data = await readJsonFile(file);
            
            if (!validateVault(data)) {
                throw new Error("Invalid vault format");
            }

            // Restore workspaces associated with imported batches
            setWorkspaces(currentWorkspaces => {
                const existingIds = new Set(currentWorkspaces.map(w => w.id));
                const newWorkspaces: Workspace[] = [];
                
                data.forEach(batch => {
                    if (batch.workspaceId && !existingIds.has(batch.workspaceId)) {
                        newWorkspaces.push({ id: batch.workspaceId, createdAt: Date.now(), name: `Imported (${batch.workspaceId.slice(-4)})` });
                        existingIds.add(batch.workspaceId);
                    }
                });
                
                return [...currentWorkspaces, ...newWorkspaces];
            });

            setBatches(data);
            addToast('Vault Imported Successfully', 'success');
        } catch (err: unknown) { 
            addToast('Invalid Vault File', 'error'); 
        }
    }, [setWorkspaces, setBatches, addToast]);

    const handleDeepScan = useCallback(async () => {
        addToast('Iniciando Deep Scan Recovery...', 'info');
        try {
            const { getAllEntries } = await import('../utils/idb');
            const entries = await getAllEntries();
            
            let recoveredCount = 0;
            const knownKeys = ['session-logs', 'app-workspaces', 'generation-batches', 'generation-trash', 'user-wallet-balance', 'bg-config', 'isBackgroundEnabled'];
            
            const newBatches: GenerationBatch[] = [];
            
            // 1. Scan IndexedDB
            for (const entry of entries) {
                if (typeof entry.key === 'string' && !knownKeys.includes(entry.key)) {
                    if (Array.isArray(entry.value) && validateVault(entry.value)) {
                        newBatches.push(...entry.value);
                    } else if (validateVault([entry.value])) {
                        newBatches.push(entry.value);
                    }
                }
            }

            // 2. Scan LocalStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && !knownKeys.includes(key)) {
                    try {
                        const item = localStorage.getItem(key);
                        if (item) {
                            const parsed = JSON.parse(item);
                            if (Array.isArray(parsed) && validateVault(parsed)) {
                                newBatches.push(...parsed);
                            } else if (validateVault([parsed])) {
                                newBatches.push(parsed);
                            }
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }

            if (newBatches.length > 0) {
                setBatches(prev => {
                    const existingIds = new Set(prev.map(b => b.id));
                    const uniqueNew = newBatches.filter(b => !existingIds.has(b.id));
                    recoveredCount = uniqueNew.length;
                    return [...uniqueNew, ...prev].slice(0, 100);
                });
            }

            if (trash.length > 0) {
                addToast(`Se encontraron ${trash.length} lotes en la papelera.`, 'info');
            }

            if (recoveredCount > 0) {
                addToast(`¡Éxito! Se recuperaron ${recoveredCount} lotes.`, 'success');
            } else {
                addToast('Deep Scan completado: No se encontraron nuevos fragmentos.', 'info');
            }
        } catch (err) {
            console.error('Deep Scan Error:', err);
            addToast('Error durante el Deep Scan', 'error');
        }
    }, [trash.length, setBatches, addToast]);

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
            setTrash(prev => {
                const existingIds = new Set(prev.map(b => b.id));
                const uniqueBatches = batches.filter(b => !existingIds.has(b.id));
                return [...uniqueBatches, ...prev];
            });
            setBatches([]);
            
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
            handlePastedFiles(files);
        }
    }, [handlePastedFiles]);

    return (
        <div 
            className="fixed inset-0 text-white font-sans flex flex-col selection:bg-accent-500/35 selection:text-white overflow-hidden"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
        {isBackgroundEnabled && (
            <LiquidBlackBackground 
                isGenerating={isGenerating} 
                activeModel={generationConfig.model} 
                config={bgConfig}
            />
        )}
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        
        {!isModalOpen && !isGenerating && (
            <HeaderToolbar
                imageCount={allImages.length}
                selectedImageCount={selectedImageIds.length}
                isGenerating={isGenerating}
                isToolbarVisible={isToolbarVisible}
                onToggleToolbar={() => startViewTransition(() => setIsToolbarVisible(p => !p))}
                workspaces={workspacesWithThumbs}
                activeWorkspaceId={activeWorkspaceId}
                onSwitchWorkspace={(id) => startViewTransition(() => setActiveWorkspaceId(id))}
                onAddWorkspace={handleAddWorkspace}
                onDeleteWorkspace={handleDeleteWorkspace}
                onRenameWorkspace={handleRenameWorkspace}
                currentView={currentView}
                onViewChange={handleViewChange}
                activeRecipe={activeRecipe}
                onCloseRecipe={handleCloseRecipe}
                onOpenDashboard={() => startViewTransition(() => setIsDashboardModalOpen(true))}
                onOpenTrash={() => startViewTransition(() => setIsTrashModalOpen(true))}
                trashCount={trash.length}
                onToggleDebug={toggleDebugPanel}
            />
        )}
            
        <main 
            className="flex-1 relative overflow-hidden z-10 w-full min-h-0" 
            onClick={() => { setIsInteractingWithToolbar(false); setIsKeyPopoverOpen(false); }}
        >
            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                {activeRecipe ? (
                    <motion.div 
                        key={`recipe-${activeRecipe}`}
                        custom={direction}
                        variants={viewVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0 w-full h-full overflow-hidden"
                    >
                        <RecipeRouter
                            activeRecipe={activeRecipe}
                            generationConfig={generationConfig}
                            updateGenerationConfig={updateGenerationConfig}
                            updateAttachment={updateAttachment}
                            handlePastedFiles={handlePastedFiles}
                            handleGenerate={handleGenerate}
                            isGenerating={isGenerating}
                            imagesWithConfig={imagesWithConfig}
                            openModal={openModal}
                            handleAddToContext={handleAddToContext}
                        />
                    </motion.div>
                ) : currentView === 'studio' ? (
                    <motion.div 
                        key="studio"
                        custom={direction}
                        variants={viewVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0 w-full h-full flex flex-row overflow-hidden"
                    >
                        {!isModalOpen && (
                            <LeftDebugPanel 
                                workspaces={workspaces}
                                logs={mergedLogs}
                                batchesCount={batches.length}
                                imagesCount={allImages.length}
                            />
                        )}

                        <div className="flex-1 h-full relative overflow-hidden flex flex-col">
                            <div className="flex-1 relative min-h-0">
                                <ErrorBoundary fallbackMessage="Failed to render the image grid.">
                                    <ImageGrid 
                                        key={activeWorkspaceId} 
                                        images={imagesWithConfig}
                                        selectedImageIds={selectedImageIds}
                                        onImageClick={openModal}
                                        onSelectionChange={handleSelectionChange}
                                        onRegenerate={(config) => handleGenerate(config.prompt, config, { preventModal: true })}
                                        onAddToContext={handleAddToContext}
                                        onLoadConfig={handleLoadRecipe}
                                        onDelete={handleDelete}
                                        onToggleFavorite={handleToggleFavorite}
                                        isGenerating={isGenerating || jobs.some(j => j.status === 'processing')}
                                        transitioningImageId={transitioningImageId}
                                        activeModalImageId={activeCarouselId}
                                        onSelectAll={() => handleSelectAll(allImages)}
                                        onDeselectAll={handleDeselectAll}
                                        onDownloadSelected={() => {
                                            const selectedImages = imagesWithConfig.filter(img => selectedImageIds.includes(img.id));
                                            if (selectedImages.length > 0) {
                                                downloadMultipleImagesAsZip(selectedImages, `assets-${Date.now()}.zip`);
                                            }
                                        }} 
                                        onDownloadAll={() => {
                                            if (imagesWithConfig.length > 0) {
                                                downloadMultipleImagesAsZip(imagesWithConfig, `assets-${Date.now()}.zip`);
                                            }
                                        }}
                                        onDeleteSelected={handleDeleteSelected}
                                        onClearWorkspace={() => handleClearWorkspace(activeWorkspaceId)}
                                    />
                                </ErrorBoundary>
                            </div>
                            <FormatPreview ratio={previewRatio || generationConfig.aspectRatio} isVisible={!isModalOpen && (isInteractingWithToolbar || !!previewRatio)} isWorkspaceEmpty={allImages.length === 0} />
                        </div>

                        {!isModalOpen && (
                            <div className="flex h-full">
                                <AnimatePresence>
                                    {isQueueOpen && (
                                        <motion.div
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: 320, opacity: 1 }}
                                            exit={{ width: 0, opacity: 0 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            className="h-full overflow-hidden"
                                        >
                                            <QueuePanel 
                                                jobs={jobs}
                                                serverJobs={studioJobs}
                                                onRetry={retry}
                                                onCancel={cancelJob}
                                                onRemove={removeJob}
                                                onClearCompleted={clearCompleted}
                                                isResting={isResting}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <RightSystemPanel 
                                    onImportVault={handleImportVault}
                                    onExportVault={() => exportToJson(batches, `vault-${Date.now()}.json`)}
                                    isBackgroundEnabled={isBackgroundEnabled}
                                    onToggleBackground={() => setIsBackgroundEnabled(p => !p)}
                                    isQueueOpen={isQueueOpen}
                                    onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
                                    queueCount={jobs.length + activeServerJobCount}
                                />
                            </div>
                        )}
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

        {isToolbarVisible && !isModalOpen && (currentView === 'studio' || activeRecipe) && (
            <BottomToolbar className="w-full relative z-30 flex-shrink-0">
                <DropZoneOverlay isVisible={isDragging} />
                <Toolbar 
                    generationConfig={generationConfig}
                    updateConfig={updateGenerationConfig}
                    updateAttachment={updateAttachment}
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    generationStartTime={generationStartTime}
                    onFileSelect={handleFileSelect}
                    onFilesDrop={handlePastedFiles}
                    onRemoveAttachment={handleRemoveAttachment}
                    isEnhancingPrompt={isEnhancingPrompt}
                    onEnhancePrompt={handleEnhancePrompt}
                    setPreviewRatio={setPreviewRatio}
                    setIsInteracting={setIsInteractingWithToolbar}
                    onOpenEditor={(att) => { 
                        startViewTransition(() => {
                            setImageToEdit(att); 
                            setIsEditorOpen(true); 
                            window.location.hash = 'editor'; 
                        });
                    }}
                    isKeyPopoverOpen={isKeyPopoverOpen}
                    onOpenKeySelector={() => startViewTransition(() => setIsKeyPopoverOpen(!isKeyPopoverOpen))}
                    onSelectKey={async () => {
                        await verifyCodexSession();
                        startViewTransition(() => setIsKeyPopoverOpen(false));
                    }}
                    maxAttachments={maxAttachments}
                />
            </BottomToolbar>
        )}

        {isModalOpen && (
            <ImageCarousel
                activeImage={modalImage}
                allImages={imagesWithConfig}
                activeGenerationConfig={activeGenerationConfig}
                onClose={() => closeModal()}
                onDelete={handleDelete}
                onRegenerate={(config) => handleGenerate(config.prompt, config, { preventModal: true })}
                onAddToContext={(img) => { handleAddToContext(img); closeModal(); }}
                onLoadConfig={(config) => { handleLoadRecipe(config); closeModal(); }}
                onToggleFavorite={handleToggleFavorite}
                onActiveImageChange={setActiveCarouselId}
                transitionName="master-canvas"
            />
        )}
        <ImageEditorModal 
            isOpen={isEditorOpen} 
            onClose={() => {
                startViewTransition(() => {
                    setIsEditorOpen(false);
                    setImageToEdit(null);
                    if (window.location.hash === '#editor') {
                        window.history.replaceState(null, '', window.location.pathname + window.location.search);
                    }
                });
            }} 
            image={imageToEdit} 
            onGenerate={handleExecuteEdit} 
            isGenerating={isEditingImage} 
        />
        <DebugPanel isOpen={isDebugPanelOpen} onClose={toggleDebugPanel} logs={mergedLogs} appState={{}} />
        <DashboardModal 
            isOpen={isDashboardModalOpen} 
            onClose={() => startViewTransition(() => setIsDashboardModalOpen(false))} 
            batches={batches}
            workspaces={workspaces}
            onImportVault={handleImportVault}
            onExportVault={() => exportToJson(batches, `vault-export-${Date.now()}.json`)}
            onDeepScan={handleDeepScan}
        />
        <TrashModal
            isOpen={isTrashModalOpen}
            onClose={() => startViewTransition(() => setIsTrashModalOpen(false))}
            trash={trash}
            onRestore={restoreFromTrash}
            onRestoreAll={restoreAllFromTrash}
            onEmpty={() => setTrash([])}
        />
        <LimitReachedModal
            isOpen={isLimitModalOpen}
            onClose={handleDismissLimitModal}
            onDownloadAndClear={handleDownloadAndClear}
            batchCount={batches.length}
        />
        </div>
    );
};
