# ADR 0023: Studio Settings over Env for Editable Configuration

## Estado

Aceptado.

## Contexto

Editable product configuration belongs in Studio Settings stored with the Studio Library, not in `.env.local`. Environment configuration remains a bootstrap mechanism for values needed before the backend can load settings, such as the initial library path, ports, development flags, and secrets.

## Consecuencias

The configuration UI should read and write Studio Settings through backend APIs and SQLite-backed storage. Agents should avoid changing `.env.local` for normal product preferences and should reserve it for bootstrap or secret-bearing values.
