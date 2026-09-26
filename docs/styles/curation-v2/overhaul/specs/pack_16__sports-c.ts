import type { Spec, Update } from '../tools/apply';
import { ANIME_AVOID as AVOID } from './_anime';
import { dna } from './_strict';

// Sports, competition and performance anime (part C): in-car drift tension, motorsport telemetry,
// idol sports festival, boxing graphics and table tennis spin.
const u = (fields: Parameters<typeof dna>[0], briefs: [string, string, string]): Update => ({
  dna: dna(fields),
  avoid: [...AVOID, 'real team or league logo', 'real car brand'],
  briefs,
});

const spec: Spec = {
  pack: 'pack_16',
  category: '5. Sports, Competition & Performance',
  updates: {
    'SP05-353': u(
      {
        aesthetic:
          'In-car racing anime of nocturnal tension: dashboard glow, gripping hands, mirrors full of headlights and the road rushing at the windshield.',
        subject_treatment:
          "Keep the prompt's subject and action; view it from inside a vehicle or at close range, tension carried by hands, eyes and mirrors.",
        color_and_tone:
          'Dark cabin blacks with dashboard amber, headlight white and taillight red reflections.',
        lighting_and_shadow:
          'Dashboard glow from below, passing streetlights sweeping across faces and hands.',
        texture_and_material:
          'Leather steering wheels, gauges, glass reflections and speed-blurred road.',
        camera_and_composition:
          'Tight cockpit framings, mirror shots and over-the-shoulder views through the windshield.',
        atmosphere_and_mood:
          'Tense and focused, a quiet cabin while the world outside moves far too fast.',
        rendering_and_quality:
          'Precise mechanical anime detail with smooth light sweeps and motion blur.',
        key_features: 'dashboard glow; mirror headlights; gripping hands; windshield rush',
      },
      [
        "A driver's white-knuckled hands grip the wheel as the rearview mirror fills with headlights belonging to a car that crashed on this road years ago. No readable text or logo.",
        "A delivery driver drifts a mountain hairpin at night while a fat cat sleeps on the dashboard and does not even open one eye. No readable text or logo.",
        "Two cars idle nose to nose on a foggy mountain pass, their drivers silently sipping canned coffee in the headlight glow before the race. No readable text or logo.",
      ],
    ),
    'SP05-354': u(
      {
        aesthetic:
          'Motorsport anime of precision and data: racing lines, telemetry graphics, apex points and engineers watching screens of abstract data.',
        subject_treatment:
          "Keep the prompt's subject and action; overlay clean abstract telemetry shapes (racing lines, apex markers, speed arcs) without readable numbers.",
        color_and_tone: 'Asphalt grey, curb red and white with cyan data-line overlays.',
        lighting_and_shadow:
          'Bright track daylight or floodlit night racing with clean reflections on bodywork.',
        texture_and_material:
          'Glossy bodywork, rubber marbles, carbon parts and glowing vector overlays.',
        camera_and_composition:
          'Overhead track views with racing lines drawn on, and low trackside shots at the apex.',
        atmosphere_and_mood:
          'Calculated and intense, victory measured in tiny margins and perfect lines.',
        rendering_and_quality:
          'Crisp technical anime with clean vector overlays and polished mechanical detail.',
        key_features: 'racing line overlay; apex markers; curbs; telemetry shapes',
      },
      [
        "A race car dives into a hairpin along a glowing cyan racing line while its own ghost from the previous lap overtakes it on the inside. No readable text or logo.",
        "Race engineers stare at a wall of abstract telemetry as their driver takes the apex so perfectly that the data blooms into a flower. No readable text or logo.",
        "Late at night in an empty garage an engineer replays the crash lap, the glowing apex points hanging in the dark around her like fireflies. No readable text or logo.",
      ],
    ),
    'SP05-355': u(
      {
        aesthetic:
          'Idol sports festival anime: cheering, confetti-bright colors, sprinting performers and stadium stages that mix competition with show.',
        subject_treatment:
          "Keep the prompt's subject and action; add festival energy with bright stage colors, cheering crowds and sparkle.",
        color_and_tone: 'Candy pinks, sky blues and lemon yellow with glittering white highlights.',
        lighting_and_shadow:
          'Bright stadium daylight with sparkle highlights and colorful bounced light.',
        texture_and_material: 'Satin costumes, sneakers, ribbons and confetti in glossy cel.',
        camera_and_composition:
          'Dynamic sprinting shots with cheering stands and stage elements behind.',
        atmosphere_and_mood: 'Cheerful and energetic, a sports day that feels like a concert.',
        rendering_and_quality: 'Glossy idol anime with sparkle effects and bouncy animation.',
        key_features: 'confetti colors; sprinting idols; cheering stands; sparkle',
      },
      [
        "Five idol performers in satin tracksuits sprint for the finish as the confetti cannons fire early and bury the entire track. No readable text or logo.",
        "An idol relay turns into a dance battle mid-baton-pass while the stadium crowd waves glow sticks in the pouring rain. No readable text or logo.",
        "After her group disbands, a lone idol races the sunset around an empty stadium as the stage lights flick on one by one to follow her. No readable text or logo.",
      ],
    ),
    'SP05-356': u(
      {
        aesthetic:
          'Boxing anime told with graphic impact: freeze frames, halftone backgrounds, radial lines and faces distorted by the punch.',
        subject_treatment:
          "Keep the prompt's subject and action; freeze its moment of impact with graphic backgrounds and radiating lines.",
        color_and_tone: 'Red and black with bold halftone yellow or white backgrounds at impact.',
        lighting_and_shadow:
          'Hard ring lights from above and impact flashes turning backgrounds to flat graphic color.',
        texture_and_material:
          'Sweat spray, glove leather and rope drawn with thick ink and halftone dots.',
        camera_and_composition:
          'Extreme close-ups at the moment of contact, diagonal frames and freeze-frames.',
        atmosphere_and_mood: 'Brutal and graphic, the shock of a single punch stopping time.',
        rendering_and_quality: 'Graphic sports anime with manga halftone and bold impact design.',
        key_features: 'impact freeze; halftone background; radial lines; sweat spray',
      },
      [
        "A counterpunch lands and sweat sprays in a perfect fan while the background snaps to flat yellow halftone and the whole crowd vanishes. No readable text or logo.",
        "Two boxers land simultaneous punches and both faces stretch into wild rubbery shapes while the referee covers his own eyes. No readable text or logo.",
        "In a flooded abandoned gym a boxer shadowboxes against his reflection in the water, and the reflection lands the first hit. No readable text or logo.",
      ],
    ),
    'SP05-357': u(
      {
        aesthetic:
          'Table tennis anime of spin and pressure: balls curving impossibly, tables warped by tension and faces locked in concentration.',
        subject_treatment:
          "Keep the prompt's subject and action; show spin and pressure through curved trajectories and subtly warped space.",
        color_and_tone: 'Table blue and green, white ball highlights and cool gym greys.',
        lighting_and_shadow:
          'Even gym lighting with sharp highlights on the ball and glossy table.',
        texture_and_material:
          'Rubber paddles, glossy table surfaces and sweat drawn with crisp line.',
        camera_and_composition:
          'Tight table-level framings, curved ball trails and warped perspective under pressure.',
        atmosphere_and_mood:
          'Claustrophobic and precise, a tiny table becoming an entire battlefield.',
        rendering_and_quality:
          'Clean sports anime with elegant spin trails and subtle perspective distortion.',
        key_features: 'curving ball trail; warped table; paddle spin; concentration',
      },
      [
        "A smash leaves a white trail that bends around the net and loops twice before landing, the blue table warping under the spin. No readable text or logo.",
        "Two old men in bathrobes play a ferocious match at a hot-spring inn, the ball spinning so hard it makes the steam spiral. No readable text or logo.",
        "Alone in a gym, a player faces a launcher firing a hundred balls at once, each one curving in a different impossible direction. No readable text or logo.",
      ],
    ),
  },
};

export default spec;
