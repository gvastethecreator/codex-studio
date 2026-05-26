# ADR 0009: Embedded Image Metadata

## Status

Proposed.

## Context

Generated image files can leave the Studio Library through export or manual sharing. Without embedded metadata, prompt, provider, model, recipe, and generation context can be lost.

## Decision

Support embedding generation metadata into image files where the format allows it, and support extracting that metadata back into catalog records.

## Consequences

- assets remain more self-describing outside the studio;
- future import/recovery flows can reconstruct useful metadata;
- metadata embedding must avoid Provider Secrets and overly large payloads.
