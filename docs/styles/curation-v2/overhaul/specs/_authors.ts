import { readFileSync } from 'node:fs';
import type { Update } from '../tools/apply';
import { dna } from './_strict';

// Author pass for anime presets: the preset names the original author, studio or work and its DNA
// states the medium and the concrete marks of that style. Briefs are kept as they are in the JSON
// files, so re-applying a spec never reverts a brief edited later.
const B = JSON.parse(readFileSync('scripts/style-curation/card-briefs.json', 'utf8'));
const V = JSON.parse(readFileSync('scripts/style-curation/card-brief-variants.json', 'utf8'));

export const keep = (id: string): [string, string, string] => {
  const briefs = [B[id], ...(V[id] ?? [])];
  if (briefs.length !== 3 || briefs.some((b) => !b)) throw new Error(`${id} has no 3 briefs`);
  return briefs as [string, string, string];
};

export interface AuthorLook {
  // Author, studio or work plus the medium, e.g. "Satoshi Kon feature animation (Perfect Blue): ..."
  look: string;
  // How people and forms are drawn; appended after the standard identity lock.
  subject: string;
  color: string;
  light: string;
  texture: string;
  camera: string;
  // A short phrase; the field reads "Keep the requested mood with <mood>."
  mood: string;
  render: string;
  key: string;
  // Replaces the preset-specific avoid rules when the work has a signature character, weapon or vehicle.
  avoid?: string[];
}

export const au = (id: string, name: string, a: AuthorLook): [string, Update] => [
  id,
  {
    name,
    dna: dna({
      aesthetic: a.look,
      subject_treatment: `Preserve the requested identity, count, pose and action; ${a.subject}`,
      color_and_tone: a.color,
      lighting_and_shadow: a.light,
      texture_and_material: a.texture,
      camera_and_composition: a.camera,
      atmosphere_and_mood: `Keep the requested mood with ${a.mood}.`,
      rendering_and_quality: a.render,
      key_features: a.key,
    }),
    ...(a.avoid ? { avoid: a.avoid } : {}),
    briefs: keep(id),
  },
];
