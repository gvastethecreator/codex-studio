# Security Policy

## Supported versions

Codex Studio is currently an early open-source preview. Security fixes target the default branch until stable releases are published.

## Reporting a vulnerability

Please do not open a public issue for vulnerabilities involving local files, credentials, provider secrets, or generated asset exposure.

Instead, contact the maintainers privately through the repository owner's preferred security channel. Include:

- affected version or commit;
- operating system;
- setup details relevant to the issue;
- reproduction steps;
- impact assessment;
- any logs with secrets removed.

## Local-first security notes

- Provider secrets must stay outside SQLite-backed Studio Settings.
- Do not commit `.env.local`, generated assets, SQLite databases, logs, transcripts, or local library folders.
- Treat Studio Library paths as user-controlled local data.
- Avoid destructive operations on arbitrary paths; import or register External Output Sources first.
