# Arquitectura

## Vista General

La aplicacion conserva la SPA React/Vite original como interfaz principal, pero toda la generacion real ocurre en un backend local Bun/Hono que supervisa `codex app-server`, persiste SQLite y emite eventos SSE. El frontend combina consultas HTTP, stream de eventos y una cache visual en IndexedDB para mantener la UI original mientras el catalogo SQLite se consolida como modelo duradero.

```mermaid
graph TD
    UI["React/Vite UI"] --> COMMAND["Command Center"]
    UI --> PIPE["useGenerationPipeline"]
    UI --> RUNTIME["useStudioRuntime"]
    PIPE --> RUN["Local Generation Run"]
    RUNTIME --> SYNC["Local Studio Sync"]
    RUN --> API["Bun/Hono local API :4317"]
    SYNC --> API
    API --> EVENTS["GET /api/events (SSE)"]
    EVENTS --> RUN
    EVENTS --> SYNC
    API --> CATALOG["/api/catalog + /library/*"]
    API --> SETTINGS["Studio Settings"]
    API --> DB["SQLite .studio/studio.sqlite"]
    API --> LIB["Studio Library .studio + outputs"]
    API --> PROVIDERS["Provider Boundary"]
    PROVIDERS --> CODEX["Codex Product Runtime"]
    CODEX --> CX["codex app-server ws://127.0.0.1:4318"]
    CX --> TURN["Codex image turns"]
    PROVIDERS --> FAL["fal.ai hosted API"]
    PROVIDERS -. "planned adapters" .-> EXT["Google / ComfyUI"]
```

## Fronteras

