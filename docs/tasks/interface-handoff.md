# Tarea única: integración Interface Handoff

Estado: verified

## Baseline y objetivo

Proyecto: Codex Studio (`codex-studio`). Primera exportación (sin ZIP previo).
Working tree: se añade solo esta integración.
UI exportada: shell web actual (Library, Create, recipes, Settings, Jobs, Help/setup).
Review: jerarquía, navegación, densidad, estados vacíos, Jobs rail, selector de estilos, composer.

Alcance: vistas implementadas y alcanzables en el shell actual. No Electron. No backend productivo.

## Observado / desconocido / preservar

- Bun 1.3, React 19, Vite 8, hash router (`studio` / `recipes` / `recipe-*`).
- Create aterriza en `CreateWorkspace`; `RecipesView` no es el landing actual.
- IO: `services/studio-api/http.ts`, SSE, IndexedDB, `/library` URLs.
- Estilos: catálogo real lazy-load; miles de webps. Demo alias del catálogo de thumbnails.
- Tipografía de producto: Manrope vía Google Fonts. Demo usa el fallback del sistema y lo declara.
- Preservar: tokens Workbench (`--wb-*`), Create | Workflow | Library, Jobs que encoge el workbench, CompactStyleSelector.

## Estrategia elegida

Target: `localhost` (módulos ES de Vite no abren de forma fiable por `file://`).
UI original + adapters demo. Fixtures sintéticos. Reset en chrome de review.
Descartado `file` como target verificado: CORS de módulos. Descarta evidence-only: la UI es una SPA ejecutable.

## Reconciliación con el proyecto actual

Sin export_id previo. Inventario tomado del router, Header, RecipeRouter y overlays actuales.
No hay evidencia reutilizada.

## Cambios por archivo

| Ruta                             | cambio                  | razón                       | riesgo | prueba          |
| -------------------------------- | ----------------------- | --------------------------- | ------ | --------------- |
| `review/*`                       | nuevo                   | entry, adapters, escenarios | bajo   | navegación demo |
| `vite.handoff.config.ts`         | nuevo                   | build de review con aliases | medio  | build           |
| `scripts/interface-handoff/*`    | nuevo                   | export + helpers            | medio  | pack            |
| `.interface-handoff/config.json` | nuevo                   | config 1.1                  | bajo   | reconcile       |
| `package.json`                   | script `handoff:export` | comando único               | bajo   | bun run         |

## Secuencia de implementación

1. Inventario actual y config 1.1.
2. Entry de review y adapters sin IO de producción.
3. Escenarios, hash de producto, reset.
4. Build, índice, contexto, QA, ZIP.
5. Smoke extraído fuera del checkout.

## Criterios de aceptación

Ver plantilla de la skill. Primera ejecución debe entregar ZIP + brief lateral.

## Pruebas ejecutadas

- `vp build --config vite.handoff.config.ts` — pass (review demo, ~21 MB / 354 files)
- Playwright 1440×900 sobre servidor estático loopback — pass (18 escenarios)
- `handoff_delivery.py` + `handoff.py validate/pack/verify` — pass
- ZIP extraído fuera del checkout — pass
- `handoff_state.py seal` — baseline-promoted, export_id `codex-studio-20260920`

## Rollback y entrega

Borrar `review/`, `scripts/interface-handoff/`, `vite.handoff.config.ts`, `.interface-handoff/`, `docs/interface-handoff.md`, `docs/tasks/interface-handoff.md`, script en `package.json`, includes de `tsconfig.web.json`, y entradas de `.gitignore`. No toca datos de Studio Library.

## Recepción agent-ready (v0.4)

ZIP + brief Markdown con el mismo export_id.
