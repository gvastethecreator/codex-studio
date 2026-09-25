import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Media, vapor and glitch punks (part B): jukebox, hologram, arcade, slide, screensaver, vinyl, pinball, karaoke.
const AVOID = [
  ...STYLE_AVOID,
  'real brand or company logo',
  'readable interface text or numerals',
  'real celebrity likeness',
];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'punk', 'media'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '7. Media, Vapor & Glitch Punks',
  updates: {},
  creates: [
    punk(
      'Jukeboxpunk',
      'jukebox diner culture punk',
      'jukeboxpunk',
      {
        aesthetic:
          'Jukeboxpunk: mid-century diner culture centered on glowing jukeboxes, with bubble tubes, chrome grilles, neon arches, checkered floors and milkshake counters.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it in a glowing diner world with jukeboxes, chrome, neon and checkered floors.",
        color_and_tone:
          'Cherry red, mint, cream and chrome with warm neon orange and bubble-tube rainbows.',
        lighting_and_shadow:
          'Glowing jukebox light and neon reflections on chrome and vinyl booths.',
        texture_and_material:
          'Chrome, bubble tubes, red vinyl booths, checkered tile and glossy formica.',
        camera_and_composition:
          'Warm diner interiors with a jukebox glowing at the center of attention.',
        atmosphere_and_mood: 'Sweet, rebellious and nostalgic, rock and roll on a Saturday night.',
        rendering_and_quality: 'Glossy illustration with bright chrome reflections and neon glow.',
        key_features: 'glowing jukeboxes; bubble tubes; chrome grilles; checkered floors',
      },
      [
        'A colossal glowing jukebox the size of a cathedral stands in the desert at night, bubble tubes rising like pillars of rainbow light while a hundred cars circle it with their headlights on. No readable text or logo.',
        'A diner jukebox only plays the same song, no matter what anyone chooses, and the cook has started dancing to it against his will. No readable text or logo.',
        'Late at night in an empty diner, a waitress sits alone in a vinyl booth as the jukebox glows softly and plays one slow song. No readable text or logo.',
      ],
    ),
    punk(
      'Hologrampunk',
      'cheap hologram foil punk',
      'hologrampunk',
      {
        aesthetic:
          'Hologrampunk: a world covered in cheap holographic foil and lenticular prints, with rainbow diffraction shifts, shimmering stickers and images that change as you move.',
        subject_treatment:
          "Keep the prompt's subject and setting; render its surfaces as shimmering holographic foil and lenticular prints with rainbow shifts.",
        color_and_tone:
          'Rainbow diffraction over silver foil with shifting cyan, magenta and gold bands.',
        lighting_and_shadow:
          'Sharp point light creating rainbow flares and shifting bands on foil.',
        texture_and_material:
          'Holographic foil, lenticular ridges, diffraction patterns and glossy laminate.',
        camera_and_composition:
          'Close views of shimmering surfaces with images appearing to shift angle.',
        atmosphere_and_mood: 'Dazzling, cheap and magical, a trick of light you want to keep.',
        rendering_and_quality:
          'Crisp iridescent rendering with diffraction rainbows and fine ridges.',
        key_features: 'rainbow diffraction; lenticular ridges; silver foil; shifting images',
      },
      [
        'A warrior queen made of holographic foil rides a lenticular tiger across a shimmering silver battlefield, her image shifting into a skeleton and back to a queen as the light moves across her. No readable text or logo.',
        'A boy trades his entire lunch for one shiny holographic sticker of a unicorn, and the whole schoolyard crowds around to watch it shimmer. No readable text or logo.',
        'A cracked holographic bookmark lies on an old windowsill, throwing a small rainbow across an empty room at sunrise. No readable text or logo.',
      ],
    ),
    punk(
      'Photoboothpunk',
      'photo booth strip culture punk',
      'photoboothpunk',
      {
        aesthetic:
          'Photoboothpunk: life told through coin photo booths, with four-frame vertical strips, harsh flash, pulled curtains and faces caught mid-laugh or mid-secret.',
        subject_treatment:
          "Keep the prompt's subject and setting; show it as a four-frame photo booth strip, the same framing repeated with a changing moment in each frame.",
        color_and_tone:
          'Silvery black and white or faded chemical color with bright flash-lit skin and dark booth backdrops.',
        lighting_and_shadow: 'Harsh frontal flash with flat faces and a hard dark falloff behind.',
        texture_and_material:
          'Glossy chemical print paper, slight developer stains, booth curtain fabric and rounded frame corners.',
        camera_and_composition:
          'Four stacked square frames from the same fixed close camera, each a different beat.',
        atmosphere_and_mood:
          'Spontaneous, intimate and mischievous, a tiny private theatre behind a curtain.',
        rendering_and_quality:
          'Authentic photo booth print rendering with flash glare, grain and slight chemical unevenness.',
        key_features: 'four-frame strips; harsh flash; fixed close camera; changing moments',
      },
      [
        'A photo booth strip of a knight in full armor squeezed into a tiny booth: calm in frame one, drawing his sword in frame two, a dragon eye filling the curtain gap in frame three, and only smoke in frame four. No readable text or logo.',
        'A photo booth strip of a very dignified elderly couple slowly losing control across four frames, until the final frame is just a blur of hat, feathers and a runaway pigeon. No readable text or logo.',
        'A faded four-frame photo booth strip of a young woman alone, smiling in the first three frames and, in the last, someone who is not there resting a hand on her shoulder. No readable text or logo.',
      ],
    ),
    punk(
      'Carouselpunk',
      'slide projector memory punk',
      'carouselpunk',
      {
        aesthetic:
          'Carouselpunk: family memories projected from rotating slide carousels, with dust-filled beams, warm color slides, clicking changes and living rooms turned into cinemas.',
        subject_treatment:
          "Keep the prompt's subject and setting; show it as a warm color slide projected onto a wall or sheet in a dark living room.",
        color_and_tone:
          'Warm saturated slide colors, faded magenta shifts and brown-dark living rooms.',
        lighting_and_shadow:
          'A single projector beam through dust and the glow of the projected image.',
        texture_and_material:
          'Slide film grain, dust in the beam, hanging bedsheets, wallpaper and carpet.',
        camera_and_composition:
          'Dark rooms with a glowing projected image and silhouettes of viewers.',
        atmosphere_and_mood: 'Warm, nostalgic and bittersweet, memories glowing on a wall.',
        rendering_and_quality: 'Warm grainy illustration with a luminous projected image and dust.',
        key_features: 'projected slides; dust beams; dark living rooms; viewer silhouettes',
      },
      [
        'A family slide show on a living room wall suddenly shows a holiday photo nobody remembers taking, a vast ancient temple in a jungle, and the whole family leans closer in the dark. No readable text or logo.',
        'A dad insists on showing four hundred slides of his fishing trip, and the whole family has fallen asleep on the sofa in the projector glow. No readable text or logo.',
        'An old woman clicks through slides alone in the dark, pausing on one of a young couple laughing on a beach decades ago. No readable text or logo.',
      ],
    ),
    punk(
      'Screensaverpunk',
      'idle-screen screensaver punk',
      'screensaverpunk',
      {
        aesthetic:
          'Screensaverpunk: the dreaming world of idle old computers, with endless pipe mazes, flying starfields, bouncing shapes and 3D forms drifting in black space.',
        subject_treatment:
          "Keep the prompt's subject and setting; render it as an early 3D screensaver scene with shiny primitive shapes drifting in black space.",
        color_and_tone:
          'Black backgrounds with shiny primary colored 3D primitives and white starfields.',
        lighting_and_shadow: 'Simple early 3D shading with bright hard specular highlights.',
        texture_and_material:
          'Glossy low-poly pipes, chrome spheres, smooth gradients and starfield dots.',
        camera_and_composition:
          'Endless looping motion through black space with shapes filling the frame.',
        atmosphere_and_mood: 'Hypnotic, lonely and dreamy, machines dreaming while nobody watches.',
        rendering_and_quality: 'Early 3D rendering with simple shading and glossy highlights.',
        key_features: 'pipe mazes; starfields; bouncing shapes; black space',
      },
      [
        'An abandoned office at night where every idle computer shows endless growing pipes, and the glossy colored pipes have started to crawl out of the screens and fill the whole room like a jungle. No readable text or logo.',
        'An office worker waits for a bouncing shape on his screensaver to hit the exact corner of the screen, the whole office gathered silently behind him. No readable text or logo.',
        'A single old monitor glows in a dark room, a starfield drifting endlessly while its owner sleeps at the desk. No readable text or logo.',
      ],
    ),
    punk(
      'Vinylpunk',
      'record culture vinyl punk',
      'vinylpunk',
      {
        aesthetic:
          'Vinylpunk: a culture built around vinyl records, with record-store crates, glossy black grooves, turntables, needle drops and walls of album sleeves.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with vinyl records, turntables, crates and spinning grooves.",
        color_and_tone: 'Glossy black vinyl, warm wood and sleeve colors with warm lamp amber.',
        lighting_and_shadow:
          'Warm lamps catching rainbow sheen in the grooves of spinning records.',
        texture_and_material:
          'Glossy grooves, cardboard sleeves, wooden crates, turntable metal and dust.',
        camera_and_composition: 'Close views of needles on grooves and crowded record shops.',
        atmosphere_and_mood: 'Warm, devoted and analog, music you can hold in your hands.',
        rendering_and_quality:
          'Warm detailed illustration with glossy groove highlights and soft dust.',
        key_features: 'spinning grooves; record crates; needle drops; groove sheen',
      },
      [
        'A giant vinyl record the size of a city square spins slowly under the night sky while a crowd dances on its grooves, a colossal needle lowering down from the clouds to drop the beat. No readable text or logo.',
        'A record collector buys so many records that his apartment is now a maze of crates, and his partner can only reach the kitchen through a narrow tunnel. No readable text or logo.',
        'A single needle rests on a spinning record in an empty room at night, a warm lamp glowing and a chair still turned toward the speakers. No readable text or logo.',
      ],
    ),
    punk(
      'Pinballpunk',
      'pinball machine world punk',
      'pinballpunk',
      {
        aesthetic:
          'Pinballpunk: whole worlds built as pinball playfields, with flippers, bumpers, ramps, chrome balls and flashing lights under glass.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into a pinball playfield world of ramps, bumpers, flippers and a racing chrome ball.",
        color_and_tone:
          'Bright primary playfield colors with chrome, flashing lamp oranges and deep backglass blacks.',
        lighting_and_shadow:
          'Flashing bulbs and reflections under glass, bright chrome highlights.',
        texture_and_material:
          'Painted playfield wood, chrome ramps, rubber bumpers, glass and steel balls.',
        camera_and_composition: 'High angled views down the table with a chrome ball mid-flight.',
        atmosphere_and_mood: 'Frantic, flashing and playful, a whole world of chaos under glass.',
        rendering_and_quality:
          'Crisp glossy illustration with flashing lights and chrome reflections.',
        key_features: 'flippers and bumpers; chrome ball; ramps under glass; flashing lamps',
      },
      [
        'A tiny knight on horseback rides a racing chrome pinball across a vast playfield kingdom, dodging giant rubber bumpers as flashing lamps light up a dragon-shaped ramp ahead. No readable text or logo.',
        'A pinball ball escapes the machine, rolls across a bar floor and out the door while the player keeps desperately hitting the flippers. No readable text or logo.',
        'An old pinball machine flickers alone in a dark basement, one chrome ball resting still between its flippers. No readable text or logo.',
      ],
    ),
    punk(
      'Karaokepunk',
      'karaoke box culture punk',
      'karaokepunk',
      {
        aesthetic:
          'Karaokepunk: late-night karaoke rooms and bars, with glitter microphones, disco lights, tambourines, velvet sofas and friends singing with total commitment.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into a late-night karaoke scene with microphones, disco lights and dramatic singers.",
        color_and_tone:
          'Hot pink, purple and blue disco light with glitter gold and velvet deep tones.',
        lighting_and_shadow: 'Spinning disco light spots and screen glow in small dark rooms.',
        texture_and_material:
          'Glitter microphones, velvet sofas, tambourines, drinks and mirrored balls.',
        camera_and_composition: 'Close dramatic singing poses with friends crowded around.',
        atmosphere_and_mood: 'Silly, heartfelt and loud, everyone is a star for three minutes.',
        rendering_and_quality: 'Colorful glowing illustration with disco light spots and glitter.',
        key_features: 'glitter microphones; disco lights; velvet rooms; dramatic singers',
      },
      [
        'A shy office worker takes the microphone at a karaoke bar and her voice is so powerful that every window in the building shatters outward into the neon night like falling stars. No readable text or logo.',
        'A group of very serious businessmen performs a fully choreographed power ballad in a tiny karaoke room, ties around their heads and tambourines flying. No readable text or logo.',
        'At closing time, a lone man sings softly into a microphone in an empty karaoke bar, the disco ball turning slowly above him. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
