# Plan: pipeline con mejor calidad de imagen

Este documento deja una tarea lista para agente: mejorar calidad visual sin inflar prompts ni romper Provider Boundary. La mejora debe venir de specs mas estructurados, referencias con roles claros, evaluacion viva y presets de calidad por tipo de salida.

## Resultado esperado

Cada generacion debe expresar mejor intencion visual: sujeto, composicion, estilo, luz, restricciones, negative/avoid y referencias. Providers deben recibir un input compacto pero especifico. Catalog debe conservar evidencia suficiente para comparar calidad sin guardar assets grandes en repo.

## Quick path

1. Elegir 5-8 casos representativos de recetas.
2. Definir estructura de calidad en `Generation Task Spec`.
3. Compilar prompt final desde campos estructurados.
4. Ejecutar comparaciones legacy/directives con `recipes:evaluate:live`.
5. Guardar resultados como job/catalog refs y notas de reviewer.

## Scope

Incluye:

- Estructura provider-independent para calidad visual.
- Roles de referencia.
- Prompt tightening seguro.
- Presets de calidad por tipo de Generation Task.
- Evaluacion viva con Codex cuando la Local Codex Session este lista.

No incluye:

- Cambiar modelos por defecto sin evidencia.
- Meter instrucciones de calidad dentro de React surfaces.
- Guardar imagenes generadas en repo.
- Cambiar Provider Secrets o endpoints.

## Archivos probables

| Area                 | Archivos                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| Recipe specs         | `lib/recipeModules.ts`, `lib/recipeContextBuilders/*`, `lib/recipeModuleExamples.ts`                    |
| Prompt helpers       | `lib/recipePromptFragments*`, `lib/generationVariation.ts`, `lib/studioGenerationRequest.ts`            |
| Provider compilation | `apps/local-server/src/providers/*Compiler*.ts`, `apps/local-server/src/codex/turnInput.ts`             |
| References           | `apps/local-server/src/referenceManager.ts`, `apps/local-server/src/worker.ts`, `packages/shared/src/*` |
| Evaluation           | `scripts/evaluate-recipe-prompts.ts`, `scripts/evaluate-recipe-prompts-live.ts`                         |
| Docs                 | `SKILLS.md`, `docs/ARCHITECTURE.md`, this file                                                          |

## Quality model

Use provider-independent fields where possible:

| Field             | Purpose                                         |
| ----------------- | ----------------------------------------------- |
| `subject`         | Main object/person/scene.                       |
| `composition`     | Framing, camera, layout, scale, focal point.    |
| `style`           | Visual language, medium, genre, fidelity level. |
| `lighting`        | Light direction, contrast, time of day, mood.   |
| `color`           | Palette, saturation, color constraints.         |
| `materials`       | Surface detail, texture, finish.                |
| `constraints`     | Must-have requirements.                         |
| `negative`        | Avoid rules and known failure modes.            |
| `referenceRoles`  | How each image should influence output.         |
| `qualityPresetId` | Optional quality contract by output type.       |

Do not require every recipe to fill every field. Empty structure is worse than clear compact prose. Add fields where recipe data is real.

## Work packages

### 1. Representative quality set

Tasks:

- Use `bun run recipes:catalog -- --json` to list recipe modules.
- Pick representative cases:
  - text-to-image generic;
  - style transfer/reference;
  - image edit;
  - sprite sheet;
  - texture generation;
  - cinematic/character if active.
- For each case, define:
  - expected visual outcome;
  - common failure modes;
  - required reference roles;
  - quality notes reviewer should score.
- Store plan in repo-local Markdown, not generated images.

Acceptance:

- Another agent can run same cases and judge output consistently.

### 2. Structured quality fields in Generation Task Spec

Tasks:

- Inspect current shared types for Generation Task Spec.
- Add minimal quality structure only where it improves compiler decisions.
- Prefer typed metadata or params over prompt-only strings.
- Keep `CONTEXT.md` glossary-only. Update architecture docs if shape changes.
- Add tests proving existing recipes still build valid specs.

Acceptance:

- Spec remains provider-independent.
- UI does not become prompt compiler.

### 3. Reference role contract

Tasks:

- Audit current `GenerationTaskAssetRef` roles.
- Confirm support for:
  - `input`;
  - `mask`;
  - `reference`;
  - style reference;
  - composition reference;
  - avoid reference if supported or explicitly unsupported.
- Add role mapping rules per provider:
  - Codex local images;
  - Google edit inputs;
  - fal image/mask/reference URLs;
  - Comfy workflow placeholders if available.
- Validate before queue:
  - mime;
  - dataUrl parse;
  - localPath exists;
  - size/dimensions if available;
  - role allowed for task/provider.

Acceptance:

- Bad references fail before expensive provider execution.
- Compilers know how each reference should affect output.

### 4. Prompt tightening

Tasks:

- Create pure helper that composes final prompt from structured fields.
- It should:
  - remove duplicated instructions;
  - keep user exact wording where it carries product behavior;
  - order content consistently;
  - keep avoid/negative constraints visible;
  - avoid adding unsupported claims.
- Do not call an LLM for tightening in core path unless a future ADR approves it.
- Add fixtures for contradictory inputs and long recipe context.

Acceptance:

- Prompt shorter and clearer.
- Creative requirements preserved.

### 5. Quality presets

Tasks:

- Define small set of quality preset ids:
  - `image_general`;
  - `image_edit`;
  - `style_reference`;
  - `sprite_sheet`;
  - `texture`;
  - `product_or_ui_asset` if needed.
- Preset should define:
  - output expectations;
  - common negative rules;
  - reference priorities;
  - provider hints if provider supports them.
- Keep provider-specific options in provider config/input, not generic task names.

Acceptance:

- Recipes can select quality behavior without bloating prompts.

### 6. Live quality evaluation

Tasks:

- Run dry plan first:

```bash
bun run recipes:evaluate:live -- --recipe=<id> --out=logs/recipe-prompt-quality
```

- When Local Codex Session ready, execute representative cases:

```bash
bun run recipes:evaluate:live -- --recipe=<id> --execute --out=logs/recipe-prompt-quality
```

- Fill generated Markdown review templates.
- Store only:
  - job ids;
  - catalog entry ids;
  - transcript paths;
  - reviewer notes;
  - prompt size metrics.
- Do not store generated images in repo.

Acceptance:

- Quality decision has live evidence.
- Legacy context removal is blocked until evidence is good.

## Validation

Focused:

```bash
bun run test -- lib/<changed-test>.test.ts
bun run test -- apps/local-server/src/providers/<changed-test>.test.ts
bun run check -- <changed files>
```

Domain:

```bash
bun run recipes:verify
bun run providers:verify
```

Manual/live:

```bash
bun run recipes:evaluate:live -- --execute --out=logs/recipe-prompt-quality
```

Closeout:

```bash
bun run test
bun run check
bun run build
```

## Reviewer rubric

| Score | Meaning                                    |
| ----- | ------------------------------------------ |
| 1     | Prompt/spec failed intent.                 |
| 2     | Partial intent, major visual miss.         |
| 3     | Usable, but important detail weak.         |
| 4     | Strong output, minor issue.                |
| 5     | Output matches intent and reference roles. |

Review dimensions:

- subject fidelity;
- composition fidelity;
- style fidelity;
- reference use;
- artifact/noise level;
- constraint compliance;
- edit preservation when editing.

## Risks

| Risk                                       | Mitigation                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| Better prompt shape costs more tokens      | Use structured fields plus compact compiler, measure both quality and size. |
| Generic quality presets make outputs samey | Keep presets task-specific and allow recipe override.                       |
| Reference roles unsupported by provider    | Provider compiler must fail clearly or degrade explicitly.                  |
| Live evaluation burns tokens               | Use dry-run first, then small representative execute set.                   |

## Done checklist

- [ ] Representative quality set chosen.
- [x] Quality structure added in `Generation Task Spec.quality`.
- [ ] Reference roles validated before queue.
- [x] Prompt tightening helper tested through `composeGenerationQualityPromptSections()`.
- [x] Quality presets defined and documented.
- [ ] Live comparison templates filled.
- [ ] Reviewer notes stored as refs, not images.
- [x] `SKILLS.md` updated with quality workflow.
- [x] Focused tests pass.
- [ ] Broad gates attempted and reported.
