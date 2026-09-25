import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Bio, myco and body punks (part B): ten more living-system punks. No gore.
const AVOID = [...STYLE_AVOID, 'gore', 'graphic wounds', 'real brand or company logo'];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({ name, domain, tags: [tag, 'punk', 'bio'], dna: dna(fields), avoid: AVOID, briefs });

const spec: Spec = {
  pack: 'pack_15',
  category: '4. Bio, Myco & Body Punks',
  updates: {},
  creates: [
    punk(
      'Brewpunk',
      'fermentation culture punk',
      'brewpunk',
      {
        aesthetic:
          'Brewpunk: fermentation as technology and religion, with bubbling vats, living yeast cultures, copper stills and cellar laboratories.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with fermenting vats, bubbling jars, copper pipes and living cultures.",
        color_and_tone: 'Amber, honey gold and copper with cloudy cream foam and cellar shadow.',
        lighting_and_shadow:
          'Warm lamps glowing through amber liquids and bubbles in dark cellars.',
        texture_and_material:
          'Copper stills, oak barrels, glass carboys, foam, steam and wet stone.',
        camera_and_composition: 'Cellar interiors packed with vats and glowing glass vessels.',
        atmosphere_and_mood: 'Bubbling and convivial, a slow alchemy of patience, sugar and time.',
        rendering_and_quality: 'Warm glowing illustration with rich liquid and copper detail.',
        key_features: 'bubbling vats; copper stills; glowing amber jars; living cultures',
      },
      [
        'Monks in a mountain monastery tend a colossal living sourdough starter that has grown into a breathing dome filling the whole cellar, its bubbles slowly rising through the floor of the chapel above. No readable text or logo.',
        'A brewmaster in a leather apron tries to calm a fermenting barrel that has started singing loudly in the middle of the night, the whole village awake at their windows. No readable text or logo.',
        'In a candlelit cellar a single forgotten jar of fermenting plums glows gold among rows of dusty empty ones, and an old cellar keeper kneels before it as if it were a shrine. No readable text or logo.',
      ],
    ),
    punk(
      'Bioprintpunk',
      'bioprinting workshop punk',
      'bioprint',
      {
        aesthetic:
          'Bioprintpunk: backstreet workshops that print living things, from leaves and flowers to new skin and strange pets, layer by layer from glowing gel.',
        subject_treatment:
          "Keep the prompt's subject and setting; show living material being printed layer by layer by nozzles over translucent gel.",
        color_and_tone: 'Clinical white and cool blue with translucent pink and green living gels.',
        lighting_and_shadow: 'Soft lab light and glowing gel beds lit from underneath.',
        texture_and_material:
          'Translucent gel layers, printer nozzles, glass trays and delicate tissue lattices.',
        camera_and_composition:
          'Close views of printer heads mid-print and workshop views of many printers.',
        atmosphere_and_mood: 'Curious and slightly uneasy, creation made cheap and handmade.',
        rendering_and_quality: 'Clean luminous illustration with delicate layered printing detail.',
        key_features: 'layered printing; translucent gel; printer nozzles; living lattices',
      },
      [
        'A street vendor bioprints custom glowing flowers for lovers at a night market, the petals rising layer by layer from translucent gel while a crowd watches a rose bloom from nothing. No readable text or logo.',
        'A bioprinter malfunction produces a perfect living copy of the shop cat, and now the two identical cats sit at opposite ends of the cluttered workbench refusing to acknowledge each other. No readable text or logo.',
        'An old woman waits alone in a quiet backstreet clinic while a humming printer slowly builds one new green leaf, layer by translucent layer, for the dying houseplant cradled in her lap. No readable text or logo.',
      ],
    ),
    punk(
      'Regenpunk',
      'regeneration biology punk',
      'regenpunk',
      {
        aesthetic:
          'Regenpunk: a culture built on regeneration, where limbs regrow like salamanders, ruins heal like tissue and scars bloom into flowers.',
        subject_treatment:
          "Keep the prompt's subject and setting; show something broken healing and regrowing in real time, without gore.",
        color_and_tone: 'Soft pink, living green and pearl white over weathered and broken greys.',
        lighting_and_shadow: 'Gentle glow from healing areas and soft morning light.',
        texture_and_material:
          'Budding growth, soft new tissue drawn like petals, cracked stone and moss.',
        camera_and_composition:
          'Close views of healing surfaces and wide views of ruins regrowing.',
        atmosphere_and_mood: 'Hopeful and uncanny, damage that simply refuses to stay damage.',
        rendering_and_quality: 'Soft organic illustration with delicate glowing growth detail.',
        key_features: 'regrowth; healing ruins; blooming scars; salamander logic',
      },
      [
        'A bombed bridge slowly regrows itself overnight like living bone, stone knitting together in glowing pink seams while villagers on both banks wait with lanterns to cross for the first time in years. No readable text or logo.',
        'A clumsy salamander-blooded knight keeps losing fingers in sword practice and growing them back slightly different each time, now proudly showing his instructor a hand with one extra thumb. No readable text or logo.',
        "An old scar across a retired soldier's forearm quietly blooms into a line of tiny white flowers as he sits alone in a spring meadow beside his rusting, moss-covered helmet. No readable text or logo.",
      ],
    ),
    punk(
      'Silkspinnerpunk',
      'spider silk technology punk',
      'silkspinner',
      {
        aesthetic:
          'Silkspinnerpunk: a civilization woven from spider silk, with silk bridges, glistening dew-lit webs, silk sails and spinner guilds farming giant spiders.',
        subject_treatment:
          "Keep the prompt's subject and setting; weave it into glistening silk webs, cables and fabrics spun by spiders.",
        color_and_tone: 'Silver-white silk glinting against forest greens and dawn gold.',
        lighting_and_shadow: 'Backlit dawn light making silk threads and dew drops glow.',
        texture_and_material:
          'Fine silk threads, dew beads, woven silk cloth and spider-spun cables.',
        camera_and_composition: 'Webs spanning huge gaps with tiny figures crossing them.',
        atmosphere_and_mood: 'Delicate and daring, strength hidden in threads finer than hair.',
        rendering_and_quality: 'Luminous fine-line illustration with glinting silk and dew.',
        key_features: 'silk bridges; dew-lit webs; spinner guilds; glinting threads',
      },
      [
        'A caravan crosses a mountain gorge on a bridge of spider silk spun overnight by a guild of giant spiders, dew drops glinting like pearls on every cable as the sun rises behind them. No readable text or logo.',
        'A tailor spider the size of a wardrobe knits a shimmering silk wedding dress directly onto a nervous bride, who stands perfectly still on a stool trying very hard not to scream. No readable text or logo.',
        'A single glinting silk thread stretches from a high tower window all the way up to the full moon on a still night, and a small figure has just begun to climb it. No readable text or logo.',
      ],
    ),
    punk(
      'Parasitepunk',
      'benign parasite punk',
      'parasitepunk',
      {
        aesthetic:
          'Parasitepunk: strange organisms that ride their hosts, from clever hitchhiker creatures to crowns of living growth, shown as eerie partnerships rather than horror.',
        subject_treatment:
          "Keep the prompt's subject and setting; attach a strange hitchhiking organism to it that changes how it looks or behaves, without gore.",
        color_and_tone:
          'Pale skin and grey tones with sickly green, violet and orange organism accents.',
        lighting_and_shadow: 'Dim light with the organisms glowing faintly in dark places.',
        texture_and_material:
          'Glossy tendrils, soft growths, crowns of fungus-like forms and pale fabric.',
        camera_and_composition:
          'Close portraits of host and passenger, and crowds where many carry organisms.',
        atmosphere_and_mood:
          'Eerie and fascinating, the unsettling question of who is really in control.',
        rendering_and_quality:
          'Detailed eerie illustration with glossy organic forms and restraint.',
        key_features: 'hitchhiker organisms; glowing growths; host partnerships; eerie calm',
      },
      [
        'At a masked ball, every aristocrat wears a crown of glowing violet growth that sways in time with the music, and one servant realizes the crowns are the ones dancing. No readable text or logo.',
        "A very polite snail-like hitchhiker living on a lost hiker's backpack points confidently in the wrong direction with its eyestalks, leading them deeper into a tangled misty forest. No readable text or logo.",
        'A lone deer steps through a silent misty forest wearing a faintly glowing orange fungus crown between its antlers, and every other animal in the clearing bows its head as it passes. No readable text or logo.',
      ],
    ),
    punk(
      'Cellpunk',
      'cellular scale punk',
      'cellpunk',
      {
        aesthetic:
          'Cellpunk: worlds shown at cellular scale, with membrane cities, organelle machinery and tiny travelers moving through living tissue landscapes.',
        subject_treatment:
          "Keep the prompt's subject and setting; shrink it to cellular scale, among membranes, organelles and flowing plasma.",
        color_and_tone: 'Translucent pinks, blues and greens like a stained microscope slide.',
        lighting_and_shadow:
          'Soft transmitted light as if seen through a microscope, glowing membranes.',
        texture_and_material:
          'Translucent membranes, floating organelles, vesicles and fluid currents.',
        camera_and_composition:
          'Round microscope-like fields and vast cell landscapes with tiny figures.',
        atmosphere_and_mood: 'Wondrous and alien, an ocean of life hidden inside a single drop.',
        rendering_and_quality:
          'Luminous translucent illustration with fine, scientific-looking membrane and organelle detail.',
        key_features: 'membrane cities; organelle machines; microscope glow; tiny travelers',
      },
      [
        'A tiny submarine crew navigates through a translucent living cell like an alien city, passing glowing organelle towers while a vast membrane gate opens ahead of them. No readable text or logo.',
        'A single red blood cell hired as a courier looks deeply overworked in the rush-hour current of a vein, carrying a bubble of oxygen while white cells cut in front of it. No readable text or logo.',
        'Inside a quiet living cell at night, the nucleus glows like a lone lantern in an empty cathedral of membranes, a few tiny organelles drifting past like sleepy moths. No readable text or logo.',
      ],
    ),
    punk(
      'Venompunk',
      'venom and toxin craft punk',
      'venompunk',
      {
        aesthetic:
          'Venompunk: a culture of snake handlers, venom distillers and antidote alchemists, with glass fangs, milking tables and jewel-bright toxin vials.',
        subject_treatment:
          "Keep the prompt's subject and setting; add venomous creatures, glass vials and careful handling gear around it.",
        color_and_tone:
          'Jewel greens, poison violet and amber vials against dark wood and black glass.',
        lighting_and_shadow: 'Lamplight through colored vials casting jewel-toned glows on skin.',
        texture_and_material:
          'Snake scales, glass vials, leather gloves, brass tongs and dark wood.',
        camera_and_composition:
          'Close views of careful hands with creatures and shelves of glowing vials.',
        atmosphere_and_mood: 'Tense and elegant, danger handled with total calm and precision.',
        rendering_and_quality: 'Rich jewel-toned illustration with precise scale and glass detail.',
        key_features: 'venomous creatures; jewel vials; handling tools; lamplight glow',
      },
      [
        'A venom alchemist milks a giant cobra coiled around her workbench, its hood spread over the lamp as drops of glowing violet fall into a crystal vial in a room full of sleeping snakes. No readable text or logo.',
        'A nervous apprentice sneezes in the middle of a scorpion-handling lesson, and every student, teacher and dozen glossy scorpions on the long table freezes at exactly the same moment. No readable text or logo.',
        'A single green antidote vial glows on a bedside table beside a sleeping snake handler at dawn, the coiled viper that bit her curled guiltily on the windowsill watching over her. No readable text or logo.',
      ],
    ),
    punk(
      'Glowpunk',
      'bioluminescence punk',
      'glowpunk',
      {
        aesthetic:
          'Glowpunk: a world lit by living light, with bioluminescent streetlights, glowing tattoos of algae, jellyfish lanterns and mushroom-lit homes.',
        subject_treatment:
          "Keep the prompt's subject and setting; light it only with living bioluminescence from creatures, plants and fungi.",
        color_and_tone: 'Deep night blues and blacks with cyan, green and magenta living glows.',
        lighting_and_shadow:
          'Soft bioluminescent glows as the only light, pools of color in darkness.',
        texture_and_material:
          'Glowing jellyfish, fungi, algae, fireflies and glass jars of living light.',
        camera_and_composition:
          'Dark scenes where glowing organisms outline the shapes of everything.',
        atmosphere_and_mood: 'Magical and quiet, a night that is never truly dark.',
        rendering_and_quality: 'Luminous low-key illustration with soft living light glows.',
        key_features: 'living light; jellyfish lanterns; glowing fungi; dark night',
      },
      [
        'A seaside town hangs jellyfish lanterns along its streets for the festival of lights, and a whole shoal of glowing fish swims up into the air to join the parade. No readable text or logo.',
        'A frantic firefly farmer in a nightgown chases a huge swarm of escaped fireflies across a midnight meadow with an empty jar, the glowing cloud forming a mocking face above him. No readable text or logo.',
        'A child reads a thick book under a blanket fort by the soft green light of a single glowing mushroom in a jar, the shadows of paper animals dancing on the fabric walls. No readable text or logo.',
      ],
    ),
    punk(
      'Inkbodypunk',
      'living tattoo punk',
      'inkbody',
      {
        aesthetic:
          'Inkbodypunk: living tattoos that move across the skin, crawl off arms, fight, dance and tell stories in bold ink.',
        subject_treatment:
          "Keep the prompt's subject and setting; cover the skin of its figures with bold tattoos that move, escape or come alive.",
        color_and_tone:
          'Bold black ink and traditional tattoo reds, greens and yellows on warm skin tones.',
        lighting_and_shadow:
          'Warm parlor lamps and soft light on skin, ink shapes casting small shadows as they lift off.',
        texture_and_material: 'Skin, bold ink linework, needles and parlor leather chairs.',
        camera_and_composition: 'Close views of tattooed skin with designs mid-movement.',
        atmosphere_and_mood:
          'Rebellious and magical, stories that refuse to stay still on the body.',
        rendering_and_quality: 'Bold illustration with crisp tattoo linework and warm skin.',
        key_features: 'moving tattoos; ink creatures escaping; parlor light; bold lines',
      },
      [
        "A sailor's tattooed kraken crawls off his arm and wrestles the tattooed ship on his chest in the middle of a harbor tavern brawl, ink tentacles spilling across the table. No readable text or logo.",
        "A tattoo artist's freshly inked swallow tears free from a customer's shoulder mid-session and flies out the parlor window, the artist still holding the buzzing needle in disbelief. No readable text or logo.",
        "An old sailor's faded tattoos slowly rearrange themselves into a treasure map across her arms and back as she sleeps by a crackling fire, her cat watching the ink crawl. No readable text or logo.",
      ],
    ),
    punk(
      'Prosthetic Craftpunk',
      'handmade prosthetics punk',
      'prosthetic-craft',
      {
        aesthetic:
          'Prosthetic craftpunk: artisans building beautiful handmade limbs from carved wood, brass, porcelain and leather, each one a personal work of art.',
        subject_treatment:
          "Keep the prompt's subject and setting; give its figures handcrafted prosthetic limbs of wood, brass or porcelain with visible joinery.",
        color_and_tone: 'Warm wood browns, brass gold and porcelain white with deep leather reds.',
        lighting_and_shadow: 'Workshop window light glinting on brass joints and polished wood.',
        texture_and_material:
          'Carved wood, brass hinges, porcelain plates, leather straps and fine tools.',
        camera_and_composition: 'Workshop scenes and portraits with the crafted limb as the focus.',
        atmosphere_and_mood:
          'Proud and tender, bodies rebuilt as works of art rather than repairs.',
        rendering_and_quality:
          'Richly detailed craft illustration with precise joinery and polished wood and brass surfaces.',
        key_features: 'carved wooden limbs; brass hinges; porcelain plates; artisan workshop',
      },
      [
        'A violinist with a carved wooden arm inlaid with mother-of-pearl performs a concerto in a candlelit hall, the craftsman who made it weeping in the front row. No readable text or logo.',
        "A proud child shows off her new brass leg that unfolds into a telescope on a crowded school playground, spying on the teachers' lounge while jealous classmates line up for a turn. No readable text or logo.",
        'On a workbench in a quiet dusty workshop lies an unfinished porcelain hand, one fingertip already painted with a tiny blue flower, the craftsman asleep in his chair beside it. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
