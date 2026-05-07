# Roadmap

Este roadmap describe la direccion del producto mientras preparamos una version open-source mas madura de Codex Studio. No es un contrato cerrado; es una guia operativa para decidir que construir, que consolidar y que dejar explicitamente fuera de foco.

## Estado actual

La direccion general sigue bien alineada con el producto real:

- **Local-first**: el studio sigue priorizando la ejecucion local, la biblioteca local y la sesion autenticada del usuario.
- **Codex-native**: el camino principal gira alrededor de `codex app-server`, no de API keys obligatorias.
- **Trazable**: jobs, logs, estado y artefactos ya tienen una base consistente en backend local + SQLite + UI.
- **Portable**: la biblioteca externa, la inicializacion local y la separacion repo/runtime siguen siendo pilares correctos.

Lo que cambio es el nivel de madurez: el producto ya no esta en una etapa donde alcanza con una lista corta de intenciones. Ahora necesitamos un plan mas concreto que refleje lo ya construido, cierre deuda estructural y ordene el camino hacia un release open-source mas robusto.

## Lo que ya esta resuelto o encaminado

Durante las ultimas tandas de trabajo, el studio avanzo en frentes que el roadmap anterior todavia no reflejaba:

- mejora del shell visual de recetas, incluida la experiencia de `recipes/styles`;
- rebranding de la app a **Codex Studio**;
- mejor salud inicial del entorno y onboarding operativo;
- widget de usage disponible en la toolbar superior;
- indicadores de estado para backend local, Codex CLI y app-server;
- accion de reset completo de workspace + base de datos desde la UI;
- documentacion, tooling y validacion mas consistentes para iterar con menos friccion.

En otras palabras: ya no estamos solo preparando el terreno. Ya tenemos una base usable y el foco ahora pasa a **consolidacion, claridad de producto y eliminacion de deuda de arquitectura**.

## Donde aun no estamos alineados del todo

Hay varias areas donde el producto real y el roadmap previo todavia no encajaban bien:

- **Deuda del shell principal**: `components/AppContent.tsx` sigue concentrando demasiada orquestacion, lo que afecta mantenibilidad, testabilidad y velocidad para agregar features.
- **Transicion incompleta hacia el catalogo durable**: la UI todavia conserva compatibilidad fuerte con `GenerationBatch` e IndexedDB, aunque el backend/catalogo ya existe como base duradera.
- **Falta de una capa operativa de producto**: ya tenemos health, jobs persistentes, logs y reset, pero falta convertir eso en una experiencia mas clara de activity feed, recovery y diagnosticos accionables.
- **Criterios de salida poco concretos para open source**: no alcanza con “mejorar docs” o “hacer onboarding mas claro”; necesitamos hitos verificables para saber cuando una preview publica esta lista.

## Principios rectores

- **Local-first**: el studio debe seguir siendo util aunque no exista un backend cloud propio.
- **Codex-native**: la integracion principal gira alrededor de `codex app-server` y la sesion autenticada del usuario.
- **Trazable**: cada job debe dejar logs, estado, diagnosticos y artefactos inspeccionables.
- **Portable**: la biblioteca local debe poder moverse, resetearse, respaldarse y reconfigurarse sin reescribir el producto.
- **Operable**: un usuario nuevo debe poder diagnosticar su instalacion sin leer medio repositorio.
- **Evolutivo**: nuevas recetas, adapters y superficies desktop deben poder agregarse sin aumentar el acoplamiento del shell principal.

## Plan maestro

### Fase 0 — Consolidar el shell actual

Objetivo: estabilizar la app tal como existe hoy antes de sumar demasiadas capas nuevas.

#### Fase 0 — Alta prioridad

- [ ] **Descomponer `AppContent.tsx`** — extraer modulos tipo `StudioShell`, `RecipeShell`, `DiagnosticsController` y `OverlayController`; reducir prop drilling; separar mejor routing, estado visual y side-effects.

- [ ] **Unificar el estado de diagnosticos del studio** — consolidar health, backend connectivity, account usage y app-server status en una capa dedicada para evitar duplicacion entre onboarding, toolbar, panel system y sync hooks.

- [ ] **Reemplazar affordances demasiado internos en la UI** — revisar copy, labels y mensajes con mirada de usuario nuevo, manteniendo personalidad pero bajando jerga demasiado interna o criptica.

- [ ] **Mejorar la UX de acciones destructivas** — reemplazar confirmaciones primitivas por modales coherentes con la UI y explicar con precision que se resetea, que se conserva y como recuperar datos antes de borrar.

#### Fase 0 — Prioridad media

