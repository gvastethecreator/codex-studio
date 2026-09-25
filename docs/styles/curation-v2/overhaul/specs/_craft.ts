import type { Dna } from '../tools/apply';

// Shared builder for toy and craft representations: the prompt subject becomes a physical crafted
// object made one specific way. Collectible body changes are declared explicitly when used.
export const CRAFT_AVOID = [
  'brand logo or trademarked toy likeness',
  'readable packaging text',
  'real character likeness',
  'generic plastic render',
  'muddy noisy texture',
];

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const pad = (t: string, min: number, tail: string) =>
  words(t) < min ? `${t.replace(/\.$/, '')}, ${tail}` : t;

export function craft(
  aesthetic: string,
  construction: string,
  color: string,
  light: string,
  texture: string,
  mood: string,
  key: string,
): Dna {
  return {
    aesthetic,
    subject_treatment: `Rebuild the prompt's subject as a physical crafted object made this way, keeping its identity, pose and action readable: ${construction}`,
    color_and_tone: pad(
      color,
      9,
      'true to the craft material rather than the original subject palette.',
    ),
    lighting_and_shadow: pad(
      light,
      9,
      'like a tabletop product or studio photograph of the craft object.',
    ),
    texture_and_material: pad(texture, 9, 'showing how the object was actually made.'),
    camera_and_composition:
      "Tabletop or studio framing at the craft object's real scale, close enough that joins, stitches or seams read at a glance.",
    atmosphere_and_mood: pad(mood, 8, 'coming from the handmade or toy quality.'),
    rendering_and_quality:
      'Photoreal craft-object rendering with believable scale, material detail and construction evidence.',
    key_features: key,
  };
}
