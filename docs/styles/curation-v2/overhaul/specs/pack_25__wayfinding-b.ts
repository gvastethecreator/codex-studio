import type { Spec } from '../tools/apply';
import { design } from './_design';

// Environmental graphics & wayfinding (part B): R-ENV-11..16 styles, R-ENV-17/18 layout profiles, R-ENV-20
// near-far legibility sheet profile, and Tiled Mosaic Signage, a new style replacing the R-ENV-19 route audit
// (see QA-PROTOCOLS.md).
const W = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'profile' = 'style',
) => design(name, domain, tag, 'wayfinding', fields, avoid, briefs, { text: true, source, kind });

const SITE = 'altered architecture or invented routes';

const spec: Spec = {
  pack: 'pack_25',
  category: '15. Environmental Graphics & Wayfinding',
  updates: {},
  creates: [
    W(
      'R-ENV-11',
      'Quiet Museum Labels',
      'sober museum label system',
      'museum-label',
      {
        aesthetic:
          'Quiet Museum Labels: a sober typographic hierarchy of title, identification and context text, set close to the object without competing with it.',
        subject_treatment:
          "Set the prompt's label as a calm hierarchy of title, identification and context near its object, every supplied word exact and nothing invented.",
        color_and_tone: 'High reading contrast with a minimal accent for the index.',
        lighting_and_shadow: 'The gallery light respected, with the label never re-lit.',
        texture_and_material: 'A matte label support with crisp type and a minimal paper texture.',
        camera_and_composition: 'Clear gap between label and object, a contained reading width.',
        atmosphere_and_mood:
          'Silent contextual attention that always lets the object lead the room.',
        rendering_and_quality:
          'Clean label with exact text and an unmistakable link to its object.',
        key_features: 'sober hierarchy; title and context; beside the object; exact text',
      },
      ['invented provenance', 'assumed dates', SITE],
      [
        'The label for a giant fossilized sea-dragon skull in a dim hall, title "THE LEVIATHAN OF THE NORTH SEA" and two short lines of supplied context, the skull towering beside it.',
        'A museum label for an ordinary office chair displayed on a plinth, title "THE CHAIR THAT SURVIVED ALL THE MEETINGS", sober and completely sincere.',
        'Three calm labels for pieces A, B and C with titles of different length and the same width and hierarchy.',
      ],
    ),
    W(
      'R-ENV-12',
      'Industrial Plate Navigation',
      'bolted plate wayfinding',
      'industrial-plate',
      {
        aesthetic:
          'Industrial Plate Navigation: sturdy plates of steady proportion carry text and arrows, their bolts clearly holding them up and kept off the information.',
        subject_treatment:
          "Mount the prompt's sign text and arrows on sturdy matte plates with visible fixings outside the reading area, every word and arrow exact.",
        color_and_tone: 'A matte contrasting field with clear type and a limited zone accent.',
        lighting_and_shadow: 'Descriptive light with fixings casting no shadow over letters.',
        texture_and_material:
          'Conceptual plates and consistent bolts, any wear kept off information.',
        camera_and_composition:
          'Clear technical margins, anchors outside the text and aligned plates.',
        atmosphere_and_mood:
          'Sober visual robustness that feels dependable rather than theatrical.',
        rendering_and_quality: 'Clean plates with defined edges and exact text.',
        key_features: 'bolted plates; fixings off text; matte field; aligned system',
      },
      ['random screws', 'invented regulatory warnings', SITE],
      [
        'Bolted plates guiding workers through a steampunk airship engine room, "BOILER 3 →", "CREW DECK ↑" and "DO NOT TOUCH THE PIPES", matte steel and one red accent.',
        'A very serious bolted plate reading "COFFEE MACHINE →" mounted in a tiny office kitchen, four big bolts for a job that needed none.',
        'Three modular bolted plates for a small community center, "ROOM A", "ROOM B" and "WORKSHOP", with discreet fixings, matte grey and shared spacing between them.',
      ],
    ),
    W(
      'R-ENV-13',
      'Soft Monumental Letters',
      'large soft volumetric letters',
      'soft-monumental',
      {
        aesthetic:
          'Soft Monumental Letters: huge letters with soft controlled curves and generous counters that bring a friendly presence to a space.',
        subject_treatment:
          "Build the prompt's words as large soft volumetric letters placed on an authorized spot out of the circulation, every character exact.",
        color_and_tone:
          'A few masses in contrast with the site, with shadows never replacing letter spacing.',
        lighting_and_shadow: 'Coherent ambient light with moderate relief and lit counters.',
        texture_and_material:
          'A matte or softly tactile conceptual surface with smooth, rounded edges.',
        camera_and_composition: 'Placed on an authorized support, the main viewing side declared.',
        atmosphere_and_mood: 'A friendly monumental presence that never becomes childish or silly.',
        rendering_and_quality: 'Clean letters with open counters and continuous volume.',
        key_features: 'soft volumes; generous counters; friendly scale; exact word',
      },
      ['sculpture presented as enough signage', 'deformed letters', SITE],
      [
        'Soft monumental letters spelling "MOON BASE" standing on the grey dust outside a lunar colony, the Earth rising behind them.',
        'Giant soft letters reading "HUG ZONE" in the lobby of a very corporate bank, which is confusing everyone.',
        'The word "FORMS" as soft volumetric letters on an approved plinth in a calm gallery, open counters.',
      ],
    ),
    W(
      'R-ENV-14',
      'Window-Layer Graphics',
      'layered window vinyl graphic',
      'window-layer',
      {
        aesthetic:
          'Window-Layer Graphics: layered graphics on glass that link inside and outside while staying readable from the intended side.',
        subject_treatment:
          "Layer the prompt's window graphics as transparent fields and opaque text on the glass, readable from the declared side, every word exact.",
        color_and_tone: 'Contrast built per layer and value for a varying background.',
        lighting_and_shadow: 'Existing reflections kept, tested with light and dark interiors.',
        texture_and_material:
          'Conceptual vinyl with explicit transparency, separate from the glass.',
        camera_and_composition: 'Main text in a stable contrast zone with controlled overlaps.',
        atmosphere_and_mood: 'Light depth between inside and outside with the message kept.',
        rendering_and_quality: 'Clean graphic with exact letters and its reverse view documented.',
        key_features: 'layers on glass; opaque text; transparent fields; reading side declared',
      },
      ['unreadable reverse', 'accidental opacity', SITE],
      [
        'The window of a fortune teller\'s shop at night, a translucent starry field and opaque letters "YOUR FUTURE, 10 COINS" readable from the rainy street.',
        'A glass door for a gym with a translucent layer reading "PUSH" and a smaller opaque note "(THE DOOR, TOO)".',
        'A calm glass door with the index "02" and open frames that keep the vision zone clear.',
      ],
    ),
    W(
      'R-ENV-15',
      'Modular Exhibition Captions',
      'flexible exhibition caption module',
      'modular-caption',
      {
        aesthetic:
          'Modular Exhibition Captions: repeatable caption modules sharing anchors, margins and hierarchy while their length changes freely.',
        subject_treatment:
          "Set the prompt's captions as modules with shared anchors and hierarchy that grow for longer texts, every title and reference exact.",
        color_and_tone: 'A sober palette by function, with indexes coded consistently.',
        lighting_and_shadow: 'The site lighting respected, captions needing no glow of their own.',
        texture_and_material: 'A matte support with crisp text and discreet separators.',
        camera_and_composition: 'Title, body and reference modules on one shared anchor line.',
        atmosphere_and_mood: 'Clear repetition with varied content and pauses between works.',
        rendering_and_quality: 'Clean captions with complete content and matching indexes.',
        key_features: 'caption modules; shared anchors; flexible length; exact references',
      },
      ['hidden truncation', 'invented artwork metadata', SITE],
      [
        'Three captions for an exhibition of "WEAPONS OF LEGENDARY HEROES", one short, one long and one very long, all hanging from the same anchor line beside the swords.',
        'Captions for an exhibition of "SOCKS THAT WERE NEVER FOUND", the longest caption reserved for a single lonely blue sock.',
        'Calm exhibition captions in two languages on one shared module for a small city museum, long object names and every accent kept exact and readable.',
      ],
    ),
    W(
      'R-ENV-16',
      'Landscape-Edge Markers',
      'outdoor path edge marker',
      'landscape-marker',
      {
        aesthetic:
          'Landscape-Edge Markers: compact outdoor markers set along the edges of paths, clearly readable yet at home in the landscape.',
        subject_treatment:
          "Place compact markers along the prompt's existing path edges, out of the walking line, each with an exact name and arrow.",
        color_and_tone: 'Contrast against the surroundings with a redundant destination code.',
        lighting_and_shadow: 'Ambient outdoor light with no invented night visibility.',
        texture_and_material:
          'Soberly rendered outdoor material with clean, legible edges on every face.',
        camera_and_composition: 'Placed off the path, oriented to the approach, no new trails.',
        atmosphere_and_mood: 'A discreet, recognizable presence at the edge of the path.',
        rendering_and_quality: 'Clean marker with clear name and arrow in its real setting.',
        key_features: 'compact outdoor marker; path edge; exact name; approach orientation',
      },
      ['invented trails', 'guaranteed weather resistance', SITE],
      [
        'A stone marker at the edge of a misty mountain pass reading "DRAGON\'S REST 2 KM →", placed just off the trail with fog rolling past.',
        'A small garden marker reading "BEWARE OF THE GNOMES →" at the edge of a very tidy suburban lawn.',
        'A calm marker "ZONE B" beside the border of a quiet courtyard, matte and clearly readable.',
      ],
    ),
    W(
      'R-ENV-19-NEW',
      'Tiled Mosaic Signage',
      'ceramic tile mosaic lettering',
      'tiled-mosaic',
      {
        aesthetic:
          'Tiled Mosaic Signage: station names and directions set in small glazed ceramic tiles, built into the wall with a tiled border.',
        subject_treatment:
          "Set the prompt's words and arrows in small glazed ceramic tiles inside a tiled border panel on the wall, every letter built tile by tile and exact.",
        color_and_tone: 'Cream and white fields with deep blue, green or red letters and borders.',
        lighting_and_shadow: 'Soft platform or corridor light with gentle glaze reflections.',
        texture_and_material:
          'Glossy square tiles, grout lines and a slightly irregular handmade grid.',
        camera_and_composition:
          'Frontal panel centered on the wall with a decorative tiled border.',
        atmosphere_and_mood: 'Timeless and civic, the charm of an old underground station.',
        rendering_and_quality:
          'Crisp mosaic with even grout and letters built cleanly from whole tiles.',
        key_features: 'glazed tile letters; tiled border; grout grid; civic charm',
      },
      ['misspelled tiled letters', 'real transit names', SITE],
      [
        'A tiled mosaic station sign "ATLANTIS" deep in an underground metro that runs beneath the sea, blue letters and a wave border, water pressing against a window.',
        'A beautifully tiled mosaic sign on a busy subway platform reading "WRONG PLATFORM", perfectly crafted in blue and cream tiles, deeply unhelpful to every passenger.',
        'A calm mosaic panel "NORTH LIBRARY →" in green tiles on cream with a simple border.',
      ],
    ),
    W(
      'R-ENV-20',
      'Near-Far Legibility Trial',
      'near and far sign view sheet profile',
      'near-far',
      {
        aesthetic:
          'Near-Far Legibility Trial: one sign shown from a near and a far viewpoint and at an angle, the same artwork and size in every view.',
        subject_treatment:
          "Show the prompt's sign from a near view, a far view and an oblique view, with the same artwork, size and surroundings in each.",
        color_and_tone: 'Original sign colors plus one extra greyscale test view.',
        lighting_and_shadow: 'The available site light, other conditions noted as pending.',
        texture_and_material: 'Constant support and finish with reflections left in place.',
        camera_and_composition: 'Declared test cameras plus a frontal control view.',
        atmosphere_and_mood: 'A progressive reading from far recognition to near detail.',
        rendering_and_quality: 'Clean sheet with identical geometry in every view.',
        key_features: 'near, far and oblique; same sign; greyscale test; control view',
      },
      ['invented normative distances', 'sign enlarged between views', SITE],
      [
        'The sign "LAST EXIT BEFORE THE DESERT" shown from far down a highway, from close up and at an angle, the same sign in every view under hard sun.',
        'A sign reading "TINY SIGN" viewed from far, where it is invisible, and from near, where it is very proud of itself.',
        'The plate "ARCHIVE →" from a near and a far camera and a greyscale view, same artwork.',
      ],
      'profile',
    ),
    W(
      'R-ENV-17',
      'Decision-Point Sign Layout',
      'route decision sign sequence profile',
      'decision-point',
      {
        aesthetic:
          'Decision-Point Sign Layout: signs placed at the entrance, before each turn and on arrival, following one supplied route on a plan.',
        subject_treatment:
          "Place the prompt's signs at entrance, decision and arrival points of the supplied route, each tied to a plan position with exact text and arrows.",
        color_and_tone: 'A consistent, redundant route code across the sequence.',
        lighting_and_shadow: 'Comparable light on site and signs, obstacles left visible.',
        texture_and_material: 'Consistent sign supports kept clearly separate from their content.',
        camera_and_composition: 'A plan with numbered points beside a sequence of sign views.',
        atmosphere_and_mood: 'Progressive guidance that gives just enough at every single point.',
        rendering_and_quality: 'Clean sequence with every sign linked to one plan point.',
        key_features: 'entrance, decision, arrival; plan points; sign sequence; exact arrows',
      },
      ['assumed routes', 'signs placed after the turn', SITE],
      [
        'The sign sequence through a castle turned into a hotel: entrance "RECEPTION", a turn "EAST TOWER →" and arrival "SUITE 7", each tied to a point on the plan.',
        'A sign sequence leading party guests to "THE BATHROOM", with ever more urgent signs at each turn and a triumphant arrival sign.',
        'A calm sign sequence for a public library, from "LOBBY" to "ARCHIVE" and back again, orientation signs and destination signs kept clearly separate.',
      ],
      'profile',
    ),
    W(
      'R-ENV-18',
      'Anamorphic Viewpoint Graphic',
      'viewpoint-aligned anamorphic profile',
      'anamorphic',
      {
        aesthetic:
          'Anamorphic Viewpoint Graphic: fragments painted across several surfaces that snap into one image from a single declared viewpoint.',
        subject_treatment:
          "Paint the prompt's word or shape across existing surfaces so it aligns from one declared viewpoint, with a second view showing the fragments.",
        color_and_tone: 'High-contrast colors so both fragments and the aligned figure read.',
        lighting_and_shadow: 'Original light kept, the shadows revealing each plane.',
        texture_and_material: 'Flat graphics applied to the given surfaces with masks per plane.',
        camera_and_composition:
          'The declared viewpoint plus an alternative view showing the fragments.',
        atmosphere_and_mood: 'A localized spatial surprise that is honest about its viewpoint.',
        rendering_and_quality:
          'Clean alignment from the target camera with the building unchanged.',
        key_features: 'single viewpoint; fragmented planes; aligned figure; alternate view',
      },
      ['wayfinding based only on illusion', 'undeclared camera', SITE],
      [
        'The word "PORTAL" painted across the floor, walls and ceiling of an old tunnel so that it snaps together from one spot like a doorway into light, with a side view showing the pieces.',
        'An anamorphic painting that forms a giant slice of cake from one exact spot in a school corridor, and random paint splotches from everywhere else.',
        'An open circle that completes from one frontal point across floor and wall, with a side view of the fragments.',
      ],
      'profile',
    ),
  ],
};

export default spec;
