# Plan: pipeline with fewer tokens

This document leaves a task ready for an agent: reduce the tokens sent to providers without losing traceability. The core principle is to keep the rich `Generation Task Spec` as the durable source and send only the compact `Compiled Provider Input` at execution time.

## Expected outcome

The pipeline must be able to demonstrate, per provider and per recipe, how heavy the durable spec is, how heavy the compiled input is, which stable instructions were kept out of the per-job prompt, and that no inline images, Provider Secrets, or sensitive local data are serialized.

## Quick path

1. Measure the current state with `providers:audit` and `recipes:evaluate`.
2. Move stable instructions into the `Provider Session Contract`.
3. Compact the `Compiled Provider Input` per provider.
4. Test quality with legacy/directives comparisons before deleting old metadata.
5. Close with `providers:verify`, `recipes:verify`, focused tests, and build.

## Scope

Includes:

- Codex as the primary provider.
- Concrete external providers: Google, fal.ai, ComfyUI.
- Recipe Provider Directives.
- Final prompt sent to the provider.
- Size metrics, token estimation, and stable-boilerplate omission.

Excludes:

- Changing recipe identity.
- Deleting legacy Recipe Context from durable metadata before live evidence.
- Reducing necessary creative detail just to save tokens.
- Storing Provider Secrets, endpoints, or inline images in logs/transcripts/docs.

## Likely files

| Area               | Files                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Provider compilers | `apps/local-server/src/providers/*Compiler*.ts`, `apps/local-server/src/providers/providerInputCompilerRegistry.ts` |
| Codex contract     | `apps/local-server/src/codex/imagegenContract.ts`, `apps/local-server/src/providers/codexProvider.ts`               |
| Recipe directives  | `lib/recipeModules.ts`, `lib/recipeContextBuilders/*`, `lib/recipeProviderDirectives*`                              |
| Audit              | `scripts/audit-provider-inputs.ts`, `scripts/evaluate-recipe-prompts.ts`, `scripts/evaluate-recipe-prompts-live.ts` |
| Tests              | `apps/local-server/src/providers/*.test.ts`, `lib/*.test.ts`, `scripts/*.test.ts`                                   |
| Docs               | `SKILLS.md`, `docs/ARCHITECTURE.md`, this file                                                                      |

## Work packages

### 1. Real baseline

Tasks:

- Run `bun run providers:audit -- --no-external-fixtures` for the current Codex path.
- Run `bun run recipes:evaluate -- --dry-run --out=logs/recipe-prompt-quality`.
- Capture per recipe:
  - `Generation Task Spec` char count.
  - `Compiled Provider Input` char count.
  - prompt estimate.
  - directive-vs-legacy delta.
  - repeated boilerplate lines.
- Identify the top 5 highest-cost recipes or presets.
- Do not commit generated logs unless repo policy already allows that exact artifact.

Acceptance:

- Agent can name which recipes waste the most prompt budget.
- No optimization starts from guesswork.

### 2. Provider Session Contract hardening

Tasks:

- Inspect `apps/local-server/src/codex/imagegenContract.ts`.
- Confirm stable instructions are represented once:
  - output format rules;
  - local image handling rules;
  - safety around paths/secrets;
  - artifact import expectations;
  - no repeated recipe-specific creative prose.
- Move repeated stable prompt fragments out of the per-job compiled input.
- Ensure the Codex persistent thread/developer instructions reuse the same contract.
- Add or update a test proving the compiled Codex input omits stable boilerplate while still referencing the session contract.

Acceptance:

- Stable contract exists in one source.
- Per-job input contains only task delta plus minimal execution instruction.

### 3. Compact Compiled Provider Input

Tasks:

- For each concrete provider compiler, verify the compiled input contains:
  - provider id;
  - task;
  - compact prompt or provider fields;
  - `localPath`/`sourceUrl` asset refs only;
  - provider options needed for execution;
  - no inline image bytes;
  - no Provider Secret values;
  - no local runtime endpoint values in serialized debug output.
- Normalize common fields where useful, but do not force all providers into one lowest-common-denominator prompt.
- Add fixtures for:
  - text-to-image;
  - image edit with input image;
  - image edit with mask;
  - style reference;
  - negative prompt/avoid rules.
- Update `providers:audit` output if it cannot show before/after size clearly.

Acceptance:

- Provider compilers stay behind the Provider Boundary.
- Audit proves compactness and leak safety.

### 4. Batch-level context sharing

Tasks:

- Inspect `services/localGenerationRun.ts` and backend job creation.
- Identify data repeated per item in the same batch:
  - stable recipe metadata;
  - provider selection;
  - shared prompt base;
  - shared references;
  - workspace id;
  - model/options.
- Keep one `batch-*` id and one compact per-job variation delta.
- Preserve per-job `spec-*` id for traceability.
- Avoid changing Catalog Entry grouping semantics without ADR/update.
- Add a focused test for `batchCount > 1` proving shared context does not mutate variation prompts.

Acceptance:

- Batch jobs keep unique task specs but avoid repeated unnecessary prompt prose.

### 5. Observability

Tasks:

- Add safe job metrics if missing:
  - `sourceSpecChars`;
  - `compiledInputChars`;
  - `promptEstimate`;
  - `assetRefCount`;
  - `inlineAssetBytesPresent: false`;
  - `providerSessionContractVersion`.
- Expose metrics in job details only if safe.
- Keep raw prompts out of broad logs when they may contain user/private content; prefer hashes plus explicit debug opt-in.

Acceptance:

- User can see token savings trend.
- Debugging does not leak secrets/assets.

## Validation

Focused during iteration:

```bash
bun run test -- apps/local-server/src/providers/<changed-test>.test.ts
bun run test -- scripts/audit-provider-inputs.test.ts
bun run check -- <changed files>
```

Domain gates:

```bash
bun run providers:verify
bun run recipes:verify
```

Closeout:

```bash
bun run test
bun run check
bun run build
```

If full gates fail from unrelated existing repo state, report the exact command, failing files, and why touched scope is still verified.

## Risks

| Risk                                   | Mitigation                                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Quality drops after compacting prompts | Run `recipes:evaluate:live -- --execute` for representative recipes before removing legacy context. |
| Traceability lost                      | Store the rich `Generation Task Spec`; send a compact `Compiled Provider Input`.                    |
| Secret leak in compiled/debug payload  | Add tests for Provider Secret redaction and inline-data absence.                                    |
| Provider-specific quality regression   | Keep provider compilers specialized behind the shared boundary.                                     |

## Done checklist

- [x] Baseline audit captured with `bun run providers:audit -- --no-external-fixtures` on 2026-05-30.
- [ ] Stable instructions centralized in Provider Session Contract.
- [ ] Codex compiled input compacted.
- [ ] External provider inputs checked for compactness and leaks.
- [ ] Batch repeated context reduced where safe.
- [x] Shared safe metrics helper added for provider input audits.
- [x] `SKILLS.md` updated with new audit/validation flow.
- [ ] `docs/ARCHITECTURE.md` updated if contract shape changes.
- [x] Focused tests pass for shared contracts, job routes, and provider audit.
- [ ] Broad gates attempted and reported.
