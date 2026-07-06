import { describe, expect, it } from 'vite-plus/test';

import type {
  StyleRuntimePack,
  StyleRuntimePreset,
} from '../components/recipes/styles/runtimeTypes';
import {
  createStyleDuplicateFamilyReport,
  formatStyleDuplicateFamilyReportMarkdown,
} from './report-style-duplicate-families';

function preset(id: string, name: string, category = 'General'): StyleRuntimePreset {
  return {
    id,
    name,
    category,
    style: {
      aesthetic: name,
      subject_treatment: '',
      color_and_tone: '',
      lighting_and_shadow: '',
      texture_and_material: '',
      camera_and_composition: name,
      atmosphere_and_mood: '',
      rendering_and_quality: name,
    },
  };
}

function pack(id: string, presets: StyleRuntimePreset[]): StyleRuntimePack {
  return { id, name: id, description: `${id} description`, presets };
}

describe('style duplicate family report', () => {
  it('finds seeded variant families across packs', () => {
    const report = createStyleDuplicateFamilyReport([
      pack('pack_01', [preset('A', 'Thermal Camera')]),
      pack('pack_02', [preset('B', 'Thermal Vision Green')]),
    ]);

    expect(report.families).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Thermal Camera / Thermal Vision',
          kind: 'seed_family',
          reviewHint: 'likely_variant_family',
          review: expect.objectContaining({
            classification: 'useful_variant_family',
          }),
          presets: expect.arrayContaining([
            expect.objectContaining({ id: 'A' }),
            expect.objectContaining({ id: 'B' }),
          ]),
        }),
      ]),
    );
  });

  it('finds normalized-name exact candidates', () => {
    const report = createStyleDuplicateFamilyReport([
      pack('pack_01', [preset('A', 'Double Exposure')]),
      pack('pack_02', [preset('B', 'Double Exposure Style')]),
    ]);

    expect(report.families).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Double Exposure',
          kind: 'normalized_name',
          reviewHint: 'exact_name_candidate',
          review: expect.objectContaining({
            classification: 'exact_duplicate_candidate',
          }),
          presets: expect.arrayContaining([
            expect.objectContaining({ id: 'A' }),
            expect.objectContaining({ id: 'B' }),
          ]),
        }),
      ]),
    );
  });

  it('does not match broad seed aliases from visual DNA alone', () => {
    const report = createStyleDuplicateFamilyReport([
      pack('pack_01', [
        {
          ...preset('A', 'Travel Photography'),
          style: { ...preset('A', 'Travel Photography').style, aesthetic: 'tiny silhouette forms' },
        },
      ]),
      pack('pack_02', [
        {
          ...preset('B', 'French New Wave'),
          style: { ...preset('B', 'French New Wave').style, aesthetic: 'graphic silhouette' },
        },
      ]),
    ]);

    expect(report.families.some((family) => family.label === 'Silhouette')).toBe(false);
  });

  it('classifies same-pack normalized variants as useful siblings', () => {
    const report = createStyleDuplicateFamilyReport([
      pack('pack_04', [preset('A', 'Manga (Shonen)'), preset('B', 'Manga (Shojo)')]),
    ]);

    expect(report.families).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Manga',
          review: expect.objectContaining({
            classification: 'useful_variant_family',
            confidence: 'high',
          }),
        }),
      ]),
    );
  });

  it('classifies known semantic collisions as false-positive candidates', () => {
    const report = createStyleDuplicateFamilyReport([
      pack('pack_03', [preset('A', 'Slime & Goo')]),
      pack('pack_05', [preset('B', 'Slime Isekai - Monster-Nation Bright Fantasy')]),
    ]);

    expect(report.families).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Slime/Goo',
          review: expect.objectContaining({
            classification: 'false_positive_candidate',
          }),
        }),
      ]),
    );
  });

  it('formats markdown with bounded family and preset rows', () => {
    const report = createStyleDuplicateFamilyReport([
      pack('pack_01', [preset('A', 'Polaroid'), preset('C', 'Blueprint')]),
      pack('pack_02', [preset('B', 'Polaroid Instant'), preset('D', 'Blueprint Diagram')]),
    ]);
    const markdown = formatStyleDuplicateFamilyReportMarkdown({
      report,
      familyLimit: 1,
      presetLimit: 1,
    });

    expect(markdown).toContain('# Style Duplicate Family Report');
    expect(markdown).toContain('Candidate families:');
    expect(markdown).toContain('Exact duplicate candidates:');
    expect(markdown).toContain('...1 more');
  });
});
