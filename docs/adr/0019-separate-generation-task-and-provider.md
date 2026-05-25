# ADR 0019: Separate Generation Task and Generation Provider

## Estado

Aceptado.

## Contexto

Persistent Jobs represent the user's generation task, while the selected provider is tracked separately behind the Provider Boundary. This avoids multiplying job kinds across task-provider combinations such as Codex image generation, fal.ai sprite generation, or Comfy texture generation, and keeps recipes modular as the studio expands beyond plain image generation.

## Consecuencias

Job kinds should describe provider-independent tasks, while provider-specific models, credentials, retries, diagnostics, and output discovery live in provider execution config and backend adapters. Existing Codex-specific job kinds can migrate incrementally toward task-oriented names without changing the Image Catalog contract.
