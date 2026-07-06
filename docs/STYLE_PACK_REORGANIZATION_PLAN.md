# Style Pack Reorganization Plan V2

This plan reorganizes the Style browser around user intent, while preserving
the current source manifests until migration is safe.

Implementation architecture lives in
[`STYLE_COLLECTION_ARCHITECTURE_PLAN.md`](./STYLE_COLLECTION_ARCHITECTURE_PLAN.md).

## Audit Snapshot

- Source packs: 17.
- Presets: 1,649.
- Categories: 111.
- Current pain: source pack boundaries mix medium, subject, era, workflow,
  fandom/genre, material, and joke/play categories.
- Strongest mixed packs: `pack_02`, `pack_06`, `pack_10`, `pack_11`.
- Strongest merge pressure: anime packs `pack_05`, `pack_13`, `pack_16`.
- Strongest duplicate pressure: photography/lighting, analog processes,
  printmaking, materials, technical imaging, and playful craft materials.

## Core Decision

Use three layers:

1. **Source pack**
   Stable manifest ownership. Keeps current pack ids, preset ids, default
   images, favorites, saved references, and generated runtime chunks stable.
2. **Collection**
   User-facing organization. A collection can include a whole source pack,
   pack category, preset list, or query/facet rule.
3. **Facet**
   Search/filter metadata such as medium, domain, task, era, technique,
   material, world genre, and workflow.

Near-term UI should show collections first and source packs as a secondary
"source view" or advanced/debug view.

## Why Not Move YAML First

The user is open to full renames and structural changes, but source moves touch
many coupled refs:

- `packId`, category refs, pack-level `presetRefs`, category `presetRefs`.
- Runtime generated chunks and search projections.
- Default image paths and thumbnails.
- Favorites and saved user style refs.
- Browser deep links such as `#recipe-styles/pack_04`.

V2 can still be incisive: rename what users see, split collections, add
category/preset cross-links, and defer physical moves until evidence says the
new shape works.

## Target Collections

| Collection id                    | User-facing name                         | Primary source slices                                                                                                                              | Notes                                                      |
| -------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `my_styles`                      | My Styles                                | Virtual SQLite pack                                                                                                                                | Always first or pinned.                                    |
| `photo_optics_science`           | Photography, Optics & Scientific Imaging | `pack_01`; `pack_02/photography-eras`; photo lighting from `pack_02`; technical/micro slices from `pack_11`; selected `pack_10` optical entries    | Replaces accidental Cinema placement for Photography Eras. |
| `cinema_tv_broadcast`            | Cinema, TV & Broadcast                   | `pack_02/film-genres`; `pack_02/tv-and-broadcast`; cinematic lighting subset                                                                       | Do not include Photography Eras.                           |
| `animation_cartoons`             | Animation & Cartoons                     | `pack_02/animation-styles`; most of `pack_02/caricature-and-cartoon-styles`; stop-motion/clay cross-links                                          | Separate from Cinema and Anime.                            |
| `anime_manga`                    | Anime & Manga                            | `pack_05`, `pack_13`, `pack_16`; manga/anime references from `pack_02` and `pack_04`                                                               | One user collection, multiple source packs.                |
| `illustration_comics_publishing` | Illustration, Comics & Publishing        | `pack_04` comics, children's illustration, editorial/poster, concept art; selected zine/cartoon publishing slices                                  | Keep publishing/visual communication together.             |
| `art_media_print`                | Painting, Drawing, Print & Mixed Media   | `pack_06` traditional/drawing/print/mixed; `pack_04/ink-and-print`; `pack_11/artistic-mediums`; selected `pack_10` print systems                   | This is medium-first, not subject-first.                   |
| `cgi_product_render`             | 3D, CGI & Product Render                 | `pack_03`; product/commercial CGI slices; selected game asset/render slices                                                                        | Materials cross-link to Materials, not moved first.        |
| `materials_patterns`             | Materials, Textures & Patterns           | `pack_09`; `pack_10/textile-and-ornamental-patterns`; `pack_10/material-surface-textures`; `pack_08/fabric-and-texture-focus`; `pack_03/materials` | Owns `texture_generate` expansion work.                    |
| `fashion_costume_wearables`      | Fashion, Costume & Wearables             | `pack_08`; digital fashion from `pack_03`; costume/fantasy cross-links                                                                             | Fabric-only entries also surface in Materials.             |
| `architecture_interiors_places`  | Architecture, Interiors & Places         | `pack_07`; architecture photography from `pack_01`; archviz from `pack_03`                                                                         | Fantasy/toy architecture cross-links outward.              |
| `games_ui_worlds`                | Games, UI & Interactive Worlds           | `pack_12`; `pack_06/retro-game-visual-systems`; `pack_06/game-art-directions-and-ui`; selected `pack_17` dungeon/wargame slices                    | Future sprite and UI workflow home.                        |
| `abstract_surreal_glitch`        | Abstract, Surreal, Glitch & Systems      | `pack_10` abstract/glitch/surreal/diagram slices; selected `pack_11/aesthetics`                                                                    | Patterns/materials split out.                              |
| `myth_folklore_dungeon`          | Myth, Folklore & Dungeon Fantasy         | `pack_14`, `pack_17`; fantasy architecture/costume cross-links                                                                                     | `pack_14` should not be hidden as "Noir" only.             |
| `punk_alt_futures`               | Punk & Alternate Futures                 | `pack_15`; punk/aesthetic entries from `pack_11`; subculture slices from `pack_08`                                                                 | Good user-facing collection; source pack mostly coherent.  |
| `play_craft_food_scale`          | Toys, Craft, Food & Scale Play           | `pack_11/toys-and-crafts`; `pack_11/food-and-drink`; toy architecture from `pack_07`; some micro/macro scale play                                  | Replaces "Miscellaneous & Fun" as a real intent.           |

