# ADR 0014: Backend Dependency Injection Seams — Convertir Hard Imports en Adapter Parameters

## Estado

Propuesto.

## Contexto

El backend tiene **interface-washing**: 5+ interfaces existen (`CodexTurn`, `ProcessSupervisor`, `SessionPool`, `RpcClient`, `AssetExtractor`) pero ninguna se usa como punto de inyección. Las implementaciones concretas siempre se importan directamente con hard imports. Ejemplos:

```ts
// worker.ts — módulo-level side effect
const codexTurn = createCodexTurn(); // línea 16 — se ejecuta en tiempo de import

// catalog.ts, libraries.ts, workspaceRoutes.ts
import { getDb } from './db'; // singleton lazy — mismo path para todos
const db = getDb();

// codex/sessionPool.ts — instanciación directa
import { CodexRpcClient } from './rpcClient';
const client = new CodexRpcClient(config);

// codex/turn.ts — módulo-level side effects
const IMAGEGEN_SKILL_PATH = resolvePlatformPath('codex-skills-dir'); // línea 10 — ejecución eager
const IMAGEGEN_MODEL = process.env.CODEX_IMAGEGEN_MODEL || 'gpt-4o'; // línea 11
```

Esto hace que **ningún módulo del backend sea testeable sin module mocking**: `getDb()` abre una conexión real a SQLite en `resolveLibraryPath('library.sqlite')`. `worker.ts` crea un `CodexTurn` real al importarse. Los tests no pueden correr en paralelo porque comparten el singleton `db`.

### Módulos bloqueados por falta de DI

| Módulo               | Bloqueador                                               | Qué se necesita para testearlo                 |
| -------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| `db.ts`              | `getDb()` singleton con path fijo                        | Poder pasar un path de DB o un `Database` mock |
| `catalog.ts`         | `getDb()` + `getDefaultLibrary()` hard imports           | Poder inyectar DB y library mock               |
| `libraries.ts`       | `getDb()` + `ensureLibraryStructure()` filesystem        | Poder inyectar DB y mock filesystem            |
| `workspaceRoutes.ts` | `getDb()` + `getDefaultLibrary()`                        | Poder inyectar DB                              |
| `worker.ts`          | `createCodexTurn()` module-level                         | Poder pasar un `CodexTurn` mock                |
| `logger.ts`          | `addSystemLog()` + `publishEvent()` + `appendFileSync()` | Poder inyectar los tres adapters               |
| `codex/turn.ts`      | `resolvePlatformPath()` + `process.env` module-level     | Mover a factory params                         |
| `appFactory.ts`      | 13+ hard imports                                         | ADR 0002 ya cubre esto parcialmente            |

### Deletion test

Si reemplazamos los hard imports con parámetros de factory:

- La complejidad de "qué DB usar" se decide en un solo lugar (`appFactory` o `index.ts`).
- La complejidad de "cómo testear catalog.ts" no requiere mockear `getDb()` a nivel módulo.
- Los tests pueden crear `new Database(':memory:')` y pasarlo a `createCatalog(db)`.

## Decisión

### Principio: Factory functions con dependencias como parámetros

En lugar de:

```ts
// db.ts — ANTES
let db: Database | null = null;
export function getDb(): Database {
  if (!db) db = new Database(resolveLibraryPath('library.sqlite'));
  return db;
}

export function listJobs(): Job[] {
  const db = getDb();
  return db.query('SELECT * FROM jobs').all() as Job[];
}
```

Usar factory functions que reciben dependencias:

```ts
// db.ts — DESPUÉS
export function createDatabase(path: string): Database {
  const db = new Database(path);
  db.run('PRAGMA journal_mode=WAL');
  db.run('PRAGMA foreign_keys=ON');
  return db;
}

export function createJobStore(db: Database) {
  return {
    listJobs(): Job[] {
      return db.query('SELECT * FROM jobs').all() as Job[];
    },
    createJob(job: CreateJobRequest): Job {
      // ...
    },
    // ... resto de funciones
  };
}
```

O, alternativamente, mantener las funciones exportadas pero aceptando un parámetro opcional (menos invasivo, compatible hacia atrás):

```ts
// db.ts — alternativa menos invasiva
let defaultDb: Database | null = null;

export function getDb(db?: Database): Database {
  if (db) return db;
  if (!defaultDb) defaultDb = new Database(resolveLibraryPath('library.sqlite'));
  return defaultDb;
}

// Todas las funciones aceptan db opcional
export function listJobs(db?: Database): Job[] {
  const conn = getDb(db);
  return conn.query('SELECT * FROM jobs').all() as Job[];
}
```

**Decisión**: Usar la alternativa menos invasiva (parámetro opcional) para minimizar el diff. Las factory functions completas (`createJobStore`) son el objetivo a largo plazo pero requieren reescribir todos los callers.

### Worker: eliminar side effects a nivel módulo

