# ADR 0028: Demand-Mounted UI Surfaces

## Estado

Aceptado.

## Contexto

Global status should be summarized in the Command Center, while heavy details such as diagnostics, activity, file views, provider internals, and expensive visual effects should mount only when visible or explicitly active. This prevents hidden panels, intervals, animations, and debug views from consuming runtime budget when the user is focused on generation or catalog work.

## Consecuencias

Performance cleanup should first remove always-on global surfaces that are not visible. Detailed diagnostics and configuration should lazy-load or activate on demand, with lightweight summary state exposed in the toolbar.
