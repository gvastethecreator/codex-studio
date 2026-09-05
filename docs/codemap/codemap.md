# Code map · codex-studio

generated: 2026-09-05T20:08:52Z
commit: 715a8cebe862
scope: .

counts: 20 nodes · 28 edges · 5 flows · 0 unknown

## Modules

- `asset-finalizer` · `apps/local-server/src/workerAssetFinalizer.ts` · service · Resumable asset and catalog finalization
  callers: worker (calls)
  callees: catalog (writes), event-bus (publishes), jobs-db (writes)
  tests: apps/local-server/src/workerAssetFinalizer.test.ts
  entry: apps/local-server/src/workerAssetFinalizer.ts:createWorkerAssetFinalizer

- `catalog` · `apps/local-server/src/catalog.ts` · database · Library catalog truth
  callers: asset-finalizer (writes)
  callees: (none)
  tests: apps/local-server/src/catalog.test.ts, apps/local-server/src/catalogCommands.test.ts, apps/local-server/src/catalogRoutes.test.ts
  entry: apps/local-server/src/catalog.ts:registerCatalogImage

- `event-bus` · `apps/local-server/src/events.ts` · service · Revisioned job and catalog events
  callers: asset-finalizer (publishes), event-routes (subscribes), worker (publishes)
  callees: (none)
  tests: apps/local-server/src/eventStreamRoutes.test.ts, apps/local-server/src/events.test.ts
  entry: apps/local-server/src/events.ts:publishEvent

- `event-routes` · `apps/local-server/src/eventStreamRoutes.ts` · interface · Bounded SSE delivery and revision handshake
  callers: job-observer (subscribes)
  callees: event-bus (subscribes)
  tests: apps/local-server/src/eventStreamRoutes.test.ts
  entry: apps/local-server/src/eventStreamRoutes.ts:createEventStreamRoutes

- `generation-run` · `services/localGenerationRun.ts` · service · Persistent generation observation and catalog results
  callers: generation-ui (calls)
  callees: job-client (calls), job-observer (calls)
  tests: services/localGenerationRun.stream.test.ts, services/localGenerationRun.test.ts, services/localGenerationRun.workspace.test.ts
  entry: services/localGenerationRun.ts:runLocalGeneration

- `generation-ui` · `hooks/useGenerationPipeline.ts` · interface · User generation lifecycle
  callers: (none)
  callees: generation-run (calls)
  tests: hooks/useGenerationPipeline.test.ts
  entry: hooks/useGenerationPipeline.ts:useGenerationPipeline

- `job-client` · `services/studio-api/jobs.ts` · service · Browser job and atomic batch API
  callers: generation-run (calls), job-history (calls), job-observer (calls)
  callees: job-routes (calls)
  tests: (none)
  entry: services/studio-api/jobs.ts:createStudioJobBatch

- `job-history` · `hooks/useJobHistory.ts` · interface · Open jobs and filtered terminal history
  callers: (none)
  callees: job-client (calls)
  tests: hooks/useJobHistory.test.tsx
  entry: hooks/useJobHistory.ts:useJobHistory, components/QueuePanel.tsx:QueuePanel, components/QueueBatchCard.tsx:QueueBatchCard

- `job-intake` · `apps/local-server/src/persistentJobIntake.ts` · service · Prepare all requests before acceptance and dispatch
  callers: job-routes (calls)
  callees: jobs-db (writes), runtime-settings (calls), shared (calls), worker (calls)
  tests: apps/local-server/src/persistentJobIntake.test.ts
  entry: apps/local-server/src/persistentJobIntake.ts:createPersistentJobIntake

- `job-observer` · `services/studioEventSource.ts` · service · Shared event connection and job reconciliation
  callers: generation-run (calls)
  callees: event-routes (subscribes), job-client (calls)
  tests: services/studioEventSource.test.ts
  entry: services/studioEventSource.ts:watchJob

- `job-routes` · `apps/local-server/src/jobRoutes.ts` · interface · Job intake, inspection and actions
  callers: job-client (calls)
  callees: job-intake (calls), jobs-db (reads), shared (imports), worker (calls)
  tests: apps/local-server/src/jobRoutes.test.ts
  entry: apps/local-server/src/jobRoutes.ts:createJobRoutes, apps/local-server/src/jobBatchRoutes.ts:createJobBatchRoutes

- `jobs-db` · `apps/local-server/src/db/jobs.ts` · database · Durable jobs, batch membership, attempts and checkpoints
  callers: asset-finalizer (writes), job-intake (writes), job-routes (reads), worker (writes)
  callees: (none)
  tests: apps/local-server/src/db/jobs.test.ts
  entry: apps/local-server/src/db/jobs.ts:updateJobStatus, apps/local-server/src/db/jobBatches.ts:createJobBatch

