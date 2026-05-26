# ADR 0025: Granular Style Preset Manifests

## Estado

Aceptado.

## Contexto

Style presets should migrate away from large pack YAML files with all presets inline. Each preset should have a granular Style Preset Manifest with stable identity, category, visual DNA, avoid rules, asset references, supported tasks, tags, and versioning, while each Style Pack Manifest stays lightweight and references its preset files.

## Consecuencias

Humans and agents can edit, validate, and review one preset without touching an entire pack. Migration should be incremental: current monolithic packs may be read for compatibility while new tooling and validation target the granular manifest structure.

Implementation note 2026-05-26: the incremental migration completed far enough to retire monolithic migration pack YAML. Normal authoring and validation now operate on granular manifests only; `styles:source:verify` rejects legacy pack YAML if it reappears.
