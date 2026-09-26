import type { Spec } from '../tools/apply';
import { dna } from './_strict';

// Anime style spectrum, author pass: each preset names its original creator and describes the
// concrete marks of that style (line, faces, color, staging) so the result reads as that author.
// Briefs stay original; reference-guard avoid rules keep characters, logos and scenes out.
const spec: Spec = {
  pack: 'pack_13',
  category: '5. Anime Style Spectrum',
  updates: {
    'SP05-339': {
      name: 'Naoki Urasawa - Adult Suspense Microgesture',
      dna: dna({
        aesthetic:
          'Naoki Urasawa manga style, as in his long psychological suspense series: grounded realist seinen drawing where ordinary adult faces carry individual wrinkles, heavy eyelids, imperfect noses and ears, and suspense lives in one silent held reaction.',
        subject_treatment:
          'Preserve the requested identity, count, pose, action and any requested clothing; draw people with realistic adult proportions, small eyes, individualized features, believable hair and everyday clothing folds, never generic big-eyed anime faces. Wardrobe details apply only when the prompt leaves clothing open.',
        color_and_tone:
          'Black-and-white manga page: black ink, grey screentone and paper white, with at most one pale wash of color on a single object.',
        lighting_and_shadow:
          'Flat naturalistic light shaped by screentone gradients and solid black shadow shapes that grow heavier as the tension rises.',
        texture_and_material:
          'Clean confident G-pen contour with slight weight variation, sparse economical hatching, dot screentone, white paper showing through; drawn line art, not painting or photo.',
        camera_and_composition:
          'Cinematic manga panel staging: tight close-ups on a face reacting in silence, steady mid shots in ordinary streets, offices and apartment hallways.',
        atmosphere_and_mood:
          'Keep the requested mood with quiet creeping dread under everyday human warmth.',
        rendering_and_quality:
          'Precise realist manga illustration, every face distinct and every gesture observed from life, no glossy digital polish.',
        key_features:
          'Naoki Urasawa realism; individualized adult faces; held silent reaction; screentone and hatching; ordinary settings',
      }),
      briefs: [
        'Two spies smile at each other across a restaurant table, and only one finger tightening on a wine glass betrays who already knows. No readable text or logo.',
        "At the reading of her husband's will, a composed widow lets the corner of her mouth twitch for exactly one instant. No readable text or logo.",
        "A poker player's calm face is flawless except for a single bead of sweat halfway down his temple. No readable text or logo.",
      ],
    },
  },
};

export default spec;
