# ADR 0030: Provider Secrets outside Studio Settings

## Estado

Aceptado.

## Contexto

Provider credentials and tokens must stay outside SQLite-backed Studio Settings and catalog metadata. Studio Settings may store non-secret provider configuration and expose configured, missing, or invalid state, but secrets such as hosted API keys, remote tokens, or private WebSocket credentials belong in `.env.local` or a future local secret store.

## Consecuencias

Settings UI should never reveal or persist secret values as plain editable preferences. Provider adapters should receive secrets through backend-only configuration and report only validation status to the frontend.