- `services/studioRuntime.ts`: resuelve `apiBase` y metadatos de runtime (web o desktop) sin acoplar el renderer a Electron.
- `hooks/useStudioRuntime.ts`: agrupa sincronizacion, onboarding, diagnosticos y readiness para que el shell consuma una sola interfaz.
- `hooks/useLocalStudioSync.ts`: hace catch-up inicial por HTTP, se suscribe a `GET /api/events`, refleja jobs/logs del backend y refresca el catalogo sin persistir Visual Batches.
- `services/localGenerationRun.ts`: crea jobs de Generation Task, espera estados terminales via `watchJob()`, consulta `/api/catalog?job_id=...` y devuelve datos locales derivados del catalogo. El Visual Batch legacy se construye solo en `localGenerationVisualBatchCompat`.
- `services/localStudioService.ts`: unico adaptador HTTP de la UI hacia el backend local.
- `services/studioEventSource.ts`: adaptador SSE compartido para jobs, assets, logs y estado de conexion.
- `lib/studioCatalogView.ts`: read model puro de Catalog Entries. Agrupa y filtra entradas de catalogo sin importar `GenerationBatch`, cache IndexedDB ni adapters visuales.
- `lib/studioCatalogImageAdapter.ts`: materializa imagenes de UI desde Catalog Entries sin pasar por Visual Batches.
- `lib/studioLegacyVisualSnapshotExport.ts`: construye snapshots legacy `GenerationBatch[]` solo para export compatibility.
- `scripts/catalog-first-source-audit.ts`: Codex Automation Surface que bloquea regresiones donde `StudioCatalogView` vuelva a depender de Visual Batch o donde `useCatalog` vuelva a leer `catalog-cache`/estado global.
- `lib/studioReadiness.ts` y `lib/studioDiagnostics.ts`: builders puros para onboarding y paneles de diagnostico.
- `main.tsx`: entry de produccion magro. Carga `react-scan` solo en desarrollo para que diagnostics de render no entren en el bundle normal.
- `components/shell/StudioViewport.tsx`: shell de rutas demand-mounted. Lazy-loads `StudioPage`, `RecipesView` y `RecipePage` para que el entry principal no importe toda la superficie de estudio/recetas al arranque.
- `components/LiquidBlackBackground.tsx`: efecto visual WebGL cargado desde `AppContent` solo cuando el background esta activo, no como import eager del shell.
- `scripts/report-ui-chunks.ts`: Codex Automation Surface para presupuestos de bundle UI. `ui:chunks:verify` corre dentro de `bun run build` para evitar que `index`, Styles, Catalog Search, Camera, Three o ZIP export vuelvan a chunks monoliticos sin ser detectados.
- `scripts/ui-demand-surface-audit.ts`: Codex Automation Surface para fronteras demand-mounted. `ui:source:verify` bloquea imports estaticos conocidos (`react-scan`, `three`, Catalog data/YAML parser, ZIP vendors, Liquid background y route pages) antes de que el build pueda ocultar una regresion de startup.
- `lib/recipeModules.ts`: registry declarativo de Recipe Modules con metadata, parametros, controles, defaults, validacion, tasks soportadas y providers compatibles.
- `lib/recipeCatalog.ts`: Recipe Module Catalog consultable por UI, scripts y agentes. Expone defaults, grupos de parametros y parametros requeridos; `RecipesView` usa este catalogo para textos/metadata y conserva solo iconos/assets visuales.
- `lib/recipeDerivedParams.ts`: helpers provider-independent para parametros derivados de Recipe Modules, como traduccion de camara a lenguaje de direccion y mapeo temporal de Timeline. Mantiene esa logica testeable fuera de React.
- `lib/recipePromptFragments.ts`: fragmentos provider-independent para construir Recipe Contexts de Character, Cinematic y Spritesheet sin mezclar reglas de prompt con el envelope compartido.
- `lib/recipeContextBuilders/`: builders de Recipe Context por Recipe Module. `lib/recipeContext.ts` queda como registry/envelope resolver para construir, parsear y aplicar el contexto sin concentrar cada receta en un monolito.
- `packages/shared/src/recipeProviderDirectives.ts` y `lib/recipeProviderDirectives.ts`: snapshot compacto de Recipe Provider Directives. Todas las Recipe Modules actuales emiten directivas estructuradas para que los providers puedan compilar payloads compactos sin depender siempre del Recipe Context legacy.
- `components/recipes/recipeModuleUi.ts`: proyeccion UI ligera de Recipe Modules. Permite que las recipe surfaces consuman opciones, defaults y rangos del schema central sin duplicar arrays locales.
- `components/recipes/styles/manifests/`: fuente granular de Style Pack Manifests y Style Preset Manifests. `stylePresetCatalogData.ts` carga el grafo editorial completo para validacion y busqueda; `styleRuntimeData.generated.ts` materializa un indice liviano de packs, `styleRuntimePacks.generated/<pack>.ts` compone cada pack desde chunks lazy por categoria en `styleRuntimePacks.generated/<pack>/<category>.ts`, y `stylesData.ts` alimenta la UI sin importar todos los presets al montar. `styles:runtime:check` prueba que esa materializacion siga sincronizada.
- `components/recipes/StylePresetCatalogSearchSurface.tsx`: Demand-Mounted Surface del Style Preset Catalog. Monta una shell UI pequena; importa `stylePresetCatalogData` solo cuando se abre la busqueda, y ese modulo carga `js-yaml` solo para parsear manifests.
- `hooks/useCameraViewport.ts`: viewport WebGL de Camera. Carga `three` mediante import dinamico cuando el contenedor se monta, para que la recipe surface conserve estado/controles sin meter Three.js en el chunk de la receta.
- `apps/local-server/src/providers/providerInputCompiler.ts`: registry de Provider Input Compilers para Codex, Dry Run, Google, fal.ai y ComfyUI. Da una seam unica para diagnostics, fixtures y futuros adapters.
- `apps/local-server/src/providers/externalProviderInputs.ts`: compilers de frontera para Google, fal.ai y ComfyUI. Prueban el shape de Compiled Provider Inputs compactos, incluyen Recipe Provider Directives cuando existen y no activan ejecucion externa ni serializan secretos.
- `apps/local-server/src/providers/externalProvider.ts`: adapter shell de ejecucion externa. Compila el Provider Input, aplica preflight no-secreto y delega en un executor registrado. No importa providers concretos.
- `apps/local-server/src/providers/externalProviderExecutors.ts`: registry de executors externos concretos. Hoy registra Google, fal.ai y ComfyUI por defecto.
- `apps/local-server/src/providers/externalProviderResults.ts`: normalizador compartido para resultados hosted. Centraliza retry HTTP, extraccion de URL de imagen, descarga, mime/ext, escritura de asset/transcript no-secreto, diagnostics compactos opcionales y redaccion de snippets.
- `apps/local-server/src/providers/googleExecutor.ts`: executor hosted para Google Gemini image API. Usa `GOOGLE_API_KEY`, `GEMINI_API_KEY` o `NANO_BANANA_API_KEY`, llama `generateContent`, escribe resultados `inlineData` como Local Assets y mantiene secrets fuera de Provider Inputs, transcripts y errores. `image_edit` requiere asset `input` o `external_output` local; assets `sourceUrl` deben importarse antes como `localPath`.
- `apps/local-server/src/providers/falExecutor.ts`: executor hosted para fal.ai. Usa `FAL_KEY` o `FAL_API_KEY`, sube assets `localPath` a fal CDN via `@fal-ai/client`, llama `fal.run`, mapea assets hospedados a `image_url`, `mask_url`, `control_image_url` y `reference_image_urls`, y delega normalizacion/descarga/transcript en el normalizador compartido. `image_edit` exige asset `input` o `external_output`; assets inline quedan bloqueados porque el Compiled Provider Input compacto no conserva bytes inline.
- `apps/local-server/src/providers/comfyExecutor.ts`: executor local para ComfyUI. Exige `COMFY_API_URL` o `COMFYUI_API_URL` mas `COMFY_WORKFLOW_TEMPLATE_PATH`, inyecta `{{prompt}}` y `{{negativePrompt}}` en workflow JSON, llama `/prompt`, consulta `/history/{prompt_id}`, importa el primer resultado `/view` como Local Asset y escribe transcript con diagnostics compactos.
- `apps/local-server/src/providers/runtimeConfig.ts`: preflight backend de Provider Secrets, endpoints locales y config minima para Google, fal.ai y ComfyUI. Expone nombres de fuentes y estado de runtime sin devolver valores secretos o paths configurados a traves de `/api/providers/preflight` y la vista de Settings.
- `apps/local-server/src/codex/imagegenContract.ts`: Provider Session Contract de Codex imagegen. Reutiliza instrucciones estables entre provider compiler, persistent threads y fallback prompt para no duplicar boilerplate por turno.
- `apps/local-server/src/outputSources.ts`: detector, registry e import explicito de External Output Sources. Solo copia archivos seleccionados hacia la Studio Library; no mueve ni borra en la fuente externa.
- `utils/fileUtils.ts`: utilidades de descarga livianas en startup; la exportacion ZIP carga `jszip` y `file-saver` solo cuando el usuario exporta multiples imagenes.
- `apps/local-server/src/appFactory.ts`: expone health, catalogo, jobs, bibliotecas, eventos SSE y rutas publicas de la Studio Library.
- `apps/local-server/src/codex/`: concentra lectura de Local Codex Session, catalogo de modelos, session pooling, RPC y supervision del app-server.
- `Provider Boundary`: frontera backend donde las Generation Tasks se ejecutan con Codex primero y, cuando hay executor concreto, con adapters externos que devuelven el mismo contrato local.
- `packages/shared/src/types.ts`: tipos compartidos para catalogo, jobs, health, session/readiness y eventos.
- `Studio Library`: workspace externo configurable; por defecto vive bajo el home del usuario (por ejemplo `%USERPROFILE%\AI-Studio-Library` en Windows). La raiz visible contiene `.studio/` para estado interno, SQLite, logs, references y transcripts, y `outputs/` para imagenes generadas, thumbnails, exports y trash de assets.

