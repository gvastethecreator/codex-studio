import type { Spec } from '../tools/apply';
import { design } from './_design';

// Environmental graphics & wayfinding (part A): R-ENV-01..10. Destination names, arrows and routes stay exact;
// architecture is never changed to fit a sign.
const W = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
) => design(name, domain, tag, 'wayfinding', fields, avoid, briefs, { text: true, source });

const SITE = 'altered architecture or invented routes';

const spec: Spec = {
  pack: 'pack_25',
  category: '15. Environmental Graphics & Wayfinding',
  newCategory: { id: 'environmental-graphics-and-wayfinding' },
  updates: {},
  creates: [
    W(
      'R-ENV-01',
      'Threshold Color Fields',
      'doorway color field wayfinding',
      'threshold-color',
      {
        aesthetic:
          'Threshold Color Fields: bold color fields that wrap existing doorways and thresholds to mark each zone, with the name and a symbol always repeating the color.',
        subject_treatment:
          "Mark the prompt's thresholds with color fields that follow the existing openings, each zone named exactly and backed by a symbol, the architecture untouched.",
        color_and_tone:
          'Color per zone backed by name and symbol, with contrast against the site materials.',
        lighting_and_shadow: 'The site light kept, the field readable in bright and shaded parts.',
        texture_and_material: 'Conceptual paint or vinyl of even coverage with precise edges.',
        camera_and_composition:
          'Field tied to the entrance and destination, hardware and circulation left clear.',
        atmosphere_and_mood: 'A clear transition between areas with a confident spatial identity.',
        rendering_and_quality:
          'Clean application aligned to real edges with the building scale kept.',
        key_features: 'doorway color fields; name and symbol; zone identity; intact architecture',
      },
      ['wayfinding by color alone', SITE],
      [
        'The entrance to the "DRAGON WING" of a fantasy museum, a deep ember-red field wrapping the existing stone arch, the name and a small flame symbol above it.',
        'A hospital for grumpy house plants where each ward door is wrapped in its own green, "CACTUS WARD" the most defensive of them all, name and spike symbol exact.',
        'A calm corridor passing from "ARCHIVE" to "READING ROOM", two color fields with exact labels, readable in greyscale too.',
      ],
    ),
    W(
      'R-ENV-02',
      'Overscale Index Wayfinding',
      'giant index letter wayfinding',
      'overscale-index',
      {
        aesthetic:
          'Overscale Index Wayfinding: huge index letters or numbers identify each zone from afar while small secondary text explains the destinations.',
        subject_treatment:
          "Identify the prompt's zones with a huge index letter or number and readable secondary destinations beside it, every character and arrow exact.",
        color_and_tone:
          'High-contrast index, sober secondaries and one route accent with arrow and text.',
        lighting_and_shadow: 'The real or supplied light kept, the index readable up close too.',
        texture_and_material: 'Flat graphics with crisp edges and whole numerals.',
        camera_and_composition:
          'Index on a surface visible from the approach, directory at a test height.',
        atmosphere_and_mood: 'Recognition from far away followed by easy close reading.',
        rendering_and_quality: 'Clean sign with complete characters and exact destination matches.',
        key_features: 'giant index; small secondaries; far and near reading; exact arrows',
      },
      ['invented floors', 'ambiguously cropped numerals', SITE],
      [
        'Zone "C" of an underground city built in an old mine, a colossal white C painted on the rock face with smaller signs "FORGE" and "MARKET" under it, arrows exact.',
        'A parking garage for flying cars with a gigantic "7" and the small note "SPACES FOR DRAGONS ONLY" beside it, concrete and yellow.',
        'Three rooms in a calm library marked "01", "02" and "03" in large numerals with short directories below.',
      ],
    ),
    W(
      'R-ENV-03',
      'Material-Inlaid Navigation',
      'inlaid material sign',
      'material-inlaid',
      {
        aesthetic:
          'Material-Inlaid Navigation: letters and symbols inlaid flush into walls and floors through joints and controlled contrast.',
        subject_treatment:
          "Inlay the prompt's sign text and symbols flush into the existing surface, keeping outlines and contrast independent of the material, every word exact.",
        color_and_tone: 'Contrast through value and finish, with color added only when allowed.',
        lighting_and_shadow:
          'Frontal and side light tested, with reflections never the only contrast.',
        texture_and_material:
          'Conceptual inlay matching the surface with thin joints and clear edges.',
        camera_and_composition: 'Sign related to existing joints without being cut by them.',
        atmosphere_and_mood:
          'A discreet, materially integrated presence that still communicates first.',
        rendering_and_quality: 'Clean inlay with exact letters shown from more than one angle.',
        key_features: 'flush inlay; joint-aware; value contrast; exact letters',
      },
      ['letters invisible from low contrast', 'invented joints', SITE],
      [
        'The word "CATACOMBS" inlaid in dark stone into the pale marble floor of an ancient cathedral, an inlaid arrow pointing down the stairs, lit by candles.',
        'A brass word "SHOES OFF" inlaid into the wooden floor of a very strict meditation center, polished to a stern shine.',
        'The words "ROOM B" inlaid in pale letters on a dark wooden panel, grain kept, frontal and oblique views.',
      ],
    ),
    W(
      'R-ENV-04',
      'Route-Line Wall Systems',
      'continuous route line wayfinding',
      'route-line',
      {
        aesthetic:
          'Route-Line Wall Systems: one continuous painted line follows an authorized route along the walls and branches only at documented decision points.',
        subject_treatment:
          "Run one continuous line along the prompt's walls following the supplied route, branching only at real decision points, each arrow tied to one exact destination.",
        color_and_tone:
          'Route marked by color, name and a terminal shape, with clear gaps at non-connections.',
        lighting_and_shadow: 'The space light kept, the line itself non-emissive.',
        texture_and_material: 'Conceptual paint or tape of steady width with resolved corners.',
        camera_and_composition: 'Line on the supplied surfaces, never crossing doors or obstacles.',
        atmosphere_and_mood:
          'Continuity that walks with the visitor, pausing before each decision.',
        rendering_and_quality: 'Clean line with unambiguous arrows matching the plan.',
        key_features:
          'continuous wall line; documented branches; one destination per arrow; steady width',
      },
      ['invented routes', 'ambiguous crossings', SITE],
      [
        'A red line running through the endless corridors of a haunted hotel, turning at every corner, splitting only once toward "ROOM 237" and "EXIT", the exit line looking relieved.',
        'A yellow line in a huge furniture maze that tries to lead shoppers to "EXIT" but clearly loops past the cafeteria three times first.',
        'A calm blue line from "LOBBY" to "ARCHIVE" warning of a right turn before the corner and ending beside the exact label.',
      ],
    ),
    W(
      'R-ENV-05',
      'Open-Frame Signage',
      'partial-frame sign system',
      'open-frame-sign',
      {
        aesthetic:
          'Open-Frame Signage: partial frames with two or three active edges group information on minimal supports, the opening pointing somewhere meaningful.',
        subject_treatment:
          "Frame the prompt's sign information with two or three edges on a minimal support, the open side pointing with the hierarchy, every word and arrow exact.",
        color_and_tone: 'A solid contrasting reading field with a secondary frame.',
        lighting_and_shadow: 'Existing light with no frame shadow over information.',
        texture_and_material:
          'Minimal matte support and precise contours with a solid reading field.',
        camera_and_composition:
          'The frame opening answering hierarchy or direction, text inside the reserve.',
        atmosphere_and_mood: 'Structural lightness and a calm, contained sense of orientation.',
        rendering_and_quality: 'Clean sign with deliberate open edges and aligned text.',
        key_features: 'partial frame; active edges; solid reading field; meaningful opening',
      },
      ['invisible frame', 'text floating over noise', SITE],
      [
        'A sign "OBSERVATORY →" on the ice wall of a polar research station, its frame open toward the telescope dome, matte white on blue.',
        'A directory for a very small office with an open frame and one destination, "EVERYTHING →", matte and completely honest.',
        'A room sign "B" with a corner frame and the line "ARCHIVE", aligned to the door frame and never crossing the door.',
      ],
    ),
    W(
      'R-ENV-06',
      'Layered Directory Panels',
      'layered hierarchy directory',
      'layered-directory',
      {
        aesthetic:
          'Layered Directory Panels: stacked plates separate building, zone and destination with minimal depth and one reading order.',
        subject_treatment:
          "Stack the prompt's directory as building, zone and destination plates with shallow depth and explicit links, every name and arrow exact.",
        color_and_tone: 'A different value per level and one accent for the selection.',
        lighting_and_shadow: 'Moderate ambient light with no shadow cutting across text.',
        texture_and_material: 'Matte plates with discreet edges and consistent materials.',
        camera_and_composition:
          'General level behind, zone in the middle and destination in front.',
        atmosphere_and_mood: 'A gradual reading that lowers effort for the visitor.',
        rendering_and_quality: 'Clean directory with shared alignments and no hidden information.',
        key_features: 'stacked plates; three levels; shallow depth; one reading order',
      },
      ['decorative layers', 'duplicated destinations', SITE],
      [
        'The directory of a space station: "STATION ORION" on the back plate, "HAB RING" in the middle and "HYDROPONICS" and "OBSERVATION" in front, arrows exact.',
        'A directory for a castle that is also a hotel: "CASTLE", "EAST TOWER" and "SUITE WITH GHOST", layered plates, very matter-of-fact.',
        'A calm museum directory panel with the plates "GALLERY", "SECTION 2" and "PIECE 14" stepped in shallow depth, each level in its own quiet grey value.',
      ],
    ),
    W(
      'R-ENV-07',
      'Type-as-Architecture Graphics',
      'architectural supergraphic lettering',
      'type-architecture',
      {
        aesthetic:
          'Type-as-Architecture Graphics: huge letters aligned with the proportions, joints and openings of the real space.',
        subject_treatment:
          "Set the prompt's words at architectural scale, aligned with the existing joints, heights and openings, the word complete and the building unchanged.",
        color_and_tone: 'Contrast adapted to the support with large reserves.',
        lighting_and_shadow: 'Architectural light kept, reading checked from more than one angle.',
        texture_and_material: 'Mural graphics with controlled edges, separate from structure.',
        camera_and_composition: 'Baseline, height or module tied to real joints and planes.',
        atmosphere_and_mood:
          'A spatial presence that amplifies identity without dominating the building.',
        rendering_and_quality: 'Clean supergraphic with exact words and verifiable alignments.',
        key_features: 'architectural scale type; joint alignment; complete word; intact building',
      },
      ['building remodeled for letters', 'illegible crops', SITE],
      [
        'The word "HANGAR" painted twenty meters tall across the doors of an airship hangar, its baseline following the rail of the sliding doors, a small airship docked beside it.',
        'The word "STAIRS" painted enormous on a staircase so that each letter sits on its own step, completely unnecessary and very satisfying.',
        'The word "ARCHIVE" at mural scale along a quiet corridor, baseline on an existing joint, never crossing a door.',
      ],
    ),
    W(
      'R-ENV-08',
      'Perforated Light Sign Systems',
      'backlit perforated sign',
      'perforated-light',
      {
        aesthetic:
          'Perforated Light Sign Systems: letters and symbols formed by perforations in a plate lit softly from within, readable day and night.',
        subject_treatment:
          "Form the prompt's sign words from perforations in a plate with soft inner light, continuous supports and a readable unlit state, every character exact.",
        color_and_tone: 'Contrast between plate and light, readable when the light is off.',
        lighting_and_shadow: 'Contained, even inner light with a limited halo.',
        texture_and_material: 'Conceptual plate of steady thickness with clear, legible holes.',
        camera_and_composition: 'Text with a reserve around it and fixings outside the characters.',
        atmosphere_and_mood: 'A sober night presence that is still recognizable by day.',
        rendering_and_quality: 'Clean sign shown on and off with identical geometry.',
        key_features: 'perforated letters; soft inner light; day and night; continuous supports',
      },
      ['guaranteed manufacture', 'glow that closes counters', SITE],
      [
        'A perforated sign "NIGHT MARKET" glowing over the gate of a lantern-lit market in the rain, the same plate shown dark by day.',
        'A glowing perforated sign reading "OPEN (PROBABLY)" above a very unreliable noodle stand, soft warm light.',
        'A perforated plate reading "ROOM 02" with continuous supports and neutral light, day and night views.',
      ],
    ),
    W(
      'R-ENV-09',
      'Data-Ribbon Environments',
      'data band along walls',
      'data-ribbon',
      {
        aesthetic:
          'Data-Ribbon Environments: one continuous band of supplied information runs along the walls, turning the space into a readable timeline.',
        subject_treatment:
          "Run the prompt's supplied data as one continuous band along existing walls, with repeated headers and units and no number cut at a corner.",
        color_and_tone:
          'Categories keep their color through the space, one accent for a selected item.',
        lighting_and_shadow: 'Site light kept, with any screens never glaring over content.',
        texture_and_material: 'An explicitly defined print or screen band with crisp type.',
        camera_and_composition: 'Data in readable stretches with pauses and repeated headers.',
        atmosphere_and_mood:
          'An informative continuity that follows the cadence of the architecture.',
        rendering_and_quality:
          'Clean band with exact values and a static label where nothing is live.',
        key_features: 'continuous data band; repeated headers; units kept; static label',
      },
      ['fake live data', 'invented figures', SITE],
      [
        'A band running around the walls of a lighthouse museum listing every storm the light survived, "1901", "1952" and "1999" with their names, one continuous ribbon.',
        'A band along an office corridor showing "COFFEES CONSUMED THIS YEAR" by month, peaking dramatically in December, labeled "static display".',
        'A calm band of three exhibit titles with indexes 01, 02 and 03 along a gallery wall, one detail panel.',
      ],
    ),
    W(
      'R-ENV-10',
      'Floor-to-Wall Continuity',
      'floor to wall wayfinding graphic',
      'floor-wall',
      {
        aesthetic:
          'Floor-to-Wall Continuity: one graphic path that climbs from the floor onto the wall through an existing corner, keeping its direction and meaning.',
        subject_treatment:
          "Run the prompt's wayfinding graphic from the floor up the wall through a real corner, matching points at the edge and placing text on one readable plane.",
        color_and_tone: 'The same color and symbol on both planes with adapted contrast.',
        lighting_and_shadow: 'The site light kept, corner shadows never implying a step.',
        texture_and_material: 'Conceptual graphic material kept separate from the real surfaces.',
        camera_and_composition: 'Matching points at the corner edge and text fully on one plane.',
        atmosphere_and_mood: 'Clear spatial continuity with a controlled change of orientation.',
        rendering_and_quality: 'Clean graphic readable from more than one approach position.',
        key_features: 'floor to wall path; matched corner; text on one plane; same symbol',
      },
      ['dangerous step illusions', 'direction readable from one camera only', SITE],
      [
        'A glowing blue path that crosses the floor of a submarine base and climbs the wall to the hatch marked "ESCAPE POD 3", matched perfectly at the corner.',
        'A path of painted paw prints that walks across a vet clinic floor and straight up the wall to "CATS", because of course it does.',
        'A calm band from the floor to the wall ending at the label "WORKSHOP A", corner points matched.',
      ],
    ),
  ],
};

export default spec;
