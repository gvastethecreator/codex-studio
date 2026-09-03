# Domain documents

Codex Studio uses one product context. Its shared language and decisions can live in these files when the project needs them:

- Root `CONTEXT.md`: product glossary, invariants, actors, and boundaries.
- `docs/adr/`: published decisions that contributors must preserve.
- `.scratch/architecture/`: local design spikes and audits.

Read the root context and relevant ADRs before changing a named domain concept. If a file does not exist, continue with terms already used by product code and user documentation.

Tickets and in-flight plans never live under `docs/`. Store ticket mirrors under `.scratch/codex-studio/issues/` and decision maps under `.scratch/wayfinder/`.

Use one term for each concept. Current core terms include `Studio Library`, `Catalog Entry`, `Persistent Job`, `Generation Task Spec`, `Provider Input`, `Provider Secret`, and `External Output Source`.

Surface any conflict with an existing ADR before implementation.
