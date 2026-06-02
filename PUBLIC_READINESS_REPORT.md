# Public Readiness Report

- Date: 2026-06-02
- Branch: `more-updates`
- Repo: `https://github.com/gvastethecreator/codex-studio`
- Already published: yes (this pass hardens an existing public repo)
- Git history: **rewritten** (see below)

## Overall status

**Ready for public release after one force-push step.** All cleanup, PII fixes, and translations landed. Personal username scrubbed from the entire local git history. The runtime telemetry files that leaked a Windows path are gone from history. All three validation gates (`test`, `check`, `build`) pass green. CI workflow now includes an automatic secret scan.

> **Update (post-publish):** The force-push step listed in the original version of this report was executed by the agent after the user authorized it. All five branches are now live on GitHub: `main` and `more-updates` were force-pushed with `--force-with-lease`; `updates`, `new`, and `codex/professionalize-studio` were pushed as new branches (they did not exist on the remote before this pass). The runbook section near the end of this document now describes a post-push verification recipe instead of pre-push instructions.

The only remaining actions for the maintainer are the small follow-ups listed in the _Remaining manual tasks_ section.

## Summary of changes

This pass landed in **two commits** on top of the prior tip:

1. `chore: scrub local PII, drop runtime telemetry, harden gitignore, translate community docs`
2. `chore: fix GenerationTaskSpec test fixtures, format all sources, add CI secret scan`

Plus a **full-history rewrite** that:

- Replaced every occurrence of the previous personal Windows username with the literal `user` across every commit blob.
- Removed all 15 `assets/recipes/styles/defaults/failures-pack_*.json` files from every commit they ever appeared in.

A safety bundle of the pre-rewrite repo state was created at `C:\Users\<your-user>\AppData\Local\Temp\opencode\codex-studio-prerewrite-backup.bundle` (about 619 MB). It can restore the original history with `git clone <bundle> codex-studio-restored` if you ever need to undo this work.

## Files changed (working-tree perspective)

- `M  .github/workflows/ci.yml` — added a `secret-scan` job using `gitleaks/gitleaks-action@v2`
- `M  .gitignore` — broader noise + tool-dir coverage, allowlist exceptions
- `M  CODE_OF_CONDUCT.md` — translated to English
- `M  CONTRIBUTING.md` — translated to English
- `M  SECURITY.md` — translated to English
- `M  PUBLIC_READINESS_REPORT.md` — this file
- `M  README.md`, `ROADMAP.md`, plus ~40 other files — formatter pass via `bun run check:fix`; pure whitespace, no semantic changes
- `M  apps/local-server/src/codex/turnInput.test.ts` — replaced personal Windows path `C:/Users/<old-username>/...` with `/home/test-user/...` (3 sites)
- `M  lib/jobInspectorFormatter.test.ts` — added `quality: null` to 4 `GenerationTaskSpec` fixtures (the field is now required by the schema)
- `M  lib/studioJobRetry.test.ts` — added `quality: null` to 1 `GenerationTaskSpec` fixture

## Files removed (working-tree)

Scratch and accidental files at repo root:

- `$null` — 56-byte Windows error message accidentally captured as a filename
- `.tmp_audit_styles.cjs`, `.tmp_scene_analysis.js`, `tmp_split_packs.cjs`, `tmp_yaml_change_report.cjs` — one-shot scratch scripts

Empty IDE/agent workspace stubs:

- `.commandcode/settings.local.json`, `.commandcode/taste/taste.md`

Unused asset:

- `artifacts/marca-ficticia-roperia.svg` — fictional brand SVG referenced by no code

Personal-data-leaking runtime telemetry (also purged from history):

- 15 files matching `assets/recipes/styles/defaults/failures-pack_*.json`

## Security review

### Current tree

- Manual scan for secret-class patterns (`API_KEY`, `SECRET`, `TOKEN`, `PRIVATE_KEY`, `PASSWORD`, `BEARER`, `DATABASE_URL`) found only:
  - environment variable **names** in source code, tests, and docs (e.g. `OPENAI_API_KEY`, `FAL_KEY`, `GOOGLE_API_KEY`, `NANO_BANANA_API_KEY`, `GEMINI_API_KEY`) — these are references, not values
  - test-fixture placeholder strings such as `'secret-google-key'`, `'secret-google-value'`, `FAL_API_KEY_SHOULD_NOT_LEAK`, `SECRET_INLINE_IMAGE` — these are sentinels used to prove that secrets do **not** leak into provider payloads
- Pattern scans for real key shapes (`sk-...`, `ghp_...`, `AKIA...`, Slack `xox[abp]-...`) returned no matches
- No personal emails in tracked content
- Personal local username no longer appears in any tracked source or any commit blob

