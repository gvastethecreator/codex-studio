import type { Dna } from '../tools/apply';

// Strict DNA builder for new specs: every field is written in full for the preset. It adds no
// generic tails; a field shorter than the DNA audit minimum is an error to fix in the spec.
const MIN: Record<keyof Dna, number> = {
  aesthetic: 10,
  subject_treatment: 12,
  color_and_tone: 9,
  lighting_and_shadow: 9,
  texture_and_material: 9,
  camera_and_composition: 9,
  atmosphere_and_mood: 8,
  rendering_and_quality: 9,
  key_features: 4,
};

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;

export function dna(fields: Dna): Dna {
  for (const [key, min] of Object.entries(MIN) as [keyof Dna, number][]) {
    const value = String(fields[key] ?? '').trim();
    if (words(value) < min) {
      throw new Error(`DNA field ${key} needs at least ${min} words: "${value}"`);
    }
    if (/\bcard[- ](size|scale)\b|\bat card\b/i.test(value)) {
      throw new Error(`DNA field ${key} must not use card vocabulary: "${value}"`);
    }
  }
  return fields;
}
