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
        'Rugby comeback anime ground-level frame inside a collapsing scrum in pouring rain, mud-caked faces straining, torn jerseys and steam rising off bodies, the final minute on a stormy afternoon. No readable text or logo.',
        'Rugby anime frame of a battered winger breaking through a tackle and sprinting down the touchline in the rain, mud flying from her boots and the crowd rising behind the fence. No readable text or logo.',
        'Rugby anime frame of a team huddled in a dripping locker room at halftime, bandaged hands stacked in the center and the captain shouting. No readable text or logo.',
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
        'Figure skating anime frame of a skater mid-spin under a single spotlight, the arena dark, ice spraying from her blade in a glittering arc, her sequined violet costume and her reflection trembling on the ice. No readable text or logo.',
        'Figure skating anime frame of a skater kneeling at the end of a program with tears in his eyes, flowers raining onto the ice. No readable text or logo.',
        'Figure skating anime frame of a pair lift at dawn practice in an empty rink, breath and blade scratches. No readable text or logo.',
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
        'Traditional archery anime frame of a young archer at full draw in profile on a wooden range, white and black dress, the long bow bent, a distant target glowing in soft garden light and petals hanging still in the air. No readable text or logo.',
        'Archery anime frame of the instant after release, the string still vibrating and the arrow a thin line halfway to the target. No readable text or logo.',
        'Archery anime frame of an old master watching a student from the veranda, tea steaming beside him. No readable text or logo.',
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
        'Training montage anime frame of a boy doing sunrise sprints on a riverbank, his shadow long on the grass, a notebook of drills and times sitting on his bag with a cracked stopwatch. No readable text or logo.',
        'Training anime frame of a girl practicing serves alone in a gym long after everyone left, balls scattered around her. No readable text or logo.',
        "Training anime frame of a coach tapping a student's taped fingers and nodding, the first sign of approval. No readable text or logo.",
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
        'Fencing anime frame of two fencers lunging along a spotlit piste, white suits crisp against a navy arena, blades crossing in a bright glint and mesh masks reflecting each other. No readable text or logo.',
        'Fencing anime close-up of a fencer removing her mask with a victorious smile, hair falling loose. No readable text or logo.',
        'Fencing anime frame of a rival saluting before a bout, a single rose on the bench behind. No readable text or logo.',
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
        'Synchronized team anime frame of a cheer squad throwing a flyer high above a human pyramid, every teammate mirrored perfectly, bright team colors against a clear blue sky. No readable text or logo.',
        'Synchronized anime frame of two divers leaving the platform in perfect unison, mirrored bodies against the pool blue. No readable text or logo.',
        'Synchronized anime overhead frame of eight swimmers forming a blooming flower pattern in a turquoise pool, legs rising in perfect unison, ripples spreading in rings and the audience reflected at the edges. No readable text or logo.',
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
        'Theater rehearsal anime frame of a lone actress on a bare black stage under a single work light, tape marks on the floor, repeating the same gesture for the twentieth time while a director watches from the dark seats. No readable text or logo.',
        'Rehearsal anime close-up of an actor mid-line with tears and sweat on his face under a harsh work light, the rest of the black box empty and a roll of tape by his feet. No readable text or logo.',
        'Rehearsal anime frame of a cast lying on the stage floor at 2 a.m., exhausted and laughing. No readable text or logo.',
      ],
    ),
  },
};

export default spec;