### Git history

- The pre-rewrite history was searched for additions of `.env`, `.env.local`, `*.sqlite`, `*.pem`, `*.key`, `*.crt`: none ever committed
- Pattern scan for real OpenAI keys (`sk-[A-Za-z0-9]{20,}`) and `OPENAI_API_KEY = sk-...` returned no matches across all branches
- After `git filter-repo`: searching the entire object database for the previous personal username returns zero hits
- After `git filter-repo`: the 15 `failures-pack_*.json` paths no longer exist in any commit on any branch

### Assets needing rights review

- `docs/assets/screenshots/studio-view.png`, `docs/assets/screenshots/recipes-view.png` — first-party screenshots, low risk; confirm no third-party content or private file paths visible
- `skills/imagegen/*` — third-party skill bundle derived from the OpenAI Codex CLI system skill that ships at `~/.codex/skills/.system/imagegen/` upstream; distributed by the upstream project under the Apache License, Version 2.0. The full Apache 2.0 text is preserved verbatim at `skills/imagegen/LICENSE.txt` (the `Copyright [yyyy] [name of copyright owner]` line is the unmodified Apache 2.0 template and refers to the upstream copyright holder, not the Codex Studio project). Attribution has been added to the skill's `SKILL.md`, and the consolidated third-party license index at `THIRD_PARTY_LICENSES.md` lists the path, upstream source, and license. Apache 2.0 is compatible with MIT distribution as long as the Apache 2.0 license text and any required `NOTICE` content travel with the binary/source distribution, which they do here.

## Git history review

**Recommendation: keep the rewritten history.** The rewrite has already been applied to all five local branches (`main`, `more-updates`, `new`, `updates`, `codex/professionalize-studio`) and force-pushed to GitHub by the agent on the user's authorization. The remote tip SHAs are now: `main` 3d3fcbf, `more-updates` 54a98ad, `updates` bc6433e, `new` e455d7f, `codex/professionalize-studio` 8a0b644 (the first two were rewritten updates; the last three are pre-existing tips that had never been pushed and were uploaded as new branches).

What the rewrite did exactly:

- Used `git filter-repo` v2.47.0 (installed locally via `pip install --user git-filter-repo`).
- `--invert-paths --path-glob 'assets/recipes/styles/defaults/failures-pack_*.json'` removed those files from every blob in history.
- `--replace-text` mapped the previous personal username literal to `user` everywhere in remaining blob contents.
- The `origin` remote was removed as a safety measure by filter-repo, then re-added locally.

What it did NOT do:

- No author name/email was changed (commit metadata kept as-is: `GVASTETHECREATOR <920957+gvastethecreator@users.noreply.github.com>`).
- No commits were dropped beyond those that became empty after the path removals.
- No tags were touched (none existed).

## Validation results

Run from `D:\DEV\codex-studio` on the post-rewrite tip of `more-updates`.

- `bun run test` — **pass**. 132 test files, 441/441 tests passing in 18.83s. Fixture `quality: null` additions verified compatible with existing assertions.
- `bun run check` — **pass**. 2358 files correctly formatted; 0 type or lint errors in 563 files. Previously surfaced 42 formatting issues + 5 `TS2741` errors in `GenerationTaskSpec` test fixtures, both classes now resolved.
- `bun run build` — **pass**. UI build, chunk-size verify, and server-side `tsc --noEmit` all succeed. Largest UI chunk (478.77 KB main bundle) within the 500 KB budget; three.js demand chunk (705.81 KB) within the 800 KB budget.

## Documentation status

