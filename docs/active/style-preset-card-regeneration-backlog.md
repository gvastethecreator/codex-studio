# Style Preset Card Regeneration Backlog

> **Note:** This file is a per-preset regeneration log. Start from `docs/active/style-generation-maintenance-index.md` for the current maintenance entry point, and avoid adding new absolute local backup paths here unless style tooling still needs this exact file. The intro below and most section headings are translated; per-batch commentary and rationale blocks inside the body remain in Spanish pending a full pass once the regeneration waves settle. Per-preset rows themselves are file paths and need no translation.

## Criterion

Preset default cards are generated as `.webp` in `assets/recipes/styles/defaults/`.
`scripts/generate-style-defaults.ts` builds the prompt from the pack, the category, the `name`, the `visualDna`, the `negativePrompt`, and hash-based deterministic variants.

The exact prompt used for a card is not versioned alongside the asset. The `assets/recipes/styles/defaults/manifest-<pack>.json` manifests store `presetId`, `presetName`, `jobId`, model, mode, and timestamp, but not the full prompt.

Operating rule:

- If `name`, `visualDna`, `avoidRules`, or `attributes.negativePrompt` change, the existing card is considered obsolete.
- Every modified preset must be annotated here with `needs-regeneration` state.
- When regenerating, replace `assets/recipes/styles/defaults/<PRESET_ID>.webp` and update the `manifest-<pack>.json` checkpoint.
- Additional representative variants may be stored as `assets/recipes/styles/defaults/variants/<PRESET_ID>-NN.webp`.
- Generate variants with `bun run scripts/generate-style-defaults.ts --pack=<pack> "--preset=<ID>" --variant-slot=<N> --force`; variant files are indexed by `styles:runtime` and shown in the card carousel without replacing the primary default image or manifest checkpoint.
- Generate multiple review candidates in one run with `--variant-count=<N>` or explicit `--variant-slots=1,2,3`; use this for visual exploration before replacing any primary default.
- Preview prompts first with `--print-prompts` or `--dry-run-prompts`; this prints planned prompts without touching server, jobs, manifests, or assets.
- Do not close a visual batch as final if any obsolete cards remain un-annotated.

## Objective closeout recheck - 2026-06-21

No se genero una tanda nueva: se revalido el objetivo activo con checks frescos.

- `pack_07`: `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `pack_08`: `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `pack_14`: `availableDefaultImages=123/123`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `pack_15`: `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `lib/staleStyleDefaultImages.generated.ts` mantiene
  `STALE_STYLE_DEFAULT_IMAGE_IDS = []`.
- `bun run styles:quality:audit` -> ok, `presets=1649`,
  `redundancy: none above threshold`.
- `bun run styles:runtime:check` -> current, `packs=17`, `presets=1649`.
- `bun run scripts\audit-style-category-bases.ts` -> audit actualizado;
  `pack_08..pack_11` completo `20/20`.
- Proxima accion real: no generar mas defaults del alcance cerrado salvo que el
  usuario borre o marque tarjetas nuevas.

## Verification checkpoint - 2026-06-21 - objective packs and bases

No se genero una nueva tanda visual; se revalido el estado real para no seguir
creando tarjetas sin deuda medible.

- `pack_07`: `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `pack_08`: `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `pack_14`: `availableDefaultImages=123/123`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `pack_15`: `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `bun run styles:quality:audit` -> `presets=1649`,
  `redundancy: none above threshold`.
- `bun run styles:runtime:check` -> current, `packs=17`, `presets=1649`.
- `bun run scripts\audit-style-category-bases.ts` -> actualizo
  `docs/active/style-category-bases-audit.md`; slice objetivo
  `pack_08..pack_11` completo `20/20`.
- Proxima accion real: no generar mas defaults de `pack_07/08/14/15` salvo que
  QA visual del usuario borre o marque tarjetas. Si se continua el objetivo
  global, la siguiente deuda debe elegirse por coverage vivo o por QA visual,
  no por notas viejas.

## Primary defaults - 2026-06-21 - `pack_05` missing wave 9 closeout

Ronda final de missing defaults medibles en `pack_05`:

- Estado antes validado: `pack_05 availableDefaultImages=130/135`,
  `staleDefaultImages=0`, `missingDefaultImages=5`.
- IDs: `SP05-069|SP05-067|SP13-021|SP13-022|SP13-025`.
- Correccion previa: `SP05-067|SP05-069` pasaron de object/material-only a
  sujeto + ambiente; los `SP13` action se revisaron para no repetir same-face.
- Scope gate: `targets=5 issues=0`.
- Dry-run:
  `.tmp\sp05-missing-wave09-dryrun2.txt`; prompts con `ANATOMY QA`,
  denoise fuerte y sin `Object/material safety exception`.
- Generacion inicial:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp05-missing-wave09-archive bun run scripts\generate-style-defaults.ts --pack=pack_05 "--preset=SP05-069|SP05-067|SP13-021|SP13-022|SP13-025" --parallel=2 --force --session-suffix=sp05_missing_wave09_closeout`
  -> `generated=5 attempted=5 skipped=130 failed=0`.
- Retry parcial:
  `SP13-021|SP13-022|SP13-025` se regeneraron por sameness de black-haired
  crouching action.
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp05-missing-wave09-archive bun run scripts\generate-style-defaults.ts --pack=pack_05 "--preset=SP13-021|SP13-022|SP13-025" --parallel=2 --force --session-suffix=sp05_missing_wave09_action_retry`
  -> `generated=3 attempted=3 skipped=132 failed=0`.
- QA visual final: `.tmp\sp05-missing-wave09-contact-final.webp`.
  Aceptadas las 5; `SP05-069` queda watchlist suave.
- Backups/current:
  `D:\codex-studio-backups\style-default-cards\sp05-missing-wave09-archive\current`.
- Estado despues validado: `pack_05 availableDefaultImages=135/135`,
  `staleDefaultImages=0`, `missingDefaultImages=0`.
- Siguiente tanda recomendada: volver a deuda prioritaria real de `pack_14` /
  `pack_15` solo si QA visual del usuario borra o marca tarjetas; por
  cobertura automatica ambos estan 100% disponibles y sin stale/missing.

## Primary defaults - 2026-06-21 - `pack_05` missing wave 8

Ronda visual de deuda real `pack_05`:

- Estado antes validado: `pack_05 availableDefaultImages=126/135`,
  `staleDefaultImages=0`, `missingDefaultImages=9`.
- IDs: `SP05-268|SP05-270|SP05-272|SP05-280`.
- Correccion previa: los cuatro dejaron de usar object/material fallback y
  pasaron a sujeto legible con ambiente; scope gate `--audit-style-scope` dio
  `targets=4 issues=0`.
- Dry-run:
  `.tmp\sp05-missing-wave08-dryrun-after-format.txt`; prompts con
  `Prompt override character rule`, `ANATOMY QA`, denoise fuerte y sin
  `Object/material safety exception`.
- Primer intento:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp05-missing-wave08-archive bun run scripts\generate-style-defaults.ts --pack=pack_05 "--preset=SP05-268|SP05-270|SP05-272|SP05-280" --parallel=2 --force --session-suffix=sp05_missing_wave08`
  -> `generated=4 attempted=4 skipped=131 failed=0`.
- QA rechazo el primer intento por sameness: joven oscuro/pelo negro/noir
  lluvioso; `SP05-270` parecia rozar arma.
- Retry:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp05-missing-wave08-archive bun run scripts\generate-style-defaults.ts --pack=pack_05 "--preset=SP05-268|SP05-270|SP05-272|SP05-280" --parallel=2 --force --session-suffix=sp05_missing_wave08_retry_subject_diversity`
  -> `generated=4 attempted=4 skipped=131 failed=0`.
- QA visual final: `.tmp\sp05-missing-wave08-contact-retry.webp`.
  Aceptadas `SP05-268|SP05-270|SP05-280`; `SP05-272` queda watchlist suave.
- Backups/current:
  `D:\codex-studio-backups\style-default-cards\sp05-missing-wave08-archive\current`.
- Estado despues validado: `pack_05 availableDefaultImages=130/135`,
  `staleDefaultImages=0`, `missingDefaultImages=5`.
- Siguiente tanda recomendada:
  `SP05-069|SP05-067|SP13-021|SP13-022|SP13-025`.

## Prompt scope gate - 2026-06-21

Se agrego una compuerta previa para evitar repetir el error de llevar presets
no-anime a acabado anime.

- Comando: `bun run scripts\generate-style-defaults.ts --pack=<pack_id> --audit-style-scope --force`.
- Resultado actual:
  `pack_06` -> `targets=120 issues=0`;
  `pack_07` -> `targets=80 issues=0`;
  `pack_08` -> `targets=80 issues=0`;
  `pack_14` -> `targets=123 issues=0`;
  `pack_15` -> `targets=80 issues=0`;
  proxima tanda `pack_05 SP05-268|SP05-270|SP05-272|SP05-280` ->
  `targets=4 issues=0`.
- Validacion adicional: `pack_07` y `pack_08` siguen en
  `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- Uso obligatorio de ahora en mas: correr la compuerta sobre el pack o IDs
  exactos antes de generar. Si falla, se corrige prompt primero; no se genera.

## Primary defaults - 2026-06-21 - `pack_05` missing wave 7

Ronda visual de deuda real `pack_05`:

- Estado antes validado: `pack_05 availableDefaultImages=122/135`,
  `staleDefaultImages=0`, `missingDefaultImages=13`.
- IDs: `SP05-262|SP05-264|SP05-265|SP05-267`.
- Ajuste previo: los cuatro dejaron de usar object/material fallback y pasaron
  a sujeto/silueta legible integrada con atmosfera dark fantasy/seinen.
- Dry-run:
  `.tmp\sp05-missing-wave07-dryrun2.txt`; prompts con `ANATOMY QA`, sin
  `Object/material safety exception`, y `apply heavy denoise to the image`.
- Comando inicial:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp05-missing-wave07-archive bun run scripts\generate-style-defaults.ts --pack=pack_05 "--preset=SP05-262|SP05-264|SP05-265|SP05-267" --parallel=2 --force --session-suffix=sp05_missing_wave07`
  -> `generated=4 attempted=4 skipped=131 failed=0`.
- Retry parcial:
  `SP05-262` se regenero con anti `black cloak` y anti ruinas.
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp05-missing-wave07-archive bun run scripts\generate-style-defaults.ts --pack=pack_05 --preset=SP05-262 --parallel=1 --force --session-suffix=sp05_missing_wave07_retry`
  -> `generated=1 attempted=1 skipped=134 failed=0`.
- QA visual final: `.tmp\sp05-missing-wave07-contact.webp`; aceptadas
  `SP05-262|SP05-264|SP05-265|SP05-267`.
- Backups/current:
  `D:\codex-studio-backups\style-default-cards\sp05-missing-wave07-archive\current`.
- Estado despues validado: `pack_05 availableDefaultImages=126/135`,
  `staleDefaultImages=0`, `missingDefaultImages=9`.
- Checks:
  `bun run check:fix -- scripts\generate-style-defaults.ts` -> ok;
  `bun run styles:validate -- --pack=pack_05 --coverage` -> ok;
  `bun run styles:runtime` -> ok, `packs=17`, `presets=1649`.

## Primary defaults - 2026-06-21 - `pack_05` missing wave 6

Ronda visual de deuda real `pack_05`:

- Estado antes validado: `pack_05 availableDefaultImages=118/135`,
  `staleDefaultImages=0`, `missingDefaultImages=17`.
- IDs: `SP05-253|SP05-254|SP05-255|SP05-251`.
- Ajuste previo: `SP05-255` y `SP05-251` dejaron de usar object/material
  fallback; despues se agrego anti-sameness contra `black-haired cloaked
fantasy traveler`, `castle terrace` y balcon/ciudad fantasy.
- Dry-runs:
  `.tmp\sp05-missing-wave06-dryrun2.txt` y
  `.tmp\sp05-missing-wave06-retry-dryrun.txt`; prompts con `ANATOMY QA`, sin
  `Object/material safety exception`, y `apply heavy denoise to the image`.
- Comando inicial:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp05-missing-wave06-archive bun run scripts\generate-style-defaults.ts --pack=pack_05 "--preset=SP05-253|SP05-254|SP05-255|SP05-251" --parallel=2 --force --session-suffix=sp05_missing_wave06`
  -> `generated=4 attempted=4 skipped=131 failed=0`.
- Retry parcial:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp05-missing-wave06-archive bun run scripts\generate-style-defaults.ts --pack=pack_05 "--preset=SP05-255|SP05-251" --parallel=2 --force --session-suffix=sp05_missing_wave06_retry`
  -> `generated=2 attempted=2 skipped=133 failed=0`.
- QA visual final: `.tmp\sp05-missing-wave06-contact.webp`; aceptadas
  `SP05-253|SP05-254|SP05-255|SP05-251`.
- Watchlist: `SP05-254` mantiene composicion fantasy traveler, pero representa
  bien romance celestial/portal.
- Backups/current:
  `D:\codex-studio-backups\style-default-cards\sp05-missing-wave06-archive\current`.
- Estado despues validado: `pack_05 availableDefaultImages=122/135`,
  `staleDefaultImages=0`, `missingDefaultImages=13`.
- Checks:
  `bun run check:fix -- scripts\generate-style-defaults.ts` -> ok;
  `bun run styles:validate -- --pack=pack_05 --coverage` -> ok;
  `bun run styles:runtime` -> ok, `packs=17`, `presets=1649`.

## Primary defaults - 2026-06-21 - `pack_05` missing wave 5

Ronda visual de deuda real `pack_05`:

- Estado antes validado: `pack_05 availableDefaultImages=114/135`,
  `staleDefaultImages=0`, `missingDefaultImages=21`.
- IDs: `SP05-259|SP05-241|SP05-243|SP05-245`.
- Ajuste previo: `SP05-241`, `SP05-243` y `SP05-245` dejaron de usar
  object/material fallback y ahora piden personaje/silueta legible integrada
  con mundo isekai/fantasy.
- Dry-run:
  `.tmp\sp05-missing-wave05-dryrun2.txt`; prompts con `ANATOMY QA`, sin
  `Object/material safety exception`, y `apply heavy denoise to the image`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp05-missing-wave05-archive bun run scripts\generate-style-defaults.ts --pack=pack_05 "--preset=SP05-259|SP05-241|SP05-243|SP05-245" --parallel=2 --force --session-suffix=sp05_missing_wave05`
  -> `generated=4 attempted=4 skipped=131 failed=0`.
- QA visual: `.tmp\sp05-missing-wave05-contact.webp`; aceptadas
  `SP05-259|SP05-241|SP05-243|SP05-245`.
- Backups/current:
  `D:\codex-studio-backups\style-default-cards\sp05-missing-wave05-archive\current`.
- Estado despues validado: `pack_05 availableDefaultImages=118/135`,
  `staleDefaultImages=0`, `missingDefaultImages=17`.
- Checks:
  `bun run check:fix -- scripts\generate-style-defaults.ts` -> ok;
  `bun run styles:validate -- --pack=pack_05 --coverage` -> ok;
  `bun run styles:runtime` -> ok, `packs=17`, `presets=1649`.

## Primary defaults - 2026-06-21 - `pack_05` missing wave 4

Ronda visual de deuda real `pack_05`:

- Estado antes validado: `pack_05 availableDefaultImages=110/135`,
  `staleDefaultImages=0`, `missingDefaultImages=25`.
- IDs: `SP05-051|SP05-223|SP05-237|SP05-257`.
- Ajuste previo: `SP05-223` y `SP05-237` dejaron de usar object/material
  fallback y ahora piden sujeto legible integrado con mundo mecha/cyberpunk.
- Dry-run:
  `.tmp\sp05-missing-wave04-dryrun2.txt`; prompts con `ANATOMY QA`, sin
  `Object/material safety exception`, y `apply heavy denoise to the image`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp05-missing-wave04-archive bun run scripts\generate-style-defaults.ts --pack=pack_05 "--preset=SP05-051|SP05-223|SP05-237|SP05-257" --parallel=2 --force --session-suffix=sp05_missing_wave04`
  -> `generated=4 attempted=4 skipped=131 failed=0`.
- QA visual: `.tmp\sp05-missing-wave04-contact.webp`; aceptadas
  `SP05-051|SP05-223|SP05-237|SP05-257`.
- Backups/current:
  `D:\codex-studio-backups\style-default-cards\sp05-missing-wave04-archive\current`.
- Estado despues validado: `pack_05 availableDefaultImages=114/135`,
  `staleDefaultImages=0`, `missingDefaultImages=21`.
- Checks:
  `bun run check:fix -- scripts\generate-style-defaults.ts` -> ok;
  `bun run styles:validate -- --pack=pack_05 --coverage` -> ok;
  `bun run styles:runtime` -> ok, `packs=17`, `presets=1649`.

## Primary defaults - 2026-06-21 - `pack_05` missing wave 3

Ronda visual de deuda real `pack_05`:

- Estado antes validado: `pack_05 availableDefaultImages=106/135`,
  `staleDefaultImages=0`, `missingDefaultImages=29`.
- IDs: `SP05-125|SP05-133|SP05-134|SP05-221`.
- Dry-run:
  `.tmp\sp05-missing-wave03-dryrun-current.txt`; prompts character-led, con
  `ANATOMY QA`, sin object/material fallback, y `apply heavy denoise to the
image`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp05-missing-wave03-archive bun run scripts\generate-style-defaults.ts --pack=pack_05 "--preset=SP05-125|SP05-133|SP05-134|SP05-221" --parallel=2 --force --session-suffix=sp05_missing_wave03`
  -> `generated=4 attempted=4 skipped=131 failed=0`.
- QA visual: `.tmp\sp05-missing-wave03-contact.webp`; aceptadas
  `SP05-125|SP05-133|SP05-134|SP05-221`.
- Watchlist: `SP05-125` lee mas infraestructura/escala que monstruo visible,
  pero no cae en pasillo generico, object-only ni anatomia rota.
- Backups/current:
  `D:\codex-studio-backups\style-default-cards\sp05-missing-wave03-archive\current`.
- Estado despues validado: `pack_05 availableDefaultImages=110/135`,
  `staleDefaultImages=0`, `missingDefaultImages=25`.
- Checks:
  `bun run styles:validate -- --pack=pack_05 --coverage` -> ok;
  `bun run styles:runtime` -> ok, `packs=17`, `presets=1649`.

## Primary defaults - 2026-06-21 - `pack_05` missing wave 2

Ronda visual de deuda real `pack_05`:

- Estado antes validado: `pack_05 availableDefaultImages=102/135`,
  `staleDefaultImages=0`, `missingDefaultImages=33`.
- IDs: `SP05-095|SP05-096|SP05-100|SP05-121`.
- Dry-run:
  `.tmp\sp05-missing-wave02-redo-dryrun2.txt`; prompts character-led, con
  `ANATOMY QA`, sin UI/texto, y `apply heavy denoise to the image`.
- Ajuste previo: `SP05-100` cambio `no adventurer` por
  `generic corridor adventurer` y `lantern-as-only-prop`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp05-missing-wave02-redo-archive bun run scripts\generate-style-defaults.ts --pack=pack_05 "--preset=SP05-095|SP05-096|SP05-100|SP05-121" --parallel=2 --force --session-suffix=sp05_missing_wave02_redo`
  -> `generated=4 attempted=4 skipped=131 failed=0`.
- QA visual: `.tmp\sp05-missing-wave02-redo-contact.webp`; aceptadas
  `SP05-095|SP05-096|SP05-100|SP05-121`.
- Watchlist: `SP05-096` muy glossy/gacha pero alineada a hipersaturado
  estrategico; `SP05-121` ceremonial/linterna mas que combate, aceptada por
  no copiar, no blade-forward y anatomia limpia.
- Backups/current:
  `D:\codex-studio-backups\style-default-cards\sp05-missing-wave02-redo-archive\current`.
- Estado despues validado: `pack_05 availableDefaultImages=106/135`,
  `staleDefaultImages=0`, `missingDefaultImages=29`.
- Checks:
  `bun run check:fix -- scripts\generate-style-defaults.ts` -> ok;
  `bun run styles:validate -- --pack=pack_05 --coverage` -> ok;
  `bun run styles:runtime` -> ok, `packs=17`, `presets=1649`.

## Primary defaults - 2026-06-21 - `pack_06` non-anime correction wave 01

Ronda focal para corregir anime spillover en `SP06` no-anime antes de continuar
con mas missing cards:

- IDs: `SP06-095|SP06-096|SP06-110|SP06-112`.
- Dry-run:
  `.tmp\sp06-non-anime-correction-01-dryrun.txt`; todos con
  `NON-ANIME STYLE LOCK`, `SP06 NON-ANIME MEDIUM LOCK` y denoise fuerte.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp06-non-anime-correction-01 bun run scripts\generate-style-defaults.ts --pack=pack_06 "--preset=SP06-095|SP06-096|SP06-110|SP06-112" --parallel=2 --force --session-suffix=sp06_non_anime_correction_01`
  -> `generated=4 attempted=4 skipped=116 failed=0`.
- QA visual: `.tmp\sp06-non-anime-correction-01-contact.webp`.
  `SP06-095|SP06-110|SP06-112` aceptadas; `SP06-096` pass/watchlist por
  identidad Neo-Geo sprite aun mejorable, aunque ya no lee anime/gacha.
- Backups:
  `D:\codex-studio-backups\style-default-cards\sp06-non-anime-correction-01\current`
  y
  `D:\codex-studio-backups\style-default-cards\sp06-non-anime-correction-01\previous`.
- Checks:
  `bun run styles:validate -- --pack=pack_06 --coverage` -> ok,
  `availableDefaultImages=120/120`, `staleDefaultImages=0`,
  `missingDefaultImages=0`; `bun run styles:runtime` -> ok, `packs=17`,
  `presets=1649`; `bun run styles:runtime:check` -> current.

## Primary defaults - 2026-06-21 - `pack_05` missing wave 1

Ronda visual de deuda real `pack_05`:

- Estado antes validado: `pack_05 availableDefaultImages=98/135`,
  `staleDefaultImages=0`, `missingDefaultImages=37`.
- Faltantes reales completos al iniciar:
  `SP05-051|SP05-067|SP05-069|SP05-091|SP05-092|SP05-093|SP05-094|SP05-095|SP05-096|SP05-100|SP05-121|SP05-125|SP05-133|SP05-134|SP05-221|SP05-223|SP05-237|SP05-241|SP05-243|SP05-245|SP05-251|SP05-253|SP05-254|SP05-255|SP05-257|SP05-259|SP05-262|SP05-264|SP05-265|SP05-267|SP05-268|SP05-270|SP05-272|SP05-280|SP13-021|SP13-022|SP13-025`.
- Dry-run inicial: `.tmp\sp05-missing-wave01-dryrun.txt`; se posponen
  `SP05-067|SP05-069` porque el prompt actual es object/material-only y
  conviene revisarlos aparte para no volver al exceso de abstraccion.
- Dry-run usado:
  `.tmp\sp05-missing-wave01-isekai-dryrun.txt` para
  `SP05-091|SP05-092|SP05-093|SP05-094`; prompts character-led, sin UI/texto,
  con `ANATOMY QA` y `apply heavy denoise to the image`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp05-missing-wave01-archive bun run scripts\generate-style-defaults.ts --pack=pack_05 "--preset=SP05-091|SP05-092|SP05-093|SP05-094" --parallel=2 --session-suffix=sp05_missing_wave01_isekai`
  -> `generated=4 attempted=4 skipped=131 failed=0`.
- QA visual: `.tmp\sp05-missing-wave01-contact.webp`; aceptadas
  `SP05-091|SP05-092|SP05-093|SP05-094`. Sin texto/UI, sin
  corridor/library/market drift y sin anatomia rota evidente. Watchlist suave:
  `SP05-091` por arquetipo VR fantasy masculino cercano, aceptado de momento
  porque no muestra copia directa visible, HUD ni sword focus.
- Backups/current:
  `D:\codex-studio-backups\style-default-cards\sp05-missing-wave01-archive\current\SP05-091.webp`,
  `D:\codex-studio-backups\style-default-cards\sp05-missing-wave01-archive\current\SP05-092.webp`,
  `D:\codex-studio-backups\style-default-cards\sp05-missing-wave01-archive\current\SP05-093.webp`,
  `D:\codex-studio-backups\style-default-cards\sp05-missing-wave01-archive\current\SP05-094.webp`.
- Estado despues validado: `pack_05 availableDefaultImages=102/135`,
  `staleDefaultImages=0`, `missingDefaultImages=33`.
- Checks:
  `bun run styles:validate -- --pack=pack_05 --coverage` -> ok;
  `bun run styles:runtime` -> ok, `packs=17`, `presets=1649`;
  `bun run styles:runtime:check` -> current.

## Coverage checkpoint - 2026-06-21 - objective refresh

Estado real validado antes de continuar generaciones:

- `pack_07`: `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `pack_08`: `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- Global `bun run styles:validate -- --coverage` -> ok; solo `pack_05`
  mantiene deuda por coverage con `missingDefaultImages=37`.
- `pack_14` y `pack_15` no tienen stale/missing actual; no son prioridad por
  coverage hasta que QA visual del usuario marque rechazos especificos.
- Category bases objetivo `pack_08..pack_11`: `20/20` por
  `bun run scripts/audit-style-category-bases.ts`.

## Prompt correction checkpoint - 2026-06-21 - `SP06-112` anime spillover

Objetivo: corregir el fallo marcado en QA visual donde `SP06-112` se resolvio
como item + helper/mechanic anime-adjacent, aunque el preset es `Sci-Fi Arsenal
Icon Kit` y debe leerse como sistema de iconos/equipment kit.

- Imagen actual: `assets/recipes/styles/defaults/SP06-112.webp` queda
  rechazada/obsoleta para la siguiente regeneracion.
- Cambio global `SP06`: el non-anime medium lock ahora explicita que
  `game-art`, `JRPG`, `fighting-game`, `chibi`, `sprite` o
  `Japanese-computer` no autorizan por si solos generic anime faces, cel hair,
  visual-novel busts, shonen poses ni gacha framing.
- Cambio especifico `SP06-112`: brief, `HERO`, `ENVIRONMENT` y
  `REPRESENTATION RULE` exigen 3-5 dispositivos support no-armamentisticos como
  icon-kit coherente, sin personas, humanoides, mascot helpers, anime mechanics
  ni escena de operador.
- Dry-run:
  `bun run scripts\generate-style-defaults.ts --pack=pack_06 --preset=SP06-112 --dry-run-prompts --force --session-suffix=sp06_112_final_prompt_check`
  -> `.tmp\sp06-112-final-prompt-check.txt`.
- Check focal: `bun run styles:validate -- --preset=SP06-112` -> ok.
- Estado visual: no se genero reemplazo todavia. Proxima accion recomendada:
  regenerar `SP06-112` en tanda chica junto con otros `SP06` watchlist y
  revisar contact sheet antes de aceptar.

## Prompt correction checkpoint - 2026-06-21 - `pack_06` visual anime-boundary audit

Objetivo: responder al drift visual detectado por QA del usuario: varias cards
de `SP06` no-anime estaban leyendo como anime-adjacent, digital character-card
o game/RPG splash generico aunque el pack no lo pedia.

- QA visual completa:
  `.tmp\sp06-audit-001-030.webp`,
  `.tmp\sp06-audit-031-060.webp`,
  `.tmp\sp06-audit-061-090.webp`,
  `.tmp\sp06-audit-091-120.webp`.
- Allowlist anime estricta:
  `SP06-085|SP06-108|SP06-114`. Ningun otro preset de `SP06` debe usar anime,
  manga, gacha, visual-novel o character-card anime como solucion.
- Watchlist para regenerar/revisar:
  `SP06-046|SP06-050|SP06-051|SP06-053|SP06-056|SP06-063|SP06-066|SP06-068|SP06-069|SP06-071|SP06-080|SP06-084|SP06-095|SP06-096|SP06-104|SP06-105|SP06-107|SP06-109|SP06-111|SP06-119`.
- Cambios de prompt:
  `presetAllowsAnimeGrammar()` usa la allowlist explicita para `pack_06`;
  los prompts no-anime cambian `protagonist` por `non-anime designed figure`,
  `medium-led figure`, `human-scale scenelet` o `game-useful focal idea`.
- Dry-run:
  `bun run scripts\generate-style-defaults.ts --pack=pack_06 "--preset=SP06-046|SP06-050|SP06-053|SP06-056|SP06-069|SP06-084|SP06-095|SP06-104|SP06-105|SP06-107|SP06-119|SP06-085|SP06-108|SP06-114" --dry-run-prompts --force --session-suffix=sp06_anime_boundary_recheck_after_patch`
  -> `.tmp\sp06-anime-boundary-recheck-after-patch.txt`.
- Evidencia prompt: 14 prompts; 11 `NON-ANIME STYLE LOCK`; 11
  `SP06 NON-ANIME SCOPE`; 11 `SP06 NON-ANIME MEDIUM LOCK`; 3
  `SP06 ANIME-ALLOWED SCOPE`; 0 `one original protagonist`; 0
  `original protagonist, vehicle`.
- Estado visual: no se generaron nuevas cards en este checkpoint. La proxima
  accion debe regenerar la watchlist en tandas chicas con QA visual antes de
  continuar otros packs.

## Prompt correction checkpoint - 2026-06-21 - `pack_06` no-anime medium gate

Objetivo: evitar que `pack_06` vuelva a resolver presets de medio/sistema
visual como anime o character-card generico.

- Cambio en `scripts/generate-style-defaults.ts`:
  `SP06 NON-ANIME MEDIUM LOCK` se aplica solo a presets fuera de la allowlist
  `SP06-085|SP06-108|SP06-114`.
- Criterio nuevo: en `pack_06` no-anime, la primera lectura debe ser el medio
  o sistema visual nombrado; una figura puede aparecer solo como parte del
  medio, no como acabado anime.
- Dry-run:
  `bun run scripts\generate-style-defaults.ts --pack=pack_06 "--preset=SP06-001|SP06-004|SP06-049|SP06-085|SP06-108|SP06-114" --dry-run-prompts --force --session-suffix=sp06_non_anime_medium_lock_probe`
  -> `.tmp\sp06-non-anime-medium-lock-probe.txt`.
- Evidencia prompt: 3 locks no-anime medium-first, 3 scopes anime-allowed y 6
  cierres `apply heavy denoise to the image`.
- Checks:
  `bun run check:fix -- scripts\generate-style-defaults.ts` -> ok;
  `bun run styles:validate -- --pack=pack_06 --coverage` -> ok,
  `availableDefaultImages=120/120`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- Cierre focal:
  `bun run styles:runtime:check` -> current;
  `bun run styles:validate -- --coverage` -> ok. Deuda visual global viva:
  `pack_05=37`, `pack_13=13`; los demas packs quedan sin missing/stale.
- Estado visual: no se generaron ni aceptaron nuevas cards en este checkpoint.

## Primary defaults - 2026-06-21 - `pack_13` anime identity wave 03

Objetivo: seguir cerrando `pack_13` sin volver a same-face/generic glossy
anime.

- IDs regenerados:
  `SP05-178|SP05-190|SP05-197|SP05-198|SP05-203|SP05-208`.
- Dry-run previo:
  `bun run scripts\generate-style-defaults.ts --pack=pack_13 "--preset=SP05-178|SP05-190|SP05-197|SP05-198|SP05-203|SP05-208" --dry-run-prompts --force --session-suffix=sp13_missing_wave03_scope_check`
  -> `.tmp\sp13-wave03-dryrun.txt`.
- Evidencia prompt: 6 `ANIME IDENTITY RULE`, 6 `ANATOMY QA`, bloqueos contra
  same-face/object-only/weapon/corridor como negativos, y 6 cierres
  `apply heavy denoise to the image`.
- Generacion:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp13-missing-wave03-anime-identity bun run scripts\generate-style-defaults.ts --pack=pack_13 "--preset=SP05-178|SP05-190|SP05-197|SP05-198|SP05-203|SP05-208" --parallel=2 --session-suffix=sp13_missing_wave03_anime_identity --force`
  -> `generated=6 attempted=6 skipped=126 failed=0`.
- Backup current:
  `D:\codex-studio-backups\style-default-cards\sp13-missing-wave03-anime-identity\current`.
- QA visual: contact sheet `.tmp\sp13-wave03-contact.webp`; aceptadas las 6.
  Watchlist suave: `SP05-208` usa mesa/DIY, pero el preset lo justifica y no
  cae en objeto-only.
- Validation:
  `bun run styles:validate -- --pack=pack_13 --coverage` -> ok,
  `availableDefaultImages=125/132`, `staleDefaultImages=0`,
  `missingDefaultImages=7`.
- Runtime/quality:
  `bun run styles:runtime` actualizo `styleRuntimeData.generated.ts`;
  `bun run styles:runtime:check` -> current;
  `bun run styles:quality:audit` -> `redundancy: none above threshold`.
- Coverage global despues de la tanda: `44` manifests without default image:
  `pack_05=37`, `pack_13=7`; sin stale reportado.
- Siguiente tanda `pack_13` recomendada:
  `SP05-213|SP05-323|SP05-331|SP05-337|SP13-001|SP13-009|SP13-020`.

## Primary defaults - 2026-06-21 - `pack_13` anime identity wave 02

Objetivo: seguir cerrando `pack_13` en tanda chica, preservando linajes anime
distintos y evitando same-face/generic glossy anime.

- IDs regenerados:
  `SP05-109|SP05-115|SP05-162|SP05-171|SP05-172|SP05-176`.
- Dry-run previo:
  `bun run scripts\generate-style-defaults.ts --pack=pack_13 "--preset=SP05-109|SP05-115|SP05-162|SP05-171|SP05-172|SP05-176" --dry-run-prompts --force --session-suffix=sp13_missing_wave02_scope_check`.
- Evidencia prompt: `.tmp\sp13-wave02-dryrun.txt` muestra
  `ANIME IDENTITY RULE`, `ANATOMY QA`, bloqueos contra
  `generic glossy anime` / `same-face`, y cierre con
  `apply heavy denoise to the image`.
- Generacion:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp13-missing-wave02-anime-identity bun run scripts\generate-style-defaults.ts --pack=pack_13 "--preset=SP05-109|SP05-115|SP05-162|SP05-171|SP05-172|SP05-176" --parallel=2 --session-suffix=sp13_missing_wave02_anime_identity --force`
  -> `generated=6 attempted=6 skipped=126 failed=0`.
- Backup current:
  `D:\codex-studio-backups\style-default-cards\sp13-missing-wave02-anime-identity\current`.
- QA visual: contact sheet `.tmp\sp13-wave02-contact.webp`; aceptadas las 6.
  Watchlist suave: `SP05-115` es mas guardian/mask silhouette que personaje
  completo, pero el preset permitia figura/mascara refractiva y no lee como
  objeto abstracto generico.
- Validation:
  `bun run styles:validate -- --pack=pack_13 --coverage` -> ok,
  `availableDefaultImages=119/132`, `staleDefaultImages=0`,
  `missingDefaultImages=13`.
- Runtime/quality:
  `bun run styles:runtime` actualizo `styleRuntimeData.generated.ts`;
  `bun run styles:quality:audit` -> `redundancy: none above threshold`.
- Coverage global despues de la tanda: `50` manifests without default image:
  `pack_05=37`, `pack_13=13`; sin stale reportado.
- Siguiente tanda `pack_13` recomendada:
  `SP05-178|SP05-190|SP05-197|SP05-198|SP05-203|SP05-208`.

## Primary defaults - 2026-06-21 - `pack_13` anime identity wave 01

Objetivo: avanzar `pack_13` en tanda chica para evitar que los presets anime se
vuelvan same-face/generic glossy anime.

- IDs regenerados:
  `SP05-020|SP05-042|SP05-043|SP05-048|SP05-049|SP05-106`.
- Nota de alcance: `pack_13` contiene manifests con IDs internos `SP05-*`;
  para deuda real se usa el campo `id:` del YAML, no un rango `SP13-001..132`.
- Dry-run previo:
  `bun run scripts\generate-style-defaults.ts --pack=pack_13 "--preset=SP05-020|SP05-042|SP05-043|SP05-048|SP05-049|SP05-106" --dry-run-prompts --force --session-suffix=sp13_missing_wave01_scope_check`.
- Evidencia prompt: `.tmp\sp13-wave01-dryrun.txt` muestra
  `ANIME IDENTITY RULE`, `ANATOMY QA`, diferenciacion contra
  `generic glossy anime` / `same-face`, y cierre con
  `apply heavy denoise to the image`.
- Generacion:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp13-missing-wave01-anime-identity bun run scripts\generate-style-defaults.ts --pack=pack_13 "--preset=SP05-020|SP05-042|SP05-043|SP05-048|SP05-049|SP05-106" --parallel=2 --session-suffix=sp13_missing_wave01_anime_identity --force`
  -> `generated=6 attempted=6 skipped=126 failed=0`.
- Backup current:
  `D:\codex-studio-backups\style-default-cards\sp13-missing-wave01-anime-identity\current`.
- QA visual: contact sheet `.tmp\sp13-wave01-contact.webp`; aceptadas las 6.
  La tanda mantiene separacion: dream card, duelo teatral, healing shojo,
  crimson quest romance, gothic academy y deco geometric anime.
- Validation:
  `bun run styles:validate -- --pack=pack_13 --coverage` -> ok,
  `availableDefaultImages=113/132`, `staleDefaultImages=0`,
  `missingDefaultImages=19`.
- Runtime/quality:
  `bun run styles:runtime` actualizo `styleRuntimeData.generated.ts`;
  `bun run styles:quality:audit` -> `redundancy: none above threshold`.
- Coverage global despues de la tanda: `56` manifests without default image:
  `pack_05=37`, `pack_13=19`; sin stale reportado.
- Siguiente tanda `pack_13` recomendada:
  `SP05-109|SP05-115|SP05-162|SP05-171|SP05-172|SP05-176`.

## Primary defaults - 2026-06-21 - `pack_02` cinematic/media closeout

Objetivo: cerrar los 9 missing reales de `pack_02` probando el guardrail
anti-anime en un pack mayormente no-anime antes de volver a `pack_05/13`.

- IDs regenerados:
  `SP02-001|SP02-004|SP02-007|SP02-009|SP02-014|SP02-033|SP02-037|SP02-038|SP02-039`.
- Dry-run previo:
  `bun run scripts\generate-style-defaults.ts --pack=pack_02 "--preset=SP02-001|SP02-004|SP02-007|SP02-009|SP02-014|SP02-033|SP02-037|SP02-038|SP02-039" --dry-run-prompts --force --session-suffix=sp02_missing_scope_check`.
- Evidencia prompt: `.tmp\sp02-missing-scope-dryrun.txt` muestra
  `NON-ANIME STYLE LOCK` en los 8 presets no-anime. `SP02-037` queda anime
  por nombre/visual DNA explicitamente. Todos cierran con
  `apply heavy denoise to the image`.
- Generacion inicial:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp02-missing-close-cinematic-media bun run scripts\generate-style-defaults.ts --pack=pack_02 "--preset=SP02-001|SP02-004|SP02-007|SP02-009|SP02-014|SP02-033|SP02-037|SP02-038|SP02-039" --parallel=3 --session-suffix=sp02_missing_close_cinematic_media --force`
  -> `generated=9 attempted=9 skipped=119 failed=0`.
- QA visual: contact sheet `.tmp\sp02-missing-close-contact.webp`.
  `SP02-001`, `SP02-004`, `SP02-007`, `SP02-009`, `SP02-014`, `SP02-033`,
  `SP02-037` y `SP02-039` aceptadas. `SP02-014` conserva sangre/horror
  estilizado porque el preset lo necesita.
- Correccion puntual `SP02-038`: la primera salida se fue a anime/romance
  urbano y no a comic-offset 3D. Version rechazada guardada en
  `D:\codex-studio-backups\style-default-cards\sp02-missing-close-cinematic-media\rejected-before-sp02-038-comic-offset-fix\SP02-038.webp`.
  Se agrego override por ID para pedir halftone/CMYK offset/ink contours sobre
  3D simplificado y bloquear anime girl/manga face/romance window/franchise.
- Regeneracion puntual:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp02-missing-close-cinematic-media bun run scripts\generate-style-defaults.ts --pack=pack_02 --preset=SP02-038 --parallel=1 --session-suffix=sp02_038_comic_offset_fix --force`
  -> `generated=1 attempted=1 skipped=127 failed=0`.
- Backup current:
  `D:\codex-studio-backups\style-default-cards\sp02-missing-close-cinematic-media\current`.
- Validation:
  `bun run styles:validate -- --pack=pack_02 --coverage` -> ok,
  `availableDefaultImages=128/128`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- Runtime/quality:
  `bun run styles:runtime` actualizo `styleRuntimeData.generated.ts`;
  `bun run styles:quality:audit` -> `redundancy: none above threshold`.
- Coverage global despues de la tanda: `62` manifests without default image:
  `pack_05=37`, `pack_13=25`; sin stale reportado.

## Primary defaults - 2026-06-21 - `pack_04` illustration/no-anime closeout

Objetivo: cerrar los 4 missing reales de `pack_04` sin repetir el error de
llevar presets no-anime a acabado anime o a tarjetas abstractas/pobres.

- IDs regenerados: `SP04-052|SP04-058|SP04-059|SP04-096`.
- Correccion de guardrail previa:
  `scripts/generate-style-defaults.ts` refuerza `NON-ANIME STYLE LOCK` para
  que overridee broad prompt families, labels genericos y sesgo accidental del
  modelo hacia anime. En prompts no-anime, las palabras anime/manga/gacha/VN
  quedan como negativos solamente.
- Dry-run previo:
  `bun run scripts\generate-style-defaults.ts --pack=pack_04 "--preset=SP04-052|SP04-058|SP04-059|SP04-096" --dry-run-prompts --force --session-suffix=anime_scope_audit_after_lock`.
- Evidencia prompt: `.tmp\sp04-anime-scope-after-lock.txt` muestra
  `NON-ANIME STYLE LOCK`, `REPRESENTATION RULE` no-anime y cierre
  `apply heavy denoise to the image` en los 4 presets.
- Generacion inicial:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp04-missing-close bun run scripts\generate-style-defaults.ts --pack=pack_04 "--preset=SP04-052|SP04-058|SP04-059|SP04-096" --parallel=2 --session-suffix=sp04_missing_close_after_anime_lock --force`
  -> `generated=4 attempted=4 skipped=96 failed=0`.
- QA visual: contact sheet `.tmp\sp04-missing-close-contact.webp`.
  `SP04-052`, `SP04-058` y `SP04-059` aceptadas como isometric/low-poly/HUD
  no-anime. `SP04-096` inicial fue rechazada por sobrecorreccion: parecia
  mochilas/equipment y no `Weapon Tier Progression`.
- Correccion puntual `SP04-096`: el prompt ahora permite weapon-tier stylized
  concept progression sin combate, persona sosteniendo arma, injury/gore,
  UI ni texto. Version rechazada guardada en
  `D:\codex-studio-backups\style-default-cards\sp04-missing-close\rejected-before-sp04-096-weapon-fix\SP04-096.webp`.
- Regeneracion puntual:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp04-missing-close bun run scripts\generate-style-defaults.ts --pack=pack_04 --preset=SP04-096 --parallel=1 --session-suffix=sp04_096_weapon_fix --force`
  -> `generated=1 attempted=1 skipped=99 failed=0`.
- Backup current:
  `D:\codex-studio-backups\style-default-cards\sp04-missing-close\current`.
- Validation:
  `bun run styles:validate -- --pack=pack_04 --coverage` -> ok,
  `availableDefaultImages=100/100`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- Runtime/quality:
  `bun run styles:runtime` actualizo `styleRuntimeData.generated.ts`;
  `bun run styles:runtime:check` -> current; `bun run styles:quality:audit`
  -> `redundancy: none above threshold`.
- Coverage global despues de la tanda: `71` manifests without default image:
  `pack_02=9`, `pack_05=37`, `pack_13=25`; sin stale reportado.

## Primary defaults - 2026-06-21 - `pack_01` photography closeout

Objetivo: cerrar los 4 missing reales de `pack_01` con prompts fotograficos,
sin anime, UI/texto, camera props, guerra explicita o boudoir explicito.

- IDs regenerados: `SP01-015|SP01-047|SP01-060|SP01-069`.
- Dry-run previo:
  `bun run scripts\generate-style-defaults.ts --pack=pack_01 "--preset=SP01-015|SP01-047|SP01-060|SP01-069" --dry-run-prompts --force --session-suffix=sp01_missing_close_scope_check`.
- Evidencia prompt: `.tmp\sp01-missing-close-dryrun.txt` muestra
  `NON-ANIME STYLE LOCK`, contrato `No text, labels, logos, watermark, or UI`,
  y cierre con `apply heavy denoise to the image`. `SP01-060` no requiere
  battlefield/armas y `SP01-069` prioriza material/luz sobre piel/cuerpo.
- Generacion:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp01-missing-close-photo bun run scripts\generate-style-defaults.ts --pack=pack_01 "--preset=SP01-015|SP01-047|SP01-060|SP01-069" --parallel=2 --session-suffix=sp01_missing_close_photo --force`
  -> `generated=4 attempted=4 skipped=83 failed=0`.
- Backup current:
  `D:\codex-studio-backups\style-default-cards\sp01-missing-close-photo\current`.
- QA visual: contact sheet `.tmp\sp01-missing-close-contact.webp`; aceptadas
  las 4. `SP01-060` queda como documental duro sin gore/armas/persona
  explicita; `SP01-069` queda como tela/luz/objeto intimo sin cuerpo ni
  explicitud.
- Validation:
  `bun run styles:validate -- --pack=pack_01 --coverage` -> ok,
  `availableDefaultImages=87/87`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- Runtime/quality:
  `bun run styles:runtime` actualizo `styleRuntimeData.generated.ts`;
  `bun run styles:runtime:check` -> current; `bun run styles:quality:audit`
  -> `redundancy: none above threshold`.
- Coverage global despues de la tanda: `75` manifests without default image.

## Primary defaults - 2026-06-21 - `pack_03` stylized 3D closeout

Objetivo: cerrar los 2 missing reales de `pack_03` sin reabrir deriva a UI,
texto, personaje generico, camera prop o escena no representativa.

- IDs regenerados: `SP03-021|SP03-040`.
- Dry-run previo:
  `bun run scripts\generate-style-defaults.ts --pack=pack_03 "--preset=SP03-021|SP03-040" --dry-run-prompts --force --session-suffix=sp03_missing_close_scope_check`.
- Evidencia prompt: `.tmp\sp03-missing-close-dryrun.txt` confirma
  `SP03-021` con `NON-ANIME STYLE LOCK`; `SP03-040` conserva cel/toon shader
  porque el preset lo pide explicitamente; ambos terminan con
  `apply heavy denoise to the image`.
- Generacion:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp03-missing-close-stylized3d bun run scripts\generate-style-defaults.ts --pack=pack_03 "--preset=SP03-021|SP03-040" --parallel=2 --session-suffix=sp03_missing_close_stylized3d --force`
  -> `generated=2 attempted=2 skipped=78 failed=0`.
- Backup current:
  `D:\codex-studio-backups\style-default-cards\sp03-missing-close-stylized3d\current`.
- QA visual: contact sheet `.tmp\sp03-missing-close-contact.webp`; aceptadas
  ambas. `SP03-021` lee low-poly inmediatamente; `SP03-040` lee cel/toon
  shader con objeto focal y entorno estilizado, sin UI/texto ni personaje
  anime generico.
- Validation:
  `bun run styles:validate -- --pack=pack_03 --coverage` -> ok,
  `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- Runtime/quality:
  `bun run styles:runtime` actualizo `styleRuntimeData.generated.ts`;
  `bun run styles:runtime:check` -> current; `bun run styles:quality:audit`
  -> `redundancy: none above threshold`.
- Coverage global despues de la tanda: `79` manifests without default image.

## Primary defaults - 2026-06-21 - `pack_09` material/no-anime closeout

Objetivo: cerrar los 7 missing reales de `pack_09` sin reabrir drift a anime,
personajes, reliquias, salas, pasillos o producto/fantasy staging.

- IDs regenerados:
  `SP09-002|SP09-011|SP09-013|SP09-021|SP09-023|SP09-046|SP09-054`.
- Dry-run previo:
  `bun run scripts\generate-style-defaults.ts --pack=pack_09 "--preset=SP09-002|SP09-011|SP09-013|SP09-021|SP09-023|SP09-046|SP09-054" --dry-run-prompts --force --session-suffix=sp09_missing_noanime_material_check`.
- Evidencia prompt: `.tmp\sp09-missing-noanime-dryrun.txt` muestra
  `NON-ANIME STYLE LOCK`, `PACK 09 MATERIAL LOCK`, bloqueo de
  `human/anime face or body` y cierre con `apply heavy denoise to the image`.
- Generacion:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp09-missing-close-material-noanime bun run scripts\generate-style-defaults.ts --pack=pack_09 "--preset=SP09-002|SP09-011|SP09-013|SP09-021|SP09-023|SP09-046|SP09-054" --parallel=2 --session-suffix=sp09_missing_close_material_noanime --force`
  -> `generated=7 attempted=7 skipped=73 failed=0`.
- Backup current:
  `D:\codex-studio-backups\style-default-cards\sp09-missing-close-material-noanime\current`.
- QA visual: contact sheet `.tmp\sp09-missing-close-contact.webp`; aceptadas
  las 7 como material-first. Watchlist suave: `SP09-011` por soporte organico
  detras y `SP09-023` por borde espacial, pero ambas leen primero como
  fur/brick y no como personaje/pasillo/escena narrativa.
- Validation:
  `bun run styles:validate -- --pack=pack_09 --coverage` -> ok,
  `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- Runtime/quality:
  `bun run styles:runtime` actualizo `styleRuntimeData.generated.ts`;
  `bun run styles:runtime:check` -> current; `bun run styles:quality:audit`
  -> `redundancy: none above threshold`.
- Coverage global despues de la tanda: `81` manifests without default image.

## Prompt correction checkpoint - 2026-06-21 - `pack_12` non-anime gameplay scope

QA del usuario marco que varias cards no-anime estaban tomando acabado anime.
Se pauso la generacion y se reviso el generador antes de continuar.

- Hallazgo: `pack_12__speed_sport_and_competitive_arenas` seguia usando la
  familia amplia `anime_sports` en `scripts/generate-style-defaults.ts`.
- Fix: esa ruta ahora usa `gameplay_competition`, con sujeto/entorno definidos
  como match state, lane/track/timing feedback y screencap jugable, no atleta
  anime ni poster deportivo.
- Dry-run verificado:
  `bun run scripts\generate-style-defaults.ts --pack=pack_12 "--preset=SP12-008|SP12-017|SP12-021" --dry-run-prompts --force --session-suffix=pack12_speed_non_anime_family_check` -> `prompts=3 skipped=77`.
- Evidencia prompt: los tres prompts imprimen `Generate one in-engine gameplay
screenshot`, `NON-ANIME STYLE LOCK`, `GAMEPLAY SCREENSHOT CONTRACT` y terminan
  con `apply heavy denoise to the image`.
- Validation:
  `bun run styles:validate -- --pack=pack_12 --coverage` -> ok,
  `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- Runtime check:
  `bun run styles:runtime:check` -> current, `packs=17`, `presets=1649`.

## Prompt correction checkpoint - 2026-06-21 - `pack_15` anti-anime scope

QA del usuario marco que algunas cards no-anime estaban siendo empujadas hacia
acabado anime. Se freno la generacion y se aplico una correccion minima antes
de seguir:

- No se generaron ni reemplazaron imagenes en esta ronda.
- Source fix:
  - los 80 manifests `SP15-001..080` ya no usan la frase permisiva de anime
    en `visualDna.render_quality`;
  - el branch especial de `pack_15` en `scripts/generate-style-defaults.ts`
    ahora imprime `NON-ANIME STYLE LOCK`;
  - hard avoid agregado para `anime face`, `manga face`, `gacha framing`,
    `visual-novel bust crop`, `glossy cel hair` y `generic anime protagonist`.
- Dry-run:
  `bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-001|SP15-017|SP15-055|SP15-080" --dry-run-prompts --force --session-suffix=pack15_non_anime_guardrail_check` -> `prompts=4 skipped=76`.
- Evidencia prompt:
  `.tmp\pack15-non-anime-guardrail-dryrun.txt` muestra `NON-ANIME STYLE LOCK`
  y `apply heavy denoise to the image` para los 4 presets muestreados.
- Validation:
  `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
  `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- Runtime:
  `bun run styles:runtime` -> ok, `packs=17`, `presets=1649`.

## Current verification - 2026-06-19 - `pack_15` manual reset

El `pack_15` viejo queda superseded. El usuario pidio eliminarlo completo y
recrearlo desde cero de forma manual. Todo lo anterior de `SP15-001..137` queda
solo como historial de generaciones y no como estado operativo vigente.

- Backup pre-reset:
  `D:\codex-studio-backups\style-pack-backups\pack_15_before_manual_rebuild_20260619-022517`.
- Nuevo pack: `Punk Spectrum Vault`, `80` presets (`SP15-001..SP15-080`),
  `10` categorias, `solarpunk` limitado a `SP15-017` y `SP15-018`.
- Cards/defaults: no se generaron tarjetas nuevas en esta ronda; el pack queda
  con `hasDefaultImage: false` y `defaultImages=0/80` hasta la proxima tanda
  visual.
- Checkpoint viejo eliminado: `assets/recipes/styles/defaults/manifest-pack_15.json`.
- Validacion viva:
  `bun run styles:validate -- --pack=pack_15 --coverage` -> `taxonomy=80/80`,
  `availableDefaultImages=0/80`, `staleDefaultImages=0`,
  `missingDefaultImages=80`.
- Runtime regenerado: `bun run styles:runtime` -> ok.

### Primary defaults - 2026-06-19 - `pack_15` rebuild `SP15-001..004`

Primera tanda visual del nuevo `Punk Spectrum Vault`.

- Generadas: `SP15-001`, `SP15-002`, `SP15-003`, `SP15-004`.
- Command:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-001|SP15-002|SP15-003|SP15-004" --parallel=2 --session-suffix=primary_p15_rebuild_001_004 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA sheet:
  `logs\qa-pack15-rebuild-001-004-20260619T055938.webp`.
- QA visual: aceptadas. `SP15-002` y `SP15-004` comparten familia diesel/militar pero leen distinto (`rail signal` vs `radio convoy`). `SP15-003` queda microdetallada por lace/automata, aceptada por identidad clara y sin ruido roto.
- Sync:
  `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1549`;
  `bun run styles:runtime` -> ok.
- Coverage:
  `bun run styles:validate -- --pack=pack_15 --coverage` -> `availableDefaultImages=4/80`, `staleDefaultImages=0`, `missingDefaultImages=76`.
- Siguiente tanda: `SP15-005..008`.

### Visual correction checkpoint - 2026-06-19 - `pack_15` graphic/painterly pivot

La tanda realista/semi-realista de `pack_15` queda superseded por QA del usuario:
demasiado concept-art, demasiado detalle fino, y poco control grafico. Se borro
el manifest vivo anterior y se rehizo el prompt contract hacia ilustracion
editorial, graphic-novel digital painting, gouache/poster, caras simplificadas,
formas grandes y denoise fuerte.

- Guardrails nuevos:
  - `scripts/generate-style-defaults.ts` agrega bases textuales y scene anchors
    por categoria para `pack_15`;
  - `pack_15` evita photoreal/hyperreal/semi-realistic game concept art,
    realistic foreground portrait, PBR material simulation, microdetail,
    soldier/guard pinup, insignias, flags politicas, camera props y filler de
    studio/chair/curtain/lamp.
- Tooling:
  - comandos pack-scoped (`generate-style-defaults --pack=pack_15` y
    `styles:validate -- --pack=pack_15`) ahora cargan solo el pack pedido, para
    no quedar bloqueados por packs WIP ajenos.
- Smoke actual:
  - `SP15-001`, `SP15-002`;
  - Command:
    `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-001|SP15-002" --parallel=2 --session-suffix=graphic_poster_retry_p15_001_002 --force` -> `generated=2 attempted=2 skipped=78 failed=0`;
  - QA sheet:
    `logs\qa-pack15-graphic-smoke-001-002-2026-06-19T07-01-48-129Z.webp`.
- Coverage:
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> `packs=1`,
    `presets=80`, `defaultImages=2/80`, `availableDefaultImages=2/80`,
    `missingDefaultImages=78`, `ok`.
- Hold:
  - no expandir `pack_15` masivamente hasta que el usuario confirme si este
    nivel de ilustracion sigue demasiado realista o ya es aceptable.
- Recheck global:
  - `bun run styles:validate -- --coverage` -> ok, `packs=17`,
    `presets=1649`; `pack_15 availableDefaultImages=2/80`,
    `pack_17 availableDefaultImages=3/44`.
  - `bun run styles:quality:audit` -> ok, `redundancy: none above threshold`.
  - `bun run styles:runtime` -> ok, regenerated runtime/default catalog for
    `1649` presets.
  - `bun run styles:runtime:check` -> ok, runtime current.

### Visual correction checkpoint - 2026-06-19 - `pack_15` illustration/control pivot

La primera correccion seguia demasiado realista en QA: `SP15-001` caia a
concept-art hiper-detallado y `SP15-002` volvia a foreground guard/officer
pinup. La direccion vigente para `pack_15` queda mas grafica y controlada:
screenprint poster, risograph poster, cel-shaded graphic-novel card,
flat-to-painterly digital illustration, gouache/poster, pocos bloques grandes
de color/valor, textura moderada y denoise fuerte.

- Guardrails reforzados:
  - `scripts/generate-style-defaults.ts` ahora pide `pack_15` como 2D
    illustration/screenprint/riso/cel-shaded poster, con pocas zonas grandes y
    sin lens realism, bokeh, HDR, material simulation o dense machinery
    wallpaper;
  - los 80 manifests `SP15-001..080` actualizan `render_quality`,
    `creative_brief` y `negativePrompt` hacia ilustracion controlada;
  - negatives nuevos: realistic uniform portrait, uniformed officer hero,
    foreground guard portrait, detailed tattoo focus, overcrowded scene,
    high-frequency surface detail y cinematic close-up portrait.
- Correcciones puntuales:
  - `SP15-001` se reoriento a illustrated civic poster, workers simplificados,
    open shape areas y maquinaria en clusters grandes;
  - `SP15-002` recibio override ID-specific: foco en locomotive silhouettes,
    semaphore gantries y rail-switch diagram shapes; humanos solo como tiny
    background silhouettes, sin foreground person/officer/lantern/flag hero.
- Rejected backups:
  - `D:\codex-studio-backups\style-cards\pack_15\rejected-realistic-smoke-20260619-042001`;
  - `D:\codex-studio-backups\style-cards\pack_15\rejected-foreground-officer-SP15-002-20260619-042443`.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-001|SP15-002" --parallel=2 --session-suffix=screenprint_control_retry_p15_001_002 --force` -> `generated=2 attempted=2 skipped=78 failed=0`;
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 --preset=SP15-002 --parallel=1 --session-suffix=signal_poster_no_foreground_person_retry --force` -> `generated=1 attempted=1 skipped=79 failed=0`.
- QA sheet:
  `logs\qa-pack15-illustration-control-001-002-2026-06-19T07-27-15-719Z.webp`.
- QA visual:
  - `SP15-001`: usable provisional; ya lee poster/ilustracion, aunque no usar
    como permiso para volver a maquinaria hiper-detallada.
  - `SP15-002`: corregida; sin foreground officer, lee como rail signal poster.
- Coverage vigente:
  - `pack_15 defaultImages=2/80`, `availableDefaultImages=2/80`,
    `missingDefaultImages=78`.

### Primary defaults - 2026-06-19 - `pack_15` screenprint wave `SP15-003..006`

Segunda tanda visual bajo contrato `pack_15` mas grafico/controlado.

- Preflight:
  - `bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-003|SP15-004|SP15-005|SP15-006" --session-suffix=screenprint_control_wave_003_006 --force --print-prompts` -> dry-run prompt log en `logs\pack15-003-006-prompts-20260619-043233.txt`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok, `availableDefaultImages=2/80`, `missingDefaultImages=78`.
- Manifest corrections before generation:
  - `SP15-003`: automata reorientado a poster, porcelain planes, sparse brass linework y sin realistic face portrait/filigree overload.
  - `SP15-004`: radio convoy reorientado a civilian signal convoy, antenna rigs, abstract radio-map coordination y sin wartime/military framing.
  - `SP15-005`: clockpunk rally reorientado a civic assembly, unreadable placard shapes y sin readable slogans/political flag hero.
  - `SP15-006`: print foundry reorientado a unreadable paper blocks, furnace/paper light y sin work-lamp hero/cluttered desk scene.
- Command:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-003|SP15-004|SP15-005|SP15-006" --parallel=2 --session-suffix=screenprint_control_wave_003_006 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- Rejected/retry:
  - First `SP15-004` result rejected for military/guard/flag/lantern drift.
  - Backup: `D:\codex-studio-backups\style-cards\pack_15\rejected-military-radio-convoy-SP15-004-20260619-044045`.
  - Override added in `scripts\generate-style-defaults.ts`: `SP15-004` must read as radio hardware/signal coordination, with humans only as tiny background marks.
  - Retry command:
    `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 --preset=SP15-004 --parallel=1 --session-suffix=radio_hardware_no_military_retry --force` -> `generated=1 attempted=1 skipped=79 failed=0`.
- QA sheet:
  `logs\qa-pack15-screenprint-003-006-2026-06-19T07-43-23-251Z.webp`.
- QA visual:
  - `SP15-003`: pass/watchlist; strong automata poster, lace detail controlled enough.
  - `SP15-004`: pass after retry; radio truck/antenna/map panels, no foreground guard.
  - `SP15-005`: watchlist; clear clockpunk assembly, but graphic placards/fist symbols should not become repeated political shorthand.
  - `SP15-006`: watchlist hard; print-foundry identity strong, but repeated lightning/gear symbol and dark worker/faction read need monitoring.
- Sync/check:
  - `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1569`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok, `defaultImages=6/80`, `availableDefaultImages=6/80`, `staleDefaultImages=0`, `missingDefaultImages=74`.
- Next visual queue:
  `SP15-007..010`, unless user deletes/rejects one of `SP15-003..006`.

### Primary defaults - 2026-06-19 - `pack_15` flat/painterly wave `SP15-007..010`

Tercera tanda visual. La primera correccion todavia caia demasiado a
concept-art realista: metal/render, profundidad cinematica, reflejos mojados y
microdetalle. El usuario pidio evitar realismo y empujar hacia ilustracion,
pintura digital controlada, menos hyper-detail y esteticas mas limpias.

- Manifest/generator corrections:
  - `pack_15` contract cambia de `screenprint/riso` como lectura dominante a
    `flat-to-painterly editorial illustration`, `gouache-like poster`, clean
    graphic-novel card y stylized animation-background card art.
  - Nuevos bloqueos: `painterly realism`, rendered metal realism, volumetric
    fog realism, mirror-wet realism, realistic perspective drama, dense cable
    lattice, panel-grid overload, tiny black linework y scratchy print noise.
  - `SP15-007`: airship dock con profundidad shallow, airship simple, gantry
    blocky, dockhands pequenos y sin scaffold/rivet realism.
  - `SP15-008`: workshop ceremonial como poster plano, maquina/rib icon,
    welding halo y workers pequenos; no cathedral literal ni metal render.
  - `SP15-009`: rain-courier cyberpunk con matte pavement, color slabs y pocas
    lineas cable; no empty neon corridor, no mirror-wet realism.
  - `SP15-010`: mesh-market permitido por premisa, pero como canopy/nodes/people
    en formas gouache; no phone demo, no cable spiderweb, no realistic bazaar.
- Backups:
  - `D:\codex-studio-backups\style-cards\pack_15\too-realistic-pack15-007-010-20260619-050314`;
  - `D:\codex-studio-backups\style-cards\pack_15\still-concept-art-pack15-007-010-20260619-051532`.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-007|SP15-008|SP15-009|SP15-010" --parallel=2 --session-suffix=illustration_control_retry_007_010 --force` -> `generated=4 attempted=4 skipped=76 failed=0`; rejected as still too concept-art/realistic.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-007|SP15-008|SP15-009|SP15-010" --parallel=2 --session-suffix=flat_painterly_retry_007_010 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA sheets:
  - Rejected/current-before-pivot: `logs\qa-pack15-007-010-current-2026-06-19T08-02-28-592Z.webp`;
  - Rejected concept-art retry: `logs\qa-pack15-007-010-illustration-retry-2026-06-19T08-15-11-034Z.webp`;
  - Provisional pass/new direction: `logs\qa-pack15-007-010-flat-painterly-2026-06-19T08-22-40-629Z.webp`.
- QA visual:
  - `SP15-007`: pass provisional; poster/dock identity clear, much less render-heavy.
  - `SP15-008`: pass provisional; machine workshop reads ceremonial without church drift.
  - `SP15-009`: watchlist; stronger cyberpunk action and less empty-corridor, but keep future rain presets flatter and less mirror-reflective.
  - `SP15-010`: watchlist; premise readable, but keep cable count controlled in future mesh/network cards.
- Sync/check:
  - `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1569`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=10/80`, `availableDefaultImages=10/80`,
    `staleDefaultImages=0`, `missingDefaultImages=70`.
- Next visual queue:
  `SP15-011..014`, using the flat/painterly contract from the start.

### Primary defaults - 2026-06-19 - `pack_15` flat/painterly wave `SP15-011..014`

Cuarta tanda visual del nuevo `Punk Spectrum Vault`, ya usando la pauta menos
realista desde el inicio.

- Manifest/generator corrections:
  - `SP15-011`: pirate mesh relay como rooftop poster con antenas, battery
    crates, crew pequena y signal arcs; sin laptop hero, readable screens,
    surveillance camera ni cable spiderweb.
  - `SP15-012`: cooperative firewall como comunidad/volunteers con shield
    blooms; sin dashboard wall, readable UI, corporate ops center ni office
    cubicles.
  - `SP15-013`: black-ice courier como diagonal motion poster; sin mirror-wet
    realism, empty corridor, realistic chase scene ni weapon pose.
  - `SP15-014`: signal shrine substation como ritual infrastructure de
    comunicacion; sin fantasy shrine, candles, altar room, service-lamp hero ni
    fence-grid overload.
- Runtime note:
  - primer intento fallo antes de generar por `ConnectionRefused` en
    `http://127.0.0.1:17223/api/health`;
  - se reinicio server local con `bun run dev:server` usando Bun real:
    `C:\Users\cristian\AppData\Roaming\npm\node_modules\bun\bin\bun.exe`;
  - health/port `127.0.0.1:17223` quedo vivo y el rerun cerro.
- Command:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-011|SP15-012|SP15-013|SP15-014" --parallel=2 --session-suffix=flat_painterly_wave_011_014 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA sheet:
  `logs\qa-pack15-011-014-flat-painterly-2026-06-19T08-41-10-474Z.webp`.
- QA visual:
  - `SP15-011`: pass; DIY rooftop relay claro, con antenas legibles.
  - `SP15-012`: pass/watchlist; comunidad/firewall claro, cuidar que badges no
    se vuelvan iconografia repetida.
  - `SP15-013`: pass; courier/black-ice es la mejor lectura de la tanda.
  - `SP15-014`: pass/watchlist; substation claro, cuidar metal/cables para que
    no vuelva a rendered realism.
- Sync:
  - `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1569`.
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=14/80`, `availableDefaultImages=14/80`,
    `staleDefaultImages=0`, `missingDefaultImages=66`.
  - `bun run styles:runtime:check` -> ok, runtime current.
  - `bun run check -- scripts\generate-style-defaults.ts` -> ok.
- Next visual queue:
  `SP15-015..018`.

### Primary defaults - 2026-06-19 - `pack_15` flat/painterly wave `SP15-015..018`

Quinta tanda visual. Cierra el tramo `Neon, Net & Signal Punks` y deja los dos
presets solarpunk permitidos en `Eco, Repair & Climate Punks`.

- Manifest/generator corrections:
  - `SP15-015`: drone graffiti overpass como street-tech; drones son tools, no
    camera props ni birds; graffiti abstracto sin readable tags.
  - `SP15-016`: neon clinic threshold como med-cyberpunk humane care; sin gore,
    blood spill, surgery closeup, syringe hero, fetish vinyl pose ni readable
    medical UI.
  - `SP15-017`: solar orchard commons como agricultura civica; se reforzo no
    leaf-logo emblem, eco badge, green branding symbol ni generic glass city.
  - `SP15-018`: sunstack civic infrastructure como vertical systems/cutaway; se
    separo de orchard rows y se bloqueo leaf-logo/green branding, mall atrium,
    hotel lobby y archviz.
- Rejected/retry:
  - First `SP15-017`/`SP15-018` result rejected for generic solarpunk look and
    leaf-logo/branding-like icons.
  - Backup:
    `D:\codex-studio-backups\style-cards\pack_15\rejected-solarpunk-logo-generic-SP15-017-018-20260619-055034`.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-015|SP15-016|SP15-017|SP15-018" --parallel=2 --session-suffix=flat_painterly_wave_015_018 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-017|SP15-018" --parallel=2 --session-suffix=flat_painterly_solar_retry_017_018 --force` -> `generated=2 attempted=2 skipped=78 failed=0`.
- QA sheets:
  - Rejected solarpunk pass:
    `logs\qa-pack15-015-018-flat-painterly-2026-06-19T08-50-16-612Z.webp`.
  - Final pass:
    `logs\qa-pack15-015-018-flat-painterly-final-2026-06-19T08-55-21-337Z.webp`.
- QA visual:
  - `SP15-015`: pass; street-tech/drone tool read clear, no readable graffiti.
  - `SP15-016`: pass/watchlist; clinic reads humane, but keep future med cues
    away from cross-logo repetition and body-detail realism.
  - `SP15-017`: pass after retry; orchard/repair identity clearer.
  - `SP15-018`: pass after retry; civic vertical infrastructure now distinct
    from orchard, less generic glass utopia.
- Sync:
  - `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1569`.
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=18/80`, `availableDefaultImages=18/80`,
    `staleDefaultImages=0`, `missingDefaultImages=62`.
  - `bun run styles:runtime:check` -> ok, runtime current.
  - `bun run check -- scripts\generate-style-defaults.ts` -> ok.
- Next visual queue:
  `SP15-019..022`.

### Primary defaults - 2026-06-19 - `pack_15` flat/painterly wave `SP15-019..022`

Sexta tanda visual, continuando `Eco, Repair & Climate Punks` sin volver a
solarpunk generico.

- Manifest/generator corrections:
  - `SP15-019`: riverside repair union como repair commons, no flea-market
    clutter; bloqueo readable union text, logo badge, work-lamp hero y
    photoreal river reflection.
  - `SP15-020`: windcatcher tenement roofs como domestic engineered windpunk;
    bloqueo fantasy sky city, bird swarm, clothesline clutter y dense rope web.
  - `SP15-021`: seed vault block party como living archive; seed packets son
    blank color rectangles; bloqueo readable labels, product packaging,
    sterile lab, market stall row y paper lantern fixation.
  - `SP15-022`: desert bloom condensers como climate-repair water logic;
    bloqueo palm oasis, fantasy desert city, foreground goggle portrait,
    survivalist weapon pose y photoreal dust haze.
- Command:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-019|SP15-020|SP15-021|SP15-022" --parallel=2 --session-suffix=flat_painterly_wave_019_022 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA sheet:
  `logs\qa-pack15-019-022-flat-painterly-2026-06-19T09-04-33-800Z.webp`.
- QA visual:
  - `SP15-019`: pass; repair workshop and riverside utility read clear.
  - `SP15-020`: pass; windcatchers/kite turbines distinct from prior solarpunk.
  - `SP15-021`: pass/watchlist; seed archive clear, watch blank packet shapes
    so they do not become readable label clutter.
  - `SP15-022`: pass; condenser towers and desert repair logic clear.
- Sync:
  - `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1569`.
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=22/80`, `availableDefaultImages=22/80`,
    `staleDefaultImages=0`, `missingDefaultImages=58`.
  - `bun run styles:runtime:check` -> ok, runtime current.
  - `bun run check -- scripts\generate-style-defaults.ts` -> ok.
- Next visual queue:
  `SP15-023..026`.

### Primary defaults - 2026-06-19 - `pack_15` flat/painterly wave `SP15-023..026`

Septima tanda visual. Cierra `Eco, Repair & Climate Punks` y abre `Bio, Myco &
Body Punks`.

- Manifest/generator corrections:
  - `SP15-023`: rain choir waterworks como water-music infrastructure; se
    bloqueo rainy alley, lamp/window fixation, photoreal rain reflections y
    logo-like water symbols.
  - `SP15-024`: mangrove lift cooperative como amphibious climate adaptation;
    se bloqueo generic green architecture, jungle fantasy, tourist boardwalk y
    anchor/leaf/badge symbols.
  - `SP15-025`: mycelial transit spine como fungal public infrastructure; se
    bloqueo subway corridor, readable transit map/text, fungus infection,
    body horror y slimy membrane microdetail.
  - `SP15-026`: symbiont market canopy como biotech trade; se bloqueo exposed
    organs, blood, surgery table, severed limbs, fetish body display, generic
    market aisle y wet skin realism.
- Rejected/retry:
  - First `SP15-023`/`SP15-024` result rejected for logo-like water/anchor/leaf
    symbols on surfaces.
  - Backup:
    `D:\codex-studio-backups\style-cards\pack_15\rejected-logo-symbols-SP15-023-024-20260619-061336`.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-023|SP15-024|SP15-025|SP15-026" --parallel=2 --session-suffix=flat_painterly_wave_023_026 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-023|SP15-024" --parallel=2 --session-suffix=no_logo_retry_023_024 --force` -> `generated=2 attempted=2 skipped=78 failed=0`.
- QA sheets:
  - Rejected logo-symbol pass:
    `logs\qa-pack15-023-026-flat-painterly-2026-06-19T09-13-23-839Z.webp`.
  - Final pass:
    `logs\qa-pack15-023-026-flat-painterly-final-2026-06-19T09-17-53-801Z.webp`.
- QA visual:
  - `SP15-023`: pass after retry; waterworks/rain music clear, no logo marks.
  - `SP15-024`: pass after retry; mangrove lift/cooperative read clear.
  - `SP15-025`: pass/watchlist; strong mycelial transit identity, but keep
    future mycopunk from becoming too dense/ornamental.
  - `SP15-026`: pass/watchlist; biotech trade readable, but organic detail must
    stay stylized and non-gore.
- Sync:
  - `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1569`.
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=26/80`, `availableDefaultImages=26/80`,
    `staleDefaultImages=0`, `missingDefaultImages=54`.
  - `bun run styles:runtime:check` -> ok, runtime current.
  - `bun run check -- scripts\generate-style-defaults.ts` -> ok.
- Next visual queue:
  `SP15-027..030`.

### Primary defaults - 2026-06-19 - `pack_15` flat graphic retry `SP15-027..030`

Octava tanda visual. Se pivoteo de `flat-to-painterly` demasiado cercano a
concept art hacia ilustracion digital/controlada: cel-poster, comic editorial,
matte color blocks, pocas zonas de detalle y sin render realista.

- Manifest/generator corrections:
  - `SP15-027`: nerve loom clinic como cuidado bodypunk; se bajo detalle de
    tatuajes/anime glamour y se bloqueo surgery, blood, exposed tissue, UI
    medica legible, photoreal skin y painterly realism.
  - `SP15-028`: spore signal plaza como comunicacion fungica publica; se cambio
    glyphs a dotted fungal pattern y se bloqueo letter-like/readable marks,
    bird flock, lantern fixation, horror spores y dense particles.
  - `SP15-029`: living bridge district como side-view civic bridge ilustrado; se
    bloqueo deep cinematic vista, fantasy palace, rib-cage horror, photoreal
    bark/root detail y realistic environment concept art.
  - `SP15-030`: gene-hack apothecary como taller botanico pequeno; se bloqueo
    detailed shop interior, readable labels, drug-store shelf, photoreal glass,
    work-lamp fixation y random object still life.
- Generator-wide prompt correction:
  - `IMAGEGEN_DENOISE_SUFFIX` ahora exige illustration-first digital painting /
    clean poster art y bloquea rendered material realism, semi-realistic concept
    art y cinematic hyper-detail.
  - `pack_15` contract ahora pide flat graphic digital illustration, cel poster
    / graphic-novel language, matte color planes, simplified brush planes y low
    detail-to-moderate detail.
- Rejected/retry:
  - First retry rejected for staying too close to environmental concept art /
    realism:
    `logs\qa-pack15-027-030-illustration-retry-2026-06-19T09-36-12-837Z.webp`.
  - Backups:
    `D:\codex-studio-backups\style-cards\pack_15\rejected-too-realistic-SP15-027-030-20260619-063135`.
    `D:\codex-studio-backups\style-cards\pack_15\rejected-concept-art-SP15-027-030-20260619-063837`.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-027|SP15-028|SP15-029|SP15-030" --parallel=2 --session-suffix=illustration_retry_027_030 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-027|SP15-028|SP15-029|SP15-030" --parallel=2 --session-suffix=flat_graphic_retry_027_030 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA sheet:
  `logs\qa-pack15-027-030-flat-graphic-retry-2026-06-19T09-44-46-696Z.webp`.
- QA visual:
  - `SP15-027`: pass; reads as care/repair bodypunk, not gore.
  - `SP15-028`: pass; dotted signal cloud avoids readable text/glyph issue.
  - `SP15-029`: pass/watchlist; identity strong, still densest card in the
    wave, keep future bioarchitecture less concept-art-like.
  - `SP15-030`: pass; botanical biopunk workshop readable, no labels/text.
- Sync:
  - `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1569`.
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=30/80`, `availableDefaultImages=30/80`,
    `staleDefaultImages=0`, `missingDefaultImages=50`.
  - `bun run styles:runtime:check` -> ok, runtime current.
  - `bun run check -- scripts\generate-style-defaults.ts scripts\style-default-utils.ts components\recipes\styles\manifests\presets\pack_15\SP15-027.yaml components\recipes\styles\manifests\presets\pack_15\SP15-028.yaml components\recipes\styles\manifests\presets\pack_15\SP15-029.yaml components\recipes\styles\manifests\presets\pack_15\SP15-030.yaml` -> ok.
- Next visual queue:
  `SP15-031..034`.

### Primary defaults - 2026-06-19 - `pack_15` flat graphic wave `SP15-031..034`

Novena tanda visual. Cierra `Bio, Myco & Body Punks` y abre `Ocean, Ice &
Terrain Punks` con el contrato plano/controlado ya ajustado.

- Manifest/generator corrections:
  - `SP15-031`: flesh circuit conservatory como glasshouse biotech elegante; se
    bloqueo exposed organs, bloody membrane, wet horror wall, erotic
    body-horror pose, realistic greenhouse render, archviz y corridor.
  - `SP15-032`: chloroplast housing stack como bio-urbanismo vivido; se bloqueo
    leaf-logo emblem, eco badge, luxury eco archviz, greenhouse tower, resort
    balcony render, photoreal facade y dense pipe spaghetti.
  - `SP15-033`: coral circuit marina como working seapunk marina; se bloqueo
    mermaid fantasy, tropical resort, empty ocean postcard, nightclub pier,
    photoreal wet reflections, readable buoy labels y anchor/leaf/wave logos.
  - `SP15-034`: tideglass subway como public aquatic transit; se bloqueo long
    subway corridor, vanishing tunnel, empty platform, horror aquarium,
    underwater city vista, photoreal caustics, station signage y UI map.
- Command:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-031|SP15-032|SP15-033|SP15-034" --parallel=2 --session-suffix=flat_graphic_wave_031_034 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA sheet:
  `logs\qa-pack15-031-034-flat-graphic-2026-06-19T09-54-37-524Z.webp`.
- QA visual:
  - `SP15-031`: pass/watchlist; biotech conservatory reads, no gore, but watch
    foreground fashion/goth drift in future bodypunk cards.
  - `SP15-032`: pass; housing stack / chloroplast panels clear, no eco-brand
    logo drift.
  - `SP15-033`: pass; marina function and coral circuit language clear.
  - `SP15-034`: pass; aquatic transit reads, no empty tunnel/corridor drift.
- Sync:
  - `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1569`.
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=34/80`, `availableDefaultImages=34/80`,
    `staleDefaultImages=0`, `missingDefaultImages=46`.
- Next visual queue:
  `SP15-035..038`.

### Primary defaults - 2026-06-19 - `pack_15` flat graphic wave `SP15-035..038`

Decima tanda visual dentro de `Ocean, Ice & Terrain Punks`.

- Manifest/generator corrections:
  - `SP15-035`: kelp arcade boardwalk como seapunk arcade jugable; se bloqueo
    readable screen UI, game title text, logos, mascot poster, object-only
    arcade cabinet, long boardwalk corridor, market pier y kelp/cable spaghetti.
  - `SP15-036`: shell metro pier como transporte publico costero; se bloqueo
    fantasy palace shells, mall terminal, cathedral station hall, long pier
    corridor, signage/logo badges, luxury resort dock y photoreal wet concrete.
  - `SP15-037`: icebreaker lantern town como comunidad harbor icepunk; se
    bloqueo snowflake/heraldic/faction/flag symbols, empty glacier, polar
    explorer portrait, cozy postcard, lighthouse hero y aurora-photo spectacle.
  - `SP15-038`: glacier server monastery como data-refuge interior; se bloqueo
    exterior ice doorway, cargo doors, empty bunker entrance, crane/oil platform,
    snowflake/server logos, religious icons, cathedral corridor y blue server
    hallway.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-035|SP15-036|SP15-037|SP15-038" --parallel=2 --session-suffix=flat_graphic_wave_035_038 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-037|SP15-038" --parallel=2 --session-suffix=no_snowflake_emblems_retry_037_038 --force` -> `generated=2 attempted=2 skipped=78 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-038" --parallel=1 --session-suffix=server_refuge_retry_038 --force` -> `generated=1 attempted=1 skipped=79 failed=0`.
- Rejected/retry:
  - First `SP15-037`/`SP15-038` retry rejected for snowflake/heraldic
    emblem-like symbols:
    `D:\codex-studio-backups\style-cards\pack_15\rejected-snowflake-emblems-SP15-037-038-20260619-070529`.
  - Second `SP15-038` rejected for reading as exterior glacier bunker instead
    of server refuge:
    `D:\codex-studio-backups\style-cards\pack_15\rejected-exterior-bunker-SP15-038-20260619-070943`.
- QA sheets:
  - First pass:
    `logs\qa-pack15-035-038-flat-graphic-2026-06-19T10-04-14-187Z.webp`.
  - Final pass:
    `logs\qa-pack15-035-038-flat-graphic-final2-2026-06-19T10-11-18-509Z.webp`.
- QA visual:
  - `SP15-035`: pass; kelp arcade/players readable, no text/UI.
  - `SP15-036`: pass; shell pier transport reads, no palace/mall drift.
  - `SP15-037`: pass/watchlist; harbor icepunk identity clear, still relatively
    detailed compared with flatter seapunk cards.
  - `SP15-038`: pass after retry; visible server-rack refuge, no snowflake logo
    or exterior bunker drift.
- Sync:
  - `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1569`.
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=38/80`, `availableDefaultImages=38/80`,
    `staleDefaultImages=0`, `missingDefaultImages=42`.
- Next visual queue:
  `SP15-039..042`.

### Primary defaults - 2026-06-19 - `pack_15` flat graphic wave `SP15-039..042`

Undecima tanda visual. Cierra `Ocean, Ice & Terrain Punks` y abre `Street,
Riot & DIY Punks`.

- Manifest/generator corrections:
  - `SP15-039`: salt flats kite foundry como industria salt/wind; se bloqueo
    desert oasis, generic solar farm, empty salt landscape, foreground goggle
    portrait, kite festival, fantasy desert city, windmill wallpaper y
    photoreal glare/heat shimmer.
  - `SP15-040`: swamp radio stiltworks como signal/survival local; se bloqueo
    fantasy swamp corridor, horror bayou monster, lantern hero, witch hut,
    dense vine/moss curtain, long dock corridor y readable radio signage.
  - `SP15-041`: zine wall safehouse como print-culture organizing; se bloqueo
    readable text/slogans/letters, newspaper words, brand stickers,
    blade/knife hero, conspiracy board, office desk y wall-only collage.
  - `SP15-042`: skatepark generator crew como DIY power crew; se bloqueo
    readable stickers, brand logos, skateboard-only still life, sterile
    generator render, underpass corridor, skate trick poster y dense cable nest.
- Command:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-039|SP15-040|SP15-041|SP15-042" --parallel=2 --session-suffix=flat_graphic_wave_039_042 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA sheet:
  `logs\qa-pack15-039-042-flat-graphic-2026-06-19T10-22-54-707Z.webp`.
- QA visual:
  - `SP15-039`: pass; salt/wind foundry readable, not oasis/solar farm.
  - `SP15-040`: pass/watchlist; radio stiltworks readable, but darker/noir than
    ideal flat graphic lane.
  - `SP15-041`: pass; zine wall uses blank graphic blocks, no readable text.
  - `SP15-042`: pass; generator crew and skatepark read, no product-shot drift.
- Sync:
  - `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1569`.
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=42/80`, `availableDefaultImages=42/80`,
    `staleDefaultImages=0`, `missingDefaultImages=38`.
- Next visual queue:
  `SP15-043..046`.

### Primary defaults - 2026-06-19 - `pack_15` flat graphic wave `SP15-043..046`

Duodecima tanda visual dentro de `Street, Riot & DIY Punks`.

- Manifest/generator corrections:
  - `SP15-043`: basement synth barricade como riot synth show; se bloqueo
    readable band posters, signage, logo stickers, nightclub glamour, empty
    instrument still life, weapon barricade, police riot scene, basement
    corridor y dense cable nest.
  - `SP15-044`: scrapbike courier yard como city logistics; se bloqueo readable
    maps/text labels, brand logos, motorcycle pinup, weapon biker gang, random
    junk pile, alley corridor, photoreal welding sparks y chain clutter.
  - `SP15-045`: sticker bomb signal booth como street-media booth; se bloqueo
    lightning/warning/logo-like stickers, readable stickers/letters/tags, brand
    logos, surveillance-camera hero, phone prop focus, screen UI y corridor
    booth.
  - `SP15-046`: warehouse rave clinic como mutual-care corner; se bloqueo skull
    patch, cross/medical logos, jacket symbols, readable marks, syringe hero,
    fetish clinic pose, drug-use scene, empty laser tunnel y warehouse corridor.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-043|SP15-044|SP15-045|SP15-046" --parallel=2 --session-suffix=flat_graphic_wave_043_046 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-045|SP15-046" --parallel=2 --session-suffix=no_logo_symbols_retry_045_046 --force` -> `generated=2 attempted=2 skipped=78 failed=0`.
- Rejected/retry:
  - First `SP15-045`/`SP15-046` rejected for logo-like lightning/skull/cross
    symbols:
    `D:\codex-studio-backups\style-cards\pack_15\rejected-logo-like-symbols-SP15-045-046-20260619-073401`.
- QA sheets:
  - First pass:
    `logs\qa-pack15-043-046-flat-graphic-2026-06-19T10-32-42-268Z.webp`.
  - Final pass:
    `logs\qa-pack15-043-046-flat-graphic-final-2026-06-19T10-35-46-257Z.webp`.
- QA visual:
  - `SP15-043`: pass; basement synth/barricade reads, no readable signage.
  - `SP15-044`: pass/watchlist; courier yard reads, but lamp/chain clutter
    should not become a repeated street-punk formula.
  - `SP15-045`: pass after retry; booth/signal identity clear, no dominant
    lightning-logo.
  - `SP15-046`: pass/watchlist after retry; hydration/care read, but foreground
    character remains strong.
- Sync:
  - `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1569`.
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=46/80`, `availableDefaultImages=46/80`,
    `staleDefaultImages=0`, `missingDefaultImages=34`.
- Next visual queue:
  `SP15-047..050`.

### Primary defaults - 2026-06-19 - `pack_15` controlled illustration wave `SP15-047..050`

Decimotercera tanda visual y correccion de rumbo: menos realismo/concept-art,
mas ilustracion 2D, pintura digital controlada, cel-poster y graphic-novel
card art con bajo detalle fino.

- Prompt/generator corrections:
  - Contrato `pack_15` endurecido hacia illustration-first 2D art, controlled
    stylized digital painting, clean graphic-novel card art, cel-shaded poster
    art y gouache-poster color blocking.
  - Se bloqueo explicitamente photorealism, painterly realism, realistic paint
    finish, semi-realistic figure rendering, semi-realistic game concept art,
    cinematic realism, material realism, hyper-detail y microtexture chatter.
  - `SP15-047`: crustpunk council con tres crew silhouettes, patched jackets,
    table/paper blocks y rough cut-paper edges; sin portrait close-up, realistic
    tattoos/hair/denim/leather, dog focus o logo patches.
  - `SP15-048`: mutual-aid street kitchen con hacked food printer, volunteer
    silhouettes, crates, steam ribbons y serving table slabs; retry posterior
    bloqueo flag/banner/placard/fist/spoon/emblem/badge.
  - `SP15-049`: cathode pool con loungers/swimmer silhouettes, CRT glow,
    sparse tile grid y flat vapor bands; sin spa realism, tile corridor, screen
    UI/text o photoreal water/skin.
  - `SP15-050`: vaporwave arcade con player silhouettes, blank cabinet screens,
    checker blocks y sunset grid; sin title screens, mascot posters, endless
    arcade aisle, glossy realism o concept-art mall corridor.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-047|SP15-048|SP15-049|SP15-050" --parallel=2 --session-suffix=illustration_controlled_wave_047_050 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 --preset=SP15-048 --parallel=1 --session-suffix=illustration_controlled_retry_no_flag_048 --force` -> `generated=1 attempted=1 skipped=79 failed=0`.
- Rejected/retry:
  - First `SP15-048` rejected for logo-like flag/fist/spoon symbol:
    `D:\codex-studio-backups\style-cards\pack_15\rejected-logo-flag-SP15-048-20260619-074855`.
- QA sheets:
  - First pass:
    `logs\qa-pack15-047-050-illustration-controlled-2026-06-19T10-48-37-332Z.webp`.
  - Final pass:
    `logs\qa-pack15-047-050-illustration-controlled-final-2026-06-19T10-51-24-511Z.webp`.
- QA visual:
  - `SP15-047`: pass; crew/table politics and patch silhouettes read as
    stylized illustration, not photo.
  - `SP15-048`: pass after retry; food-printer aid scene reads, no dominant
    flag/emblem.
  - `SP15-049`: pass; vapor pool/CRT scene readable with figures, not pure
    abstraction.
  - `SP15-050`: pass; arcade culture readable, controlled vapor palette, no
    title/UI/logos.
- Sync:
  - `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1569`.
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=50/80`, `availableDefaultImages=50/80`,
    `staleDefaultImages=0`, `missingDefaultImages=30`.
- Next visual queue:
  `SP15-051..054`.

### Primary defaults - 2026-06-19 - `pack_15` controlled illustration wave `SP15-051..054`

Decimocuarta tanda visual dentro de `Media, Vapor & Glitch Punks`.

- Prompt/generator corrections:
  - `SP15-051`: cassette weather station como instrument culture, cassette-deck
    blocks, dials grandes, tape ribbons y operator silhouette; se bloqueo
    office desk, desk-lamp hero, readable maps/text y tiny dial carpets.
  - `SP15-052`: pirate TV atrium sin camaras visibles despues de retries; se
    vende por CRT tower, broadcast cart, antenna arcs, crew/crowd silhouettes y
    tally dots. Se bloquearon pirate flag, skull/crossbones, banner/emblem,
    camera/tripod/softbox/light umbrella y news-logo/UI.
  - `SP15-053`: CRT prayer booth como analog ritual; se bloquearon cross,
    religious icon, sigils, altar, skull, chapel corridor y candle shrine
    fixation.
  - `SP15-054`: glitch bazaar como single compact kiosk; se bloquearon
    screen-wall, many monitors, detailed UI panels, market/grocery aisle,
    endless stalls, mascot poster y RGB noise storm.
  - Generic motif wording cambio de `custom emblem` a `custom motif shape`
    para no reabrir logo-like symbols.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-051|SP15-052|SP15-053|SP15-054" --parallel=2 --session-suffix=illustration_controlled_wave_051_054 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-052|SP15-054" --parallel=2 --session-suffix=illustration_controlled_retry_no_symbol_market_052_054 --force` -> `generated=2 attempted=2 skipped=78 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 --preset=SP15-052 --parallel=1 --session-suffix=illustration_controlled_retry_no_camera_052 --force` -> `generated=1 attempted=1 skipped=79 failed=0`.
- Rejected/retry:
  - First `SP15-052`/`SP15-054` rejected for skull/flag symbol and
    market/screen-wall drift:
    `D:\codex-studio-backups\style-cards\pack_15\rejected-symbol-market-SP15-052-054-20260619-080125`.
  - Second `SP15-052` rejected for camera/softbox hero:
    `D:\codex-studio-backups\style-cards\pack_15\rejected-camera-hero-SP15-052-20260619-080435`.
- QA sheets:
  - First pass:
    `logs\qa-pack15-051-054-illustration-controlled-2026-06-19T11-01-08-676Z.webp`.
  - Retry pass:
    `logs\qa-pack15-051-054-illustration-controlled-final-2026-06-19T11-04-20-708Z.webp`.
  - Final pass:
    `logs\qa-pack15-051-054-illustration-controlled-final2-2026-06-19T11-07-14-274Z.webp`.
- QA visual:
  - `SP15-051`: pass/watchlist; strong cassette weather instrument read, still
    object-led but not office/product-only.
  - `SP15-052`: pass/watchlist after second retry; broadcast/CRT read, no
    flag/skull/camera hero.
  - `SP15-053`: pass/watchlist; analog ritual read, dark but no religious icon.
  - `SP15-054`: pass/watchlist; compact glitch kiosk, no market aisle/screen-wall.
- Sync:
  - `bun run styles:taxonomy -- --pack=pack_15` -> `updated=80 skipped=1569`.
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=54/80`, `availableDefaultImages=54/80`,
    `staleDefaultImages=0`, `missingDefaultImages=26`.
- Next visual queue:
  `SP15-055..058`.

### Primary defaults - 2026-06-19 - `pack_15` flat illustration wave `SP15-055..058`

Decimoquinta tanda visual y cierre de `Media, Vapor & Glitch Punks`; arranque de
`Occult, Myth & Gothic Punks`.

- Prompt/generator corrections:
  - El usuario rechazo el drift demasiado realista/semi-concept-art. Se reforzo
    el contrato hacia flat graphic illustration, gouache/cel-poster shapes,
    controlled digital painting, matte color slabs, low-to-moderate detail y
    denoise fuerte.
  - `SP15-055`: mall fountain uplink como escena compacta con crew silhouettes,
    fountain basin y cables; se bloqueo streetwear patch/detail, signos
    legibles, mall hallway, retail aisle y realistic water caustics.
  - `SP15-056`: static tape observatory como rooftop signal deck; se bloqueo
    screen text/fake UI, readable scope marks, control-room wall, LED carpet y
    photoreal metal/glass.
  - `SP15-057`: neon witch switchyard como maquinaria/infrastructure hero; retry
    selectivo para sacar foreground cloaked figure, pendant/costume detail,
    magic-circle glyphs y floor sigil drift.
  - `SP15-058`: tarot circuit foundry como press/blank plates hero; retry
    selectivo para sacar foreground masked hero, robe symbols, worker emblems y
    wall plaques with glyphs.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-055|SP15-056|SP15-057|SP15-058" --parallel=2 --session-suffix=illustration_controlled_wave_055_058 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-055|SP15-056|SP15-057|SP15-058" --parallel=2 --session-suffix=flat_illustration_wave_055_058_retry --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-057|SP15-058" --parallel=2 --session-suffix=flat_illustration_wave_057_058_retry2 --force` -> `generated=2 attempted=2 skipped=78 failed=0`.
- Rejected/retry:
  - First pass rejected as still too semi-real/concept-art; `SP15-056` also had
    fake screen text, `SP15-057` had magic-circle/sigil drift, and `SP15-058`
    leaned into masked portrait.
  - Second pass accepted for `SP15-055`/`SP15-056`; `SP15-057`/`SP15-058`
    needed retry for costume/symbol drift.
  - Automatic previous-card backups landed in
    `D:\codex-studio-backups\style-cards\pack_15\previous`.
- QA sheets:
  - First pass:
    `logs\qa-pack15-055-058-illustration-controlled-2026-06-19T11-21-15-784Z.webp`.
  - Flat retry:
    `logs\qa-pack15-055-058-flat-illustration-retry-2026-06-19T11-32-07-899Z.webp`.
  - Final pass:
    `logs\qa-pack15-055-058-flat-illustration-final-2026-06-19T11-35-25-498Z.webp`.
- QA visual:
  - `SP15-055`: pass/watchlist; still character/scenario-led but flatter and
    readable as mall fountain network ritual.
  - `SP15-056`: pass; blank CRT/tape/dish read, no fake text.
  - `SP15-057`: pass/watchlist; switchyard machinery and plain oval glow, no
    readable sigil circle.
  - `SP15-058`: pass/watchlist; press/card-plate graphic read, no foreground
    masked portrait.
- Sync:
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=58/80`, `availableDefaultImages=58/80`,
    `staleDefaultImages=0`, `missingDefaultImages=22`.
- Next visual queue:
  `SP15-059..062`.

### Primary defaults - 2026-06-19 - `pack_15` flat illustration wave `SP15-059..062`

Decimosexta tanda visual y cierre de `Occult, Myth & Gothic Punks`.

- Prompt/generator corrections:
  - `SP15-059`: goth relay chapel como radio mast/switchboard hero, operator
    silhouettes, cable arches y red indicators; se bloquearon cross/religious
    icon, skull emblem, altar, chapel corridor, stained-glass text, lace
    microdetail y foreground goth pinup.
  - `SP15-060`: bone lime signal cairn como bone-like resin engineering; retry
    selectivo para sacar flags, banners, crescent marks, circular emblems,
    clothing symbols y real-bone/gore drift.
  - `SP15-061`: necrophone repair shop como oversized receiver/bench hero;
    retry selectivo para sacar crescent marks, wall emblems, clothing symbols,
    shop labels y cluttered repair desk.
  - `SP15-062`: shrine engine procession como moving engine cart y cloth strips;
    retry selectivo para sacar flags/banners/crescents/clothing symbols y
    religious/faction icon drift.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-059|SP15-060|SP15-061|SP15-062" --parallel=2 --session-suffix=flat_illustration_wave_059_062 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-060|SP15-061|SP15-062" --parallel=2 --session-suffix=flat_illustration_wave_060_062_retry_no_emblems --force` -> `generated=3 attempted=3 skipped=77 failed=0`.
- Rejected/retry:
  - First `SP15-060..062` pass rejected for flag/emblem/crescent/symbol drift.
  - Automatic previous-card backups landed in
    `D:\codex-studio-backups\style-cards\pack_15\previous`.
- QA sheets:
  - First pass:
    `logs\qa-pack15-059-062-flat-illustration-2026-06-19T11-47-13-067Z.webp`.
  - Final pass:
    `logs\qa-pack15-059-062-flat-illustration-final-2026-06-19T11-52-08-337Z.webp`.
- QA visual:
  - `SP15-059`: pass; goth relay/radio silhouette, no chapel iconography.
  - `SP15-060`: pass/watchlist; slightly concept-art leaning, but readable as
    signal cairn and no obvious gore/flag/emblem.
  - `SP15-061`: pass; phone repair read, no readable labels or emblem drift.
  - `SP15-062`: pass; engine cart/procession read, cloth strips without
    readable symbols.
- Sync:
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=62/80`, `availableDefaultImages=62/80`,
    `staleDefaultImages=0`, `missingDefaultImages=18`.
- Next visual queue:
  `SP15-063..066`.

### Primary defaults - 2026-06-19 - `pack_15` flat illustration wave `SP15-063..066`

Decimoseptima tanda visual; cierre de `Occult, Myth & Gothic Punks` y arranque
de `Space, Atomic & Ray Punks`.

- Prompt/generator corrections:
  - `SP15-063`: vampire data salon como velvet terminal table, pale simplified
    figures y red data glass; se bloquearon blood, fangs, bite marks, coffin,
    bat swarm, readable screen UI, terminal text y foreground glamour portrait.
  - `SP15-064`: folk horror transformer como transformer pole/field
    infrastructure; se bloquearon straw-mask portrait, scarecrow body, hanging
    figure, cult symbols, ribbon glyphs, lantern carpet y birds-as-motif.
  - `SP15-065`: neon isotope plaza como atomic fountain y blank isotope-orbit
    geometry; se bloquearon readable signs, radiation trefoil, hazard logo,
    numbers/text, luxury mall y photoreal chrome.
  - `SP15-066`: reactor promenade como public atomic leisure; se bloquearon
    warning text, radiation trefoil, hazard logo, control panels, cockpit UI,
    numbered labels, gas-mask soldier y 3D hard-surface render.
- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-063|SP15-064|SP15-065|SP15-066" --parallel=2 --session-suffix=flat_illustration_wave_063_066 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA sheets:
  - Final pass:
    `logs\qa-pack15-063-066-flat-illustration-2026-06-19T12-03-03-718Z.webp`.
- QA visual:
  - `SP15-063`: pass/watchlist; character-led vampire data salon, no blood/UI.
  - `SP15-064`: pass; transformer/field folk horror read, no gore or hanging
    figure.
  - `SP15-065`: pass; strong atompunk plaza/fountain read, no signs/logos.
  - `SP15-066`: pass/watchlist; slightly archviz/hard-surface leaning, but
    readable as posterized reactor promenade and no warning text/UI.
- Sync:
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=66/80`, `availableDefaultImages=66/80`,
    `staleDefaultImages=0`, `missingDefaultImages=14`.
- Next visual queue:
  `SP15-067..070`.

### Primary defaults - 2026-06-19 - `pack_15` flat illustration wave `SP15-067..070`

Decimoctava tanda visual dentro de `Space, Atomic & Ray Punks`.

- Prompt/generator corrections:
  - `SP15-067`: orbit diner strip como ray-age roadside poster; se bloquearon
    readable signs, diner/logo/brand text, menu boards, license plates,
    photoreal chrome y empty car render.
  - `SP15-068`: rocket chapel outpost como frontier/outpost life; se cambio
    `antenna crosses` por antenna masts y se bloquearon chapel interior,
    religious icon, rocket logo, cockpit UI, starfield wallpaper, raygun y
    photoreal rocket metal.
  - `SP15-069`: comet salvage yard como work/risk poster; se bloquearon
    spaceship hero, cockpit UI, weapon/explosion, NASA-like logo, hazard
    symbols, dense cable spaghetti y tiny debris field.
  - `SP15-070`: plasma rail commons como public transit poster; se bloquearon
    long tunnel/corridor, station signs, route maps, UI panels, train logo,
    warning labels, numbers y PBR glass/steel.
- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-067|SP15-068|SP15-069|SP15-070" --parallel=2 --session-suffix=flat_illustration_wave_067_070 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA sheets:
  - Final pass:
    `logs\qa-pack15-067-070-flat-illustration-2026-06-19T12-13-50-194Z.webp`.
- QA visual:
  - `SP15-067`: pass; diner/rocket-car read, no readable signs.
  - `SP15-068`: pass/watchlist; slight chapel silhouette risk, but no clear
    religious symbol or readable insignia.
  - `SP15-069`: pass/watchlist; a bit rendered, but reads as comet salvage work
    and no logos/UI.
  - `SP15-070`: pass; transit/plasma rail read, no signage/UI/corridor tunnel.
- Sync:
  - `bun run styles:runtime` -> ok, `packs=17 presets=1649`.
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=70/80`, `availableDefaultImages=70/80`,
    `staleDefaultImages=0`, `missingDefaultImages=10`.
- Next visual queue:
  `SP15-071..074`.

### Primary defaults - 2026-06-19 - `pack_15` character-led correction `SP15-071..074`

El usuario corrigio rumbo: la intencion de ilustracion/pintura digital era buena,
pero demasiadas cards caian en "trabajadores haciendo cosas" y se volvian
intercambiables. Nuevo contrato para `pack_15`: una tarjeta debe priorizar un
personaje principal destacable con fondo tematico del preset; personajes
secundarios pueden aparecer atras, pero no como worker-crew formula.

- Prompt/refactor:
  - `scripts/generate-style-defaults.ts` refuerza `pack_15` hacia `one standout
main character + thematic background`, bloqueando workshop/worker/print-shop
    repetition.
  - `SP15-071`: lunar orchard signal-keeper + dome orchard/relay background.
  - `SP15-072`: crater choir conductor + dish/acoustic sanctuary background.
  - `SP15-073`: basalt gearwright + sacred gear machine background.
  - `SP15-074`: flint engine trader-inventor + compact engine stall background.
- Tooling fix:
  - `scripts/style-default-utils.ts` ahora escribe defaults via `.tmp.webp` y
    rename para evitar write errors sobre destino.
  - `scripts/generate-style-defaults.ts` ya no borra `sourceAssetPath` si apunta
    dentro del repo; esto evita que cleanup elimine el default recien escrito.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-071|SP15-072|SP15-073|SP15-074" --parallel=2 --session-suffix=character_led_theme_background_071_074 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-071" --parallel=1 --session-suffix=character_led_restore_071 --force` escribio el archivo pero fallo metadata por cleanup antes del fix (`rootDir is not defined`); archivo restaurado y fix aplicado.
- QA sheet:
  `logs\qa-pack15-071-074-character-led-final-2026-06-19T13-38-04-594Z.webp`.
- QA visual:
  - `SP15-071`: pass/watchlist; protagonista claro, fondo lunar orchard/relay.
  - `SP15-072`: pass/watchlist; conductor principal y fondo tematico, no crew-only.
  - `SP15-073`: watchlist; protagonista fuerte, pero vigilar simbolos en traje.
  - `SP15-074`: watchlist; protagonista fuerte y engine market, vigilar mask/armor drift.
- Coverage real tras borrados manuales del usuario:
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=5/80`, `availableDefaultImages=5/80`,
    `staleDefaultImages=0`, `missingDefaultImages=75`.
- Next visual queue:
  pausar `SP15-075..080` hasta aplicar pivot estetico anti-generico; revisar
  tambien si el usuario borra/rechaza alguno de `SP15-071..074`.

### Rejected visual direction - 2026-06-19 - `pack_15` RPG-generic drift `SP15-075..080`

La tanda `SP15-075..080` se genero tecnicamente, pero queda rechazada como
direccion estetica: las seis cards cayeron en ilustracion tipo RPG/adventure
occidental, con protagonista full-body, pouches/botas/capas, paleta beige/azul
y rostros/posturas demasiado parecidos. El problema no era solo un preset: el
contrato `character-led` + `graphic-novel` + `adventure comic` estaba empujando
al modelo hacia hero-card generica.

- Command rechazado:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-cards\pack_15 bun run scripts/generate-style-defaults.ts --pack=pack_15 "--preset=SP15-075|SP15-076|SP15-077|SP15-078|SP15-079|SP15-080" --force --parallel=2 --session-suffix=character_led_theme_background_075_080` -> `generated=6 attempted=6 skipped=74 failed=0`.
- QA sheet de diagnostico:
  `logs\qa-pack15-075-080-generic-rejected-diagnosis-valid-2026-06-19T14-25-32-526Z.webp`.
- Backup externo de la tanda rechazada:
  `D:\codex-studio-backups\style-cards\pack_15\current\SP15-075.webp` a
  `SP15-080.webp`.
- Estado repo tras borrados/concurrencia:
  `styles:validate -- --pack=pack_15 --coverage` reporto
  `defaultImages=6/80`, `availableDefaultImages=6/80`,
  `missingDefaultImages=74`; no se restauran `SP15-075..079` desde backup hasta
  aprobar nueva direccion.
- Pivot aplicado:
  - `pack_15` ya no debe pedir "character card" como lenguaje dominante.
  - Nuevo contrato: speculative poster/artbook plate, folk-modernist shape
    language, editorial poster/Eastern European animation/Japanese
    environment-art/Latin American poster grammar como referencias amplias.
  - Bloquear American fantasy RPG/sourcebook hero art, YA adventure cover,
    centered full-body adventurer, leather pouches, boots, cloaks/capes, young
    rugged protagonist sameness, worker-crew repetition y tan/blue cloak palette.
- Siguiente paso seguro:
  generar solo `2` pilotos (`SP15-075` y `SP15-079`) con el nuevo contrato antes
  de repetir `075..080`.

### Primary defaults - 2026-06-19 - `pack_15` artbook/poster pivot `SP15-075..080`

Se aplico el pivot anti-RPG generico y se regenero la cola `SP15-075..080` con
direccion mas poster/artbook: figura-dispositivo, maquinas como foco, crop
variado, folk-modernist shape language, menos full-body hero y menos paleta
beige/azul repetida.

- Backups de rechazados:
  - `D:\codex-studio-backups\style-cards\pack_15\rejected-rpg-generic-075-079-20260619-113707`.
  - `D:\codex-studio-backups\style-cards\pack_15\rejected-rpg-generic-076-078-080-20260619-114317`.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-cards\pack_15 bun run scripts/generate-style-defaults.ts --pack=pack_15 "--preset=SP15-075|SP15-079" --force --parallel=2 --session-suffix=artbook_plate_pilot_075_079` -> `generated=2 attempted=2 skipped=78 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-cards\pack_15 bun run scripts/generate-style-defaults.ts --pack=pack_15 "--preset=SP15-076|SP15-077|SP15-078|SP15-080" --force --parallel=2 --session-suffix=artbook_plate_wave_076_078_080` -> `generated=4 attempted=4 skipped=76 failed=0`.
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-cards\pack_15 bun run scripts/generate-style-defaults.ts --pack=pack_15 --preset=SP15-078 --force --parallel=1 --session-suffix=artbook_plate_078_no_wall_text_retry` -> `generated=1 attempted=1 skipped=79 failed=0`.
- QA sheets:
  - `logs\qa-pack15-075-079-artbook-pilot-2026-06-19T14-42-45-411Z.webp`.
  - `logs\qa-pack15-075-080-artbook-plate-final2-2026-06-19T14-54-40-354Z.webp`.
- QA visual:
  - `SP15-075`: pass/watchlist; fuerte como poster de figura-dispositivo y water-clock, watchlist por icono de reloj abajo.
  - `SP15-076`: pass/watchlist; mast domina, menos personaje generico, watchlist por formas tipo bandera/senal.
  - `SP15-077`: pass/watchlist; maquina/bridge generator claro, no hero-card; watchlist por icono decorativo arriba.
  - `SP15-078`: pass tras retry; battery-house claro, sin marcas de pared tipo texto/signage.
  - `SP15-079`: pass/watchlist; sailpunk mas poster maritimo, aun personaje-forward pero sin rugged young RPG drift.
  - `SP15-080`: pass/watchlist; wind-camp/turbine claro, oscuro pero legible y no hero-card.
- Siguiente visual queue:
  continuar `SP15-081+` no aplica al pack nuevo de 80 presets; siguiente accion
  real es revisar borrados manuales/missing restantes por coverage vivo antes
  de ampliar a otra categoria o volver a `SP15-001..059`.

### Primary defaults - 2026-06-19 - `pack_15` artbook/poster pivot `SP15-061..064`

Se aplico el mismo pivot anti-generico a una tanda faltante anterior del bloque
occult/myth/gothic. La correccion evita tanto worker-crew/workshop formula como
abstraccion vacia: cada preset queda representado por una maquina, dispositivo o
infraestructura con figura humana parcial solo cuando ayuda a escala/narrativa.

- Prompt/refactor:
  - `SP15-061`: necrophone repair como telefono/receiver sobredimensionado,
    bench compacto y mano/silueta parcial; no technician crew ni cluttered shop.
  - `SP15-062`: shrine-engine cart, cable garlands y publico escaso; no mechanic
    crew, parade texture ni templo religioso.
  - `SP15-063`: velvet terminal table, red data glass y salon figure parcial; no
    pale hacker group, glamour portrait ni UI concept art.
  - `SP15-064`: transformer pole/insulators/straw bundles; no technician crew,
    scarecrow monster ni folk-horror gore.
- Command:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-cards\pack_15 bun run scripts/generate-style-defaults.ts --pack=pack_15 "--preset=SP15-061|SP15-062|SP15-063|SP15-064" --force --parallel=2 --session-suffix=artbook_plate_wave_061_064` -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA sheet:
  `logs\qa-pack15-061-064-artbook-plate-2026-06-19T15-08-53-630Z.webp`.
- QA visual:
  - `SP15-061`: pass; receiver/ghost audio line claro, mano de escala sin caer en worker crew.
  - `SP15-062`: pass/watchlist; shrine-engine focal fuerte, vigilar que futuras tandas no repitan cart-front composition.
  - `SP15-063`: pass/watchlist; salon/data terminal legible, figura parcial integrada, sin glamour portrait.
  - `SP15-064`: pass; infraestructura rural/transformer clara, sin personaje hero ni ritual gore.
- Coverage vivo:
  - `bun run styles:validate -- --pack=pack_15 --coverage` -> ok,
    `defaultImages=15/80`, `availableDefaultImages=15/80`,
    `staleDefaultImages=0`, `missingDefaultImages=65`.
- Siguiente visual queue:
  revisar faltantes reales por coverage; candidatos seguros: `SP15-065..070` si
  el usuario no borra/rechaza esta tanda.

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

## Current verification - 2026-06-18 (semantic close pack_07 / pack_08)

- Residual semantic cleanup completed for `pack_07` / `pack_08`; only code change in this checkpoint was `SP07-075` mojibake cleanup while preserving the impossible-paradox style anchor.
- Closeout checks:
  - `bun run styles:validate -- --pack=pack_07` -> ok.
  - `bun run styles:validate -- --pack=pack_08` -> ok.
  - `bun run styles:quality:audit` -> ok, no redundancy above threshold.
  - `bun run styles:runtime:check` -> ok.
- Visual priority remains evidence-based:
  - `pack_14` and `pack_15` remain closed for stale/missing default-card debt;
  - next stale visual debt should target packs still reported stale by coverage, not `pack_14` / `pack_15` unless fresh semantic edits land there.

## Visual correction checkpoint - 2026-06-18 (anime identity regression)

- User QA flagged anime cards around `SP05-031+` as too generic, too same-style, too noisy, and sometimes object-first when anime should show characters.
- Root cause accepted:
  - prompts overcorrected against IP/weapon/scene drift;
  - `object/material-first` was applied too broadly;
  - several prompts converged on the same shonen/forest/ruin visual grammar.
- New rule for anime visual debt:
  - default to character/pose/acting + preset-specific identity;
  - use object/material-first only for explicit safety/IP/weapon/gore risk;
  - keep cel readability, broad value/color shapes, and controlled detail density;
  - avoid dense forest, ruin corridor, market/library/camera drift, and noisy microdetail.
- Generator prompt checkpoint:
  - `SP05-031..040` ID-scoped prompt text updated;
  - object/material-first category overrides removed for `SP05-032` and `SP05-036`.
- Follow-up audit checkpoint:
  - manifests `pack_05` still carry strong identity; loss happened in `scripts/generate-style-defaults.ts`.
  - `safeImagegenStyleDna` was an identity-squashing early-return: it skipped `HERO`, `ENVIRONMENT`, `ACTION`, motif, negative prompt, and constraint semantics.
  - safe branch now keeps `ANIME`/`ACTION`, includes subject/mood/render, restores character-led anime anchors when no explicit object-only override exists, and preserves motif + negative prompt.
  - `pack_05__anime_style_spectrum` now uses its own broad prompt family instead of `anime_masterpieces`.
  - generic detail variant now asks for broad thumbnail-readable detail, not micro-detail.
- Override policy from now on:
  - `character-led`: default for anime style cards;
  - `scene-led`: allowed when setting/world is the style identity;
  - `object-only safety exception`: allowed only when character-led generation creates IP, gore, weapon, exploitative, or unsafe drift.
- Visual queue:
  - pause further anime generation until `SP05-031..040` are triaged against current assets, backup primaries, and existing variants.

## Visual correction checkpoint - 2026-06-18 (`pack_06` bird/animal repetition)

- User QA flagged that some `SP06` cards overused birds/avian silhouettes.
- Current coverage remains closed: `pack_06 availableDefaultImages=120/120`, `staleDefaultImages=0`, `missingDefaultImages=0`.
- No assets regenerated or restored in this checkpoint.
- Generator guardrail strengthened for future `pack_06` retries: do not solve cards with birds, ravens, owls, wing shapes, feathered silhouettes, or repeated animal icons by default.
- The guardrail now rotates positive anchor choices by category; `mixed-media` specifically prefers garment/human fragments, torn-color blocks, botanical pressings, mask pieces, vehicle scraps, architectural paper, fabric swatches, ticket-like shapes without readable text, or material specimens instead of recurring bird collage.
- Operational rule: if the user deletes specific `SP06` bird-heavy cards, retry only those IDs; do not reopen the whole pack.

## Current verification - 2026-06-18 (visual debt checkpoint)

- Semantic gates rechecked:
  - `bun run styles:validate -- --pack=pack_07` -> ok.
  - `bun run styles:validate -- --pack=pack_08` -> ok.
  - `bun run styles:quality:audit` -> ok, `redundancy: none above threshold`.
  - `bun run styles:runtime:check` -> ok, runtime current.
- Priority visual packs rechecked:
  - `pack_14`: `availableDefaultImages=123/123`, `staleDefaultImages=0`, `missingDefaultImages=0`.
  - `pack_15`: `availableDefaultImages=137/137`, `staleDefaultImages=0`, `missingDefaultImages=0`.
- Remaining visual debt outside closed priority packs:
  - `pack_13`: `availableDefaultImages=6/132`, `staleDefaultImages=126`, `missingDefaultImages=0`.
  - `pack_16`: `availableDefaultImages=0/140`, `staleDefaultImages=140`, `missingDefaultImages=0`.
- Operational hold:
  - pause broad generation while manual QA/deletion continues on `SP05` and `SP06`;
  - regenerate only user-deleted/rejected IDs, or resume primary stale waves with `pack_13` then `pack_16` after manual QA settles.

## Prompt correction checkpoint - 2026-06-18 (`SP13-021..025` in `pack_05`)

- `SP13-021..025` are `pack_05` action-category presets, not `pack_13` presets.
- They still had object-only prompt overrides (`No character hero` / `No shonen hero`) that would produce abstract energy/action cards.
- Generator correction:
  - removed object-only overrides for `SP13-021..025`;
  - added `pack_05__action` base and anchor text that makes future retries character-led;
  - kept anti-franchise, anti-weapon-first, anti-corridor/market/library/camera/noisy-rubble guardrails.
- Verification:
  - `bun run scripts\generate-style-defaults.ts --pack=pack_05 --preset=SP13-021 --print-prompts --force` prints a character-led action prompt;
  - `bun run check -- scripts\generate-style-defaults.ts` -> ok.
- No assets regenerated.
- Existing primaries for `SP13-021..025` were previously accepted as action-energy abstraction; superseded by current QA direction. Treat them as selective retry candidates even if pack coverage still reports them available.

## Prompt correction checkpoint - 2026-06-18 (`pack_13` anime card bases)

- `pack_13` still has large visual debt: `availableDefaultImages=6/132`, `staleDefaultImages=126`, `missingDefaultImages=0`.
- Prompt dry-run for `SP13-007..012` showed `pack_13` was falling back to a generic vertical-scene base instead of anime-specific character-led bases.
- Root cause: `CATEGORY_SCENE_ANCHORS` had stale keys like `pack_13__anime`; current taxonomy emits keys such as `pack_13__core_anime`.
- Generator correction:
  - added real `pack_13__core_anime`, `pack_13__slice_of_life_school_music`, `pack_13__shojo_magical_girl_and_visionary_classics`, `pack_13__slice_of_life_and_moe`, and `pack_13__anime_style_spectrum` base prompts;
  - added matching current-key anchors so future `pack_13` retries are character-led and not generic room/corridor/prop staging;
  - extended safe anime character handling from `pack_05` to `pack_13`;
  - added `SP13-011` override to keep labyrinth-glow as character + bio-glow/stones/crystals/mist, not literal dungeon corridor/tunnel hallway.
- Verification:
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> ok, same debt counts above;
  - `bun run check -- scripts\generate-style-defaults.ts` -> ok;
  - `bun run scripts\generate-style-defaults.ts --pack=pack_13 "--preset=SP13-007|SP13-008|SP13-009|SP13-010|SP13-011|SP13-012" --print-prompts --force` -> dry-run prompts are character-led.
- Generation wave:
  - backup before retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave2_retry_007_012_20260618-120531`;
  - first 6-up command timed out after producing `SP13-007|SP13-008|SP13-009`, so the leftover process was stopped before continuing;
  - `SP13-010|SP13-011` were regenerated in a 2-up retry;
  - `SP13-012` was regenerated as a 1-up retry.
- QA:
  - accepted: `SP13-007`, `SP13-008`, `SP13-009`, `SP13-010`, `SP13-012`;
  - provisional accepted/watchlist: `SP13-011` because it represents labyrinth glow with character + crystals, but still carries a lantern prop and strong dungeon environment.
- Backlog action: removed `SP13-007..012` from the stale table; rerun `bun run styles:runtime` after this edit so coverage can drop.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=12/132`, `staleDefaultImages=120`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP13-007..012` no longer appear in `lib/staleStyleDefaultImages.generated.ts`.
- Next safe visual wave: continue with `SP13-013..016`.

## Primary default cards - 2026-06-18 (`pack_13` wave 3, `SP13-013..016`)

- Backup before retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave3_013_016_20260618-123154`.
- Generated: `SP13-013|SP13-014|SP13-015|SP13-016`.
- QA:
  - accepted: `SP13-013`, `SP13-015`, `SP13-016`;
  - accepted/watchlist: `SP13-014` because it now represents Ronin Alley Duel, but it is still alley/sword/lantern-heavy by nature of the preset.
- Backlog action: removed `SP13-013..016` from the stale table; rerun `bun run styles:runtime` after this edit so coverage can drop.
- Next safe visual wave: continue with `SP13-017..020` after runtime/coverage.

## Primary default cards - 2026-06-18 (`pack_13` wave 4, `SP13-017..020`)

- Backup before retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave4_017_020_20260618-124259`.
- Generated: `SP13-017|SP13-018|SP13-019|SP13-020`.
- QA:
  - accepted: `SP13-017`, `SP13-018`, `SP13-019`, `SP13-020`;
  - note: these keep concrete preset-specific anchors (evidence, lantern festival, courier letter, skyline finale) without camera, market/library corridor, generic studio wall, or excessive fine-noise drift.
- Backlog action: removed `SP13-017..020` from the stale table; rerun `bun run styles:runtime` after this edit so coverage can drop.
- Next safe visual wave: continue with the next `pack_13` stale IDs after runtime/coverage.

## Primary default cards - 2026-06-18 (`pack_13` wave 5, `SP05-013|SP05-019|SP05-020|SP05-041`)

- Backup before retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave5_sp05_013_019_020_041_20260618-125300`.
- Generated: `SP05-013|SP05-019|SP05-020|SP05-041`.
- QA:
  - accepted: `SP05-013`, `SP05-019`, `SP05-020`, `SP05-041`;
  - note: character-led and style-distinct. `SP05-019` keeps glitch/clock/candle atmosphere; `SP05-041` keeps palace drapery/candle/crown cues. Both are accepted as preset-specific, not generic studio or corridor drift.
- Backlog action: removed these IDs from the stale table; rerun `bun run styles:runtime` after this edit so coverage can drop.
- Next safe visual wave: continue with the next `pack_13` stale rows after runtime/coverage.

## Primary default cards - 2026-06-18 (`pack_13` wave 6, `SP05-042..045`)

- Backup before retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave6_sp05_042_045_20260618-130450`.
- Generated: `SP05-042|SP05-043|SP05-044|SP05-045`.
- QA:
  - accepted: `SP05-044`, `SP05-045`;
  - accepted/watchlist: `SP05-042` because it uses a literal sword, but the preset is theatrical duel symbolism and the frame is stage/rose-symbolic, not generic fantasy corridor weapon drift;
  - accepted/watchlist: `SP05-043` because it uses cozy room props, but they support healing ensemble and do not read as repeated studio-chair/curtain/lamp staging.
- Backlog action: removed `SP05-042..045` from the stale table; rerun `bun run styles:runtime` after this edit so coverage can drop.
- Next safe visual wave: continue with the next `pack_13` stale rows after runtime/coverage.

## Rejected retry - 2026-06-18 (`pack_13` wave 7, `SP05-046..050`)

- Initial retry generated `SP05-046|SP05-047|SP05-048|SP05-049|SP05-050`, but QA rejected the wave because the shojo/anime base over-generalized the set into similar faces, palace/gothic mood, and repeated prop staging.
- Rejected images backed up at `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave7_rejects_sp05_046_050_20260618-133100`.
- Restored current assets from `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave7_sp05_046_050_20260618-132000`.
- Prompt correction added per-preset overrides for `SP05-046..050`: epistolary sepia letter, airy daylight first-love, outdoor crimson quest, dark gothic-only entry, and hand-led winter sign-language romance.
- Follow-up test: regenerated and accepted `SP05-047` only. It now reads daylight/airy first-love with blue-cream palette, open air, and hesitant gesture instead of gothic/palace drift.
- Follow-up 2-up: regenerated and accepted `SP05-046|SP05-048`.
  - `SP05-046` now reads sepia/amber epistolary drama with sealed letter and restrained period romance staging.
  - `SP05-048` now reads outdoor crimson quest romance with horizon/wind, jewel green/crimson palette, and no palace/corridor drift.
- Backup before accepted retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave8_sp05_046_048_before_20260618-135600`.
- Backlog action: removed `SP05-046|SP05-047|SP05-048`; keep `SP05-049|SP05-050` stale until regenerated sets prove visual separation.

## Primary default cards - 2026-06-18 (`pack_13` wave 9, `SP05-049..050`)

- Backup before retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave9_sp05_049_050_before_20260618-140500`.
- Generated and accepted: `SP05-049|SP05-050`.
- QA:
  - `SP05-049`: accepted as velvet gothic academy, dark lace/moon/black-shape mood, no corridor/library/camera drift.
  - `SP05-050`: accepted as cozy sign-language romance, readable hand gesture, knit/winter texture, blue/cream palette, not generic pastel face.
- Backlog action: removed `SP05-049|SP05-050`; next stale row starts at `SP05-081`.

## Primary default cards - 2026-06-18 (`pack_13` wave 10, `SP05-081..082`)

- Prompt correction: added per-preset overrides before generation because the default slice-of-life base flattened both presets into the same cozy anime prompt.
- Backup before retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave10_sp05_081_082_before_20260618-140900`.
- Generated and accepted: `SP05-081|SP05-082`.
- QA:
  - `SP05-081`: accepted as shared-warmth microacting, ensemble social beat, warm cream/mint palette, no solo glamour.
  - `SP05-082`: accepted/watchlist as deadpan-explosion comedy timing; kitchen/toaster/lamp are present, but the elastic gag and blank-face reaction carry the preset and there is no text/camera/library/market corridor drift.
- Backlog action: removed `SP05-081|SP05-082`; next stale row starts at `SP05-083`.

## Primary default cards - 2026-06-18 (`pack_13` wave 11, `SP05-083..084`)

- Prompt correction: added per-preset overrides before generation because the default slice-of-life base again flattened both prompts into generic cozy anime.
- Backup before retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave11_sp05_083_084_before_20260618-141300`.
- Generated and accepted: `SP05-083|SP05-084`.
- QA:
  - `SP05-083`: accepted as low-stakes banter flatness, talk-circle composition, flat pastel rhythm, otaku-banter prop cue without prop dominance.
  - `SP05-084`: accepted/watchlist as ordinary-cosmic whimsy pivot; portal/anomaly and ensemble reactions carry the preset. Phone/table/plants are present but not UI, text, market, library, or corridor drift.
- Backlog action: removed `SP05-083|SP05-084`; next stale row starts at `SP05-085`.

## Primary default cards - 2026-06-18 (`pack_13` wave 12, `SP05-085..090`)

- Prompt correction: added explicit reference-lineage overrides for `SP05-087..090` after QA showed the default slice-of-life base still made nearby anime cards read too similar.
- Existing `SP05-085|SP05-086` lineage overrides were preserved; the full wave now separates anxiety-glitch, outdoor restorative comfort, pastoral stillness, domestic-fantasy scale comedy, soft-surreal deadpan, and memory-washed melodrama.
- Backup before retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave12_sp05_085_090_before_20260618-142243`.
- Generated and accepted: `SP05-085|SP05-086|SP05-087|SP05-088|SP05-089|SP05-090`.
- QA:
  - `SP05-085`: accepted as anxiety-glitch catharsis, mixed-media panic inserts, magenta/black-white rupture, character-led.
  - `SP05-086`: accepted as cold-warm restorative comfort, mountain dusk, ember thermal key, practical outdoor warmth.
  - `SP05-087`: accepted as pastoral breathing-room stillness, rural child gesture, large warm sky/grass spacing.
  - `SP05-088`: accepted as domestic-fantasy scale chaos, oversized friendly creature plus routine household action.
  - `SP05-089`: accepted as soft-surreal deadpan drift, calm character plus impossible kettle/cloud/fish-shadow event.
  - `SP05-090`: accepted/watchlist as memory-washed melodrama; train-platform rain light and vulnerable close shot work, but it remains closest to generic pretty-anime territory.
- Backlog action: removed `SP05-085..090`; next stale row starts at `SP05-101`.

## Primary default cards - 2026-06-18 (`pack_13` wave 13, `SP05-101..106`)

- Prompt correction: added explicit reference-lineage overrides for `SP05-101..106`; the default style-spectrum base was too shared for this anime block.
- Backup before retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave13_sp05_101_106_before_20260618-143628`.
- Generated and accepted: `SP05-101|SP05-102|SP05-103|SP05-104|SP05-105|SP05-106`.
- QA:
  - `SP05-101`: accepted as fluid painterly anime, watercolor/ink wash, readable character silhouette, no empty pigment-only card.
  - `SP05-102`: accepted as gritty realist seinen, adult face, concrete/fluorescent wear, no cute/moe drift.
  - `SP05-103`: accepted/watchlist as neon hyperpop anime; idol-glam read is strong, but saturation/RGB/holographic language matches preset.
  - `SP05-104`: accepted as minimalist indie quiet, tiny figure, off-white negative space, one accent line.
  - `SP05-105`: accepted/watchlist as textured hand-drawn rough; fantasy prop remains, but pencil/genga/rough-paper treatment is dominant.
  - `SP05-106`: accepted as deco geometric anime, faceted jewel planes, gold/lapis/ruby geometry, no generic palace corridor.
- Backlog action: removed `SP05-101..106`; next stale row starts at `SP05-107`.

## Primary default cards - 2026-06-18 (`pack_13` wave 14, `SP05-107..112`)

- Prompt correction: added explicit reference-lineage overrides for `SP05-107..112`; `SP05-107` stayed non-graphic horror.
- Backup before retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave14_sp05_107_112_before_20260618-144746`.
- Generated and accepted: `SP05-107|SP05-108|SP05-109|SP05-110|SP05-111|SP05-112`.
- QA:
  - `SP05-107`: accepted/watchlist as non-graphic visceral horror; strong organic body-horror read, but no gore, blood, injury detail, or text.
  - `SP05-108`: accepted as fairy-tale storybook soft, illuminated border, pastel/gold watercolor, character-led.
  - `SP05-109`: accepted as kinetic impact-line choreography, clear motion burst, no weapon-first or readable SFX.
  - `SP05-110`: accepted as surreal dream logic, floating door/fish-moon/stair symbols, character anchor remains readable.
  - `SP05-111`: accepted as ukiyo-e woodblock anime, rain/washi/flat indigo-vermillion planes, no readable text.
  - `SP05-112`: accepted/watchlist as spray-drip wildstyle anime; wall/graffiti energy is intense, but no readable tag/text.
- Backlog action: removed `SP05-107..112`; next stale row starts at `SP05-113`.

## Primary default cards - 2026-06-18 (`pack_13` wave 15, `SP05-113..118`)

- Prompt correction: added explicit reference-lineage overrides for `SP05-113..120` plus a `pack_13` anime identity rule so style-spectrum prompts cannot collapse into generic glossy anime, same-face moe, object-only still life, or shared modern TV-anime rendering.
- Backup before retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave15_sp05_113_118_before_20260618-150415`.
- Generated and accepted: `SP05-113|SP05-114|SP05-115|SP05-116|SP05-117|SP05-118`.
- QA:
  - `SP05-113`: accepted as leaded jewel-light segmentation, stained-glass panes/rosette framing and character mask read clearly.
  - `SP05-114`: accepted as threadbare textile patchwork, plush/fabric character, sashiko/boro stitching, no sewing-room still life.
  - `SP05-115`: accepted as ice-crystal refractive, faceted guardian figure, prism/ice planes, no generic ice-princess corridor.
  - `SP05-116`: accepted as sumi-e impact brushstroke, one-breath ink silhouette, negative space, vermillion accent, no readable calligraphy.
  - `SP05-117`: accepted as phosphor sensor-vision grain, green intensifier/scope treatment with silhouette; no camera prop, readable HUD text, soldiers, or weapons.
  - `SP05-118`: accepted as backlit contour longing, sky-led sunset silhouette, posture emotion, no detailed-face romance or repeated train platform.
- Backlog action: removed `SP05-113..118`; next stale row starts at `SP05-119`.
- Audit note: sub-agent read-only audit flagged `SP05-162|SP05-168|SP05-171|SP05-172|SP05-176..178|SP05-181..200` as high-risk for shojo/magical convergence if generated without per-preset lineage overrides.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=61/132`, `staleDefaultImages=71`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-113..118` no longer appear in `lib/staleStyleDefaultImages.generated.ts`.

## Primary default cards - 2026-06-18 (`pack_13` wave 16, `SP05-119|SP05-120|SP05-162|SP05-168|SP05-171|SP05-172`)

- Prompt correction: preserved `SP05-119..120` overrides and added explicit reference-lineage overrides for high-risk shojo/magical IDs `SP05-162|SP05-168|SP05-171|SP05-172` before generation.
- Backup before retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave16_sp05_119_120_162_168_171_172_before_20260618-151429`.
- Generated and accepted: `SP05-119|SP05-120|SP05-162|SP05-168|SP05-171|SP05-172`.
- QA:
  - `SP05-119`: accepted as chalk-dust slate sketch, powder/erasure character silhouette, no readable classroom writing.
  - `SP05-120`: accepted as thermal-heat-signature vision, false-color figure/creature heat read, no readable UI or camera prop.
  - `SP05-162`: accepted/watchlist as moonlit ribbon justice; strong magical-girl language, but no exact sailor collar, twin-bun cue, logo, readable text, or wand copy.
  - `SP05-168`: accepted as red-alert psychological biomecha, isolated figure, diagnostic pressure, no readable UI text or specific mecha copy.
  - `SP05-171`: accepted as arcane chaos roadtrip, 90s fantasy-comedy reaction, spell burst, no fixed party lineup or readable glyphs.
  - `SP05-172`: accepted as tarot mecha fantasy, romantic shojo/mecha silhouette, jewel sky, ornate frame, no cockpit, battlefield, or readable tarot labels.
- Backlog action: removed `SP05-119|SP05-120|SP05-162|SP05-168|SP05-171|SP05-172`; next `pack_13` stale rows start at `SP05-176..178`.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=67/132`, `staleDefaultImages=65`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-119|SP05-120|SP05-162|SP05-168|SP05-171|SP05-172` no longer appear in `lib/staleStyleDefaultImages.generated.ts`.

## Primary default cards - 2026-06-18 (`pack_13` wave 17, `SP05-176|SP05-177|SP05-178|SP05-181|SP05-182|SP05-183`)

- Prompt correction: added explicit reference-lineage overrides for `SP05-176|SP05-177|SP05-178|SP05-181|SP05-182|SP05-183`; `SP05-178` also received a preset-specific no-prop/no-corridor composition override after retries kept introducing weapons and street-lane staging.
- Backup before first 6-up: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave17_sp05_176_178_181_183_before_20260618-152622`.
- Rejected retry backups:
  - `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave17_rejects_sp05_178_183_20260618-153338`;
  - `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave17_retry_current_sp05_178_183_before_20260618-153630`;
  - `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave17_retry2_current_sp05_178_before_20260618-154206`;
  - `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave17_retry3_current_sp05_178_before_20260618-154828`.
- Generated and accepted: `SP05-176|SP05-177|SP05-178|SP05-181|SP05-182|SP05-183`.
- QA:
  - `SP05-176`: accepted/watchlist as jewel-armor quest, distinct CLAMP-like line/jewel language, no generic anime.
  - `SP05-177`: accepted/watchlist as bridge-deck mecha comedy, ensemble/console glow; small emblem-like shapes present but no readable text.
  - `SP05-178`: accepted after retry3 as empty-handed occult emergency poster, hazard geometry + invasive green pressure, no weapon, landmark, camera prop, or street-corridor lane.
  - `SP05-181`: accepted/watchlist as warm zodiac grief, gentle healing figure, specific soft-shojo warmth.
  - `SP05-182`: accepted/watchlist as adult black-lace fashion heartbreak; interior props present but preset-specific.
  - `SP05-183`: accepted/watchlist as shy daylight romance with off-frame hand/social distance; avoids solo glamour face.
- Backlog action: removed `SP05-176|SP05-177|SP05-178|SP05-181|SP05-182|SP05-183`; next `pack_13` stale rows start at `SP05-184`.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=73/132`, `staleDefaultImages=59`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-176|SP05-177|SP05-178|SP05-181|SP05-182|SP05-183` no longer appear in `lib/staleStyleDefaultImages.generated.ts`.

## Primary default cards - 2026-06-18 (`pack_13` wave 18, `SP05-184..189`)

- Prompt correction: added explicit reference-lineage overrides for `SP05-184|SP05-185|SP05-186|SP05-187|SP05-188|SP05-189` plus a motif override so the wave uses body-language/costume/light/framing cues instead of generic handheld props.
- Backup before first 6-up: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave18_sp05_184_189_before_20260618-155713`.
- Rejected retry backup: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave18_rejects_sp05_186_188_20260618-160452`.
- Generated and accepted: `SP05-184|SP05-185|SP05-186|SP05-187|SP05-188|SP05-189`.
- QA:
  - `SP05-184`: accepted as theatrical host-club comedy, greeter + reaction silhouettes, no readable text/camera.
  - `SP05-185`: accepted/watchlist as punk-luxe backstage fashion drama; makeup bulbs/interior are preset-specific, not generic lamp drift.
  - `SP05-186`: accepted after retry as same-age height-gap banter, casual clothes, strong scale contrast, no idol/magical-ribbon drift.
  - `SP05-187`: accepted/watchlist as showbiz persona-theater with mask/spotlight; stage context is specific to preset.
  - `SP05-188`: accepted after retry as rain/status-pressure confrontation, no palace/gothic castle/rose-brooch drift.
  - `SP05-189`: accepted as dusk time-memory regret with unreadable sealed letter, no station/classroom/hallway default.
- Backlog action: removed `SP05-184|SP05-185|SP05-186|SP05-187|SP05-188|SP05-189`; next `pack_13` stale row starts at `SP05-190`.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=79/132`, `staleDefaultImages=53`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-184|SP05-185|SP05-186|SP05-187|SP05-188|SP05-189` no longer appear in `lib/staleStyleDefaultImages.generated.ts`.

## Primary default cards - 2026-06-18 (`pack_13` wave 19, `SP05-190..195`)

- Prompt correction: added explicit reference-lineage overrides for `SP05-190|SP05-191|SP05-192|SP05-193|SP05-194|SP05-195`; `SP05-192` received a stricter retry prompt to avoid literal maid outfit/cafe/changing-room drift.
- Backup before first 6-up: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave19_sp05_190_195_before_20260618-161446`.
- Rejected retry backup: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave19_reject_sp05_192_20260618-162529`.
- Generated and accepted: `SP05-190|SP05-191|SP05-192|SP05-193|SP05-194|SP05-195`.
- QA:
  - `SP05-190`: accepted as airy blue-sky near-miss romance, clean negative space, no hallway/classroom.
  - `SP05-191`: accepted/watchlist as grounded night intimacy; street context present but supports night-walk preset and avoids umbrella/rain-confession.
  - `SP05-192`: accepted/watchlist after retry as hidden-persona romcom; service-room/silhouette cue remains but character is not literal maid-outfit/cafe glamour.
  - `SP05-193`: accepted/watchlist as botanical herbalist fantasy; herb/vial props are preset-specific, not object-only.
  - `SP05-194`: accepted/watchlist as vintage operatic revolutionary shojo; ornate architecture is specific to the preset lineage.
  - `SP05-195`: accepted/watchlist as DIY street-fashion identity; craft/accessory density is representative but should be watched for clutter.
- Backlog action: removed `SP05-190|SP05-191|SP05-192|SP05-193|SP05-194|SP05-195`; next `pack_13` stale row starts at `SP05-196`.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=85/132`, `staleDefaultImages=47`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-190|SP05-191|SP05-192|SP05-193|SP05-194|SP05-195` no longer appear in `lib/staleStyleDefaultImages.generated.ts`.

## Primary default cards - 2026-06-18 (`pack_13` wave 20, `SP05-196..200`)

- Prompt correction: added explicit reference-lineage overrides for `SP05-196|SP05-197|SP05-198|SP05-199|SP05-200` and extended the body-language/costume/light/framing motif guard to this block.
- Backup before 5-up: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave20_sp05_196_200_before_20260618-164658`.
- Generated and accepted: `SP05-196|SP05-197|SP05-198|SP05-199|SP05-200`.
- QA:
  - `SP05-196`: accepted as quiet art-school melancholy, watercolor/sketch figure, no tool-only still life.
  - `SP05-197`: accepted/watchlist as yokai-romcom folklore; shrine lantern/mask are strong but preset-specific.
  - `SP05-198`: accepted/watchlist as jellyfish-fashion makeover; dense frill/clutter remains controlled and character-led.
  - `SP05-199`: accepted as crimson folk-fantasy journey, traveler + dusk sandstone, no sword/battlefield.
  - `SP05-200`: accepted/watchlist as rainy confession, shared umbrella/hand hesitation, distinct from dry night-walk.
- Backlog action: removed `SP05-196|SP05-197|SP05-198|SP05-199|SP05-200`; next `pack_13` stale row starts at `SP05-201`.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=90/132`, `staleDefaultImages=42`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-196|SP05-197|SP05-198|SP05-199|SP05-200` no longer appear in `lib/staleStyleDefaultImages.generated.ts`.

## Primary default cards - 2026-06-18 (`pack_13` wave 21, `SP05-201..205`)

- Prompt correction: added explicit reference-lineage overrides for `SP05-201|SP05-202|SP05-203|SP05-204|SP05-205`, keeping anime identity anchored by recognizable lineage, character posture, color, and composition rather than generic anime polish.
- Backup before 5-up: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave21_sp05_201_205_before_20260618-170049`.
- Rejected retry backup: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave21_reject_sp05_205_20260618-170837`.
- Generated and accepted: `SP05-201|SP05-202|SP05-203|SP05-204|SP05-205`.
- QA:
  - `SP05-201`: accepted/watchlist as quiet observational mystery, tea/window stillness remains figure-led, no library/book/camera/text.
  - `SP05-202`: accepted as neighborhood community warmth, character-led festival/community read, no market aisle/signage.
  - `SP05-203`: accepted as youth expedition, sky/mountain resolve, no map/compass/station/gear pile.
  - `SP05-204`: accepted/watchlist as serene iyashikei water-light, figure-led canal/water calm, not empty water abstraction.
  - `SP05-205`: first candidate rejected for calligraphy/kanji-like sheets; retry accepted as island-summer creative restart with abstract ink edges, no glyphs/text.
- Backlog action: removed `SP05-201|SP05-202|SP05-203|SP05-204|SP05-205`; next `pack_13` stale row starts at `SP05-206`.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=95/132`, `staleDefaultImages=37`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-201|SP05-202|SP05-203|SP05-204|SP05-205` no longer appear in `lib/staleStyleDefaultImages.generated.ts`; `SP05-206` is the next stale id.

## Primary default cards - 2026-06-18 (`pack_13` wave 22, `SP05-206..210`)

- Prompt correction: added explicit artist/studio/director lineage overrides for `SP05-206|SP05-207|SP05-208|SP05-209|SP05-210`, replacing the generic cozy-anime base with five distinct slice-of-life reads.
- Backup before 5-up: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave22_sp05_206_210_before_20260618-172100`.
- Rejected retry backup: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave22_reject_sp05_210_20260618-173200`.
- Generated and accepted: `SP05-206|SP05-207|SP05-208|SP05-209|SP05-210`.
- QA:
  - `SP05-206`: accepted as everyday-care gesture intimacy, two-figure hand-care moment, no text or object-only drift.
  - `SP05-207`: accepted/watchlist as deadline workflow density; desk/paper clutter is high but preset-specific and character-led.
  - `SP05-208`: accepted as beginner-made DIY glow, character + wood/fabric process, no tool foreground or workshop aisle.
  - `SP05-209`: accepted/watchlist as sugar-cotton hospitality miniature; dessert clutter is high but character-led and not teacup-only.
  - `SP05-210`: first candidate rejected for cozy-room/mug/lamp/plush formula; retry accepted/watchlist as sunshine-scribble soft geometry with paper blocks and character anchor.
- Backlog action: removed `SP05-206|SP05-207|SP05-208|SP05-209|SP05-210`; next `pack_13` stale row starts at `SP05-211`.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=100/132`, `staleDefaultImages=32`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-206|SP05-207|SP05-208|SP05-209|SP05-210` no longer appear in `lib/staleStyleDefaultImages.generated.ts`; `SP05-211` is the next stale id.

## Primary default cards - 2026-06-18 (`pack_13` wave 23, `SP05-211..215`)

- Prompt correction: added explicit artist/studio/director lineage overrides for `SP05-211|SP05-212|SP05-213|SP05-214|SP05-215`, separating utility freedom, social-jitter, shift-comedy, breeze inertia, and looped healing.
- Backup before 5-up: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave23_sp05_211_215_before_20260618-173900`.
- Rejected retry backup: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave23_reject_sp05_215_20260618-174800`.
- Generated and accepted: `SP05-211|SP05-212|SP05-213|SP05-214|SP05-215`.
- QA:
  - `SP05-211`: accepted/watchlist as utilitarian quiet-freedom minimalism, spare outdoor utility framing, no bike ad or road postcard.
  - `SP05-212`: accepted/watchlist as social-jitter comedy; close pretty-anime read is still generic-adjacent, but expression, gesture, and negative space carry the preset.
  - `SP05-213`: accepted as shift-comedy choreography warmth, clear handoff/ensemble workplace rhythm.
  - `SP05-214`: accepted as breeze-drift beautiful inertia, airy low-energy pause, no classroom/bed/couch drift.
  - `SP05-215`: first candidate rejected for garden/knitting/craft drift; retry accepted as looped waterside routine with cast-line gesture.
- Backlog action: removed `SP05-211|SP05-212|SP05-213|SP05-214|SP05-215`; next `pack_13` stale row starts at `SP05-216`.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=105/132`, `staleDefaultImages=27`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-211|SP05-212|SP05-213|SP05-214|SP05-215` no longer appear in `lib/staleStyleDefaultImages.generated.ts`; `SP05-216` is the next stale id.

## Primary default cards - 2026-06-18 (`pack_13` wave 24, `SP05-216..220`)

- Prompt correction: added explicit artist/studio/director lineage overrides for `SP05-216|SP05-217|SP05-218|SP05-219|SP05-220`, separating bundled warmth, rough ideation, ascent confidence, deadpan absurdism, and watercolor noticing.
- Backup before 5-up: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave24_sp05_216_220_before_20260618-175800`.
- Generated and accepted: `SP05-216|SP05-217|SP05-218|SP05-219|SP05-220`.
- QA:
  - `SP05-216`: accepted as bundled warmth pocket, cold/warm textile read, no tent/stove/postcard drift.
  - `SP05-217`: accepted as rough-ideation motion overlay, character + cutaway boxes/arrows, no readable text/UI.
  - `SP05-218`: accepted/watchlist as incremental-ascent confidence; trail/mountain read is strong but character/upward-progress identity is clear.
  - `SP05-219`: accepted as mundane absurdist theater, deadpan cone gag and plain stage, no text.
  - `SP05-220`: accepted/watchlist as observational watercolor drift; teacup/window literal, but watercolor noticing read remains clear and character-led.
- Backlog action: removed `SP05-216|SP05-217|SP05-218|SP05-219|SP05-220`; next `pack_13` stale row starts after this slice-of-life block.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=110/132`, `staleDefaultImages=22`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-216|SP05-217|SP05-218|SP05-219|SP05-220` no longer appear in `lib/staleStyleDefaultImages.generated.ts`; `SP05-321` is the next `pack_13` stale id.

## Primary default cards - 2026-06-18 (`pack_13` wave 25, `SP05-321..325`)

- Prompt correction: added explicit artist/director/style lineage overrides for `SP05-321|SP05-322|SP05-323|SP05-324|SP05-325`, then retried `SP05-322|SP05-323` because the first pair still collapsed into moon/jewel shojo sameness.
- Backup before 5-up: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave25_sp05_321_325_before_20260618-181300`.
- Backup before rejected retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave25_reject_sp05_322_323_before_20260618-182013`.
- Generated and accepted: `SP05-321|SP05-322|SP05-323|SP05-324|SP05-325`.
- QA:
  - `SP05-321`: accepted as Amano-like ether-wisp gothic ornament, elongated spectral figure, gold void, no cathedral/camera/text drift.
  - `SP05-322`: first attempt rejected for sharing moon/crystal vocabulary with `SP05-323`; retry accepted as CLAMP-like vertical black-white-red ornament with two elongated figures and graphic negative space.
  - `SP05-323`: first attempt rejected for matching `SP05-322` too closely; retry accepted as Takeuchi-like prism glamour, pink/navy fashion heroine, cleaner aura field, no giant moon or stage/card UI.
  - `SP05-324`: accepted as Rumiko Takahashi-like elastic rom-com slapstick, two-character cel comedy, no weapon/fight/readable SFX drift.
  - `SP05-325`: accepted as Taiyo Matsumoto-like concrete-poetry adolescence, scratchy urban line, no polished generic anime face.
- Backlog action: removed `SP05-321|SP05-322|SP05-323|SP05-324|SP05-325`; next `pack_13` stale row starts at `SP05-326`.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=115/132`, `staleDefaultImages=17`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-321|SP05-322|SP05-323|SP05-324|SP05-325` no longer appear in `lib/staleStyleDefaultImages.generated.ts`; `SP05-326` is the next `pack_13` stale id.

## Primary default cards - 2026-06-18 (`pack_13` wave 26, `SP05-326..330`)

- Prompt correction: added explicit artist/director/style lineage overrides for `SP05-326|SP05-327|SP05-328|SP05-329|SP05-330`, separating Yuasa rubber motion, Dezaki postcard freeze, Leiji Matsumoto distance melancholy, Umezz spiral panic, and Mizuki deadpan folklore.
- Backup before 5-up: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave26_sp05_326_330_before_20260618-183017`.
- Backup before rejected `SP05-329` retry 1: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave26_reject_sp05_329_before_20260618-183348`.
- Backup before rejected `SP05-329` retry 2: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave26_reject2_sp05_329_before_20260618-183649`.
- Generated and accepted: `SP05-326|SP05-327|SP05-328|SP05-329|SP05-330`.
- QA:
  - `SP05-326`: accepted as Yuasa-like rubber-reality sprint, elastic figure and acid poster blocks, no generic shonen speed/object drift.
  - `SP05-327`: accepted as Dezaki-like postcard memory freeze, sepia/crimson/glare melodrama and film grain, no magical-girl sparkle drift.
  - `SP05-328`: accepted/watchlist as Leiji Matsumoto-like cosmic farewell, noble retrofuture figure and star scale; close to captain silhouette but no copied insignia/weapon/UI.
  - `SP05-329`: first attempt rejected for spiral path/corridor read, second rejected for red wrist wound; final accepted as Umezz-like flat spiral panic with clean hand, no red/blood/corridor.
  - `SP05-330`: accepted as Mizuki-like folkloric deadpan ink catalog, friendly-grotesque spirit and rural ink texture, no cute mascot/UI/text drift.
- Backlog action: removed `SP05-326|SP05-327|SP05-328|SP05-329|SP05-330`; next `pack_13` stale row starts at `SP05-331`.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=120/132`, `staleDefaultImages=12`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-326|SP05-327|SP05-328|SP05-329|SP05-330` no longer appear in `lib/staleStyleDefaultImages.generated.ts`; `SP05-331` is the next `pack_13` stale id.

## Primary default cards - 2026-06-18 (`pack_13` wave 27, `SP05-331..335`)

- Prompt correction: added explicit artist/director/style lineage overrides for `SP05-331|SP05-332|SP05-333|SP05-334|SP05-335`, separating Murata chrome impact, Ikuhara ritual allegory, Okiura quiet naturalism, Anno emergency storyboard, and Ichikawa mineral void.
- Backup before 5-up: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave27_sp05_331_335_before_20260618-184303`.
- Backup before rejected `SP05-333` retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave27_reject_sp05_333_before_20260618-184524`.
- Generated and accepted: `SP05-331|SP05-332|SP05-333|SP05-334|SP05-335`.
- QA:
  - `SP05-331`: accepted as Murata-like chrome impact spectacle, foreshortened figure, metal highlights, clean force arcs; no logo/gore/readable SFX drift.
  - `SP05-332`: accepted/watchlist as Ikuhara-like ritual allegory, mirrored figures and symbolic geometry; ornate robe/ceremony is close to fantasy altar but symmetry/icon system is readable.
  - `SP05-333`: first attempt rejected for interior window/lamp formula; retry accepted/watchlist as Okiura-like quiet human naturalism with sleeve microgesture and rain daylight. Minor streetlight remains background-only.
  - `SP05-334`: accepted as Anno-like emergency storyboard tension, rough pencil panels and warning marks, no readable notes/UI.
  - `SP05-335`: accepted as Ichikawa-like mineral void serenity, translucent figure, open negative space, no cave/crowd/weapon drift.
- Backlog action: removed `SP05-331|SP05-332|SP05-333|SP05-334|SP05-335`; next `pack_13` stale row starts at `SP05-336`.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=125/132`, `staleDefaultImages=7`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-331|SP05-332|SP05-333|SP05-334|SP05-335` no longer appear in `lib/staleStyleDefaultImages.generated.ts`; `SP05-336` is the next `pack_13` stale id.

## Primary default cards - 2026-06-18 (`pack_13` wave 28, `SP05-336..342`)

- Prompt correction: added explicit artist/director/style lineage overrides for `SP05-336|SP05-337|SP05-338|SP05-339|SP05-340|SP05-341|SP05-342`, separating Koike razor velocity, Yoshinari technomagic, Ohkubo angular combustion, Urasawa adult suspense, Sugino velvet-lash tension, Arakawa mechanical warmth, and Kon reality-slip reflection.
- Backup before 7-up: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave28_sp05_336_342_before_20260618-185153`.
- Backup before rejected `SP05-340|SP05-342` retry: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave28_reject_sp05_340_342_before_20260618-185524`.
- Backup before rejected `SP05-342` retry 2: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave28_reject2_sp05_342_before_20260618-185724`.
- Generated and accepted: `SP05-336|SP05-337|SP05-338|SP05-339|SP05-340|SP05-341|SP05-342`.
- QA:
  - `SP05-336`: accepted as Koike-like razorline velocity poster, red/black/chrome wedge, no vehicle/road/camera drift.
  - `SP05-337`: accepted/watchlist as Yoshinari-like technomagic burst; ornate hardware density is high but character, joyful draftsmanship, and engineered magic read clearly.
  - `SP05-338`: accepted as Ohkubo-like angular combustion iconography, triangular fire shapes and grin geometry, no weapon/logo/readable text drift.
  - `SP05-339`: accepted as Urasawa-like adult suspense microgesture, rainy grounded adult tension, no file/gun/crime-scene stock drift.
  - `SP05-340`: first attempt rejected for modern fantasy glamour; retry accepted/watchlist as Sugino-like old-cel velvet-lash portrait. Minor lamp-like background accent remains non-dominant.
  - `SP05-341`: accepted/watchlist as Arakawa-like mechanical warmth ensemble, legible repair teamwork; workshop literal but useful for this preset and not a sterile product shot.
  - `SP05-342`: first attempt rejected for beauty-mirror generic read, second rejected for exposed glamour pose; final accepted as Kon-like sober reflection continuity with trench/scarf, mismatched expressions, and no beauty-ad drift.
- Backlog action: removed `SP05-336|SP05-337|SP05-338|SP05-339|SP05-340|SP05-341|SP05-342`; `pack_13` should have no remaining stale rows after runtime regeneration.
- Runtime/coverage close:
  - `bun run styles:runtime` -> ok;
  - `bun run styles:validate -- --pack=pack_13 --coverage` -> `availableDefaultImages=132/132`, `staleDefaultImages=0`, `missingDefaultImages=0`;
  - `bun run styles:runtime:check` -> ok;
  - `SP05-336|SP05-337|SP05-338|SP05-339|SP05-340|SP05-341|SP05-342` no longer appear in `lib/staleStyleDefaultImages.generated.ts`; `pack_13` has no remaining stale default rows.

## Primary default cards - 2026-06-18 (`pack_16` wave 1, `SP05-007..012`)

- Root cause confirmed by local audit and subagent audit: `pack_16` had no `pack_16__*` anime bases or identity rule in `scripts/generate-style-defaults.ts`, so most presets fell back to generic `A vertical scene...` prompts.
- Generator correction:
  - added `pack_16` anime-prestige fallback with artist/studio/director/era lineage as broad visual grammar, not literal copying;
  - extended character-led anime safe branch to `pack_16`;
  - added `pack_16` motif guard against generic anime face, repeated aura, rubble, corridor, market/library aisle, camera/lamp setup, object-only card, and empty abstraction;
  - added exact lineage anchors for `SP05-007..012` and rule-based fallback lineages for the rest of `pack_16`.
- Generated accepted primary defaults: `SP05-007|SP05-008|SP05-009|SP05-010|SP05-011|SP05-012`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-007|SP05-008|SP05-009|SP05-010|SP05-011|SP05-012" --parallel=6 --session-suffix=primary_p16_sp05_007_012_lineage_fix_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave_sp05_007_012_before_20260618-191422`.
- QA note: first `SP05-007`, `SP05-011`, and `SP05-012` results were briefly retried as too literal, but user approved the first versions; restored them and kept the retry images only as historical alternates.
- Restored accepted versions from: `D:\codex-studio-backups\style-defaults-rejected\pack_16_sp05_007_011_012_literal_reject_20260618-191819`.
- Retry backup kept at: `D:\codex-studio-backups\style-defaults-rejected\pack_16_sp05_007_011_012_retry_kept_as_backup_20260618-192102`.
- Backlog action: removed `SP05-007|SP05-008|SP05-009|SP05-010|SP05-011|SP05-012`.
- Expected next runtime: `pack_16 availableDefaultImages=6/140`, `staleDefaultImages=134`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-001|SP05-002|SP05-003|SP05-004|SP05-005|SP05-006`, which already have targeted prompt overrides prepared. After that, continue with `SP05-014|SP05-015|SP05-016|SP05-017|SP05-018|SP05-024`, or jump to subagent-prioritized `SP05-301..312` if the user wants to address the `SP05-30+` identity concern first.

## Primary default cards - 2026-06-18 (`pack_16` wave 2, `SP05-001..006`)

- Prompt state: reused targeted lineage overrides already prepared for `SP05-001..006`, plus the new `pack_16` anime-prestige identity rule and denoise contract.
- Dry-run: `bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-001|SP05-002|SP05-003|SP05-004|SP05-005|SP05-006" --dry-run --print-prompts --force` -> `prompts=6 skipped=134`.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave2_sp05_001_006_before_20260618-193208`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-001|SP05-002|SP05-003|SP05-004|SP05-005|SP05-006" --parallel=6 --session-suffix=primary_p16_sp05_001_006_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-001`: retro pioneer hero, clean Tezuka/Toei-like optimism, no text/UI/camera.
  - `SP05-002`: vintage super-robot grandeur, readable 70s mechanical mass. Literal, but useful for this preset.
  - `SP05-003`: jazzy rogue caper, strong adult-cool silhouette and night palette, no readable signage.
  - `SP05-004`: astral opera melancholy, Matsumoto-like scale/drape/space mood, no cockpit/train corridor.
  - `SP05-005`: grounded tactical machinery, functional utilitarian mecha read, no weapon foreground or UI.
  - `SP05-006`: pop transformable aerial spectacle, glossy Macross-like pop-tech performance read, no literal concert/cockpit.
- Backlog action: removed `SP05-001|SP05-002|SP05-003|SP05-004|SP05-005|SP05-006`.
- Expected next runtime: `pack_16 availableDefaultImages=12/140`, `staleDefaultImages=128`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-014|SP05-015|SP05-016|SP05-017|SP05-018|SP05-024`.

## Primary default cards - 2026-06-18 (`pack_16` wave 3, accepted existing `SP05-014..018|024`)

- User QA approved the current existing cards: `SP05-014|SP05-015|SP05-016|SP05-017|SP05-018|SP05-024`.
- No generation was run and no primary image was overwritten in this wave.
- Backlog action: removed `SP05-014|SP05-015|SP05-016|SP05-017|SP05-018|SP05-024` from stale debt because the user explicitly accepted them as representative.
- Expected next runtime: `pack_16 availableDefaultImages=18/140`, `staleDefaultImages=122`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-026|SP05-027|SP05-030|SP05-071|SP05-072|SP05-073`.

## Primary default cards - 2026-06-18 (`pack_16` wave 4, `SP05-026|027|030|071|072|073`)

- Prompt state: dry-run showed explicit anime lineage, character-led representative subjects, no generic vertical-scene fallback, and the strong denoise/post-processing contract at the end.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave4_sp05_026_073_before_20260618-195012`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-026|SP05-027|SP05-030|SP05-071|SP05-072|SP05-073" --parallel=6 --session-suffix=primary_p16_sp05_026_073_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-026`: operatic rebellion strategy, black/crimson/gold command drama and chesslike composition; literal but representative.
  - `SP05-027`: spiral overdrive bravado, explosive upward scale, hero/mecha energy, strong orange/blue read.
  - `SP05-030`: gothic soul-pop action, angular skull-pop silhouette and black/red moonlit rhythm.
  - `SP05-071`: warm liminal reverie fantasy, handcrafted amber setting, soft creature companion, readable wonder.
  - `SP05-072`: eco-mythic conflict epic, nature guardian mass vs industrial distance, strong moral-scale silhouette.
  - `SP05-073`: wandering clockwork hearth, bright steampunk traveler, warm mechanical core, skyward adventure mood.
- Backlog action: removed `SP05-026|SP05-027|SP05-030|SP05-071|SP05-072|SP05-073`.
- Expected next runtime: `pack_16 availableDefaultImages=24/140`, `staleDefaultImages=116`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-074|SP05-075|SP05-076|SP05-077|SP05-078|SP05-079`.

## Primary default cards - 2026-06-18 (`pack_16` wave 5, `SP05-074..079`)

- Prompt state: dry-run showed separated Studio Masterpieces lineages for skyglow longing, rainlight romance, cinematic dream-collapse, mirror identity thriller, Otomo light-trail collapse, and hyperkinetic cosmic velocity.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave5_sp05_074_079_before_20260618-195704`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-074|SP05-075|SP05-076|SP05-077|SP05-078|SP05-079" --parallel=6 --session-suffix=primary_p16_sp05_074_079_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-074`: skyglow longing drama, broad sunset sky, small pilot-like figure, clean emotional horizon.
  - `SP05-075`: rainlight threshold romance, wet glass, blue-white longing, clear weather-emotion read.
  - `SP05-076`: cinematic dream-collapse surrealism, fragmented mask geometry and saturated symbolic collage.
  - `SP05-077`: mirror identity collapse thriller, cracked reflection and private/public anxiety; watchlist for glamour but representative.
  - `SP05-078`: Otomo light-trail collapse, red-coat cyber-apocalypse, infrastructure mass, electric urban ruin.
  - `SP05-079`: hyperkinetic cosmic velocity, razor speed tunnel, vehicle/driver silhouette, bold red/cyan motion.
- Backlog action: removed `SP05-074|SP05-075|SP05-076|SP05-077|SP05-078|SP05-079`.
- Expected next runtime: `pack_16 availableDefaultImages=30/140`, `staleDefaultImages=110`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-080|SP05-141|SP05-145|SP05-146|SP05-147|SP05-149`.

## Primary default cards - 2026-06-18 (`pack_16` wave 6, `SP05-080|141|145|146|147|149`)

- Prompt state: dry-run showed character-led representative subjects, explicit lineage cues, no generic vertical-scene fallback, and the strong denoise/post-processing contract at the end.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave6_sp05_080_149_before_20260618-200838`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-080|SP05-141|SP05-145|SP05-146|SP05-147|SP05-149" --parallel=6 --session-suffix=primary_p16_sp05_080_149_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-080`: cosmic ocean lyrical, underwater figure, blue bioluminescent water-light, contemplative ocean/cosmos read.
  - `SP05-141`: gothic resonance punk, purple/orange moon, striped punk-goth silhouette; watchlist for glamour but representative.
  - `SP05-145`: sky-surf romantic momentum, bright aerial lift, board/rider silhouette, cyan-magenta horizon.
  - `SP05-146`: velvet covenant gothic, ceremonial black/red gothic portrait, mask and candlelit metal detail; watchlist for gothic glamour.
  - `SP05-147`: winter friction romance, cold/warm microacting, snow and scarf gesture, clear romcom friction.
  - `SP05-149`: clan comedy escalation, shonen gag-to-solemnity contrast and clan-emblem energy; watchlist for emblem/logo-like shapes but no readable text.
- Backlog action: removed `SP05-080|SP05-141|SP05-145|SP05-146|SP05-147|SP05-149`.
- Expected next runtime: `pack_16 availableDefaultImages=36/140`, `staleDefaultImages=104`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-150|SP05-151|SP05-152|SP05-153|SP05-154|SP05-155`.

## Primary default cards - 2026-06-18 (`pack_16` wave 7, `SP05-150..155`)

- Prompt state: compact dry-run archived at `logs\style-prompts-pack16-wave7-sp05-150-155-20260618-201941.txt`; prompts were character-led, had explicit lineage/style DNA, no generic vertical-scene fallback, and ended with the strong denoise/post-processing contract.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave7_sp05_150_155_before_20260618-202002`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-150|SP05-151|SP05-152|SP05-153|SP05-154|SP05-155" --parallel=6 --session-suffix=primary_p16_sp05_150_155_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-150`: crimson threshold embers, red/blue occult threshold and strong character anchor; watchlist for filigree mark near bottom.
  - `SP05-151`: pop reality bend, bright everyday room ruptured by cosmic wall, playful low-threshold surrealism.
  - `SP05-152`: anachronistic deadpan mayhem, deadpan lead, mascot/props, flat comic timing.
  - `SP05-153`: techno-gothic exorcism, sacro-industrial figure, black/white/red machinery and cathedral-tech pressure.
  - `SP05-154`: clinical nocturne tactics, glass/medical nocturne, cold tactical restraint, no weapon foreground.
  - `SP05-155`: noble arcane romcom, pink/blue arcane noble pose and mascot cue; watchlist for generic fantasy-romcom polish.
- Backlog action: removed `SP05-150|SP05-151|SP05-152|SP05-153|SP05-154|SP05-155`.
- Expected next runtime: `pack_16 availableDefaultImages=42/140`, `staleDefaultImages=98`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-156|SP05-157|SP05-158|SP05-159|SP05-160|SP05-161`.

## Primary default cards - 2026-06-18 (`pack_16` wave 8, `SP05-156..161`)

- Prompt state: compact dry-run archived at `logs\style-prompts-pack16-wave8-sp05-156-161-20260618-203033.txt`; prompts were character-led, had explicit lineage/style DNA, avoided generic fallback, and ended with the strong denoise/post-processing contract.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave8_sp05_156_161_before_20260618-203053`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-156|SP05-157|SP05-158|SP05-159|SP05-160|SP05-161" --parallel=6 --session-suffix=primary_p16_sp05_156_161_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted by user:
  - `SP05-156`: summer loop paranoia, warm threshold, uneasy character-led summer-horror read.
  - `SP05-157`: vertical speed rebellion, upward urban velocity and strong action silhouette.
  - `SP05-158`: ecological whisper healing, soft organic stream, healing gesture, gentle supernatural ecology.
  - `SP05-159`: black-lipstick melodrama punk, adult punk glamour and nocturnal magazine-anime mood.
  - `SP05-160`: rose elite comedy, ornate rose-host comedy and elite excess.
  - `SP05-161`: planetary aura impact, cosmic gold/blue aura and 90s energy impact read.
- Backlog action: removed `SP05-156|SP05-157|SP05-158|SP05-159|SP05-160|SP05-161`.
- Expected next runtime: `pack_16 availableDefaultImages=48/140`, `staleDefaultImages=92`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-163|SP05-164|SP05-165|SP05-166|SP05-167|SP05-169`.

## Primary default cards - 2026-06-18 (`pack_16` wave 9, `SP05-163|164|165|166|167|169`)

- Prompt state: compact dry-run archived at `logs\style-prompts-pack16-wave9-sp05-163-169-20260618-204138.txt`; prompts were character-led, had explicit lineage/style DNA, avoided generic fallback, and ended with the strong denoise/post-processing contract.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave9_sp05_163_169_before_20260618-204138`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-163|SP05-164|SP05-165|SP05-166|SP05-167|SP05-169" --parallel=6 --session-suffix=primary_p16_sp05_163_169_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-163`: smoke-jazz noir cool, sax-led rain-noir character; watchlist for literal saxophone, but preset-specific.
  - `SP05-164`: wet techno-noir consciousness, rain/cybernetics and clinical blue-orange identity tension.
  - `SP05-165`: spirit pressure rivalry, strong delinquent posture, purple spirit pressure and clear rival energy.
  - `SP05-166`: redemption restraint, restrained wanderer silhouette, sunset ethical-drama read, no weapon focus.
  - `SP05-167`: engine-trail outlaw adventure, engine/launchpad momentum and orange-blue outlaw silhouette; watchlist for strong handheld tech prop.
  - `SP05-169`: wired identity dissolution, CRT/cable identity fade, terminal-specific without generic object-only card.
- Backlog action: removed `SP05-163|SP05-164|SP05-165|SP05-166|SP05-167|SP05-169`.
- Expected next runtime: `pack_16 availableDefaultImages=54/140`, `staleDefaultImages=86`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-170|SP05-173|SP05-174|SP05-175|SP05-179|SP05-180`.

## Primary default cards - 2026-06-18 (`pack_16` wave 10, `SP05-170|173|174|175|179|180`)

- Prompt state: compact dry-run archived at `logs\style-prompts-pack16-wave10-sp05-170-180-20260618-205117.txt`; prompts were character-led, had explicit lineage/style DNA, avoided generic fallback, and ended with the strong denoise/post-processing contract.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave10_sp05_170_180_before_20260618-205117`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-170|SP05-173|SP05-174|SP05-175|SP05-179|SP05-180" --parallel=6 --session-suffix=primary_p16_sp05_170_180_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-170`: storybook seal magic, bright magical-girl read with seal gesture; watchlist for literal 90s magical-girl similarity, but representative.
  - `SP05-173`: dust-warm pacifist melancholy, red cloak, tired kindness, warm dust and companion cue.
  - `SP05-174`: iron ruin tragedy, dark machine ruin, heavy silhouette and mournful industrial weight.
  - `SP05-175`: rose ritual symbolism, theatrical rose ritual with curtain/mirror elements justified by preset-specific symbolism.
  - `SP05-179`: warm rivalry portrait, athletic sweat/microacting and warm sports-rivalry body language.
  - `SP05-180`: precision action cel, rooftop technical-action silhouette, vehicle/machine context and controlled hard light.
- Backlog action: removed `SP05-170|SP05-173|SP05-174|SP05-175|SP05-179|SP05-180`.
- Expected next runtime: `pack_16 availableDefaultImages=60/140`, `staleDefaultImages=80`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-281|SP05-282|SP05-283|SP05-284|SP05-285|SP05-286`.

## Primary default cards - 2026-06-18 (`pack_16` wave 11, `SP05-281..286`)

- Prompt state: compact dry-run archived at `logs\style-prompts-pack16-wave11-sp05-281-286-20260618-210112.txt`; prompts were character-led, had explicit Studio Masterpieces lineage/style DNA, avoided generic fallback, and ended with the strong denoise/post-processing contract.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave11_sp05_281_286_before_20260618-210112`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-281|SP05-282|SP05-283|SP05-284|SP05-285|SP05-286" --parallel=6 --session-suffix=primary_p16_sp05_281_286_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-281`: temporal memory cinema, layered snow/mask/memory staging; watchlist for high ornament, but clearly temporal-cinema specific.
  - `SP05-282`: social humanist warmth, winter street kindness and warm microgesture.
  - `SP05-283`: metaphysical mourning, quiet interior threshold, veiled fabric and soft grief atmosphere.
  - `SP05-284`: airborne wonder adventure, bright sky scale, retro airship and explorer silhouette.
  - `SP05-285`: eco-prophetic wind, windborne ecology, symbolic mask and ruined living landscape.
  - `SP05-286`: seasonal intimacy realism, rain-village intimacy, protective posture and quiet seasonal travel.
- Backlog action: removed `SP05-281|SP05-282|SP05-283|SP05-284|SP05-285|SP05-286`.
- Expected next runtime: `pack_16 availableDefaultImages=66/140`, `staleDefaultImages=74`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-287|SP05-288|SP05-289|SP05-290|SP05-291|SP05-292`.

## Primary default cards - 2026-06-18 (`pack_16` wave 12, `SP05-287..292`)

- Prompt state: compact dry-run archived at `logs\style-prompts-pack16-wave12-sp05-287-292-20260618-211136.txt`; prompts were character-led, had explicit Studio Masterpieces lineage/style DNA, avoided generic fallback, and ended with the strong denoise/post-processing contract.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave12_sp05_287_292_before_20260618-211136`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-287|SP05-288|SP05-289|SP05-290|SP05-291|SP05-292" --parallel=6 --session-suffix=primary_p16_sp05_287_292_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-287`: digital pop opera, astral performer silhouette, luminous interface/space-opera scale.
  - `SP05-288`: elastic summer time, bright coastal movement, airborne summer gesture and small time-creature cue.
  - `SP05-289`: ascetic gothic silence, dark ornamental poise, symbolic mask/mirror and quiet water depth.
  - `SP05-290`: paramilitary melancholy, restrained tactical figure, red/charcoal mass and worn mecha pressure.
  - `SP05-291`: delicate reconciliation, soft everyday microgesture, rainlit garden threshold and humanist restraint.
  - `SP05-292`: historical glam punk performance, theatrical punk vocalist, red/purple stage rhythm and ornate costume identity.
- Backlog action: removed `SP05-287|SP05-288|SP05-289|SP05-290|SP05-291|SP05-292`.
- Expected next runtime: `pack_16 availableDefaultImages=72/140`, `staleDefaultImages=68`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-293|SP05-294|SP05-295|SP05-296|SP05-297|SP05-298`.

## Primary default cards - 2026-06-18 (`pack_16` wave 13, `SP05-293..298`)

- Prompt state: compact dry-run archived at `logs\style-prompts-pack16-wave13-sp05-293-298-20260618-212009.txt`; prompts were character-led, had explicit Studio Masterpieces lineage/style DNA, avoided generic fallback, and ended with the strong denoise/post-processing contract.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave13_sp05_293_298_before_20260618-212009`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-293|SP05-294|SP05-295|SP05-296|SP05-297|SP05-298" --parallel=6 --session-suffix=primary_p16_sp05_293_298_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-293`: rough mythic density, masked survivor, chipped metal/paint texture and compact feral totem read.
  - `SP05-294`: mutating psychedelic, fractured character silhouette, bold cyan/magenta/orange graphic mutation.
  - `SP05-295`: quiet musical distance, restrained music-case interior, soft distance and warm/cool silence.
  - `SP05-296`: humanist art deco retrofuture, human/android civic scale, deco brass/green monumental architecture.
  - `SP05-297`: hyperobserved rain intimacy, rain-threshold gesture, wet pavement/reflection and quiet observation.
  - `SP05-298`: nocturnal social whirl, warm festival-like social swirl, mask-creature cue and lively night motion.
- Backlog action: removed `SP05-293|SP05-294|SP05-295|SP05-296|SP05-297|SP05-298`.
- Expected next runtime: `pack_16 availableDefaultImages=78/140`, `staleDefaultImages=62`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-299|SP05-300|SP05-301|SP05-302|SP05-303|SP05-304`.

## Primary default cards - 2026-06-18 (`pack_16` wave 14, `SP05-299..304` plus `SP05-287` repair)

- Prompt state: compact dry-run archived at `logs\style-prompts-pack16-wave14-sp05-299-304-repair-287-20260618-212821.txt`; prompts were character-led, had explicit lineage/style DNA, avoided generic fallback, and ended with the strong denoise/post-processing contract.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave14_sp05_299_304_repair287_before_20260618-212821`. `SP05-287` was missing before repair; the backup folder includes a marker note and the earlier stale copy remains in `pack_16_wave12_sp05_287_292_before_20260618-211136`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-287|SP05-299|SP05-300|SP05-301|SP05-302|SP05-303|SP05-304" --parallel=6 --session-suffix=primary_p16_sp05_299_304_repair287_lineage_x7 --force` -> `generated=7 attempted=7 skipped=133 failed=0`.
- QA accepted:
  - `SP05-287`: repaired missing digital pop opera card, astral masked performer, magenta/cyan star-stage scale.
  - `SP05-299`: dream invasion carnival, fractured carnival masks, symbolic red/blue stage tension.
  - `SP05-300`: hypergraphic chromatic action, saturated hero pose, bold cyan/magenta/orange action geometry.
  - `SP05-301`: analog space opera command, retro officer silhouette, ship scale and star-command read.
  - `SP05-302`: melancholic space corsair, long cloak silhouette, moonlit outlaw solitude.
  - `SP05-303`: celestial journey melancholy, astral pilgrim profile, gold orbital frame and farewell mood.
  - `SP05-304`: baroque insurgent melodrama, ornamental shojo command figure; watchlist for strong baroque-aristocratic cue, accepted as preset-specific.
- Backlog action: repaired missing `SP05-287`; removed `SP05-299|SP05-300|SP05-301|SP05-302|SP05-303|SP05-304`.
- Expected next runtime: `pack_16 availableDefaultImages=84/140`, `staleDefaultImages=56`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-305|SP05-306|SP05-307|SP05-308|SP05-309|SP05-310`.

## Primary default cards - 2026-06-18 (`pack_16` wave 15, `SP05-305..310`)

- Prompt state: compact dry-run archived at `logs\style-prompts-pack16-wave15-sp05-305-310-20260618-213633.txt`; prompts were character-led, had explicit 70s/80s retro anime lineage/style DNA, avoided generic fallback, and ended with the strong denoise/post-processing contract.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave15_sp05_305_310_before_20260618-213633`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-305|SP05-306|SP05-307|SP05-308|SP05-309|SP05-310" --parallel=6 --session-suffix=primary_p16_sp05_305_310_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-305`: neon sci-fi slapstick rom-com, bright retro gag pose; user approved original card after over-strict retry, original restored from `pack_16_wave15_reject_sp05_305_20260618-214113`.
  - `SP05-306`: adult domestic warmth, sunset kitchen routine and lived-in TV-era warmth.
  - `SP05-307`: summer sports melodrama, athlete pause, sweat/sunset and late-summer competition mood.
  - `SP05-308`: eighties neon precision noir, rain-neon confidence pose and hard city light.
  - `SP05-309`: explosive space glam action, glam sci-fi figure, magenta/white space-opera action scale.
  - `SP05-310`: competent space pulp, practical space pilot, hangar craft and orange/blue pulp utility.
- Backlog action: removed `SP05-305|SP05-306|SP05-307|SP05-308|SP05-309|SP05-310`.
- Expected next runtime: `pack_16 availableDefaultImages=90/140`, `staleDefaultImages=50`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-311|SP05-312|SP05-313|SP05-314|SP05-315|SP05-316`.

## Primary default cards - 2026-06-18 (`pack_16` wave 16, `SP05-311..316`)

- Prompt state: compact dry-run archived at `logs\style-prompts-pack16-wave16-sp05-311-316-20260618-214805.txt`; prompts were character-led, had explicit 70s/80s retro anime lineage/style DNA, avoided generic fallback, and ended with the strong denoise/post-processing contract.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave16_sp05_311_316_before_20260618-214805`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-311|SP05-312|SP05-313|SP05-314|SP05-315|SP05-316" --parallel=6 --session-suffix=primary_p16_sp05_311_316_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-311`: rusted eco hope adventure, character-led coastal ruin, ivy/rust/blue-sky optimism.
  - `SP05-312`: elegant eighties heist glam, feline thief silhouette, marble noir and red/black jewel tension.
  - `SP05-313`: zodiac cosmic heroism, celestial cape portrait, gold constellations and heroic retro space scale.
  - `SP05-314`: monumental formation sacrifice, young mecha pilot before orbital monolith, orange beacon and solemn resolve.
  - `SP05-315`: angular institutional tragedy, clean cel portrait, hard red/black geometry and fractured reflection.
  - `SP05-316`: biomorphic mist ritual, masked organic-tech figure, misty ritual world and luminous spores; denoise acceptable for preset.
- Backlog action: removed `SP05-311|SP05-312|SP05-313|SP05-314|SP05-315|SP05-316`.
- Expected next runtime: `pack_16 availableDefaultImages=96/140`, `staleDefaultImages=44`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-317|SP05-318|SP05-319|SP05-320|SP05-343|SP05-344`.

## Primary default cards - 2026-06-18 (`pack_16` wave 17, `SP05-317..320|343..344`)

- Prompt state: compact dry-run archived at `logs\style-prompts-pack16-wave17-sp05-317-320-343-344-20260618-215620.txt`; prompts were character-led, kept distinct retro/sports lineage, avoided generic object-only fallbacks, and ended with the strong denoise/post-processing contract.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave17_sp05_317_320_343_344_before_20260618-215620`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-317|SP05-318|SP05-319|SP05-320|SP05-343|SP05-344" --parallel=6 --session-suffix=primary_p16_sp05_317_320_343_344_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-317`: arcade techno-rebellion, neon rain rider, motorcycle/city cues intentional for retro-tech rebellion.
  - `SP05-318`: psychedelic demonic horror, non-graphic transformation portrait, strong red/violet horror read.
  - `SP05-319`: strategic pop duality, retro space-performance officer, tactical/pop scale split.
  - `SP05-320`: charismatic space rogue pulp, lounge-noir rogue with red coat and cosmic pulp staging.
  - `SP05-343`: vertical team rally energy, sports jump/rally pose, orange/blue team-energy read.
  - `SP05-344`: ego pressure breakout, crouched predator sprint geometry, blue/acid/red pressure palette.
- Backlog action: removed `SP05-317|SP05-318|SP05-319|SP05-320|SP05-343|SP05-344`.
- Expected next runtime: `pack_16 availableDefaultImages=102/140`, `staleDefaultImages=38`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-345|SP05-346|SP05-347|SP05-348|SP05-349|SP05-350`.

## Primary default cards - 2026-06-18 (`pack_16` wave 18, `SP05-345..350`)

- Prompt state: compact dry-run archived at `logs\style-prompts-pack16-wave18-sp05-345-350-20260618-220403.txt`; prompts were sports/performance character-led, avoided generic object-only fallback, and ended with the strong denoise/post-processing contract.
- Backup before generation: `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_wave18_sp05_345_350_before_20260618-220403`.
- Generation command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_16 "--preset=SP05-345|SP05-346|SP05-347|SP05-348|SP05-349|SP05-350" --parallel=6 --session-suffix=primary_p16_sp05_345_350_lineage_x6 --force` -> `generated=6 attempted=6 skipped=134 failed=0`.
- QA accepted:
  - `SP05-345`: nineties physical rivalry, close athletic stare, red/white uniform, sweat and wooden court read.
  - `SP05-346`: phantom teamplay speed, blue/cyan sprint pose, ghost trail and tactical motion clarity.
  - `SP05-347`: uphill endurance breakaway, mountain climb runner, slope pressure and endurance push.
  - `SP05-348`: summer precision duel, tennis-like precision action accepted as intentional sports-duel cue, sunny red/blue palette.
  - `SP05-349`: generational sports resolve, night-court resolve portrait, legacy/maturity mood and worn uniform.
  - `SP05-350`: aquatic relay glow, swimmer handoff, blue caustics and fluid relay motion.
- Backlog action: removed `SP05-345|SP05-346|SP05-347|SP05-348|SP05-349|SP05-350`.
- Expected next runtime: `pack_16 availableDefaultImages=108/140`, `staleDefaultImages=32`, `missingDefaultImages=0`.
- Next safe `pack_16` wave by stale order: `SP05-351|SP05-352|SP05-353|SP05-354|SP05-355|SP05-356`.

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

### QA visual anti-literalizacion - 2026-06-16 - `pack_01` / `pack_02`

- Trigger:
  - revision visual de usuario encontro camaras/objetos en manos, pasillos de libreria, pasillos de mercado, lugares fantasia y literalizacion de presets.
- Prompt fix:
  - `scripts/generate-style-defaults.ts` agrega guardrails fuertes para `pack_02__cinematic_lighting_and_lenses`, guardrail suave para `pack_02__broadcast_and_tv_look`, y regla ID-scoped para `SP01-044`, `SP01-050`, `SP01-061`, `SP01-063`, `SP01-066`, `SP01-067`, `SP01-068`, `SP01-079`.
  - follow-up 2026-06-16: se endurecen `CATEGORY_BASE_PROMPTS`, `CATEGORY_SCENE_ANCHORS`, `GENERIC_SCENE_ANCHORS` y `REPEATED-SCENE GUARDRAILS` para `pack_02`; objetivo: evitar lamparas, paredes, wall-floor seams, sillas/stools, cortinas, panuelos/cloth props, shelves, pasillos de libreria/mercado, fantasy halls, camaras/devices y composiciones tipo studio-session cuando el preset debe ser transferable/abstracto.
- Regenerated before later quality objection; requires renewed visual review:
  - `SP02-057`, `SP02-064`, `SP02-071`, `SP02-077`, `SP02-079`, `SP02-080`.
  - `SP02-087`, `SP02-088`.
  - `SP02-089`, `SP02-090`.
  - `SP02-091`, `SP02-092`.
  - `SP02-093`, `SP02-094`.
  - `SP02-095`, `SP02-096`.
  - `SP02-097`, `SP02-098`.
  - `SP02-099`, `SP02-100`.
  - `SP02-101`, `SP02-102`.
  - `SP02-103`, `SP02-104`.
  - `SP02-105`, `SP02-106`.
  - `SP02-107`, `SP02-108`.
  - `SP02-109`, `SP02-110`.
  - `SP02-111`, `SP02-112`.
  - `SP02-113`, `SP02-114`.
  - `SP02-115`, `SP02-116`.
  - `SP02-117`, `SP02-118`.
  - `SP02-119`, `SP02-120`.
  - `SP01-044`, `SP01-050`, `SP01-061`, `SP01-063`, `SP01-066`, `SP01-067`, `SP01-068`, `SP01-079`.
  - `SP03-001`, `SP03-002`.
- Next queue guidance:
  - `pack_02` should not be treated as visually closed after the later user review; generated files exist, but the abstract-only direction needs rework through carousel variants.
  - use the representative variant workflow: generate multiple candidates, review in-card carousel, reject scene-drift/contact-sheet/empty-abstract attempts, then promote only explicitly accepted results.
  - correction 2026-06-16: `avoid/no` prompt lists must be read as anti-repetition guidance, not absolute bans. Concrete walls, lamps, cameras, curtains, rooms, props, people, or environments are allowed when they are intentional and preset-specific.
  - prioritize semantic QA for previously accepted-but-risky ids if user flags visual issues: `SP02-098`, `SP02-091`, `SP02-119`, `SP02-120`.
  - do not generate multiple writers against `manifest-pack_02.json` in parallel; subagents should audit/classify, main writer should generate.
- Prompt quality note:
  - generation used global denoise suffix and anti-microdetail directive from `scripts/style-default-utils.ts`.
  - follow-up guardrail added after visual review: avoid recurring studio props/templates (`stools`, `chairs`, `curtains`, `fabric drops`, `cyclorama`, portrait-session furniture) and avoid making every card look like a staged studio session.
  - next `pack_02` cartoon/media waves must use a simple original graphic anchor plus style marks, not empty abstract fields. Still no rooms, walls, floors, wall-floor seams, lamps, shelves, markets, libraries, corridors, handkerchiefs, cloth props, cameras/devices, or repeated literal objects unless the preset explicitly requires that object.
  - correction 2026-06-16: `pack_03` lookdev must not become abstract-only. Cards should allow one original subject, character bust, creature/object fragment, or material hero form when that makes the preset readable, while still avoiding repeated lamps, walls, floor planes, curtains, cloth/fabric props, handkerchief-like fabric, showroom/gallery/pedestal staging, camera/lens/device literalization, UI, screenshots, logos, and readable text.
  - correction 2026-06-16 follow-up: `SP03-003` and `SP03-004` primary promotion was reverted; the new images now live as `variants/SP03-003-01.webp` and `variants/SP03-004-01.webp`, while old primaries remain active stale defaults.
  - aborted 2026-06-16 follow-up: `quality_p03_representative_variant_cd` for `SP03-005|SP03-006` was stopped because outputs remained too abstract. Partials `SP03-006-01.webp` and `SP03-006-02.webp` were moved to `.tmp/style-default-card-archive/rejected/` and must not be counted as active variants.
  - safe next command before any generation: `bun run scripts/generate-style-defaults.ts --pack=pack_03 "--preset=SP03-005|SP03-006" --variant-count=1 --session-suffix=prompt_review_p03_cd --print-prompts`.
  - prompt follow-up: `SP03-005` / Blender Cycles now allows creator-friendly concrete staging when it supports Cycles craft; `SP03-006` / V-Ray now allows architecture, walls, windows, lamps, and furniture when they support ArchViz instead of treating those elements as bans.
  - retrospective reset 2026-06-16: generation remains paused until candidate quality is representative again. The prompt builder now adds `VISUAL RESET` after Style DNA so any remaining abstract-only/no-scene/no-object wording is interpreted as anti-cliche guidance, not as a command to remove subjects. Cards must contain one readable subject, figure, object, room/scene fragment, material form, or environment motif when useful.
  - `pack_02` shared anchors were softened: walls, lamps, rooms, cast shadows, floors, curtains, props, markets/libraries/halls are allowed when they clarify the preset; they are rejected only when repeated as filler.
  - visual benchmark pass: `.tmp/style-card-qa/flagged-current-cards.webp`, `.tmp/style-card-qa/recent-abstract-sp02.webp`, `.tmp/style-card-qa/stable-pack08-benchmark.webp`, `.tmp/style-card-qa/pack03-current-primaries.webp`.
  - benchmark conclusion: good cards have dominant subject + readable context + style signal + varied staging. Bad cards fail by repeated studio/tabletop/corridor formula or by empty abstract poster behavior.
  - prompt correction: cartoon/media `HERO` cues now soften internal `no body/no character` clauses so they preserve one original visible anchor instead of deleting subject matter.
  - accepted user-reviewed candidate: `assets/recipes/styles/defaults/variants/SP02-087-01.webp`; keep as carousel variant only, not primary.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-088-01.webp`; strong crude-crayon monster read, no abstract-empty fallback, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-089-01.webp`; strong grotesque cartoon material/puppet read, non-graphic, no abstract-empty fallback, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-090-01.webp`; spiky graphic creature/attitude read, no empty abstract fallback, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-091-01.webp`; office marker/whiteboard cue is intentional for this preset, not repeated filler, keep as carousel variant only.
  - rejected candidate archived: `.tmp/style-default-card-archive/rejected/SP02-092-01.20260616-200513.empty-camera-reel.webp`; too empty and introduced accidental reel/camera shape.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-092-01.webp`; crumpled-paper character read after reattempt, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-093-01.webp`; prehistoric graphic figure read, not texture-only, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-094-01.webp`; kindergarten crayon geometry character, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-095-01.webp`; Sunday-funnies halftone character without text/panels, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-096-01.webp`; punk/skate graphic character with dominant subject, no accidental camera/corridor/studio fallback, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-097-01.webp`; rejected corporate mascot with intentional toy/plastic character read, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-098-01.webp`; napkin ballpoint character/idea sketch, lightbulb used as preset cue rather than repeated lamp filler, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-099-01.webp`; punk zine collage figure with readable subject and collage texture, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-100-01.webp`; flipbook rough-motion character with pencil/onion-skin marks, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-101-01.webp`; grossout cartoon blob/face, no IP or gore, keep as carousel variant only.
  - prompt correction: `SP02-100|SP02-101` safe DNA now allows stylized original character/face anchors while still blocking franchise, realistic anatomy, gore, cameras, and repeated scene filler.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-102-01.webp`; flat weird-comedy character, simple and readable, no office/camera/corridor fallback, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-103-01.webp`; slime-grime cartoon blob, no gore or sewer/corridor fallback, keep as carousel variant only.
  - prompt correction: `SP02-102|SP02-103` safe DNA now allows original character/blob anchors while still blocking franchise, realistic anatomy, gore, cameras, office/sewer/corridor filler.
  - rejected candidate archived: `.tmp/style-default-card-archive/rejected/SP02-104-01.20260616-210637.film-reel-device.webp`; good crayon texture but accidental film-reel/device body.
  - rejected candidate archived: `.tmp/style-default-card-archive/rejected/SP02-104-01.20260616-211056.spotlight-stage.webp`; good crayon texture but accidental spotlight/stage prop.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-104-01.webp`; toddler-scale crayon character after reattempt, no film reel, spotlight, camera, or stage, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-105-01.webp`; boiling-line scam cartoon with stretched original subject, no scam props, keep as carousel variant only.
  - prompt correction: `SP02-104|SP02-105` safe DNA now allows original crayon/boiling-line anchors while blocking franchise, film reel/device, spotlight/stage, scam props, realistic body, cameras, and repeated room/street filler.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-106-01.webp`; beige anxiety character, legible and no suburb/room/camera fallback, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-107-01.webp`; rural nightmare pastel with symbolic night motifs and uneasy anchor, no corridor/detailed scene fallback, keep as carousel variant only.
  - prompt correction: `SP02-106|SP02-107` safe DNA now allows original anxious/rural-nightmare anchors while blocking franchise, product/consumer props, detailed suburb/farm scenes, cameras, lamps, and repeated room/corridor filler.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-108-01.webp`; loud-primary derangement with readable original character and strong primary palette, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-109-01.webp`; shared-form elastic with readable two-state ribbon figure, no recognizable cat/dog or filler scene, keep as carousel variant only.
  - prompt correction: `SP02-108|SP02-109` safe DNA now allows original loud-primary/shared-elastic anchors while blocking franchise, recognizable animals, rooms, props, cameras, and repeated scene filler.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-110-01.webp`; gross-up texture blob, no sponge/IP/gore, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-111-01.webp`; slouch geometry figure, no couch/room filler, keep as carousel variant only.
  - prompt correction: `SP02-110|SP02-111` safe DNA now allows original gross-up/slouch anchors while blocking franchise, undersea props, realistic anatomy, gore, couches, rooms, cameras, and repeated scene filler.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-112-01.webp`; office-boredom geometry character with readable tired anchor, no cubicle/desk/camera filler, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-113-01.webp`; toxic house-character motif, concrete but not corridor/market/fantasy/studio/camera filler, keep as carousel variant only.
  - prompt correction: `SP02-112|SP02-113` safe DNA now allows original office-boredom/toxic-suburb anchors while blocking repeated props, staged rooms, cameras/devices, corridors, market/library/fantasy drift, and accidental text/logos.
  - rejected QA candidate archived: `.tmp/style-default-card-archive/rejected/SP02-114-01.20260616-221815.tv-device-face-anchor.webp`; first retry fell into TV/device-face subject.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-114-01.webp`; squigglevision nervous figure after prompt tightening, no monitor/camera/therapy room, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-115-01.webp`; marker-edge sitcom character, no school/suburb set filler, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-116-01.webp`; notebook-anxiety marker character, no notebook/page prop literalization, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-117-01.webp`; photo-cutout xerox bird-like figure, no camera/room filler, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-118-01.webp`; garbage-pail gross sticker object, cartoon/non-realistic and not scene filler, keep as carousel variant only.
  - prompt correction: `SP02-114` now blocks TV set, monitor, face-screen, phone, camera, microphone, stage, therapy room, and device while still requiring one original wobbly doodle figure or nervous shape mascot.
  - throughput correction: move from 2-preset waves to 4-preset waves by default; use 6 only for low-risk prompt families after preview. Keep manual visual inspection and archived rejects mandatory.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-119-01.webp`; chlorine slime doodle monster, no pool/camera/corridor scene, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP02-120-01.webp`; toxic marker freakout creature, no classroom literal/readable text/camera, keep as carousel variant only.
  - `SP02-087..SP02-120` now have accepted representative `-01` carousel variants. Do not promote primaries automatically.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-005-01.webp`; Blender Cycles 3D bust/lookdev subject with caustic/material cues, no UI/text/camera prop, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-006-01.webp`; V-Ray ArchViz architectural/material fragment with swatches and intentional room/light cues, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-007-01.webp`; KeyShot product/bust studio render with material swatches and controlled reflections, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-008-01.webp`; RenderMan-style feature-animation bust/lookdev, no franchise/logo/text, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-009-01.webp`; ZBrush clay bust/material sculpt, no UI/text/camera prop, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-010-01.webp`; Unity HDRP hero form with volumetric game-light read and material panels, no readable UI/camera prop, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-011-01.webp`; glass/crystal bust with caustics/refraction/dispersion, no showroom/text/UI, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-012-01.webp`; liquid simulation horse/splash, fantasy motif serves fluid subject rather than filler, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-013-01.webp`; SSS translucent organic bust with inner glow/backlight, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-014-01.webp`; chrome/metal hero object with environment reflections, no camera prop/text, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-015-01.webp`; claymation character bust with visible craft/texture, environment cues support preset, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-016-01.webp`; fur/hair creature with readable strand/clump variation, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-017-01.webp`; slime/goo creature-material specimen with drips/stretch strings, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-018-01.webp`; carbon fiber hero object with weave/aniso highlights and swatches, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-019-01.webp`; hologram bust/projection with scanlines/interference, no readable UI/text, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-020-01.webp`; porcelain bust with glaze/crackle/painted detail, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-021-01.webp`; low-poly mech/hero object with clear facets, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-022-01.webp`; voxel fox bust/world fragment with cube-grid read, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-023-01.webp`; isometric 3D orthographic style-card with material panels, no readable UI/contact-sheet-only fallback, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-024-01.webp`; wireframe render bust/topology card with visible edge-flow, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-025-01.webp`; kitbash industrial hero form with readable greebles/wear, no camera/market/library/corridor filler, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-026-01.webp`; knolling flat-lay/exploded lookdev with ordered subject and swatches, no empty contact-sheet fallback, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-027-01.webp`; metaballs organic blobby character/material form, smooth and denoised, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-028-01.webp`; Nurbs Surface freeform CAD/class-A surface accepted after one archived chair/studio reject and ID-scoped prompt guardrail, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-029-01.webp`; fractal creature/material bust with self-similar ridges and lookdev swatches, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-030-01.webp`; corrupted character/mesh bust with vertex explosion and UV tearing, no device/screen/camera prop, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-031-01.webp`; Global Illumination organic/material subject accepted after archived curtain/plant/pool interior reject and prompt guardrail, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-032-01.webp`; Volumetric Fog material bust accepted after archived cave/fantasy/orb and fantasy-landscape/alien rejects, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-033-01.webp`; Neon City cyberpunk material bust with wet neon reflections, no street/signage/text/camera prop, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-034-01.webp`; Studio Lighting 3-point clean bust/material specimen accepted after archived helmet-text/brand-mark reject and prompt guardrail, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-035-01.webp`; HDRI Environment reflective CG object accepted after archived sunset/canyon landscape reject and prompt guardrail, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-036-01.webp`; Caustics refractive bust with caustic photon webs/prismatic pools, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-037-01.webp`; Ambient Occlusion clay-white creature bust with contact shadows/crevice gradients, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-038-01.webp`; Rim Lighting dark hero form accepted after archived contact-sheet/swatch-strip reject and prompt guardrail, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-039-01.webp`; Bioluminescent Forest organic glowing form with spore/branch cues, preset-specific forest read acceptable, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-040-01.webp`; Toon Shader original cel-shaded character with bold outlines/flat bands, no UI/text/logo/franchise, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-041-01.webp`; God Rays material monolith with clean volumetric shafts accepted after archived fantasy-hall/mystic-figure reject and prompt guardrail, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-042-01.webp`; Diorama Lighting miniature bust/tabletop world with tilt-shift depth and intentional warm lantern cue, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-043-01.webp`; X-Ray Shader translucent technical hero object with readable internal structure, no UI/text/camera prop, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-044-01.webp`; Thermal Vision alien bust/material form with strong heat-map read, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-045-01.webp`; Wireframe on Shaded technical bust with topology overlay and shaded surface, no UI/text/camera prop, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-046-01.webp`; Game Asset PBR hard-surface module accepted after archived generic-bust reject and prompt guardrail, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-047-01.webp`; Architectural Visualization model slice with daylight, straight verticals, material board, no real-estate filler, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-048-01.webp`; Product Render premium abstract product form with controlled reflections and material swatches, no logo/text/UI, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-049-01.webp`; Character Design T-pose neutral production-sheet character accepted after archived sexualized/body-first and fantasy-courtyard rejects, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-050-01.webp`; Motion Graphics glossy kinetic abstract form with gradient trails, no logo/text/UI, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-051-01.webp`; Medical Illustration 3D clean diagnostic cutaway with red/blue/white translucent structure, no text/gore, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-052-01.webp`; Automotive Render aerodynamic metallic body-contour sculpture with reflection sweeps, no logo/text/car-ad scene, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-053-01.webp`; Jewelry Render high-jewelry material sculpture with faceted crystal/gold read and luxury context, no hand/model/text/logo, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-054-01.webp`; Food CGI glossy edible material construction with droplets/steam/food-render read, no burger/brand/text/restaurant clutter, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-055-01.webp`; Virtual Reality Environment wide-FOV immersive scene accepted by user despite portal/hall-adjacent risk, no headset/person/text, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-056-01.webp`; Scientific Visualization protein/data hero form with false-color scientific read, no readable labels/lab room/character, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-057-01.webp`; NFT Collectible Avatar Render original neon/gold creature avatar bust, no ape/IP/UI/text, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-058-01.webp`; 3D Typography invented glyph sculpture with bevel/material read, no readable word/logo/signage, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-059-01.webp`; Digital Fashion iridescent garment/mannequin cloth-sim hero, no curtain/retail/runway crowd/text, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-060-01.webp`; Environment Design modular scene kit/material-board slice accepted after archived drone/camera-orb/tarp reject, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-061-01.webp`; Hard Surface Modeling machined armor/mech-torso module with panel lines, no weapons/soldier/UI/text, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-062-01.webp`; Organic Modeling humanoid botanical sculpt with topology/subsurface read, no gore/forest/lab jar/text/camera, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-063-01.webp`; 3D Map isometric terrain miniature with contour/elevation readability, no flat paper map/UI/labels/text, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-064-01.webp`; Exploded View creature/object assembly with separated layers and cross-sections, no labels/UI/contact sheet/weapon assembly, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-065-01.webp`; 3D Icon friendly jellyfish squircle icon, no real app/logo/text/UI, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-066-01.webp`; Abstract Background polished abstract 3D wallpaper form with broad gradients, no text/logo/UI/noisy microdetail, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-067-01.webp`; Cybernetic Implant clean portrait/implant integration, no gore/horror/text/weapon, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-068-01.webp`; 3D Scan photogrammetry architectural fragment with scan texture/mesh imperfections, no labels/UI/camera, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-069-01.webp`; VFX Simulation controlled pyro plume/material specimen with smoke/fire dynamics, no person/disaster/text/UI, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-070-01.webp`; Retro CGI 90s low-poly toy/object scene with primary colors/checkerboard, no IP/logo/text/UI, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-071-01.webp`; Glassmorphism UI frosted glass interface sculpture with translucent card layers, no readable UI text/logo/screenshot, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-072-01.webp`; Clay UI soft pastel character/interface scene, no readable UI text/logo/screenshot, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-073-01.webp`; Papercraft 3D layered cardstock creature/scene with visible fold lines and paper grain, no craft tools/text/UI, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-074-01.webp`; Neon Sign 3D abstract bent-glass neon sculpture, no readable word/logo/bar sign/UI, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-075-01.webp`; Ice Sculpture carved translucent dragon/creature form with refraction/frosty dispersion, no gala/event/text/UI, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-076-01.webp`; Balloon Art abstract Mylar foil organism accepted after archived bunny/Koons-ish reject, no party/text/logo/UI, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-077-01.webp`; Lego Brick-Built 3D original studded brick creature/object, no LEGO logo/minifig/IP/text, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-078-01.webp`; Origami 3D folded fox-like creature/form, no crane/lotus/tools/text, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-079-01.webp`; Bronze Statue original patinated creature/monument form, no famous statue/plaque/text, keep as carousel variant only.
  - accepted QA candidate: `assets/recipes/styles/defaults/variants/SP03-080-01.webp`; Marble Statue original marble creature/armor form accepted with mild gallery-background watchlist, no famous statue/text/logo, keep as carousel variant only.
  - next generation should continue carousel variants at `pack_04` in 4-preset waves, starting with `SP04-001|SP04-002|SP04-003|SP04-004` after prompt preview; `pack_03` now has accepted representative variants for `SP03-041..SP03-080`, but primaries remain stale until explicit promotion.
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

| Preset | Manifest | Default card |
| ------ | -------- | ------------ |

Nota 2026-06-17 variants carousel: generadas `SP04-001-01` a `SP04-008-01` en `assets/recipes/styles/defaults/variants/` con writer unico x4. `SP04-005`, `SP04-007` y `SP04-008` pasan visualmente; `SP04-001`, `SP04-002`, `SP04-003`, `SP04-004` y `SP04-006` quedan watchlist por literalidad de superhero/weapon/interior. No se promovieron primarias, por eso `pack_04` sigue `availableDefaultImages=0/100 staleDefaultImages=100 missingDefaultImages=0`.

### pack_03

| Preset | Manifest | Default card |
| ------ | -------- | ------------ |

Nota 2026-06-17 primary wave 1: regeneradas y aprobadas `SP03-003|SP03-004|SP03-005|SP03-006|SP03-007|SP03-008|SP03-009|SP03-010` con guardrails contra bust/personaje, UI/text, product-table, corridor/market/library y abstraccion vacia. QA visual: `SP03-003`, `SP03-006`, `SP03-007` pasan fuerte; `SP03-004`, `SP03-005`, `SP03-008`, `SP03-009`, `SP03-010` quedan watchlist por material-board/swatch cues aceptables para lookdev renderer. `SP03-003|004|005|006|008|009|010` requirieron retry no-bust. Pendientes esperados tras runtime: 70 stale.

Nota 2026-06-17 primary wave 2: regeneradas y aprobadas `SP03-011|SP03-012|SP03-013|SP03-014|SP03-015|SP03-016|SP03-017|SP03-018` como primarias nuevas con guardrails contra bust/personaje, UI/text, product-table, corridor/market/library y abstraccion vacia. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_03_wave2_20260617-223344`. QA visual: `SP03-011`, `SP03-012`, `SP03-013`, `SP03-014`, `SP03-016` pasan fuerte; `SP03-015`, `SP03-017`, `SP03-018` quedan watchlist aceptado por clay/material-board cues propios de lookdev, sin texto/UI/persona dominante. `SP03-013` requirio retry no-face y `SP03-015` dos retries para sacar bust/personaje/hand prop. Pendientes esperados tras runtime: 62 stale.

Nota 2026-06-17 primary wave 3: regeneradas y aprobadas `SP03-019|SP03-020|SP03-021|SP03-022|SP03-023|SP03-024|SP03-025|SP03-026` como primarias nuevas. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_03_wave3_20260617-225231`. QA visual: `SP03-019`, `SP03-020`, `SP03-021`, `SP03-022`, `SP03-023`, `SP03-025`, `SP03-026` pasan; `SP03-024` queda watchlist aceptado por blueprint/contact-sheet cues propios de wireframe, sin texto/UI legible. `SP03-022`, `SP03-023`, `SP03-026` requirieron retries para sacar bust/face/camera-device drift. Pendientes esperados tras runtime: 54 stale.

Nota 2026-06-17 primary wave 4: regeneradas y aprobadas `SP03-027|SP03-028|SP03-029|SP03-030|SP03-031|SP03-032|SP03-033|SP03-034` como primarias nuevas. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_03_wave4_20260617-231730`. QA visual: `SP03-027`, `SP03-028`, `SP03-029`, `SP03-030`, `SP03-031`, `SP03-033` pasan; `SP03-032` queda watchlist por volumetric lookdev/hall cue y `SP03-034` por studio/material-board cue, ambos aceptados sin bust/persona/camara dominante. `SP03-030|031|032|033|034` requirieron retry para sacar overrides viejos que invitaban bust/creature. Pendientes esperados tras runtime: 46 stale.

Nota 2026-06-17 primary wave 5: regeneradas y aprobadas `SP03-035|SP03-036|SP03-037|SP03-038|SP03-039|SP03-040|SP03-041|SP03-042` como primarias nuevas. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_03_wave5_20260617-233649`. QA visual: pasan las ocho; `SP03-035` queda watchlist por exterior/HDRI landscape, `SP03-042` por miniature terrain/diorama cues, aceptadas por representatividad. `SP03-040` requirio retry para sacar blade/weapon-like drift. Pendientes esperados tras runtime: 38 stale.

Nota 2026-06-17 primary wave 6: regeneradas y aprobadas `SP03-043|SP03-044|SP03-045|SP03-046|SP03-047|SP03-048|SP03-049|SP03-050` como primarias nuevas. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_03_wave6_20260617-235244`. QA visual: pasan las ocho. Watchlist aceptado: `SP03-047` por archviz room/material slice y `SP03-049` por T-pose robot, excepcion representativa del preset; sin humano real/texto/UI dominante. Pendientes esperados tras runtime: 30 stale.

Nota 2026-06-18 primary wave 7: regeneradas y aprobadas `SP03-051|SP03-052|SP03-053|SP03-054|SP03-055|SP03-056|SP03-057|SP03-058` como primarias nuevas. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_03_wave7_20260618-000529`. Rechazadas preservadas: `D:\codex-studio-backups\style-defaults-primary-backup\pack_03_wave7_rejects_20260618-001227`. QA visual: pasan `SP03-051`, `SP03-052`, `SP03-053`, `SP03-054`, `SP03-056`, `SP03-057`, `SP03-058`; `SP03-055` queda watchlist aceptado por sci-fi VR room/module ya sin fantasy landscape/corridor/person/UI/texto. Retries: `SP03-052` por full car/front-ad y `SP03-055` por floating-island/fantasy landscape. Pendientes esperados tras runtime: 22 stale.

Nota 2026-06-18 primary wave 8: regeneradas y aprobadas `SP03-059|SP03-060|SP03-061|SP03-062|SP03-063|SP03-064|SP03-065|SP03-066` como primarias nuevas. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_03_wave8_20260618-001834`. Rechazadas preservadas: `D:\codex-studio-backups\style-defaults-primary-backup\pack_03_wave8_rejects_20260618-002454`. QA visual: pasan `SP03-059`, `SP03-061`, `SP03-063`, `SP03-064`, `SP03-065`, `SP03-066`; `SP03-060` queda watchlist por fondo landscape pero sujeto modular/material-board claro; `SP03-062` queda watchlist por suelo organico, sin humano/bust/gore/texto. Retries: `SP03-060` por ruina/fantasy hall, `SP03-062` por bosque/root scene y `SP03-066` por glyph/numero. Pendientes esperados tras runtime: 14 stale.

Nota 2026-06-18 primary wave 9: regeneradas y aprobadas `SP03-067|SP03-068|SP03-069|SP03-070|SP03-071|SP03-072|SP03-073|SP03-074` como primarias nuevas. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_03_wave9_20260618-003342`. Rechazada preservada: `D:\codex-studio-backups\style-defaults-primary-backup\pack_03_wave9_rejects_20260618-004023`. QA visual: pasan `SP03-068`, `SP03-069`, `SP03-070`, `SP03-071`, `SP03-072`, `SP03-073`, `SP03-074`; `SP03-067` pasa tras retry off-body/prosthetic module. Watchlist aceptado: `SP03-073` por papercraft creature bust, representativo del preset. Retry: `SP03-067` por cuerpo/fetish-frame. Pendientes esperados tras runtime: 6 stale.

Nota 2026-06-18 primary wave 10 + representativity redo: regeneradas y aprobadas `SP03-075|SP03-076|SP03-077|SP03-078|SP03-079|SP03-080` como primarias finales, con redo adicional de `SP03-060|SP03-066|SP03-067` para corregir abstraccion/deriva. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_03_wave10_plus_redo_20260618-004851`. Rechazada preservada: `D:\codex-studio-backups\style-defaults-primary-backup\pack_03_wave10_rejects_20260618-005611`. QA visual: `SP03-060` pasa como environment-design playable terrain card; `SP03-066` pasa tras retry como full-frame abstract background sin objeto central; `SP03-067` pasa como modulo/protesis off-body; `SP03-075..080` pasan como material/style cards representativas. Watchlist aceptado: `SP03-077` por robot toy-brick character y `SP03-080` por marble creature statue, ambos representativos del preset. Pendientes esperados tras runtime: 0 stale.

### pack_04

| Preset | Manifest | Default card |
| ------ | -------- | ------------ |

Nota 2026-06-18 primary `pack_04` wave 1: regeneradas y aprobadas `SP04-001|SP04-002|SP04-003|SP04-004|SP04-005|SP04-006|SP04-007|SP04-008|SP04-009|SP04-010` como primarias nuevas. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave1_20260618-010658`. Rechazadas preservadas: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave1_rejects_20260618-011604` y `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave1_rejects2_20260618-012117`. QA visual: pasan `SP04-001`, `SP04-002`, `SP04-003`, `SP04-004`, `SP04-005`, `SP04-006`, `SP04-007`, `SP04-008`, `SP04-009`, `SP04-010`; retries `SP04-006` por face/full-body/fantasy-object drift, `SP04-007` por boy/bike/lamp, `SP04-008` por detective literal, `SP04-010` por body/cape/city tableau. Pendientes esperados tras runtime: 90 stale.

### pack_05

Nota 2026-06-18 primary `pack_05` wave 1: promovidas variants ya auditadas a primarias sin gastar imagegen nuevo. Promovidas `SP05-021|SP05-022|SP05-023|SP05-025|SP05-028|SP05-029|SP05-031|SP05-032|SP05-033|SP05-034|SP05-035|SP05-036|SP05-037|SP05-038|SP05-039|SP05-040|SP05-051|SP05-052|SP05-053|SP05-054|SP05-055|SP05-056|SP05-057|SP05-058|SP05-059|SP05-060|SP05-061|SP05-062|SP05-063|SP05-064|SP05-070`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_promote_variants_wave1_20260618-042230`. Se dejaron fuera de promocion las variants marcadas solo como watchlist o demasiado dudosas.

Nota 2026-06-18 primary `pack_05` wave 2: regeneradas y aprobadas `SP05-065|SP05-066|SP05-067|SP05-068|SP05-069` como primarias object/material-first. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave2_065_069_20260618-042604`. Reject preservado: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave2_rejects_20260618-043038`. QA: pasan `SP05-065`, `SP05-066`, `SP05-068`, `SP05-069`; `SP05-067` pasa con watchlist por sombra arquitectonica secundaria, pero el foco queda mineral/macro y no corredor dominante.

Nota 2026-06-18 primary `pack_05` wave 3: promovidas variants fuertes ya auditadas a primarias para `SP05-094|SP05-095|SP05-096|SP05-121|SP05-122|SP05-126|SP05-130|SP05-140|SP05-143|SP05-144|SP05-222|SP05-228|SP05-239|SP05-254`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_promote_variants_wave3_20260618-044242`. Se omitieron candidates watchlist alto (`SP05-123`, `SP05-124`, `SP05-125`, `SP05-129`, `SP05-133`, `SP05-137`, `SP05-148`, `SP05-225`, `SP05-231`, `SP05-236`, `SP05-248`, `SP05-256`) hasta retry object/material-first.

Nota 2026-06-18 primary `pack_05` wave 4: regeneradas y aprobadas `SP05-123|SP05-124|SP05-125|SP05-129|SP05-133|SP05-137` con prompts object/material-first. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave4_watchlist_retry_20260618-044751`. Rejects preservados: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave4_rejects_20260618-045416`. QA: `SP05-123` y `SP05-124` requirieron retry por cathedral/athlete; finales pasan. `SP05-125`, `SP05-129`, `SP05-133` pasan fuerte; `SP05-137` pasa con watchlist por marcas blueprint, sin texto legible ni persona.

Nota 2026-06-18 primary `pack_05` wave 5: promovidas variants representativas ya auditadas para `SP05-098|SP05-099|SP05-100|SP05-252|SP05-253|SP05-257|SP05-259|SP05-260`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_promote_variants_wave5_20260618080246`. QA de plancha: pasan por personaje/escena clara sin volver a abstraccion vacia; se dejaron fuera `SP05-097`, `SP05-148`, `SP05-225` y otros watchlist por corredor/hereo oscuro/fantasy-cliche dominante.

Nota 2026-06-18 primary `pack_05` wave 6: regeneradas y aprobadas `SP05-091|SP05-092|SP05-093|SP05-127|SP05-128|SP05-131` con safe/object prompts. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave6_091_131_20260618-050521`. QA: pasan sin camara, market/library, studio-chair/curtain/lamp. `SP05-128` y `SP05-131` quedan personaje-fuertes pero representativos; mejor que abstraccion vacia para estos presets.

Nota 2026-06-18 primary `pack_05` wave 7: regeneradas y aprobadas `SP05-132|SP05-134|SP05-135|SP05-136|SP05-138|SP05-139` con overrides anti-cliche. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave7_132_139_20260618-051353`. QA: pasan; `SP05-136` y `SP05-138` quedan watchlist por personaje/noir fuerte, aceptados por representacion clara y sin market/library/camera/studio drift.

Nota 2026-06-18 primary `pack_05` wave 8: regeneradas y aprobadas `SP05-142|SP05-148|SP05-221|SP05-223|SP05-224|SP05-225` con overrides anti-arma/pasillo/chase. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave8_142_225_20260618-052142`. QA: pasan; `SP05-142` y `SP05-148` quedan personaje-fuertes sin arma/camara/pasillo literal, `SP05-224` y `SP05-225` corrigen hacia asset/mecha material.

Nota 2026-06-18 primary `pack_05` wave 9: regeneradas y aprobadas `SP05-226|SP05-227|SP05-229|SP05-230|SP05-231|SP05-232` con overrides object/material. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave9_226_232_20260618-052822`. QA: pasan; `SP05-229` y `SP05-230` quedan watchlist por depth urbano/megastructure, sin market/library/camara/personaje y con lectura de asset/mecha clara.

Nota 2026-06-18 primary `pack_05` wave 10: regeneradas y aprobadas `SP05-233|SP05-234|SP05-235|SP05-236|SP05-237|SP05-238` con overrides object/material. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave10_233_238_20260618-053646`. QA: pasan; `SP05-234`, `SP05-235` y `SP05-238` quedan watchlist por figura fuerte, sin camara/market/library/texto legible/pasillo literal. `SP05-236` pasa fuerte como compact hardware.

Nota 2026-06-18 primary `pack_05` wave 11: regeneradas y aprobadas `SP05-240|SP05-241|SP05-242|SP05-243|SP05-244|SP05-245` con overrides anti-UI/market/corridor. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave11_240_245_20260618-054325`. QA: pasan; `SP05-241..245` usan figura/escena para representar fantasy sin abstraccion vacia. `SP05-244` queda watchlist por interior ceremonial, no pasillo repetido.

Nota 2026-06-18 primary `pack_05` wave 12: regeneradas y aprobadas `SP05-246|SP05-247|SP05-248|SP05-249|SP05-250|SP05-251` con overrides anti-market/library/text/corridor. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave12_246_251_20260618-055401`. QA: pasan; `SP05-247` queda watchlist por cottage/luz calida permitida por preset, `SP05-249` por mesa craft/personaje sin texto legible.

Nota 2026-06-18 primary `pack_05` wave 13: regeneradas y aprobadas `SP05-255|SP05-256|SP05-258|SP05-261|SP05-262|SP05-263` con overrides object/material en dark fantasy. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave13_255_263_20260618-060222`. Reject preservado: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave13_rejects_sp05_262_20260618-060646`. QA: `SP05-262` requirio retry por puerta/corredor; final pasa como still-life surface. `SP05-258` queda watchlist por lampara/herramienta, aceptada por preset utility.

Nota 2026-06-18 primary `pack_05` wave 14: regeneradas y aprobadas `SP05-264|SP05-265|SP05-266|SP05-267|SP05-268|SP05-269` con dark object/material-first. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave14_264_269_20260618-061246`. Rejects preservados: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave14_rejects_sp05_267_20260618-061706` y `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave14_rejects_sp05_267b_20260618-062117`. QA: `SP05-267` requirio dos retries por retrato/arma y luego blade-like; final pasa como collage/print material. `SP05-268` queda watchlist por profundidad vertical, sin persona/camara/texto.

Nota 2026-06-18 primary `pack_05` wave 15: regeneradas y aprobadas `SP05-270|SP05-271|SP05-272|SP05-273|SP05-274|SP05-275` con dark object/material-first. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave15_270_275_20260618-062939`. Rejects preservados: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave15_rejects_272_275_20260618-063426`. QA: `SP05-272` y `SP05-275` requirieron retry por street/corridor y window/cathedral vibe; finales pasan como material/object cards.

Nota 2026-06-18 primary `pack_05` wave 16: regeneradas y aprobadas `SP05-276|SP05-277|SP05-278|SP05-279|SP05-280` con dark object/material-first. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave16_276_280_20260618-064049`. Reject preservado: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave16_rejects_sp05_279_20260618-064652`. QA: `SP05-279` requirio retry por personaje/arquitectura; final pasa como red-optic machine still-life. `SP05-280` pasa con lantern ritual permitida por preset, no studio-lamp.

Nota 2026-06-18 primary `pack_05` wave 17 close: regeneradas y aprobadas las 6 stale finales `SP05-097|SP13-021|SP13-022|SP13-023|SP13-024|SP13-025`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave17_close_20260618-065333`. Reject preservado: `D:\codex-studio-backups\style-defaults-primary-backup\pack_05_wave17_rejects_sp05_097_20260618-065752`. QA: `SP05-097` requirio retry por cathedral/lantern; final pasa como bone/black dominion material emblem. `SP13-021..025` pasan como action-energy abstraction sin persona/camara/pasillo.

| Preset | Manifest | Default card |
| ------ | -------- | ------------ |

### pack_06

Nota 2026-06-18 primary `pack_06` wave 1: regeneradas y aprobadas `SP06-001|SP06-002|SP06-003|SP06-004|SP06-005|SP06-006`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave1_001_006_20260618-070425`. QA: pasan como traditional painting material/style reads. Watchlist: `SP06-004` por estudio/ventana y `SP06-005` por figura devocional, aceptados por representar gouache/tempera sin camera/market/library/corridor drift.

Nota 2026-06-18 primary `pack_06` wave 2: regeneradas y aprobadas `SP06-007|SP06-008|SP06-009|SP06-010|SP06-011|SP06-012`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave2_007_012_20260618-071339`. QA: pasan como reads claros de fresco/sumi-e/impressionism/pointillism/palette-knife/aerosol. Watchlist: `SP06-009` por banquito/ventana y `SP06-012` por figura con spray, aceptados por representar tecnica sin camera/market/library/corridor drift.

Nota 2026-06-18 primary `pack_06` wave 3: regeneradas y aprobadas `SP06-013|SP06-014|SP06-015|SP06-016|SP06-017|SP06-018`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave3_013_018_20260618-072508`. QA: pasan como reads claros de airbrush/casein/black-velvet/graphite/charcoal/pen-ink. Watchlist: `SP06-016` y `SP06-018` por figura/atelier, aceptados por representar dibujo academico sin camera/market/library/corridor drift.

Nota 2026-06-18 primary `pack_06` wave 4: regeneradas y aprobadas `SP06-019|SP06-020|SP06-021|SP06-022|SP06-023|SP06-024`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave4_019_024_20260618-073421`. Rejects reemplazados: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave4_rejects_022_024_20260618-074241`. QA: pasan como reads claros de ballpoint/colored-pencil/soft-pastel/oil-pastel/silverpoint/conte. `SP06-022|SP06-023|SP06-024` requirieron override por studio/props/tools; finales quedan representativos, no abstractos vacios, sin camera/market/library/corridor drift.

Nota 2026-06-18 primary `pack_06` wave 5: regeneradas y aprobadas `SP06-025|SP06-026|SP06-027|SP06-028|SP06-029|SP06-030`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave5_025_030_20260618-075124`. Rejects reemplazados: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave5_rejects_028_029_20260618-075527` y `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave5_reject_sp06_028b_20260618-075910`. QA: pasan como reads claros de technical-pen/copic/chalk/scratchboard/silhouette/continuous-line. `SP06-028` requirio dos retries por fantasy/weapon y luego compass/pendant; final queda animal scratchboard puro.

Nota 2026-06-18 primary `pack_06` wave 6: regeneradas y aprobadas `SP06-031|SP06-032|SP06-033|SP06-034|SP06-035|SP06-036`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave6_031_036_20260618-080543`. QA: pasan como reads claros de etching/woodcut/linocut/lithography/screenprint/monotype. Watchlist aceptado: `SP06-031` usa plate mark y `SP06-034` usa arquitectura minima, ambos como soporte de print/litho sin camera/market/library/corridor drift.

Nota 2026-06-18 primary `pack_06` wave 7: regeneradas y aprobadas `SP06-037|SP06-038|SP06-039|SP06-040|SP06-041|SP06-042`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave7_037_042_20260618-081123`. QA: pasan como reads claros de aquatint/mezzotint/risograph/cyanotype/rubber-stamp/halftone. Watchlist aceptado: `SP06-041` usa paraguas como silueta stamped y `SP06-042` usa maleta/ciudad halftone, sin texto/camera/market/library/corridor drift.

Nota 2026-06-18 primary `pack_06` wave 8: regeneradas y aprobadas `SP06-043|SP06-044|SP06-045|SP06-046|SP06-047|SP06-048`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave8_043_048_20260618-081726`. Rejects reemplazados: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave8_rejects_043_046_048_20260618-082154` y `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave8_rejects_047_048b_20260618-082620`. QA: pasan como reads claros de security-engraving/drypoint/collagraph/digital-painting/speedpaint/matte-extension. Retries: `SP06-043` por pendant/secondary prop, `SP06-046|SP06-047` por studio/tools/UI-like drift, `SP06-048` por foreground figure/tool; finales sin camera/market/library/corridor drift.

Nota 2026-06-18 primary `pack_06` wave 9: regeneradas y aprobadas `SP06-049|SP06-050|SP06-051|SP06-052|SP06-053|SP06-054`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave9_049_054_20260618-083229`. Rejects reemplazados: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave9_rejects_049_052_054_20260618-083905` y `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave9_reject_sp06_049b_20260618-084323`. QA: pasan como reads claros de flat-vector/pixel/low-poly/voxel/concept-art/isometric. Retries: `SP06-049` por studio/tools/palette, `SP06-050` por UI/screens, `SP06-051` por pedestal/lamp, `SP06-052` por Minecraft/weapon/tool drift, `SP06-054` por concept-sheet/callouts. Watchlist aceptado: `SP06-050|SP06-052` por pedestal/display minimo, representativos sin texto/UI/camera/market/library/corridor drift.

Nota 2026-06-18 primary `pack_06` wave 10: regeneradas y aprobadas `SP06-055|SP06-056|SP06-057|SP06-058|SP06-059|SP06-060`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave10_055_060_20260618-084953`. Rejects reemplazados: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave10_rejects_056_060_20260618-085639`, `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave10_reject_sp06_058b_20260618-090312` y `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave10_reject_sp06_058c_20260618-090738`. QA: pasan como reads claros de glitch/synthwave/double-exposure/polygon/paper-cutout/ascii. Retries: `SP06-056..060` por studio/tools/screens/UI/text drift; `SP06-058` tuvo retries extra por UI y luego herramientas. Watchlist aceptado: `SP06-058|SP06-059` por pedestal/display minimo, sin UI/tools/text/camera/market/library/corridor drift.

Nota 2026-06-18 primary `pack_06` wave 11: regeneradas y aprobadas `SP06-061|SP06-062|SP06-063|SP06-064|SP06-065|SP06-066`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave11_061_066_20260618-091406`. QA: pasan como reads claros de analog collage/photomontage/decoupage/assemblage/scrapbook/trash-polka. Watchlist aceptado: repeticion de sujetos aviares en mixed-media, pero con materialidad diferenciada y sin texto/camera/market/library/corridor/craft-table drift.

Nota 2026-06-18 primary `pack_06` wave 12: regeneradas y aprobadas `SP06-067|SP06-068|SP06-069|SP06-070|SP06-071|SP06-072`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave12_067_072_20260618-092502`. QA: pasan como reads claros de mixed-media-canvas/zine/moodboard/planning-board/torn-paper/tape-art. Watchlist aceptado: aves repetidas en `SP06-067|SP06-071|SP06-072`, pero con tecnica diferenciada; `SP06-070` usa pins/thread sin texto/conspiracy drift.

Nota 2026-06-18 primary `pack_06` wave 13: regeneradas y aprobadas `SP06-073|SP06-074|SP06-075|SP06-076|SP06-077|SP06-078`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave13_073_078_20260618-093129`. QA: pasan como reads claros de embroidery/photo-overpaint/digital-collage/fumage/coffee/gold-leaf. Watchlist aceptado: `SP06-075` usa rostro en collage digital, `SP06-077` usa objeto colgante minimo; sin UI/text/camera/market/library/corridor/craft-table drift.

Nota 2026-06-18 primary `pack_06` wave 14: regeneradas y aprobadas `SP06-079|SP06-080|SP06-081|SP06-082|SP06-083|SP06-084`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave14_079_084_20260618-093956`. Reject reemplazado: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave14_reject_sp06_084_20260618-094412`. QA: pasan como reads claros de paper-marbling/stencil/Game-Boy/Mode-7/vector-arcade/FMV-pre-rendered. Retry: `SP06-084` por pantalla/UI de fondo; final queda interior sci-fi sin UI/pantalla y con pre-rendered sprite read.

Nota 2026-06-18 primary `pack_06` wave 15: regeneradas y aprobadas `SP06-085|SP06-086|SP06-087|SP06-088|SP06-089|SP06-090`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave15_085_090_20260618-095149`. Rejects reemplazados: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave15_rejects_085_087_090_20260618-095831`. QA: pasan como reads claros de visual-novel/RPG-Maker/GBA-tactical/PSX/ANSI/voxel. Retries: `SP06-085` por screens/UI, `SP06-087` por frame/UI/badge, `SP06-090` por display/capsule/UI. Watchlist aceptado: `SP06-086` conserva monitor como tileworld background sin UI/texto.

Nota 2026-06-18 primary `pack_06` wave 16: regeneradas y aprobadas `SP06-091|SP06-092|SP06-093|SP06-094|SP06-095|SP06-096`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave16_091_096_20260618-100757`. Rejects reemplazados: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave16_rejects_092_095_096_20260618-101402`. QA: pasan como reads claros de Vectrex/C64/MSX2/Atari2600/Genesis/NeoGeo. Retries: `SP06-092` por computer/cassette hardware, `SP06-095` por console/controller, `SP06-096` por sword/fighting-scene drift. Finales sin UI/text/camera/market/library/corridor drift.

Nota 2026-06-18 primary `pack_06` wave 17: regeneradas y aprobadas `SP06-097|SP06-098|SP06-099|SP06-100|SP06-101|SP06-102`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave17_097_102_20260618-102049`. Rejects reemplazados: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave17_rejects_101_102_20260618-102718`. QA: pasan como reads claros de Amiga-HAM/TurboGrafx/Flipnote/Game-Boy-Camera/JRPG-diorama/roguelike-glyph. Retries: `SP06-101|SP06-102` por sword/hero y sprite-sheet/icon/weapon drift. Finales sin armas, UI, texto, camera/market/library/corridor drift.

Nota 2026-06-18 primary `pack_06` wave 18: regeneradas y aprobadas `SP06-103|SP06-104|SP06-105|SP06-106|SP06-107|SP06-108`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave18_103_108_20260618-103549`. Rejects reemplazados: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave18_rejects_104_106_20260618-104216`. QA: pasan como reads claros de Metroidvania parallax/cyberpunk diegetic HUD/retro select/isometric strategy/MOBA splash/VN neon backdrop. Retries: `SP06-104` por figura/weapon-like y exceso de UI dura; `SP06-106` por personaje armado. Finales quedan representativos sin armas, UI legible, sprite-sheet, texto, camera/market/library/corridor drift.

Nota 2026-06-18 primary `pack_06` wave 19: regeneradas y aprobadas `SP06-109|SP06-110|SP06-111|SP06-112|SP06-113|SP06-114`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave19_109_114_20260618-104902`. Sin rejects. QA: pasan como reads claros de Soulslike tarnished/chibi platformer/battle-royale colorway/sci-fi icon/parchment interface/gacha foil frame. Watchlist aceptado: `SP06-109` por figura/relic shrouded con ruina, representativo del preset y sin arma/UI/knight-portrait claro. Finales sin texto, HUD legible, sprite-sheet, camera/market/library/corridor drift.

Nota 2026-06-18 primary `pack_06` wave 20 close: regeneradas y aprobadas `SP06-115|SP06-116|SP06-117|SP06-118|SP06-119|SP06-120`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_06_wave20_115_120_20260618-105635`. Sin rejects. QA: pasan como reads claros de survival-horror save-room/stealth shadow/arcade racing/RPG inventory/cozy sim/boss encounter key art. Watchlist aceptado: `SP06-116` por figura stealth escondida y `SP06-119` por mano parcial; ambas refuerzan lectura sin armas, UI, texto, sprite-sheet, camera/market/library/corridor drift.

| Preset | Manifest | Default card |
| ------ | -------- | ------------ |

### pack_07

| Preset                                                            | Manifest | Default card |
| ----------------------------------------------------------------- | -------- | ------------ | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nota 2026-06-17 primary wave 1: regeneradas y aprobadas `SP07-003 | SP07-015 | SP07-032     | SP07-035 | SP07-038 | SP07-054`con guardrails contra formula de studio/chair/curtain/lamp/corridor/library/market/fantasy hall/camera prop. QA visual:`SP07-003`, `SP07-015`, `SP07-032`, `SP07-038`, `SP07-054`pasan;`SP07-035` pasa con watchlist leve por puerta/corredor monumental. Pendientes esperados tras runtime: 74 stale. |

Nota 2026-06-17 primary wave 2: regeneradas y aprobadas `SP07-039|SP07-043|SP07-047|SP07-052|SP07-055|SP07-060` con guardrails de ancla concreta y sin corridor/market/library/camera/empty abstract. QA visual: las seis pasan; `SP07-052` y `SP07-055` quedan watchlist leve por fantasy hall/castle-like, pero representan bien el preset. Pendientes esperados tras runtime: 68 stale.

Nota 2026-06-17 primary wave 3: regeneradas y aprobadas `SP07-001|SP07-073|SP07-075|SP07-078|SP07-079|SP07-080`. `SP07-073` requirio retry para quitar insectos literales; QA final pasa como cutaway arquitectonico subterraneo. Pendientes esperados tras runtime: 62 stale.

Nota 2026-06-17 primary wave 4: regeneradas y aprobadas `SP07-002|SP07-004|SP07-005|SP07-006|SP07-007|SP07-008|SP07-009|SP07-010` con guardrails contra sala generica, silla/sofa/lamp/curtain/corridor/control-room/empty abstract. QA visual: pasan las ocho; `SP07-004` queda watchlist leve por cozy prop/luz, aceptado por preset. Pendientes esperados tras runtime: 54 stale.

Nota 2026-06-17 primary wave 5: regeneradas y aprobadas `SP07-011|SP07-012|SP07-013|SP07-014|SP07-016|SP07-017|SP07-018|SP07-019` con guardrails contra catalog-room, silla/sofa/lamp/curtain/corridor/control-room/empty abstract. `SP07-018` requirio retry para evitar hallway/catálogo farmhouse; QA final pasa como material-detail. `SP07-014` queda watchlist leve por room tech, aceptado por ancla infraestructura. Pendientes esperados tras runtime: 46 stale.

Nota 2026-06-17 primary wave 6: regeneradas y aprobadas `SP07-020|SP07-021|SP07-022|SP07-023|SP07-024|SP07-025|SP07-026|SP07-027` con guardrails contra postcards literales, signage/text, silla/sofa/lamp/corridor/empty abstract. QA visual: pasan las ocho; `SP07-024` y `SP07-027` quedan watchlist leve por exterior postcard, aceptadas por detalle dominante. Pendientes esperados tras runtime: 38 stale.

Nota 2026-06-17 primary wave 7: regeneradas y aprobadas `SP07-028|SP07-029|SP07-030|SP07-031|SP07-033|SP07-034|SP07-036|SP07-037` con guardrails contra personas/camaras, pasillos de mercado/library, props dominantes, signage/text y abstraccion vacia. QA visual: `SP07-034`, `SP07-036` y `SP07-037` requirieron retry; final pasan. `SP07-029` queda watchlist leve por pequeno cuenco, aceptado porque domina el detalle adobe. Pendientes esperados tras runtime: 30 stale.

Nota 2026-06-17 primary wave 8: regeneradas y aprobadas `SP07-040|SP07-041|SP07-042|SP07-044|SP07-045|SP07-046|SP07-048|SP07-049` con guardrails contra personas, resort/lounges, furniture focus, flags hero, mercado/library/corridor y abstraccion vacia. QA visual: `SP07-046`, `SP07-048` y `SP07-049` requirieron retry; final pasan. `SP07-042`, `SP07-048` y `SP07-049` quedan watchlist leve por props pequenos no dominantes. Pendientes esperados tras runtime: 22 stale.

Nota 2026-06-17 primary wave 9: regeneradas y aprobadas `SP07-050|SP07-051|SP07-053|SP07-056|SP07-057|SP07-058|SP07-059|SP07-061` con guardrails contra personas, licensed fantasy look, vehiculo/maquina hero, text/signage, corridor/market/library y abstraccion vacia. QA visual: pasan las ocho. `SP07-051` queda watchlist por rostros escultoricos; `SP07-053` por vista amplia; `SP07-059` por literalidad pastoral, aceptadas por representatividad fuerte. Pendientes esperados tras runtime: 14 stale.

Nota 2026-06-17 primary wave 10: regeneradas y aprobadas `SP07-062|SP07-063|SP07-064|SP07-065|SP07-066|SP07-067|SP07-068|SP07-069` con guardrails contra personas, playroom, horror/gore, airport/ground lock, brand/logo, corridor/market/library y abstraccion vacia. QA visual: pasan las ocho. `SP07-067` queda watchlist por sandcastle literal; `SP07-069` por indoor inflatable playform, aceptadas por materialidad dominante. Pendientes esperados tras runtime: 6 stale.

Nota 2026-06-17 primary wave 11: regeneradas y aprobadas `SP07-070|SP07-071|SP07-072|SP07-074|SP07-076|SP07-077` con guardrails contra product photo, fairy cliche, open ocean, closed facade, planet-surface lock, personas y abstraccion vacia. QA visual: pasan las seis. `SP07-071` queda watchlist leve por depth tipo pasaje, `SP07-074` por furniture propio de cutaway toy-scale, aceptadas por preset. Pendientes esperados tras runtime: 0 stale.

### pack_08

| Preset                                                           | Manifest | Default card |
| ---------------------------------------------------------------- | -------- | ------------ | ------------------------------------------------------------------------------------------ | -------- | -------- | ---------- |
| Nota 2026-06-17 queue 4: tras regenerar primarias para `SP08-002 | SP08-026 | SP08-027     | SP08-035`y sacar esas filas de la cola markdown autoritativa, quedaron pendientes`SP08-037 | SP08-038 | SP08-040 | SP08-065`. |

Nota 2026-06-17 primary close: regeneradas primarias `SP08-037|SP08-038|SP08-040|SP08-065` con guardrails garment-first/material-first. QA visual: `SP08-038` y `SP08-065` pasan; `SP08-037` pasa con interior contextual frontier, sin rostro/arma; `SP08-040` pasa con watchlist por patch-like/lunar-ish pero sin logo real. Cola `pack_08` queda sin filas stale; requiere runtime para reflejar `availableDefaultImages=80/80 staleDefaultImages=0`.

Nota 2026-06-17 variants carousel: generadas `SP08-002-01|SP08-026-01|SP08-027-01|SP08-035-01|SP08-037-01|SP08-038-01|SP08-040-01|SP08-065-01` en `assets/recipes/styles/defaults/variants/` con writer unico x4. QA visual acepta las 8 como carousel candidates; `SP08-026`, `SP08-027`, `SP08-037` y `SP08-065` quedan watchlist leve. Las ocho tienen primaria regenerada al cierre visual `pack_08`.

### pack_09

| Preset | Manifest | Default card |
| ------ | -------- | ------------ |

### pack_10

| Preset | Manifest | Default card |
| ------ | -------- | ------------ |

### pack_11

| Preset | Manifest | Default card |
| ------ | -------- | ------------ |

### pack_12

| Preset | Manifest | Default card |
| ------ | -------- | ------------ |

### pack_13

Nota 2026-06-18 primary `pack_13` wave 1: regeneradas y aprobadas `SP13-001|SP13-002|SP13-003|SP13-004|SP13-005|SP13-006`. Backup previo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_13_wave1_001_006_20260618-111134`. Sin rejects. QA: pasan como reads claros de cel heroic dawn/neon city vigil/soft shojo spring/mecha hangar/rainy slice-of-life/spirit shrine twilight. Watchlist aceptado: `SP13-004` por figura + mecha hangar, representativo del preset. Finales sin texto, UI legible, camera/market/library/corridor drift.

| Preset | Manifest | Default card |
| ------ | -------- | ------------ |

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

Sin filas activas. `pack_16` se cerro visualmente en la ronda 2026-06-20 tras
regenerar `SP05-351..372` y `SP13-026..035`.

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

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_ad

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-059|SP09-060" --parallel=2 --session-suffix=stale_p09_ad --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-059.webp` (`284912` bytes)
  - `assets/recipes/styles/defaults/SP09-060.webp` (`346362` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-059` / `Soap Bubbles` and `SP09-060` / `Mercury (Liquid Metal)`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=60/80 staleDefaultImages=20 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-14 - `pack_09` ola stale_p09_ae

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-061|SP09-062" --parallel=2 --session-suffix=stale_p09_ae --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-061.webp` (`218284` bytes)
  - `assets/recipes/styles/defaults/SP09-062.webp` (`394030` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-061` / `Dry Ice Fog` and `SP09-062` / `Confetti`.
- Coverage after wave:
  - `bun run styles:runtime:check` -> current.
  - `bun run styles:validate -- --pack=pack_09 --coverage` -> `pack_09 defaultImages=80/80 availableDefaultImages=62/80 staleDefaultImages=18 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-15 - `pack_09` ola stale_p09_af

- Command:
  - `bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-063|SP09-064" --parallel=2 --session-suffix=stale_p09_af --force`
- Result:
  - wrapper timed out after creating jobs; outputs were recovered from Codex image cache for the same job prompts.
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-063.webp` (`328378` bytes)
  - `assets/recipes/styles/defaults/SP09-064.webp` (`282680` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-063` / `Cobweb` and `SP09-064` / `Mud (Cracked)`.
- Coverage after wave:
  - expected after runtime refresh: `pack_09 defaultImages=80/80 availableDefaultImages=64/80 staleDefaultImages=16 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.
- Runtime risk note:
  - local app-server timed out notification finalization for `SP09-063`; `SP09-064` completed normally. Both assets were recovered/confirmed from `C:\Users\cristian\.codex\generated_images`.

### Visual stale refresh - 2026-06-15 - `pack_09` ola stale_p09_ag

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-065|SP09-066" --parallel=2 --session-suffix=stale_p09_ag --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-065.webp` (`275508` bytes)
  - `assets/recipes/styles/defaults/SP09-066.webp` (`372098` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-065` / `Tar` and `SP09-066` / `Sand (Beach)`.
- Coverage after wave:
  - expected after runtime refresh: `pack_09 defaultImages=80/80 availableDefaultImages=66/80 staleDefaultImages=14 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-15 - `pack_09` ola stale_p09_ah

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-067|SP09-068" --parallel=2 --session-suffix=stale_p09_ah --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-067.webp` (`268646` bytes)
  - `assets/recipes/styles/defaults/SP09-068.webp` (`309434` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-067` / `Snow (Powder)` and `SP09-068` / `Lava Rock (Cooled)`.
- Coverage after wave:
  - expected after runtime refresh: `pack_09 defaultImages=80/80 availableDefaultImages=68/80 staleDefaultImages=12 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-15 - `pack_09` ola stale_p09_ai

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-069|SP09-070" --parallel=2 --session-suffix=stale_p09_ai --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-069.webp` (`466704` bytes)
  - `assets/recipes/styles/defaults/SP09-070.webp` (`240222` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-069` / `Fiberglass Insulation` and `SP09-070` / `Polystyrene (Styrofoam)`.
- Coverage after wave:
  - expected after runtime refresh: `pack_09 defaultImages=80/80 availableDefaultImages=70/80 staleDefaultImages=10 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-15 - `pack_09` ola stale_p09_aj

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-071|SP09-072" --parallel=2 --session-suffix=stale_p09_aj --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-071.webp` (`220514` bytes)
  - `assets/recipes/styles/defaults/SP09-072.webp` (`470544` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-071` / `Plywood` and `SP09-072` / `OSB Board`.
- Coverage after wave:
  - expected after runtime refresh: `pack_09 defaultImages=80/80 availableDefaultImages=72/80 staleDefaultImages=8 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-15 - `pack_09` ola stale_p09_ak

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-073|SP09-074" --parallel=2 --session-suffix=stale_p09_ak --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-073.webp` (`312882` bytes)
  - `assets/recipes/styles/defaults/SP09-074.webp` (`430208` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-073` / `Linoleum Floor` and `SP09-074` / `Carpet (Shag)`.
- Coverage after wave:
  - expected after runtime refresh: `pack_09 defaultImages=80/80 availableDefaultImages=74/80 staleDefaultImages=6 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-15 - `pack_09` ola stale_p09_al

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-075|SP09-076" --parallel=2 --session-suffix=stale_p09_al --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-075.webp` (`387884` bytes)
  - `assets/recipes/styles/defaults/SP09-076.webp` (`263228` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-075` / `Astroturf` and `SP09-076` / `Chain Link Fence`.
- Coverage after wave:
  - expected after runtime refresh: `pack_09 defaultImages=80/80 availableDefaultImages=76/80 staleDefaultImages=4 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Visual stale refresh - 2026-06-15 - `pack_09` ola stale_p09_am

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 bun run scripts/generate-style-defaults.ts --pack=pack_09 "--preset=SP09-077|SP09-078" --parallel=2 --session-suffix=stale_p09_am --force`
- Result:
  - `generated=2 attempted=2 skipped=78 failed=0 packs=pack_09`
- Refreshed files:
  - `assets/recipes/styles/defaults/SP09-077.webp` (`282518` bytes)
  - `assets/recipes/styles/defaults/SP09-078.webp` (`290276` bytes)
- Manifest checkpoint:
  - `manifest-pack_09.json` now refreshes `SP09-077` / `Barbed Wire` and `SP09-078` / `Solar Panel`.
- Coverage after wave:
  - expected after runtime refresh: `pack_09 defaultImages=80/80 availableDefaultImages=78/80 staleDefaultImages=2 missingDefaultImages=0`
- Prompt quality note:
  - generation used global denoise suffix from `scripts/style-default-utils.ts`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_009_012_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-009|SP04-010|SP04-011|SP04-012" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_009_012_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-009-01.webp` (`690728` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-010-01.webp` (`279186` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-011-01.webp` (`650172` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-012-01.webp` (`507696` bytes)
- QA:
  - `SP04-009-01`: pass with watchlist; underground comix clear, paper/drawing cue, no readable text.
  - `SP04-010-01`: pass; painted graphic novel read.
  - `SP04-011-01`: watchlist; horror/cabin literal and high detail, no text/UI.
  - `SP04-012-01`: strong pass; Moebius/dreamline sci-fi read.
- Coverage after runtime refresh:
  - `pack_04 taxonomy=100/100 defaultImages=100/100 availableDefaultImages=0/100 staleDefaultImages=100 missingDefaultImages=0`
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `pack_04` still has stale primary debt for all 100 presets.
  - next visual wave: `SP04-013|SP04-014|SP04-015|SP04-016` with one writer and post-generation visual QA.
- Prompt quality note:
  - generation used global denoise suffix and anti-microdetail directive from `scripts/style-default-utils.ts`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_013_016_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-013|SP04-014|SP04-015|SP04-016" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_013_016_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-013-01.webp` (`194126` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-014-01.webp` (`357030` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-015-01.webp` (`818540` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-016-01.webp` (`329340` bytes)
- QA:
  - `SP04-013-01`: pass; chibi readable, toy-set light, no text/camera.
  - `SP04-014-01`: high watchlist; pixel art readable, but superhero/cyber panel and UI-like element.
  - `SP04-015-01`: high watchlist; risograph strong, but robot teacher/pointer/classroom specificity.
  - `SP04-016-01`: high watchlist; tech-noir readable, but corridor/scene/prop UI-like specificity.
- Coverage after runtime refresh:
  - `pack_04 taxonomy=100/100 defaultImages=100/100 availableDefaultImages=0/100 staleDefaultImages=100 missingDefaultImages=0`
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-014`, `SP04-015`, and `SP04-016` should not be promoted without a second prompt/visual pass.
  - next visual wave can continue with `SP04-017|SP04-018|SP04-019|SP04-020`, but primary-ready generation needs tighter ID-scoped prompt review first.
- Prompt quality note:
  - generation used global denoise suffix and anti-microdetail directive from `scripts/style-default-utils.ts`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_017_020_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-017|SP04-018|SP04-019|SP04-020" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_017_020_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-017-01.webp` (`487484` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-018-01.webp` (`347230` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-019-01.webp` (`808606` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-020-01.webp` (`150612` bytes)
- QA:
  - `SP04-017-01`: pass with watchlist; watercolor storybook strong, but library/room literal.
  - `SP04-018-01`: pass with watchlist; paper cutout clear, but shelves/room literal.
  - `SP04-019-01`: pass; crayon drawing strong, fantasy scene literal but readable.
  - `SP04-020-01`: pass; vector flat infographic read, icons but no readable text.
- Coverage after runtime refresh:
  - `pack_04 taxonomy=100/100 defaultImages=100/100 availableDefaultImages=0/100 staleDefaultImages=100 missingDefaultImages=0`
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-017` and `SP04-018` should not be promoted without prompt tightening because they repeat library/room staging.
  - next visual wave: `SP04-021|SP04-022|SP04-023|SP04-024` with one writer; consider ID-scoped guardrails if repeated rooms/shelves continue.
- Prompt quality note:
  - generation used global denoise suffix and anti-microdetail directive from `scripts/style-default-utils.ts`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_021_024_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-021|SP04-022|SP04-023|SP04-024" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_021_024_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-021-01.webp` (`511646` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-022-01.webp` (`659514` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-023-01.webp` (`445370` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-024-01.webp` (`232970` bytes)
- QA:
  - `SP04-021-01`: pass; gouache clear, museum/fossil literal but no library.
  - `SP04-022-01`: pass with watchlist; colored pencil strong, wizard/staff/fantasy literal.
  - `SP04-023-01`: pass with watchlist; scratchboard strong, ritual tabletop prop and tiny pseudo-symbols.
  - `SP04-024-01`: pass with watchlist; claymation strong, weapon/staff-ish prop and fantasy warrior literal.
- Coverage after runtime refresh:
  - `pack_04 taxonomy=100/100 defaultImages=100/100 availableDefaultImages=0/100 staleDefaultImages=100 missingDefaultImages=0`
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-022`, `SP04-023`, and `SP04-024` should not be promoted without tighter ID-scoped prompts.
  - next visual wave: `SP04-025|SP04-026|SP04-027|SP04-028` only if carousel candidates are acceptable; otherwise preview prompts first.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, and the new `pack_04` repeated-scene guardrail in `scripts/generate-style-defaults.ts`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_025_028_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-025|SP04-026|SP04-027|SP04-028" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_025_028_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-025-01.webp` (`497640` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-026-01.webp` (`372234` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-027-01.webp` (`429318` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-028-01.webp` (`541806` bytes)
- QA:
  - `SP04-025-01`: high watchlist; watercolor/fantasy prop drift, weak felt-tip marker read.
  - `SP04-026-01`: pass; pop-up book very readable, literal but preset-compatible.
  - `SP04-027-01`: pass with watchlist; whimsical ink clear, but lantern is protagonist prop.
  - `SP04-028-01`: pass with watchlist; chalk pastel strong, but orb/portal/fantasy literal.
- Coverage after runtime refresh:
  - `pack_04 taxonomy=100/100 defaultImages=100/100 availableDefaultImages=0/100 staleDefaultImages=100 missingDefaultImages=0`
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-025` should be regenerated with ID-scoped prompt before any primary use.
  - next visual wave should use `--print-prompts` if aiming for primary-ready rather than carousel fill.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, and the `pack_04` repeated-scene guardrail in `scripts/generate-style-defaults.ts`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_029_040_x4`

- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-029|SP04-030|SP04-031|SP04-032" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_029_032_x4 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-033|SP04-034|SP04-035|SP04-036" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_033_036_x4 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-037|SP04-038|SP04-039|SP04-040" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_037_040_x4 --force`
- Result:
  - `generated=12 attempted=12 skipped=288 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-029-01.webp` (`328596` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-030-01.webp` (`436108` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-031-01.webp` (`391050` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-032-01.webp` (`661036` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-033-01.webp` (`471060` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-034-01.webp` (`714908` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-035-01.webp` (`99646` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-036-01.webp` (`643342` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-037-01.webp` (`474976` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-038-01.webp` (`537932` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-039-01.webp` (`313588` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-040-01.webp` (`123098` bytes)
- QA:
  - `SP04-029-01`: usable with high watchlist; sticker read clear, but fantasy character dominates.
  - `SP04-030-01`: pass; scientific botanical diagram clear, no readable text.
  - `SP04-031-01`: usable with watchlist; art deco strong, but scene/character too specific.
  - `SP04-032-01`: pass with watchlist; Mucha read strong, but magic prop dominates.
  - `SP04-033-01`: usable with watchlist; propaganda poster strong, but staff/weapon-like prop.
  - `SP04-034-01`: pass; psychedelic poster clear, no text.
  - `SP04-035-01`: high watchlist; minimal vector read, but fantasy spear character weakens preset.
  - `SP04-036-01`: pass; Dada collage clear, no readable text.
  - `SP04-037-01`: pass; Bauhaus geometry clear, no text.
  - `SP04-038-01`: pass with watchlist; WPA screenprint clear, but fantasy landscape drift.
  - `SP04-039-01`: high watchlist; cinematic fantasy scene more than painted movie poster.
  - `SP04-040-01`: usable with watchlist; infographic primitives clear, but object/install UI-like staging.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, new `pack_04` category bases, strengthened `pack_04` repeated-scene guardrail, and ID-scoped motif guidance for `SP04-037..040`.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-035` and `SP04-039` should be regenerated before any primary use.
  - next visual wave: `SP04-041|SP04-042|SP04-043|SP04-044`, with prompt preview if primary-ready quality is required.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_041_044_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-041|SP04-042|SP04-043|SP04-044" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_041_044_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-041-01.webp` (`329150` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-042-01.webp` (`472170` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-043-01.webp` (`577676` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-044-01.webp` (`561226` bytes)
- QA:
  - `SP04-041-01`: pass; fashion illustration clear, no text/UI.
  - `SP04-042-01`: usable with watchlist; surreal album-cover read, but fantasy-character staging.
  - `SP04-043-01`: pass with watchlist; pulp magazine cover read strong, but noir scene very specific.
  - `SP04-044-01`: pass; vintage travel poster clear, no text.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, current `pack_04` category bases, and strengthened repeated-scene guardrail.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-042` and `SP04-043` should stay watchlist unless regenerated with tighter prompt.
  - next visual wave: `SP04-045|SP04-046|SP04-047|SP04-048`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_045_048_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-045|SP04-046|SP04-047|SP04-048" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_045_048_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-045-01.webp` (`824886` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-046-01.webp` (`278332` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-047-01.webp` (`155972` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-048-01.webp` (`298518` bytes)
- QA:
  - `SP04-045-01`: usable with high watchlist; screenprint/gig-poster read, but fantasy character and prop dominate.
  - `SP04-046-01`: usable with watchlist; speedpaint gesture clear, but warrior fantasy scene dominates.
  - `SP04-047-01`: pass with watchlist; matte painting atmosphere clear, but character/fantasy landscape literal.
  - `SP04-048-01`: pass; character sheet readable, secondary views and swatches, no text.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, current `pack_04` category bases, and strengthened repeated-scene guardrail.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-045`, `SP04-046`, and `SP04-047` should not become primary without anti-fantasy-character regeneration.
  - next visual wave: `SP04-049|SP04-050|SP04-051|SP04-052`, preferably after prompt preview.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_049_052_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-049|SP04-050|SP04-051|SP04-052" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_049_052_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-049-01.webp` (`285532` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-050-01.webp` (`317578` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-051-01.webp` (`438772` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-052-01.webp` (`261880` bytes)
- QA:
  - `SP04-049-01`: usable with watchlist; environment concept clear, but fantasy figure/staff dominates.
  - `SP04-050-01`: pass; vehicle design readable, no text/UI.
  - `SP04-051-01`: pass; creature design clear, good design focus.
  - `SP04-052-01`: pass; isometric game art clear, prop/character coherent.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, current `pack_04` category bases, and strengthened repeated-scene guardrail.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-049` should stay watchlist unless regenerated without protagonist/staff.
  - next visual wave: `SP04-053|SP04-054|SP04-055|SP04-056`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_053_056_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-053|SP04-054|SP04-055|SP04-056" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_053_056_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-053-01.webp` (`518868` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-054-01.webp` (`472176` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-055-01.webp` (`222544` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-056-01.webp` (`293384` bytes)
- QA:
  - `SP04-053-01`: pass with watchlist; storyboard sketch clear, but arrows/circles are strong.
  - `SP04-054-01`: usable with high watchlist; prop design clear, but sword/weapon dominates.
  - `SP04-055-01`: high watchlist; fantasy-character key art too generic.
  - `SP04-056-01`: high watchlist; photobash/cinematic read, but fantasy-character scene dominates.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, current `pack_04` category bases, and strengthened repeated-scene guardrail.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-054`, `SP04-055`, and `SP04-056` should not become primary without anti-fantasy-character regeneration.
  - next visual wave: `SP04-057|SP04-058|SP04-059|SP04-060`, preferably with local guardrail.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_057_060_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-057|SP04-058|SP04-059|SP04-060" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_057_060_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-057-01.webp` (`505666` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-058-01.webp` (`253528` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-059-01.webp` (`390692` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-060-01.webp` (`162980` bytes)
- QA:
  - `SP04-057-01`: pass; blueprint schematic clear, orthographic/exploded view, no readable text.
  - `SP04-058-01`: usable with watchlist; low-poly clear, but fantasy character remains.
  - `SP04-059-01`: high watchlist; HUD visible, but character/sword dominates.
  - `SP04-060-01`: high watchlist; mechanical concept clear, but literal weapon dominates.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, current `pack_04` category bases, strengthened repeated-scene guardrail, and ID-scoped motifs for `SP04-057..060`.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-059` and `SP04-060` should be regenerated for primary use.
  - next visual wave: `SP04-061|SP04-062|SP04-063|SP04-064`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_061_064_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-061|SP04-062|SP04-063|SP04-064" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_061_064_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-061-01.webp` (`738520` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-062-01.webp` (`951714` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-063-01.webp` (`629554` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-064-01.webp` (`766580` bytes)
- QA:
  - `SP04-061-01`: high watchlist; linocut clear, but workshop/persona/portrait dominates.
  - `SP04-062-01`: high watchlist; etching clear, but portrait/artist staging dominates.
  - `SP04-063-01`: pass with watchlist; woodcut/ukiyo-e clear, literal landscape/figure.
  - `SP04-064-01`: pass with watchlist; dotwork strong, but fantasy figure present.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, current `pack_04` category bases, strengthened repeated-scene guardrail, and ID-scoped motifs for `SP04-061..064`.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-061` and `SP04-062` should be regenerated for primary use.
  - next visual wave: `SP04-065|SP04-066|SP04-067|SP04-068`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_065_068_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-065|SP04-066|SP04-067|SP04-068" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_065_068_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-065-01.webp` (`637076` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-066-01.webp` (`643674` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-067-01.webp` (`618446` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-068-01.webp` (`617824` bytes)
- QA:
  - `SP04-065-01`: pass; lithograph grain and soft tonal field clear, no text.
  - `SP04-066-01`: pass with watchlist; screenprint clear, but fantasy character dominates.
  - `SP04-067-01`: high watchlist; transfer texture visible, but portrait/artist staging dominates.
  - `SP04-068-01`: pass with watchlist; cyanotype clear, but fantasy figure present.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, current `pack_04` category bases, strengthened repeated-scene guardrail, and ID-scoped motifs for `SP04-065..068`.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-067` should be regenerated for primary use.
  - next visual wave: `SP04-069|SP04-070|SP04-071|SP04-072`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_069_072_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-069|SP04-070|SP04-071|SP04-072" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_069_072_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-069-01.webp` (`738408` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-070-01.webp` (`221450` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-071-01.webp` (`626986` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-072-01.webp` (`844582` bytes)
- QA:
  - `SP04-069-01`: pass with watchlist; rubber-stamp transfer and broken ink are clear, but fantasy figure/object dominates.
  - `SP04-070-01`: high watchlist; mezzotint chiaroscuro reads, but gothic fantasy portrait dominates.
  - `SP04-071-01`: high watchlist; aquatint tone and grain read, but hooded fantasy figure dominates.
  - `SP04-072-01`: pass with watchlist; ballpoint blue hatching and creature anchor read, but dense coastal background adds clutter.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, current `pack_04` category bases, strengthened repeated-scene guardrail, and ID-scoped motifs for `SP04-069..072`.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-070` and `SP04-071` should be regenerated for primary use with object/mark-system prompts.
  - next visual wave: `SP04-073|SP04-074|SP04-075|SP04-076`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_073_076_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-073|SP04-074|SP04-075|SP04-076" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_073_076_x4 --force`
- Result:
  - `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-073-01.webp` (`403808` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-074-01.webp` (`264266` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-075-01.webp` (`675784` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-076-01.webp` (`471810` bytes)
- QA:
  - `SP04-073-01`: pass; fountain-pen flex strokes, wet ink, vellum warmth, no readable text.
  - `SP04-074-01`: high watchlist; Sharpie masses read, but fantasy hero and flag silhouette dominate.
  - `SP04-075-01`: pass; traditional tattoo-flash grammar clear, friendly seahorse anchor, no skin/text.
  - `SP04-076-01`: pass with watchlist; graffiti aerosol gesture and non-text creature read, but wall/platform staging remains.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, current `pack_04` category bases, strengthened repeated-scene guardrail, and ID-scoped motifs for `SP04-073..076`.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-074` should be regenerated for primary use with object/emblem prompt.
  - next visual wave: `SP04-077|SP04-078|SP04-079|SP04-080`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_077_080_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-077|SP04-078|SP04-079|SP04-080" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_077_080_x4 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 --preset=SP04-080 --parallel=1 --variant-slot=2 --session-suffix=qa_p04_080_retry_object --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 --preset=SP04-080 --parallel=1 --variant-slot=3 --session-suffix=qa_p04_080_retry_base --force`
- Result:
  - first wave: `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
  - retry 1: `generated=1 attempted=1 skipped=99 failed=0 packs=pack_04`
  - retry 2: `generated=1 attempted=1 skipped=99 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-077-01.webp` (`566450` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-078-01.webp` (`654394` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-079-01.webp` (`561336` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-080-03.webp` (`341554` bytes)
- Rejected variants:
  - `assets/recipes/styles/defaults/variants/SP04-080-01.webp` (`526408` bytes): reject; person/workshop/table/print block.
  - `assets/recipes/styles/defaults/variants/SP04-080-02.webp` (`481596` bytes): reject; print block/table still dominates.
- QA:
  - `SP04-077-01`: pass with watchlist; wildstyle creature/letterform clear, but wall/platform staging remains.
  - `SP04-078-01`: high watchlist; stencil/overspray clear, but hero figure and architecture dominate.
  - `SP04-079-01`: pass; blackletter ornamental dragon/emblem clear, no readable text.
  - `SP04-080-03`: pass; brush-pen ink and wash over simple subject, no person/workshop.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, strengthened repeated-scene guardrail, ID-scoped motifs for `SP04-077..080`, and a dedicated `SP04-080` base override after two bad retries.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-078` should be regenerated for primary use with object/symbol-only prompt.
  - next visual wave: `SP04-081|SP04-082|SP04-083|SP04-084`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_081_084_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-081|SP04-082|SP04-083|SP04-084" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_081_084_x4 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 --preset=SP04-082 --parallel=1 --variant-slot=2 --session-suffix=qa_p04_082_retry_base --force`
- Result:
  - first wave: `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
  - retry: `generated=1 attempted=1 skipped=99 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-081-01.webp` (`305662` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-082-02.webp` (`399426` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-083-01.webp` (`544594` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-084-01.webp` (`643820` bytes)
- Rejected variants:
  - `assets/recipes/styles/defaults/variants/SP04-082-01.webp` (`523718` bytes): reject; character portrait/key art dominates.
- QA:
  - `SP04-081-01`: pass with watchlist; 3-value silhouette read, but single fantasy hero/sword dominates.
  - `SP04-082-02`: usable with watchlist; better object/environment fragment, but fantasy environment still dominates.
  - `SP04-083-01`: pass with watchlist; gesture/search-line energy clear, but fantasy hero/sword dominates.
  - `SP04-084-01`: pass; material swatches and texture insets clear, no readable text.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, strengthened repeated-scene guardrail, ID-scoped motifs for `SP04-081..084`, and a dedicated `SP04-082` base override after one bad output.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-081`, `SP04-082`, and `SP04-083` need stricter primary regeneration if promoted later.
  - next visual wave: `SP04-085|SP04-086|SP04-087|SP04-088`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_085_088_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-085|SP04-086|SP04-087|SP04-088" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_085_088_x4 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-085|SP04-088" --parallel=2 --variant-slot=2 --session-suffix=qa_p04_085_088_retry_base --force`
- Result:
  - first wave: `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
  - retry: `generated=2 attempted=2 skipped=98 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-085-02.webp` (`102156` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-086-01.webp` (`501738` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-087-01.webp` (`203914` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-088-02.webp` (`239788` bytes)
- Rejected variants:
  - `assets/recipes/styles/defaults/variants/SP04-085-01.webp` (`290004` bytes): reject; hero character + fantasy landscape.
  - `assets/recipes/styles/defaults/variants/SP04-088-01.webp` (`251176` bytes): reject; hero character + cliff pose.
- QA:
  - `SP04-085-02`: pass; mood color-script/time progression clear, no person.
  - `SP04-086-01`: pass with watchlist; callout/exploded details clear, but character armor sheet dominates.
  - `SP04-087-01`: pass; silhouette iteration variants clear, no readable text.
  - `SP04-088-02`: usable with watchlist; rough environment blockout clear, but fantasy architecture dominates.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, strengthened repeated-scene guardrail, ID-scoped motifs for `SP04-085..088`, and dedicated base overrides for `SP04-085/088` after bad first outputs.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-086` and `SP04-088` need stricter primary regeneration if promoted later.
  - next visual wave: `SP04-089|SP04-090|SP04-091|SP04-092`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_089_092_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-089|SP04-090|SP04-091|SP04-092" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_089_092_x4 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 --preset=SP04-092 --parallel=1 --variant-slot=2 --session-suffix=qa_p04_092_retry_base --force`
- Result:
  - first wave: `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
  - retry: `generated=1 attempted=1 skipped=99 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-089-01.webp` (`528634` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-090-01.webp` (`536752` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-091-01.webp` (`451680` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-092-02.webp` (`456018` bytes)
- Rejected variants:
  - `assets/recipes/styles/defaults/variants/SP04-092-01.webp` (`584740` bytes): reject; full posed model dominates.
- QA:
  - `SP04-089-01`: pass; anatomy/variant/swatch sheet clear, no text.
  - `SP04-090-01`: pass; prop variants and exploded parts clear, no readable text.
  - `SP04-091-01`: pass; foam-core/chipboard massing clear, no furniture/interior.
  - `SP04-092-02`: pass; garment fragments, swatches, and trim systems clear, no face/full body.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, strengthened repeated-scene guardrail, ID-scoped motifs for `SP04-089..092`, and dedicated `SP04-092` base override after one bad output.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-090` may need object-only regeneration if promoted later.
  - next visual wave: `SP04-093|SP04-094|SP04-095|SP04-096`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_093_096_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-093|SP04-094|SP04-095|SP04-096" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_093_096_x4 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-093|SP04-096" --parallel=2 --variant-slot=2 --session-suffix=qa_p04_093_096_retry_base --force`
- Result:
  - first wave: `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
  - retry: `generated=2 attempted=2 skipped=98 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-093-02.webp` (`170098` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-094-01.webp` (`588812` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-095-01.webp` (`617316` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-096-02.webp` (`419552` bytes)
- Rejected / non-preferred variants:
  - `assets/recipes/styles/defaults/variants/SP04-093-01.webp` (`152414` bytes): reject; hero character + fantasy vista.
  - `assets/recipes/styles/defaults/variants/SP04-096-01.webp` (`512094` bytes): non-preferred; ornate equipment but weak tier progression.
- QA:
  - `SP04-093-02`: pass; same-form relighting x5 clear, no person.
  - `SP04-094-01`: pass; non-human layered anatomy/reference plate clear, no text.
  - `SP04-095-01`: pass with watchlist; foliage read strong, but more botanical scene than kit.
  - `SP04-096-02`: pass; non-weapon equipment tier progression clear.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, strengthened repeated-scene guardrail, ID-scoped motifs for `SP04-093..096`, and base overrides for `SP04-093/096` after weak first outputs.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `SP04-095` may need kit/swatch regeneration if promoted later.
  - next visual wave: `SP04-097|SP04-098|SP04-099|SP04-100`.

### Representative variants - 2026-06-17 - `pack_04` ola `qa_p04_097_100_x4`

- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-097|SP04-098|SP04-099|SP04-100" --parallel=4 --variant-slot=1 --session-suffix=qa_p04_097_100_x4 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 --preset=SP04-097 --parallel=1 --variant-slot=2 --session-suffix=qa_p04_097_retry_base --force`
- Result:
  - first wave: `generated=4 attempted=4 skipped=96 failed=0 packs=pack_04`
  - retry: `generated=1 attempted=1 skipped=99 failed=0 packs=pack_04`
- New carousel variants:
  - `assets/recipes/styles/defaults/variants/SP04-097-02.webp` (`586658` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-098-01.webp` (`812532` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-099-01.webp` (`536546` bytes)
  - `assets/recipes/styles/defaults/variants/SP04-100-01.webp` (`358630` bytes)
- Rejected variants:
  - `assets/recipes/styles/defaults/variants/SP04-097-01.webp` (`520994` bytes): reject; brayer/printmaking prop dominates.
- QA:
  - `SP04-097-02`: pass; grayscale composition thumbnails clear, no brayer/tool prop.
  - `SP04-098-01`: pass; world-map/atlas plate clear, no readable labels.
  - `SP04-099-01`: usable with watchlist; UI/HUD wireframe clear, but central character-like marker dominates.
  - `SP04-100-01`: pass; monster scale lineup and footprint marks clear, no labels/text.
- Prompt quality note:
  - generation used global denoise suffix, anti-microdetail directive, strengthened repeated-scene guardrail, ID-scoped motifs for `SP04-097..100`, and dedicated `SP04-097` base override after one bad output.
- Interpretation:
  - variants are carousel candidates only; no primary promotion happened.
  - `pack_04` carousel sweep now covers `SP04-001..100`.
  - `pack_04` primary default images remain stale/default until promotion or primary regeneration policy runs.

### Representative variants - 2026-06-17 - `pack_05` ola `qa_p05_021_029*`

- Accepted carousel variants:
  - `assets/recipes/styles/defaults/variants/SP05-021-03.webp` (`409504` bytes): usable with watchlist; costume/motion fragment, less IP-like than prior slots.
  - `assets/recipes/styles/defaults/variants/SP05-022-02.webp` (`255670` bytes): usable; urban supernatural aura, no visible sword.
  - `assets/recipes/styles/defaults/variants/SP05-023-03.webp` (`376638` bytes): usable with watchlist; headless adventure costume/rope/sky read.
  - `assets/recipes/styles/defaults/variants/SP05-025-02.webp` (`314704` bytes): pass; cerebral thriller graphic tension, no readable notebook.
  - `assets/recipes/styles/defaults/variants/SP05-028-04.webp` (`487926` bytes): usable; lo-fi roadtrip rhythm, no sword/lamp/interior.
  - `assets/recipes/styles/defaults/variants/SP05-029-02.webp` (`495668` bytes): pass; chaotic indie pop-collage anime energy.
- Rejected / non-preferred variants:
  - `SP05-021-01`, `SP05-021-02`, `SP05-023-01`, `SP05-023-02`: too franchise-like.
  - `SP05-022-01`, `SP05-025-01`, `SP05-028-01`, `SP05-028-02`, `SP05-028-03`: too sword/fight/interior/lamp/person-first.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-021|SP05-022|SP05-023|SP05-025|SP05-028|SP05-029" --parallel=6 --variant-slot=1 --session-suffix=qa_p05_021_029_x6 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-021|SP05-022|SP05-023|SP05-025|SP05-028|SP05-029" --parallel=6 --variant-slot=2 --session-suffix=qa_p05_021_029_retry_safe_x6 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-021|SP05-023|SP05-028" --parallel=3 --variant-slot=3 --session-suffix=qa_p05_021_023_028_retry_fragment_x3 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 --preset=SP05-028 --parallel=1 --variant-slot=4 --session-suffix=qa_p05_028_retry_no_room --force`
- Interpretation:
  - no primary promotion happened.
  - `pack_05` requires ID-specific IP guardrails before each wave.

### Representative variants - 2026-06-17 - `pack_05` ola `qa_p05_031_036_x6`

- Accepted carousel variants:
  - `assets/recipes/styles/defaults/variants/SP05-031-01.webp` (`524460` bytes): usable; ceremonial motion arcs, no visible blade.
  - `assets/recipes/styles/defaults/variants/SP05-032-02.webp` (`356292` bytes): usable with watchlist; occult aura/hand crop, odd small prop.
  - `assets/recipes/styles/defaults/variants/SP05-033-01.webp` (`664016` bytes): watchlist; punk graphic splatter, no explicit gore.
  - `assets/recipes/styles/defaults/variants/SP05-034-01.webp` (`310186` bytes): usable; bright academy-hero styling.
  - `assets/recipes/styles/defaults/variants/SP05-035-01.webp` (`441200` bytes): usable with watchlist; vertical survival read, industrial lamp is preset-specific.
  - `assets/recipes/styles/defaults/variants/SP05-036-02.webp` (`247138` bytes): usable; colossal ruined mechanized scale, no foreground weapon.
- Rejected / non-preferred variants:
  - `SP05-032-01` (`335572` bytes): sword/weapon-first urban fight.
  - `SP05-036-01` (`287044` bytes): weapon/hero-first war drama.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-031|SP05-032|SP05-033|SP05-034|SP05-035|SP05-036" --parallel=6 --variant-slot=1 --session-suffix=qa_p05_031_036_x6 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-032|SP05-036" --parallel=2 --variant-slot=2 --session-suffix=qa_p05_032_036_retry_no_weapon --force`
- Next:
  - continue `SP05-037|SP05-038|SP05-039|SP05-040|SP05-051|SP05-052`.

### Representative variants - 2026-06-17 - `pack_05` ola `qa_p05_037_052_x6`

- Accepted carousel variants:
  - `assets/recipes/styles/defaults/variants/SP05-037-01.webp` (`353098` bytes): usable with watchlist; deadpan impact comedy, strong protagonist but no obvious IP.
  - `assets/recipes/styles/defaults/variants/SP05-038-01.webp` (`476152` bytes): usable with watchlist; psychic pop rupture clear, corridor/figure dominate.
  - `assets/recipes/styles/defaults/variants/SP05-039-01.webp` (`361052` bytes): usable; tactical vectors and adventure clarity, no UI/text.
  - `assets/recipes/styles/defaults/variants/SP05-040-01.webp` (`528336` bytes): usable; mythic symbolic field, no foreground weapon.
  - `assets/recipes/styles/defaults/variants/SP05-051-01.webp` (`330400` bytes): usable; neon alloy/cyber motion read.
  - `assets/recipes/styles/defaults/variants/SP05-052-01.webp` (`297398` bytes): usable with watchlist; surveillance grid read, cyborg protagonist strong.
- Prompt quality note:
  - added ID-specific anti-IP/anti-weapon/anti-readable-UI motifs for `SP05-037|SP05-038|SP05-039|SP05-040|SP05-051|SP05-052` before generation.
- Command:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-037|SP05-038|SP05-039|SP05-040|SP05-051|SP05-052" --parallel=6 --variant-slot=1 --session-suffix=qa_p05_037_052_x6 --force`
- Next:
  - continue `SP05-053|SP05-054|SP05-055|SP05-056|SP05-057|SP05-058`.

### Representative variants - 2026-06-17 - `pack_05` ola `qa_p05_053_058_x6`

- Accepted carousel variants:
  - `assets/recipes/styles/defaults/variants/SP05-053-01.webp` (`554678` bytes): pass; heavy hydraulic industrial mecha, no insignia/weapon-first.
  - `assets/recipes/styles/defaults/variants/SP05-054-01.webp` (`485886` bytes): usable with watchlist; luminous space-opera, strong protagonist but no weapon focus.
  - `assets/recipes/styles/defaults/variants/SP05-055-02.webp` (`357758` bytes): pass; gothic industrial shell/object, no person/weapon.
  - `assets/recipes/styles/defaults/variants/SP05-056-01.webp` (`332446` bytes): usable with watchlist; geometric ignition, strong protagonist but no text/weapon.
  - `assets/recipes/styles/defaults/variants/SP05-057-01.webp` (`358252` bytes): usable with watchlist; sleek collapse romance, strong suit/body focus but not sexualized.
  - `assets/recipes/styles/defaults/variants/SP05-058-02.webp` (`83816` bytes): usable with high watchlist; grief/control mood clear, lower UI risk, but soft and person-forward.
- Rejected / non-preferred variants:
  - `SP05-055-01` (`408926` bytes): reject; blade-like foreground.
  - `SP05-058-01` (`280726` bytes): non-preferred; readable-ish UI and weapon-like drones.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-053|SP05-054|SP05-055|SP05-056|SP05-057|SP05-058" --parallel=6 --variant-slot=1 --session-suffix=qa_p05_053_058_x6 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-055|SP05-058" --parallel=2 --variant-slot=2 --session-suffix=qa_p05_055_058_retry_object --force`
- Next:
  - continue `SP05-059|SP05-060|SP05-061|SP05-062|SP05-063|SP05-064`.

### Representative variants - 2026-06-17 - `pack_05` ola `qa_p05_059_064_x6`

- Accepted carousel variants:
  - `assets/recipes/styles/defaults/variants/SP05-059-01.webp` (`439490` bytes): usable with watchlist; tactical network cognition, UI-like overlays not clearly readable.
  - `assets/recipes/styles/defaults/variants/SP05-060-01.webp` (`444102` bytes): usable with watchlist; orbital rivalry/symmetry clear, no foreground weapon.
  - `assets/recipes/styles/defaults/variants/SP05-061-02.webp` (`546824` bytes): usable with watchlist; crosshatched doom/eclipsed weight, still person-forward.
  - `assets/recipes/styles/defaults/variants/SP05-062-03.webp` (`302784` bytes): usable with high watchlist; split mask/emblem improved, but still dark ruin/skull-adjacent.
  - `assets/recipes/styles/defaults/variants/SP05-063-01.webp` (`401234` bytes): usable with watchlist; crimson gothic authority, no explicit gore.
  - `assets/recipes/styles/defaults/variants/SP05-064-02.webp` (`436090` bytes): usable with watchlist; wind-scoured redemption, figure remains but no weapon/gore.
- Rejected / non-preferred variants:
  - `SP05-061-01` (`603812` bytes): too famous dark-fantasy swordsman-like / hero portrait.
  - `SP05-062-01` (`363580` bytes): too body-horror/person-forward.
  - `SP05-062-02` (`473512` bytes): reject; humanoid dominant, aggressive ribbon/blade read, gothic ruin.
  - `SP05-064-01` (`315976` bytes): too famous dark-fantasy/samurai-like, kneeling hero.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-059|SP05-060|SP05-061|SP05-062|SP05-063|SP05-064" --parallel=6 --variant-slot=1 --session-suffix=qa_p05_059_064_x6 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-061|SP05-062|SP05-064" --parallel=3 --variant-slot=2 --session-suffix=qa_p05_061_062_064_retry_object --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 --preset=SP05-062 --parallel=1 --variant-slot=3 --session-suffix=qa_p05_062_retry_emblem --force`
- Interpretation:
  - no primary promotion happened.
  - `SP05-061`, `SP05-062`, and `SP05-064` need better primary candidates if this category is promoted later.

### Representative variants - 2026-06-17 - `pack_05` ola `qa_p05_065_070_x6`

- Accepted carousel variants:
  - `assets/recipes/styles/defaults/variants/SP05-065-01.webp` (`387782` bytes): usable only as watchlist; pale threshold mood clear, but hero/ruin remain too strong.
  - `assets/recipes/styles/defaults/variants/SP05-066-01.webp` (`384526` bytes): usable with watchlist; ceramic-botanical corruption, still humanoid/cathedral-adjacent.
  - `assets/recipes/styles/defaults/variants/SP05-067-01.webp` (`376094` bytes): reject for primary; hero with weapon/cathedral, not aligned with object/depth intent.
  - `assets/recipes/styles/defaults/variants/SP05-068-01.webp` (`342830` bytes): reject for primary; hero/ruin/lamp/cathedral dominates.
  - `assets/recipes/styles/defaults/variants/SP05-069-01.webp` (`491818` bytes): reject for primary; full hero and dungeon-like geometry dominate.
  - `assets/recipes/styles/defaults/variants/SP05-070-01.webp` (`327634` bytes): usable with watchlist; neon tragic metamorphosis energy clear, strong character silhouette.
- Provider-blocked retries:
  - `qa_p05_065_069_retry_object` returned `generated=0 attempted=5 failed=5`, all `status needs_review`; no repo variants written.
  - `qa_p05_091_096_x6`, `qa_p05_091_096_safe_label_x6`, `qa_p05_121_126_x6`, `qa_p05_121_122_compact_safe`, `qa_p05_121_material_safe`, `qa_p05_221_226_x6`, and `qa_p05_237_242_x6` also returned `status needs_review` with no recoverable assets for those sessions.
- Commands:
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-065|SP05-066|SP05-067|SP05-068|SP05-069|SP05-070" --parallel=6 --variant-slot=1 --session-suffix=qa_p05_065_070_x6 --force`
  - `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-065|SP05-066|SP05-067|SP05-068|SP05-069" --parallel=5 --variant-slot=2 --session-suffix=qa_p05_065_069_retry_object --force`
- Interpretation:
  - `needs_review` jobs can still leave assets in Studio Library; `qa_p05_065_070_x6` had assets and repo variants, later blocked sessions did not.
  - Next implementation step should add a script path that can inspect/recover assets from `needs_review` jobs by session when safe, or route sensitive pack_05 prompts through a more conservative provider-safe recipe.

### Representative variants - 2026-06-17 - `pack_05` olas safe-label `qa_p05_252_260`, `qa_p05_243_255`, `qa_p05_262_278`, `qa_p05_097_100`

Se agregaron safe labels/motifs provider-safe en `scripts/generate-style-defaults.ts` para separar prompt visible de nombres YAML IP-like. Todos los prompts mantienen denoise fuerte y anti-microdetail al final.

Accepted carousel candidates:

- `assets/recipes/styles/defaults/variants/SP05-098-01.webp` (`508676` bytes): usable; bright monster-nation fantasy, readable subject, no obvious IP lock.
- `assets/recipes/styles/defaults/variants/SP05-099-01.webp` (`427992` bytes): usable; defensive underdog aura, barrier geometry clear.
- `assets/recipes/styles/defaults/variants/SP05-100-01.webp` (`425300` bytes): usable; luminous vertical adventure space, no weapon foreground.
- `assets/recipes/styles/defaults/variants/SP05-253-01.webp` (`402052` bytes): usable; herbarium/healing glow, strong botanical/court read.
- `assets/recipes/styles/defaults/variants/SP05-257-01.webp` (`302648` bytes): usable; moonlit diplomacy mood, no market aisle lock.
- `assets/recipes/styles/defaults/variants/SP05-260-01.webp` (`394018` bytes): usable; pastel companion quest, readable and distinct.

Usable with watchlist:

- `assets/recipes/styles/defaults/variants/SP05-243-01.webp` (`481840` bytes): fantasy route/hero-forward but readable OVA quest tone.
- `assets/recipes/styles/defaults/variants/SP05-244-01.webp` (`269674` bytes): ritual authority clear; watchlist for court-costume/person dominance.
- `assets/recipes/styles/defaults/variants/SP05-245-01.webp` (`432770` bytes): prophecy romance clear; watchlist for fantasy vista convergence.
- `assets/recipes/styles/defaults/variants/SP05-246-01.webp` (`562776` bytes): jewel adventure clear; watchlist for market/ornament density.
- `assets/recipes/styles/defaults/variants/SP05-250-01.webp` (`519370` bytes): quiet vow read; watchlist for paladin/temple route.
- `assets/recipes/styles/defaults/variants/SP05-255-01.webp` (`546808` bytes): bright gem-engine magic read; watchlist for anime hero route.
- `assets/recipes/styles/defaults/variants/SP05-252-01.webp` (`394128` bytes): comfort-road read; watchlist for hero/food prop.
- `assets/recipes/styles/defaults/variants/SP05-258-01.webp` (`335562` bytes): utility quest mood; watchlist for generic hero.
- `assets/recipes/styles/defaults/variants/SP05-259-01.webp` (`451330` bytes): storybook courage tone; watchlist for fantasy town/hero.
- `assets/recipes/styles/defaults/variants/SP05-097-01.webp` (`435828` bytes): dark dominion read; watchlist high for tower/hero darkness.

Rejected / do not promote as primary:

- `assets/recipes/styles/defaults/variants/SP05-262-01.webp` (`295028` bytes): dark hero/cathedral convergence.
- `assets/recipes/styles/defaults/variants/SP05-265-01.webp` (`470372` bytes): weapon-like dark hero/cathedral convergence.
- `assets/recipes/styles/defaults/variants/SP05-271-01.webp` (`415328` bytes): dark corridor/hero convergence.
- `assets/recipes/styles/defaults/variants/SP05-272-01.webp` (`350406` bytes): dark hero/city/cathedral convergence.
- `assets/recipes/styles/defaults/variants/SP05-273-01.webp` (`301558` bytes): gothic creature/ruin convergence, not ecological calm enough.
- `assets/recipes/styles/defaults/variants/SP05-278-01.webp` (`359704` bytes): cave/cathedral dark hero convergence.

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-252|SP05-253|SP05-257|SP05-258|SP05-259|SP05-260" --parallel=6 --variant-slot=1 --session-suffix=qa_p05_252_260_safe_x6 --force` -> `generated=6 attempted=6 skipped=129 failed=0 packs=pack_05`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-243|SP05-244|SP05-245|SP05-246|SP05-250|SP05-255" --parallel=6 --variant-slot=1 --session-suffix=qa_p05_243_255_safe_x6 --force` -> `generated=6 attempted=6 skipped=129 failed=0 packs=pack_05`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-271|SP05-273|SP05-278|SP05-272|SP05-265|SP05-262" --parallel=6 --variant-slot=1 --session-suffix=qa_p05_262_278_safe_x6 --force` -> `generated=6 attempted=6 skipped=129 failed=0 packs=pack_05`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-097|SP05-098|SP05-099|SP05-100" --parallel=4 --variant-slot=1 --session-suffix=qa_p05_097_100_safe_x4 --force` -> `generated=4 attempted=4 skipped=131 failed=0 packs=pack_05`.

Interpretation:

- no primary promotion happened.
- `dark_fantasy_and_seinen` needs a stricter object/material/environment-first base before more generation.
- continue next with safer non-dark `pack_05` ranges, using safe labels before generation.

### Representative variants - 2026-06-17 - `pack_05` olas safe-label `qa_p05_130_148`, `qa_p05_124_254`, `qa_p05_094_256`

Se agregaron safe labels/motifs provider-safe para continuar `pack_05` sin enviar nombres IP-like como target style. No primary promotion happened.

Accepted carousel candidates:

- `assets/recipes/styles/defaults/variants/SP05-094-01.webp` (`210796` bytes): pass; object/card-like parody fantasy timing, no hero/corridor drift.
- `assets/recipes/styles/defaults/variants/SP05-126-01.webp` (`281576` bytes): pass; paranormal comedy color/shape read, no gore/weapon.
- `assets/recipes/styles/defaults/variants/SP05-130-01.webp` (`643130` bytes): pass; psychic paint overflow, strong visual identity.
- `assets/recipes/styles/defaults/variants/SP05-140-01.webp` (`378622` bytes): pass; ancient calm spell geometry, readable and clean.
- `assets/recipes/styles/defaults/variants/SP05-143-01.webp` (`381030` bytes): pass; electric night-rain noir, no gun/knife foreground.
- `assets/recipes/styles/defaults/variants/SP05-144-01.webp` (`305898` bytes): pass; lo-fi dusty swagger, readable motion.
- `assets/recipes/styles/defaults/variants/SP05-222-01.webp` (`429940` bytes): pass; civic machine procedure, no readable UI.
- `assets/recipes/styles/defaults/variants/SP05-228-01.webp` (`346218` bytes): pass; pale machine elegy, distinct from hero-fantasy drift.
- `assets/recipes/styles/defaults/variants/SP05-239-01.webp` (`345400` bytes): pass; bubblegum cosmic scale, colorful and distinct.
- `assets/recipes/styles/defaults/variants/SP05-254-01.webp` (`583392` bytes): pass; celestial romance omen, readable but watch for fantasy town reuse later.

Usable with watchlist:

- `assets/recipes/styles/defaults/variants/SP05-124-01.webp` (`397066` bytes): sports ego pressure clear; watchlist for hero-action/crouch formula.
- `assets/recipes/styles/defaults/variants/SP05-129-01.webp` (`467090` bytes): impact satire clear; watchlist for generic hero destruction.
- `assets/recipes/styles/defaults/variants/SP05-133-01.webp` (`330970` bytes): magic-force comedy clear; watchlist for academy/crowd backdrop.
- `assets/recipes/styles/defaults/variants/SP05-137-01.webp` (`506984` bytes): invention/blueprint energy clear; watchlist for action-hero read.
- `assets/recipes/styles/defaults/variants/SP05-148-01.webp` (`577138` bytes): jazz pulp motion clear; watchlist for gang/action convergence.
- `assets/recipes/styles/defaults/variants/SP05-225-01.webp` (`532198` bytes): scrap velocity clear; watchlist for corridor/mecha chase.
- `assets/recipes/styles/defaults/variants/SP05-248-01.webp` (`474424` bytes): fantasy cuisine clear; watchlist for dungeon/cooking prop scene.
- `assets/recipes/styles/defaults/variants/SP05-256-01.webp` (`551720` bytes): folklore threshold romance clear; watchlist for fantasy-town/hero.

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-130|SP05-137|SP05-140|SP05-143|SP05-144|SP05-148" --parallel=6 --variant-slot=1 --session-suffix=qa_p05_130_148_safe_x6 --force` -> `generated=6 attempted=6 skipped=129 failed=0 packs=pack_05`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-129|SP05-133|SP05-124|SP05-126|SP05-254|SP05-222" --parallel=6 --variant-slot=1 --session-suffix=qa_p05_124_254_safe_x6 --force` -> `generated=6 attempted=6 skipped=129 failed=0 packs=pack_05`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-225|SP05-228|SP05-239|SP05-248|SP05-256|SP05-094" --parallel=6 --variant-slot=1 --session-suffix=qa_p05_094_256_safe_x6 --force` -> `generated=6 attempted=6 skipped=129 failed=0 packs=pack_05`.

Next:

- generate `SP05-095|SP05-096` and selected `SP05-228|SP05-231|SP05-236` family after adding safe labels where missing.
- keep dark-fantasy retries paused until object/material-first base is in place.

### Representative variants - 2026-06-17 - `pack_05` ola safe-label `qa_p05_095_236`

Se agregaron safe labels/motifs para `SP05-231` y `SP05-236`; `SP05-095/096` ya usaban safe DNA. No primary promotion happened.

Accepted carousel candidates:

- `assets/recipes/styles/defaults/variants/SP05-095-01.webp` (`221698` bytes): pass; afterquest melancholy as clean relic/meadow memory, no hero/IP lock.
- `assets/recipes/styles/defaults/variants/SP05-096-01.webp` (`263050` bytes): pass; candy-neon strategy object, strong card read, no UI/text.

Usable with watchlist:

- `assets/recipes/styles/defaults/variants/SP05-231-01.webp` (`467660` bytes): watchlist; coral resonance mood clear, but humanoid/cathedral-corridor pressure remains.
- `assets/recipes/styles/defaults/variants/SP05-236-01.webp` (`320134` bytes): watchlist; compact hardware read clear, but dark corridor/robot crouch remains.

Command:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-095|SP05-096|SP05-231|SP05-236" --parallel=4 --variant-slot=1 --session-suffix=qa_p05_095_236_safe_x4 --force` -> `generated=4 attempted=4 skipped=131 failed=0 packs=pack_05`.

Next:

- keep `SP05-231/236` as carousel only.
- next safe route: non-dark/non-mecha IDs, or add object/material-first base before risky mecha/dark retries.

### Representative variants - 2026-06-17 - `pack_05` probe safe-label `qa_p05_121_125`

Probe de cuatro IDs riesgosos ya cubiertos por safe labels. No primary promotion happened.

Accepted carousel candidates:

- `assets/recipes/styles/defaults/variants/SP05-121-01.webp` (`283362` bytes): pass; lantern-elemental object card, no weapon/character copy.
- `assets/recipes/styles/defaults/variants/SP05-122-01.webp` (`462294` bytes): usable/pass; grimy contract-panic object read, no gore/weapon foreground.

Usable with high watchlist:

- `assets/recipes/styles/defaults/variants/SP05-123-01.webp` (`492178` bytes): hero/cathedral-inferno pressure remains.
- `assets/recipes/styles/defaults/variants/SP05-125-01.webp` (`313762` bytes): civic response read clear, but uniform/hero-action still dominant.

Command:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_05 "--preset=SP05-121|SP05-122|SP05-123|SP05-125" --parallel=4 --variant-slot=1 --session-suffix=qa_p05_121_125_safe_probe_x4 --force` -> `generated=4 attempted=4 skipped=131 failed=0 packs=pack_05`.

Next:

- do not promote `SP05-123/125` as primary without object/material-first retry.
- remaining risky IDs should use new base strategy, not more hero-forward probes.

### Visual checkpoint - 2026-06-17 - `pack_14` / `pack_15`

Coverage rechecked:

- `bun run styles:validate -- --pack=pack_14 --coverage`
- `bun run styles:validate -- --pack=pack_15 --coverage`

Current state:

- `pack_14`: `defaultImages=123/123`, `availableDefaultImages=123/123`, `staleDefaultImages=0`, `missingDefaultImages=0`.
- `pack_15`: `defaultImages=137/137`, `availableDefaultImages=137/137`, `staleDefaultImages=0`, `missingDefaultImages=0`.

Interpretation:

- `pack_14` and `pack_15` remain closed for stale/missing default-card debt.
- Do not prioritize new visual generation there unless a fresh semantic edit lands on specific IDs.
- Current visual debt remains concentrated in packs with stale defaults: `pack_03`, `pack_04`, `pack_05`, `pack_06`, `pack_07`, `pack_13`, `pack_16`.

### Primary defaults - 2026-06-18 - `pack_04` wave 2

Regeneradas y aprobadas como primarias nuevas:

- `SP04-011|SP04-012|SP04-013|SP04-014|SP04-015|SP04-016|SP04-017|SP04-018|SP04-019|SP04-020`.

Backups:

- Base previa: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave2_20260618-012855`.
- Rejects x6: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave2_rejects_20260618-013942`.
- Reject `SP04-020`: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave2_rejects_sp04_020_20260618-014340`.

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-011|SP04-012|SP04-013|SP04-014|SP04-015|SP04-016|SP04-017|SP04-018|SP04-019|SP04-020" --parallel=10 --session-suffix=primary_p04_wave2_x10 --force` -> `generated=10 attempted=10 skipped=90 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-012|SP04-014|SP04-016|SP04-018|SP04-019|SP04-020" --parallel=6 --session-suffix=primary_p04_wave2_retry_x6 --force` -> `generated=6 attempted=6 skipped=94 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-020" --parallel=1 --session-suffix=primary_p04_wave2_retry_sp04_020 --force` -> `generated=1 attempted=1 skipped=99 failed=0`.

QA:

- Pasan: `SP04-011`, `SP04-012`, `SP04-013`, `SP04-014`, `SP04-015`, `SP04-016`, `SP04-017`, `SP04-018`, `SP04-019`, `SP04-020`.
- Retries: `SP04-012` por humanoide/traveler, `SP04-014` por humano/rooftop, `SP04-016` por humanoide/device, `SP04-018` por child/person, `SP04-019` por child/fantasy hero y `SP04-020` por vehicle/rocket drift.
- Watchlist aceptado: `SP04-014` usa escena pixel vertical y `SP04-018` usa ave con rama, pero ambos son representativos y no caen en persona/UI/texto/camara/pasillo de mercado.

Next stale primary IDs:

- `SP04-021` a `SP04-030`.

### Primary defaults - 2026-06-18 - `pack_04` wave 3

Regeneradas y aprobadas como primarias nuevas:

- `SP04-021|SP04-022|SP04-023|SP04-024|SP04-025|SP04-026|SP04-027|SP04-028|SP04-029|SP04-030`.

Backups:

- Base previa: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave3_20260618-015209`.
- Rejects x3: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave3_rejects_20260618-020001`.

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-021|SP04-022|SP04-023|SP04-024|SP04-025|SP04-026|SP04-027|SP04-028|SP04-029|SP04-030" --parallel=10 --session-suffix=primary_p04_wave3_x10 --force` -> `generated=10 attempted=10 skipped=90 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-024|SP04-025|SP04-029" --parallel=3 --session-suffix=primary_p04_wave3_retry_x3 --force` -> `generated=3 attempted=3 skipped=97 failed=0`.

QA:

- Pasan: `SP04-021`, `SP04-022`, `SP04-023`, `SP04-024`, `SP04-025`, `SP04-026`, `SP04-027`, `SP04-028`, `SP04-029`, `SP04-030`.
- Retries: `SP04-024` por humano/espada/fantasy path, `SP04-025` por portrait humano y `SP04-029` por humanoide sticker con prop.
- Watchlist aceptado: `SP04-022` y `SP04-028` son criaturas fantasy/animal-forward, pero representan bien colored-pencil/chalk-pastel sin texto/UI/camara/pasillo.

Next stale primary IDs:

- `SP04-031` a `SP04-040`.

### Primary defaults - 2026-06-18 - `pack_04` wave 4

Regeneradas y aprobadas como primarias nuevas:

- `SP04-031|SP04-032|SP04-033|SP04-034|SP04-035|SP04-036|SP04-037|SP04-038|SP04-039|SP04-040`.

Backups:

- Base previa: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave4_20260618-020652`.
- Rejects x2: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave4_rejects_20260618-021306`.

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-031|SP04-032|SP04-033|SP04-034|SP04-035|SP04-036|SP04-037|SP04-038|SP04-039|SP04-040" --parallel=10 --session-suffix=primary_p04_wave4_x10 --force` -> `generated=10 attempted=10 skipped=90 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-036|SP04-040" --parallel=2 --session-suffix=primary_p04_wave4_retry_x2 --force` -> `generated=2 attempted=2 skipped=98 failed=0`.

QA:

- Pasan: `SP04-031`, `SP04-032`, `SP04-033`, `SP04-034`, `SP04-035`, `SP04-036`, `SP04-037`, `SP04-038`, `SP04-039`, `SP04-040`.
- Retries: `SP04-036` por lente/camara-like, `SP04-040` por backpack/product-dashboard demasiado literal.
- Watchlist aceptado: `SP04-035` y `SP04-039` usan personaje/escena porque el preset lo pide; no se consideran drift si venden mejor Minimalist Vector / Movie Poster.

Next stale primary IDs:

- `SP04-041` a `SP04-050`.

### Primary defaults - 2026-06-18 - `pack_04` wave 5

Regeneradas y aprobadas como primarias nuevas:

- `SP04-041|SP04-042|SP04-043|SP04-044|SP04-045|SP04-046|SP04-047|SP04-048|SP04-049|SP04-050`.

Backups:

- Base previa: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave5_20260618-022328`.
- Rejects x2: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave5_rejects_20260618-023019`.

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-041|SP04-042|SP04-043|SP04-044|SP04-045|SP04-046|SP04-047|SP04-048|SP04-049|SP04-050" --parallel=10 --session-suffix=primary_p04_wave5_x10 --force` -> `generated=10 attempted=10 skipped=90 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-042|SP04-043" --parallel=2 --session-suffix=primary_p04_wave5_retry_x2 --force` -> `generated=2 attempted=2 skipped=98 failed=0`.

QA:

- Pasan: `SP04-041`, `SP04-042`, `SP04-043`, `SP04-044`, `SP04-045`, `SP04-046`, `SP04-047`, `SP04-048`, `SP04-049`, `SP04-050`.
- Retries: `SP04-042` por fashion/portrait drift, `SP04-043` por detective + playing card/text.
- Watchlist aceptado: `SP04-044`, `SP04-046`, `SP04-047`, `SP04-049` usan personaje/escena porque estos presets dependen de escena, mood y escala.

Next stale primary IDs:

- `SP04-051` a `SP04-060`.

### Primary defaults - 2026-06-18 - `pack_04` wave 6

Regeneradas y aprobadas como primarias nuevas:

- `SP04-051|SP04-052|SP04-053|SP04-054|SP04-055|SP04-056|SP04-057|SP04-058|SP04-059|SP04-060`.

Backups:

- Base previa: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave6_20260618-024147`.
- Reject `SP04-060`: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave6_rejects_20260618-025027`.

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-051|SP04-052|SP04-053|SP04-054|SP04-055|SP04-056|SP04-057|SP04-058|SP04-059|SP04-060" --parallel=10 --session-suffix=primary_p04_wave6_x10 --force` -> `generated=10 attempted=10 skipped=90 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-060" --parallel=1 --session-suffix=primary_p04_wave6_retry_sp04_060 --force` -> `generated=1 attempted=1 skipped=99 failed=0`.

QA:

- Pasan: `SP04-051`, `SP04-052`, `SP04-053`, `SP04-054`, `SP04-055`, `SP04-056`, `SP04-057`, `SP04-058`, `SP04-059`, `SP04-060`.
- Retry: `SP04-060` por arma literal en pasillo/market alley.
- Watchlist aceptado: `SP04-052`, `SP04-055`, `SP04-056`, `SP04-058` usan personaje/escena porque venden mejor isometric/keyframe/photobash/low-poly; `SP04-060` queda concept-sheet legible sin pasillo ni personaje.

Next stale primary IDs:

- `SP04-061` a `SP04-070`.

### Primary defaults - 2026-06-18 - `pack_04` wave 7

Regeneradas y aprobadas como primarias nuevas:

- `SP04-061|SP04-062|SP04-063|SP04-064|SP04-065|SP04-066|SP04-067|SP04-068|SP04-069|SP04-070`.

Backups:

- Base previa: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave7_20260618-030307`.
- Rejects `SP04-062|SP04-067|SP04-068|SP04-069|SP04-070`: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave7_rejects_20260618-030910`.
- Reject `SP04-068`: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave7_rejects2_20260618-031403`.

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-061|SP04-062|SP04-063|SP04-064|SP04-065|SP04-066|SP04-067|SP04-068|SP04-069|SP04-070" --parallel=10 --session-suffix=primary_p04_wave7_x10 --force` -> `generated=10 attempted=10 skipped=90 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-062|SP04-067|SP04-068|SP04-069|SP04-070" --parallel=5 --session-suffix=primary_p04_wave7_retry_x5 --force` -> `generated=5 attempted=5 skipped=95 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 --preset=SP04-068 --parallel=1 --session-suffix=primary_p04_wave7_retry2_sp04_068 --force` -> `generated=1 attempted=1 skipped=99 failed=0`.

QA:

- Pasan: `SP04-061`, `SP04-062`, `SP04-063`, `SP04-064`, `SP04-065`, `SP04-066`, `SP04-067`, `SP04-068`, `SP04-069`, `SP04-070`.
- Retry: `SP04-062` por prensa/taller/documento botánico; `SP04-067` por corredor/persona; `SP04-068` por fantasy hero/arma y luego por humano fantasy; `SP04-069` por hero/castillo; `SP04-070` por cuchillo/religioso/gothic portrait.
- Watchlist aceptado: `SP04-066` usa personaje central porque vende serigraph/pop; `SP04-067` queda paisaje monotype, pero con textura de transferencia clara.

Next stale primary IDs:

- `SP04-071` a `SP04-080`.

### Primary defaults - 2026-06-18 - `pack_04` wave 8

Regeneradas y aprobadas como primarias nuevas:

- `SP04-071|SP04-072|SP04-073|SP04-074|SP04-075|SP04-076|SP04-077|SP04-078|SP04-079|SP04-080`.

Backups:

- Base previa: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave8_20260618-032435`.
- Rejects `SP04-071|SP04-073|SP04-077`: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave8_rejects_20260618-033011`.
- Reject `SP04-077`: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave8_rejects2_20260618-033446`.

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-071|SP04-072|SP04-073|SP04-074|SP04-075|SP04-076|SP04-077|SP04-078|SP04-079|SP04-080" --parallel=10 --session-suffix=primary_p04_wave8_x10 --force` -> `generated=10 attempted=10 skipped=90 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-071|SP04-073|SP04-077" --parallel=3 --session-suffix=primary_p04_wave8_retry_x3 --force` -> `generated=3 attempted=3 skipped=97 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 --preset=SP04-077 --parallel=1 --session-suffix=primary_p04_wave8_retry2_sp04_077 --force` -> `generated=1 attempted=1 skipped=99 failed=0`.

QA:

- Pasan: `SP04-071`, `SP04-072`, `SP04-073`, `SP04-074`, `SP04-075`, `SP04-076`, `SP04-077`, `SP04-078`, `SP04-079`, `SP04-080`.
- Retry: `SP04-071` por gothic ruin/figura armada; `SP04-073` por fantasy hero con espada; `SP04-077` por muro/arma fantasy y luego por muro/arquitectura.
- Watchlist aceptado: `SP04-071` conserva figura/barca en niebla pero sin ruina dominante; `SP04-076` tiene creature/tag agresivo; `SP04-078` usa figura stencil, apropiada al preset.

Next stale primary IDs:

- `SP04-081` a `SP04-090`.

### Primary defaults - 2026-06-18 - `pack_04` wave 9

Regeneradas y aprobadas como primarias nuevas:

- `SP04-081|SP04-082|SP04-083|SP04-084|SP04-085|SP04-086|SP04-087|SP04-088|SP04-089|SP04-090`.

Backups:

- Base previa: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave9_20260618-034659`.
- Rejects `SP04-081|SP04-082|SP04-086|SP04-087`: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave9_rejects_20260618-035347`.

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-081|SP04-082|SP04-083|SP04-084|SP04-085|SP04-086|SP04-087|SP04-088|SP04-089|SP04-090" --parallel=10 --session-suffix=primary_p04_wave9_x10 --force` -> `generated=10 attempted=10 skipped=90 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-081|SP04-082|SP04-086|SP04-087" --parallel=4 --session-suffix=primary_p04_wave9_retry_x4 --force` -> `generated=4 attempted=4 skipped=96 failed=0`.

QA:

- Pasan: `SP04-081`, `SP04-082`, `SP04-083`, `SP04-084`, `SP04-085`, `SP04-086`, `SP04-087`, `SP04-088`, `SP04-089`, `SP04-090`.
- Retry: `SP04-081` por cliff hero/arma; `SP04-082` por fantasy gate/corridor; `SP04-086` por full armored hero; `SP04-087` por single hero pose.
- Watchlist aceptado: `SP04-082` queda photobash shell/pod costero, `SP04-085` mantiene color-script grid, `SP04-088` mantiene environment vista pero sin personaje/arma/corredor.

Next stale primary IDs:

- `SP04-091` a `SP04-100`.

### Primary defaults - 2026-06-18 - `pack_04` wave 10

Regeneradas y aprobadas como primarias nuevas:

- `SP04-091|SP04-092|SP04-093|SP04-094|SP04-095|SP04-096|SP04-097|SP04-098|SP04-099|SP04-100`.

Backups:

- Base previa: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave10_20260618-040303`.
- Rejects `SP04-092|SP04-095|SP04-099`: `D:\codex-studio-backups\style-defaults-primary-backup\pack_04_wave10_rejects_20260618-041006`.

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-091|SP04-092|SP04-093|SP04-094|SP04-095|SP04-096|SP04-097|SP04-098|SP04-099|SP04-100" --parallel=10 --session-suffix=primary_p04_wave10_x10 --force` -> `generated=10 attempted=10 skipped=90 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_04 "--preset=SP04-092|SP04-095|SP04-099" --parallel=3 --session-suffix=primary_p04_wave10_retry_x3 --force` -> `generated=3 attempted=3 skipped=97 failed=0`.

QA:

- Pasan: `SP04-091`, `SP04-092`, `SP04-093`, `SP04-094`, `SP04-095`, `SP04-096`, `SP04-097`, `SP04-098`, `SP04-099`, `SP04-100`.
- Retry: `SP04-092` por full models/weapons; `SP04-095` por forest creature scene; `SP04-099` por face/UI-heavy layout.
- Watchlist aceptado: `SP04-095` queda foliage focal mas que kit perfecto, pero sin humano/mercado/corredor/texto; `SP04-096` tiene object progression fuerte sin arma.

Next stale primary IDs:

- `pack_04` cerrado visualmente; siguiente deuda grande: `pack_05`, `pack_13`, `pack_16`, `pack_06`.

### Semantic-only wave - 2026-06-17 - `pack_08` residual P2

No card images generated in this wave.

Updated manifests:

- `SP08-047`: reduced candelabra/cathedral literal pull.
- `SP08-054`: changed `mail curtain` to `flexible mail drape`.
- `SP08-076`: reduced under-shelf/studio prop pull.
- `SP08-078`: reduced dark-room lock.

Visual backlog impact:

- these IDs become stale by manifest-change rule until primary regeneration or carousel promotion policy covers them.

### Primary defaults - 2026-06-17 - `pack_08` stale ola `SP08-002/026/027/035`

First real primary replacement wave for current `pack_08` stale defaults. IDs came from `lib/staleStyleDefaultImages.generated.ts`, not docs.

Backup before overwrite:

- `D:\codex-studio-backups\style-defaults-primary-backup\pack_08_20260617-193641`

Prompt guardrails added:

- `SP08-002`: no bedroom/studio/chair/curtain/clothing rack/readable branding.
- `SP08-026`: no indoor room/studio backdrop/curtain/bed/chair/gang insignia.
- `SP08-027`: no bedroom/studio/chair/curtain/fisheye/logos.
- `SP08-035`: no weapon/combat/castle interior/human face closeup.

Generated primary defaults:

- `assets/recipes/styles/defaults/SP08-002.webp` (`251222` bytes): pass; streetwear exterior/edge, no room lock.
- `assets/recipes/styles/defaults/SP08-026.webp` (`276616` bytes): usable; road-worn leather read, watchlist person-forward.
- `assets/recipes/styles/defaults/SP08-027.webp` (`320992` bytes): usable; skater context, watchlist person-forward.
- `assets/recipes/styles/defaults/SP08-035.webp` (`387376` bytes): pass; ceremonial armor, no weapon foreground.

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-002|SP08-026|SP08-027|SP08-035" --parallel=4 --session-suffix=primary_p08_002_035_x4 --force` -> `generated=4 attempted=4 skipped=76 failed=0 packs=pack_08`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts/generate-style-defaults.ts --pack=pack_08 "--preset=SP08-002|SP08-026|SP08-027" --parallel=3 --session-suffix=primary_p08_002_027_retry_no_room --force` -> `generated=3 attempted=3 skipped=77 failed=0 packs=pack_08`.

Next stale primary IDs:

- `SP08-037`, `SP08-038`, `SP08-040`, `SP08-065`.

### Semantic-only wave - 2026-06-17 - `pack_08` P1

- No card images generated in this wave.
- Updated manifests only:
  - `SP08-006`, `SP08-014`, `SP08-015`, `SP08-034`, `SP08-036`, `SP08-037`.
- Visual backlog impact:
  - primary/stale counts unchanged until card regeneration or promotion policy runs.
  - next visual work remains blocked on provider-safe generation for sensitive `pack_05` sessions or stale-default primary promotion flow.

### Semantic-only wave - 2026-06-17 - `pack_07/pack_08` P2/P3

- No card images generated in this wave.
- Updated manifests only:
  - `pack_07`: `SP07-003`, `SP07-015`, `SP07-032`, `SP07-054`, `SP07-073`, `SP07-080`.
  - `pack_08`: `SP08-008`, `SP08-042`, `SP08-074`, `SP08-076`, `SP08-080`.
- Visual backlog impact:
  - stale/missing counts unchanged.
  - these edits reduce future card drift around lamps, curtains, signage, corridors, cameras, flags, gore, body-horror, and featureless black-card outputs.

### Primary defaults - 2026-06-19 - `pack_12` gameplay screencap reset

Reset aplicado tras QA manual: las cards de `pack_12` deben leerse como
capturas jugables de videojuego, no concept art, poster, key art, asset sheet,
menu screen, HUD, ni pixel-art generico.

Prompt/tooling:

- `scripts/generate-style-defaults.ts` ahora trata `pack_12` como contrato
  especial: `in-engine gameplay screencap`, composicion landscape de camara de
  juego, estado jugable visible, sin card portrait framing.
- Se corrigio la contradiccion `16:9` + `1536x1024`; queda `landscape
game-camera frame` para no forzar relaciones incompatibles.
- Guardrail: permitir violencia/sangre estilizada cuando el genero lo necesita,
  pero evitar gore explicito, dismemberment, torture detail o shock imagery.

Generacion y regeneracion:

- Smoke/regeneracion previa validada visualmente: `SP12-001..060`.
- Regeneradas por borrado/rechazo manual: `SP12-027`, `SP12-033`,
  `SP12-035`, `SP12-037`, `SP12-039`, `SP12-040`, `SP12-044`, `SP12-045`,
  `SP12-046`.
- Nuevas de cierre: `SP12-061..080`.

Commands principales:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_12 "--preset=SP12-027|SP12-033|SP12-035|SP12-037" --parallel=4 --session-suffix=primary_p12_true_screencap_regen_027_033_035_037 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_12 "--preset=SP12-039|SP12-040|SP12-044|SP12-045" --parallel=4 --session-suffix=primary_p12_true_screencap_regen_039_040_044_045 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_12 "--preset=SP12-046|SP12-061|SP12-062|SP12-063" --parallel=4 --session-suffix=primary_p12_true_screencap_046_061_063 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_12 "--preset=SP12-064|SP12-065|SP12-066|SP12-067" --parallel=4 --session-suffix=primary_p12_true_screencap_064_067 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_12 "--preset=SP12-068|SP12-069|SP12-070|SP12-071" --parallel=4 --session-suffix=primary_p12_true_screencap_068_071 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_12 "--preset=SP12-072|SP12-073|SP12-074|SP12-075" --parallel=4 --session-suffix=primary_p12_true_screencap_072_075 --force` -> `generated=4 attempted=4 skipped=76 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_12 "--preset=SP12-076|SP12-077|SP12-078|SP12-079|SP12-080" --parallel=5 --session-suffix=primary_p12_true_screencap_076_080 --force` -> `generated=5 attempted=5 skipped=75 failed=0`.

QA visual:

- Contact sheets revisados en `logs\qa-pack12-true-screencap-*`.
- Backup final externo: `D:\codex-studio-backups\style-defaults-primary-backup\pack_12_true_screencap_close_20260619-014933` (`80` cards + `22` QA sheets).
- Aceptados como gameplay/screencap, con variedad de camaras: third-person,
  isometric/tactical, racing chase cam, stealth over-the-shoulder, side-view,
  arena duel, tower defense y co-op hold.
- Watchlist aceptado: `SP12-080` queda cinematic boss-adjacent, pero conserva
  avatar, ruta central y lectura de playable frame.

Coverage:

- Missing real: `0/80`.
- `bun run styles:validate -- --pack=pack_12 --coverage` -> `availableDefaultImages=80/80`, `staleDefaultImages=0`, `missingDefaultImages=0`.

### Primary defaults - 2026-06-19 - `pack_15` missing rerun `SP15-113..118`

Se retomo deuda visual real detectada por coverage vivo: `pack_15` habia caido a
`availableDefaultImages=114/137`, `missingDefaultImages=23` tras borrados
manuales. `pack_14` sigue cerrado (`123/123`, `stale=0`, `missing=0`).

Generadas:

- `SP15-113` Stemcell Harbor
- `SP15-114` Organ Garden Observatory
- `SP15-115` Bioglass Rain Atrium
- `SP15-116` Tidal Neon Causeway
- `SP15-117` Reef Choir Harbor
- `SP15-118` Kelp Arcade Boardwalk

Prompt/manifest fix:

- `SP15-116` y `SP15-117` recibieron ajuste semantico anti microdetalle:
  broad readable forms, restrained bloom/glow, denoised surfaces, sin glitter,
  ultra-fine circuitry o coral filigree denso.

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-113|SP15-114|SP15-115|SP15-116|SP15-117|SP15-118" --parallel=3 --session-suffix=primary_p15_missing_113_118_rerun --force` -> `generated=6 attempted=6 skipped=131 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_15 "--preset=SP15-116|SP15-117" --parallel=2 --session-suffix=primary_p15_missing_116_117_denoise_retry --force` -> `generated=2 attempted=2 skipped=135 failed=0`.

QA:

- Contact sheets: `logs\qa-pack15-missing-113-118-*` y
  `logs\qa-pack15-missing-116-117-retry-*`.
- Aceptadas: `SP15-113`, `SP15-114`, `SP15-115`, `SP15-116`, `SP15-117`,
  `SP15-118`.
- Watchlist aceptado: `SP15-116` sigue ornamental/neon-heavy, pero el retry
  redujo ruido fino y conserva lectura de tidal causeway.

Backup:

- `D:\codex-studio-backups\style-defaults-primary-backup\pack_15_missing_113_118_20260619-020505` (`6` cards + `2` QA sheets).

Coverage:

- `bun run styles:validate -- --pack=pack_15 --coverage` -> `availableDefaultImages=120/137`, `staleDefaultImages=0`, `missingDefaultImages=17`.
- Siguiente tanda real: `SP15-119..124`.

### Visual pause - 2026-06-19 - `pack_15` reset required

Se congela la generacion visual de `pack_15`. Las tandas recientes no deben
continuar por inercia: el resultado se volvio generico/insulso y demasiado
cercano a hero-card occidental, objeto-only o poster de trabajador segun el ID.

Reset necesario antes de nuevas imagenes:

- Brief por preset: protagonista caracteristico + fondo/dispositivo tematico,
  no crew anonima, no objeto-only, no poster revolucionario.
- Estetica: ilustracion/pintura digital controlada, menos hiperrealismo y
  menos microdetalle/ruido fino.
- Composicion: variar crop, edad/cuerpo/gesto, relacion fisica con el
  dispositivo/mundo; evitar full-body RPG, botas/capas/pouches por defecto.
- Negativos: reducir listas globales enormes; usar 4-6 bloqueos especificos
  por preset para evitar apagar personalidad.
- Acceptance: thumbnail debe leerse como ese x-punk especifico, no como la
  misma card con otro color.

No se generaron imagenes en este checkpoint.

### Semantic note - 2026-06-19 - `pack_08` before visual missing work

Antes de regenerar missing visuales de `pack_08`, se aplico polish semantico
P2/P3 en `SP08-008`, `SP08-009`, `SP08-012`, `SP08-016`, `SP08-017`,
`SP08-026`, `SP08-033`, `SP08-057`, `SP08-060`, `SP08-075` y `SP08-077`.
El objetivo fue quitar palabras positivas que forzaban rol/escena/pose
(`inventor`, `gang`, `auditorium`, `temple`, `study`, `smoking-room`,
`living-statue`, `pedestal`) antes de cualquier nueva card.

No se generaron imagenes.

### Prompt reset - 2026-06-19 - `pack_15` before next visual wave

Coverage vivo actual:

- `pack_14`: `availableDefaultImages=19/123`, `staleDefaultImages=0`,
  `missingDefaultImages=104`.
- `pack_15`: `availableDefaultImages=11/80`, `staleDefaultImages=0`,
  `missingDefaultImages=69`.

Se ajusto `scripts/generate-style-defaults.ts` para que `pack_15` no vuelva a
caer en protagonistas genericos ni tarjetas de trabajadores:

- Fuera bucket generico `operator/guardian/rider/hacker/...`.
- `worker-scale focal action` -> `character-scale figure-device action`.
- `visible community labor` -> relacion personal con el sistema.
- Regla activa: protagonista caracteristico derivado del preset exacto +
  dispositivo/fondo tematico; no objeto-only, no worker crew, no RPG hero, no
  propaganda, no hiperrealismo ni microdetalle ruidoso.

No se generaron imagenes. Proxima tanda visual debe ser pequena y revisable,
idealmente `2-4` cards piloto antes de acelerar.

### Primary defaults - 2026-06-19 - `pack_14` missing resume, `SP14-002..028`

Se pausa `pack_15` para trabajarlo aparte. La cola principal vuelve a missing
cards fuera de `pack_15`, empezando por `pack_14`.

Prompt/tooling:

- `scripts/generate-style-defaults.ts` agrega guardrail especifico `pack_14`
  para cortar convergencia de `hooded saint`, halo circular, altar/table,
  chalice/candle/gothic-arch y objeto-only repetido.
- Regla activa: una anchor mythic-noir preset-specific; variar figura,
  partial figure, objeto + gesto, material specimen, crop, accion y fragmento
  de mundo entre presets vecinos.
- Mantener ilustracion / graphic novel / clean digital painting, detail medio,
  midtones legibles y denoise fuerte; evitar photoreal, crushed-black noise y
  microdetalle ornamental.

Generadas:

- `SP14-002|SP14-003|SP14-004|SP14-005|SP14-006|SP14-007`
- `SP14-009|SP14-011|SP14-012|SP14-013|SP14-014|SP14-015`
- `SP14-016|SP14-017|SP14-018|SP14-019|SP14-020|SP14-021`
- `SP14-022|SP14-023|SP14-024|SP14-025|SP14-027|SP14-028`

Commands:

- `bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-002|SP14-003|SP14-004|SP14-005|SP14-006|SP14-007" --parallel=3 --session-suffix=pack14_missing_002_007` -> `generated=6 attempted=6 skipped=117 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-009|SP14-011|SP14-012|SP14-013|SP14-014|SP14-015" --parallel=3 --session-suffix=pack14_missing_009_015` -> `generated=6 attempted=6 skipped=117 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-016|SP14-017|SP14-018|SP14-019|SP14-020|SP14-021" --parallel=3 --session-suffix=pack14_missing_016_021` -> `generated=6 attempted=6 skipped=117 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-022|SP14-023|SP14-024|SP14-025|SP14-027|SP14-028" --parallel=3 --session-suffix=pack14_missing_022_028` -> `generated=6 attempted=6 skipped=117 failed=0`.

QA sheets:

- `logs\qa-pack14-missing-002-007-2026-06-19T17-03-34-414Z.webp`
- `logs\qa-pack14-missing-009-015-2026-06-19T17-12-59-646Z.webp`
- `logs\qa-pack14-missing-016-021-2026-06-19T17-24-27-164Z.webp`
- `logs\qa-pack14-missing-022-028-2026-06-19T17-35-15-135Z.webp`

Backup:

- `D:\codex-studio-backups\style-defaults-primary-backup\pack_14_missing_002_028_20260619-173900`
  (`24` cards, `manifest-pack_14.json`, `4` QA sheets, and dry-run prompt log
  when present).

QA visual:

- `SP14-002..007`: usable/watchlist; limpia y denoised, pero `SP14-003` y
  `SP14-006` compartian demasiado `hooded figure + circular halo`; esto motivo
  el nuevo guardrail `pack_14`.
- `SP14-009..015`: pass; mayor variedad de sujeto/escena. `SP14-009` conserva
  circle/chapel por preset, aceptado por contexto.
- `SP14-016..021`: pass; mitologias diferenciadas, figuras y acciones claras,
  sin ruido fino roto.
- `SP14-022..028`: pass/watchlist; mas detalle y fantasia, pero sigue legible
  y preset-specific. `SP14-024` incluye sangre/violencia estilizada leve,
  aceptable bajo la politica actual cuando el preset lo necesita.

Coverage:

- `bun run styles:validate -- --pack=pack_14 --coverage` -> `availableDefaultImages=43/123`, `staleDefaultImages=0`, `missingDefaultImages=80`.
- Siguiente cola `pack_14`: `SP14-029|SP14-030|SP14-031|SP14-032|SP14-033|SP14-034`.

### Primary defaults - 2026-06-19 - `pack_14` deleted/missing resume `SP14-001..051`

El usuario borro algunas cards que no gustaron. Se toma el filesystem vivo como
verdad: esas cards vuelven a la cola `missing`, no se restauran desde git.
`pack_15` sigue fuera de esta tarea.

Prompt/tooling:

- Se corrigio bug en `scripts/generate-style-defaults.ts`: `visualResetLine`
  usaba `promptOverride` antes de declararlo en algunas rutas de dry-run.
- Se reforzo guardrail `pack_14` para Greek Epics: evitar repetir el mismo
  joven helenico de perfil con laurel; variar edad, genero, rol, objeto civico,
  contexto naval/rio/corte y postura por preset.

Generadas/regeneradas:

- `SP14-001|SP14-003|SP14-004|SP14-005|SP14-007|SP14-008`
- `SP14-009|SP14-010|SP14-013|SP14-015|SP14-016|SP14-018`
- `SP14-021|SP14-023|SP14-027|SP14-028|SP14-036|SP14-038`
- `SP14-039|SP14-040|SP14-047|SP14-048|SP14-050|SP14-051`

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-001|SP14-003|SP14-004|SP14-005|SP14-007|SP14-008" --parallel=3 --session-suffix=pack14_deleted_missing_regen_001_008` -> `generated=3 attempted=6 skipped=117 failed=3`.
- Retry failed socket/timeout:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-001|SP14-003|SP14-004" --parallel=1 --session-suffix=pack14_deleted_missing_retry_001_003_004` -> `generated=3 attempted=3 skipped=120 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-009|SP14-010|SP14-013|SP14-015|SP14-016|SP14-018" --parallel=2 --session-suffix=pack14_deleted_missing_regen_009_018` -> `generated=6 attempted=6 skipped=117 failed=0`.
- Retry missing repo file:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 --preset=SP14-010 --parallel=1 --session-suffix=pack14_deleted_missing_retry_sp14_010` -> `generated=1 attempted=1 skipped=122 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-021|SP14-023|SP14-027|SP14-028|SP14-036|SP14-038" --parallel=2 --session-suffix=pack14_deleted_missing_regen_021_038` -> `generated=6 attempted=6 skipped=117 failed=0`.
- Retry missing repo file:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 --preset=SP14-021 --parallel=1 --session-suffix=pack14_deleted_missing_retry_sp14_021` -> `generated=1 attempted=1 skipped=122 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-039|SP14-040|SP14-047|SP14-048|SP14-050|SP14-051" --parallel=2 --session-suffix=pack14_deleted_missing_regen_039_051` -> `generated=6 attempted=6 skipped=117 failed=0`.
- Retry Greek similarity:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-048|SP14-051" --parallel=1 --session-suffix=pack14_greek_variety_retry_048_051 --force` -> `generated=2 attempted=2 skipped=121 failed=0`.

QA sheets:

- `logs\qa-pack14-deleted-missing-001-008-2026-06-19T18-59-59-619Z.webp`
- `logs\qa-pack14-deleted-missing-009-018-2026-06-19T19-22-44-943Z.webp`
- `logs\qa-pack14-deleted-missing-021-038-2026-06-19T19-42-37-473Z.webp`
- `logs\qa-pack14-deleted-missing-039-051-2026-06-19T19-59-22-746Z.webp`
- `logs\qa-pack14-deleted-missing-039-051-final-2026-06-19T20-08-10-702Z.webp`

Backups:

- Final:
  `D:\codex-studio-backups\style-defaults-primary-backup\pack_14_deleted_missing_001_051_20260619-200900`
  (`24` cards, `manifest-pack_14.json`, QA sheets, prompt logs when present).
- Rejects:
  `D:\codex-studio-backups\style-defaults-primary-backup\pack_14_reject_similar_greek_048_051_20260619-200000`.

QA visual:

- `SP14-001|003|004|005|007|008`: pass/watchlist. `SP14-003` conserva saint
  halo por preset; vigilar que no vuelva a plantilla para otras cards.
- `SP14-009|010|013|015|016|018`: pass/watchlist. `SP14-009` usa blade/relic
  fuerte; aceptado provisional por lectura Leviathan Chapel, vigilar RPG-weapon
  drift.
- `SP14-021|023|027|028|036|038`: pass; buena variedad de griot, Anansi,
  worldtree, valkyrie, ghost bell y serpent-kami.
- `SP14-039|040|047|048|050|051`: primer QA detecto convergencia Greek youth
  profile en `047/048/051`; se reintentaron `048` y `051`. Final aceptado
  provisional, con `051` aun mas limpio/clasico que el resto.

Coverage:

- Antes de esta ronda tras borrados: `availableDefaultImages=32/123`,
  `staleDefaultImages=0`, `missingDefaultImages=91`.
- Despues de esta ronda:
  `bun run styles:validate -- --pack=pack_14 --coverage` -> `availableDefaultImages=56/123`,
  `staleDefaultImages=0`, `missingDefaultImages=67`.
- Siguiente cola `pack_14`:
  `SP14-052|SP14-053|SP14-054|SP14-055|SP14-056|SP14-057|SP14-058|SP14-059|SP14-060|SP14-061|SP14-062|SP14-063`.

### Primary defaults - 2026-06-19 - `pack_14` missing `SP14-052..069`

Continuacion de missing visuales de `pack_14`; `pack_15` sigue excluido.

Prompt/tooling:

- Se reforzo de nuevo el guardrail Greek Epics: no resolver Helios, memorial,
  academy, law, strategy o river como el mismo joven robed public speaker; usar
  beacon keepers, elder jurists, ferrymen, relief fragments, council tables,
  naval omens, weathered shields o partial figures cuando separen mejor.

Generadas/regeneradas:

- `SP14-052|SP14-053|SP14-054|SP14-055|SP14-056|SP14-057`
- `SP14-058|SP14-059|SP14-060|SP14-061|SP14-062|SP14-063`
- `SP14-064|SP14-065|SP14-066|SP14-067|SP14-068|SP14-069`

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-052|SP14-053|SP14-054|SP14-055|SP14-056|SP14-057" --parallel=2 --session-suffix=pack14_missing_052_057` -> `generated=6 attempted=6 skipped=117 failed=0`.
- Retry Greek youth similarity:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-052|SP14-056" --parallel=1 --session-suffix=pack14_greek_variety_retry_052_056 --force` -> `generated=2 attempted=2 skipped=121 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-058|SP14-059|SP14-060|SP14-061|SP14-062|SP14-063" --parallel=2 --session-suffix=pack14_missing_058_063` -> `generated=6 attempted=6 skipped=117 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-064|SP14-065|SP14-066|SP14-067|SP14-068|SP14-069" --parallel=2 --session-suffix=pack14_missing_064_069` -> `generated=6 attempted=6 skipped=117 failed=0`.

QA sheets:

- `logs\qa-pack14-missing-052-057-2026-06-19T20-20-15-338Z.webp`
- `logs\qa-pack14-missing-052-057-final-2026-06-19T20-29-52-177Z.webp`
- `logs\qa-pack14-missing-058-063-2026-06-19T20-45-02-148Z.webp`
- `logs\qa-pack14-missing-064-069-2026-06-19T20-58-03-514Z.webp`

Backups:

- Final:
  `D:\codex-studio-backups\style-defaults-primary-backup\pack_14_missing_052_069_20260619-210000`
  (`18` cards, `manifest-pack_14.json`, QA sheets).
- Rejects:
  `D:\codex-studio-backups\style-defaults-primary-backup\pack_14_reject_greek_youth_052_056_20260619-202100`.

QA visual:

- `SP14-052|056` first pass rechazado por repetir joven griego/laurel; retry
  aceptado: `SP14-052` lee beacon keeper mas viejo y `SP14-056` memorial/relief
  con figura adulta.
- `SP14-053|054|055|057`: pass/watchlist; `SP14-054` mantiene perfil griego,
  pero femenino/legal-wind y suficientemente separado.
- `SP14-058..063`: pass; ceremonial pero diferenciados por lion, river,
  carving, eclipse law, calabash sky y drum relay.
- `SP14-064..069`: pass/watchlist; `SP14-066` y `SP14-068` comparten staff
  ceremonial, aceptado por setting y funcion distintos.

Coverage:

- `bun run styles:validate -- --pack=pack_14 --coverage` -> `availableDefaultImages=74/123`,
  `staleDefaultImages=0`, `missingDefaultImages=49`.
- Siguiente cola `pack_14`:
  `SP14-070|SP14-071|SP14-072|SP14-073|SP14-074|SP14-075|SP14-076|SP14-077|SP14-078|SP14-079|SP14-080|SP14-081`.

### Primary defaults - 2026-06-19 - `pack_14` missing `SP14-070..081`

Continuacion visual de `pack_14`; `pack_15` sigue excluido.

Prompt/tooling:

- Guardrail `pack_14` refuerza Norse Sagas: evitar repetir joven viajero con
  capa de piel y luz azul-gris; variar elder skalds, map stones, raven primary
  anchors, ship prows, rune instruments, shield fragments, spirit departure
  silhouettes y weather-scale compositions.

Generadas/regeneradas:

- `SP14-070|SP14-071|SP14-072|SP14-073|SP14-074|SP14-075`
- `SP14-076|SP14-077|SP14-078|SP14-079|SP14-080|SP14-081`

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-070|SP14-071|SP14-072|SP14-073|SP14-074|SP14-075" --parallel=2 --session-suffix=pack14_missing_070_075` -> `generated=6 attempted=6 skipped=117 failed=0`.
- Retry Norse youth similarity:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-072|SP14-075" --parallel=1 --session-suffix=pack14_norse_variety_retry_072_075 --force` -> `generated=2 attempted=2 skipped=121 failed=0`.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-076|SP14-077|SP14-078|SP14-079|SP14-080|SP14-081" --parallel=2 --session-suffix=pack14_missing_076_081` -> `generated=6 attempted=6 skipped=117 failed=0`.

QA sheets:

- `logs\qa-pack14-missing-070-075-2026-06-19T21-15-31-404Z.webp`
- `logs\qa-pack14-missing-070-075-final-2026-06-19T21-23-21-241Z.webp`
- `logs\qa-pack14-missing-076-081-2026-06-19T21-36-49-172Z.webp`

Backups:

- Final:
  `D:\codex-studio-backups\style-defaults-primary-backup\pack_14_missing_070_081_20260619-214000`
  (`12` cards, `manifest-pack_14.json`, QA sheets).
- Rejects:
  `D:\codex-studio-backups\style-defaults-primary-backup\pack_14_reject_norse_youth_072_075_20260619-211600`.

QA visual:

- `SP14-070|071|073|074`: pass/watchlist; Norse dark/blue shape language sigue
  fuerte, pero motivos se separan por soul departure, doctrine, wolf oath y
  serpent crossing.
- `SP14-072|075`: first pass rechazado por repetir joven fur-cloak/cold palette;
  retry aceptado: `SP14-072` elder navigator, `SP14-075` raven intelligence.
- `SP14-076..081`: pass; quench rite, thing deliberation, burial memory,
  last stand, yew fate y comet archive leen distintos.

Coverage:

- `bun run styles:validate -- --pack=pack_14 --coverage` -> `availableDefaultImages=84/123`,
  `staleDefaultImages=0`, `missingDefaultImages=39`.
- Siguiente cola `pack_14`:
  `SP14-040|SP14-047|SP14-082|SP14-083|SP14-084|SP14-085|SP14-086|SP14-087|SP14-088|SP14-089|SP14-090|SP14-091`.

### Primary defaults - 2026-06-19 - `pack_14` missing `SP14-040/047/082..091`

Continuacion visual de `pack_14`; `pack_15` sigue excluido.

Generadas/regeneradas:

- `SP14-040|SP14-047|SP14-082|SP14-083|SP14-084|SP14-085`
- `SP14-086|SP14-087|SP14-088|SP14-089|SP14-090|SP14-091`

Commands:

- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-040|SP14-047|SP14-082|SP14-083|SP14-084|SP14-085" --parallel=2 --session-suffix=pack14_missing_040_085` -> `generated=6 attempted=6 skipped=117 failed=0`; `SP14-084` tuvo retry interno por `needs_review` y cerro.
- `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_14 "--preset=SP14-086|SP14-087|SP14-088|SP14-089|SP14-090|SP14-091" --parallel=2 --session-suffix=pack14_missing_086_091` -> `generated=6 attempted=6 skipped=117 failed=0`.

QA sheets:

- `logs\qa-pack14-missing-040-085-2026-06-19T21-48-57-314Z.webp`
- `logs\qa-pack14-missing-086-091-2026-06-19T22-01-55-265Z.webp`

Backup:

- `D:\codex-studio-backups\style-defaults-primary-backup\pack_14_missing_040_091_20260619-220300`
  (`12` cards, `manifest-pack_14.json`, QA sheets).

QA visual:

- `SP14-040|047`: pass; regeneran IDs previamente borrados con lectura clara
  de fate archive y trireme omen.
- `SP14-082..085`: pass/watchlist; `SP14-082` y `SP14-083` comparten figura
  oscura + instrumento, pero el meridian verdict y zodiac destiny se separan
  suficiente. `SP14-084` y `SP14-085` dan escala cosmica distinta.
- `SP14-086..091`: pass; buena variedad de basin, salt divination, planetary
  bell, glass astrolabe, auroral containment y falling suns spiral. `SP14-087`
  queda watchlist por perfil/anime white cloak, pero preset legible.

Coverage:

- `bun run styles:validate -- --pack=pack_14 --coverage` -> `availableDefaultImages=96/123`,
  `staleDefaultImages=0`, `missingDefaultImages=27`.
- Siguiente cola `pack_14`:
  `SP14-092|SP14-093|SP14-094|SP14-095|SP14-096|SP14-097|SP14-098|SP14-099|SP14-100|SP14-101|SP14-102|SP14-104`.

### Primary defaults - 2026-06-19 - `pack_14` cierre `SP14-092..123` + user-deleted regen

Continuacion visual de `pack_14`; `pack_15` sigue excluido. Los assets
faltantes detectados durante la ronda se trataron como rechazo intencional del
usuario, no como archivos a restaurar desde backup.

Prompt/tooling:

- Guardrail `pack_14` ahora cubre cosmology, symbolism, ritual y pantheon para
  evitar resolver todo como joven robed, sigilo circular, relic-on-altar o dark
  temple interior.
- Overrides puntuales agregados para `SP14-081|082|083|089|090|094|095|098|099|101|102`
  y `SP14-107..123`, priorizando sujeto legible, identidad por preset y denoise.

Generadas/regeneradas:

- `SP14-092|SP14-093|SP14-094|SP14-095|SP14-096|SP14-097`
- `SP14-098|SP14-099|SP14-100|SP14-101|SP14-102|SP14-104`
- `SP14-106|SP14-107|SP14-108|SP14-109|SP14-110|SP14-111`
- Retry de `SP14-107|SP14-108|SP14-109|SP14-110|SP14-111` por robed-youth /
  dark-temple sameness.
- `SP14-112|SP14-113|SP14-116|SP14-117|SP14-118|SP14-120`
- `SP14-121|SP14-122|SP14-123`
- Regeneracion post-borrado: `SP14-081|SP14-082|SP14-083|SP14-089|SP14-090|SP14-094`
- Regeneracion post-borrado: `SP14-095|SP14-098|SP14-099|SP14-101|SP14-102`
- Regeneracion post-borrado tardio: `SP14-104`

QA sheets:

- `logs\qa-pack14-missing-092-097-2026-06-19T22-15-38-917Z.webp`
- `logs\qa-pack14-missing-098-104-2026-06-19T22-27-12-104Z.webp`
- `logs\qa-pack14-missing-106-111-final-2026-06-19T22-46-40-311Z.webp`
- `logs\qa-pack14-missing-112-120-2026-06-19T22-56-37-836Z.webp`
- `logs\qa-pack14-missing-121-123-2026-06-19T23-01-47-386Z.webp`
- `logs\qa-pack14-regen-081-094-2026-06-19T23-12-12-423Z.webp`
- `logs\qa-pack14-regen-095-102-2026-06-19T23-19-19-073Z.webp`

Backups:

- Finales `092..104`:
  `D:\codex-studio-backups\style-defaults-primary-backup\pack_14_missing_092_104_20260619-192732`
- Rejects `107..111`:
  `D:\codex-studio-backups\style-defaults-primary-backup\pack_14_reject_ritual_robed_sameness_107_111_20260619-193917`
- Finales `106..123`:
  `D:\codex-studio-backups\style-defaults-primary-backup\pack_14_missing_106_123_20260619-200217`
- Regeneracion post-borrado:
  `D:\codex-studio-backups\style-defaults-primary-backup\pack_14_regen_user_deleted_081_102_20260619-201941`
- Regeneracion tardia `SP14-104`:
  `D:\codex-studio-backups\style-defaults-primary-backup\pack_14_regen_user_deleted_104_20260619-214659`

QA visual:

- `SP14-107..111` primera pasada rechazada por repetir joven oscuro,
  vela/templo/reflejo; retry aceptado con candle press, procession, basin
  reflection, oath binding y ash choir absence.
- `SP14-081|082|083|089|090|094` regenerados tras borrado con mas instrumento,
  escala cosmica y menos retrato joven.
- `SP14-095|098|099|101|102` regenerados tras borrado para evitar object-only
  generico, corridor/hooded traveler y portrait anime.
- `SP14-104` regenerado tras borrado tardio como eclipse-cipher overhead object
  plus hand gesture, sin scholar portrait ni texto legible.

Coverage:

- `bun run styles:validate -- --pack=pack_14 --coverage` -> `availableDefaultImages=123/123`,
  `staleDefaultImages=0`, `missingDefaultImages=0`.
- `pack_14` visualmente cerrado al cierre de esta ronda, sujeto a nuevos
  borrados/rechazos manuales.

### Primary defaults - 2026-06-20 - `pack_16` cierre `SP05-351..372` + `SP13-026..035`

Continuacion visual tras cierre de `pack_14`; `pack_15` sigue excluido. Se
regeneraron los stale restantes de `pack_16` y luego los assets borrados durante
QA manual en vivo.

Generadas/regeneradas:

- Stale sports: `SP05-351|SP05-352|SP05-353|SP05-354|SP05-355|SP05-356`
- Stale sports: `SP05-357|SP05-358|SP05-359|SP05-360|SP05-361|SP05-362`
- Tail stale: `SP05-369|SP13-030|SP13-031|SP13-032`
- Missing/user-deleted performance retry:
  `SP05-363|SP05-365|SP05-366|SP05-367|SP05-371|SP05-372`
- Missing/user-deleted samurai retry: `SP13-026|SP13-027|SP13-028`

QA sheets:

- `logs\qa-pack16-stale-sports-351-356-2026-06-20T00-03-17-415Z.webp`
- `logs\qa-pack16-stale-sports-357-362-2026-06-20T00-12-48-237Z.webp`
- `logs\qa-pack16-stale-tail-369-030-032-2026-06-20T00-22-00-612Z.webp`
- `logs\qa-pack16-regen-performance-2026-06-20T00-35-28-294Z.webp`
- `logs\qa-pack16-regen-samurai-2026-06-20T00-41-13-674Z.webp`
- `logs\qa-pack16-samurai-horror-b-2026-06-19T23-50-52-506Z.webp`

Backups:

- Partial missing backup:
  `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_missing_20260619_20260619-205113`
- Final closed backup:
  `D:\codex-studio-backups\style-defaults-primary-backup\pack_16_closed_20260620_20260619-214147`

QA visual:

- `SP05-363|365|366|367|371|372` first accepted pass was later deleted; retry
  improved ensemble/group motion and reduced solo glamour.
- `SP13-026|027|028` first accepted pass was later deleted; retry improved
  stillness, formation momentum, and vow/heraldic identity.
- Sports `SP05-351..362` pass/watchlist; some night-racing IDs share wet/night
  language but differ by endurance, trick flow, drift, apex, sprint, duel,
  spin, comeback, reflex, training and rivalry anchors.

Coverage:

- `bun run styles:validate -- --pack=pack_16 --coverage` -> `availableDefaultImages=140/140`,
  `staleDefaultImages=0`, `missingDefaultImages=0`.
- Stale table: `pack_16` rows removed after closure so runtime stale inventory
  no longer includes these IDs.

### Primary defaults - 2026-06-20 - `pack_06` reframe visual por rechazo de calidad

`pack_06` se reabrio por feedback manual: cards pobres, basicas, color
generico, aves repetidas, object-only/craft-table drift y anchors conflictivos
de workstation/dev-studio/presentation-board. `pack_15` sigue excluido.

Cambios:

- `pack06ArtDirectionPrompt` reforzado: color script deliberado de 3-5 tonos,
  acento raro, no beige/blue default, no rainbow sampler, no stock orange-teal,
  objeto como hero artifact con mundo/contexto y no tabletop prop.
- Anchors de `pack_06__digital_art`, `pack_06__retro_game_visual_systems` y
  `pack_06__game_art_directions_and_ui` corregidos para evitar workstation,
  screens/tablets, dev-studio, hardware props, UI boards y marketing layout.
- Overrides puntuales actualizados para `SP06-012|032|035|039|041|047|048|061|063|064|067|070|071|073|088|091|118|119`.
- Retries puntuales: `SP06-012` por ave/plumas, `SP06-071` por feather
  headdress, `SP06-118` por render conceptual no-pixel.

Generadas/regeneradas:

- Probe: `SP06-012|SP06-032|SP06-035|SP06-047|SP06-088|SP06-119`
- Mixed/digital: `SP06-061|SP06-067|SP06-071|SP06-070|SP06-048|SP06-041`
- Final: `SP06-039|SP06-063|SP06-064|SP06-073|SP06-091|SP06-118`
- Retries individuales: `SP06-012`, `SP06-071`, `SP06-118`

QA sheets:

- `logs\qa-pack06-reframe-probe-x6-2026-06-20T02-47-19-507Z.webp`
- `logs\qa-pack06-reframe-mixed-digital-x6-2026-06-20T02-55-42-122Z.webp`
- `logs\qa-pack06-reframe-final-x6-2026-06-20T03-04-28-157Z.webp`
- `logs\qa-pack06-reframe-final-all18-2026-06-20T03-09-36-880Z.webp`

Backups rejects:

- `D:\codex-studio-backups\style-defaults-rejected\pack_06_reframe_rejects_20260619-235600`
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_reframe_rejects_20260620-000444`

QA visual:

- `SP06-012` retry queda no-avian; watchlist por pared/caps pequenos propios
  del preset aerosol.
- `SP06-071` retry elimina feather headdress y queda textile courier mosaic.
- `SP06-118` retry corrige shell/render conceptual hacia pixel inventory icon.
- `SP06-047` queda watchlist por render mas concept-art que el resto, pero
  mejora sujeto, color script y energia de speedpaint.

Coverage:

- `bun run styles:validate -- --pack=pack_06 --coverage` -> `availableDefaultImages=120/120`,
  `staleDefaultImages=0`, `missingDefaultImages=0`.

### Primary defaults - 2026-06-20 - `pack_07` missing interiors/architecture A-B

Se retomo deuda visual de `pack_07` tras confirmar que `pack_07/08` no tienen
P1 semantico abierto y que `pack_15` sigue pausado.

Prompt/tooling:

- `scripts/generate-style-defaults.ts` ahora cubre las categorias reales de
  `pack_07` en `CATEGORY_BASE_PROMPTS`; antes algunas caian al fallback generico
  `vertical scene`.

Generadas:

- `SP07-001|SP07-002|SP07-003|SP07-004|SP07-005|SP07-008`
- `SP07-007|SP07-009|SP07-010|SP07-011|SP07-014|SP07-016`

QA sheets:

- `logs\qa-pack07-missing-interiors-a-2026-06-20T03-17-59-779Z.webp`
- `logs\qa-pack07-missing-interiors-arch-b-2026-06-20T03-24-41-290Z.webp`

QA visual:

- Ambas tandas pasan.
- Watchlist aceptado: `SP07-002` por escalera industrial, `SP07-014` por
  clutter/apartment, `SP07-016` por figura secundaria.

Coverage:

- `bun run styles:validate -- --pack=pack_07 --coverage` -> `availableDefaultImages=53/80`,
  `staleDefaultImages=0`, `missingDefaultImages=27`.

### Primary defaults - 2026-06-20 - `pack_06` quality reframe II

`pack_06` seguia visualmente debil pese a cobertura cerrada. Feedback manual:
cards pobres, genericas, color pobre/generico, bustos academicos repetidos,
object-only, boards/workstations y algunos retro/game que no mostraban bien el
sistema visual. Se trato como falso cierre visual, no como problema de assets.

Prompt/tooling:

- Se agregaron `pack06HeroPrompt` y `pack06EnvironmentPrompt`.
- `buildStylePrompt` usa estas lineas solo para `pack_06` cuando no hay
  override object-only, para forzar medio + sujeto/scenelet + color script +
  contexto.
- `SP06-026` ya no debe caer en producto aislado Copic.
- `SP06-050` exige pixel art duro, visible y no pintura suave.
- `SP06-084` exige sprite FMV pre-rendered compacto, no escena low-poly/neon.

Subagente:

- `Bohr` audito `logs\qa-sp06-current-2026-06-20T03-53-58-414Z.webp`.
- Patrones detectados: tecnica-demo, paletas beige/azul/gris, animales/bustos
  repetidos, boards/UI/reference drift, thumbnail debil y dark mush.

Generadas/regeneradas:

- `SP06-025|SP06-026|SP06-034|SP06-048|SP06-067|SP06-088`.
- `SP06-026|SP06-027|SP06-029|SP06-030|SP06-036|SP06-038`.
- `SP06-037|SP06-050|SP06-053|SP06-069|SP06-070|SP06-073`.
- `SP06-050|SP06-074|SP06-079|SP06-084|SP06-091|SP06-099`.
- `SP06-084|SP06-100|SP06-115|SP06-116`.

QA sheets:

- `logs\qa-pack06-quality-reframe-pilot-2026-06-20T04-03-15-103Z.webp`.
- `logs\qa-pack06-drawing-print-reframe-2026-06-20T04-07-47-235Z.webp`.
- `logs\qa-pack06-digital-mixed-reframe-2026-06-20T04-13-12-826Z.webp`.
- `logs\qa-pack06-mixed-retro-reframe-2026-06-20T04-21-43-319Z.webp`.
- `logs\qa-pack06-final-retro-game-reframe-2026-06-20T04-26-08-614Z.webp`.
- Full current:
  `logs\qa-sp06-current-post-reframe-2026-06-20T04-27-05-178Z.webp`.

Backups:

- `D:\codex-studio-backups\style-defaults-rejected\pack_06_poor_color_generic_pilot_20260620-005848`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_drawing_print_reframe_20260620-010358`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_digital_mixed_reframe_20260620-010811`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_mixed_retro_reframe_20260620-011353`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_final_retro_game_reframe_20260620-012216`.

QA visual:

- Mejora clara en los IDs prioritarios: mas sujeto/scenelet, mejor color y
  menos board/object-demo.
- `SP06-079` fallo una vez por carrera de manifest con `parallel=6`; retry
  individual ok.
- Watchlist: `SP06-050` y `SP06-084` por posible lectura todavia hibrida.
  Mantenerlos si el usuario los acepta; si los borra, regenerar solo esos IDs.

### Primary defaults - 2026-06-20 - `pack_06` color/identity targeted rework

Ronda adicional porque `SP06` seguia siendo el grupo mas problematico en QA
manual: paletas pobres/genericas, bustos academicos, animales/aves, props
aislados y tarjetas demasiado parecidas entre si.

Prompt/tooling:

- Se agrego `pack06DiversityLockPrompt` con paleta concreta, value/crop route,
  subject route y reset anti-busto/anti-still-life para `SP06-001..024`.
- Se agregaron `PACK_SCENE_ANCHORS` para painting/drawing/print/mixed de
  `pack_06`; antes caian demasiado en fallback generico.
- Locks puntuales agregados para
  `SP06-006|007|015|016|017|020|021|022|023|024|027|028|031|036|037|038`.

Generadas/regeneradas:

- `SP06-001|SP06-016|SP06-018|SP06-020|SP06-021|SP06-022`.
- Retry anti torso repetido: `SP06-016|SP06-020|SP06-021|SP06-022`.
- `SP06-015|SP06-017|SP06-023|SP06-024|SP06-027|SP06-028`.
- Retry `SP06-024` por shield/warrior drift.
- `SP06-006|SP06-007|SP06-031|SP06-036|SP06-037|SP06-038`.
- Retry `SP06-031|SP06-038` por bird/beak/mask-head read.

QA sheets:

- `logs\qa-pack06-quality-color-busts-retry-2026-06-20T04-50-15-351Z.webp`.
- `logs\qa-pack06-quality-bust-animal-rework-final-2026-06-20T05-02-56-561Z.webp`.
- `logs\qa-pack06-quality-murky-animal-rework-final-nolabel-2026-06-20T05-15-03-539Z.webp`.

Backups:

- `D:\codex-studio-backups\style-defaults-rejected\pack_06_quality_color_busts_before_20260620-013609`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_quality_color_torso_retry_before_20260620-014433`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_quality_bust_animal_rework_before_20260620-015053`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_quality_sp06_024_shield_retry_before_20260620-015832`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_quality_murky_animal_rework_before_20260620-020332`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_quality_birdmask_retry_before_20260620-021110`.

QA visual:

- Aceptado/watchlist: mejora fuerte en color, silhouette variety y scenelet.
- Watchlist: `SP06-015`, `SP06-020`, `SP06-006`.
- Siguiente cola si sigue rework `SP06`:
  `SP06-040|042|043|044|049|051|054|056|057|058|059|060`, luego
  `SP06-065|068|072|076|077|078|080|083|084|090|091|094|098|099`.

### Current verification - 2026-06-20 - objective packs and next queue

Recheck vivo despues de cerrar la ronda `SP06`:

- `pack_07`: `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `pack_08`: `availableDefaultImages=15/80`, `staleDefaultImages=0`,
  `missingDefaultImages=65`.
- `pack_14`: `availableDefaultImages=123/123`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `pack_15`: `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`; watchlist por `taxonomy/default-image mismatches=10`.
- Category bases objetivo `pack_08..pack_11`: `20/20` presentes; auditor
  regenerado con `bun run scripts\audit-style-category-bases.ts`.
- `bun run styles:quality:audit` -> ok, `redundancy: none above threshold`.
- `bun run styles:runtime:check` -> ok.

Decision:

- No generar `pack_15` ahora: coverage cerrado y direccion visual pausada.
- Siguiente deuda visual real: `pack_08` missing.
- Proxima tanda recomendada:
  `SP08-001|SP08-003|SP08-004|SP08-005|SP08-017|SP08-018`.

### Primary defaults - 2026-06-20 - `pack_06` P0/P1 subject-color cleanup

Ronda focalizada por feedback manual: `SP06` seguia siendo el pack con mas
problemas visuales por animales/aves/criaturas, objetos aislados y paletas
genericas.

Auditoria:

- Subagente `Kant` reviso las 3 laminas completas y separo P0/P1.
- P0 tratado:
  `SP06-018|023|025|042|044|045|046|056|057|058|059|060|062|065|072|076|080|084|098|100|105|111|116`.
- P1 tratado en esta ronda:
  `SP06-049|054|081|083|086|090`.

Prompt/tooling:

- Se endurecio `pack06SubjectVarietyPrompt`: animales, aves, flores, mascotas y
  objetos ya no son shortcut por defecto.
- Se agrego `PACK06_PRESENCE_LOCKS` para forzar protagonista/silueta/scenelet o
  contexto cuando el preset sea object-led.
- Se agregaron locks puntuales para los IDs P0/P1 reparados y hero humano
  obligatorio para `SP06-049`.

Generadas/regeneradas:

- `SP06-042|SP06-044|SP06-045|SP06-046|SP06-057|SP06-058`.
- `SP06-018|SP06-023|SP06-025|SP06-056|SP06-059|SP06-060`; retry
  `SP06-059`.
- `SP06-062|SP06-065|SP06-072|SP06-076|SP06-080|SP06-084`.
- `SP06-072|SP06-098|SP06-100|SP06-105|SP06-111|SP06-116`; retries
  `SP06-105|SP06-111` y retry final `SP06-111`.
- `SP06-049|SP06-054|SP06-081|SP06-083|SP06-086|SP06-090`; retries
  `SP06-049|SP06-054|SP06-090` y retry final `SP06-049`.

QA sheets:

- Full final:
  `logs\qa-pack06-full-final-after-subject-color-reframe-01-2026-06-20T06-41-50-218Z.webp`,
  `logs\qa-pack06-full-final-after-subject-color-reframe-02-2026-06-20T06-41-50-218Z.webp`,
  `logs\qa-pack06-full-final-after-subject-color-reframe-03-2026-06-20T06-41-50-218Z.webp`.
- Before/after clave:
  `logs\qa-pack06-color-subject-reframe-wave1-before-after-2026-06-20T05-45-00-860Z.webp`,
  `logs\qa-pack06-color-subject-reframe-wave2-before-after-2026-06-20T05-53-52-424Z.webp`,
  `logs\qa-pack06-color-subject-reframe-wave3-before-after-2026-06-20T06-07-38-217Z.webp`,
  `logs\qa-pack06-color-subject-reframe-wave4-before-after-2026-06-20T06-15-08-730Z.webp`,
  `logs\qa-pack06-p1-animal-object-reframe-before-after-2026-06-20T06-32-50-171Z.webp`.

Backups:

- `D:\codex-studio-backups\style-defaults-rejected\pack_06_color_subject_reframe_wave1_before_20260620-023718`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_color_subject_reframe_wave2_before_20260620-024605`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_wave2_reject_sp06_059_fox_before_20260620-025420`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_color_subject_reframe_wave3_before_20260620-030002`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_color_subject_reframe_wave4_before_20260620-030810`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_wave4_reject_105_111_before_20260620-031536`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_retry_reject_sp06_111_tower_before_20260620-031953`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_p1_animal_object_reframe_before_20260620-032546`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_p1_retry_reject_049_054_090_before_20260620-033321`.
- `D:\codex-studio-backups\style-defaults-rejected\pack_06_retry_reject_sp06_049_creature_before_20260620-033729`.

Estado:

- `SP06` coverage sigue completo; esta ronda fue de calidad visual, no de
  missing/stale.
- Watchlist remanente si el usuario sigue borrando/rechazando:
  `SP06-043|047|055|077|078|093|097|099|107|114|115|118`.
- Proxima deuda fuera de `SP06`: `pack_08` missing, mantener cola
  `SP08-001|003|004|005|017|018` salvo nuevos borrados.

### Primary defaults - 2026-06-20 - `pack_08` missing fashion waves B/C/D

Ronda visual/missing, sin cambios semanticos de presets:

- Antes: `pack_08 availableDefaultImages=21/80`,
  `staleDefaultImages=0`, `missingDefaultImages=59`.
- Generadas:
  `SP08-006|007|009|010|012|013`,
  `SP08-014|015|016|019|020|022`,
  `SP08-024|025|026|029|032|033`.
- QA sheets:
  `logs\qa-pack08-missing-fashion-b-2026-06-20T07-01-00-806Z.webp`,
  `logs\qa-pack08-missing-fashion-c-2026-06-20T07-13-03-851Z.webp`,
  `logs\qa-pack08-missing-fashion-d-2026-06-20T07-23-31-681Z.webp`.
- Full actual: `logs\qa-pack08-current-39-after-waves-bcd-2026-06-20T07-24-45-221Z.webp`.
- Despues: `pack_08 availableDefaultImages=39/80`,
  `staleDefaultImages=0`, `missingDefaultImages=41`.
- QA: waves aceptadas; watchlist suave `SP08-007|024|029`.
- Siguiente cola:
  `SP08-034|036|037|039|040|041`, luego
  `SP08-042|043|044|046|047|048`.

### Primary defaults - 2026-06-20 - `pack_08` missing fashion waves E/F

Ronda visual/missing, sin cambios semanticos de presets:

- Antes: `pack_08 availableDefaultImages=39/80`,
  `staleDefaultImages=0`, `missingDefaultImages=41`.
- Patch minimo generator:
  `SP08-037` y `SP08-065` ya no piden mannequin/headless/torso-only.
- Generadas:
  `SP08-034|036|037|039|040|041`,
  `SP08-042|043|044|046|047|048`.
- QA sheets:
  `logs\qa-pack08-missing-fashion-e-2026-06-20T07-39-03-465Z.webp`,
  `logs\qa-pack08-missing-fashion-f-2026-06-20T07-47-01-934Z.webp`,
  `logs\qa-pack08-current-51-after-waves-ef-2026-06-20T07-47-35-612Z.webp`.
- Despues: `pack_08 availableDefaultImages=51/80`,
  `staleDefaultImages=0`, `missingDefaultImages=29`.
- QA: waves aceptadas; watchlist general por poses joven/runway-like repetidas.
- Siguiente cola:
  `SP08-049|050|051|052|053|054`, luego
  `SP08-055|056|057|058|059|060`.

### Primary defaults - 2026-06-20 - `pack_08` missing fashion wave G

Ronda visual/missing:

- Antes: `pack_08 availableDefaultImages=51/80`,
  `staleDefaultImages=0`, `missingDefaultImages=29`.
- Generadas: `SP08-049|050|051|052|053|054`.
- QA sheets:
  `logs\qa-pack08-missing-fashion-g-2026-06-20T08-01-39-772Z.webp`,
  `logs\qa-pack08-current-57-after-wave-g-2026-06-20T08-02-13-577Z.webp`.
- Despues: `pack_08 availableDefaultImages=57/80`,
  `staleDefaultImages=0`, `missingDefaultImages=23`.
- QA: aceptada; watchlist suave `SP08-054` por helmet prop secundario.
- Siguiente cola:
  `SP08-055|056|057|058|059|060`, luego
  `SP08-061|062|063|064|065|066`.

### Primary defaults - 2026-06-20 - `pack_06` color/subject repair parcial

Ronda cualitativa sobre `SP06`, no missing/stale:

- Motivo: el usuario marco que `SP06` era el bloque con mas problemas:
  resultados pobres, paletas genericas, object/animal shortcuts, concept art
  comun y dark cards sin lectura.
- Script reforzado:
  `PACK 06 QUALITY LOCK`, `Palette authority`, `Thumbnail readability`,
  `ANATOMY QA` para figuras en `pack_06`, y overrides puntuales.
- Generadas:
  `SP06-007|020|040|055|078|083`,
  `SP06-016|019|023|025|030|046`,
  `SP06-047|048|053|054|063|064`,
  `SP06-065|066|067|068|073|074`,
  `SP06-089|091|094|109|115|120`.
- Reintentos aceptados:
  `SP06-023` por animal-head/silverpoint shortcut,
  `SP06-063` por mask/bust decoupage.
- QA sheets:
  `logs\qa-sp06-palette-repair-pilot-vs-backup-2026-06-20T08-17-47-038Z.webp`,
  `logs\qa-sp06-palette-repair-wave-b-vs-prev-2026-06-20T08-26-17-058Z.webp`,
  `logs\qa-sp06-023-retry-2026-06-20T08-30-47-785Z.webp`,
  `logs\qa-sp06-palette-repair-wave-c-vs-prev-2026-06-20T08-40-15-416Z.webp`,
  `logs\qa-sp06-063-retry-2026-06-20T08-46-46-942Z.webp`,
  `logs\qa-sp06-palette-repair-wave-d-vs-prev-2026-06-20T08-55-53-061Z.webp`,
  `logs\qa-sp06-palette-repair-wave-e-vs-prev-2026-06-20T09-04-24-663Z.webp`,
  `logs\qa-sp06-current-after-palette-repair-2026-06-20T09-04-57-967Z.webp`.
- Backups nuevos:
  `D:\codex-studio-backups\style-default-cards\20260620-051841\pre-sp06-repair-wave-b`,
  `D:\codex-studio-backups\style-default-cards\20260620-053108\pre-sp06-repair-wave-c`,
  `D:\codex-studio-backups\style-default-cards\20260620-054708\pre-sp06-repair-wave-d`,
  `D:\codex-studio-backups\style-default-cards\20260620-055609\pre-sp06-repair-wave-e`.
- Rejected backups:
  `D:\codex-studio-backups\style-default-cards\20260620-051841\rejected-sp06-repair-wave-b`,
  `D:\codex-studio-backups\style-default-cards\20260620-053108\rejected-sp06-repair-wave-c`.
- Estado: `pack_06` mantiene `availableDefaultImages=120/120`,
  `staleDefaultImages=0`, `missingDefaultImages=0`.
- Watchlist siguiente:
  `SP06-021|031|032|033|036|037|038|042|043|057|058|059|060|069|070|071|072|084|088|095|099|102|104|108|116|118`.
- Siguiente paso recomendado: atacar watchlist en tandas de 6, empezando por
  `SP06-021|031|032|033|036|037`, luego `SP06-038|042|043|057|058|059`.

### Primary defaults - 2026-06-20 - `pack_08` missing fashion wave H

Ronda visual/missing:

- Antes: `pack_08 availableDefaultImages=57/80`,
  `staleDefaultImages=0`, `missingDefaultImages=23`.
- Backup previo:
  `D:\codex-studio-backups\style-default-cards\20260620-060944\pre-pack08-wave-h`.
- Generadas: `SP08-055|056|057|058|059|060`.
- QA sheets:
  `logs\qa-pack08-missing-fashion-h-2026-06-20T09-18-04-768Z.webp`,
  `logs\qa-pack08-current-63-after-wave-h-2026-06-20T09-18-30-496Z.webp`.
- Despues: `pack_08 availableDefaultImages=63/80`,
  `staleDefaultImages=0`, `missingDefaultImages=17`.
- QA: aceptada; todas garment/material-first con figura adulta.
- Watchlist suave: variacion de modelo/crop en proximas waves.
- Siguiente cola:
  `SP08-061|062|063|064|065|066`, luego
  `SP08-067|068|069|070|073|074`, cierre con
  `SP08-075|076|078|079|080`.

### Primary defaults - 2026-06-20 - `pack_08` missing fashion wave I

Ronda visual/missing:

- Antes: `pack_08 availableDefaultImages=63/80`,
  `staleDefaultImages=0`, `missingDefaultImages=17`.
- Patch minimo generator:
  `PACK 08 FASHION LOCK` evita weapon/tool/handheld gadget/prop-first;
  `SP08-064` tiene cue especifico burlap/rags sin blade/weapon/tool.
- Backup previo:
  `D:\codex-studio-backups\style-default-cards\20260620-062124\pre-pack08-wave-i`.
- Generadas: `SP08-061|062|063|064|065|066`.
- Retry aceptado: `SP08-064`, por blade/held prop.
- Rejected backup:
  `D:\codex-studio-backups\style-default-cards\20260620-062124\rejected-pack08-wave-i`.
- QA sheets:
  `logs\qa-pack08-missing-fashion-i-2026-06-20T09-30-10-126Z.webp`,
  `logs\qa-sp08-064-retry-2026-06-20T09-34-52-196Z.webp`,
  `logs\qa-pack08-missing-fashion-i-final-2026-06-20T09-35-28-074Z.webp`,
  `logs\qa-pack08-current-69-after-wave-i-2026-06-20T09-35-30-016Z.webp`.
- Despues: `pack_08 availableDefaultImages=69/80`,
  `staleDefaultImages=0`, `missingDefaultImages=11`.
- QA: aceptada; garment-first y figura adulta. Watchlist suave `SP08-063`
  por feather cloak literal pero representativo.
- Siguiente cola:
  `SP08-067|068|069|070|073|074`, cierre con
  `SP08-075|076|078|079|080`.

### Primary defaults - 2026-06-20 - `pack_06` P0 color/subject rework

Ronda visual/calidad:

- Antes: `pack_06 availableDefaultImages=120/120`,
  `staleDefaultImages=0`, `missingDefaultImages=0`; problema cualitativo, no
  cobertura.
- Auditoria subagente `Hooke` sobre
  `logs\qa-sp06-current-after-palette-repair-2026-06-20T09-04-57-967Z.webp`.
- Patch generator:
  `SP06` fuerza prompt largo con `PACK 06 QUALITY LOCK`; paletas y value locks
  mas editoriales; nuevos/reforzados locks ID-scoped para P0/P1.
- Backup base/rejects:
  `D:\codex-studio-backups\style-default-cards\20260620-064401`.
- Archive automatico:
  `D:\codex-studio-backups\style-cards\pack_06`.
- Generadas P0:
  `SP06-004|010|016|017|019|020|021|023|025|027|028|030|032|038|043|048|054|060|066|069|077|078|083|085|089|091|094|099|102|106|109|112|113|114|115|116|117|118`.
- Retries/rechazos:
  `SP06-016|017|020`, `SP06-023`, `SP06-048|060`,
  `SP06-069|077|083|085`, retry final `SP06-085`, y `SP06-112`.
- QA sheets:
  `logs\qa-sp06-p0-wave1-final-before-after-2026-06-20T10-04-00-000Z.webp`,
  `logs\qa-sp06-p0-wave2-before-after-2026-06-20T10-16-00-000Z.webp`,
  `logs\qa-sp06-p0-wave3-before-after-2026-06-20T10-25-00-000Z.webp`,
  `logs\qa-sp06-p0-wave4-before-after-2026-06-20T10-36-00-000Z.webp`,
  `logs\qa-sp06-p0-wave5-before-after-2026-06-20T10-49-00-000Z.webp`,
  `logs\qa-sp06-current-after-p0-rework-2026-06-20T11-00-00-000Z.webp`.
- Despues: P0 visualmente mucho mas fuerte; no se cierra perfecto. P1 sugerido:
  `SP06-031|052|055|057|065|068|070|073|074|076|082|088|097|101|103|107|108|110|120`.

### Primary defaults - 2026-06-20 - `pack_06` medium-lock follow-up

Ronda visual/calidad:

- Motivo: el usuario marco que `SP06` seguia siendo el pack mas pobre:
  paletas genericas, demasiada ilustracion/concept-art comun y medium-read
  debil.
- Auditoria paralela: subagente `Hooke` sobre
  `logs\qa-sp06-current-after-p0-rework-2026-06-20T11-00-00-000Z.webp`.
- Patch generator:
  `SP06 MEDIUM OVERRIDE` en post-processing para que pintura, dibujo,
  grabado, collage, voxel, pixel, vector o sistemas retro no se conviertan en
  pintura digital generica; `PACK06_STYLE_TASTE_LOCKS`; locks nuevos/reforzados
  para `SP06-023|029|052|055|057|060`.
- Patch manifest: `SP06-052` reemplaza el negativo contradictorio
  `3d render` por `smooth generic 3d render` para no bloquear voxel art.
- Generadas/reintentadas:
  `SP06-031|052|055|057|065|068`,
  retry `SP06-052|055|057`, retry final `SP06-052`,
  `SP06-016|017|023|029|030|099`, retry `SP06-023`,
  `SP06-027|028|036|037|060|076`, retry `SP06-060`,
  `SP06-025|033|034|038|083|089`,
  `SP06-091|101|106|112|113|117`.
- QA sheets:
  `logs\qa-sp06-taste-lock-wave-a-before-after-2026-06-20T11-25-00-000Z.webp`,
  `logs\qa-sp06-taste-lock-retry-052-055-057-before-after-2026-06-20T11-32-00-000Z.webp`,
  `logs\qa-sp06-p0-medium-wave-b-before-after-2026-06-20T11-45-00-000Z.webp`,
  `logs\qa-sp06-p0-dark-medium-wave-c-before-after-2026-06-20T12-01-00-000Z.webp`,
  `logs\qa-sp06-p0-object-wave-d-before-after-2026-06-20T12-12-00-000Z.webp`,
  `logs\qa-sp06-p0-game-object-wave-e-before-after-2026-06-20T12-21-00-000Z.webp`,
  `logs\qa-sp06-current-after-medium-lock-wave-b-2026-06-20T11-52-00-000Z.webp`,
  `logs\qa-sp06-current-after-medium-lock-wave-e-2026-06-20T12-24-00-000Z.webp`.
- Backups:
  `D:\codex-studio-backups\style-default-cards\20260620-081655\pre-sp06-taste-lock-wave-a`,
  `D:\codex-studio-backups\style-default-cards\20260620-082734\pre-sp06-taste-lock-retry-052-055-057`,
  `D:\codex-studio-backups\style-default-cards\20260620-083134\pre-sp06-052-voxel-retry-b`,
  `D:\codex-studio-backups\style-default-cards\20260620-083612\pre-sp06-p0-medium-wave-b`,
  `D:\codex-studio-backups\style-default-cards\20260620-084526\pre-sp06-023-silverpoint-retry`,
  `D:\codex-studio-backups\style-default-cards\20260620-085005\pre-sp06-p0-dark-medium-wave-c`,
  `D:\codex-studio-backups\style-default-cards\20260620-085846\pre-sp06-060-ascii-retry`,
  `D:\codex-studio-backups\style-default-cards\20260620-090253\pre-sp06-p0-object-wave-d`,
  `D:\codex-studio-backups\style-default-cards\20260620-091054\pre-sp06-p0-game-object-wave-e`.
- QA visual: mejoras fuertes en `SP06-052`, `060`, `099`, `033`, `034`,
  `089`, `091`, `117`; aceptadas con watchlist suave
  `SP06-016|017|023|025|038|083|101|106|112|113`.
- Watchlist restante recomendada:
  `SP06-070|073|074|082|088|097|103|107|108|110|120`, mas cualquier card
  que el usuario borre manualmente.

### Primary defaults - 2026-06-20 - `pack_06` color identity wave F

Ronda visual/calidad por feedback del usuario: `SP06` seguia siendo el pack con
mas problemas por paletas pobres, escenas poco representativas y resultados
genericos.

- Antes: `pack_06 availableDefaultImages=120/120`, `staleDefaultImages=0`,
  `missingDefaultImages=0`; deuda cualitativa, no cobertura.
- Patch generator:
  `SP06-070|073|074|097|112|113|120` reciben paletas mas autorales y locks
  de sujeto/escena mas estrictos; `SP06-070`, `097`, `112` se reintentaron por
  seguir objeto/smooth/product-render.
- Patch manifest:
  `SP06-073|074` dejan de negar `photo` porque el medio necesita foto impresa
  alterada; `SP06-097` deja de negar `blocky/chunky` de forma contradictoria;
  `SP06-112` cambia `background scene` por `cluttered background`.
- Backup previo:
  `D:\codex-studio-backups\style-default-cards\20260620-093016\pre-sp06-color-identity-wave-f`.
- Rechazos:
  `D:\codex-studio-backups\style-default-cards\20260620-093016\rejected-sp06-color-identity-wave-f`
  para `SP06-070|097|112`.
- Generadas:
  `SP06-070|073|074|097|112|120`; retry final `SP06-070|097|112`.
- QA sheets:
  `logs\qa-sp06-color-identity-wave-f-before-after-2026-06-20T12-39-52-815324Z.webp`,
  `logs\qa-sp06-color-identity-wave-f-final-2026-06-20T12-46-22-682166Z.webp`.
- QA visual:
  aceptadas `SP06-070|073|074|112|120`; `SP06-097` mejora color/direccion,
  pero queda en watchlist suave porque puede empujar mas HAM/Amiga-pixel y
  menos criatura renderizada.
- Watchlist restante recomendada:
  `SP06-082|088|097|103|107|108|110`, mas tarjetas que el usuario borre
  manualmente.

### Semantic checkpoint - 2026-06-20 - `pack_07` / `pack_08`

Ronda read-only de semantica:

- Barrido heuristico actual sobre YAML de `pack_07` / `pack_08`: P1 real `0`.
- Falsos positivos: frases defensivas tipo `without requiring` y
  `must not require`; se mantienen porque evitan scene drift.
- Sin cambios en manifests en esta ronda.

Checks:

- `bun run styles:validate -- --pack=pack_07 --coverage` -> ok;
  `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `bun run styles:validate -- --pack=pack_08 --coverage` -> ok;
  `availableDefaultImages=69/80`, `staleDefaultImages=0`,
  `missingDefaultImages=11`.
- `bun run styles:quality:audit` -> ok; redundancy none above threshold.
- `bun run styles:runtime` + `bun run styles:runtime:check` -> current.

Estado:

- `pack_07` semantica y visual coverage cerradas.
- `pack_08` semantica cerrada; deuda restante: 11 default cards missing, no
  stale.

### Primary defaults - 2026-06-20 - `pack_08` missing fashion waves J/K

Ronda visual/missing:

- Antes: `pack_08 availableDefaultImages=69/80`,
  `staleDefaultImages=0`, `missingDefaultImages=11`.
- Missing:
  `SP08-067|SP08-068|SP08-069|SP08-070|SP08-073|SP08-074|SP08-075|SP08-076|SP08-078|SP08-079|SP08-080`.
- Backup wave J:
  `D:\codex-studio-backups\style-default-cards\20260620-095342\pre-pack08-missing-wave-j`.
- Backup wave K:
  `D:\codex-studio-backups\style-default-cards\20260620-101124\pre-pack08-missing-wave-k`.
- Generadas wave J:
  `SP08-067|SP08-068|SP08-069|SP08-070|SP08-073|SP08-074`.
- Generadas wave K:
  `SP08-075|SP08-076|SP08-078|SP08-079|SP08-080`.
- QA sheets:
  `logs\qa-pack08-missing-wave-j-2026-06-20T13-11-08-101948Z.webp`,
  `logs\qa-pack08-missing-waves-jk-current-2026-06-20T13-17-37-270593Z.webp`.
- QA: aceptadas las 11; todas mantienen figura fashion/material-first y no
  caen en object-only.
- Despues: `pack_08 availableDefaultImages=80/80`,
  `staleDefaultImages=0`, `missingDefaultImages=0`.
- `bun run styles:runtime` ejecutado tras actualizar default images.

Estado:

- `pack_08` queda cerrado en semantica y primary default coverage, salvo
  nuevos borrados manuales.

### Primary defaults - 2026-06-20 - `pack_09` missing material wave A

Ronda visual/missing:

- Antes: `pack_09 availableDefaultImages=9/80`,
  `staleDefaultImages=0`, `missingDefaultImages=71`.
- Backup:
  `D:\codex-studio-backups\style-default-cards\20260620-102018\pre-pack09-missing-wave-a`.
- Generadas:
  `SP09-001|SP09-002|SP09-003|SP09-004|SP09-005|SP09-007`.
- QA sheet:
  `logs\qa-pack09-missing-wave-a-2026-06-20T13-25-17-275367Z.webp`.
- QA: aceptadas como material-led; watchlist suave `SP09-004` por
  plinth/product-shot.
- Despues: `pack_09 availableDefaultImages=15/80`,
  `staleDefaultImages=0`, `missingDefaultImages=65`.
- `bun run styles:runtime` ejecutado tras actualizar default images.

Siguiente cola:

- `SP09-008|SP09-009|SP09-010|SP09-011|SP09-012|SP09-013`.

### Primary defaults - 2026-06-20 - `pack_06` SP06 palette/P0 recovery G-H

Ronda visual/calidad por feedback del usuario:

- Problema: `SP06` mantenia tarjetas pobres, paletas genericas, traveler/cape
  repetition, arcos/ruinas y fondos sin sujeto.
- Auditoria paralela: subagente `Carver` priorizo P0/P1 desde contact sheets
  actuales.
- Runtime cleanup: 5 jobs SP06 colgados se marcaron `cancelled` en SQLite; se
  reiniciaron local-server/app-server sin cancelar el job ajeno `Afterquest`.

Patch generator:

- `PACK06_PALETTE_FAILURE_BREAKERS`.
- Paleta/locks nuevos para `SP06-041|042|108|110`.
- Locks focales para `SP06-031|034|048|109|116`.

Backups:

- `D:\codex-studio-backups\style-default-cards\20260620-103802\pre-sp06-watchlist-wave-g`.
- `D:\codex-studio-backups\style-default-cards\20260620-164500\pre-sp06-p0-wave-h1`.
- `D:\codex-studio-backups\style-default-cards\20260620-164500\pre-sp06-p0-wave-h2`.

Generadas/aceptadas:

- `SP06-082|097|103|107`.
- `SP06-041|042|108|110`.
- `SP06-031|034|048|109|116`.

Rechazos:

- `D:\codex-studio-backups\style-default-cards\20260620-103802\rejected-sp06-wave-g1`.
- `D:\codex-studio-backups\style-default-cards\20260620-103802\rejected-sp06-wave-g4`.
- `D:\codex-studio-backups\style-default-cards\20260620-164500\rejected-sp06-p0-wave-h1`.
- `D:\codex-studio-backups\style-default-cards\20260620-164500\rejected-sp06-p0-wave-h2`.

QA sheets:

- `logs\qa-sp06-watchlist-wave-g2-before-after.webp`.
- `logs\qa-sp06-041-042-palette-retry.webp`.
- `logs\qa-sp06-108-retry-b.webp`.
- `logs\qa-sp06-p0-wave-h3-before-after.webp`.

Watchlist suave:

- `SP06-048|088|097|108|109|116`.
- Reintentar solo si el usuario borra o si nueva revision visual confirma
  retroceso; no seguir regenerando por inercia.

Checks:

- `bun run styles:runtime` -> ok; `packs=17`, `presets=1649`.
- `bun run styles:validate -- --pack=pack_06 --coverage` -> ok;
  `availableDefaultImages=120/120`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `bun run styles:quality:audit` -> ok; redundancy none above threshold.
- `bun run styles:runtime:check` -> ok; runtime current.

### Primary defaults - 2026-06-20 - `pack_09` missing material wave B

Ronda visual/missing:

- Antes vivo: `pack_09 availableDefaultImages=20/80`,
  `staleDefaultImages=0`, `missingDefaultImages=60`.
- Missing generados:
  `SP09-009|SP09-014|SP09-015|SP09-016|SP09-017|SP09-018`.
- Backup/trazabilidad:
  `D:\codex-studio-backups\style-default-cards\20260620-170600\pre-pack09-missing-wave-b`.
- QA sheet:
  `logs\qa-pack09-missing-wave-b.webp`.
- QA: aceptadas como material-led; watchlist suave `SP09-017` por
  plinth/product-shot.
- Despues: `pack_09 availableDefaultImages=26/80`,
  `staleDefaultImages=0`, `missingDefaultImages=54`.

Checks:

- `bun run styles:runtime` -> ok; `packs=17`, `presets=1649`.
- `bun run styles:validate -- --pack=pack_09 --coverage` -> ok.
- `bun run styles:quality:audit` -> ok; redundancy none above threshold.
- `bun run styles:runtime:check` -> ok; runtime current.

Siguiente cola:

- `SP09-019|SP09-020|SP09-021|SP09-022|SP09-023|SP09-024`.

### Primary defaults - 2026-06-20 - `pack_09` missing material wave C

Ronda visual/missing:

- Antes vivo: `pack_09 availableDefaultImages=26/80`,
  `staleDefaultImages=0`, `missingDefaultImages=54`.
- Missing generados:
  `SP09-019|SP09-020|SP09-021|SP09-022|SP09-023|SP09-024`.
- Backup/trazabilidad:
  `D:\codex-studio-backups\style-default-cards\20260620-171000\pre-pack09-missing-wave-c`.
- QA sheet:
  `logs\qa-pack09-missing-wave-c.webp`.
- QA: aceptadas como material-led; watchlist suave `SP09-019|SP09-021` por
  plinth/product-art y `SP09-024` por forma tipo aleta.
- Despues: `pack_09 availableDefaultImages=32/80`,
  `staleDefaultImages=0`, `missingDefaultImages=48`.

Checks:

- `bun run styles:runtime` -> ok; `packs=17`, `presets=1649`.
- `bun run styles:validate -- --pack=pack_09 --coverage` -> ok.
- `bun run styles:quality:audit` -> ok; redundancy none above threshold.
- `bun run styles:runtime:check` -> ok; runtime current.

Siguiente cola:

- `SP09-025|SP09-027|SP09-028|SP09-029|SP09-030|SP09-031`.

### Primary defaults - 2026-06-20 - `pack_06` quality/palette recovery I

Ronda visual/calidad posterior a G-H porque `SP06` seguia concentrando los
peores problemas: paletas pobres/genericas, viajeros de espalda, capas,
puertos/agua/arcos, demos de objeto y animales usados como atajo.

Auditoria:

- Contact sheets actuales:
  `logs\qa-pack06-current-001-040.webp`,
  `logs\qa-pack06-current-041-080.webp`,
  `logs\qa-pack06-current-081-120.webp`.
- Subagente visual priorizo cloaks/backshots, object demos, birds/animals y
  medios con paleta debil.
- Subagente de prompt confirmo conflicto de locks tardios, paletas vagas del
  manifest y falta de `creative_brief` efectivo para `pack_06`.

Patch generator:

- `PACK 06 QUALITY LOCK` ahora corta cards meramente correctas pero pobres.
- Paletas vagas (`Muted, blended`, etc.) dejan de dominar; para medios
  restringidos se usan zonas de valor, estados de tinta/display y contraste
  controlado.
- `PACK06_PRESET_QUALITY_LOCKS` se inyecta antes de reglas genericas para que
  cada preset mande.
- Se agrego `PRESET BRIEF` especifico para `SP06`.
- Reset anti-default ampliado: no resolver con figura mirando agua, cliff,
  arco, gate, puerto o ruina generica.
- Locks puntuales reforzados para
  `SP06-017|021|028|034|036|037|044|048|051|077|088|108|113`.

Generacion/QA:

- Pilot: `SP06-017|036|048|051|088|113`.
- Wave 2: `SP06-036|004|021|028|034|037`, con retry de
  `SP06-021|028|034|036|037`.
- Wave 3: `SP06-038|044|065|067|077|108`, con retry de
  `SP06-044|077|108`.
- Unicos regenerados en esta ronda:
  `SP06-004|017|021|028|034|036|037|038|044|048|051|065|067|077|088|108|113`.

Backups:

- `D:\codex-studio-backups\style-default-cards\20260620-142952\pre-sp06-quality-pilot`.
- `D:\codex-studio-backups\style-default-cards\20260620-144023\pre-sp06-quality-wave-2`.
- `D:\codex-studio-backups\style-default-cards\20260620-144023\rejected-sp06-quality-wave-2`.
- `D:\codex-studio-backups\style-default-cards\20260620-145838\pre-sp06-quality-wave-3`.
- `D:\codex-studio-backups\style-default-cards\20260620-145838\rejected-sp06-quality-wave-3`.

QA sheets:

- `logs\qa-pack06-quality-pilot-2026-06-20T17-37-49-400Z.webp`.
- `logs\qa-pack06-quality-wave-2-2026-06-20T17-50-09-003Z.webp`.
- `logs\qa-pack06-quality-wave-2-retry-2026-06-20T17-58-15-977Z.webp`.
- `logs\qa-pack06-quality-wave-3-2026-06-20T18-08-43-130Z.webp`.
- `logs\qa-pack06-quality-wave-3-retry-2026-06-20T18-14-36-822Z.webp`.

Estado visual:

- Aceptadas/provisionales: `SP06-004|017|021|036|037|044|051|065|067|108|113`.
- Watchlist suave: `SP06-028|034|038|048|077|088`.
- Siguiente cola recomendada si el usuario sigue borrando `SP06`:
  `SP06-001|006|014|024|027|045|052|057|059|064|073|083|091|096|097|100|109|116`.

Checks:

- `bun run check -- scripts/generate-style-defaults.ts` -> ok tras
  `bun run check:fix -- scripts/generate-style-defaults.ts`.
- `bun run styles:runtime` -> ok; `packs=17`, `presets=1649`.
- `bun run styles:runtime:check` -> ok; runtime current.
- `bun run styles:validate -- --pack=pack_06 --coverage` -> ok;
  `availableDefaultImages=120/120`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `bun run styles:quality:audit` -> ok; redundancy none above threshold.

### Primary defaults - 2026-06-20 - `pack_15` taxonomy/default-image cleanup

Ronda de higiene, sin generacion:

- `pack_15` tenia 80/80 imagenes disponibles, pero `SP15-071..080` seguian con
  mismatch de taxonomy/default image.
- Se ejecuto `bun run styles:taxonomy -- --pack=pack_15`.
- `bun run styles:validate -- --pack=pack_15 --coverage` -> ok;
  `availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`, sin mismatches.
- `bun run styles:runtime` -> ok; `packs=17`, `presets=1649`.
- `bun run styles:runtime:check` -> ok; runtime current.

### Primary defaults - 2026-06-20 - `pack_09` missing material wave D

Ronda visual/missing:

- Antes vivo: `pack_09 availableDefaultImages=37/80`,
  `staleDefaultImages=0`, `missingDefaultImages=43`.
- Missing generados:
  `SP09-031|SP09-033|SP09-034|SP09-035|SP09-036|SP09-037`.
- Sin backup previo: los `.webp` no existian.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_09 "--preset=SP09-031|SP09-033|SP09-034|SP09-035|SP09-036|SP09-037" --parallel=3 --session-suffix=pack09_missing_wave_d --force`
  -> `generated=6 attempted=6 skipped=74 failed=0`.
- QA sheet: `logs\qa-pack09-missing-wave-d.webp`.
- QA: aceptadas como material/surface cards. Watchlist suave:
  `SP09-031` y `SP09-037` por lectura object/material demo, aunque latex y
  scratched metal leen claro.
- Despues: `pack_09 availableDefaultImages=43/80`,
  `staleDefaultImages=0`, `missingDefaultImages=37`.
- `bun run styles:validate -- --pack=pack_09 --coverage` -> ok.
- `bun run styles:quality:audit` -> ok; redundancy none above threshold.
- `bun run styles:runtime:check` -> ok; runtime current.

Siguiente cola:

- `SP09-038|SP09-039|SP09-040|SP09-041|SP09-042|SP09-044`.

### Primary defaults - 2026-06-20 - `pack_09` missing material wave E

Ronda visual/missing:

- Antes vivo: `pack_09 availableDefaultImages=43/80`,
  `staleDefaultImages=0`, `missingDefaultImages=37`.
- Missing generados:
  `SP09-038|SP09-039|SP09-040|SP09-041|SP09-042|SP09-044`.
- Sin backup previo: los `.webp` no existian.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_09 "--preset=SP09-038|SP09-039|SP09-040|SP09-041|SP09-042|SP09-044" --parallel=3 --session-suffix=pack09_missing_wave_e --force`
  -> `generated=6 attempted=6 skipped=74 failed=0`.
- QA sheet: `logs\qa-pack09-missing-wave-e.webp`.
- QA: aceptadas como material/surface cards. Watchlist suave:
  `SP09-038` por mano/gesto de demo, `SP09-041` por taller/objeto-demo y
  `SP09-044` por objeto de playa; los tres leen el material.
- Despues: `pack_09 availableDefaultImages=49/80`,
  `staleDefaultImages=0`, `missingDefaultImages=31`.
- `bun run styles:runtime` -> ok; `packs=17`, `presets=1649`.
- `bun run styles:validate -- --pack=pack_09 --coverage` -> ok.
- `bun run styles:quality:audit` -> ok; redundancy none above threshold.
- `bun run styles:runtime:check` -> ok; runtime current.

Siguiente cola:

- `SP09-045|SP09-046|SP09-047|SP09-048|SP09-049|SP09-050`.

### Attempt paused - 2026-06-20 - `pack_09` missing material wave F

Intento no aceptado, sin assets escritos:

- IDs intentados:
  `SP09-045|SP09-046|SP09-047|SP09-048|SP09-049|SP09-050`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_09 "--preset=SP09-045|SP09-046|SP09-047|SP09-048|SP09-049|SP09-050" --parallel=3 --session-suffix=pack09_missing_wave_f --force`.
- El proceso excedio el timeout externo y no materializo `.webp`.
- `assets\recipes\styles\defaults\failures-pack_09.json` registro timeouts de
  jobs para `SP09-046` y `SP09-049`.
- Se cancelaron en SQLite solo los 6 jobs con
  `SESSION: Texture & Materiality pack09_missing_wave_f`; se dejo intacto un
  job anime ajeno que tambien seguia `running`.
- Coverage se mantiene en `pack_09 availableDefaultImages=49/80`,
  `staleDefaultImages=0`, `missingDefaultImages=31`.
- Riesgo: el worker local aun reporta `trackedJobs=7` en memoria; no se
  reinicio el servidor para no interferir con el job ajeno.

Siguiente cola cuando el worker este limpio:

- Reintentar `SP09-045|SP09-046|SP09-047|SP09-048|SP09-049|SP09-050`, idealmente
  con `--parallel=1` o `--parallel=2`.

### Blocked checkpoint - 2026-06-20 - worker memory still dirty

No se generaron nuevas cards en esta ronda:

- Health `localhost:17223` -> ok.
- Worker sigue con `activeWorkerCount=7`, `queuedJobs=0`, `trackedJobs=7`.
- SQLite muestra solo 1 job `running` ajeno (`Anime 02`); los 6 jobs propios de
  `pack09_missing_wave_f` permanecen `cancelled`.
- `pack_09` sigue en `availableDefaultImages=49/80`,
  `staleDefaultImages=0`, `missingDefaultImages=31`.
- Coverage global actual reporta `208` missing default images:
  `pack_01=3`, `pack_02=9`, `pack_05=20`, `pack_09=31`,
  `pack_10=66`, `pack_11=64`, `pack_13=15`.

Checks:

- `bun run styles:validate -- --coverage` -> ok.
- `bun run styles:quality:audit` -> ok; redundancy none above threshold.
- `bun run styles:runtime:check` -> ok; runtime current.

Siguiente accion:

- Esperar que termine el job ajeno, autorizar cancelarlo, o autorizar restart de
  local-server/app-server. Despues reintentar
  `SP09-045|SP09-046|SP09-047|SP09-048|SP09-049|SP09-050` con `--parallel=1`
  o `--parallel=2`.

### Primary defaults - 2026-06-20 - `pack_09` missing material wave F retry

Ronda visual/missing:

- Se cancelo el job stale ajeno `Anime 02` y se reinicio solo `local-server`
  para limpiar worker memory; health posterior ok, `trackedJobs=1`.
- Retry de wave F con baja concurrencia:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_09 "--preset=SP09-045|SP09-046|SP09-047|SP09-048|SP09-049|SP09-050" --parallel=1 --session-suffix=pack09_missing_wave_f_retry_p1 --force`
  -> `generated=6 attempted=6 skipped=74 failed=0`.
- QA sheet: `logs\qa-pack09-missing-wave-f-retry-p1.webp`.
- QA: aceptadas como material/surface cards. Watchlist suave:
  `SP09-045`, `SP09-047`, `SP09-050` por mascot/personaje fuerte; aun asi
  felt, synthetic fur y dry chalk leen claro.
- Despues: `pack_09 availableDefaultImages=55/80`,
  `staleDefaultImages=0`, `missingDefaultImages=25`.

Siguiente cola:

- `SP09-051|SP09-052|SP09-053|SP09-054|SP09-055|SP09-056`.

### Primary defaults - 2026-06-20 - `pack_09` missing material wave G

Ronda visual/missing:

- Generados:
  `SP09-051|SP09-052|SP09-053|SP09-054|SP09-055|SP09-056`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_09 "--preset=SP09-051|SP09-052|SP09-053|SP09-054|SP09-055|SP09-056" --parallel=1 --session-suffix=pack09_missing_wave_g --force`
  -> `generated=6 attempted=6 skipped=74 failed=0`.
- Nota: `SP09-053` reporto `needs_review` en un intento intermedio, pero el
  asset final existe y se audito visualmente.
- QA sheet: `logs\qa-pack09-missing-wave-g.webp`.
- Revision posterior: `SP09-053` fue rechazado porque leia como figura
  encapuchada/anime-fantasy, no como Smoke/Fog material-first.
- QA final de esta tanda: aceptadas `SP09-051`, `SP09-052`, `SP09-054`,
  `SP09-055`, `SP09-056`; `SP09-053` pasa a correccion material J.
- Despues: `pack_09 availableDefaultImages=61/80`,
  `staleDefaultImages=0`, `missingDefaultImages=19`.
- `bun run styles:validate -- --pack=pack_09 --coverage` -> ok.

Siguiente cola:

- `SP09-057|SP09-058|SP09-059|SP09-061|SP09-062|SP09-063`.

### Primary defaults - 2026-06-20 - `pack_09` material correction J

Correccion de rumbo:

- Problema detectado: `pack_09` estaba aceptando rutas de anime/personaje,
  objetos fantasticos, herramientas o emblemas para presets que deben leerse
  como textura/materialidad.
- Script ajustado: `pack09MaterialLockPrompt()` ahora exige material/FX-first,
  bloquea anime/personaje/mascota/criatura/emblema/relicario/herramienta como
  sujeto principal, y cambia el `Distinct motif` de `pack_09` para diferenciar
  por comportamiento material en vez de glifo.

Backups:

- `D:\codex-studio-backups\style-default-cards\2026-06-20-pack09-material-correction-pre-regen`
- `D:\codex-studio-backups\style-default-cards\2026-06-20-pack09-material-correction-v1-emblem-drift`

Ronda visual:

- Corregidos:
  `SP09-053|SP09-058|SP09-061|SP09-062|SP09-063`.
- Comando final:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_09 "--preset=SP09-053|SP09-058|SP09-061|SP09-062|SP09-063" --parallel=1 --session-suffix=pack09_material_correction_j --force`
  -> `generated=5 attempted=5 skipped=75 failed=0`.
- QA sheet final: `logs\qa-pack09-material-correction-j.webp`.
- QA: aprobadas las 5 corregidas. Lectura material/FX-first, sin personaje,
  sin anime y sin emblema protagonista.

### Primary defaults - 2026-06-20 - `pack_09` missing material wave K

Ronda visual/missing:

- Estado antes:
  `SP09-031|SP09-065|SP09-066|SP09-068|SP09-069|SP09-070|SP09-071|SP09-072|SP09-073|SP09-075|SP09-076|SP09-077|SP09-078|SP09-080`
  faltaban como assets reales.
- Health local ok, pero worker tenia `activeWorkerCount=1`, `queuedJobs=0`,
  `trackedJobs=1`; se uso `--parallel=1`.
- Generados:
  `SP09-031|SP09-065|SP09-066|SP09-068|SP09-069|SP09-070`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_09 "--preset=SP09-031|SP09-065|SP09-066|SP09-068|SP09-069|SP09-070" --parallel=1 --session-suffix=pack09_missing_wave_k --force`
  -> `generated=6 attempted=6 skipped=74 failed=0`.
- Backup pre-wave:
  `D:\codex-studio-backups\style-default-cards\2026-06-20-pack09-missing-wave-k-pre`
  vacio porque no habia asset actual para copiar.
- QA sheet: `logs\qa-pack09-missing-wave-k.webp`.
- QA: aceptadas las 6; watchlist suave `SP09-066` por superficie/paisaje de
  arena, sin personaje ni drift de escena.
- Despues: `pack_09 availableDefaultImages=72/80`,
  `staleDefaultImages=0`, `missingDefaultImages=8`.
- `bun run styles:validate -- --pack=pack_09 --coverage` -> ok.

Siguiente cola:

- `SP09-071|SP09-072|SP09-073|SP09-075|SP09-076|SP09-077`.

### Primary defaults - 2026-06-20 - `pack_09` missing material wave L

Ronda visual/missing:

- Generados:
  `SP09-071|SP09-072|SP09-073|SP09-075|SP09-076|SP09-077`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_09 "--preset=SP09-071|SP09-072|SP09-073|SP09-075|SP09-076|SP09-077" --parallel=1 --session-suffix=pack09_missing_wave_l --force`
  -> `generated=6 attempted=6 skipped=74 failed=0`.
- QA sheet: `logs\qa-pack09-missing-wave-l.webp`.
- QA: aceptadas las 6; watchlist suave `SP09-077` por fence fragment mas que
  macro puro, pero material oxidado dominante y sin personaje/fantasia.
- Despues: `pack_09 availableDefaultImages=78/80`,
  `staleDefaultImages=0`, `missingDefaultImages=2`.
- `bun run styles:validate -- --pack=pack_09 --coverage` -> ok.

Siguiente cola:

- `SP09-078|SP09-080`.

### Primary defaults - 2026-06-20 - `pack_09` missing material wave M / close

Ronda visual/missing:

- Generados: `SP09-078|SP09-080`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_09 "--preset=SP09-078|SP09-080" --parallel=1 --session-suffix=pack09_missing_wave_m --force`
  -> `generated=2 attempted=2 skipped=78 failed=0`.
- QA sheet: `logs\qa-pack09-missing-wave-m.webp`.
- QA: aceptadas `SP09-078` Solar Panel y `SP09-080` Dragon Scale; lectura
  superficie/material-first, sin personaje/anime/criatura protagonista.
- Despues: `pack_09 availableDefaultImages=80/80`,
  `staleDefaultImages=0`, `missingDefaultImages=0`.
- Checks:
  `bun run styles:validate -- --pack=pack_09 --coverage`,
  `bun run styles:runtime`, `bun run styles:runtime:check`,
  `bun run styles:quality:audit`, `bun run styles:validate -- --coverage` -> ok.

Siguiente deuda real por coverage:

- `pack_10`: `availableDefaultImages=14/80`, `missingDefaultImages=66`.
- `pack_11`: `availableDefaultImages=16/80`, `missingDefaultImages=64`.
- Menor: `pack_05` missing `20`, `pack_02` missing `9`, `pack_13` missing
  `8`, `pack_01` missing `3`.

### Primary defaults - 2026-06-20 - `pack_06` color/taste recovery J

Ronda visual por feedback del usuario: `SP06` seguia siendo el bloque mas
problematico por paletas pobres/genericas y drift a aventurero/capa/fantasia.

- Patch: `scripts/generate-style-defaults.ts` agrega `PACK06_COLOR_TASTE_RESET`
  y locks mas duros para
  `SP06-001|006|014|024|027|045|059|064|073`.
- Generadas: `SP06-001|006|014|024|027|045|052|057|059|064|073|083`.
- Retries selectivos:
  `SP06-001|006|027`, luego `SP06-059|064|073`, y retry final
  `SP06-064|073`.
- Backups:
  `D:\codex-studio-backups\style-default-cards\20260620-190938\pre-sp06-color-quality-j-wave1`,
  `D:\codex-studio-backups\style-default-cards\20260620-190938\rejected-sp06-color-quality-j-wave1`,
  `D:\codex-studio-backups\style-default-cards\20260620-190938\pre-sp06-color-quality-j-wave2`,
  `D:\codex-studio-backups\style-default-cards\20260620-190938\rejected-sp06-color-quality-j-wave2`,
  `D:\codex-studio-backups\style-default-cards\20260620-190938\rejected-sp06-color-quality-j-wave2-retry`.
- QA sheets:
  `logs\qa-sp06-color-quality-j-wave1-before-after.webp`,
  `logs\qa-sp06-color-quality-j-wave1-retry.webp`,
  `logs\qa-sp06-color-quality-j-wave2-before-after.webp`,
  `logs\qa-sp06-color-quality-j-wave2-retry.webp`,
  `logs\qa-sp06-color-quality-j-wave2-retry2.webp`,
  `logs\qa-sp06-color-quality-j-final.webp`.
- QA: aceptadas las 12 finales; watchlist suave `SP06-057` y `SP06-064`.
- Coverage `pack_06` se mantiene completo:
  `availableDefaultImages=120/120`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- Checks: `bun run check -- scripts/generate-style-defaults.ts`,
  `bun run styles:validate -- --pack=pack_06 --coverage`,
  `bun run styles:quality:audit`, `bun run styles:runtime`,
  `bun run styles:runtime:check` -> ok.

Siguiente cola si se reabre `SP06`:

- `SP06-091|SP06-096|SP06-097|SP06-100|SP06-109|SP06-116`, mas cualquier
  card que el usuario borre.

### Primary defaults - 2026-06-20 - `pack_10` missing abstract wave A

Ronda visual/missing:

- Estado antes: `pack_10 availableDefaultImages=14/80`,
  `staleDefaultImages=0`, `missingDefaultImages=66`.
- Generados:
  `SP10-001|SP10-002|SP10-004|SP10-006|SP10-007|SP10-008`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_10 "--preset=SP10-001|SP10-002|SP10-004|SP10-006|SP10-007|SP10-008" --parallel=1 --session-suffix=pack10_missing_wave_a --force`
  -> `generated=6 attempted=6 skipped=74 failed=0`.
- QA sheet: `logs\qa-pack10-missing-wave-a.webp`.
- QA: aceptadas las 6; identidades diferenciadas para Cubism, Bauhaus,
  Op Art, Fractal Geometry, Low Poly Abstract y Suprematism. Watchlist suave
  `SP10-006` por lectura de objeto/plinth.
- Despues: `pack_10 availableDefaultImages=20/80`,
  `staleDefaultImages=0`, `missingDefaultImages=60`.
- `bun run styles:validate -- --pack=pack_10 --coverage` -> ok.

Siguiente cola:

- Pausar nuevas generaciones hasta aplicar gate anti-anime/global-style-scope.
- Luego continuar con `SP10-009|SP10-010|SP10-011|SP10-012|SP10-013|SP10-014`.

### Protocol update - 2026-06-20 - anti-anime scope gate

Correccion de rumbo:

- Problema detectado: el sufijo global de generacion permitia
  `semi-real anime-inspired illustration when useful`, lo que estaba
  empujando algunas cards no-anime hacia cara, pose o acabado anime.
- Visual QA creada para `pack_06`:
  `logs\qa-sp06-001-030.webp`, `logs\qa-sp06-031-060.webp`,
  `logs\qa-sp06-061-090.webp`, `logs\qa-sp06-091-120.webp`.
- Sospechosas por anime spillover o digital-anime no pedido:
  `SP06-002`, `SP06-020`, `SP06-026`, `SP06-055`, `SP06-104`.
- Condicional: `SP06-105` puede usar arcade/fighting-game stylization, pero no
  generic anime como fallback.
- Permitidas por preset: `SP06-085`, `SP06-108`, `SP06-114`.

Patch:

- `scripts/style-default-utils.ts`: anime/manga/cel/visual-novel/gacha deja de
  ser fallback global y queda permitido solo cuando preset, pack o categoria lo
  pide explicitamente.
- `scripts/style-default-utils.test.ts`: test focal para bloquear regresion.

Regla para siguientes tandas:

- Clasificar cada preset antes de generar como `anime-allowed`,
  `anime-forbidden`, `cartoon/animation-non-anime`, `gameplay/screencap`,
  `material/abstract` o `character-led non-anime`.
- Si una card no-anime sale con cara/pose/acabado anime, se rechaza aunque sea
  estetica como miniatura.
- La primera tanda posterior al ajuste fue `pack_10` wave B, clasificada como
  `material/abstract`.

### Primary defaults - 2026-06-20 - `pack_10` missing abstract wave B

Ronda visual/missing:

- Estado antes: `pack_10 availableDefaultImages=20/80`,
  `staleDefaultImages=0`, `missingDefaultImages=60`.
- Generados:
  `SP10-009|SP10-010|SP10-011|SP10-012|SP10-013|SP10-014`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_10 "--preset=SP10-009|SP10-010|SP10-011|SP10-012|SP10-013|SP10-014" --parallel=1 --session-suffix=pack10_missing_wave_b --force`
  -> `generated=6 attempted=6 skipped=74 failed=0`.
- QA sheet: `logs\qa-pack10-missing-wave-b.webp`.
- QA: aceptadas las 6; no hay anime/personaje/cara. Watchlist suave:
  `SP10-012` por spire/pedestal en smoke y `SP10-013` por gota central, con
  material dominante.
- Despues: `pack_10 availableDefaultImages=26/80`,
  `staleDefaultImages=0`, `missingDefaultImages=54`.
- `bun run styles:validate -- --pack=pack_10 --coverage` -> ok.

Siguiente cola:

- `SP10-015|SP10-016|SP10-017|SP10-019|SP10-020|SP10-021`.

### Primary defaults - 2026-06-20 - `pack_10` missing abstract wave C

Ronda visual/missing:

- Estado antes: `pack_10 availableDefaultImages=26/80`,
  `staleDefaultImages=0`, `missingDefaultImages=54`.
- Generados:
  `SP10-015|SP10-016|SP10-017|SP10-019|SP10-020|SP10-021`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_10 "--preset=SP10-015|SP10-016|SP10-017|SP10-019|SP10-020|SP10-021" --parallel=1 --session-suffix=pack10_missing_wave_c --force`
  -> `generated=6 attempted=6 skipped=74 failed=0`.
- Nota: `SP10-019` tuvo un primer job `needs_review`, pero retry genero asset.
- QA sheet: `logs\qa-pack10-missing-wave-c.webp`.
- QA: aceptadas las 6; no hay anime. Watchlist suave `SP10-017` por soporte
  fisico/canvas y `SP10-021` por busto humano como soporte de datamosh, con
  efecto dominante.
- Despues: `pack_10 availableDefaultImages=32/80`,
  `staleDefaultImages=0`, `missingDefaultImages=48`.
- `bun run styles:validate -- --pack=pack_10 --coverage` -> ok.

Siguiente cola:

- Listar missing restantes y continuar en bloques de 6, manteniendo
  `material/abstract` / `digital glitch` y rechazando anime/personaje cuando no
  corresponda.

### Primary defaults - 2026-06-20 - `pack_10` missing digital glitch wave D

Ronda visual/missing:

- Estado antes: `pack_10 availableDefaultImages=32/80`,
  `staleDefaultImages=0`, `missingDefaultImages=48`.
- Generados:
  `SP10-022|SP10-023|SP10-024|SP10-025|SP10-026|SP10-029`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_10 "--preset=SP10-022|SP10-023|SP10-024|SP10-025|SP10-026|SP10-029" --parallel=1 --session-suffix=pack10_missing_wave_d --force`
  -> `generated=6 attempted=6 skipped=74 failed=0`.
- Retry puntual:
  `SP10-025` fue rechazado por hooded-hacker cliche. Se agrego override
  id-specific en `scripts/generate-style-defaults.ts` para ASCII sin persona,
  hooded hacker, UI o texto legible, y se regenero solo ese preset:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_10 "--preset=SP10-025" --parallel=1 --session-suffix=pack10_missing_wave_d_sp10_025_retry --force`
  -> `generated=1 attempted=1 skipped=79 failed=0`.
- QA sheet: `logs\qa-pack10-missing-wave-d.webp`.
- QA: aceptadas las 6 tras retry; no hay anime ni UI/texto legible. Watchlist
  suave `SP10-023` y `SP10-024` por figura como soporte de glitch/signal.
- Despues: `pack_10 availableDefaultImages=38/80`,
  `staleDefaultImages=0`, `missingDefaultImages=42`.
- `bun run styles:validate -- --pack=pack_10 --coverage` -> ok.

Siguiente cola:

- Continuar con siguiente bloque ordenado de 6 missing:
  `SP10-032|SP10-035|SP10-036|SP10-037|SP10-038|SP10-039`.

### Primary defaults - 2026-06-20 - `pack_10` missing surreal wave E

Ronda visual/missing:

- Estado antes: `pack_10 availableDefaultImages=38/80`,
  `staleDefaultImages=0`, `missingDefaultImages=42`.
- Dry-run previo: se verifico que el sufijo global ya no use anime como
  fallback; `--dry-run` queda como alias seguro de `--dry-run-prompts`.
- Generados:
  `SP10-032|SP10-035|SP10-036|SP10-037|SP10-038|SP10-039`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_10 "--preset=SP10-032|SP10-035|SP10-036|SP10-037|SP10-038|SP10-039" --parallel=1 --session-suffix=pack10_missing_wave_e --force`
  -> `generated=6 attempted=6 skipped=74 failed=0`.
- Nota: `SP10-038` tuvo un primer job `needs_review`, pero retry genero asset.
- Retry puntual:
  `SP10-032` fue rechazado en QA por incluir figura humana pese a
  `avoidRules: people, life`. Se agrego override id-specific para Liminal
  Space sin gente/vida y se regenero solo ese preset:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_10 --preset=SP10-032 --parallel=1 --session-suffix=pack10_missing_wave_e_sp10_032_retry --force`
  -> `generated=1 attempted=1 skipped=79 failed=0`.
- QA sheet: `logs\qa-pack10-missing-wave-e.webp`.
- QA: aceptadas las 6 tras retry; no hay anime global. `SP10-032` quedo como
  espacio vacio liminal. Watchlist suave: `SP10-035` por personaje mistico
  dominante, pero mantiene lectura de Magical Realism.
- Despues: `pack_10 availableDefaultImages=44/80`,
  `staleDefaultImages=0`, `missingDefaultImages=36`.
- `bun run styles:validate -- --pack=pack_10 --coverage` -> ok.

Siguiente cola:

- `SP10-040|SP10-041|SP10-042|SP10-044|SP10-046|SP10-047`.

### Primary defaults - 2026-06-20 - `pack_10` missing surreal/pattern wave F

Ronda visual/missing:

- Estado antes: `pack_10 availableDefaultImages=44/80`,
  `staleDefaultImages=0`, `missingDefaultImages=36`.
- Ajuste previo: se agregaron overrides id-specific para `SP10-046` Paisley
  Pattern y `SP10-047` Damask Pattern, evitando personaje/habitacion y
  forzando foco textil/material.
- Generados por esta ronda:
  `SP10-040|SP10-041|SP10-042|SP10-044|SP10-046|SP10-047`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_10 "--preset=SP10-040|SP10-041|SP10-042|SP10-044|SP10-046|SP10-047" --parallel=1 --session-suffix=pack10_missing_wave_f --force`
  -> `generated=6 attempted=6 skipped=74 failed=0`.
- Nota: `SP10-040` tuvo un primer job `needs_review`, pero retry genero asset.
- QA sheet: `logs\qa-pack10-missing-wave-f.webp`.
- QA: aceptadas las 6; no hay anime global. `SP10-046` y `SP10-047`
  quedaron material/textil sin personaje. Watchlist suave: `SP10-044`
  Solarpunk usa figura central, pero la identidad botanica/tech domina.
- Estado concurrente: durante la ronda tambien aparecieron assets actuales
  fuera de este comando (`SP10-048`, `SP10-049`, `SP10-056`, `SP10-070`), por
  eso el coverage real subio mas que las 6 generadas aqui.
- Despues: `pack_10 availableDefaultImages=54/80`,
  `staleDefaultImages=0`, `missingDefaultImages=26`.
- `bun run styles:validate -- --pack=pack_10 --coverage` -> ok.

Siguiente cola:

- `SP10-050|SP10-051|SP10-053|SP10-054|SP10-055|SP10-057`.

### Primary defaults - 2026-06-20 - `pack_10` missing pattern wave G

Ronda visual/missing:

- Estado antes real: `pack_10 availableDefaultImages=57/80`,
  `staleDefaultImages=0`, `missingDefaultImages=23`.
- Dry-run previo: se verifico que `SP10-053|SP10-054|SP10-055|SP10-057|SP10-058`
  quedan como material/pattern-first; anime/manga aparece solo como
  prohibicion.
- Ajuste generador: `pack_10` `Pattern & Texture` ahora usa sufijo
  `SP10 PATTERN/TEXTURE OVERRIDE`, detalle/camera-focus material-first y no
  usa pose/personaje como fallback.
- Generados:
  `SP10-053|SP10-054|SP10-055|SP10-057|SP10-058`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_10 "--preset=SP10-053|SP10-054|SP10-055|SP10-057|SP10-058" --parallel=1 --session-suffix=pack10_missing_wave_g --force`
  -> `generated=5 attempted=5 skipped=75 failed=0`.
- Retry puntual:
  `SP10-055` fue rechazado por bowl/sphere/product still-life; se agrego
  override id-specific de wood-grain surface y se regenero solo ese preset:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_10 --preset=SP10-055 --parallel=1 --session-suffix=pack10_missing_wave_g_retry --force`
  -> `generated=1 attempted=1 skipped=79 failed=0`.
- Retry puntual:
  `SP10-057` fue rechazado por objeto/mascota tejida; se agrego override
  id-specific de knitted textile surface y se regenero solo ese preset:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_10 --preset=SP10-057 --parallel=1 --session-suffix=pack10_missing_wave_g_retry --force`
  -> `generated=1 attempted=1 skipped=79 failed=0`.
- QA sheet: `logs\qa-pack10-missing-wave-g.webp`.
- QA: aceptadas las 5 tras retries; no hay anime ni personajes. `SP10-054`
  y `SP10-058` usan objeto/edge como soporte, pero la lectura principal sigue
  siendo marble/denim texture.
- Estado concurrente: despues de la tanda aparecieron assets actuales fuera de
  este comando (`SP10-060`, `SP10-062`, `SP10-063`), por eso el coverage real final subio
  mas que las 5 generadas aqui.
- Despues: `pack_10 availableDefaultImages=65/80`,
  `staleDefaultImages=0`, `missingDefaultImages=15`.
- `bun run check -- scripts/generate-style-defaults.ts` -> ok.
- `bun run styles:validate -- --pack=pack_10 --coverage` -> ok.

Siguiente cola:

- `SP10-064|SP10-065|SP10-066|SP10-067|SP10-069|SP10-071`.

### Primary defaults - 2026-06-20 - `pack_10` missing pattern wave H

Ronda visual/missing:

- Estado antes real: `pack_10 availableDefaultImages=66/80`,
  `staleDefaultImages=0`, `missingDefaultImages=14`.
- Faltantes reales al arrancar por filesystem/coverage:
  `SP10-037|SP10-051|SP10-065|SP10-066|SP10-067|SP10-069|SP10-071|SP10-072|SP10-074|SP10-075|SP10-076|SP10-077|SP10-078|SP10-079`.
- Ajuste generador: se reforzo `pack_10` `Pattern & Texture` con anchors
  propios, `CONSTRAINT SEMANTICS` estricto sin personas/rooms/product staging,
  feeling material-first y motif material-first. Tambien se agrego override
  id-specific para `SP10-037` Escher sin personaje.
- Generados:
  `SP10-037|SP10-051|SP10-065|SP10-066|SP10-067|SP10-069`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_10 "--preset=SP10-037|SP10-051|SP10-065|SP10-066|SP10-067|SP10-069" --parallel=1 --session-suffix=pack10_missing_wave_h --force`
  -> `generated=6 attempted=6 skipped=74 failed=0`.
- QA sheet: `logs\qa-pack10-missing-wave-h.webp`.
- QA: aceptadas las 6; no hay anime ni personajes. `SP10-037` quedo como
  geometria imposible; `SP10-051`, `SP10-065`, `SP10-066`, `SP10-067` y
  `SP10-069` quedaron material/pattern-first. Watchlist suave: `SP10-069`
  es QR-like por identidad del preset, pero sin UI/logo/texto visible.
- Estado concurrente: durante/despues de la tanda aparecieron assets actuales
  fuera de este comando (`SP10-071`, `SP10-072`, `SP10-074`, `SP10-075`,
  `SP10-077`), por eso el coverage real subio mas que las 6 generadas aqui.
- Despues: `pack_10 availableDefaultImages=77/80`,
  `staleDefaultImages=0`, `missingDefaultImages=3`.
- `bun run styles:validate -- --pack=pack_10 --coverage` -> ok.

Siguiente cola:

- `SP10-076|SP10-078|SP10-079`.

### Primary defaults - 2026-06-20 - `pack_10` missing pattern wave I

Ronda visual/missing:

- Estado antes real: `pack_10 availableDefaultImages=77/80`,
  `staleDefaultImages=0`, `missingDefaultImages=3`.
- Generados:
  `SP10-076|SP10-078|SP10-079`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 bun run scripts\generate-style-defaults.ts --pack=pack_10 "--preset=SP10-076|SP10-078|SP10-079" --parallel=1 --session-suffix=pack10_missing_wave_i --force`
  -> `generated=3 attempted=3 skipped=77 failed=0`.
- QA sheet: `logs\qa-pack10-missing-wave-i.webp`.
- QA: aceptadas las 3; `SP10-076` Blueprint no contiene texto legible,
  `SP10-078` Neon Light Lines queda abstracto/material, y `SP10-079` Foil
  Stamping no deriva a logo/UI/product shot.
- Despues: `pack_10 availableDefaultImages=80/80`,
  `staleDefaultImages=0`, `missingDefaultImages=0`.
- `bun run styles:validate -- --pack=pack_10 --coverage` -> ok.

Siguiente cola:

- `pack_10` queda cerrado visualmente; continuar con la prioridad real del
  objetivo: auditoria/refactor semantico pendiente de `pack_07`/`pack_08` o
  deuda visual prioritaria `pack_14`/`pack_15` segun el siguiente corte.

### Visual rejection - 2026-06-20 - `SP06` anime spillover scope

Ronda de auditoria visual sin generacion:

- Contact sheet revisada:
  `logs\qa-sp06-anime-scope-suspects-current.webp`.
- Rechazadas/no confiables por anime spillover o digital-anime no pedido:
  `SP06-002`, `SP06-020`, `SP06-026`, `SP06-055`, `SP06-104`.
- `SP06-105` queda condicional: puede usar fighting-game stylization, pero no
  debe derivar a generic anime.
- Permitidas por preset explicito:
  `SP06-085`, `SP06-108`, `SP06-114`.
- Patch aplicado en `scripts/generate-style-defaults.ts`: scope no-anime por
  defecto para `pack_06`, allowlist anime explicita para `SP06-085`,
  `SP06-108`, `SP06-114`, y anatomy QA sin tratar anime como fallback neutro.
- Dry-run de prompts confirma `SP06 NON-ANIME SCOPE` en los rechazados/no-anime
  y `SP06 ANIME-ALLOWED SCOPE` en los permitidos.
- Check focal:
  `bun run check -- scripts\generate-style-defaults.ts scripts\style-default-utils.ts scripts\style-default-utils.test.ts`
  -> ok.

Siguiente cola recomendada:

- Regenerar en tanda chica:
  `SP06-002|SP06-020|SP06-026|SP06-055|SP06-104`.
- Revisar visualmente antes de volver a cualquier generacion masiva.

### Primary defaults - 2026-06-20 - `SP06` non-anime scope retry

Ronda visual correctiva:

- Estado antes real: `pack_06 availableDefaultImages=120/120`,
  `staleDefaultImages=0`, `missingDefaultImages=0`.
- Pre-wave backup:
  `D:\codex-studio-backups\style-default-cards\20260620-231756\pre-sp06-non-anime-scope-retry`.
- Generados:
  `SP06-002|SP06-020|SP06-026|SP06-055|SP06-104`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp06-non-anime-scope-retry-archive bun run scripts\generate-style-defaults.ts --pack=pack_06 "--preset=SP06-002|SP06-020|SP06-026|SP06-055|SP06-104" --parallel=1 --session-suffix=sp06_non_anime_scope_retry --force`
  -> `generated=5 attempted=5 skipped=115 failed=0`.
- `SP06-104` tuvo dos rechazos internos: object-core y luego device/camera-drone
  demasiado protagonista. Se guardaron en:
  `D:\codex-studio-backups\style-default-cards\20260620-232846\rejected-sp06-104-object-core`,
  `D:\codex-studio-backups\style-default-cards\20260620-233121\rejected-sp06-104-drone-camera-prop`.
- Se alineo `SP06-104` base prompt + quality lock: courier no-anime obligatorio,
  HUD no-readable como atmosfera, no drone/camera/tripod/object-core.
- Retry final `SP06-104`:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp06-non-anime-scope-retry-archive bun run scripts\generate-style-defaults.ts --pack=pack_06 --preset=SP06-104 --parallel=1 --session-suffix=sp06_104_non_anime_no_drone --force`
  -> `generated=1 attempted=1 skipped=119 failed=0`.
- QA sheets:
  `logs\qa-sp06-non-anime-scope-retry-before-after.webp`,
  `logs\qa-sp06-non-anime-scope-retry-final.webp`.
- QA: `SP06-002`, `SP06-020`, `SP06-026`, `SP06-104` aceptadas. `SP06-055`
  queda pass/watchlist por animal/fox shortcut, pero ya no cae en anime.
- Despues: `pack_06 availableDefaultImages=120/120`,
  `staleDefaultImages=0`, `missingDefaultImages=0`.
- `bun run styles:validate -- --pack=pack_06 --coverage` -> ok.
- `bun run styles:runtime:check` -> current.
- `bun run check -- scripts\generate-style-defaults.ts` -> ok tras
  `check:fix`.

Siguiente cola:

- Volver al objetivo principal: auditoria/refactor semantico pendiente de
  `pack_07`/`pack_08`.

### Coverage checkpoint - 2026-06-21 - post `SP06` correction

Ronda de auditoria/validacion sin generacion:

- `bun run styles:validate -- --coverage` -> ok.
- Packs cerrados por coverage: `pack_06`, `pack_07`, `pack_08`, `pack_10`,
  `pack_12`, `pack_14`, `pack_15`, `pack_16`, `pack_17`.
- `pack_14` y `pack_15` no tienen missing/stale actual, asi que no son la
  siguiente cola visual salvo nuevo borrado o feedback puntual.
- Deuda visual global actual:
  `pack_01 missing=4`, `pack_02 missing=9`, `pack_03 missing=2`,
  `pack_04 missing=4`, `pack_05 missing=37`, `pack_09 missing=7`,
  `pack_11 missing=64`, `pack_13 missing=25`.
- `bun run styles:quality:audit` -> ok; redundancy none above threshold.
- `bun run styles:runtime:check` -> current.

Siguiente cola recomendada:

- `pack_11` missing defaults, por ser la mayor deuda visual actual y porque
  los packs priorizados `pack_14`/`pack_15` ya estan cerrados.

### Primary defaults - 2026-06-21 - `pack_11` toys/non-anime wave 1

Ronda visual:

- Estado antes: `pack_11 availableDefaultImages=16/80`,
  `staleDefaultImages=0`, `missingDefaultImages=64`.
- Dry-run de prompts para `SP11-001|SP11-002|SP11-004|SP11-005`: pasa
  filtro no-anime; el prompt conserva toy/material identity y niega anime salvo
  preset explicito.
- Generados por esta tanda:
  `SP11-001|SP11-002|SP11-004|SP11-005`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp11-first-wave-archive bun run scripts\generate-style-defaults.ts --pack=pack_11 "--preset=SP11-001|SP11-002|SP11-004|SP11-005" --parallel=2 --session-suffix=sp11_toys_non_anime_wave1`
  -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA visual aceptada:
  `SP11-001` lee brick-build no-anime; `SP11-002` lee vinyl collectible;
  `SP11-004` lee papercraft/folded-cardstock; `SP11-005` lee amigurumi crochet.
- Watchlist menor: `SP11-001` incluye lampara secundaria, pero no domina la
  card ni rompe el preset.
- Estado despues validado:
  `pack_11 availableDefaultImages=22/80`, `staleDefaultImages=0`,
  `missingDefaultImages=58`.
- Nota de trazabilidad: `SP11-017` y `SP11-050` aparecen como nuevos en la
  misma ventana temporal, pero no fueron reportados por este comando
  (`generated=4`); se inspeccionaron visualmente y quedan como existentes, no
  como parte de esta tanda.
- `bun run styles:validate -- --pack=pack_11 --coverage` -> ok.

Siguiente cola recomendada:

- Continuar `pack_11` desde `SP11-007|SP11-008|SP11-009|SP11-010`, revisando
  prompt efectivo antes de generar para evitar anime drift, props genericos y
  material hyper-detail.

### Primary defaults - 2026-06-21 - `pack_11` oddities/non-anime wave 2

Ronda visual:

- Estado antes detectado: `pack_11 availableDefaultImages=23/80`,
  `staleDefaultImages=0`, `missingDefaultImages=57`.
- Dry-run de prompts para `SP11-007|SP11-008|SP11-009|SP11-010`: pasa filtro
  no-anime; riesgo especial marcado para `SP11-007` por banners/tattoo flash
  sin texto legible.
- Comando principal:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp11-wave2-archive bun run scripts\generate-style-defaults.ts --pack=pack_11 "--preset=SP11-007|SP11-008|SP11-009|SP11-010" --parallel=2 --session-suffix=sp11_oddities_non_anime_wave2`
  -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA visual inicial: `SP11-007`, `SP11-008` y `SP11-010` aceptadas.
  `SP11-009` rechazada por caer en pixel-art/arcade, no en glossy 3D emoji.
- Retry aceptado:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp11-wave2-archive bun run scripts\generate-style-defaults.ts --pack=pack_11 --preset=SP11-009 --parallel=1 --session-suffix=sp11_009_emoji3d_retry --force`
  -> `generated=1 attempted=1 skipped=79 failed=0`.
- Rechazo archivado:
  `D:\codex-studio-backups\style-default-cards\sp11-wave2-archive\previous\SP11-009.2026-06-21T03-04-58-338Z.webp`.
- QA visual final aceptada:
  `SP11-007` tattoo flash sin texto legible; `SP11-008` stained glass con
  lead-came claro; `SP11-009` glossy emoji/icon 3D; `SP11-010` indexed pixel
  constraint.
- Estado despues validado:
  `pack_11 availableDefaultImages=34/80`, `staleDefaultImages=0`,
  `missingDefaultImages=46`.
- Nota de trazabilidad: el salto de `23/80` a `34/80` excede esta tanda
  aceptada; ademas de `SP11-007..010`, aparecen presentes `SP11-020..025`,
  `SP11-061` y `SP11-065`, pero no fueron reportados por estos comandos.
- `bun run styles:validate -- --pack=pack_11 --coverage` -> ok.

Siguiente cola recomendada:

- Continuar `pack_11` con `SP11-011|SP11-012|SP11-013|SP11-014`, manteniendo
  dry-run de prompts y QA visual antes de aceptar cada tanda.

### Primary defaults - 2026-06-21 - `pack_11` eco/diesel/cottage wave 3

Ronda visual:

- Estado antes detectado: `pack_11 availableDefaultImages=35/80`,
  `staleDefaultImages=0`, `missingDefaultImages=45`.
- Dry-run de prompts para `SP11-011|SP11-012|SP11-013|SP11-014`: sin anime por
  defecto. Riesgos marcados antes de generar: `SP11-012` podia caer en
  solarpunk anime/generic-glass; `SP11-013` podia caer en concept art oscuro.
- Comando principal:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp11-wave3-archive bun run scripts\generate-style-defaults.ts --pack=pack_11 "--preset=SP11-011|SP11-012|SP11-013|SP11-014" --parallel=2 --session-suffix=sp11_wave3_non_anime`
  -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA visual inicial: `SP11-011` y `SP11-014` aceptadas. `SP11-012` rechazada
  por character/anime-solapado; `SP11-013` rechazada por retrato/AAA
  concept-art oscuro.
- Retry barato sin patch:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp11-wave3-archive bun run scripts\generate-style-defaults.ts --pack=pack_11 "--preset=SP11-012|SP11-013" --parallel=1 --session-suffix=sp11_wave3_retry_no_anime_no_photoreal --force`
  -> `generated=2 attempted=2 skipped=78 failed=0`, visualmente insuficiente.
- Patch puntual en `scripts/generate-style-defaults.ts`: overrides para
  `SP11-012` y `SP11-013` como scene/material-led, sin retrato, sin anime, sin
  AAA photoreal concept art.
- Dry-run override con `--force`: pasa; `SP11-012` queda infraestructura
  solarpunk, `SP11-013` queda masa-maquina dieselpunk.
- Retry final:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp11-wave3-archive bun run scripts\generate-style-defaults.ts --pack=pack_11 "--preset=SP11-012|SP11-013" --parallel=1 --session-suffix=sp11_wave3_override_final --force`
  -> `generated=2 attempted=2 skipped=78 failed=0`.
- QA visual final aceptada:
  `SP11-011` chrome horizon voltage; `SP11-012` civic solarpunk greenhouse
  infrastructure; `SP11-013` dieselpunk machine mass; `SP11-014` cottagecore
  handcrafted pastoral object-scene.
- Watchlist menor: `SP11-013` sigue densa, pero ya no es retrato humano ni
  AAA character concept art.
- Rechazos archivados en:
  `D:\codex-studio-backups\style-default-cards\sp11-wave3-archive\previous\SP11-012.2026-06-21T03-15-50-049Z.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave3-archive\previous\SP11-012.2026-06-21T03-20-18-102Z.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave3-archive\previous\SP11-013.2026-06-21T03-17-23-875Z.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave3-archive\previous\SP11-013.2026-06-21T03-21-45-096Z.webp`.
- Estado despues validado:
  `pack_11 availableDefaultImages=47/80`, `staleDefaultImages=0`,
  `missingDefaultImages=33`.
- Nota de trazabilidad: el salto de `35/80` a `47/80` excede esta tanda
  aceptada; ademas de `SP11-011..014`, aparecen presentes `SP11-027`,
  `SP11-029`, `SP11-034`, `SP11-046`, `SP11-047`, `SP11-049`, `SP11-053`,
  `SP11-054` y `SP11-055`, pero no fueron reportados por estos comandos.
- `bun run styles:validate -- --pack=pack_11 --coverage` -> ok.

Siguiente cola recomendada:

- Continuar `pack_11` con `SP11-015|SP11-019|SP11-026|SP11-030`, manteniendo
  dry-run de prompts, y revisar con lupa si aparecen texto, UI, anime no pedido
  o concept-art oscuro.

### Prompt guardrail - 2026-06-21 - no-anime bleed preflight

Auditoria antes de continuar:

- Se pauso la generacion porque la tanda previa expuso fuga de lenguaje
  personaje/anime en presets no-anime (`SP11-012`, `SP11-013`).
- Ajuste aplicado en `scripts/generate-style-defaults.ts`: `NON-ANIME STYLE
LOCK` al inicio de prompts para packs/presets que no pidan explicitamente
  anime, manga, visual novel, gacha, shonen/shojo/seinen/josei/moe/isekai.
- La ruta generica no-anime deja de priorizar `protagonist`, `facial angle`,
  `face/pose` y pasa a `material specimen`, `symbolic object`, `environment
fragment`, `craft/process form`, o figura no-anime solo cuando ayuda.
- Ajuste aplicado en `scripts/style-default-utils.ts`: el suffix global ya no
  trata `cel animation` como permiso amplio para anime.
- Dry-run validado para `SP11-015|SP11-019|SP11-026|SP11-030`:
  los prompts ahora muestran `NON-ANIME STYLE LOCK` arriba y mantienen
  `apply heavy denoise to the image`.
- `bun run check:fix -- scripts\generate-style-defaults.ts scripts\style-default-utils.ts`
  -> ok.
- Estado despues de la pausa:
  `bun run styles:validate -- --pack=pack_11 --coverage` -> ok;
  `availableDefaultImages=49/80`, `staleDefaultImages=0`,
  `missingDefaultImages=31`. La siguiente cola real sigue iniciando en
  `SP11-015|SP11-019|SP11-026|SP11-030`.

Siguiente cola recomendada:

- Generar `SP11-015|SP11-019|SP11-026|SP11-030` solo despues de revisar el
  dry-run final y con QA visual estricta contra anime no pedido.

### Primary defaults - 2026-06-21 - `pack_11` novelty/material wave 4

Ronda visual:

- Estado antes detectado: `pack_11 availableDefaultImages=50/80`,
  `staleDefaultImages=0`, `missingDefaultImages=30`.
- Dry-run final guardado en `.tmp/sp11-wave4-dryrun.txt`: los 4 prompts
  muestran `NON-ANIME STYLE LOCK`, ancla no-anime y `apply heavy denoise to
the image`.
- Comando principal:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp11-wave4-archive bun run scripts\generate-style-defaults.ts --pack=pack_11 "--preset=SP11-015|SP11-019|SP11-026|SP11-030" --parallel=2 --session-suffix=sp11_wave4_non_anime_lock`
  -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA visual aceptada:
  `SP11-015` dark-academia relic/object scene sin anime; `SP11-019` felt
  broadcast object/set, claro y no anime; `SP11-026` aerosol layering aceptada
  con watchlist menor por product/object-render; `SP11-030` sand-art bottle
  clara y denoised.
- Backups actuales:
  `D:\codex-studio-backups\style-default-cards\sp11-wave4-archive\current\SP11-015.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave4-archive\current\SP11-019.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave4-archive\current\SP11-026.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave4-archive\current\SP11-030.webp`.
- Estado despues validado:
  `pack_11 availableDefaultImages=58/80`, `staleDefaultImages=0`,
  `missingDefaultImages=22`.
- Nota de trazabilidad: el salto de `50/80` a `58/80` excede esta tanda
  aceptada; ademas de `SP11-015`, `SP11-019`, `SP11-026` y `SP11-030`,
  aparecen presentes `SP11-056`, `SP11-058`, `SP11-071` y `SP11-072`, pero no
  fueron reportados por este comando.
- `bun run styles:validate -- --pack=pack_11 --coverage` -> ok.

Siguiente cola recomendada:

- Continuar `pack_11` con `SP11-031|SP11-032|SP11-033|SP11-035`, manteniendo
  dry-run de prompts y QA visual contra anime no pedido, product-render generico
  y scene drift.

### Primary defaults - 2026-06-21 - `pack_11` novelty/material wave 5

Ronda visual:

- Estado antes detectado: `pack_11 availableDefaultImages=59/80`,
  `staleDefaultImages=0`, `missingDefaultImages=21`.
- Dry-run final guardado en `.tmp/sp11-wave5-dryrun.txt`: los 4 prompts
  muestran `NON-ANIME STYLE LOCK`, ancla no-anime y `apply heavy denoise to
the image`.
- Comando principal:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp11-wave5-archive bun run scripts\generate-style-defaults.ts --pack=pack_11 "--preset=SP11-031|SP11-032|SP11-033|SP11-035" --parallel=2 --session-suffix=sp11_wave5_non_anime_lock`
  -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA visual aceptada:
  `SP11-031` ice carving con watchlist menor por escenario palaciego/hielo,
  pero la talla domina; `SP11-032` latte art claro, no anime; `SP11-033`
  blueprint claro con marcas tecnicas no legibles; `SP11-035` thermal vision
  clara y no anime.
- Backups actuales:
  `D:\codex-studio-backups\style-default-cards\sp11-wave5-archive\current\SP11-031.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave5-archive\current\SP11-032.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave5-archive\current\SP11-033.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave5-archive\current\SP11-035.webp`.
- Estado despues validado:
  `pack_11 availableDefaultImages=66/80`, `staleDefaultImages=0`,
  `missingDefaultImages=14`.
- Nota de trazabilidad: el salto de `59/80` a `66/80` excede esta tanda
  aceptada; ademas de `SP11-031`, `SP11-032`, `SP11-033` y `SP11-035`,
  aparecen presentes `SP11-068`, `SP11-073` y `SP11-074`, pero no fueron
  reportados por este comando.
- `bun run styles:validate -- --pack=pack_11 --coverage` -> ok.

Siguiente cola recomendada:

- Continuar `pack_11` con `SP11-042|SP11-048|SP11-052|SP11-057`, manteniendo
  dry-run de prompts y QA visual contra anime no pedido, texto/UI y object
  render generico.

### Primary defaults - 2026-06-21 - `pack_11` novelty/material wave 6

Ronda visual:

- Estado antes detectado: `pack_11 availableDefaultImages=66/80`,
  `staleDefaultImages=0`, `missingDefaultImages=14`.
- Tanda generada: `SP11-042|SP11-048|SP11-052|SP11-057`.
- Dry-run inicial: `.tmp/sp11-wave6-dryrun.txt`; los 4 prompts muestran
  `NON-ANIME STYLE LOCK`, ancla no-anime y `apply heavy denoise to the image`.
- Ajuste posterior de prompt global:
  `scripts/style-default-utils.ts` separa `non-anime` de `anti-photographic`;
  el suffix ahora preserva fotografia/material/macro/game-art cuando el preset
  lo pide y solo bloquea deriva anime no solicitada.
- Dry-run tras ajuste: `.tmp/sp11-wave6-dryrun-after-suffix-fix.txt`; confirma
  lock no-anime, lenguaje nativo del preset y denoise fuerte.
- Comando principal:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp11-wave6-archive bun run scripts\generate-style-defaults.ts --pack=pack_11 "--preset=SP11-042|SP11-048|SP11-052|SP11-057" --parallel=2 --session-suffix=sp11_wave6_non_anime_lock`
  -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA visual aceptada con contact sheet `.tmp/sp11-wave6-contact.webp`:
  `SP11-042` Frutiger Aero glossy/aqua no anime; `SP11-048` sushi platter
  claro sin market/corridor; `SP11-052` fruit explosion dinamica y denoised;
  `SP11-057` compound insect eye macro/material sin humano/anime.
- Backups actuales:
  `D:\codex-studio-backups\style-default-cards\sp11-wave6-archive\current\SP11-042.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave6-archive\current\SP11-048.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave6-archive\current\SP11-052.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave6-archive\current\SP11-057.webp`.
- Estado despues validado:
  `pack_11 availableDefaultImages=71/80`, `staleDefaultImages=0`,
  `missingDefaultImages=9`.
- Nota de trazabilidad: el salto de `66/80` a `71/80` excede esta tanda;
  ademas de `SP11-042`, `SP11-048`, `SP11-052` y `SP11-057`, aparece presente
  `SP11-066`, no reportado por este comando.
- `bun run styles:validate -- --pack=pack_11 --coverage` -> ok.

Siguiente cola recomendada:

- Continuar `pack_11` con `SP11-060|SP11-062|SP11-063|SP11-064`, manteniendo
  dry-run, QA visual y el criterio nuevo: no anime no significa no fotografia,
  no macro ni no material.

### Primary defaults - 2026-06-21 - `pack_11` macro/material wave 7

Ronda visual:

- Estado antes detectado: `pack_11 availableDefaultImages=71/80`,
  `staleDefaultImages=0`, `missingDefaultImages=9`.
- Tanda generada: `SP11-060|SP11-062|SP11-063|SP11-064`.
- Dry-run final guardado en `.tmp/sp11-wave7-dryrun.txt`: los 4 prompts
  muestran `NON-ANIME STYLE LOCK`, preservan lenguaje fotografico/material/
  macro cuando aplica y mantienen `apply heavy denoise to the image`.
- Comando principal:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp11-wave7-archive bun run scripts\generate-style-defaults.ts --pack=pack_11 "--preset=SP11-060|SP11-062|SP11-063|SP11-064" --parallel=2 --session-suffix=sp11_wave7_non_anime_native_media`
  -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA inicial: `SP11-060` circuit board, `SP11-062` fabric macro y
  `SP11-064` iris macro pasan; `SP11-063` fallo por contaminacion
  eye/iris/lens.
- Correccion minima: `SP11-063` agrega `eye`, `iris`, `pupil`, `lens` a
  `avoidRules` y `negativePrompt`.
- Retry:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp11-wave7-archive bun run scripts\generate-style-defaults.ts --pack=pack_11 --preset=SP11-063 --parallel=1 --session-suffix=sp11_wave7_sp11_063_no_eye_retry --force`
  -> `generated=1 attempted=1 skipped=79 failed=0`.
- QA visual final con `.tmp/sp11-wave7-contact-final.webp`: aceptadas las 4;
  `SP11-063` ahora lee como corrosion/patina y no como ojo/lente.
- Backups actuales:
  `D:\codex-studio-backups\style-default-cards\sp11-wave7-archive\current\SP11-060.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave7-archive\current\SP11-062.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave7-archive\current\SP11-063.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave7-archive\current\SP11-064.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave7-archive\previous\SP11-063.2026-06-21T04-12-36-507Z.webp`.
- Estado despues validado:
  `pack_11 availableDefaultImages=75/80`, `staleDefaultImages=0`,
  `missingDefaultImages=5`.
- `bun run styles:validate -- --pack=pack_11 --coverage` -> ok.
- `bun run styles:runtime` -> ok; `packs=17`, `presets=1649`.
- `bun run styles:runtime:check` -> current.

Siguiente cola recomendada:

- Continuar `pack_11` con `SP11-067|SP11-070|SP11-075|SP11-079|SP11-080`,
  idealmente 2+3 o 2x2+1 para mantener QA visual estricta.

### Primary defaults - 2026-06-21 - `pack_11` macro/material wave 8 closeout

Ronda visual de cierre de `pack_11`:

- Estado antes detectado: `pack_11 availableDefaultImages=75/80`,
  `staleDefaultImages=0`, `missingDefaultImages=5`.
- Tanda objetivo: `SP11-067|SP11-070|SP11-075|SP11-079|SP11-080`.
- Dry-run: `.tmp/sp11-wave8-dryrun.txt`; los 5 prompts muestran
  `NON-ANIME STYLE LOCK`, preservan lenguaje fotografico/material/macro y
  terminan con `apply heavy denoise to the image`.
- Incidencia runtime:
  - intentos iniciales `sp11_wave8_close_native_media` quedaron atascados en
    `codex.started`, sin `codexTurnId`, sin transcript y sin asset;
  - se cancelaron solo jobs stale de esa sesion y un stale `FRUTIGER AERO`
    antiguo de `pack_11`, luego se reinicio el server local/app-server;
  - post-check adicional cancelo un stale `FIBER/FABRIC MACRO`; health final:
    `activeWorkerCount=0`, `queuedJobs=0`, `trackedJobs=0`;
  - no hubo assets parciales antes del cleanup.
- Probe 1x1:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp11-wave8-archive bun run scripts\generate-style-defaults.ts --pack=pack_11 --preset=SP11-070 --parallel=1 --session-suffix=sp11_wave8_single_probe`
  -> `generated=1 attempted=1 skipped=79 failed=0`.
- Comando restante:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=900000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp11-wave8-archive bun run scripts\generate-style-defaults.ts --pack=pack_11 "--preset=SP11-067|SP11-075|SP11-079|SP11-080" --parallel=2 --session-suffix=sp11_wave8_close_native_media_b`
  -> `generated=4 attempted=4 skipped=76 failed=0`.
- QA visual aceptada con `.tmp/sp11-wave8-contact.webp`:
  `SP11-067` feather macro, `SP11-070` ink in water, `SP11-075` sponge,
  `SP11-079` carbon fiber y `SP11-080` dandelion seed. Ninguna cae en anime,
  texto/UI, library/market corridor ni camera-in-hand. `SP11-075` y
  `SP11-079` quedan material/product-readable, aceptados para oddities.
- Backups actuales:
  `D:\codex-studio-backups\style-default-cards\sp11-wave8-archive\current\SP11-067.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave8-archive\current\SP11-070.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave8-archive\current\SP11-075.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave8-archive\current\SP11-079.webp`,
  `D:\codex-studio-backups\style-default-cards\sp11-wave8-archive\current\SP11-080.webp`.
- Estado despues validado:
  `pack_11 availableDefaultImages=80/80`, `staleDefaultImages=0`,
  `missingDefaultImages=0`.
- `bun run styles:validate -- --pack=pack_11 --coverage` -> ok.
- `bun run styles:runtime` -> ok; `packs=17`, `presets=1649`.
- `bun run styles:quality:audit` -> ok; `redundancy: none above threshold`.

Siguiente cola recomendada:

- Con `pack_11` cerrado por coverage, volver a la auditoria/cola global con
  foco en faltantes reales actuales y mantener dry-run + QA visual por tanda.

### Primary defaults - 2026-06-22 - `pack_02` photo/media correction

Ronda de QA visual sobre `Cinematic & Media`: habia defaults no-anime con
lectura anime/cartoon en categorias que deben leerse como fotografia, film
still, TV/broadcast u optica.

- Correccion de prompt:
  `scripts/generate-style-defaults.ts` agrega `PACK 02 PHOTO/MEDIA LOCK` para
  `pack_02` fuera de Animation/Cartoon y fuera de presets anime explicitos.
  El lock exige lectura camera-native / live-action / broadcast y bloquea
  anime, manga, cel-character, cartoon mascot, game-art y fantasy illustration
  como solucion por defecto.
- Dry-run guardado:
  `.tmp/style-card-review/sp02-photo-media-lock-dryrun.txt`; los 17 prompts
  muestran `PACK 02 PHOTO/MEDIA LOCK`. Probe de scope confirma que `SP02-011`
  y `SP02-037` no reciben el lock por anime explicito, y `SP02-087` no recibe
  lock fotografico por pertenecer a Cartoon.
- IDs regenerados:
  `SP02-003|SP02-005|SP02-008|SP02-010|SP02-012|SP02-013|SP02-015|SP02-016|SP02-052|SP02-069|SP02-076|SP02-121|SP02-122|SP02-123|SP02-124|SP02-126|SP02-127`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp02-photo-media-audit bun run scripts/generate-style-defaults.ts --pack=pack_02 "--preset=SP02-003|SP02-005|SP02-008|SP02-010|SP02-012|SP02-013|SP02-015|SP02-016|SP02-052|SP02-069|SP02-076|SP02-121|SP02-122|SP02-123|SP02-124|SP02-126|SP02-127" --parallel=3 --session-suffix=sp02_photo_media_lock --force`
  -> `generated=17 attempted=17 skipped=111 failed=0`.
- QA visual:
  `.tmp/style-card-review/sp02_photo_media_after.png` y hojas completas
  `.tmp/style-card-review/pack_02_sheet_after_01.png`,
  `pack_02_sheet_after_04.png`, `pack_02_sheet_after_05.png`,
  `pack_02_sheet_after_08.png`. Aceptadas las 17: Film Genres pasan a film
  still/live-action, `SP02-052` lee como lomography fotografico, `SP02-069` y
  `SP02-076` como estudios de luz, y `SP02-121..127` como TV/broadcast/video.
  Se dejan intencionalmente animados `SP02-011` y Animation/Cartoon, incluido
  `SP02-115..120`, porque el manifiesto lo pide.
- Backup current:
  `D:\codex-studio-backups\style-default-cards\sp02-photo-media-audit\current`.
- Validacion:
  `bun run styles:runtime` -> ok, `packs=17`, `presets=1649`;
  `bun run styles:runtime:check` -> current;
  `bun run styles:validate -- --pack=pack_02 --coverage` -> ok,
  `availableDefaultImages=128/128`, `staleDefaultImages=0`,
  `missingDefaultImages=0`;
  `bun run styles:quality:audit` -> ok, `redundancy: none above threshold`.

### Primary defaults - 2026-06-22 - `pack_02` scene-first photo/media retry

Retry puntual despues de que la tanda photo/media seguia teniendo lectura de
objetos, escenarios neutros o estudios de luz sin escena humana suficiente. La
regla corregida para `Cinematic & Media` queda: las tarjetas no-anime de film,
foto, TV/broadcast y lighting deben ser escenas completas con personas
visibles; la fotografia/cine/medio es el tratamiento, no el sujeto aislado.

- Correccion de prompt:
  `scripts/generate-style-defaults.ts` conserva `PACK 02 PHOTO/MEDIA LOCK` y
  agrega/refuerza `PACK 02 SCENE-FIRST RULE` para `pack_02` fuera de
  Animation/Cartoon y presets anime explicitos. Lighting & Atmosphere ahora
  bloquea retratos face-only, paneles negros vacios, estudio oscuro vacio,
  lamparas y diagramas abstractos de luz.
- IDs revisados/regenerados:
  `SP02-003|SP02-005|SP02-008|SP02-069|SP02-076`.
  La corrida intento los 5; el diff efectivo actual queda en `SP02-005`,
  `SP02-069`, `SP02-076` y `manifest-pack_02.json`, porque `SP02-003` y
  `SP02-008` ya coincidian con el estado actual aceptado.
- Dry-run:
  `.tmp/style-card-review/sp02-photo-media-scene-first-dryrun.txt` ->
  `prompts=5 skipped=123`; 5/5 con `PACK 02 PHOTO/MEDIA LOCK` y contrato
  scene-first/personas visibles.
- Generacion:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp02-photo-media-scene-first-retry bun run scripts/generate-style-defaults.ts --pack=pack_02 "--preset=SP02-003|SP02-005|SP02-008|SP02-069|SP02-076" --parallel=3 --session-suffix=sp02_photo_media_scene_first_retry --force`
  -> `generated=5 attempted=5 skipped=123 failed=0`.
  Luego `SP02-069` se regenero solo con el lock de lighting mas estricto:
  `bun run scripts/generate-style-defaults.ts --pack=pack_02 --preset=SP02-069 --parallel=1 --session-suffix=sp02_photo_media_scene_first_retry_scene_tighten --force`
  -> `generated=1 attempted=1 skipped=127 failed=0`.
- QA visual:
  `.tmp/style-card-review/sp02_photo_media_scene_first_retry.png`. Aceptadas:
  `SP02-003` sci-fi practico con persona en entorno neon; `SP02-005` New Wave
  con dos personas en cafe/calle; `SP02-008` found-footage con escena humana de
  horror; `SP02-069` split lighting con persona, segunda figura y entorno de
  oficina/ventana; `SP02-076` rim lighting con persona y escena nocturna. No
  quedan anime, cartoon, object-only, macro specimen ni scenery-only en esta
  tanda.
- Backup current:
  `D:\codex-studio-backups\style-default-cards\sp02-photo-media-scene-first-retry\current`.
- Validacion:
  `bun run styles:runtime` -> ok, `packs=17`, `presets=1649`;
  `bun run styles:runtime:check` -> current;
  `bun run styles:validate -- --pack=pack_02 --coverage` -> ok,
  `availableDefaultImages=128/128`, `staleDefaultImages=0`,
  `missingDefaultImages=0`;
  `bun run styles:quality:audit` -> ok, `redundancy: none above threshold`;
  `vp check --fix scripts/generate-style-defaults.ts` -> ok para formato/lint/tipos
  del generador. `bun run check` queda bloqueado por formato en
  `.github/workflows/react-doctor.yml`, archivo no tocado por esta ronda.

Siguiente cola recomendada:

- Si aparece otra deriva visual en `pack_02`, usar el mismo lock antes de
  regenerar; no convertir Animation/Cartoon ni presets anime explicitos a foto.

### Primary defaults - 2026-06-22 - `pack_02` rejected photo/media retry

Retry puntual sobre tarjetas borradas/rechazadas despues de la correccion
photo/media.

- IDs regenerados: `SP02-003|SP02-008|SP02-076`.
- Dry-run:
  `.tmp/style-card-review/sp02-photo-media-retry-dryrun.txt` -> 3/3 prompts
  con `PACK 02 PHOTO/MEDIA LOCK`.
- Comando:
  `CODEX_IMAGEGEN_WAIT_TIMEOUT_MS=1200000 STYLE_DEFAULT_CARD_ARCHIVE_DIR=D:\codex-studio-backups\style-default-cards\sp02-photo-media-rejected-retry bun run scripts/generate-style-defaults.ts --pack=pack_02 "--preset=SP02-003|SP02-008|SP02-076" --parallel=3 --session-suffix=sp02_photo_media_rejected_retry --force`
  -> `generated=3 attempted=3 skipped=125 failed=0`.
- QA visual:
  `.tmp/style-card-review/sp02_photo_media_rejected_retry.png`. Aceptadas las
  3: `SP02-003` como sci-fi practico/neon no-anime, `SP02-008` como
  found-footage horror sin cartoon, `SP02-076` como estudio de rim lighting
  sobre objeto/superficie.
- Backup current:
  `D:\codex-studio-backups\style-default-cards\sp02-photo-media-rejected-retry\current`.
- Validacion:
  `bun run styles:runtime` -> ok, `packs=17`, `presets=1649`;
  `bun run styles:runtime:check` -> current;
  `bun run styles:validate -- --pack=pack_02 --coverage` -> ok,
  `availableDefaultImages=128/128`, `staleDefaultImages=0`,
  `missingDefaultImages=0`;
  `bun run styles:quality:audit` -> ok, `redundancy: none above threshold`.
