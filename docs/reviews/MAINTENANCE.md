# Maintenance review

Date: 2026-08-09.

- Bun remains explicit and frozen at 1.3.14; `bun outdated` and `bun audit` are clean.
- `styles:verify` now includes the provider-variant provenance gate, so a release check cannot ignore missing, malformed, or failed Grok card variants.
- VS Code tasks use frozen installation and expose short Styles and variant checks.
- README, dependency guidance, architecture notes, ignore rules, and review indexes now agree with real commands.
- The only initial global check failure was formatting in the prior performance report; it was repaired without broad source rewriting.
- Generated build, logs, temporary type state, and scratch browser evidence are cleanup candidates. Studio Library data, secrets, authored assets, and active provider variants are protected.