```ts
// worker.ts — ANTES
const codexTurn = createCodexTurn();
const maxConcurrentJobs = parseInt(process.env.STUDIO_MAX_CONCURRENT_CODEX_JOBS || '1');

// worker.ts — DESPUÉS
let codexTurn: CodexTurn;

export function initWorker(turn: CodexTurn, maxConcurrent?: number) {
  codexTurn = turn;
  maxConcurrentJobs = maxConcurrent ?? 1;
}

// O mejor: convertir en factory
export function createWorker(turn: CodexTurn, maxConcurrent?: number) {
  return {
    enqueueJob(job: Job) {
      /* ... */
    },
    getWorkerStatus() {
      /* ... */
    },
  };
}
```

### Logger: extraer adapters como parámetros

```ts
// logger.ts — ANTES: 3 hard imports
import { addSystemLog } from './db';
import { publishEvent } from './events';
import { appendFileSync } from 'node:fs';

// logger.ts — DESPUÉS: factory con dependencias
export function createLogger(deps: {
  db: { addSystemLog: (log: SystemLog) => number };
  events: { publishEvent: (type: string, payload: unknown) => void };
  writeToFile: (path: string, data: string) => void;
}) {
  return function log(level: LogLevel, scope: string, message: string, jobId?: string) {
    deps.writeToFile(resolveLogPath(level), formatLogEntry(level, scope, message));
    deps.db.addSystemLog({ level, scope, message, jobId });
    deps.events.publishEvent('log.created', { level, scope, message, jobId });
  };
}
```

### Codex modules: respetar las interfaces que ya existen

Los módulos codex/ definen interfaces limpias (`CodexTurn`, `RpcClient`, `SessionPool`, `AssetExtractor`) pero nunca las usan como tipo de parámetro. Cambiar eso:

```ts
// turn.ts — ANTES
import { getImagegenSession } from './sessionPool'  // hard import
export function createCodexTurn(): CodexTurn { ... }

// turn.ts — DESPUÉS
export function createCodexTurn(deps: {
  sessionPool: SessionPool
  rpcClient: RpcClient
  assetExtractor: AssetExtractor
}): CodexTurn { ... }
```

### Archivos afectados

| Archivo                | Cambio                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| `db.ts`                | Agregar parámetro opcional `db?: Database` a todas las funciones    |
| `catalog.ts`           | Aceptar `db?: Database` en funciones; tests pueden pasar `:memory:` |
| `libraries.ts`         | Ídem                                                                |
| `workspaceRoutes.ts`   | Ídem                                                                |
| `worker.ts`            | Factory `createWorker(turn, config)` en lugar de module-level state |
| `logger.ts`            | Factory `createLogger(deps)` en lugar de 3 hard imports             |
| `codex/turn.ts`        | Aceptar `deps: { sessionPool, rpcClient, assetExtractor }`          |
| `codex/sessionPool.ts` | Aceptar `deps: { rpcClientFactory, persistencePath }`               |
| `appFactory.ts`        | Construir dependencias y pasarlas a factories                       |
| `index.ts`             | Mínimo cambio — `createStudioApp` recibe overrides opcionales       |

## Consecuencias

### Positivas

- **Testability**: Todos los módulos del backend se vuelven testeables con dependencias mock. `catalog.test.ts` crea una DB `:memory:`, inserta fixtures, y prueba queries — sin mocks de módulo.
- **Locality**: La decisión de "qué DB usar" y "qué implementación de CodexTurn usar" vive en `appFactory.ts`. Los módulos de dominio no saben de dónde vienen sus dependencias.
- **Leverage**: `createWorker(turn)` acepta cualquier cosa que cumpla la interfaz `CodexTurn`. Tests pasan un mock que devuelve assets sintéticos. Un futuro adapter remoto (Codex en otra máquina) se inyecta sin cambiar una línea de `worker.ts`.
- **Adapters reales**: Las interfaces que hoy son "hypothetical seams" (un solo adapter) se vuelven seams reales cuando los tests implementan un segundo adapter (mock).
- **Parallelización**: Tests pueden crear DBs independientes y correr en paralelo sin compartir estado global.

### Negativas

- **Indirección**: Las factory functions agregan una capa de indirección. Donde antes había `getDb()` directo, ahora hay `db` recibido como parámetro. Esto hace el código más verboso en producción pero el beneficio en tests lo justifica.
- **Diff grande**: Todos los módulos que usan `getDb()` necesitan el parámetro opcional. Son 7+ archivos.
- **Complejidad en appFactory**: La composición de dependencias se concentra en `appFactory.ts`, que ya es grande. Esto se alivia si `appFactory` delega a un `bootstrap.ts` dedicado.

### Riesgo

**Medio**. El cambio a parámetros opcionales es no-breaking (si no se pasa el parámetro, se usa el singleton actual). Cada módulo puede migrarse independientemente. El riesgo está en `worker.ts` (mover `createCodexTurn()` de module-level a parámetro cambia cuándo se ejecuta la inicialización).

### Dependencias

- **ADR 0002** (Callable App Factory): Ya implementado. `createStudioApp` es el lugar donde se construyen y cablean las dependencias.
- **ADR 0017** (Centralize Configuration): Complementario — una vez que `process.env` reads están centralizados, las factories los reciben como config en lugar de leer `process.env` directamente.
