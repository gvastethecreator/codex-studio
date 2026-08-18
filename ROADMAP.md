# Roadmap

Codex Studio moves toward a polished open-source preview. It stays local-first, Codex-first, and library-backed.

## Current focus

1. Make first run easier to understand and recover.
2. Keep generated assets catalog-first. Keep the generation lifecycle Persistent-Job-first.
3. Improve diagnostics for jobs, storage, providers, and Codex session readiness.
4. Keep the desktop path credible. Do not make packaging the center of the project.
5. Prepare a small release candidate.

## What works today

- Local assets, logs, transcripts, and SQLite state live in a Studio Library outside the repo.
- The main flow runs through `codex app-server` and does not need `OPENAI_API_KEY`.
- Jobs, events, transcripts, and catalog entries are traceable.
- The browser shows Catalog Entries and one backend-owned Persistent Job lifecycle.
- Generation Tasks and Generation Providers are separate concepts.
- Optional Grok Imagine jobs reuse the signed-in Grok Build CLI. Codex stays the default runtime. Styles supports both providers.
- Recipe Modules and Style Preset Manifests are the durable authoring surface.

## Phases

| Phase | Goal                          | Expected result                                |
| ----- | ----------------------------- | ---------------------------------------------- |
| 0     | Stabilize the current shell   | Clearer navigation and global state            |
| 1     | Finish catalog-first behavior | UI aligned with SQLite and Image Catalog truth |
| 2     | Improve operations            | Common failures produce useful diagnostics     |
| 3     | Harden setup and portability  | Smoother Windows, macOS, and Linux setup       |
| 4     | Release candidate             | Public repo is clear, safe, and reproducible   |

## Near-term priorities

- Improve onboarding and error messages.
- Strengthen job recovery and detail views.
- Reduce orchestration debt in shell code.
- Keep validation focused during iteration. Run the full gate at closeout.
- Keep public docs short and current.

## Release candidate checklist

- [ ] A fresh checkout can run `bun run studio:init`.
- [ ] `bun run dev` starts the UI and the backend.
- [ ] `/api/health` reports local backend status.
- [ ] The UI shows a useful readiness state when Codex auth is missing.
- [ ] Public docs, troubleshooting, and contributing notes match current scripts.
- [ ] No local DBs, logs, transcripts, secrets, or Studio Library assets are committed by mistake.

## Not now

- Turn Codex Studio into hosted SaaS.
- Make API keys mandatory for the default Codex flow.
- Publish this app as a reusable npm library.
