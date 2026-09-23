import { createStyleBrowserProcessedData } from './styleBrowserRenderPlan';
import { describe, expect, it } from 'vitest';
import { stylesRecipeContextBuilder } from '../../lib/recipeContextBuilders/styles';
import { loadStyleManifestGraph } from '../../scripts/style-manifest-files';
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

function context(value: SelectedStyleSlot, hasReferenceImages = false) {
  const plan = createSelectedStylesGenerationPlan({ slots: [value], hasReferenceImages });
  if (!plan) throw new Error('Fixture should have active fields');
  return stylesRecipeContextBuilder.buildContext(plan.recipeParams);
}

describe('curation end-to-end boundaries', () => {
  it('is invariant under renaming and catalogue relocation at the final recipe boundary', () => {
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
    expect(context(slot)).toBe(context(renamed));
    expect(context(slot, true)).not.toContain('Forbidden');
    expect(context(slot)).toContain('Forbidden overhead camera'); // Active DNA is not silently rewritten.
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
    expect(stylesRecipeContextBuilder.buildContext(preserved!.recipeParams)).not.toContain(
      'Forbidden overhead camera',
    );
    expect(stylesRecipeContextBuilder.buildContext(reinterpreted!.recipeParams)).toContain(
      'Forbidden overhead camera',
    );
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

  it('new studies have honest pending assets and work through the existing intentional compiler', async () => {
    const graph = await loadStyleManifestGraph('pack_19');
    expect(graph.graph.errors).toEqual([]);
    expect(graph.presetManifests).toHaveLength(4);
    const packs = composeStyleRuntimePacksFromManifests(graph.packManifests, graph.presetManifests);
    const compiled = await compileIntentionalStylePlan({
      slots: [
        { preset: packs[0].presets[0], packId: 'pack_19', packName: packs[0].name, strength: 0.75 },
      ],
      prompt: 'A ceramic pitcher on a table.',
      attachments: [],
      mode: 'generate',
      locks: Intentional.FREE_LAYOUT_LOCKS,
      variation: Intentional.NO_VARIATION,
      permissions: { ...Intentional.NO_PERMISSIONS },
      baseAvoidRules: [],
    });
    expect(compiled.issues.filter((issue) => issue.severity === 'error')).toEqual([]);
    expect(compiled.effectivePrompt).toContain('ceramic pitcher');
    expect(compiled.effectivePrompt).not.toContain('Dry Cut');
    const manifest = graph.presetManifests[0];
    expect(manifest.assets.defaultImage).toBeUndefined();
    expect(manifest.taxonomy?.hasDefaultImage).toBe(false);
    const dishonest = structuredClone(graph.presetManifests);
    dishonest[0].assets.defaultImage = '/fabricated.webp';
    expect(validateStyleManifestGraph(graph.packManifests, dishonest).errors.join(' ')).toContain(
      'pending preview',
    );
    const inconsistent = structuredClone(graph.presetManifests);
    inconsistent[0].attributes!.ui = {};
    expect(
      validateStyleManifestGraph(graph.packManifests, inconsistent).errors.join(' '),
    ).toContain('must agree');
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
