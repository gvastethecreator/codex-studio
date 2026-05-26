# ADR 0022: Provider Session Contracts and Compact Job Inputs

## Status

Accepted.

## Context

Provider adapters can require session state, runtime readiness, references, and provider-specific options. Passing large ad hoc objects through jobs increases persistence and logging risk.

## Decision

Define compact job inputs and provider session contracts. Jobs should reference persisted assets and Task Specs by ID or small metadata instead of embedding large binary payloads.

## Consequences

- smaller persisted jobs;
- safer logs and diagnostics;
- clearer provider readiness checks;
- adapters must resolve referenced assets through approved backend services.
