# Style Preset Category Targets (2026-05-28)

This file defines target category topology for packs that still rely on broad or mismatched categories.

## Global policy

- Category ids: `kebab-case` only.
- Taxonomy ids/tags: English only.
- Prefer category sizes in ~12-35 preset range.
- Avoid catch-all ids (`videojuegos`, `misc`, `other`) in durable manifests.

## Anime family targets

### Target group A: Anime Battle & Worlds

- `modern-shonen-and-action`
- `mecha-and-cyberpunk`
- `isekai-and-high-fantasy`
- `dark-fantasy-and-seinen`
- `action` (from `pack_13`)

### Target group B: Anime Classics & Prestige

- `2000s-classics`
- `90s-golden-era`
- `sports-competition-and-performance`
- `studio-masterpieces`
- `70s-and-80s-retro-anime`
- `samurai-and-medieval` (renamed from `samurai_medieval`)
- `horror`

### Target group C: Anime Character & Lifestyle

- `shojo-magical-girl-and-visionary-classics`
- `slice-of-life-and-moe`
- `anime-style-spectrum`
- `core-anime` (renamed from `core_anime`)
- `slice-of-life-school-music` (renamed from `slice_of_life_school_music`)

## Decomposition targets for legacy `videojuegos` packs

## `pack_01` Photography & Realism

- `portrait-and-studio`
- `lighting-techniques`
- `film-and-analog-process`
- `documentary-and-street`
- `commercial-and-product`
- `nature-and-wildlife`

## `pack_02` Cinematic & Media

- `cinematic-lighting-and-lenses`
- `genre-language`
- `broadcast-and-tv-look`
- `animation-and-media-formats`
- `historical-photo-and-cinema-processes`

## `pack_03` 3D & CGI Rendering

- `hard-surface-and-industrial-cgi`
- `organic-and-character-cgi`
- `environment-and-worldbuilding`
- `lookdev-and-render-pipelines`
- `stylized-3d`

## `pack_04` Illustration & Graphic Novel

- `comics-and-graphic-novel`
- `editorial-illustration`
- `childrens-and-educational`
- `printmaking-and-ink`
- `fantasy-and-concept-illustration`

## `pack_07` Architecture & Interior

- `residential-interiors`
- `commercial-and-public-spaces`
- `historical-and-sacred-architecture`
- `landscape-and-gardens`
- `speculative-and-concept-architecture`

## `pack_09` Texture & Materiality

- `metals-and-minerals`
- `organic-and-bio-materials`
- `fabric-and-soft-materials`
- `surface-wear-and-aging`
- `fx-and-procedural-materiality`

## `pack_11` Miscellaneous & Fun

- `toys-and-miniatures`
- `food-and-commercial-fun`
- `science-and-bio-curiosities`
- `retro-pop-and-kitsch`
- `oddities-and-novelty`

## Migration checklist per pack

For each migrated pack:

1. Update category graph in `packs/<pack>.yaml`.
2. Move `presetRefs` into target categories.
3. Update each affected preset manifest:
   - `category`
   - `tags`
   - `taxonomy.categoryId`
   - `taxonomy.categoryName`
   - `taxonomy.tags`
4. Run `bun run styles:validate -- --pack=<pack_id>`.
5. Run `bun run styles:verify` at batch close.