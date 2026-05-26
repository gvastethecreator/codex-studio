import React, { useState, useCallback, useEffect, useMemo } from 'react';
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

interface UseGenerationConfigProps {
  log: (message: string) => void;
}

export const useGenerationConfig = ({ log }: UseGenerationConfigProps) => {
  const [generationConfig, setGenerationConfig] = useIndexedDBStorage<ImageGenerationConfig>(
    'generation-config',
    DEFAULT_GENERATION_CONFIG,
  );

  const maxAttachments = useMemo(() => {
    return 5;
  }, []);

  useEffect(() => {
    if (generationConfig.attachments.length > maxAttachments) {
      setGenerationConfig((prev) => ({
        ...prev,
        attachments: prev.attachments.slice(0, maxAttachments),
      }));
      log(`Context trimmed to ${maxAttachments} for current model.`);
    }
  }, [generationConfig.attachments.length, maxAttachments, log, setGenerationConfig]);

  useEffect(() => {
    const normalizedRatio = normalizeImageGenRatio(generationConfig.aspectRatio);
    if (normalizedRatio !== generationConfig.aspectRatio) {
      setGenerationConfig((prev) => ({
        ...prev,
        aspectRatio: normalizeImageGenRatio(prev.aspectRatio),
      }));
      log(`Aspect ratio normalized to ${normalizedRatio} for Codex ImageGen compatibility.`);
    }
  }, [generationConfig.aspectRatio, log, setGenerationConfig]);

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
    log('Codex execution settings normalized to defaults.');
  }, [
    generationConfig.executionModel,
    generationConfig.executionReasoningEffort,
    generationConfig.executionSpeed,
    log,
    setGenerationConfig,
  ]);

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
      const remainingSpace = maxAttachments - generationConfig.attachments.length;
      if (remainingSpace <= 0) {
        log(`Context full. Limit for ${generationConfig.model} is ${maxAttachments}.`);
        return;
      }

      const filesToProcess = files.slice(0, remainingSpace);
      const newAttachments: Attachment[] = [];

      for (const file of filesToProcess) {
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          newAttachments.push({
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: file.name,
            dataUrl,
            strength: 0.25,
          });
        } catch (err) {
          log(`Failed to read attachment "${file.name}": ${formatErrorMessage(err)}`);
        }
      }

      if (newAttachments.length > 0) {
        setGenerationConfig((prev) => ({
          ...prev,
          attachments: [...prev.attachments, ...newAttachments],
        }));

        log(`Added ${newAttachments.length} images to synthesis context.`);
      }
    },
    [
      maxAttachments,
      generationConfig.attachments.length,
      generationConfig.model,
      log,
      setGenerationConfig,
    ],
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
        if (prev.attachments.length >= maxAttachments) {
          log(`Cannot add to context. Maximum limit reached.`);
          return prev;
        }

        const dataUrl = image.src.startsWith('data:')
          ? image.src
          : `${resolveStudioApiBase()}${image.src}`;

        return {
          ...prev,
          attachments: [
            ...prev.attachments,
            {
              id: `gen-${image.id}-${Date.now()}`,
              name: 'Generated Image',
              dataUrl,
              strength: 0.25,
            },
          ],
        };
      });
      log(`Added generated image to context.`);
    },
    [log, maxAttachments, setGenerationConfig],
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
  };
};
