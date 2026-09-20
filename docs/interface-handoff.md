# Interface handoff

Local review export for Codex Studio. The product UI is the source of truth.

## Command

```bash
bun run handoff:export
```

That command fails if current-interface reconciliation is unresolved. `$interface-handoff` inspects the live UI, adapts this integration, then runs the command.

## Layout

- `.interface-handoff/config.json` — identity, roots, target (`localhost`)
- `scripts/interface-handoff/inventory.json` — current views and states
- `review/` — demo entry, in-memory adapters, scenarios, hideable review chrome
- `vite.handoff.config.ts` — aliases production IO to demo adapters
- `scripts/interface-handoff/scripts/` — copied pack/reconcile/delivery helpers
- `artifacts/interface-handoff/` — staging and ZIP (gitignored)

## Demo boundary

The review build imports the real React shell. HTTP, SSE, asset URLs, IndexedDB, and style thumbnail catalogs are replaced. Generation, jobs, catalog, settings, and auth are in-memory fixtures. Style card thumbnails use a shared placeholder instead of the full webp pack.

Target is `localhost`: Vite emits ES modules, so `file://` is not a verified opener. Serve the extracted ZIP with a static loopback server; do not start `bun run dev` or the local backend.

## Audit scenarios (2026-09-20)

The scenario selector includes catalog failure, jobs needing review, failure, cancellation, retry, partial batches, partial animation playback, and a controlled WebGL initialization failure. All of these are simulated. A review result is not evidence that a provider generated that image.

Batch submission preserves each item and its request ID. Job records, returned catalog entries, prompts, recipe parameters, workspaces, batch IDs, attempts, and timestamps stay correlated. A repeated request ID returns the existing batch. The demo uses the shared task validator before accepting a request. Style thumbnails remain placeholders; inspect production cards for visual acceptance. Manrope uses the same stylesheet as the application.

Run the review without a backend with `bunx --no-install vite --config vite.handoff.config.ts --host 127.0.0.1 --port 17225`, then open `/review/index.html`. Each scenario can be reset from the review panel.
