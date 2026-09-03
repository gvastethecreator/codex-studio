# Project tracker: GitHub plus local mirrors

GitHub Issues and the linked GitHub Project hold live work state. Local Markdown files hold expanded briefs, decisions, evidence, and handoffs.

## Identity

- Repository: `gvastethecreator/codex-studio`
- Project owner: `gvastethecreator`
- Project number: `8`
- Project title: `Codex Studio`
- Project URL: `https://github.com/users/gvastethecreator/projects/8`
- Local root: `.scratch/codex-studio/`

## Authority

- GitHub owns open or closed state, assignees, comments, native dependencies, labels, and Project fields.
- Local files own expanded task context, decisions, verification evidence, and offline handoffs.
- Shared fields must match. These fields include title, category, triage state, execution state, source, dependencies, acceptance criteria, and outcome.
- Do not copy the full GitHub comment history into local files. Record durable decisions and proof under `## Sync log`.

## Local layout

- Spec: `.scratch/codex-studio/spec.md`
- Ticket mirrors: `.scratch/codex-studio/issues/<NN>-<slug>.md`
- Rejected requests: `.scratch/codex-studio/out-of-scope/<concept>.md`
- Execution state: `.scratch/planning/`
- Decision maps: `.scratch/wayfinder/<effort-slug>/`
- Hygiene archive: `.scratch/archive/<YYYY-MM-DD>-<slug>/`

Each ticket mirror starts with these fields:

```markdown
# <NN>: <title>

GitHub issue: <url-or-pending>
GitHub project: https://github.com/users/gvastethecreator/projects/8
Sync: pending | synced | conflict
Last synced: <ISO-8601-or-never>
Remote updated: <ISO-8601-or-unknown>
Category: bug | enhancement
Status: needs-triage | needs-info | ready-for-agent | ready-for-human | wontfix
Project status: Todo | In Progress | Done
Execution: queued | active | blocked | finished
Type: AFK | HITL
Source: <spec path, issue URL, or conversation>
Blocked by: <GitHub issue numbers or None>
```

## Sync protocol

1. Read the Issue, Project item, and local mirror before a remote change.
2. If both surfaces changed after `Last synced`, set `Sync: conflict` and stop.
3. Write the local draft with `Sync: pending` before remote creation.
4. Create or update the GitHub Issue. Reuse its stored URL on retry.
5. Add the Issue to Project `8` and set `Status`.
6. Update local identifiers, shared fields, timestamps, and `Sync: synced`.
7. If one step fails, keep successful work and record the failed step under `## Sync log`.

Never create a replacement Issue because Project insertion, field editing, or local patching failed.

## Workflow

- A spec uses category `enhancement`, triage label `ready-for-agent`, workflow label `spec`, and Project status `Todo`.
- Starting work assigns the Issue, sets Project status to `In Progress`, and sets local `Execution: active`.
- Verified completion posts proof, closes the Issue, sets Project status to `Done`, and sets local `Execution: finished`.
- A blocker keeps the Issue open and sets local `Execution: blocked`.
- Remote writes require a complete mutation preview and explicit user approval.
