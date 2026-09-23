/**
 * The final legacy-style prompt boundary. Catalogue identity and historical
 * briefs remain in saved metadata, never in the provider-facing document.
 * This is not a semantic sanitizer: scene-bearing text inside an enabled DNA
 * field still requires an authored preset revision and visual evaluation.
 */
export const LEGACY_STYLE_PROMPT_FIELDS = [
  ['aesthetic', 'Core aesthetic'],
  ['subjectTreatment', 'Subject treatment'],
  ['colorTone', 'Color and tone'],
  ['lightingShadow', 'Lighting and shadow'],
  ['textureMaterial', 'Texture and material'],
  ['cameraComposition', 'Camera and composition'],
  ['atmosphereMood', 'Atmosphere and mood'],
  ['renderingQuality', 'Rendering and finish'],
] as const;

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function weight(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0.1, Math.min(1, value))
    : fallback;
}

/** Only known field keys/values survive; user-editable field labels do not. */
export function serializeLegacyStyleLayers(
  value: unknown,
  options: { preserveReference?: boolean } = {},
): string {
  if (!Array.isArray(value)) return '';
  return value
    .flatMap((item, index) => {
      const layer = record(item);
      if (!layer || layer.enabled === false) return [];
      const controls = record(layer.fields);
      const lines = LEGACY_STYLE_PROMPT_FIELDS.flatMap(([key, label]) => {
        if (options.preserveReference && key === 'cameraComposition') return [];
        const control = controls ? record(controls[key]) : null;
        // A structured mask is authoritative, even when every field is disabled.
        if (controls && (!control || control.enabled === false)) return [];
        const valueText = text(controls ? control?.value : layer[key]);
        if (!valueText || valueText === 'Standard') return [];
        return [`- ${label}: ${valueText}`];
      });
      if (!lines.length) return [];
      const influence = weight(layer.strength, 0.75).toFixed(2);
      return [`Style layer ${index + 1} (influence ${influence})\n${lines.join('\n')}`];
    })
    .join('\n\n');
}

/** Single-style callers without selectedStyles keep their eight-field API. */
export function serializeLegacyStyleParams(params: Record<string, unknown>): string {
  const preserveReference = params.mode === 'PRESERVE_REFERENCE';
  if (Array.isArray(params.selectedStyles)) {
    return serializeLegacyStyleLayers(params.selectedStyles, { preserveReference });
  }
  return serializeLegacyStyleLayers([{ ...params, strength: 1 }], { preserveReference });
}

export function buildLegacyStylePrompt(params: Record<string, unknown>): string {
  const mode =
    params.mode === 'PRESERVE_REFERENCE'
      ? 'PRESERVE_REFERENCE'
      : params.mode === 'CREATIVE_REIMAGINING'
        ? 'CREATIVE_REIMAGINING'
        : 'DIRECT_STYLE_SYNTHESIS';
  const layout =
    mode === 'PRESERVE_REFERENCE'
      ? 'Preserve reference identity, pose, framing, camera and composition. The camera style field is not applied.'
      : mode === 'CREATIVE_REIMAGINING'
        ? 'Reinterpret reference composition only as requested by the user; preserve subject identity and requested content.'
        : 'Respect composition and camera specified by the user. Otherwise compose only the requested content.';
  return [
    `MODE: ${mode}`,
    '',
    '[CONTENT CONTRACT]',
    'The user prompt supplies subject, action, setting and requested text. Visual fields describe their representation, not a replacement scene.',
    'Explicit user content takes precedence over incidental subjects or props mentioned by a preset.',
    layout,
    'Do not invent variation in pose, palette, lighting, setting or camera between repeated requests.',
    '',
    '[ACTIVE VISUAL FIELDS]',
    serializeLegacyStyleParams(params) || 'No active visual fields.',
    '',
    'Influence and field weights express relative language-level emphasis, not calibrated pixel percentages.',
    'Do not output explanations. Return the requested image.',
  ].join('\n');
}
