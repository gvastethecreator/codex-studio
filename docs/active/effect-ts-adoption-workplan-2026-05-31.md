# Effect-TS adoption workplan (full task backlog)

Date: 2026-05-31
Source analysis: `docs/architecture/architecture-review-effect-ts-2026-05-31.md`

## Objective

Adopt Effect-TS incrementally in Codex Studio to improve reliability, typed errors, retry/timeout semantics, and boundary validation without breaking public APIs.

## Rollout strategy

- Prefer thin vertical slices (AFK-first) over big-bang rewrites.
- Keep existing external contracts stable while migrating internals.
- Validate each slice with focused tests + `bun run check` on touched surfaces.

## Task backlog (complete)

### Slice 01 - Provider retry runtime seam with Effect (AFK)

- **Status**: Implemented (phase 1 complete)
- **Scope**:
  - Refactor provider retry runtime in `apps/local-server/src/providers/externalProviderResults.ts`.
  - Keep current function signature and behavior for callers (`fal`, `google`, `comfy`).
- **Acceptance criteria**:
  - [x] Retry logic still retries transient failures and stops on abort.
  - [x] Existing provider results tests pass.
  - [x] No API changes required for executors.
- **Blocked by**: None.

### Slice 02 - `POST /jobs` boundary schema validation pilot (AFK)

- **Status**: Implemented (phase 1 complete)
- **Scope**:
  - Add Effect Schema decoding at route boundary in `apps/local-server/src/jobRoutes.ts`.
  - Return explicit 400 payloads for malformed JSON and schema mismatch.
- **Acceptance criteria**:
  - [x] Malformed JSON returns `code: invalid_json`.
  - [x] Schema mismatch returns `code: invalid_request_body`.
  - [x] Existing happy path tests remain green.
- **Blocked by**: None.

### Slice 03 - Shared provider retry policy module (AFK)

- **Status**: Implemented (phase 1).
- **Scope**:
  - Extract retry policy primitives (`retryable status`, delay strategy, stop conditions) into a reusable module under providers.
  - Wire `falExecutor.ts`, `googleExecutor.ts`, `comfyExecutor.ts` to consume policy.
- **Acceptance criteria**:
  - [x] All hosted providers use the shared policy.
  - [x] Backoff behavior is centrally configurable.
  - [x] Existing provider tests pass unchanged or with minimal updates.
- **Blocked by**: Slice 01.

### Slice 04 - Worker orchestration typed error channel (AFK)

- **Status**: In progress (phase 1).
- **Scope**:
  - Introduce typed domain errors in `apps/local-server/src/worker.ts`.
  - Consolidate timeout/cancel/retry semantics under Effect runtime internally.
- **Acceptance criteria**:
  - [x] Queue processing lifecycle remains behavior-compatible.
  - [x] Cancellation and terminal state transitions keep current semantics.
  - [x] Targeted worker tests cover typed failure paths.
- **Blocked by**: Slice 03 (recommended), not hard.

### Slice 05 - Codex turn pipeline unification (AFK)

- **Status**: In progress (phase 1).
- **Scope**:
  - Refactor `apps/local-server/src/codex/turn.ts` internals into one Effect pipeline.
  - Standardize transient vs terminal errors and retry policy.
- **Acceptance criteria**:
  - [x] Session invalidation/recovery behavior preserved.
  - [x] Abort and retry paths are deterministic and tested.
  - [x] No public API changes for callers.
- **Blocked by**: Slice 04 preferred.

### Slice 06 - RPC client reconnect/waiter lifecycle hardening (AFK)

- **Status**: In progress (phase 1).
- **Scope**:
  - Migrate `apps/local-server/src/codex/rpcClient.ts` connection and notification waiting internals to Effect-based runtime semantics.
- **Acceptance criteria**:
  - [x] Reconnect behavior remains stable.
  - [x] Waiter cleanup is deterministic on close/abort.
  - [x] Existing rpc-related tests pass.
- **Blocked by**: Slice 05 preferred.

### Slice 07 - Local generation run typed runtime pipeline (AFK)

- **Status**: In progress (phase 1).
- **Scope**:
  - Refactor `services/localGenerationRun.ts` and adapters into typed outcome pipeline.
