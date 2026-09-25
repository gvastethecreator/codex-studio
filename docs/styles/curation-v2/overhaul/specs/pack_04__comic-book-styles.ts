import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'added panels or gutters',
  'speech balloons',
  'sound-effect lettering',
  'franchise hero costume',
  'chest emblem of a known hero',
];

// Comic media redraw the requested subject as ONE image; the category review forbids panels and balloons
// growing automatically out of a single requested picture.
const single =
  'Keep the prompt subject, action and setting and redraw them as one single comic image in this medium; never add panels, gutters, speech balloons, captions or sound-effect lettering the prompt did not ask for.';

function comic(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? single, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_04',
  category: '1. Comic Book Styles',
  updates: {
    'SP04-001': {
      dna: comic({
        aesthetic:
          '1940s four-color newsprint comic: thick confident brush ink over flat process color, printed cheaply with Ben-Day dots and slightly drifting plates.',
        color_and_tone:
          'Four flat process inks only: primary red, yellow and blue plus Ben-Day tints for flesh and sky, no gradients at all.',
        lighting_and_shadow:
          'Flat high-key fill everywhere; form is shown by a few solid black ink shadows under jaws, arms and brims rather than modeled light.',
        texture_and_material:
          'Yellowed pulp newsprint, coarse Ben-Day dot tints, ink slightly spread into the paper, color plates a hair out of register.',
        camera_and_composition:
          'Straight-on or gently low heroic view, the subject planted in the center with a strong diagonal action line and simple backgrounds.',
        atmosphere_and_mood:
          'Earnest pulp optimism, bold and naive, everything resolved by strength and courage.',
        rendering_and_quality:
          'Chunky uniform brush contours, blocky simplified anatomy and visible cheap-print flaws; never glossy digital shading.',
        key_features:
          'thick brush ink contours; four flat process colors; Ben-Day dot tints; yellowed newsprint; slight plate misregistration',
      }),
      avoid: [...AVOID, 'digital gradients', 'glossy airbrush shading'],
      briefs: [
        'Golden Age four-color comic image of an adult circus strongman in a striped leotard lifting a runaway ox-cart over his head at a village fair, thick brush ink contours, flat primary red, yellow and blue with Ben-Day dot tints on yellowed newsprint. Single image, no panels, balloons, text or logo.',
        'Golden Age four-color comic image of a masked adult aviatrix in leather goggles leaping from a biplane wing onto a zeppelin gondola, strong diagonal action line, chunky ink, color plates slightly out of register. Single image, no panels, balloons, text or logo.',
        'Golden Age four-color comic image of a giant riveted mechanical octopus tearing up a wooden harbor pier while tiny sailors flee, flat process colors and coarse Ben-Day sky. Single image, no panels, balloons, text or logo.',
      ],
    },
    'SP04-002': {
      dna: comic({
        aesthetic:
          '1960s cosmic comic: blocky muscular ink drawing with extreme foreshortening, crackling black energy-dot fields and machine-like cosmic architecture.',
        color_and_tone:
          'Bright flat primaries pushed toward magenta, cyan and acid yellow, with black space backgrounds studded with colored dots.',
        lighting_and_shadow:
          'Radiant backlight bursts behind the subject, hard black shadow shapes, glowing rim lines around hands and machinery.',
        texture_and_material:
          'Energy crackle drawn as clusters of black and colored dots, square blocky knuckles, circuit-like panels on every machine.',
        camera_and_composition:
          'Forced perspective with fists or hands lunging at the lens, scale jumps from tiny figures to colossal forms, radial burst layout.',
        atmosphere_and_mood:
          'Loud cosmic wonder, everything enormous, charged and about to explode.',
        rendering_and_quality:
          'Heavy square-cornered contours, flat print color and dot crackle; no painted gradients or realistic textures.',
        key_features:
          'energy-dot crackle; extreme foreshortening; blocky square anatomy; cosmic machine architecture; magenta-cyan-yellow flats',
      }),
      avoid: [...AVOID, 'photoreal space render'],
      briefs: [
        "Silver Age cosmic comic image of an elderly bearded alchemist in a hooded violet robe prying open a glowing lead casket; a storm of black cosmic energy dots and machine-like crackle bursts out around his foreshortened hands, bright magenta, cyan and yellow flat colors, blocky square-cornered ink. Single image, no panels, balloons, text or logo.",
        "Silver Age cosmic comic image of a colossal crystalline space whale with a spiral shell on its back swimming over a cratered moon, tiny rocket ships near its fins for scale, radial black-dot energy burst behind, blocky square-cornered ink, flat magenta, cyan and yellow. No humanoid hero, no cape or chest emblem. Single image, no panels, balloons, text or logo.",
        'Silver Age cosmic comic image of a chrome robot gorilla punching through a laboratory wall, bricks and dot crackle flying toward the viewer, flat print color. Single image, no panels, balloons, text or logo.',
      ],
    },
    'SP04-003': {
      dna: comic({
        aesthetic:
          'Contemporary digital superhero comic: clean variable-weight digital inks under glossy rendered color with gradients, specular hits and composited FX glows.',
        color_and_tone:
          'Teal-and-orange cool-warm contrast, luminous gradient ramps, saturated energy colors against dark desaturated skies.',
        lighting_and_shadow:
          'Strong rim lights from two sides, volumetric rays and lens flares, hard specular highlights on armor and wet surfaces.',
        texture_and_material:
          'Smooth airbrushed gradients, reflective armor plates, fine digital grain and glowing particle overlays.',
        camera_and_composition:
          'Widescreen low angle, heroic muscular proportions, debris and particles pulling depth toward the lens.',
        atmosphere_and_mood:
          'Intense blockbuster seriousness, every moment framed as a cinematic climax.',
        rendering_and_quality:
          'Crisp digital line art with glossy full rendering and controlled bloom; original costume designs only, never a known hero.',
        key_features:
          'glossy digital color; dual rim light; volumetric rays and flares; specular armor; widescreen low angle',
      }),
      avoid: [...AVOID, 'flat retro print', 'Ben-Day dots'],
      briefs: [
        'Modern digital superhero comic image of an adult paladin in sleek original plate armor with a glowing visor hovering above a burning cathedral at dusk, teal-and-orange contrast, dual rim light and volumetric rays, widescreen low angle. Single image, no panels, balloons, text or logo.',
        'Modern digital superhero comic image of an adult storm-caller in a tattered crimson cloak summoning a lightning fork over a flooded ravine, glossy gradients and specular hits on wet rock. Single image, no panels, balloons, text or logo.',
        'Modern digital superhero comic image of a crashed alien war machine smoking in a wheat field at sunset, glowing FX particles and lens flare, glossy rendered metal. Single image, no panels, balloons, text or logo.',
      ],
    },
    'SP04-004': {
      dna: comic({
        aesthetic:
          'Action manga page art: black G-pen ink with aggressive line-weight swings, radial speed lines and mechanical screentone gray.',
        color_and_tone:
          'Pure black ink, white paper and dot screentone grays only; the darkest blacks reserved for the impact point.',
        lighting_and_shadow:
          'Hard shadow cuts laid in flat screentone, white rim flashes separating the subject from dark speed-line fields.',
        texture_and_material:
          'Visible dot screentone patches, scratched-out tone for sparks, ink splatter and debris shards.',
        camera_and_composition:
          'Extreme perspective at the moment of impact, radial or parallel speed lines converging on the action, bodies warped by motion.',
        atmosphere_and_mood:
          'Escalating competitive energy, the loudest moment of a fight frozen mid-strike.',
        rendering_and_quality:
          'Sharp tapered G-pen strokes, clean tone edges and readable silhouettes; never colored or painted.',
        key_features:
          'G-pen line-weight swings; radial speed lines; dot screentone; impact burst; extreme foreshortening',
      }),
      avoid: [...AVOID, 'full color', 'painted shading'],
      briefs: [
        'Action manga image of an adult swordsman mid-leap slicing a falling boulder in half, radial speed lines converging on the blade, black G-pen ink and dot screentone shadows. Single image, no panels, balloons, text or logo.',
        'Action manga image of two adult temple monks colliding fists on a tiled roof, a shockwave ring flattening the bamboo below, extreme perspective and scratched-out tone sparks. Single image, no panels, balloons, text or logo.',
        'Action manga image of a giant wolf spirit charging straight at the viewer, jaws foreshortened huge, parallel speed lines and white rim flashes on black. Single image, no panels, balloons, text or logo.',
      ],
    },
    'SP04-005': {
      dna: comic({
        aesthetic:
          'Romance manga art: hair-fine pen lines, large glistening eyes, floral and sparkle screentones and decorative flower borders floating around the subject.',
        color_and_tone:
          'Monochrome with soft gray tones and gradient screentone; whites kept pure for sparkles and petals.',
        lighting_and_shadow:
          'Soft backlight bloom, very light shadows, highlights drawn as star sparkles and white halos around hair.',
        texture_and_material:
          'Floral pattern screentone, bubble and sparkle overlays, flowing hair drawn in hundreds of fine strands.',
        camera_and_composition:
          'Emotional close-up or elegant half figure, subject turned three-quarters, petals and sparkles framing the negative space.',
        atmosphere_and_mood: 'Tender, dreamy and wistful, a heartbeat stretched into a moment.',
        rendering_and_quality:
          'Delicate controlled line with elongated graceful proportions; never rough, heavy or muscular.',
        key_features:
          'hair-fine pen lines; floral screentone; sparkle highlights; large glistening eyes; flower-framed negative space',
      }),
      avoid: [...AVOID, 'heavy black shadows', 'gritty texture'],
      briefs: [
        'Romance manga image of an adult court harpist with silver-braided hair playing under drifting camellia petals, hair-fine pen lines, floral screentone and star sparkle highlights, three-quarter half figure. Single image, no panels, balloons, text or logo.',
        'Romance manga image of a young adult prince in a lace-collared coat releasing a paper lantern from a moonlit balcony, soft backlight bloom and sparkle bubbles in the negative space. Single image, no panels, balloons, text or logo.',
        'Romance manga image of a porcelain teacup overflowing with roses and white feathers, floral pattern screentone and white halos, delicate line. Single image, no panels, balloons, text or logo.',
      ],
    },
    'SP04-006': {
      dna: comic({
        aesthetic:
          'Vertical-scroll webcomic art: clean digital line with soft cel shading over glowing full-color gradient backgrounds, drawn for a phone screen.',
        color_and_tone:
          'Saturated full color, pastel-to-neon gradient backdrops, two-tone cel shadows tinted violet or blue.',
        lighting_and_shadow:
          'One soft cel shadow step plus a colored rim light; glow layers set to add light around magic or screens.',
        texture_and_material:
          'Screen-native smooth fills, faint airbrush glows, no paper grain and no print dots.',
        camera_and_composition:
          'Tall vertical framing with generous empty gradient space above or below the subject, expressive faces read at small size.',
        atmosphere_and_mood: 'Emotional and contemporary, a cliffhanger beat in a serial story.',
        rendering_and_quality:
          'Clean anti-aliased line, simple two-step shading and soft glow; polished but not painterly.',
        key_features:
          'clean digital line; two-step cel shade; gradient backdrop; colored rim light; tall vertical framing',
      }),
      avoid: [...AVOID, 'print halftone', 'paper grain'],
      briefs: [
        'Webtoon-style vertical image of an adult apprentice witch in an apron catching a spilled glowing potion in a cramped apothecary, clean digital line, two-step violet cel shadows and a pastel gradient glow above her. Single image, no panels, balloons, text or logo.',
        'Webtoon-style vertical image of an adult man in a hoodie staring up at a glowing crack of a portal opening in his apartment ceiling, colored rim light, empty gradient space above. Single image, no panels, balloons, text or logo.',
        'Webtoon-style vertical image of a nine-tailed fox spirit curled on a rooftop water tank at twilight, neon-to-pastel sky gradient and soft glow layers. Single image, no panels, balloons, text or logo.',
      ],
    },
    'SP04-007': {
      dna: comic({
        aesthetic:
          'Franco-Belgian clear line: one uniform ink contour around every form, flat unshaded color and meticulously drawn backgrounds equal in clarity to the figures.',
        color_and_tone:
          'Flat bright album colors, clear sky blues, brick reds and ochres, local color with no modeling.',
        lighting_and_shadow:
          'Even daylight without hatching; at most a single flat darker tone for cast shadows under objects.',
        texture_and_material:
          'Smooth printed album paper, clean color fills, no brush texture, no hatching, no screentone.',
        camera_and_composition:
          'Calm eye-level or slightly high view, every object readable, architecture and vehicles drawn with draftsman precision.',
        atmosphere_and_mood:
          'Lucid, curious adventure told with calm intelligence and gentle irony.',
        rendering_and_quality:
          'Constant contour width, closed shapes, exact edges; the clarity of the line is the whole style.',
        key_features:
          'uniform clear-line contour; flat album color; no hatching; precise backgrounds; calm eye-level view',
      }),
      avoid: [...AVOID, 'crosshatching', 'painterly texture'],
      briefs: [
        'Clear-line album image of an adult explorer in a tweed jacket descending a rope into a sunken cliffside monastery, uniform ink contour, flat brick-red and sky-blue colors, every stone drawn precisely. Single image, no panels, balloons, text or logo.',
        'Clear-line album image of a red seaplane moored at a stone quay beneath a hilltop castle, flat unshaded color and exact draftsman lines on hull and rigging. Single image, no panels, balloons, text or logo.',
        'Clear-line album image of an adult antiquarian inspecting a giant ammonite fossil in a tidy museum hall, even daylight, flat ochre and green fills. Single image, no panels, balloons, text or logo.',
      ],
    },
    'SP04-008': {
      name: 'Binary Ink Noir Comic',
      dna: comic({
        aesthetic:
          'Binary noir ink: the image carved from solid black and bare white with no gray at all, figures often reduced to white-outlined silhouettes.',
        color_and_tone:
          'Strictly two values, black ink and paper white; no gray, no tone, no color.',
        lighting_and_shadow:
          'One harsh source cutting knife-edge shapes; the unlit half of every form merges into the black background.',
        texture_and_material:
          'Dry-brush drag at edges, ink splatter, rain and snow drawn as white slashes and dots scratched out of black.',
        camera_and_composition:
          'Silhouette-first staging, deep low or high angles, large black masses with small carved white shapes carrying the read.',
        atmosphere_and_mood: 'Menacing and nocturnal, a world of hard choices and cold rain.',
        rendering_and_quality:
          'Negative-space carving with razor edges; midtones are forbidden and white shapes must read alone.',
        key_features:
          'black and white only; negative-space carving; white-outlined silhouettes; knife-edge shadows; scratched-out rain',
      }),
      avoid: [...AVOID, 'gray midtones', 'screentone'],
      briefs: [
        'Binary ink noir image of an adult bounty hunter in a wide-brimmed hat stepping through a tavern doorway, only black ink and paper white, rain as white slashes scratched out of solid black. Single image, no panels, balloons, text or logo.',
        'Binary ink noir image of an adult executioner resting on his axe in a snowy castle courtyard, snowflakes as white dots in black, figure carved as a white-outlined silhouette. Single image, no panels, balloons, text or logo.',
        'Binary ink noir image of an abandoned church organ struck by one shaft of moonlight, knife-edge shadows swallowing the pipes, no gray at all. Single image, no panels, balloons, text or logo.',
      ],
    },
    'SP04-009': {
      dna: comic({
        aesthetic:
          '1960s underground comix: nervous dip-pen line with obsessive crosshatching, lumpy rubbery anatomy and every inch of the drawing crammed with detail.',
        color_and_tone:
          'Black ink on white with dense crosshatch midtones; if color appears it is a cheap flat two-tone overlay.',
        lighting_and_shadow:
          'Shadow built only from layered hatch webs, deepest where the clutter piles up.',
        texture_and_material:
          'Wobbly contour, sweat drops and stink lines, hatch fields on every surface, cheap paper tooth.',
        camera_and_composition:
          'Slightly fisheye staging, oversized feet and hands in front, background clutter filling every gap.',
        atmosphere_and_mood: 'Subversive, sweaty and gleefully rude, an anxious joke told loudly.',
        rendering_and_quality:
          'Hand-forged anti-polish ink with visible wobble; never clean vector line or smooth color.',
        key_features:
          'obsessive crosshatching; nervous dip-pen wobble; rubbery lumpy anatomy; sweat and stink lines; crammed detail',
      }),
      avoid: [...AVOID, 'clean vector line'],
      briefs: [
        "Underground comix image of a lumpy homunculus crawling out of a flask in an adult alchemist's cluttered garret, jars and bones crammed into every gap, nervous dip-pen wobble and obsessive crosshatching. Single image, no panels, balloons, text or logo.",
        'Underground comix image of a sweaty adult bard with enormous feet hopping across hot coals, stink lines and sweat drops, fisheye staging and dense hatch webs. Single image, no panels, balloons, text or logo.',
        'Underground comix image of a sagging overstuffed armchair growing rubbery legs and walking out of a parlor, crosshatched wallpaper behind. Single image, no panels, balloons, text or logo.',
      ],
    },
    'SP04-010': {
      dna: comic({
        aesthetic:
          'Painted graphic novel: every image fully painted in gouache and watercolor from observation, forms built by value and edge with almost no outline.',
        color_and_tone:
          'Naturalistic chroma, warm skin against muted greens and grays, one saturated heraldic accent per image.',
        lighting_and_shadow:
          'Classical soft key from high side, gentle fill and a warm spotlight isolating faces and hands.',
        texture_and_material:
          'Visible brushwork, dry gouache over wet washes, fabric and metal painted with observed folds and dents.',
        camera_and_composition:
          'Realist proportions, grounded eye-level staging, painted portrait-weight close-ups within a single image.',
        atmosphere_and_mood: 'Solemn and reverent, legends treated as living people.',
        rendering_and_quality:
          'Fine-art painted finish with anatomical and textile fidelity; no ink outlines and no digital gloss.',
        key_features:
          'fully painted gouache; outline-free forms; warm soft key; observed fabric and metal; realist proportions',
      }),
      avoid: [...AVOID, 'ink outlines', 'cel shading'],
      briefs: [
        'Painted graphic novel image of an elderly adult knight removing his dented helm inside a candle-lit chapel, gouache over watercolor washes, no outlines, a warm spotlight on his tired face and hands. Single image, no panels, balloons, text or logo.',
        'Painted graphic novel image of an adult blacksmith woman quenching a glowing blade in a barrel, steam curling through warm forge light, visible dry brushwork on her leather apron. Single image, no panels, balloons, text or logo.',
        'Painted graphic novel image of a war horse in heraldic barding standing alone in morning fog, observed folds in the cloth, muted grays with one red accent. Single image, no panels, balloons, text or logo.',
      ],
    },
    'SP04-011': {
      name: 'Obsessive Fine-Line Horror Manga',
      dna: comic({
        aesthetic:
          'Horror manga drawn with obsessive fine lines: thousands of parallel pen strokes accumulate into dread, and ordinary surfaces slowly turn into spirals, holes or patterns.',
        color_and_tone:
          'Black and white only, with suffocating fields of dense hatching and a few stark unhatched faces.',
        lighting_and_shadow:
          'Flat, sourceless dread light; darkness is built by line density, and voids stay pitch black.',
        texture_and_material:
          'Micro-line hatching, spiral and concentric motifs creeping over skin, wood and cloth, clean white faces left untouched.',
        camera_and_composition:
          'Calm, symmetrical staging that makes the one wrong element unbearable; slow reveal of the anomaly in the center.',
        atmosphere_and_mood: 'Claustrophobic, uncanny and quietly escalating toward horror.',
        rendering_and_quality:
          'Precise fine-pen draftsmanship with realistic faces and relentless line density; no gore splash, no cute shapes.',
        key_features:
          'obsessive fine-line hatching; creeping spiral patterns; realistic unhatched faces; symmetrical calm staging; pitch-black voids',
      }),
      avoid: [...AVOID, 'color', 'splatter gore'],
      briefs: [
        'Fine-line horror manga image of an adult villager leaning over a stone well whose walls spiral endlessly inward, thousands of parallel pen strokes darkening the shaft, his face left clean and white. Single image, no panels, balloons, text or logo.',
        'Fine-line horror manga image of a vast woven tapestry in a castle hall whose embroidered faces have begun to turn toward the viewer, symmetrical staging and micro-line hatching. Single image, no panels, balloons, text or logo.',
        'Fine-line horror manga image of an adult woman kneeling in a tatami room as her long black hair coils into spirals across the floor and up the walls, pitch-black voids. Single image, no panels, balloons, text or logo.',
      ],
    },
    'SP04-012': {
      name: 'Dreamline Stipple Sci-Fi Comic',
      dna: comic({
        aesthetic:
          'Dreamline European science-fiction comic: fine even contour with stipple dot shading and flat matte pastel color over vast airy alien landscapes.',
        color_and_tone:
          'Dusty pastel fields, peach, sand, lilac and pale turquoise, cool alien blues in the distance, low contrast.',
        lighting_and_shadow:
          'Even ambient desert light with small soft shadows; depth carried by paler color toward the horizon.',
        texture_and_material:
          'Stipple dots for all shading, clean matte color fields, organic-futurist architecture with smooth curves.',
        camera_and_composition:
          'Wide calm views with tiny figures against huge negative space, flowing non-Euclidean silhouettes.',
        atmosphere_and_mood: 'Vast, meditative and enigmatic, a silent dream of another world.',
        rendering_and_quality:
          'Intricate but breathable detail, fine line and stipple only; no heavy black shadows.',
        key_features:
          'fine even contour; stipple dot shading; dusty pastel matte color; organic-futurist forms; tiny figures in vast space',
      }),
      avoid: [...AVOID, 'heavy black shadows', 'glossy chrome'],
      briefs: [
        'Dreamline sci-fi comic image of an adult nomad riding a long-legged beast across a pale desert toward floating stone arches, fine even contour, stipple shading, dusty peach and lilac matte color, tiny rider in vast space. Single image, no panels, balloons, text or logo.',
        'Dreamline sci-fi comic image of an adult hermit meditating on top of a giant petrified mushroom above a sea of clouds, pale turquoise distance and stippled rock. Single image, no panels, balloons, text or logo.',
        'Dreamline sci-fi comic image of a silent organic-shaped airship docked at a spired oasis tower, smooth curving architecture and flat pastel fields. Single image, no panels, balloons, text or logo.',
      ],
    },
    'SP04-014': {
      dna: comic({
        aesthetic:
          'Pixel comic art: comic inking translated into pixels, one-pixel black outlines, ordered-dither halftone shading and a strict indexed palette on a visible grid.',
        color_and_tone:
          'Indexed palette of about 32 colors, dithered ramps between neighboring tones, deep navy used instead of pure black shadow.',
        lighting_and_shadow:
          'Baked sprite shading with hand-placed pixel clusters; a single light direction shown by bright edge pixels.',
        texture_and_material:
          'Hard square pixels with intentional aliasing, checkerboard and Bayer dither patterns standing in for print halftone.',
        camera_and_composition:
          'Splash-page framing at low resolution, chunky readable silhouettes, perspective simplified to fit the grid.',
        atmosphere_and_mood: 'Nostalgic and playful, a comic splash drawn on an old console.',
        rendering_and_quality:
          'Crisp nearest-neighbor pixels, no anti-aliasing, no smooth gradients and no blur.',
        key_features:
          'one-pixel black outlines; ordered-dither shading; indexed 32-color palette; visible pixel grid; chunky silhouettes',
      }),
      avoid: [...AVOID, 'smooth gradients', 'anti-aliasing', 'high-resolution painting'],
      briefs: [
        'Pixel comic image of an adult rogue climbing a castle wall under a big pixel moon, one-pixel black outlines, Bayer dither shading and an indexed navy-and-gold palette on a visible grid. Single image, no panels, balloons, text or logo.',
        'Pixel comic image of a dragon egg cracking open on a mossy stone altar, bright edge pixels and dithered green ramps, chunky readable silhouette. Single image, no panels, balloons, text or logo.',
        'Pixel comic image of an adult ferryman poling a flat boat across a black river with one lantern, checkerboard dither reflections, crisp nearest-neighbor pixels. Single image, no panels, balloons, text or logo.',
      ],
    },
    'SP04-016': {
      dna: comic({
        aesthetic:
          'Tech-noir comic: angular ink with heavy black shadow architecture, lit only by cyan and magenta duotone neon and reflected on glossy black planes.',
        color_and_tone:
          'Black-dominant image, cyan and magenta as the only colors, indigo in the midtones, sparse white highlights.',
        lighting_and_shadow:
          'Chiaroscuro from colored practical light, hard silhouette separation and thin glowing edge accents.',
        texture_and_material:
          'Glossy reflective black surfaces, chrome edge glints, haze and fine particulate caught in light.',
        camera_and_composition:
          'Compressed long-lens perspective, tilted angles, large black shapes framing a small lit subject.',
        atmosphere_and_mood: 'Ominous and electric, a future that has already gone wrong.',
        rendering_and_quality:
          'Knife-edged ink contours with flat duotone color and controlled glow; no daylight palette.',
        key_features:
          'heavy black shadow architecture; cyan-magenta duotone; glossy black reflections; knife-edged ink; tilted long-lens framing',
      }),
      avoid: [...AVOID, 'daylight palette', 'warm sunlight'],
      dropAvoid: ['nature'],
      briefs: [
        'Tech-noir comic image of an adult cyborg courier with a glowing ocular implant waiting under an elevated hover-car flyover, cyan and magenta duotone light on glossy black planes, knife-edged ink and tilted long-lens framing. Single image, no panels, balloons, text or logo.',
        'Tech-noir comic image of hooded adult monks tending bundles of cables in a server-vault chapel, magenta light through the racks, heavy black shadow architecture and haze. Single image, no panels, balloons, text or logo.',
        'Tech-noir comic image of a chrome prosthetic hand lying on an operating table under a surgical lamp, cyan edge glints, compressed perspective. Single image, no panels, balloons, text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Gekiga Drybrush Realism',
      domain: 'adult dramatic manga realism',
      tags: ['gekiga', 'drybrush-ink', 'dramatic-manga'],
      dna: comic({
        aesthetic:
          'Gekiga dramatic manga: realistic adult proportions drawn with a split, dry-loaded brush, gritty screentone and cinematic framing instead of cute stylization.',
        color_and_tone:
          'Black ink and white paper with coarse gray screentone; dirty midtones and heavy black masses.',
        lighting_and_shadow:
          'Low hard light with deep shadow pools, faces half lost in black, sweat and rain catching white highlights.',
        texture_and_material:
          'Dry-brush streaks with broken bristle edges, scraped highlights, weathered skin, cloth and wood.',
        camera_and_composition:
          'Film-like framing: long-lens close-ups, low angles and silent wide shots with small figures.',
        atmosphere_and_mood: 'Bleak, adult and unsentimental, hardship shown without heroics.',
        rendering_and_quality:
          'Realistic faces and anatomy, rough brush energy, no big sparkling eyes and no chibi proportions.',
        key_features:
          'split dry-brush strokes; realistic adult proportions; coarse screentone grit; deep shadow pools; cinematic long-lens framing',
      }),
      avoid: [...AVOID, 'big sparkling eyes', 'chibi proportions', 'clean vector line'],
      briefs: [
        'Gekiga drybrush manga image of an adult ronin crouched under a dripping thatched eave at night, split dry-brush streaks on his worn kimono, coarse gray screentone, face half lost in black. Single image, no panels, balloons, text or logo.',
        'Gekiga drybrush manga image of an adult fisherman hauling a heavy net over the side of a boat in a storm-dark sea, low hard light and scraped white spray, long-lens framing. Single image, no panels, balloons, text or logo.',
        'Gekiga drybrush manga image of a scrawny stray dog gnawing a bone beside a burning farmhouse, silent wide shot, broken bristle edges and dirty midtones. Single image, no panels, balloons, text or logo.',
      ],
    },
    {
      name: 'Greywash Horror Magazine',
      domain: 'black-and-white horror magazine art',
      tags: ['ink-wash', 'horror-magazine', 'monochrome'],
      dna: comic({
        aesthetic:
          '1970s black-and-white horror magazine art: detailed pen ink drawing modeled with diluted ink gray washes instead of color or screentone.',
        color_and_tone:
          'Gray scale built from three or four dilutions of black ink, pale fog grays to charcoal, pure black accents.',
        lighting_and_shadow:
          'Theatrical underlight and side light, wash pooling in the shadows, white paper left for moonlight and candle glow.',
        texture_and_material:
          'Soft wash blooms and tide lines on illustration board, crisp pen hatching over wet-in-wet fog, dripping textures.',
        camera_and_composition:
          'Splash-page drama: looming low angles, a monster or figure rising out of gloom, deep receding backgrounds.',
        atmosphere_and_mood: 'Lurid, gothic and delicious dread, a campfire tale drawn seriously.',
        rendering_and_quality:
          'Rich tonal wash gradations with sharp pen detail on top; no color, no dot screentone.',
        key_features:
          'diluted ink gray washes; pen hatching over wash; wash tide lines; theatrical underlight; looming low angles',
      }),
      avoid: [...AVOID, 'color', 'dot screentone', 'cute monsters'],
      briefs: [
        'Greywash horror magazine image of a decaying adult lich rising out of a flooded crypt, diluted ink gray washes pooling in the water, pen hatching on bone and rags, theatrical underlight from below. Single image, no panels, balloons, text or logo.',
        'Greywash horror magazine image of a stone gargoyle peeling itself off a cathedral ledge in fog, wet-in-wet pale grays and crisp pen cracks, looming low angle. Single image, no panels, balloons, text or logo.',
        'Greywash horror magazine image of an adult gravedigger lifting a coffin lid scored with scratch marks from the inside, lantern glow left as white paper. Single image, no panels, balloons, text or logo.',
      ],
    },
    {
      name: 'Feathered-Brush Adventure Strip',
      domain: 'classic newspaper adventure strip',
      tags: ['brush-feathering', 'adventure-strip', 'realist-ink'],
      dna: comic({
        aesthetic:
          'Classic newspaper adventure strip: realist figures inked with a sable brush, shadows built from tapering feathered strokes and slabs of spotted black.',
        color_and_tone:
          'Black ink on white, or the same line under a limited flat Sunday palette of muted reds, blues and ochre.',
        lighting_and_shadow:
          'Strong side light with shadow edges broken into feathered brush tapers, spotted blacks anchoring the design.',
        texture_and_material:
          'Swelling and tapering brush lines, drybrush for rock and bark, folds of cloth drawn as rhythmic feathering.',
        camera_and_composition:
          'Horizontal landscape framing, grounded realist staging with figures and wide scenery given equal weight.',
        atmosphere_and_mood: 'Stoic adventure and romance, sturdy and handsome, told with craft.',
        rendering_and_quality:
          'Elegant brush economy and accurate anatomy; no screentone, no digital gradients.',
        key_features:
          'sable-brush feathering; spotted blacks; realist anatomy; muted flat Sunday color; horizontal framing',
      }),
      avoid: [...AVOID, 'screentone', 'digital gradients'],
      briefs: [
        'Feathered-brush adventure strip image of an adult sea captain gripping a ship wheel in a gale, tapering feathered strokes on the folds of his oilskin, spotted blacks in the storm clouds, horizontal framing. Single image, no panels, balloons, text or logo.',
        'Feathered-brush adventure strip image of an adult falconer on a windy crag releasing a hawk, drybrush rock, muted flat Sunday reds and ochre. Single image, no panels, balloons, text or logo.',
        'Feathered-brush adventure strip image of a giant stone elephant statue half-swallowed by jungle vines, rhythmic brush feathering on the leaves, strong side light. Single image, no panels, balloons, text or logo.',
      ],
    },
    {
      name: 'Airbrush Manhua Action',
      domain: 'painted martial-arts comic',
      tags: ['manhua', 'airbrush-color', 'martial-arts'],
      dna: comic({
        aesthetic:
          'Painted martial-arts manhua: sharp ink figures fully colored with airbrush gradients, glowing energy auras and metallic gold highlights.',
        color_and_tone:
          'Rich jade, crimson and gold over deep indigo, airbrushed gradients and burning white cores in the energy trails.',
        lighting_and_shadow:
          'Glow from the energy itself lighting the figure, strong backlit rims, airbrushed soft shadows.',
        texture_and_material:
          'Silky flowing robes and hair, gold foil-like highlights on ornaments, mist and ink-splash effects.',
        camera_and_composition:
          'Soaring diagonal compositions, figures balanced on impossible points, long swirling trails of cloth and energy.',
        atmosphere_and_mood: 'Grand heroic wuxia drama, elegant and explosive at once.',
        rendering_and_quality:
          'Crisp ink contour under smooth airbrush color and metallic sheen; no flat print color, no screentone.',
        key_features:
          'airbrush gradient color; energy auras; metallic gold highlights; flowing silk trails; soaring diagonal composition',
      }),
      avoid: [...AVOID, 'flat print color', 'screentone'],
      briefs: [
        'Airbrush manhua image of an adult swordswoman in flowing jade robes balanced on the tip of a bamboo stalk, airbrush gradient energy aura, metallic gold highlights on her hairpin, soaring diagonal composition. Single image, no panels, balloons, text or logo.',
        'Airbrush manhua image of an adult white-haired martial elder unleashing a palm strike that bends a waterfall backwards, crimson and gold energy trail with a white-hot core. Single image, no panels, balloons, text or logo.',
        'Airbrush manhua image of a jade qilin rearing among swirling clouds, silky mane trails and airbrushed indigo sky. Single image, no panels, balloons, text or logo.',
      ],
    },
    {
      name: 'Non-Photo Blue Pencils',
      domain: 'uninked comic pencil art',
      tags: ['blueline', 'comic-pencils', 'construction-lines'],
      dna: comic({
        aesthetic:
          'Uninked comic pencil art: confident graphite line drawing laid over loose non-photo-blue construction sketching on bristol board, before any ink.',
        color_and_tone:
          'Graphite grays over light cyan blue lines on warm white board; no other color.',
        lighting_and_shadow:
          'Shadow indicated by quick graphite hatching and X marks for areas to be filled black later.',
        texture_and_material:
          'Bristol board tooth, smudged graphite, eraser ghosts, blue gesture curves, ellipses and perspective lines left visible.',
        camera_and_composition:
          'The requested view built on a visible blue perspective grid and mannequin forms, finished line on top.',
        atmosphere_and_mood:
          'Energetic and in-progress, the thinking of the artist left on the page.',
        rendering_and_quality:
          'Clean confident pencil over messy blue structure; the image stays unfinished and uninked on purpose.',
        key_features:
          'non-photo-blue construction lines; graphite finished line; X marks for blacks; visible perspective grid; bristol tooth',
      }),
      avoid: [...AVOID, 'ink', 'full color', 'finished rendering'],
      briefs: [
        'Non-photo blue pencils image of a siege tower rolling toward a castle wall, graphite line drawing over light cyan perspective lines and blue ellipses, X marks where blacks will go, bristol tooth. Single image, no panels, balloons, text or logo.',
        'Non-photo blue pencils image of an adult dancer mid-pirouette, blue gesture curves and mannequin forms under confident graphite contour, eraser ghosts. Single image, no panels, balloons, text or logo.',
        'Non-photo blue pencils image of an adult giantess resting on a hillside above a tiny village, blue construction ellipses and scale lines visible, graphite hatching. Single image, no panels, balloons, text or logo.',
      ],
    },
    {
      name: 'Direct-Color Album Watercolor',
      domain: 'European painted album art',
      tags: ['direct-color', 'watercolor', 'bande-dessinee'],
      dna: comic({
        aesthetic:
          'European direct-color album art: a fine pen line painted directly in transparent watercolor, washes flowing over and softening the ink.',
        color_and_tone:
          'Luminous transparent washes, warm ochres and cool greens, whites left as bare paper, color bleeding past lines.',
        lighting_and_shadow:
          'Atmospheric natural light painted wet-in-wet, soft glazed shadows, colored reflected light.',
        texture_and_material:
          'Cold-press paper grain, blooms, granulating pigment and hard wash edges drying around fine pen detail.',
        camera_and_composition:
          'Spacious landscape-led views with figures in their environment, weather and season given room.',
        atmosphere_and_mood:
          'Warm, travelled and wistful, adventure felt through light and weather.',
        rendering_and_quality:
          'Fine pen line softened by genuine watercolor behavior; no flat fills and no digital gradients.',
        key_features:
          'pen line under transparent watercolor; wet-in-wet blooms; bare paper whites; granulating pigment; landscape-led view',
      }),
      avoid: [...AVOID, 'flat digital fills', 'hard cel shading'],
      briefs: [
        "Direct-color album watercolor image of an adult merchant's covered wagon crossing a mountain pass in autumn, fine pen line under transparent ochre and green washes, bare paper whites in the clouds. Single image, no panels, balloons, text or logo.",
        'Direct-color album watercolor image of an adult woman fishing from a stilt house on a misty lagoon at dawn, wet-in-wet blooms in the water, granulating pigment. Single image, no panels, balloons, text or logo.',
        'Direct-color album watercolor image of a ruined aqueduct overgrown with red poppies in summer heat, soft glazed shadows and hard wash edges. Single image, no panels, balloons, text or logo.',
      ],
    },
  ],
};

export const aliases = {
  'SP04-008': 'Sin City Noir Comic (High Contrast)',
  'SP04-011': 'Junji Ito Horror Manga (Obsessive Ink)',
  'SP04-012': 'Moebius Retro Sci-Fi Comic (Dreamline)',
};

export default spec;