## Flujo de Generacion

1. El usuario trabaja en la UI original: prompt, recetas, adjuntos, batch count y workspace.
2. `useGenerationPipeline` delega en `runLocalGeneration`.
3. `runLocalGeneration` resuelve el Recipe Module, crea una Generation Task Spec, crea uno o mas jobs persistentes y reutiliza un stream SSE compartido para esperar su estado terminal.
4. El worker del backend ejecuta la tarea a traves del Provider Boundary. Hoy el adapter principal es Codex y ejecuta un Codex Turn contra `codex app-server`.
5. Al completar cada job, el frontend consulta `/api/catalog` filtrando por `jobId` y devuelve un resultado local derivado del catalogo. El append legacy construye un Visual Batch solo en el borde de compatibilidad.
6. `useLocalStudioSync` mantiene jobs, logs y catalogo frescos en la UI a traves del stream SSE y hace catch-up por HTTP cuando la conexion se cae o al iniciar.
7. La UI renderiza imagenes desde Catalog Entries en la mayoria de superficies. El Visual Batch legacy queda en memoria como compatibilidad de recovery y append generado mientras SQLite y el Image Catalog son la fuente duradera de verdad.

## Estado y Persistencia

- SQLite es la fuente local de verdad para jobs, assets catalogados, libraries, projects y system logs.
- IndexedDB ya no persiste el cache visual activo `GenerationBatch[]`; `catalog-cache` y `catalog-trash` quedan como claves legacy de recovery. IndexedDB sigue almacenando preferencias como `generation-config`.
- El grid y las superficies principales leen imagenes materializadas desde Catalog Entries. Los Visual Batches restantes son compatibilidad en memoria para recovery y append generado.
- `LegacyVisualBatchContext` no expone el snapshot completo. Solo publica ids para dedupe de recovery y acciones de compatibilidad.
- Las imagenes y thumbnails generados viven en `outputs/` dentro de la Studio Library y se sirven a la UI via `/library/*`; el estado interno vive en `.studio/`.
- El panel de cola mezcla jobs visuales efimeros de la UI con jobs persistentes del backend.
- External Output Sources son candidatos o registros de salida externos. No son Catalog Entries y no habilitan delete/move/tag hasta que el import explicito copie archivos seleccionados como Local Assets dentro de la Studio Library.