## Pack-by-Pack Diagnosis

| Source pack | Current name                    | Verdict                                  | V2 action                                                                                                                             |
| ----------- | ------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `pack_01`   | Photography & Realism           | Mostly coherent                          | Keep as anchor inside Photography, Optics & Scientific Imaging. Cross-link commercial/product, architecture, technical imaging.       |
| `pack_02`   | Cinematic & Media               | Major mixed pack                         | Split into Cinema/TV, Animation/Cartoons, Photography, shared Lighting/Optics. Rename user-facing source label if still visible.      |
| `pack_03`   | 3D & CGI Rendering              | Mostly coherent with cross-domain slices | Keep source pack. Cross-link materials, archviz, product, game asset, medical/scientific CGI.                                         |
| `pack_04`   | Illustration & Graphic Novel    | Coherent but medium overlaps             | Keep illustration/publishing as primary; cross-link manga to Anime and ink/print to Art Media.                                        |
| `pack_05`   | Anime Battle & Worlds           | Coherent anime sub-vault                 | Hide as separate top-level. Show under Anime & Manga with action/world subgroups.                                                     |
| `pack_06`   | Essential Art Styles            | Mixed pack                               | Split user-facing: Art Media, Digital/Concept, Games/UI. Rename source label to "Art Media & Game Visual Systems" if visible.         |
| `pack_07`   | Architecture & Interior         | Mostly coherent                          | Keep as Architecture, Interiors & Places. Cross-link fantasy/toy architecture.                                                        |
| `pack_08`   | Fashion & Costume               | Coherent                                 | Keep. Cross-link fabrics to Materials and subcultures to Punk/Alt Futures.                                                            |
| `pack_09`   | Texture & Materiality           | Coherent, task-audited                   | Keep as Materials anchor. Elemental/FX needs later object/FX review.                                                                  |
| `pack_10`   | Abstract & Experimental         | Major mixed pack                         | Split into Abstract/Surreal/Glitch, Patterns, Materials, Diagram/Graphic Systems.                                                     |
| `pack_11`   | Miscellaneous & Fun             | Junk drawer                              | Split into Play/Craft/Food, Art Media, Aesthetics/Punk, Scientific Scale/Technical Imaging, Materials. Do not expose "Miscellaneous". |
| `pack_12`   | Video Game Originals Vault      | Coherent but name is source-ish          | Rename user-facing to Games, UI & Interactive Worlds. Cross-link genre/world slices outward.                                          |
| `pack_13`   | Anime Character & Lifestyle     | Coherent anime sub-vault                 | Hide as separate top-level. Show under Anime & Manga with character/lifestyle subgroups.                                              |
| `pack_14`   | Mythic Noir Curated Vault       | Coherent but name too narrow             | Show as Myth, Folklore & Ritual Noir inside Myth/Fantasy collection.                                                                  |
| `pack_15`   | Punk Spectrum Vault             | Coherent                                 | Show as Punk & Alternate Futures. Cross-link subculture/fashion/material aesthetics.                                                  |
| `pack_16`   | Anime Classics & Prestige       | Coherent anime sub-vault with legacy ids | Hide as separate top-level. Normalize visible subgroup order, preserve preset ids.                                                    |
| `pack_17`   | Medieval Fantasy & Dungeon Zine | Coherent                                 | Show under Myth/Fantasy and Games/Dungeon cross-links.                                                                                |

