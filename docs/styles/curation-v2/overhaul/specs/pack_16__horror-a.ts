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
        'Horror anime frame of a night janitor standing at the far end of a long one-point school corridor, every classroom door identical and slightly ajar, one fluorescent tube flickering, sickly green-white light and no one else in the building. No readable text or logo.',
        'Horror anime frame of a hospital waiting room at 3 a.m. with rows of empty chairs facing a dark window, one chair turned the wrong way. No readable text or logo.',
        'Horror anime frame of a girl pressing an elevator button in an office tower after hours, the doors opening onto a floor that should not exist. No readable text or logo.',
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
        'Omen anime frame of a fishing village at dusk where a vast crimson planet hangs just above the sea, villagers standing silent on the pier as black silhouettes, the water glowing red and gulls frozen in the sky. No readable text or logo.',
        'Omen anime frame of a school rooftop where two students watch a black eclipse ringed in red fire. No readable text or logo.',
        'Omen anime frame of a wheat field where every stalk leans toward a red light rising behind the hills. No readable text or logo.',
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
        'Horror anime frame of an old puppet theater where a life-size marionette of a smiling ballerina dances alone in one hard spotlight, strings rising into darkness, rows of empty velvet seats and chipped paint on her cheeks. No readable text or logo.',
        'Horror anime frame of a puppeteer backstage surrounded by hanging marionettes that all turn their heads toward the door. No readable text or logo.',
        'Horror anime frame of a child alone in the front row applauding a puppet show with no puppeteer. No readable text or logo.',
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
        'Horror anime top-down frame of a small rowboat with a single lantern floating on perfectly still black water in an underground lake, the darkness around it enormous, faint shapes of stone pillars descending into the depths. No readable text or logo.',
        'Horror anime frame looking down an ancient well where a tiny face looks back up from the dark water. No readable text or logo.',
        'Horror anime frame of a diver hanging in deep dark ocean water with a weak torch, a huge shadow passing below. No readable text or logo.',
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
        'Horror anime frame of a masked procession walking down a village road at night toward a bonfire, every mask carved with the same geometric pattern, strict symmetry, torches held low and a lone outsider watching from a hayloft. No readable text or logo.',
        'Horror anime close-up of a mask with geometric cuts glowing in firelight, eyes behind it unblinking. No readable text or logo.',
        'Horror anime frame of a circle of robed figures kneeling around a carved stone in a forest clearing. No readable text or logo.',
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
        'Analog horror anime frame from an old home videotape of a family birthday party, everyone singing around the cake, while in the dark hallway behind them a tall figure stands perfectly still, tracking noise rolling up the screen and colors bleeding. No readable text or logo.',
        'Analog horror anime frame of a tape recording of an empty playground at dusk, a swing moving by itself and a dropout band crossing it. No readable text or logo.',
        'Analog horror anime frame of a camcorder view of a bedroom at night, the closet door opening a little more in each frame. No readable text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
