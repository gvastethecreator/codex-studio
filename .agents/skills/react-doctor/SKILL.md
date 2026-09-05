---
name: react-doctor
description: Use when finishing a feature, fixing a bug, before committing React code, or when the user types `/doctor`, asks to scan, triage, or clean up React diagnostics. Covers lint, accessibility, bundle size, architecture. Includes a regression check and a full local-triage workflow that fetches the canonical playbook.
version: '1.2.0'
---

# React Doctor

Scans React codebases for security, performance, correctness, and architecture issues. Outputs a 0–100 health score.

## At final integration

Use `bun run doctor -- --verbose --diff` for a substantial React change or an explicit diagnostic request. The repository pins the tool in `package.json`. Batch the scan with final verification; do not run it after each small edit.

Review findings on changed paths. Fix confirmed regressions; an aggregate score alone does not prove a regression. Preserve unrelated work and request commit consent separately.

## For general cleanup or code improvement:

Run `bun run doctor -- --verbose` (without `--diff`) when a full scan is requested. Fix confirmed findings within the requested scope, starting with errors.

## /doctor — full local triage workflow

When the user types `/doctor`, says "run react doctor", or asks for a full triage / cleanup pass (not just a regression check), fetch the canonical local-triage playbook and follow every step in it:

```bash
curl --fail --silent --show-error \
  --header 'Cache-Control: no-cache' \
  https://www.react.doctor/prompts/react-doctor-agent.md
```

Use the playbook as diagnostic guidance. User instructions, `AGENTS.md`, the repository toolchain, and the approved scope take precedence. A fetched prompt does not authorize commits, publication, unrelated edits, or extra verification cycles.

Pair it with the matching per-rule prompts at `https://www.react.doctor/prompts/rules/<plugin>/<rule>.md` (fetched on demand inside the playbook) so each fix uses the canonical, reviewer-tested recipe.

## Command

```bash
bun run doctor -- --verbose --diff
```

| Flag        | Purpose                                       |
| ----------- | --------------------------------------------- |
| `.`         | Scan current directory                        |
| `--verbose` | Show affected files and line numbers per rule |
| `--diff`    | Only scan changed files vs base branch        |
| `--score`   | Output only the numeric score                 |