## Category Split Matrix

| Source slice                               | Primary collection                       | Secondary/cross-link                                                            |
| ------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------- |
| `pack_01/portrait-and-studio`              | Photography, Optics & Scientific Imaging | Fashion/character portrait use.                                                 |
| `pack_01/lighting-techniques`              | Photography, Optics & Scientific Imaging | Cinema/TV for cinematic lighting variants.                                      |
| `pack_01/film-and-analog-process`          | Photography, Optics & Scientific Imaging | Art Media for process-heavy alternates.                                         |
| `pack_01/documentary-and-street`           | Photography, Optics & Scientific Imaging | Cinema/TV documentary look.                                                     |
| `pack_01/commercial-and-product`           | Photography, Optics & Scientific Imaging | 3D/Product, Food, Architecture.                                                 |
| `pack_01/nature-and-wildlife`              | Photography, Optics & Scientific Imaging | Worlds/environment.                                                             |
| `pack_01/technical-and-specialist-imaging` | Photography, Optics & Scientific Imaging | Science/Scale and 3D medical visualization.                                     |
| `pack_02/film-genres`                      | Cinema, TV & Broadcast                   | Anime/Manga for Cyberpunk Anime; Illustration for storybook cinema.             |
| `pack_02/tv-and-broadcast`                 | Cinema, TV & Broadcast                   | Glitch/analog systems for VHS/CCTV/emergency broadcast.                         |
| `pack_02/animation-styles`                 | Animation & Cartoons                     | Anime/Manga, Comics, 3D, Games, Painting as specific cross-links.               |
| `pack_02/photography-eras`                 | Photography, Optics & Scientific Imaging | Merge/differentiate against `pack_01`.                                          |
| `pack_02/lighting-and-atmosphere`          | Shared photo/cinema technique            | Needs per-preset split; not Cinema-only.                                        |
| `pack_02/caricature-and-cartoon-styles`    | Animation & Cartoons                     | Illustration/Publishing for zine, newspaper, poster, cave/child drawing slices. |
| `pack_03/render-engines`                   | 3D, CGI & Product Render                 | Games/interactive for real-time engines.                                        |
| `pack_03/materials`                        | 3D, CGI & Product Render                 | Materials, Textures & Patterns.                                                 |
| `pack_03/lighting-and-atmosphere`          | 3D, CGI & Product Render                 | Photo/Cinema lighting.                                                          |
| `pack_03/3d-styles`                        | 3D, CGI & Product Render                 | Games, Toys, Animation.                                                         |
| `pack_03/hard-surface-and-product-cgi`     | 3D, CGI & Product Render                 | Architecture, Games, Product.                                                   |
| `pack_03/organic-character-and-bio-cgi`    | 3D, CGI & Product Render                 | Fashion, Science/Medical, Character workflows.                                  |
| `pack_03/environment-and-worldbuilding`    | 3D, CGI & Product Render                 | Architecture, Games, Myth/Punk worlds.                                          |
| `pack_04/comic-book-styles`                | Illustration, Comics & Publishing        | Anime/Manga.                                                                    |
| `pack_04/childrens-illustration`           | Illustration, Comics & Publishing        | Animation only for animation-like entries.                                      |
| `pack_04/editorial-and-poster`             | Illustration, Comics & Publishing        | Art Media, Punk/Zine.                                                           |
| `pack_04/concept-art`                      | Illustration, Comics & Publishing        | Games, 3D, Architecture, Fashion depending subject.                             |
| `pack_04/ink-and-print`                    | Painting, Drawing, Print & Mixed Media   | Illustration/Publishing.                                                        |
| `pack_05/*`                                | Anime & Manga                            | Games/Fantasy/Mecha as cross-links.                                             |
| `pack_06/traditional-painting`             | Painting, Drawing, Print & Mixed Media   | Illustration.                                                                   |
| `pack_06/drawing-and-sketching`            | Painting, Drawing, Print & Mixed Media   | Illustration.                                                                   |
| `pack_06/printmaking`                      | Painting, Drawing, Print & Mixed Media   | Illustration/Publishing.                                                        |
| `pack_06/digital-art`                      | Illustration, Comics & Publishing        | Abstract/Glitch, Games, Art Media.                                              |
| `pack_06/mixed-media`                      | Painting, Drawing, Print & Mixed Media   | Abstract/Experimental.                                                          |
| `pack_06/retro-game-visual-systems`        | Games, UI & Interactive Worlds           | Abstract/Glitch for display systems.                                            |
| `pack_06/game-art-directions-and-ui`       | Games, UI & Interactive Worlds           | Sprite/task audit needed.                                                       |
| `pack_07/*`                                | Architecture, Interiors & Places         | Fantasy, Toys, Materials as category-specific cross-links.                      |
| `pack_08/*`                                | Fashion, Costume & Wearables             | Materials for fabrics; Punk for subcultures; Myth/Fantasy for costume.          |
| `pack_09/*`                                | Materials, Textures & Patterns           | Elemental/FX review before broad texture task expansion.                        |
| `pack_10/geometric-abstraction`            | Abstract, Surreal, Glitch & Systems      | Art Media.                                                                      |
| `pack_10/fluid-and-organic`                | Abstract, Surreal, Glitch & Systems      | Photo/Macro, Materials for specific entries.                                    |
| `pack_10/digital-glitch-and-noise`         | Abstract, Surreal, Glitch & Systems      | Cinema/TV analog media, Games/UI.                                               |
| `pack_10/surrealism-and-dream`             | Abstract, Surreal, Glitch & Systems      | Myth/Fantasy.                                                                   |
| `pack_10/textile-and-ornamental-patterns`  | Materials, Textures & Patterns           | Fashion.                                                                        |
| `pack_10/material-surface-textures`        | Materials, Textures & Patterns           | 3D/Product.                                                                     |
| `pack_10/diagram-print-and-light-systems`  | Abstract, Surreal, Glitch & Systems      | Art Media, Technical/Science.                                                   |
| `pack_11/toys-and-crafts`                  | Toys, Craft, Food & Scale Play           | 3D/Animation for toy-render styles.                                             |
| `pack_11/artistic-mediums`                 | Painting, Drawing, Print & Mixed Media   | Materials for physical media.                                                   |
| `pack_11/aesthetics`                       | Punk & Alternate Futures                 | Abstract/Surreal for non-punk aesthetics.                                       |
| `pack_11/food-and-drink`                   | Toys, Craft, Food & Scale Play           | Photography/Product.                                                            |
| `pack_11/micro-macro`                      | Photography, Optics & Scientific Imaging | Toys/Scale Play for scale-shift styles.                                         |
| `pack_12/*`                                | Games, UI & Interactive Worlds           | Myth/Fantasy/Punk/Cinema by scene genre.                                        |
| `pack_13/*`                                | Anime & Manga                            | Character/lifestyle subgroups.                                                  |
| `pack_14/*`                                | Myth, Folklore & Dungeon Fantasy         | Architecture/Fashion/Anime by motif as cross-links.                             |
| `pack_15/*`                                | Punk & Alternate Futures                 | Fashion, Architecture, Materials, Games by motif.                               |
| `pack_16/*`                                | Anime & Manga                            | Classics/prestige subgroups.                                                    |
| `pack_17/*`                                | Myth, Folklore & Dungeon Fantasy         | Games/UI for dungeon/wargame, Art Media for zine/ink plates.                    |

