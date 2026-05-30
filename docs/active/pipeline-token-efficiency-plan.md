# Plan: pipeline con menos tokens

Este documento deja una tarea lista para agente: reducir tokens enviados a providers sin perder trazabilidad. El principio base es conservar el `Generation Task Spec` rico como fuente durable y enviar solo `Compiled Provider Input` compacto al momento de ejecutar.

## Resultado esperado

El pipeline debe poder demostrar, por provider y por receta, cuanto pesa el spec durable, cuanto pesa el input compilado, que instrucciones estables quedaron fuera del prompt por job, y que no se serializan imagenes inline, Provider Secrets ni datos locales sensibles.

## Quick path

1. Medir estado actual con `providers:audit` y `recipes:evaluate`.
2. Separar instrucciones estables en `Provider Session Contract`.
3. Compactar `Compiled Provider Input` por provider.
4. Probar calidad con comparaciones legacy/directives antes de borrar metadata vieja.
5. Cerrar con `providers:verify`, `recipes:verify`, tests enfocados y build.

## Scope

Incluye:

- Codex como provider primario.
- External providers ya concretos: Google, fal.ai, ComfyUI.
- Recipe Provider Directives.
- Prompt final enviado al provider.
- Metricas de tamano, estimacion de tokens y omision de boilerplate estable.

No incluye:

- Cambiar identidad de recetas.
- Borrar legacy Recipe Context de metadata durable antes de evidencia viva.
- Reducir detalle creativo necesario solo para ahorrar tokens.
- Guardar Provider Secrets, endpoints o imagenes inline en logs/transcripts/docs.

## Archivos probables

| Area               | Archivos                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Provider compilers | `apps/local-server/src/providers/*Compiler*.ts`, `apps/local-server/src/providers/providerInputCompilerRegistry.ts` |
| Codex contract     | `apps/local-server/src/codex/imagegenContract.ts`, `apps/local-server/src/providers/codexProvider.ts`               |
| Recipe directives  | `lib/recipeModules.ts`, `lib/recipeContextBuilders/*`, `lib/recipeProviderDirectives*`                              |
| Audit              | `scripts/audit-provider-inputs.ts`, `scripts/evaluate-recipe-prompts.ts`, `scripts/evaluate-recipe-prompts-live.ts` |
| Tests              | `apps/local-server/src/providers/*.test.ts`, `lib/*.test.ts`, `scripts/*.test.ts`                                   |
| Docs               | `SKILLS.md`, `docs/ARCHITECTURE.md`, this file                                                                      |

## Work packages

### 1. Baseline real

Tasks:

- Run `bun run providers:audit -- --no-external-fixtures` for current Codex path.
- Run `bun run recipes:evaluate -- --dry-run --out=logs/recipe-prompt-quality`.
- Capture per recipe:
  - `Generation Task Spec` char count.
  - `Compiled Provider Input` char count.
  - prompt estimate.
  - directive-vs-legacy delta.
  - repeated boilerplate lines.
- Identify top 5 highest-cost recipes or presets.
- Do not commit generated logs unless repo policy already allows that exact artifact.

Acceptance:

- Agent can name which recipes waste most prompt budget.
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
- Move repeated stable prompt fragments out of per-job compiled input.
- Ensure Codex persistent thread/developer instructions reuse same contract.
- Add or update test proving compiled Codex input omits stable boilerplate while still references session contract.

Acceptance:

- Stable contract exists in one source.
- Per-job input contains only task delta plus minimal execution instruction.

### 3. Compact Compiled Provider Input

Tasks:

- For each concrete provider compiler, verify compiled input contains:
  - provider id;
  - task;
  - compact prompt or provider fields;
  - localPath/sourceUrl asset refs only;
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

- Provider compilers stay behind Provider Boundary.
- Audit proves compactness and leak safety.

### 4. Batch-level context sharing

Tasks:

- Inspect `services/localGenerationRun.ts` and backend job creation.
- Identify data repeated per item in same batch:
  - stable recipe metadata;
  - provider selection;
  - shared prompt base;
  - shared references;
  - workspace id;
  - model/options.
- Keep one `batch-*` id and one compact per-job variation delta.
- Preserve per-job `spec-*` id for traceability.
- Avoid changing Catalog Entry grouping semantics without ADR/update.
- Add focused test for `batchCount > 1` proving shared context does not mutate variation prompts.

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

If full gates fail from unrelated existing repo state, report exact command, failing files, and why touched scope is still verified.

## Risks

| Risk                                   | Mitigation                                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Quality drops after compacting prompts | Run `recipes:evaluate:live -- --execute` for representative recipes before removing legacy context. |
| Traceability lost                      | Store rich `Generation Task Spec`; send compact `Compiled Provider Input`.                          |
| Secret leak in compiled/debug payload  | Add tests for Provider Secret redaction and inline-data absence.                                    |
| Provider-specific quality regression   | Keep provider compilers specialized behind shared boundary.                                         |

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