## Sesion local y readiness

- El producto esta bloqueado a **ChatGPT login** en el Codex CLI local; no usa `OPENAI_API_KEY` ni otros proveedores externos en el flujo principal.
- `/api/codex/session` es la lectura canonica de la Local Codex Session; `/api/codex/account` se mantiene como alias de compatibilidad.
- `Studio Readiness` combina backend reachability, Studio Library, Codex CLI, `codex app-server` y Local Codex Session para guiar el onboarding y los paneles del sistema.

## Direccion profesionalizacion

- Codex Studio es Codex-first: `codex app-server` sigue siendo el Codex Product Runtime.
- El Codex SDK queda como Codex Automation Surface para scripts, auditorias, migraciones y mantenimiento.
- Generation Task y Generation Provider se modelan por separado.
- Recipe Modules declaran metadata, parametros, controles, defaults, validacion, tasks/providers compatibles y producen Generation Task Specs; providers compilan esos specs en Compiled Provider Inputs compactos.
- Las Recipe Modules actuales ya emiten Recipe Provider Directives compactas para que Codex y proveedores externos compilen menos texto que el Recipe Context legacy cuando sea seguro.
- Google, fal.ai y ComfyUI ya tienen compilers de conformance, preflight visible en Settings y un adapter shell de ejecucion externa. Google y fal.ai tienen executors hosted reales registrados en el executor registry; ComfyUI tiene executor local template-backed y solo queda executable cuando endpoint y workflow template estan configurados.
- Studio Settings contienen preferencias editables no secretas; Provider Secrets viven fuera de SQLite.
- El Command Center concentra estado global y abre Demand-Mounted Surfaces para diagnosticos, settings y provider internals.
- Style presets ya tienen manifests granulares generados desde YAML legacy; el siguiente paso es autorar nuevos presets directamente ahi y degradar los pack YAML a compat/migracion.
- La busqueda completa del Style Preset Catalog vive en una Demand-Mounted Surface y el browser visual carga presets por pack compuesto desde chunks de categoria, para mantener el runtime inicial de Styles en un indice compacto y evitar chunks monoliticos de presets.
- External Output Sources ya tienen deteccion read-only, registry, UI de registro y endpoint de import seleccionado hacia Local Assets. La importacion de imagenes debe pasar por esta frontera; los JSON legacy de workspace no son entrada de datos.
