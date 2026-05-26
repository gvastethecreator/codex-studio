# ADR 0019: Separate Generation Task and Provider

## Status

Accepted.

## Context

A generation request contains product intent, references, recipe context, and output expectations. A provider input contains adapter-specific payload details. Mixing both makes switching adapters and testing difficult.

## Decision

Store and pass Generation Task data separately from provider-specific request payloads. Provider adapters compile tasks into their own inputs at execution time.

## Consequences

- persisted jobs remain provider-agnostic;
- provider adapters can evolve independently;
- debugging is clearer because task intent and provider payload are separate artifacts.
