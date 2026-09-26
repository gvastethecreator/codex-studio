import type { Create, Spec } from '../tools/apply';
import { ANIME_AVOID } from './_anime';
import { dna } from './_strict';

// Horror anime (part A): prestige horror looks defined by light, framing and texture. Dread comes
// from staging and restraint; no gore. Strict DNA helper, no generic filler.
const AVOID = [...ANIME_AVOID, 'gore', 'graphic wounds'];

const spec: Spec = {
  pack: 'pack_16',
  category: '7. Horror',
  updates: {
    'SP13-031': {
      name: 'Institutional Liminal Dread Anime',
      dna: dna({
        aesthetic:
          'Horror anime of empty institutions after hours: corridors, fluorescent hum, repeated doors and a feeling that the building is watching.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it in a too-clean, too-empty space where something is slightly wrong.",
        color_and_tone:
          'Sickly fluorescent green-white, beige walls and dim blue shadows with no warm color at all.',
        lighting_and_shadow:
          'Flat overhead fluorescent light, one flickering tube and dark doorways that swallow the light.',
        texture_and_material:
          'Linoleum floors, painted cinder block and glass partitions drawn with clean, cold line.',
        camera_and_composition:
          'Long one-point perspective corridors with the subject small, or a single door filling the frame.',
        atmosphere_and_mood:
          'Quietly wrong and uneasy, like an empty school or hospital that should not be empty.',
        rendering_and_quality:
          'Clean, restrained horror anime with precise perspective and minimal effects.',
        key_features: 'one-point corridors; fluorescent hum; repeated doors; emptiness',
      }),
      avoid: AVOID,
      briefs: [
        "A night janitor stands at the end of an endless school corridor of identical doors, and one of them is slowly opening toward him. No readable text or logo.",
        "A security guard realizes the office tower's fluorescent lights now switch on one floor ahead of him, as if escorting him somewhere. No readable text or logo.",
        "In a municipal pool at night every lane rope has rearranged itself into one straight line pointing at the empty lifeguard chair. No readable text or logo.",
      ],
    },
    'SP13-032': {
      name: 'Crimson Celestial Omen Anime',
      dna: dna({
        aesthetic:
          'Apocalyptic omen anime under a wrong sky: red celestial bodies, eclipses and vast silent phenomena looming over small people.',
        subject_treatment:
          "Keep the prompt's subject and setting; place an ominous sky event above it, the people below small and still.",
        color_and_tone: 'Blood crimson sky, black silhouettes and a sickly pale glow on faces.',
        lighting_and_shadow:
          'Red light from above, long shadows in odd directions and no normal sunlight.',
        texture_and_material: 'Smooth painted skies, clean cel figures and faint grain.',
        camera_and_composition: 'Low horizons with huge skies taking most of the frame.',
        atmosphere_and_mood:
          'Ominous and silent, the whole world holding its breath beneath a warning sign.',
        rendering_and_quality: 'Painterly prestige anime skies with crisp small silhouettes below.',
        key_features: 'red sky omen; huge celestial body; tiny silhouettes; low horizon',
      }),
      avoid: AVOID,
      briefs: [
        "Fishing villagers stand silent on the shore at dusk, their shadows pointing the wrong way, as an enormous red planet hangs just above the sea. No readable text or logo.",
        "During a red eclipse every bird in the city lands on the same tower and stares upward in total silence. No readable text or logo.",
        "A farmer waters her crops under two suns, one gold and one blood-red, the red one a little larger every morning. No readable text or logo.",
      ],
    },
    'SP13-033': {
      name: 'Grotesque Marionette Spotlight Anime',
      dna: dna({
        aesthetic:
          'Theatrical horror anime of puppets and stages: jointed bodies, strings, painted faces and a single hard spotlight.',
        subject_treatment:
          "Keep the prompt's subject and setting; stage it as if performed, with strings, stage edges or puppet-like joints where fitting.",
        color_and_tone:
          'Black stage with a single warm white spotlight, faded red velvet and chipped paint colors.',
        lighting_and_shadow:
          'One hard spotlight from above, everything outside it in black, long shadows on the boards.',
        texture_and_material:
          'Chipped lacquer, wooden joints, strings, velvet curtains and stage dust.',
        camera_and_composition:
          'Proscenium framing from the audience or low angles from the stage floor.',
        atmosphere_and_mood:
          'Uncanny and theatrical, an audience of empty seats watching something performed.',
        rendering_and_quality:
          'Stylized prestige anime with stark contrast and fine material detail.',
        key_features: 'single spotlight; strings and joints; chipped paint; empty seats',
      }),
      avoid: AVOID,
      briefs: [
        "A life-size marionette ballerina dances alone in one hard spotlight of an abandoned puppet theater, her strings rising into total darkness. No readable text or logo.",
        "A puppeteer takes his bow after the show and realizes the strings in his hands are tied to his own wrists. No readable text or logo.",
        "A troupe of wooden marionettes sits in the front row applauding a human performer who is visibly trembling on stage. No readable text or logo.",
      ],
    },
    'SP13-034': {
      name: 'Deep Void Whisper Anime',
      dna: dna({
        aesthetic:
          'Minimal horror anime of darkness and depth: tiny figures above black water, wells and voids that seem to breathe.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with vast darkness or depth so it feels small and exposed.",
        color_and_tone: 'Near-black blues and greens with a pale, weak light on the subject only.',
        lighting_and_shadow:
          'One weak light source fading quickly into total darkness, no fill at all.',
        texture_and_material:
          'Still black water, damp stone and faint particles drifting in the dark.',
        camera_and_composition:
          'Top-down views into depths or wide frames that are mostly black with a small lit subject.',
        atmosphere_and_mood:
          'Silent and vertiginous, as if something far below is listening very carefully.',
        rendering_and_quality:
          'Low-key prestige anime with subtle gradients and very restrained detail.',
        key_features: 'vast darkness; tiny lit subject; still black water; depth',
      }),
      avoid: AVOID,
      briefs: [
        "A tiny rowboat with one lantern floats on perfectly still black water in an underground lake, and far below a second lantern is rising toward it. No readable text or logo.",
        "A woman lowers a bucket into the village well and the rope keeps paying out for hours as the sky above her turns to night. No readable text or logo.",
        "A diver hovers at the edge of an ocean trench so dark that her flashlight beam simply stops a meter from the lens. No readable text or logo.",
      ],
    },
    'SP13-035': {
      name: 'Ritual Mask Geometry Anime',
      dna: dna({
        aesthetic:
          'Occult horror anime of rituals and masks: symmetrical processions, geometric mask designs and firelit ceremony.',
        subject_treatment:
          "Keep the prompt's subject and setting; frame it inside a symmetrical ceremony, with masks and geometric patterns where fitting.",
        color_and_tone: 'Black, bone white and deep red with firelight gold on mask edges.',
        lighting_and_shadow:
          'Torch and bonfire light from below, flickering hard shadows across masked faces.',
        texture_and_material:
          'Carved wooden masks, painted geometric patterns, rough robes and ash.',
        camera_and_composition:
          'Strict symmetry with a central axis, processions leading to a vanishing point.',
        atmosphere_and_mood:
          'Ceremonial and menacing, something ancient being honored in the wrong way.',
        rendering_and_quality:
          'Graphic prestige anime with sharp pattern detail and strong symmetry.',
        key_features: 'geometric masks; strict symmetry; firelight from below; procession',
      }),
      avoid: AVOID,
      briefs: [
        "A masked procession walks toward a bonfire on a village road, every mask carved with the same geometric face except the one worn by the visitor. No readable text or logo.",
        "Villagers in perfectly symmetrical masks form a slow spiral around a sleeping stranger in a candlelit barn. No readable text or logo.",
        "At dawn after the ritual a hundred identical masks hang drying on a clothesline, and one of them is still blinking. No readable text or logo.",
      ],
    },
  },
  creates: [
    {
      name: 'Cursed Videotape Horror Anime',
      domain: 'analog tape horror anime',
      tags: ['vhs', 'analog-horror', 'anime'],
      dna: dna({
        aesthetic:
          'Analog horror anime seen through a worn videotape: tracking noise, color bleed and single frames that should not be there.',
        subject_treatment:
          "Keep the prompt's subject and setting; show it as recorded footage, with tape damage getting worse near the frightening detail.",
        color_and_tone:
          'Faded washed-out color with magenta and green chroma bleed and crushed blacks.',
        lighting_and_shadow:
          'Harsh on-camera light or dim household lamps, blown highlights and murky shadows.',
        texture_and_material:
          'VHS tracking lines, dropouts, noise bands and soft tape blur over clean anime line.',
        camera_and_composition:
          'Handheld home-video framing, slightly tilted, with the unsettling detail small and off-center.',
        atmosphere_and_mood:
          'Creeping and wrong, the feeling of watching a tape that someone left for you.',
        rendering_and_quality:
          'Clean anime footage degraded by convincing analog tape artifacts that never hide the subject.',
        key_features: 'tracking noise; chroma bleed; handheld tilt; small wrong detail',
      }),
      avoid: AVOID,
      briefs: [
        "An old home video of a birthday party shows everyone singing around the cake while a tall figure in the dark hallway behind them sings along. No readable text or logo.",
        "A worn tape of a village play freezes on one frame in which every audience member has turned to face the camera. No readable text or logo.",
        "Tracking noise rolls over a tape of an empty beach, and in the single clean frame a woman stands far out on the surface of the water. No readable text or logo.",
      ],
    },
  ] satisfies Create[],
};

export default spec;