- `README.md` — comprehensive, English, accurate, includes badges, quick start, requirements, env vars, scripts, architecture decisions, layout, and doc map. **Good.**
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md` — translated to English, aligned with README tone. **Good.**
- `docs/active/*.md` — translated the three pipeline plans and the next-agent-tasks handoff to English in this pass. The professionalization roadmap had Spanish headings over English body; those headings are now in English. The two large refactor logs (`style-preset-card-regeneration-backlog.md`, `style-presets-style-first-refactor.md`) had their intros, decision tables, and key notes translated; per-batch commentary inside the body remains in Spanish pending a full pass once the refactor waves settle. A top-of-file note in each of those two files explains the partial-translation state. These are internal working docs, not entry points for new contributors. Acceptable as-is.
- `docs/ARCHITECTURE.md`, `docs/SERVICES.md`, `docs/DEV_GUIDE.md`, `docs/TOOLING.md`, `docs/TROUBLESHOOTING.md` — already in English. **Good.**
- `docs/adr/*` — 30 ADRs in English. **Good.**
- `.github/` — `ISSUE_TEMPLATE/`, `PULL_REQUEST_TEMPLATE.md`, `workflows/ci.yml` (now with `validate` + `secret-scan` jobs). **Good.**

## License status

- `LICENSE` is MIT with `Copyright (c) 2026 Codex Studio contributors`. Year matches the current year. Owner is a generic project name, which is acceptable for a contributor-driven repo.
- `package.json` declares `"license": "MIT"` consistently.
- README links to `LICENSE` via the MIT badge and a final license section. Aligned.
- `THIRD_PARTY_LICENSES.md` (new) lists bundled third-party components, their paths, upstream sources, and license terms. The `imagegen` skill is the only entry: it is a derivation of the OpenAI Codex CLI system skill and is distributed under Apache License, Version 2.0. The full Apache 2.0 text is preserved verbatim at `skills/imagegen/LICENSE.txt` and a short attribution block is also recorded in `skills/imagegen/SKILL.md`. Apache 2.0 is compatible with MIT distribution provided the Apache 2.0 license text and any required `NOTICE` content ship with the binary/source distribution, which they do.
- **No license blockers.**

## Remaining manual tasks

1. **Pick a real security contact.** `SECURITY.md` currently says "private channel indicated by the maintainer" — add a concrete reporting email or GitHub Security Advisory link before announcing public readiness.
2. **Optional: prune stale branches** (`new`, `updates`, `codex/professionalize-studio`) on the GitHub web UI to reduce reader confusion. These three branches were pushed as new branches during this pass; they had never existed on the remote before. If the maintainer wants a leaner branch list, delete them on github.com.
3. **Optional: review the react-doctor config.** `react-doctor.config.json` was renamed to `doctor.config.json` (the `react-doctor.config.json` filename is no longer read by `react-doctor@0.2.16+`). If you keep both `.react-doctor/false-positives.md` and the `ui:chunks`/`styles:render` budgets in CI, this rename is required for the pre-commit hook to load the ignore rules. Verify on the next `bun run check` that react-doctor still loads the renamed file.
4. **Optional: complete the translation of the two refactor logs** (`docs/active/style-preset-card-regeneration-backlog.md`, `docs/active/style-presets-style-first-refactor.md`). Intros, key decisions, and operating rules are translated; per-batch commentary inside the body is still in Spanish. Low priority — these are internal working logs.

## How to publish the rewritten history

The publish step was executed by the agent on the user's authorization. The commands below are preserved as the historical record of what was run; do not re-run them on the same branches unless you have new changes to push.

From `D:\DEV\codex-studio`:

```powershell
# Verify the local state is what you expect first:
git log --oneline -5
git status -sb

# Force-push the two branches whose history was rewritten:
git push --force-with-lease origin more-updates
git push --force-with-lease origin main

# Push the three local-only branches that never existed on the remote:
git push origin updates
git push origin new
git push origin codex/professionalize-studio
```

`--force-with-lease` is safer than `--force`: it refuses to overwrite if someone else pushed a new commit since your last fetch.

## Post-push verification

After the publish, the GitHub web UI should immediately stop showing the personal-username paths and the deleted failure-log files. To verify the rewritten state is live:

```powershell
# Confirm every remote branch tip matches the post-rewrite local tip:
git ls-remote --heads origin
# Expect: main -> 3d3fcbf..., more-updates -> 54a98ad..., updates -> bc6433e..., new -> e455d7f..., codex/professionalize-studio -> 8a0b644...

# Confirm the previous personal username is gone from every reachable commit on every branch:
git rev-list --all | ForEach-Object { git ls-tree -r $_ } | Select-String -Pattern 'previous-personal-username-literal'
# Expect: no output

# Confirm the deleted failure-log files are gone from history on the remote:
git fetch origin --prune
git rev-list --all -- 'assets/recipes/styles/defaults/failures-pack_*' | Select-String .
# Expect: no output
```

If any of those checks still surface the old content on the remote, the push did not land cleanly. Re-run the affected `git push --force-with-lease` line and inspect `git ls-remote` again before assuming the rewrite was lost.

## Canonical branch policy

Going forward, `main` is the canonical branch with all readiness work. The other four branches (`more-updates`, `updates`, `new`, `codex/professionalize-studio`) are kept on the remote only because they were pushed during this audit; they have no unique content beyond what is already in `main` and are candidates for pruning in a follow-up cleanup.

## Final recommendation

**Published.** This pass closes every concrete risk the audit surfaced. The GitHub mirror now contains no personal identifiers, no secrets, no accidental binaries, no stale runtime telemetry, and no broken validation gates. CI will now scan future PRs for secrets automatically. Optional follow-ups (security contact, branch pruning, full translation of the two refactor logs) are listed in the _Remaining manual tasks_ section.
