import type { Spec } from '../tools/apply';
import { au } from './_authors';

// Studio masterpieces, author pass: each preset names its film and director or studio and states
// the concrete look of that feature, so cards read as that film's hand and not generic anime.
const spec: Spec = {
  pack: 'pack_16',
  category: '4. Studio Masterpieces',
  updates: Object.fromEntries([
    au('SP05-073', "Howl's Moving Castle - Wandering Clockwork Hearth", {
      look: "Hayao Miyazaki and Studio Ghibli feature animation as in Howl's Moving Castle: hand-painted poster-color backgrounds of Alsace-like towns and alpine meadows, ramshackle steampunk machines of patched metal, and simple warm character designs.",
      subject:
        'draw people with simple round Ghibli faces, small dot-highlight eyes, soft noses, natural proportions and loose everyday clothes that move with the wind.',
      color:
        'Meadow greens, sky cobalt, cream cumulus clouds, rust brown metal and warm hearth orange.',
      light:
        'Bright open daylight with soft cel shadows, glowing fire and window light inside cluttered rooms.',
      texture:
        'Hand-painted gouache backgrounds, clean thin ink cel lines, riveted scrap-metal detail and chimney smoke.',
      camera:
        'Wide painterly establishing shots with small figures, then warm medium shots inside cluttered homes.',
      mood: 'gentle wonder and cozy magic',
      render: 'Classic hand-drawn Ghibli feature frame, painterly and warm, no digital gloss.',
      key: 'Ghibli gouache backgrounds; patched steampunk machines; simple warm faces; wind-blown cloth',
    }),
    au('SP05-074', 'Your Name - Skyglow Longing Drama', {
      look: 'Makoto Shinkai feature animation as in Your Name: photoreal-detailed painted Tokyo and countryside backgrounds, dazzling twilight skies with comets and lens flares, and clean Masayoshi Tanaka character designs.',
      subject:
        'draw people with clean slender Tanaka-style designs, large clear eyes with a single bright highlight, fine hair strands and modern everyday clothes.',
      color:
        'Magenta and violet twilight, gold magic-hour light, deep blue night and saturated cyan skies.',
      light:
        'Magic-hour backlight, lens flares, light leaks and god rays glittering through every gap.',
      texture:
        'Hyper-detailed digital background painting, crisp cel characters, sparkle particles and glass reflections.',
      camera:
        'Wide low-angle sky compositions, split-screen parallel shots, telephoto street views with compressed depth.',
      mood: 'aching longing and luminous hope',
      render:
        'Polished contemporary Shinkai frame with photographic depth and glowing post effects.',
      key: 'Makoto Shinkai skies; comet twilight; lens flares; detailed city backgrounds; clean designs',
    }),
    au('SP05-075', 'Weathering With You - Rainlight Threshold Romance', {
      look: 'Makoto Shinkai feature animation as in Weathering With You: rain-soaked photoreal Tokyo streets painted digitally, water droplets as main actors, sudden sunbeams breaking through storm clouds.',
      subject:
        'draw people with clean slender Shinkai-era designs, clear bright eyes, wet hair strands and modern raincoats and school or city clothes.',
      color: 'Wet slate grey, neon reflections, storm blue and sudden gold sunlight on puddles.',
      light:
        'Overcast diffusion broken by sharp sunbeams, rain streaks catching light, glowing puddle reflections.',
      texture:
        'Detailed digital rain, droplet splashes, reflective asphalt, crisp cel characters over painted backgrounds.',
      camera:
        'Low puddle-level views, rooftop wides under enormous clouds, close shots of hands and droplets.',
      mood: 'wistful rainy romance',
      render: 'Glossy contemporary Shinkai frame with photographic rain detail and light bloom.',
      key: 'Shinkai rain; puddle reflections; sunbeams through clouds; detailed Tokyo; clean designs',
    }),
    au('SP05-077', 'Perfect Blue - Mirror Identity Collapse Thriller', {
      look: 'Satoshi Kon feature animation as in Perfect Blue: late-nineties Madhouse cel with grounded realistic designs, cramped apartments, TV studios and mirrors, where edits blur what is real.',
      subject:
        'draw people with realistic adult proportions, modest eyes, observed Japanese faces and ordinary clothes, never glamorous anime beauty.',
      color:
        'Faded nineties cel palette, muted pinks and beiges, dim fluorescent greens and sudden blood-red accents.',
      light:
        'Flat fluorescent room light and TV glow, harsh flash in stage scenes, heavy shadows in hallways.',
      texture:
        'Hand-painted cel on painted backgrounds, slight film grain, dust and old video softness.',
      camera:
        'Match cuts through mirrors, reflections and screens, voyeuristic framing through doorways.',
      mood: 'paranoid unraveling tension',
      render: 'Precise realist 1990s theatrical cel animation frame with grounded observed acting.',
      key: 'Satoshi Kon realism; mirror reflections; nineties cel; paranoid staging; grounded faces',
    }),
    au('SP05-078', 'Akira - Otomo Light-Trail Collapse', {
      look: 'Katsuhiro Otomo feature animation as in Akira: dense hand-drawn Neo-Tokyo megastructures, meticulous mechanical detail, realistic Japanese faces and red taillights smearing into light trails.',
      subject:
        'draw people with Otomo realism, flat-nosed ordinary faces, small eyes, stocky believable bodies and bulky late-eighties jackets.',
      color: 'Deep night blues and blacks, neon signage colors and signature saturated red.',
      light: 'Night city neon, streaking taillight trails, blinding white psychic flashes.',
      texture:
        'Hand-painted cel with backlit light effects, meticulous architectural linework, rubble and debris.',
      camera:
        'Low speeding tracking shots, vast aerial city views, collapse spreading across frames.',
      mood: 'kinetic apocalyptic energy',
      render:
        'Dense 1988 theatrical hand-drawn animation frame with photographic backlight effects.',
      key: 'Otomo detail; neon night city; red light trails; realistic faces; destruction',
      avoid: [
        'the red motorcycle with capsule stickers',
        'the red jacket with a pill emblem',
        'existing franchise characters',
      ],
    }),
    au('SP05-079', 'Redline - Hyperkinetic Cosmic Velocity', {
      look: 'Takeshi Koike feature animation as in Redline: hand-drawn racing with extreme perspective, heavy black shadow shapes, thick outlines and explosive colors across wild alien worlds.',
      subject:
        'draw people with Koike stylization, long angular limbs, hard jawlines, pompadours and huge black shadow masses cutting across bodies.',
      color: 'Saturated primaries, acid yellow, hot red and cyan against massive black shadows.',
      light:
        'Hard graphic light where shadows are solid black shapes, flare bursts and speed glows.',
      texture:
        'Thick varying ink outlines, flat hand-painted color, speed lines and hand-drawn smoke.',
      camera:
        'Fisheye foreshortening, cars stretching toward the lens, dramatic tilted wide shots.',
      mood: 'roaring hyperkinetic swagger',
      render: 'Obsessive hand-drawn feature frame with thousands of drawings worth of detail.',
      key: 'Takeshi Koike blacks; extreme perspective; thick outlines; speed stretch; saturated color',
    }),
    au('SP05-080', 'Children of the Sea - Cosmic Ocean Lyrical', {
      look: 'Daisuke Igarashi manga as animated by Studio 4°C in Children of the Sea: sketchy pencil-like linework, hand-hatched faces and luminous cosmic ocean scenes of whales, plankton and stars.',
      subject:
        'draw people with Igarashi designs, loose pencil-textured lines, freckled sunburned faces, wild hair and hatching on skin.',
      color:
        'Deep ocean indigo, glowing plankton cyan, sunlit aquarium teal and warm summer skin tones.',
      light: 'Underwater caustics, bioluminescent glow and cosmic light blooms.',
      texture:
        'Hand-hatched pencil lines on characters, painterly water, particle-filled 3D ocean effects.',
      camera: 'Immersive underwater wides, huge creatures dwarfing swimmers, cosmic transitions.',
      mood: 'lyrical cosmic awe',
      render: 'Rich Studio 4°C feature frame blending sketch lines and luminous painted effects.',
      key: 'Daisuke Igarashi hatching; cosmic ocean; bioluminescence; whales; pencil textured lines',
    }),
    au('SP05-281', 'Millennium Actress - Temporal Memory Cinema', {
      look: 'Satoshi Kon feature animation as in Millennium Actress: a life told through film eras, scenes sliding between period drama, war film, science fiction and the present in one continuous shot.',
      subject:
        'draw people with Kon realism, elegant restrained faces, natural proportions and costumes of different film eras.',
      color:
        'Palette that shifts per era: sepia and snow for period scenes, technicolor warmth, cool modern greys.',
      light: 'Studio film lighting and theatrical spotlights, snow glinting, projector beams.',
      texture: 'Clean realistic cel over detailed painted sets, film grain and projector flicker.',
      camera: 'Seamless match transitions between eras, characters running across changing sets.',
      mood: 'nostalgic devoted longing',
      render: 'Refined theatrical Madhouse cel frame with cinematic continuity.',
      key: 'Satoshi Kon match cuts; film eras; realistic faces; projector light; snow',
    }),
    au('SP05-282', 'Tokyo Godfathers - Social Humanist Warmth', {
      look: 'Satoshi Kon feature animation as in Tokyo Godfathers: grubby realistic winter Tokyo alleys, warm humanist comedy and elastic exaggerated facial expressions on otherwise grounded designs.',
      subject:
        'draw people with Kon realism stretched by rubbery comic expressions, worn coats, wrinkles and imperfect teeth.',
      color: 'Snowy night blues, sodium orange streetlights, dirty browns and warm red accents.',
      light: 'Streetlight pools on snow, neon spill, cold moonlight with warm windows.',
      texture:
        'Detailed painted urban grime, cel characters, snowflakes, trash and texture of old coats.',
      camera: 'Street-level views in alleys, wide rooftop shots at night, sudden comic close-ups.',
      mood: 'scruffy tender warmth',
      render: 'Realist 2003 Madhouse cel frame with lively acting.',
      key: 'Satoshi Kon realism; rubbery expressions; snowy alleys; urban grime; humanist warmth',
    }),
    au('SP05-284', 'Castle in the Sky - Airborne Wonder Adventure', {
      look: 'Hayao Miyazaki and Studio Ghibli feature animation as in Castle in the Sky: Welsh-inspired mining towns, ornithopter flying machines, towering cumulus clouds and overgrown floating ruins.',
      subject:
        'draw people with classic early Ghibli designs, round faces, dot-highlight eyes, sturdy limbs and practical work clothes and goggles.',
      color: 'Sky blue, cloud white, moss green, brass and warm stone ochre.',
      light: 'Bright high-altitude sunlight, huge glowing clouds, warm interior lamps.',
      texture:
        'Hand-painted watercolor and gouache backgrounds, riveted metal machines, moss on stone.',
      camera:
        'Dizzying heights and vertical drops, flying machines crossing the frame, giant cloud walls.',
      mood: 'soaring adventurous wonder',
      render: 'Classic 1980s hand-drawn Ghibli feature frame with airy painted skies.',
      key: 'Ghibli clouds; flying machines; floating ruins; round faces; brass and moss',
      avoid: [
        'a glowing blue crystal pendant',
        'moss-covered giant guardian robots',
        'existing franchise characters',
      ],
    }),
    au('SP05-285', 'Nausicaa - Eco-Prophetic Wind', {
      look: "Hayao Miyazaki's own Nausicaa manga pages: sepia-toned pencil and ink drawing with dense cross-hatching, sweeping toxic fungal forests, insectoid giants and wind-riding gliders.",
      subject:
        'draw people in Miyazaki manga style, simple round faces, flowing hair, layered robes and masks, drawn with fine pencil lines.',
      color: 'Sepia-brown ink printing on cream paper with dusty blue-grey washes.',
      light: 'Diffuse light rendered by hatching density, glowing spores as bright white paper.',
      texture: 'Fine pencil and pen hatching, dense organic fungal detail, soft graphite shading.',
      camera:
        'Panoramic manga panels of vast landscapes, small figures against towering fungi and insects.',
      mood: 'solemn ecological prophecy',
      render: 'Densely drawn hand-made manga illustration in sepia print.',
      key: 'Miyazaki manga hatching; sepia print; toxic fungal forest; gliders; giant insects',
    }),
    au('SP05-286', 'Wolf Children - Seasonal Intimacy Realism', {
      look: 'Mamoru Hosoda feature animation as in Wolf Children: characters with no cel shadows at all against richly painted rural Japan, seasons rolling through snow, rain and summer fields.',
      subject:
        'draw people with Hosoda designs, flat unshaded skin, clean thin lines, simple faces and practical country clothes.',
      color: 'Fresh greens, snow white, soft sky blue and warm tatami browns.',
      light:
        'Natural seasonal light carried by backgrounds, while characters stay flat and unshaded.',
      texture:
        'Clean thin outlines with no shadow tones on figures, painterly photographic backgrounds, snow and grass detail.',
      camera:
        'Long lateral tracking shots through seasons, wide farmhouse frames, gentle close-ups.',
      mood: 'tender everyday devotion',
      render: 'Warm Studio Chizu feature frame with flat characters on lush backgrounds.',
      key: 'Mamoru Hosoda flat unshaded characters; rural seasons; painted backgrounds; gentle realism',
    }),
    au('SP05-288', 'The Girl Who Leapt Through Time - Elastic Summer Time', {
      look: 'Mamoru Hosoda feature animation as in The Girl Who Leapt Through Time: shadowless Yoshiyuki Sadamoto character designs, bright summer skies with towering cumulus and sudden time-leap bursts.',
      subject:
        'draw people with Sadamoto designs, flat unshaded skin, clean fine lines, lively tomboyish body language and summer clothes.',
      color: 'Summer blue, cloud white, cicada green and warm afternoon gold.',
      light: 'Clear midsummer daylight, characters without cel shadow, bright sky reflections.',
      texture:
        'Clean thin lines, flat color characters, painted backgrounds and streaking time-warp effects.',
      camera:
        'Big-sky wides with small leaping figures, low angles at river embankments, dynamic run cycles.',
      mood: 'bright bittersweet summer',
      render: 'Crisp Madhouse feature frame, light and airy, with flat shadowless characters.',
      key: 'Hosoda shadowless characters; Sadamoto designs; summer cumulus; time-leap bursts',
    }),
    au('SP05-290', 'Jin-Roh - Paramilitary Melancholy', {
      look: 'Hiroyuki Okiura feature animation as in Jin-Roh: sober realistic Production I.G cel, alternate postwar Tokyo, heavy armored uniforms, rain, sewers and restrained human gestures.',
      subject:
        'draw people with Okiura realism, accurate anatomy, understated faces and heavy period coats and uniforms.',
      color: 'Desaturated olive, rain grey, sepia and cold blue, with rare dim red.',
      light: 'Wet night light, flashlight beams in tunnels, overcast gloom.',
      texture: 'Precise realist cel lines, painted wet concrete, smoke and rain.',
      camera: 'Measured cinematic framing, long silent holds, low tunnel perspectives.',
      mood: 'somber fatal melancholy',
      render: 'Meticulous 1999 realist hand-drawn feature frame with somber cinematic restraint.',
      key: 'Okiura realism; armored uniforms; rain and sewers; restrained acting; desaturated palette',
      avoid: [
        'armored protect-gear suits with red glowing goggles',
        'existing franchise characters',
      ],
    }),
    au('SP05-291', 'A Silent Voice - Delicate Reconciliation', {
      look: 'Naoko Yamada and Kyoto Animation feature animation as in A Silent Voice: soft delicate designs, attention to feet, hands and hair, shallow-focus framing and pastel riverside town light.',
      subject:
        'draw people with soft KyoAni designs, large gentle eyes, detailed hair, and expressive small gestures of hands and feet.',
      color: 'Pastel spring palette, soft teal, pink, cream and pale blue water.',
      light: 'Soft diffuse daylight, sparkling bokeh, gentle backlight halos.',
      texture: 'Clean digital cel, shallow depth of field, light leaks and floating petals.',
      camera:
        'Framing on feet and hands, off-center compositions, faces partly cropped, rack focus.',
      mood: 'fragile hopeful reconciliation',
      render: 'Refined Kyoto Animation feature frame with photographic depth.',
      key: 'Naoko Yamada framing; feet and hands; shallow focus; pastel light; KyoAni softness',
    }),
    au('SP05-292', 'Inu-Oh - Historical Glam Punk Performance', {
      look: 'Masaaki Yuasa feature animation as in Inu-Oh: medieval Japan reimagined as a glam rock concert, loose elastic figures, flowing lines and scroll-painting textures under stage lights.',
      subject:
        'draw people with Yuasa elasticity, stretchy limbs, loose simplified faces and flamboyant costumes mixing period robes and rock glamour.',
      color: 'Ink black, vermilion, gold and electric stage colors against dark night.',
      light: 'Concert spotlights, torches and smoke beams over ancient streets.',
      texture: 'Loose brush lines, scroll-paint textures, flat color and drifting smoke.',
      camera: 'Swirling concert crowd shots, elastic distortions, low angles of performers.',
      mood: 'ecstatic rebellious performance',
      render: 'Fluid expressive Science SARU feature frame with loose brush energy.',
      key: 'Yuasa elasticity; medieval glam rock; scroll textures; stage lights; flowing lines',
    }),
    au('SP05-293', 'Tekkonkinkreet - Rough Mythic Density', {
      look: "Taiyo Matsumoto's manga as filmed by Studio 4°C in Tekkonkinkreet: a crooked hand-drawn city of tangled wires, signs and alleys, wobbly lines and lopsided figures leaping between rooftops.",
      subject:
        'draw people with Matsumoto designs, lopsided heads, scratchy wobbly lines, lanky limbs and scruffy street clothes.',
      color: 'Dusty rust, faded teal, warm sunset orange and grimy yellows.',
      light: 'Hazy golden city light, neon at night, soft painted shadows.',
      texture: 'Wobbly pen lines, scratchy hatching, extremely dense painted clutter.',
      camera: 'Fisheye rooftop views, vertiginous falls, crowded street panoramas.',
      mood: 'scrappy mythic tenderness',
      render: 'Dense idiosyncratic hand-drawn feature frame packed with crooked city clutter.',
      key: 'Taiyo Matsumoto wobbly line; crooked dense city; fisheye rooftops; scratchy textures',
    }),
    au('SP05-295', 'Liz and the Blue Bird - Quiet Musical Distance', {
      look: 'Naoko Yamada feature animation as in Liz and the Blue Bird: watercolor-soft pastel frames, extremely thin delicate lines, long lanky stylized designs by Futoshi Nishiya and silence-filled school hallways.',
      subject:
        'draw people with slender elongated limbs, very thin lines, small delicate features and restrained micro gestures of fingers and hair.',
      color: 'Watercolor pastels, pale blue, cream, soft pink and airy white.',
      light: 'Soft window light washed out into haze, delicate light blooms.',
      texture: 'Very thin colored lines, watercolor-like washes, soft focus and bokeh.',
      camera: 'Distant composed frames, feet and hands inserts, long corridors with empty space.',
      mood: 'hushed tender distance',
      render: 'Airy restrained feature frame with watercolor softness and delicate thin lines.',
      key: 'Naoko Yamada restraint; thin delicate lines; watercolor pastel; empty hallways; small gestures',
    }),
    au('SP05-296', 'Metropolis - Humanist Art Deco Retrofuture', {
      look: 'Rintaro feature animation of Osamu Tezuka character designs as in Metropolis: round cartoon Tezuka figures inside monumental art deco skyscrapers and detailed retrofuture machinery.',
      subject:
        'draw people with Tezuka designs, round heads, big simple eyes, bulbous noses and period suits, set against realistic giant architecture.',
      color: 'Warm amber, brass gold, deep teal and sepia jazz-age tones.',
      light: 'Warm glowing city lights, spotlights on towers, dramatic industrial glare.',
      texture: 'Clean cartoon cel figures over painted and CG-built deco architecture.',
      camera: 'Towering vertical city views, tiny figures in vast halls, crane shots.',
      mood: 'humanist retro wonder',
      render: 'Lavish 2001 Madhouse feature frame mixing cartoon and monumental detail.',
      key: 'Tezuka round designs; art deco megacity; retro robots; amber jazz glow',
    }),
    au('SP05-297', 'The Garden of Words - Hyperobserved Rain Intimacy', {
      look: 'Makoto Shinkai feature animation as in The Garden of Words: hyperreal painted gardens in rainy season, every leaf and droplet glistening, maple greens, and quiet pavilions.',
      subject:
        'draw people with delicate Shinkai designs, fine hair, softly shaded faces and simple modern clothes.',
      color: 'Deep emerald, rain grey, jade and soft warm skin light.',
      light: 'Green-filtered rain light, reflections on wet surfaces, glowing sky breaks.',
      texture: 'Hyper-detailed painted leaves, droplets, ripples and reflective stone.',
      camera: 'Macro shots of droplets, framed pavilion shots through foliage, ripples on ponds.',
      mood: 'intimate rainy stillness',
      render: 'Polished Shinkai frame with hyperreal rain detail and glistening foliage.',
      key: 'Shinkai rain garden; emerald foliage; droplets; pavilion; hyperreal detail',
    }),
    au('SP05-071', 'Spirited Away - Warm Liminal Reverie Fantasy', {
      look: 'Hayao Miyazaki and Studio Ghibli feature animation as in Spirited Away: sprawling red-lacquer bathhouse architecture, lantern-lit spirit streets, quiet trains over water and strange gentle spirits.',
      subject:
        'draw people with simple round Ghibli faces, dot-highlight eyes, natural bodies, and spirits as soft odd creatures.',
      color: 'Lacquer red, lantern gold, twilight teal and deep water blue.',
      light: 'Warm lantern glow at dusk, steam haze and calm daylight over water.',
      texture:
        'Hand-painted backgrounds full of architectural detail, clean cel lines and drifting steam.',
      camera: 'Wide architectural establishing shots, quiet waiting moments, long corridors.',
      mood: 'dreamy liminal enchantment',
      render: 'Classic Ghibli hand-drawn feature frame with rich painted detail.',
      key: 'Ghibli bathhouse architecture; lanterns; spirits; steam; round simple faces',
      avoid: [
        'a masked black shadow spirit',
        'a white dragon boy',
        'existing franchise characters',
      ],
    }),
    au('SP05-287', 'Belle - Digital Pop Opera', {
      look: 'Mamoru Hosoda feature animation as in Belle: a vast virtual world of glowing avatars and 3D towers, contrasted with flat shadowless 2D characters in rural Kochi.',
      subject:
        'draw real-world people in flat Hosoda style and virtual avatars in glossy detailed designs, ornate costumes and freckled faces.',
      color: 'Neon pink, electric teal, pearl white and deep digital blue.',
      light: 'Glowing avatar lights, spotlight beams and holographic bloom across the crowds.',
      texture: 'CG virtual architecture, soft 2D cel characters, particle clouds.',
      camera: 'Huge crowd views and soaring camera moves inside the virtual world.',
      mood: 'soaring emotional spectacle',
      render: 'Hybrid 2D and CG Studio Chizu frame with spectacular virtual scale.',
      key: 'Hosoda virtual world; flat characters; glowing avatars; spectacular crowds',
    }),
    au('SP05-300', 'Promare - Hypergraphic Chromatic Action', {
      look: 'Hiroyuki Imaishi and Studio Trigger feature animation as in Promare: flat triangular geometry, neon pink and cyan fire made of polygons, bold color blocking and explosive posing.',
      subject:
        'draw people with Shigeto Koyama designs, sharp angular faces, huge poses, flat color shapes and no gradients.',
      color: 'Neon magenta, cyan, lime and white against flat pastel skies.',
      light: 'Flat graphic color-field light where fire is geometric shapes.',
      texture: 'Flat color blocks, polygonal CG effects, thick clean outlines.',
      camera: 'Wide kinetic poses, exaggerated perspective and spinning action shots.',
      mood: 'explosive hot-blooded spectacle',
      render: 'Crisp stylized Trigger frame, hypergraphic and bold, with no soft gradients.',
      key: 'Imaishi triangles; neon polygonal fire; flat color blocks; explosive poses',
    }),
    au('SP05-072', 'Princess Mononoke - Eco-Mythic Conflict Epic', {
      look: 'Hayao Miyazaki and Studio Ghibli feature animation as in Princess Mononoke: ancient cedar forests painted in deep greens, fierce animal gods, iron-working villages and a raw, violent epic mood.',
      subject:
        'draw people with Ghibli faces made fiercer, natural proportions, practical period clothes, and animals huge and mythic.',
      color: 'Deep forest green, moss, earth brown, iron grey and sunset red.',
      light: 'Dappled forest light, smoky forge glow, sunset fire.',
      texture: 'Hand-painted mossy detail, clean cel characters, smoke and roiling tendrils.',
      camera: 'Vast forest wides, low angles on giant creatures, charging action.',
      mood: 'fierce mythic reverence',
      render: 'Epic hand-drawn 1997 Ghibli frame with dense painted forest detail.',
      key: 'Ghibli ancient forest; animal gods; ironworks; moss; fierce epic',
      avoid: [
        'a red-painted masked wolf girl',
        'a red elk rider with a bow',
        'existing franchise characters',
      ],
    }),
    au('SP05-076', 'Paprika - Cinematic Dream-Collapse Surrealism', {
      look: 'Satoshi Kon feature animation as in Paprika: realistic detective drama that fluidly melts into dream spaces, rooms folding into other rooms, screens and posters becoming doors.',
      subject:
        'draw people with Kon realism, grounded adult faces and suits, then let them slide through surreal transitions.',
      color: 'Vivid dream reds and oranges against muted realistic city palettes.',
      light: 'Film-noir hallway light mixing with glowing dream colors.',
      texture: 'Clean realist cel, painted backgrounds, seamless transition effects.',
      camera: 'Impossible continuous transitions, match cuts through frames within frames.',
      mood: 'dizzying dream surrealism',
      render: 'Lavish 2006 Madhouse feature frame with seamless surreal continuity.',
      key: 'Satoshi Kon transitions; dream within frame; realist faces; vivid dream red',
    }),
    au('SP05-283', 'The Boy and the Heron - Metaphysical Mourning', {
      look: "Hayao Miyazaki's late feature animation as in The Boy and the Heron: painterly wartime countryside and an otherworld of towers, seas and strange birds, with heavier linework and dreamlike stillness.",
      subject:
        'draw people with Miyazaki faces rendered more gravely, detailed hair and period clothes, and birds unsettlingly human.',
      color: 'Deep teal seas, dusk gold, grey-blue fog and flame orange.',
      light: 'Stormy light, glowing sunset, eerie dim otherworld light.',
      texture: 'Rich hand-painted texture, dense line detail and swirling water.',
      camera:
        'Still composed shots with long silences, towers on horizons, strange crowds of birds.',
      mood: 'grave mournful wonder',
      render: 'Late-Ghibli painterly hand-drawn feature frame with heavy textured brushwork.',
      key: 'Late Miyazaki gravity; otherworld towers; strange birds; painterly seas; mourning',
    }),
    au('SP05-294', 'Mind Game - Mutating Psychedelic', {
      look: 'Masaaki Yuasa feature animation as in Mind Game: mixed media collage of photo faces, rough sketches and flat animation, bodies stretching wildly and styles mutating mid-scene.',
      subject:
        'draw people with Yuasa elasticity, rubbery stretched limbs, simplified faces that can suddenly become rough sketches or photo cutouts.',
      color: 'Mutating psychedelic palettes, lava orange, sea green, hot pink and inky black.',
      light: 'Wildly changing colored light with no fixed source.',
      texture: 'Mixed media: rough pencil, flat cel, photo collage and painted textures.',
      camera: 'Warped perspective, runaway zooms, style changes within one frame.',
      mood: 'euphoric psychedelic freedom',
      render: 'Anarchic experimental Studio 4°C frame mixing drawing, paint and photo collage.',
      key: 'Yuasa elasticity; mixed media collage; mutating styles; psychedelic color',
    }),
    au('SP05-298', 'Night Is Short, Walk on Girl - Nocturnal Social Whirl', {
      look: 'Masaaki Yuasa feature animation as in Night Is Short, Walk on Girl: Yusuke Nakamura graphic character designs, flat pastel blocks, bouncy walk cycles and a swirling night Kyoto.',
      subject:
        'draw people with Nakamura designs, simple graphic faces, thin legs, flat pastel clothes and bouncy exaggerated walks.',
      color: 'Pastel red, mint, cream and deep navy night.',
      light: 'Flat lantern and street glow with simple graphic highlights on faces.',
      texture: 'Flat color shapes, simple clean lines and graphic patterns.',
      camera: 'Swirling crowd pans, playful distortions, long walking tracking shots.',
      mood: 'giddy nocturnal whirl',
      render: 'Stylish flat graphic Science SARU frame with bouncy playful motion.',
      key: 'Yuasa bounce; Yusuke Nakamura designs; flat pastel; night Kyoto; whirling crowds',
    }),
    au('SP05-299', 'Paprika - Dream Invasion Carnival', {
      look: 'Satoshi Kon feature animation as in Paprika: the mad dream parade where household objects, dolls, frogs and shrines march through Tokyo streets in a glittering carnival.',
      subject:
        'draw people with Kon realism swept into the parade, and objects animated as characters with detailed realism.',
      color: 'Glittering gold, carnival red, toy colors and night-city blues.',
      light: 'Parade lights, confetti glitter and glowing dream haze.',
      texture: 'Dense detailed cel parade crowds, confetti particles and painted city.',
      camera: 'Endless parade flowing across wide street views, low angles on giant figures.',
      mood: 'euphoric creeping madness',
      render: 'Dense lavish 2006 Madhouse feature frame crowded with parade detail.',
      key: 'Satoshi Kon dream parade; animated household objects; confetti; glittering madness',
    }),
    au('SP05-289', "Angel's Egg - Ascetic Gothic Silence", {
      look: "Mamoru Oshii feature animation with Yoshitaka Amano designs as in Angel's Egg: a drowned gothic city in eternal dusk, fossil shadows, water everywhere and near-monochrome painterly stillness.",
      subject:
        'draw people with Amano elegance, thin delicate faces, long pale hair and heavy robes, moving very slowly.',
      color: 'Near-monochrome blue-grey, deep teal shadow and pale ivory highlights.',
      light: 'Dim dusk light, candle glow, reflections in still water.',
      texture: 'Painterly detailed backgrounds, fine lines, water and stone.',
      camera: 'Long static compositions, extreme silence, figures small in vast ruins.',
      mood: 'austere mystical silence',
      render: 'Sparse painterly 1985 hand-drawn feature frame with meditative stillness.',
      key: 'Oshii silence; Amano designs; drowned gothic city; monochrome dusk; still water',
    }),
  ]),
};

export default spec;
