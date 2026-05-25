# ADR 0029: App Server Product Runtime and SDK Automation Surface

## Estado

Aceptado.

## Contexto

Codex Studio keeps `codex app-server` as the Codex Product Runtime for the interactive local app because the product needs sessions, lifecycle supervision, events, readiness, and job-oriented integration. The Codex SDK remains available as a Codex Automation Surface for scripts, audits, migrations, evals, token checks, and maintenance workflows outside the main UI path.

## Consecuencias

Runtime refactors should improve the app-server integration before considering SDK replacement. SDK usage should be introduced first through isolated scripts or tooling where it does not fragment the primary job, asset, transcript, catalog, and diagnostics contracts.
