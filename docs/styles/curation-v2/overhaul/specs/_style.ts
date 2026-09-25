import type { Dna } from '../tools/apply';

// Shared builder for full representation styles: the prompt subject is rebuilt through the style's
// construction while staying recognizable; setting, action and count come from the prompt.
export const STYLE_AVOID = [
  'readable text',
  'logo',
  'real artist signature',
  'copying a specific famous artwork',
  'muddy noisy texture',
];

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const pad = (t: string, min: number, tail: string) =>
  words(t) < min ? `${t.replace(/\.$/, '')}, ${tail}` : t;

export function style(
  aesthetic: string,
  construction: string,
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
    subject_treatment: `Rebuild the prompt's subject, action and setting through this construction while keeping them recognizable: ${construction}`,
    color_and_tone: pad(color, 9, 'used consistently across subject and background.'),
    lighting_and_shadow: pad(
      light,
      9,
      'expressed through the style rather than photographic lighting.',
    ),
    texture_and_material: pad(texture, 9, 'visible at card size as the signature of the style.'),
    camera_and_composition: pad(camera, 9, 'arranged so the subject still reads at card size.'),
    atmosphere_and_mood: pad(mood, 8, 'driven by the construction, color and rhythm.'),
    rendering_and_quality: pad(render, 9, 'with clean, deliberate marks and no accidental noise.'),
    key_features: key,
  };
}