- [ ] **Logging frontend uniforme** — reducir usos directos de `console.*` y usar un adapter comun para UI con niveles, contexto y mensajes consistentes.

- [ ] **Tests de integracion del shell** — agregar cobertura para `HeaderToolbar`, `RightSystemPanel`, `StudioPage`, `useLocalStudioSync` y flujo de reset.

#### Fase 0 — Criterio de salida

- el shell principal queda modularizado sin romper el flujo de generacion;
- status, usage y onboarding comparten una misma fuente de verdad;
- las acciones destructivas se entienden mejor y son testeables.

### Fase 1 — Cerrar la brecha entre UI legacy y catalogo durable

Objetivo: hacer que el modelo de datos visible en la UI represente mejor la fuente durable real.

#### Fase 1 — Alta prioridad

- [ ] **Migrar la experiencia visual hacia el catalogo como fuente principal** — reducir la dependencia de `GenerationBatch` como modelo dominante y usar SQLite/catalogo como fuente durable, dejando IndexedDB como cache de UX donde tenga sentido.

- [ ] **Revisar import/export de workspaces y biblioteca** — definir con precision que exporta el vault y que pertenece a la biblioteca local, mejorando la consistencia entre importacion, trash, favoritos, metadata y catalogo.

- [ ] **Mejor recovery de assets y jobs huerfanos** — fortalecer la deteccion de estados parciales y exponer recovery de forma clara desde la UI, no solo como comportamiento interno.

#### Fase 1 — Prioridad media

- [ ] **Backups mas claros de biblioteca local** — documentar y eventualmente exponer flujos de respaldo/restauracion, distinguiendo entre reset visual, reset de DB y resguardo de assets.

- [ ] **Roadmap de migracion de datos documentado** — dejar explicito como transiciona la app desde cache visual legacy a indexacion durable.

#### Fase 1 — Criterio de salida

- la UI deja de depender fuertemente de un estado duplicado o ambiguo;
- importar, exportar, resetear y recuperar tiene reglas mas previsibles;
- el catalogo pasa a ser la referencia conceptual principal del studio.

### Fase 2 — Operabilidad real del studio

Objetivo: que el studio no solo funcione, sino que tambien sea facil de operar y diagnosticar.

#### Fase 2 — Alta prioridad

- [ ] **Centro de actividad mas claro** — mejorar la visualizacion de jobs persistentes, distinguir mejor cola efimera vs backend y hacer mas evidente que esta esperando, corriendo, fallando o listo para recovery.

- [ ] **Detalle de ejecucion mas util** — enriquecer job detail con eventos, transcript entries, errores accionables y artefactos relacionados para facilitar inspeccion sin obligar al usuario a abrir logs crudos.

- [ ] **Mensajes de error y recovery accionables** — cuando Codex CLI, app-server, puertos o biblioteca fallen, mostrar pasos concretos de recuperacion y evitar estados silenciosos o ambiguos.

#### Fase 2 — Prioridad media

- [ ] **Dry-run y smoke-check visibles desde la UI** — facilitar un check rapido de instalacion sin consumo real de generacion y usarlo como parte del onboarding y soporte.

- [ ] **Export de diagnosticos** — permitir descargar un bundle minimo con health, logs recientes y contexto tecnico para soporte o debugging.

#### Fase 2 — Criterio de salida

- un usuario puede entender el estado del sistema sin leer la consola;
- los fallos mas comunes tienen recovery visible;
- inspeccionar una ejecucion deja de sentirse como trabajo de arqueologia.

### Fase 3 — Setup, portabilidad y camino desktop

Objetivo: bajar friccion de instalacion y preparar una experiencia mas pulida fuera del entorno del repo.

#### Fase 3 — Alta prioridad

- [ ] **Mejor setup cross-platform** — pulir rutas, defaults y mensajes para Windows, macOS y Linux; mejorar deteccion y validacion de biblioteca local; reducir supuestos ocultos sobre puertos, PATH y estructura de entorno.

- [ ] **Onboarding verdaderamente autosuficiente** — hacer que el primer arranque detecte problemas, sugiera correcciones y revalide sin obligar a salir a docs demasiado pronto.

- [ ] **Definir mejor el camino desktop** — mantener el renderer desacoplado de Electron, limitar la superficie del `preload` y sostener una arquitectura segura y reversible.

#### Fase 3 — Prioridad media

- [ ] **Configuracion visual de runtime** — exponer mejor configuracion de biblioteca, puertos y endpoints locales sin convertir la UI en un panel de infra hostil.