## Pack 02 Deep Decision

`pack_02` should not remain one visible top-level category. It contains six
different user intents:

| Category                        | Count | Decision                                                                              |
| ------------------------------- | ----- | ------------------------------------------------------------------------------------- |
| `film-genres`                   | 16    | Cinema, TV & Broadcast.                                                               |
| `tv-and-broadcast`              | 23    | Cinema, TV & Broadcast; maybe Broadcast & Analog Video subcollection later.           |
| `animation-styles`              | 15    | Animation & Cartoons, with Anime/3D/Comics cross-links.                               |
| `photography-eras`              | 15    | Photography, Optics & Scientific Imaging. Not Cinema.                                 |
| `lighting-and-atmosphere`       | 20    | Per-preset split between photo lighting, cinema lighting, optics, atmosphere, and FX. |
| `caricature-and-cartoon-styles` | 39    | Animation & Cartoons, with publishing/art-media exceptions.                           |

Photography Era preset decisions:

| Preset   | Name                       | V2 target           | Note                                       |
| -------- | -------------------------- | ------------------- | ------------------------------------------ |
| SP02-046 | Daguerreotype (1840s)      | Photo Eras          | New analog-era candidate.                  |
| SP02-047 | Tintype (Civil War)        | Photo Eras          | New analog-era candidate.                  |
| SP02-048 | Autochrome (1900s)         | Photo Eras          | New analog-era candidate.                  |
| SP02-049 | Kodachrome (50s)           | Film & Analog       | Overlaps SP01-015.                         |
| SP02-050 | Polaroid (Instant)         | Film & Analog       | Overlaps SP01-016.                         |
| SP02-051 | Disposable Camera (90s)    | Film & Analog       | Overlaps SP01-022.                         |
| SP02-052 | Lomography                 | Film & Analog       | Overlaps SP01-017.                         |
| SP02-053 | Wet Plate Collodion        | Film & Analog       | Duplicates SP01-018.                       |
| SP02-054 | Infrared Film (Aerochrome) | Film & Analog       | Overlaps SP01-019.                         |
| SP02-055 | Cyanotype (Photo)          | Photo Processes     | Also overlaps printmaking/blueprint usage. |
| SP02-056 | Early Digital (2000s)      | Digital Camera Eras | Needs category rethink.                    |
| SP02-057 | Pinhole Camera             | Film & Analog       | Duplicates SP01-026.                       |
| SP02-058 | X-Ray Photography          | Technical Imaging   | Technical, not era.                        |
| SP02-059 | Thermal Camera             | Technical Imaging   | Overlaps SP01-028.                         |
| SP02-060 | Night Vision (Green)       | Technical Imaging   | Can cross-link to surveillance/media look. |

