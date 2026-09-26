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
        "A pitcher mid-windup under a blazing sun sees the heat shimmer split the batter into three wavering figures at the plate. No readable text or logo.",
        "An entire rural baseball team crowds around one electric fan in the dugout, fighting over the breeze during a sweltering final. No readable text or logo.",
        "After losing the final, a catcher scoops infield dirt into a jar alone as the stadium lights switch off one by one above him. No readable text or logo.",
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
        "An old boxing coach wraps a young fighter's hands in a dim gym, while the shadow on the wall behind them shows the coach at twenty doing the same. No readable text or logo.",
        "Three generations of one family crew the same wooden rowing boat, grandma at the stern bellowing the stroke rate at her sons. No readable text or logo.",
        "A retired marathoner kneels at the starting line to lace her own worn shoelaces into her daughter's brand-new racing shoes. No readable text or logo.",
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
        "A relay swimmer glides off the wall through water so bright with caustic light that she seems to fly through a liquid sky. No readable text or logo.",
        "A swimmer races a curious sea turtle down the lane of an open-air seaside pool, both absolutely determined to win. No readable text or logo.",
        "In a closed pool at midnight a swimmer floats face-up under the emergency lights while the water holds perfectly still around her. No readable text or logo.",
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
        "A relay runner passes under a row of orange streetlights on an empty coastal road, her breath clouds trailing behind her like ghost runners. No readable text or logo.",
        "A night marathoner is escorted by a scruffy stray dog that has jogged beside her for thirty kilometers without once looking tired. No readable text or logo.",
        "At 3 a.m. a runner reaches the final checkpoint, where a volunteer asleep in a folding chair still holds out a paper cup of water. No readable text or logo.",
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
        "A skater launches off a concrete ramp at night and her neon trick line loops behind the board into a glowing figure eight across the sky. No readable text or logo.",
        "An elderly man in a business suit lands a kickflip in an empty neon parking garage, briefcase still clutched in one hand. No readable text or logo.",
        "A skater grinds the rim of a flooded drainage channel at night while her reflection skates upside down beneath her. No readable text or logo.",
      ],
    ),
  },
};

export default spec;
