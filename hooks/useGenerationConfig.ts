import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type {
  ImageGenerationConfig,
  Attachment,
  GeneratedImageWithConfig,
  AspectRatio,
  GenerationModel,
} from '../types';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import useIndexedDBStorage from './useIndexedDBStorage';
import { normalizeImageGenRatio } from '../utils/imageGenSizing';
import { formatErrorMessage } from '../utils/runtimeLogger';
import { resolveStudioApiBase } from '../services/studioRuntime';
import {
  normalizeCodexReasoningEffort,
  normalizeCodexSpeed,
  pickPreferredCodexModel,
} from '../lib/codexExecution';
import { getCodexModelCatalog } from '../services/localStudioService';
import type { CodexModel, CodexModelCatalogResponse } from '../packages/shared/src';
import { filterPersistableInlineAttachments } from '../lib/browserPersistenceBudget';

interface UseGenerationConfigProps {
  log: (message: string) => void;
}

export function prepareGenerationConfigForPersist(
  config: ImageGenerationConfig,
): ImageGenerationConfig {
  return {
    ...config,
    attachments: filterPersistableInlineAttachments(config.attachments),
  };
}

export function normalizeGenerationConfigForCodexModels(
  config: ImageGenerationConfig,
  codexModels: CodexModel[],
): ImageGenerationConfig {
  if (codexModels.length === 0) return config;

  const preferredId = pickPreferredCodexModel(codexModels, config.executionModel);
  const selectedModel =
    codexModels.find((model) => model.id === config.executionModel) ??
    codexModels.find((model) => model.id === preferredId) ??
    null;

  let next = config;

  if (preferredId && preferredId !== config.executionModel) {
    next = { ...next, executionModel: preferredId };
  }

  const normalizedReasoning = normalizeCodexReasoningEffort(
    selectedModel,
    next.executionReasoningEffort,
  );
  if (normalizedReasoning !== next.executionReasoningEffort) {
    next = { ...next, executionReasoningEffort: normalizedReasoning };
  }

  const normalizedSpeed = normalizeCodexSpeed(selectedModel, next.executionSpeed);
  if (normalizedSpeed !== next.executionSpeed) {
    next = { ...next, executionSpeed: normalizedSpeed };
  }

  return next;
}

