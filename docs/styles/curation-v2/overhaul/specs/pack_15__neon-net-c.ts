import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Neon, net and signal punks (part C): two more punks to reach twenty.
const AVOID = [...STYLE_AVOID, 'real brand or company logo', 'readable interface text'];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'punk', 'signal'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '2. Neon, Net & Signal Punks',
  updates: {},
  creates: [
    punk(
      'Vendingpunk',
      'vending machine culture punk',
      'vendingpunk',
      {
        aesthetic:
          'Vendingpunk: a city where glowing vending machines sell everything, from noodles to umbrellas to secrets, and form their own lit landmarks at night.',
        subject_treatment:
          "Keep the prompt's subject and setting; line it with glowing vending machines stocked with strange goods behind lit glass.",
        color_and_tone:
          'Night navy streets with bright white and pastel machine glow and colorful packaging without text.',
        lighting_and_shadow:
          'Machines as glowing boxes of light casting rectangles onto wet pavement.',
        texture_and_material:
          'Lit plastic fronts, coin slots, rows of cans and packages, rain on glass.',
        camera_and_composition: 'Lonely rows of machines at night with one small figure choosing.',
        atmosphere_and_mood:
          'Quiet and strange, a lonely city where machines offer comfort at any hour.',
        rendering_and_quality:
          'Clean night illustration with luminous machine fronts and wet reflections.',
        key_features: 'glowing vending rows; strange goods; wet reflections; lonely night',
      },
      [
        'On a rainy mountain pass, a single glowing vending machine sells tiny bottled storms, and a lost traveler in a straw raincoat hesitates with one coin while lightning flickers inside every bottle. No readable text or logo.',
        'A raccoon family has figured out the vending machine and now runs a small snack business for the neighborhood cats. No readable text or logo.',
        'In an abandoned train station, a vending machine still hums and offers one warm can to whoever arrives on the last train. No readable text or logo.',
      ],
    ),
    punk(
      'Neon Benderpunk',
      'neon tube craft punk',
      'neon-bender',
      {
        aesthetic:
          'Neon benderpunk: the craft culture of neon tube benders, workshops of flame, glass rods and glowing gas where signs are born by hand.',
        subject_treatment:
          "Keep the prompt's subject and setting; shape parts of it from hand-bent glowing glass tubes and show the flame work that made them.",
        color_and_tone:
          'Dark workshop blacks with ribbon-burner blue flames and glowing neon pink, red and green.',
        lighting_and_shadow:
          'Neon tubes and blue torch flames as the only light, colored glows on skin and glass.',
        texture_and_material:
          'Glass rods, ribbon burners, electrodes, heat mats and freshly bent tubes.',
        camera_and_composition:
          'Close craft views of hands bending glowing tubes, and walls of finished signs.',
        atmosphere_and_mood:
          'Warm and meticulous, a dying craft keeping the city lit one tube at a time.',
        rendering_and_quality:
          'Glowing illustration with precise glass tube shapes and flame detail.',
        key_features: 'hand-bent tubes; ribbon burner flame; glowing gas colors; workshop walls',
      },
      [
        'An old neon bender shapes a glowing tube into the silhouette of a dragon over a ribbon of blue flame, and the dragon uncoils off the workbench and flies around the dark workshop. No readable text or logo.',
        "An apprentice neon bender accidentally makes a sign in the shape of her boss's snoring face, and it flickers every time he snores. No readable text or logo.",
        'On the last night before the workshop closes forever, every neon sign on the wall lights up by itself one final time. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
