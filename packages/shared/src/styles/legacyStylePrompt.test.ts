import { describe, expect, it } from 'vitest';
import { buildLegacyStylePrompt, serializeLegacyStyleLayers } from './legacyStylePrompt';

const layer = {
  presetName: 'A warrior in a chapel',
  packName: 'Medieval battles',
  styleAnchors: ['old scene name'],
  creativeBrief: 'Add a castle and a knight.',
  strength: 0.75,
  aesthetic: 'cached stale scene',
  fields: {
    aesthetic: { enabled: true, value: 'Broad matte value planes', label: 'Secret castle' },
    cameraComposition: { enabled: false, value: 'Frontal castle view' },
    scene: { enabled: true, value: 'Unregistered scene' },
  },
};

describe('legacy style prompt boundary', () => {
  it('emits only allowed active visual values, never catalogue metadata', () => {
    const prompt = buildLegacyStylePrompt({ selectedStyles: [layer], presetName: 'A castle' });
    expect(prompt).toContain('Broad matte value planes');
    for (const word of [
      'warrior',
      'chapel',
      'Medieval',
      'castle',
      'knight',
      'Unregistered',
      'stale',
    ]) {
      expect(prompt).not.toContain(word);
    }
  });
  it('does not fall back to cached top-level fields when a mask disables them', () => {
    const masked = { ...layer, fields: { aesthetic: { enabled: false, value: 'hidden' } } };
    expect(serializeLegacyStyleLayers([masked])).toBe('');
    expect(buildLegacyStylePrompt({ selectedStyles: [masked], aesthetic: 'stale' })).not.toContain(
      'stale',
    );
  });
  it('omits disabled layers and malformed input', () => {
    expect(serializeLegacyStyleLayers([null, [], 5, { ...layer, enabled: false }])).toBe('');
  });
  it('preserves the direct eight-field API without display names or briefs', () => {
    const prompt = buildLegacyStylePrompt({
      aesthetic: 'Dry ink',
      presetName: 'Do not send me',
      creativeBrief: 'Hidden brief',
    });
    expect(prompt).toContain('Dry ink');
    expect(prompt).not.toContain('Do not send me');
    expect(prompt).not.toContain('Hidden brief');
  });
  it('suppresses historical camera fields for reference preservation', () => {
    const camera = {
      ...layer,
      fields: { cameraComposition: { enabled: true, value: 'Move to overhead' } },
    };
    expect(
      buildLegacyStylePrompt({ mode: 'PRESERVE_REFERENCE', selectedStyles: [camera] }),
    ).not.toContain('Move to overhead');
    expect(
      buildLegacyStylePrompt({ mode: 'CREATIVE_REIMAGINING', selectedStyles: [camera] }),
    ).toContain('Move to overhead');
  });
  it('does not rehydrate unsafe cached instructions from an old draft', () => {
    const prompt = buildLegacyStylePrompt({
      selectedStyles: [layer],
      styleEmphasis: 'Add a castle',
      roleInstruction: 'Add a knight',
      compositionRule: 'Copy a chapel',
    });
    expect(prompt).not.toMatch(/castle|knight|chapel/);
  });
  it('keeps complete output invariant under catalogue renaming', () => {
    const a = buildLegacyStylePrompt({ selectedStyles: [layer] });
    const b = buildLegacyStylePrompt({
      selectedStyles: [
        { ...layer, presetName: 'Renamed', packName: 'Moved', styleAnchors: ['Different'] },
      ],
    });
    expect(a).toBe(b);
  });
  it('clamps invalid strengths without emitting NaN or Infinity', () => {
    expect(serializeLegacyStyleLayers([{ ...layer, strength: Infinity }])).toContain('0.75');
    expect(serializeLegacyStyleLayers([{ ...layer, strength: 20 }])).toContain('1.00');
  });
});