- `providers` · `apps/local-server/src/providers` · service · Provider execution adapters and runtime identity
  callers: worker (calls)
  callees: shared (calls)
  tests: apps/local-server/src/providers/comfyExecutor.test.ts, apps/local-server/src/providers/codexProvider.test.ts, apps/local-server/src/providers/externalProvider.test.ts
  entry: apps/local-server/src/providers/externalProvider.ts:createExternalGenerationProvider, apps/local-server/src/providers/comfyExecutor.ts:createComfyWorkflowExecutor, apps/local-server/src/providers/codexProvider.ts:createCodexGenerationProvider

- `runtime-settings` · `apps/local-server/src/providers/runtimeConfig.ts` · service · Provider readiness and configuration
  callers: job-intake (calls)
  callees: (none)
  tests: apps/local-server/src/providers/runtimeConfig.test.ts
  entry: apps/local-server/src/providers/runtimeConfig.ts:getExternalProviderRuntimePreflight

- `shared` · `packages/shared/src` · module · Provider-independent domain and API contracts
  callers: job-intake (calls), job-routes (imports), providers (calls)
  callees: (none)
  tests: (none)
  entry: packages/shared/src/jobBatches.ts:JobStatus, packages/shared/src/codexExecutionContract.ts:resolveCodexExecutionPolicy

- `style-client` · `services/studio-api/userStyles.ts` · service · User style API
  callers: style-editor (calls), styles (calls)
  callees: style-routes (calls)
  tests: (none)
  entry: services/studio-api/userStyles.ts:createUserStylePreset

- `style-editor` · `components/recipes/UserStyleEditorSurface.tsx` · interface · User style draft and save session
  callers: styles (calls)
  callees: style-client (calls)
  tests: (none)
  entry: components/recipes/UserStyleEditorSurface.tsx:UserStyleEditorSurface

- `style-routes` · `apps/local-server/src/userStyleRoutes.ts` · interface · Persistent user style CRUD
  callers: style-client (calls)
  callees: (none)
  tests: apps/local-server/src/userStyleRoutes.test.ts
  entry: apps/local-server/src/userStyleRoutes.ts:createUserStyleRoutes

- `styles` · `components/recipes/StylesBrowser.tsx` · interface · Style browsing and selected composition
  callers: (none)
  callees: style-client (calls), style-editor (calls)
  tests: (none)
  entry: components/recipes/StylesBrowser.tsx:StylesBrowser

- `worker` · `apps/local-server/src/worker.ts` · queue · Execution, cancellation and recovery ownership
  callers: job-intake (calls), job-routes (calls)
  callees: asset-finalizer (calls), event-bus (publishes), jobs-db (writes), providers (calls)
  tests: apps/local-server/src/workerShutdown.test.ts, apps/local-server/src/workerAssetFinalizer.test.ts, apps/local-server/src/workerRouting.test.ts
  entry: apps/local-server/src/worker.ts:createWorkerController

## Edges

- asset-finalizer -> catalog · writes
- asset-finalizer -> event-bus · publishes
- asset-finalizer -> jobs-db · writes
- event-routes -> event-bus · subscribes
- generation-run -> job-client · calls
- generation-run -> job-observer · calls
- generation-ui -> generation-run · calls
- job-client -> job-routes · calls
- job-history -> job-client · calls
- job-intake -> jobs-db · writes
- job-intake -> runtime-settings · calls
- job-intake -> shared · calls
- job-intake -> worker · calls
- job-observer -> event-routes · subscribes
- job-observer -> job-client · calls
- job-routes -> job-intake · calls
- job-routes -> jobs-db · reads
- job-routes -> shared · imports
- job-routes -> worker · calls
- providers -> shared · calls
- style-client -> style-routes · calls
- style-editor -> style-client · calls
- styles -> style-client · calls
- styles -> style-editor · calls
- worker -> asset-finalizer · calls
- worker -> event-bus · publishes
- worker -> jobs-db · writes
- worker -> providers · calls

## Unknown

- none

## Flows

- User starts generation
  generation-ui -> generation-run -> job-client -> job-routes -> job-intake -> worker -> providers
  Every batch member is accepted before dispatch and uses its captured execution policy
- Observer attaches or recovers its connection
  generation-run -> job-observer -> job-client -> job-routes -> jobs-db
  Observer reads durable job truth independently of event delivery
- User opens Queue or pages terminal history
  job-history -> job-client -> job-routes -> jobs-db
  All open work remains visible beside terminal history and authoritative counts
- Worker resumes a persisted finalization checkpoint
  worker -> asset-finalizer -> catalog
  Existing asset is finalized into catalog truth
- User opens a style draft and saves
  styles -> style-editor -> style-client -> style-routes
  User style changes persist through the existing API
