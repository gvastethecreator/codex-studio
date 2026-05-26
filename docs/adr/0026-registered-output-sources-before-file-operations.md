# ADR 0026: Registered Output Sources before File Operations

## Status

Accepted.

## Context

The app can import files from external local folders, but unrestricted filesystem operations are risky and confusing. Users need explicit control over trusted folders.

## Decision

Require External Output Sources to be registered before the backend scans, imports, or copies files from them.

## Consequences

- file operations are explicit and auditable;
- accidental destructive operations on arbitrary folders are avoided;
- UI flows must guide users to register a source before import actions.
