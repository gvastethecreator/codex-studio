# Sistema de diseño y UX

## Objetivo

Codex Studio debe sentirse como una herramienta creativa profesional: precisa, técnica y orientada a tareas, sin sacrificar claridad para usuarios nuevos.

## Principios

- Claridad antes que adorno.
- Estado del sistema visible y accionable.
- Consistencia de vocabulario en toda la UI.

## Paleta

- Fondo principal oscuro (near-black/zinc).
- Superficies sobrias, sin glassmorphism decorativo.
- Acento para estados de generación/listo.
- Semántica de color clara para peligro/info.

## Tipografía

- Sans legible para UI general.
- Monoespaciada para datos técnicos (IDs, puertos, logs).

## Motion

- GSAP como estándar.
- Duraciones típicas 150–250 ms.
- Animar estado/revelado/feedback; no “animación por animar”.
- Priorizar `transform` y `opacity`.

## Interacción

- Drag & drop global para referencias.
- Atajos útiles (`Escape`, navegación de carrusel, comparación).
- Confirmaciones destructivas con impacto y recuperación explicados.

- Superficies demand-mounted con carga/error visibles; no usar huecos silenciosos.
- Comandos visibles solo cuando tienen comportamiento real o una razÃ³n de bloqueo accionable.

- El composer inferior debe mantener filas estables en mobile; los controles no deben montarse sobre el prompt ni crear overflow horizontal.

## Meta open-source

- Copy comprensible para quien llega por primera vez.
- Empty states que enseñen el siguiente paso.
- Diagnósticos que indiquen bloqueo + acción recomendada.
