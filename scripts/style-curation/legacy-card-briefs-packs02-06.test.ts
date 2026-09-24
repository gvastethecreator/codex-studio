import { describe, expect, it } from 'vitest';
import { legacyBriefPacks02to06 } from './legacy-card-briefs-packs02-06';

describe('legacy preview briefs for packs 02 to 06', () => {
  it('returns null outside its assigned packs', () => {
    expect(
      legacyBriefPacks02to06(
        { id: 'pack_01' },
        { id: 'SP01-001', name: 'Studio Headshot', category: '1. Portrait And Studio' },
      ),
    ).toBeNull();
    expect(
      legacyBriefPacks02to06(
        { id: 'pack_07' },
        { id: 'SP07-001', name: 'Warm Modernism', category: '1. Interior Design Systems' },
      ),
    ).toBeNull();
  });

  it('selects content subjects for the real sensor, cartoon, DIY, and rendering categories', () => {
    const cases = [
      [
        { id: 'pack_02' },
        { id: 'SP02-052', name: 'Thermal Camera', category: '7. Sensor And Technical Imaging' },
        /thermal view/i,
      ],
      [
        { id: 'pack_02' },
        {
          id: 'SP02-081',
          name: 'Editorial Caricature',
          category: '6. Caricature And Cartoon Styles',
        },
        /original adult/i,
      ],
      [
        { id: 'pack_02' },
        { id: 'SP02-105', name: 'Paper Theater', category: '8. Hand-Drawn And DIY Media' },
        /handmade|paper|maker|miniature|sketchbook|collage|knitted/i,
      ],
      [
        { id: 'pack_03' },
        { id: 'SP03-007', name: 'KeyShot Product Studio Renderer', category: '1. Render Engines' },
        /headphones|camera|lamp|shoes|bottle|speaker|chair|kettle|controller|helmet|bicycle|poles|grinder|backpack|tool|fan|organizer|watch/i,
      ],
      [
        { id: 'pack_03' },
        { id: 'SP03-043', name: 'X-Ray Shader', category: '7. Sensor And Technical Shaders' },
        /radiographic|radiograph/i,
      ],
      [
        { id: 'pack_03' },
        {
          id: 'SP03-034',
          name: 'Studio Lighting (3 Point)',
          category: '3. Lighting And Atmosphere',
        },
        /key light.*fill.*rim/i,
      ],
    ] as const;

    for (const [pack, preset, expected] of cases) {
      const brief = legacyBriefPacks02to06(pack, preset);
      expect(brief).toMatch(expected);
      expect(brief).not.toMatch(/jar|vase|goku|batman|pikachu/i);
    }
  });

  it('uses technical sheets, anime action, and game interface subjects from pack metadata', () => {
    const technical = legacyBriefPacks02to06(
      { id: 'pack_04' },
      { id: 'SP04-073', name: 'Turnaround Study', category: '6. Technical And Reference Sheets' },
    );
    expect(technical).toMatch(
      /reference sheet|technical breakdown|orthographic|cutaway|character turnaround|parts study|design sheet|process diagram|reference page|teardown sheet|model sheet|diagram/i,
    );

    // This preset ID belongs to pack_05 despite its SP13 prefix in the source catalog.
    const actionSetpiece = legacyBriefPacks02to06(
      { id: 'pack_05' },
      { id: 'SP13-021', name: 'Action Motion Setpiece', category: '5. Action Motion Setpieces' },
    );
    expect(actionSetpiece).toMatch(/original adult/i);
    expect(actionSetpiece).not.toMatch(/goku|batman|pikachu|jar|vase/i);

    const gameUi = legacyBriefPacks02to06(
      { id: 'pack_06' },
      {
        id: 'SP06-110',
        name: 'Chibi Platformer Sprite Bounce HUD',
        category: '7. Game Art Directions & UI',
      },
    );
    expect(gameUi).toMatch(
      /screen|interface|HUD|layout|panel|wheel|menu|grid|overlay|map|selection|shop|dialog|settings/i,
    );
    expect(
      legacyBriefPacks02to06(
        { id: 'pack_06' },
        {
          id: 'SP06-101',
          name: 'JRPG Pixel Diorama Grammar',
          category: '7. Game Art Directions & UI',
        },
      ),
    ).toMatch(/traveler and a small companion/i);
  });

  it('uses original subjects for franchise-named cartoon aesthetics', () => {
    const looney = legacyBriefPacks02to06(
      { id: 'pack_02' },
      {
        id: 'SP02-035',
        name: 'Looney Tunes Chuck Jones Golden Age Cartoon Frenzy',
        category: '3. Animation Styles',
      },
    );
    const cutout = legacyBriefPacks02to06(
      { id: 'pack_02' },
      { id: 'SP02-040', name: 'South Park Style', category: '3. Animation Styles' },
    );
    expect(looney).toMatch(/anteater|platypus|armadillo/i);
    expect(cutout).toMatch(/adult.*cut-paper/i);
  });

  it('uses current-day subjects to show historical photo processes instead of period costumes', () => {
    const idsAndNames = [
      ['SP02-046', 'Daguerreotype (1840s)'],
      ['SP02-047', 'Tintype (Civil War)'],
      ['SP02-048', 'Autochrome (1900s)'],
      ['SP02-049', 'Kodachrome (50s)'],
    ] as const;
    for (const [id, name] of idsAndNames) {
      const brief = legacyBriefPacks02to06(
        { id: 'pack_02' },
        { id, name, category: '4. Photography Eras' },
      );
      expect(brief).toMatch(/contemporary|present-day|modern/i);
      expect(brief).not.toMatch(/nineteenth-century|formal early studio|station wagon/i);
    }
    expect(
      legacyBriefPacks02to06(
        { id: 'pack_02' },
        { id: 'SP02-041', name: 'Rotoscoping', category: '3. Animation Styles' },
      ),
    ).toMatch(/photographic motion.*hand-drawn contours/i);
  });

  it('keeps cartoon previews distinct and avoids the named casts', () => {
    const brief = (id: string, name: string) =>
      legacyBriefPacks02to06(
        { id: 'pack_02' },
        { id, name, category: '6. Caricature And Cartoon Styles' },
      );
    expect(brief('SP02-086', 'Ugly-Cute Creature')).not.toEqual(
      brief('SP02-119', 'Public Pool Mucus Monster Doodle'),
    );
    expect(brief('SP02-112', 'Mike Judge Office Boredom Sketch')).not.toEqual(
      brief('SP02-114', 'Dr. Katz - Squigglevision Therapy Doodle'),
    );
    expect(brief('SP02-109', 'CatDog - Shared-Body Elastic Nonsense')).toMatch(
      /single expressive head/i,
    );
    expect(brief('SP02-110', 'SpongeBob Gross-Up Freeze Frame')).toMatch(/original adult cook/i);
    expect(brief('SP02-111', 'Beavis and Butt-Head - Dumb Couch Slouch')).toMatch(
      /adult ticket clerk/i,
    );
    expect(brief('SP02-117', 'Angela Anaconda Photo-Cutout Menace')).toMatch(
      /adult street sweeper/i,
    );
  });

  it('gives illustration techniques representative visual evidence', () => {
    const cases = [
      [
        'SP04-003',
        'Modern Superhero (Digital)',
        '1. Comic Book Styles',
        /superhero.*digital-comic/i,
      ],
      ['SP04-009', 'Underground Comix', '1. Comic Book Styles', /rough uneven DIY ink/i],
      ['SP04-027', 'Whimsical Ink', "2. Children's Illustration", /black pen contours/i],
      ['SP04-046', 'Speedpaint', '4. Concept Art', /broad fast brushstrokes/i],
    ] as const;
    for (const [id, name, category, expected] of cases) {
      expect(legacyBriefPacks02to06({ id: 'pack_04' }, { id, name, category })).toMatch(expected);
    }
  });

  it('uses varied, genre-specific subjects for every current Film Genres preset', () => {
    const genres = [
      ['SP02-001', 'Film Noir', /investigator|cab driver|train platform/i],
      ['SP02-002', 'Spaghetti Western', /frontier station|western town|stagecoach/i],
      ['SP02-003', '80s Sci-Fi', /astronaut|moonbase|starship/i],
      ['SP02-004', 'Technicolor Musical', /singer|dance pair|ensemble/i],
      ['SP02-005', 'French New Wave', /Paris|cinema|sidewalk table/i],
      ['SP02-006', 'Grindhouse/Exploitation', /muscle car|garage|drive-in/i],
      ['SP02-007', 'Silent Film', /stage magician|theater performer|physical-comedy/i],
      [
        'SP02-008',
        'Found Footage Horror',
        /researchers recording|hiker filming|searching an empty/i,
      ],
      ['SP02-009', 'Kaiju Movie (Suitmation)', /giant sea creature|giant reptilian|horned giant/i],
      [
        'SP02-010',
        'Kung Fu Studio Epic (Shaw Brothers)',
        /martial artists|martial artist|students/i,
      ],
      [
        'SP02-011',
        'Cyberpunk Anime (90s)',
        /motorcycle courier|mechanic repairing|couriers meeting/i,
      ],
      [
        'SP02-012',
        'Wes Anderson Symmetrical Storybook Cinema',
        /bellhop|stationmaster|family group/i,
      ],
      ['SP02-013', 'Blockbuster Teal & Orange', /rescue pilot|rescue boat|climber reaching/i],
      ['SP02-014', 'Giallo Horror', /red-gloved|musician waiting|woman discovering/i],
      ['SP02-015', 'Mumblecore', /roommates|couple sharing|friends talking/i],
      ['SP02-016', 'Space Opera (70s)', /starship crew|pilot standing|crew of original adults/i],
    ] as const;

    for (const [id, name, expected] of genres) {
      const subject = legacyBriefPacks02to06(
        { id: 'pack_02' },
        { id, name, category: '1. Film Genres' },
      );
      expect(subject, `${id} ${name}`).toMatch(expected);
      expect(subject).not.toMatch(/goku|batman|pikachu|jar|vase/i);
    }

    const westernSubject = legacyBriefPacks02to06(
      { id: 'pack_02' },
      { id: 'SP02-002', name: 'Spaghetti Western', category: '1. Film Genres' },
    );
    expect(
      legacyBriefPacks02to06(
        { id: 'pack_02' },
        { id: 'SP02-003', name: 'Spaghetti Western', category: '1. Film Genres' },
      ),
    ).not.toBe(westernSubject);
  });

  it('uses physical material subjects for the current pack 03 Materials presets', () => {
    const materials = [
      ['SP03-011', 'Glass & Crystal', /glass block|crystal prism|glass lens/i],
      [
        'SP03-012',
        'Liquid Simulation',
        /continuous ribbon of clear water|blue liquid stream|heavy droplet|amber liquid stream/i,
      ],
      [
        'SP03-013',
        'Subsurface Scattering (SSS)',
        /orange slice|beeswax candle|peach half|amber resin/i,
      ],
      ['SP03-014', 'Chrome & Metal', /chrome motorcycle helmet|steel hand tool|chrome desk lamp/i],
      ['SP03-016', 'Fur & Hair', /windblown curls|red fox|dark horse/i],
      ['SP03-017', 'Slime & Goo', /gel droplet|gelatinous forms|slime-like mass/i],
      ['SP03-018', 'Carbon Fiber', /carbon-fiber bicycle frame|racing helmet|drone body/i],
      [
        'SP03-019',
        'Hologram',
        /holographic mountain map|holographic human figure|wireframe globe/i,
      ],
      ['SP03-020', 'Porcelain', /porcelain teacup|porcelain bird|porcelain mask|dinner plate/i],
      ['SP03-036', 'Caustics', /swimming pool|glass prism|water rippling/i],
      ['SP03-075', 'Ice Sculpture', /ice arch|ice heron|ice sculpture shaped/i],
      ['SP03-079', 'Bronze Statue', /bronze horse|bronze adult dancer|bronze owl/i],
      ['SP03-080', 'Marble Statue', /marble sculpture|marble horse head|marble hand/i],
    ] as const;

    for (const [id, name, expected] of materials) {
      const subject = legacyBriefPacks02to06(
        { id: 'pack_03' },
        { id, name, category: '2. Materials' },
      );
      expect(subject, `${id} ${name}`).toMatch(expected);
      expect(subject).not.toMatch(/jar|vase/i);
    }

    const liquid = legacyBriefPacks02to06(
      { id: 'pack_03' },
      { id: 'SP03-012', name: 'Liquid Simulation', category: '2. Materials' },
    );
    expect(
      legacyBriefPacks02to06(
        { id: 'pack_03' },
        { id: 'SP03-013', name: 'Liquid Simulation', category: '2. Materials' },
      ),
    ).not.toBe(liquid);
  });

  it('uses representative subjects and preserves required output formats', () => {
    const cases = [
      [
        'pack_02',
        'SP02-027',
        'Weather Channel',
        '2. TV And Broadcast',
        /weather presenter|radar display/i,
      ],
      [
        'pack_02',
        'SP02-021',
        'Hype Williams Fisheye Glam Video',
        '2. TV And Broadcast',
        /singer|dancer/i,
      ],
      ['pack_02', 'SP02-034', 'Laika Moody Stop-Motion', '3. Animation Styles', /puppet|crafted/i],
      [
        'pack_02',
        'SP02-089',
        'Grotesque Meat Puppet',
        '6. Caricature And Cartoon Styles',
        /puppet/i,
      ],
      [
        'pack_02',
        'SP02-093',
        'Prehistoric Cave Painting',
        '8. Hand-Drawn And DIY Media',
        /cave wall|prehistoric/i,
      ],
      ['pack_03', 'SP03-023', 'Isometric 3D', '4. 3D Styles', /isometric/i],
      [
        'pack_03',
        'SP03-037',
        'Ambient Occlusion Pass',
        '3. Lighting And Atmosphere',
        /gray model|geometric blocks/i,
      ],
      [
        'pack_03',
        'SP03-047',
        'Architectural Visualization',
        '5. Hard Surface And Product CGI',
        /interior|library|workshop conversion/i,
      ],
      [
        'pack_03',
        'SP03-053',
        'Jewelry Render',
        '5. Hard Surface And Product CGI',
        /silver ring|gold earrings/i,
      ],
      [
        'pack_03',
        'SP03-049',
        'Character Design (T-Pose)',
        '6. Organic Character And Bio CGI',
        /T-pose/i,
      ],
      [
        'pack_03',
        'SP03-054',
        'Food CGI',
        '6. Organic Character And Bio CGI',
        /citrus fruit|croissant/i,
      ],
      ['pack_03', 'SP03-073', 'Papercraft 3D', '4. 3D Styles', /folded paper|paper city/i],
      [
        'pack_04',
        'SP04-030',
        'Scientific Botanical',
        "2. Children's Illustration",
        /botanical plate|scientific drawing/i,
      ],
      [
        'pack_04',
        'SP04-057',
        'Blueprint Schematic',
        '6. Technical And Reference Sheets',
        /engineering blueprint|technical blueprint/i,
      ],
      [
        'pack_04',
        'SP04-045',
        'Gig Poster (Screenprint)',
        '3. Editorial And Poster',
        /band performing|drummer and guitarist/i,
      ],
      [
        'pack_04',
        'SP04-099',
        'UI/HUD Wireframe Concept',
        '6. Technical And Reference Sheets',
        /wireframe|interface/i,
      ],
      [
        'pack_05',
        'SP05-023',
        'Grand Pirate Adventure',
        '1. Modern Shonen & Action',
        /ship captain|navigator/i,
      ],
      [
        'pack_05',
        'SP05-248',
        'Delicious in Dungeon - Stove-Top Monster Cuisine',
        '3. Isekai & High Fantasy',
        /earthenware plate|ceramic bowls/i,
      ],
      [
        'pack_05',
        'SP05-249',
        'Ascendance of a Bookworm - Printing Press Devotion',
        '3. Isekai & High Fantasy',
        /bookbinder|printing press|hand-printed/i,
      ],
      [
        'pack_05',
        'SP05-224',
        'Sterile Arcology Severity',
        '2. Mecha & Cyberpunk',
        /arcology|enclosed city/i,
      ],
      [
        'pack_05',
        'SP05-253',
        "The Saint's Magic Power Is Omnipotent - Herbarium Court Glow",
        '3. Isekai & High Fantasy',
        /botanist|herbalist/i,
      ],
      [
        'pack_05',
        'SP05-255',
        'Magic Knight Rayearth - Gem-Engine Rescue Quest',
        '3. Isekai & High Fantasy',
        /knight|gear-and-gem engine/i,
      ],
      [
        'pack_05',
        'SP05-273',
        'Luminous Natural Cycle Calm Style',
        '4. Dark Fantasy & Seinen',
        /moonlit|moonlight/i,
      ],
      [
        'pack_06',
        'SP06-085',
        'Visual Novel Screen',
        '6. Retro Game Visual Systems',
        /dialogue screen|dialogue panel/i,
      ],
      [
        'pack_06',
        'SP06-110',
        'Chibi Platformer Sprite Bounce',
        '7. Game Art Directions & UI',
        /game character|adventurer landing/i,
      ],
      [
        'pack_06',
        'SP06-114',
        'Anime Gacha Foil Frame',
        '7. Game Art Directions & UI',
        /collectible card frame|foil card border/i,
      ],
      [
        'pack_06',
        'SP06-120',
        'Boss Encounter Key Art Tension',
        '7. Game Art Directions & UI',
        /guardian|creature/i,
      ],
    ] as const;

    for (const [packId, id, name, category, expected] of cases) {
      const subject = legacyBriefPacks02to06({ id: packId }, { id, name, category });
      expect(subject, `${packId} ${id} ${name}`).toMatch(expected);
      expect(subject).not.toMatch(/goku|batman|pikachu|jar|vase/i);
    }
  });

  it('is deterministic and varies adjacent cards within the same category', () => {
    const pack = { id: 'pack_05' };
    const firstPreset = {
      id: 'SP05-232',
      name: 'Dustfront Drone Lament',
      category: '2. Mecha & Cyberpunk',
    };
    const first = legacyBriefPacks02to06(pack, firstPreset);

    expect(legacyBriefPacks02to06(pack, firstPreset)).toBe(first);
    expect(
      legacyBriefPacks02to06(pack, {
        ...firstPreset,
        id: 'SP05-233',
      }),
    ).not.toBe(first);
  });
});