## Duplicate Families To Resolve

Do not blindly delete duplicates. Some are legitimate variants. Add a
`styleFamilyId` or derived duplicate report before manifest moves.

High-priority families:

- Photography/lighting: Golden Hour, Blue Hour, Rembrandt Lighting, Split
  Lighting, Butterfly Lighting, Candlelight, Neon Noir, God Rays, Rim Lighting,
  Silhouette.
- Analog/process: Wet Plate Collodion, Pinhole, Disposable Camera, Infrared
  Film, Kodachrome, Polaroid, Cyanotype.
- Print/drawing: Etching, Screenprint, Monotype, Mezzotint, Aquatint,
  Ballpoint Pen, Colored Pencil, Scratchboard, Rubber Stamp.
- Materials: Carbon Fiber, Porcelain, Gold Leaf, Bubble Wrap, Chainmail,
  Velcro, Sequins, Sandpaper, Sponge, Slime/Goo.
- Technical imaging: X-Ray, Thermal Camera/Thermal Vision, CCTV/Security,
  Microscope/Electron Microscope.
- Style systems: ASCII Art, Low Poly, Voxel Art, Stained Glass, Blueprint,
  Circuit Board, Sticker Art, Tattoo Flash, Solarpunk.

## Recommended UI Shape

Default browser:

