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
        "Two swordswomen kneel at opposite ends of a snowy courtyard, and a single snowflake drifting between them is the only thing allowed to move. No readable text or logo.",
        "Two elderly rivals have held the same pre-duel stance for so long that a sparrow has built a nest on the brim of one of their hats. No readable text or logo.",
        "A duelist waits in a silent bamboo grove as one drop of rain gathers at the tip of a leaf directly above her rival's head. No readable text or logo.",
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
        "Sweeping across a golden plain as one red wave, a cavalry charge in lacquered armor raises dust behind it like a second army of ghosts. No readable text or logo.",
        "Every rider of the red army charges in perfect formation except one, whose horse has stopped to eat a flower. No readable text or logo.",
        "From a hilltop a lone farmer watches the crimson host pour past his tiny rice field without trampling a single stalk. No readable text or logo.",
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
        "A squire kneels alone in a vast stone hall at night as stained light from the windows lays a glowing mantle across her shoulders. No readable text or logo.",
        "An aging lord solemnly swears fealty to the small goat that won the harvest fair, his whole court kneeling beneath the banners. No readable text or logo.",
        "A knight renews her oath at her lord's grave in a storm, lightning briefly revealing a hundred banners on the hillside behind her. No readable text or logo.",
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
        "A battering ram draws back from a freshly broken gate and fire pours through the gap like a river of embers. No readable text or logo.",
        "The defenders pour cauldrons of soup on the attackers instead of boiling oil because the cook misunderstood the order, steam billowing everywhere. No readable text or logo.",
        "After the breach a lone defender sits in the smoking gateway, sharing her last water with a wounded attacker. No readable text or logo.",
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
        "A monk practices staff forms on a frozen mountain terrace, and each strike shatters the moonlight on the ice into silver shards. No readable text or logo.",
        "A novice warrior holds a bucket of water on each outstretched arm for so long that a crane lands on one of them. No readable text or logo.",
        "An old ascetic meditates beneath a moonlit waterfall that has frozen solid around him during the night. No readable text or logo.",
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
        "A spear fighter spins through a bamboo grove, and each strike bursts into black ink splatter that scatters into flying crows. No readable text or logo.",
        "A swordsman slices a falling persimmon into eight pieces with one stroke, the ink arc of his blade still hanging in the air. No readable text or logo.",
        "A brush-drawn warrior duels her own ink shadow across a blank white scroll, ink dripping from both of their blades. No readable text or logo.",
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
        "A ferryman poles across a wide river at dusk as a giant carp beneath the boat lifts it gently out of the indigo water. No readable text or logo.",
        "Fishermen haul in a net holding a sleeping sea god wrapped in indigo kelp, too afraid to wake it and too proud to let go. No readable text or logo.",
        "A traveling tea seller crosses an arched bridge in a vermilion evening rain, the drops falling as straight indigo lines. No readable text or logo.",
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
        "A courier leaps a puddle on a temple road in heavy rain, every drop frozen as a glowing bead around her flying sandals. No readable text or logo.",
        "Two duelists draw at the same instant in a downpour, and every falling drop between them is split cleanly in two. No readable text or logo.",
        "A samurai slips on wet stone mid-duel and hangs suspended in slow motion, one sandal sailing off through the frozen raindrops. No readable text or logo.",
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
        "Seven cloaked defenders stand on a snowy ridge facing an army too large to see, their red scarves the only color in a white world. No readable text or logo.",
        "The last defenders of a snowbound fort build an army of a hundred snow soldiers on the wall to fool the enemy at dawn. No readable text or logo.",
        "After the battle, falling snow slowly covers a single banner still standing upright in the silent field. No readable text or logo.",
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
        "A hilltop city under siege at sunset casts wall shadows so long they reach the enemy camp miles across the plain. No readable text or logo.",
        "Siege towers crawl toward a city whose every rooftop has been planted with giant sunflowers to confuse the archers. No readable text or logo.",
        "From the top of a colossal wall at night, the besieging army's campfires stretch to the horizon like a second starry sky. No readable text or logo.",
      ],
    },
  ] satisfies Create[],
};

export default spec;
