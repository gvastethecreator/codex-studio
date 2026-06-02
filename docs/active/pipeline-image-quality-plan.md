# Plan: pipeline with better image quality

This document leaves a task ready for an agent: improve visual quality without inflating prompts or breaking the Provider Boundary. The improvement must come from more structured specs, references with clear roles, live evaluation, and per-output-type quality presets.

## Expected outcome

Every generation must express visual intent better: subject, composition, style, lighting, constraints, negative/avoid, and references. Providers must receive a compact but specific input. The Catalog must keep enough evidence to compare quality without storing large assets in the repo.

## Quick path

1. Pick 5-8 representative recipe cases.
2. Define the quality structure in `Generation Task Spec`.
3. Compile the final prompt from the structured fields.
4. Run legacy/directives comparisons with `recipes:evaluate:live`.
5. Store results as job/catalog refs and reviewer notes.

## Scope

Includes:

- Provider-independent structure for visual quality.
- Reference roles.
- Safe prompt tightening.
- Per-Generation-Task quality presets.
- Live evaluation with Codex once the Local Codex Session is ready.

Excludes:

- Switching default models without evidence.
- Putting quality instructions inside React surfaces.
- Storing generated images in the repo.
- Changing Provider Secrets or endpoints.

## Likely files

| Area                 | Files                                                                                                   |
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
  - quality notes the reviewer should score.
- Store the plan in repo-local Markdown, not generated images.

Acceptance:

- Another agent can run the same cases and judge output consistently.

### 2. Structured quality fields in Generation Task Spec

Tasks:

- Inspect current shared types for Generation Task Spec.
- Add minimal quality structure only where it improves compiler decisions.
- Prefer typed metadata or params over prompt-only strings.
- Keep `CONTEXT.md` glossary-only. Update architecture docs if the shape changes.
- Add tests proving existing recipes still build valid specs.

Acceptance:

- Spec remains provider-independent.
- UI does not become a prompt compiler.

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

- Create a pure helper that composes the final prompt from structured fields.
- It should:
  - remove duplicated instructions;
  - keep user-exact wording where it carries product behavior;
  - order content consistently;
  - keep avoid/negative constraints visible;
  - avoid adding unsupported claims.
- Do not call an LLM for tightening in the core path unless a future ADR approves it.
- Add fixtures for contradictory inputs and long recipe context.

Acceptance:

- Prompt shorter and clearer.
- Creative requirements preserved.

### 5. Quality presets

Tasks:

- Define a small set of quality preset ids:
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
  - provider hints if the provider supports them.
- Keep provider-specific options in provider config/input, not in generic task names.

Acceptance:

- Recipes can select quality behavior without bloating prompts.

### 6. Live quality evaluation

Tasks:

- Run a dry plan first:

```bash
bun run recipes:evaluate:live -- --recipe=<id> --out=logs/recipe-prompt-quality
```

- When the Local Codex Session is ready, execute representative cases:

```bash
bun run recipes:evaluate:live -- --recipe=<id> --execute --out=logs/recipe-prompt-quality
```

- Fill the generated Markdown review templates.
- Store only:
  - job ids;
  - catalog entry ids;
  - transcript paths;
  - reviewer notes;
  - prompt size metrics.
- Do not store generated images in the repo.

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

| Risk                                       | Mitigation                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| Better prompt shape costs more tokens      | Use structured fields plus a compact compiler; measure both quality and size. |
| Generic quality presets make outputs samey | Keep presets task-specific and allow recipe override.                         |
| Reference roles unsupported by provider    | Provider compiler must fail clearly or degrade explicitly.                    |
| Live evaluation burns tokens               | Use dry-run first, then a small representative execute set.                   |

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
