# ADR 0020: Recipe Modules Produce Generation Task Specs

## Estado

Aceptado.

## Contexto

Recipes should become declarative modules that describe reusable generation intent rather than React components that assemble provider-ready prompt text. Each Recipe Module should expose metadata, parameter schema, compatible Generation Tasks and Generation Providers, assets, and a pure builder that produces a provider-independent Generation Task Spec.

## Consecuencias

Generation Providers become responsible for compiling a Generation Task Spec into their own execution format: compact Codex prompt, hosted API request, or local workflow input. This keeps token-heavy Codex prompt construction out of the UI, lets non-Codex providers avoid prompt-only translation, and makes recipes reusable for future tasks such as textures and animated sprites.