- [ ] **Empaquetado para usuarios no tecnicos** — explorar pasos concretos para una distribucion mas simple cuando la base ya este mas estable.

#### Fase 3 — Criterio de salida

- una persona nueva puede instalar y verificar el studio con mucha menos ayuda externa;
- la build desktop deja de ser una exploracion adyacente y pasa a tener una estrategia clara.

### Fase 4 — Release candidate open-source

Objetivo: cerrar brechas para una preview publica mas seria y mantenible.

#### Fase 4 — Alta prioridad

- [ ] **Auditoria final de artefactos y repo hygiene** — validar que no reaparezcan muestras locales, prompts de trabajo o archivos ajenos al release y revisar arbol trackeado e historial relevante antes del corte.

- [ ] **Cobertura minima de calidad para release** — usar `validate:fast` en iteracion diaria y `validate:full` como gate de cierre, reforzando pruebas en shell, sincronizacion local y flujos criticos de usuario.

- [ ] **Documentacion de operador y contribucion final** — README, troubleshooting, arquitectura y contribucion deben reflejar el producto real, no un estado historico.

#### Fase 4 — Prioridad media

- [ ] **Checklist de smoke test manual** — cubrir primer arranque, health, generacion o dry-run, import/export, reset y recuperacion de fallos basicos.

#### Fase 4 — Criterio de salida

- el repositorio puede presentarse como preview open-source util sin esconder demasiadas advertencias operativas;
- el camino de instalacion, validacion y soporte queda razonablemente defendido.

## Mejoras concretas adicionales que vale la pena incorporar

Ademas del plan por fases, estas son mejoras puntuales que hoy tendrian muy buena relacion impacto/esfuerzo:

### UX del producto

- [ ] convertir el reset completo en un flujo de confirmacion mas rico y menos abrupto;
- [ ] agregar estados vacios, loading y error mas expresivos en paneles de jobs, logs y diagnosticos;
- [ ] revisar responsive del header superior para que usage, workspaces y navegacion convivan mejor en pantallas medianas;
- [ ] hacer mas clara la diferencia entre “workspace visual”, “vault exportado” y “biblioteca local”.

### Confiabilidad

- [ ] consolidar polling/revalidacion de health y account status;
- [ ] hacer mas visible cuando el backend se desconecta y cuando vuelve;
- [ ] dejar mejor definido que significa un reset exitoso del lado frontend y backend;
- [ ] agregar mas pruebas sobre reconexion, cancelacion y jobs persistentes.

### Datos y trazabilidad

- [ ] mejorar descubrimiento de transcripts, logs y artefactos por job;
- [ ] revisar politicas de retencion local para no crecer sin control;
- [ ] ofrecer caminos mas claros para backup/restore antes de operaciones destructivas.

### Performance

- [ ] hacer code-splitting de recetas pesadas con `React.lazy()` donde tenga sentido;
- [ ] medir si el grid y el shell necesitan mas memoizacion o virtualizacion cuando el catalogo crece;
- [ ] reducir renders derivados de un shell demasiado centralizado.

### Calidad y mantenimiento

- [ ] ampliar cobertura de tests de UI;
- [ ] revisar dependencias del stack periodicamente y validar compatibilidad real del ecosistema;
- [ ] seguir agregando JSDoc y contratos explicitos en servicios/hook criticos.

## Orden recomendado de ejecucion

Si hoy hubiera que priorizar en serio, el orden recomendado seria este:

1. **Descomponer `AppContent.tsx` y unificar diagnosticos**.
2. **Cerrar la brecha entre batches legacy e indexacion durable en catalogo**.
3. **Mejorar activity feed, job detail y recovery**.
4. **Pulir onboarding cross-platform y configuracion local**.
5. **Reforzar testing y criterios de release**.
6. **Recien despues** empujar fuerte desktop packaging o extensibilidad avanzada.

## No objetivos inmediatos

- convertir el producto en un servicio cloud administrado;
- reintroducir dependencias obligatorias de API keys para el flujo principal;
- publicarlo como paquete npm reutilizable; el foco sigue siendo el studio local, no una libreria;
- perseguir demasiadas features nuevas de superficie sin antes consolidar shell, datos y operabilidad.

## Regla de oro para las proximas iteraciones

Cada mejora nueva deberia responder al menos a una de estas preguntas:

- ¿reduce friccion real para instalar o usar el studio?
- ¿aclara mejor el estado del sistema y los jobs?
- ¿reduce deuda estructural del shell o del modelo de datos?
- ¿prepara mejor el release open-source sin meter mas complejidad de la que saca?

Si la respuesta es “no”, probablemente esa mejora puede esperar.
