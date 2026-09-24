# One task: Interface Handoff integration

Create this only if it does not exist. It is an internal agent task: implement it in the same invocation. On updates, preserve it and record required workflow adaptations and their result. Do not ask for another approval or duplicate setup tasks.

Status: planned | in_progress | blocked | implemented | verified

## Baseline and objective

Record the project, commit, working tree, date, and project instructions. State which UI is exported, which review it must enable, full or partial scope, and baseline inventory.

## Observed, unknown, and preserved

Record the installed framework and version, package manager, routing, styles, providers, and tests. Name real constraints and decisions. Do not attribute undocumented approvals.

## Chosen strategy

Target: preferred `file`, justified `localhost`, or partial `evidence-only`. Record reused UI, I/O boundaries, fixtures, scenarios, and exclusions. Explain the choice and rejected alternatives with evidence.

## Reconcile with the current project

Record the previous `export_id`, current inventory, and added, retired, or moved views and states. Note contract, style, architecture, and dependency changes outside former roots. Identify needed exporter, workflow, mock, fixture, test, and context adaptations. State cache and evidence impact, pending validation, and obsolete references to remove.

## Changes by file

Actual path | change | reason | risk | check. Mark proposed filenames as proposals until created.

## Implementation sequence

1. Inventory and a safely comparable baseline.
2. Review entry point and adapters without production effects.
3. Scenarios, navigation, flows, and reset.
4. Build, index, and context from one source revision.
5. Tests, privacy, packaging, and clean extraction.
6. Documentation, repeatable command, and delivery receipt.

## Acceptance criteria

- [ ] No visual reinterpretation or production auth bypass.
- [ ] Every included view and state is located and reproducible.
- [ ] Relevant actions use coherent state or declare that they are unavailable.
- [ ] The requested portability target is met and tested.
- [ ] Context, coverage, sources, differences, and limits are complete.
- [ ] Evidence is tied to `export_id` and actual capture conditions.
- [ ] The allowlisted package has no secrets, PII, or checkout dependencies.
- [ ] The ZIP is extracted elsewhere, tested, and verifiable.
- [ ] One implemented command detects state and cache and ends with a ZIP.
- [ ] Configuration and baseline persist and are not replaced after failure.
- [ ] A second invocation reuses the integration without asking for modes again.
- [ ] Local changes, additions, removals, and global invalidation are detected.
- [ ] Reused evidence has provenance; minimum gates are run again.
- [ ] Inventory is compared with current sources, router, and runtime, not copied from an old ZIP.
- [ ] Scripts, entry points, mocks, fixtures, and workflow match current contracts.
- [ ] Discovery outside earlier roots is reviewed and relevant dependencies are included.
- [ ] Retired routes and states do not appear in the new package; others' work is preserved.
- [ ] Reconciliation is current and has no pending differences before the snapshot.
- [ ] Manifest and inventory copy agree on views, states, entries, and sources.
- [ ] Fidelity is compared with the current product; without an observable original it remains unverified.

## Checks run

Command/steps | environment | passed/failed/not-run | evidence | limits.

## Rollback and delivery

Explain how to revert only this integration without touching the user's earlier changes. List modified files, actual command, ZIP, pending work, and differences from the plan.

## Agent-ready reception (v0.4)

- [ ] The current brief was inspected; the ZIP-only `AGENTS.md` does not copy development rules.
- [ ] File index, complete plan, and review schema/contract are included.
- [ ] ZIP and companion brief with the same `export_id` were delivered without user steps.
- [ ] Human-ready guidance was added only if requested, from the same snapshot.
- [ ] Repository-free smoke, links, freshness, and capability fallback were checked or documented.
