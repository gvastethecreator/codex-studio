# Domain docs

Read these documents before you explore or change Codex Studio:

- Read `CONTEXT.md` for canonical product terms.
- Read `docs/ARCHITECTURE.md` for the current system shape.
- Read the relevant files under `docs/adr/` for accepted decisions.
- Read `SKILLS.md` for provider, recipe, preset, output, storage, and setup workflows.

## Layout

Codex Studio uses one domain context:

```text
/
├── CONTEXT.md
├── docs/
│   ├── ARCHITECTURE.md
│   └── adr/
└── SKILLS.md
```

Use the terms from `CONTEXT.md` in Issues, plans, tests, and implementation notes. Do not replace a canonical term with a synonym that the glossary rejects.

If a proposal conflicts with an ADR, name the ADR and the conflict. Do not replace the accepted decision in silence.

If a needed term is missing, record the gap for a focused domain review. Do not expand `CONTEXT.md` during unrelated work.
