# Roadmap

Codex Studio is moving toward a polished open-source preview while staying local-first, Codex-first, and library-backed.

## Current Focus

1. Make first run easier to understand and recover.
2. Finish the catalog-first transition for generated assets.
3. Improve diagnostics for jobs, storage, providers, and Codex session readiness.
4. Keep the desktop path credible without making packaging the center of the project.
5. Prepare a small, presentable release candidate.

## What Works Today

- Local assets, logs, transcripts, and SQLite state live in a Studio Library outside the repo.
- The main flow runs through `codex app-server` and does not require `OPENAI_API_KEY`.
- Jobs, events, transcripts, and catalog entries are traceable.
- Generation Tasks and Generation Providers are separate concepts.
- Recipe Modules and Style Preset Manifests are becoming the durable authoring surface.

## Phases

| Phase | Goal                          | Expected result                                  |
| ----- | ----------------------------- | ------------------------------------------------ |
| 0     | Stabilize the current shell   | Clearer navigation and global state              |
| 1     | Finish catalog-first behavior | UI aligned around SQLite and Image Catalog truth |
| 2     | Improve operations            | Common failures produce actionable diagnostics   |
| 3     | Harden setup and portability  | Smoother Windows/macOS/Linux development setup   |
| 4     | Release candidate             | Public repo is clear, safe, and reproducible     |

## Near-Term Priorities

- Improve onboarding and error messages.
- Strengthen job recovery and detail views.
- Reduce orchestration debt in shell code.
- Keep validation focused during iteration and complete at closeout.
- Keep public docs short, current, and easy to scan.

## Release Candidate Checklist

- [ ] Fresh checkout can run `bun run studio:init`.
- [ ] `bun run dev` starts UI and backend.
- [ ] `/api/health` reports local backend status.
- [ ] UI shows useful readiness state when Codex auth is missing.
- [ ] Public docs, troubleshooting, and contributing notes agree with current scripts.
- [ ] No local DBs, logs, transcripts, secrets, or Studio Library assets are committed by mistake.

## Non-Goals For Now

- Turning Codex Studio into a hosted SaaS.
- Making API keys mandatory for the default Codex flow.
- Publishing it as a reusable npm library.
