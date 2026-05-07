# ADR 0017: Centralize Configuration — Mover Todos los `process.env` Reads a config.ts

## Estado

Propuesto.

## Contexto

`config.ts` existe como el módulo de settings autoritativo (`getSettings()`, `getEnvLocalPath()`, `loadDotEnvLocal()`), pero lecturas de `process.env` están dispersas en **5 archivos adicionales** más allá de `config.ts`:

| Archivo                      | Variable leída                     | Línea | Default                         |
| ---------------------------- | ---------------------------------- | ----- | ------------------------------- |
| `config.ts`                  | `STUDIO_LIBRARY_DIR`               | ~15   | `~/AI-Studio-Library`           |
| `config.ts`                  | `STUDIO_SERVER_PORT`               | ~16   | `4317`                          |
| `config.ts`                  | `STUDIO_CODEX_WS_PORT`             | ~17   | `4318`                          |
| `worker.ts`                  | `STUDIO_MAX_CONCURRENT_CODEX_JOBS` | ~12   | `1`                             |
| `codex/turn.ts`              | `CODEX_IMAGEGEN_MODEL`             | ~11   | `gpt-4o`                        |
| `codex/turn.ts`              | `CODEX_IMAGEGEN_REASONING_EFFORT`  | ~12   | `medium`                        |
| `codex/sessionPool.ts`       | `CODEX_IMAGEGEN_MODEL`             | ~15   | `gpt-4o` (duplicado)            |
| `codex/processSupervisor.ts` | `STUDIO_CODEX_WS_PORT`             | ~20   | `4318` (duplicado de config.ts) |

### Problemas

1. **Defaults duplicados**: `CODEX_IMAGEGEN_MODEL` tiene default `'gpt-4o'` en dos archivos distintos (`turn.ts` y `sessionPool.ts`). Si se cambia el default, hay que actualizar ambos — o peor, se actualiza uno y el otro sigue con el default viejo, creando comportamiento inconsistente.

2. **Sin validación**: `STUDIO_MAX_CONCURRENT_CODEX_JOBS` se parsea con `parseInt(...)` sin validar que sea un número positivo. `CODEX_IMAGEGEN_REASONING_EFFORT` no valida que sea uno de los valores permitidos (`low`, `medium`, `high`).

3. **Module-level evaluation**: En `worker.ts`, `codex/turn.ts`, y `codex/processSupervisor.ts`, las variables se leen en el scope del módulo (no dentro de una función). Esto significa que se evalúan en tiempo de import, antes de que `loadDotEnvLocal()` haya ejecutado. Si `.env.local` define `STUDIO_MAX_CONCURRENT_CODEX_JOBS=3`, pero `worker.ts` se importa antes de que `loadDotEnvLocal()` se llame, la variable se lee como `undefined` y se usa el default `1`.

4. **Sin tipado**: `process.env` devuelve `string | undefined`. Cada archivo hace su propio parsing y default. No hay un solo lugar donde se garantice que los tipos son correctos.

### Deletion test

Si movemos todas las lecturas de `process.env` a `config.ts`:

- La complejidad de "qué variables de entorno existen y cuáles son sus defaults" se concentra en un solo archivo.
- Agregar una nueva variable de configuración es agregar una línea a `config.ts`, no buscar dónde más se lee `process.env`.
- La validación y parsing ocurren una vez, no en cada módulo que consume la variable.

## Decisión

### Expandir `getSettings()` para incluir todas las variables de entorno

```ts
// config.ts
export interface StudioSettings {
  // Library & server
  libraryDir: string;
  serverPort: number;
  codexWsPort: number;

  // Codex integration
  codexImagegenModel: string;
  codexImagegenReasoningEffort: 'low' | 'medium' | 'high';
  codexMaxConcurrentJobs: number;

  // Paths (ya resueltos por platformPaths.ts)
  // ...
}

export function getSettings(): StudioSettings {
  return {
    libraryDir: process.env.STUDIO_LIBRARY_DIR || path.join(os.homedir(), 'AI-Studio-Library'),
    serverPort: parseInt(process.env.STUDIO_SERVER_PORT || '4317', 10),
    codexWsPort: parseInt(process.env.STUDIO_CODEX_WS_PORT || '4318', 10),

    codexImagegenModel: process.env.CODEX_IMAGEGEN_MODEL || 'gpt-4o',
    codexImagegenReasoningEffort: validateReasoningEffort(
      process.env.CODEX_IMAGEGEN_REASONING_EFFORT || 'medium',
    ),
    codexMaxConcurrentJobs: validatePositiveInt(
      process.env.STUDIO_MAX_CONCURRENT_CODEX_JOBS || '1',
    ),
  };
}

function validateReasoningEffort(value: string): 'low' | 'medium' | 'high' {
  if (!['low', 'medium', 'high'].includes(value)) {
    console.warn(`Invalid CODEX_IMAGEGEN_REASONING_EFFORT "${value}", using "medium"`);
    return 'medium';
  }
  return value as 'low' | 'medium' | 'high';
}

function validatePositiveInt(value: string): number {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1) {
    console.warn(`Invalid positive integer "${value}", using 1`);
    return 1;
  }
  return num;
}
```

### Consumir settings en lugar de process.env

