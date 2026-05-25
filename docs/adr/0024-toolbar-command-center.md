# ADR 0024: Toolbar Command Center

## Estado

Aceptado.

## Contexto

The top toolbar is the studio's Command Center for global status and commands: backend/Codex readiness, usage, active provider, queue awareness, library and workspace switching, and entry points to settings or diagnostics. Heavier configuration, activity, and provider diagnostics open from the Command Center rather than living as permanent floating panels.

## Consecuencias

UI cleanup should demote scattered floating global panels into toolbar status items, menus, modals, or invoked panels. The toolbar must stay scannable: it exposes high-signal status and command entry points, not every detailed control inline.
