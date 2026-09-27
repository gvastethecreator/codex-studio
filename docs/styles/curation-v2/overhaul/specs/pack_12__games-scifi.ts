import type { Spec } from '../tools/apply';
import { ga, keep } from './_authors';

// Video game pass, sci-fi frontiers and mech zones: each preset names its game, studio and year
// and states the real render technique and camera. The drowned hall moves to SOMA because the
// art-deco undersea city already lives in the 2000s decade category.
const spec: Spec = {
  pack: 'pack_12',
  category: '3. Sci-Fi Frontiers & Mech Zones',
  updates: Object.fromEntries([
    ga('SP12-003', 'Deserts of Kharak 2016 - Blackbird Desert Carrier RTS', {
      look: 'Blackbird Interactive Homeworld: Deserts of Kharak (2016) look: real-time strategy across vast desert dunes, colossal land carriers, tracked vehicles leaving dust trails and buried alien wrecks.',
      subject:
        'render vehicles and people as small detailed military sci-fi units seen from a high strategy camera.',
      color: 'Desert ochre, dusty tan, steel grey and signal orange.',
      light: 'Harsh desert sun with long dune shadows and dust haze.',
      texture: 'Weathered industrial metal, sand drifts and dust trails.',
      camera: 'High tilted RTS camera over the dunes.',
      mood: 'vast lonely desert warfare',
      render:
        'A 2016 PC frame at 1920 by 1080 from a high strategy camera: small units trailing dust across dunes, a minimap box and unit card shapes at the bottom.',
      key: 'Kharak land carriers; desert dunes; dust trails; RTS camera',
    }),
    ga('SP12-005', 'Alien Isolation 2014 - Creative Assembly Lo-Fi Dread', {
      look: 'Creative Assembly Alien: Isolation (2014) look: first-person survival horror on a 1979 lo-fi retro-futurist station, chunky CRT monitors, analog motion tracker, flickering corridors and film-grain dread.',
      subject:
        'render people as ordinary engineers and crew in worn seventies work clothes, seen from first person.',
      color: 'Sickly green CRT, emergency red, beige plastic and deep shadow.',
      light:
        'Flickering fluorescents, red emergency strobes and pitch-dark vents, all slightly bloomed.',
      texture: 'Chunky beige plastic, grimy metal, film grain and VHS noise.',
      camera: 'First-person view holding an analog motion tracker.',
      mood: 'suffocating hunted dread',
      render:
        'A 2014 first-person frame at 1920 by 1080 with film grain and slight VHS softness: a green motion tracker device held at the bottom.',
      key: 'Alien Isolation lo-fi; motion tracker; CRT green; film grain',
      avoid: ['a black biomechanical alien with an elongated head'],
    }),
    ga('SP12-011', 'SOMA 2015 - Frictional Abyssal Station', {
      look: 'Frictional Games SOMA (2015) look: first-person horror inside a deep-sea research station, flooded industrial corridors, flickering lights, leaking bulkheads and dark abyssal ocean beyond thick windows.',
      subject:
        'render people and machines as uncanny figures in diving suits and cabled machinery, seen from first person.',
      color: 'Abyssal blue-black, sodium orange, rust and cold teal.',
      light: 'Flickering station lights and flashlight beams in dark water.',
      texture: 'Wet rusty metal, cables, algae and fogged glass.',
      camera: 'First-person view through flooded corridors.',
      mood: 'crushing existential dread',
      render:
        'A 2015 first-person frame at 1920 by 1080: flashlight beam in a flooded corridor, fogged glass, no interface at all.',
      key: 'SOMA undersea station; flooded corridors; abyss windows',
      briefs: [
        'Wading through a flooded pressure hall of an abyssal research station in first person, an original diver raises a flashlight as a hulking machine wearing an empty human diving suit stomps through the leaking bulkhead. No readable text or logo.',
        'In an undersea research station lobby, a proud founder bronze bust stands on its pedestal while a small octopus has settled comfortably on its head. No readable text or logo.',
        keep('SP12-011')[2],
      ],
    }),
    ga('SP12-018', 'Defense Grid 2008 - Hidden Path Tower Defense', {
      look: 'Hidden Path Entertainment Defense Grid: The Awakening (2008) look: elevated 3D tower defense on sci-fi citadels, glowing turret beams, alien walkers on winding paths and a glowing power core.',
      subject:
        'render every subject as tower-defense units, turrets and alien walkers seen from above.',
      color: 'Storm blue, turret orange, core cyan and steel grey.',
      light: 'Stormy dark sky with bright colored turret beams and a glowing core.',
      texture:
        'Clean sci-fi metal plating and glowing energy, simple readable shapes seen from above.',
      camera: 'Elevated tower-defense camera over paths.',
      mood: 'tense strategic defense',
      render:
        'A 2008 PC frame at 1280 by 720 from high above: turrets along a winding path, alien walkers marching toward a glowing core.',
      key: 'Defense Grid turrets; alien walkers; glowing core',
    }),
    ga('SP12-023', 'Surviving Mars 2018 - Haemimont Retro-Future Colony', {
      look: 'Haemimont Games Surviving Mars (2018) look: retro-futurist colony builder on red Mars, glass domes linked by tubes, drones, rovers and optimistic fifties space-age design.',
      subject:
        'render people and machines as tiny colonists, drones and rovers among retro-futurist domes.',
      color: 'Mars red, dome glass teal and space-age white.',
      light: 'Dusty butterscotch Mars daylight with long soft shadows and drifting dust.',
      texture: 'Clean white retro-futurist dome panels and glass over rusty red ground.',
      camera: 'Overhead colony builder view.',
      mood: 'optimistic frontier building',
      render:
        'A 2018 PC frame at 1920 by 1080 from a high angle: glass domes, tiny drones and rovers, resource bar shapes along the top.',
      key: 'Surviving Mars domes; retro-futurism; drones; red dust',
    }),
    ga('SP12-033', 'Plants vs Zombies 2009 - PopCap Cartoon Lawn', {
      look: 'PopCap Plants vs. Zombies (2009) look: bright cartoon lawn defense with grid rows, googly-eyed fighting plants, shambling goofy enemies and a suburban house at the left.',
      subject:
        'render every subject as an original goofy cartoon vegetable fighter or shambling cartoon enemy with big eyes.',
      color: 'Lawn green, sunny yellow and dusk purple.',
      light: 'Bright cartoon daylight or cool moonlight, even and cheerful.',
      texture:
        'Flat cartoon shapes with soft simple shading, bouncy outlines and a lawn in checkered green rows.',
      camera: 'Side-on lawn grid view.',
      mood: 'goofy spooky fun',
      render:
        'A 2009 PC frame at 800 by 600: side-on lawn grid with a house at left, a seed-packet bar of blank cards along the top.',
      key: 'PvZ lawn grid; goofy plants; cartoon defense',
      avoid: [
        'a green pea-shooting plant',
        'a smiling sunflower that makes sun',
        'a brown walnut-shaped wall plant with eyes',
        'zombies in brown suits and red ties',
      ],
    }),
    ga('SP12-042', 'Control 2019 - Remedy Brutalist Bureau', {
      look: 'Remedy Entertainment Control (2019) look: third-person paranormal action in a shifting brutalist government building, raw concrete, red astral corruption, telekinesis and floating debris.',
      subject: 'render people as calm bureau agents in plain office clothes wielding telekinesis.',
      color: 'Raw concrete grey, corruption red and fluorescent white.',
      light: 'Clean white office light with a pulsing red glow where the corruption spreads.',
      texture:
        'Raw concrete, office clutter, floating paper and chunks of debris with sharp ray-traced reflections.',
      camera: 'Third-person view in brutalist halls.',
      mood: 'uncanny bureaucratic dread',
      render:
        'A 2019 frame at 1920 by 1080 in third person: agent lifting debris with telekinesis, a thin bar shape bottom left.',
      key: 'Control brutalism; telekinesis; red corruption; floating debris',
      avoid: ['a woman with a shape-shifting service weapon'],
    }),
    ga('SP12-045', 'Generation Zero 2019 - Avalanche Eighties Machine Hunt', {
      look: 'Avalanche Studios Generation Zero (2019) look: first-person survival in 1980s rural Sweden, pine forests, red wooden houses and retrofuturist hunting machines with searchlights.',
      subject:
        'render people as eighties Swedish survivors in windbreakers and denim, and machines as retrofuturist hunters.',
      color: 'Pine green, Swedish red cottage, grey sky and searchlight white.',
      light: 'Overcast Nordic light or dusk with machine searchlights.',
      texture:
        'Realistic pine forest and rusted machine panels, grass and ferns slightly soft in the distance.',
      camera: 'First-person view hiding among trees.',
      mood: 'eerie rural invasion',
      render:
        "A 2019 first-person frame at 1920 by 1080: rifle at bottom right, a machine's searchlight sweeping through pines, a compass strip at the top.",
      key: 'Generation Zero machines; Swedish pines; eighties rural',
    }),
    ga('SP12-046', 'Sable 2021 - Shedworks Moebius Desert', {
      look: 'Shedworks Sable (2021) look: open desert rendered in clean Moebius-style line art with flat color, hoverbikes, ancient beast skeletons, mask culture and huge ruins.',
      subject: 'render people as clean-lined flat-color figures in masks and robes.',
      color: 'Pale sand, sky blue, sunset orange and flat pastel.',
      light: 'Flat shading with no gradients, shadows as clean solid shapes.',
      texture:
        'Clean thin ink outlines around every shape and flat pale color fills, like a moving comic panel.',
      camera: 'Wide third-person desert view.',
      mood: 'serene coming-of-age wander',
      render:
        'A 2021 frame at 1920 by 1080 in third person: outlined desert under a pale sky, a hoverbike, no interface.',
      key: 'Sable Moebius lines; flat color; hoverbike desert',
    }),
    ga('SP12-068', 'Panzer Dragoon 1995 - Team Andromeda Saturn Rail Flight', {
      look: 'Team Andromeda Panzer Dragoon (1995) look: Sega Saturn on-rails flight in early polygon 3D with grainy warped textures, Moebius-inspired alien architecture, biomechanical creature design and hazy golden palettes.',
      subject:
        'build people and creatures from a few large angular flat panels with Moebius costume lines and biomechanical shapes, their outlines jagged against the haze.',
      color: 'Canyon gold, ruin teal and hazy sky.',
      light:
        'Hazy golden light fading everything into haze a short distance away, bright lock-on markers.',
      texture:
        'Shapes are a few large flat panels with sandy textures that wobble and warp as they move, see-through effects drawn as fine dither dots, and distant ruins fading out of golden haze.',
      camera: 'On-rails flight view from behind and above the subject, with lock-on reticles.',
      mood: 'ancient mythic flight',
      render:
        'A 1995 Sega Saturn frame at 320 by 224 on a CRT: grainy, jagged and low in detail, like a period magazine screenshot, not a painted illustration.',
      key: 'Panzer Dragoon rails; grainy warped Saturn 3D; Moebius ruins',
      avoid: ['a blue armored dragon with a lone rider', 'painterly concept art'],
    }),
    ga('SP12-119', 'Titanfall 2 2016 - Respawn Titan Cockpit', {
      look: 'Respawn Entertainment Titanfall 2 (2016) look: first-person view from inside a giant titan mech cockpit, canopy framing, HUD brackets, rain on the glass and industrial frontier cities.',
      subject:
        'render people as pilots inside mech cockpits and machines as colossal industrial walkers.',
      color: 'Industrial grey, cockpit amber and rain blue.',
      light: 'Cockpit instrument glow in amber and rain light through the canopy glass.',
      texture: 'Rain streaks on glass, scratched canopy struts and worn industrial metal outside.',
      camera: 'First-person cockpit canopy view.',
      mood: 'heavy mechanical power',
      render:
        'A 2016 first-person frame at 1920 by 1080 from inside a mech cockpit: canopy frame, bracket and bar shapes projected on the glass.',
      key: 'Titanfall cockpit; mech canopy; rain glass',
      avoid: ['a titan with a single round blue eye'],
    }),
    ga('SP12-120', 'Prey 2017 - Arkane Talos Zero-G', {
      look: 'Arkane Studios Prey (2017) look: neo-deco space station interiors, zero-gravity drifting, shadowy shape-shifting aliens, wrenches and gloo, and Earth through large windows.',
      subject: 'render people as station crew in jumpsuits floating in zero gravity.',
      color: 'Neo-deco gold, walnut wood and space black.',
      light: 'Warm station lighting on wood and brass against the cold glow of space.',
      texture: 'Polished neo-deco panels, walnut and brushed metal, clean and slightly soft.',
      camera: 'First-person drifting view.',
      mood: 'paranoid weightless unease',
      render:
        'A 2017 first-person frame at 1920 by 1080: a wrench in hand, crew floating in a station lobby, small bar shapes bottom left.',
      key: 'Prey neo-deco station; zero gravity; alien shadows',
      avoid: ['black shadow mimic aliens'],
    }),
    ga('SP12-121', 'Stellaris 2016 - Paradox Orbital Planet View', {
      look: 'Paradox Development Studio Stellaris (2016) look: grand strategy planet view from orbit, glowing colony lights, sleek UI rings and route lines, deep space nebulae.',
      subject: 'render every subject as planets, colonies and fleets seen from orbit.',
      color: 'Deep space blue, colony gold and nebula violet.',
      light: 'Starlight rim on planets with glowing city lights on the night side.',
      texture: 'Clean planet surfaces and soft painted nebulae, thin route lines between systems.',
      camera: 'Orbital planet overview.',
      mood: 'vast galactic ambition',
      render:
        'A 2016 PC frame at 1920 by 1080: planet in orbit view, resource icon shapes along the top and an outliner column at the right.',
      key: 'Stellaris orbit; colony lights; route lines',
    }),
    ga('SP12-122', 'Everspace 2 2023 - Rockfish Asteroid Dogfight', {
      look: 'Rockfish Games Everspace 2 (2023) look: vivid space shooter among colorful nebulae and asteroid fields, chase camera behind small ships, flak bursts and salvage wrecks.',
      subject: 'render pilots and ships as small agile craft seen from a chase camera.',
      color: 'Vivid nebula magenta, amber flak and rock grey.',
      light: 'Colorful nebula glow and bright weapon flashes lighting the ships.',
      texture: 'Detailed ship hulls and rocky asteroids with slightly soft modern game detail.',
      camera: 'Chase camera between asteroids.',
      mood: 'daring space action',
      render:
        'A 2023 frame at 1920 by 1080 from a chase camera: small craft among asteroids, a reticle and bar shapes around it.',
      key: 'Everspace nebulae; asteroid dogfight; chase camera',
    }),
    ga('SP12-123', "No Man's Sky 2016 - Hello Games Pulp Planets", {
      look: "Hello Games No Man's Sky (2016) look: procedural alien planets in pulp sci-fi book cover colors, strange floating fauna, rovers, twin suns and saturated skies.",
      subject: 'render explorers and rovers as small figures under saturated alien skies.',
      color: 'Pulp magenta, lime and cyan skies.',
      light: 'Saturated alien sun with thick colored fog and a huge planet in the sky.',
      texture:
        'Stylized alien terrain in bright unreal colors, soft rounded rocks and strange plants.',
      camera: 'Wide photo-mode view.',
      mood: 'wondrous pulp exploration',
      render:
        'A 2016 frame at 1920 by 1080 in first person: pulp-colored alien land, a multitool in hand, compass strip at the top.',
      key: "No Man's Sky pulp colors; alien fauna; rovers",
    }),
    ga('SP12-124', 'Armored Core VI 2023 - FromSoftware Mech Garage', {
      look: 'FromSoftware Armored Core VI: Fires of Rubicon (2023) look: heavy industrial mecha assembly, gantries, part swaps, sparks, grimy hangars and weathered paint.',
      subject: 'render mechs as heavy customizable industrial machines with modular parts.',
      color: 'Industrial grey, hazard yellow and spark orange.',
      light: 'Hangar floodlights and showers of welding sparks in a dark garage.',
      texture: 'Weathered paint, bolts, cables and industrial metal on modular mech parts.',
      camera: 'Low garage view up at a mech.',
      mood: 'heavy mechanical pride',
      render:
        'A 2023 frame at 1920 by 1080: heavy mech in a dark hangar seen low, part list panel shapes at the right without text.',
      key: 'Armored Core garage; modular mech; industrial',
    }),
    ga('SP12-125', 'Starfield 2023 - Bethesda NASA-Punk Scanner', {
      look: 'Bethesda Game Studios Starfield (2023) look: NASA-punk space exploration, scanner visor overlay outlining alien flora and fauna, grounded spacesuits and alien planets.',
      subject: 'render people as explorers in grounded NASA-punk spacesuits scanning alien life.',
      color: 'Scanner cyan outlines over natural alien palettes.',
      light: 'Natural alien sunlight with a cyan scan glow outlining plants and creatures.',
      texture:
        'Realistic alien terrain and chunky grounded spacesuits, slightly soft game-engine detail.',
      camera: 'First-person scanner visor view.',
      mood: 'curious scientific discovery',
      render:
        'A 2023 first-person frame at 1920 by 1080 through a scanner overlay: cyan outlines and corner brackets.',
      key: 'Starfield scanner; NASA-punk; alien flora',
    }),
    ga('SP12-126', 'Oxygen Not Included 2019 - Klei Colony Cutaway', {
      look: 'Klei Entertainment Oxygen Not Included (2019) look: side-view cartoon colony cutaway, tiny round-headed duplicants, pipes and gas overlays, cramped rooms and jaunty hand-drawn style.',
      subject: 'render people as tiny round-headed cartoon colonists with big eyes.',
      color: 'Muted earth, pipe teal and cartoon highlights.',
      light: 'Flat cartoon light inside cutaway rooms dug into rock.',
      texture: 'Hand-drawn cartoon lines, flat colors and cross-section rock layers.',
      camera: 'Side-view colony cutaway.',
      mood: 'busy desperate charm',
      render:
        'A 2019 PC frame at 1920 by 1080: side cutaway of a colony with pipes and ladders, small icon shapes along the top.',
      key: 'ONI cutaway; tiny colonists; pipes and rooms',
    }),
    ga('SP12-127', 'Lost Planet 2006 - Capcom Frozen Frontier', {
      look: 'Capcom Lost Planet: Extreme Condition (2006) look: third-person snowy alien planet, blizzards, thermal energy, giant bug creatures under the ice and heavy mech suits.',
      subject: 'render people as bundled survivors in heavy parkas and mech suits.',
      color: 'Ice white, orange thermal and steel grey.',
      light: 'White blizzard haze with glowing orange heat and thermal energy.',
      texture: 'Snow particles blowing across the screen, ice, and slightly blurry metal textures.',
      camera: 'Third-person view in snowstorms.',
      mood: 'frozen alien peril',
      render:
        'A 2006 Xbox 360 frame at 1280 by 720 in third person: blizzard, giant bugs in haze, a thermal gauge shape at the side.',
      key: 'Lost Planet snow; giant bugs; thermal energy',
    }),
    ga('SP12-128', 'Gravity Rush 2012 - Project Siren Comic Gravity', {
      look: 'Project Siren Gravity Rush (2012) look: cel-shaded comic book gravity shifting, characters falling sideways, floating European town, comic panels and ink crosshatching.',
      subject:
        'render people as cel-shaded comic figures with flowing hair and clothing affected by shifting gravity.',
      color: 'Warm Euro-town ochre, sky blue and ink black.',
      light: 'Soft comic light with ink-hatched shadows.',
      texture:
        'Cel shading with ink crosshatching, flowing hair and clothes pulled by sideways gravity.',
      camera: 'Tilted sideways gravity view.',
      mood: 'dreamy vertiginous freedom',
      render:
        'A 2012 PlayStation Vita frame at 960 by 544: comic cel figure falling sideways past a floating town, a gauge arc at the side.',
      key: 'Gravity Rush sideways gravity; comic cel; floating town',
      avoid: ['a blonde gravity shifter with a black cat'],
    }),
  ]),
};

export default spec;
