import { describe, expect, it } from 'vite-plus/test';
import type { StyleRuntimePack } from '../components/recipes/styles/runtimeTypes';
import {
  buildStyleDefaultPresetIndex,
  createStyleDefaultEvidence,
  createStyleDefaultFailureEntry,
  createStyleDefaultJobRequest,
  createStyleDefaultManifestEntry,
  createStyleDefaultTargets,
  mergeStyleDefaultManifestEntries,
  resolveStyleDefaultPresetFromPrompt,
} from './styleDefaultAssetPipeline';

const pack: StyleRuntimePack = {
  id: 'pack_99',
  name: 'Test Pack',
  description: 'Test style pack',
  presets: [
    {
      id: 'SP99-001',
      name: 'Ink Atmosphere',
      category: 'Ink & Print',
      style: {
        aesthetic: 'Ink',
        subject_treatment: 'Strong silhouette',
        color_and_tone: 'Black and ivory',
        lighting_and_shadow: 'High contrast',
        texture_and_material: 'Paper grain',
        camera_and_composition: 'Vertical card',
        atmosphere_and_mood: 'Quiet',
        rendering_and_quality: 'Finished',
      },
    },
  ],
};

describe('styleDefaultAssetPipeline', () => {
  it('resolves a preset from the structured prompt contract used by style-card jobs', () => {
    const index = buildStyleDefaultPresetIndex([pack]);

    const resolved = resolveStyleDefaultPresetFromPrompt(
      ['TARGET STYLE: Ink Atmosphere', 'PACK: Test Pack', 'CATEGORY: Ink & Print'].join('\n'),
      index,
    );

    expect(resolved?.preset.id).toBe('SP99-001');
    expect(resolved?.category).toBe('Ink & Print');
  });

  it('creates manifest entries with exact repo paths and evidence fields', () => {
    const entry = createStyleDefaultManifestEntry({
      pack,
      preset: pack.presets[0],
      category: 'Ink & Print',
      file: 'assets/recipes/styles/defaults/SP99-001.webp',
      jobId: 'job-1',
      sourceAsset: 'assets/recipes/styles/defaults/SP99-001.webp',
      model: 'gpt-5.4-mini',
      reasoningEffort: 'low',
      generatedAt: '2026-05-24T00:00:00.000Z',
    });

    expect(entry).toMatchObject({
      presetId: 'SP99-001',
      file: 'assets/recipes/styles/defaults/SP99-001.webp',
      jobId: 'job-1',
      generationMode: 'text-to-image',
    });
    expect(createStyleDefaultEvidence(entry).exactLocalPath).toBe(
      'assets/recipes/styles/defaults/SP99-001.webp',
    );
  });

  it('merges manifests by preset id with stable ordering', () => {
    const older = createStyleDefaultManifestEntry({
      pack,
      preset: pack.presets[0],
      category: 'Ink & Print',
      file: 'old.webp',
      jobId: 'old-job',
      sourceAsset: 'old.webp',
      model: 'old-model',
      reasoningEffort: 'low',
      generatedAt: '2026-05-23T00:00:00.000Z',
    });
    const newer = { ...older, file: 'new.webp', jobId: 'new-job' };

    expect(mergeStyleDefaultManifestEntries([older], [newer])).toEqual([newer]);
  });

  it('plans pending preset-card targets without losing category filters or exact destinations', () => {
    const targets = createStyleDefaultTargets({
      packs: [pack],
      existingFiles: new Set(),
      force: false,
      categoryFilters: new Set(['Ink & Print']),
      limit: 1,
      defaultsDir: 'assets/recipes/styles/defaults',
      assetExtension: '.webp',
    });

    expect(targets).toEqual([
      {
        pack,
        preset: pack.presets[0],
        category: 'Ink & Print',
        destination: 'assets/recipes/styles/defaults/SP99-001.webp',
      },
    ]);
  });

  it('creates failure evidence with preset identity preserved', () => {
    expect(
      createStyleDefaultFailureEntry({
        pack,
        preset: pack.presets[0],
        category: 'Ink & Print',
        error: 'needs_review',
        failedAt: '2026-05-24T00:00:00.000Z',
      }),
    ).toMatchObject({
      presetId: 'SP99-001',
      packId: 'pack_99',
      category: 'Ink & Print',
      error: 'needs_review',
    });
  });

  it('creates the persistent job request used by CLI adapters', () => {
    expect(createStyleDefaultJobRequest({ projectId: 'project-1', prompt: 'prompt body' })).toEqual(
      {
        projectId: 'project-1',
        kind: 'codex_imagegen',
        prompt: 'prompt body',
      },
    );
  });
});
