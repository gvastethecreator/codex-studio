# ADR 0027: Separate Agent Guides from the Context Glossary

## Estado

Aceptado.

## Contexto

Codex Studio should use `CONTEXT.md`, `AGENTS.md`, and `SKILLS.md` for different purposes. `CONTEXT.md` remains a glossary; `AGENTS.md` should guide everyday repo work, commands, validation, safety boundaries, and Codex documentation alignment; `SKILLS.md` should document specialized workflows such as adding providers, recipe modules, style presets, config surfaces, token audits, and import pipelines.

## Consecuencias

Future documentation updates should avoid copying the same concepts across files. Agent-facing instructions belong in `AGENTS.md`, workflow playbooks belong in `SKILLS.md`, and vocabulary belongs in `CONTEXT.md`.
