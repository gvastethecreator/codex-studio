import type { Dna } from '../tools/apply';

// Shared builder for pack_09 material modifiers: the material replaces or coats the surfaces of the
// target named in the prompt; shape, function, pose and setting stay as requested.
export const MATERIAL_AVOID = [
  'material applied to the background instead of the target',
  'unrequested sample object or habitat',
  'readable text',
  'logo',
  'muddy noisy texture',
];

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const pad = (t: string, min: number, tail: string) =>
  words(t) < min ? `${t.replace(/\.$/, '')}, ${tail}` : t;

export function material(
  aesthetic: string,
  behavior: string,
  color: string,
  light: string,
  texture: string,
  mood: string,
  key: string,
  scope = 'surfaces of the target named in the prompt',
): Dna {
  return {
    aesthetic,
    subject_treatment: `Apply this material to the ${scope}, keeping the target's shape, proportions, function, pose and setting; if no target is named, apply it to the main subject only: ${behavior}`,
    color_and_tone: pad(
      color,
      9,
      'kept on the material while the rest of the scene keeps its own palette.',
    ),
    lighting_and_shadow: pad(
      light,
      9,
      'chosen to reveal how the material reflects, absorbs or transmits light.',
    ),
    texture_and_material: pad(texture, 9, 'at a believable physical scale relative to the target.'),
    camera_and_composition:
      'Keep the prompt framing, but make the material surface large and sharp enough to read its grain, pores or structure at a glance.',
    atmosphere_and_mood: pad(mood, 8, 'carried by the material itself rather than by added props.'),
    rendering_and_quality:
      'Photoreal material rendering with correct micro-detail, edges and light response; no smeared or noisy surfaces.',
    key_features: key,
  };
}
