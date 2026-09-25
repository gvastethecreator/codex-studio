import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Space, atomic and ray punks (part B): nebula, trucker, terraform, gas giant, launch, ark, bunker and reactor.
const AVOID = [
  ...STYLE_AVOID,
  'real space agency insignia',
  'real brand or company logo',
  'franchise spaceship design',
];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'punk', 'space'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '9. Space, Atomic & Ray Punks',
  updates: {},
  creates: [
    punk(
      'Nebulapunk',
      'nebula-dwelling cosmic punk',
      'nebulapunk',
      {
        aesthetic:
          'Nebulapunk: drifters living inside glowing nebulae, with gas-harvesting ships, cloud-lit stations, star nurseries and skies of swirling cosmic color.',
        subject_treatment:
          "Keep the prompt's subject and setting; immerse it inside a glowing nebula, with gas clouds, newborn stars and drifting ships.",
        color_and_tone:
          'Vivid magenta, teal, violet and gold gas clouds with bright white newborn stars.',
        lighting_and_shadow:
          'Soft glowing light from all directions through colored gas, bright star points.',
        texture_and_material:
          'Billowing gas, dust lanes, sparkling star fields and smooth ship hulls.',
        camera_and_composition: 'Vast cloud pillars with small ships and stations for scale.',
        atmosphere_and_mood: 'Dreamlike and cosmic, living inside the birthplace of stars.',
        rendering_and_quality:
          'Luminous painterly illustration with glowing gas and fine star detail.',
        key_features: 'glowing gas clouds; newborn stars; drifting ships; cosmic color',
      },
      [
        'A tiny harvester ship flies into a towering magenta nebula pillar just as a new star ignites inside it, the blast of light turning the whole cloud gold while the crew shields their eyes. No readable text or logo.',
        'A nebula gas collector opens a jar of harvested star gas in his kitchen and the whole room fills with tiny newborn twinkling stars. No readable text or logo.',
        'A lone space station glows softly inside a quiet violet nebula, one window lit, a figure looking out at the slow clouds. No readable text or logo.',
      ],
    ),
    punk(
      'Space Truckerpunk',
      'interplanetary hauler punk',
      'space-trucker',
      {
        aesthetic:
          'Space Truckerpunk: blue-collar haulers of the space lanes, with battered cargo rigs, cab kitchens, truck-stop stations, coffee in zero-g and long lonely routes.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into interplanetary hauling life with battered cargo rigs, cabs and truck-stop stations.",
        color_and_tone:
          'Scuffed industrial yellow and grey with warm cab lights and cold starlight.',
        lighting_and_shadow: 'Warm dashboard glow inside cabs, harsh work lights outside.',
        texture_and_material:
          'Scratched hull paint, cargo containers, worn seats, coffee stains and cables.',
        camera_and_composition:
          'Cab interiors with windows full of space and long rigs pulling cargo.',
        atmosphere_and_mood: 'Lonely, funny and hardworking, truckers of the stars.',
        rendering_and_quality: 'Gritty warm illustration with lived-in cab detail and starlight.',
        key_features: 'cargo rigs; cab kitchens; truck-stop stations; long routes',
      },
      [
        'A battered space hauler pulls a train of cargo containers a kilometer long past a collapsing star, the lone driver gripping the wheel as the shockwave lights up her rearview in white. No readable text or logo.',
        'Two space truckers try to reverse a massive cargo rig into a tiny truck-stop station dock while a crowd of other drivers shouts contradictory directions. No readable text or logo.',
        'A trucker eats noodles alone in her cab on a long route, a photo of her kids taped to the dashboard beside the stars. No readable text or logo.',
      ],
    ),
    punk(
      'Terraformpunk',
      'planet terraforming punk',
      'terraformpunk',
      {
        aesthetic:
          'Terraformpunk: engineers remaking dead worlds, with atmosphere factories, first rains, seeded forests, comet-ice lakes and colossal weather machines.',
        subject_treatment:
          "Keep the prompt's subject and setting; set it on a world mid-terraform, half dead rock and half new life and weather.",
        color_and_tone:
          'Barren rust and grey meeting fresh green, new blue water and hazy young skies.',
        lighting_and_shadow: 'Hazy young sunlight through forming clouds, first rain glints.',
        texture_and_material: 'Barren rock, moss spreading, factory towers, new water and mist.',
        camera_and_composition:
          'Split landscapes with dead and living halves meeting across the frame.',
        atmosphere_and_mood: 'Hopeful and colossal, a whole world being born by hand.',
        rendering_and_quality:
          'Epic detailed illustration with contrasting landscapes and weather.',
        key_features: 'atmosphere factories; first rain; spreading green; weather machines',
      },
      [
        'Colonists stand on a barren red plain as the first rain in a billion years falls from clouds made by towering atmosphere factories, and moss visibly spreads across the rocks around their boots. No readable text or logo.',
        'A terraforming engineer accidentally sets the weather machine too high and now the new planet has a single permanent cloud that only rains on him. No readable text or logo.',
        'A scientist kneels on grey rock and plants a single tiny tree under a hazy new sky, the first green thing for a thousand kilometers. No readable text or logo.',
      ],
    ),
    punk(
      'Gas Giantpunk',
      'gas giant refinery punk',
      'gas-giant',
      {
        aesthetic:
          'Gas Giantpunk: floating refinery towns in the endless clouds of gas giants, with balloon platforms, lightning harvesters and storms the size of planets below.',
        subject_treatment:
          "Keep the prompt's subject and setting; float it among the vast banded clouds of a gas giant, on balloon platforms and refineries.",
        color_and_tone:
          'Banded ochre, cream, rust and storm orange clouds with deep shadowed depths.',
        lighting_and_shadow:
          'Warm diffused light through thick clouds and flashes of deep lightning.',
        texture_and_material:
          'Billowing clouds, balloon fabric, refinery pipes, cables and wet metal.',
        camera_and_composition:
          'Floating platforms with endless cloud horizons and giant storms below.',
        atmosphere_and_mood: 'Dizzying and industrial, towns floating over a bottomless sky.',
        rendering_and_quality: 'Painterly atmospheric illustration with banded clouds and scale.',
        key_features: 'floating refineries; banded clouds; lightning harvesters; endless depth',
      },
      [
        'A floating refinery town tilts on its giant balloons as a planet-sized storm eye opens below, lightning harvesters crackling while workers cling to catwalks above a bottomless vortex. No readable text or logo.',
        'A refinery worker drops his wrench over the side of a gas giant platform and the whole crew leans over the rail to watch it fall for three straight days. No readable text or logo.',
        'A girl sits on the edge of a floating platform at dusk, watching distant lightning flicker deep in the golden clouds below her feet. No readable text or logo.',
      ],
    ),
    punk(
      'Launchpadpunk',
      'rocket launch culture punk',
      'launchpadpunk',
      {
        aesthetic:
          'Launchpadpunk: towns built around rocket launch sites, with steel gantries, exhaust plumes, crowds on beaches, countdown rituals and roaring ignitions.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it near a rocket launch, with gantries, exhaust plumes and watching crowds.",
        color_and_tone:
          'Blinding white-orange exhaust against blue sky, steel grey gantries and sandy tones.',
        lighting_and_shadow:
          'Intense exhaust glow lighting faces and landscapes from below and behind.',
        texture_and_material:
          'Steel gantries, billowing smoke, frost-covered tanks, sand and concrete.',
        camera_and_composition: 'Low wide views of rockets rising above crowds and plumes.',
        atmosphere_and_mood: 'Thundering, hopeful and emotional, everyone looking up at once.',
        rendering_and_quality: 'Dramatic illustration with glowing plumes and powerful scale.',
        key_features: 'steel gantries; exhaust plumes; watching crowds; roaring ignition',
      },
      [
        'A giant rocket lifts off from a seaside launch site at dawn, the exhaust plume turning the whole ocean orange while ten thousand people on the beach raise their hands against the roar. No readable text or logo.',
        'An entire launch town gathers for a historic launch and it is delayed yet again, everyone sitting on folding chairs eating snacks in total resignation. No readable text or logo.',
        "A small boy sits on his father's shoulders at night, watching a tiny rocket light climb into the stars far away. No readable text or logo.",
      ],
    ),
    punk(
      'Generation Shippunk',
      'multi-generation ark ship punk',
      'generation-ship',
      {
        aesthetic:
          'Generation Shippunk: life inside vast ark ships traveling for centuries, with farm decks, forgotten corridors, ship-born cultures and a destination nobody alive will see.',
        subject_treatment:
          "Keep the prompt's subject and setting; set it inside a huge centuries-old ark ship with farm decks, worn corridors and ship-born people.",
        color_and_tone:
          'Aged metal greys and warm grow-light gold with lush greens and faded paint.',
        lighting_and_shadow:
          'Artificial daylight panels over farms and dim flickering corridors beyond.',
        texture_and_material:
          'Worn metal decks, soil beds, handmade repairs, faded murals and vines.',
        camera_and_composition: 'Long interior perspectives and cylinder farms curving overhead.',
        atmosphere_and_mood: 'Melancholy and resilient, a world inside a journey.',
        rendering_and_quality:
          'Richly detailed illustration with deep interiors and warm grow-light.',
        key_features: 'farm decks; worn corridors; ship-born cultures; curving interiors',
      },
      [
        'Ship-born children on a centuries-old ark open a sealed viewing dome for the first time and see the destination planet at last, the whole ship gathering beneath the glass in stunned silence. No readable text or logo.',
        'A ship-born farmer finds an ancient Earth vending machine in a forgotten corridor and worships it as a god, leaving offerings of tomatoes. No readable text or logo.',
        'An elder on an ark ship tends a single old tree in a quiet farm deck, knowing it will outlive her by generations. No readable text or logo.',
      ],
    ),
    punk(
      'Bunkerpunk',
      'atomic fallout shelter punk',
      'bunkerpunk',
      {
        aesthetic:
          'Bunkerpunk: atomic-age fallout shelter culture, with concrete bunkers, canned-food walls, periscopes, hand-crank radios and families waiting underground.',
        subject_treatment:
          "Keep the prompt's subject and setting; move it underground into a mid-century fallout shelter full of cans, bunks and crank machines.",
        color_and_tone:
          'Concrete grey, army green and mustard yellow with warm bulb light and rust.',
        lighting_and_shadow: 'A single bulb or lantern in a low concrete room, deep corners.',
        texture_and_material:
          'Poured concrete, canned goods, steel bunks, wool blankets and heavy doors.',
        camera_and_composition: 'Low cramped rooms with families gathered around a small light.',
        atmosphere_and_mood: 'Tense, cozy and absurd, waiting out the end of the world.',
        rendering_and_quality: 'Warm gritty mid-century illustration with dense shelter detail.',
        key_features: 'concrete bunkers; canned-food walls; periscopes; crank radios',
      },
      [
        'A family in a mid-century fallout shelter raises a brass periscope and sees a strange glowing forest has grown over their entire suburb, giant flowers towering above the rooftops. No readable text or logo.',
        'A family has spent twenty years in a fallout shelter and just discovered the alarm was a toaster malfunction. No readable text or logo.',
        'A man winds a hand-crank radio alone in a dim shelter, listening to faint music from somewhere far above. No readable text or logo.',
      ],
    ),
    punk(
      'Reactorpunk',
      'atomic reactor culture punk',
      'reactorpunk',
      {
        aesthetic:
          'Reactorpunk: a culture built around glowing reactors, with blue Cherenkov pools, heavy radiation suits, control rods, cooling towers and reverent technicians.',
        subject_treatment:
          "Keep the prompt's subject and setting; bring in glowing reactor pools, radiation suits, control rods and cooling towers.",
        color_and_tone:
          'Intense Cherenkov blue glow against steel grey, hazard yellow and white suits.',
        lighting_and_shadow: 'Eerie blue underwater glow lighting faces and huge steel halls.',
        texture_and_material:
          'Deep clear water, steel grating, lead doors, rubber suits and concrete.',
        camera_and_composition: 'Looking down into glowing pools or up at vast cooling towers.',
        atmosphere_and_mood: 'Awe-struck and dangerous, a temple built around a caged star.',
        rendering_and_quality:
          'High-contrast glowing illustration with crisp industrial detail and blue glow.',
        key_features: 'Cherenkov blue glow; radiation suits; control rods; cooling towers',
      },
      [
        'Technicians in white suits kneel at the edge of a vast reactor pool glowing brilliant blue, like monks around a sacred spring, as a shadow slowly moves beneath the water. No readable text or logo.',
        'A reactor technician tries to warm his lunch by holding it over the cooling tower steam, and his supervisor watches with deep disappointment. No readable text or logo.',
        'A lone worker sits on a steel catwalk above a blue glowing pool at night, the light rippling softly on her tired face. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
