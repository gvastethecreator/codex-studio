# Architecture review - Effect-TS adoption opportunities (Codex Studio)

Date: 2026-05-31

## Summary

- El proyecto ya tiene buenos **seams** (ADR-0014, ADR-0018, ADR-0021, ADR-0022, ADR-0029), así que la adopción de Effect puede ser incremental y de alto retorno.
- El mejor punto de entrada no es el UI puro, sino la orquestación backend/local runtime donde hoy hay más `Promise` + `try/catch` + `AbortController` + retries manuales.
- La recomendación es introducir Effect en módulos de runtime y scripts de automatización primero, manteniendo las interfaces públicas estables.

## Candidate recommendations

### 1) Deepen the Worker orchestration module with typed error/retry/timeout semantics

**Files**

- `apps/local-server/src/worker.ts`

**Problem**

El módulo concentra mucha lógica de control de flujo (`processQueue`, `processJob`, cancelación, publish de eventos, transitions de estado) con errores stringly-typed y helpers de abort manuales.

**Solution**

Migrar internamente a `Effect` para modelar:

- pipeline de job (`dry_run`, `codex`, `external`) con errores tipados;
- cancelación/timeout con operadores nativos (`timeout`, `timeoutFail`, interrupción);
- retries declarativos con `Schedule`.

Mantener la **interface** de `WorkerController` sin ruptura.

**Benefits**

- **Locality**: política de fallos y cancelación en un solo módulo.
- **Leverage**: menos ramas imperativas repetidas por tipo de job.
- Tests más precisos con inyección de `Layer`/servicios fake.

**Before / After**

- Before: control flow imperativo + abort/retry artesanal.
- After: runtime declarativo con canales de error explícitos y composición uniforme.

**Recommendation strength**: **Strong**

**Dependencies / sequencing**

- Depende de definir un pequeño contrato de errores de worker.
- Desbloquea candidatos 2, 3 y 4.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (Worker internals)
- ADR complementaria si se estandariza taxonomía de errores.

---

### 2) Consolidate Codex turn lifecycle and cancellation into a single Effect runtime seam

**Files**

- `apps/local-server/src/codex/turn.ts`

**Problem**

`runImagegenJob` mezcla session pooling, retries transitorios, invalidación de thread y aborts con loops manuales y múltiples `try/catch`.

**Solution**

Encapsular `runCodexImagegenTurn` / `runImagegenJob` como Effects con:

- reintento por política (`Schedule`) según clasificación de error;
- recursos (sesión/transcript) bajo `Scope`;
- cancelación uniforme sin duplicar `raceWithAbort`.

**Benefits**

- **Locality**: toda la política del Codex Product Runtime en un módulo profundo.
- **Leverage**: menos acoplamiento accidental entre sesión, transcript y retry.

**Before / After**

- Before: bucle de intentos + invalidaciones ad hoc.
- After: una pipeline explícita con políticas composables.

**Recommendation strength**: **Strong**

**Dependencies / sequencing**

