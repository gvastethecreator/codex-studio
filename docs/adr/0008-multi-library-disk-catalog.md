# ADR 0008: Multi-Library Disk Catalog

## Status

Proposed.

## Context

The browser visual cache could not be the durable model for generated images. Large JSON blobs in IndexedDB are slow, fragile, and not portable. Users also need explicit local libraries outside the source repo.

## Decision

Introduce a Studio Library model backed by SQLite:

- Library Registry for one or more library roots;
- Image Catalog for durable metadata and search;
- Local Assets served through stable backend URLs;
- Workspaces as views/filters rather than copies of files.

## Consequences

- generated assets are durable on disk;
- metadata can be queried and recovered;
- the UI can paginate and filter catalog entries;
- Visual Batch becomes a compatibility layer instead of the source of truth.