- **Acceptance criteria**:
  - [x] `cancelled` / `failed` / `timeout` outcomes are explicit and stable.
  - [x] Hook consumers keep existing interface.
  - [x] No behavior drift in successful generation path.
- **Blocked by**: Slice 02 (schema pilot lessons), optional.

### Slice 08 - SSE client/server stream lifecycle consolidation (AFK)

- **Status**: In progress (phase 1).
- **Scope**:
  - Consolidate reconnection/heartbeat/cancel policies across:
    - `apps/local-server/src/eventStreamRoutes.ts`
    - `services/studioEventSource.ts`
- **Acceptance criteria**:
  - [x] Event stream recovers cleanly from transient disconnects.
  - [x] Keepalive and watcher stop behavior are deterministic.
  - [x] No regressions in Local Studio Sync behavior.
- **Blocked by**: Slice 04 and Slice 06 preferred.

### Slice 09 - App-server process supervision resource scoping (AFK)

- **Status**: In progress (phase 1).
- **Scope**:
  - Harden process lifecycle in `apps/local-server/src/codex/processSupervisor.ts` with explicit acquisition/release semantics.
- **Acceptance criteria**:
  - [x] Startup timeout and failure causes become explicit.
  - [x] Teardown is deterministic in tests.
  - [x] No regression in app-server startup path.
- **Blocked by**: Slice 05 preferred.

### Slice 10 - Local codex session typed fallback causes (AFK)

- **Status**: In progress (phase 1).
- **Scope**:
  - Improve cause taxonomy and fallback handling in `apps/local-server/src/codex/localCodexSession.ts`.
- **Acceptance criteria**:
  - [x] Distinct fallback causes are mapped consistently.
  - [x] Ready/offline messaging remains behavior-compatible.
  - [x] Related tests include cause differentiation.
- **Blocked by**: None.

### Slice 11 - Tooling scripts runtime standardization (AFK)

- **Status**: In progress (phase 1).
- **Scope**:
  - Apply Effect-based retry/timeout/concurrency utilities in:
    - `scripts/generate-style-defaults.ts`
    - `scripts/style-default-utils.ts`
    - `scripts/evaluate-recipe-prompts-live.ts`
- **Acceptance criteria**:
  - [x] Script retries and timeout policies are centralized.
  - [x] Output/report contracts remain unchanged.
  - [x] Tooling scripts remain Bun-compatible.
- **Blocked by**: Slice 03 preferred.

### Slice 12 - Expand schema boundary coverage to remaining routes (AFK)

- **Status**: Implemented (phase 1 complete).
- **Scope**:
  - Roll out Schema-based boundary decoding to:
    - `settingsRoutes.ts`
    - `outputSourceRoutes.ts`
    - `projectRoutes.ts`
    - `librariesRoutes.ts`
- **Acceptance criteria**:
  - [x] Input validation errors are consistent across routes.
  - [x] Route semantics stay backwards-compatible.
  - [x] Route tests cover malformed and shape-invalid payloads.
- **Blocked by**: Slice 02.

## HITL checkpoints

### HITL-01 - Error taxonomy approval

- **Scope**: approve worker/codex/provider error categories surfaced to UI/logs.
- **Needed before**: full rollout of Slices 04-06.

### HITL-02 - Validation error payload contract

- **Scope**: confirm standardized error payload shape for all route boundary decode failures.
- **Needed before**: Slice 12 broad rollout.

### HITL-03 - Observability fields standard

- **Scope**: confirm mandatory structured log fields for retry/timeout/cancel events.
- **Needed before**: Slices 03, 04, 11 completion.

## Immediate implementation order (started now)

1. Slice 01 (provider retry seam) ✅ started.
2. Slice 02 (`POST /jobs` schema pilot) ✅ started.
3. Run focused tests and check on touched files.
4. If green, continue with Slice 03 extraction.

## Non-goals for this rollout

- Rewriting presentation-only React components to Effect.
- Replacing pure utility modules that already have low complexity.
- Breaking current local API contracts.

## Validation protocol per slice

- Focused tests for touched files first.
- Project check for touched files.
- Fast gate (`bun run validate:fast`) before stacking next large slice.