- Hacer después del candidato 1 o en paralelo.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` sección Codex Product Runtime.

---

### 3) Replace ad-hoc provider HTTP retry logic with shared Effect retry policy module

**Files**

- `apps/local-server/src/providers/externalProviderResults.ts`
- (consumidores) `falExecutor.ts`, `comfyExecutor.ts`, `googleExecutor.ts`

**Problem**

Hay retries manuales con `for` + `sleep`, y señales de abort tratadas por convención local.

**Solution**

Crear un módulo profundo de retry/backoff con Effect para Provider Boundary:

- policy central (`maxAttempts`, jitter/backoff, retryable status);
- timeout configurable;
- tagging de errores recuperables vs terminales.

**Benefits**

- **Leverage**: una policy reusable para todos los Generation Providers.
- **Locality**: cambios de resiliencia en un solo seam.

**Before / After**

- Before: cada adapter decide su loop de retries.
- After: policy única con semántica consistente.

**Recommendation strength**: **Strong**

**Dependencies / sequencing**

- Sin bloqueos mayores; ideal como quick win backend.

**Documentation follow-ups**

- `docs/active/professionalization-roadmap.md` (provider resilience)

---

### 4) Deepen SSE/event stream module pair with Effect Stream-like contracts

**Files**

- `apps/local-server/src/eventStreamRoutes.ts`
- `services/studioEventSource.ts`

**Problem**

Cliente y servidor SSE tienen reconexión/keep-alive/abort hechos a mano y dispersos.

**Solution**

Modelar eventos como un módulo profundo de stream (internamente con Effect y API pública estable):

- reconexión con política declarativa;
- heartbeat, backpressure y cierre seguro;
- parseo de eventos con error channel explícito.

**Benefits**

- **Locality**: una sola política de conexión para Local Studio Sync.
- **Leverage**: menos flakes por edge cases de reconexión.

**Before / After**

- Before: timers/listeners manuales en dos lados del seam.
- After: contrato de stream explícito y verificable.

**Recommendation strength**: **Worth exploring**

**Dependencies / sequencing**

- Recomendado después de 1-3.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (`Local Studio Sync` y `/api/events`).

---

### 5) Introduce a typed Local Generation Run effect pipeline

**Files**

- `services/localGenerationRun.ts`
- `services/localGenerationRuntimeAdapters.ts`

**Problem**

El flujo de creación de job + espera de terminal state + query de catálogo combina I/O, delays, abort y outcome mapping en async imperativo.

**Solution**

Pasar a una pipeline Effect:

- errores de dominio (`cancelled`, `failed`, `timeout`) tipados;
- composición de pasos (`build assets`, `create job`, `watch`, `materialize result`);
- retry/timeouts configurables por task.

**Benefits**

- **Leverage**: mejores garantías para `Local Generation Run`.
- **Locality**: reduce política duplicada en hooks consumidores.

**Before / After**

- Before: async/await con checks de abort repetidos.
- After: pipeline única con control-flow declarativo.

**Recommendation strength**: **Strong**

**Dependencies / sequencing**

- Después de candidato 1 o en paralelo.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (`Local Generation Run`).

---

### 6) Deepen local app-server process supervision with scoped resource lifecycle

**Files**

- `apps/local-server/src/codex/processSupervisor.ts`

**Problem**

Supervisor de proceso con estado global mutable y manejo de stdout/stderr best-effort.

**Solution**

Migrar internamente a resource management explícito (`Scope`) y canal de diagnósticos tipado:

- adquisición/liberación de proceso;
- propagación de eventos de salida sin race conditions;
- timeout de startup con errores de dominio.

**Benefits**

- **Locality**: supervision robusta en un módulo.
- **Leverage**: menos fallos intermitentes difíciles de reproducir.

**Before / After**

- Before: mutable globals + callbacks sueltos.
- After: lifecycle explícito y deterministic teardown.

**Recommendation strength**: **Worth exploring**

**Dependencies / sequencing**

- Mejor tras consolidar `turn.ts`/`rpcClient.ts`.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (`App-Server Lifecycle`).

---

### 7) Consolidate RPC client connect/reconnect/notification semantics

**Files**

- `apps/local-server/src/codex/rpcClient.ts`

**Problem**

Reintentos, polling de notificaciones y cleanup de waiters están implementados manualmente.

**Solution**

Usar runtime Effect para:

- retry policy de conexión;
- espera de notificaciones sin `setInterval` manual;
- cancelación y finalización segura de waiters.

**Benefits**

- **Leverage**: cliente RPC más predecible para todo Codex Product Runtime.
- **Locality**: menos bugs de sincronización en un punto crítico.

**Before / After**

- Before: timers + estructuras mutables ad hoc.
- After: runtime declarativo y cancelable.

**Recommendation strength**: **Strong**

**Dependencies / sequencing**

- En paralelo con candidato 2.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (Codex RPC seam).

---

### 8) Add Effect Schema at HTTP boundaries to replace permissive body parsing

**Files**

- `apps/local-server/src/jobRoutes.ts`
- `apps/local-server/src/settingsRoutes.ts`
- `apps/local-server/src/outputSourceRoutes.ts`
- `apps/local-server/src/projectRoutes.ts`
- `apps/local-server/src/librariesRoutes.ts`

**Problem**

Hay varios endpoints que parsean JSON con `c.req.json().catch(() => ({}))`, lo que degrada semántica de error y genera validación parcial.

**Solution**

Introducir `Schema.decodeUnknown` en boundaries HTTP para normalizar:

- parse/validation errors consistentes;
- payloads discriminados por route;
- mensajes de error más accionables.

**Benefits**

- **Locality**: validación de entrada concentrada por seam.
- **Leverage**: menos comportamiento implícito en handlers.

**Before / After**

- Before: parse tolerante + errores heterogéneos.
- After: decoding explícito y uniforme.

**Recommendation strength**: **Strong**

**Dependencies / sequencing**

- Puede iniciarse en una sola ruta (tracer bullet).

**Documentation follow-ups**

- Agregar guideline en `docs/DEV_GUIDE.md` o ADR ligera de input validation.

---

### 9) Introduce Layer-based DI façade for `localStudioService` network adapter

**Files**

- `services/localStudioService.ts`

**Problem**

El módulo usa un helper `request` global, sin composición por entorno ni tipos de error diferenciados.

**Solution**

Crear módulo de cliente HTTP effectful (interno) con Layer para:

- configuración de base URL;
- mapeo consistente de errores HTTP/red;
- inyección en tests sin mocks ad hoc.

**Benefits**

- **Leverage**: interfaz de API local más sólida para UI.
- **Locality**: comportamiento HTTP concentrado.

**Before / After**

- Before: helper estático y excepciones `Error` genéricas.
- After: servicio inyectable con errores tipados.

**Recommendation strength**: **Worth exploring**

**Dependencies / sequencing**

- Después de validar impacto en hooks UI.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (`services/localStudioService.ts`).

---

### 10) Deepen queue orchestration on UI side only after backend runtime stabilization

**Files**

- `hooks/useQueueManager.ts`

**Problem**

Hook con coordinación de timers, abort controllers y estado de jobs; aún correcto, pero con complejidad creciente.

**Solution**

Adoptar Effect en UI sólo para la parte de orquestación (si hace falta), manteniendo React state como interfaz principal.

**Benefits**

- **Locality**: reduce ramas de estado/abort en el hook.
- **Leverage**: mejor trazabilidad de transiciones de cola.

**Before / After**

- Before: timer/abort logic manual en hook React.
- After: orquestación declarativa detrás del mismo hook público.

**Recommendation strength**: **Speculative**

**Dependencies / sequencing**

- Hacer al final; primero backend y scripts.

**Documentation follow-ups**

- `docs/TECHNICAL_DEBT.md` (si se acepta).

---

### 11) Migrate long-running generation scripts to Effect runtime utilities

**Files**

- `scripts/generate-style-defaults.ts`
- `scripts/style-default-utils.ts`
- `scripts/evaluate-recipe-prompts-live.ts`

**Problem**

Scripts con polling/retry paralelo manual, manejo de fallos parcial y persistencia de reporte distribuida.

**Solution**

Usar Effect en scripts para:

- retries/timeout estándar;
- concurrencia limitada declarativa;
- logging/metrics de ejecución homogéneos.

**Benefits**

- **Leverage**: scripts más robustos y mantenibles.
- **Locality**: reduce duplicación entre scripts de tooling.

**Before / After**

- Before: loops manuales y sleeps distribuidos.
- After: políticas compartidas, mejor visibilidad de ejecuciones.

**Recommendation strength**: **Strong**

**Dependencies / sequencing**

- Puede arrancar en un script piloto (quick win seguro).

**Documentation follow-ups**

- `docs/TOOLING.md` y comandos de validación.

---

### 12) Improve local Codex session reader with typed fallback causes

**Files**

- `apps/local-server/src/codex/localCodexSession.ts`

**Problem**

Fallbacks y errores de sesión se resuelven correctamente pero en base a `catch(() => null)` y errores string.

**Solution**

Tipar causas esperadas (socket, auth mode, rate limit endpoint, parse) con Effect error channel para reportes más accionables.

**Benefits**

- **Locality**: mejora diagnóstico de `Studio Readiness` sin ampliar interfaces.
- **Leverage**: onboarding/debug más claros.

**Before / After**

- Before: fallback correcto pero poco semántico.
- After: catálogo de causas legible para usuario y logs.

**Recommendation strength**: **Worth exploring**

**Dependencies / sequencing**

- Paralelo a candidato 7.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (Local Codex Session).

## Quick wins (1-2 días)

1. Candidato 3 (`externalProviderResults.ts`) como piloto de retry/timeout con Effect.
2. Candidato 8 en una ruta (`jobRoutes.ts`) para validar Schema-first boundaries.
3. Candidato 11 en `scripts/evaluate-recipe-prompts-live.ts` (polling/retries/logging).

## Medium initiatives (1-2 semanas)

1. Candidato 1 + 2 + 7 como paquete runtime Codex.
2. Candidato 4 para endurecer SSE end-to-end (`/api/events` + `studioEventSource`).
3. Candidato 6 para cerrar ciclo de supervisión de `codex app-server`.

## Risks and constraints

- **Curva de aprendizaje**: Effect aumenta calidad, pero exige disciplina (errores tipados, Layers, Scope).
- **Costo de migración**: si se toca UI antes de backend, sube complejidad accidental.
- **Bundle/UI**: evitar introducir runtime Effect en superficies React livianas sin necesidad (mantener prioridad backend/tooling).
- **Interoperabilidad Bun/Vite**: iniciar en `apps/local-server` y scripts (Bun-friendly), no en hot paths del bundle UI.

## Where NOT to apply Effect (anti-patterns)

- Módulos puros y estables con alta **depth** actual, por ejemplo:
  - `lib/studioCatalogView.ts`
  - `lib/studioCatalogImageAdapter.ts`
  - validadores de catálogo ya simples y testables.
- Helpers de formato sin I/O ni concurrencia.
- Componentes React de presentación (sin orquestación async compleja).

## Suggested execution order

1. **Tracer bullet**: candidato 3 (retry provider) + candidato 8 (una ruta con Schema).
2. Migración runtime core: candidatos 1, 2, 7.
3. Robustez de lifecycle: candidato 6.
4. Stream/readiness: candidatos 4 y 12.
5. Tooling hardening: candidato 11.
6. Revaluar UI queue (candidato 10) sólo si persiste dolor real.

## Evidence sources used

- Repo seams y vocabulario: `CONTEXT.md`, `docs/ARCHITECTURE.md`, ADRs 0013, 0014, 0018, 0021, 0022, 0029.
- Hotspots: `worker.ts`, `codex/turn.ts`, `codex/rpcClient.ts`, `eventStreamRoutes.ts`, `studioEventSource.ts`, `localGenerationRun.ts`, `externalProviderResults.ts`, `processSupervisor.ts`, `generate-style-defaults.ts`, `jobRoutes.ts`.
- Effect docs: quickstart, pipelines, layers, retrying, timing-out, schema basic usage, logging, y monorepo oficial.
