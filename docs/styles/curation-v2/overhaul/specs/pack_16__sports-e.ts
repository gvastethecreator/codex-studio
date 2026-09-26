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
        "A couple spins across glossy parquet, her emerald gown fanning out so wide it sweeps the rival dancers right off the floor. No readable text or logo.",
        "A couple dances a flawless waltz in a flooded ballroom, their reflections waltzing upside down beneath them. No readable text or logo.",
        "An elderly couple outshines every young competitor at a dance contest, their shoes held together with tape. No readable text or logo.",
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
        "A taiko group strikes giant drums in unison on a dark stage, and the visible sound ripples make the moon above them tremble. No readable text or logo.",
        "A shamisen player plays so fast in a tiny bar that the sake in every cup around her ripples in perfect rings. No readable text or logo.",
        "A shrine flutist performs at dawn in a misty valley, the sound spreading in ripples that shake the dew from every leaf. No readable text or logo.",
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
        "A trumpeter practices on a rooftop at sunset, her bell reflecting the whole orange sky while a row of crows on the railing listens intently. No readable text or logo.",
        "A tuba player marches through a rainstorm, water gushing out of her instrument like a fountain every time she plays. No readable text or logo.",
        "In a sweltering practice room twenty horn players draw breath at the exact same instant before the first note, sweat glinting on polished instruments. No readable text or logo.",
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
        "A saxophonist takes a midnight solo in a smoky basement club, and the rising golden curves of her notes lift her feet off the floor. No readable text or logo.",
        "A pianist and a drummer duel across a club stage while the audience's cocktails slowly levitate with the rising tempo. No readable text or logo.",
        "At closing time a janitor improvises on the abandoned upright bass, and the chairs stacked on the tables begin swaying in time. No readable text or logo.",
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
        "A screaming singer crowd-surfs over a packed tiny club, and the jagged noise of the band splits the ceiling open to the night sky. No readable text or logo.",
        "A punk band plays a furious gig inside a laundromat, every washing machine spinning in rhythm with the drums. No readable text or logo.",
        "After the show a guitarist sits alone on the curb outside the live house, ears ringing, her snapped strings curled in her palm. No readable text or logo.",
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
        "A shy musician plays guitar on the floor of a tiny room for one friend on the bed, and the melody fills the air with floating paper stars. No readable text or logo.",
        "A songwriter sings a confession at 2 a.m., curled against a humming fridge with her guitar in her lap and the phone face-down beside her. No readable text or logo.",
        "A street busker in the rain plays for one old man sheltering under an awning, the open guitar case filling with raindrops instead of coins. No readable text or logo.",
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
        "A violin soloist reaches the climax of a concerto as swirling ribbons of color from the orchestra lift the concert hall roof clean off. No readable text or logo.",
        "A conductor's baton slips from his hand mid-crescendo, and the whole orchestra keeps following it as it flies around the hall. No readable text or logo.",
        "An orchestra plays to rows of snow-covered seats in an outdoor amphitheater, breath and music swirling together into the falling snow. No readable text or logo.",
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
        "Two actresses face each other under crossing spotlights while their giant shadows fight on the backdrop as a lion and a crow. No readable text or logo.",
        "Two rival stage stars duel with oversized paper swords while a stagehand winches a cardboard moon across the background. No readable text or logo.",
        "An actress stands alone on a revolving stage as the spotlight splits her into three shadows, each wearing a different mask. No readable text or logo.",
      ],
    ),
  },
};

export default spec;