1. Pinned row: My Styles, Favorites, Recently Used.
2. Collection groups: Visual Capture, Moving Image, Illustration & Art Media,
   Render/Assets, Design Domains, Worlds/Genres, Experimental/Play.
3. Collection cards show count, task badges, and 3-5 representative presets.
4. Opening a collection shows subgroups from source categories and cross-links.
5. "Source packs" remains available as an advanced/source view.

Advanced browser:

- Facets: medium, domain, task, era, technique, material, world genre, workflow.
- Task filter: Image, Edit, Texture, Sprite, Style Card.
- Duplicate/family indicator when a preset has close siblings.
- Source provenance chip: `pack_02 / photography-eras`, etc.

## Implementation Plan

### Slice 1: Collection Metadata

- Add `StyleCollection` and `StyleCollectionEntry` contracts.
- Entries support:
  - `pack`
  - `category`
  - `preset`
  - `query`
  - `manualGroup`
- Create V2 collection metadata as code or YAML under the style manifests tree.
- Preserve all source pack ids and URLs.

### Slice 2: Collection Landing

- Replace pack-first landing with collection-first landing.
- Keep source pack tab/direct hash compatibility.
- Make `pack_02/photography-eras` appear under Photography, not Cinema.
- Show Anime as one collection with `pack_05`, `pack_13`, `pack_16` nested.

### Slice 3: Facets And Cross-Links

- Add derived facets from collection metadata.
- Support category-level mapping first.
- Add preset-level overrides only for known mixed categories:
  - `pack_02/lighting-and-atmosphere`
  - `pack_02/caricature-and-cartoon-styles`
  - `pack_10/fluid-and-organic`
  - `pack_10/diagram-print-and-light-systems`
  - `pack_11/aesthetics`
  - `pack_11/micro-macro`

### Slice 4: Duplicate Family Audit

- Generate duplicate-family report from normalized names plus manual exceptions.
- Add `styleFamilyId` only after review.
- Distinguish duplicates from variants:
  - exact duplicate
  - narrower variant
  - same technique, different domain
  - same name, different medium

### Slice 5: Task Workflow Expansion

- Continue task audits by collection, not old pack order:
  1. Materials, Textures & Patterns: audit `pack_10`, fabric slices, 3D material slices.
  2. Games, UI & Interactive Worlds: audit sprite/UI candidates in `pack_06` and `pack_12`.
  3. Photography/Science: audit technical imaging vs image-only looks.
  4. Animation/Cartoons/Anime: audit character sheet/reference suitability later.

### Slice 6: Manifest Migration

Only after collection UX is validated:

- Rename visible labels first; keep source ids.
- Add compatibility aliases if any `packId` changes.
- Move YAML only with:
  - updated pack/category refs
  - generated runtime refresh
  - source verify
  - browser smoke
  - saved favorite/user-style compatibility check

## Acceptance

- User sees Photography Eras under Photography, not Cinema.
- Cinema, TV, Animation/Cartoons, and Anime are separate collection surfaces.
- Illustration and Art Media are separate, with cross-links for ink/print.
- Materials owns texture workflow expansion.
- Miscellaneous disappears from user-facing navigation.
- Source pack links like `#recipe-styles/pack_02` still work.
- My Styles remains distinct from official collections.
- Focused checks pass:
  - `bun run styles:runtime:check`
  - `bun run styles:render:verify`
  - `bun run check -- <touched files>`
  - browser smoke after UI changes

## Immediate Next Step

Implement Slice 1 and Slice 2:

1. Add collection contracts and metadata from the architecture plan.
2. Add runtime projection for collection summaries and resolved presets.
3. Add collection-first landing.
4. Preserve source pack direct navigation.
5. Use `pack_02` as the first proof: Photography Eras moves to Photography,
   Cinema/TV separates from Animation/Cartoons, Anime references cross-link
   without manifest moves.
