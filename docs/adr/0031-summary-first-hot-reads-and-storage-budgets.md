# ADR 0031: Summary-first hot reads and storage budgets

## Status

Accepted.

## Context

The studio keeps rich local records for jobs, catalog entries, transcripts, logs, and provider diagnostics. That traceability is valuable, but hot UI reads do not need full historical payloads. A measured Studio Library snapshot showed large historical inline image payloads in `jobs.source_spec_json` and `catalog_images.generation_config`, plus unbounded transcript and log growth.

ADR-0021 still stands: the Generation Task Spec is the durable source spec. ADR-0022 still stands: provider inputs should be compact. This ADR adds the missing runtime rule between those decisions: hot reads are summaries first, and maintenance commands own storage compaction/retention explicitly.

## Decision

- `/api/jobs` returns Job Summary records by default. Full Job payloads stay available through job detail paths.
- `/api/catalog` returns Catalog Page records without full `generation_config` by default. Detail/inspector reads may load full generation config on demand.
- Storage audits are read-only by default and must not print prompt, transcript, secret, or inline image contents.
- Storage compaction is dry-run by default. Write compaction requires explicit confirmation, creates a local backup, and should be run with the local server stopped.
- Logs use one rotation policy for backend process logs and SQL log rows use bounded retention.
- Transcript retention must not delete full transcripts until a provider-neutral Job Trace Summary is durable and verified.

## Consequences

- Large historical rows stop making normal shell, queue, chat, and grid reads feel heavy.
- Retrying old jobs with compacted inline assets may be unavailable when no local reference can be reconstructed; compaction must mark omitted payloads honestly instead of pretending the bytes still exist.
- Tests should include oversized fixture payloads proving list endpoints do not select, parse, or return inline image blobs.
- Future catalog/job UI that needs full details must opt into detail reads instead of widening list endpoints.
