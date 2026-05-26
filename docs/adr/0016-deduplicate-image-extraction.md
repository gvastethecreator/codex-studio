# ADR 0016: Deduplicate Image Extraction

## Status

Proposed.

## Context

Image extraction and normalization can appear in provider adapters, catalog import, metadata recovery, and UI helpers. Duplicate extraction paths drift and create format-specific bugs.

## Decision

Centralize image extraction into a shared service that accepts provider output or external files, extracts usable image payloads, normalizes metadata, and writes Local Assets through the Studio Library contract.

## Consequences

- fewer format-specific bugs;
- provider adapters stay thinner;
- import and generation can share validation behavior;
- the shared service must be careful not to log secrets or massive payloads.
