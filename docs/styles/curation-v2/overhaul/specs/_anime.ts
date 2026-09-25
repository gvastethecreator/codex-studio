import type { Dna } from '../tools/apply';
import { style } from './_style';

// Shared anime builder: each preset states line, cel, palette and lighting signals of one anime
// look. Genre scenes belong in card briefs, not in the DNA, so any prompt can use the look.
export const ANIME_AVOID = [
  'existing anime character likeness',
  'studio or franchise logo',
  'readable text',
  'muddy off-model anatomy',
  'generic AI anime gloss',
];

export function anime(
  aesthetic: string,
  drawing: string,
  color: string,
  light: string,
  finish: string,
  camera: string,
  mood: string,
  key: string,
): Dna {
  return style(
    aesthetic,
    `redrawn as anime with these drawing rules: ${drawing}`,
    color,
    light,
    finish,
    camera,
    mood,
    'Clean on-model anime frame or key visual with deliberate line and cel decisions.',
    key,
  );
}
