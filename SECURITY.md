# Security policy

## Supported versions

Codex Studio is in an open-source preview stage. Security fixes are applied on the main branch as long as no stable releases exist.

## Reporting vulnerabilities

Do not open public issues for vulnerabilities that involve local files, credentials, Provider Secrets, or asset exposure.

Report privately through the maintainer's private channel and include:

- affected commit or version
- operating system
- steps to reproduce
- expected vs observed impact
- sanitized logs (no secrets)

## Local-first security notes

- Provider Secrets must stay outside Studio Settings persisted in SQLite.
- Never commit `.env.local`, SQLite databases, logs, transcripts, or local library folders.
- Treat Studio Library paths as user-controlled data.
- Avoid destructive operations on arbitrary paths: register or import External Output Sources first.
