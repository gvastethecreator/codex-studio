import type { Spec } from '../tools/apply';
import { design } from './_design';

// Editorial & publication design (part A): R-EDT-01..10. Titles and supplied text stay exact; no invented
// quotes, authors or data.
const E = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
) => design(name, domain, tag, 'editorial', fields, avoid, briefs, { text: true, source });

const FAKE = 'invented quotes, authors or data';

const spec: Spec = {
  pack: 'pack_25',
  category: '11. Editorial & Publication Design',
  newCategory: { id: 'editorial-and-publication-design' },
  updates: {},
  creates: [
    E(
      'R-EDT-01',
      'Marginal Archive Layout',
      'annotated margin page layout',
      'marginal-archive',
      {
        aesthetic:
          'Marginal Archive Layout: notes, indexes and references fill ranked margins around one stable main text block, like a well-annotated archive.',
        subject_treatment:
          "Lay out the prompt's pages with a stable main text and ranked margin notes tied to clear anchors, every title and supplied word kept exact.",
        color_and_tone:
          'High-contrast main text, lighter yet legible notes and one accent for anchors.',
        lighting_and_shadow: 'Flat page layout with any book presentation kept as a separate view.',
        texture_and_material:
          'Clean page surface and a discreet paper texture well away from dense reading.',
        camera_and_composition:
          'Stable body, a margin wide enough for notes and unmistakable anchors.',
        atmosphere_and_mood: 'Archive intimacy and slow reading, scholarly and warm.',
        rendering_and_quality:
          'Crisp spread where every note matches an anchor and stays off the gutter.',
        key_features: 'ranked margin notes; stable body; clear anchors; one accent',
      },
      ['orphan notes', 'micro text', 'ornamental margins with no function', FAKE],
      [
        'A spread from "THE DROWNED LIBRARY", a book about a library found at the bottom of a lake, the body text calm in the center and anchored margin notes A, B and C crowding the outer edge.',
        'A spread from a cookbook annotated by three generations of feuding grandmothers, "DO NOT ADD CUMIN" shouting in the margin next to the recipe title "SUNDAY STEW".',
        'A quiet page titled "ENCOUNTERS" with a short body block, one long margin note and one coral anchor, black on cream.',
      ],
    ),
    E(
      'R-EDT-02',
      'Parallel Reading Registers',
      'two-register reading layout',
      'parallel-registers',
      {
        aesthetic:
          'Parallel Reading Registers: two reading paths run side by side in columns or bands, linked by clear anchors and with distinct jobs.',
        subject_treatment:
          "Build the prompt's pages as two complementary reading paths linked by numbered anchors, each with its own rhythm, every title and supplied word exact.",
        color_and_tone: 'Registers told apart by weight, position and value as well as color.',
        lighting_and_shadow: 'Flat layout with both texts living on the same page plane.',
        texture_and_material:
          'Sharp type, sober dividers and plain reading areas with no texture under the text.',
        camera_and_composition:
          'Related columns or bands of flexible length with shared reference alignments.',
        atmosphere_and_mood: 'Editorial dialogue and layered reading, thoughtful and clear.',
        rendering_and_quality:
          'Crisp layout where each path can be read alone or crossed without losing order.',
        key_features: 'two reading paths; numbered anchors; distinct rhythms; shared alignments',
      },
      ['two unrelated texts', 'columns of equal priority', 'ambiguous reading order', FAKE],
      [
        'A spread from "THE EXPEDITION AND THE DIARY": the official expedition report in one column and the explorer\'s secret frightened diary in another, linked by anchors 01 to 03.',
        'A magazine spread where a chef\'s recipe runs on one side and the dog\'s point of view runs on the other, "WHAT FELL ON THE FLOOR", linked by numbered anchors.',
        'A visual essay spread with the registers "LOOK" and "MAKE", one test image and a calm blue accent.',
      ],
    ),
    E(
      'R-EDT-03',
      'Image-Index Publications',
      'numbered image index layout',
      'image-index',
      {
        aesthetic:
          'Image-Index Publications: images, numbers and short entries form a consultable system with a steady rhythm, like a well-made catalog.',
        subject_treatment:
          "Relate the prompt's images, numbers and short entries through one consultable index, each image with exactly one entry and a unique number.",
        color_and_tone: 'Sober palette and legible numbers, with an optional section accent.',
        lighting_and_shadow: 'Images keep their own light on a flat, neutral layout.',
        texture_and_material: 'Clean image edges, sharp text and a discreet paper support.',
        camera_and_composition:
          'Images and entries aligned, one dominant image and varied spacing.',
        atmosphere_and_mood: 'Clear consultation and an archive rhythm, tidy and satisfying.',
        rendering_and_quality:
          'Crisp catalog page where no number repeats and every image has its entry.',
        key_features: 'numbered images; short entries; one dominant image; consultable index',
      },
      ['images with no entry', 'decorative numbers', 'illegible thumbnails', FAKE],
      [
        'A catalog page from "BESTIARY OF THE NIGHT TRAIN": creatures 01 to 06 photographed in their compartments, each with a short numbered entry, black on cream.',
        'A catalog of "LOST UMBRELLAS OF THE CITY", umbrellas 01 to 09 photographed like museum specimens with tiny tragic entries.',
        'A page titled "THREE MEETINGS" with images of joints numbered 01 to 03, each anchored to its note, blue ink on pale paper.',
      ],
    ),
    E(
      'R-EDT-04',
      'Overscale Folio Rhythm',
      'giant folio chapter layout',
      'overscale-folio',
      {
        aesthetic:
          'Overscale Folio Rhythm: dramatic changes of scale and visible page numbers articulate chapters while the text stays the main read.',
        subject_treatment:
          "Use large chapter numbers and folios as the structure of the prompt's pages, large at openings and small in the body, the text always the main read.",
        color_and_tone: 'Folios in controlled value, high-contrast titles and a legible body.',
        lighting_and_shadow: 'Flat layout with numbers printed directly on the page.',
        texture_and_material: 'Clean type, a sober support and discreet image edges.',
        camera_and_composition:
          'Big folios in transition zones, reduced on dense pages by one rule.',
        atmosphere_and_mood: 'A rhythm of openings and forward motion, bold and structured.',
        rendering_and_quality: 'Crisp spread where folios match real pages and never read as data.',
        key_features: 'giant chapter numbers; small body folios; scale rhythm; clear chapters',
      },
      ['fake numbering', 'folio as permanent hero', 'pages with no continuity', FAKE],
      [
        'The chapter opening "PART 03: THE DESCENT" of a mountaineering memoir, a colossal 03 bleeding off the page beside a calm body column, black on snow white.',
        'A magazine chapter "CHAPTER 7: WE LOST THE CAT AGAIN" with a gigantic 7 and a small folio 42 in the corner, coral accent.',
        'Three quiet pages numbered 06, 07 and 08 with chapter titles, scale changing by function, black on cream.',
      ],
    ),
    E(
      'R-EDT-05',
      'Dense-Quiet Spread Contrast',
      'dense and quiet page rhythm',
      'dense-quiet',
      {
        aesthetic:
          'Dense-Quiet Spread Contrast: packed pages alternate with wide calm pauses, building a sustained publication rhythm.',
        subject_treatment:
          "Alternate dense and quiet pages across the prompt's publication in one explicit sequence, keeping all supplied content and titles exact.",
        color_and_tone:
          'Stable text contrast throughout, with density never lowering the legibility.',
        lighting_and_shadow: 'Flat layout with source image light preserved throughout.',
        texture_and_material: 'Sober support, minimal texture and consistent type hierarchy.',
        camera_and_composition:
          'Density spread across pages with transitions that prepare each change.',
        atmosphere_and_mood: 'Editorial breathing and controlled tension, paced like music.',
        rendering_and_quality:
          'Crisp sequence where every pause has a job and dense pages keep hierarchy.',
        key_features: 'dense pages; quiet pauses; explicit sequence; paced rhythm',
      },
      ['illegible density', 'arbitrary empty pages', 'omitted content', FAKE],
      [
        'A spread pair from "STORM LOG": a page crammed with the captain\'s frantic notes, then a nearly empty page with one line, "THE WIND STOPPED", black on cream.',
        'A zine about a very loud neighbor, one page packed edge to edge with complaint text, the next page empty except "SILENCE (BRIEFLY)".',
        'A visual essay spread with one dense page of notes followed by a large image and a short caption, calm blue accent.',
      ],
    ),
    E(
      'R-EDT-06',
      'Fold-Aware Editorial',
      'fold-conscious print layout',
      'fold-aware',
      {
        aesthetic:
          'Fold-Aware Editorial: the layout plays with folds and openings while keeping every critical word out of the zones that get lost.',
        subject_treatment:
          "Compose the prompt's printed piece around its folds and openings, keeping titles and text clear of creases, shown flat and folded.",
        color_and_tone: 'Short palette and contrasted text with color continuity across faces.',
        lighting_and_shadow: 'A flat view for the artwork and neutral light for the folded view.',
        texture_and_material: 'Conceptual stock of even thickness, clear folds and clean ink.',
        camera_and_composition:
          'Text kept off critical creases, images crossing folds only where loss is fine.',
        atmosphere_and_mood: 'Discovery through opening and a tactile reading of the object.',
        rendering_and_quality: 'Crisp piece that stays coherent both flat and folded.',
        key_features: 'fold-aware layout; clear creases; flat and folded views; opening reveal',
      },
      ['text in the spine', 'essential image cut by a fold', 'invented folds', FAKE],
      [
        'A three-panel leaflet for "THE HAUNTED LIGHTHOUSE TOUR", the title on the outside, the ghost story inside and a lighthouse image across the center panel, folds clear of the words.',
        'A foldout menu for "PIZZA THAT UNFOLDS", each fold revealing a bigger slice until the whole pizza fills the inside, every price and title clear of the creases.',
        'A spread whose image crosses the gutter with its point of interest safely to one side, caption and body intact.',
      ],
    ),
    E(
      'R-EDT-07',
      'Typographic Specimen Pages',
      'comparative specimen page layout',
      'specimen-pages',
      {
        aesthetic:
          'Typographic Specimen Pages: repeatable units show variations of type or form side by side with shared alignments and precise notes.',
        subject_treatment:
          "Show the prompt's variations as comparable units on shared alignments with precise notes outside the art, every sample word kept exact.",
        color_and_tone: 'One main ink and one technical accent for differences.',
        lighting_and_shadow: 'Flat neutral rendering that gives every sample the same light.',
        texture_and_material: 'Sharp contours and text on a clean support.',
        camera_and_composition:
          'Samples on a common height or box reference, captions outside the art.',
        atmosphere_and_mood:
          'Analytical curiosity and comparative clarity that never becomes monotonous.',
        rendering_and_quality: 'Crisp specimen where each note matches a visible difference.',
        key_features: 'comparable units; shared alignment; precise notes; one accent',
      },
      ['incomparable samples', 'invented annotations', 'undeclared scales', FAKE],
      [
        'A specimen page for the display face of a fictional pirate newspaper, "THE BLACK TIDE", shown in three widths with notes on apertures, black on cream.',
        'A specimen page comparing the letter G drawn by six different designers who clearly never agreed on anything, one ink, notes in the margin.',
        'A calm specimen of forms A, B and C in equal boxes with edge differences noted, one coral accent.',
      ],
    ),
    E(
      'R-EDT-08',
      'Cutout Image Windows',
      'geometric image window layout',
      'cutout-window',
      {
        aesthetic:
          'Cutout Image Windows: geometric windows crop the images in ways tied to the page structure, revealing just enough.',
        subject_treatment:
          "Crop the prompt's images through geometric windows tied to the page grid, keeping their essential content and every title exact.",
        color_and_tone: 'Contrasting ground and window edge, with the images left uncolored.',
        lighting_and_shadow: 'Image light preserved, the crop flat and clean.',
        texture_and_material: 'Clean edges and a sober support with plain paper.',
        camera_and_composition: 'One large main window with text aligned to its useful limits.',
        atmosphere_and_mood: 'Discovery through framing and rhythm, deliberate and graphic.',
        rendering_and_quality: 'Crisp spread where no crop removes essential meaning.',
        key_features: 'geometric windows; grid-tied crops; one main window; essential content',
      },
      ['mutilated subject', 'tiny windows', 'crop with no editorial reason', FAKE],
      [
        'A spread from "EYES OF THE DEEP", a book about sea creatures, where a round window reveals only the huge eye of a giant squid and a narrow slot shows a tentacle beside the title.',
        'A magazine spread "PEEKING" where every photo is seen through keyhole-shaped windows, one of them catching a very startled man in a towel.',
        "A catalog page with an asymmetric window following an object's proportion, caption exact, one blue accent.",
      ],
    ),
    E(
      'R-EDT-09',
      'Continuous Caption Trails',
      'linked caption trail layout',
      'caption-trail',
      {
        aesthetic:
          'Continuous Caption Trails: captions and references follow the images in one coherent path that runs across the pages.',
        subject_treatment:
          "Link the prompt's captions and references to their images through one continuous ranked path across the pages, each caption tied to one image.",
        color_and_tone: 'Legible text and anchors with a subordinate path line.',
        lighting_and_shadow:
          'Flat layout with source image light untouched and no shadows over text.',
        texture_and_material:
          'Clean type and discreet connectors with clear, plain ground under captions.',
        camera_and_composition: 'Captions near or clearly connected, with continuous numbering.',
        atmosphere_and_mood:
          'Editorial companionship and flow that is easy and pleasant to follow.',
        rendering_and_quality:
          'Crisp spread where no caption crosses another text or points twice.',
        key_features: 'caption trail; one image per caption; continuous numbering; discreet path',
      },
      ['orphan captions', 'crossing connections', 'decorative numbering', FAKE],
      [
        'A spread from "FOLLOWING THE FOX", a nature book, three photos of a fox crossing a snowy valley with captions linked by one thin trail like pawprints.',
        'A spread tracking a runaway shopping cart across a city in four photos, captions "START", "HILL", "FASTER" and "POND" linked in order.',
        'A page with four details and a side index of captions tied by small anchors, names kept exact.',
      ],
    ),
    E(
      'R-EDT-10',
      'Material Register Books',
      'changing paper register book',
      'material-register',
      {
        aesthetic:
          "Material Register Books: apparent changes of paper, ink and density follow the book's sections and hierarchy.",
        subject_treatment:
          "Change the apparent paper, ink and density of the prompt's publication by section with one clear rule, every title and supplied word exact.",
        color_and_tone:
          'A palette per register with constant text contrast and clear section changes.',
        lighting_and_shadow: 'A flat content view plus a soft-lit material presentation.',
        texture_and_material: 'Distinct but sober apparent papers presented as a visual study.',
        camera_and_composition: 'Each change of material matching an editorial function.',
        atmosphere_and_mood: 'Narrative tactility and section memory, crafted and meaningful.',
        rendering_and_quality: 'Crisp book whose content still works on a uniform stock.',
        key_features: 'section paper changes; one rule; constant contrast; tactile sections',
      },
      ['paper as the only identity', 'illegible texture', 'impossible binding', FAKE],
      [
        'A book called "LETTERS FROM THE FRONT" where each soldier\'s section is printed on a different worn apparent paper, the title page crisp and clean, black and one blue.',
        'A cookbook where the dessert section is printed on pink paper that looks slightly sticky, title "SWEET MISTAKES".',
        'A book with an essay in cream, images on pale grey and notes on apparent tracing paper, title "REGISTERS".',
      ],
    ),
  ],
};

export default spec;
