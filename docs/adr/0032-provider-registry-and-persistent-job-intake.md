# ADR 0032: Provider registry and persistent job intake policy

## Status

Accepted.

## Context

Provider identity is currently repeated across capability reporting, runtime preflight, provider input compilers, executors, and worker routing. Job creation also still accepts legacy `codex_imagegen` request shape while the product language now separates Generation Task from Generation Provider.

## Decision

Use one Provider Registry Module as the source of provider facts, and put new backend job creation behind a Persistent Job Intake Module. New intake may accept legacy `codex_imagegen` as a transport compatibility alias, but durable policy must keep Generation Task and Generation Provider separate and keep Provider Secrets outside Studio Settings, job metadata, logs, screenshots, and docs.

## Consequences

- Provider capability, preflight, compiler, executor, and routing callers should derive provider facts from the registry instead of maintaining local lists.
- `POST /api/jobs` should be a thin HTTP Adapter over Persistent Job Intake.
- Legacy stored job rows can remain readable, but new-job policy must be explicit and tested.
- Provider Registry must not expose secret values; readiness can report presence and blocker reasons only.
