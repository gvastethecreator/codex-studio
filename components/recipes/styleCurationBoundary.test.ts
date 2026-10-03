import { createStyleBrowserProcessedData } from './styleBrowserRenderPlan';
import { describe, expect, it } from 'vitest';
import { getRecipeModule } from '../../lib/recipeModules';
import { buildRecipeProviderDirectives } from '../../lib/recipeProviderDirectives';
import * as Intentional from '../../packages/shared/src/styles/intentional-v1';
import { compileIntentionalStylePlan } from './intentionalStyleCompile';
import { buildStylePromptText } from './stylePromptText';
import {
  createDefaultStyleLayerFieldControls,
  createSelectedStylesGenerationPlan,
  type SelectedStyleSlot,
} from './styleLayerComposer';
import {
  composeStyleRuntimePacksFromManifests,
  validateStyleManifestGraph,
} from './stylePresetManifests';
import { getStyleCategoryDisplayName } from './styles/collections/categoryDisplayNames';

const slot: SelectedStyleSlot = {
  preset: {
    id: 'fixture',
    name: 'Forbidden motel scene',
    displayName: 'Forbidden shrine scene',
    styleAnchors: ['Forbidden character'],
    category: 'Forbidden city',
    style: {
      aesthetic: 'Broad ink masses',
      subject_treatment: 'Clear contours',
      color_and_tone: 'Two separated values',
      lighting_and_shadow: 'Compact shadow shapes',
      texture_and_material: 'Dry marks',
      camera_and_composition: 'Forbidden overhead camera',
      atmosphere_and_mood: 'Quiet rhythm',
      rendering_and_quality: 'Selective detail',
      creative_brief: 'Forbidden shrine with a knight',
    },
  },
  packId: 'fixture-pack',
  packName: 'Forbidden battlefield',
  strength: 0.75,
};

function providerDirectives(recipeParams: Record<string, unknown>) {
  return buildRecipeProviderDirectives(getRecipeModule('styles')!, recipeParams)!;
}

function providerText(recipeParams: Record<string, unknown>) {
  return JSON.stringify(providerDirectives(recipeParams));
}

function visualDna(value: SelectedStyleSlot) {
  const plan = createSelectedStylesGenerationPlan({ slots: [value], hasReferenceImages: false });
  if (!plan) throw new Error('Fixture should have active fields');
  return JSON.stringify(
    providerDirectives(plan.recipeParams).sections.find(
      (section) => section.title === 'Visual DNA',
    ),
  );
}

describe('curation end-to-end boundaries', () => {
  it('keeps provider Visual DNA invariant under renaming and catalogue relocation', () => {
    const renamed = {
      ...slot,
      packName: 'Other metadata',
      preset: {
        ...slot.preset,
        name: 'Other name',
        displayName: 'Other label',
        category: 'Other category',
        styleAnchors: ['Other alias'],
      },
    };
    expect(visualDna(slot)).toBe(visualDna(renamed));
    expect(visualDna(slot)).toContain('Forbidden overhead camera'); // Active DNA is not silently rewritten.
  });

  it('keeps camera in explicit reinterpretation, without mutating saved masks', () => {
    const source = { ...slot, fieldControls: createDefaultStyleLayerFieldControls() };
    const before = JSON.stringify(source);
    const preserved = createSelectedStylesGenerationPlan({
      slots: [source],
      hasReferenceImages: true,
    });
    const reinterpreted = createSelectedStylesGenerationPlan({
      slots: [source],
      hasReferenceImages: true,
      referenceMode: 'reinterpret',
    });
    expect(providerText(preserved!.recipeParams)).not.toContain('Forbidden overhead camera');
    expect(providerText(reinterpreted!.recipeParams)).toContain('Forbidden overhead camera');
    expect(JSON.stringify(source)).toBe(before);
  });

  it('does not dispatch empty layers or their negative rules', () => {
    const fieldControls = createDefaultStyleLayerFieldControls();
    Object.values(fieldControls).forEach((control) => {
      control.enabled = false;
    });
    expect(
      createSelectedStylesGenerationPlan({
        slots: [{ ...slot, fieldControls }],
        hasReferenceImages: false,
      }),
    ).toBeNull();
    const cameraOnly = { ...fieldControls, cameraComposition: { enabled: true, weight: 1 } };
    expect(
      createSelectedStylesGenerationPlan({
        slots: [{ ...slot, fieldControls: cameraOnly }],
        hasReferenceImages: true,
      }),
    ).toBeNull();
  });

  it('copy/use-as-prompt does not turn catalogue aliases into generation instructions', () => {
    const text = buildStylePromptText(slot.preset);
    expect(text).toContain('Broad ink masses');
    for (const value of [
      slot.preset.name,
      slot.preset.displayName!,
      ...slot.preset.styleAnchors!,
      slot.preset.style.creative_brief!,
    ])
      expect(text).not.toContain(value);
  });

  it('does not infer photographic negatives from pack ownership', () => {
    for (const packId of ['pack_09', 'pack_10', 'pack_11']) {
      const plan = createSelectedStylesGenerationPlan({
        slots: [{ ...slot, packId }],
        hasReferenceImages: false,
      });
      expect(plan?.negativePrompt).toBe('');
    }
  });

  it('searches new labels without changing canonical grouping keys', () => {
    const fixture = { ...slot.preset, category: '2. Lighting Techniques' };
    const result = createStyleBrowserProcessedData({
      activePack: { id: 'pack_01', name: 'Photos', description: '', presets: [fixture] },
      currentPackId: 'pack_01',
      favoritesPackId: 'favorites',
      favoritePresets: [],
      favoriteIds: [],
      searchQuery: 'light studies',
      sortOrder: 'source',
      showFavoritesOnly: false,
      categoryLabelForPreset: (preset) => getStyleCategoryDisplayName('pack_01', preset.category!),
    });
    expect(Object.keys(result.groups)).toEqual(['2. Lighting Techniques']);
    expect(result.flatPresets.map((preset) => preset.id)).toEqual(['fixture']);
  });

  it('resolves display labels with actual pack ownership, never by preset ID prefixes', () => {
    expect(getStyleCategoryDisplayName('pack_01', '2. Lighting Techniques')).toBe('Light studies');
    expect(getStyleCategoryDisplayName('unknown', '2. Lighting Techniques')).toBe(
      '2. Lighting Techniques',
    );
  });
});
