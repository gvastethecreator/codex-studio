# ADR 0030: Provider Secrets outside Studio Settings

## Status

Accepted.

## Context

Optional providers may require API keys or other credentials. Studio Settings are SQLite-backed and user-visible enough that they should not be treated as a secret store.

## Decision

Provider Secrets must stay outside Studio Settings, catalog metadata, logs, transcripts, screenshots, and documentation. Use backend environment variables or an approved OS/secret-store integration.

## Consequences

- accidental leakage risk is reduced;
- open-source docs can describe variables without including real values;
- readiness checks may report whether a secret is configured, but never reveal the value or endpoint contents.
