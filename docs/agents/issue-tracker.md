# Project tracker: GitHub plus local mirrors

GitHub Issues and the linked GitHub Project hold live work state. Local Markdown files hold synchronized briefs, decisions, evidence, and handoffs.

## Identity

- Repository: `gvastethecreator/codex-studio`
- Project owner: `gvastethecreator`
- Project number: `8`
- Project title: `Codex Studio`
- Project URL: <https://github.com/users/gvastethecreator/projects/8>
- Local root: `.scratch/codex-studio/`

## Authority

- GitHub owns open or closed state, assignees, comments, native dependencies, labels, and Project field values.
- Local files own expanded task context, decisions, proof, and offline handoff notes.
- Shared fields must match: title, category, triage state, execution state, source, dependencies, acceptance criteria, and outcome.
- Do not copy the full GitHub comment history into local files. Add durable decisions and proof to `## Sync log`.

## Local layout

- Spec: `.scratch/codex-studio/spec.md` (`PRD.md` remains compatible).
- Ticket mirrors: `.scratch/codex-studio/issues/<NN>-<slug>.md`.
- Rejected requests: `.scratch/codex-studio/out-of-scope/<concept>.md`.
- Execution state: `.scratch/planning/`.
- Wayfinding mirrors: `.scratch/wayfinder/<effort-slug>/`.

Each mirrored ticket starts with these fields:

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

1. Read the Issue, the Project item, and the local mirror before a mutation.
2. If both surfaces changed after `Last synced`, set `Sync: conflict` and stop.
3. Write the local draft with `Sync: pending` before remote creation.
4. Create or update the GitHub Issue. Use native parent and blocking relationships when they are available.
5. Add the Issue to Project `8` under `gvastethecreator`.
6. Set the Project `Status` field to `Todo`, `In Progress`, or `Done`.
7. Update the local identifiers, shared fields, timestamps, and `Sync: synced`.
8. If a step fails, record the failed step under `## Sync log`. Retry from the stored Issue URL.

Never create a second Issue because Project insertion, field editing, or local patching failed.

## GitHub commands

Use these exact identities:

```powershell
gh issue view <number> -R gvastethecreator/codex-studio --json number,title,state,body,labels,assignees,comments,updatedAt,url
gh project view 8 --owner gvastethecreator --format json
gh project field-list 8 --owner gvastethecreator --format json
gh project item-list 8 --owner gvastethecreator --limit 200 --format json
gh project item-add 8 --owner gvastethecreator --url <issue-url>
gh project item-edit 8 --owner gvastethecreator --url <issue-url> --field Status --value <configured-value>
```

## Triage and implementation

- Triage updates one category label, one triage label, and the matching local fields.
- When work starts, assign the Issue, set Project status to `In Progress`, and set local `Execution:` to `active`.
- When completion is proven, post proof, close the Issue, set Project status to `Done`, and set local `Execution:` to `finished`.
- A blocker keeps the Issue open. Record the blocker on GitHub and set local `Execution:` to `blocked`.

## Wayfinding operations

- Create the map as a GitHub Issue with `wayfinder:map`. Mirror it at `.scratch/wayfinder/<effort-slug>/map.md`.
- Create decision tickets as native sub-issues. Mirror them under `.scratch/wayfinder/<effort-slug>/tickets/`.
- Use native blocked-by relationships. Mirror the same Issue numbers in `Blocked by:`.
- Claim a ticket with an assignee, `In Progress`, and local `Execution: active`.
- Resolve a ticket with a GitHub comment, `Done`, and a local `## Answer` plus sync log.
