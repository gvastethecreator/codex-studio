# ADR 0021: Store Task Specs and Compile Provider Inputs

## Estado

Aceptado.

## Contexto

Codex Studio stores rich, structured Generation Task Specs for traceability, re-edition, debugging, and provider portability. Each Generation Provider receives a Compiled Provider Input derived from that spec, so Codex can get compact prompts while hosted APIs or local workflows receive direct structured payloads instead of token-heavy prompt translations.

## Consecuencias

Token optimization should focus on provider compilers, not on weakening recipe data. Jobs and catalog metadata should preserve the source spec and, when useful for audit, the compiled provider input that was actually executed.
