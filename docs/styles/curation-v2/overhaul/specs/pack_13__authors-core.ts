import type { Spec } from '../tools/apply';
import { dna } from './_strict';

// Core anime, author pass: each preset names the creator whose style it follows and describes the
// concrete marks of that style. Briefs stay original and avoid the signature hero, weapon or vehicle.
const spec: Spec = {
  pack: 'pack_13',
  category: '1. Core Anime',
  updates: {
    'SP13-052': {
      name: 'Kentaro Miura - Cursed Blade Dark Fantasy',
      dna: dna({
        aesthetic:
          'Kentaro Miura manga style: obsessive engraving-like crosshatching, monumental dark fantasy compositions, heavily worn plate armor and grotesque demonic anatomy drawn with baroque detail under apocalyptic storm skies.',
        subject_treatment:
          'Preserve the requested identity, count, pose and action; give figures weighty muscular anatomy, scarred faces, battered armor and cloth rendered stroke by stroke, never a lone black-armored swordsman with a slab-like greatsword.',
        color_and_tone:
          'Near-monochrome ink blacks and bone greys with sparing dried-blood red and cold storm blue.',
        lighting_and_shadow:
          'Harsh storm light cutting out silhouettes, dense hatched shadows swallowing half of every form.',
        texture_and_material:
          'Dense pen crosshatching, stippled grime, scratched metal, torn leather, rain streaks drawn as fine lines.',
        camera_and_composition:
          'Low monumental angles and sweeping double-page panoramas where tiny figures face colossal horrors.',
        atmosphere_and_mood:
          'Keep the requested mood with grim defiant endurance against overwhelming darkness.',
        rendering_and_quality:
          'Meticulous hand-inked manga illustration with painterly-level detail density, no digital smoothness.',
        key_features:
          'Kentaro Miura crosshatching; monumental dark fantasy; grotesque demons; battered armor; storm skies',
      }),
      avoid: [
        'a lone black-armored swordsman with an oversized slab greatsword',
        'iron prosthetic arm with a built-in cannon',
        'existing franchise characters',
        'gore',
      ],
      briefs: [
        'Kneeling in a flooded cathedral, a scarred female knight in fluted plate raises a lantern as hundreds of eyes open in the flesh-covered walls around her. No readable text or logo.',
        'Refusing to be sheathed, a haunted halberd drags its exhausted wielder through a tavern door in search of another fight. No readable text or logo.',
        'At the gate of a plague castle, a hooded pilgrim in patched mail waits as the cracks in her gauntlet glow red with each heartbeat. No readable text or logo.',
      ],
    },
  },
};

export default spec;
