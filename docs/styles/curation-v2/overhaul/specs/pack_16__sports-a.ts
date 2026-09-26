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
        "A spiker hangs at the peak of a jump so impossibly high that the gym ceiling lights sit below her, the ball a white comet in her palm. No readable text or logo.",
        "A volleyball team of grandmothers dives in unison for a ball in a rural gym, cardigans and knee braces flying while their young opponents stare. No readable text or logo.",
        "In an empty gym at night a lone setter tosses the ball to a spiker who is only her own long shadow stretched across the wall. No readable text or logo.",
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
        "A striker bursts through two defenders and sees the goal as a devouring beast's open mouth, her eyes blazing cyan with hunger. No readable text or logo.",
        "Eleven strikers on the same team charge the ball at once, elbowing each other aside while their own goalkeeper calmly peels an orange. No readable text or logo.",
        "Alone in a rain-flooded stadium, a benched striker takes shot after shot at a goal that keeps drifting farther away across the pitch. No readable text or logo.",
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
        "Two rival centers collide under the rim so hard that the backboard glass bursts into a crown of shards around their heads. No readable text or logo.",
        "A towering hothead benched for fouls sulks under a sweaty towel while his whole team performs a terrible dance to cheer him up. No readable text or logo.",
        "Two exhausted rivals sit back to back on an outdoor court at midnight after a one-on-one, neither willing to admit who won. No readable text or logo.",
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
        "A pale, quiet player passes the ball behind his back while three defenders stare at the empty spot where he stood a heartbeat ago. No readable text or logo.",
        "A player so easy to overlook that the arena spotlight sweeps the court searching for him while he dribbles directly beneath it. No readable text or logo.",
        "In a dark empty gym a single ball bounces across the court, passing itself from player to player among teammates nobody can see. No readable text or logo.",
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
        "A climber breaks away on a mountain switchback so steep that the road ahead curls up into the clouds like a ribbon. No readable text or logo.",
        "A pro cyclist grinds up a brutal hill while a stubborn grandmother on a rusty shopping bike keeps pace beside him, knitting. No readable text or logo.",
        "At dusk on a lonely pass a rider notices last year's champion pedaling silently beside her in the fog, even though he retired years ago. No readable text or logo.",
      ],
    ),
  },
};

export default spec;
