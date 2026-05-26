# ADR 0014: Backend Dependency Injection Seams

## Status

Proposed.

## Context

Backend tests should not require real filesystem paths, child processes, provider credentials, or long-running workers. Hardwired imports make this difficult.

## Decision

Introduce dependency seams for database access, filesystem operations, provider adapters, event bus, logger, clocks, and process supervision. The production app wires real dependencies; tests can inject fakes.

## Consequences

- backend behavior can be tested without starting real services;
- failures can be simulated precisely;
- wiring code becomes explicit and slightly more verbose;
- module boundaries become easier for contributors to understand.
