# ADR 0006: Workspace as canonical scope

## Status

Accepted

## Context

Project, SQLite workspaces, and IndexedDB workspaces all claimed organization ownership.

## Decision

Workspace is the only user-visible durable organization entity. Persistent Jobs and Catalog Entries carry `workspace_id`. Project is retired from product paths.

## Consequences

- Generate uses `workspaceId`, not Project list APIs.
- IndexedDB may keep drafts, not durable workspace ownership.
