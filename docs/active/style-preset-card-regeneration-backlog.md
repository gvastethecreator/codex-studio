# Style Preset Card Regeneration Backlog

> **Note:** This file is a per-preset regeneration log. The intro below and most section headings are translated; per-batch commentary and rationale blocks inside the body remain in Spanish pending a full pass once the regeneration waves settle. Per-preset rows themselves are file paths and need no translation.

## Criterion

Preset default cards are generated as `.webp` in `assets/recipes/styles/defaults/`.
`scripts/generate-style-defaults.ts` builds the prompt from the pack, the category, the `name`, the `visualDna`, the `negativePrompt`, and hash-based deterministic variants.

The exact prompt used for a card is not versioned alongside the asset. The `assets/recipes/styles/defaults/manifest-<pack>.json` manifests store `presetId`, `presetName`, `jobId`, model, mode, and timestamp, but not the full prompt.

Operating rule:

- If `name`, `visualDna`, `avoidRules`, or `attributes.negativePrompt` change, the existing card is considered obsolete.
- Every modified preset must be annotated here with `needs-regeneration` state.
- When regenerating, replace `assets/recipes/styles/defaults/<PRESET_ID>.webp` and update the `manifest-<pack>.json` checkpoint.
- Do not close a visual batch as final if any obsolete cards remain un-annotated.

## Pending regeneration

State: `needs-regeneration`
Common reason: the preset was rewritten from a concrete scene/props into an abstract style applicable to any input prompt or image.

Criterion note: titles, IP names, or work names may stay as a stylistic anchor. The card must still be regenerated when the manifest changes, but the issue is not the IP itself; the issue is when `visualDna` or `creative_brief` force a specific composition, character, location, prop, or event.

## Current verification - 2026-06-09

- Real coverage rechecked with:
  - `bun run styles:validate -- --pack=pack_14 --coverage`
  - `bun run styles:validate -- --pack=pack_15 --coverage`
- Current repo state:
  - `pack_14`: `defaultImages=123/123`, `missingDefaultImages=0`
  - `pack_15`: `defaultImages=137/137`, `missingDefaultImages=0`
- Runtime stale check:
  - `lib/staleStyleDefaultImages.generated.ts` no longer lists any `SP14-*` or `SP15-*` ids.
- Historical failure ledgers still exist:
  - `assets/recipes/styles/defaults/failures-pack_14.json`
  - `assets/recipes/styles/defaults/failures-pack_15.json`
- Interpretation rule:
  - those failure ledgers are historical retry evidence only; they do not currently mean missing or stale cards if coverage is `100%` and stale ids are absent from the generated runtime list.
- Practical priority shift after this checkpoint:
  - visual debt is no longer centered on `pack_14` / `pack_15`;
  - remaining missing default-image coverage now sits in `pack_01` (`81/87`) and `pack_02` (`120/128`).

## Current verification - 2026-06-12

- Real coverage rechecked with:
  - `bun run styles:validate -- --pack=pack_01 --coverage`
  - `bun run styles:validate -- --pack=pack_02 --coverage`
- Current repo state:
  - `pack_01`: `defaultImages=87/87`, `availableDefaultImages=6/87`, `staleDefaultImages=81`, `missingDefaultImages=0`
  - `pack_02`: `defaultImages=128/128`, `availableDefaultImages=8/128`, `staleDefaultImages=120`, `missingDefaultImages=0`
- Exact missing manifests today:
  - `pack_01`: none remaining after `missing_p01_b` and `missing_p01_c`
  - `pack_02`: none remaining after `missing_p02_d`
- Distinction rule for next visual round:
  - `defaultImages` only means a `.webp` file exists on disk;
  - `availableDefaultImages` means the card is not listed in `lib/staleStyleDefaultImages.generated.ts` and can be treated as visually current;
  - `staleDefaultImages` means the UI can still show an image, but it is a known placeholder/obsolete/default card that must be regenerated.
- Practical implication:
  - `pack_01` and `pack_02` have no missing files now, but most of their visible card images are still stale/generic and should remain in the regeneration queue.
- Runtime note from the same checkpoint:
  - current source and `dist` both resolve real preset-level defaults before any pack fallback;
  - if the UI still shows repeated old cards after a rebuild, treat Electron renderer cache as a real suspect, not only asset absence;
  - `electron/main.cjs` now clears renderer cache and cache-storage on startup so fresh `dist` card assets are not masked by stale local renderer state.
- Additional live renderer finding from the same date:
  - the source renderer previously used `import.meta.glob('../assets/recipes/styles/defaults/*.webp', { eager: true })` directly for preset defaults.
  - when new `.webp` files were generated while the dev renderer was already running, that glob-backed module could keep missing the new IDs and the UI fell back to repeated pack preview/default imagery.
  - `scripts/generate-style-runtime-data.ts` now emits `lib/styleDefaultImages.generated.ts` with explicit `?url` imports for every real `SPxx-xxx.webp` file on disk.
  - `lib/recipeAssetCatalog.ts` now consumes that generated catalog, so each image wave only needs `bun run styles:runtime` to refresh the source dependency graph instead of relying on a full renderer restart.
  - verified with `bun run styles:runtime`, `bun run styles:runtime:check`, `bun run check`, and `bun run build:ui`.
- Additional runtime finding from the same date:
  - `preview:electron` opens `dist/index.html` through `file://`.
  - the UI build was still emitting root-relative asset URLs (`/assets/...`) in `dist/index.html` and the compiled JS asset catalog.
  - under `file://`, those root-relative paths do not resolve against `dist/`; they point outside the packaged renderer root and can leave cards/scripts/styles unresolved even when the asset catalog itself is correct.
  - `vite.config.ts` now uses `base: './'`, and a fresh `bun run build:ui` verified `dist/index.html` emits `./assets/...` relative paths.
  - practical implication: for local Electron preview, missing/repeated cards were not only a stale-vs-missing preset issue; build URL strategy itself was a real renderer-level cause.
- Additional UX mitigation from the same checkpoint:
  - when a preset card lacks an exact preset default and the UI falls back to category/pack preview imagery, the Styles grid and catalog search now label that surface as `Preview`.
  - practical implication: repeated fallback art should no longer read as if a real preset-specific default card exists; visual debt remains visible while missing/stale presets are still pending regeneration.

## Current verification - 2026-06-12 (pack_14 / pack_15 recheck)

- Real coverage rechecked with:
  - `bun run styles:validate -- --pack=pack_14 --coverage`
  - `bun run styles:validate -- --pack=pack_15 --coverage`
- Physical asset recheck:
  - `assets/recipes/styles/defaults/` currently contains `123/123` `SP14-*` files and `137/137` `SP15-*` files.
- Runtime stale recheck:
  - `lib/staleStyleDefaultImages.generated.ts` currently contains `0` `SP14-*` ids and `0` `SP15-*` ids.
- Interpretation:
  - `pack_14` and `pack_15` remain closed in real missing/stale operational terms;
  - current visual debt should not spend more cycles there unless a fresh semantic rewrite lands on specific IDs.
- Priority consequence:
  - active visual queue now splits into:
    - real missing defaults in `pack_01` / `pack_02`;
    - stale-by-semantic-change defaults in `pack_08` after the recent audit miniwaves.

### Suggested next visual batches

Run the missing defaults first, in small `2x2` waves:

All missing-default waves for `pack_01` and `pack_02` are now generated.

Operational note:

- do not mix these missing ids with stale-but-present retries in the same session;
- after each successful miniwave, verify the new `.webp` files plus `manifest-pack_01.json` / `manifest-pack_02.json` checkpoints before moving to stale cleanup.

### Visual missing defaults - 2026-06-12 - `pack_01` ola missing_p01_a

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_01 "--preset=SP01-082|SP01-083" --parallel=2 --session-suffix=missing_p01_a --force`
- Result:
  - `generated=2 attempted=2 skipped=85 failed=0 packs=pack_01`
- New files:
  - `assets/recipes/styles/defaults/SP01-082.webp` (`341650` bytes)
  - `assets/recipes/styles/defaults/SP01-083.webp` (`219606` bytes)
- Manifest checkpoint:
  - `manifest-pack_01.json` now includes `SP01-082` / `Seamless Packshot` and `SP01-083` / `Luxury Macro Gleam`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_01 --coverage`
  - `pack_01 defaultImages=83/87 missingDefaultImages=4`
  - remaining real missing ids: `SP01-084`, `SP01-085`, `SP01-086`, `SP01-087`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.
- Runtime visibility follow-up:
  - `SP01-082` and `SP01-083` were removed from the active stale/default table after their files and manifest/YAML links were verified;
  - `bun run styles:runtime` refreshed `lib/staleStyleDefaultImages.generated.ts`;
  - `rg "SP01-082|SP01-083" lib/staleStyleDefaultImages.generated.ts` now returns no matches, while `SP01-084..087` remain as real missing default-card debt;
  - dev UI may still need a Vite/Electron restart to discover newly added `.webp` files because card assets are loaded through `import.meta.glob`.

### Visual missing defaults - 2026-06-12 - `pack_01` ola missing_p01_b

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_01 "--preset=SP01-084|SP01-085" --parallel=2 --session-suffix=missing_p01_b --force`
- Result:
  - `generated=2 attempted=2 skipped=85 failed=0 packs=pack_01`
- New files:
  - `assets/recipes/styles/defaults/SP01-084.webp` (`88368` bytes)
  - `assets/recipes/styles/defaults/SP01-085.webp` (`98586` bytes)
- Manifest checkpoint:
  - `manifest-pack_01.json` now includes `SP01-084` / `Cosmetic Gloss Still Life` and `SP01-085` / `Tech Hardware Hero`.
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual missing defaults - 2026-06-12 - `pack_01` ola missing_p01_c

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_01 "--preset=SP01-086|SP01-087" --parallel=2 --session-suffix=missing_p01_c --force`
- Result:
  - `generated=2 attempted=2 skipped=85 failed=0 packs=pack_01`
- New files:
  - `assets/recipes/styles/defaults/SP01-086.webp` (`351016` bytes)
  - `assets/recipes/styles/defaults/SP01-087.webp` (`254834` bytes)
- Manifest checkpoint:
  - `manifest-pack_01.json` now includes `SP01-086` / `Cold Condensation Commercial` and `SP01-087` / `E-Commerce White Sweep`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_01 --coverage`
  - `pack_01 defaultImages=87/87 missingDefaultImages=0`
- Runtime visibility follow-up:
  - `SP01-084..087` were removed from the active stale/default table after files and manifest/YAML links were verified;
  - regenerate runtime before UI verification so `lib/staleStyleDefaultImages.generated.ts` no longer flags these cards stale.

### Visual missing defaults - 2026-06-12 - `pack_02` ola missing_p02_a

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_02 "--preset=SP02-121|SP02-122" --parallel=2 --session-suffix=missing_p02_a --force`
- Result:
  - `generated=2 attempted=2 skipped=126 failed=0 packs=pack_02`
- New files:
  - `assets/recipes/styles/defaults/SP02-121.webp` (`238930` bytes)
  - `assets/recipes/styles/defaults/SP02-122.webp` (`142656` bytes)
- Manifest checkpoint:
  - `manifest-pack_02.json` now includes `SP02-121` / `Analog Sitcom Multicam` and `SP02-122` / `Local News Chroma Key Package`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_02 --coverage`
  - `pack_02 defaultImages=122/128 missingDefaultImages=6`
  - remaining real missing ids: `SP02-123`, `SP02-124`, `SP02-125`, `SP02-126`, `SP02-127`, `SP02-128`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual missing defaults - 2026-06-12 - `pack_02` ola missing_p02_b

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_02 "--preset=SP02-123|SP02-124" --parallel=2 --session-suffix=missing_p02_b --force`
- Result:
  - `generated=2 attempted=2 skipped=126 failed=0 packs=pack_02`
- New files:
  - `assets/recipes/styles/defaults/SP02-123.webp` (`183728` bytes)
  - `assets/recipes/styles/defaults/SP02-124.webp` (`340684` bytes)
- Manifest checkpoint:
  - `manifest-pack_02.json` now includes `SP02-123` / `Public Access Cable Crawl` and `SP02-124` / `VHS Sports Replay Broadcast`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_02 --coverage`
  - `pack_02 defaultImages=124/128 missingDefaultImages=4`
  - remaining real missing ids: `SP02-125`, `SP02-126`, `SP02-127`, `SP02-128`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual missing defaults - 2026-06-12 - `pack_02` ola missing_p02_c

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_02 "--preset=SP02-125|SP02-126" --parallel=2 --session-suffix=missing_p02_c --force`
- Result:
  - `generated=2 attempted=2 skipped=126 failed=0 packs=pack_02`
- New files:
  - `assets/recipes/styles/defaults/SP02-125.webp` (`327462` bytes)
  - `assets/recipes/styles/defaults/SP02-126.webp` (`301686` bytes)
- Manifest checkpoint:
  - `manifest-pack_02.json` now includes `SP02-125` / `Weather Radar Doppler Graphic` and `SP02-126` / `Late Night Infomercial Gloss`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_02 --coverage`
  - `pack_02 defaultImages=126/128 missingDefaultImages=2`
  - remaining real missing ids: `SP02-127`, `SP02-128`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual missing defaults - 2026-06-12 - `pack_02` ola missing_p02_d

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_02 "--preset=SP02-127|SP02-128" --parallel=2 --session-suffix=missing_p02_d --force`
- Result:
  - `generated=2 attempted=2 skipped=126 failed=0 packs=pack_02`
- New files:
  - `assets/recipes/styles/defaults/SP02-127.webp` (`164568` bytes)
  - `assets/recipes/styles/defaults/SP02-128.webp` (`349524` bytes)
- Manifest checkpoint:
  - `manifest-pack_02.json` now includes `SP02-127` / `Interlaced Music Video Glow` and `SP02-128` / `Emergency Broadcast Signal Break`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_02 --coverage`
  - `pack_02 defaultImages=128/128 missingDefaultImages=0`
  - no real missing default ids remain in `pack_02`.
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_a

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-011|SP08-015" --parallel=2 --session-suffix=stale_p08_a --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-011.webp` (`259044` bytes)
  - `assets/recipes/styles/defaults/SP08-015.webp` (`380498` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-011` / `Vintage 1950s` and `SP08-015` / `Cosplay Anime`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_b

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-020|SP08-072" --parallel=2 --session-suffix=stale_p08_b --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-020.webp` (`390796` bytes)
  - `assets/recipes/styles/defaults/SP08-072.webp` (`397278` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-020` / `Red Carpet Gown` and `SP08-072` / `Tattoo Skin`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_c

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-030|SP08-034" --parallel=2 --session-suffix=stale_p08_c --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-030.webp` (`325384` bytes)
  - `assets/recipes/styles/defaults/SP08-034.webp` (`348536` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-030` / `Raver (90s)` and `SP08-034` / `Roman Gladiator`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_d

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-063|SP08-070" --parallel=2 --session-suffix=stale_p08_d --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-063.webp` (`359110` bytes)
  - `assets/recipes/styles/defaults/SP08-070.webp` (`422860` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-063` / `Feathers` and `SP08-070` / `Fire Dress`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_e

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-057|SP08-064" --parallel=2 --session-suffix=stale_p08_e --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-057.webp` (`348674` bytes)
  - `assets/recipes/styles/defaults/SP08-064.webp` (`545788` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-057` / `Tweed Suit` and `SP08-064` / `Burlap/Rags`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_f

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-066|SP08-071" --parallel=2 --session-suffix=stale_p08_f --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-066.webp` (`221566` bytes)
  - `assets/recipes/styles/defaults/SP08-071.webp` (`267360` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-066` / `Origami Paper` and `SP08-071` / `Porcelain Doll`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_g

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-062|SP08-068" --parallel=2 --session-suffix=stale_p08_g --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-062.webp` (`247766` bytes)
  - `assets/recipes/styles/defaults/SP08-068.webp` (`281822` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-062` / `Leather Armor` and `SP08-068` / `Smoke Dress`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_h

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-069|SP08-074" --parallel=2 --session-suffix=stale_p08_h --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-069.webp` (`315716` bytes)
  - `assets/recipes/styles/defaults/SP08-074.webp` (`281424` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-069` / `Water Dress` and `SP08-074` / `Bandage/Mummy`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_i

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-065|SP08-067" --parallel=2 --session-suffix=stale_p08_i --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-065.webp` (`277706` bytes)
  - `assets/recipes/styles/defaults/SP08-067.webp` (`388986` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-065` / `Neon Light Suit` and `SP08-067` / `Bubble Wrap`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_j

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-077|SP08-078" --parallel=2 --session-suffix=stale_p08_j --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-077.webp` (`261528` bytes)
  - `assets/recipes/styles/defaults/SP08-078.webp` (`270562` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-077` / `Stone Statue` and `SP08-078` / `Hologram`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_k

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-001|SP08-002" --parallel=2 --session-suffix=stale_p08_k --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-001.webp` (`217028` bytes)
  - `assets/recipes/styles/defaults/SP08-002.webp` (`185244` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-001` / `Haute Couture` and `SP08-002` / `Streetwear Hypebeast`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_l

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-003|SP08-004" --parallel=2 --session-suffix=stale_p08_l --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-003.webp` (`144934` bytes)
  - `assets/recipes/styles/defaults/SP08-004.webp` (`396210` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-003` / `Minimalist Chic` and `SP08-004` / `Boho Festival`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_m

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-005|SP08-006" --parallel=2 --session-suffix=stale_p08_m --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-005.webp` (`171034` bytes)
  - `assets/recipes/styles/defaults/SP08-006.webp` (`151696` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-005` / `Athleisure Sport` and `SP08-006` / `Cyberpunk Techwear`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_n

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-007|SP08-008" --parallel=2 --session-suffix=stale_p08_n --force`
- Result:
  - shell command timed out after `604028ms`, but post-timeout verification showed the app-server healthy, `activeWorkerCount=0`, and both target files refreshed on disk.
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-007.webp` (`183208` bytes)
  - `assets/recipes/styles/defaults/SP08-008.webp` (`379822` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-007` / `Goth Darkwave` and `SP08-008` / `Punk Rock`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_o

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-009|SP08-010" --parallel=2 --session-suffix=stale_p08_o --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-009.webp` (`372496` bytes)
  - `assets/recipes/styles/defaults/SP08-010.webp` (`250934` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-009` / `Steampunk Inventor` and `SP08-010` / `Preppy Ivy League`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_p

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-012|SP08-013" --parallel=2 --session-suffix=stale_p08_p --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-012.webp` (`400156` bytes)
  - `assets/recipes/styles/defaults/SP08-013.webp` (`334314` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-012` / `Renaissance Royal` and `SP08-013` / `Ethereal Fantasy`.
- Coverage after wave:
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_q

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-014|SP08-016" --parallel=2 --session-suffix=stale_p08_q --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-014.webp` (`279696` bytes)
  - `assets/recipes/styles/defaults/SP08-016.webp` (`287222` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-014` / `Military Surplus` and `SP08-016` / `Normcore`.
- Coverage after wave:
  - `bun run styles:runtime:check`
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_r

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-017|SP08-018" --parallel=2 --session-suffix=stale_p08_r --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-017.webp` (`158660` bytes)
  - `assets/recipes/styles/defaults/SP08-018.webp` (`279102` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-017` / `Tech-Industry Uniform` and `SP08-018` / `Pop-Performance Tailoring`.
- Coverage after wave:
  - `bun run styles:runtime:check`
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_s

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-019|SP08-021" --parallel=2 --session-suffix=stale_p08_s --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-019.webp` (`329110` bytes)
  - `assets/recipes/styles/defaults/SP08-021.webp` (`328810` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-019` / `Business Casual` and `SP08-021` / `Pastel Goth`.
- Coverage after wave:
  - `bun run styles:runtime:check`
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_t

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-022|SP08-023" --parallel=2 --session-suffix=stale_p08_t --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-022.webp` (`229100` bytes)
  - `assets/recipes/styles/defaults/SP08-023.webp` (`367944` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-022` / `Grunge (90s)` and `SP08-023` / `Lolita Fashion`.
- Coverage after wave:
  - `bun run styles:runtime:check`
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_u

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-024|SP08-025" --parallel=2 --session-suffix=stale_p08_u --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-024.webp` (`365848` bytes)
  - `assets/recipes/styles/defaults/SP08-025.webp` (`400278` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-024` / `Rockabilly` and `SP08-025` / `Hippie (60s)`.
- Coverage after wave:
  - `bun run styles:runtime:check`
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_v

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-026|SP08-027" --parallel=2 --session-suffix=stale_p08_v --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-026.webp` (`317812` bytes)
  - `assets/recipes/styles/defaults/SP08-027.webp` (`232076` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-026` / `Biker Gang` and `SP08-027` / `Skater Style`.
- Coverage after wave:
  - `bun run styles:runtime:check`
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 availableDefaultImages=51/80 staleDefaultImages=29 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_w

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-028|SP08-029" --parallel=2 --session-suffix=stale_p08_w --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-028.webp` (`325456` bytes)
  - `assets/recipes/styles/defaults/SP08-029.webp` (`327126` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-028` / `Cottagecore` and `SP08-029` / `Dark Academia`.
- Coverage after wave:
  - `bun run styles:runtime:check`
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 availableDefaultImages=53/80 staleDefaultImages=27 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_x

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-031|SP08-032" --parallel=2 --session-suffix=stale_p08_x --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-031.webp` (`367342` bytes)
  - `assets/recipes/styles/defaults/SP08-032.webp` (`245336` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-031` / `Roaring 20s (Flapper)` and `SP08-032` / `Victorian Mourning`.
- Coverage after wave:
  - `bun run styles:runtime:check`
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 availableDefaultImages=55/80 staleDefaultImages=25 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_y

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-033|SP08-035" --parallel=2 --session-suffix=stale_p08_y --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-033.webp` (`431838` bytes)
  - `assets/recipes/styles/defaults/SP08-035.webp` (`375530` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-033` / `Ancient Egyptian` and `SP08-035` / `Samurai Armor`.
- Coverage after wave:
  - `bun run styles:runtime:check`
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 availableDefaultImages=57/80 staleDefaultImages=23 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_z

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-038|SP08-039" --parallel=2 --session-suffix=stale_p08_z --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-038.webp` (`348324` bytes)
  - `assets/recipes/styles/defaults/SP08-039.webp` (`412692` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-038` / `Disco (70s)` and `SP08-039` / `French Revolution`.
- Coverage after wave:
  - `bun run styles:runtime:check`
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 availableDefaultImages=59/80 staleDefaultImages=21 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_aa

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-040|SP08-042" --parallel=2 --session-suffix=stale_p08_aa --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-040.webp` (`332804` bytes)
  - `assets/recipes/styles/defaults/SP08-042.webp` (`417270` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-040` / `Space Suit (Retro)` and `SP08-042` / `Post-Apocalyptic Scavenger`.
- Coverage after wave:
  - `bun run styles:runtime:check`
  - `bun run styles:validate -- --pack=pack_08 --coverage`
  - `pack_08 defaultImages=80/80 availableDefaultImages=61/80 staleDefaultImages=19 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

## Semantic refresh - 2026-06-11

- `pack_08` recibió una miniola semántica adicional en:
  - `SP08-011`
  - `SP08-015`
  - `SP08-020`
  - `SP08-072`
- Motivo operativo:
  - esos cuatro manifests seguían demasiado atados a cuerpo, celebridad/evento, personaje replicado o torso/superficie humana obligatoria.
- Efecto sobre backlog visual:
  - sus cards quedan otra vez en prioridad de regeneración dentro de `pack_08`, incluso si el pack ya tiene cobertura `defaultImages=80/80`, porque el cambio actual es de semántica visual y no de presencia/ausencia de asset.

- Segunda miniola del mismo día en `pack_08`:
  - `SP08-030`
  - `SP08-034`
  - `SP08-063`
  - `SP08-070`
- Motivo operativo:
  - seguían demasiado pegados a escena/evento literal, performer body o referencia IP/ritual demasiado frontal.
- Efecto:
  - esas 4 cards también quedan re-priorizadas para regeneración visual dentro de `pack_08`.

- Tercera miniola del mismo día en `pack_08`:
  - `SP08-057`
  - `SP08-064`
  - `SP08-066`
  - `SP08-071`
- Motivo operativo:
  - todavía cargaban demasiado rol literal, garment-body demasiado específico o materialidad narrada como objeto/figura fija.
- Efecto:
  - esas 4 cards también quedan re-priorizadas para regeneración visual dentro de `pack_08`.

- Cuarta miniola del mismo día en `pack_08`:
  - `SP08-062`
  - `SP08-068`
  - `SP08-069`
  - `SP08-074`
- Motivo operativo:
  - seguían demasiado pegados a cuerpo, criatura, escena elemental o setup de horror literal.
- Efecto:
  - esas 4 cards también quedan re-priorizadas para regeneración visual dentro de `pack_08`.

- Quinta miniola del mismo día en `pack_08`:
  - `SP08-065`
  - `SP08-067`
  - `SP08-077`
  - `SP08-078`
- Motivo operativo:
  - todavía retenían wearer/body logic, estatua humana fija o proyección figurativa demasiado frontal para una gramática realmente transferible.
- Efecto:
  - esas 4 cards también quedan re-priorizadas para regeneración visual dentro de `pack_08`.

- Sexta miniola del mismo día en `pack_08`:
  - `SP08-075`
  - `SP08-076`
  - `SP08-079`
  - `SP08-080`
- Motivo operativo:
  - todavía retenían body-conforming logic, wearer implication o figura humana residual dentro de materiales de concealment, gilding o sombra.
- Efecto:
  - esas 4 cards también quedan re-priorizadas para regeneración visual dentro de `pack_08`.

- Miniola adicional de verificación fina en `pack_07`:
  - `SP07-041`
  - `SP07-052`
  - `SP07-067`
  - `SP07-080`
- Motivo operativo:
  - seguían cargando heroicidad implicita, anchor racial demasiado cerrado o escena espacial/paisajistica todavía demasiado concreta.
- Efecto:
  - esas 4 cards también quedan re-priorizadas para regeneración visual dentro de `pack_07`.

### pack_01

| Preset   | Manifest                                                            | Default card                                   |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SP01-001 | `components/recipes/styles/manifests/presets/pack_01/SP01-001.yaml` | `assets/recipes/styles/defaults/SP01-001.webp` |
| SP01-002 | `components/recipes/styles/manifests/presets/pack_01/SP01-002.yaml` | `assets/recipes/styles/defaults/SP01-002.webp` |
| SP01-003 | `components/recipes/styles/manifests/presets/pack_01/SP01-003.yaml` | `assets/recipes/styles/defaults/SP01-003.webp` |
| SP01-004 | `components/recipes/styles/manifests/presets/pack_01/SP01-004.yaml` | `assets/recipes/styles/defaults/SP01-004.webp` |
| SP01-005 | `components/recipes/styles/manifests/presets/pack_01/SP01-005.yaml` | `assets/recipes/styles/defaults/SP01-005.webp` |
| SP01-006 | `components/recipes/styles/manifests/presets/pack_01/SP01-006.yaml` | `assets/recipes/styles/defaults/SP01-006.webp` |
| SP01-007 | `components/recipes/styles/manifests/presets/pack_01/SP01-007.yaml` | `assets/recipes/styles/defaults/SP01-007.webp` |
| SP01-008 | `components/recipes/styles/manifests/presets/pack_01/SP01-008.yaml` | `assets/recipes/styles/defaults/SP01-008.webp` |
| SP01-009 | `components/recipes/styles/manifests/presets/pack_01/SP01-009.yaml` | `assets/recipes/styles/defaults/SP01-009.webp` |
| SP01-010 | `components/recipes/styles/manifests/presets/pack_01/SP01-010.yaml` | `assets/recipes/styles/defaults/SP01-010.webp` |
| SP01-011 | `components/recipes/styles/manifests/presets/pack_01/SP01-011.yaml` | `assets/recipes/styles/defaults/SP01-011.webp` |
| SP01-012 | `components/recipes/styles/manifests/presets/pack_01/SP01-012.yaml` | `assets/recipes/styles/defaults/SP01-012.webp` |
| SP01-013 | `components/recipes/styles/manifests/presets/pack_01/SP01-013.yaml` | `assets/recipes/styles/defaults/SP01-013.webp` |
| SP01-014 | `components/recipes/styles/manifests/presets/pack_01/SP01-014.yaml` | `assets/recipes/styles/defaults/SP01-014.webp` |
| SP01-015 | `components/recipes/styles/manifests/presets/pack_01/SP01-015.yaml` | `assets/recipes/styles/defaults/SP01-015.webp` |
| SP01-016 | `components/recipes/styles/manifests/presets/pack_01/SP01-016.yaml` | `assets/recipes/styles/defaults/SP01-016.webp` |
| SP01-017 | `components/recipes/styles/manifests/presets/pack_01/SP01-017.yaml` | `assets/recipes/styles/defaults/SP01-017.webp` |
| SP01-018 | `components/recipes/styles/manifests/presets/pack_01/SP01-018.yaml` | `assets/recipes/styles/defaults/SP01-018.webp` |
| SP01-019 | `components/recipes/styles/manifests/presets/pack_01/SP01-019.yaml` | `assets/recipes/styles/defaults/SP01-019.webp` |
| SP01-020 | `components/recipes/styles/manifests/presets/pack_01/SP01-020.yaml` | `assets/recipes/styles/defaults/SP01-020.webp` |
| SP01-021 | `components/recipes/styles/manifests/presets/pack_01/SP01-021.yaml` | `assets/recipes/styles/defaults/SP01-021.webp` |
| SP01-022 | `components/recipes/styles/manifests/presets/pack_01/SP01-022.yaml` | `assets/recipes/styles/defaults/SP01-022.webp` |
| SP01-023 | `components/recipes/styles/manifests/presets/pack_01/SP01-023.yaml` | `assets/recipes/styles/defaults/SP01-023.webp` |
| SP01-024 | `components/recipes/styles/manifests/presets/pack_01/SP01-024.yaml` | `assets/recipes/styles/defaults/SP01-024.webp` |
| SP01-025 | `components/recipes/styles/manifests/presets/pack_01/SP01-025.yaml` | `assets/recipes/styles/defaults/SP01-025.webp` |
| SP01-026 | `components/recipes/styles/manifests/presets/pack_01/SP01-026.yaml` | `assets/recipes/styles/defaults/SP01-026.webp` |
| SP01-027 | `components/recipes/styles/manifests/presets/pack_01/SP01-027.yaml` | `assets/recipes/styles/defaults/SP01-027.webp` |
| SP01-028 | `components/recipes/styles/manifests/presets/pack_01/SP01-028.yaml` | `assets/recipes/styles/defaults/SP01-028.webp` |
| SP01-029 | `components/recipes/styles/manifests/presets/pack_01/SP01-029.yaml` | `assets/recipes/styles/defaults/SP01-029.webp` |
| SP01-030 | `components/recipes/styles/manifests/presets/pack_01/SP01-030.yaml` | `assets/recipes/styles/defaults/SP01-030.webp` |
| SP01-031 | `components/recipes/styles/manifests/presets/pack_01/SP01-031.yaml` | `assets/recipes/styles/defaults/SP01-031.webp` |
| SP01-032 | `components/recipes/styles/manifests/presets/pack_01/SP01-032.yaml` | `assets/recipes/styles/defaults/SP01-032.webp` |
| SP01-033 | `components/recipes/styles/manifests/presets/pack_01/SP01-033.yaml` | `assets/recipes/styles/defaults/SP01-033.webp` |
| SP01-034 | `components/recipes/styles/manifests/presets/pack_01/SP01-034.yaml` | `assets/recipes/styles/defaults/SP01-034.webp` |
| SP01-035 | `components/recipes/styles/manifests/presets/pack_01/SP01-035.yaml` | `assets/recipes/styles/defaults/SP01-035.webp` |
| SP01-036 | `components/recipes/styles/manifests/presets/pack_01/SP01-036.yaml` | `assets/recipes/styles/defaults/SP01-036.webp` |
| SP01-037 | `components/recipes/styles/manifests/presets/pack_01/SP01-037.yaml` | `assets/recipes/styles/defaults/SP01-037.webp` |
| SP01-038 | `components/recipes/styles/manifests/presets/pack_01/SP01-038.yaml` | `assets/recipes/styles/defaults/SP01-038.webp` |
| SP01-039 | `components/recipes/styles/manifests/presets/pack_01/SP01-039.yaml` | `assets/recipes/styles/defaults/SP01-039.webp` |
| SP01-040 | `components/recipes/styles/manifests/presets/pack_01/SP01-040.yaml` | `assets/recipes/styles/defaults/SP01-040.webp` |
| SP01-041 | `components/recipes/styles/manifests/presets/pack_01/SP01-041.yaml` | `assets/recipes/styles/defaults/SP01-041.webp` |
| SP01-042 | `components/recipes/styles/manifests/presets/pack_01/SP01-042.yaml` | `assets/recipes/styles/defaults/SP01-042.webp` |
| SP01-043 | `components/recipes/styles/manifests/presets/pack_01/SP01-043.yaml` | `assets/recipes/styles/defaults/SP01-043.webp` |
| SP01-044 | `components/recipes/styles/manifests/presets/pack_01/SP01-044.yaml` | `assets/recipes/styles/defaults/SP01-044.webp` |
| SP01-045 | `components/recipes/styles/manifests/presets/pack_01/SP01-045.yaml` | `assets/recipes/styles/defaults/SP01-045.webp` |
| SP01-046 | `components/recipes/styles/manifests/presets/pack_01/SP01-046.yaml` | `assets/recipes/styles/defaults/SP01-046.webp` |
| SP01-047 | `components/recipes/styles/manifests/presets/pack_01/SP01-047.yaml` | `assets/recipes/styles/defaults/SP01-047.webp` |
| SP01-048 | `components/recipes/styles/manifests/presets/pack_01/SP01-048.yaml` | `assets/recipes/styles/defaults/SP01-048.webp` |
| SP01-049 | `components/recipes/styles/manifests/presets/pack_01/SP01-049.yaml` | `assets/recipes/styles/defaults/SP01-049.webp` |
| SP01-050 | `components/recipes/styles/manifests/presets/pack_01/SP01-050.yaml` | `assets/recipes/styles/defaults/SP01-050.webp` |
| SP01-051 | `components/recipes/styles/manifests/presets/pack_01/SP01-051.yaml` | `assets/recipes/styles/defaults/SP01-051.webp` |
| SP01-052 | `components/recipes/styles/manifests/presets/pack_01/SP01-052.yaml` | `assets/recipes/styles/defaults/SP01-052.webp` |
| SP01-053 | `components/recipes/styles/manifests/presets/pack_01/SP01-053.yaml` | `assets/recipes/styles/defaults/SP01-053.webp` |
| SP01-054 | `components/recipes/styles/manifests/presets/pack_01/SP01-054.yaml` | `assets/recipes/styles/defaults/SP01-054.webp` |
| SP01-055 | `components/recipes/styles/manifests/presets/pack_01/SP01-055.yaml` | `assets/recipes/styles/defaults/SP01-055.webp` |
| SP01-056 | `components/recipes/styles/manifests/presets/pack_01/SP01-056.yaml` | `assets/recipes/styles/defaults/SP01-056.webp` |
| SP01-057 | `components/recipes/styles/manifests/presets/pack_01/SP01-057.yaml` | `assets/recipes/styles/defaults/SP01-057.webp` |
| SP01-058 | `components/recipes/styles/manifests/presets/pack_01/SP01-058.yaml` | `assets/recipes/styles/defaults/SP01-058.webp` |
| SP01-059 | `components/recipes/styles/manifests/presets/pack_01/SP01-059.yaml` | `assets/recipes/styles/defaults/SP01-059.webp` |
| SP01-060 | `components/recipes/styles/manifests/presets/pack_01/SP01-060.yaml` | `assets/recipes/styles/defaults/SP01-060.webp` |
| SP01-061 | `components/recipes/styles/manifests/presets/pack_01/SP01-061.yaml` | `assets/recipes/styles/defaults/SP01-061.webp` |
| SP01-062 | `components/recipes/styles/manifests/presets/pack_01/SP01-062.yaml` | `assets/recipes/styles/defaults/SP01-062.webp` |
| SP01-063 | `components/recipes/styles/manifests/presets/pack_01/SP01-063.yaml` | `assets/recipes/styles/defaults/SP01-063.webp` |
| SP01-064 | `components/recipes/styles/manifests/presets/pack_01/SP01-064.yaml` | `assets/recipes/styles/defaults/SP01-064.webp` |
| SP01-065 | `components/recipes/styles/manifests/presets/pack_01/SP01-065.yaml` | `assets/recipes/styles/defaults/SP01-065.webp` |
| SP01-066 | `components/recipes/styles/manifests/presets/pack_01/SP01-066.yaml` | `assets/recipes/styles/defaults/SP01-066.webp` |
| SP01-067 | `components/recipes/styles/manifests/presets/pack_01/SP01-067.yaml` | `assets/recipes/styles/defaults/SP01-067.webp` |
| SP01-068 | `components/recipes/styles/manifests/presets/pack_01/SP01-068.yaml` | `assets/recipes/styles/defaults/SP01-068.webp` |
| SP01-069 | `components/recipes/styles/manifests/presets/pack_01/SP01-069.yaml` | `assets/recipes/styles/defaults/SP01-069.webp` |
| SP01-070 | `components/recipes/styles/manifests/presets/pack_01/SP01-070.yaml` | `assets/recipes/styles/defaults/SP01-070.webp` |
| SP01-071 | `components/recipes/styles/manifests/presets/pack_01/SP01-071.yaml` | `assets/recipes/styles/defaults/SP01-071.webp` |
| SP01-072 | `components/recipes/styles/manifests/presets/pack_01/SP01-072.yaml` | `assets/recipes/styles/defaults/SP01-072.webp` |
| SP01-073 | `components/recipes/styles/manifests/presets/pack_01/SP01-073.yaml` | `assets/recipes/styles/defaults/SP01-073.webp` |
| SP01-074 | `components/recipes/styles/manifests/presets/pack_01/SP01-074.yaml` | `assets/recipes/styles/defaults/SP01-074.webp` |
| SP01-075 | `components/recipes/styles/manifests/presets/pack_01/SP01-075.yaml` | `assets/recipes/styles/defaults/SP01-075.webp` |
| SP01-076 | `components/recipes/styles/manifests/presets/pack_01/SP01-076.yaml` | `assets/recipes/styles/defaults/SP01-076.webp` |
| SP01-077 | `components/recipes/styles/manifests/presets/pack_01/SP01-077.yaml` | `assets/recipes/styles/defaults/SP01-077.webp` |
| SP01-078 | `components/recipes/styles/manifests/presets/pack_01/SP01-078.yaml` | `assets/recipes/styles/defaults/SP01-078.webp` |
| SP01-079 | `components/recipes/styles/manifests/presets/pack_01/SP01-079.yaml` | `assets/recipes/styles/defaults/SP01-079.webp` |
| SP01-080 | `components/recipes/styles/manifests/presets/pack_01/SP01-080.yaml` | `assets/recipes/styles/defaults/SP01-080.webp` |
| SP01-081 | `components/recipes/styles/manifests/presets/pack_01/SP01-081.yaml` | `assets/recipes/styles/defaults/SP01-081.webp` |

### pack_02

| Preset   | Manifest                                                            | Default card                                   |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SP02-001 | `components/recipes/styles/manifests/presets/pack_02/SP02-001.yaml` | `assets/recipes/styles/defaults/SP02-001.webp` |
| SP02-002 | `components/recipes/styles/manifests/presets/pack_02/SP02-002.yaml` | `assets/recipes/styles/defaults/SP02-002.webp` |
| SP02-003 | `components/recipes/styles/manifests/presets/pack_02/SP02-003.yaml` | `assets/recipes/styles/defaults/SP02-003.webp` |
| SP02-004 | `components/recipes/styles/manifests/presets/pack_02/SP02-004.yaml` | `assets/recipes/styles/defaults/SP02-004.webp` |
| SP02-005 | `components/recipes/styles/manifests/presets/pack_02/SP02-005.yaml` | `assets/recipes/styles/defaults/SP02-005.webp` |
| SP02-006 | `components/recipes/styles/manifests/presets/pack_02/SP02-006.yaml` | `assets/recipes/styles/defaults/SP02-006.webp` |
| SP02-007 | `components/recipes/styles/manifests/presets/pack_02/SP02-007.yaml` | `assets/recipes/styles/defaults/SP02-007.webp` |
| SP02-008 | `components/recipes/styles/manifests/presets/pack_02/SP02-008.yaml` | `assets/recipes/styles/defaults/SP02-008.webp` |
| SP02-009 | `components/recipes/styles/manifests/presets/pack_02/SP02-009.yaml` | `assets/recipes/styles/defaults/SP02-009.webp` |
| SP02-010 | `components/recipes/styles/manifests/presets/pack_02/SP02-010.yaml` | `assets/recipes/styles/defaults/SP02-010.webp` |
| SP02-011 | `components/recipes/styles/manifests/presets/pack_02/SP02-011.yaml` | `assets/recipes/styles/defaults/SP02-011.webp` |
| SP02-012 | `components/recipes/styles/manifests/presets/pack_02/SP02-012.yaml` | `assets/recipes/styles/defaults/SP02-012.webp` |
| SP02-013 | `components/recipes/styles/manifests/presets/pack_02/SP02-013.yaml` | `assets/recipes/styles/defaults/SP02-013.webp` |
| SP02-014 | `components/recipes/styles/manifests/presets/pack_02/SP02-014.yaml` | `assets/recipes/styles/defaults/SP02-014.webp` |
| SP02-015 | `components/recipes/styles/manifests/presets/pack_02/SP02-015.yaml` | `assets/recipes/styles/defaults/SP02-015.webp` |
| SP02-016 | `components/recipes/styles/manifests/presets/pack_02/SP02-016.yaml` | `assets/recipes/styles/defaults/SP02-016.webp` |
| SP02-017 | `components/recipes/styles/manifests/presets/pack_02/SP02-017.yaml` | `assets/recipes/styles/defaults/SP02-017.webp` |
| SP02-018 | `components/recipes/styles/manifests/presets/pack_02/SP02-018.yaml` | `assets/recipes/styles/defaults/SP02-018.webp` |
| SP02-019 | `components/recipes/styles/manifests/presets/pack_02/SP02-019.yaml` | `assets/recipes/styles/defaults/SP02-019.webp` |
| SP02-020 | `components/recipes/styles/manifests/presets/pack_02/SP02-020.yaml` | `assets/recipes/styles/defaults/SP02-020.webp` |
| SP02-021 | `components/recipes/styles/manifests/presets/pack_02/SP02-021.yaml` | `assets/recipes/styles/defaults/SP02-021.webp` |
| SP02-022 | `components/recipes/styles/manifests/presets/pack_02/SP02-022.yaml` | `assets/recipes/styles/defaults/SP02-022.webp` |
| SP02-023 | `components/recipes/styles/manifests/presets/pack_02/SP02-023.yaml` | `assets/recipes/styles/defaults/SP02-023.webp` |
| SP02-024 | `components/recipes/styles/manifests/presets/pack_02/SP02-024.yaml` | `assets/recipes/styles/defaults/SP02-024.webp` |
| SP02-025 | `components/recipes/styles/manifests/presets/pack_02/SP02-025.yaml` | `assets/recipes/styles/defaults/SP02-025.webp` |
| SP02-026 | `components/recipes/styles/manifests/presets/pack_02/SP02-026.yaml` | `assets/recipes/styles/defaults/SP02-026.webp` |
| SP02-027 | `components/recipes/styles/manifests/presets/pack_02/SP02-027.yaml` | `assets/recipes/styles/defaults/SP02-027.webp` |
| SP02-028 | `components/recipes/styles/manifests/presets/pack_02/SP02-028.yaml` | `assets/recipes/styles/defaults/SP02-028.webp` |
| SP02-029 | `components/recipes/styles/manifests/presets/pack_02/SP02-029.yaml` | `assets/recipes/styles/defaults/SP02-029.webp` |
| SP02-030 | `components/recipes/styles/manifests/presets/pack_02/SP02-030.yaml` | `assets/recipes/styles/defaults/SP02-030.webp` |
| SP02-031 | `components/recipes/styles/manifests/presets/pack_02/SP02-031.yaml` | `assets/recipes/styles/defaults/SP02-031.webp` |
| SP02-032 | `components/recipes/styles/manifests/presets/pack_02/SP02-032.yaml` | `assets/recipes/styles/defaults/SP02-032.webp` |
| SP02-033 | `components/recipes/styles/manifests/presets/pack_02/SP02-033.yaml` | `assets/recipes/styles/defaults/SP02-033.webp` |
| SP02-034 | `components/recipes/styles/manifests/presets/pack_02/SP02-034.yaml` | `assets/recipes/styles/defaults/SP02-034.webp` |
| SP02-035 | `components/recipes/styles/manifests/presets/pack_02/SP02-035.yaml` | `assets/recipes/styles/defaults/SP02-035.webp` |
| SP02-036 | `components/recipes/styles/manifests/presets/pack_02/SP02-036.yaml` | `assets/recipes/styles/defaults/SP02-036.webp` |
| SP02-037 | `components/recipes/styles/manifests/presets/pack_02/SP02-037.yaml` | `assets/recipes/styles/defaults/SP02-037.webp` |
| SP02-038 | `components/recipes/styles/manifests/presets/pack_02/SP02-038.yaml` | `assets/recipes/styles/defaults/SP02-038.webp` |
| SP02-039 | `components/recipes/styles/manifests/presets/pack_02/SP02-039.yaml` | `assets/recipes/styles/defaults/SP02-039.webp` |
| SP02-040 | `components/recipes/styles/manifests/presets/pack_02/SP02-040.yaml` | `assets/recipes/styles/defaults/SP02-040.webp` |
| SP02-041 | `components/recipes/styles/manifests/presets/pack_02/SP02-041.yaml` | `assets/recipes/styles/defaults/SP02-041.webp` |
| SP02-042 | `components/recipes/styles/manifests/presets/pack_02/SP02-042.yaml` | `assets/recipes/styles/defaults/SP02-042.webp` |
| SP02-043 | `components/recipes/styles/manifests/presets/pack_02/SP02-043.yaml` | `assets/recipes/styles/defaults/SP02-043.webp` |
| SP02-044 | `components/recipes/styles/manifests/presets/pack_02/SP02-044.yaml` | `assets/recipes/styles/defaults/SP02-044.webp` |
| SP02-045 | `components/recipes/styles/manifests/presets/pack_02/SP02-045.yaml` | `assets/recipes/styles/defaults/SP02-045.webp` |
| SP02-046 | `components/recipes/styles/manifests/presets/pack_02/SP02-046.yaml` | `assets/recipes/styles/defaults/SP02-046.webp` |
| SP02-047 | `components/recipes/styles/manifests/presets/pack_02/SP02-047.yaml` | `assets/recipes/styles/defaults/SP02-047.webp` |
| SP02-048 | `components/recipes/styles/manifests/presets/pack_02/SP02-048.yaml` | `assets/recipes/styles/defaults/SP02-048.webp` |
| SP02-049 | `components/recipes/styles/manifests/presets/pack_02/SP02-049.yaml` | `assets/recipes/styles/defaults/SP02-049.webp` |
| SP02-050 | `components/recipes/styles/manifests/presets/pack_02/SP02-050.yaml` | `assets/recipes/styles/defaults/SP02-050.webp` |
| SP02-051 | `components/recipes/styles/manifests/presets/pack_02/SP02-051.yaml` | `assets/recipes/styles/defaults/SP02-051.webp` |
| SP02-052 | `components/recipes/styles/manifests/presets/pack_02/SP02-052.yaml` | `assets/recipes/styles/defaults/SP02-052.webp` |
| SP02-053 | `components/recipes/styles/manifests/presets/pack_02/SP02-053.yaml` | `assets/recipes/styles/defaults/SP02-053.webp` |
| SP02-054 | `components/recipes/styles/manifests/presets/pack_02/SP02-054.yaml` | `assets/recipes/styles/defaults/SP02-054.webp` |
| SP02-055 | `components/recipes/styles/manifests/presets/pack_02/SP02-055.yaml` | `assets/recipes/styles/defaults/SP02-055.webp` |
| SP02-056 | `components/recipes/styles/manifests/presets/pack_02/SP02-056.yaml` | `assets/recipes/styles/defaults/SP02-056.webp` |
| SP02-057 | `components/recipes/styles/manifests/presets/pack_02/SP02-057.yaml` | `assets/recipes/styles/defaults/SP02-057.webp` |
| SP02-058 | `components/recipes/styles/manifests/presets/pack_02/SP02-058.yaml` | `assets/recipes/styles/defaults/SP02-058.webp` |
| SP02-059 | `components/recipes/styles/manifests/presets/pack_02/SP02-059.yaml` | `assets/recipes/styles/defaults/SP02-059.webp` |
| SP02-060 | `components/recipes/styles/manifests/presets/pack_02/SP02-060.yaml` | `assets/recipes/styles/defaults/SP02-060.webp` |
| SP02-061 | `components/recipes/styles/manifests/presets/pack_02/SP02-061.yaml` | `assets/recipes/styles/defaults/SP02-061.webp` |
| SP02-062 | `components/recipes/styles/manifests/presets/pack_02/SP02-062.yaml` | `assets/recipes/styles/defaults/SP02-062.webp` |
| SP02-063 | `components/recipes/styles/manifests/presets/pack_02/SP02-063.yaml` | `assets/recipes/styles/defaults/SP02-063.webp` |
| SP02-064 | `components/recipes/styles/manifests/presets/pack_02/SP02-064.yaml` | `assets/recipes/styles/defaults/SP02-064.webp` |
| SP02-065 | `components/recipes/styles/manifests/presets/pack_02/SP02-065.yaml` | `assets/recipes/styles/defaults/SP02-065.webp` |
| SP02-066 | `components/recipes/styles/manifests/presets/pack_02/SP02-066.yaml` | `assets/recipes/styles/defaults/SP02-066.webp` |
| SP02-067 | `components/recipes/styles/manifests/presets/pack_02/SP02-067.yaml` | `assets/recipes/styles/defaults/SP02-067.webp` |
| SP02-068 | `components/recipes/styles/manifests/presets/pack_02/SP02-068.yaml` | `assets/recipes/styles/defaults/SP02-068.webp` |
| SP02-069 | `components/recipes/styles/manifests/presets/pack_02/SP02-069.yaml` | `assets/recipes/styles/defaults/SP02-069.webp` |
| SP02-070 | `components/recipes/styles/manifests/presets/pack_02/SP02-070.yaml` | `assets/recipes/styles/defaults/SP02-070.webp` |
| SP02-071 | `components/recipes/styles/manifests/presets/pack_02/SP02-071.yaml` | `assets/recipes/styles/defaults/SP02-071.webp` |
| SP02-072 | `components/recipes/styles/manifests/presets/pack_02/SP02-072.yaml` | `assets/recipes/styles/defaults/SP02-072.webp` |
| SP02-073 | `components/recipes/styles/manifests/presets/pack_02/SP02-073.yaml` | `assets/recipes/styles/defaults/SP02-073.webp` |
| SP02-074 | `components/recipes/styles/manifests/presets/pack_02/SP02-074.yaml` | `assets/recipes/styles/defaults/SP02-074.webp` |
| SP02-075 | `components/recipes/styles/manifests/presets/pack_02/SP02-075.yaml` | `assets/recipes/styles/defaults/SP02-075.webp` |
| SP02-076 | `components/recipes/styles/manifests/presets/pack_02/SP02-076.yaml` | `assets/recipes/styles/defaults/SP02-076.webp` |
| SP02-077 | `components/recipes/styles/manifests/presets/pack_02/SP02-077.yaml` | `assets/recipes/styles/defaults/SP02-077.webp` |
| SP02-078 | `components/recipes/styles/manifests/presets/pack_02/SP02-078.yaml` | `assets/recipes/styles/defaults/SP02-078.webp` |
| SP02-079 | `components/recipes/styles/manifests/presets/pack_02/SP02-079.yaml` | `assets/recipes/styles/defaults/SP02-079.webp` |
| SP02-080 | `components/recipes/styles/manifests/presets/pack_02/SP02-080.yaml` | `assets/recipes/styles/defaults/SP02-080.webp` |
| SP02-081 | `components/recipes/styles/manifests/presets/pack_02/SP02-081.yaml` | `assets/recipes/styles/defaults/SP02-081.webp` |
| SP02-082 | `components/recipes/styles/manifests/presets/pack_02/SP02-082.yaml` | `assets/recipes/styles/defaults/SP02-082.webp` |
| SP02-083 | `components/recipes/styles/manifests/presets/pack_02/SP02-083.yaml` | `assets/recipes/styles/defaults/SP02-083.webp` |
| SP02-084 | `components/recipes/styles/manifests/presets/pack_02/SP02-084.yaml` | `assets/recipes/styles/defaults/SP02-084.webp` |
| SP02-085 | `components/recipes/styles/manifests/presets/pack_02/SP02-085.yaml` | `assets/recipes/styles/defaults/SP02-085.webp` |
| SP02-086 | `components/recipes/styles/manifests/presets/pack_02/SP02-086.yaml` | `assets/recipes/styles/defaults/SP02-086.webp` |
| SP02-087 | `components/recipes/styles/manifests/presets/pack_02/SP02-087.yaml` | `assets/recipes/styles/defaults/SP02-087.webp` |
| SP02-088 | `components/recipes/styles/manifests/presets/pack_02/SP02-088.yaml` | `assets/recipes/styles/defaults/SP02-088.webp` |
| SP02-089 | `components/recipes/styles/manifests/presets/pack_02/SP02-089.yaml` | `assets/recipes/styles/defaults/SP02-089.webp` |
| SP02-090 | `components/recipes/styles/manifests/presets/pack_02/SP02-090.yaml` | `assets/recipes/styles/defaults/SP02-090.webp` |
| SP02-091 | `components/recipes/styles/manifests/presets/pack_02/SP02-091.yaml` | `assets/recipes/styles/defaults/SP02-091.webp` |
| SP02-092 | `components/recipes/styles/manifests/presets/pack_02/SP02-092.yaml` | `assets/recipes/styles/defaults/SP02-092.webp` |
| SP02-093 | `components/recipes/styles/manifests/presets/pack_02/SP02-093.yaml` | `assets/recipes/styles/defaults/SP02-093.webp` |
| SP02-094 | `components/recipes/styles/manifests/presets/pack_02/SP02-094.yaml` | `assets/recipes/styles/defaults/SP02-094.webp` |
| SP02-095 | `components/recipes/styles/manifests/presets/pack_02/SP02-095.yaml` | `assets/recipes/styles/defaults/SP02-095.webp` |
| SP02-096 | `components/recipes/styles/manifests/presets/pack_02/SP02-096.yaml` | `assets/recipes/styles/defaults/SP02-096.webp` |
| SP02-097 | `components/recipes/styles/manifests/presets/pack_02/SP02-097.yaml` | `assets/recipes/styles/defaults/SP02-097.webp` |
| SP02-098 | `components/recipes/styles/manifests/presets/pack_02/SP02-098.yaml` | `assets/recipes/styles/defaults/SP02-098.webp` |
| SP02-099 | `components/recipes/styles/manifests/presets/pack_02/SP02-099.yaml` | `assets/recipes/styles/defaults/SP02-099.webp` |
| SP02-100 | `components/recipes/styles/manifests/presets/pack_02/SP02-100.yaml` | `assets/recipes/styles/defaults/SP02-100.webp` |
| SP02-101 | `components/recipes/styles/manifests/presets/pack_02/SP02-101.yaml` | `assets/recipes/styles/defaults/SP02-101.webp` |
| SP02-102 | `components/recipes/styles/manifests/presets/pack_02/SP02-102.yaml` | `assets/recipes/styles/defaults/SP02-102.webp` |
| SP02-103 | `components/recipes/styles/manifests/presets/pack_02/SP02-103.yaml` | `assets/recipes/styles/defaults/SP02-103.webp` |
| SP02-104 | `components/recipes/styles/manifests/presets/pack_02/SP02-104.yaml` | `assets/recipes/styles/defaults/SP02-104.webp` |
| SP02-105 | `components/recipes/styles/manifests/presets/pack_02/SP02-105.yaml` | `assets/recipes/styles/defaults/SP02-105.webp` |
| SP02-106 | `components/recipes/styles/manifests/presets/pack_02/SP02-106.yaml` | `assets/recipes/styles/defaults/SP02-106.webp` |
| SP02-107 | `components/recipes/styles/manifests/presets/pack_02/SP02-107.yaml` | `assets/recipes/styles/defaults/SP02-107.webp` |
| SP02-108 | `components/recipes/styles/manifests/presets/pack_02/SP02-108.yaml` | `assets/recipes/styles/defaults/SP02-108.webp` |
| SP02-109 | `components/recipes/styles/manifests/presets/pack_02/SP02-109.yaml` | `assets/recipes/styles/defaults/SP02-109.webp` |
| SP02-110 | `components/recipes/styles/manifests/presets/pack_02/SP02-110.yaml` | `assets/recipes/styles/defaults/SP02-110.webp` |
| SP02-111 | `components/recipes/styles/manifests/presets/pack_02/SP02-111.yaml` | `assets/recipes/styles/defaults/SP02-111.webp` |
| SP02-112 | `components/recipes/styles/manifests/presets/pack_02/SP02-112.yaml` | `assets/recipes/styles/defaults/SP02-112.webp` |
| SP02-113 | `components/recipes/styles/manifests/presets/pack_02/SP02-113.yaml` | `assets/recipes/styles/defaults/SP02-113.webp` |
| SP02-114 | `components/recipes/styles/manifests/presets/pack_02/SP02-114.yaml` | `assets/recipes/styles/defaults/SP02-114.webp` |
| SP02-115 | `components/recipes/styles/manifests/presets/pack_02/SP02-115.yaml` | `assets/recipes/styles/defaults/SP02-115.webp` |
| SP02-116 | `components/recipes/styles/manifests/presets/pack_02/SP02-116.yaml` | `assets/recipes/styles/defaults/SP02-116.webp` |
| SP02-117 | `components/recipes/styles/manifests/presets/pack_02/SP02-117.yaml` | `assets/recipes/styles/defaults/SP02-117.webp` |
| SP02-118 | `components/recipes/styles/manifests/presets/pack_02/SP02-118.yaml` | `assets/recipes/styles/defaults/SP02-118.webp` |
| SP02-119 | `components/recipes/styles/manifests/presets/pack_02/SP02-119.yaml` | `assets/recipes/styles/defaults/SP02-119.webp` |
| SP02-120 | `components/recipes/styles/manifests/presets/pack_02/SP02-120.yaml` | `assets/recipes/styles/defaults/SP02-120.webp` |

### pack_03

| Preset   | Manifest                                                            | Default card                                   |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SP03-001 | `components/recipes/styles/manifests/presets/pack_03/SP03-001.yaml` | `assets/recipes/styles/defaults/SP03-001.webp` |
| SP03-002 | `components/recipes/styles/manifests/presets/pack_03/SP03-002.yaml` | `assets/recipes/styles/defaults/SP03-002.webp` |
| SP03-003 | `components/recipes/styles/manifests/presets/pack_03/SP03-003.yaml` | `assets/recipes/styles/defaults/SP03-003.webp` |
| SP03-004 | `components/recipes/styles/manifests/presets/pack_03/SP03-004.yaml` | `assets/recipes/styles/defaults/SP03-004.webp` |
| SP03-005 | `components/recipes/styles/manifests/presets/pack_03/SP03-005.yaml` | `assets/recipes/styles/defaults/SP03-005.webp` |
| SP03-006 | `components/recipes/styles/manifests/presets/pack_03/SP03-006.yaml` | `assets/recipes/styles/defaults/SP03-006.webp` |
| SP03-007 | `components/recipes/styles/manifests/presets/pack_03/SP03-007.yaml` | `assets/recipes/styles/defaults/SP03-007.webp` |
| SP03-008 | `components/recipes/styles/manifests/presets/pack_03/SP03-008.yaml` | `assets/recipes/styles/defaults/SP03-008.webp` |
| SP03-009 | `components/recipes/styles/manifests/presets/pack_03/SP03-009.yaml` | `assets/recipes/styles/defaults/SP03-009.webp` |
| SP03-010 | `components/recipes/styles/manifests/presets/pack_03/SP03-010.yaml` | `assets/recipes/styles/defaults/SP03-010.webp` |
| SP03-011 | `components/recipes/styles/manifests/presets/pack_03/SP03-011.yaml` | `assets/recipes/styles/defaults/SP03-011.webp` |
| SP03-012 | `components/recipes/styles/manifests/presets/pack_03/SP03-012.yaml` | `assets/recipes/styles/defaults/SP03-012.webp` |
| SP03-013 | `components/recipes/styles/manifests/presets/pack_03/SP03-013.yaml` | `assets/recipes/styles/defaults/SP03-013.webp` |
| SP03-014 | `components/recipes/styles/manifests/presets/pack_03/SP03-014.yaml` | `assets/recipes/styles/defaults/SP03-014.webp` |
| SP03-015 | `components/recipes/styles/manifests/presets/pack_03/SP03-015.yaml` | `assets/recipes/styles/defaults/SP03-015.webp` |
| SP03-016 | `components/recipes/styles/manifests/presets/pack_03/SP03-016.yaml` | `assets/recipes/styles/defaults/SP03-016.webp` |
| SP03-017 | `components/recipes/styles/manifests/presets/pack_03/SP03-017.yaml` | `assets/recipes/styles/defaults/SP03-017.webp` |
| SP03-018 | `components/recipes/styles/manifests/presets/pack_03/SP03-018.yaml` | `assets/recipes/styles/defaults/SP03-018.webp` |
| SP03-019 | `components/recipes/styles/manifests/presets/pack_03/SP03-019.yaml` | `assets/recipes/styles/defaults/SP03-019.webp` |
| SP03-020 | `components/recipes/styles/manifests/presets/pack_03/SP03-020.yaml` | `assets/recipes/styles/defaults/SP03-020.webp` |
| SP03-021 | `components/recipes/styles/manifests/presets/pack_03/SP03-021.yaml` | `assets/recipes/styles/defaults/SP03-021.webp` |
| SP03-022 | `components/recipes/styles/manifests/presets/pack_03/SP03-022.yaml` | `assets/recipes/styles/defaults/SP03-022.webp` |
| SP03-023 | `components/recipes/styles/manifests/presets/pack_03/SP03-023.yaml` | `assets/recipes/styles/defaults/SP03-023.webp` |
| SP03-024 | `components/recipes/styles/manifests/presets/pack_03/SP03-024.yaml` | `assets/recipes/styles/defaults/SP03-024.webp` |
| SP03-025 | `components/recipes/styles/manifests/presets/pack_03/SP03-025.yaml` | `assets/recipes/styles/defaults/SP03-025.webp` |
| SP03-026 | `components/recipes/styles/manifests/presets/pack_03/SP03-026.yaml` | `assets/recipes/styles/defaults/SP03-026.webp` |
| SP03-027 | `components/recipes/styles/manifests/presets/pack_03/SP03-027.yaml` | `assets/recipes/styles/defaults/SP03-027.webp` |
| SP03-028 | `components/recipes/styles/manifests/presets/pack_03/SP03-028.yaml` | `assets/recipes/styles/defaults/SP03-028.webp` |
| SP03-029 | `components/recipes/styles/manifests/presets/pack_03/SP03-029.yaml` | `assets/recipes/styles/defaults/SP03-029.webp` |
| SP03-030 | `components/recipes/styles/manifests/presets/pack_03/SP03-030.yaml` | `assets/recipes/styles/defaults/SP03-030.webp` |
| SP03-031 | `components/recipes/styles/manifests/presets/pack_03/SP03-031.yaml` | `assets/recipes/styles/defaults/SP03-031.webp` |
| SP03-032 | `components/recipes/styles/manifests/presets/pack_03/SP03-032.yaml` | `assets/recipes/styles/defaults/SP03-032.webp` |
| SP03-033 | `components/recipes/styles/manifests/presets/pack_03/SP03-033.yaml` | `assets/recipes/styles/defaults/SP03-033.webp` |
| SP03-034 | `components/recipes/styles/manifests/presets/pack_03/SP03-034.yaml` | `assets/recipes/styles/defaults/SP03-034.webp` |
| SP03-035 | `components/recipes/styles/manifests/presets/pack_03/SP03-035.yaml` | `assets/recipes/styles/defaults/SP03-035.webp` |
| SP03-036 | `components/recipes/styles/manifests/presets/pack_03/SP03-036.yaml` | `assets/recipes/styles/defaults/SP03-036.webp` |
| SP03-037 | `components/recipes/styles/manifests/presets/pack_03/SP03-037.yaml` | `assets/recipes/styles/defaults/SP03-037.webp` |
| SP03-038 | `components/recipes/styles/manifests/presets/pack_03/SP03-038.yaml` | `assets/recipes/styles/defaults/SP03-038.webp` |
| SP03-039 | `components/recipes/styles/manifests/presets/pack_03/SP03-039.yaml` | `assets/recipes/styles/defaults/SP03-039.webp` |
| SP03-040 | `components/recipes/styles/manifests/presets/pack_03/SP03-040.yaml` | `assets/recipes/styles/defaults/SP03-040.webp` |
| SP03-041 | `components/recipes/styles/manifests/presets/pack_03/SP03-041.yaml` | `assets/recipes/styles/defaults/SP03-041.webp` |
| SP03-042 | `components/recipes/styles/manifests/presets/pack_03/SP03-042.yaml` | `assets/recipes/styles/defaults/SP03-042.webp` |
| SP03-043 | `components/recipes/styles/manifests/presets/pack_03/SP03-043.yaml` | `assets/recipes/styles/defaults/SP03-043.webp` |
| SP03-044 | `components/recipes/styles/manifests/presets/pack_03/SP03-044.yaml` | `assets/recipes/styles/defaults/SP03-044.webp` |
| SP03-045 | `components/recipes/styles/manifests/presets/pack_03/SP03-045.yaml` | `assets/recipes/styles/defaults/SP03-045.webp` |
| SP03-046 | `components/recipes/styles/manifests/presets/pack_03/SP03-046.yaml` | `assets/recipes/styles/defaults/SP03-046.webp` |
| SP03-047 | `components/recipes/styles/manifests/presets/pack_03/SP03-047.yaml` | `assets/recipes/styles/defaults/SP03-047.webp` |
| SP03-048 | `components/recipes/styles/manifests/presets/pack_03/SP03-048.yaml` | `assets/recipes/styles/defaults/SP03-048.webp` |
| SP03-049 | `components/recipes/styles/manifests/presets/pack_03/SP03-049.yaml` | `assets/recipes/styles/defaults/SP03-049.webp` |
| SP03-050 | `components/recipes/styles/manifests/presets/pack_03/SP03-050.yaml` | `assets/recipes/styles/defaults/SP03-050.webp` |
| SP03-051 | `components/recipes/styles/manifests/presets/pack_03/SP03-051.yaml` | `assets/recipes/styles/defaults/SP03-051.webp` |
| SP03-052 | `components/recipes/styles/manifests/presets/pack_03/SP03-052.yaml` | `assets/recipes/styles/defaults/SP03-052.webp` |
| SP03-053 | `components/recipes/styles/manifests/presets/pack_03/SP03-053.yaml` | `assets/recipes/styles/defaults/SP03-053.webp` |
| SP03-054 | `components/recipes/styles/manifests/presets/pack_03/SP03-054.yaml` | `assets/recipes/styles/defaults/SP03-054.webp` |
| SP03-055 | `components/recipes/styles/manifests/presets/pack_03/SP03-055.yaml` | `assets/recipes/styles/defaults/SP03-055.webp` |
| SP03-056 | `components/recipes/styles/manifests/presets/pack_03/SP03-056.yaml` | `assets/recipes/styles/defaults/SP03-056.webp` |
| SP03-057 | `components/recipes/styles/manifests/presets/pack_03/SP03-057.yaml` | `assets/recipes/styles/defaults/SP03-057.webp` |
| SP03-058 | `components/recipes/styles/manifests/presets/pack_03/SP03-058.yaml` | `assets/recipes/styles/defaults/SP03-058.webp` |
| SP03-059 | `components/recipes/styles/manifests/presets/pack_03/SP03-059.yaml` | `assets/recipes/styles/defaults/SP03-059.webp` |
| SP03-060 | `components/recipes/styles/manifests/presets/pack_03/SP03-060.yaml` | `assets/recipes/styles/defaults/SP03-060.webp` |
| SP03-061 | `components/recipes/styles/manifests/presets/pack_03/SP03-061.yaml` | `assets/recipes/styles/defaults/SP03-061.webp` |
| SP03-062 | `components/recipes/styles/manifests/presets/pack_03/SP03-062.yaml` | `assets/recipes/styles/defaults/SP03-062.webp` |
| SP03-063 | `components/recipes/styles/manifests/presets/pack_03/SP03-063.yaml` | `assets/recipes/styles/defaults/SP03-063.webp` |
| SP03-064 | `components/recipes/styles/manifests/presets/pack_03/SP03-064.yaml` | `assets/recipes/styles/defaults/SP03-064.webp` |
| SP03-065 | `components/recipes/styles/manifests/presets/pack_03/SP03-065.yaml` | `assets/recipes/styles/defaults/SP03-065.webp` |
| SP03-066 | `components/recipes/styles/manifests/presets/pack_03/SP03-066.yaml` | `assets/recipes/styles/defaults/SP03-066.webp` |
| SP03-067 | `components/recipes/styles/manifests/presets/pack_03/SP03-067.yaml` | `assets/recipes/styles/defaults/SP03-067.webp` |
| SP03-068 | `components/recipes/styles/manifests/presets/pack_03/SP03-068.yaml` | `assets/recipes/styles/defaults/SP03-068.webp` |
| SP03-069 | `components/recipes/styles/manifests/presets/pack_03/SP03-069.yaml` | `assets/recipes/styles/defaults/SP03-069.webp` |
| SP03-070 | `components/recipes/styles/manifests/presets/pack_03/SP03-070.yaml` | `assets/recipes/styles/defaults/SP03-070.webp` |
| SP03-071 | `components/recipes/styles/manifests/presets/pack_03/SP03-071.yaml` | `assets/recipes/styles/defaults/SP03-071.webp` |
| SP03-072 | `components/recipes/styles/manifests/presets/pack_03/SP03-072.yaml` | `assets/recipes/styles/defaults/SP03-072.webp` |
| SP03-073 | `components/recipes/styles/manifests/presets/pack_03/SP03-073.yaml` | `assets/recipes/styles/defaults/SP03-073.webp` |
| SP03-074 | `components/recipes/styles/manifests/presets/pack_03/SP03-074.yaml` | `assets/recipes/styles/defaults/SP03-074.webp` |
| SP03-075 | `components/recipes/styles/manifests/presets/pack_03/SP03-075.yaml` | `assets/recipes/styles/defaults/SP03-075.webp` |
| SP03-076 | `components/recipes/styles/manifests/presets/pack_03/SP03-076.yaml` | `assets/recipes/styles/defaults/SP03-076.webp` |
| SP03-077 | `components/recipes/styles/manifests/presets/pack_03/SP03-077.yaml` | `assets/recipes/styles/defaults/SP03-077.webp` |
| SP03-078 | `components/recipes/styles/manifests/presets/pack_03/SP03-078.yaml` | `assets/recipes/styles/defaults/SP03-078.webp` |
| SP03-079 | `components/recipes/styles/manifests/presets/pack_03/SP03-079.yaml` | `assets/recipes/styles/defaults/SP03-079.webp` |
| SP03-080 | `components/recipes/styles/manifests/presets/pack_03/SP03-080.yaml` | `assets/recipes/styles/defaults/SP03-080.webp` |

### pack_04

| Preset   | Manifest                                                            | Default card                                   |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SP04-001 | `components/recipes/styles/manifests/presets/pack_04/SP04-001.yaml` | `assets/recipes/styles/defaults/SP04-001.webp` |
| SP04-002 | `components/recipes/styles/manifests/presets/pack_04/SP04-002.yaml` | `assets/recipes/styles/defaults/SP04-002.webp` |
| SP04-003 | `components/recipes/styles/manifests/presets/pack_04/SP04-003.yaml` | `assets/recipes/styles/defaults/SP04-003.webp` |
| SP04-004 | `components/recipes/styles/manifests/presets/pack_04/SP04-004.yaml` | `assets/recipes/styles/defaults/SP04-004.webp` |
| SP04-005 | `components/recipes/styles/manifests/presets/pack_04/SP04-005.yaml` | `assets/recipes/styles/defaults/SP04-005.webp` |
| SP04-006 | `components/recipes/styles/manifests/presets/pack_04/SP04-006.yaml` | `assets/recipes/styles/defaults/SP04-006.webp` |
| SP04-007 | `components/recipes/styles/manifests/presets/pack_04/SP04-007.yaml` | `assets/recipes/styles/defaults/SP04-007.webp` |
| SP04-008 | `components/recipes/styles/manifests/presets/pack_04/SP04-008.yaml` | `assets/recipes/styles/defaults/SP04-008.webp` |
| SP04-009 | `components/recipes/styles/manifests/presets/pack_04/SP04-009.yaml` | `assets/recipes/styles/defaults/SP04-009.webp` |
| SP04-010 | `components/recipes/styles/manifests/presets/pack_04/SP04-010.yaml` | `assets/recipes/styles/defaults/SP04-010.webp` |
| SP04-011 | `components/recipes/styles/manifests/presets/pack_04/SP04-011.yaml` | `assets/recipes/styles/defaults/SP04-011.webp` |
| SP04-012 | `components/recipes/styles/manifests/presets/pack_04/SP04-012.yaml` | `assets/recipes/styles/defaults/SP04-012.webp` |
| SP04-013 | `components/recipes/styles/manifests/presets/pack_04/SP04-013.yaml` | `assets/recipes/styles/defaults/SP04-013.webp` |
| SP04-014 | `components/recipes/styles/manifests/presets/pack_04/SP04-014.yaml` | `assets/recipes/styles/defaults/SP04-014.webp` |
| SP04-015 | `components/recipes/styles/manifests/presets/pack_04/SP04-015.yaml` | `assets/recipes/styles/defaults/SP04-015.webp` |
| SP04-016 | `components/recipes/styles/manifests/presets/pack_04/SP04-016.yaml` | `assets/recipes/styles/defaults/SP04-016.webp` |
| SP04-017 | `components/recipes/styles/manifests/presets/pack_04/SP04-017.yaml` | `assets/recipes/styles/defaults/SP04-017.webp` |
| SP04-018 | `components/recipes/styles/manifests/presets/pack_04/SP04-018.yaml` | `assets/recipes/styles/defaults/SP04-018.webp` |
| SP04-019 | `components/recipes/styles/manifests/presets/pack_04/SP04-019.yaml` | `assets/recipes/styles/defaults/SP04-019.webp` |
| SP04-020 | `components/recipes/styles/manifests/presets/pack_04/SP04-020.yaml` | `assets/recipes/styles/defaults/SP04-020.webp` |
| SP04-021 | `components/recipes/styles/manifests/presets/pack_04/SP04-021.yaml` | `assets/recipes/styles/defaults/SP04-021.webp` |
| SP04-022 | `components/recipes/styles/manifests/presets/pack_04/SP04-022.yaml` | `assets/recipes/styles/defaults/SP04-022.webp` |
| SP04-023 | `components/recipes/styles/manifests/presets/pack_04/SP04-023.yaml` | `assets/recipes/styles/defaults/SP04-023.webp` |
| SP04-024 | `components/recipes/styles/manifests/presets/pack_04/SP04-024.yaml` | `assets/recipes/styles/defaults/SP04-024.webp` |
| SP04-025 | `components/recipes/styles/manifests/presets/pack_04/SP04-025.yaml` | `assets/recipes/styles/defaults/SP04-025.webp` |
| SP04-026 | `components/recipes/styles/manifests/presets/pack_04/SP04-026.yaml` | `assets/recipes/styles/defaults/SP04-026.webp` |
| SP04-027 | `components/recipes/styles/manifests/presets/pack_04/SP04-027.yaml` | `assets/recipes/styles/defaults/SP04-027.webp` |
| SP04-028 | `components/recipes/styles/manifests/presets/pack_04/SP04-028.yaml` | `assets/recipes/styles/defaults/SP04-028.webp` |
| SP04-029 | `components/recipes/styles/manifests/presets/pack_04/SP04-029.yaml` | `assets/recipes/styles/defaults/SP04-029.webp` |
| SP04-030 | `components/recipes/styles/manifests/presets/pack_04/SP04-030.yaml` | `assets/recipes/styles/defaults/SP04-030.webp` |
| SP04-031 | `components/recipes/styles/manifests/presets/pack_04/SP04-031.yaml` | `assets/recipes/styles/defaults/SP04-031.webp` |
| SP04-032 | `components/recipes/styles/manifests/presets/pack_04/SP04-032.yaml` | `assets/recipes/styles/defaults/SP04-032.webp` |
| SP04-033 | `components/recipes/styles/manifests/presets/pack_04/SP04-033.yaml` | `assets/recipes/styles/defaults/SP04-033.webp` |
| SP04-034 | `components/recipes/styles/manifests/presets/pack_04/SP04-034.yaml` | `assets/recipes/styles/defaults/SP04-034.webp` |
| SP04-035 | `components/recipes/styles/manifests/presets/pack_04/SP04-035.yaml` | `assets/recipes/styles/defaults/SP04-035.webp` |
| SP04-036 | `components/recipes/styles/manifests/presets/pack_04/SP04-036.yaml` | `assets/recipes/styles/defaults/SP04-036.webp` |
| SP04-037 | `components/recipes/styles/manifests/presets/pack_04/SP04-037.yaml` | `assets/recipes/styles/defaults/SP04-037.webp` |
| SP04-038 | `components/recipes/styles/manifests/presets/pack_04/SP04-038.yaml` | `assets/recipes/styles/defaults/SP04-038.webp` |
| SP04-039 | `components/recipes/styles/manifests/presets/pack_04/SP04-039.yaml` | `assets/recipes/styles/defaults/SP04-039.webp` |
| SP04-040 | `components/recipes/styles/manifests/presets/pack_04/SP04-040.yaml` | `assets/recipes/styles/defaults/SP04-040.webp` |
| SP04-041 | `components/recipes/styles/manifests/presets/pack_04/SP04-041.yaml` | `assets/recipes/styles/defaults/SP04-041.webp` |
| SP04-042 | `components/recipes/styles/manifests/presets/pack_04/SP04-042.yaml` | `assets/recipes/styles/defaults/SP04-042.webp` |
| SP04-043 | `components/recipes/styles/manifests/presets/pack_04/SP04-043.yaml` | `assets/recipes/styles/defaults/SP04-043.webp` |
| SP04-044 | `components/recipes/styles/manifests/presets/pack_04/SP04-044.yaml` | `assets/recipes/styles/defaults/SP04-044.webp` |
| SP04-045 | `components/recipes/styles/manifests/presets/pack_04/SP04-045.yaml` | `assets/recipes/styles/defaults/SP04-045.webp` |
| SP04-046 | `components/recipes/styles/manifests/presets/pack_04/SP04-046.yaml` | `assets/recipes/styles/defaults/SP04-046.webp` |
| SP04-047 | `components/recipes/styles/manifests/presets/pack_04/SP04-047.yaml` | `assets/recipes/styles/defaults/SP04-047.webp` |
| SP04-048 | `components/recipes/styles/manifests/presets/pack_04/SP04-048.yaml` | `assets/recipes/styles/defaults/SP04-048.webp` |
| SP04-049 | `components/recipes/styles/manifests/presets/pack_04/SP04-049.yaml` | `assets/recipes/styles/defaults/SP04-049.webp` |
| SP04-050 | `components/recipes/styles/manifests/presets/pack_04/SP04-050.yaml` | `assets/recipes/styles/defaults/SP04-050.webp` |
| SP04-051 | `components/recipes/styles/manifests/presets/pack_04/SP04-051.yaml` | `assets/recipes/styles/defaults/SP04-051.webp` |
| SP04-052 | `components/recipes/styles/manifests/presets/pack_04/SP04-052.yaml` | `assets/recipes/styles/defaults/SP04-052.webp` |
| SP04-053 | `components/recipes/styles/manifests/presets/pack_04/SP04-053.yaml` | `assets/recipes/styles/defaults/SP04-053.webp` |
| SP04-054 | `components/recipes/styles/manifests/presets/pack_04/SP04-054.yaml` | `assets/recipes/styles/defaults/SP04-054.webp` |
| SP04-055 | `components/recipes/styles/manifests/presets/pack_04/SP04-055.yaml` | `assets/recipes/styles/defaults/SP04-055.webp` |
| SP04-056 | `components/recipes/styles/manifests/presets/pack_04/SP04-056.yaml` | `assets/recipes/styles/defaults/SP04-056.webp` |
| SP04-057 | `components/recipes/styles/manifests/presets/pack_04/SP04-057.yaml` | `assets/recipes/styles/defaults/SP04-057.webp` |
| SP04-058 | `components/recipes/styles/manifests/presets/pack_04/SP04-058.yaml` | `assets/recipes/styles/defaults/SP04-058.webp` |
| SP04-059 | `components/recipes/styles/manifests/presets/pack_04/SP04-059.yaml` | `assets/recipes/styles/defaults/SP04-059.webp` |
| SP04-060 | `components/recipes/styles/manifests/presets/pack_04/SP04-060.yaml` | `assets/recipes/styles/defaults/SP04-060.webp` |
| SP04-061 | `components/recipes/styles/manifests/presets/pack_04/SP04-061.yaml` | `assets/recipes/styles/defaults/SP04-061.webp` |
| SP04-062 | `components/recipes/styles/manifests/presets/pack_04/SP04-062.yaml` | `assets/recipes/styles/defaults/SP04-062.webp` |
| SP04-063 | `components/recipes/styles/manifests/presets/pack_04/SP04-063.yaml` | `assets/recipes/styles/defaults/SP04-063.webp` |
| SP04-064 | `components/recipes/styles/manifests/presets/pack_04/SP04-064.yaml` | `assets/recipes/styles/defaults/SP04-064.webp` |
| SP04-065 | `components/recipes/styles/manifests/presets/pack_04/SP04-065.yaml` | `assets/recipes/styles/defaults/SP04-065.webp` |
| SP04-066 | `components/recipes/styles/manifests/presets/pack_04/SP04-066.yaml` | `assets/recipes/styles/defaults/SP04-066.webp` |
| SP04-067 | `components/recipes/styles/manifests/presets/pack_04/SP04-067.yaml` | `assets/recipes/styles/defaults/SP04-067.webp` |
| SP04-068 | `components/recipes/styles/manifests/presets/pack_04/SP04-068.yaml` | `assets/recipes/styles/defaults/SP04-068.webp` |
| SP04-069 | `components/recipes/styles/manifests/presets/pack_04/SP04-069.yaml` | `assets/recipes/styles/defaults/SP04-069.webp` |
| SP04-070 | `components/recipes/styles/manifests/presets/pack_04/SP04-070.yaml` | `assets/recipes/styles/defaults/SP04-070.webp` |
| SP04-071 | `components/recipes/styles/manifests/presets/pack_04/SP04-071.yaml` | `assets/recipes/styles/defaults/SP04-071.webp` |
| SP04-072 | `components/recipes/styles/manifests/presets/pack_04/SP04-072.yaml` | `assets/recipes/styles/defaults/SP04-072.webp` |
| SP04-073 | `components/recipes/styles/manifests/presets/pack_04/SP04-073.yaml` | `assets/recipes/styles/defaults/SP04-073.webp` |
| SP04-074 | `components/recipes/styles/manifests/presets/pack_04/SP04-074.yaml` | `assets/recipes/styles/defaults/SP04-074.webp` |
| SP04-075 | `components/recipes/styles/manifests/presets/pack_04/SP04-075.yaml` | `assets/recipes/styles/defaults/SP04-075.webp` |
| SP04-076 | `components/recipes/styles/manifests/presets/pack_04/SP04-076.yaml` | `assets/recipes/styles/defaults/SP04-076.webp` |
| SP04-077 | `components/recipes/styles/manifests/presets/pack_04/SP04-077.yaml` | `assets/recipes/styles/defaults/SP04-077.webp` |
| SP04-078 | `components/recipes/styles/manifests/presets/pack_04/SP04-078.yaml` | `assets/recipes/styles/defaults/SP04-078.webp` |
| SP04-079 | `components/recipes/styles/manifests/presets/pack_04/SP04-079.yaml` | `assets/recipes/styles/defaults/SP04-079.webp` |
| SP04-080 | `components/recipes/styles/manifests/presets/pack_04/SP04-080.yaml` | `assets/recipes/styles/defaults/SP04-080.webp` |
| SP04-081 | `components/recipes/styles/manifests/presets/pack_04/SP04-081.yaml` | `assets/recipes/styles/defaults/SP04-081.webp` |
| SP04-082 | `components/recipes/styles/manifests/presets/pack_04/SP04-082.yaml` | `assets/recipes/styles/defaults/SP04-082.webp` |
| SP04-083 | `components/recipes/styles/manifests/presets/pack_04/SP04-083.yaml` | `assets/recipes/styles/defaults/SP04-083.webp` |
| SP04-084 | `components/recipes/styles/manifests/presets/pack_04/SP04-084.yaml` | `assets/recipes/styles/defaults/SP04-084.webp` |
| SP04-085 | `components/recipes/styles/manifests/presets/pack_04/SP04-085.yaml` | `assets/recipes/styles/defaults/SP04-085.webp` |
| SP04-086 | `components/recipes/styles/manifests/presets/pack_04/SP04-086.yaml` | `assets/recipes/styles/defaults/SP04-086.webp` |
| SP04-087 | `components/recipes/styles/manifests/presets/pack_04/SP04-087.yaml` | `assets/recipes/styles/defaults/SP04-087.webp` |
| SP04-088 | `components/recipes/styles/manifests/presets/pack_04/SP04-088.yaml` | `assets/recipes/styles/defaults/SP04-088.webp` |
| SP04-089 | `components/recipes/styles/manifests/presets/pack_04/SP04-089.yaml` | `assets/recipes/styles/defaults/SP04-089.webp` |
| SP04-090 | `components/recipes/styles/manifests/presets/pack_04/SP04-090.yaml` | `assets/recipes/styles/defaults/SP04-090.webp` |
| SP04-091 | `components/recipes/styles/manifests/presets/pack_04/SP04-091.yaml` | `assets/recipes/styles/defaults/SP04-091.webp` |
| SP04-092 | `components/recipes/styles/manifests/presets/pack_04/SP04-092.yaml` | `assets/recipes/styles/defaults/SP04-092.webp` |
| SP04-093 | `components/recipes/styles/manifests/presets/pack_04/SP04-093.yaml` | `assets/recipes/styles/defaults/SP04-093.webp` |
| SP04-094 | `components/recipes/styles/manifests/presets/pack_04/SP04-094.yaml` | `assets/recipes/styles/defaults/SP04-094.webp` |
| SP04-095 | `components/recipes/styles/manifests/presets/pack_04/SP04-095.yaml` | `assets/recipes/styles/defaults/SP04-095.webp` |
| SP04-096 | `components/recipes/styles/manifests/presets/pack_04/SP04-096.yaml` | `assets/recipes/styles/defaults/SP04-096.webp` |
| SP04-097 | `components/recipes/styles/manifests/presets/pack_04/SP04-097.yaml` | `assets/recipes/styles/defaults/SP04-097.webp` |
| SP04-098 | `components/recipes/styles/manifests/presets/pack_04/SP04-098.yaml` | `assets/recipes/styles/defaults/SP04-098.webp` |
| SP04-099 | `components/recipes/styles/manifests/presets/pack_04/SP04-099.yaml` | `assets/recipes/styles/defaults/SP04-099.webp` |
| SP04-100 | `components/recipes/styles/manifests/presets/pack_04/SP04-100.yaml` | `assets/recipes/styles/defaults/SP04-100.webp` |

### pack_05

| Preset   | Manifest                                                            | Default card                                   |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SP05-021 | `components/recipes/styles/manifests/presets/pack_05/SP05-021.yaml` | `assets/recipes/styles/defaults/SP05-021.webp` |
| SP05-022 | `components/recipes/styles/manifests/presets/pack_05/SP05-022.yaml` | `assets/recipes/styles/defaults/SP05-022.webp` |
| SP05-023 | `components/recipes/styles/manifests/presets/pack_05/SP05-023.yaml` | `assets/recipes/styles/defaults/SP05-023.webp` |
| SP05-025 | `components/recipes/styles/manifests/presets/pack_05/SP05-025.yaml` | `assets/recipes/styles/defaults/SP05-025.webp` |
| SP05-028 | `components/recipes/styles/manifests/presets/pack_05/SP05-028.yaml` | `assets/recipes/styles/defaults/SP05-028.webp` |
| SP05-029 | `components/recipes/styles/manifests/presets/pack_05/SP05-029.yaml` | `assets/recipes/styles/defaults/SP05-029.webp` |
| SP05-031 | `components/recipes/styles/manifests/presets/pack_05/SP05-031.yaml` | `assets/recipes/styles/defaults/SP05-031.webp` |
| SP05-032 | `components/recipes/styles/manifests/presets/pack_05/SP05-032.yaml` | `assets/recipes/styles/defaults/SP05-032.webp` |
| SP05-033 | `components/recipes/styles/manifests/presets/pack_05/SP05-033.yaml` | `assets/recipes/styles/defaults/SP05-033.webp` |
| SP05-034 | `components/recipes/styles/manifests/presets/pack_05/SP05-034.yaml` | `assets/recipes/styles/defaults/SP05-034.webp` |
| SP05-035 | `components/recipes/styles/manifests/presets/pack_05/SP05-035.yaml` | `assets/recipes/styles/defaults/SP05-035.webp` |
| SP05-036 | `components/recipes/styles/manifests/presets/pack_05/SP05-036.yaml` | `assets/recipes/styles/defaults/SP05-036.webp` |
| SP05-037 | `components/recipes/styles/manifests/presets/pack_05/SP05-037.yaml` | `assets/recipes/styles/defaults/SP05-037.webp` |
| SP05-038 | `components/recipes/styles/manifests/presets/pack_05/SP05-038.yaml` | `assets/recipes/styles/defaults/SP05-038.webp` |
| SP05-039 | `components/recipes/styles/manifests/presets/pack_05/SP05-039.yaml` | `assets/recipes/styles/defaults/SP05-039.webp` |
| SP05-040 | `components/recipes/styles/manifests/presets/pack_05/SP05-040.yaml` | `assets/recipes/styles/defaults/SP05-040.webp` |
| SP05-051 | `components/recipes/styles/manifests/presets/pack_05/SP05-051.yaml` | `assets/recipes/styles/defaults/SP05-051.webp` |
| SP05-052 | `components/recipes/styles/manifests/presets/pack_05/SP05-052.yaml` | `assets/recipes/styles/defaults/SP05-052.webp` |
| SP05-053 | `components/recipes/styles/manifests/presets/pack_05/SP05-053.yaml` | `assets/recipes/styles/defaults/SP05-053.webp` |
| SP05-054 | `components/recipes/styles/manifests/presets/pack_05/SP05-054.yaml` | `assets/recipes/styles/defaults/SP05-054.webp` |
| SP05-055 | `components/recipes/styles/manifests/presets/pack_05/SP05-055.yaml` | `assets/recipes/styles/defaults/SP05-055.webp` |
| SP05-056 | `components/recipes/styles/manifests/presets/pack_05/SP05-056.yaml` | `assets/recipes/styles/defaults/SP05-056.webp` |
| SP05-057 | `components/recipes/styles/manifests/presets/pack_05/SP05-057.yaml` | `assets/recipes/styles/defaults/SP05-057.webp` |
| SP05-058 | `components/recipes/styles/manifests/presets/pack_05/SP05-058.yaml` | `assets/recipes/styles/defaults/SP05-058.webp` |
| SP05-059 | `components/recipes/styles/manifests/presets/pack_05/SP05-059.yaml` | `assets/recipes/styles/defaults/SP05-059.webp` |
| SP05-060 | `components/recipes/styles/manifests/presets/pack_05/SP05-060.yaml` | `assets/recipes/styles/defaults/SP05-060.webp` |
| SP05-061 | `components/recipes/styles/manifests/presets/pack_05/SP05-061.yaml` | `assets/recipes/styles/defaults/SP05-061.webp` |
| SP05-062 | `components/recipes/styles/manifests/presets/pack_05/SP05-062.yaml` | `assets/recipes/styles/defaults/SP05-062.webp` |
| SP05-063 | `components/recipes/styles/manifests/presets/pack_05/SP05-063.yaml` | `assets/recipes/styles/defaults/SP05-063.webp` |
| SP05-064 | `components/recipes/styles/manifests/presets/pack_05/SP05-064.yaml` | `assets/recipes/styles/defaults/SP05-064.webp` |
| SP05-065 | `components/recipes/styles/manifests/presets/pack_05/SP05-065.yaml` | `assets/recipes/styles/defaults/SP05-065.webp` |
| SP05-066 | `components/recipes/styles/manifests/presets/pack_05/SP05-066.yaml` | `assets/recipes/styles/defaults/SP05-066.webp` |
| SP05-067 | `components/recipes/styles/manifests/presets/pack_05/SP05-067.yaml` | `assets/recipes/styles/defaults/SP05-067.webp` |
| SP05-068 | `components/recipes/styles/manifests/presets/pack_05/SP05-068.yaml` | `assets/recipes/styles/defaults/SP05-068.webp` |
| SP05-069 | `components/recipes/styles/manifests/presets/pack_05/SP05-069.yaml` | `assets/recipes/styles/defaults/SP05-069.webp` |
| SP05-070 | `components/recipes/styles/manifests/presets/pack_05/SP05-070.yaml` | `assets/recipes/styles/defaults/SP05-070.webp` |
| SP05-091 | `components/recipes/styles/manifests/presets/pack_05/SP05-091.yaml` | `assets/recipes/styles/defaults/SP05-091.webp` |
| SP05-092 | `components/recipes/styles/manifests/presets/pack_05/SP05-092.yaml` | `assets/recipes/styles/defaults/SP05-092.webp` |
| SP05-093 | `components/recipes/styles/manifests/presets/pack_05/SP05-093.yaml` | `assets/recipes/styles/defaults/SP05-093.webp` |
| SP05-094 | `components/recipes/styles/manifests/presets/pack_05/SP05-094.yaml` | `assets/recipes/styles/defaults/SP05-094.webp` |
| SP05-095 | `components/recipes/styles/manifests/presets/pack_05/SP05-095.yaml` | `assets/recipes/styles/defaults/SP05-095.webp` |
| SP05-096 | `components/recipes/styles/manifests/presets/pack_05/SP05-096.yaml` | `assets/recipes/styles/defaults/SP05-096.webp` |
| SP05-097 | `components/recipes/styles/manifests/presets/pack_05/SP05-097.yaml` | `assets/recipes/styles/defaults/SP05-097.webp` |
| SP05-098 | `components/recipes/styles/manifests/presets/pack_05/SP05-098.yaml` | `assets/recipes/styles/defaults/SP05-098.webp` |
| SP05-099 | `components/recipes/styles/manifests/presets/pack_05/SP05-099.yaml` | `assets/recipes/styles/defaults/SP05-099.webp` |
| SP05-100 | `components/recipes/styles/manifests/presets/pack_05/SP05-100.yaml` | `assets/recipes/styles/defaults/SP05-100.webp` |
| SP05-121 | `components/recipes/styles/manifests/presets/pack_05/SP05-121.yaml` | `assets/recipes/styles/defaults/SP05-121.webp` |
| SP05-122 | `components/recipes/styles/manifests/presets/pack_05/SP05-122.yaml` | `assets/recipes/styles/defaults/SP05-122.webp` |
| SP05-123 | `components/recipes/styles/manifests/presets/pack_05/SP05-123.yaml` | `assets/recipes/styles/defaults/SP05-123.webp` |
| SP05-124 | `components/recipes/styles/manifests/presets/pack_05/SP05-124.yaml` | `assets/recipes/styles/defaults/SP05-124.webp` |
| SP05-125 | `components/recipes/styles/manifests/presets/pack_05/SP05-125.yaml` | `assets/recipes/styles/defaults/SP05-125.webp` |
| SP05-126 | `components/recipes/styles/manifests/presets/pack_05/SP05-126.yaml` | `assets/recipes/styles/defaults/SP05-126.webp` |
| SP05-127 | `components/recipes/styles/manifests/presets/pack_05/SP05-127.yaml` | `assets/recipes/styles/defaults/SP05-127.webp` |
| SP05-128 | `components/recipes/styles/manifests/presets/pack_05/SP05-128.yaml` | `assets/recipes/styles/defaults/SP05-128.webp` |
| SP05-129 | `components/recipes/styles/manifests/presets/pack_05/SP05-129.yaml` | `assets/recipes/styles/defaults/SP05-129.webp` |
| SP05-130 | `components/recipes/styles/manifests/presets/pack_05/SP05-130.yaml` | `assets/recipes/styles/defaults/SP05-130.webp` |
| SP05-131 | `components/recipes/styles/manifests/presets/pack_05/SP05-131.yaml` | `assets/recipes/styles/defaults/SP05-131.webp` |
| SP05-132 | `components/recipes/styles/manifests/presets/pack_05/SP05-132.yaml` | `assets/recipes/styles/defaults/SP05-132.webp` |
| SP05-133 | `components/recipes/styles/manifests/presets/pack_05/SP05-133.yaml` | `assets/recipes/styles/defaults/SP05-133.webp` |
| SP05-134 | `components/recipes/styles/manifests/presets/pack_05/SP05-134.yaml` | `assets/recipes/styles/defaults/SP05-134.webp` |
| SP05-135 | `components/recipes/styles/manifests/presets/pack_05/SP05-135.yaml` | `assets/recipes/styles/defaults/SP05-135.webp` |
| SP05-136 | `components/recipes/styles/manifests/presets/pack_05/SP05-136.yaml` | `assets/recipes/styles/defaults/SP05-136.webp` |
| SP05-137 | `components/recipes/styles/manifests/presets/pack_05/SP05-137.yaml` | `assets/recipes/styles/defaults/SP05-137.webp` |
| SP05-138 | `components/recipes/styles/manifests/presets/pack_05/SP05-138.yaml` | `assets/recipes/styles/defaults/SP05-138.webp` |
| SP05-139 | `components/recipes/styles/manifests/presets/pack_05/SP05-139.yaml` | `assets/recipes/styles/defaults/SP05-139.webp` |
| SP05-140 | `components/recipes/styles/manifests/presets/pack_05/SP05-140.yaml` | `assets/recipes/styles/defaults/SP05-140.webp` |
| SP05-142 | `components/recipes/styles/manifests/presets/pack_05/SP05-142.yaml` | `assets/recipes/styles/defaults/SP05-142.webp` |
| SP05-143 | `components/recipes/styles/manifests/presets/pack_05/SP05-143.yaml` | `assets/recipes/styles/defaults/SP05-143.webp` |
| SP05-144 | `components/recipes/styles/manifests/presets/pack_05/SP05-144.yaml` | `assets/recipes/styles/defaults/SP05-144.webp` |
| SP05-148 | `components/recipes/styles/manifests/presets/pack_05/SP05-148.yaml` | `assets/recipes/styles/defaults/SP05-148.webp` |
| SP05-221 | `components/recipes/styles/manifests/presets/pack_05/SP05-221.yaml` | `assets/recipes/styles/defaults/SP05-221.webp` |
| SP05-222 | `components/recipes/styles/manifests/presets/pack_05/SP05-222.yaml` | `assets/recipes/styles/defaults/SP05-222.webp` |
| SP05-223 | `components/recipes/styles/manifests/presets/pack_05/SP05-223.yaml` | `assets/recipes/styles/defaults/SP05-223.webp` |
| SP05-224 | `components/recipes/styles/manifests/presets/pack_05/SP05-224.yaml` | `assets/recipes/styles/defaults/SP05-224.webp` |
| SP05-225 | `components/recipes/styles/manifests/presets/pack_05/SP05-225.yaml` | `assets/recipes/styles/defaults/SP05-225.webp` |
| SP05-226 | `components/recipes/styles/manifests/presets/pack_05/SP05-226.yaml` | `assets/recipes/styles/defaults/SP05-226.webp` |
| SP05-227 | `components/recipes/styles/manifests/presets/pack_05/SP05-227.yaml` | `assets/recipes/styles/defaults/SP05-227.webp` |
| SP05-228 | `components/recipes/styles/manifests/presets/pack_05/SP05-228.yaml` | `assets/recipes/styles/defaults/SP05-228.webp` |
| SP05-229 | `components/recipes/styles/manifests/presets/pack_05/SP05-229.yaml` | `assets/recipes/styles/defaults/SP05-229.webp` |
| SP05-230 | `components/recipes/styles/manifests/presets/pack_05/SP05-230.yaml` | `assets/recipes/styles/defaults/SP05-230.webp` |
| SP05-231 | `components/recipes/styles/manifests/presets/pack_05/SP05-231.yaml` | `assets/recipes/styles/defaults/SP05-231.webp` |
| SP05-232 | `components/recipes/styles/manifests/presets/pack_05/SP05-232.yaml` | `assets/recipes/styles/defaults/SP05-232.webp` |
| SP05-233 | `components/recipes/styles/manifests/presets/pack_05/SP05-233.yaml` | `assets/recipes/styles/defaults/SP05-233.webp` |
| SP05-234 | `components/recipes/styles/manifests/presets/pack_05/SP05-234.yaml` | `assets/recipes/styles/defaults/SP05-234.webp` |
| SP05-235 | `components/recipes/styles/manifests/presets/pack_05/SP05-235.yaml` | `assets/recipes/styles/defaults/SP05-235.webp` |
| SP05-236 | `components/recipes/styles/manifests/presets/pack_05/SP05-236.yaml` | `assets/recipes/styles/defaults/SP05-236.webp` |
| SP05-237 | `components/recipes/styles/manifests/presets/pack_05/SP05-237.yaml` | `assets/recipes/styles/defaults/SP05-237.webp` |
| SP05-238 | `components/recipes/styles/manifests/presets/pack_05/SP05-238.yaml` | `assets/recipes/styles/defaults/SP05-238.webp` |
| SP05-239 | `components/recipes/styles/manifests/presets/pack_05/SP05-239.yaml` | `assets/recipes/styles/defaults/SP05-239.webp` |
| SP05-240 | `components/recipes/styles/manifests/presets/pack_05/SP05-240.yaml` | `assets/recipes/styles/defaults/SP05-240.webp` |
| SP05-241 | `components/recipes/styles/manifests/presets/pack_05/SP05-241.yaml` | `assets/recipes/styles/defaults/SP05-241.webp` |
| SP05-242 | `components/recipes/styles/manifests/presets/pack_05/SP05-242.yaml` | `assets/recipes/styles/defaults/SP05-242.webp` |
| SP05-243 | `components/recipes/styles/manifests/presets/pack_05/SP05-243.yaml` | `assets/recipes/styles/defaults/SP05-243.webp` |
| SP05-244 | `components/recipes/styles/manifests/presets/pack_05/SP05-244.yaml` | `assets/recipes/styles/defaults/SP05-244.webp` |
| SP05-245 | `components/recipes/styles/manifests/presets/pack_05/SP05-245.yaml` | `assets/recipes/styles/defaults/SP05-245.webp` |
| SP05-246 | `components/recipes/styles/manifests/presets/pack_05/SP05-246.yaml` | `assets/recipes/styles/defaults/SP05-246.webp` |
| SP05-247 | `components/recipes/styles/manifests/presets/pack_05/SP05-247.yaml` | `assets/recipes/styles/defaults/SP05-247.webp` |
| SP05-248 | `components/recipes/styles/manifests/presets/pack_05/SP05-248.yaml` | `assets/recipes/styles/defaults/SP05-248.webp` |
| SP05-249 | `components/recipes/styles/manifests/presets/pack_05/SP05-249.yaml` | `assets/recipes/styles/defaults/SP05-249.webp` |
| SP05-250 | `components/recipes/styles/manifests/presets/pack_05/SP05-250.yaml` | `assets/recipes/styles/defaults/SP05-250.webp` |
| SP05-251 | `components/recipes/styles/manifests/presets/pack_05/SP05-251.yaml` | `assets/recipes/styles/defaults/SP05-251.webp` |
| SP05-252 | `components/recipes/styles/manifests/presets/pack_05/SP05-252.yaml` | `assets/recipes/styles/defaults/SP05-252.webp` |
| SP05-253 | `components/recipes/styles/manifests/presets/pack_05/SP05-253.yaml` | `assets/recipes/styles/defaults/SP05-253.webp` |
| SP05-254 | `components/recipes/styles/manifests/presets/pack_05/SP05-254.yaml` | `assets/recipes/styles/defaults/SP05-254.webp` |
| SP05-255 | `components/recipes/styles/manifests/presets/pack_05/SP05-255.yaml` | `assets/recipes/styles/defaults/SP05-255.webp` |
| SP05-256 | `components/recipes/styles/manifests/presets/pack_05/SP05-256.yaml` | `assets/recipes/styles/defaults/SP05-256.webp` |
| SP05-257 | `components/recipes/styles/manifests/presets/pack_05/SP05-257.yaml` | `assets/recipes/styles/defaults/SP05-257.webp` |
| SP05-258 | `components/recipes/styles/manifests/presets/pack_05/SP05-258.yaml` | `assets/recipes/styles/defaults/SP05-258.webp` |
| SP05-259 | `components/recipes/styles/manifests/presets/pack_05/SP05-259.yaml` | `assets/recipes/styles/defaults/SP05-259.webp` |
| SP05-260 | `components/recipes/styles/manifests/presets/pack_05/SP05-260.yaml` | `assets/recipes/styles/defaults/SP05-260.webp` |
| SP05-261 | `components/recipes/styles/manifests/presets/pack_05/SP05-261.yaml` | `assets/recipes/styles/defaults/SP05-261.webp` |
| SP05-262 | `components/recipes/styles/manifests/presets/pack_05/SP05-262.yaml` | `assets/recipes/styles/defaults/SP05-262.webp` |
| SP05-263 | `components/recipes/styles/manifests/presets/pack_05/SP05-263.yaml` | `assets/recipes/styles/defaults/SP05-263.webp` |
| SP05-264 | `components/recipes/styles/manifests/presets/pack_05/SP05-264.yaml` | `assets/recipes/styles/defaults/SP05-264.webp` |
| SP05-265 | `components/recipes/styles/manifests/presets/pack_05/SP05-265.yaml` | `assets/recipes/styles/defaults/SP05-265.webp` |
| SP05-266 | `components/recipes/styles/manifests/presets/pack_05/SP05-266.yaml` | `assets/recipes/styles/defaults/SP05-266.webp` |
| SP05-267 | `components/recipes/styles/manifests/presets/pack_05/SP05-267.yaml` | `assets/recipes/styles/defaults/SP05-267.webp` |
| SP05-268 | `components/recipes/styles/manifests/presets/pack_05/SP05-268.yaml` | `assets/recipes/styles/defaults/SP05-268.webp` |
| SP05-269 | `components/recipes/styles/manifests/presets/pack_05/SP05-269.yaml` | `assets/recipes/styles/defaults/SP05-269.webp` |
| SP05-270 | `components/recipes/styles/manifests/presets/pack_05/SP05-270.yaml` | `assets/recipes/styles/defaults/SP05-270.webp` |
| SP05-271 | `components/recipes/styles/manifests/presets/pack_05/SP05-271.yaml` | `assets/recipes/styles/defaults/SP05-271.webp` |
| SP05-272 | `components/recipes/styles/manifests/presets/pack_05/SP05-272.yaml` | `assets/recipes/styles/defaults/SP05-272.webp` |
| SP05-273 | `components/recipes/styles/manifests/presets/pack_05/SP05-273.yaml` | `assets/recipes/styles/defaults/SP05-273.webp` |
| SP05-274 | `components/recipes/styles/manifests/presets/pack_05/SP05-274.yaml` | `assets/recipes/styles/defaults/SP05-274.webp` |
| SP05-275 | `components/recipes/styles/manifests/presets/pack_05/SP05-275.yaml` | `assets/recipes/styles/defaults/SP05-275.webp` |
| SP05-276 | `components/recipes/styles/manifests/presets/pack_05/SP05-276.yaml` | `assets/recipes/styles/defaults/SP05-276.webp` |
| SP05-277 | `components/recipes/styles/manifests/presets/pack_05/SP05-277.yaml` | `assets/recipes/styles/defaults/SP05-277.webp` |
| SP05-278 | `components/recipes/styles/manifests/presets/pack_05/SP05-278.yaml` | `assets/recipes/styles/defaults/SP05-278.webp` |
| SP05-279 | `components/recipes/styles/manifests/presets/pack_05/SP05-279.yaml` | `assets/recipes/styles/defaults/SP05-279.webp` |
| SP05-280 | `components/recipes/styles/manifests/presets/pack_05/SP05-280.yaml` | `assets/recipes/styles/defaults/SP05-280.webp` |
| SP13-021 | `components/recipes/styles/manifests/presets/pack_05/SP13-021.yaml` | `assets/recipes/styles/defaults/SP13-021.webp` |
| SP13-022 | `components/recipes/styles/manifests/presets/pack_05/SP13-022.yaml` | `assets/recipes/styles/defaults/SP13-022.webp` |
| SP13-023 | `components/recipes/styles/manifests/presets/pack_05/SP13-023.yaml` | `assets/recipes/styles/defaults/SP13-023.webp` |
| SP13-024 | `components/recipes/styles/manifests/presets/pack_05/SP13-024.yaml` | `assets/recipes/styles/defaults/SP13-024.webp` |
| SP13-025 | `components/recipes/styles/manifests/presets/pack_05/SP13-025.yaml` | `assets/recipes/styles/defaults/SP13-025.webp` |

### pack_06

| Preset   | Manifest                                                            | Default card                                   |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SP06-001 | `components/recipes/styles/manifests/presets/pack_06/SP06-001.yaml` | `assets/recipes/styles/defaults/SP06-001.webp` |
| SP06-002 | `components/recipes/styles/manifests/presets/pack_06/SP06-002.yaml` | `assets/recipes/styles/defaults/SP06-002.webp` |
| SP06-003 | `components/recipes/styles/manifests/presets/pack_06/SP06-003.yaml` | `assets/recipes/styles/defaults/SP06-003.webp` |
| SP06-004 | `components/recipes/styles/manifests/presets/pack_06/SP06-004.yaml` | `assets/recipes/styles/defaults/SP06-004.webp` |
| SP06-005 | `components/recipes/styles/manifests/presets/pack_06/SP06-005.yaml` | `assets/recipes/styles/defaults/SP06-005.webp` |
| SP06-006 | `components/recipes/styles/manifests/presets/pack_06/SP06-006.yaml` | `assets/recipes/styles/defaults/SP06-006.webp` |
| SP06-007 | `components/recipes/styles/manifests/presets/pack_06/SP06-007.yaml` | `assets/recipes/styles/defaults/SP06-007.webp` |
| SP06-008 | `components/recipes/styles/manifests/presets/pack_06/SP06-008.yaml` | `assets/recipes/styles/defaults/SP06-008.webp` |
| SP06-009 | `components/recipes/styles/manifests/presets/pack_06/SP06-009.yaml` | `assets/recipes/styles/defaults/SP06-009.webp` |
| SP06-010 | `components/recipes/styles/manifests/presets/pack_06/SP06-010.yaml` | `assets/recipes/styles/defaults/SP06-010.webp` |
| SP06-011 | `components/recipes/styles/manifests/presets/pack_06/SP06-011.yaml` | `assets/recipes/styles/defaults/SP06-011.webp` |
| SP06-012 | `components/recipes/styles/manifests/presets/pack_06/SP06-012.yaml` | `assets/recipes/styles/defaults/SP06-012.webp` |
| SP06-013 | `components/recipes/styles/manifests/presets/pack_06/SP06-013.yaml` | `assets/recipes/styles/defaults/SP06-013.webp` |
| SP06-014 | `components/recipes/styles/manifests/presets/pack_06/SP06-014.yaml` | `assets/recipes/styles/defaults/SP06-014.webp` |
| SP06-015 | `components/recipes/styles/manifests/presets/pack_06/SP06-015.yaml` | `assets/recipes/styles/defaults/SP06-015.webp` |
| SP06-016 | `components/recipes/styles/manifests/presets/pack_06/SP06-016.yaml` | `assets/recipes/styles/defaults/SP06-016.webp` |
| SP06-017 | `components/recipes/styles/manifests/presets/pack_06/SP06-017.yaml` | `assets/recipes/styles/defaults/SP06-017.webp` |
| SP06-018 | `components/recipes/styles/manifests/presets/pack_06/SP06-018.yaml` | `assets/recipes/styles/defaults/SP06-018.webp` |
| SP06-019 | `components/recipes/styles/manifests/presets/pack_06/SP06-019.yaml` | `assets/recipes/styles/defaults/SP06-019.webp` |
| SP06-020 | `components/recipes/styles/manifests/presets/pack_06/SP06-020.yaml` | `assets/recipes/styles/defaults/SP06-020.webp` |
| SP06-021 | `components/recipes/styles/manifests/presets/pack_06/SP06-021.yaml` | `assets/recipes/styles/defaults/SP06-021.webp` |
| SP06-022 | `components/recipes/styles/manifests/presets/pack_06/SP06-022.yaml` | `assets/recipes/styles/defaults/SP06-022.webp` |
| SP06-023 | `components/recipes/styles/manifests/presets/pack_06/SP06-023.yaml` | `assets/recipes/styles/defaults/SP06-023.webp` |
| SP06-024 | `components/recipes/styles/manifests/presets/pack_06/SP06-024.yaml` | `assets/recipes/styles/defaults/SP06-024.webp` |
| SP06-025 | `components/recipes/styles/manifests/presets/pack_06/SP06-025.yaml` | `assets/recipes/styles/defaults/SP06-025.webp` |
| SP06-026 | `components/recipes/styles/manifests/presets/pack_06/SP06-026.yaml` | `assets/recipes/styles/defaults/SP06-026.webp` |
| SP06-027 | `components/recipes/styles/manifests/presets/pack_06/SP06-027.yaml` | `assets/recipes/styles/defaults/SP06-027.webp` |
| SP06-028 | `components/recipes/styles/manifests/presets/pack_06/SP06-028.yaml` | `assets/recipes/styles/defaults/SP06-028.webp` |
| SP06-029 | `components/recipes/styles/manifests/presets/pack_06/SP06-029.yaml` | `assets/recipes/styles/defaults/SP06-029.webp` |
| SP06-030 | `components/recipes/styles/manifests/presets/pack_06/SP06-030.yaml` | `assets/recipes/styles/defaults/SP06-030.webp` |
| SP06-031 | `components/recipes/styles/manifests/presets/pack_06/SP06-031.yaml` | `assets/recipes/styles/defaults/SP06-031.webp` |
| SP06-032 | `components/recipes/styles/manifests/presets/pack_06/SP06-032.yaml` | `assets/recipes/styles/defaults/SP06-032.webp` |
| SP06-033 | `components/recipes/styles/manifests/presets/pack_06/SP06-033.yaml` | `assets/recipes/styles/defaults/SP06-033.webp` |
| SP06-034 | `components/recipes/styles/manifests/presets/pack_06/SP06-034.yaml` | `assets/recipes/styles/defaults/SP06-034.webp` |
| SP06-035 | `components/recipes/styles/manifests/presets/pack_06/SP06-035.yaml` | `assets/recipes/styles/defaults/SP06-035.webp` |
| SP06-036 | `components/recipes/styles/manifests/presets/pack_06/SP06-036.yaml` | `assets/recipes/styles/defaults/SP06-036.webp` |
| SP06-037 | `components/recipes/styles/manifests/presets/pack_06/SP06-037.yaml` | `assets/recipes/styles/defaults/SP06-037.webp` |
| SP06-038 | `components/recipes/styles/manifests/presets/pack_06/SP06-038.yaml` | `assets/recipes/styles/defaults/SP06-038.webp` |
| SP06-039 | `components/recipes/styles/manifests/presets/pack_06/SP06-039.yaml` | `assets/recipes/styles/defaults/SP06-039.webp` |
| SP06-040 | `components/recipes/styles/manifests/presets/pack_06/SP06-040.yaml` | `assets/recipes/styles/defaults/SP06-040.webp` |
| SP06-041 | `components/recipes/styles/manifests/presets/pack_06/SP06-041.yaml` | `assets/recipes/styles/defaults/SP06-041.webp` |
| SP06-042 | `components/recipes/styles/manifests/presets/pack_06/SP06-042.yaml` | `assets/recipes/styles/defaults/SP06-042.webp` |
| SP06-043 | `components/recipes/styles/manifests/presets/pack_06/SP06-043.yaml` | `assets/recipes/styles/defaults/SP06-043.webp` |
| SP06-044 | `components/recipes/styles/manifests/presets/pack_06/SP06-044.yaml` | `assets/recipes/styles/defaults/SP06-044.webp` |
| SP06-045 | `components/recipes/styles/manifests/presets/pack_06/SP06-045.yaml` | `assets/recipes/styles/defaults/SP06-045.webp` |
| SP06-046 | `components/recipes/styles/manifests/presets/pack_06/SP06-046.yaml` | `assets/recipes/styles/defaults/SP06-046.webp` |
| SP06-047 | `components/recipes/styles/manifests/presets/pack_06/SP06-047.yaml` | `assets/recipes/styles/defaults/SP06-047.webp` |
| SP06-048 | `components/recipes/styles/manifests/presets/pack_06/SP06-048.yaml` | `assets/recipes/styles/defaults/SP06-048.webp` |
| SP06-049 | `components/recipes/styles/manifests/presets/pack_06/SP06-049.yaml` | `assets/recipes/styles/defaults/SP06-049.webp` |
| SP06-050 | `components/recipes/styles/manifests/presets/pack_06/SP06-050.yaml` | `assets/recipes/styles/defaults/SP06-050.webp` |
| SP06-051 | `components/recipes/styles/manifests/presets/pack_06/SP06-051.yaml` | `assets/recipes/styles/defaults/SP06-051.webp` |
| SP06-052 | `components/recipes/styles/manifests/presets/pack_06/SP06-052.yaml` | `assets/recipes/styles/defaults/SP06-052.webp` |
| SP06-053 | `components/recipes/styles/manifests/presets/pack_06/SP06-053.yaml` | `assets/recipes/styles/defaults/SP06-053.webp` |
| SP06-054 | `components/recipes/styles/manifests/presets/pack_06/SP06-054.yaml` | `assets/recipes/styles/defaults/SP06-054.webp` |
| SP06-055 | `components/recipes/styles/manifests/presets/pack_06/SP06-055.yaml` | `assets/recipes/styles/defaults/SP06-055.webp` |
| SP06-056 | `components/recipes/styles/manifests/presets/pack_06/SP06-056.yaml` | `assets/recipes/styles/defaults/SP06-056.webp` |
| SP06-057 | `components/recipes/styles/manifests/presets/pack_06/SP06-057.yaml` | `assets/recipes/styles/defaults/SP06-057.webp` |
| SP06-058 | `components/recipes/styles/manifests/presets/pack_06/SP06-058.yaml` | `assets/recipes/styles/defaults/SP06-058.webp` |
| SP06-059 | `components/recipes/styles/manifests/presets/pack_06/SP06-059.yaml` | `assets/recipes/styles/defaults/SP06-059.webp` |
| SP06-060 | `components/recipes/styles/manifests/presets/pack_06/SP06-060.yaml` | `assets/recipes/styles/defaults/SP06-060.webp` |
| SP06-061 | `components/recipes/styles/manifests/presets/pack_06/SP06-061.yaml` | `assets/recipes/styles/defaults/SP06-061.webp` |
| SP06-062 | `components/recipes/styles/manifests/presets/pack_06/SP06-062.yaml` | `assets/recipes/styles/defaults/SP06-062.webp` |
| SP06-063 | `components/recipes/styles/manifests/presets/pack_06/SP06-063.yaml` | `assets/recipes/styles/defaults/SP06-063.webp` |
| SP06-064 | `components/recipes/styles/manifests/presets/pack_06/SP06-064.yaml` | `assets/recipes/styles/defaults/SP06-064.webp` |
| SP06-065 | `components/recipes/styles/manifests/presets/pack_06/SP06-065.yaml` | `assets/recipes/styles/defaults/SP06-065.webp` |
| SP06-066 | `components/recipes/styles/manifests/presets/pack_06/SP06-066.yaml` | `assets/recipes/styles/defaults/SP06-066.webp` |
| SP06-067 | `components/recipes/styles/manifests/presets/pack_06/SP06-067.yaml` | `assets/recipes/styles/defaults/SP06-067.webp` |
| SP06-068 | `components/recipes/styles/manifests/presets/pack_06/SP06-068.yaml` | `assets/recipes/styles/defaults/SP06-068.webp` |
| SP06-069 | `components/recipes/styles/manifests/presets/pack_06/SP06-069.yaml` | `assets/recipes/styles/defaults/SP06-069.webp` |
| SP06-070 | `components/recipes/styles/manifests/presets/pack_06/SP06-070.yaml` | `assets/recipes/styles/defaults/SP06-070.webp` |
| SP06-071 | `components/recipes/styles/manifests/presets/pack_06/SP06-071.yaml` | `assets/recipes/styles/defaults/SP06-071.webp` |
| SP06-072 | `components/recipes/styles/manifests/presets/pack_06/SP06-072.yaml` | `assets/recipes/styles/defaults/SP06-072.webp` |
| SP06-073 | `components/recipes/styles/manifests/presets/pack_06/SP06-073.yaml` | `assets/recipes/styles/defaults/SP06-073.webp` |
| SP06-074 | `components/recipes/styles/manifests/presets/pack_06/SP06-074.yaml` | `assets/recipes/styles/defaults/SP06-074.webp` |
| SP06-075 | `components/recipes/styles/manifests/presets/pack_06/SP06-075.yaml` | `assets/recipes/styles/defaults/SP06-075.webp` |
| SP06-076 | `components/recipes/styles/manifests/presets/pack_06/SP06-076.yaml` | `assets/recipes/styles/defaults/SP06-076.webp` |
| SP06-077 | `components/recipes/styles/manifests/presets/pack_06/SP06-077.yaml` | `assets/recipes/styles/defaults/SP06-077.webp` |
| SP06-078 | `components/recipes/styles/manifests/presets/pack_06/SP06-078.yaml` | `assets/recipes/styles/defaults/SP06-078.webp` |
| SP06-079 | `components/recipes/styles/manifests/presets/pack_06/SP06-079.yaml` | `assets/recipes/styles/defaults/SP06-079.webp` |
| SP06-080 | `components/recipes/styles/manifests/presets/pack_06/SP06-080.yaml` | `assets/recipes/styles/defaults/SP06-080.webp` |
| SP06-081 | `components/recipes/styles/manifests/presets/pack_06/SP06-081.yaml` | `assets/recipes/styles/defaults/SP06-081.webp` |
| SP06-082 | `components/recipes/styles/manifests/presets/pack_06/SP06-082.yaml` | `assets/recipes/styles/defaults/SP06-082.webp` |
| SP06-083 | `components/recipes/styles/manifests/presets/pack_06/SP06-083.yaml` | `assets/recipes/styles/defaults/SP06-083.webp` |
| SP06-084 | `components/recipes/styles/manifests/presets/pack_06/SP06-084.yaml` | `assets/recipes/styles/defaults/SP06-084.webp` |
| SP06-085 | `components/recipes/styles/manifests/presets/pack_06/SP06-085.yaml` | `assets/recipes/styles/defaults/SP06-085.webp` |
| SP06-086 | `components/recipes/styles/manifests/presets/pack_06/SP06-086.yaml` | `assets/recipes/styles/defaults/SP06-086.webp` |
| SP06-087 | `components/recipes/styles/manifests/presets/pack_06/SP06-087.yaml` | `assets/recipes/styles/defaults/SP06-087.webp` |
| SP06-088 | `components/recipes/styles/manifests/presets/pack_06/SP06-088.yaml` | `assets/recipes/styles/defaults/SP06-088.webp` |
| SP06-089 | `components/recipes/styles/manifests/presets/pack_06/SP06-089.yaml` | `assets/recipes/styles/defaults/SP06-089.webp` |
| SP06-090 | `components/recipes/styles/manifests/presets/pack_06/SP06-090.yaml` | `assets/recipes/styles/defaults/SP06-090.webp` |
| SP06-091 | `components/recipes/styles/manifests/presets/pack_06/SP06-091.yaml` | `assets/recipes/styles/defaults/SP06-091.webp` |
| SP06-092 | `components/recipes/styles/manifests/presets/pack_06/SP06-092.yaml` | `assets/recipes/styles/defaults/SP06-092.webp` |
| SP06-093 | `components/recipes/styles/manifests/presets/pack_06/SP06-093.yaml` | `assets/recipes/styles/defaults/SP06-093.webp` |
| SP06-094 | `components/recipes/styles/manifests/presets/pack_06/SP06-094.yaml` | `assets/recipes/styles/defaults/SP06-094.webp` |
| SP06-095 | `components/recipes/styles/manifests/presets/pack_06/SP06-095.yaml` | `assets/recipes/styles/defaults/SP06-095.webp` |
| SP06-096 | `components/recipes/styles/manifests/presets/pack_06/SP06-096.yaml` | `assets/recipes/styles/defaults/SP06-096.webp` |
| SP06-097 | `components/recipes/styles/manifests/presets/pack_06/SP06-097.yaml` | `assets/recipes/styles/defaults/SP06-097.webp` |
| SP06-098 | `components/recipes/styles/manifests/presets/pack_06/SP06-098.yaml` | `assets/recipes/styles/defaults/SP06-098.webp` |
| SP06-099 | `components/recipes/styles/manifests/presets/pack_06/SP06-099.yaml` | `assets/recipes/styles/defaults/SP06-099.webp` |
| SP06-100 | `components/recipes/styles/manifests/presets/pack_06/SP06-100.yaml` | `assets/recipes/styles/defaults/SP06-100.webp` |
| SP06-101 | `components/recipes/styles/manifests/presets/pack_06/SP06-101.yaml` | `assets/recipes/styles/defaults/SP06-101.webp` |
| SP06-102 | `components/recipes/styles/manifests/presets/pack_06/SP06-102.yaml` | `assets/recipes/styles/defaults/SP06-102.webp` |
| SP06-103 | `components/recipes/styles/manifests/presets/pack_06/SP06-103.yaml` | `assets/recipes/styles/defaults/SP06-103.webp` |
| SP06-104 | `components/recipes/styles/manifests/presets/pack_06/SP06-104.yaml` | `assets/recipes/styles/defaults/SP06-104.webp` |
| SP06-105 | `components/recipes/styles/manifests/presets/pack_06/SP06-105.yaml` | `assets/recipes/styles/defaults/SP06-105.webp` |
| SP06-106 | `components/recipes/styles/manifests/presets/pack_06/SP06-106.yaml` | `assets/recipes/styles/defaults/SP06-106.webp` |
| SP06-107 | `components/recipes/styles/manifests/presets/pack_06/SP06-107.yaml` | `assets/recipes/styles/defaults/SP06-107.webp` |
| SP06-108 | `components/recipes/styles/manifests/presets/pack_06/SP06-108.yaml` | `assets/recipes/styles/defaults/SP06-108.webp` |
| SP06-109 | `components/recipes/styles/manifests/presets/pack_06/SP06-109.yaml` | `assets/recipes/styles/defaults/SP06-109.webp` |
| SP06-110 | `components/recipes/styles/manifests/presets/pack_06/SP06-110.yaml` | `assets/recipes/styles/defaults/SP06-110.webp` |
| SP06-111 | `components/recipes/styles/manifests/presets/pack_06/SP06-111.yaml` | `assets/recipes/styles/defaults/SP06-111.webp` |
| SP06-112 | `components/recipes/styles/manifests/presets/pack_06/SP06-112.yaml` | `assets/recipes/styles/defaults/SP06-112.webp` |
| SP06-113 | `components/recipes/styles/manifests/presets/pack_06/SP06-113.yaml` | `assets/recipes/styles/defaults/SP06-113.webp` |
| SP06-114 | `components/recipes/styles/manifests/presets/pack_06/SP06-114.yaml` | `assets/recipes/styles/defaults/SP06-114.webp` |
| SP06-115 | `components/recipes/styles/manifests/presets/pack_06/SP06-115.yaml` | `assets/recipes/styles/defaults/SP06-115.webp` |
| SP06-116 | `components/recipes/styles/manifests/presets/pack_06/SP06-116.yaml` | `assets/recipes/styles/defaults/SP06-116.webp` |
| SP06-117 | `components/recipes/styles/manifests/presets/pack_06/SP06-117.yaml` | `assets/recipes/styles/defaults/SP06-117.webp` |
| SP06-118 | `components/recipes/styles/manifests/presets/pack_06/SP06-118.yaml` | `assets/recipes/styles/defaults/SP06-118.webp` |
| SP06-119 | `components/recipes/styles/manifests/presets/pack_06/SP06-119.yaml` | `assets/recipes/styles/defaults/SP06-119.webp` |
| SP06-120 | `components/recipes/styles/manifests/presets/pack_06/SP06-120.yaml` | `assets/recipes/styles/defaults/SP06-120.webp` |

### pack_07

| Preset   | Manifest                                                            | Default card                                   |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SP07-001 | `components/recipes/styles/manifests/presets/pack_07/SP07-001.yaml` | `assets/recipes/styles/defaults/SP07-001.webp` |
| SP07-002 | `components/recipes/styles/manifests/presets/pack_07/SP07-002.yaml` | `assets/recipes/styles/defaults/SP07-002.webp` |
| SP07-003 | `components/recipes/styles/manifests/presets/pack_07/SP07-003.yaml` | `assets/recipes/styles/defaults/SP07-003.webp` |
| SP07-004 | `components/recipes/styles/manifests/presets/pack_07/SP07-004.yaml` | `assets/recipes/styles/defaults/SP07-004.webp` |
| SP07-005 | `components/recipes/styles/manifests/presets/pack_07/SP07-005.yaml` | `assets/recipes/styles/defaults/SP07-005.webp` |
| SP07-006 | `components/recipes/styles/manifests/presets/pack_07/SP07-006.yaml` | `assets/recipes/styles/defaults/SP07-006.webp` |
| SP07-007 | `components/recipes/styles/manifests/presets/pack_07/SP07-007.yaml` | `assets/recipes/styles/defaults/SP07-007.webp` |
| SP07-008 | `components/recipes/styles/manifests/presets/pack_07/SP07-008.yaml` | `assets/recipes/styles/defaults/SP07-008.webp` |
| SP07-009 | `components/recipes/styles/manifests/presets/pack_07/SP07-009.yaml` | `assets/recipes/styles/defaults/SP07-009.webp` |
| SP07-010 | `components/recipes/styles/manifests/presets/pack_07/SP07-010.yaml` | `assets/recipes/styles/defaults/SP07-010.webp` |
| SP07-011 | `components/recipes/styles/manifests/presets/pack_07/SP07-011.yaml` | `assets/recipes/styles/defaults/SP07-011.webp` |
| SP07-012 | `components/recipes/styles/manifests/presets/pack_07/SP07-012.yaml` | `assets/recipes/styles/defaults/SP07-012.webp` |
| SP07-013 | `components/recipes/styles/manifests/presets/pack_07/SP07-013.yaml` | `assets/recipes/styles/defaults/SP07-013.webp` |
| SP07-014 | `components/recipes/styles/manifests/presets/pack_07/SP07-014.yaml` | `assets/recipes/styles/defaults/SP07-014.webp` |
| SP07-015 | `components/recipes/styles/manifests/presets/pack_07/SP07-015.yaml` | `assets/recipes/styles/defaults/SP07-015.webp` |
| SP07-016 | `components/recipes/styles/manifests/presets/pack_07/SP07-016.yaml` | `assets/recipes/styles/defaults/SP07-016.webp` |
| SP07-017 | `components/recipes/styles/manifests/presets/pack_07/SP07-017.yaml` | `assets/recipes/styles/defaults/SP07-017.webp` |
| SP07-018 | `components/recipes/styles/manifests/presets/pack_07/SP07-018.yaml` | `assets/recipes/styles/defaults/SP07-018.webp` |
| SP07-019 | `components/recipes/styles/manifests/presets/pack_07/SP07-019.yaml` | `assets/recipes/styles/defaults/SP07-019.webp` |
| SP07-020 | `components/recipes/styles/manifests/presets/pack_07/SP07-020.yaml` | `assets/recipes/styles/defaults/SP07-020.webp` |
| SP07-021 | `components/recipes/styles/manifests/presets/pack_07/SP07-021.yaml` | `assets/recipes/styles/defaults/SP07-021.webp` |
| SP07-022 | `components/recipes/styles/manifests/presets/pack_07/SP07-022.yaml` | `assets/recipes/styles/defaults/SP07-022.webp` |
| SP07-023 | `components/recipes/styles/manifests/presets/pack_07/SP07-023.yaml` | `assets/recipes/styles/defaults/SP07-023.webp` |
| SP07-024 | `components/recipes/styles/manifests/presets/pack_07/SP07-024.yaml` | `assets/recipes/styles/defaults/SP07-024.webp` |
| SP07-025 | `components/recipes/styles/manifests/presets/pack_07/SP07-025.yaml` | `assets/recipes/styles/defaults/SP07-025.webp` |
| SP07-026 | `components/recipes/styles/manifests/presets/pack_07/SP07-026.yaml` | `assets/recipes/styles/defaults/SP07-026.webp` |
| SP07-027 | `components/recipes/styles/manifests/presets/pack_07/SP07-027.yaml` | `assets/recipes/styles/defaults/SP07-027.webp` |
| SP07-028 | `components/recipes/styles/manifests/presets/pack_07/SP07-028.yaml` | `assets/recipes/styles/defaults/SP07-028.webp` |
| SP07-029 | `components/recipes/styles/manifests/presets/pack_07/SP07-029.yaml` | `assets/recipes/styles/defaults/SP07-029.webp` |
| SP07-030 | `components/recipes/styles/manifests/presets/pack_07/SP07-030.yaml` | `assets/recipes/styles/defaults/SP07-030.webp` |
| SP07-031 | `components/recipes/styles/manifests/presets/pack_07/SP07-031.yaml` | `assets/recipes/styles/defaults/SP07-031.webp` |
| SP07-032 | `components/recipes/styles/manifests/presets/pack_07/SP07-032.yaml` | `assets/recipes/styles/defaults/SP07-032.webp` |
| SP07-033 | `components/recipes/styles/manifests/presets/pack_07/SP07-033.yaml` | `assets/recipes/styles/defaults/SP07-033.webp` |
| SP07-034 | `components/recipes/styles/manifests/presets/pack_07/SP07-034.yaml` | `assets/recipes/styles/defaults/SP07-034.webp` |
| SP07-035 | `components/recipes/styles/manifests/presets/pack_07/SP07-035.yaml` | `assets/recipes/styles/defaults/SP07-035.webp` |
| SP07-036 | `components/recipes/styles/manifests/presets/pack_07/SP07-036.yaml` | `assets/recipes/styles/defaults/SP07-036.webp` |
| SP07-037 | `components/recipes/styles/manifests/presets/pack_07/SP07-037.yaml` | `assets/recipes/styles/defaults/SP07-037.webp` |
| SP07-038 | `components/recipes/styles/manifests/presets/pack_07/SP07-038.yaml` | `assets/recipes/styles/defaults/SP07-038.webp` |
| SP07-039 | `components/recipes/styles/manifests/presets/pack_07/SP07-039.yaml` | `assets/recipes/styles/defaults/SP07-039.webp` |
| SP07-040 | `components/recipes/styles/manifests/presets/pack_07/SP07-040.yaml` | `assets/recipes/styles/defaults/SP07-040.webp` |
| SP07-041 | `components/recipes/styles/manifests/presets/pack_07/SP07-041.yaml` | `assets/recipes/styles/defaults/SP07-041.webp` |
| SP07-042 | `components/recipes/styles/manifests/presets/pack_07/SP07-042.yaml` | `assets/recipes/styles/defaults/SP07-042.webp` |
| SP07-043 | `components/recipes/styles/manifests/presets/pack_07/SP07-043.yaml` | `assets/recipes/styles/defaults/SP07-043.webp` |
| SP07-044 | `components/recipes/styles/manifests/presets/pack_07/SP07-044.yaml` | `assets/recipes/styles/defaults/SP07-044.webp` |
| SP07-045 | `components/recipes/styles/manifests/presets/pack_07/SP07-045.yaml` | `assets/recipes/styles/defaults/SP07-045.webp` |
| SP07-046 | `components/recipes/styles/manifests/presets/pack_07/SP07-046.yaml` | `assets/recipes/styles/defaults/SP07-046.webp` |
| SP07-047 | `components/recipes/styles/manifests/presets/pack_07/SP07-047.yaml` | `assets/recipes/styles/defaults/SP07-047.webp` |
| SP07-048 | `components/recipes/styles/manifests/presets/pack_07/SP07-048.yaml` | `assets/recipes/styles/defaults/SP07-048.webp` |
| SP07-049 | `components/recipes/styles/manifests/presets/pack_07/SP07-049.yaml` | `assets/recipes/styles/defaults/SP07-049.webp` |
| SP07-050 | `components/recipes/styles/manifests/presets/pack_07/SP07-050.yaml` | `assets/recipes/styles/defaults/SP07-050.webp` |
| SP07-051 | `components/recipes/styles/manifests/presets/pack_07/SP07-051.yaml` | `assets/recipes/styles/defaults/SP07-051.webp` |
| SP07-052 | `components/recipes/styles/manifests/presets/pack_07/SP07-052.yaml` | `assets/recipes/styles/defaults/SP07-052.webp` |
| SP07-053 | `components/recipes/styles/manifests/presets/pack_07/SP07-053.yaml` | `assets/recipes/styles/defaults/SP07-053.webp` |
| SP07-054 | `components/recipes/styles/manifests/presets/pack_07/SP07-054.yaml` | `assets/recipes/styles/defaults/SP07-054.webp` |
| SP07-055 | `components/recipes/styles/manifests/presets/pack_07/SP07-055.yaml` | `assets/recipes/styles/defaults/SP07-055.webp` |
| SP07-056 | `components/recipes/styles/manifests/presets/pack_07/SP07-056.yaml` | `assets/recipes/styles/defaults/SP07-056.webp` |
| SP07-057 | `components/recipes/styles/manifests/presets/pack_07/SP07-057.yaml` | `assets/recipes/styles/defaults/SP07-057.webp` |
| SP07-058 | `components/recipes/styles/manifests/presets/pack_07/SP07-058.yaml` | `assets/recipes/styles/defaults/SP07-058.webp` |
| SP07-059 | `components/recipes/styles/manifests/presets/pack_07/SP07-059.yaml` | `assets/recipes/styles/defaults/SP07-059.webp` |
| SP07-060 | `components/recipes/styles/manifests/presets/pack_07/SP07-060.yaml` | `assets/recipes/styles/defaults/SP07-060.webp` |
| SP07-061 | `components/recipes/styles/manifests/presets/pack_07/SP07-061.yaml` | `assets/recipes/styles/defaults/SP07-061.webp` |
| SP07-062 | `components/recipes/styles/manifests/presets/pack_07/SP07-062.yaml` | `assets/recipes/styles/defaults/SP07-062.webp` |
| SP07-063 | `components/recipes/styles/manifests/presets/pack_07/SP07-063.yaml` | `assets/recipes/styles/defaults/SP07-063.webp` |
| SP07-064 | `components/recipes/styles/manifests/presets/pack_07/SP07-064.yaml` | `assets/recipes/styles/defaults/SP07-064.webp` |
| SP07-065 | `components/recipes/styles/manifests/presets/pack_07/SP07-065.yaml` | `assets/recipes/styles/defaults/SP07-065.webp` |
| SP07-066 | `components/recipes/styles/manifests/presets/pack_07/SP07-066.yaml` | `assets/recipes/styles/defaults/SP07-066.webp` |
| SP07-067 | `components/recipes/styles/manifests/presets/pack_07/SP07-067.yaml` | `assets/recipes/styles/defaults/SP07-067.webp` |
| SP07-068 | `components/recipes/styles/manifests/presets/pack_07/SP07-068.yaml` | `assets/recipes/styles/defaults/SP07-068.webp` |
| SP07-069 | `components/recipes/styles/manifests/presets/pack_07/SP07-069.yaml` | `assets/recipes/styles/defaults/SP07-069.webp` |
| SP07-070 | `components/recipes/styles/manifests/presets/pack_07/SP07-070.yaml` | `assets/recipes/styles/defaults/SP07-070.webp` |
| SP07-071 | `components/recipes/styles/manifests/presets/pack_07/SP07-071.yaml` | `assets/recipes/styles/defaults/SP07-071.webp` |
| SP07-072 | `components/recipes/styles/manifests/presets/pack_07/SP07-072.yaml` | `assets/recipes/styles/defaults/SP07-072.webp` |
| SP07-073 | `components/recipes/styles/manifests/presets/pack_07/SP07-073.yaml` | `assets/recipes/styles/defaults/SP07-073.webp` |
| SP07-074 | `components/recipes/styles/manifests/presets/pack_07/SP07-074.yaml` | `assets/recipes/styles/defaults/SP07-074.webp` |
| SP07-075 | `components/recipes/styles/manifests/presets/pack_07/SP07-075.yaml` | `assets/recipes/styles/defaults/SP07-075.webp` |
| SP07-076 | `components/recipes/styles/manifests/presets/pack_07/SP07-076.yaml` | `assets/recipes/styles/defaults/SP07-076.webp` |
| SP07-077 | `components/recipes/styles/manifests/presets/pack_07/SP07-077.yaml` | `assets/recipes/styles/defaults/SP07-077.webp` |
| SP07-078 | `components/recipes/styles/manifests/presets/pack_07/SP07-078.yaml` | `assets/recipes/styles/defaults/SP07-078.webp` |
| SP07-079 | `components/recipes/styles/manifests/presets/pack_07/SP07-079.yaml` | `assets/recipes/styles/defaults/SP07-079.webp` |
| SP07-080 | `components/recipes/styles/manifests/presets/pack_07/SP07-080.yaml` | `assets/recipes/styles/defaults/SP07-080.webp` |

### pack_08

| Preset | Manifest | Default card |
| ------ | -------- | ------------ |

### pack_09

| Preset   | Manifest                                                            | Default card                                   |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SP09-059 | `components/recipes/styles/manifests/presets/pack_09/SP09-059.yaml` | `assets/recipes/styles/defaults/SP09-059.webp` |
| SP09-060 | `components/recipes/styles/manifests/presets/pack_09/SP09-060.yaml` | `assets/recipes/styles/defaults/SP09-060.webp` |
| SP09-061 | `components/recipes/styles/manifests/presets/pack_09/SP09-061.yaml` | `assets/recipes/styles/defaults/SP09-061.webp` |
| SP09-062 | `components/recipes/styles/manifests/presets/pack_09/SP09-062.yaml` | `assets/recipes/styles/defaults/SP09-062.webp` |
| SP09-063 | `components/recipes/styles/manifests/presets/pack_09/SP09-063.yaml` | `assets/recipes/styles/defaults/SP09-063.webp` |
| SP09-064 | `components/recipes/styles/manifests/presets/pack_09/SP09-064.yaml` | `assets/recipes/styles/defaults/SP09-064.webp` |
| SP09-065 | `components/recipes/styles/manifests/presets/pack_09/SP09-065.yaml` | `assets/recipes/styles/defaults/SP09-065.webp` |
| SP09-066 | `components/recipes/styles/manifests/presets/pack_09/SP09-066.yaml` | `assets/recipes/styles/defaults/SP09-066.webp` |
| SP09-067 | `components/recipes/styles/manifests/presets/pack_09/SP09-067.yaml` | `assets/recipes/styles/defaults/SP09-067.webp` |
| SP09-068 | `components/recipes/styles/manifests/presets/pack_09/SP09-068.yaml` | `assets/recipes/styles/defaults/SP09-068.webp` |
| SP09-069 | `components/recipes/styles/manifests/presets/pack_09/SP09-069.yaml` | `assets/recipes/styles/defaults/SP09-069.webp` |
| SP09-070 | `components/recipes/styles/manifests/presets/pack_09/SP09-070.yaml` | `assets/recipes/styles/defaults/SP09-070.webp` |
| SP09-071 | `components/recipes/styles/manifests/presets/pack_09/SP09-071.yaml` | `assets/recipes/styles/defaults/SP09-071.webp` |
| SP09-072 | `components/recipes/styles/manifests/presets/pack_09/SP09-072.yaml` | `assets/recipes/styles/defaults/SP09-072.webp` |
| SP09-073 | `components/recipes/styles/manifests/presets/pack_09/SP09-073.yaml` | `assets/recipes/styles/defaults/SP09-073.webp` |
| SP09-074 | `components/recipes/styles/manifests/presets/pack_09/SP09-074.yaml` | `assets/recipes/styles/defaults/SP09-074.webp` |
| SP09-075 | `components/recipes/styles/manifests/presets/pack_09/SP09-075.yaml` | `assets/recipes/styles/defaults/SP09-075.webp` |
| SP09-076 | `components/recipes/styles/manifests/presets/pack_09/SP09-076.yaml` | `assets/recipes/styles/defaults/SP09-076.webp` |
| SP09-077 | `components/recipes/styles/manifests/presets/pack_09/SP09-077.yaml` | `assets/recipes/styles/defaults/SP09-077.webp` |
| SP09-078 | `components/recipes/styles/manifests/presets/pack_09/SP09-078.yaml` | `assets/recipes/styles/defaults/SP09-078.webp` |
| SP09-079 | `components/recipes/styles/manifests/presets/pack_09/SP09-079.yaml` | `assets/recipes/styles/defaults/SP09-079.webp` |
| SP09-080 | `components/recipes/styles/manifests/presets/pack_09/SP09-080.yaml` | `assets/recipes/styles/defaults/SP09-080.webp` |

### pack_10

| Preset   | Manifest                                                            | Default card                                   |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SP10-001 | `components/recipes/styles/manifests/presets/pack_10/SP10-001.yaml` | `assets/recipes/styles/defaults/SP10-001.webp` |
| SP10-002 | `components/recipes/styles/manifests/presets/pack_10/SP10-002.yaml` | `assets/recipes/styles/defaults/SP10-002.webp` |
| SP10-003 | `components/recipes/styles/manifests/presets/pack_10/SP10-003.yaml` | `assets/recipes/styles/defaults/SP10-003.webp` |
| SP10-004 | `components/recipes/styles/manifests/presets/pack_10/SP10-004.yaml` | `assets/recipes/styles/defaults/SP10-004.webp` |
| SP10-005 | `components/recipes/styles/manifests/presets/pack_10/SP10-005.yaml` | `assets/recipes/styles/defaults/SP10-005.webp` |
| SP10-006 | `components/recipes/styles/manifests/presets/pack_10/SP10-006.yaml` | `assets/recipes/styles/defaults/SP10-006.webp` |
| SP10-007 | `components/recipes/styles/manifests/presets/pack_10/SP10-007.yaml` | `assets/recipes/styles/defaults/SP10-007.webp` |
| SP10-008 | `components/recipes/styles/manifests/presets/pack_10/SP10-008.yaml` | `assets/recipes/styles/defaults/SP10-008.webp` |
| SP10-009 | `components/recipes/styles/manifests/presets/pack_10/SP10-009.yaml` | `assets/recipes/styles/defaults/SP10-009.webp` |
| SP10-010 | `components/recipes/styles/manifests/presets/pack_10/SP10-010.yaml` | `assets/recipes/styles/defaults/SP10-010.webp` |
| SP10-011 | `components/recipes/styles/manifests/presets/pack_10/SP10-011.yaml` | `assets/recipes/styles/defaults/SP10-011.webp` |
| SP10-012 | `components/recipes/styles/manifests/presets/pack_10/SP10-012.yaml` | `assets/recipes/styles/defaults/SP10-012.webp` |
| SP10-013 | `components/recipes/styles/manifests/presets/pack_10/SP10-013.yaml` | `assets/recipes/styles/defaults/SP10-013.webp` |
| SP10-014 | `components/recipes/styles/manifests/presets/pack_10/SP10-014.yaml` | `assets/recipes/styles/defaults/SP10-014.webp` |
| SP10-015 | `components/recipes/styles/manifests/presets/pack_10/SP10-015.yaml` | `assets/recipes/styles/defaults/SP10-015.webp` |
| SP10-016 | `components/recipes/styles/manifests/presets/pack_10/SP10-016.yaml` | `assets/recipes/styles/defaults/SP10-016.webp` |
| SP10-017 | `components/recipes/styles/manifests/presets/pack_10/SP10-017.yaml` | `assets/recipes/styles/defaults/SP10-017.webp` |
| SP10-018 | `components/recipes/styles/manifests/presets/pack_10/SP10-018.yaml` | `assets/recipes/styles/defaults/SP10-018.webp` |
| SP10-019 | `components/recipes/styles/manifests/presets/pack_10/SP10-019.yaml` | `assets/recipes/styles/defaults/SP10-019.webp` |
| SP10-020 | `components/recipes/styles/manifests/presets/pack_10/SP10-020.yaml` | `assets/recipes/styles/defaults/SP10-020.webp` |
| SP10-021 | `components/recipes/styles/manifests/presets/pack_10/SP10-021.yaml` | `assets/recipes/styles/defaults/SP10-021.webp` |
| SP10-022 | `components/recipes/styles/manifests/presets/pack_10/SP10-022.yaml` | `assets/recipes/styles/defaults/SP10-022.webp` |
| SP10-023 | `components/recipes/styles/manifests/presets/pack_10/SP10-023.yaml` | `assets/recipes/styles/defaults/SP10-023.webp` |
| SP10-024 | `components/recipes/styles/manifests/presets/pack_10/SP10-024.yaml` | `assets/recipes/styles/defaults/SP10-024.webp` |
| SP10-025 | `components/recipes/styles/manifests/presets/pack_10/SP10-025.yaml` | `assets/recipes/styles/defaults/SP10-025.webp` |
| SP10-026 | `components/recipes/styles/manifests/presets/pack_10/SP10-026.yaml` | `assets/recipes/styles/defaults/SP10-026.webp` |
| SP10-027 | `components/recipes/styles/manifests/presets/pack_10/SP10-027.yaml` | `assets/recipes/styles/defaults/SP10-027.webp` |
| SP10-028 | `components/recipes/styles/manifests/presets/pack_10/SP10-028.yaml` | `assets/recipes/styles/defaults/SP10-028.webp` |
| SP10-029 | `components/recipes/styles/manifests/presets/pack_10/SP10-029.yaml` | `assets/recipes/styles/defaults/SP10-029.webp` |
| SP10-030 | `components/recipes/styles/manifests/presets/pack_10/SP10-030.yaml` | `assets/recipes/styles/defaults/SP10-030.webp` |
| SP10-031 | `components/recipes/styles/manifests/presets/pack_10/SP10-031.yaml` | `assets/recipes/styles/defaults/SP10-031.webp` |
| SP10-032 | `components/recipes/styles/manifests/presets/pack_10/SP10-032.yaml` | `assets/recipes/styles/defaults/SP10-032.webp` |
| SP10-033 | `components/recipes/styles/manifests/presets/pack_10/SP10-033.yaml` | `assets/recipes/styles/defaults/SP10-033.webp` |
| SP10-034 | `components/recipes/styles/manifests/presets/pack_10/SP10-034.yaml` | `assets/recipes/styles/defaults/SP10-034.webp` |
| SP10-035 | `components/recipes/styles/manifests/presets/pack_10/SP10-035.yaml` | `assets/recipes/styles/defaults/SP10-035.webp` |
| SP10-036 | `components/recipes/styles/manifests/presets/pack_10/SP10-036.yaml` | `assets/recipes/styles/defaults/SP10-036.webp` |
| SP10-037 | `components/recipes/styles/manifests/presets/pack_10/SP10-037.yaml` | `assets/recipes/styles/defaults/SP10-037.webp` |
| SP10-038 | `components/recipes/styles/manifests/presets/pack_10/SP10-038.yaml` | `assets/recipes/styles/defaults/SP10-038.webp` |
| SP10-039 | `components/recipes/styles/manifests/presets/pack_10/SP10-039.yaml` | `assets/recipes/styles/defaults/SP10-039.webp` |
| SP10-040 | `components/recipes/styles/manifests/presets/pack_10/SP10-040.yaml` | `assets/recipes/styles/defaults/SP10-040.webp` |
| SP10-041 | `components/recipes/styles/manifests/presets/pack_10/SP10-041.yaml` | `assets/recipes/styles/defaults/SP10-041.webp` |
| SP10-042 | `components/recipes/styles/manifests/presets/pack_10/SP10-042.yaml` | `assets/recipes/styles/defaults/SP10-042.webp` |
| SP10-043 | `components/recipes/styles/manifests/presets/pack_10/SP10-043.yaml` | `assets/recipes/styles/defaults/SP10-043.webp` |
| SP10-044 | `components/recipes/styles/manifests/presets/pack_10/SP10-044.yaml` | `assets/recipes/styles/defaults/SP10-044.webp` |
| SP10-045 | `components/recipes/styles/manifests/presets/pack_10/SP10-045.yaml` | `assets/recipes/styles/defaults/SP10-045.webp` |
| SP10-046 | `components/recipes/styles/manifests/presets/pack_10/SP10-046.yaml` | `assets/recipes/styles/defaults/SP10-046.webp` |
| SP10-047 | `components/recipes/styles/manifests/presets/pack_10/SP10-047.yaml` | `assets/recipes/styles/defaults/SP10-047.webp` |
| SP10-048 | `components/recipes/styles/manifests/presets/pack_10/SP10-048.yaml` | `assets/recipes/styles/defaults/SP10-048.webp` |
| SP10-049 | `components/recipes/styles/manifests/presets/pack_10/SP10-049.yaml` | `assets/recipes/styles/defaults/SP10-049.webp` |
| SP10-050 | `components/recipes/styles/manifests/presets/pack_10/SP10-050.yaml` | `assets/recipes/styles/defaults/SP10-050.webp` |
| SP10-051 | `components/recipes/styles/manifests/presets/pack_10/SP10-051.yaml` | `assets/recipes/styles/defaults/SP10-051.webp` |
| SP10-052 | `components/recipes/styles/manifests/presets/pack_10/SP10-052.yaml` | `assets/recipes/styles/defaults/SP10-052.webp` |
| SP10-053 | `components/recipes/styles/manifests/presets/pack_10/SP10-053.yaml` | `assets/recipes/styles/defaults/SP10-053.webp` |
| SP10-054 | `components/recipes/styles/manifests/presets/pack_10/SP10-054.yaml` | `assets/recipes/styles/defaults/SP10-054.webp` |
| SP10-055 | `components/recipes/styles/manifests/presets/pack_10/SP10-055.yaml` | `assets/recipes/styles/defaults/SP10-055.webp` |
| SP10-056 | `components/recipes/styles/manifests/presets/pack_10/SP10-056.yaml` | `assets/recipes/styles/defaults/SP10-056.webp` |
| SP10-057 | `components/recipes/styles/manifests/presets/pack_10/SP10-057.yaml` | `assets/recipes/styles/defaults/SP10-057.webp` |
| SP10-058 | `components/recipes/styles/manifests/presets/pack_10/SP10-058.yaml` | `assets/recipes/styles/defaults/SP10-058.webp` |
| SP10-059 | `components/recipes/styles/manifests/presets/pack_10/SP10-059.yaml` | `assets/recipes/styles/defaults/SP10-059.webp` |
| SP10-060 | `components/recipes/styles/manifests/presets/pack_10/SP10-060.yaml` | `assets/recipes/styles/defaults/SP10-060.webp` |
| SP10-061 | `components/recipes/styles/manifests/presets/pack_10/SP10-061.yaml` | `assets/recipes/styles/defaults/SP10-061.webp` |
| SP10-062 | `components/recipes/styles/manifests/presets/pack_10/SP10-062.yaml` | `assets/recipes/styles/defaults/SP10-062.webp` |
| SP10-063 | `components/recipes/styles/manifests/presets/pack_10/SP10-063.yaml` | `assets/recipes/styles/defaults/SP10-063.webp` |
| SP10-064 | `components/recipes/styles/manifests/presets/pack_10/SP10-064.yaml` | `assets/recipes/styles/defaults/SP10-064.webp` |
| SP10-065 | `components/recipes/styles/manifests/presets/pack_10/SP10-065.yaml` | `assets/recipes/styles/defaults/SP10-065.webp` |
| SP10-066 | `components/recipes/styles/manifests/presets/pack_10/SP10-066.yaml` | `assets/recipes/styles/defaults/SP10-066.webp` |
| SP10-067 | `components/recipes/styles/manifests/presets/pack_10/SP10-067.yaml` | `assets/recipes/styles/defaults/SP10-067.webp` |
| SP10-068 | `components/recipes/styles/manifests/presets/pack_10/SP10-068.yaml` | `assets/recipes/styles/defaults/SP10-068.webp` |
| SP10-069 | `components/recipes/styles/manifests/presets/pack_10/SP10-069.yaml` | `assets/recipes/styles/defaults/SP10-069.webp` |
| SP10-070 | `components/recipes/styles/manifests/presets/pack_10/SP10-070.yaml` | `assets/recipes/styles/defaults/SP10-070.webp` |
| SP10-071 | `components/recipes/styles/manifests/presets/pack_10/SP10-071.yaml` | `assets/recipes/styles/defaults/SP10-071.webp` |
| SP10-072 | `components/recipes/styles/manifests/presets/pack_10/SP10-072.yaml` | `assets/recipes/styles/defaults/SP10-072.webp` |
| SP10-073 | `components/recipes/styles/manifests/presets/pack_10/SP10-073.yaml` | `assets/recipes/styles/defaults/SP10-073.webp` |
| SP10-074 | `components/recipes/styles/manifests/presets/pack_10/SP10-074.yaml` | `assets/recipes/styles/defaults/SP10-074.webp` |
| SP10-075 | `components/recipes/styles/manifests/presets/pack_10/SP10-075.yaml` | `assets/recipes/styles/defaults/SP10-075.webp` |
| SP10-076 | `components/recipes/styles/manifests/presets/pack_10/SP10-076.yaml` | `assets/recipes/styles/defaults/SP10-076.webp` |
| SP10-077 | `components/recipes/styles/manifests/presets/pack_10/SP10-077.yaml` | `assets/recipes/styles/defaults/SP10-077.webp` |
| SP10-078 | `components/recipes/styles/manifests/presets/pack_10/SP10-078.yaml` | `assets/recipes/styles/defaults/SP10-078.webp` |
| SP10-079 | `components/recipes/styles/manifests/presets/pack_10/SP10-079.yaml` | `assets/recipes/styles/defaults/SP10-079.webp` |
| SP10-080 | `components/recipes/styles/manifests/presets/pack_10/SP10-080.yaml` | `assets/recipes/styles/defaults/SP10-080.webp` |

### pack_11

| Preset   | Manifest                                                            | Default card                                   |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SP11-001 | `components/recipes/styles/manifests/presets/pack_11/SP11-001.yaml` | `assets/recipes/styles/defaults/SP11-001.webp` |
| SP11-002 | `components/recipes/styles/manifests/presets/pack_11/SP11-002.yaml` | `assets/recipes/styles/defaults/SP11-002.webp` |
| SP11-003 | `components/recipes/styles/manifests/presets/pack_11/SP11-003.yaml` | `assets/recipes/styles/defaults/SP11-003.webp` |
| SP11-004 | `components/recipes/styles/manifests/presets/pack_11/SP11-004.yaml` | `assets/recipes/styles/defaults/SP11-004.webp` |
| SP11-005 | `components/recipes/styles/manifests/presets/pack_11/SP11-005.yaml` | `assets/recipes/styles/defaults/SP11-005.webp` |
| SP11-006 | `components/recipes/styles/manifests/presets/pack_11/SP11-006.yaml` | `assets/recipes/styles/defaults/SP11-006.webp` |
| SP11-007 | `components/recipes/styles/manifests/presets/pack_11/SP11-007.yaml` | `assets/recipes/styles/defaults/SP11-007.webp` |
| SP11-008 | `components/recipes/styles/manifests/presets/pack_11/SP11-008.yaml` | `assets/recipes/styles/defaults/SP11-008.webp` |
| SP11-009 | `components/recipes/styles/manifests/presets/pack_11/SP11-009.yaml` | `assets/recipes/styles/defaults/SP11-009.webp` |
| SP11-010 | `components/recipes/styles/manifests/presets/pack_11/SP11-010.yaml` | `assets/recipes/styles/defaults/SP11-010.webp` |
| SP11-011 | `components/recipes/styles/manifests/presets/pack_11/SP11-011.yaml` | `assets/recipes/styles/defaults/SP11-011.webp` |
| SP11-012 | `components/recipes/styles/manifests/presets/pack_11/SP11-012.yaml` | `assets/recipes/styles/defaults/SP11-012.webp` |
| SP11-013 | `components/recipes/styles/manifests/presets/pack_11/SP11-013.yaml` | `assets/recipes/styles/defaults/SP11-013.webp` |
| SP11-014 | `components/recipes/styles/manifests/presets/pack_11/SP11-014.yaml` | `assets/recipes/styles/defaults/SP11-014.webp` |
| SP11-015 | `components/recipes/styles/manifests/presets/pack_11/SP11-015.yaml` | `assets/recipes/styles/defaults/SP11-015.webp` |
| SP11-016 | `components/recipes/styles/manifests/presets/pack_11/SP11-016.yaml` | `assets/recipes/styles/defaults/SP11-016.webp` |
| SP11-017 | `components/recipes/styles/manifests/presets/pack_11/SP11-017.yaml` | `assets/recipes/styles/defaults/SP11-017.webp` |
| SP11-018 | `components/recipes/styles/manifests/presets/pack_11/SP11-018.yaml` | `assets/recipes/styles/defaults/SP11-018.webp` |
| SP11-019 | `components/recipes/styles/manifests/presets/pack_11/SP11-019.yaml` | `assets/recipes/styles/defaults/SP11-019.webp` |
| SP11-020 | `components/recipes/styles/manifests/presets/pack_11/SP11-020.yaml` | `assets/recipes/styles/defaults/SP11-020.webp` |
| SP11-021 | `components/recipes/styles/manifests/presets/pack_11/SP11-021.yaml` | `assets/recipes/styles/defaults/SP11-021.webp` |
| SP11-022 | `components/recipes/styles/manifests/presets/pack_11/SP11-022.yaml` | `assets/recipes/styles/defaults/SP11-022.webp` |
| SP11-023 | `components/recipes/styles/manifests/presets/pack_11/SP11-023.yaml` | `assets/recipes/styles/defaults/SP11-023.webp` |
| SP11-024 | `components/recipes/styles/manifests/presets/pack_11/SP11-024.yaml` | `assets/recipes/styles/defaults/SP11-024.webp` |
| SP11-025 | `components/recipes/styles/manifests/presets/pack_11/SP11-025.yaml` | `assets/recipes/styles/defaults/SP11-025.webp` |
| SP11-026 | `components/recipes/styles/manifests/presets/pack_11/SP11-026.yaml` | `assets/recipes/styles/defaults/SP11-026.webp` |
| SP11-027 | `components/recipes/styles/manifests/presets/pack_11/SP11-027.yaml` | `assets/recipes/styles/defaults/SP11-027.webp` |
| SP11-028 | `components/recipes/styles/manifests/presets/pack_11/SP11-028.yaml` | `assets/recipes/styles/defaults/SP11-028.webp` |
| SP11-029 | `components/recipes/styles/manifests/presets/pack_11/SP11-029.yaml` | `assets/recipes/styles/defaults/SP11-029.webp` |
| SP11-030 | `components/recipes/styles/manifests/presets/pack_11/SP11-030.yaml` | `assets/recipes/styles/defaults/SP11-030.webp` |
| SP11-031 | `components/recipes/styles/manifests/presets/pack_11/SP11-031.yaml` | `assets/recipes/styles/defaults/SP11-031.webp` |
| SP11-032 | `components/recipes/styles/manifests/presets/pack_11/SP11-032.yaml` | `assets/recipes/styles/defaults/SP11-032.webp` |
| SP11-033 | `components/recipes/styles/manifests/presets/pack_11/SP11-033.yaml` | `assets/recipes/styles/defaults/SP11-033.webp` |
| SP11-034 | `components/recipes/styles/manifests/presets/pack_11/SP11-034.yaml` | `assets/recipes/styles/defaults/SP11-034.webp` |
| SP11-035 | `components/recipes/styles/manifests/presets/pack_11/SP11-035.yaml` | `assets/recipes/styles/defaults/SP11-035.webp` |
| SP11-036 | `components/recipes/styles/manifests/presets/pack_11/SP11-036.yaml` | `assets/recipes/styles/defaults/SP11-036.webp` |
| SP11-037 | `components/recipes/styles/manifests/presets/pack_11/SP11-037.yaml` | `assets/recipes/styles/defaults/SP11-037.webp` |
| SP11-038 | `components/recipes/styles/manifests/presets/pack_11/SP11-038.yaml` | `assets/recipes/styles/defaults/SP11-038.webp` |
| SP11-039 | `components/recipes/styles/manifests/presets/pack_11/SP11-039.yaml` | `assets/recipes/styles/defaults/SP11-039.webp` |
| SP11-040 | `components/recipes/styles/manifests/presets/pack_11/SP11-040.yaml` | `assets/recipes/styles/defaults/SP11-040.webp` |
| SP11-041 | `components/recipes/styles/manifests/presets/pack_11/SP11-041.yaml` | `assets/recipes/styles/defaults/SP11-041.webp` |
| SP11-042 | `components/recipes/styles/manifests/presets/pack_11/SP11-042.yaml` | `assets/recipes/styles/defaults/SP11-042.webp` |
| SP11-043 | `components/recipes/styles/manifests/presets/pack_11/SP11-043.yaml` | `assets/recipes/styles/defaults/SP11-043.webp` |
| SP11-044 | `components/recipes/styles/manifests/presets/pack_11/SP11-044.yaml` | `assets/recipes/styles/defaults/SP11-044.webp` |
| SP11-045 | `components/recipes/styles/manifests/presets/pack_11/SP11-045.yaml` | `assets/recipes/styles/defaults/SP11-045.webp` |
| SP11-046 | `components/recipes/styles/manifests/presets/pack_11/SP11-046.yaml` | `assets/recipes/styles/defaults/SP11-046.webp` |
| SP11-047 | `components/recipes/styles/manifests/presets/pack_11/SP11-047.yaml` | `assets/recipes/styles/defaults/SP11-047.webp` |
| SP11-048 | `components/recipes/styles/manifests/presets/pack_11/SP11-048.yaml` | `assets/recipes/styles/defaults/SP11-048.webp` |
| SP11-049 | `components/recipes/styles/manifests/presets/pack_11/SP11-049.yaml` | `assets/recipes/styles/defaults/SP11-049.webp` |
| SP11-050 | `components/recipes/styles/manifests/presets/pack_11/SP11-050.yaml` | `assets/recipes/styles/defaults/SP11-050.webp` |
| SP11-051 | `components/recipes/styles/manifests/presets/pack_11/SP11-051.yaml` | `assets/recipes/styles/defaults/SP11-051.webp` |
| SP11-052 | `components/recipes/styles/manifests/presets/pack_11/SP11-052.yaml` | `assets/recipes/styles/defaults/SP11-052.webp` |
| SP11-053 | `components/recipes/styles/manifests/presets/pack_11/SP11-053.yaml` | `assets/recipes/styles/defaults/SP11-053.webp` |
| SP11-054 | `components/recipes/styles/manifests/presets/pack_11/SP11-054.yaml` | `assets/recipes/styles/defaults/SP11-054.webp` |
| SP11-055 | `components/recipes/styles/manifests/presets/pack_11/SP11-055.yaml` | `assets/recipes/styles/defaults/SP11-055.webp` |
| SP11-056 | `components/recipes/styles/manifests/presets/pack_11/SP11-056.yaml` | `assets/recipes/styles/defaults/SP11-056.webp` |
| SP11-057 | `components/recipes/styles/manifests/presets/pack_11/SP11-057.yaml` | `assets/recipes/styles/defaults/SP11-057.webp` |
| SP11-058 | `components/recipes/styles/manifests/presets/pack_11/SP11-058.yaml` | `assets/recipes/styles/defaults/SP11-058.webp` |
| SP11-059 | `components/recipes/styles/manifests/presets/pack_11/SP11-059.yaml` | `assets/recipes/styles/defaults/SP11-059.webp` |
| SP11-060 | `components/recipes/styles/manifests/presets/pack_11/SP11-060.yaml` | `assets/recipes/styles/defaults/SP11-060.webp` |
| SP11-061 | `components/recipes/styles/manifests/presets/pack_11/SP11-061.yaml` | `assets/recipes/styles/defaults/SP11-061.webp` |
| SP11-062 | `components/recipes/styles/manifests/presets/pack_11/SP11-062.yaml` | `assets/recipes/styles/defaults/SP11-062.webp` |
| SP11-063 | `components/recipes/styles/manifests/presets/pack_11/SP11-063.yaml` | `assets/recipes/styles/defaults/SP11-063.webp` |
| SP11-064 | `components/recipes/styles/manifests/presets/pack_11/SP11-064.yaml` | `assets/recipes/styles/defaults/SP11-064.webp` |
| SP11-065 | `components/recipes/styles/manifests/presets/pack_11/SP11-065.yaml` | `assets/recipes/styles/defaults/SP11-065.webp` |
| SP11-066 | `components/recipes/styles/manifests/presets/pack_11/SP11-066.yaml` | `assets/recipes/styles/defaults/SP11-066.webp` |
| SP11-067 | `components/recipes/styles/manifests/presets/pack_11/SP11-067.yaml` | `assets/recipes/styles/defaults/SP11-067.webp` |
| SP11-068 | `components/recipes/styles/manifests/presets/pack_11/SP11-068.yaml` | `assets/recipes/styles/defaults/SP11-068.webp` |
| SP11-069 | `components/recipes/styles/manifests/presets/pack_11/SP11-069.yaml` | `assets/recipes/styles/defaults/SP11-069.webp` |
| SP11-070 | `components/recipes/styles/manifests/presets/pack_11/SP11-070.yaml` | `assets/recipes/styles/defaults/SP11-070.webp` |
| SP11-071 | `components/recipes/styles/manifests/presets/pack_11/SP11-071.yaml` | `assets/recipes/styles/defaults/SP11-071.webp` |
| SP11-072 | `components/recipes/styles/manifests/presets/pack_11/SP11-072.yaml` | `assets/recipes/styles/defaults/SP11-072.webp` |
| SP11-073 | `components/recipes/styles/manifests/presets/pack_11/SP11-073.yaml` | `assets/recipes/styles/defaults/SP11-073.webp` |
| SP11-074 | `components/recipes/styles/manifests/presets/pack_11/SP11-074.yaml` | `assets/recipes/styles/defaults/SP11-074.webp` |
| SP11-075 | `components/recipes/styles/manifests/presets/pack_11/SP11-075.yaml` | `assets/recipes/styles/defaults/SP11-075.webp` |
| SP11-076 | `components/recipes/styles/manifests/presets/pack_11/SP11-076.yaml` | `assets/recipes/styles/defaults/SP11-076.webp` |
| SP11-077 | `components/recipes/styles/manifests/presets/pack_11/SP11-077.yaml` | `assets/recipes/styles/defaults/SP11-077.webp` |
| SP11-078 | `components/recipes/styles/manifests/presets/pack_11/SP11-078.yaml` | `assets/recipes/styles/defaults/SP11-078.webp` |
| SP11-079 | `components/recipes/styles/manifests/presets/pack_11/SP11-079.yaml` | `assets/recipes/styles/defaults/SP11-079.webp` |
| SP11-080 | `components/recipes/styles/manifests/presets/pack_11/SP11-080.yaml` | `assets/recipes/styles/defaults/SP11-080.webp` |

### pack_12

| Preset   | Manifest                                                            | Default card                                   |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SP12-001 | `components/recipes/styles/manifests/presets/pack_12/SP12-001.yaml` | `assets/recipes/styles/defaults/SP12-001.webp` |
| SP12-002 | `components/recipes/styles/manifests/presets/pack_12/SP12-002.yaml` | `assets/recipes/styles/defaults/SP12-002.webp` |
| SP12-003 | `components/recipes/styles/manifests/presets/pack_12/SP12-003.yaml` | `assets/recipes/styles/defaults/SP12-003.webp` |
| SP12-004 | `components/recipes/styles/manifests/presets/pack_12/SP12-004.yaml` | `assets/recipes/styles/defaults/SP12-004.webp` |
| SP12-005 | `components/recipes/styles/manifests/presets/pack_12/SP12-005.yaml` | `assets/recipes/styles/defaults/SP12-005.webp` |
| SP12-006 | `components/recipes/styles/manifests/presets/pack_12/SP12-006.yaml` | `assets/recipes/styles/defaults/SP12-006.webp` |
| SP12-007 | `components/recipes/styles/manifests/presets/pack_12/SP12-007.yaml` | `assets/recipes/styles/defaults/SP12-007.webp` |
| SP12-008 | `components/recipes/styles/manifests/presets/pack_12/SP12-008.yaml` | `assets/recipes/styles/defaults/SP12-008.webp` |
| SP12-009 | `components/recipes/styles/manifests/presets/pack_12/SP12-009.yaml` | `assets/recipes/styles/defaults/SP12-009.webp` |
| SP12-010 | `components/recipes/styles/manifests/presets/pack_12/SP12-010.yaml` | `assets/recipes/styles/defaults/SP12-010.webp` |
| SP12-011 | `components/recipes/styles/manifests/presets/pack_12/SP12-011.yaml` | `assets/recipes/styles/defaults/SP12-011.webp` |
| SP12-012 | `components/recipes/styles/manifests/presets/pack_12/SP12-012.yaml` | `assets/recipes/styles/defaults/SP12-012.webp` |
| SP12-013 | `components/recipes/styles/manifests/presets/pack_12/SP12-013.yaml` | `assets/recipes/styles/defaults/SP12-013.webp` |
| SP12-014 | `components/recipes/styles/manifests/presets/pack_12/SP12-014.yaml` | `assets/recipes/styles/defaults/SP12-014.webp` |
| SP12-015 | `components/recipes/styles/manifests/presets/pack_12/SP12-015.yaml` | `assets/recipes/styles/defaults/SP12-015.webp` |
| SP12-016 | `components/recipes/styles/manifests/presets/pack_12/SP12-016.yaml` | `assets/recipes/styles/defaults/SP12-016.webp` |
| SP12-017 | `components/recipes/styles/manifests/presets/pack_12/SP12-017.yaml` | `assets/recipes/styles/defaults/SP12-017.webp` |
| SP12-018 | `components/recipes/styles/manifests/presets/pack_12/SP12-018.yaml` | `assets/recipes/styles/defaults/SP12-018.webp` |
| SP12-019 | `components/recipes/styles/manifests/presets/pack_12/SP12-019.yaml` | `assets/recipes/styles/defaults/SP12-019.webp` |
| SP12-020 | `components/recipes/styles/manifests/presets/pack_12/SP12-020.yaml` | `assets/recipes/styles/defaults/SP12-020.webp` |
| SP12-021 | `components/recipes/styles/manifests/presets/pack_12/SP12-021.yaml` | `assets/recipes/styles/defaults/SP12-021.webp` |
| SP12-022 | `components/recipes/styles/manifests/presets/pack_12/SP12-022.yaml` | `assets/recipes/styles/defaults/SP12-022.webp` |
| SP12-023 | `components/recipes/styles/manifests/presets/pack_12/SP12-023.yaml` | `assets/recipes/styles/defaults/SP12-023.webp` |
| SP12-024 | `components/recipes/styles/manifests/presets/pack_12/SP12-024.yaml` | `assets/recipes/styles/defaults/SP12-024.webp` |
| SP12-025 | `components/recipes/styles/manifests/presets/pack_12/SP12-025.yaml` | `assets/recipes/styles/defaults/SP12-025.webp` |
| SP12-026 | `components/recipes/styles/manifests/presets/pack_12/SP12-026.yaml` | `assets/recipes/styles/defaults/SP12-026.webp` |
| SP12-027 | `components/recipes/styles/manifests/presets/pack_12/SP12-027.yaml` | `assets/recipes/styles/defaults/SP12-027.webp` |
| SP12-028 | `components/recipes/styles/manifests/presets/pack_12/SP12-028.yaml` | `assets/recipes/styles/defaults/SP12-028.webp` |
| SP12-029 | `components/recipes/styles/manifests/presets/pack_12/SP12-029.yaml` | `assets/recipes/styles/defaults/SP12-029.webp` |
| SP12-030 | `components/recipes/styles/manifests/presets/pack_12/SP12-030.yaml` | `assets/recipes/styles/defaults/SP12-030.webp` |
| SP12-031 | `components/recipes/styles/manifests/presets/pack_12/SP12-031.yaml` | `assets/recipes/styles/defaults/SP12-031.webp` |
| SP12-032 | `components/recipes/styles/manifests/presets/pack_12/SP12-032.yaml` | `assets/recipes/styles/defaults/SP12-032.webp` |
| SP12-033 | `components/recipes/styles/manifests/presets/pack_12/SP12-033.yaml` | `assets/recipes/styles/defaults/SP12-033.webp` |
| SP12-034 | `components/recipes/styles/manifests/presets/pack_12/SP12-034.yaml` | `assets/recipes/styles/defaults/SP12-034.webp` |
| SP12-035 | `components/recipes/styles/manifests/presets/pack_12/SP12-035.yaml` | `assets/recipes/styles/defaults/SP12-035.webp` |
| SP12-036 | `components/recipes/styles/manifests/presets/pack_12/SP12-036.yaml` | `assets/recipes/styles/defaults/SP12-036.webp` |
| SP12-037 | `components/recipes/styles/manifests/presets/pack_12/SP12-037.yaml` | `assets/recipes/styles/defaults/SP12-037.webp` |
| SP12-038 | `components/recipes/styles/manifests/presets/pack_12/SP12-038.yaml` | `assets/recipes/styles/defaults/SP12-038.webp` |
| SP12-039 | `components/recipes/styles/manifests/presets/pack_12/SP12-039.yaml` | `assets/recipes/styles/defaults/SP12-039.webp` |
| SP12-040 | `components/recipes/styles/manifests/presets/pack_12/SP12-040.yaml` | `assets/recipes/styles/defaults/SP12-040.webp` |
| SP12-041 | `components/recipes/styles/manifests/presets/pack_12/SP12-041.yaml` | `assets/recipes/styles/defaults/SP12-041.webp` |
| SP12-042 | `components/recipes/styles/manifests/presets/pack_12/SP12-042.yaml` | `assets/recipes/styles/defaults/SP12-042.webp` |
| SP12-043 | `components/recipes/styles/manifests/presets/pack_12/SP12-043.yaml` | `assets/recipes/styles/defaults/SP12-043.webp` |
| SP12-044 | `components/recipes/styles/manifests/presets/pack_12/SP12-044.yaml` | `assets/recipes/styles/defaults/SP12-044.webp` |
| SP12-045 | `components/recipes/styles/manifests/presets/pack_12/SP12-045.yaml` | `assets/recipes/styles/defaults/SP12-045.webp` |
| SP12-046 | `components/recipes/styles/manifests/presets/pack_12/SP12-046.yaml` | `assets/recipes/styles/defaults/SP12-046.webp` |
| SP12-047 | `components/recipes/styles/manifests/presets/pack_12/SP12-047.yaml` | `assets/recipes/styles/defaults/SP12-047.webp` |
| SP12-048 | `components/recipes/styles/manifests/presets/pack_12/SP12-048.yaml` | `assets/recipes/styles/defaults/SP12-048.webp` |
| SP12-049 | `components/recipes/styles/manifests/presets/pack_12/SP12-049.yaml` | `assets/recipes/styles/defaults/SP12-049.webp` |
| SP12-050 | `components/recipes/styles/manifests/presets/pack_12/SP12-050.yaml` | `assets/recipes/styles/defaults/SP12-050.webp` |
| SP12-051 | `components/recipes/styles/manifests/presets/pack_12/SP12-051.yaml` | `assets/recipes/styles/defaults/SP12-051.webp` |
| SP12-052 | `components/recipes/styles/manifests/presets/pack_12/SP12-052.yaml` | `assets/recipes/styles/defaults/SP12-052.webp` |
| SP12-053 | `components/recipes/styles/manifests/presets/pack_12/SP12-053.yaml` | `assets/recipes/styles/defaults/SP12-053.webp` |
| SP12-054 | `components/recipes/styles/manifests/presets/pack_12/SP12-054.yaml` | `assets/recipes/styles/defaults/SP12-054.webp` |
| SP12-055 | `components/recipes/styles/manifests/presets/pack_12/SP12-055.yaml` | `assets/recipes/styles/defaults/SP12-055.webp` |
| SP12-056 | `components/recipes/styles/manifests/presets/pack_12/SP12-056.yaml` | `assets/recipes/styles/defaults/SP12-056.webp` |
| SP12-057 | `components/recipes/styles/manifests/presets/pack_12/SP12-057.yaml` | `assets/recipes/styles/defaults/SP12-057.webp` |
| SP12-058 | `components/recipes/styles/manifests/presets/pack_12/SP12-058.yaml` | `assets/recipes/styles/defaults/SP12-058.webp` |
| SP12-059 | `components/recipes/styles/manifests/presets/pack_12/SP12-059.yaml` | `assets/recipes/styles/defaults/SP12-059.webp` |
| SP12-060 | `components/recipes/styles/manifests/presets/pack_12/SP12-060.yaml` | `assets/recipes/styles/defaults/SP12-060.webp` |
| SP12-061 | `components/recipes/styles/manifests/presets/pack_12/SP12-061.yaml` | `assets/recipes/styles/defaults/SP12-061.webp` |
| SP12-062 | `components/recipes/styles/manifests/presets/pack_12/SP12-062.yaml` | `assets/recipes/styles/defaults/SP12-062.webp` |
| SP12-063 | `components/recipes/styles/manifests/presets/pack_12/SP12-063.yaml` | `assets/recipes/styles/defaults/SP12-063.webp` |
| SP12-064 | `components/recipes/styles/manifests/presets/pack_12/SP12-064.yaml` | `assets/recipes/styles/defaults/SP12-064.webp` |
| SP12-065 | `components/recipes/styles/manifests/presets/pack_12/SP12-065.yaml` | `assets/recipes/styles/defaults/SP12-065.webp` |
| SP12-066 | `components/recipes/styles/manifests/presets/pack_12/SP12-066.yaml` | `assets/recipes/styles/defaults/SP12-066.webp` |
| SP12-067 | `components/recipes/styles/manifests/presets/pack_12/SP12-067.yaml` | `assets/recipes/styles/defaults/SP12-067.webp` |
| SP12-068 | `components/recipes/styles/manifests/presets/pack_12/SP12-068.yaml` | `assets/recipes/styles/defaults/SP12-068.webp` |
| SP12-069 | `components/recipes/styles/manifests/presets/pack_12/SP12-069.yaml` | `assets/recipes/styles/defaults/SP12-069.webp` |
| SP12-070 | `components/recipes/styles/manifests/presets/pack_12/SP12-070.yaml` | `assets/recipes/styles/defaults/SP12-070.webp` |
| SP12-071 | `components/recipes/styles/manifests/presets/pack_12/SP12-071.yaml` | `assets/recipes/styles/defaults/SP12-071.webp` |
| SP12-072 | `components/recipes/styles/manifests/presets/pack_12/SP12-072.yaml` | `assets/recipes/styles/defaults/SP12-072.webp` |
| SP12-073 | `components/recipes/styles/manifests/presets/pack_12/SP12-073.yaml` | `assets/recipes/styles/defaults/SP12-073.webp` |
| SP12-074 | `components/recipes/styles/manifests/presets/pack_12/SP12-074.yaml` | `assets/recipes/styles/defaults/SP12-074.webp` |
| SP12-075 | `components/recipes/styles/manifests/presets/pack_12/SP12-075.yaml` | `assets/recipes/styles/defaults/SP12-075.webp` |
| SP12-076 | `components/recipes/styles/manifests/presets/pack_12/SP12-076.yaml` | `assets/recipes/styles/defaults/SP12-076.webp` |
| SP12-077 | `components/recipes/styles/manifests/presets/pack_12/SP12-077.yaml` | `assets/recipes/styles/defaults/SP12-077.webp` |
| SP12-078 | `components/recipes/styles/manifests/presets/pack_12/SP12-078.yaml` | `assets/recipes/styles/defaults/SP12-078.webp` |
| SP12-079 | `components/recipes/styles/manifests/presets/pack_12/SP12-079.yaml` | `assets/recipes/styles/defaults/SP12-079.webp` |
| SP12-080 | `components/recipes/styles/manifests/presets/pack_12/SP12-080.yaml` | `assets/recipes/styles/defaults/SP12-080.webp` |

### pack_13

| Preset   | Manifest                                                            | Default card                                   |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SP05-013 | `components/recipes/styles/manifests/presets/pack_13/SP05-013.yaml` | `assets/recipes/styles/defaults/SP05-013.webp` |
| SP05-019 | `components/recipes/styles/manifests/presets/pack_13/SP05-019.yaml` | `assets/recipes/styles/defaults/SP05-019.webp` |
| SP05-020 | `components/recipes/styles/manifests/presets/pack_13/SP05-020.yaml` | `assets/recipes/styles/defaults/SP05-020.webp` |
| SP05-041 | `components/recipes/styles/manifests/presets/pack_13/SP05-041.yaml` | `assets/recipes/styles/defaults/SP05-041.webp` |
| SP05-042 | `components/recipes/styles/manifests/presets/pack_13/SP05-042.yaml` | `assets/recipes/styles/defaults/SP05-042.webp` |
| SP05-043 | `components/recipes/styles/manifests/presets/pack_13/SP05-043.yaml` | `assets/recipes/styles/defaults/SP05-043.webp` |
| SP05-044 | `components/recipes/styles/manifests/presets/pack_13/SP05-044.yaml` | `assets/recipes/styles/defaults/SP05-044.webp` |
| SP05-045 | `components/recipes/styles/manifests/presets/pack_13/SP05-045.yaml` | `assets/recipes/styles/defaults/SP05-045.webp` |
| SP05-046 | `components/recipes/styles/manifests/presets/pack_13/SP05-046.yaml` | `assets/recipes/styles/defaults/SP05-046.webp` |
| SP05-047 | `components/recipes/styles/manifests/presets/pack_13/SP05-047.yaml` | `assets/recipes/styles/defaults/SP05-047.webp` |
| SP05-048 | `components/recipes/styles/manifests/presets/pack_13/SP05-048.yaml` | `assets/recipes/styles/defaults/SP05-048.webp` |
| SP05-049 | `components/recipes/styles/manifests/presets/pack_13/SP05-049.yaml` | `assets/recipes/styles/defaults/SP05-049.webp` |
| SP05-050 | `components/recipes/styles/manifests/presets/pack_13/SP05-050.yaml` | `assets/recipes/styles/defaults/SP05-050.webp` |
| SP05-081 | `components/recipes/styles/manifests/presets/pack_13/SP05-081.yaml` | `assets/recipes/styles/defaults/SP05-081.webp` |
| SP05-082 | `components/recipes/styles/manifests/presets/pack_13/SP05-082.yaml` | `assets/recipes/styles/defaults/SP05-082.webp` |
| SP05-083 | `components/recipes/styles/manifests/presets/pack_13/SP05-083.yaml` | `assets/recipes/styles/defaults/SP05-083.webp` |
| SP05-084 | `components/recipes/styles/manifests/presets/pack_13/SP05-084.yaml` | `assets/recipes/styles/defaults/SP05-084.webp` |
| SP05-085 | `components/recipes/styles/manifests/presets/pack_13/SP05-085.yaml` | `assets/recipes/styles/defaults/SP05-085.webp` |
| SP05-086 | `components/recipes/styles/manifests/presets/pack_13/SP05-086.yaml` | `assets/recipes/styles/defaults/SP05-086.webp` |
| SP05-087 | `components/recipes/styles/manifests/presets/pack_13/SP05-087.yaml` | `assets/recipes/styles/defaults/SP05-087.webp` |
| SP05-088 | `components/recipes/styles/manifests/presets/pack_13/SP05-088.yaml` | `assets/recipes/styles/defaults/SP05-088.webp` |
| SP05-089 | `components/recipes/styles/manifests/presets/pack_13/SP05-089.yaml` | `assets/recipes/styles/defaults/SP05-089.webp` |
| SP05-090 | `components/recipes/styles/manifests/presets/pack_13/SP05-090.yaml` | `assets/recipes/styles/defaults/SP05-090.webp` |
| SP05-101 | `components/recipes/styles/manifests/presets/pack_13/SP05-101.yaml` | `assets/recipes/styles/defaults/SP05-101.webp` |
| SP05-102 | `components/recipes/styles/manifests/presets/pack_13/SP05-102.yaml` | `assets/recipes/styles/defaults/SP05-102.webp` |
| SP05-103 | `components/recipes/styles/manifests/presets/pack_13/SP05-103.yaml` | `assets/recipes/styles/defaults/SP05-103.webp` |
| SP05-104 | `components/recipes/styles/manifests/presets/pack_13/SP05-104.yaml` | `assets/recipes/styles/defaults/SP05-104.webp` |
| SP05-105 | `components/recipes/styles/manifests/presets/pack_13/SP05-105.yaml` | `assets/recipes/styles/defaults/SP05-105.webp` |
| SP05-106 | `components/recipes/styles/manifests/presets/pack_13/SP05-106.yaml` | `assets/recipes/styles/defaults/SP05-106.webp` |
| SP05-107 | `components/recipes/styles/manifests/presets/pack_13/SP05-107.yaml` | `assets/recipes/styles/defaults/SP05-107.webp` |
| SP05-108 | `components/recipes/styles/manifests/presets/pack_13/SP05-108.yaml` | `assets/recipes/styles/defaults/SP05-108.webp` |
| SP05-109 | `components/recipes/styles/manifests/presets/pack_13/SP05-109.yaml` | `assets/recipes/styles/defaults/SP05-109.webp` |
| SP05-110 | `components/recipes/styles/manifests/presets/pack_13/SP05-110.yaml` | `assets/recipes/styles/defaults/SP05-110.webp` |
| SP05-111 | `components/recipes/styles/manifests/presets/pack_13/SP05-111.yaml` | `assets/recipes/styles/defaults/SP05-111.webp` |
| SP05-112 | `components/recipes/styles/manifests/presets/pack_13/SP05-112.yaml` | `assets/recipes/styles/defaults/SP05-112.webp` |
| SP05-113 | `components/recipes/styles/manifests/presets/pack_13/SP05-113.yaml` | `assets/recipes/styles/defaults/SP05-113.webp` |
| SP05-114 | `components/recipes/styles/manifests/presets/pack_13/SP05-114.yaml` | `assets/recipes/styles/defaults/SP05-114.webp` |
| SP05-115 | `components/recipes/styles/manifests/presets/pack_13/SP05-115.yaml` | `assets/recipes/styles/defaults/SP05-115.webp` |
| SP05-116 | `components/recipes/styles/manifests/presets/pack_13/SP05-116.yaml` | `assets/recipes/styles/defaults/SP05-116.webp` |
| SP05-117 | `components/recipes/styles/manifests/presets/pack_13/SP05-117.yaml` | `assets/recipes/styles/defaults/SP05-117.webp` |
| SP05-118 | `components/recipes/styles/manifests/presets/pack_13/SP05-118.yaml` | `assets/recipes/styles/defaults/SP05-118.webp` |
| SP05-119 | `components/recipes/styles/manifests/presets/pack_13/SP05-119.yaml` | `assets/recipes/styles/defaults/SP05-119.webp` |
| SP05-120 | `components/recipes/styles/manifests/presets/pack_13/SP05-120.yaml` | `assets/recipes/styles/defaults/SP05-120.webp` |
| SP05-162 | `components/recipes/styles/manifests/presets/pack_13/SP05-162.yaml` | `assets/recipes/styles/defaults/SP05-162.webp` |
| SP05-168 | `components/recipes/styles/manifests/presets/pack_13/SP05-168.yaml` | `assets/recipes/styles/defaults/SP05-168.webp` |
| SP05-171 | `components/recipes/styles/manifests/presets/pack_13/SP05-171.yaml` | `assets/recipes/styles/defaults/SP05-171.webp` |
| SP05-172 | `components/recipes/styles/manifests/presets/pack_13/SP05-172.yaml` | `assets/recipes/styles/defaults/SP05-172.webp` |
| SP05-176 | `components/recipes/styles/manifests/presets/pack_13/SP05-176.yaml` | `assets/recipes/styles/defaults/SP05-176.webp` |
| SP05-177 | `components/recipes/styles/manifests/presets/pack_13/SP05-177.yaml` | `assets/recipes/styles/defaults/SP05-177.webp` |
| SP05-178 | `components/recipes/styles/manifests/presets/pack_13/SP05-178.yaml` | `assets/recipes/styles/defaults/SP05-178.webp` |
| SP05-181 | `components/recipes/styles/manifests/presets/pack_13/SP05-181.yaml` | `assets/recipes/styles/defaults/SP05-181.webp` |
| SP05-182 | `components/recipes/styles/manifests/presets/pack_13/SP05-182.yaml` | `assets/recipes/styles/defaults/SP05-182.webp` |
| SP05-183 | `components/recipes/styles/manifests/presets/pack_13/SP05-183.yaml` | `assets/recipes/styles/defaults/SP05-183.webp` |
| SP05-184 | `components/recipes/styles/manifests/presets/pack_13/SP05-184.yaml` | `assets/recipes/styles/defaults/SP05-184.webp` |
| SP05-185 | `components/recipes/styles/manifests/presets/pack_13/SP05-185.yaml` | `assets/recipes/styles/defaults/SP05-185.webp` |
| SP05-186 | `components/recipes/styles/manifests/presets/pack_13/SP05-186.yaml` | `assets/recipes/styles/defaults/SP05-186.webp` |
| SP05-187 | `components/recipes/styles/manifests/presets/pack_13/SP05-187.yaml` | `assets/recipes/styles/defaults/SP05-187.webp` |
| SP05-188 | `components/recipes/styles/manifests/presets/pack_13/SP05-188.yaml` | `assets/recipes/styles/defaults/SP05-188.webp` |
| SP05-189 | `components/recipes/styles/manifests/presets/pack_13/SP05-189.yaml` | `assets/recipes/styles/defaults/SP05-189.webp` |
| SP05-190 | `components/recipes/styles/manifests/presets/pack_13/SP05-190.yaml` | `assets/recipes/styles/defaults/SP05-190.webp` |
| SP05-191 | `components/recipes/styles/manifests/presets/pack_13/SP05-191.yaml` | `assets/recipes/styles/defaults/SP05-191.webp` |
| SP05-192 | `components/recipes/styles/manifests/presets/pack_13/SP05-192.yaml` | `assets/recipes/styles/defaults/SP05-192.webp` |
| SP05-193 | `components/recipes/styles/manifests/presets/pack_13/SP05-193.yaml` | `assets/recipes/styles/defaults/SP05-193.webp` |
| SP05-194 | `components/recipes/styles/manifests/presets/pack_13/SP05-194.yaml` | `assets/recipes/styles/defaults/SP05-194.webp` |
| SP05-195 | `components/recipes/styles/manifests/presets/pack_13/SP05-195.yaml` | `assets/recipes/styles/defaults/SP05-195.webp` |
| SP05-196 | `components/recipes/styles/manifests/presets/pack_13/SP05-196.yaml` | `assets/recipes/styles/defaults/SP05-196.webp` |
| SP05-197 | `components/recipes/styles/manifests/presets/pack_13/SP05-197.yaml` | `assets/recipes/styles/defaults/SP05-197.webp` |
| SP05-198 | `components/recipes/styles/manifests/presets/pack_13/SP05-198.yaml` | `assets/recipes/styles/defaults/SP05-198.webp` |
| SP05-199 | `components/recipes/styles/manifests/presets/pack_13/SP05-199.yaml` | `assets/recipes/styles/defaults/SP05-199.webp` |
| SP05-200 | `components/recipes/styles/manifests/presets/pack_13/SP05-200.yaml` | `assets/recipes/styles/defaults/SP05-200.webp` |
| SP05-201 | `components/recipes/styles/manifests/presets/pack_13/SP05-201.yaml` | `assets/recipes/styles/defaults/SP05-201.webp` |
| SP05-202 | `components/recipes/styles/manifests/presets/pack_13/SP05-202.yaml` | `assets/recipes/styles/defaults/SP05-202.webp` |
| SP05-203 | `components/recipes/styles/manifests/presets/pack_13/SP05-203.yaml` | `assets/recipes/styles/defaults/SP05-203.webp` |
| SP05-204 | `components/recipes/styles/manifests/presets/pack_13/SP05-204.yaml` | `assets/recipes/styles/defaults/SP05-204.webp` |
| SP05-205 | `components/recipes/styles/manifests/presets/pack_13/SP05-205.yaml` | `assets/recipes/styles/defaults/SP05-205.webp` |
| SP05-206 | `components/recipes/styles/manifests/presets/pack_13/SP05-206.yaml` | `assets/recipes/styles/defaults/SP05-206.webp` |
| SP05-207 | `components/recipes/styles/manifests/presets/pack_13/SP05-207.yaml` | `assets/recipes/styles/defaults/SP05-207.webp` |
| SP05-208 | `components/recipes/styles/manifests/presets/pack_13/SP05-208.yaml` | `assets/recipes/styles/defaults/SP05-208.webp` |
| SP05-209 | `components/recipes/styles/manifests/presets/pack_13/SP05-209.yaml` | `assets/recipes/styles/defaults/SP05-209.webp` |
| SP05-210 | `components/recipes/styles/manifests/presets/pack_13/SP05-210.yaml` | `assets/recipes/styles/defaults/SP05-210.webp` |
| SP05-211 | `components/recipes/styles/manifests/presets/pack_13/SP05-211.yaml` | `assets/recipes/styles/defaults/SP05-211.webp` |
| SP05-212 | `components/recipes/styles/manifests/presets/pack_13/SP05-212.yaml` | `assets/recipes/styles/defaults/SP05-212.webp` |
| SP05-213 | `components/recipes/styles/manifests/presets/pack_13/SP05-213.yaml` | `assets/recipes/styles/defaults/SP05-213.webp` |
| SP05-214 | `components/recipes/styles/manifests/presets/pack_13/SP05-214.yaml` | `assets/recipes/styles/defaults/SP05-214.webp` |
| SP05-215 | `components/recipes/styles/manifests/presets/pack_13/SP05-215.yaml` | `assets/recipes/styles/defaults/SP05-215.webp` |
| SP05-216 | `components/recipes/styles/manifests/presets/pack_13/SP05-216.yaml` | `assets/recipes/styles/defaults/SP05-216.webp` |
| SP05-217 | `components/recipes/styles/manifests/presets/pack_13/SP05-217.yaml` | `assets/recipes/styles/defaults/SP05-217.webp` |
| SP05-218 | `components/recipes/styles/manifests/presets/pack_13/SP05-218.yaml` | `assets/recipes/styles/defaults/SP05-218.webp` |
| SP05-219 | `components/recipes/styles/manifests/presets/pack_13/SP05-219.yaml` | `assets/recipes/styles/defaults/SP05-219.webp` |
| SP05-220 | `components/recipes/styles/manifests/presets/pack_13/SP05-220.yaml` | `assets/recipes/styles/defaults/SP05-220.webp` |
| SP05-321 | `components/recipes/styles/manifests/presets/pack_13/SP05-321.yaml` | `assets/recipes/styles/defaults/SP05-321.webp` |
| SP05-322 | `components/recipes/styles/manifests/presets/pack_13/SP05-322.yaml` | `assets/recipes/styles/defaults/SP05-322.webp` |
| SP05-323 | `components/recipes/styles/manifests/presets/pack_13/SP05-323.yaml` | `assets/recipes/styles/defaults/SP05-323.webp` |
| SP05-324 | `components/recipes/styles/manifests/presets/pack_13/SP05-324.yaml` | `assets/recipes/styles/defaults/SP05-324.webp` |
| SP05-325 | `components/recipes/styles/manifests/presets/pack_13/SP05-325.yaml` | `assets/recipes/styles/defaults/SP05-325.webp` |
| SP05-326 | `components/recipes/styles/manifests/presets/pack_13/SP05-326.yaml` | `assets/recipes/styles/defaults/SP05-326.webp` |
| SP05-327 | `components/recipes/styles/manifests/presets/pack_13/SP05-327.yaml` | `assets/recipes/styles/defaults/SP05-327.webp` |
| SP05-328 | `components/recipes/styles/manifests/presets/pack_13/SP05-328.yaml` | `assets/recipes/styles/defaults/SP05-328.webp` |
| SP05-329 | `components/recipes/styles/manifests/presets/pack_13/SP05-329.yaml` | `assets/recipes/styles/defaults/SP05-329.webp` |
| SP05-330 | `components/recipes/styles/manifests/presets/pack_13/SP05-330.yaml` | `assets/recipes/styles/defaults/SP05-330.webp` |
| SP05-331 | `components/recipes/styles/manifests/presets/pack_13/SP05-331.yaml` | `assets/recipes/styles/defaults/SP05-331.webp` |
| SP05-332 | `components/recipes/styles/manifests/presets/pack_13/SP05-332.yaml` | `assets/recipes/styles/defaults/SP05-332.webp` |
| SP05-333 | `components/recipes/styles/manifests/presets/pack_13/SP05-333.yaml` | `assets/recipes/styles/defaults/SP05-333.webp` |
| SP05-334 | `components/recipes/styles/manifests/presets/pack_13/SP05-334.yaml` | `assets/recipes/styles/defaults/SP05-334.webp` |
| SP05-335 | `components/recipes/styles/manifests/presets/pack_13/SP05-335.yaml` | `assets/recipes/styles/defaults/SP05-335.webp` |
| SP05-336 | `components/recipes/styles/manifests/presets/pack_13/SP05-336.yaml` | `assets/recipes/styles/defaults/SP05-336.webp` |
| SP05-337 | `components/recipes/styles/manifests/presets/pack_13/SP05-337.yaml` | `assets/recipes/styles/defaults/SP05-337.webp` |
| SP05-338 | `components/recipes/styles/manifests/presets/pack_13/SP05-338.yaml` | `assets/recipes/styles/defaults/SP05-338.webp` |
| SP05-339 | `components/recipes/styles/manifests/presets/pack_13/SP05-339.yaml` | `assets/recipes/styles/defaults/SP05-339.webp` |
| SP05-340 | `components/recipes/styles/manifests/presets/pack_13/SP05-340.yaml` | `assets/recipes/styles/defaults/SP05-340.webp` |
| SP05-341 | `components/recipes/styles/manifests/presets/pack_13/SP05-341.yaml` | `assets/recipes/styles/defaults/SP05-341.webp` |
| SP05-342 | `components/recipes/styles/manifests/presets/pack_13/SP05-342.yaml` | `assets/recipes/styles/defaults/SP05-342.webp` |
| SP13-001 | `components/recipes/styles/manifests/presets/pack_13/SP13-001.yaml` | `assets/recipes/styles/defaults/SP13-001.webp` |
| SP13-002 | `components/recipes/styles/manifests/presets/pack_13/SP13-002.yaml` | `assets/recipes/styles/defaults/SP13-002.webp` |
| SP13-003 | `components/recipes/styles/manifests/presets/pack_13/SP13-003.yaml` | `assets/recipes/styles/defaults/SP13-003.webp` |
| SP13-004 | `components/recipes/styles/manifests/presets/pack_13/SP13-004.yaml` | `assets/recipes/styles/defaults/SP13-004.webp` |
| SP13-005 | `components/recipes/styles/manifests/presets/pack_13/SP13-005.yaml` | `assets/recipes/styles/defaults/SP13-005.webp` |
| SP13-006 | `components/recipes/styles/manifests/presets/pack_13/SP13-006.yaml` | `assets/recipes/styles/defaults/SP13-006.webp` |
| SP13-007 | `components/recipes/styles/manifests/presets/pack_13/SP13-007.yaml` | `assets/recipes/styles/defaults/SP13-007.webp` |
| SP13-008 | `components/recipes/styles/manifests/presets/pack_13/SP13-008.yaml` | `assets/recipes/styles/defaults/SP13-008.webp` |
| SP13-009 | `components/recipes/styles/manifests/presets/pack_13/SP13-009.yaml` | `assets/recipes/styles/defaults/SP13-009.webp` |
| SP13-010 | `components/recipes/styles/manifests/presets/pack_13/SP13-010.yaml` | `assets/recipes/styles/defaults/SP13-010.webp` |
| SP13-011 | `components/recipes/styles/manifests/presets/pack_13/SP13-011.yaml` | `assets/recipes/styles/defaults/SP13-011.webp` |
| SP13-012 | `components/recipes/styles/manifests/presets/pack_13/SP13-012.yaml` | `assets/recipes/styles/defaults/SP13-012.webp` |
| SP13-013 | `components/recipes/styles/manifests/presets/pack_13/SP13-013.yaml` | `assets/recipes/styles/defaults/SP13-013.webp` |
| SP13-014 | `components/recipes/styles/manifests/presets/pack_13/SP13-014.yaml` | `assets/recipes/styles/defaults/SP13-014.webp` |
| SP13-015 | `components/recipes/styles/manifests/presets/pack_13/SP13-015.yaml` | `assets/recipes/styles/defaults/SP13-015.webp` |
| SP13-016 | `components/recipes/styles/manifests/presets/pack_13/SP13-016.yaml` | `assets/recipes/styles/defaults/SP13-016.webp` |
| SP13-017 | `components/recipes/styles/manifests/presets/pack_13/SP13-017.yaml` | `assets/recipes/styles/defaults/SP13-017.webp` |
| SP13-018 | `components/recipes/styles/manifests/presets/pack_13/SP13-018.yaml` | `assets/recipes/styles/defaults/SP13-018.webp` |
| SP13-019 | `components/recipes/styles/manifests/presets/pack_13/SP13-019.yaml` | `assets/recipes/styles/defaults/SP13-019.webp` |
| SP13-020 | `components/recipes/styles/manifests/presets/pack_13/SP13-020.yaml` | `assets/recipes/styles/defaults/SP13-020.webp` |

### pack_14

Audit note 2026-06-07:

- `123/123` manifests siguen con `assets.defaultImage` apuntando a `SP14-xxx.webp`, pero `hasDefaultImage: false` en toda la taxonomy.
- Existen solo `8` assets legacy en disco (`SP14-001..008`) y los `8` quedaron stale frente a los nombres/manifests actuales del checkpoint `manifest-pack_14.json`.
- Conteo operativo para la siguiente ronda: `stale_existing=8`, `missing=115`.
- Ejemplos de drift confirmado: `SP14-001` (`Cathedral Eclipse Procession` -> `Eclipse Reliquary Processional`), `SP14-008` (`Funeral Rose Cavalier` -> `Funeral Rose Psychopomp`).

Regeneration note 2026-06-08:

- `SP14-001` a `SP14-008` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_14.json`.
- `SP14-003..008` se cerraron recuperando PNGs reales desde transcript/cache de Codex luego de que el worker hubiera completado jobs que el CLI habia marcado como timeout local.
- Estado real en repo tras esta tanda: `regenerated_current=8`, `stale_existing=0`, `missing=115`.
- Regla operativa validada: no contar un job `completed` del worker como cerrado hasta ver `.webp` actualizado en repo y checkpoint nuevo en `manifest-pack_14.json`.

Regeneration note 2026-06-08 (ola 2):

- `SP14-009` a `SP14-012` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_14.json`.
- `SP14-010` requirio un retry por `status needs_review`, pero la segunda pasada materializo normal sin recovery manual.
- Estado real en repo tras esta tanda: `regenerated_current=12`, `stale_existing=0`, `missing=111`.
- Coverage real verificado despues de backfill + validate secuencial: `pack_14 defaultImages=12/123`.

Regeneration note 2026-06-08 (ola 3):

- `SP14-013` a `SP14-016` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_14.json`.
- `SP14-016` fallo primero con `status needs_review` en tres intentos seguidos; se destrabo con un ajuste minimo en el manifest (`sacrificial` -> `ceremonial`, `sacrifice` -> `offering rite`) y luego materializo tras dos retries y un tercer intento exitoso.
- Estado real en repo tras esta tanda: `regenerated_current=16`, `stale_existing=0`, `missing=107`.
- Coverage real verificado despues de backfill + validate secuencial: `pack_14 defaultImages=16/123`.

Regeneration note 2026-06-08 (ola 4):

- `SP14-017` a `SP14-020` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_14.json`.
- Esta tanda salio limpia: `4/4` materializados sin retries especiales ni recovery manual.
- Estado real en repo tras esta tanda: `regenerated_current=20`, `stale_existing=0`, `missing=103`.
- Coverage real verificado despues de backfill + validate: `pack_14 defaultImages=20/123`.

Regeneration note 2026-06-08 (ola 5):

- `SP14-021` a `SP14-024` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_14.json`.
- Esta tanda tambien salio limpia: `4/4` materializados sin retries especiales ni recovery manual.
- Estado real en repo tras esta tanda: `regenerated_current=24`, `stale_existing=0`, `missing=99`.
- Coverage real verificado despues de backfill + validate: `pack_14 defaultImages=24/123`.

Regeneration note 2026-06-08 (ola 6):

- `SP14-025` a `SP14-028` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_14.json`.
- Esta tanda tambien salio limpia: `4/4` materializados sin retries especiales ni recovery manual.
- Estado real en repo tras esta tanda: `regenerated_current=28`, `stale_existing=0`, `missing=95`.
- Coverage real verificado despues de backfill + validate: `pack_14 defaultImages=28/123`.

Regeneration note 2026-06-08 (ola 7):

- `SP14-029` a `SP14-032` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_14.json`.
- Esta tanda tambien salio limpia: `4/4` materializados sin retries especiales ni recovery manual.
- Estado real en repo tras esta tanda: `regenerated_current=32`, `stale_existing=0`, `missing=91`.
- Coverage real verificado despues de backfill + validate: `pack_14 defaultImages=32/123`.

Regeneration note 2026-06-08 (ola 8):

- `SP14-033` a `SP14-036` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_14.json`.
- Esta tanda tambien salio limpia: `4/4` materializados sin retries especiales ni recovery manual.
- Estado real en repo tras esta tanda: `regenerated_current=36`, `stale_existing=0`, `missing=87`.
- Coverage real verificado despues de backfill + validate: `pack_14 defaultImages=36/123`.

Pending rows cleared 2026-06-08:

- `SP14-114..123` ya quedaron materializados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_14.json`.
- Estado real final de `pack_14`: `regenerated_current=123`, `stale_existing=0`, `missing=0`.
- Coverage real final verificado: `pack_14 defaultImages=123/123`.

### pack_15

Audit note 2026-06-07:

- `137/137` manifests siguen con `assets.defaultImage` apuntando a `SP15-xxx.webp`, pero `hasDefaultImage: false` en toda la taxonomy.
- Existen solo `8` assets legacy en disco (`SP15-001..008`) y siguen fuera de materializacion publicada; `SP15-003` tiene drift confirmado contra el checkpoint `manifest-pack_15.json`.
- Los otros `7` assets legacy deben tratarse como `requires-regeneration` para no asumir vigencia visual sin republicacion/materializacion.
- Conteo operativo para la siguiente ronda: `legacy_existing_requires_regen=8`, `missing=129`.
- Ejemplo de drift confirmado: `SP15-003` (`Coral Transit Canopy` -> `Tidal Bioport Exchange`).

Regeneration note 2026-06-08 (ola 1):

- `SP15-001..008` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_15.json`.
- Bloque `legacy` cerrado: `legacy_existing_requires_regen=0`.
- `SP15-009..012` ya quedaron materializados tambien.
- Estado real tras esta ronda: `regenerated_current=12`, `stale_existing=0`, `missing=125`.
- Coverage real esperado tras backfill + validate: `pack_15 defaultImages=12/137`.
- Hallazgo operativo: estrategia secuencial `1x1` fue estable para las `12` cards; no hubo zombies ni cancelaciones manuales.

Regeneration note 2026-06-08 (ola 2):

- `SP15-013..020` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_15.json`.
- Estado real tras esta ronda: `regenerated_current=20`, `stale_existing=0`, `missing=117`.
- Coverage real esperado tras backfill + validate: `pack_15 defaultImages=20/137`.
- Hallazgo operativo: estrategia secuencial `1x1` siguio estable en `8/8`; sin `running` zombies, sin `socket closed`, sin cancelaciones manuales.

Regeneration note 2026-06-08 (ola 3):

- `SP15-021..028` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_15.json`.
- Estado real tras esta ronda: `regenerated_current=28`, `stale_existing=0`, `missing=109`.
- Coverage real esperado tras backfill + validate: `pack_15 defaultImages=28/137`.
- Hallazgo operativo:
  - estrategia secuencial `1x1` siguio estable en `7/8` al primer intento.
  - `SP15-026` pego timeout de espera en CLI y dejo job `running` sin progreso visible; se cancelo y rerun aislado inmediato si cerro bien.
  - no hubo `socket closed`; el caso se comporto como cuelgue puntual del job, no caida general del transporte.

Regeneration note 2026-06-08 (ola 4):

- `SP15-029..036` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_15.json`.
- Estado real tras esta ronda: `regenerated_current=36`, `stale_existing=0`, `missing=101`.
- Coverage real esperado tras backfill + validate: `pack_15 defaultImages=36/137`.
- Hallazgo operativo:
  - estrategia secuencial `1x1` volvio a salir estable en `8/8`.
  - no hubo `running` zombies, ni `socket closed`, ni cancelaciones manuales en esta tanda.

Regeneration note 2026-06-08 (ola 5):

- `SP15-037..044` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_15.json`.
- Estado real tras esta ronda: `regenerated_current=44`, `stale_existing=0`, `missing=93`.
- Coverage real esperado tras backfill + validate: `pack_15 defaultImages=44/137`.
- Hallazgo operativo:
  - el loop inicial `SP15-037..044` agoto la ventana de la herramienta, pero `SP15-037..042` igual terminaron materializados en background y con checkpoint real.
  - `SP15-043` y `SP15-044` se cerraron luego sin drama en rerun aislado `1x1`.
  - no hubo `socket closed`, ni `running` zombies, ni cancelaciones manuales en esta tanda.

Regeneration note 2026-06-08 (ola 6):

- `SP15-045..052` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_15.json`.
- Estado real tras esta ronda: `regenerated_current=52`, `stale_existing=0`, `missing=85`.
- Coverage real esperado tras backfill + validate: `pack_15 defaultImages=52/137`.
- Hallazgo operativo:
  - `SP15-045` y `SP15-046` cerraron via worker en background despues de que el primer loop agotara ventana.
  - `SP15-047` quedo trabado y luego fallo con `Codex app-server socket closed`; se destrabo al suavizar wording en `components/recipes/styles/manifests/presets/pack_15/SP15-047.yaml` y rerun `1x1`.
  - `SP15-048` cerro limpia en rerun aislado.
  - `SP15-049..052` cerraron limpias en dos tandas cortas `1x1`.

Regeneration note 2026-06-08 (ola 7):

- `SP15-053..060` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_15.json`.
- Estado real tras esta ronda: `regenerated_current=60`, `stale_existing=0`, `missing=77`.
- Coverage real esperado tras backfill + validate: `pack_15 defaultImages=60/137`.
- Hallazgo operativo:
  - `SP15-053..055` habian quedado materializadas antes del sync documental.
  - `SP15-056` primero se trabo por `Codex app-server socket closed`, luego por reuse de thread muerto `019ea8c3-64f7-7881-86d6-b54cc0dc29ab`.
  - reiniciar `local-server` vacio el pool en memoria; despues de levantar `app-server` de nuevo, `SP15-056` cerro limpia al primer rerun.
  - `SP15-057..060` cerraron limpias en secuencial `1x1` tras ese reset.

Regeneration note 2026-06-08 (ola 8):

- `SP15-061..068` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_15.json`.
- Estado real tras esta ronda: `regenerated_current=68`, `stale_existing=0`, `missing=69`.
- Coverage real esperado tras backfill + validate: `pack_15 defaultImages=68/137`.
- Hallazgo operativo:
  - `SP15-061..068` cerraron `8/8` en secuencial `1x1`, sin retries, `socket closed`, ni jobs zombie.
  - el reset previo de `local-server` dejo el pool de sesiones estable tambien para el bloque raypunk.

Regeneration note 2026-06-08 (ola 9):

- `SP15-069..076` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_15.json`.
- Estado real tras esta ronda: `regenerated_current=76`, `stale_existing=0`, `missing=61`.
- Coverage real esperado tras backfill + validate: `pack_15 defaultImages=76/137`.
- Hallazgo operativo:
  - `SP15-069..075` cerraron limpias en secuencial `1x1`.
  - el loop largo agoto ventana justo durante `SP15-076`.
  - `SP15-076` aparecio `completed` en API pero sin `.webp` ni checkpoint en repo; rerun aislado `1x1` la cerro de verdad.

Regeneration note 2026-06-08 (ola 10):

- `SP15-077..084` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_15.json`.
- Estado real tras esta ronda: `regenerated_current=84`, `stale_existing=0`, `missing=53`.
- Coverage real esperado tras backfill + validate: `pack_15 defaultImages=84/137`.
- Hallazgo operativo:
  - primera prueba `2x2` real del frente.
  - `SP15-077..084` cerraron `8/8` sin `socket closed`, sin jobs zombie, y sin falso verde de checkpoint.
  - `2x2` fue sensiblemente mas rapido que `1x1`, sin perder trazabilidad en esta ola.

Regeneration note 2026-06-08 (ola 11):

- `SP15-085..092` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_15.json`.
- Estado real tras esta ronda: `regenerated_current=92`, `stale_existing=0`, `missing=45`.
- Coverage real esperado tras backfill + validate: `pack_15 defaultImages=92/137`.
- Hallazgo operativo:
  - segunda prueba `2x2` real del frente.
  - `SP15-085..092` cerraron `8/8` sin `socket closed`, sin jobs zombie, y sin falsos verdes.
  - `2x2` sigue siendo el mejor punto medio actual entre velocidad y trazabilidad.

Regeneration note 2026-06-09 (ola 12):

- `SP15-093..100` ya quedaron regenerados y checkpointed en `assets/recipes/styles/defaults/manifest-pack_15.json`.
- Estado real tras esta ronda: `regenerated_current=100`, `stale_existing=0`, `missing=37`.
- Coverage real esperado tras backfill + validate: `pack_15 defaultImages=100/137`.
- Hallazgo operativo:
  - tercera prueba `2x2` real del frente.
  - `SP15-093..100` cerraron `8/8` sin `socket closed`, sin jobs zombie, y sin falsos verdes.
  - `2x2` se sostiene estable tambien al cruzar de clockpunk a solarpunk dentro del mismo pack.

### pack_16

| Preset   | Manifest                                                            | Default card                                   |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SP05-001 | `components/recipes/styles/manifests/presets/pack_16/SP05-001.yaml` | `assets/recipes/styles/defaults/SP05-001.webp` |
| SP05-002 | `components/recipes/styles/manifests/presets/pack_16/SP05-002.yaml` | `assets/recipes/styles/defaults/SP05-002.webp` |
| SP05-003 | `components/recipes/styles/manifests/presets/pack_16/SP05-003.yaml` | `assets/recipes/styles/defaults/SP05-003.webp` |
| SP05-004 | `components/recipes/styles/manifests/presets/pack_16/SP05-004.yaml` | `assets/recipes/styles/defaults/SP05-004.webp` |
| SP05-005 | `components/recipes/styles/manifests/presets/pack_16/SP05-005.yaml` | `assets/recipes/styles/defaults/SP05-005.webp` |
| SP05-006 | `components/recipes/styles/manifests/presets/pack_16/SP05-006.yaml` | `assets/recipes/styles/defaults/SP05-006.webp` |
| SP05-007 | `components/recipes/styles/manifests/presets/pack_16/SP05-007.yaml` | `assets/recipes/styles/defaults/SP05-007.webp` |
| SP05-008 | `components/recipes/styles/manifests/presets/pack_16/SP05-008.yaml` | `assets/recipes/styles/defaults/SP05-008.webp` |
| SP05-009 | `components/recipes/styles/manifests/presets/pack_16/SP05-009.yaml` | `assets/recipes/styles/defaults/SP05-009.webp` |
| SP05-010 | `components/recipes/styles/manifests/presets/pack_16/SP05-010.yaml` | `assets/recipes/styles/defaults/SP05-010.webp` |
| SP05-011 | `components/recipes/styles/manifests/presets/pack_16/SP05-011.yaml` | `assets/recipes/styles/defaults/SP05-011.webp` |
| SP05-012 | `components/recipes/styles/manifests/presets/pack_16/SP05-012.yaml` | `assets/recipes/styles/defaults/SP05-012.webp` |
| SP05-014 | `components/recipes/styles/manifests/presets/pack_16/SP05-014.yaml` | `assets/recipes/styles/defaults/SP05-014.webp` |
| SP05-015 | `components/recipes/styles/manifests/presets/pack_16/SP05-015.yaml` | `assets/recipes/styles/defaults/SP05-015.webp` |
| SP05-016 | `components/recipes/styles/manifests/presets/pack_16/SP05-016.yaml` | `assets/recipes/styles/defaults/SP05-016.webp` |
| SP05-017 | `components/recipes/styles/manifests/presets/pack_16/SP05-017.yaml` | `assets/recipes/styles/defaults/SP05-017.webp` |
| SP05-018 | `components/recipes/styles/manifests/presets/pack_16/SP05-018.yaml` | `assets/recipes/styles/defaults/SP05-018.webp` |
| SP05-024 | `components/recipes/styles/manifests/presets/pack_16/SP05-024.yaml` | `assets/recipes/styles/defaults/SP05-024.webp` |
| SP05-026 | `components/recipes/styles/manifests/presets/pack_16/SP05-026.yaml` | `assets/recipes/styles/defaults/SP05-026.webp` |
| SP05-027 | `components/recipes/styles/manifests/presets/pack_16/SP05-027.yaml` | `assets/recipes/styles/defaults/SP05-027.webp` |
| SP05-030 | `components/recipes/styles/manifests/presets/pack_16/SP05-030.yaml` | `assets/recipes/styles/defaults/SP05-030.webp` |
| SP05-071 | `components/recipes/styles/manifests/presets/pack_16/SP05-071.yaml` | `assets/recipes/styles/defaults/SP05-071.webp` |
| SP05-072 | `components/recipes/styles/manifests/presets/pack_16/SP05-072.yaml` | `assets/recipes/styles/defaults/SP05-072.webp` |
| SP05-073 | `components/recipes/styles/manifests/presets/pack_16/SP05-073.yaml` | `assets/recipes/styles/defaults/SP05-073.webp` |
| SP05-074 | `components/recipes/styles/manifests/presets/pack_16/SP05-074.yaml` | `assets/recipes/styles/defaults/SP05-074.webp` |
| SP05-075 | `components/recipes/styles/manifests/presets/pack_16/SP05-075.yaml` | `assets/recipes/styles/defaults/SP05-075.webp` |
| SP05-076 | `components/recipes/styles/manifests/presets/pack_16/SP05-076.yaml` | `assets/recipes/styles/defaults/SP05-076.webp` |
| SP05-077 | `components/recipes/styles/manifests/presets/pack_16/SP05-077.yaml` | `assets/recipes/styles/defaults/SP05-077.webp` |
| SP05-078 | `components/recipes/styles/manifests/presets/pack_16/SP05-078.yaml` | `assets/recipes/styles/defaults/SP05-078.webp` |
| SP05-079 | `components/recipes/styles/manifests/presets/pack_16/SP05-079.yaml` | `assets/recipes/styles/defaults/SP05-079.webp` |
| SP05-080 | `components/recipes/styles/manifests/presets/pack_16/SP05-080.yaml` | `assets/recipes/styles/defaults/SP05-080.webp` |
| SP05-141 | `components/recipes/styles/manifests/presets/pack_16/SP05-141.yaml` | `assets/recipes/styles/defaults/SP05-141.webp` |
| SP05-145 | `components/recipes/styles/manifests/presets/pack_16/SP05-145.yaml` | `assets/recipes/styles/defaults/SP05-145.webp` |
| SP05-146 | `components/recipes/styles/manifests/presets/pack_16/SP05-146.yaml` | `assets/recipes/styles/defaults/SP05-146.webp` |
| SP05-147 | `components/recipes/styles/manifests/presets/pack_16/SP05-147.yaml` | `assets/recipes/styles/defaults/SP05-147.webp` |
| SP05-149 | `components/recipes/styles/manifests/presets/pack_16/SP05-149.yaml` | `assets/recipes/styles/defaults/SP05-149.webp` |
| SP05-150 | `components/recipes/styles/manifests/presets/pack_16/SP05-150.yaml` | `assets/recipes/styles/defaults/SP05-150.webp` |
| SP05-151 | `components/recipes/styles/manifests/presets/pack_16/SP05-151.yaml` | `assets/recipes/styles/defaults/SP05-151.webp` |
| SP05-152 | `components/recipes/styles/manifests/presets/pack_16/SP05-152.yaml` | `assets/recipes/styles/defaults/SP05-152.webp` |
| SP05-153 | `components/recipes/styles/manifests/presets/pack_16/SP05-153.yaml` | `assets/recipes/styles/defaults/SP05-153.webp` |
| SP05-154 | `components/recipes/styles/manifests/presets/pack_16/SP05-154.yaml` | `assets/recipes/styles/defaults/SP05-154.webp` |
| SP05-155 | `components/recipes/styles/manifests/presets/pack_16/SP05-155.yaml` | `assets/recipes/styles/defaults/SP05-155.webp` |
| SP05-156 | `components/recipes/styles/manifests/presets/pack_16/SP05-156.yaml` | `assets/recipes/styles/defaults/SP05-156.webp` |
| SP05-157 | `components/recipes/styles/manifests/presets/pack_16/SP05-157.yaml` | `assets/recipes/styles/defaults/SP05-157.webp` |
| SP05-158 | `components/recipes/styles/manifests/presets/pack_16/SP05-158.yaml` | `assets/recipes/styles/defaults/SP05-158.webp` |
| SP05-159 | `components/recipes/styles/manifests/presets/pack_16/SP05-159.yaml` | `assets/recipes/styles/defaults/SP05-159.webp` |
| SP05-160 | `components/recipes/styles/manifests/presets/pack_16/SP05-160.yaml` | `assets/recipes/styles/defaults/SP05-160.webp` |
| SP05-161 | `components/recipes/styles/manifests/presets/pack_16/SP05-161.yaml` | `assets/recipes/styles/defaults/SP05-161.webp` |
| SP05-163 | `components/recipes/styles/manifests/presets/pack_16/SP05-163.yaml` | `assets/recipes/styles/defaults/SP05-163.webp` |
| SP05-164 | `components/recipes/styles/manifests/presets/pack_16/SP05-164.yaml` | `assets/recipes/styles/defaults/SP05-164.webp` |
| SP05-165 | `components/recipes/styles/manifests/presets/pack_16/SP05-165.yaml` | `assets/recipes/styles/defaults/SP05-165.webp` |
| SP05-166 | `components/recipes/styles/manifests/presets/pack_16/SP05-166.yaml` | `assets/recipes/styles/defaults/SP05-166.webp` |
| SP05-167 | `components/recipes/styles/manifests/presets/pack_16/SP05-167.yaml` | `assets/recipes/styles/defaults/SP05-167.webp` |
| SP05-169 | `components/recipes/styles/manifests/presets/pack_16/SP05-169.yaml` | `assets/recipes/styles/defaults/SP05-169.webp` |
| SP05-170 | `components/recipes/styles/manifests/presets/pack_16/SP05-170.yaml` | `assets/recipes/styles/defaults/SP05-170.webp` |
| SP05-173 | `components/recipes/styles/manifests/presets/pack_16/SP05-173.yaml` | `assets/recipes/styles/defaults/SP05-173.webp` |
| SP05-174 | `components/recipes/styles/manifests/presets/pack_16/SP05-174.yaml` | `assets/recipes/styles/defaults/SP05-174.webp` |
| SP05-175 | `components/recipes/styles/manifests/presets/pack_16/SP05-175.yaml` | `assets/recipes/styles/defaults/SP05-175.webp` |
| SP05-179 | `components/recipes/styles/manifests/presets/pack_16/SP05-179.yaml` | `assets/recipes/styles/defaults/SP05-179.webp` |
| SP05-180 | `components/recipes/styles/manifests/presets/pack_16/SP05-180.yaml` | `assets/recipes/styles/defaults/SP05-180.webp` |
| SP05-281 | `components/recipes/styles/manifests/presets/pack_16/SP05-281.yaml` | `assets/recipes/styles/defaults/SP05-281.webp` |
| SP05-282 | `components/recipes/styles/manifests/presets/pack_16/SP05-282.yaml` | `assets/recipes/styles/defaults/SP05-282.webp` |
| SP05-283 | `components/recipes/styles/manifests/presets/pack_16/SP05-283.yaml` | `assets/recipes/styles/defaults/SP05-283.webp` |
| SP05-284 | `components/recipes/styles/manifests/presets/pack_16/SP05-284.yaml` | `assets/recipes/styles/defaults/SP05-284.webp` |
| SP05-285 | `components/recipes/styles/manifests/presets/pack_16/SP05-285.yaml` | `assets/recipes/styles/defaults/SP05-285.webp` |
| SP05-286 | `components/recipes/styles/manifests/presets/pack_16/SP05-286.yaml` | `assets/recipes/styles/defaults/SP05-286.webp` |
| SP05-287 | `components/recipes/styles/manifests/presets/pack_16/SP05-287.yaml` | `assets/recipes/styles/defaults/SP05-287.webp` |
| SP05-288 | `components/recipes/styles/manifests/presets/pack_16/SP05-288.yaml` | `assets/recipes/styles/defaults/SP05-288.webp` |
| SP05-289 | `components/recipes/styles/manifests/presets/pack_16/SP05-289.yaml` | `assets/recipes/styles/defaults/SP05-289.webp` |
| SP05-290 | `components/recipes/styles/manifests/presets/pack_16/SP05-290.yaml` | `assets/recipes/styles/defaults/SP05-290.webp` |
| SP05-291 | `components/recipes/styles/manifests/presets/pack_16/SP05-291.yaml` | `assets/recipes/styles/defaults/SP05-291.webp` |
| SP05-292 | `components/recipes/styles/manifests/presets/pack_16/SP05-292.yaml` | `assets/recipes/styles/defaults/SP05-292.webp` |
| SP05-293 | `components/recipes/styles/manifests/presets/pack_16/SP05-293.yaml` | `assets/recipes/styles/defaults/SP05-293.webp` |
| SP05-294 | `components/recipes/styles/manifests/presets/pack_16/SP05-294.yaml` | `assets/recipes/styles/defaults/SP05-294.webp` |
| SP05-295 | `components/recipes/styles/manifests/presets/pack_16/SP05-295.yaml` | `assets/recipes/styles/defaults/SP05-295.webp` |
| SP05-296 | `components/recipes/styles/manifests/presets/pack_16/SP05-296.yaml` | `assets/recipes/styles/defaults/SP05-296.webp` |
| SP05-297 | `components/recipes/styles/manifests/presets/pack_16/SP05-297.yaml` | `assets/recipes/styles/defaults/SP05-297.webp` |
| SP05-298 | `components/recipes/styles/manifests/presets/pack_16/SP05-298.yaml` | `assets/recipes/styles/defaults/SP05-298.webp` |
| SP05-299 | `components/recipes/styles/manifests/presets/pack_16/SP05-299.yaml` | `assets/recipes/styles/defaults/SP05-299.webp` |
| SP05-300 | `components/recipes/styles/manifests/presets/pack_16/SP05-300.yaml` | `assets/recipes/styles/defaults/SP05-300.webp` |
| SP05-301 | `components/recipes/styles/manifests/presets/pack_16/SP05-301.yaml` | `assets/recipes/styles/defaults/SP05-301.webp` |
| SP05-302 | `components/recipes/styles/manifests/presets/pack_16/SP05-302.yaml` | `assets/recipes/styles/defaults/SP05-302.webp` |
| SP05-303 | `components/recipes/styles/manifests/presets/pack_16/SP05-303.yaml` | `assets/recipes/styles/defaults/SP05-303.webp` |
| SP05-304 | `components/recipes/styles/manifests/presets/pack_16/SP05-304.yaml` | `assets/recipes/styles/defaults/SP05-304.webp` |
| SP05-305 | `components/recipes/styles/manifests/presets/pack_16/SP05-305.yaml` | `assets/recipes/styles/defaults/SP05-305.webp` |
| SP05-306 | `components/recipes/styles/manifests/presets/pack_16/SP05-306.yaml` | `assets/recipes/styles/defaults/SP05-306.webp` |
| SP05-307 | `components/recipes/styles/manifests/presets/pack_16/SP05-307.yaml` | `assets/recipes/styles/defaults/SP05-307.webp` |
| SP05-308 | `components/recipes/styles/manifests/presets/pack_16/SP05-308.yaml` | `assets/recipes/styles/defaults/SP05-308.webp` |
| SP05-309 | `components/recipes/styles/manifests/presets/pack_16/SP05-309.yaml` | `assets/recipes/styles/defaults/SP05-309.webp` |
| SP05-310 | `components/recipes/styles/manifests/presets/pack_16/SP05-310.yaml` | `assets/recipes/styles/defaults/SP05-310.webp` |
| SP05-311 | `components/recipes/styles/manifests/presets/pack_16/SP05-311.yaml` | `assets/recipes/styles/defaults/SP05-311.webp` |
| SP05-312 | `components/recipes/styles/manifests/presets/pack_16/SP05-312.yaml` | `assets/recipes/styles/defaults/SP05-312.webp` |
| SP05-313 | `components/recipes/styles/manifests/presets/pack_16/SP05-313.yaml` | `assets/recipes/styles/defaults/SP05-313.webp` |
| SP05-314 | `components/recipes/styles/manifests/presets/pack_16/SP05-314.yaml` | `assets/recipes/styles/defaults/SP05-314.webp` |
| SP05-315 | `components/recipes/styles/manifests/presets/pack_16/SP05-315.yaml` | `assets/recipes/styles/defaults/SP05-315.webp` |
| SP05-316 | `components/recipes/styles/manifests/presets/pack_16/SP05-316.yaml` | `assets/recipes/styles/defaults/SP05-316.webp` |
| SP05-317 | `components/recipes/styles/manifests/presets/pack_16/SP05-317.yaml` | `assets/recipes/styles/defaults/SP05-317.webp` |
| SP05-318 | `components/recipes/styles/manifests/presets/pack_16/SP05-318.yaml` | `assets/recipes/styles/defaults/SP05-318.webp` |
| SP05-319 | `components/recipes/styles/manifests/presets/pack_16/SP05-319.yaml` | `assets/recipes/styles/defaults/SP05-319.webp` |
| SP05-320 | `components/recipes/styles/manifests/presets/pack_16/SP05-320.yaml` | `assets/recipes/styles/defaults/SP05-320.webp` |
| SP05-343 | `components/recipes/styles/manifests/presets/pack_16/SP05-343.yaml` | `assets/recipes/styles/defaults/SP05-343.webp` |
| SP05-344 | `components/recipes/styles/manifests/presets/pack_16/SP05-344.yaml` | `assets/recipes/styles/defaults/SP05-344.webp` |
| SP05-345 | `components/recipes/styles/manifests/presets/pack_16/SP05-345.yaml` | `assets/recipes/styles/defaults/SP05-345.webp` |
| SP05-346 | `components/recipes/styles/manifests/presets/pack_16/SP05-346.yaml` | `assets/recipes/styles/defaults/SP05-346.webp` |
| SP05-347 | `components/recipes/styles/manifests/presets/pack_16/SP05-347.yaml` | `assets/recipes/styles/defaults/SP05-347.webp` |
| SP05-348 | `components/recipes/styles/manifests/presets/pack_16/SP05-348.yaml` | `assets/recipes/styles/defaults/SP05-348.webp` |
| SP05-349 | `components/recipes/styles/manifests/presets/pack_16/SP05-349.yaml` | `assets/recipes/styles/defaults/SP05-349.webp` |
| SP05-350 | `components/recipes/styles/manifests/presets/pack_16/SP05-350.yaml` | `assets/recipes/styles/defaults/SP05-350.webp` |
| SP05-351 | `components/recipes/styles/manifests/presets/pack_16/SP05-351.yaml` | `assets/recipes/styles/defaults/SP05-351.webp` |
| SP05-352 | `components/recipes/styles/manifests/presets/pack_16/SP05-352.yaml` | `assets/recipes/styles/defaults/SP05-352.webp` |
| SP05-353 | `components/recipes/styles/manifests/presets/pack_16/SP05-353.yaml` | `assets/recipes/styles/defaults/SP05-353.webp` |
| SP05-354 | `components/recipes/styles/manifests/presets/pack_16/SP05-354.yaml` | `assets/recipes/styles/defaults/SP05-354.webp` |
| SP05-355 | `components/recipes/styles/manifests/presets/pack_16/SP05-355.yaml` | `assets/recipes/styles/defaults/SP05-355.webp` |
| SP05-356 | `components/recipes/styles/manifests/presets/pack_16/SP05-356.yaml` | `assets/recipes/styles/defaults/SP05-356.webp` |
| SP05-357 | `components/recipes/styles/manifests/presets/pack_16/SP05-357.yaml` | `assets/recipes/styles/defaults/SP05-357.webp` |
| SP05-358 | `components/recipes/styles/manifests/presets/pack_16/SP05-358.yaml` | `assets/recipes/styles/defaults/SP05-358.webp` |
| SP05-359 | `components/recipes/styles/manifests/presets/pack_16/SP05-359.yaml` | `assets/recipes/styles/defaults/SP05-359.webp` |
| SP05-360 | `components/recipes/styles/manifests/presets/pack_16/SP05-360.yaml` | `assets/recipes/styles/defaults/SP05-360.webp` |
| SP05-361 | `components/recipes/styles/manifests/presets/pack_16/SP05-361.yaml` | `assets/recipes/styles/defaults/SP05-361.webp` |
| SP05-362 | `components/recipes/styles/manifests/presets/pack_16/SP05-362.yaml` | `assets/recipes/styles/defaults/SP05-362.webp` |
| SP05-363 | `components/recipes/styles/manifests/presets/pack_16/SP05-363.yaml` | `assets/recipes/styles/defaults/SP05-363.webp` |
| SP05-364 | `components/recipes/styles/manifests/presets/pack_16/SP05-364.yaml` | `assets/recipes/styles/defaults/SP05-364.webp` |
| SP05-365 | `components/recipes/styles/manifests/presets/pack_16/SP05-365.yaml` | `assets/recipes/styles/defaults/SP05-365.webp` |
| SP05-366 | `components/recipes/styles/manifests/presets/pack_16/SP05-366.yaml` | `assets/recipes/styles/defaults/SP05-366.webp` |
| SP05-367 | `components/recipes/styles/manifests/presets/pack_16/SP05-367.yaml` | `assets/recipes/styles/defaults/SP05-367.webp` |
| SP05-368 | `components/recipes/styles/manifests/presets/pack_16/SP05-368.yaml` | `assets/recipes/styles/defaults/SP05-368.webp` |
| SP05-369 | `components/recipes/styles/manifests/presets/pack_16/SP05-369.yaml` | `assets/recipes/styles/defaults/SP05-369.webp` |
| SP05-370 | `components/recipes/styles/manifests/presets/pack_16/SP05-370.yaml` | `assets/recipes/styles/defaults/SP05-370.webp` |
| SP05-371 | `components/recipes/styles/manifests/presets/pack_16/SP05-371.yaml` | `assets/recipes/styles/defaults/SP05-371.webp` |
| SP05-372 | `components/recipes/styles/manifests/presets/pack_16/SP05-372.yaml` | `assets/recipes/styles/defaults/SP05-372.webp` |
| SP13-026 | `components/recipes/styles/manifests/presets/pack_16/SP13-026.yaml` | `assets/recipes/styles/defaults/SP13-026.webp` |
| SP13-027 | `components/recipes/styles/manifests/presets/pack_16/SP13-027.yaml` | `assets/recipes/styles/defaults/SP13-027.webp` |
| SP13-028 | `components/recipes/styles/manifests/presets/pack_16/SP13-028.yaml` | `assets/recipes/styles/defaults/SP13-028.webp` |
| SP13-029 | `components/recipes/styles/manifests/presets/pack_16/SP13-029.yaml` | `assets/recipes/styles/defaults/SP13-029.webp` |
| SP13-030 | `components/recipes/styles/manifests/presets/pack_16/SP13-030.yaml` | `assets/recipes/styles/defaults/SP13-030.webp` |
| SP13-031 | `components/recipes/styles/manifests/presets/pack_16/SP13-031.yaml` | `assets/recipes/styles/defaults/SP13-031.webp` |
| SP13-032 | `components/recipes/styles/manifests/presets/pack_16/SP13-032.yaml` | `assets/recipes/styles/defaults/SP13-032.webp` |
| SP13-033 | `components/recipes/styles/manifests/presets/pack_16/SP13-033.yaml` | `assets/recipes/styles/defaults/SP13-033.webp` |
| SP13-034 | `components/recipes/styles/manifests/presets/pack_16/SP13-034.yaml` | `assets/recipes/styles/defaults/SP13-034.webp` |
| SP13-035 | `components/recipes/styles/manifests/presets/pack_16/SP13-035.yaml` | `assets/recipes/styles/defaults/SP13-035.webp` |

## Comandos de regeneración

Regeneración sólo de presets tocados, usando selector fino para evitar gasto innecesario:

```bash
# Adicionales de reauditoria 2026-06-01
bun run scripts/generate-style-defaults.ts --pack=pack_15 "--preset=SP15-004|SP15-008|SP15-012|SP15-014|SP15-015|SP15-016|SP15-017|SP15-019|SP15-020|SP15-023|SP15-024|SP15-025|SP15-026|SP15-027|SP15-029|SP15-030|SP15-031|SP15-032|SP15-033|SP15-034|SP15-035|SP15-036|SP15-037|SP15-038|SP15-039|SP15-040|SP15-041|SP15-042|SP15-043|SP15-044|SP15-045|SP15-046|SP15-047|SP15-048|SP15-049|SP15-050|SP15-051|SP15-052|SP15-053|SP15-054|SP15-055|SP15-056|SP15-057|SP15-058|SP15-059|SP15-060|SP15-061|SP15-062|SP15-063|SP15-064|SP15-065|SP15-066|SP15-067|SP15-068|SP15-069|SP15-070|SP15-073|SP15-074" --force
bun run scripts/generate-style-defaults.ts --pack=pack_01 "--preset=SP01-014|SP01-024|SP01-026|SP01-037|SP01-058|SP01-074" --force
bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-021|SP05-022|SP05-023|SP05-028|SP05-029|SP05-031|SP05-033|SP05-034|SP05-036|SP05-037|SP05-038|SP05-039|SP05-040" --force
bun run scripts/generate-style-defaults.ts --pack=pack_06 "--preset=SP06-061|SP06-063|SP06-070|SP06-071|SP06-072|SP06-076|SP06-078|SP06-079" --force
bun run scripts/generate-style-defaults.ts --pack=pack_07 "--preset=SP07-004|SP07-008|SP07-034|SP07-038|SP07-040|SP07-043|SP07-044|SP07-049|SP07-052|SP07-055|SP07-058|SP07-059|SP07-060|SP07-061|SP07-062|SP07-065|SP07-067|SP07-068|SP07-069|SP07-071|SP07-073|SP07-077|SP07-078|SP07-080" --force
bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-004|SP08-006|SP08-011|SP08-017|SP08-019|SP08-023|SP08-031|SP08-041|SP08-044|SP08-045|SP08-048|SP08-049|SP08-056|SP08-061|SP08-073|SP08-078" --force
bun run scripts/generate-style-defaults.ts --pack=pack_10 "--preset=SP10-007" --force
bun run scripts/generate-style-defaults.ts --pack=pack_12 "--preset=SP12-003|SP12-004|SP12-006|SP12-007|SP12-009|SP12-013|SP12-015|SP12-016|SP12-020|SP12-021|SP12-022|SP12-027|SP12-029|SP12-033|SP12-037|SP12-039|SP12-041|SP12-044|SP12-046" --force
bun run scripts/generate-style-defaults.ts --pack=pack_13 "--preset=SP05-013|SP05-019|SP05-020|SP05-041|SP05-042|SP05-043|SP05-044|SP05-046|SP05-177" --force
bun run scripts/generate-style-defaults.ts --pack=pack_03 "--preset=SP03-001|SP03-002|SP03-003|SP03-004|SP03-005|SP03-006|SP03-007|SP03-008|SP03-009|SP03-010|SP03-011|SP03-012|SP03-013|SP03-014|SP03-015|SP03-016|SP03-017|SP03-018|SP03-019|SP03-020|SP03-021|SP03-022|SP03-023|SP03-024|SP03-025|SP03-026|SP03-027|SP03-028|SP03-029|SP03-030|SP03-031|SP03-032|SP03-033|SP03-034|SP03-035|SP03-036|SP03-037|SP03-038|SP03-039|SP03-040|SP03-041|SP03-042|SP03-043|SP03-044|SP03-045|SP03-046|SP03-047|SP03-048|SP03-049|SP03-050|SP03-051|SP03-052|SP03-053|SP03-054|SP03-055|SP03-056|SP03-057|SP03-058|SP03-059|SP03-060|SP03-061|SP03-062|SP03-063|SP03-064|SP03-065|SP03-066|SP03-067|SP03-068|SP03-069|SP03-070|SP03-071|SP03-072|SP03-073|SP03-074|SP03-075|SP03-076|SP03-077|SP03-078|SP03-079|SP03-080" --force
bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-001|SP04-002|SP04-003|SP04-004|SP04-005|SP04-006|SP04-007|SP04-008|SP04-009|SP04-010|SP04-011|SP04-012|SP04-013|SP04-014|SP04-015|SP04-016|SP04-017|SP04-018|SP04-019|SP04-020|SP04-021|SP04-022|SP04-023|SP04-024|SP04-025|SP04-026|SP04-027|SP04-028|SP04-029|SP04-030|SP04-031|SP04-032|SP04-033|SP04-034|SP04-035|SP04-036|SP04-037|SP04-038|SP04-039|SP04-040|SP04-041|SP04-042|SP04-043|SP04-044|SP04-045|SP04-046|SP04-047|SP04-048|SP04-049|SP04-050|SP04-051|SP04-052|SP04-053|SP04-054|SP04-055|SP04-056|SP04-057|SP04-058|SP04-059|SP04-060|SP04-061|SP04-062|SP04-063|SP04-064|SP04-065|SP04-066|SP04-067|SP04-068|SP04-069|SP04-070|SP04-071|SP04-072|SP04-073|SP04-074|SP04-075|SP04-076|SP04-077|SP04-078|SP04-079|SP04-080|SP04-081|SP04-082|SP04-083|SP04-084|SP04-085|SP04-086|SP04-087|SP04-088|SP04-089|SP04-090|SP04-091|SP04-092|SP04-093|SP04-094|SP04-095|SP04-096|SP04-097|SP04-098|SP04-099|SP04-100" --force
bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-001|SP09-002|SP09-003|SP09-004|SP09-005|SP09-006|SP09-007|SP09-008|SP09-009|SP09-010|SP09-011|SP09-012|SP09-013|SP09-014|SP09-015|SP09-016|SP09-017|SP09-018|SP09-019|SP09-020|SP09-021|SP09-022|SP09-023|SP09-024|SP09-025|SP09-026|SP09-027|SP09-028|SP09-029|SP09-030|SP09-031|SP09-032|SP09-033|SP09-034|SP09-035|SP09-036|SP09-037|SP09-038|SP09-039|SP09-040|SP09-041|SP09-042|SP09-043|SP09-044|SP09-045|SP09-046|SP09-047|SP09-048|SP09-049|SP09-050|SP09-051|SP09-052|SP09-053|SP09-054|SP09-055|SP09-056|SP09-057|SP09-058|SP09-059|SP09-060|SP09-061|SP09-062|SP09-063|SP09-064|SP09-065|SP09-066|SP09-067|SP09-068|SP09-069|SP09-070|SP09-071|SP09-072|SP09-073|SP09-074|SP09-075|SP09-076|SP09-077|SP09-078|SP09-079|SP09-080" --force
bun run scripts/generate-style-defaults.ts --pack=pack_10 "--preset=SP10-001|SP10-002|SP10-003|SP10-004|SP10-005|SP10-006|SP10-007|SP10-008|SP10-009|SP10-010|SP10-011|SP10-012|SP10-013|SP10-014|SP10-015|SP10-016|SP10-017|SP10-018|SP10-019|SP10-020|SP10-021|SP10-022|SP10-023|SP10-024|SP10-025|SP10-026|SP10-027|SP10-028|SP10-029|SP10-030|SP10-031|SP10-032|SP10-033|SP10-034|SP10-035|SP10-036|SP10-037|SP10-038|SP10-039|SP10-040|SP10-041|SP10-042|SP10-043|SP10-044|SP10-045|SP10-046|SP10-047|SP10-048|SP10-049|SP10-050|SP10-051|SP10-052|SP10-053|SP10-054|SP10-055|SP10-056|SP10-057|SP10-058|SP10-059|SP10-060|SP10-061|SP10-062|SP10-063|SP10-064|SP10-065|SP10-066|SP10-067|SP10-068|SP10-069|SP10-070|SP10-071|SP10-072|SP10-073|SP10-074|SP10-075|SP10-076|SP10-077|SP10-078|SP10-079|SP10-080" --force
bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-001|SP08-002|SP08-003|SP08-004|SP08-005|SP08-006|SP08-007|SP08-008|SP08-009|SP08-010|SP08-011|SP08-012|SP08-013|SP08-014|SP08-015|SP08-016|SP08-017|SP08-018|SP08-019|SP08-020|SP08-021|SP08-022|SP08-023|SP08-024|SP08-025|SP08-026|SP08-027|SP08-028|SP08-029|SP08-030|SP08-031|SP08-032|SP08-033|SP08-034|SP08-035|SP08-036|SP08-037|SP08-038|SP08-039|SP08-040|SP08-041|SP08-042|SP08-043|SP08-044|SP08-045|SP08-046|SP08-047|SP08-048|SP08-049|SP08-050|SP08-051|SP08-052|SP08-053|SP08-054|SP08-055|SP08-056|SP08-057|SP08-058|SP08-059|SP08-060|SP08-061|SP08-062|SP08-063|SP08-064|SP08-065|SP08-066|SP08-067|SP08-068|SP08-069|SP08-070|SP08-071|SP08-072|SP08-073|SP08-074|SP08-075|SP08-076|SP08-077|SP08-078|SP08-079|SP08-080" --force
bun run scripts/generate-style-defaults.ts --pack=pack_01 "--preset=SP01-001|SP01-002|SP01-003|SP01-004|SP01-005|SP01-006|SP01-007|SP01-008|SP01-009|SP01-010|SP01-011|SP01-012|SP01-013|SP01-014|SP01-015|SP01-016|SP01-017|SP01-018|SP01-019|SP01-020|SP01-021|SP01-022|SP01-023|SP01-024|SP01-025|SP01-027|SP01-028|SP01-029|SP01-030" --force
bun run scripts/generate-style-defaults.ts --pack=pack_01 "--preset=SP01-031|SP01-032|SP01-033|SP01-034|SP01-035|SP01-036|SP01-038|SP01-039|SP01-040|SP01-041|SP01-042|SP01-043|SP01-044|SP01-045|SP01-046|SP01-047|SP01-048|SP01-049|SP01-050" --force
bun run scripts/generate-style-defaults.ts --pack=pack_01 "--preset=SP01-051|SP01-052|SP01-053|SP01-054|SP01-055|SP01-056|SP01-057|SP01-059|SP01-060|SP01-061|SP01-062|SP01-063|SP01-064|SP01-065|SP01-066|SP01-067|SP01-068|SP01-069|SP01-070|SP01-071|SP01-072|SP01-073|SP01-075|SP01-076|SP01-077|SP01-078|SP01-079|SP01-080|SP01-081" --force
bun run scripts/generate-style-defaults.ts --pack=pack_01 "--preset=SP01-082|SP01-083|SP01-084|SP01-085|SP01-086|SP01-087" --force
bun run scripts/generate-style-defaults.ts --pack=pack_02 "--preset=SP02-001|SP02-002|SP02-003|SP02-004|SP02-005|SP02-006|SP02-007|SP02-008|SP02-009|SP02-010|SP02-011|SP02-012|SP02-013|SP02-014|SP02-015|SP02-016|SP02-017|SP02-018|SP02-019|SP02-020|SP02-021|SP02-022|SP02-023|SP02-024|SP02-025|SP02-026|SP02-027|SP02-028|SP02-029|SP02-030" --force
bun run scripts/generate-style-defaults.ts --pack=pack_02 "--preset=SP02-031|SP02-032|SP02-033|SP02-034|SP02-035|SP02-036|SP02-037|SP02-038|SP02-039|SP02-040|SP02-041|SP02-042|SP02-043|SP02-044|SP02-045|SP02-046|SP02-047|SP02-048|SP02-049|SP02-050|SP02-051|SP02-052|SP02-053|SP02-054|SP02-055|SP02-056|SP02-057|SP02-058|SP02-059|SP02-060" --force
bun run scripts/generate-style-defaults.ts --pack=pack_02 "--preset=SP02-061|SP02-062|SP02-063|SP02-064|SP02-065|SP02-066|SP02-067|SP02-068|SP02-069|SP02-070|SP02-071|SP02-072|SP02-073|SP02-074|SP02-075|SP02-076|SP02-077|SP02-078|SP02-079|SP02-080|SP02-081|SP02-082|SP02-083|SP02-084|SP02-085|SP02-086|SP02-087|SP02-088|SP02-089|SP02-090" --force
bun run scripts/generate-style-defaults.ts --pack=pack_02 "--preset=SP02-091|SP02-092|SP02-093|SP02-094|SP02-095|SP02-096|SP02-097|SP02-098|SP02-099|SP02-100|SP02-101|SP02-102|SP02-103|SP02-104|SP02-105|SP02-106|SP02-107|SP02-108|SP02-109|SP02-110|SP02-111|SP02-112|SP02-113|SP02-114|SP02-115|SP02-116|SP02-117|SP02-118|SP02-119|SP02-120" --force
bun run scripts/generate-style-defaults.ts --pack=pack_02 "--preset=SP02-121|SP02-122|SP02-123|SP02-124|SP02-125|SP02-126|SP02-127|SP02-128" --force
bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-021|SP05-022|SP05-023|SP05-025|SP05-028|SP05-029|SP05-031|SP05-032|SP05-034|SP05-035|SP05-036|SP05-039|SP05-040|SP05-051|SP05-052|SP05-053|SP05-054|SP05-055|SP05-056|SP05-057|SP05-058|SP05-059|SP05-060|SP05-061|SP05-062|SP05-063|SP05-064|SP05-065|SP05-066|SP05-067|SP05-068|SP05-069|SP05-070|SP05-091|SP05-092|SP05-093|SP05-094|SP05-095|SP05-096|SP05-097|SP05-098|SP05-099|SP05-100|SP05-121|SP05-122|SP05-123|SP05-124|SP05-125|SP05-126|SP05-127|SP05-128|SP05-129|SP05-130|SP05-131|SP05-132|SP05-133|SP05-134|SP05-135|SP05-136|SP05-137|SP05-138|SP05-139|SP05-140|SP05-142|SP05-143|SP05-144|SP05-148|SP05-221|SP05-222|SP05-223|SP05-224|SP05-225|SP05-226|SP05-227|SP05-228|SP05-229|SP05-230|SP05-231|SP05-232|SP05-233|SP05-234|SP05-235|SP05-236|SP05-237|SP05-238|SP05-239|SP05-240|SP05-241|SP05-242|SP05-243|SP05-244|SP05-245|SP05-246|SP05-247|SP05-248|SP05-249|SP05-250|SP05-251|SP05-252|SP05-253|SP05-254|SP05-255|SP05-256|SP05-257|SP05-258|SP05-259|SP05-260|SP05-261|SP05-262|SP05-263|SP05-264|SP05-265|SP05-266|SP05-267|SP05-268|SP05-269|SP05-270|SP05-271|SP05-272|SP05-273|SP05-274|SP05-275|SP05-276|SP05-277|SP05-278|SP05-279|SP05-280|SP13-021|SP13-022|SP13-023|SP13-024|SP13-025" --force
bun run scripts/generate-style-defaults.ts --pack=pack_06 "--preset=SP06-001|SP06-002|SP06-003|SP06-004|SP06-005|SP06-006|SP06-007|SP06-008|SP06-009|SP06-010|SP06-011|SP06-012|SP06-013|SP06-014|SP06-015|SP06-016|SP06-017|SP06-018|SP06-019|SP06-020" --force
bun run scripts/generate-style-defaults.ts --pack=pack_06 "--preset=SP06-021|SP06-022|SP06-023|SP06-024|SP06-025|SP06-026|SP06-027|SP06-028|SP06-029|SP06-030|SP06-031|SP06-032|SP06-033|SP06-034|SP06-035|SP06-036|SP06-037|SP06-038|SP06-039|SP06-040" --force
bun run scripts/generate-style-defaults.ts --pack=pack_06 "--preset=SP06-041|SP06-042|SP06-043|SP06-044|SP06-045|SP06-046|SP06-047|SP06-048|SP06-049|SP06-050|SP06-051|SP06-052|SP06-053|SP06-054|SP06-055|SP06-056|SP06-057|SP06-058|SP06-059|SP06-060" --force
bun run scripts/generate-style-defaults.ts --pack=pack_06 "--preset=SP06-061|SP06-062|SP06-063|SP06-064|SP06-065|SP06-066|SP06-067|SP06-068|SP06-069|SP06-070|SP06-071|SP06-072|SP06-073|SP06-074|SP06-075|SP06-076|SP06-077|SP06-078|SP06-080" --force
bun run scripts/generate-style-defaults.ts --pack=pack_06 "--preset=SP06-081|SP06-082|SP06-083|SP06-084|SP06-085|SP06-086|SP06-087|SP06-088|SP06-089|SP06-090|SP06-091|SP06-092|SP06-093|SP06-094|SP06-095|SP06-096|SP06-097|SP06-098|SP06-099|SP06-100" --force
bun run scripts/generate-style-defaults.ts --pack=pack_06 "--preset=SP06-101|SP06-102|SP06-103|SP06-104|SP06-105|SP06-106|SP06-107|SP06-108|SP06-109|SP06-110|SP06-111|SP06-112|SP06-113|SP06-114|SP06-115|SP06-116|SP06-117|SP06-118|SP06-119|SP06-120" --force
bun run scripts/generate-style-defaults.ts --pack=pack_07 "--preset=SP07-001|SP07-002|SP07-003|SP07-004|SP07-005|SP07-006|SP07-007|SP07-008|SP07-009|SP07-010|SP07-011|SP07-012|SP07-013|SP07-014|SP07-015|SP07-016|SP07-017|SP07-018|SP07-019|SP07-020|SP07-021|SP07-022|SP07-023|SP07-024|SP07-025|SP07-026|SP07-027|SP07-028|SP07-029|SP07-030|SP07-031|SP07-032|SP07-033|SP07-034|SP07-035|SP07-036|SP07-037|SP07-038|SP07-039|SP07-040|SP07-041|SP07-042|SP07-043|SP07-044|SP07-045|SP07-046|SP07-047|SP07-048|SP07-049|SP07-050|SP07-051|SP07-052|SP07-053|SP07-054|SP07-055|SP07-056|SP07-057|SP07-058|SP07-059|SP07-060|SP07-061|SP07-062|SP07-063|SP07-064|SP07-065|SP07-066|SP07-067|SP07-068|SP07-069|SP07-070|SP07-071|SP07-072|SP07-073|SP07-074|SP07-075|SP07-076|SP07-077|SP07-078|SP07-079|SP07-080" --force
bun run scripts/generate-style-defaults.ts --pack=pack_11 "--preset=SP11-001|SP11-002|SP11-003|SP11-004|SP11-005|SP11-006|SP11-007|SP11-008|SP11-009|SP11-010|SP11-011|SP11-012|SP11-013|SP11-014|SP11-015|SP11-016|SP11-017|SP11-018|SP11-019|SP11-020|SP11-021|SP11-022|SP11-023|SP11-024|SP11-025|SP11-026|SP11-027|SP11-028|SP11-029|SP11-030|SP11-031|SP11-032|SP11-033|SP11-034|SP11-035|SP11-036|SP11-037|SP11-038|SP11-039|SP11-040|SP11-041|SP11-042|SP11-043|SP11-044|SP11-045|SP11-046|SP11-047|SP11-048|SP11-049|SP11-050|SP11-051|SP11-052|SP11-053|SP11-054|SP11-055|SP11-056|SP11-057|SP11-058|SP11-059|SP11-060|SP11-061|SP11-062|SP11-063|SP11-064|SP11-065|SP11-066|SP11-067|SP11-068|SP11-069|SP11-070|SP11-071|SP11-072|SP11-073|SP11-074|SP11-075|SP11-076|SP11-077|SP11-078|SP11-079|SP11-080" --force
bun run scripts/generate-style-defaults.ts --pack=pack_12 "--preset=SP12-001|SP12-002|SP12-003|SP12-004|SP12-005|SP12-006|SP12-007|SP12-008|SP12-009|SP12-010|SP12-011|SP12-012|SP12-013|SP12-014|SP12-015|SP12-016|SP12-017|SP12-018|SP12-019|SP12-020|SP12-021|SP12-022|SP12-023|SP12-024|SP12-025|SP12-026|SP12-027|SP12-028|SP12-029|SP12-030|SP12-031|SP12-032|SP12-033|SP12-034|SP12-035|SP12-036|SP12-037|SP12-038|SP12-039|SP12-040|SP12-041|SP12-042|SP12-043|SP12-044|SP12-045|SP12-046|SP12-047|SP12-048|SP12-049|SP12-050|SP12-051|SP12-052|SP12-053|SP12-054|SP12-055|SP12-056|SP12-057|SP12-058|SP12-059|SP12-060|SP12-061|SP12-062|SP12-063|SP12-064|SP12-065|SP12-066|SP12-067|SP12-068|SP12-069|SP12-070|SP12-071|SP12-072|SP12-073|SP12-074|SP12-075|SP12-076|SP12-077|SP12-078|SP12-079|SP12-080" --force
bun run scripts/generate-style-defaults.ts --pack=pack_14 "--preset=SP14-001|SP14-002|SP14-003|SP14-004|SP14-005|SP14-006|SP14-007|SP14-008|SP14-009|SP14-010|SP14-011|SP14-012|SP14-013|SP14-014|SP14-015|SP14-016|SP14-017|SP14-018|SP14-019|SP14-020|SP14-021|SP14-022|SP14-023|SP14-024|SP14-025|SP14-026|SP14-027|SP14-028|SP14-029|SP14-030|SP14-031|SP14-032|SP14-033|SP14-034|SP14-035|SP14-036|SP14-037|SP14-038|SP14-039|SP14-040|SP14-041|SP14-042|SP14-043|SP14-044|SP14-045|SP14-046|SP14-047|SP14-048|SP14-049|SP14-050|SP14-051|SP14-052|SP14-053|SP14-054|SP14-055|SP14-056|SP14-057|SP14-058|SP14-059|SP14-060|SP14-061|SP14-062|SP14-063|SP14-064|SP14-065|SP14-066|SP14-067|SP14-068|SP14-069|SP14-070|SP14-071|SP14-072|SP14-073|SP14-074|SP14-075|SP14-076|SP14-077|SP14-078|SP14-079|SP14-080|SP14-081|SP14-082|SP14-083|SP14-084|SP14-085|SP14-086|SP14-087|SP14-088|SP14-089|SP14-090|SP14-091|SP14-092|SP14-093|SP14-094|SP14-095|SP14-096|SP14-097|SP14-098|SP14-099|SP14-100|SP14-101|SP14-102|SP14-103|SP14-104|SP14-105|SP14-106|SP14-107|SP14-108|SP14-109|SP14-110|SP14-111|SP14-112|SP14-113|SP14-114|SP14-115|SP14-116|SP14-117|SP14-118|SP14-119|SP14-120|SP14-121|SP14-122|SP14-123" --force
bun run scripts/generate-style-defaults.ts --pack=pack_13 "--preset=SP05-013|SP05-042|SP05-043|SP05-162" --force
bun run scripts/generate-style-defaults.ts --pack=pack_13 "--preset=SP05-045|SP05-047|SP05-048|SP05-049|SP05-050|SP05-081|SP05-082|SP05-083|SP05-084|SP05-085|SP05-086|SP05-087|SP05-088|SP05-089|SP05-090|SP05-101|SP05-102|SP05-103|SP05-104|SP05-105|SP05-106|SP05-107|SP05-108|SP05-109|SP05-110|SP05-111|SP05-112|SP05-113|SP05-114|SP05-115|SP05-116|SP05-117|SP05-118|SP05-119|SP05-120|SP05-201|SP05-202|SP05-203|SP05-204|SP05-205|SP05-206|SP05-207|SP05-208|SP05-209|SP05-210|SP05-211|SP05-212|SP05-213|SP05-214|SP05-215|SP05-216|SP05-217|SP05-218|SP05-219|SP05-220" --force
bun run scripts/generate-style-defaults.ts --pack=pack_13 "--preset=SP05-168|SP05-171|SP05-172|SP05-176|SP05-177|SP05-178|SP05-181|SP05-182|SP05-183|SP05-184|SP05-185|SP05-186|SP05-187|SP05-188|SP05-189|SP05-190|SP05-191|SP05-192|SP05-193|SP05-194|SP05-195|SP05-196|SP05-197|SP05-198|SP05-199|SP05-200" --force
bun run scripts/generate-style-defaults.ts --pack=pack_13 "--preset=SP13-001|SP13-002|SP13-003|SP13-004|SP13-005|SP13-006|SP13-007|SP13-008|SP13-009|SP13-010|SP13-011|SP13-012|SP13-013|SP13-014|SP13-015|SP13-016|SP13-017|SP13-018|SP13-019|SP13-020" --force
bun run scripts/generate-style-defaults.ts --pack=pack_13 "--preset=SP05-321|SP05-322|SP05-323|SP05-324|SP05-325|SP05-326|SP05-327|SP05-328|SP05-329|SP05-330|SP05-331|SP05-332|SP05-333|SP05-334|SP05-335|SP05-336|SP05-337|SP05-338|SP05-339|SP05-340|SP05-341|SP05-342" --force
bun run scripts/generate-style-defaults.ts --pack=pack_15 "--preset=SP15-001|SP15-002|SP15-003|SP15-004|SP15-005|SP15-006|SP15-007|SP15-008|SP15-009|SP15-010|SP15-011|SP15-012|SP15-013|SP15-014|SP15-015|SP15-016|SP15-017|SP15-018|SP15-019|SP15-020|SP15-021|SP15-022|SP15-023|SP15-024|SP15-025|SP15-026|SP15-027|SP15-028|SP15-029|SP15-030|SP15-031|SP15-032|SP15-033|SP15-034|SP15-035|SP15-036|SP15-037|SP15-038|SP15-039|SP15-040|SP15-041|SP15-042|SP15-043|SP15-044|SP15-045|SP15-046|SP15-047|SP15-048|SP15-049|SP15-050|SP15-051|SP15-052|SP15-053|SP15-054|SP15-055|SP15-056|SP15-057|SP15-058|SP15-059|SP15-060|SP15-061|SP15-062|SP15-063|SP15-064|SP15-065|SP15-066|SP15-067|SP15-068|SP15-069|SP15-070|SP15-071|SP15-072|SP15-073|SP15-074|SP15-075|SP15-076|SP15-077|SP15-078|SP15-079|SP15-080|SP15-128|SP15-129|SP15-130|SP15-131|SP15-132|SP15-133|SP15-134|SP15-135|SP15-136|SP15-137" --force
bun run scripts/generate-style-defaults.ts --pack=pack_15 "--preset=SP15-081|SP15-082|SP15-083|SP15-084|SP15-085|SP15-086|SP15-087|SP15-088|SP15-089|SP15-090|SP15-091|SP15-092|SP15-093|SP15-094|SP15-095|SP15-096|SP15-097|SP15-098|SP15-099|SP15-100|SP15-101|SP15-102|SP15-103|SP15-104|SP15-105|SP15-106|SP15-107|SP15-108|SP15-109|SP15-110|SP15-111|SP15-112|SP15-113|SP15-114|SP15-115|SP15-116|SP15-117|SP15-118|SP15-119|SP15-120|SP15-121|SP15-122|SP15-123|SP15-124|SP15-125|SP15-126|SP15-127" --force
bun run scripts/generate-style-defaults.ts --pack=pack_16 "--preset=SP05-001|SP05-002|SP05-003|SP05-004|SP05-005|SP05-006|SP05-007|SP05-008|SP05-009|SP05-010|SP05-011|SP05-012|SP05-014|SP05-015|SP05-016|SP05-017|SP05-018|SP05-024|SP05-026|SP05-027|SP05-030|SP05-071|SP05-072|SP05-073|SP05-074|SP05-075|SP05-076|SP05-077|SP05-078|SP05-079|SP05-080|SP05-141|SP05-145|SP05-146|SP05-147|SP05-149|SP05-150|SP05-151|SP05-152|SP05-153|SP05-154|SP05-155|SP05-156|SP05-157|SP05-158|SP05-159|SP05-160|SP05-161|SP05-163|SP05-164|SP05-165|SP05-166|SP05-167|SP05-169|SP05-170|SP05-173|SP05-174|SP05-175|SP05-179|SP05-180|SP05-281|SP05-282|SP05-283|SP05-284|SP05-285|SP05-286|SP05-287|SP05-288|SP05-289|SP05-290|SP05-291|SP05-292|SP05-293|SP05-294|SP05-295|SP05-296|SP05-297|SP05-298|SP05-299|SP05-300|SP05-301|SP05-302|SP05-303|SP05-304|SP05-305|SP05-306|SP05-307|SP05-308|SP05-309|SP05-310|SP05-311|SP05-312|SP05-313|SP05-314|SP05-315|SP05-316|SP05-317|SP05-318|SP05-319|SP05-320|SP05-343|SP05-344|SP05-345|SP05-346|SP05-347|SP05-348|SP05-349|SP05-350|SP05-351|SP05-352|SP05-353|SP05-354|SP05-355|SP05-356|SP05-357|SP05-358|SP05-359|SP05-360|SP05-361|SP05-362|SP05-363|SP05-364|SP05-365|SP05-366|SP05-367|SP05-368|SP05-369|SP05-370|SP05-371|SP05-372|SP13-026|SP13-027|SP13-028|SP13-029|SP13-030|SP13-031|SP13-032|SP13-033|SP13-034|SP13-035" --force
```

Validación posterior:

```bash
bun run styles:validate -- --pack=pack_05
bun run styles:validate -- --pack=pack_06
bun run styles:validate -- --pack=pack_01
bun run styles:validate -- --pack=pack_02
bun run styles:validate -- --pack=pack_07
bun run styles:validate -- --pack=pack_13
bun run styles:validate -- --pack=pack_15
bun run styles:validate -- --pack=pack_16
bun run styles:verify
```

## Estado parcial 2026-06-08 - `pack_14`

Corte operativo tras nueve microtandas sobre `pack_14`:

- Default cards materializadas en repo:
  - `SP14-001..040`
- Coverage real verificado:
  - `pack_14 defaultImages=40/123`
  - `pack_14 missingDefaultImages=83`
- Hallazgo de visibilidad:
  - las cards ya existen en `assets/recipes/styles/defaults/` y en `manifest-pack_14.json`.
  - si no se ven en la UI activa, el sospechoso principal es el catalogo estatico de `lib/recipeAssetCatalog.ts` construido con `import.meta.glob(..., { eager: true })`, que puede no refrescar archivos nuevos sin reinicio del frontend.

Actualizacion tras ola 10:

- Default cards materializadas en repo:
  - `SP14-001..044`
- Coverage real verificado:
  - `pack_14 defaultImages=44/123`
  - `pack_14 missingDefaultImages=79`
- Hallazgo operativo:
  - en esta tanda `scripts/generate-style-defaults.ts` supero timeout del CLI, pero el worker siguio en background y completo `SP14-041..044`.
  - criterio de cierre se mantuvo igual: no contar cerrado hasta ver `.webp` nuevo en repo y checkpoint nuevo en `manifest-pack_14.json`.

Actualizacion tras ola 11:

- Default cards materializadas en repo:
  - `SP14-001..048`
- Coverage real verificado:
  - `pack_14 defaultImages=48/123`
  - `pack_14 missingDefaultImages=75`
- Hallazgo operativo:
  - de nuevo `scripts/generate-style-defaults.ts` supero timeout del CLI, pero el worker siguio en background y completo `SP14-045..048`.
  - criterio de cierre se mantuvo igual: no contar cerrado hasta ver `.webp` nuevo en repo y checkpoint nuevo en `manifest-pack_14.json`.

Actualizacion tras ola 12:

- Default cards materializadas en repo:
  - `SP14-001..052`
- Coverage real verificado:
  - `pack_14 defaultImages=52/123`
  - `pack_14 missingDefaultImages=71`
- Regla nueva aplicada desde esta tanda:
  - `scripts/style-default-utils.ts` ahora agrega al final del prompt una directiva global de denoise y control de microdetalle para futuras generaciones.
- Hallazgo operativo:
  - lote inicial `SP14-049..052` supero timeout del CLI; `SP14-049..051` cerraron por worker en background y `SP14-052` se completo en rerun fino.
  - criterio de cierre se mantuvo igual: no contar cerrado hasta ver `.webp` nuevo en repo y checkpoint nuevo en `manifest-pack_14.json`.

Actualizacion tras ola 13:

- Default cards materializadas en repo:
  - `SP14-001..056`
- Coverage real verificado:
  - `pack_14 defaultImages=56/123`
  - `pack_14 missingDefaultImages=67`
- Hallazgo operativo:
  - aun con timeout mas largo, lote inicial `SP14-053..056` supero ventana del CLI.
  - `SP14-053..055` cerraron por worker en background y `SP14-056` completo dentro de la espera corta posterior.
  - criterio de cierre se mantuvo igual: no contar cerrado hasta ver `.webp` nuevo en repo y checkpoint nuevo en `manifest-pack_14.json`.

Actualizacion tras ola 14:

- Default cards materializadas en repo:
  - `SP14-001..060`
- Coverage real verificado:
  - `pack_14 defaultImages=60/123`
  - `pack_14 missingDefaultImages=63`
- Hallazgo operativo:
  - con timeout mas largo, lote `SP14-057..060` cerro completo dentro de un solo intento del CLI.

Actualizacion tras ola 15:

- Default cards materializadas en repo:
  - `SP14-001..064`
- Coverage real verificado:
  - `pack_14 defaultImages=64/123`
  - `pack_14 missingDefaultImages=59`
- Hallazgo operativo:
  - lote `SP14-061..064` cerro completo dentro de un solo intento del CLI.
  - suffix global de denoise siguio ayudando a bajar ruido y microdetalle sucio.

Actualizacion tras ola 16:

- Default cards materializadas en repo:
  - `SP14-001..068`
- Coverage real verificado:
  - `pack_14 defaultImages=68/123`
  - `pack_14 missingDefaultImages=55`
- Hallazgo operativo:
  - lote `SP14-065..068` cerro completo dentro de un solo intento del CLI.
  - suffix global de denoise siguio ayudando a bajar ruido y microdetalle sucio.

Actualizacion tras ola 17:

- Default cards materializadas en repo:
  - `SP14-001..072`
- Coverage real verificado:
  - `pack_14 defaultImages=72/123`
  - `pack_14 missingDefaultImages=51`
- Hallazgo operativo:
  - lote inicial `SP14-069..072` agoto ventana del CLI, pero `SP14-069..071` quedaron materializados en repo + checkpoint.
  - `SP14-072` cerro con rerun fino de un solo preset.
  - suffix global de denoise siguio ayudando a bajar ruido y microdetalle sucio.

Actualizacion tras ola 18:

- Default cards materializadas en repo:
  - `SP14-001..076`
- Coverage real verificado:
  - `pack_14 defaultImages=76/123`
  - `pack_14 missingDefaultImages=47`
- Hallazgo operativo:
  - lote `SP14-073..076` cerro completo dentro de un solo intento del CLI.
  - suffix global de denoise siguio ayudando a bajar ruido y microdetalle sucio.

Actualizacion tras ola 19:

- Default cards materializadas en repo:
  - `SP14-001..080`
- Coverage real verificado:
  - `pack_14 defaultImages=80/123`
  - `pack_14 missingDefaultImages=43`
- Hallazgo operativo:
  - lote inicial `SP14-077..080` agoto ventana del CLI.
  - `SP14-077` y `SP14-078` quedaron materializados en repo + checkpoint en esa primera pasada.
  - `SP14-079` y `SP14-080` cerraron tambien via worker en background durante rerun fino del sublote.
  - suffix global de denoise siguio ayudando a bajar ruido y microdetalle sucio.

Actualizacion tras ola 20:

- Default cards materializadas en repo:
  - `SP14-001..084`
- Coverage real verificado:
  - `pack_14 defaultImages=84/123`
  - `pack_14 missingDefaultImages=39`
- Hallazgo operativo:
  - lote inicial `SP14-081..084` agoto ventana del CLI.
  - `SP14-081` y `SP14-082` quedaron materializados en repo + checkpoint en esa primera pasada.
  - `SP14-083` y `SP14-084` quedaron bloqueados por errores de worker (`Timed out waiting for Codex notification`, `Codex app-server socket closed` / `is not open`).
  - simplificacion puntual de manifests en `SP14-083.yaml` y `SP14-084.yaml` destrabo ambas cards via rerun secuencial.
  - suffix global de denoise siguio ayudando a bajar ruido y microdetalle sucio.

Actualizacion tras ola 21:

- Default cards materializadas en repo:
  - `SP14-001..088`
- Coverage real verificado:
  - `pack_14 defaultImages=88/123`
  - `pack_14 missingDefaultImages=35`
- Hallazgo operativo:
  - estrategia secuencial funciono mejor que lote grande para esta categoria.
  - `SP14-087` necesito retry interno (`needs_review`) pero cerro dentro del mismo comando.
  - suffix global de denoise siguio ayudando a bajar ruido y microdetalle sucio.

Actualizacion tras ola 22:

- Default cards materializadas en repo:
  - `SP14-001..092`
- Coverage real verificado:
  - `pack_14 defaultImages=92/123`
  - `pack_14 missingDefaultImages=31`
- Hallazgo operativo:
  - estrategia secuencial siguio estable para `SP14-089..092`.
  - `SP14-090` necesito retry interno (`needs_review`) pero cerro dentro del mismo comando.
  - `SP14-092` recibio un reroll puntual para bajar drift de interior domestico.
  - suffix global de denoise siguio ayudando a bajar ruido y microdetalle sucio.

Actualizacion tras ola 23:

- Default cards materializadas en repo:
  - `SP14-001..096`
- Coverage real verificado:
  - `pack_14 defaultImages=96/123`
  - `pack_14 missingDefaultImages=27`
- Hallazgo operativo:
  - estrategia secuencial siguio estable para `SP14-093..096`.
  - los cuatro comandos agotaron ventana del CLI, pero cada preset termino materializado via worker en background y checkpoint real.
  - `SP14-093` y `SP14-095` quedaron mas fuertes.
  - `SP14-094` y `SP14-096` quedaron mas escenicos/archivo que ideal, pero operativos.
  - suffix global de denoise siguio ayudando a bajar ruido y microdetalle sucio.

Actualizacion tras ola 24:

- Default cards materializadas en repo:
  - `SP14-001..100`
- Coverage real verificado:
  - `pack_14 defaultImages=100/123`
  - `pack_14 missingDefaultImages=23`
- Hallazgo operativo:
  - estrategia secuencial siguio estable para `SP14-097..100`, pero los cuatro comandos agotaron otra vez la ventana del CLI.
  - `SP14-098` necesito dos reruns y refuerzo fuerte anti-convergencia para salir del motivo serpentino de `SP14-097`.
  - `SP14-100` recibio reroll puntual con refuerzo anti-invernadero, pero aun quedo mas scene-heavy de lo ideal; la card sigue usable.
  - `SP14-097` y `SP14-098` quedaron fuertes.
  - `SP14-099` quedo literal con linterna central, pero clara y operativa.
  - suffix global de denoise siguio ayudando a bajar ruido y microdetalle sucio.

Actualizacion tras ola 25:

- Default cards materializadas en repo:
  - `SP14-001..104`
- Coverage real verificado:
  - `pack_14 defaultImages=104/123`
  - `pack_14 missingDefaultImages=19`
- Hallazgo operativo:
  - `SP14-101` fue primer preset de esta frente que cerro completo dentro del CLI, sin timeout.
  - `SP14-102`, `SP14-103`, y `SP14-104` volvieron a agotar ventana del CLI, pero terminaron materializadas via worker en background y checkpoint real.
  - `SP14-101` quedo fuerte.
  - `SP14-102` cayo a escena/estacion mas de lo ideal.
  - `SP14-103` quedo demasiado hall/ritual-space.
  - `SP14-104` quedo bastante mesa/estudio astronomico.
  - las tres siguen usables, pero quedan como candidatas de pulido fino si luego hacemos pasada de cards demasiado literales.
  - suffix global de denoise siguio ayudando a bajar ruido y microdetalle sucio.

Actualizacion tras ola 26:

- Default cards materializadas en repo:
  - `SP14-001..108`
- Coverage real verificado:
  - `pack_14 defaultImages=108/123`
  - `pack_14 missingDefaultImages=15`
- Hallazgo operativo:
  - `SP14-105` volvio a agotar timeout, pero cerro con checkpoint real poco despues.
  - `SP14-106` quedo limpio, aunque muy monumento/observatorio.
  - `SP14-107` quedo muy objeto central con velas negras, pero dentro del frente ritual noir.
  - `SP14-108` primero convergio demasiado con `SP14-107`; necesito refuerzo anti-convergencia en [SP14-108.yaml](/D:/DEV/codex-studio/components/recipes/styles/manifests/presets/pack_14/SP14-108.yaml) y rerun.
  - reroll de `SP14-108` la separo mejor, aunque sigue bastante invernadero/procesion literal.
  - `SP14-105`, `SP14-106`, `SP14-107`, y `SP14-108` siguen usables; `105`, `106`, y `108` quedan en lista de posible pulido fino por scene drift alto.
  - suffix global de denoise siguio ayudando a bajar ruido y microdetalle sucio.

Actualizacion tras ola 27 parcial:

- Default cards materializadas en repo:
  - `SP14-001..109`
  - `SP14-111..112`
- Coverage real verificado:
  - `pack_14 defaultImages=111/123`
  - `pack_14 missingDefaultImages=12`
- Hallazgo operativo:
  - `SP14-109` salio primero demasiado dormitorio/domestico; reroll tras refuerzo anti-bedroom en [SP14-109.yaml](/D:/DEV/codex-studio/components/recipes/styles/manifests/presets/pack_14/SP14-109.yaml) la dejo usable.
  - `SP14-110` quedo pendiente real: varios jobs `needs_review`, sin asset ni checkpoint materializado.
  - `SP14-111` quedo usable, aunque algo drape-studio literal.
  - `SP14-112` quedo usable, aunque bastante puente/salon velado y scene-heavy.
  - suffix global de denoise siguio ayudando a bajar ruido y microdetalle sucio.

Actualizacion tras destrabe de `SP14-110`:

- Default cards materializadas en repo:
  - `SP14-001..112`
- Coverage real verificado:
  - `pack_14 defaultImages=112/123`
  - `pack_14 missingDefaultImages=11`
- Hallazgo operativo:
  - `SP14-110` cerro al sanear el canal de nombre usado por `scripts/generate-style-defaults.ts`.
  - el preset visible sigue siendo `Oath Knife Binding`, pero el prompt de imagegen ya no manda ese label crudo; uso alias seguro `Oath Seal Binding` solo para `TARGET STYLE` y `recognizable as`.
  - evidencia real: job `2d7fe0bf-5430-416e-8a91-e995da545ea2` completo con `TARGET STYLE: OATH SEAL BINDING`, `.webp` materializado y checkpoint nuevo.

Actualizacion tras ola 28 parcial:

- Default cards materializadas en repo:
  - `SP14-001..113`
- Coverage real verificado:
  - `pack_14 defaultImages=113/123`
  - `pack_14 missingDefaultImages=10`
- Hallazgo operativo:
  - `SP14-113` cerro real: `.webp` en repo + checkpoint nuevo.
  - `SP14-114` y `SP14-115` no cerraron: ambos jobs quedaron congelados en `running` sin actualizar y hubo que cancelarlos.
  - `SP14-116` termino materializada en background despues de esa ronda; la deuda real restante paso a `SP14-114`, `SP14-115`, y `SP14-117..123`.
  - nuevo hallazgo de pipeline: `SP14-114` y `SP14-117` repiten patron de job `running` sin transcript util, sin asset en repo, y con `websocket receive error ... os error 10054` en `.studio/logs/app-server.log`; no es un `needs_review` clasico sino un cuelgue de transporte.

Actualizacion tras cierre total de `pack_14`:

- Default cards materializadas en repo:
  - `SP14-001..123`
- Coverage real verificado:
  - `pack_14 defaultImages=123/123`
  - `pack_14 missingDefaultImages=0`
- Hallazgo operativo:
  - reiniciar `local-server` con el fix nuevo de timeouts/recovery destrabo el frente.
  - `SP14-114`, `SP14-115`, `SP14-117`, `SP14-119`, `SP14-120`, `SP14-121`, `SP14-122`, y `SP14-123` cerraron bien en secuencial pura.
  - `SP14-118` cerro dentro de una microtanda, pero `SP14-119` y `SP14-120` dejaron evidencia util del fix:
    - job `7f810784-fb80-43e5-8f9c-4bf5911e81dd` termino `failed` con `Timed out waiting for Codex notification`.
    - job `1865c585-0ab9-4d8c-8eae-0a210181dbea` termino `failed` con `Codex app-server socket closed`.
  - conclusion operativa: microbatch todavia puede degradar transporte; secuencial `1x1` si fue estable para cierre fino.

Actualizacion tras ola 13 de `pack_15`:

- Default cards materializadas en repo:
  - `SP15-001..108`
- Coverage real esperada antes de validate formal:
  - `pack_15 defaultImages=108/137`
  - `pack_15 missingDefaultImages=29`
- Hallazgo operativo:
  - `2x2` sigue acelerando el frente, pero no todos los presets solarpunk responden en la misma ventana de shell.
  - en el primer intento de la ola, `SP15-103`, `SP15-106`, `SP15-107`, y `SP15-108` agotaron timeout del wrapper; confirmacion material mostro que solo `SP15-105` habia quedado real.
  - rerun con timeout largo y caida selectiva a `1x1` destrabo los lentos sin tocar app-server ni worker.
  - conclusion parcial del frente `pack_15`: `2x2` sigue siendo estrategia base, pero cada microtanda necesita verificacion dura de `.webp` + manifest antes de contarla como cerrada.

Actualizacion tras ola 14 de `pack_15`:

- Default cards materializadas en repo:
  - `SP15-001..116`
- Coverage real esperada antes de validate formal:
  - `pack_15 defaultImages=116/137`
  - `pack_15 missingDefaultImages=21`
- Hallazgo operativo:
  - `SP15-109..112` cerraron real con verificacion `.webp` + manifest; `SP15-110` necesito fallback `1x1` por timeout de shell.
  - `SP15-113..116` cerraron con una sola invocacion batch: `--preset='SP15-113|SP15-114|SP15-115|SP15-116' --parallel=2`.
  - resultado batch: `generated=4 attempted=4 failed=0`; este camino reduce relanzamientos, salida de terminal y tokens sin bajar control de calidad.
  - nueva estrategia base: batch interno de 4 presets con `--parallel=2`, verificacion agregada de `.webp` + manifest, y fallback `1x1` solo para IDs realmente faltantes.

Actualizacion tras ola 15 de `pack_15`:

- Default cards materializadas en repo:
  - `SP15-001..120`
- Coverage real esperada antes de validate formal:
  - `pack_15 defaultImages=120/137`
  - `pack_15 missingDefaultImages=17`
- Hallazgo operativo:
  - `SP15-117..120` cerraron con una sola invocacion batch: `--preset='SP15-117|SP15-118|SP15-119|SP15-120' --parallel=2`.
  - resultado batch: `generated=4 attempted=4 failed=0`.
  - segunda tanda consecutiva donde el batch interno de 4 presets mantuvo control de calidad y redujo overhead de comandos.

Actualizacion tras ola 16 de `pack_15`:

- Default cards materializadas en repo:
  - `SP15-001..124`
- Coverage real esperada antes de validate formal:
  - `pack_15 defaultImages=124/137`
  - `pack_15 missingDefaultImages=13`
- Hallazgo operativo:
  - `SP15-121..124` cerraron con una sola invocacion batch: `--preset='SP15-121|SP15-122|SP15-123|SP15-124' --parallel=2`.
  - resultado batch: `generated=4 attempted=4 failed=0`.
  - tercera tanda consecutiva donde batch interno de 4 presets redujo overhead sin perder verificacion material.

Actualizacion tras ola 17 de `pack_15`:

- Default cards materializadas en repo:
  - `SP15-001..128`
- Coverage real esperada antes de validate formal:
  - `pack_15 defaultImages=128/137`
  - `pack_15 missingDefaultImages=9`
- Hallazgo operativo:
  - `SP15-125..128` cerraron con una sola invocacion batch: `--preset='SP15-125|SP15-126|SP15-127|SP15-128' --parallel=2`.
  - resultado batch: `generated=4 attempted=4 failed=0`.
  - cuarta tanda consecutiva estable con batch interno de 4 presets.

Actualizacion tras ola 18 de `pack_15`:

- Default cards materializadas en repo:
  - `SP15-001..132`
- Coverage real esperada antes de validate formal:
  - `pack_15 defaultImages=132/137`
  - `pack_15 missingDefaultImages=5`
- Hallazgo operativo:
  - `SP15-129..132` cerraron con una sola invocacion batch: `--preset='SP15-129|SP15-130|SP15-131|SP15-132' --parallel=2`.
  - resultado batch: `generated=4 attempted=4 failed=0`.
  - quinta tanda consecutiva estable con batch interno de 4 presets.

Actualizacion tras cierre total de `pack_15`:

- Default cards materializadas en repo:
  - `SP15-001..137`
- Coverage real esperada antes de validate formal:
  - `pack_15 defaultImages=137/137`
  - `pack_15 missingDefaultImages=0`
- Hallazgo operativo:
  - `SP15-133..137` cerraron con una sola invocacion batch: `--preset='SP15-133|SP15-134|SP15-135|SP15-136|SP15-137' --parallel=2`.
  - resultado batch: `generated=5 attempted=5 failed=0`.
  - `pack_15` queda visualmente completo; ya no quedan filas stale/missing de este pack en la tabla activa.

Actualizacion semantica 2026-06-09 sobre `pack_08`:

- Precision pass aplicado a:
  - `SP08-036`
  - `SP08-037`
  - `SP08-045`
  - `SP08-050`
- Estado operativo:
  - no se agregan filas nuevas porque esos IDs ya estaban marcados para regeneracion.
  - estas 4 cards conviene priorizarlas dentro del frente `pack_08` porque cambiaron campos con impacto visual real:
    `aesthetic`, `form_and_line`, `key_features`, `creative_brief`, y en `SP08-050` tambien `negativePrompt`.
  - `SP08-050` ademas requirio un suavizado posterior de anchors IP/disenador para evitar `needs_review` repetido en la cola visual.

Actualizacion visual 2026-06-09 sobre `pack_08`:

- Default cards materializadas en repo:
  - `SP08-036`
  - `SP08-037`
  - `SP08-045`
  - `SP08-050`
- Checkpoint confirmado en `assets/recipes/styles/defaults/manifest-pack_08.json` para esos 4 IDs.
- Limpieza de backlog:
  - se removieron sus filas activas de la tabla `pack_08`, por lo que tambien dejan de figurar en `lib/staleStyleDefaultImages.generated.ts` tras refrescar runtime.
- Hallazgo operativo:
  - batch `2x2` funciono bien para `SP08-036`, `SP08-037` y `SP08-045`.
  - `SP08-050` cayo varias veces en `needs_review`; se destrabo al suavizar anchors IP/disenador y rerun `1x1`.
  - en la siguiente miniola, `SP08-049` repitio el mismo patron de `needs_review`; se suavizo desde `mermaid/siren body` hacia `pelagic fantasy couture` antes del rerun aislado.
  - luego se hizo refactor mas fuerte: rename interno a `Pelagic Tail Couture` y limpieza de cues de cabello/cuerpo, para que la cola visual no arranque desde un sujeto humano implicito.
  - aun con ese rename y rerun `1x1`, `SP08-049` siguio devolviendo `needs_review`; queda como residual aislado del pack.
  - una tanda posterior `SP08-046|SP08-047|SP08-051|SP08-056` cayo completa (`0/4`) con mezcla de `needs_review`, timeout y `socket closed`; antes de relanzar, se hizo suavizado semantico adicional de esos cuatro manifests.
  - luego hubo un refuerzo extra sobre materiales: `SP08-051` paso a `High-Gloss Polymer` y `SP08-056` a `Liquid Satin Drape`, para quitar lectura fetish/slip-dress demasiado literal antes de una proxima cola.
  - tras ese refuerzo, `SP08-051|SP08-056` dejaron de caer en `needs_review` y pasaron a fallar por runtime puro (`Timed out waiting for Codex notification` / `Codex app-server socket closed`). `SP08-051` tambien fallo igual en rerun `1x1`, sin materializacion en background.
  - una microola posterior `SP08-052|SP08-053|SP08-054|SP08-055` tambien quedo sin materializacion real; el wrapper agoto ventana y la evidencia de `.webp` + manifest confirmo que los 4 seguian viejos. Fallos visibles del batch: `SP08-052` por `Timed out waiting for Codex notification` y `SP08-053` por `Codex app-server socket closed`.
  - se agrego selector operativo `--retry-failures --failure-limit=<n>` en `scripts/generate-style-defaults.ts` para relanzar solo residuales reales sin rearmar listas manuales.
  - tambien se endurecio runtime en repo para invalidar hilos persistidos ante `Timed out waiting for Codex notification` y `Codex app-server socket closed`, y se agrego `--session-suffix=<tag>` para abrir miniolas con `SESSION:` fresco.
  - prueba live posterior: `--retry-failures --failure-limit=2 --parallel=2 --session-suffix=retry_clean_a` siguio en `0/2` sobre `SP08-053|SP08-056`.
  - evidencia extra: el backend vivo en `http://127.0.0.1:17223` siguio actualizando la clave persistida `fashion_costume` en `D:\AI-Studio-Library\.studio\state\imagegen-session-registry.json`, sin registrar `fashion_costume_retry_clean_a`; queda indicado que la instancia local activa no habia recargado todavia el hardening nuevo del repo.

Actualizacion UI 2026-06-09 sobre cards visibles:

- Hallazgo raiz:
  - `components/recipes/StylesRecipe.tsx` ocultaba por completo la miniatura cuando `defaultImageStale=true`.
  - `lib/recipeAssetCatalog.ts` ademas devolvia `undefined` para cualquier `default` stale, por lo que la grilla caia al mismo `category base` repetido aunque el `.webp` real existiera en `assets/recipes/styles/defaults/`.
- Fix aplicado:
  - la UI ahora sigue renderizando el `defaultImage` stale con badge `Stale` y affordance de regeneracion.
  - `resolveStyleDefaultImage()` vuelve a exponer el asset real aunque figure stale; el estado stale queda solo como marca visual, no como bloqueo de render.
- Verificacion live en `http://localhost:17222/#recipe-styles`:
  - barrido `pack_01..pack_16` sobre cards visibles iniciales.
  - resultado: `0` cards visibles usando `category-bases/`, `0` cards visibles sin `<img>`, todas usando `defaults/`.
  - packs `01..13` y `16` quedaron visibles con badge `Stale`; `pack_14` y `pack_15` ya muestran defaults reales sin badge stale en el tramo visible.
- Riesgo residual:
  - esta verificacion cubre la grilla visible inicial por pack, no el universo completo de presets expandido.
  - el frente separado de backend local sigue inestable cuando `http://localhost:17223` devuelve HTML/no JSON; no rompe esta recuperacion de cards, pero conviene sanearlo antes de la siguiente ola fuerte de regeneracion.

Actualizacion semantica 2026-06-09 sobre `pack_08` residual visual:

- Precision pass aplicado a:
  - `SP08-046`
  - `SP08-047`
  - `SP08-049`
  - `SP08-051`
  - `SP08-052`
  - `SP08-053`
  - `SP08-054`
  - `SP08-055`
  - `SP08-056`
- Motivo:
  - eran los presets con mas mezcla restante de body-first wording, escena implicita o brief redundante dentro del bloque que siguio fallando por `needs_review` y runtime.
- Estado operativo:
  - no se agregan filas nuevas: los IDs ya estaban en frente visual activo.
  - antes de una nueva cola de regeneracion conviene usar esta miniola como base semantica estable y relanzar solo una vez saneado el backend local que esta respondiendo HTML/no JSON en `:17223`.
  - validacion semantica posterior:
    - `bun run styles:validate -- --pack=pack_08` -> verde.
    - `bun run styles:quality:audit` -> verde.
    - `bun run styles:runtime` + `bun run styles:runtime:check` -> verdes tras refrescar runtime packs de `pack_08`.

Actualizacion runtime 2026-06-09 sobre backend local:

- Hallazgo raiz:
  - `localhost:17223` podia caer sobre un listener IPv6 ajeno al backend real y devolver HTML de Vite.
  - `127.0.0.1:17223` seguia devolviendo el backend correcto.
- Fix en repo:
  - runtime web y scripts locales pasan a normalizar `localhost` -> `127.0.0.1` para el API base.
  - `init` tambien deja `VITE_STUDIO_API_BASE` nuevo en `127.0.0.1`.
- Impacto:
  - este saneamiento no regenera cards por si solo, pero elimina una fuente real de falsos `backend unavailable` y de parseo HTML/JSON antes de la siguiente ola visual de `pack_08`.

Actualizacion semantica 2026-06-12 sobre residual fino `pack_07` / `pack_08`:

- Precision pass aplicado a:
  - `SP07-044`
  - `SP07-049`
  - `SP08-041`
  - `SP08-073`
- Motivo:
  - seguian reteniendo alguno de estos locks finos:
    promenade/procession axis demasiado fijo,
    sport-field routing demasiado literal,
    host-body obligatorio para augmentacion,
    o piel desnuda demasiado central para pigment couture.
- Estado operativo:
  - no se agregan filas nuevas porque los cuatro IDs ya estaban dentro del frente visual activo de ambos packs;
  - estos cuatro defaults deben tratarse otra vez como obsoletos por cambio semantico, aunque el archivo `.webp` siga existiendo en coverage.

Actualizacion semantica 2026-06-12 sobre residual material `pack_07`:

- Precision pass aplicado a:
  - `SP07-055`
  - `SP07-058`
  - `SP07-068`
  - `SP07-071`
- Motivo:
  - seguian reteniendo alguno de estos locks finos:
    candy-kingdom o dessert-scene demasiado implicita,
    spire apex demasiado obligatorio,
    floor/interior craft demasiado narrativo,
    o forest-floor / fairy-cluster demasiado fijo para la morfologia fungica.
- Estado operativo:
  - no se agregan filas nuevas porque los cuatro IDs ya estaban dentro del frente visual activo de `pack_07`;
  - sus defaults actuales deben tratarse otra vez como obsoletos por cambio semantico.

Actualizacion semantica 2026-06-12 sobre residual espacial temprano `pack_07`:

- Precision pass aplicado a:
  - `SP07-004`
  - `SP07-008`
  - `SP07-034`
  - `SP07-038`
- Motivo:
  - seguian reteniendo alguno de estos locks finos:
    domestic-room demasiado fijo,
    zen-room o temple-space demasiado implicito,
    bureaucracy-hall demasiado literal,
    o burial-corridor/catacomb passage demasiado cerrado.
- Estado operativo:
  - no se agregan filas nuevas porque los cuatro IDs ya estaban dentro del frente visual activo de `pack_07`;
  - sus defaults actuales deben tratarse otra vez como obsoletos por cambio semantico.

Actualizacion semantica 2026-06-12 sobre residual fino adicional `pack_07`:

- Precision pass aplicado a:
  - `SP07-040`
  - `SP07-043`
  - `SP07-060`
  - `SP07-073`
- Motivo operativo:
  - seguian reteniendo alguno de estos locks finos:
    tree-support o shelter demasiado fijo,
    zen-garden/templo contemplativo demasiado literal,
    haunted-house/Halloween scene demasiado frontal,
    o ant-farm/insect-cutaway demasiado cerrado.
- Efecto:
  - esas 4 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_07`.

Actualizacion semantica 2026-06-12 sobre residual estructural adicional `pack_07`:

- Precision pass aplicado a:
  - `SP07-057`
  - `SP07-063`
  - `SP07-064`
  - `SP07-069`
- Motivo operativo:
  - seguian reteniendo alguno de estos locks finos:
    steam-city / transit-aerial demasiado frontal,
    cementerio-obelisco / cripta demasiado literal,
    sky-terminal / floating-city demasiado fija,
    o playform inflable demasiado iconica.
- Efecto:
  - esas 4 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_07`.

Actualizacion semantica 2026-06-12 sobre residual iconico adicional `pack_07`:

- Precision pass aplicado a:
  - `SP07-059`
  - `SP07-061`
  - `SP07-062`
  - `SP07-065`
- Motivo operativo:
  - seguian reteniendo alguno de estos locks finos:
    hobbit-home o madriguera pastoral demasiado frontal,
    ice-palace / catedral helada demasiado literal,
    tree-village tribal demasiado fijo,
    o city-diorama / maqueta urbana demasiado cerrada.
- Efecto:
  - esas 4 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_07`.

Actualizacion semantica 2026-06-12 sobre residual escenico/IP `pack_08`:

- Precision pass aplicado a:
  - `SP08-004`
  - `SP08-018`
  - `SP08-031`
  - `SP08-043`
- Motivo operativo:
  - seguian reteniendo alguno de estos locks finos:
    festival desierto/crowd demasiado fijo,
    idol-stage/group choreography demasiado frontal,
    speakeasy-party con props demasiado obligatoria,
    o royal space-opera demasiado pegada a IP concreta.
- Efecto:
  - esas 4 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_08`.

Actualizacion semantica 2026-06-12 sobre residual wearable adicional `pack_08`:

- Precision pass aplicado a:
  - `SP08-009`
  - `SP08-023`
  - `SP08-058`
  - `SP08-061`
- Motivo operativo:
  - seguian reteniendo alguno de estos locks finos:
    inventor/aviator persona demasiado fija,
    lolita-girl / doll sweetness demasiado frontal,
    disco-dress bodycon / countdown-party demasiado obligatoria,
    o bridal-veil / chapel tableau demasiado literal.
- Efecto:
  - esas 4 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_08`.

Actualizacion semantica 2026-06-12 sobre residual comercial/identitario `pack_08`:

- Precision pass aplicado a:
  - `SP08-002`
  - `SP08-007`
  - `SP08-013`
  - `SP08-019`
- Motivo operativo:
  - seguian reteniendo alguno de estos locks finos:
    branding / queue / resale-culture demasiado frontal,
    goth character / crypt-body demasiado cerrado,
    named elven realm / princess-body demasiado fijo,
    u office-headshot / executive persona demasiado obligatoria.
- Efecto:
  - esas 4 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_08`.

Actualizacion semantica 2026-06-12 sobre residual editorial/persona `pack_08`:

- Precision pass aplicado a:
  - `SP08-003`
  - `SP08-012`
  - `SP08-017`
  - `SP08-024`
- Motivo operativo:
  - seguian reteniendo alguno de estos locks finos:
    showroom/zen-room quiet luxury demasiado sugerido,
    Tudor/Holbein portrait logic demasiado frontal,
    founder/uniform startup persona demasiado nombrada,
    o greaser-pinup/tattoo rebel demasiado obligatoria.
- Efecto:
  - esas 4 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_08`.

Actualizacion semantica 2026-06-12 sobre residual staging/material `pack_08`:

- Precision pass aplicado a:
  - `SP08-001`
  - `SP08-005`
  - `SP08-022`
  - `SP08-028`
- Motivo operativo:
  - seguian reteniendo alguno de estos locks finos:
    runway/fashion-week apex demasiado frontal,
    activewear-body / gym pose demasiado fuerte,
    slacker-bedroom / Seattle grunge demasiado sugerido,
    o basket-bread-cottage prop kit demasiado fijo.
- Efecto:
  - esas 4 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_08`.

Actualizacion semantica 2026-06-12 sobre residual rol/franquicia `pack_08`:

- Precision pass aplicado a:
  - `SP08-006`
  - `SP08-014`
  - `SP08-032`
  - `SP08-078`
- Motivo operativo:
  - seguian reteniendo alguno de estos locks finos:
    firma techwear/autoral demasiado frontal,
    soldier persona / combate demasiado directo,
    widow portrait ritual demasiado fijo,
    o holograma space-opera demasiado pegado a franquicia.
- Efecto:
  - esas 4 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_08`.

Actualizacion semantica 2026-06-12 sobre residual lore social `pack_08`:

- Precision pass aplicado a:
  - `SP08-008`
  - `SP08-010`
  - `SP08-025`
  - `SP08-026`
- Motivo operativo:
  - seguian reteniendo alguno de estos locks finos:
    punk boutique / mohawk-body demasiado frontal,
    prep wealth / country-club tableau demasiado sugerido,
    hippie commune / gathering demasiado fija,
    o biker outlaw persona demasiado obligatoria.
- Efecto:
  - esas 4 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_08`.

Actualizacion semantica 2026-06-12 sobre cleanup de brief formulaico `pack_07`:

- Precision pass aplicado a:
  - `SP07-004`
  - `SP07-008`
  - `SP07-038`
  - `SP07-040`
- Motivo operativo:
  - los cuatro seguian cargando el mismo boilerplate residual `Apply this spatial/worldbuilding grammar over any input`
    al final del `creative_brief`, aun despues de la limpieza semantica anterior.
- Efecto:
  - esas 4 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_07`.

Actualizacion semantica 2026-06-12 sobre cierre de boilerplate residual `pack_07`:

- Precision pass aplicado a:
  - `SP07-043`
  - `SP07-055`
  - `SP07-058`
  - `SP07-060`
  - `SP07-061`
  - `SP07-062`
  - `SP07-068`
  - `SP07-071`
  - `SP07-073`
- Motivo operativo:
  - estos nueve presets ya tenian anchors refinados, pero seguian cargando la coletilla formulaica
    `Apply this spatial/worldbuilding grammar over any input` dentro de `creative_brief`.
  - se reemplazo por cierres directos, especificos por preset, manteniendo materialidad, escala, ritmo y atmosfera sin escena obligatoria.
- Efecto:
  - esas 9 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_07`.

Actualizacion semantica 2026-06-12 sobre subject-lock en nombres visibles `pack_08`:

- Precision pass aplicado a:
  - `SP08-017`
  - `SP08-018`
- Motivo operativo:
  - `Tech CEO` y `K-Pop Idol` ya tenian briefs mas portables, pero el nombre visible seguia forzando persona/sujeto.
  - se renombraron a `Tech-Industry Uniform` y `Pop-Performance Tailoring`.
- Efecto:
  - esas 2 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_08`;
  - `manifest-pack_08.json` puede conservar nombres viejos hasta que se regenere cada default card.

Actualizacion semantica 2026-06-12 sobre cierre ampliado de boilerplate residual `pack_07` / `pack_08`:

- Precision pass aplicado a:
  - `SP07-034`
  - `SP07-044`
  - `SP07-049`
  - `SP07-052`
  - `SP07-059`
  - `SP07-065`
  - `SP07-067`
  - `SP07-069`
  - `SP07-077`
  - `SP07-078`
  - `SP07-080`
  - `SP08-073`
- Motivo operativo:
  - quedaban variantes de boilerplate partidas por saltos de linea o por la formula `fashion/costume grammar`.
  - se reemplazaron por cierres especificos por preset, sin escena, cuerpo, edificio, set o personaje obligatorio.
- Efecto:
  - esas 12 cards tambien quedan re-priorizadas para regeneracion visual dentro de `pack_07` / `pack_08`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_ab

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-043|SP08-046" --parallel=2 --session-suffix=stale_p08_ab --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-043.webp` (`452440` bytes)
  - `assets/recipes/styles/defaults/SP08-046.webp` (`246536` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-043` / `Space Opera Royal` and `SP08-046` / `Mech Pilot Suit`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_08 --coverage` -> `pack_08 defaultImages=80/80 availableDefaultImages=63/80 staleDefaultImages=17 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_ac

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-047|SP08-049" --parallel=2 --session-suffix=stale_p08_ac --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-047.webp` (`163932` bytes)
  - `assets/recipes/styles/defaults/SP08-049.webp` (`311448` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-047` / `Vampire Lord` and `SP08-049` / `Pelagic Tail Couture`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_08 --coverage` -> `pack_08 defaultImages=80/80 availableDefaultImages=65/80 staleDefaultImages=15 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_ad

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-051|SP08-052" --parallel=2 --session-suffix=stale_p08_ad --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-051.webp` (`173104` bytes)
  - `assets/recipes/styles/defaults/SP08-052.webp` (`401014` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-051` / `High-Gloss Polymer` and `SP08-052` / `Denim on Denim`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_08 --coverage` -> `pack_08 defaultImages=80/80 availableDefaultImages=67/80 staleDefaultImages=13 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_ae

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-053|SP08-054" --parallel=2 --session-suffix=stale_p08_ae --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-053.webp` (`368324` bytes)
  - `assets/recipes/styles/defaults/SP08-054.webp` (`597278` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-053` / `Fur Coat` and `SP08-054` / `Chainmail`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_08 --coverage` -> `pack_08 defaultImages=80/80 availableDefaultImages=69/80 staleDefaultImages=11 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_af

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-055|SP08-056" --parallel=2 --session-suffix=stale_p08_af --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-055.webp` (`267368` bytes)
  - `assets/recipes/styles/defaults/SP08-056.webp` (`204266` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-055` / `Knitted Wool` and `SP08-056` / `Liquid Satin Drape`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_08 --coverage` -> `pack_08 defaultImages=80/80 availableDefaultImages=71/80 staleDefaultImages=9 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-12 - `pack_08` ola stale_p08_ag

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-058|SP08-059" --parallel=2 --session-suffix=stale_p08_ag --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-058.webp` (`473738` bytes)
  - `assets/recipes/styles/defaults/SP08-059.webp` (`229032` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-058` / `Sequins` and `SP08-059` / `Transparent Plastic`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_08 --coverage` -> `pack_08 defaultImages=80/80 availableDefaultImages=73/80 staleDefaultImages=7 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_08` ola stale_p08_ah

- Command:
  - first attempt hit `ConnectionRefused` on `http://127.0.0.1:17223/api/health`; local server was restarted with `bun run dev:server`.
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-060|SP08-061" --parallel=2 --session-suffix=stale_p08_ah --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-060.webp` (`218104` bytes)
  - `assets/recipes/styles/defaults/SP08-061.webp` (`455822` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-060` / `Velvet` and `SP08-061` / `Lace`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_08 --coverage` -> `pack_08 defaultImages=80/80 availableDefaultImages=75/80 staleDefaultImages=5 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_08` ola stale_p08_ai

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-073|SP08-075" --parallel=2 --session-suffix=stale_p08_ai --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-073.webp` (`347180` bytes)
  - `assets/recipes/styles/defaults/SP08-075.webp` (`510388` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-073` / `Body Paint` and `SP08-075` / `Gold Leaf`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_08 --coverage` -> `pack_08 defaultImages=80/80 availableDefaultImages=77/80 staleDefaultImages=3 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_08` ola stale_p08_aj

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-076|SP08-079" --parallel=2 --session-suffix=stale_p08_aj --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-076.webp` (`374976` bytes)
  - `assets/recipes/styles/defaults/SP08-079.webp` (`259670` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-076` / `Slime/Goo` and `SP08-079` / `Invisibility Cloak`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_08 --coverage` -> `pack_08 defaultImages=80/80 availableDefaultImages=79/80 staleDefaultImages=1 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_08` ola stale_p08_ak

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_08 --preset=SP08-080 --parallel=1 --session-suffix=stale_p08_ak --force`
- Result:
  - `generated=1 attempted=1 skipped=79 failed=0 packs=pack_08`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP08-080.webp` (`147198` bytes)
- Manifest checkpoint:
  - `manifest-pack_08.json` now refreshes `SP08-080` / `Shadow Form`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_08 --coverage` -> `pack_08 defaultImages=80/80 availableDefaultImages=80/80 staleDefaultImages=0 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_a

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-001|SP09-002" --parallel=2 --session-suffix=stale_p09_a --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-001.webp` (`278854` bytes)
  - `assets/recipes/styles/defaults/SP09-002.webp` (`222168` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-001` / `Oak Wood (Raw)` and `SP09-002` / `Mahogany (Polished)`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=2/80 staleDefaultImages=78 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_b

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-003|SP09-004" --parallel=2 --session-suffix=stale_p09_b --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-003.webp` (`281906` bytes)
  - `assets/recipes/styles/defaults/SP09-004.webp` (`297452` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-003` / `Birch Bark` and `SP09-004` / `Granite (Polished)`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=4/80 staleDefaultImages=76 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_c

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-005|SP09-006" --parallel=2 --session-suffix=stale_p09_c --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-005.webp` (`482830` bytes)
  - `assets/recipes/styles/defaults/SP09-006.webp` (`183120` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-005` / `Sandstone (Rough)` and `SP09-006` / `Marble (Carrara)`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=6/80 staleDefaultImages=74 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_d

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-007|SP09-008" --parallel=2 --session-suffix=stale_p09_d --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-007.webp` (`259178` bytes)
  - `assets/recipes/styles/defaults/SP09-008.webp` (`376106` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-007` / `Slate (Split)` and `SP09-008` / `Mossy Rock`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=8/80 staleDefaultImages=72 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_e

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-009|SP09-010" --parallel=2 --session-suffix=stale_p09_e --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-009.webp` (`174698` bytes)
  - `assets/recipes/styles/defaults/SP09-010.webp` (`247228` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-009` / `River Stones` and `SP09-010` / `Obsidian`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=10/80 staleDefaultImages=70 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_f

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-011|SP09-012" --parallel=2 --session-suffix=stale_p09_f --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-011.webp` (`338286` bytes)
  - `assets/recipes/styles/defaults/SP09-012.webp` (`270324` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-011` / `Wolf Fur` and `SP09-012` / `Snake Scales`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=12/80 staleDefaultImages=68 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_g

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-013|SP09-014" --parallel=2 --session-suffix=stale_p09_g --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-013.webp` (`312112` bytes)
  - `assets/recipes/styles/defaults/SP09-014.webp` (`308680` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-013` / `Bird Feathers` and `SP09-014` / `Coral Reef`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=14/80 staleDefaultImages=66 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_h

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-015|SP09-016" --parallel=2 --session-suffix=stale_p09_h --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-015.webp` (`297664` bytes)
  - `assets/recipes/styles/defaults/SP09-016.webp` (`434778` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-015` / `Honeycomb Wax` and `SP09-016` / `Glacier Ice`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=16/80 staleDefaultImages=64 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_i

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-017|SP09-018" --parallel=2 --session-suffix=stale_p09_i --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-017.webp` (`205340` bytes)
  - `assets/recipes/styles/defaults/SP09-018.webp` (`244374` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-017` / `Brushed Aluminum` and `SP09-018` / `Rusty Iron`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=18/80 staleDefaultImages=62 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_j

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-019|SP09-020" --parallel=2 --session-suffix=stale_p09_j --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-019.webp` (`481600` bytes)
  - `assets/recipes/styles/defaults/SP09-020.webp` (`346650` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-019` / `Gold Leaf` and `SP09-020` / `Copper Patina`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=20/80 staleDefaultImages=60 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_k

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-021|SP09-022" --parallel=2 --session-suffix=stale_p09_k --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-021.webp` (`323232` bytes)
  - `assets/recipes/styles/defaults/SP09-022.webp` (`282572` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-021` / `Carbon Fiber (Forged)` and `SP09-022` / `Concrete (Raw)`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=22/80 staleDefaultImages=58 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_l

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-023|SP09-024" --parallel=2 --session-suffix=stale_p09_l --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-023.webp` (`503760` bytes)
  - `assets/recipes/styles/defaults/SP09-024.webp` (`328926` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-023` / `Brick Wall (Aged)` and `SP09-024` / `Asphalt (Wet)`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=24/80 staleDefaultImages=56 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_m

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-025|SP09-026" --parallel=2 --session-suffix=stale_p09_m --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-025.webp` (`304768` bytes)
  - `assets/recipes/styles/defaults/SP09-026.webp` (`144330` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-025` / `Porcelain (Cracked)` and `SP09-026` / `Plastic (Injection Molded)`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=26/80 staleDefaultImages=54 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_n

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-027|SP09-028" --parallel=2 --session-suffix=stale_p09_n --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-027.webp` (`310232` bytes)
  - `assets/recipes/styles/defaults/SP09-028.webp` (`206872` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-027` / `Rubber (Tire)` and `SP09-028` / `Glass (Shattered)`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=28/80 staleDefaultImages=52 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_o

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-029|SP09-030" --parallel=2 --session-suffix=stale_p09_o --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-029.webp` (`151338` bytes)
  - `assets/recipes/styles/defaults/SP09-030.webp` (`386408` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-029` / `Velvet Fabric` and `SP09-030` / `Burlap Sack`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=30/80 staleDefaultImages=50 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_p

- Commands:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-031|SP09-032" --parallel=2 --session-suffix=stale_p09_p --force`
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-031" --parallel=1 --session-suffix=stale_p09_p_repair --force`
- Result:
  - both generation commands hit the local tool timeout, but the files and manifest entries materialized and were verified after the timeout.
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-031.webp` (`200262` bytes)
  - `assets/recipes/styles/defaults/SP09-032.webp` (`296490` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-031` / `Latex (Shiny)` and `SP09-032` / `Cardboard`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=32/80 staleDefaultImages=48 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_q

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-033|SP09-034" --parallel=2 --session-suffix=stale_p09_q --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-033.webp` (`391794` bytes)
  - `assets/recipes/styles/defaults/SP09-034.webp` (`336362` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-033` / `Peeling Paint` and `SP09-034` / `Mold & Mildew`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=34/80 staleDefaultImages=46 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_r

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-035|SP09-036" --parallel=2 --session-suffix=stale_p09_r --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-035.webp` (`202784` bytes)
  - `assets/recipes/styles/defaults/SP09-036.webp` (`418596` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-035` / `Burnt Wood (Shou Sugi Ban)` and `SP09-036` / `Water Damage`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=36/80 staleDefaultImages=44 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_s

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-037|SP09-038" --parallel=2 --session-suffix=stale_p09_s --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-037.webp` (`286066` bytes)
  - `assets/recipes/styles/defaults/SP09-038.webp` (`254738` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-037` / `Scratched Metal` and `SP09-038` / `Dusty Surface`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=38/80 staleDefaultImages=42 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_t

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-039|SP09-040" --parallel=2 --session-suffix=stale_p09_t --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-039.webp` (`364468` bytes)
  - `assets/recipes/styles/defaults/SP09-040.webp` (`411048` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-039` / `Frozen/Frosted` and `SP09-040` / `Oil Stains`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=40/80 staleDefaultImages=40 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_u

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-041|SP09-042" --parallel=2 --session-suffix=stale_p09_u --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-041.webp` (`415306` bytes)
  - `assets/recipes/styles/defaults/SP09-042.webp` (`435062` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-041` / `Sandpaper` and `SP09-042` / `Bubble Wrap`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=42/80 staleDefaultImages=38 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_v

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-043|SP09-044" --parallel=2 --session-suffix=stale_p09_v --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-043.webp` (`285788` bytes)
  - `assets/recipes/styles/defaults/SP09-044.webp` (`199324` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-043` / `Slime/Goo` and `SP09-044` / `Sponge (Sea)`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=44/80 staleDefaultImages=36 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_w

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-045|SP09-046" --parallel=2 --session-suffix=stale_p09_w --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-045.webp` (`312142` bytes)
  - `assets/recipes/styles/defaults/SP09-046.webp` (`296000` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-045` / `Felt Fabric` and `SP09-046` / `Sequins`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=46/80 staleDefaultImages=34 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_x

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-047|SP09-048" --parallel=2 --session-suffix=stale_p09_x --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-047.webp` (`282766` bytes)
  - `assets/recipes/styles/defaults/SP09-048.webp` (`314732` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-047` / `Fur (Synthetic)` and `SP09-048` / `Cork Board`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=48/80 staleDefaultImages=32 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_y

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-049|SP09-050" --parallel=2 --session-suffix=stale_p09_y --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-049.webp` (`339704` bytes)
  - `assets/recipes/styles/defaults/SP09-050.webp` (`535418` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-049` / `Velcro` and `SP09-050` / `Chalk (Dry)`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=50/80 staleDefaultImages=30 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_z

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-051|SP09-052" --parallel=2 --session-suffix=stale_p09_z --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-051.webp` (`508350` bytes)
  - `assets/recipes/styles/defaults/SP09-052.webp` (`308432` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-051` / `Fire & Magma` and `SP09-052` / `Electricity/Lightning`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=52/80 staleDefaultImages=28 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_aa

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-053|SP09-054" --parallel=2 --session-suffix=stale_p09_aa --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-053.webp` (`112766` bytes)
  - `assets/recipes/styles/defaults/SP09-054.webp` (`370414` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-053` / `Smoke/Fog` and `SP09-054` / `Water Splash`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=54/80 staleDefaultImages=26 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_ab

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-055|SP09-056" --parallel=2 --session-suffix=stale_p09_ab --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-055.webp` (`399012` bytes)
  - `assets/recipes/styles/defaults/SP09-056.webp` (`300538` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-055` / `Crystal/Gemstone` and `SP09-056` / `Plasma/Energy`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=56/80 staleDefaultImages=24 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_ac

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-057|SP09-058" --parallel=2 --session-suffix=stale_p09_ac --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-057.webp` (`380414` bytes)
  - `assets/recipes/styles/defaults/SP09-058.webp` (`333932` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-057` / `Oil on Water` and `SP09-058` / `Sparks`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=58/80 staleDefaultImages=22 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.
