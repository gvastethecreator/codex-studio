# Triage fields

GitHub Issues use one category label and one triage label. Local mirrors record the same values.

## Categories

| Category      | GitHub label  | Meaning                     |
| ------------- | ------------- | --------------------------- |
| `bug`         | `bug`         | Existing behavior is wrong  |
| `enhancement` | `enhancement` | New behavior or improvement |

## Triage status

| Status            | GitHub label      | Meaning                                      |
| ----------------- | ----------------- | -------------------------------------------- |
| `needs-triage`    | `needs-triage`    | Maintainer evaluation is required            |
| `needs-info`      | `needs-info`      | Reporter information is missing              |
| `ready-for-agent` | `ready-for-agent` | An AFK agent can start                       |
| `ready-for-human` | `ready-for-human` | Human implementation or judgment is required |
| `wontfix`         | `wontfix`         | The request will not be actioned             |

## Project status

| Workflow state | Project value |
| -------------- | ------------- |
| Queued         | `Todo`        |
| Active         | `In Progress` |
| Finished       | `Done`        |

Local `Execution:` is separate from triage `Status:`. Use `queued`, `active`, `blocked`, or `finished`.

## Workflow labels

- `spec`: parent specification for implementation tickets.
- `wayfinder:map`: parent decision map.
- `wayfinder:task`: prerequisite task for a later decision.

Create another Wayfinder label only when that ticket type is used.
