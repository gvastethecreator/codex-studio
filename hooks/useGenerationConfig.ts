import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLatestRef } from './useLatestRef';
import type {
  ImageGenerationConfig,
  Attachment,
  GeneratedImageWithConfig,
  AspectRatio,
  GenerationModel,
} from '../types';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import { useScopedGenerationDraft } from './useScopedGenerationDraft';
import { normalizeImageGenRatio } from '../utils/imageGenSizing';
import { formatErrorMessage } from '../utils/runtimeLogger';
import { resolveStudioApiBase } from '../services/studioRuntime';
import {
  normalizeCodexReasoningEffort,
  normalizeCodexSpeed,
  pickPreferredCodexModel,
} from '../lib/codexExecution';
import { createReferenceHandoff } from '../services/studio-api/jobs';
import { getCodexModelCatalog } from '../services/studio-api/codex';
import { toStudioAssetUrl } from '../services/studio-api/assetUrls';
import type { CodexModel, CodexModelCatalogResponse } from '../packages/shared/src';
import {
  filterPersistableInlineAttachments,
  isInlineImageDataUrl,
} from '../lib/browserPersistenceBudget';
import { createContextImageDataUrl } from '../utils/imageUtils';

interface UseGenerationConfigProps {
  scopeKey?: string;
  log: (message: string) => void;
}

interface CodexModelCatalogState {
  catalog: CodexModelCatalogResponse | null;
  isLoading: boolean;
  error: string | null;
}

const LEGACY_DEFAULT_CODEX_EXECUTION_MODEL = 'gpt-5.4-mini';

export function buildGeneratedImageContextAttachment(
  image: Pick<GeneratedImageWithConfig, 'id' | 'src' | 'localPath' | 'sourceUrl'>,
  now = Date.now,
): Attachment {
  const isAbsoluteOrData = image.src.startsWith('data:') || /^https?:\/\//i.test(image.src);
  const dataUrl = isAbsoluteOrData ? image.src : `${resolveStudioApiBase()}${image.src}`;
  const localPath = image.localPath?.trim() || undefined;
  return {
    id: `gen-${image.id}-${now()}`,
    name: 'Generated Image',
    dataUrl,
    localPath,
    sourceUrl: image.sourceUrl?.trim() || dataUrl,
    strength: 0.5,
  };
}
const LEGACY_DEFAULT_CODEX_EXECUTION_REASONING_EFFORT = 'low';

function toWebpAttachmentName(name: string) {
  const trimmed = name.trim() || 'reference';
  const withoutExt = trimmed.replace(/\.[a-z0-9]+$/i, '');
  return `${withoutExt || 'reference'}.webp`;
}

export function prepareGenerationConfigForPersist(
  config: ImageGenerationConfig,
): ImageGenerationConfig {
  return {
    ...config,
    attachments: filterPersistableInlineAttachments(
      config.attachments.filter((attachment) => !attachment.isProcessing),
    ),
  };
}

