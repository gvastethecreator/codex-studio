import { describe, expect, it } from 'vite-plus/test';

import type { StylePresetManifest } from '../components/recipes/styles/manifestTypes';
import {
  createStyleSceneLockAuditReport,
  formatStyleSceneLockAuditMarkdown,
} from './audit-style-preset-scene-lock';

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
    avoidRules: ['text'],
    assets: {},
  };
}

function record(manifest: StylePresetManifest) {
  return { filePath: `components/recipes/styles/manifests/presets/${manifest.id}.yaml`, manifest };
}

describe('style preset scene-lock audit', () => {
  it('flags concrete thumbnail subject copied into subject treatment', () => {
    const report = createStyleSceneLockAuditReport([
      record(
        manifest('SPX-001', {
          subject_treatment:
            'A colossal ash-wolf grave guardian crawling from a collapsed chapel floor, ember ribs visible, broken pilgrim bells tied to antlers, tiny shields for scale.',
          camera_and_composition:
            'Low monster-card crop, diagonal beast body, broken arch behind, tiny foreground shield shapes.',
          creative_brief:
            'Reusable visual system for cursed knights, ruins, relics, monsters, or landscapes.',
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
      expect.arrayContaining(['fixed_subject', 'prop_bundle', 'card_composition']),
    );
  });

  it('keeps subject-agnostic style mechanics clean', () => {
    const report = createStyleSceneLockAuditReport([
      record(
        manifest('SPX-002', {
          aesthetic:
            'Bleak ashen medieval fantasy style language with sacred decay, weighty silhouettes, and soot-softened edges.',
          subject_treatment:
            'Transform any prompt subject with heavy silhouette mass, worn ceremonial detail, eroded contours, and solemn material restraint.',
          camera_and_composition:
            'Low, weighty framing with broad negative space and readable silhouette hierarchy across subjects.',
          creative_brief:
            'Reusable visual system that transfers across subjects through palette, material logic, lighting behavior, and composition rules.',
        }),
      ),
    ]);

    expect(report.severityCounts.clean).toBe(1);
    expect(report.findings).toEqual([]);
  });

  it('flags weak router language when no transferability contract exists', () => {
    const report = createStyleSceneLockAuditReport([
      record(
        manifest('SPX-003', {
          aesthetic: 'Soft parchment ink fantasy mood.',
          subject_treatment: 'Clean ink outlines and muted wash texture.',
          camera_and_composition: 'Centered crop with broad decorative border.',
        }),
      ),
    ]);

    expect(report.findings[0]).toEqual(
      expect.objectContaining({
        severity: 'medium',
      }),
    );
    expect(report.findings[0].issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'router_weakness',
        }),
      ]),
    );
  });

  it('formats bounded markdown report', () => {
    const report = createStyleSceneLockAuditReport([
      record(
        manifest('SPX-004', {
          subject_treatment:
            'One shrine fox coiled around a small moon shrine with omen stones, feathers, and silver bells.',
          camera_and_composition:
            'Centered oracle-card crop, one creature, and sparse support symbols.',
        }),
      ),
    ]);
    const markdown = formatStyleSceneLockAuditMarkdown(report);

    expect(markdown).toContain('# Style Preset Scene-Lock Audit');
    expect(markdown).toContain('## Pack Risk');
    expect(markdown).toContain('SPX-004');
  });
});
