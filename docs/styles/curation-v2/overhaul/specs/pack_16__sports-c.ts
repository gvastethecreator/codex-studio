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
        "In-car racing anime frame from the passenger seat at night: a driver's white-knuckled hands on the wheel, dashboard amber glowing up on her face, the rearview mirror filled with a rival's headlights and the road rushing into the windshield. No readable text or logo.",
        'In-car racing anime close-up of a gear stick being slammed into place, streetlights sweeping across the cabin in quick orange bars, a charm swinging from the mirror. No readable text or logo.',
        'In-car racing anime frame through a rain-streaked windshield at a hairpin, wipers mid-sweep, taillights ahead blurring into long red lines. No readable text or logo.',
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
        'Motorsport anime overhead frame of an original race car diving into a hairpin, its ideal racing line drawn as a glowing cyan curve with an apex marker, red and white curbs and rubber marks on grey asphalt. No readable text or logo.',
        'Motorsport anime frame of a pit wall at night where engineers watch screens of abstract glowing curves as a car flashes past. No readable text or logo.',
        "Motorsport anime close-up of a driver's visor reflecting a trace of speed arcs and the approaching corner. No readable text or logo.",
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
        'Idol sports festival anime frame of five performers in matching satin tracksuits sprinting down a stadium track toward a finish ribbon, confetti cannons firing, fans waving glow sticks and sparkles on every smile. No readable text or logo.',
        'Idol sports festival anime frame of a performer mid-relay passing a ribbon baton to a teammate while spinning, the crowd roaring. No readable text or logo.',
        'Idol sports festival anime frame of a tug-of-war on stage with glitter shoes digging in and ribbons flying. No readable text or logo.',
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
        'Boxing anime freeze frame of a counterpunch landing, sweat spraying in a fan, the background snapped to flat yellow halftone with radial lines exploding from the contact point, thick ink on both fighters. No readable text or logo.',
        'Boxing anime frame of a fighter slumped in the corner between rounds while the trainer shouts, ring lights blazing overhead. No readable text or logo.',
        'Boxing anime frame of shadow boxing in an empty gym, fists leaving graphic trails in the air. No readable text or logo.',
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
        'Table tennis anime frame of a smash leaving a curving white trail that bends impossibly around the net, the blue table warped slightly by the tension, both players leaning in with total concentration. No readable text or logo.',
        'Table tennis anime close-up of a paddle brushing under the ball to create heavy backspin, rubber texture visible. No readable text or logo.',
        'Table tennis anime frame of a quiet rally in an empty school gym at dusk, long shadows. No readable text or logo.',
      ],
    ),
  },
};

export default spec;