export function normalizeGenerationConfigForCodexModels(
  config: ImageGenerationConfig,
  codexModels: CodexModel[],
): ImageGenerationConfig {
  if (codexModels.length === 0) return config;

  const shouldUpgradeLegacyDefault =
    config.executionModel === LEGACY_DEFAULT_CODEX_EXECUTION_MODEL &&
    config.executionReasoningEffort === LEGACY_DEFAULT_CODEX_EXECUTION_REASONING_EFFORT &&
    config.executionSpeed === DEFAULT_GENERATION_CONFIG.executionSpeed;
  const preferredId = pickPreferredCodexModel(
    codexModels,
    shouldUpgradeLegacyDefault ? null : config.executionModel,
  );
  const selectedModel =
    codexModels.find(
      (model) => model.id === (shouldUpgradeLegacyDefault ? preferredId : config.executionModel),
    ) ??
    codexModels.find((model) => model.id === preferredId) ??
    null;

  let next = config;

  if (shouldUpgradeLegacyDefault) {
    next = {
      ...next,
      executionModel: preferredId ?? DEFAULT_GENERATION_CONFIG.executionModel,
      executionReasoningEffort: DEFAULT_GENERATION_CONFIG.executionReasoningEffort,
      executionSpeed: DEFAULT_GENERATION_CONFIG.executionSpeed,
    };
  } else if (preferredId && preferredId !== config.executionModel) {
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

export const useGenerationConfig = ({
  log,
  scopeKey = 'default:studio',
}: UseGenerationConfigProps) => {
  const [generationConfig, setGenerationConfig, setRecipeDraft, isDraftReady] =
    useScopedGenerationDraft(scopeKey, prepareGenerationConfigForPersist);
  const [codexModelCatalogState, setCodexModelCatalogState] = useState<CodexModelCatalogState>({
    catalog: null,
    isLoading: true,
    error: null,
  });

  const logRef = useLatestRef(log);
  const uploadPreviews = useRef(new Map<string, string>());
  const uploadScopes = useRef(new Map<string, string>());

  useEffect(() => {
    for (const [id, url] of uploadPreviews.current) {
      if (uploadScopes.current.get(id) !== scopeKey) continue;
      if (
        !generationConfig.attachments.some(
          (attachment) => attachment.id === id && attachment.dataUrl === url,
        )
      ) {
        URL.revokeObjectURL(url);
        uploadPreviews.current.delete(id);
      }
    }
  }, [generationConfig.attachments, scopeKey]);

  useEffect(() => {
    const previews = uploadPreviews.current;
    return () => {
      for (const url of previews.values()) URL.revokeObjectURL(url);
      previews.clear();
    };
  }, []);

  const maxAttachments = 10;

  useEffect(() => {
    if (generationConfig.attachments.length > maxAttachments) {
      setGenerationConfig((prev) => ({
        ...prev,
        attachments: prev.attachments.slice(0, maxAttachments),
      }));
      logRef.current(`Context trimmed to ${maxAttachments} for current model.`);
    }
  }, [generationConfig.attachments.length, logRef, maxAttachments, setGenerationConfig]);

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
  }, [generationConfig.aspectRatio, logRef, setGenerationConfig]);

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
    logRef,
    setGenerationConfig,
  ]);

  const handleCodexModelCatalogLoaded = useCallback(
    (catalog: CodexModelCatalogResponse) => {
      const codexModels = catalog?.models ?? [];
      setCodexModelCatalogState({
        catalog,
        error: catalog.error,
        isLoading: false,
      });
      setGenerationConfig((prev) => normalizeGenerationConfigForCodexModels(prev, codexModels));
    },
    [setGenerationConfig],
  );

  const handleCodexModelCatalogFailed = useCallback((error: unknown) => {
    setCodexModelCatalogState({
      catalog: null,
      error: error instanceof Error ? error.message : 'Unable to read the Codex model catalog.',
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    void getCodexModelCatalog()
      .then((catalog) => {
        if (cancelled) return;
        handleCodexModelCatalogLoaded(catalog);
      })
      .catch((error) => {
        if (cancelled) return;
        handleCodexModelCatalogFailed(error);
      });

    return () => {
      cancelled = true;
    };
  }, [handleCodexModelCatalogFailed, handleCodexModelCatalogLoaded]);

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
    async (files: File[], replaceId?: string) => {
      const filesToProcess = files.slice(0, replaceId ? 1 : maxAttachments);
      if (replaceId) {
        const preview = uploadPreviews.current.get(replaceId);
        if (preview) URL.revokeObjectURL(preview);
        uploadPreviews.current.delete(replaceId);
      }
      const uploads = filesToProcess.map((file) => {
        const attachment: Attachment = {
          id: crypto.randomUUID(),
          name: file.name,
          dataUrl: URL.createObjectURL(file),
          strength: 0.5,
          isProcessing: true,
        };
        uploadPreviews.current.set(attachment.id, attachment.dataUrl);
        uploadScopes.current.set(attachment.id, scopeKey);
        return { file, attachment };
      });
      setGenerationConfig((prev) => ({
        ...prev,
        attachments: replaceId
          ? prev.attachments.map((attachment) =>
              attachment.id === replaceId && uploads[0]
                ? { ...uploads[0].attachment, strength: attachment.strength }
                : attachment,
            )
          : [...prev.attachments, ...uploads.map(({ attachment }) => attachment)].slice(
              0,
              maxAttachments,
            ),
      }));

      await Promise.all(
        uploads.map(async ({ file, attachment: pendingAttachment }) => {
          try {
            const rawDataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            if (!uploadPreviews.current.has(pendingAttachment.id)) return;
            const contextImage = await createContextImageDataUrl(rawDataUrl).catch((error) => {
              log(
                `WebP conversion failed for "${file.name}": ${formatErrorMessage(error)}. Using original image for handoff.`,
              );
              return {
                dataUrl: rawDataUrl,
                width: null,
                height: null,
                fileSizeBytes: rawDataUrl.length,
              };
            });
            const dataUrl = contextImage.dataUrl;
            if (!uploadPreviews.current.has(pendingAttachment.id)) return;
            const attachmentName = dataUrl.startsWith('data:image/webp;')
              ? toWebpAttachmentName(file.name)
              : file.name;

            let attachment: Attachment = {
              id: pendingAttachment.id,
              name: attachmentName,
              dataUrl,
              strength: 0.5,
            };

            if (isInlineImageDataUrl(dataUrl)) {
              try {
                const handoff = await createReferenceHandoff({
                  references: [
                    {
                      name: attachmentName,
                      dataUrl,
                      strength: attachment.strength,
                    },
                  ],
                });
                const persistedReference = handoff.references[0];
                if (persistedReference) {
                  const sourceUrl = toStudioAssetUrl(persistedReference.publicUrl);
                  attachment = {
                    ...attachment,
                    dataUrl: sourceUrl,
                    localPath: persistedReference.localPath,
                    sourceUrl,
                  };
                }
              } catch (err) {
                log(
                  `Reference handoff failed for "${file.name}": ${formatErrorMessage(err)}. The WebP image will remain browser-only until generation starts.`,
                );
              }
            }

            if (!uploadPreviews.current.has(pendingAttachment.id)) return;
            setGenerationConfig((prev) => ({
              ...prev,
              attachments: prev.attachments.map((current) =>
                current.id === attachment.id
                  ? { ...attachment, strength: current.strength }
                  : current,
              ),
            }));
          } catch (err) {
            if (!uploadPreviews.current.has(pendingAttachment.id)) return;
            log(`Failed to read attachment "${file.name}": ${formatErrorMessage(err)}`);
            setGenerationConfig((prev) => ({
              ...prev,
              attachments: prev.attachments.filter(
                (current) => current.id !== pendingAttachment.id,
              ),
            }));
          }
        }),
      );
    },
    [log, maxAttachments, setGenerationConfig, scopeKey],
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
    (files: File[], replaceId?: string) => {
      void processFiles(files, replaceId);
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
      setGenerationConfig((prev) => ({
        ...prev,
        attachments: [buildGeneratedImageContextAttachment(image)],
      }));
      log('Added generated image as the active reference context.');
    },
    [log, setGenerationConfig],
  );

  return {
    generationConfig,
    setGenerationConfig,
    setRecipeDraft,
    isDraftReady,
    updateGenerationConfig,
    updateAttachment,
    handleFileSelect,
    handlePastedFiles,
    handleRemoveAttachment,
    handleAddToContext,
    maxAttachments,
    codexModelCatalog: codexModelCatalogState.catalog,
    isLoadingCodexModelCatalog: codexModelCatalogState.isLoading,
    codexModelCatalogError: codexModelCatalogState.error,
  };
};
