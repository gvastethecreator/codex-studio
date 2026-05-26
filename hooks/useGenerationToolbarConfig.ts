import { startViewTransition } from '../utils/transitionUtils';

import type { ToolbarProps } from '../components/Toolbar';
import type { Attachment } from '../types';

type StartTransition = (callback: () => void) => void;

interface GenerationToolbarConfigContext {
  generationConfig: ToolbarProps['generationConfig'];
  updateConfig: ToolbarProps['updateConfig'];
  updateAttachment: ToolbarProps['updateAttachment'];
  onFileSelect: ToolbarProps['onFileSelect'];
  onFilesDrop: ToolbarProps['onFilesDrop'];
  onRemoveAttachment: ToolbarProps['onRemoveAttachment'];
  maxAttachments: ToolbarProps['maxAttachments'];
}

interface GenerationToolbarActions {
  onGenerate: ToolbarProps['onGenerate'];
  isGenerating: ToolbarProps['isGenerating'];
  generationStartTime: ToolbarProps['generationStartTime'];
  isEnhancingPrompt: ToolbarProps['isEnhancingPrompt'];
  onEnhancePrompt: ToolbarProps['onEnhancePrompt'];
}

interface GenerationToolbarUiContext {
  setPreviewRatio: ToolbarProps['setPreviewRatio'];
  setIsInteracting: ToolbarProps['setIsInteracting'];
  isKeyPopoverOpen: ToolbarProps['isKeyPopoverOpen'];
  setIsKeyPopoverOpen: (isOpen: boolean) => void;
}

interface GenerationToolbarEditorContext {
  openEditor: (attachment: Attachment, openEditorRoute: () => void) => void;
  openEditorRoute: () => void;
}

interface GenerationToolbarSyncContext {
  verifyCodexSession: () => Promise<void>;
}

export interface BuildGenerationToolbarPropsArgs {
  config: GenerationToolbarConfigContext;
  actions: GenerationToolbarActions;
  ui: GenerationToolbarUiContext;
  editor: GenerationToolbarEditorContext;
  sync: GenerationToolbarSyncContext;
  startTransition?: StartTransition;
}

/**
 * Concentrate Toolbar wiring so AppContent does not own key-selector,
 * editor-routing, and prompt-generation choreography inline.
 */
export function buildGenerationToolbarProps({
  config,
  actions,
  ui,
  editor,
  sync,
  startTransition = startViewTransition,
}: BuildGenerationToolbarPropsArgs): ToolbarProps {
  return {
    generationConfig: config.generationConfig,
    updateConfig: config.updateConfig,
    updateAttachment: config.updateAttachment,
    onGenerate: actions.onGenerate,
    isGenerating: actions.isGenerating,
    generationStartTime: actions.generationStartTime,
    onFileSelect: config.onFileSelect,
    onFilesDrop: config.onFilesDrop,
    onRemoveAttachment: config.onRemoveAttachment,
    isEnhancingPrompt: actions.isEnhancingPrompt,
    onEnhancePrompt: actions.onEnhancePrompt,
    setPreviewRatio: ui.setPreviewRatio,
    setIsInteracting: ui.setIsInteracting,
    onOpenEditor: (attachment) => editor.openEditor(attachment, editor.openEditorRoute),
    isKeyPopoverOpen: ui.isKeyPopoverOpen,
    onOpenKeySelector: () => startTransition(() => ui.setIsKeyPopoverOpen(!ui.isKeyPopoverOpen)),
    onSelectKey: async () => {
      await sync.verifyCodexSession();
      startTransition(() => ui.setIsKeyPopoverOpen(false));
    },
    maxAttachments: config.maxAttachments,
  };
}

export function useGenerationToolbarConfig(args: BuildGenerationToolbarPropsArgs): ToolbarProps {
  return buildGenerationToolbarProps(args);
}
