import type { Spec, Update } from '../tools/apply';
import { ANIME_AVOID as AVOID } from './_anime';
import { dna } from './_strict';

// Sports, competition and performance anime (part B): baseball, generational drama, swimming,
// night relay and skateboarding looks.
const u = (fields: Parameters<typeof dna>[0], briefs: [string, string, string]): Update => ({
  dna: dna(fields),
  avoid: [...AVOID, 'real team or league logo'],
  briefs,
});

const spec: Spec = {
  pack: 'pack_16',
  category: '5. Sports, Competition & Performance',
  updates: {
    'SP05-348': u(
      {
        aesthetic:
          'Summer baseball anime of the pitcher and batter duel: cicada heat, dusty diamonds, sweat and one pitch that decides everything.',
        subject_treatment:
          "Keep the prompt's subject and action; frame it as a one-on-one duel in summer heat, every detail pointing at a single decisive moment.",
        color_and_tone:
          'Dusty infield tan, bright outfield green, cloudless summer blue and white uniforms.',
        lighting_and_shadow:
          'High summer sun with short black shadows, heat shimmer and bright cap brims.',
        texture_and_material:
          'Dust clouds, stitched leather ball, sweat-darkened uniforms in crisp cel.',
        camera_and_composition:
          'Framing down the pitcher-to-batter line, close-ups on grips and eyes.',
        atmosphere_and_mood:
          'Hot and breathless, a whole summer riding on one pitch in the ninth inning.',
        rendering_and_quality: 'Crisp sports anime with precise mechanics and heat haze effects.',
        key_features: 'pitcher-batter line; summer heat; dust; grip close-ups',
      },
      [
        'Summer baseball anime frame looking down the line from behind the catcher at a pitcher mid-windup under blazing sun, heat shimmer over the dusty mound, cicadas on the fence and a batter gripping tight in the foreground. No readable text or logo.',
        "Summer baseball anime close-up of a pitcher's fingers on the red stitches of the ball, sweat dripping from the cap brim, the rest of the stadium blurred into bright heat. No readable text or logo.",
        'Summer baseball anime frame of a runner sliding headfirst into home plate in an explosion of dust, the catcher reaching, the umpire leaning in and the crowd frozen mid-shout. No readable text or logo.',
      ],
    ),
    'SP05-349': u(
      {
        aesthetic:
          'Generational sports drama anime: old coaches and young athletes, faded photos, inherited dreams and quiet determination across years.',
        subject_treatment:
          "Keep the prompt's subject and action; add the weight of time, with an older mentor, old equipment or a remembered past nearby.",
        color_and_tone: 'Warm faded sepia for memories and clear bright color for the present.',
        lighting_and_shadow: 'Late afternoon gold light and soft window light in old clubhouses.',
        texture_and_material:
          'Worn gloves, taped handles, old wooden lockers and faded photographs.',
        camera_and_composition:
          'Paired framings of old and young, often side by side or reflected.',
        atmosphere_and_mood: 'Warm and resolute, a promise passed from one generation to the next.',
        rendering_and_quality:
          'Emotional prestige sports anime with gentle color grading between eras.',
        key_features: 'old mentor; inherited equipment; sepia memories; golden light',
      },
      [
        "Generational sports anime frame of an old boxing coach wrapping a young fighter's hands in a dim gym at golden hour, faded photos of his own fights pinned on the wall behind them, dust in the light. No readable text or logo.",
        "Generational sports anime frame of a girl receiving her grandmother's worn ice skates in a quiet rink at dawn, a sepia memory of the grandmother skating overlaid faintly on the ice. No readable text or logo.",
        'Generational sports anime frame of a father and son shooting hoops at a rusty neighborhood court at sunset, their shadows long and overlapping on the asphalt. No readable text or logo.',
      ],
    ),
    'SP05-350': u(
      {
        aesthetic:
          'Swimming anime of water and light: glowing pool blues, underwater caustics, bubbles and bodies stretched in perfect strokes.',
        subject_treatment:
          "Keep the prompt's subject and action; place it in or near water with caustic light and flowing motion.",
        color_and_tone: 'Glowing aqua, deep lane-line blue and white foam with warm skin tones.',
        lighting_and_shadow: 'Underwater caustic patterns rippling over bodies and the pool floor.',
        texture_and_material:
          'Clear water, bubbles, spray and wet skin drawn with luminous effects.',
        camera_and_composition: 'Underwater side views and split surface shots across lanes.',
        atmosphere_and_mood: 'Freeing and luminous, the silence and speed of moving through water.',
        rendering_and_quality:
          'Luminous sports anime with detailed water effects and clean anatomy.',
        key_features: 'caustic light; underwater views; bubbles; split surface',
      },
      [
        'Swimming anime underwater frame of a relay swimmer in a long streamlined glide off the wall, caustic light rippling over her back, a trail of silver bubbles and the lane line glowing aqua. No readable text or logo.',
        'Swimming anime split-surface frame of two swimmers racing neck and neck, spray above and calm blue silence below, their eyes meeting through the water. No readable text or logo.',
        'Swimming anime frame of a boy floating on his back alone in an outdoor pool at night after practice, pool lights glowing up through the water around him. No readable text or logo.',
      ],
    ),
    'SP05-351': u(
      {
        aesthetic:
          'Long-distance running anime at night: streetlights, breath clouds, relay sashes and the loneliness of endurance.',
        subject_treatment:
          "Keep the prompt's subject and action; show sustained, lonely effort through night streets or dark countryside.",
        color_and_tone: 'Deep navy night, sodium orange streetlights and white breath clouds.',
        lighting_and_shadow:
          'Pools of streetlight passing over the runner, long shadows sweeping ahead and behind.',
        texture_and_material:
          'Asphalt, running shoes, sweat and fabric drawn simply with soft glow.',
        camera_and_composition: 'Tracking side shots and long empty roads with a single runner.',
        atmosphere_and_mood:
          'Lonely and determined, every step a small victory against the dark and the cold.',
        rendering_and_quality:
          'Moody sports anime with rhythmic light passes and subtle breath effects.',
        key_features: 'night streetlights; breath clouds; relay sash; lonely road',
      },
      [
        'Night running anime frame of a relay runner passing under a row of orange streetlights on an empty coastal road, breath clouds trailing, the sash on her shoulder and the next teammate a tiny figure far ahead. No readable text or logo.',
        'Night running anime frame of a team of distance runners jogging over a bridge in a winter night, their breath clouds merging under a single street lamp. No readable text or logo.',
        "Night running anime close-up of a runner's feet splashing through a puddle that reflects a lit convenience store at 2 a.m. No readable text or logo.",
      ],
    ),
    'SP05-352': u(
      {
        aesthetic:
          'Skateboarding anime of flow and neon: trick lines, ramps at night, bare concrete walls and boards drawn in bright motion arcs.',
        subject_treatment:
          "Keep the prompt's subject and action; turn movement into flowing trick lines through an urban or skatepark space.",
        color_and_tone:
          'Neon magenta and cyan against night concrete grey, with bright board graphics.',
        lighting_and_shadow:
          'Neon signs and park floodlights, colored rims and long shadows on concrete.',
        texture_and_material:
          'Concrete, grip tape, urethane wheels and loose clothing in clean cel with motion blur.',
        camera_and_composition:
          'Fisheye low angles at the lip of ramps and long lines following a run.',
        atmosphere_and_mood:
          'Loose and exhilarating, the pure fun of carving through a city at night.',
        rendering_and_quality: 'Stylish sports anime with bright neon glow and smooth motion arcs.',
        key_features: 'trick lines; neon rims; fisheye ramps; motion arcs',
      },
      [
        'Skateboarding anime frame of a skater launching off a concrete ramp at night in a fisheye low angle, board flipping under her feet, neon magenta and cyan rim light and a bright motion arc tracing the trick. No readable text or logo.',
        'Skateboarding anime frame of a crew bombing down a steep empty street at dawn, their lines drawn as colored trails. No readable text or logo.',
        'Skateboarding anime frame of a skater grinding a long rail beside a canal, sparks from the trucks and city lights reflected in the water. No readable text or logo.',
      ],
    ),
  },
};

export default spec;
