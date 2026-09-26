import { readFileSync } from 'node:fs';
import type { Create, Update } from '../tools/apply';
import { STYLE_AVOID } from './_style';
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
  // New briefs when the old ones were template text or restaged the work; otherwise the JSON briefs stay.
  briefs?: [string, string, string];
  // A video game look: short fields are anchored to its screens instead of an artist's hand.
  game?: boolean;
}

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;

// A terse field is anchored to the named author or work instead of padded: the anchor tells the
// model whose palette, light, finish, framing or hand to reproduce.
const ANCHOR = {
  color: (ref: string) => `true to the ${ref} palette`,
  light: (ref: string) => `lit the way ${ref} lights its scenes`,
  texture: (ref: string) => `with the surface finish of ${ref}`,
  camera: (ref: string) => `framed the way ${ref} composes its shots and pages`,
  render: (ref: string) => `in the recognizable hand of ${ref}`,
};
// Games are anchored to their screens and engine, not to a hand or a page.
const GAME_ANCHOR: typeof ANCHOR = {
  color: (ref: string) => `true to the ${ref} palette`,
  light: (ref: string) => `lit the way ${ref} lights its levels`,
  texture: (ref: string) => `with the in-engine surface finish of ${ref}`,
  camera: (ref: string) => `framed the way ${ref} frames its gameplay screens`,
  render: (ref: string) => `matching real ${ref} screenshots`,
};
const anchored = (text: string, kind: keyof typeof ANCHOR, ref: string, game = false) =>
  words(text) >= 8
    ? text
    : `${text.replace(/\.$/, '')}, ${(game ? GAME_ANCHOR : ANCHOR)[kind](ref)}.`;

export const au = (id: string, name: string, a: AuthorLook): [string, Update] => {
  const ref = name.split(' - ')[0];
  return [
    id,
    {
      name,
      dna: dna({
        aesthetic: a.look,
        // The author's drawing of faces and bodies always applies; its wardrobe is only a default.
        subject_treatment: `Preserve the requested identity, count, pose, action and any requested clothing; ${a.subject} Wardrobe details apply only when the prompt leaves clothing open.`,
        color_and_tone: anchored(a.color, 'color', ref, a.game),
        lighting_and_shadow: anchored(a.light, 'light', ref, a.game),
        texture_and_material: anchored(a.texture, 'texture', ref, a.game),
        camera_and_composition: anchored(a.camera, 'camera', ref, a.game),
        atmosphere_and_mood: `Keep the requested mood with ${a.mood}.`,
        rendering_and_quality: anchored(a.render, 'render', ref, a.game),
        key_features: a.key,
      }),
      ...(a.avoid ? { avoid: a.avoid } : {}),
      briefs: a.briefs ?? keep(id),
    },
  ];
};

// Video game preset update: same DNA shape, anchored to the game's screens.
export const ga = (id: string, name: string, a: AuthorLook) => au(id, name, { ...a, game: true });

// New preset named after an author, studio, work or era, built with the same DNA shape as au().
export const cr = (
  name: string,
  domain: string,
  tags: string[],
  // requestedText: posters and covers keep any title or credits the prompt asks for.
  a: AuthorLook & { briefs: [string, string, string]; requestedText?: boolean },
): Create => {
  const [, update] = au('new', name, { ...a, game: a.game ?? tags.includes('video-game-era') });
  const avoid = [
    ...(a.avoid ?? []),
    'existing franchise characters',
    ...(a.requestedText ? [] : ['series logo or title lettering']),
    'signature costumes, emblems or props from the referenced work',
    'recreated scenes from the referenced work',
    ...STYLE_AVOID.filter((r) => !a.requestedText || !['readable text', 'logo'].includes(r)),
  ];
  return {
    name,
    domain,
    tags: [...tags, 'reference-title'],
    dna: update.dna as Create['dna'],
    avoid,
    ...(a.requestedText ? { textPolicy: 'requested' as const } : {}),
    briefs: a.briefs,
  };
};
