# ADR 0002: Callable App Factory

## Status

Proposed.

## Context

The backend originally performed import-time side effects: loading env files, initializing the Studio Library, creating the Hono app, starting `Bun.serve`, and re-enqueuing jobs. This made isolated tests difficult because importing modules could mutate global process state.

## Decision

Introduce `createStudioApp(options?)` as the explicit backend factory. It creates configuration, database access, event bus, worker dependencies, routes, and shutdown behavior. `index.ts` becomes a thin runtime entry that calls the factory and starts the server.

## Consequences

- backend modules become easier to test;
- lifecycle is explicit instead of import-driven;
- dependencies can be injected in integration tests;
- some singleton modules must be progressively refactored to accept explicit dependencies.
