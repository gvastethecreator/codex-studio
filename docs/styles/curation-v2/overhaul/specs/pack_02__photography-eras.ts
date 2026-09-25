import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'unrequested period wardrobe or props',
  'historical setting added without request',
  'generic stock-photo face',
  'celebrity likeness',
  'readable fake text',
];

// Eras are process modifiers: the subject stays as requested (a modern appliance stays modern);
// the era owns the process, print surface and object edges, never the clothes or scenery.
const era =
  'Keep the prompt subject, action and setting as they are — a modern object stays modern; change only the photographic process, print surface and tonal response of the era, never the clothing, props or scenery.';

function proc(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? era, ...rest } as Dna;
}

const BASE = ['illustration', 'painting', 'cartoon', '3d render', 'digital sharpness', ...AVOID];

const spec: Spec = {
  pack: 'pack_02',
  category: '4. Photography Eras',
  updates: {
    'SP02-046': {
      dna: proc({
        aesthetic:
          'Daguerreotype: a one-of-a-kind image on a mirror-polished silver-plated copper plate, finely detailed and flipping between positive and negative as the viewing angle changes.',
        color_and_tone:
          'Cool silver greys with mirror-dark shadows; a blue, rose and gold tarnish halo creeping in from the plate edges.',
        lighting_and_shadow:
          'Very bright skylight for a long exposure; soft even modeling, luminous highlights.',
        texture_and_material:
          'Mirror sheen, microscopic detail, fine hairline scratches, tarnish bloom and a brass mat edge.',
        camera_and_composition:
          'Keep the requested framing inside a small oval or rounded plate; subjects still enough for a long exposure.',
        atmosphere_and_mood: 'Ghostly and precious, a reflection frozen in polished silver.',
        rendering_and_quality:
          'Silver-plate look with positive-negative ambiguity in the shadows; no paper texture.',
        key_features:
          'mirror silver plate; iridescent tarnish halo; extreme fine detail; brass mat edge; positive-negative shimmer',
      }),
      avoid: [...BASE, 'color', 'paper texture', 'bicycle'],
      briefs: [
        'Daguerreotype of an adult alchemist seated rigidly beside his brass still, mirror-silver plate with a blue and rose tarnish halo creeping from the corners, a brass mat edge. No text or logo.',
        'Daguerreotype of a modern hand-built electric guitar of original design, an asymmetric angular body with a carved wooden top and a single chrome pickup, resting on a stand, rendered in cool silver plate with fine hairline scratches and a tarnish bloom, still clearly a modern instrument. Not a recognizable guitar model; no text or logo.',
        'Daguerreotype of an adult woman holding a barn owl on her gloved hand, both perfectly still, silver highlights and mirror-dark shadows. No text or logo.',
      ],
    },
    'SP02-047': {
      dna: proc({
        aesthetic:
          'Tintype: a collodion positive on a thin black-lacquered iron plate, fast, cheap and made in a portable darkroom.',
        color_and_tone:
          'Creamy olive-grey highlights on a dark brown-black ground; orthochromatic dark reds and pale blues.',
        lighting_and_shadow: 'Hard daylight or skylight, strong falloff at the plate edges.',
        texture_and_material:
          'Black lacquered edges where the collodion stops, pour lines, scratches, rust spots and dents.',
        camera_and_composition:
          'Keep the requested framing; a Petzval lens with a sharp center and soft swirl.',
        atmosphere_and_mood: 'Stoic and raw, a hard-won portrait on a scrap of metal.',
        rendering_and_quality:
          'Iron-plate collodion look on dark metal; not a glass plate and not a paper print.',
        key_features:
          'black iron plate; olive-grey creamy highlights; lacquered edges and pour lines; rust and scratches; Petzval swirl',
      }),
      avoid: [...BASE, 'clean white paper'],
      briefs: [
        'Tintype on a black iron plate of an adult fiddler sitting on a porch step with his instrument, creamy olive-grey highlights, lacquered edges and pour lines, a small rust spot in a corner. No text or logo.',
        'Tintype of an adult in a modern hooded sweatshirt holding a dark smartphone, rendered with orthochromatic tones and Petzval swirl, the modern clothes unchanged. No text or logo.',
        'Tintype of two adult sisters in mourning veils standing side by side, scratched and slightly dented iron plate, strong falloff at the edges. No text or logo.',
      ],
    },
    'SP02-048': {
      dna: proc({
        aesthetic:
          'Autochrome: an early color glass plate whose image is built from a mosaic of dyed potato-starch grains, soft and pointillist.',
        color_and_tone:
          'Soft muted pastels — dusty rose, sage, violet, ochre — grainy color speckle, dim luminous highlights.',
        lighting_and_shadow: 'Bright daylight for long exposures; soft shadows and gentle glow.',
        texture_and_material:
          'Visible starch-grain color speckle, slight softness and dark clumps of grains.',
        camera_and_composition: 'Keep the requested framing; still subjects for the long exposure.',
        atmosphere_and_mood: 'Dreamy and tender, color remembered rather than seen.',
        rendering_and_quality: 'Pointillist color-screen look on glass; no modern saturated color.',
        key_features:
          'starch-grain color mosaic; muted pastel palette; soft pointillist speckle; dim glow; glass plate softness',
      }),
      avoid: [...BASE, 'sharp modern color'],
      briefs: [
        'Autochrome of peonies in a hammered copper bowl on a sunlit table, dusty rose and sage speckled with starch-grain color, soft pointillist glow. No text or logo.',
        'Autochrome of a modern food truck parked in a flowering meadow, its modern shape unchanged but rendered in speckled pastel starch-grain color. No readable signage or logo.',
        'Autochrome of an adult knight in polished dress armor standing in a rose garden, the steel glowing lilac and ochre through the color mosaic. No text or logo.',
      ],
    },
    'SP02-049': {
      dna: proc({
        aesthetic:
          'Projected 1950s Kodachrome slide: mid-century reversal color seen as a lit transparency, with projector glow, slight vignetting and dust on the slide.',
        color_and_tone:
          'Rich reds, deep blues and warm golden highlights; dense blacks; slightly warm projector cast.',
        lighting_and_shadow:
          'Bright sunny daylight in the image; projector hot spot in the center.',
        texture_and_material:
          'Very fine grain, a few dust specks and a hair on the slide, soft corner falloff.',
        camera_and_composition: 'Keep the requested framing; the image glows as projected light.',
        atmosphere_and_mood: 'Sunny and nostalgic, a family slide show on a summer evening.',
        rendering_and_quality:
          'Projected-transparency glow; the stock response itself belongs to Kodachrome 64 in pack_01.',
        key_features:
          'projected slide glow; red and blue dye richness; center hot spot; dust specks on the slide; warm projector cast',
      }),
      avoid: [...BASE, 'faded print', 'digital'],
      briefs: [
        'Projected Kodachrome slide of an adult family picnic by a mountain lake, a red cooler and checked blanket glowing in the projector light, dust specks and a hair on the slide. No text or logo.',
        'Projected Kodachrome slide of a carnival carousel at dusk, painted horses and bulbs in rich reds, a warm projector hot spot in the center. No text or logo.',
        'Projected Kodachrome slide of an adult woman poised on a diving board over a turquoise pool, deep blue sky, soft corner falloff. No text or logo.',
      ],
    },
    'SP02-050': {
      dna: proc({
        aesthetic:
          'Polaroid instant print: the whole physical print, with its square image, wide white frame thicker at the bottom and instant-film chemistry.',
        subject_treatment:
          'Keep the prompt subject, action and setting as they are; present them as the image inside a white-framed instant print, never adding period clothes or props.',
        color_and_tone:
          'Soft creamy color, cyan-green shadows, warm highlights, slightly faded blacks.',
        lighting_and_shadow: 'Built-in flash or bright daylight; close flash falloff.',
        texture_and_material:
          'White plastic frame, developer spread marks along the edges, soft plastic-lens focus.',
        camera_and_composition:
          'Square image centered in a frame with a wider bottom border, shown flat.',
        atmosphere_and_mood: 'Intimate and playful, a moment you can hold in your hand.',
        rendering_and_quality:
          'Physical instant print object; the emulsion look alone belongs to Polaroid 600 in pack_01.',
        key_features:
          'white frame with wide bottom; square image; developer spread marks; cyan-green shadows; close flash',
      }),
      avoid: [...BASE, 'sharp hd', 'readable handwriting on the frame'],
      briefs: [
        'Polaroid instant print of an adult coven of three witches laughing in a cramped kitchen, flash-lit faces, cyan-green shadows, the square image inside a white frame with a wider bottom border. No writing, text or logo.',
        'Polaroid instant print of a birthday cake with sparklers on a picnic table at dusk, developer marks along the image edge, creamy colors. No writing or logo.',
        'Polaroid instant print of a black dog wearing a paper party hat, close flash, soft focus, white frame. No writing or logo.',
      ],
    },
    'SP02-051': {
      dna: proc({
        aesthetic:
          '90s disposable-camera lab print: a 4x6 drugstore print from a single-use camera, with flash, warm lab color and a slightly off exposure.',
        color_and_tone:
          'Warm orange-magenta lab cast, punchy reds, green-tinted shadows, blown flash faces.',
        lighting_and_shadow: 'Built-in flash at night, harsh falloff; or bright hazy daylight.',
        texture_and_material:
          'Visible grain, soft plastic lens, slightly crooked horizon, matte print surface.',
        camera_and_composition: 'Snapshot framing, subjects cut at the edges, horizon tilted.',
        atmosphere_and_mood: 'Carefree and chaotic, the best night of a 90s summer.',
        rendering_and_quality:
          'Drugstore print look with no date stamp; distinct from the modern single-use look in pack_01.',
        key_features:
          'warm lab print cast; flash-blown faces; grain; tilted snapshot framing; matte 4x6 surface',
      }),
      avoid: [...BASE, 'professional lighting', 'date stamp'],
      briefs: [
        '90s disposable-camera print of adult friends crammed in a festival tent, flash-blown faces, warm orange lab cast, a tilted horizon. No date stamp, text or logo.',
        '90s disposable-camera print of adult wedding guests dancing in a barn strung with fairy lights, harsh flash falloff, grainy matte print. No text or logo.',
        '90s disposable-camera print of an adult snowboarder caught mid-fall in a spray of snow, hazy bright daylight, crooked framing. No text or logo.',
      ],
    },
    'SP02-052': {
      dna: proc({
        aesthetic:
          'Holga toy-camera lomography: a plastic 120 camera with a leaky body and a soft plastic lens, often shot on 35 mm so the sprocket holes are exposed.',
        subject_treatment:
          'Keep the prompt subject, action and setting as they are; add only the toy-camera artifacts — leaks, rebate, vignette — never period props.',
        color_and_tone:
          'Oversaturated cross-shifted color, red-orange light leaks, dark heavy corners.',
        lighting_and_shadow: 'Whatever light is there, with orange leaks burning in from one edge.',
        texture_and_material:
          'Exposed sprocket-hole rebate along an edge, soft blur, overlapping frame edges.',
        camera_and_composition:
          'Square-ish frame, heavy vignette, occasional overlap with the neighboring frame.',
        atmosphere_and_mood: 'Spontaneous and experimental, every happy accident gladly embraced.',
        rendering_and_quality:
          'Toy-camera artifacts in the negative; distinct from the Lomo LC-A lens look in pack_01.',
        key_features:
          'red-orange light leaks; exposed sprocket rebate; heavy vignette; plastic-lens blur; overlapping frames',
      }),
      avoid: [...BASE, 'correct color', 'bicycle'],
      briefs: [
        'Holga toy-camera photograph of a painted carousel horse in close-up, a red-orange light leak burning across one side, sprocket holes exposed along the edge, heavy vignette. No text or logo.',
        'Holga photograph of an adult fire-dancer spinning flames on a beach at dusk, soft plastic blur, overlapping frame edge, oversaturated color. No text or logo.',
        'Holga photograph of a crumbling seaside pier with gulls wheeling above it, leaky orange glow in the corner, dark vignette. No text or logo.',
      ],
    },
    'SP02-053': {
      dna: proc({
        aesthetic:
          'Wet plate glass negative: a collodion negative on glass, printed or scanned into a positive, with the chipped edges and pour marks of the plate itself.',
        color_and_tone:
          'Warm neutral monochrome with deep blacks; orthochromatic dark reds and pale skies.',
        lighting_and_shadow: 'Large skylight or daylight, several-second exposures, soft modeling.',
        texture_and_material:
          'Chipped glass corners, silvering at the edges, collodion pour marks, fine cracks and dust.',
        camera_and_composition:
          'Keep the requested framing; a large-format view camera with Petzval falloff.',
        atmosphere_and_mood: 'Documentary and weathered, a record that survived on fragile glass.',
        rendering_and_quality:
          'Glass-negative print look with plate edges visible; distinct from the black-backed ambrotype in pack_01.',
        key_features:
          'glass plate edges; chipped corners and silvering; collodion pour marks; orthochromatic tones; view-camera falloff',
      }),
      avoid: [...BASE, 'clean edges'],
      briefs: [
        'Wet plate glass-negative print of an adult shipbuilding crew posing inside the bare ribs of a wooden hull, chipped plate corners, silvering at the edges, pour marks. No text or logo.',
        'Wet plate glass-negative print of a modern wind turbine on a grassy hill, the turbine unchanged and modern, rendered with orthochromatic tones and fine cracks in the glass. No text or logo.',
        'Wet plate glass-negative print of an adult circus strongwoman holding a barbell overhead, dust and a hairline crack across the plate. No text or logo.',
      ],
    },
    'SP02-054': {
      dna: proc({
        aesthetic:
          'Aerochrome color infrared: a false-color reversal film where healthy foliage turns red and magenta and skies go deep cyan-blue.',
        color_and_tone:
          'Hot pink, crimson and magenta vegetation, deep teal sky and water, pale yellow skin.',
        lighting_and_shadow:
          'Bright sunlight with a yellow filter; glowing infrared-reflective foliage.',
        texture_and_material:
          'Fine grain, slightly soft infrared focus, white bloom on the brightest leaves.',
        camera_and_composition:
          'Keep the requested framing; vegetation or sky visible where possible.',
        atmosphere_and_mood: 'Psychedelic and uncanny, the familiar world recolored.',
        rendering_and_quality:
          'False-color film look; the black-and-white infrared belongs to pack_01.',
        key_features:
          'magenta and red foliage; deep cyan sky; pale yellow skin; infrared bloom; false-color reversal',
      }),
      avoid: [...BASE, 'natural green foliage'],
      briefs: [
        'Aerochrome color infrared photograph of a river valley crossed by an old stone bridge, the forests blazing magenta and crimson, the water deep teal. No text or logo.',
        'Aerochrome photograph of an adult hiker in a green jacket in a summer meadow, the jacket and grass turned hot pink, the sky deep cyan. No text or logo.',
        'Aerochrome photograph of a desert palm oasis, the palms glowing red against a teal sky and a pale yellow dune. No text or logo.',
      ],
    },
    'SP02-055': {
      dna: proc({
        aesthetic:
          'Cyanotype photographic print: an iron-salt print exposed by sunlight under a negative, giving a Prussian-blue image on watercolor paper.',
        color_and_tone: 'Prussian blue shadows to paper-white highlights, no other color.',
        lighting_and_shadow:
          'The original scene light translated into blue values; soft highlight edges.',
        texture_and_material: 'Watercolor paper tooth, brushed coating edges, slight uneven wash.',
        camera_and_composition:
          'Keep the requested framing; brushed coating visible at the margins.',
        atmosphere_and_mood: 'Cool and contemplative, a blue memory printed by the sun.',
        rendering_and_quality:
          'Contact-print photographic cyanotype, not a botanical photogram or blueprint.',
        key_features:
          'Prussian blue monochrome; watercolor paper tooth; brushed coating edges; sun-printed tones; white highlights',
      }),
      avoid: [...BASE, 'color', 'bicycle wheel'],
      briefs: [
        'Cyanotype print of an adult swimmer diving into a flooded quarry, the water and cliffs in Prussian blue, her body a pale arc, brushed coating edges on watercolor paper. No text or logo.',
        'Cyanotype print of a grey heron standing still in reeds, blue values from deep shadow to paper white, uneven wash at the margins. No text or logo.',
        'Cyanotype print of a modern skyscraper under construction with a tower crane, the steel frame crisp in blue on textured paper. No text or logo.',
      ],
    },
    'SP02-056': {
      dna: proc({
        aesthetic:
          'Early digital compact camera: a 2–3 megapixel point-and-shoot from the early 2000s with a tiny sensor, harsh flash and heavy JPEG compression.',
        color_and_tone:
          'Cool or yellowish white balance errors, clipped highlights, noisy muddy shadows.',
        lighting_and_shadow:
          'Harsh on-camera flash at night, flat bright subjects, black backgrounds.',
        texture_and_material:
          'JPEG block artifacts, purple fringing on bright edges, oversharpening halos.',
        camera_and_composition: 'Snapshot framing, deep focus, subjects centered, slight red-eye.',
        atmosphere_and_mood: 'Awkward and nostalgic, the early days of posting everything.',
        rendering_and_quality: 'Low-resolution digital compact look with no readable date overlay.',
        key_features:
          'tiny-sensor noise; harsh on-camera flash; JPEG blocks; purple fringing; clipped highlights',
      }),
      avoid: [...BASE, 'film grain', 'readable date overlay', 'bus'],
      briefs: [
        'Early digital compact photo of adult friends at a karaoke bar belting into microphones, harsh flash, red-eye, JPEG blocks in the dark booth behind. No readable screen, text or logo.',
        'Early digital compact photo of a snowy courtyard at night under a single streetlamp, noisy muddy shadows and purple fringing on the lamp. No text or logo.',
        'Early digital compact photo of an adult in homemade cardboard knight armor at a crowded fan convention, flash-flattened, clipped highlights. No text or logo.',
      ],
    },
    'SP02-057': {
      dna: proc({
        aesthetic:
          "Paper-negative pinhole print: a box camera with a pinhole exposing photographic paper, contact-printed into a positive with the paper negative's texture.",
        color_and_tone: 'Warm sepia or neutral grey, soft low contrast, dark corners.',
        lighting_and_shadow: 'Long daylight exposure; moving things ghosted or missing.',
        texture_and_material:
          'Paper fiber pattern printed through, uniform softness, curved-plane stretching.',
        camera_and_composition:
          'Keep the requested framing; wide stretched edges from a curved paper plane.',
        atmosphere_and_mood: 'Quiet and handmade, a slow image from a box and a needle hole.',
        rendering_and_quality:
          'Contact-printed paper-negative look; distinct from the modern long-exposure pinhole in pack_01.',
        key_features:
          'paper-negative fiber texture; uniform pinhole softness; curved-plane stretch; dark corners; ghosted motion',
      }),
      avoid: [...BASE, 'sharp focus'],
      briefs: [
        'Paper-negative pinhole print of an old stone chapel on a hill, uniform softness, paper fibers printed through the sky, stretched edges and dark corners, warm sepia. No text or logo.',
        'Paper-negative pinhole print of an adult sitting perfectly still on a garden bench while a cat that walked past has become a faint ghost. No text or logo.',
        'Paper-negative pinhole print of a sunflower field under a wide sky, the curved paper plane bending the horizon. No text or logo.',
      ],
    },
    'SP02-129': {
      briefs: [
        'Silver-plate tonality photograph of a modern cordless espresso grinder of original, unbranded design on a marble kitchen counter beside a steel kettle, the modern appliances unchanged, cool silver tones and mirror-dark shadows, no period props. Not a recognizable product; no text or logo.',
        'Silver-plate tonality photograph of a modern running shoe resting on a wooden bench, fine silver detail in the mesh, no historical staging. No text or logo.',
        'Silver-plate tonality photograph of a houseplant in a concrete pot beside a tall window, soft silver gradations, a modern interior kept modern. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Salt Print Calotype',
      domain: 'calotype paper negative process',
      tags: ['salt-print', 'calotype', '1840s'],
      dna: proc({
        aesthetic:
          'Salt print from a calotype: an 1840s paper negative printed on salted paper, soft and fibrous, with warm matte tones sunk into the paper.',
        color_and_tone:
          'Warm reddish-brown to lavender-purple tones, low contrast, creamy paper highlights.',
        lighting_and_shadow:
          'Bright daylight softened by the paper negative; broad masses of light and shade.',
        texture_and_material: 'Paper fibers printed through the image, matte surface, soft edges.',
        camera_and_composition:
          'Keep the requested framing; broad simple masses rather than fine detail.',
        atmosphere_and_mood: 'Soft and painterly, an early photograph still halfway to a drawing.',
        rendering_and_quality:
          'Matte salted-paper print; not glossy albumen and not a metal plate.',
        key_features:
          'paper-negative fiber texture; warm brown-lavender tones; matte salted paper; soft broad masses; low contrast',
      }),
      avoid: [...BASE, 'glossy surface', 'crisp fine detail'],
      briefs: [
        'Salt print from a calotype of an adult fisherwoman mending nets on a harbor wall, warm brown and lavender tones, paper fibers printed through the sky, broad soft masses. No text or logo.',
        'Salt print of an ancient oak beside a thatched cottage, soft fibrous shadows, creamy matte highlights. No text or logo.',
        'Salt print of a modern takeaway coffee cup on a café table, the modern cup unchanged, rendered in warm lavender-brown on matte salted paper. No readable labels or logo.',
      ],
    },
    {
      name: 'Albumen Carte de Visite',
      domain: 'albumen card portrait',
      tags: ['albumen', 'carte-de-visite', '1860s'],
      dna: proc({
        aesthetic:
          'Albumen carte de visite: an 1860s small card portrait printed on egg-white-coated paper and mounted on a card, with a painted studio backdrop.',
        subject_treatment:
          'Keep the prompt subject and action as they are; present them as a mounted albumen card print, posing still, without changing their clothes or adding period props.',
        color_and_tone:
          'Glossy sepia-purple to warm brown, yellowed highlights, slight fading at the edges.',
        lighting_and_shadow: 'Soft skylight from a studio glass roof, gentle modeling.',
        texture_and_material:
          'Fine albumen gloss, tiny surface cracks, rounded card corners, foxing spots.',
        camera_and_composition:
          'Full-length or three-quarter figure before a painted balustrade or drapery backdrop, small format card.',
        atmosphere_and_mood: 'Formal and charming, a calling card meant to be traded.',
        rendering_and_quality: 'Glossy albumen card look; not a salt print and not a tintype.',
        key_features:
          'glossy sepia-purple albumen; mounted card with rounded corners; painted studio backdrop; foxing; formal pose',
      }),
      avoid: [...BASE, 'matte paper', 'readable studio imprint'],
      briefs: [
        'Albumen carte de visite of an adult man posed stiffly beside a painted stone balustrade backdrop with a pet raccoon on his shoulder, glossy sepia-purple tones, rounded card corners, foxing spots. No imprint text or logo.',
        'Albumen carte de visite of an adult juggler holding three clubs before a painted drapery backdrop, fine surface cracks in the gloss. No imprint text or logo.',
        'Albumen carte de visite of a modern delivery courier in a high-visibility jacket holding a parcel, posed full length before a painted garden backdrop, clothes unchanged. No imprint text or logo.',
      ],
    },
    {
      name: 'Pictorialist Platinum Print',
      domain: 'pictorialist platinum printing',
      tags: ['pictorialism', 'platinum-print', '1900s'],
      dna: proc({
        aesthetic:
          'Pictorialist platinum print: an early-1900s art photograph made with a soft-focus lens and printed in platinum on matte paper to look like a painting.',
        color_and_tone:
          'Long, delicate scale of warm silver greys, velvety blacks, no harsh whites.',
        lighting_and_shadow:
          'Mist, backlight and diffuse window light; glowing halated highlights.',
        texture_and_material:
          'Matte paper absorbing the image, soft-focus bloom around every edge.',
        camera_and_composition:
          'Keep the requested framing; asymmetric painterly composition with atmosphere.',
        atmosphere_and_mood: 'Poetic and hushed, the world softened into a reverie.',
        rendering_and_quality:
          'Platinum-print tonality with soft-focus glow; not crisp documentary.',
        key_features:
          'soft-focus bloom; long warm grey scale; matte platinum paper; misty backlight; painterly composition',
      }),
      avoid: [...BASE, 'crisp documentary sharpness', 'high contrast'],
      briefs: [
        'Pictorialist platinum print of an adult woman in white walking into misty woods holding a small lantern, soft-focus bloom around the light, long warm grey scale. No text or logo.',
        'Pictorialist platinum print of a small sailboat drifting in morning haze, the sail glowing, the water dissolving into velvet grey. No text or logo.',
        'Pictorialist platinum print of a modern glass skyscraper softened by fog, its modern grid still visible beneath the halated glow. No text or logo.',
      ],
    },
    {
      name: 'Hand-Colored Lantern Slide',
      domain: 'hand-tinted glass lantern slide',
      tags: ['lantern-slide', 'hand-colored', '1910s'],
      dna: proc({
        aesthetic:
          'Hand-colored lantern slide: a black-and-white positive on glass tinted by hand with transparent dyes and projected by a magic lantern.',
        color_and_tone:
          'Monochrome base with delicate transparent washes — sky blue, rose, leaf green, amber — that do not quite follow the edges.',
        lighting_and_shadow: 'Projected glow through the glass, bright center and soft falloff.',
        texture_and_material:
          'Dye pooling, slightly misaligned tints, glass cover plate, a round or arched mask.',
        camera_and_composition:
          'Keep the requested framing inside a rounded mask shape, lit from behind.',
        atmosphere_and_mood: 'Wondrous and old-fashioned, a travel lecture in a darkened hall.',
        rendering_and_quality: 'Hand-tinted projected glass look; not modern color photography.',
        key_features:
          'hand-tinted transparent dyes; monochrome base; projected glow; rounded mask; tints slipping past edges',
      }),
      avoid: [...BASE, 'full modern color', 'readable caption'],
      briefs: [
        'Hand-colored lantern slide of a volcano erupting over a bay, the smoke tinted rose and amber, the sea washed in pale blue that slips past the shoreline, rounded mask, projected glow. No caption, text or logo.',
        'Hand-colored lantern slide of an adult polar explorer with a team of sled dogs on pack ice, the sky tinted soft blue, the dogs amber. No caption, text or logo.',
        'Hand-colored lantern slide of a canal city with gondolas under arched bridges, green-tinted water and rose façades, dye pooling at the edges. No caption, text or logo.',
      ],
    },
    {
      name: 'Mammoth Plate Landscape',
      domain: 'mammoth plate landscape photography',
      tags: ['mammoth-plate', 'landscape', '1870s'],
      dna: proc({
        aesthetic:
          'Mammoth plate landscape: 1870s survey photographs on enormous glass negatives, extraordinarily detailed, with skies burned to blank white by blue-sensitive emulsion.',
        color_and_tone: 'Warm brown albumen tones, detailed land, featureless white sky.',
        lighting_and_shadow: 'Hard clear daylight; long exposures smoothing moving water.',
        texture_and_material:
          'Extreme detail in rock, trees and structures; water turned to soft mist.',
        camera_and_composition:
          'Keep the requested framing; grand wide views from a high vantage, perfectly level horizon.',
        atmosphere_and_mood: 'Monumental and silent, a new land measured on glass.',
        rendering_and_quality:
          'Large-plate albumen print with blank skies; not a modern HDR landscape.',
        key_features:
          'blank white sky; extreme land detail; warm albumen browns; misted moving water; high vantage survey view',
      }),
      avoid: [...BASE, 'dramatic clouds', 'saturated color'],
      briefs: [
        'Mammoth plate landscape of a granite valley with a tall waterfall turned to soft mist by the long exposure, every tree resolved, the sky a blank white, warm albumen browns. No text or logo.',
        'Mammoth plate landscape of a wooden railway trestle spanning a deep canyon, extreme detail in the timbers, featureless white sky. No text or logo.',
        'Mammoth plate landscape of a modern highway interchange seen from a hill, the concrete loops unchanged and modern, rendered in albumen brown with a blank white sky. No text or logo.',
      ],
    },
    {
      name: '1970s Faded Color Print',
      domain: 'faded 1970s chromogenic print',
      tags: ['faded-print', 'chromogenic', '1970s'],
      dna: proc({
        aesthetic:
          '1970s faded color print: a family snapshot on chromogenic paper whose cyan dye has faded, leaving a warm magenta-orange cast.',
        color_and_tone:
          'Magenta and orange dominance, weak cyan, washed-out skies, yellowed whites.',
        lighting_and_shadow: 'Sunny daylight or flash; shadows lifted and slightly brownish.',
        texture_and_material: 'Satin print surface, soft grain, slight fading at the edges.',
        camera_and_composition:
          'Keep the requested framing with a casual, slightly off-center family snapshot composition.',
        atmosphere_and_mood: 'Warm and bittersweet, a summer kept in an old album.',
        rendering_and_quality: 'Dye-fading in the print; not an overall sepia filter.',
        key_features:
          'faded cyan dye; magenta-orange cast; yellowed whites; satin print surface; snapshot framing',
      }),
      avoid: [...BASE, 'neutral balanced color'],
      briefs: [
        '1970s faded color print of an adult family posing in front of a camper van at a lakeside campsite, magenta-orange cast, washed-out sky, yellowed whites. No text or logo.',
        '1970s faded color print of a backyard swimming pool party with adults on inflatable rings, weak cyan in the water, warm satin print. No text or logo.',
        '1970s faded color print of an adult man with a big mustache proudly holding up a trout on a riverbank, lifted brownish shadows. No text or logo.',
      ],
    },
    {
      name: '1980s Pocket Instamatic',
      domain: '110 pocket camera snapshot',
      tags: ['110-film', 'instamatic', '1980s'],
      dna: proc({
        aesthetic:
          '1980s pocket Instamatic: a tiny 110 negative enlarged into a small grainy print, with a flash bar and fixed-focus lens.',
        color_and_tone:
          'Saturated but slightly muddy color, warm skin, cool shadows, glossy print.',
        lighting_and_shadow: 'Flash bar at close range, bright center, dark falloff.',
        texture_and_material:
          'Heavy grain from the tiny negative, soft overall focus, glossy surface.',
        camera_and_composition:
          'Keep the requested framing; subjects centered and a little too far away.',
        atmosphere_and_mood: 'Everyday and affectionate, a small memory in a shoebox.',
        rendering_and_quality: 'Tiny-negative enlargement look; softer than 35 mm film.',
        key_features:
          'heavy 110 grain; soft fixed focus; flash bar hot center; saturated muddy color; glossy small print',
      }),
      avoid: [...BASE, 'sharp detail'],
      briefs: [
        '1980s pocket Instamatic snapshot of adult friends in knee pads at a roller rink, flash-bar hot center, heavy grain, saturated muddy color. No readable signs or logo.',
        '1980s pocket Instamatic snapshot of an adult posing proudly beside a huge lopsided snowman in a backyard, soft fixed focus, glossy print. No text or logo.',
        '1980s pocket Instamatic snapshot of a wood-paneled living room with a plaid sofa and a sleeping dog, flash falloff into dark corners. No text or logo.',
      ],
    },
  ],
};

export default spec;
