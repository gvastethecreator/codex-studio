# ADR 0023: Studio Settings over Env for Editable Config

## Status

Accepted.

## Context

Some settings are user-editable product preferences, while others are runtime configuration or secrets. Editing every setting through `.env` is a poor UX; storing secrets in SQLite is unsafe.

## Decision

Use Studio Settings for non-secret editable preferences and runtime endpoints that are safe to persist. Keep Provider Secrets in backend environment or secret stores only.

## Consequences

- users can adjust safe settings from the UI;
- secrets remain out of SQLite-backed settings;
- configuration docs must distinguish editable settings from secret/runtime configuration.