```ts
// worker.ts — ANTES
const maxConcurrentJobs = parseInt(process.env.STUDIO_MAX_CONCURRENT_CODEX_JOBS || '1');

// worker.ts — DESPUÉS
import { getSettings } from './config';
const settings = getSettings();
const maxConcurrentJobs = settings.codexMaxConcurrentJobs;

// codex/turn.ts — ANTES
const IMAGEGEN_MODEL = process.env.CODEX_IMAGEGEN_MODEL || 'gpt-4o';
const IMAGEGEN_REASONING_EFFORT = process.env.CODEX_IMAGEGEN_REASONING_EFFORT || 'medium';

// codex/turn.ts — DESPUÉS
import { getSettings } from '../config';
const settings = getSettings();
const model = settings.codexImagegenModel;
const reasoningEffort = settings.codexImagegenReasoningEffort;
```

O mejor aún: recibir config como parámetro en las factories (compatible con ADR 0014):

```ts
// codex/turn.ts — con DI (ADR 0014)
export function createCodexTurn(config: {
  model: string;
  reasoningEffort: 'low' | 'medium' | 'high';
  // ... otras deps
}): CodexTurn {
  // usa config.model, no process.env
}
```

### Resolver el problema de orden de inicialización

El problema de module-level evaluation (variables leídas antes de `loadDotEnvLocal()`) se resuelve de dos formas:

1. **Opción A (mínima)**: `loadDotEnvLocal()` se llama en `index.ts` antes de cualquier import. Bun carga módulos sincrónicamente en orden de import, así que si `config.ts` es el primer import y llama a `loadDotEnvLocal()` en su scope, los demás módulos ven las variables cargadas.

2. **Opción B (robusta, alineada con ADR 0014)**: Ningún módulo lee `process.env` en module scope. `getSettings()` se llama dentro de `createStudioApp()` (que ya existe por ADR 0002), y las settings se pasan como parámetros a las factories de los módulos que las necesitan.

**Decisión**: Combinar ambas. `getSettings()` llama a `loadDotEnvLocal()` si no se ha llamado aún (idempotente). Los módulos que usan settings las reciben como parámetro cuando es posible (ADR 0014), o llaman a `getSettings()` dentro de funciones (no en module scope).

### Archivos afectados

| Archivo                      | Cambio                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `config.ts`                  | Expandir `getSettings()` con todas las variables; agregar validación                                 |
| `worker.ts`                  | Reemplazar `process.env.STUDIO_MAX_CONCURRENT_CODEX_JOBS` con `getSettings().codexMaxConcurrentJobs` |
| `codex/turn.ts`              | Reemplazar `process.env.CODEX_IMAGEGEN_MODEL` + `CODEX_IMAGEGEN_REASONING_EFFORT` con settings       |
| `codex/sessionPool.ts`       | Reemplazar `process.env.CODEX_IMAGEGEN_MODEL` con settings (eliminar duplicado)                      |
| `codex/processSupervisor.ts` | Reemplazar `process.env.STUDIO_CODEX_WS_PORT` con `getSettings().codexWsPort` (eliminar duplicado)   |

## Consecuencias

### Positivas

- **Locality**: Todas las variables de configuración, sus defaults, y su validación viven en `config.ts`. Un typo en un nombre de variable de entorno se detecta en un solo lugar.
- **Leverage**: `getSettings()` devuelve un objeto tipado `StudioSettings`. Los consumidores obtienen `settings.codexMaxConcurrentJobs` (número) en lugar de `parseInt(process.env.STUDIO_MAX_CONCURRENT_CODEX_JOBS || '1')` (string | undefined → número con coerción). La interfaz es más pequeña y más segura.
- **Testability**: Tests pueden hacer `process.env.STUDIO_MAX_CONCURRENT_CODEX_JOBS = '5'` y llamar a `getSettings()` para verificar que devuelve `5`. La validación es testeable con inputs inválidos.
- **No más defaults duplicados**: `CODEX_IMAGEGEN_MODEL` tiene un solo default en `config.ts`. Si cambia, cambia para todos los consumidores.
- **Validación centralizada**: Valores inválidos generan warnings en un solo lugar. Hoy, si `STUDIO_MAX_CONCURRENT_CODEX_JOBS=abc`, `parseInt` devuelve `NaN` silenciosamente y el worker no arranca sin explicación.

### Negativas

- **Acoplamiento a `config.ts`**: Módulos que antes eran independientes (solo leían `process.env`) ahora importan `config.ts`. Esto es un acoplamiento aceptable porque `config.ts` no tiene dependencias pesadas (solo `node:fs` y `node:path`).
- **Cambio en worker.ts**: Mover la lectura de `process.env` de module scope a function scope es un cambio de comportamiento sutil si el valor se usaba para inicializar estado del módulo.

### Riesgo

**Bajo**. Es un cambio aditivo: se agregan campos a `getSettings()`, los consumidores migran uno por uno. Cada migración es mecánica (reemplazar `process.env.X` por `getSettings().x`). El principal riesgo es el orden de inicialización (`.env.local` debe cargarse antes de que los módulos lean settings), que se resuelve con la llamada temprana a `loadDotEnvLocal()`.

### Dependencias

- **ADR 0014** (Backend DI Seams): Idealmente, los módulos reciben config como parámetro en lugar de llamar a `getSettings()` directamente. Este ADR establece _qué_ configuración existe; ADR 0014 establece _cómo_ se entrega a los módulos.
- **ADR 0002** (Callable App Factory): `createStudioApp` es donde `getSettings()` se llama y las settings se distribuyen a las factories.
