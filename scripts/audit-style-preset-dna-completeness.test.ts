import { describe, expect, it } from 'vite-plus/test';

import type { StylePresetManifest } from '../components/recipes/styles/manifestTypes';
import { createStyleDnaCompletenessAuditReport } from './audit-style-preset-dna-completeness';

function manifest(
  id: string,
  visualDna: Partial<StylePresetManifest['visualDna']>,
): StylePresetManifest {
  return {
    schemaVersion: 1,
    id,
    packId: 'pack_test',
    name: id,
    category: '1. Test',
    version: 1,
    supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
    tags: ['test'],
    visualDna: {
      aesthetic: '',
      subject_treatment: '',
      color_and_tone: '',
      lighting_and_shadow: '',
      texture_and_material: '',
      camera_and_composition: '',
      atmosphere_and_mood: '',
      rendering_and_quality: '',
      ...visualDna,
    },
    avoidRules: ['watermark', 'text', 'logo'],
    assets: {},
    attributes: {
      negativePrompt: 'watermark, text, logo',
    },
  };
}

function completeDna(overrides: Partial<StylePresetManifest['visualDna']> = {}) {
  return {
    aesthetic:
      'Tactile river-stone material language with softened contours, mineral variation, and water-polished restraint.',
    subject_treatment:
      'Transform any prompt subject with rounded silhouette pressure, eroded edge logic, and calm mineral surface behavior.',
    color_and_tone:
      'Use layered grey, umber, moss, and wet charcoal tones with restrained natural contrast.',
    lighting_and_shadow:
      'Use broad damp highlights, shallow shadow pools, and small reflected glints across curved forms.',
    texture_and_material:
      'Render smooth stone grain, softened chips, subtle pores, wet sheen, and tumbled contact wear.',
    camera_and_composition:
      'Compose with quiet grouped rhythm, low relief depth, readable silhouettes, and gentle asymmetry.',
    atmosphere_and_mood:
      'Keep the mood patient, grounded, meditative, and physically worn by water.',
    rendering_and_quality:
      'Finish with crisp tactile detail, controlled texture density, and polished material readability.',
    creative_brief:
      'Use this as a reusable style router over any prompt: preserve the user subject while applying water-worn mineral surface logic, rounded structure, and quiet damp light.',
    key_features: 'water-polished edges, wet mineral sheen, tumbled rounded forms',
    ...overrides,
  };
}

function record(manifest: StylePresetManifest) {
  return { filePath: `components/recipes/styles/manifests/presets/${manifest.id}.yaml`, manifest };
}

describe('style preset DNA completeness audit', () => {
  it('flags shallow fields even when all required fields exist', () => {
    const report = createStyleDnaCompletenessAuditReport([
      record(
        manifest('SPX-001', {
          aesthetic: 'Smooth pebbles',
          subject_treatment: 'Rounded shapes',
          color_and_tone: 'Grey brown',
          lighting_and_shadow: 'Wet gloss',
          texture_and_material: 'Smooth, wet',
          camera_and_composition: 'Rounded',
          atmosphere_and_mood: 'Calm, wet',
          rendering_and_quality: 'Riverbed, zen',
          key_features: 'Pile',
          creative_brief:
            'Route any subject through the material style while preserving the prompt subject.',
        }),
      ),
    ]);

    expect(report.findings[0]).toEqual(
      expect.objectContaining({
        id: 'SPX-001',
        severity: 'critical',
      }),
    );
    expect(report.findings[0].issues.map((issue) => issue.kind)).toEqual(
      expect.arrayContaining(['thin_required_field', 'underdeveloped_recommended_field']),
    );
  });

  it('flags generated template text as incomplete even when fields are long', () => {
    const report = createStyleDnaCompletenessAuditReport([
      record(
        manifest('SPX-002', {
          ...completeDna(),
          color_and_tone:
            'Use a controlled palette that supports SPX-002: clear tonal hierarchy, intentional contrast, and category-appropriate color accents without muddy blends.',
          lighting_and_shadow:
            'Shape light and shadow for SPX-002: legible depth, purposeful highlights, readable focal zones, and atmosphere that supports the style without hiding the subject.',
          rendering_and_quality:
            'Finish as a polished 1. Test style-card: crisp detail, no UI/text/watermark, strong thumbnail readability, and consistent production quality.',
        }),
      ),
    ]);

    expect(report.findings[0]).toEqual(
      expect.objectContaining({
        id: 'SPX-002',
        severity: 'high',
      }),
    );
    expect(report.findings[0].issues.map((issue) => issue.kind)).toEqual(
      expect.arrayContaining(['generic_boilerplate']),
    );
  });

  it('keeps complete preset DNA clean', () => {
    const report = createStyleDnaCompletenessAuditReport([
      record(manifest('SPX-003', completeDna())),
    ]);

    expect(report.severityCounts.clean).toBe(1);
    expect(report.findings).toEqual([]);
  });
});
