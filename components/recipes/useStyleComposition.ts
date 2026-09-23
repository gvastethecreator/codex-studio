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
import * as Intentional from '../../packages/shared/src/styles/intentional-v1';

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
  intentionalStylesV1?: boolean;
}

/** Owns selected layers and their provider-independent recipe output. */
export function useStyleComposition({
  config,
  updateConfig,
  onGenerate,
  referenceImages,
  generationBlocked,
  maxSlots,
  intentionalStylesV1 = false,
}: StyleCompositionInput) {
  const [selectedStyles, setSelectedStyles] = useState<SelectedStyleSlot[]>([]);
  const [intentionalMode, setIntentionalMode] = useState<Intentional.Mode>(() => {
    const savedMode = config.recipeParams?.styleReferenceMode;
    return savedMode === 'reinterpret' ? 'reinterpret' : 'generate';
  });
  const [compileIssues, setCompileIssues] = useState<Intentional.Issue[]>([]);
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
  const registeredStyleGenerationPlan = useMemo(
    () =>
      createSelectedStylesGenerationPlan({
        slots: selectedStyles,
        hasReferenceImages: referenceImages.length > 0,
        referenceMode: intentionalMode === 'reinterpret' ? 'reinterpret' : 'preserve',
        baseNegativePrompt: config.negativePrompt,
      }),
    [config.negativePrompt, intentionalMode, referenceImages.length, selectedStyles],
  );
  const activeSelectedStyleCount = intentionalStylesV1
    ? selectedStyleLayers.filter((layer) => layer.enabled).length
    : ((
        registeredStyleGenerationPlan?.recipeParams.selectedStyles as
          | SelectedStyleLayer[]
          | undefined
      )?.length ?? 0);
  useEffect(() => {
    if (!didRestoreSelection.current && selectedStyles.length === 0) return;
    if (intentionalStylesV1) return;
    updateConfig('recipeId', 'styles');
    updateConfig('recipeParams', {
      ...registeredStyleGenerationPlan?.recipeParams,
      selectedStyles: registeredStyleGenerationPlan?.recipeParams.selectedStyles ?? [],
      selectedStyleDraft: selectedStyles,
    });
    updateConfig('recipeContext', '');
  }, [intentionalStylesV1, registeredStyleGenerationPlan, selectedStyles, updateConfig]);

  useEffect(() => {
    if (!intentionalStylesV1) return;
    if (!didRestoreSelection.current && selectedStyles.length === 0) return;
    let cancelled = false;
    updateConfig('recipeId', 'styles');
    void (async () => {
      try {
        const { compileIntentionalStylePlan } = await import('./intentionalStyleCompile');
        if (cancelled) return;
        const compiled = await compileIntentionalStylePlan({
          slots: selectedStyles,
          prompt: config.prompt || '',
          attachments: referenceImages,
          mode: intentionalMode,
          locks:
            intentionalMode === 'preserve'
              ? Intentional.PRESERVE_LOCKS
              : Intentional.FREE_LAYOUT_LOCKS,
          variation: Intentional.NO_VARIATION,
          permissions: { ...Intentional.NO_PERMISSIONS },
          baseAvoidRules: config.negativePrompt
            ? config.negativePrompt
                .split(',')
                .map((rule) => rule.trim())
                .filter(Boolean)
            : [],
        });
        if (cancelled) return;
        setCompileIssues(compiled.issues);
        updateConfig('recipeParams', {
          ...compiled.recipeParams,
          selectedStyleDraft: selectedStyles,
        });
        updateConfig('recipeContext', '');
      } catch (error) {
        if (cancelled) return;
        const issues =
          error instanceof Intentional.CompilationBlocked
            ? error.issues
            : [
                {
                  severity: 'error' as const,
                  code: 'COMPILE_FAILED',
                  message: error instanceof Error ? error.message : 'Style compile failed.',
                  layerIds: [],
                },
              ];
        setCompileIssues(issues);
        const message = issues
          .filter((issue) => issue.severity === 'error')
          .map((issue) => issue.message)
          .join(' ');
        updateConfig('recipeParams', {
          selectedStyleDraft: selectedStyles,
          selectedStyles: selectedStyles.map((slot) => ({
            presetId: slot.preset.id,
            presetName: slot.preset.displayName || slot.preset.name,
            enabled: slot.enabled ?? true,
          })),
          intentionalCompileError: message,
        });
        updateConfig('recipeContext', '');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    config.negativePrompt,
    config.prompt,
    intentionalMode,
    intentionalStylesV1,
    referenceImages,
    selectedStyles,
    updateConfig,
  ]);
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
    if (intentionalStylesV1) {
      const error = compileIssues.find((issue) => issue.severity === 'error');
      if (error || generationBlocked) return;
      onGenerate(config.prompt?.trim() || undefined, undefined, { preventModal: true });
      return;
    }
    // Generate exactly the plan already shown/registered, not a random rewrite.
    const generationPlan = registeredStyleGenerationPlan;
    if (!generationPlan || generationBlocked) return;

    onGenerate(
      config.prompt?.trim() || generationPlan.fallbackPrompt,
      {
        recipeId: 'styles',
        recipeParams: { ...generationPlan.recipeParams, selectedStyleDraft: selectedStyles },
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
    registeredStyleGenerationPlan,
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
    compileIssues,
    intentionalStylesV1,
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
    compileIssues,
    intentionalMode,
    setIntentionalMode,
  };
}
