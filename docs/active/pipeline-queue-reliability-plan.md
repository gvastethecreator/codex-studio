# Plan: reliable queue and early failures

This document leaves a task ready for an agent: make images and jobs enter the queue with valid contracts, fail early when something is wrong, and produce actionable errors. The queue must not discover expensive errors inside the provider if it can detect them beforehand.

## Expected outcome

Before creating or executing a Persistent Job, the system validates the `Generation Task Spec`, references, provider, readiness, and batch/spec ids. Errors like `invalid batchid`, broken image, unconfigured provider, or pathless reference must surface as normalized messages with a clear cause.

## Quick path

1. Add a pure validator for `Generation Task Spec`.
2. Add an assets/references preflight before queue.
3. Normalize queue/backend/provider errors.
4. Expose safe diagnostics in job details.
5. Test with invalid cases and a local `dry_run` smoke.

## Scope

Includes:

- `Local Generation Run`.
- `useQueueManager` and the queue state machine.
- Backend job creation and worker preflight.
- Reference persistence/hydration.
- Provider preflight.
- Error normalization.

Excludes:

- Deleting Studio Library data.
- Changing Catalog Entry as the durable source.
- Executing external providers without real preflight.
- Storing inline images in logs/transcripts.

## Likely files

| Area             | Files                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Frontend queue   | `hooks/useQueueManager.ts`, `lib/queueStateMachine.ts`, `hooks/useGenerationPipeline.ts` |
| Local runner     | `services/localGenerationRun.ts`, `services/localGenerationRun.test.ts`                  |
| Backend routes   | `apps/local-server/src/jobRoutes.ts`, `apps/local-server/src/appFactory.ts`              |
| Worker           | `apps/local-server/src/worker.ts`, `apps/local-server/src/workerCatalogContext.ts`       |
| References       | `apps/local-server/src/referenceManager.ts`                                              |
| Providers        | `apps/local-server/src/providers/*`, `apps/local-server/src/providerPreflight*`          |
| Shared contracts | `packages/shared/src/*`                                                                  |
| Docs             | `SKILLS.md`, `docs/ARCHITECTURE.md`, this file                                           |

## Contracts to enforce

| Contract | Rule                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------- |
| Batch id | Local batch ids use `batch-*`; never raw timestamp-only ids.                                    |
| Spec id  | Generation Task Specs use stable `spec-*` ids.                                                  |
| Provider | Must exist, support the task, and pass preflight before execution.                              |
| Task     | Provider-independent task name; no provider names inside the task.                              |
| Assets   | Inline data must be persisted/hydrated to `localPath` or accepted `sourceUrl` before execution. |
| Catalog  | Completed job writes a Local Asset and a Catalog Entry.                                         |
| Errors   | User sees a normalized cause, not provider stack noise.                                         |

## Work packages

### 1. Generation Task Spec validator

Tasks:

- Create a pure validator near the shared/provider boundary.
- Validate:
  - `id` exists and matches expected prefix/shape;
  - `task` is a known provider-independent task;
  - `providerId` exists;
  - `metadata.batchId` exists for local queued generation;
  - recipe metadata is present when a recipe id exists;
  - assets have valid role/name/source fields;
  - no inline image bytes reach the provider compiled payload unless explicitly allowed.
- Return a structured result:
  - `ok`;
  - `code`;
  - `message`;
  - `field`;
  - `safeDetails`.
- Add tests for valid spec and invalid batch/spec/provider/assets.

Acceptance:

- Invalid spec never reaches provider execution.
- Error is safe to show in UI/job detail.

### 2. Queue preflight before job creation

Tasks:

- In `services/localGenerationRun.ts`, validate config before creating jobs:
  - prompt or valid attachments exist;
  - batch count sane;
  - provider selected;
  - generated `batch-*` id;
  - generated `spec-*` id.
- In the queue manager, snapshot attachments before clearing the composer.
- Ensure edit mode keeps `input` and `mask` assets while text-to-image uses references.
- Add a test for queueing an image-guided job then changing composer attachments.
- Done: Browser Queue jobs persist in IndexedDB across refresh. Browser-only `processing` jobs resume as `pending`; jobs already linked to backend are not re-executed and point users to Backend Session Jobs.
- Done: Browser Queue jobs now keep all linked backend job ids, reconcile against backend summaries/events, let backend terminal state repair stale browser failures, and avoid double-counting linked active jobs in the Command Center.

Acceptance:

- UI queue item owns an immutable generation snapshot.
- User changes after enqueue cannot corrupt a running job.
- Refreshing the browser does not drop pending Browser Queue jobs or duplicate already-created backend jobs.

### 3. Backend reference preflight

Tasks:

