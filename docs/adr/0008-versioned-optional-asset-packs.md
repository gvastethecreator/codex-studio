# ADR 0008: Versioned optional asset packs

## Status

Accepted

## Context

In-repo visual assets are large and grow with style packs.

## Decision

Keep a small Core Asset Set in Git. Distribute optional packs as versioned bundles with sha256 verification outside normal history rewrite until installers exist.

## Consequences

- `repo:assets:audit` reports size and top files.
- Git history rewrite waits until pack install is proven.
