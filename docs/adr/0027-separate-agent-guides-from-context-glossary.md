# ADR 0027: Separate Agent Guides from Context Glossary

## Status

Accepted.

## Context

Agent instructions, contributor workflow, and domain glossary served different audiences but were mixed across docs. That made both human onboarding and AI-agent navigation noisier.

## Decision

Keep project context and glossary in `CONTEXT.md`. Keep agent-specific operating rules in `AGENTS.md` and skill guides. Keep deeper rationale in ADRs and topic docs.

## Consequences

- documentation has clearer ownership;
- contributors can find domain language without reading agent process rules;
- agents can load operational guidance without bloating product context.
