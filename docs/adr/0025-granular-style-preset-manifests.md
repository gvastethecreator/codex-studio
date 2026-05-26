# ADR 0025: Granular Style Preset Manifests

## Status

Accepted.

## Context

Large style preset registries are hard to review, lazy-load, and maintain. Style categories need smaller ownership boundaries.

## Decision

Move toward granular style preset manifests grouped by category or domain. Shared loaders compose the manifests into the catalog exposed to the UI.

## Consequences

- preset updates become smaller and reviewable;
- categories can lazy-load or validate independently;
- loaders must preserve stable IDs and compatibility for existing references.