- In `referenceManager`, validate before persisting:
  - valid dataUrl syntax;
  - supported mime;
  - filename safe;
  - decoded size under limit;
  - `localPath` exists when provided;
  - `sourceUrl` accepted only for providers that support it.
- Hydrate inline references to `localPath` before provider execution.
- Strip inline bytes after hydration from the job source spec where safe.
- Add tests for:
  - broken dataUrl;
  - unsupported mime;
  - missing `localPath`;
  - valid dataUrl persisted to the references folder.

Acceptance:

- Provider gets local managed references, not broken inline assets.

### 4. Provider preflight gate

Tasks:

- Ensure job creation or worker execution checks provider capability:
  - known provider;
  - has adapter;
  - executable only when runtime requirements pass;
  - task supported;
  - asset roles supported.
- Use the existing `/api/providers/preflight` contract where possible.
- External providers should fail with a clear config action:
  - missing Provider Secret source;
  - missing local endpoint;
  - missing Comfy workflow template;
  - unsupported asset role.

Acceptance:

- Planned/unconfigured providers fail before an expensive turn/network call.

### 5. Error normalization

Tasks:

- Define queue/provider error codes:
  - `invalid_batch_id`;
  - `invalid_task_spec`;
  - `invalid_reference`;
  - `provider_not_configured`;
  - `provider_task_unsupported`;
  - `provider_runtime_unavailable`;
  - `provider_execution_failed`;
  - `catalog_import_failed`.
- Map low-level errors to these codes.
- Keep raw stack in backend logs only if safe.
- Show UI message with:
  - cause;
  - action;
  - job id;
  - provider;
  - no secrets/inline image data.

Acceptance:

- User can fix the issue without reading logs.
- Logs are still enough for developer diagnosis.

### 6. Job detail diagnostics

Tasks:

- Extend job detail payload safely:
  - validation status;
  - provider preflight status;
  - reference count by role;
  - hydrated `localPath` count;
  - compiled input size/hash;
  - catalog write status.
- Add UI display only in a Demand-Mounted Surface or job details, not in the always-on toolbar.
- Keep the Command Center concise.

Acceptance:

- Debug info available on demand.
- Startup/UI bundle not inflated.

### 7. Dry-run smoke suite

Tasks:

- Add a script or test helper that creates `dry_run` jobs for:
  - text-only generation;
  - image reference generation;
  - image edit with input;
  - invalid dataUrl;
  - invalid batch id.
- Use a tiny generated dataUrl in tests.
- Do not write generated images to the repo.
- If the smoke writes Studio Library entries, document that it is local state and not committed.

Acceptance:

- The queue/reference/catalog path can be verified without spending Codex image turns.

## Validation

Focused:

```bash
bun run test -- services/localGenerationRun.test.ts
bun run test -- hooks/useQueueManager.test.ts
bun run test -- apps/local-server/src/referenceManager.test.ts
bun run check -- <changed files>
```

Domain:

```bash
bun run providers:verify
bun run catalog:source:verify
```

Smoke:

```bash
# Use local backend. Prefer dry_run provider to avoid cost.
bun run test -- apps/local-server/src/<dry-run-smoke-test>.test.ts
```

Closeout:

```bash
bun run test
bun run check
bun run build
```

## Manual smoke recipe

Use only when backend is running and no paid provider call is intended:

1. Create a `dry_run` job through `/api/jobs`.
2. Include one 1x1 PNG `dataUrl` reference.
3. Use `metadata.batchId: "batch-smoke-<date>"`.
4. Wait for completed state.
5. Confirm:
   - reference persisted under Studio Library `.studio/references/<jobId>/`;
   - source spec hydrated with `localPath`;
   - one Catalog Entry exists;
   - no `invalid batchid` appears.

## Risks

| Risk                                                | Mitigation                                                                                      |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Validation duplicated frontend/backend              | Put a pure shared validator in shared or a backend-safe module; call from both where practical. |
| Too-strict validation blocks valid provider feature | Validator returns provider-specific capability checks, not universal bans.                      |
| Logs leak paths/assets                              | Keep `safeDetails` small; raw details backend-only and redacted.                                |
| Dry-run smoke mutates local Studio Library          | Document local state, never commit outputs, do not delete without explicit user request.        |

## Done checklist

- [x] Spec validator added in shared generation contracts.
- [ ] Queue preflight added.
- [ ] Backend reference preflight added.
- [ ] Provider preflight enforced before execution.
- [x] Job-route validation errors return normalized `code`, `field`, `reason`, and `issues`.
- [ ] Job detail diagnostics safe and demand-mounted.
- [ ] Dry-run smoke coverage exists.
- [x] `SKILLS.md` updated with queue/reliability workflow.
- [ ] `docs/ARCHITECTURE.md` updated if generation flow changes.
- [x] Focused tests pass for shared contracts and job routes.
- [ ] Broad gates attempted and reported.
