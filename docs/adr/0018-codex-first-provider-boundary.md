# ADR 0018: Codex-First Provider Boundary

## Estado

Aceptado.

## Contexto

Codex Studio remains a local-first product centered on `codex app-server`, Codex turns, transcripts, persistent jobs, and the Studio Library. External image systems such as hosted image APIs, fal.ai models, or local Comfy pipelines may be added behind a Provider Boundary, but Codex stays the primary product path instead of becoming one interchangeable provider in a generic multi-provider orchestrator.

## Consecuencias

New providers must emit the same durable local contract as Codex-backed jobs: persistent job state, imported local assets, catalog entries, metadata, logs, and provider diagnostics. Provider-specific SDKs, credentials, retries, and output discovery stay behind backend adapters so the UI and Image Catalog do not fragment by vendor.
