import type { Spec, Update } from '../tools/apply';
import { ANIME_AVOID as AVOID } from './_anime';
import { dna } from './_strict';

// Sports, competition and performance anime (part D): rugby comeback, figure skating, archery,
// training montage, fencing, synchronized team and theater rehearsal looks.
const u = (fields: Parameters<typeof dna>[0], briefs: [string, string, string]): Update => ({
  dna: dna(fields),
  avoid: [...AVOID, 'real team or league logo'],
  briefs,
});

const spec: Spec = {
  pack: 'pack_16',
  category: '5. Sports, Competition & Performance',
  updates: {
    'SP05-358': u(
      {
        aesthetic:
          'Rugby comeback anime of mud and grit: scrums, tackles, rain and battered players refusing to lose.',
        subject_treatment:
          "Keep the prompt's subject and action; make it muddy, battered and still pushing forward against resistance.",
        color_and_tone:
          'Mud brown, torn jersey colors and stormy grey sky with white rain streaks.',
        lighting_and_shadow:
          'Overcast stadium light, wet highlights on mud and skin, heavy dark sky.',
        texture_and_material:
          'Mud splatter, torn fabric, grass clumps and rain drawn with gritty line.',
        camera_and_composition:
          'Low ground-level shots inside scrums and wide frames of desperate final runs.',
        atmosphere_and_mood:
          'Gritty and defiant, a battered team finding one more push in the final minute.',
        rendering_and_quality: 'Heavy, gritty sports anime with textured mud and rain effects.',
        key_features: 'mud; scrums; rain; final push',
      },
      [
        "Inside a collapsing scrum in pouring rain, mud-caked faces strain as the ball squirts out of the pile like a seed from a fruit. No readable text or logo.",
        "A tiny winger sprints the length of a flooded pitch while giant forwards splash comically behind him, one losing both boots. No readable text or logo.",
        "At the final whistle both teams lie flat in the mud under the rain, laughing, too exhausted to stand up. No readable text or logo.",
      ],
    ),
    'SP05-359': u(
      {
        aesthetic:
          'Figure skating anime of vulnerable performance: spins, spotlight on ice, costumes and emotion visible in every line.',
        subject_treatment:
          "Keep the prompt's subject and action; render it as a graceful performance with spins, glides and exposed emotion.",
        color_and_tone: 'Ice white and pale blue with a jewel-colored costume accent.',
        lighting_and_shadow:
          'Spotlight on the ice, soft reflections below the skater and dark arena beyond.',
        texture_and_material:
          'Glassy ice with blade scratches, sequined costumes and fine hair strands.',
        camera_and_composition:
          'Circling framings around spins and low reflections along the ice surface.',
        atmosphere_and_mood:
          'Fragile and beautiful, a performer laying their heart bare in four minutes.',
        rendering_and_quality: 'Elegant sports anime with graceful motion arcs and sparkling ice.',
        key_features: 'spotlit ice; spin arcs; ice reflections; sequined costume',
      },
      [
        "A skater spins under a single spotlight, and the ice spraying from her blade freezes midair into a glittering crown around her. No readable text or logo.",
        "A skater's costume tears mid-routine and she keeps going, turning the flapping fabric into part of the choreography. No readable text or logo.",
        "An aging champion skates alone on a frozen lake at dusk, tracing the routine that won her gold decades ago. No readable text or logo.",
      ],
    ),
    'SP05-360': u(
      {
        aesthetic:
          'Traditional archery anime of poetic focus: stillness, draw, release and the moment when time seems to stop.',
        subject_treatment:
          "Keep the prompt's subject and action; distill it to calm focus and a single precise release.",
        color_and_tone: 'White and black archery dress, pale wood and soft green garden light.',
        lighting_and_shadow:
          'Gentle daylight across the range, soft shadows and a bright far target.',
        texture_and_material: 'Wooden bows, feathers, fabric and raked sand drawn with fine line.',
        camera_and_composition:
          'Side profiles at full draw and long views down the range to the target.',
        atmosphere_and_mood:
          'Poetic and calm, the whole world narrowing to breath and a distant circle.',
        rendering_and_quality: 'Serene prestige anime with minimal effects and precise form.',
        key_features: 'full draw; stillness; long range; fine line',
      },
      [
        "An archer holds full draw in profile while a falling maple leaf stops midair right at the arrow tip, waiting for the release. No readable text or logo.",
        "An arrow passes through a curtain of rain so cleanly that every drop parts around it, the archer's eyes still closed. No readable text or logo.",
        "At dawn in a snowy hall an old archery master draws a bow with no arrow, and the distant target still shivers. No readable text or logo.",
      ],
    ),
    'SP05-361': u(
      {
        aesthetic:
          'Training montage anime of incremental progress: repeated drills, notebooks of practice, sunrise runs and small improvements.',
        subject_treatment:
          "Keep the prompt's subject and action; show it as one step in a long practice routine, with signs of repetition and progress.",
        color_and_tone:
          'Early morning blues turning to gold, with warm indoor gym light in the evening.',
        lighting_and_shadow:
          'Sunrise and sunset light marking passing days, long shadows on tracks and floors.',
        texture_and_material:
          'Worn shoes, taped fingers, scuffed floors and dog-eared practice notebooks.',
        camera_and_composition:
          'Sequences of repeated framings from day to day, like panels of the same routine.',
        atmosphere_and_mood:
          'Patient and hopeful, improvement measured in tiny steps that finally add up.',
        rendering_and_quality:
          'Warm sports anime with rhythmic repeated compositions and careful detail.',
        key_features: 'repetition; sunrise runs; worn gear; small progress',
      },
      [
        "A runner does sunrise sprints along a riverbank, and each lap leaves a slightly faster ghost of herself running ahead. No readable text or logo.",
        "A clumsy trainee catches his thousandth ball of the day in a sunset field, the elderly coach finally lowering the bucket. No readable text or logo.",
        "A weightlifter has added one grain of rice a day to a barbell in her tiny apartment, and after ten years the bar has finally begun to bend. No readable text or logo.",
      ],
    ),
    'SP05-362': u(
      {
        aesthetic:
          'Fencing anime of glamorous precision: white suits, mirrored masks, flashing blades and rivalries with style.',
        subject_treatment:
          "Keep the prompt's subject and action; give it elegant precision, sharp lines and a stylish rivalry.",
        color_and_tone:
          'Crisp white suits and silver masks against deep navy or black with one rose accent.',
        lighting_and_shadow: 'Hard spotlights on the piste, bright glints on blades and masks.',
        texture_and_material:
          'Quilted fencing whites, mesh masks and thin steel blades in clean line.',
        camera_and_composition:
          'Long horizontal framings down the piste and tight close-ups where the blades cross.',
        atmosphere_and_mood:
          'Glamorous and competitive, two rivals trading elegant, lethal gestures.',
        rendering_and_quality: 'Sleek sports anime with sharp highlights and precise motion.',
        key_features: 'white suits; mesh masks; blade glints; long piste',
      },
      [
        "Two fencers lunge along a spotlit piste, blades crossing in a bright spark while their mirrored masks reflect each other endlessly. No readable text or logo.",
        "A fencer duels her rival on the roof of a speeding night train, their white suits snapping in the wind. No readable text or logo.",
        "A victorious fencer takes her bow, not yet aware that her rival pinned a red rose to her back with the final touch. No readable text or logo.",
      ],
    ),
    'SP05-363': u(
      {
        aesthetic:
          'Synchronized team anime of aerial precision: cheer pyramids, divers in unison and bodies moving as one pattern.',
        subject_treatment:
          "Keep the prompt's subject and action; repeat and mirror it across a team moving in perfect unison.",
        color_and_tone: 'Bright team colors against clear sky or pool blue with white highlights.',
        lighting_and_shadow:
          'Bright daylight or arena light with clean shadows under airborne bodies.',
        texture_and_material: 'Uniforms, pom-poms, water spray and mats drawn in crisp cel.',
        camera_and_composition:
          'Symmetrical framings, overhead views of formation patterns and poses mirrored across the team.',
        atmosphere_and_mood: 'Joyful and exact, trust between teammates made visible in the air.',
        rendering_and_quality: 'Precise sports anime with repeated figures and clean symmetry.',
        key_features: 'unison; mirrored poses; aerial pyramid; symmetry',
      },
      [
        "A cheer squad throws a flyer so high above a human pyramid that she passes a flock of very startled geese. No readable text or logo.",
        "Ten divers leap from a sea cliff in perfect unison, their silhouettes forming one enormous bird against the sunset. No readable text or logo.",
        "Legs rising together like lilies through still water, a swimming team performs its routine inside a flooded ruined chapel. No readable text or logo.",
      ],
    ),
    'SP05-364': u(
      {
        aesthetic:
          'Theater rehearsal anime of obsessive repetition: marked stages, bare rehearsals, work lights and actors repeating one line until it breaks.',
        subject_treatment:
          "Keep the prompt's subject and action; set it in rehearsal, repeated, marked with tape and watched by a critical eye.",
        color_and_tone: 'Black box greys and bare work-light white with one colored costume piece.',
        lighting_and_shadow:
          'Harsh bare work lights, stark shadows on black walls and an empty auditorium.',
        texture_and_material:
          'Tape marks on stage floors, worn shoes, rehearsal clothes and props.',
        camera_and_composition:
          'Wide frames of a lone actor on a bare stage and close-ups of strained faces.',
        atmosphere_and_mood:
          'Obsessive and raw, an actor pushing one moment again and again toward truth.',
        rendering_and_quality: 'Stark dramatic anime with minimal sets and intense acting.',
        key_features: 'work lights; tape marks; bare stage; repetition',
      },
      [
        "A lone actress repeats one gesture under a single work light until her shadow on the back wall starts doing it wrong on purpose. No readable text or logo.",
        "A director makes the whole cast rehearse tumbling down a staircase for the hundredth time while the prop skeleton in the wings looks bored. No readable text or logo.",
        "At 4 a.m. in a dark theater a stagehand watches an actor rehearse to an audience made of coats draped over the seats. No readable text or logo.",
      ],
    ),
  },
};

export default spec;
