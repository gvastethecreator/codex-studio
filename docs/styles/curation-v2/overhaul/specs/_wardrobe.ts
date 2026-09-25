import type { Dna } from '../tools/apply';

// Shared builder for pack_08 wardrobe themes: the preset changes clothing, styling and fashion
// light; the wearer, pose and setting come from the prompt. Short fields get a meaningful tail so
// every field states what it controls.
export const WARDROBE_AVOID = [
  'brand logo',
  'readable label text',
  'real designer or celebrity likeness',
  'generic catalog outfit',
  'bad garment fit',
];

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const pad = (t: string, min: number, tail: string) =>
  words(t) < min ? `${t.replace(/\.$/, '')}, ${tail}` : t;

export function wear(
  aesthetic: string,
  garments: string,
  color: string,
  light: string,
  texture: string,
  camera: string,
  mood: string,
  render: string,
  key: string,
): Dna {
  return {
    aesthetic,
    subject_treatment: `Redress the prompt's wearer in this wardrobe while keeping their identity, age, body, pose, action and setting: ${garments}`,
    color_and_tone: pad(
      color,
      9,
      'applied to garments and accessories while skin, setting and props keep their natural color.',
    ),
    lighting_and_shadow: pad(
      light,
      9,
      'shaped to reveal garment cut, drape, texture and fit on the wearer.',
    ),
    texture_and_material: pad(
      texture,
      9,
      'rendered with correct weave, weight, sheen and stitching.',
    ),
    camera_and_composition: pad(
      camera,
      9,
      'keeping the full outfit silhouette and fit readable at a glance.',
    ),
    atmosphere_and_mood: pad(mood, 8, "carried by the wearer's posture, styling and attitude."),
    rendering_and_quality: pad(render, 9, 'with believable fabric weight, seams and fit detail.'),
    key_features: key,
  };
}
