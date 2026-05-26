# ADR 0015: Extract 3D Viewport from Camera Recipe

## Status

Proposed.

## Context

Camera/viewport behavior is useful beyond one recipe. Keeping Three.js/R3F viewport code embedded in a recipe makes reuse and performance work harder.

## Decision

Extract a reusable 3D viewport module that owns camera controls, scene setup, object interaction, rendering compatibility, and performance-sensitive updates. The Camera recipe consumes the module rather than owning it.

## Consequences

- 3D behavior can be reused by other recipes;
- performance fixes land in one module;
- recipe code stays focused on product semantics;
- the viewport needs a careful API to avoid leaking Three.js internals everywhere.
