import type { StyleRuntimePreset } from './stylesData';
import { describeStyleValue } from './styleLayerComposer';
import { getStyleRuntimePresetDisplayName, getStyleRuntimePresetSearchNames } from './stylesData';

export function buildStylePromptText(preset: StyleRuntimePreset): string {
  const displayName = getStyleRuntimePresetDisplayName(preset);
  const styleAnchors = getStyleRuntimePresetSearchNames(preset).filter(
    (name) => name !== displayName,
  );
  const styleAnchorLine =
    styleAnchors.length > 0 ? `**Style Anchors:** ${styleAnchors.join(', ')}\n` : '';
  return `
**Style:** ${displayName}
${styleAnchorLine}
**Aesthetic:** ${preset.style.aesthetic}
**Subject:** ${describeStyleValue(preset.style.subject_treatment ?? preset.style.form_and_line)}
**Color:** ${describeStyleValue(preset.style.color_and_tone ?? preset.style.color_palette)}
**Lighting:** ${describeStyleValue(preset.style.lighting_and_shadow ?? preset.style.lighting_setup)}
**Texture:** ${describeStyleValue(preset.style.texture_and_material ?? preset.style.material_texture)}
**Camera:** ${describeStyleValue(preset.style.camera_and_composition ?? preset.style.spatial_distortion)}
**Mood:** ${describeStyleValue(preset.style.atmosphere_and_mood ?? preset.style.atmosphere)}
**Quality:** ${describeStyleValue(preset.style.rendering_and_quality ?? preset.style.render_quality)}
`.trim();
}
