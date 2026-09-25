import type { Create, Spec } from '../tools/apply';
import { ANIME_AVOID } from './_anime';
import { dna } from './_strict';

// Horror anime (part B): fourteen more horror looks. Dread comes from light, space, texture and
// timing; no gore and no franchise monsters.
const AVOID = [...ANIME_AVOID, 'gore', 'graphic wounds'];

const create = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'horror', 'anime'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_16',
  category: '7. Horror',
  updates: {},
  creates: [
    create(
      'Slow Metamorphosis Dread Anime',
      'transformation horror anime',
      'metamorphosis',
      {
        aesthetic:
          'Quiet body-horror anime without gore: slow, wrong changes in ordinary people, shown through posture, shadow and small details.',
        subject_treatment:
          "Keep the prompt's subject and setting; show one subtle wrong change in the figure (an extra joint of shadow, a stretched limb, a face that stays too still).",
        color_and_tone:
          'Pale domestic colors going slightly sickly, cream walls, grey skin tones and a faint green cast.',
        lighting_and_shadow:
          'Soft window light with one shadow that does not match the figure casting it.',
        texture_and_material:
          'Clean everyday surfaces, fabric and skin drawn simply so the one wrong detail stands out.',
        camera_and_composition:
          'Still, ordinary framing that lingers too long, the change placed near the edge.',
        atmosphere_and_mood:
          'Unsettling and slow, a familiar person becoming a little less familiar each day.',
        rendering_and_quality:
          'Restrained prestige anime where horror lives in small precise details.',
        key_features: 'ordinary scene; one wrong detail; mismatched shadow; lingering frame',
      },
      [
        'Quiet horror anime frame of a mother washing dishes at a kitchen window in afternoon light, her shadow on the wall reaching with far too many arms, everything else calm and ordinary, a child at the table noticing. No readable text or logo.',
        'Quiet horror anime frame of a classmate smiling at the camera in a group photo, her neck just slightly too long, nobody else reacting. No readable text or logo.',
        'Quiet horror anime frame of an old man reading in his armchair by lamp light, his reflection in the dark window still looking at the viewer. No readable text or logo.',
      ],
    ),
    create(
      'Folk Village Festival Horror Anime',
      'rural festival horror anime',
      'folk-horror',
      {
        aesthetic:
          'Folk horror anime of bright rural festivals hiding something: flower crowns, straw figures, smiling villagers and midsummer light.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with cheerful rural festivity that feels rehearsed and slightly menacing.",
        color_and_tone:
          'Bright meadow green, flower yellow and white linen under a pale endless summer sky.',
        lighting_and_shadow:
          'Relentless bright daylight with almost no shadow anywhere to hide in.',
        texture_and_material:
          'Woven straw, linen, flower garlands and carved wood drawn with soft clean cel.',
        camera_and_composition:
          'Wide symmetrical festival scenes with villagers all facing the same way.',
        atmosphere_and_mood: 'Sunny and smiling, and the smiles never stop even when they should.',
        rendering_and_quality:
          'High-key prestige anime with pastoral detail and unsettling uniformity.',
        key_features: 'bright daylight; flower crowns; straw figures; synchronized villagers',
      },
      [
        'Folk horror anime frame of a midsummer village festival in blinding daylight, villagers in white linen and flower crowns dancing around a tall straw figure, every face smiling the same smile toward a lone visitor holding a camera. No readable text or logo.',
        "Folk horror anime frame of children weaving a huge straw doll in a barn, the doll wearing the visitor's jacket. No readable text or logo.",
        'Folk horror anime frame of a long outdoor feast table where every villager has stopped eating to stare at one empty chair. No readable text or logo.',
      ],
    ),
    create(
      'School Ghost Story Anime',
      'kaidan school anime',
      'kaidan',
      {
        aesthetic:
          'School ghost-story anime told after sunset: empty classrooms, restroom mirrors, stairwells and whispered rumors made real.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it in a school after dark where one rumor is quietly coming true.",
        color_and_tone:
          'Dusky orange fading into blue-grey, with cold white from a single light source.',
        lighting_and_shadow:
          'Last sunset light through windows, then flashlight beams and deep classroom shadows.',
        texture_and_material:
          'Wooden desks, chalk dust, tiled restrooms and cloth uniforms in clean cel.',
        camera_and_composition:
          'Low angles in stairwells, mirror compositions and long empty classrooms.',
        atmosphere_and_mood:
          'Nervous and whispery, a dare among friends that goes a little too far.',
        rendering_and_quality:
          'Clean prestige anime with careful light transitions from dusk to dark.',
        key_features: 'empty classrooms; mirrors; flashlight beams; rumors',
      },
      [
        'School ghost-story anime frame of three students with flashlights on a dark stairwell counting the steps aloud, one step more than yesterday, dusk fading in the window and a faint figure on the landing above. No readable text or logo.',
        'School ghost-story anime frame of a girl washing her hands at a restroom mirror while her reflection is still drying its hands. No readable text or logo.',
        'School ghost-story anime frame of a music room at dusk where the piano keys are pressed down with no one sitting there. No readable text or logo.',
      ],
    ),
    create(
      'Deep Sea Leviathan Horror Anime',
      'oceanic horror anime',
      'deep-sea',
      {
        aesthetic:
          'Oceanic horror anime of scale and depth: small boats and divers above unimaginably large shapes moving in dark water.',
        subject_treatment:
          "Keep the prompt's subject and setting; make it tiny against something enormous and barely visible in the water.",
        color_and_tone:
          'Deep teal and black water, pale boat lights and bioluminescent blue specks.',
        lighting_and_shadow:
          'Weak surface light fading quickly, with bioluminescence and small lamps in darkness.',
        texture_and_material:
          'Rippled water, rope, wet wood and particles drifting in the deep, drawn cleanly.',
        camera_and_composition:
          'Split surface views or top-down frames where a huge shadow fills the water.',
        atmosphere_and_mood:
          'Vast and helpless, the ocean suddenly remembering how small people are.',
        rendering_and_quality:
          'Painterly prestige anime water with subtle gradients and huge scale contrast.',
        key_features: 'huge shadow below; tiny boat; bioluminescence; split surface view',
      },
      [
        'Deep sea horror anime frame of a small fishing boat at night on a calm teal sea, its lamp the only light, while beneath the surface a shadow many times larger than the boat slowly passes, bioluminescent specks outlining one enormous eye. No readable text or logo.',
        'Deep sea horror anime split view of a swimmer floating calmly at the surface above a drop-off where something huge rises from the dark. No readable text or logo.',
        'Deep sea horror anime frame of a lighthouse keeper watching the whole sea bulge slowly under a full calm sky. No readable text or logo.',
      ],
    ),
    create(
      'Haunted Dollhouse Horror Anime',
      'miniature horror anime',
      'dollhouse',
      {
        aesthetic:
          'Miniature horror anime of dollhouses and tiny rooms: small furniture, porcelain faces and scenes that change when no one looks.',
        subject_treatment:
          "Keep the prompt's subject and setting; show it at dollhouse scale or observed through tiny windows and open miniature rooms.",
        color_and_tone:
          'Faded pastel wallpaper colors, porcelain white and dusty rose with deep shadow in the rooms.',
        lighting_and_shadow:
          'Soft lamp light from outside the dollhouse, tiny rooms lit unevenly from above.',
        texture_and_material:
          'Miniature wallpaper, porcelain, lace and painted wood drawn with delicate line.',
        camera_and_composition:
          'Cutaway views into open miniature rooms or eye-level shots through tiny windows.',
        atmosphere_and_mood:
          'Delicate and creepy, a perfect little world that seems to be rehearsing something.',
        rendering_and_quality:
          'Fine-detailed prestige anime with miniature scale cues and soft light.',
        key_features: 'open dollhouse rooms; porcelain faces; tiny furniture; changed scenes',
      },
      [
        'Dollhouse horror anime frame looking into an open dollhouse at night, each tiny room lit by a desk lamp from above, porcelain dolls seated at a miniature dinner table all turned toward a small girl peering in. No readable text or logo.',
        'Dollhouse horror anime frame of a miniature bedroom whose tiny doll is now in the same pose as the sleeping girl beside it. No readable text or logo.',
        'Dollhouse horror anime frame of a tiny window in the dollhouse attic with a light switched on. No readable text or logo.',
      ],
    ),
    create(
      'Night-Vision Found Footage Anime',
      'found footage anime',
      'night-vision',
      {
        aesthetic:
          'Found-footage anime seen through night-vision: green monochrome, glowing eyes, grain and a shaking handheld camera.',
        subject_treatment:
          "Keep the prompt's subject and setting; record it through night-vision, the frightening detail only just visible.",
        color_and_tone:
          'Phosphor green monochrome with bright white highlights and near-black corners.',
        lighting_and_shadow:
          'Infrared illumination falling off quickly, eyes and reflective surfaces glowing.',
        texture_and_material:
          'Heavy sensor grain, vignette and slight motion blur over simplified anime shapes.',
        camera_and_composition:
          'Handheld, low and tilted, subjects caught at the edge of the beam.',
        atmosphere_and_mood:
          'Panicked and claustrophobic, breathing loudly in the dark with nowhere to go.',
        rendering_and_quality:
          'Convincing night-vision footage texture laid over clean, readable anime line work.',
        key_features: 'green night-vision; glowing eyes; grain; handheld tilt',
      },
      [
        "Found-footage anime frame through green night-vision in a forest cabin, a hiker's shaking camera catching two glowing eyes at the edge of the beam beyond the window, heavy grain and a dark vignette. No readable text or logo.",
        'Found-footage anime frame through night-vision of a tent wall being pressed from outside by a hand. No readable text or logo.',
        'Found-footage anime frame through green night-vision of a cramped attic crawlspace, the camera light catching dust and insulation while something pale shifts between the far beams. No readable text or logo.',
      ],
    ),
    create(
      'Cosmic Sky Eldritch Anime',
      'cosmic horror anime',
      'cosmic',
      {
        aesthetic:
          'Cosmic horror anime where the sky itself is wrong: impossible geometries, too many stars and vast shapes behind the clouds.',
        subject_treatment:
          "Keep the prompt's subject and setting; open the sky above it onto something vast and incomprehensible.",
        color_and_tone:
          'Violet, sickly teal and black sky over an ordinary warm-colored world below.',
        lighting_and_shadow:
          'Cold light from the sky with no clear source, casting pale, directionless shadows.',
        texture_and_material:
          'Swirling painted skies, geometric star patterns and clean cel landscapes.',
        camera_and_composition:
          'Worm-eye views up at the sky or wide frames with a thin strip of land.',
        atmosphere_and_mood:
          'Awe and dread together, a mind straining to understand something far too big.',
        rendering_and_quality:
          'Painterly prestige anime skies with precise small-scale ground detail.',
        key_features: 'impossible sky; vast shapes; directionless light; thin horizon',
      },
      [
        'Cosmic horror anime worm-eye frame of a farmer standing in a cornfield at night looking up at a sky where the stars have rearranged into a vast geometric eye, violet and teal light falling without shadows. No readable text or logo.',
        'Cosmic horror anime frame of a city skyline under clouds that part to reveal an endless spiral staircase leading up into the dark. No readable text or logo.',
        'Cosmic horror anime frame of a beach at dusk where the horizon line bends upward like a wave that never falls. No readable text or logo.',
      ],
    ),
    create(
      'Rot Garden Fungal Horror Anime',
      'fungal horror anime',
      'fungal',
      {
        aesthetic:
          'Botanical horror anime of gardens and houses slowly taken over by fungus: soft growths, spores and beautiful decay.',
        subject_treatment:
          "Keep the prompt's subject and setting; let fungal growth creep over surfaces around it, never hiding the subject itself.",
        color_and_tone:
          'Damp greens, bruised purple and pale cream fungus with glowing spore gold.',
        lighting_and_shadow:
          'Soft grey daylight or dim greenhouse light with glowing spores drifting through it.',
        texture_and_material:
          'Gills, mold fuzz, wet leaves and cracked plaster drawn in fine organic detail.',
        camera_and_composition:
          'Close botanical framing and wide shots of overgrown rooms and gardens.',
        atmosphere_and_mood:
          'Lush and suffocating, decay that is quietly beautiful and patiently spreading.',
        rendering_and_quality:
          'Richly detailed prestige anime with organic textures and soft glowing particles.',
        key_features: 'creeping fungus; drifting spores; overgrown rooms; soft decay',
      },
      [
        'Fungal horror anime frame of an old greenhouse where pale shelf fungus has grown over every pot and bench, glowing gold spores drifting in grey light, a gardener in a respirator standing very still among the growth. No readable text or logo.',
        "Fungal horror anime frame of a child's bedroom where soft purple mushrooms sprout from the carpet in the shape of footprints leading to the bed. No readable text or logo.",
        'Fungal horror anime frame of a village well ringed with luminous toadstools, a bucket rope covered in soft white mold and spores rising in the dusk air. No readable text or logo.',
      ],
    ),
    create(
      'Night Shift Hospital Horror Anime',
      'hospital horror anime',
      'hospital',
      {
        aesthetic:
          'Hospital horror anime of the night shift: humming machines, curtained beds, monitors and nurses walking long quiet wards.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it within a hospital at night where equipment and curtains hide something.",
        color_and_tone:
          'Cold blue-green night lighting with monitor glows and one warm nurses-station lamp.',
        lighting_and_shadow:
          'Dim night-mode ceiling lights, monitor glow on faces and silhouettes behind curtains.',
        texture_and_material:
          'Curtain fabric, steel bed frames, IV stands and polished floors in clean cel.',
        camera_and_composition:
          'Long ward perspectives and silhouettes seen through thin curtains.',
        atmosphere_and_mood:
          'Exhausted and uneasy, a long night shift where the quiet feels deliberate.',
        rendering_and_quality:
          'Clean prestige anime with careful low-light gradients and restrained effects.',
        key_features: 'curtained beds; monitor glow; long wards; silhouettes',
      },
      [
        'Hospital horror anime frame of a night nurse walking a long dim ward past rows of curtained beds, monitor glows in blue-green, and behind one curtain a silhouette sitting up that should be sleeping. No readable text or logo.',
        'Hospital horror anime frame of a nurses station at 4 a.m. where every call light on the panel switches on at once, the nurse frozen with a coffee cup halfway to her lips. No readable text or logo.',
        'Hospital horror anime frame of an empty wheelchair rolling slowly down a polished corridor toward the elevator, its wheels squeaking in the silence. No readable text or logo.',
      ],
    ),
    create(
      'Shadow Play Horror Anime',
      'silhouette horror anime',
      'shadow-play',
      {
        aesthetic:
          'Silhouette horror anime told in cast shadows: shapes on walls and paper screens that do not match the things casting them.',
        subject_treatment:
          "Keep the prompt's subject and setting; tell the fear through its shadow or silhouette on a wall, screen or curtain.",
        color_and_tone: 'Warm lamp amber on walls and screens with pure black silhouettes.',
        lighting_and_shadow:
          'One strong low lamp throwing huge sharp shadows on walls, paper screens or curtains.',
        texture_and_material:
          'Paper screens, plaster walls and fabric curtains catching crisp shadow shapes.',
        camera_and_composition:
          'Frames dominated by a lit wall or screen with the real subject small or off-frame.',
        atmosphere_and_mood:
          'Suggestive and chilling, the imagination filling in whatever the shadow is doing.',
        rendering_and_quality:
          'Graphic prestige anime with razor-sharp silhouettes and simple warm backgrounds.',
        key_features: 'cast shadows; lit paper screen; mismatched silhouette; single lamp',
      },
      [
        'Shadow horror anime frame of a paper screen lit amber from inside a room, the shadow of a woman combing her hair while her head tilts much further than a neck should allow, a guest frozen in the corridor outside. No readable text or logo.',
        'Shadow horror anime frame of a child making hand-shadow animals on a bedroom wall with a flashlight, one shadow animal moving on its own. No readable text or logo.',
        'Shadow horror anime frame of a tailor working late under one lamp, the huge shadow of his mannequin raising its arm on the wall behind him. No readable text or logo.',
      ],
    ),
    create(
      'Mirror Double Horror Anime',
      'doppelganger horror anime',
      'mirror',
      {
        aesthetic:
          'Doppelganger horror anime of mirrors and reflections that stop copying: doubles, lagging reflections and wrong expressions.',
        subject_treatment:
          "Keep the prompt's subject and setting; include one reflection or double of it that behaves slightly differently.",
        color_and_tone:
          'Muted domestic colors with a colder, bluer version of the scene inside the reflection.',
        lighting_and_shadow:
          'Soft interior light with a slightly different light direction inside the mirror.',
        texture_and_material:
          'Mirror glass, polished surfaces, windows at night and water reflections drawn cleanly.',
        camera_and_composition:
          'Compositions split between subject and reflection, symmetrical but not quite matching.',
        atmosphere_and_mood: 'Uncanny and personal, the fear of meeting a self that is not you.',
        rendering_and_quality:
          'Precise prestige anime with carefully mismatched mirrored details and clean glass reflections.',
        key_features: 'lagging reflection; cold mirror world; split symmetry; wrong expression',
      },
      [
        'Mirror horror anime frame of a student brushing her teeth at a bathroom mirror in the morning while her reflection has stopped brushing and is smiling, the reflection lit slightly colder and bluer than the room. No readable text or logo.',
        'Mirror horror anime frame of a man at a night train window whose reflection is facing the opposite direction. No readable text or logo.',
        'Mirror horror anime frame of twins standing on either side of a still pond where only one of them has a reflection. No readable text or logo.',
      ],
    ),
    create(
      'Fog Town Siren Horror Anime',
      'fog town horror anime',
      'fog-town',
      {
        aesthetic:
          'Fog-bound town horror anime: rusted streets, endless grey fog, distant sirens and shapes that appear only at the edge of sight.',
        subject_treatment:
          "Keep the prompt's subject and setting; bury the surroundings in thick fog so only nearby details remain readable.",
        color_and_tone: 'Grey-white fog, rust orange and dull teal with almost no saturation.',
        lighting_and_shadow:
          'Flat fog light with no shadows, occasional flashlight cones and dim street lamps.',
        texture_and_material:
          'Rust, peeling paint, wet asphalt and drifting ash drawn with grainy detail.',
        camera_and_composition:
          'Street-level frames where everything beyond a few meters dissolves into fog.',
        atmosphere_and_mood:
          'Lost and haunted, a town that should be familiar but is not letting anyone leave.',
        rendering_and_quality: 'Grainy prestige anime with soft fog gradients and rusted detail.',
        key_features: 'thick fog; rust; ash; figures at the edge of sight',
      },
      [
        'Fog town horror anime frame of a woman with a flashlight walking down the middle of an empty main street swallowed by grey fog, rusted shop signs without letters, ash falling like snow and a tall shape barely visible at the end of the road. No readable text or logo.',
        'Fog town horror anime frame of a playground where the swings creak in fog and a siren wails from somewhere far away. No readable text or logo.',
        'Fog town horror anime frame of a rusted bridge disappearing into fog halfway across, a lone car stopped with its door open. No readable text or logo.',
      ],
    ),
    create(
      'Night Parade Yokai Anime',
      'yokai procession anime',
      'yokai',
      {
        aesthetic:
          'Folklore horror anime of night processions of spirits: lanterns, strange creatures, household objects come alive and mist-filled streets.',
        subject_treatment:
          "Keep the prompt's subject and setting; let a procession of strange folklore creatures pass through or near it at night.",
        color_and_tone:
          'Night indigo, lantern orange and pale spirit greens with ink-black silhouettes.',
        lighting_and_shadow:
          'Lantern light carried by the procession and cold moonlight on the street.',
        texture_and_material:
          'Paper lanterns, old wood, straw and cloth creatures drawn with lively ink line.',
        camera_and_composition:
          'Long horizontal processions across the frame, witnesses hidden behind doors.',
        atmosphere_and_mood:
          'Eerie and playful, a strange celebration that humans are not meant to watch.',
        rendering_and_quality:
          'Lively prestige anime with inventive creature designs and warm lantern glows.',
        key_features: 'night procession; lanterns; object spirits; hidden witnesses',
      },
      [
        'Folklore horror anime frame of a night procession of strange spirits filing through a sleeping town: an umbrella hopping on one leg, a paper lantern with a long tongue, a walking straw sandal and a tall figure carrying a lantern, a boy watching through a crack in a wooden door. No readable text or logo.',
        'Folklore horror anime frame of old kitchen tools sprouting arms and legs and marching out of an abandoned house under the moon. No readable text or logo.',
        'Folklore horror anime frame of a mountain road at night where a line of floating foxfire lights leads toward a shrine gate. No readable text or logo.',
      ],
    ),
    create(
      'Expressionist Shadow Horror Anime',
      'expressionist horror anime',
      'expressionist',
      {
        aesthetic:
          'Silent-film expressionist horror anime: slanted walls, painted shadows, crooked streets and stark black-and-white contrast.',
        subject_treatment:
          "Keep the prompt's subject and setting; distort the architecture around it into slanted, angular shapes with painted shadows.",
        color_and_tone: 'High-contrast black, white and grey with a faint sepia or green tint.',
        lighting_and_shadow:
          'Painted hard-edged shadows and light shapes that do not follow real light direction.',
        texture_and_material:
          'Flat painted sets, angular doors and streets, and grainy film texture.',
        camera_and_composition:
          'Tilted, theatrical frames with sharp diagonals and exaggerated perspective.',
        atmosphere_and_mood:
          'Feverish and theatrical, a nightmare built from crooked painted scenery.',
        rendering_and_quality: 'Graphic prestige anime with bold angular design and film grain.',
        key_features: 'slanted sets; painted shadows; stark contrast; film grain',
      },
      [
        'Expressionist horror anime frame of a hunched sleepwalker moving down a crooked street of slanted houses, painted hard-edged shadows stretching across the walls, stark black and white with a faint green tint and film grain. No readable text or logo.',
        'Expressionist horror anime frame of a doctor in a tall hat standing in an angular office with windows painted as jagged shapes. No readable text or logo.',
        'Expressionist horror anime frame of a staircase twisting impossibly upward with a long clawed shadow climbing ahead of the figure. No readable text or logo.',
      ],
    ),
  ],
};

export default spec;
