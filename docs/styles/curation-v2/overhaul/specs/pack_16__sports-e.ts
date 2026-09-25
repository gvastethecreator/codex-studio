import type { Spec, Update } from '../tools/apply';
import { ANIME_AVOID as AVOID } from './_anime';
import { dna } from './_strict';

// Sports, competition and performance anime (part E): partner dance, traditional ensemble, brass
// band, jazz, live-house punk, acoustic confession, orchestra and allegorical stage duel looks.
const u = (fields: Parameters<typeof dna>[0], briefs: [string, string, string]): Update => ({
  dna: dna(fields),
  avoid: [...AVOID, 'real band or brand logo'],
  briefs,
});

const spec: Spec = {
  pack: 'pack_16',
  category: '5. Sports, Competition & Performance',
  updates: {
    'SP05-365': u(
      {
        aesthetic:
          'Competitive ballroom anime of formal partner motion: frames held, gowns sweeping, posture and connection turned into line.',
        subject_treatment:
          "Keep the prompt's subject and action; express it through partnered motion, held frames and sweeping arcs of fabric.",
        color_and_tone: 'Gown jewel colors and black tailcoats against warm ballroom gold.',
        lighting_and_shadow:
          'Chandelier and spotlight glow with sparkling highlights on sequins and hair.',
        texture_and_material:
          'Flowing chiffon, sequins, polished shoes and a glossy parquet floor.',
        camera_and_composition:
          'Circling framings around couples and sweeping diagonals across the floor.',
        atmosphere_and_mood: 'Elegant and intense, two people moving as one line under pressure.',
        rendering_and_quality:
          'Graceful sports anime with long fabric motion arcs and polished detail.',
        key_features: 'held frame; sweeping gowns; parquet reflections; partnership',
      },
      [
        'Ballroom anime frame of a young couple in a sweeping turn across a glossy parquet floor, her emerald gown fanning out in a long arc, his tailcoat snapping, chandelier sparkle and judges watching from the edge. No readable text or logo.',
        'Ballroom anime close-up of two hands meeting in a held frame, knuckles tense and posture perfect under hot spotlights. No readable text or logo.',
        'Ballroom anime frame of a couple practicing alone in an empty studio at night, reflections in the mirror wall. No readable text or logo.',
      ],
    ),
    'SP05-366': u(
      {
        aesthetic:
          'Traditional ensemble anime of resonance: drums, strings and flutes played together, sound shown as ripples and trembling air.',
        subject_treatment:
          "Keep the prompt's subject and action; place it within an ensemble where sound is visible as ripples, vibration and synchronized motion.",
        color_and_tone: 'Lacquer red, natural wood and indigo costumes with warm stage gold.',
        lighting_and_shadow:
          'Warm stage light from above and side, drum skins glowing under the spotlight.',
        texture_and_material:
          'Taut drum skins, silk strings, bamboo flutes and cotton costumes in fine line.',
        camera_and_composition:
          'Wide ensemble shots and tight shots on striking hands and vibrating strings.',
        atmosphere_and_mood:
          'Powerful and communal, many players breathing and striking as one body.',
        rendering_and_quality:
          'Rich performance anime with visible sound ripples and precise playing technique.',
        key_features: 'sound ripples; drum strikes; ensemble unison; warm stage light',
      },
      [
        'Traditional ensemble anime frame of a taiko group striking giant drums in unison on a dark stage, sound drawn as visible ripples in the air, sweat flying, indigo costumes and warm gold spotlights. No readable text or logo.',
        "Ensemble anime close-up of a koto player's fingers plucking silk strings on a lacquered instrument, the vibration shimmering in the air as a faint ripple and the stage light warm on her sleeves. No readable text or logo.",
        'Ensemble anime frame of a flute player in a shrine courtyard at dusk, sound drifting like mist. No readable text or logo.',
      ],
    ),
    'SP05-367': u(
      {
        aesthetic:
          'Brass band anime of tender precision: polished instruments, bare music stands, summer practice rooms and breathing together.',
        subject_treatment:
          "Keep the prompt's subject and action; place it among brass instruments, rehearsal rooms and the discipline of playing together.",
        color_and_tone: 'Warm brass gold, summer afternoon light and school-uniform navy.',
        lighting_and_shadow:
          'Afternoon sun through windows, bright reflections on brass bells and valves.',
        texture_and_material: 'Polished brass, valve oil gleam, music stands and wooden floors.',
        camera_and_composition:
          'Reflections in instrument bells and rows of players framed in sections.',
        atmosphere_and_mood:
          'Tender and earnest, a summer spent chasing one perfect note together.',
        rendering_and_quality:
          'Luminous performance anime with meticulous instrument detail and glowing summer light.',
        key_features: 'brass reflections; practice room; sections; summer light',
      },
      [
        'Brass band anime frame of a trumpet player on a school rooftop at sunset, the bell of her trumpet reflecting the whole orange sky, sections of the band practicing in open windows below. No readable text or logo.',
        'Brass band anime close-up of fingers pressing trumpet valves, a bead of valve oil catching the light. No readable text or logo.',
        'Brass band anime frame of a tuba player sitting on the steps after summer practice, sweaty and smiling, the huge polished bell reflecting the whole school courtyard and cicadas in the trees. No readable text or logo.',
      ],
    ),
    'SP05-368': u(
      {
        aesthetic:
          'Jazz anime of midnight ascension: smoky clubs, saxophone solos, swinging lines and improvisation drawn as rising curves.',
        subject_treatment:
          "Keep the prompt's subject and action; give it an improvised, swinging rhythm with music flowing as curving lines.",
        color_and_tone: 'Smoky navy and amber with brass gold and a cool blue spotlight.',
        lighting_and_shadow:
          'One spotlight through smoke, dark tables and bright instrument highlights.',
        texture_and_material:
          'Smoke haze, brass keys, piano lacquer and velvet drapes in soft cel.',
        camera_and_composition: 'Low stage angles and flowing camera moves that follow the solo.',
        atmosphere_and_mood:
          'Late-night and elated, a solo climbing higher than the player ever dared.',
        rendering_and_quality:
          'Moody performance anime with smoke effects and flowing musical curves.',
        key_features: 'saxophone solo; smoke spotlight; flowing curves; midnight club',
      },
      [
        'Jazz anime frame of a young saxophonist taking a midnight solo in a smoky basement club, notes drawn as rising golden curves in the spotlight, the pianist grinning and the audience leaning in from dark tables. No readable text or logo.',
        'Jazz anime frame of a drummer brushing a snare with eyes closed in a dim club, smoke curling through a blue spotlight and the brushes leaving soft swirls of light in the air. No readable text or logo.',
        'Jazz anime frame of a bassist walking home at dawn with the instrument case on her back. No readable text or logo.',
      ],
    ),
    'SP05-369': u(
      {
        aesthetic:
          'Live-house punk anime of raw feedback: tiny stages, crowd surfing, sweat, cables and sound drawn as jagged noise.',
        subject_treatment:
          "Keep the prompt's subject and action; put it in a cramped live-house show with noise, sweat and bodies pressed close.",
        color_and_tone: 'Harsh red and green stage lights, black walls and sweat highlights.',
        lighting_and_shadow:
          'Cheap colored stage lights, strobe flashes and deep shadows in the crowd.',
        texture_and_material:
          'Sweat, torn shirts, amp grilles and tangled cables with jagged sound lines.',
        camera_and_composition: 'Chaotic low angles from the crowd and close stage-edge shots.',
        atmosphere_and_mood: 'Raw and loud, a sweaty room of young people shouting the same words.',
        rendering_and_quality:
          'Rough energetic anime with jagged noise effects and harsh lighting.',
        key_features: 'jagged noise lines; crowd surfing; colored stage lights; cramped stage',
      },
      [
        'Live-house punk anime frame of a screaming singer crowd-surfing over a packed tiny club, harsh red and green stage lights, jagged noise lines bursting from the amps and sweat flying off every head. No readable text or logo.',
        "Live-house anime close-up of a guitarist's calloused fingers hammering the strings under a white strobe, sweat dripping onto the pickguard and jagged noise lines bursting from the amp behind. No readable text or logo.",
        'Live-house anime frame of the band loading out through a back alley at 1 a.m., ears ringing. No readable text or logo.',
      ],
    ),
    'SP05-370': u(
      {
        aesthetic:
          'Indie acoustic anime of intimate confession: small rooms, guitars, soft lamps and songs sung to one person.',
        subject_treatment:
          "Keep the prompt's subject and action; make it quiet and close, as if performed for a single listener.",
        color_and_tone: 'Warm lamp amber, soft greys and muted pastel clothing.',
        lighting_and_shadow:
          'One small lamp or window light, gentle shadows and soft glow on faces.',
        texture_and_material: 'Wooden guitar grain, knitted sweaters and cluttered small rooms.',
        camera_and_composition: 'Close, intimate framings at eye level with shallow depth.',
        atmosphere_and_mood: 'Tender and vulnerable, a song that says what words could not.',
        rendering_and_quality: 'Soft intimate anime with warm light and gentle detail.',
        key_features: 'lamp glow; acoustic guitar; close framing; single listener',
      },
      [
        'Indie acoustic anime frame of a shy boy playing a guitar on the floor of a small bedroom for one friend sitting on the bed, a single warm lamp, knitted sweaters and records stacked against the wall. No readable text or logo.',
        'Indie anime frame of a girl singing into a phone recorder on a balcony at night. No readable text or logo.',
        'Indie anime frame of a busker playing an acoustic guitar to a single small child in a train station tunnel late at night, the case open with a few coins and warm light from one lamp. No readable text or logo.',
      ],
    ),
    'SP05-371': u(
      {
        aesthetic:
          'Orchestra anime of virtuosic whirl: sweeping bows, conductors, massed strings and music drawn as swirling color.',
        subject_treatment:
          "Keep the prompt's subject and action; place it within a grand orchestral performance with swirling visualized sound.",
        color_and_tone:
          'Concert-hall wood and gold with deep red seats and swirling colored sound.',
        lighting_and_shadow: 'Warm stage wash with bright highlights on bows, brass and faces.',
        texture_and_material:
          'Varnished wood, gold leaf, black concert clothing and flowing sound ribbons.',
        camera_and_composition:
          'Grand wide shots of the full orchestra and dynamic close-ups on soloists.',
        atmosphere_and_mood: 'Soaring and overwhelming, an entire hall lifted by one crescendo.',
        rendering_and_quality:
          'Grand performance anime with layered sound ribbons and meticulous instruments.',
        key_features: 'swirling sound ribbons; conductor; massed strings; concert hall',
      },
      [
        'Orchestra anime frame of a young violin soloist at the climax of a concerto, the full orchestra behind her, swirling ribbons of colored sound rising into the gilded concert hall and the conductor mid-leap. No readable text or logo.',
        "Orchestra anime close-up of a cellist's bow flying across the strings, rosin dust in the light. No readable text or logo.",
        'Orchestra anime frame of an empty concert hall after the show, one percussionist alone on stage packing a timpani mallet case while the house lights fade and programs lie on the red seats. No readable text or logo.',
      ],
    ),
    'SP05-372': u(
      {
        aesthetic:
          'Allegorical stage anime of spotlight confrontations: two performers facing off under theatrical light with symbolic props and shadows.',
        subject_treatment:
          "Keep the prompt's subject and action; stage it as a symbolic confrontation under a spotlight, meaning carried by staging.",
        color_and_tone:
          'Black stage, one white spotlight and a single symbolic color such as red or gold.',
        lighting_and_shadow: 'Hard theatrical spotlights and huge cast shadows on the backdrop.',
        texture_and_material:
          'Stage boards, velvet curtains, masks and symbolic props in graphic cel.',
        camera_and_composition:
          'Frontal proscenium framing with strong symmetry and dramatic shadow play.',
        atmosphere_and_mood: 'Charged and symbolic, a rivalry performed as if it were a myth.',
        rendering_and_quality: 'Graphic theatrical anime with bold shadows and minimal staging.',
        key_features: 'spotlight duel; giant shadows; symbolic prop; proscenium',
      },
      [
        'Allegorical stage anime frame of two actresses facing each other under crossing spotlights, their giant shadows battling on the backdrop behind them, a single red rose lying center stage between them. No readable text or logo.',
        'Allegorical stage anime frame of a masked king and a jester trading places in a spotlight. No readable text or logo.',
        'Allegorical stage anime frame of a dancer bound by long red ribbons held by unseen hands in the wings, straining toward a spotlight at center stage, her shadow huge on the backdrop. No readable text or logo.',
      ],
    ),
  },
};

export default spec;
