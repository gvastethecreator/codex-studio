import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Attachment, ImageGenerationConfig } from '../../types';
import type { StyleRuntimePreset } from './styles/runtimeTypes';
import {
  clampStyleLayerFieldWeight,
  clampStyleStrength,
  createDefaultStyleLayerFieldControls,
  createSelectedStylesGenerationPlan,
  createSelectedStyleLayer,
  DEFAULT_SELECTED_STYLE_STRENGTH,
  type SelectedStyleSlot,
  type SelectedStyleLayer,
  STYLE_LAYER_FIELD_DEFINITIONS,
  type StyleLayerAvoidRulesMode,
  type StyleLayerFieldId,
} from './styleLayerComposer';

interface StyleCompositionInput {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  onGenerate: (
    prompt?: string,
    overrides?: Partial<ImageGenerationConfig>,
    options?: { preventModal?: boolean },
  ) => void;
  referenceImages: Attachment[];
  generationBlocked: boolean;
  maxSlots: number;
}

/** Owns selected layers and their provider-independent recipe output. */
export function useStyleComposition({
  config,
  updateConfig,
  onGenerate,
  referenceImages,
  generationBlocked,
  maxSlots,
}: StyleCompositionInput) {
  const [selectedStyles, setSelectedStyles] = useState<SelectedStyleSlot[]>([]);
  const didRestoreSelection = useRef(false);
  useEffect(() => {
    if (didRestoreSelection.current) return;
    if (selectedStyles.length > 0) {
      didRestoreSelection.current = true;
      return;
    }
    const draftSlots = config.recipeParams?.selectedStyleDraft;
    if (Array.isArray(draftSlots)) {
      didRestoreSelection.current = true;
      setSelectedStyles(draftSlots as SelectedStyleSlot[]);
      return;
    }
    const layers = (config.recipeParams as { selectedStyles?: SelectedStyleLayer[] } | null)
      ?.selectedStyles;
    if (!Array.isArray(layers) || !layers.length) return;
    didRestoreSelection.current = true;
    setSelectedStyles(
      layers.map((layer) => ({
        packId: layer.packId,
        packName: layer.packName,
        strength: layer.strength,
        enabled: layer.enabled,
        avoidRulesMode: layer.avoidRulesMode,
        fieldControls: layer.fields,
        preset: {
          id: layer.presetId,
          name: layer.presetSourceName || layer.presetName,
          displayName: layer.presetName,
          category: layer.category,
          styleAnchors: layer.styleAnchors,
          negativePrompt:
            typeof config.recipeParams?.negativePrompt === 'string'
              ? config.recipeParams.negativePrompt
              : '',
          style: {
            creative_brief: layer.creativeBrief,
            ...Object.fromEntries(
              STYLE_LAYER_FIELD_DEFINITIONS.map((field) => [
                field.sourceKeys[0],
                layer[field.paramKey]?.replace(/ \(field weight [^)]+\)$/, ''),
              ]),
            ),
          } as SelectedStyleSlot['preset']['style'],
        },
      })),
    );
  }, [config.recipeParams, selectedStyles.length]);
  const [isAdvancedStyleControlsOpen, setIsAdvancedStyleControlsOpen] = useState(false);
  const selectedStyleIds = useMemo(
    () => new Set(selectedStyles.map((slot) => slot.preset.id)),
    [selectedStyles],
  );
  const toggleStyle = useCallback(
    (preset: StyleRuntimePreset, presetPackId: string, packName: string) => {
      setSelectedStyles((current) => {
        if (current.some((slot) => slot.preset.id === preset.id)) {
          return current.filter((slot) => slot.preset.id !== preset.id);
        }
        if (current.length >= maxSlots) {
          return current;
        }
        return [
          ...current,
          {
            preset,
            packId: presetPackId,
            packName,
            strength: DEFAULT_SELECTED_STYLE_STRENGTH,
            enabled: true,
            fieldControls: createDefaultStyleLayerFieldControls(),
            avoidRulesMode: 'merge',
          },
        ];
      });
    },
    [maxSlots],
  );
  const selectedStyleLayers = useMemo(
    () => selectedStyles.map(createSelectedStyleLayer),
    [selectedStyles],
  );
  const activeSelectedStyleCount = selectedStyleLayers.filter((layer) => layer.enabled).length;
  const registeredStyleGenerationPlan = useMemo(
    () =>
      createSelectedStylesGenerationPlan({
        slots: selectedStyles,
        hasReferenceImages: referenceImages.length > 0,
        baseNegativePrompt: config.negativePrompt,
      }),
    [config.negativePrompt, referenceImages.length, selectedStyles],
  );
  useEffect(() => {
    if (!didRestoreSelection.current && selectedStyles.length === 0) return;
    updateConfig('recipeId', 'styles');
    updateConfig('recipeParams', {
      ...registeredStyleGenerationPlan?.recipeParams,
      selectedStyles: registeredStyleGenerationPlan?.recipeParams.selectedStyles ?? [],
      selectedStyleDraft: selectedStyles,
    });
    updateConfig('recipeContext', '');
  }, [registeredStyleGenerationPlan, selectedStyles, updateConfig]);
  const updateSelectedStyleStrength = useCallback((presetId: string, strength: number) => {
    setSelectedStyles((current) =>
      current.map((slot) =>
        slot.preset.id === presetId ? { ...slot, strength: clampStyleStrength(strength) } : slot,
      ),
    );
  }, []);

  const toggleSelectedStyleEnabled = useCallback((presetId: string) => {
    setSelectedStyles((current) =>
      current.map((slot) =>
        slot.preset.id === presetId ? { ...slot, enabled: !(slot.enabled ?? true) } : slot,
      ),
    );
  }, []);

  const toggleSelectedStyleField = useCallback((presetId: string, fieldId: StyleLayerFieldId) => {
    setSelectedStyles((current) =>
      current.map((slot) => {
        if (slot.preset.id !== presetId) return slot;
        const controls = {
          ...createDefaultStyleLayerFieldControls(),
          ...slot.fieldControls,
        };
        const currentField = controls[fieldId] ?? { enabled: true, weight: 1 };
        return {
          ...slot,
          fieldControls: {
            ...controls,
            [fieldId]: {
              ...currentField,
              enabled: !currentField.enabled,
            },
          },
        };
      }),
    );
  }, []);

  const updateSelectedStyleFieldWeight = useCallback(
    (presetId: string, fieldId: StyleLayerFieldId, weight: number) => {
      setSelectedStyles((current) =>
        current.map((slot) => {
          if (slot.preset.id !== presetId) return slot;
          const controls = {
            ...createDefaultStyleLayerFieldControls(),
            ...slot.fieldControls,
          };
          const currentField = controls[fieldId] ?? { enabled: true, weight: 1 };
          return {
            ...slot,
            fieldControls: {
              ...controls,
              [fieldId]: {
                ...currentField,
                weight: clampStyleLayerFieldWeight(weight),
              },
            },
          };
        }),
      );
    },
    [],
  );

  const setSelectedStyleAvoidRulesMode = useCallback(
    (presetId: string, avoidRulesMode: StyleLayerAvoidRulesMode) => {
      setSelectedStyles((current) =>
        current.map((slot) => (slot.preset.id === presetId ? { ...slot, avoidRulesMode } : slot)),
      );
    },
    [],
  );

  const removeSelectedStyle = useCallback((presetId: string) => {
    setSelectedStyles((current) => current.filter((slot) => slot.preset.id !== presetId));
  }, []);

  const moveSelectedStyle = useCallback((presetId: string, direction: -1 | 1) => {
    setSelectedStyles((current) => {
      const index = current.findIndex((slot) => slot.preset.id === presetId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  }, []);

  const handleGenerateSelectedStyles = useCallback(() => {
    const diversityPrompts = [
      'Introduce a noticeably different camera distance and framing from previous renders.',
      'Shift scene energy with a different gesture or action beat while preserving the subject intent.',
      'Use a clearly distinct lighting setup and color balance versus prior attempts.',
      'Vary background staging and spatial depth so this render is visibly unique.',
    ] as const;
    const diversityHint = diversityPrompts[Math.floor(Math.random() * diversityPrompts.length)];
    const generationPlan = createSelectedStylesGenerationPlan({
      slots: selectedStyles,
      hasReferenceImages: referenceImages.length > 0,
      baseNegativePrompt: config.negativePrompt,
      diversityHint,
    });
    if (!generationPlan || generationBlocked) return;

    onGenerate(
      config.prompt?.trim() || generationPlan.fallbackPrompt,
      {
        recipeId: 'styles',
        recipeParams: generationPlan.recipeParams,
        recipeContext: '',
        attachments: referenceImages,
        model: config.model,
        imageSize: config.imageSize,
        batchCount: config.batchCount,
        aspectRatio: config.aspectRatio,
        executionModel: config.executionModel,
        executionReasoningEffort: config.executionReasoningEffort,
        executionSpeed: config.executionSpeed,
        negativePrompt: generationPlan.negativePrompt,
      },
      { preventModal: true },
    );
  }, [
    generationBlocked,
    config.aspectRatio,
    config.batchCount,
    config.executionModel,
    config.executionReasoningEffort,
    config.executionSpeed,
    config.imageSize,
    config.model,
    config.negativePrompt,
    config.prompt,
    onGenerate,
    referenceImages,
    selectedStyles,
  ]);

  const clear = useCallback(() => setSelectedStyles([]), []);
  const toggleAdvanced = useCallback(
    () => setIsAdvancedStyleControlsOpen((current) => !current),
    [],
  );
  const replacePreset = useCallback(
    (preset: StyleRuntimePreset) =>
      setSelectedStyles((current) =>
        current.map((slot) => (slot.preset.id === preset.id ? { ...slot, preset } : slot)),
      ),
    [],
  );
  return {
    selectedStyles,
    selectedStyleIds,
    selectedStyleLayers,
    activeSelectedStyleCount,
    isAdvancedStyleControlsOpen,
    toggleStyle,
    clear,
    toggleAdvanced,
    replacePreset,
    updateSelectedStyleStrength,
    toggleSelectedStyleEnabled,
    toggleSelectedStyleField,
    updateSelectedStyleFieldWeight,
    setSelectedStyleAvoidRulesMode,
    removeSelectedStyle,
    moveSelectedStyle,
    handleGenerateSelectedStyles,
  };
}
