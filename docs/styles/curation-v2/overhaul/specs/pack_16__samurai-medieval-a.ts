import type { Create, Spec } from '../tools/apply';
import { ANIME_AVOID as AVOID } from './_anime';
import { dna } from './_strict';

// Samurai and medieval prestige anime (part A). Each preset is one period-drama anime look for
// Japanese or European medieval subjects; the DNA names line, cel, palette and light, and the
// prompt keeps its own subject. Built with the strict helper: no generic filler.
const spec: Spec = {
  pack: 'pack_16',
  category: '6. Samurai & Medieval',
  updates: {
    'SP13-026': {
      name: 'Pre-Strike Stillness Anime',
      dna: dna({
        aesthetic:
          'Prestige period anime frozen in the breath before a strike: long held frames, severe composition and a single thin line of tension.',
        subject_treatment:
          "Keep the prompt's subject, action and setting; draw it at the instant before motion, weight settled, eyes fixed, hands resting near what they will use.",
        color_and_tone:
          'Slate greys, lacquer crimson and moonlit indigo with one sharp accent, mostly desaturated around a single warm point.',
        lighting_and_shadow:
          'Raking side light and long hard shadows, faces half in dark, a thin rim tracing the silhouette.',
        texture_and_material:
          'Clean cel with fine ink line, woven cloth folds and lacquer gloss kept sparse and controlled.',
        camera_and_composition:
          'Wide static frames with large empty space, or extreme close-ups on eyes and hands, nothing moving yet.',
        atmosphere_and_mood:
          'Silent, tense and ceremonial, like a held breath just before something fatal happens.',
        rendering_and_quality:
          'Theatrical prestige anime key frame with precise line weight and restrained effects.',
        key_features: 'held breath; empty space; raking light; eye and hand close-ups',
      }),
      avoid: AVOID,
      briefs: [
        'Prestige anime frame of two archers kneeling at opposite ends of a snow-covered temple courtyard, bows lowered, breath visible, the frame wide and silent, raking dawn light and long blue shadows before either moves. No readable text or logo.',
        "Anime extreme close-up of a tea master's hands resting beside a whisk before a duel of ceremony, one drop of water trembling on the bamboo, faces unseen, crimson lacquer tray in the corner. No readable text or logo.",
        'Anime frame of a lone spearwoman standing in a flooded rice field at dusk, her reflection perfectly still, a flock of herons frozen mid-rise behind her, the moment before the charge. No readable text or logo.',
      ],
    },
    'SP13-027': {
      name: 'Crimson Formation Charge Anime',
      dna: dna({
        aesthetic:
          'Epic battle anime of massed formations: rows of armored riders and spears surging as one red wave across the frame.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it inside a moving formation or charge, individuals simplified into rhythmic repeated shapes.",
        color_and_tone:
          'Lacquer crimson and black armor against dust gold and pale sky, banners as bright repeated accents.',
        lighting_and_shadow:
          'Low afternoon sun through dust, blocked cel shadows under helmets and a hot rim along the front rank.',
        texture_and_material:
          'Lamellar armor plates, banner silk and churned earth drawn with bold simplified cel shapes.',
        camera_and_composition:
          'Low angle into the oncoming charge or high wide shots of whole formations sweeping diagonally.',
        atmosphere_and_mood:
          'Thunderous and collective, a single unstoppable will carried forward by many riders at once.',
        rendering_and_quality:
          'Large-scale battle anime with repeated figures, speed lines and clean readable masses.',
        key_features: 'massed formation; diagonal charge; repeated banners; dust light',
      }),
      avoid: AVOID,
      briefs: [
        'Epic anime frame of a crimson-armored cavalry charge sweeping diagonally across a golden plain, hundreds of repeated banners and spear points, dust glowing in low sun, the front rider screaming. No readable text or logo.',
        'Anime frame of a shield wall of foot soldiers braced on a muddy hill as arrows rain down, repeated round shields in a curved line, grey sky and blocked cel shadows. No readable text or logo.',
        'High wide anime frame of two armies meeting in a river valley, formations colliding like waves, tiny riders and a huge sky, speed lines along the clash. No readable text or logo.',
      ],
    },
    'SP13-028': {
      name: 'Heraldic Oath Anime',
      dna: dna({
        aesthetic:
          'Devotional medieval anime built around vows and heraldry: kneeling figures, banners, stained light and solemn symmetry.',
        subject_treatment:
          "Keep the prompt's subject and setting; stage it as a solemn act of promise, framed by emblems, banners or architecture already present.",
        color_and_tone:
          'Heraldic reds, blues and golds against cold stone grey, colored light falling from high windows.',
        lighting_and_shadow:
          'Colored shafts of window light and candle glow, soft shadows pooling at the base of pillars.',
        texture_and_material:
          'Embroidered banners, polished plate, worn stone and wax, drawn with fine line and flat cel.',
        camera_and_composition:
          'Symmetrical frontal framing down a nave or hall, the subject small and centered.',
        atmosphere_and_mood:
          'Solemn and sacred, loyalty felt quietly rather than shouted, with deep restrained emotion.',
        rendering_and_quality:
          'Refined prestige anime with careful ornament and luminous colored light.',
        key_features: 'symmetry; heraldic banners; colored window light; kneeling vow',
      }),
      avoid: AVOID,
      briefs: [
        'Anime frame of a young squire kneeling alone in a vast stone hall at night, heraldic banners hanging on both sides, colored light from a rose window falling across her back, strict symmetry. No readable text or logo.',
        "Anime frame of an old queen placing a hand on a child's head in a candlelit chapel, embroidered banners behind, colored light on the flagstones. No readable text or logo.",
        'Anime frame of a guild of stonemasons swearing an oath around a carved cornerstone in an unfinished cathedral, scaffolding above, sunbeams through the open vaults. No readable text or logo.',
      ],
    },
    'SP13-029': {
      name: 'Siege Breach Ember Anime',
      dna: dna({
        aesthetic:
          'Siege anime at the moment walls break: fire, splintered timber, embers and bodies of smoke pushing through a gap.',
        subject_treatment:
          "Keep the prompt's subject and setting; put it at a threshold being forced open, with fire and debris driving through the frame.",
        color_and_tone: 'Ember orange and ash grey against night blue, sparks as bright points.',
        lighting_and_shadow:
          'Firelight from the breach, hard orange rims and deep blue shadow on the far side.',
        texture_and_material:
          'Splintered wood, cracked stone, smoke and flying sparks drawn as bold effect animation.',
        camera_and_composition:
          'Framed through the breach or from inside looking out at the flood of light and debris.',
        atmosphere_and_mood:
          'Violent and desperate, the roar of a wall giving way and no time left to choose.',
        rendering_and_quality:
          'Dynamic effects-heavy anime with readable silhouettes against the fire.',
        key_features: 'breaching gap; embers; fire rim light; debris effects',
      }),
      avoid: AVOID,
      briefs: [
        'Anime frame looking out through a freshly broken castle gate as a battering ram pulls back and fire pours in, splintered beams, embers swirling and silhouetted defenders bracing against the orange light. No readable text or logo.',
        'Anime frame of a mountain fortress wall collapsing under catapult fire at night, ash clouds rolling, flying stones lit orange and tiny archers falling back from the crumbling parapet. No readable text or logo.',
        'Anime frame of a burning town gate at night with townsfolk fleeing through the gap, a mother carrying a child through falling embers, carts overturned and smoke pouring over the wall. No readable text or logo.',
      ],
    },
    'SP13-030': {
      name: 'Moonlit Ascetic Training Anime',
      dna: dna({
        aesthetic:
          'Quiet training anime of monks and warriors at night: repetition, cold moonlight, breath and discipline.',
        subject_treatment:
          "Keep the prompt's subject and setting; show it practicing, repeating or holding a pose, alone or with one teacher.",
        color_and_tone:
          'Silver moon blue, cedar brown and white breath, a single warm lantern accent.',
        lighting_and_shadow:
          'Cold moonlight from above with soft blue shadows and a small lantern pool on the ground.',
        texture_and_material:
          'Rough cotton, wet stone, bamboo and snow drawn with thin line and soft cel.',
        camera_and_composition:
          'Medium frames with the moon or a lantern in view, calm and centered.',
        atmosphere_and_mood:
          'Disciplined and lonely, calm repetition carrying a stubborn and very quiet determination.',
        rendering_and_quality:
          'Subtle prestige anime with gentle motion and precise body mechanics.',
        key_features: 'moonlight; breath; repetition; lantern pool',
      }),
      avoid: AVOID,
      briefs: [
        'Anime frame of a monk practicing staff forms alone on a moonlit mountain terrace, breath clouds, frost on the stones, a single lantern glowing at the edge of the frame. No readable text or logo.',
        'Anime frame of a girl carrying two buckets of water up endless mossy stone steps at night under a full moon, sweat and breath clouds, her old teacher waiting at the top with a lantern. No readable text or logo.',
        'Anime frame of an archer loosing arrow after arrow at a straw target in a moonlit courtyard, frost on the ground, the quiver nearly empty and her teacher watching silently from a veranda. No readable text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Ink-Splatter Swordplay Anime',
      domain: 'sumi ink action anime',
      tags: ['ink', 'swordplay', 'anime'],
      dna: dna({
        aesthetic:
          'Action anime where every cut explodes into sumi ink splatter and brush arcs across paper-white backgrounds.',
        subject_treatment:
          "Keep the prompt's subject and action; turn movement and impacts into brush arcs, ink splatter and dry-brush trails.",
        color_and_tone:
          'Black ink on warm paper white with a single red accent for blood or cloth.',
        lighting_and_shadow:
          'No realistic light; value comes from ink density, wet pools and dry brush.',
        texture_and_material: 'Wet ink pools, dry-bristle streaks, splatter dots and paper grain.',
        camera_and_composition: 'Dynamic diagonals with large empty paper areas around the action.',
        atmosphere_and_mood:
          'Explosive and stylish, every lethal movement turned into a single line of poetry.',
        rendering_and_quality:
          'Painterly anime action with bold brushwork over clean character line.',
        key_features: 'ink splatter; brush arcs; paper white; red accent',
      }),
      avoid: AVOID,
      briefs: [
        'Anime action frame of a spear fighter spinning through a bamboo grove, each strike bursting into black ink splatter and wide brush arcs across paper-white space, one red sash trailing. No readable text or logo.',
        'Anime frame of two duelists passing each other in a leap, their paths drawn as sweeping dry-brush strokes, ink droplets hanging in the air. No readable text or logo.',
        'Anime frame of a monk on a temple roof deflecting a volley of arrows with a spinning staff, each arrow shattering into black ink splatter and dry-brush flecks against white paper, his robe a single red stroke. No readable text or logo.',
      ],
    },
    {
      name: 'Woodblock Palette Period Anime',
      domain: 'ukiyo-e colored anime',
      tags: ['woodblock', 'period', 'anime'],
      dna: dna({
        aesthetic:
          'Period anime colored like woodblock prints: flat indigo, vermilion and ochre fields with printed gradient skies.',
        subject_treatment:
          "Keep the prompt's subject and setting; flatten color into printed areas while keeping anime line and expression.",
        color_and_tone:
          'Indigo, vermilion, ochre, sea green and paper cream with bokashi gradient bands in the sky.',
        lighting_and_shadow:
          'Almost no cast shadow; depth comes from overlapping flat shapes and gradient bands.',
        texture_and_material: 'Subtle paper grain and wood-grain texture inside flat color fields.',
        camera_and_composition:
          'Decorative framing with strong silhouettes, cropped foreground elements and high horizons.',
        atmosphere_and_mood:
          'Elegant and nostalgic, a graphic calm like an old print hanging in a quiet inn.',
        rendering_and_quality: 'Clean anime line over flat printed color with deliberate grain.',
        key_features: 'flat printed color; bokashi sky; paper grain; cropped foreground',
      }),
      avoid: AVOID,
      briefs: [
        'Period anime frame colored like a woodblock print: a ferryman poling a boat across a wide river at dusk, indigo water, vermilion bridge, a bokashi gradient sky and paper grain in every flat field. No readable text or logo.',
        'Woodblock-palette anime frame of a courier running along a coastal cliff road with a huge wave curling behind her, flat indigo and cream foam shapes, a bokashi dawn band and fishing boats as tiny printed silhouettes. No readable text or logo.',
        'Woodblock-palette anime frame of a night market street in slanting rain, oiled-paper umbrellas as flat vermilion and ochre shapes, a cropped lantern in the foreground and rain drawn as fine parallel lines. No readable text or logo.',
      ],
    },
    {
      name: 'Rain Duel Slow-Motion Anime',
      domain: 'slow-motion rain anime',
      tags: ['rain', 'slow-motion', 'anime'],
      dna: dna({
        aesthetic:
          'Slow-motion anime in heavy rain: every drop frozen as a bright bead, splashes suspended around moving figures.',
        subject_treatment:
          "Keep the prompt's subject and action; slow it down so raindrops, splashes and hair hang in the air around it.",
        color_and_tone:
          'Wet slate blue and grey with bright white droplets and one warm color accent.',
        lighting_and_shadow:
          'Backlight through rain making drops glow, dark wet reflections on the ground.',
        texture_and_material:
          'Beaded raindrops, soaked cloth and glossy wet surfaces drawn crisply.',
        camera_and_composition:
          'Close and mid frames with drops in the foreground, subjects caught mid-motion.',
        atmosphere_and_mood:
          'Suspended and melancholy, intense moments stretched out until they become strangely beautiful.',
        rendering_and_quality: 'Detailed anime effects work with sharp droplets and clean motion.',
        key_features: 'frozen raindrops; suspended splash; backlit rain; wet reflections',
      }),
      avoid: AVOID,
      briefs: [
        'Slow-motion anime frame of a courier leaping a puddle in heavy rain on a temple road, every raindrop frozen as a glowing bead, a crown of splash suspended under her foot, backlit by a lantern. No readable text or logo.',
        'Slow-motion anime frame of a warrior shaking water from her hair in a downpour, droplets fanning out in an arc around her head. No readable text or logo.',
        "Slow-motion anime frame of a grey horse and rider galloping across a flooded road in a storm, mud and water frozen mid-splash around the hooves, the rider's cloak suspended in a curve of droplets. No readable text or logo.",
      ],
    },
    {
      name: 'Snowfield Last Stand Anime',
      domain: 'winter battle anime',
      tags: ['snow', 'last-stand', 'anime'],
      dna: dna({
        aesthetic:
          'Winter war anime of small groups holding out in endless snow: white silence, dark figures and red accents.',
        subject_treatment:
          "Keep the prompt's subject and setting; isolate it in a vast snowy space, dark against white, with falling snow.",
        color_and_tone:
          'Near-monochrome white and blue-grey with dark figures and one sharp red accent.',
        lighting_and_shadow: 'Flat overcast light with soft blue shadows and bright snow glare.',
        texture_and_material: 'Falling snow, frost on armor and fur, deep footprints drawn simply.',
        camera_and_composition:
          'Extreme wide shots with tiny figures, or tight faces with snow in the lashes.',
        atmosphere_and_mood:
          'Desperate and cold, a quiet heroism in small figures refusing to leave the snow.',
        rendering_and_quality:
          'Minimal prestige anime with strong silhouettes and soft snow effects.',
        key_features: 'white expanse; dark silhouettes; falling snow; red accent',
      }),
      avoid: AVOID,
      briefs: [
        'Anime extreme wide frame of seven cloaked defenders on a snowy ridge facing an unseen army, dark silhouettes against white, falling snow, one red banner snapping in the wind. No readable text or logo.',
        'Anime close-up of a young soldier with snow caught in her eyelashes and hood, breath freezing into white plumes, a red scarf the only color in a world of pale blue and grey. No readable text or logo.',
        'Anime extreme wide frame of a lone rider and pack horse crossing an endless frozen lake at dusk, a thin line of hoofprints trailing behind them and a dark forest far away. No readable text or logo.',
      ],
    },
    {
      name: 'Grand Siege Panorama Anime',
      domain: 'epic siege anime',
      tags: ['siege', 'panorama', 'anime'],
      dna: dna({
        aesthetic:
          'Epic panoramic anime of sieges: colossal walls and towers with armies reduced to tiny detailed specks.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it within an enormous environment where scale dwarfs every figure.",
        color_and_tone:
          'Stone ochre, smoke grey and sky blue with fires as orange points across the landscape.',
        lighting_and_shadow:
          'Broad daylight or sunset with long shadows cast by towers across the battlefield.',
        texture_and_material:
          'Detailed painted backgrounds of stone, siege engines and smoke with small cel figures.',
        camera_and_composition: 'Ultra-wide establishing shots from high above or far away.',
        atmosphere_and_mood:
          'Awe-struck and vast, the grim weight of history seen from very far away.',
        rendering_and_quality:
          'Richly painted background art with precise small-scale detail and clean tiny cel figures.',
        key_features: 'colossal walls; tiny armies; painted panorama; long tower shadows',
      }),
      avoid: AVOID,
      briefs: [
        'Ultra-wide anime panorama of a hilltop city under siege at sunset, colossal walls and towers casting long shadows, siege towers creeping forward, thousands of tiny soldiers and fires dotting the plain. No readable text or logo.',
        'Anime panorama of a mountain pass fortress seen from far above, a thin dark line of an army winding up the switchbacks, clouds drifting between the towers and tiny signal fires lit along the walls. No readable text or logo.',
        'Anime panorama of a walled harbor city besieged by a fleet at dusk, burning galleys drifting in the bay, tiny rowboats ferrying soldiers and smoke leaning across the painted sky. No readable text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
