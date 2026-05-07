# ADR 0002: Callable App Factory

## Estado

Propuesto.

## Contexto

El backend actual (`apps/local-server/src/index.ts`) ejecuta side effects a nivel top-level durante el `import`:

- `config.ts` línea 35: `loadDotEnvLocal()` muta `process.env` globalmente.
- `index.ts` línea 27: `initStudio()` crea carpetas, migra DB, escribe `.env.local`.
- `index.ts` línea 28: `new Hono()` crea la app.
- `index.ts` línea 220: `Bun.serve()` arranca el servidor HTTP.
- `index.ts` línea 227: `listRecoverableJobs()` + `enqueueJob()` re-encolan jobs pendientes.
- `db.ts` línea 6: variable `db` a nivel módulo — singleton imposible de reiniciar.
- `events.ts` línea 5: `Set<Listener>` global — listeners de un test contaminan otros tests.
- `codexClient.ts`: `appServerProcess`, `appServerDiagnostics` a nivel módulo.

No existe un punto de entrada llamable. No se puede importar el backend sin disparar toda la inicialización. Esto hace imposible testear cualquier módulo del backend de forma aislada o en integración con estado limpio.

## Decisión

Crear una factory `createStudioApp(config?)` que:

1. Recibe un `StudioConfig` opcional (library dir, ports, etc.) con defaults razonables.
2. Carga configuración explícitamente (`.env.local` deja de ser side effect de import).
3. Crea la DB connection y la pasa como parámetro a todos los módulos downstream.
4. Crea el `EventBus` como instancia y lo pasa como parámetro.
5. Ejecuta `initStudio()` como paso explícito.
6. Construye y retorna `{ app: Hono, db: Database, worker: Worker, events: EventBus, shutdown(): Promise<void> }`.

`index.ts` se reduce a:

```ts
import { createStudioApp } from './appFactory';
const studio = await createStudioApp();
Bun.serve({ port: studio.config.port, fetch: studio.app.fetch });
```

## Cambios archivo por archivo

### Crear

- **`apps/local-server/src/appFactory.ts`** — Función `createStudioApp(config?)`. Orquesta: carga config → crea DB → crea EventBus → init library → migrate DB → crea worker → construye rutas Hono → retorna `StudioApp`.

### Refactorizar (singleton → parámetro)

- **`apps/local-server/src/db.ts`**: `getDb()` singleton → `createDb(libraryDir: string): Database`. La conexión se pasa como parámetro a los módulos que la necesitan.
- **`apps/local-server/src/events.ts`**: `Set<Listener>` + funciones sueltas → `class EventBus { publish, subscribe, unsubscribe }`. Se instancia una vez en la factory y se pasa como dependencia.
- **`apps/local-server/src/logger.ts`**: recibe `db` y `eventBus` como parámetros en lugar de importarlos.
- **`apps/local-server/src/config.ts`**: `loadDotEnvLocal()` deja de ejecutarse en import. Se convierte en `loadConfig(options?): StudioConfig` llamada explícitamente.
- **`apps/local-server/src/worker.ts`**: recibe `db`, `eventBus`, y `codexTurn` como dependencias en lugar de importarlos del módulo.
- **`apps/local-server/src/index.ts`**: todo el código de inicialización se mueve a la factory. Solo queda el entry point de 3 líneas.

### Sin cambios

- `apps/local-server/src/library.ts` — ya es stateless, solo recibe `libraryDir`.
- `apps/local-server/src/init.ts` — se llama explícitamente desde la factory en vez de desde `index.ts`.

## Consecuencias

### Positivas

- Cada test puede llamar `createStudioApp({ libraryDir: tmpDir })` y obtener un backend completo con DB aislada y event bus limpio.
- `db`, `eventBus`, `logger`, `worker` reciben sus dependencias explícitamente → tests pueden inyectar mocks o fakes.
- El orden de inicialización es explícito y auditable (no depende del orden de imports de Bun).
- `shutdown()` permite cerrar el servidor, la DB y el worker limpiamente.

### Negativas

- Refactor toca casi todos los archivos del backend. Aunque cada cambio es mecánico (singleton → parámetro), el diff será grande.
- La factory introduce un nuevo patrón que los contribuyentes deben entender.

## Tests habilitados por este cambio

```ts
// Integration test: crear app, pegarle a una ruta, verificar DB
const app = await createStudioApp({ libraryDir: tmpDir });
const res = await app.app.request('/api/health');
const body = await res.json();
assert(body.ok === true);
await app.shutdown();

// Unit test con EventBus fake
const fakeBus = { publish: spy(), subscribe: spy() };
const logger = createLogger({ db: fakeDb, eventBus: fakeBus });
```

## Riesgos

- Medio. El refactor es mecánico pero extenso. Se debe verificar que el servidor arranca exactamente igual que antes (mismo orden de inicialización, mismos defaults, mismos side effects).
- El `Bun.serve` actual se llama a nivel top-level; moverlo dentro de la factory significa que el entry point debe ser una función async llamada inmediatamente.