export const useGenerationConfig = ({ log }: UseGenerationConfigProps) => {
  const [generationConfig, setGenerationConfig] = useIndexedDBStorage<ImageGenerationConfig>(
    'generation-config',
    DEFAULT_GENERATION_CONFIG,
    { prepareForPersist: prepareGenerationConfigForPersist },
  );
  const [codexModelCatalog, setCodexModelCatalog] = useState<CodexModelCatalogResponse | null>(
    null,
  );
  const [isLoadingCodexModelCatalog, setIsLoadingCodexModelCatalog] = useState(true);
  const [codexModelCatalogError, setCodexModelCatalogError] = useState<string | null>(null);

  const logRef = useRef(log);
  logRef.current = log;

  const maxAttachments = 5;

  useEffect(() => {
    if (generationConfig.attachments.length > maxAttachments) {
      setGenerationConfig((prev) => ({
        ...prev,
        attachments: prev.attachments.slice(0, maxAttachments),
      }));
      logRef.current(`Context trimmed to ${maxAttachments} for current model.`);
    }
  }, [generationConfig.attachments.length, maxAttachments, setGenerationConfig]);

  useEffect(() => {
    const normalizedRatio = normalizeImageGenRatio(generationConfig.aspectRatio);
    if (normalizedRatio !== generationConfig.aspectRatio) {
      setGenerationConfig((prev) => ({
        ...prev,
        aspectRatio: normalizeImageGenRatio(prev.aspectRatio),
      }));
      logRef.current(
        `Aspect ratio normalized to ${normalizedRatio} for Codex ImageGen compatibility.`,
      );
    }
  }, [generationConfig.aspectRatio, setGenerationConfig]);

  useEffect(() => {
    const executionModel = generationConfig.executionModel?.trim();
    const executionReasoningEffort = generationConfig.executionReasoningEffort?.trim();
    const executionSpeed = generationConfig.executionSpeed;

    if (
      executionModel &&
      executionReasoningEffort &&
      (executionSpeed === 'standard' || executionSpeed === 'fast' || executionSpeed === 'flex')
    ) {
      return;
    }

    setGenerationConfig((prev) => ({
      ...prev,
      executionModel: executionModel || DEFAULT_GENERATION_CONFIG.executionModel,
      executionReasoningEffort:
        executionReasoningEffort || DEFAULT_GENERATION_CONFIG.executionReasoningEffort,
      executionSpeed:
        executionSpeed === 'standard' || executionSpeed === 'fast' || executionSpeed === 'flex'
          ? executionSpeed
          : DEFAULT_GENERATION_CONFIG.executionSpeed,
    }));
    logRef.current('Codex execution settings normalized to defaults.');
  }, [
    generationConfig.executionModel,
    generationConfig.executionReasoningEffort,
    generationConfig.executionSpeed,
    setGenerationConfig,
  ]);

  useEffect(() => {
    let cancelled = false;

    void getCodexModelCatalog()
      .then((catalog) => {
        if (cancelled) return;

        const codexModels = catalog?.models ?? [];
        setCodexModelCatalog(catalog);
        setCodexModelCatalogError(catalog.error);
        setGenerationConfig((prev) => normalizeGenerationConfigForCodexModels(prev, codexModels));
      })
      .catch((error) => {
        if (cancelled) return;
        setCodexModelCatalogError(
          error instanceof Error ? error.message : 'Unable to read the Codex model catalog.',
        );
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingCodexModelCatalog(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [setGenerationConfig]);

  const updateGenerationConfig = useCallback(
    <K extends keyof ImageGenerationConfig>(key: K, value: ImageGenerationConfig[K]) => {
      setGenerationConfig((prev) => ({ ...prev, [key]: value }));
    },
    [setGenerationConfig],
  );

  const updateAttachment = useCallback(
    (id: string, newProps: Partial<Attachment>) => {
      setGenerationConfig((prev) => ({
        ...prev,
        attachments: prev.attachments.map((att) => (att.id === id ? { ...att, ...newProps } : att)),
      }));
    },
    [setGenerationConfig],
  );

  const processFiles = useCallback(
    async (files: File[]) => {
      const filesToProcess = files.slice(0, 1);

      const results = await Promise.all(
        filesToProcess.map(async (file) => {
          try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });

            return {
              id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              name: file.name,
              dataUrl,
              strength: 0.5,
            } as Attachment;
          } catch (err) {
            log(`Failed to read attachment "${file.name}": ${formatErrorMessage(err)}`);
            return null;
          }
        }),
      );

      const newAttachments = results.filter((r): r is Attachment => r !== null);

      if (newAttachments.length > 0) {
        setGenerationConfig((prev) => ({
          ...prev,
          attachments: [newAttachments[0]],
        }));
        log('Reference image updated. Previous attachment context was replaced.');
      }
    },
    [log, setGenerationConfig],
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        void processFiles(Array.from(files));
        event.target.value = '';
      }
    },
    [processFiles],
  );

  const handlePastedFiles = useCallback(
    (files: File[]) => {
      void processFiles(files);
    },
    [processFiles],
  );

  const handleRemoveAttachment = useCallback(
    (id: string) => {
      setGenerationConfig((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((att) => att.id !== id),
      }));
    },
    [setGenerationConfig],
  );

  const handleAddToContext = useCallback(
    (image: GeneratedImageWithConfig) => {
      setGenerationConfig((prev) => {
        const dataUrl = image.src.startsWith('data:')
          ? image.src
          : `${resolveStudioApiBase()}${image.src}`;

        return {
          ...prev,
          attachments: [
            {
              id: `gen-${image.id}-${Date.now()}`,
              name: 'Generated Image',
              dataUrl,
              strength: 0.5,
            },
          ],
        };
      });
      log('Added generated image as the active reference context.');
    },
    [log, setGenerationConfig],
  );

  return {
    generationConfig,
    setGenerationConfig,
    updateGenerationConfig,
    updateAttachment,
    handleFileSelect,
    handlePastedFiles,
    handleRemoveAttachment,
    handleAddToContext,
    maxAttachments,
    codexModelCatalog,
    isLoadingCodexModelCatalog,
    codexModelCatalogError,
  };
};
