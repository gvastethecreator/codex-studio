import type { Spec } from '../tools/apply';
import { dna } from './_strict';

// Slice of life and moe, author pass: each preset names the studio or creator whose look it
// follows and describes the concrete marks of that look. Briefs stay original.
const spec: Spec = {
  pack: 'pack_13',
  category: '4. Slice Of Life & Moe',
  updates: {
    'SP05-081': {
      name: 'Kyoto Animation - Shared-Warmth Microacting',
      dna: dna({
        aesthetic:
          'Kyoto Animation television style of its slice-of-life band and club series: soft rounded character designs, large luminous layered eyes, glossy hair highlights, immaculate cleanup lines and tiny precise hand, foot and hair acting.',
        subject_treatment:
          'Preserve the requested identity, count, pose, action and any requested clothing; draw adults with soft rounded faces, big glossy eyes with several highlight layers and small expressive gestures of hands, shoulders and feet. Wardrobe details apply only when the prompt leaves clothing open.',
        color_and_tone:
          'Pastel warm palette, cream, peach, sky blue and soft teal, with gentle color-graded light.',
        lighting_and_shadow:
          'Diffuse window light, soft two-tone cel shadows, subtle lens flare and warm bloom on highlights.',
        texture_and_material:
          'Clean digital cel paint, thin colored lines, detailed photo-traced backgrounds with shallow-focus bokeh.',
        camera_and_composition:
          'Intimate close shots of hands and faces, shallow depth of field, leg and object inserts, gentle eye-level framing.',
        atmosphere_and_mood: 'Keep the requested mood with tender shared everyday warmth.',
        rendering_and_quality:
          'Polished high-budget television animation frame with film-like focus and grading.',
        key_features:
          'Kyoto Animation cel look; layered glossy eyes; small hand acting; bokeh backgrounds; pastel diffuse light',
      }),
      briefs: [
        "Three roommates share a tiny kitchen, one quietly tying another's apron while the third hides a smile behind a ladle as the pot boils over. No readable text or logo.",
        'A woman realizes her grumpy coworker has secretly watered her desk plant for a year, and he looks away, ears turning red. No readable text or logo.',
        "An old couple share one pair of earbuds on a rainy bench, each pretending to enjoy the other's music. No readable text or logo.",
      ],
    },
  },
};

export default spec;
