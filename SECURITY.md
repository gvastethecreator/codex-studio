# Security policy

## Supported versions

Codex Studio is in open-source preview. Security fixes land on the `main` branch until a stable release exists.

## Reporting vulnerabilities

Do not open public issues for vulnerabilities that involve local files, credentials, Provider Secrets, or asset exposure.

Report in private through the maintainer private channel. Include:

- affected commit or version
- operating system
- steps to reproduce
- expected impact and observed impact
- sanitized logs with no secrets

## Local-first notes

- Keep Provider Secrets outside Studio Settings that persist in SQLite.
- Never commit `.env.local`, SQLite databases, logs, transcripts, or local library folders.
- Treat Studio Library paths as user-controlled data.
- Do not operate on arbitrary paths. Register or import External Output Sources first.
