# Third-Party Licenses

Codex Studio is distributed under the MIT License (see `LICENSE` at the repo root and the `license` field in `package.json`).
A few bundled components are derived from upstream projects under different terms. This file lists them, the path where they live in this repository, and where to find the full license text and upstream attribution.

| Component        | Path in this repo  | Upstream                                                            | License                     | Notes                                                                                                                                                                                                                                                                                                                 |
| ---------------- | ------------------ | ------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `imagegen` skill | `skills/imagegen/` | OpenAI Codex CLI system skill (`~/.codex/skills/.system/imagegen/`) | Apache License, Version 2.0 | Full text preserved verbatim at `skills/imagegen/LICENSE.txt`. The Apache 2.0 boilerplate `Copyright [yyyy] [name of copyright owner]` line is the unmodified upstream template; it refers to the upstream copyright holder, not to the Codex Studio project. Attribution is also recorded in the skill's `SKILL.md`. |

If you add a new bundled component that is not under MIT, update this table in the same commit and keep the full upstream license text next to the component.
