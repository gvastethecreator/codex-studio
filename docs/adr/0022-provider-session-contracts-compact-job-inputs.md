# ADR 0022: Provider Session Contracts and Compact Job Inputs

## Estado

Aceptado.

## Contexto

Generation Providers may keep stable instructions in a Provider Session Contract so every job does not resend the same boilerplate. A Codex provider can place reusable output rules, safety boundaries, and import/reporting expectations at the session or provider level, while each job sends only the compact task delta compiled from the Generation Task Spec.

## Consecuencias

Token optimization should remove repeated provider boilerplate before weakening task quality. Provider compilers must make the boundary auditable by preserving the source Generation Task Spec and, when useful, the compact Compiled Provider Input that was executed.
