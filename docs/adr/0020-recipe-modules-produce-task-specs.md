# ADR 0020: Recipe Modules Produce Task Specs

## Status

Accepted.

## Context

Recipes should express product intent without knowing the details of Codex, fal.ai, Gemini, ComfyUI, or future adapters.

## Decision

Recipe modules produce Task Specs: structured prompt fragments, references, constraints, and metadata that the backend can compile into Generation Tasks.

## Consequences

- recipes remain provider-independent;
- recipes can be tested without provider mocks;
- provider adapters receive a consistent task contract.
