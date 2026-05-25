# ADR 0026: Registered Output Sources before File Operations

## Estado

Aceptado.

## Contexto

Codex Studio should not operate destructively on arbitrary filesystem paths. Output directories from Codex, Comfy, or other generators may be detected and registered as External Output Sources, but assets must be imported into a Studio Library before catalog, delete, move, tag, or metadata operations treat them as managed local assets.

## Consecuencias

The settings UI can help discover likely output folders, but file manipulation should stay inside registered libraries and imported assets. This keeps the Image Catalog trustworthy and reduces accidental destructive operations on unmanaged folders.
