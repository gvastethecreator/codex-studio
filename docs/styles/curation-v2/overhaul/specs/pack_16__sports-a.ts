import type { Spec, Update } from '../tools/apply';
import { ANIME_AVOID as AVOID } from './_anime';
import { dna } from './_strict';

// Sports, competition and performance anime (part A): the generated router DNA is replaced by the
// look of one discipline each. Names are kept; DNA and briefs are specific. Strict helper.
const u = (fields: Parameters<typeof dna>[0], briefs: [string, string, string]): Update => ({
  dna: dna(fields),
  avoid: [...AVOID, 'real team or league logo'],
  briefs,
});

const spec: Spec = {
  pack: 'pack_16',
  category: '5. Sports, Competition & Performance',
  updates: {
    'SP05-343': u(
      {
        aesthetic:
          'Volleyball anime of vertical explosions: jumps held at their peak, arms cocked, the ball a white streak against gym ceilings.',
        subject_treatment:
          "Keep the prompt's subject and action; push it upward into a peak moment of a jump, reach or leap, held for one breathless frame.",
        color_and_tone:
          'Gym-floor orange, jersey colors and bright ceiling white with deep sweat-lit shadows.',
        lighting_and_shadow:
          'Overhead gym lights from above, strong rim on shoulders and hair at the top of the jump.',
        texture_and_material:
          'Polished wood floor, mesh net and damp jersey fabric drawn with clean cel.',
        camera_and_composition:
          'Extreme low angles looking up at airborne figures, the net slicing the frame.',
        atmosphere_and_mood:
          'Explosive and collective, a whole team lifting one player higher than possible.',
        rendering_and_quality:
          'Dynamic sports anime with speed lines, sweat drops and sharp anatomy at the peak.',
        key_features: 'jump peak; low angle; net line; gym light rim',
      },
      [
        'Volleyball anime frame of a small spiker frozen at the peak of an impossible jump above the net, arm cocked, the ball a white blur, teammates below shouting, low angle into bright gym ceiling lights. No readable text or logo.',
        'Volleyball anime frame of a libero diving flat across the polished gym floor to dig a spike one centimeter above the wood, sweat flying off her hair, knee pads skidding and the whole bench on its feet. No readable text or logo.',
        'Volleyball anime frame of a setter touching the ball at fingertip height in slow motion, eyes already on the hitter rising behind him, gym lights haloing both and the blockers a step too late. No readable text or logo.',
      ],
    ),
    'SP05-344': u(
      {
        aesthetic:
          'Soccer anime of ego and hunger: strikers drawn with predatory eyes, distorted perspective and visions of the goal as a target.',
        subject_treatment:
          "Keep the prompt's subject and action; exaggerate focus and hunger, distorting perspective toward the goal or target.",
        color_and_tone: 'Night stadium blues and field green with electric cyan eye highlights.',
        lighting_and_shadow:
          'Floodlights from high angles, hard shadows under the eyes and glowing irises.',
        texture_and_material: 'Grass blades, sweat and jersey fabric with graphic line overlays.',
        camera_and_composition:
          'Fisheye distortion toward the ball, extreme close-ups on eyes with the goal behind.',
        atmosphere_and_mood:
          'Predatory and obsessive, a player who wants the goal more than anything else.',
        rendering_and_quality:
          'Stylized sports anime with bold distortion, glowing eyes and sharp lines.',
        key_features: 'predatory eyes; fisheye distortion; goal as target; floodlights',
      },
      [
        'Soccer anime frame of a striker bursting through two defenders in fisheye distortion, eyes glowing cyan with focus, the goal warped into a tiny target at the end of a tunnel of floodlight. No readable text or logo.',
        'Soccer anime close-up of a goalkeeper and a striker locking eyes a meter apart before a penalty in a rain-soaked stadium, breath fogging, floodlights turning their irises into glowing rings. No readable text or logo.',
        'Soccer anime frame of a boy alone on a muddy practice pitch at night firing shot after shot at an old tire hung in the goal, a single floodlight humming and a pile of balls at his feet. No readable text or logo.',
      ],
    ),
    'SP05-345': u(
      {
        aesthetic:
          'Nineties basketball anime of bodies and rivalry: thick lines, heavy muscle, sweat and faces full of stubborn pride.',
        subject_treatment:
          "Keep the prompt's subject and action; draw it with 90s cel weight, strong anatomy and confrontational poses.",
        color_and_tone:
          'Saturated 90s cel colors, court wood orange and team reds with film-warm skin tones.',
        lighting_and_shadow:
          'Arena spotlights with two-tone cel shadows and bright sweat highlights.',
        texture_and_material: 'Thick ink lines, visible cel paint and light film grain.',
        camera_and_composition:
          'Face-offs framed shoulder to shoulder, dramatic low angles under the rim.',
        atmosphere_and_mood:
          'Stubborn and physical, two rivals refusing to give one inch of the court.',
        rendering_and_quality: 'Classic 90s sports anime look with heavy line and grain.',
        key_features: 'thick 90s line; muscle and sweat; face-offs; film grain',
      },
      [
        'Nineties basketball anime frame of two rival centers colliding under the rim, thick ink lines, heavy muscles and sweat flying, saturated cel colors and light film grain, the crowd a blur of red. No readable text or logo.',
        'Nineties basketball anime close-up of a delinquent-looking forward grinning with a split lip and a bandage on his cheek, ball on his hip, thick 90s ink line and warm film grain. No readable text or logo.',
        'Nineties basketball anime frame of a lone practice at dawn on a cracked outdoor court, a chain net swaying after a shot, pink sky behind the fence and a dog watching from the bleachers. No readable text or logo.',
      ],
    ),
    'SP05-346': u(
      {
        aesthetic:
          'Basketball anime of misdirection and speed: invisible passes, afterimages and players who seem to vanish into the flow.',
        subject_treatment:
          "Keep the prompt's subject and action; make it move with deceptive speed, afterimages and misdirected attention.",
        color_and_tone:
          'Cool arena blues and whites with a pale ghostly accent for the fast player.',
        lighting_and_shadow:
          'Bright arena light from above, with semi-transparent afterimages glowing softly behind the moving player.',
        texture_and_material:
          'Smooth cel with translucent motion trails and crisp ball highlights.',
        camera_and_composition:
          'Wide play frames with multiple afterimages and defenders looking the wrong way.',
        atmosphere_and_mood:
          'Slippery and clever, the thrill of something happening where nobody was looking.',
        rendering_and_quality:
          'Clean sports anime with translucent effects and precise choreography.',
        key_features: 'afterimages; misdirection; translucent trails; wrong-way defenders',
      },
      [
        'Basketball anime frame of a quiet pale player passing the ball behind his back while three defenders stare at where he used to be, translucent afterimages trailing his motion, cool arena light. No readable text or logo.',
        'Basketball anime frame of a steal where the defender seems to appear in three translucent positions at once around a startled dribbler, the ball already gone and the crowd a cool blue blur. No readable text or logo.',
        'Basketball anime frame of a bench of teammates staring in disbelief as the ball suddenly appears in the hands of their wide-open shooter, the passer nowhere to be seen and a coach dropping his clipboard. No readable text or logo.',
      ],
    ),
    'SP05-347': u(
      {
        aesthetic:
          'Cycling anime of uphill suffering: steep roads, gritted teeth, legs burning and the summit always one curve away.',
        subject_treatment:
          "Keep the prompt's subject and action; show sustained effort up a slope, fatigue and determination in every line.",
        color_and_tone:
          'Mountain greens and asphalt grey with jersey color accents and hot sweaty skin tones.',
        lighting_and_shadow:
          'Harsh sun through trees in dappled patches, sweat catching highlights.',
        texture_and_material: 'Rough asphalt, carbon bike frames and soaked jerseys in crisp cel.',
        camera_and_composition: 'Low side angles up the slope, riders tilted against the gradient.',
        atmosphere_and_mood:
          'Grueling and stubborn, pain turned into rhythm on a climb that never ends.',
        rendering_and_quality:
          'Detailed sports anime with mechanical accuracy and expressive strain.',
        key_features: 'uphill gradient; gritted teeth; dappled sun; breakaway',
      },
      [
        'Cycling anime frame of a skinny climber breaking away on a steep mountain switchback, teeth gritted, jersey soaked, dappled sun through pines, the peloton small and far below. No readable text or logo.',
        'Cycling anime close-up of trembling calves pushing the pedals on a steep climb, sweat dripping onto the top tube, chain and cassette drawn precisely and the road tilting behind. No readable text or logo.',
        'Cycling anime frame of two rival climbers side by side at the mountain summit, both screaming with effort, spectators leaning in from the roadside and clouds below the mountain. No readable text or logo.',
      ],
    ),
  },
};

export default spec;
