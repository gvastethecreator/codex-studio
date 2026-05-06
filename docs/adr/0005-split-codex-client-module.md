# ADR 0005: Split Codex Client Module

## Estado

Propuesto.

## Contexto

`apps/local-server/src/codexClient.ts` es un god module de 552 líneas que mezcla cinco concerns distintos:

1. **Process supervision** (líneas 33-106): spawn/monitoreo de `codex app-server`, `appServerProcess`, `appServerDiagnostics`, `ensureAppServer()`.
2. **JSON-RPC WebSocket transport** (líneas 108-229): clase `CodexRpcClient` con `connect()`, `request()`, retry loop de 25 intentos, `pingSession()`.
3. **Session pooling** (líneas 318-454): `getOrCreateImagegenSession()`, `createNewImagegenSession()`, thread registry persistido en `imagegen-session-registry.json`, manejo de threads en SQLite.
4. **Image extraction** (líneas 254-316): tres estrategias de extracción (inline base64, generated_images path, regex de path Windows), más `getNewestGeneratedImage()` como fallback offline.
5. **Turn orchestration** (líneas 456-493): `runCodexImagegenJob()` que encadena session resolve → RPC call → extract assets → log transcript.

La interfaz es casi tan compleja como la implementación porque un caller que quiere el RPC client también importa el process supervisor. Un test que quiere probar image extraction debe mockear WebSocket.

**Deletion test**: si borramos el archivo, la complejidad desaparece — pero reaparece en `worker.ts`, `index.ts`, y cualquier futuro consumidor. El archivo gana su lugar, pero debe ser más profundo: dividido en módulos con interfaces pequeñas.

## Decisión

Dividir en cinco módulos bajo `apps/local-server/src/codex/`, cada uno con su propia interfaz y seam:

### 1. `codex/processSupervisor.ts` — Codex Process Supervisor

```ts
interface ProcessInfo {
  pid: number | null
  status: 'running' | 'stopped' | 'error'
  lastExitCode: number | null
  lastExitAt: string | null
  lastStartError: string | null
}

interface ProcessSupervisor {
  ensureAppServer(wsPort: number): Promise<ProcessInfo>
  stopAppServer(): Promise<void>
  onDiagnostics(cb: (info: ProcessInfo) => void): () => void  // unsubscribe
}
```

Responsable de: spawn, monitoreo, pipe de stdout/stderr a log file, captura de exit code. Estado interno: `appServerProcess` deja de ser variable global de módulo y pasa a ser estado de instancia.

### 2. `codex/rpcClient.ts` — Codex RPC Transport

```ts
interface RpcSession {
  request(method: string, params?: unknown): Promise<unknown>
  disconnect(): void
}

interface RpcClient {
  connect(wsUrl: string, retryConfig?: RetryConfig): Promise<RpcSession>
}
```

Responsable de: WebSocket handshake, JSON-RPC framing, reconnect con backoff, heartbeat/ping. No sabe nada de imagegen, threads, ni procesos.

### 3. `codex/sessionPool.ts` — Codex Session Pool

```ts
interface SessionHandle {
  threadId: string
  turnId: string
  sessionKey: string
}

interface SessionPool {
  getOrCreateSession(projectId: string): Promise<SessionHandle>
  releaseSession(handle: SessionHandle): void
  destroySession(threadId: string): Promise<void>
}
```

Responsable de: crear/reusar threads de Codex por proyecto, inicializar la skill `$imagegen` en threads nuevos, persistir registry en `imagegen-session-registry.json`, trackear turns en SQLite (`codex_threads`/`codex_turns`). Recibe `db` y `rpcClient` como dependencias.

### 4. `codex/assetExtractor.ts` — Image Asset Extractor

```ts
interface AssetSource {
  type: 'inline' | 'file'
  data?: Buffer       // para inline base64
  sourcePath?: string // para file copy
  mimeType: string
}

interface AssetExtractor {
  extract(turnNotifications: unknown[], threadId: string): Promise<AssetSource[]>
}
```

Responsable de: pipe de estrategias de extracción. Cada estrategia es una función con firma `(notifications, threadId) => AssetSource[]`. Se ejecutan en orden; la primera que produce resultados gana.

Estrategias internas (adapters):
- **InlineBase64Extractor**: regex `data:image/{png|jpeg|webp};base64,...`.
- **GeneratedImageItemExtractor**: busca items `imageGeneration` en notifications, construye path `generated_images/{threadId}/{itemId}.png`.
- **SavedImagePathExtractor**: regex de paths absolutos (platform-aware, usa `platformPaths.ts`).

### 5. `codex/turn.ts` — Codex Turn

```ts
interface TurnParams {
  projectId: string
  prompt: string
  sessionKey?: string   // opcional: usar una session existente
}

interface TurnResult {
  assets: AssetSource[]
  transcript: string
  turnId: string
  threadId: string
  durationMs: number
}

interface CodexTurn {
  runTurn(params: TurnParams): Promise<TurnResult>
}
```

Responsable de: orquestar una generación completa. `sessionPool.getOrCreateSession()` → `rpcClient.request('imagegen', ...)` → `assetExtractor.extract()` → log transcript. Esto es lo que `worker.ts` llama.

## Cambios archivo por archivo

### Crear

- **`apps/local-server/src/codex/processSupervisor.ts`** (~80 líneas)
- **`apps/local-server/src/codex/rpcClient.ts`** (~130 líneas)
- **`apps/local-server/src/codex/sessionPool.ts`** (~160 líneas)
- **`apps/local-server/src/codex/assetExtractor.ts`** (~100 líneas)
- **`apps/local-server/src/codex/turn.ts`** (~80 líneas)
- **`apps/local-server/src/codex/index.ts`** — barrel re-export

### Editar

- **`apps/local-server/src/worker.ts`** — En lugar de importar `runCodexImagegenJob` de `codexClient.ts`, importa `CodexTurn` y llama `turn.runTurn()`.
- **`apps/local-server/src/index.ts`** — `POST /api/app-server/start` llama `processSupervisor.ensureAppServer()`.
- **`apps/local-server/src/appFactory.ts`** (ADR 0002) — Construye e inyecta las dependencias: `processSupervisor` → `rpcClient` → `sessionPool` → `assetExtractor` → `turn`.

### Eliminar

- **`apps/local-server/src/codexClient.ts`** — 552 líneas eliminadas. Su funcionalidad ahora vive en los 5 módulos nuevos.

## Orden de extracción recomendado

1. **AssetExtractor** primero — es el más autocontenido, no depende de WebSocket ni procesos. Más fácil de testear.
2. **RpcClient** — depende solo de WebSocket (nativo de Bun). Se puede testear con un servidor WebSocket mock.
3. **ProcessSupervisor** — extraer `ensureAppServer` y estado de proceso.
4. **SessionPool** — depende de RpcClient y DB.
5. **Turn** — orquestador final que une todo.

## Consecuencias

### Positivas

- **Leverage**: `AssetExtractor` puede ser usado por un futuro "deep scan" del dashboard que busque imágenes en el cache de Codex. `RpcClient` puede ser reusado si Codex cambia de `$imagegen` a otro skill.
- **Locality**: Cambiar la estrategia de extracción de imágenes toca solo `assetExtractor.ts`. Cambiar la estrategia de reconexión WebSocket toca solo `rpcClient.ts`. Bugs no se propagan entre concerns.
- **Tests**: `AssetExtractor` se prueba con blobs JSON sintéticos. `RpcClient` con un mock WebSocket. `SessionPool` con SQLite en memoria. `Turn` con mocks de todos sus dependencias.

### Negativas

- Cinco archivos en lugar de uno. La navegación requiere entender la composición. El barrel export mitiga esto.
- Más dependencias para inyectar en la factory (ADR 0002).
- Mayor riesgo de regresión durante la extracción por la cantidad de código movido.

## Tests

```ts
// AssetExtractor: extracción inline base64
const notifications = [{ type: 'message', content: 'data:image/png;base64,ABC123...' }]
const sources = await extractor.extract(notifications, 'thread-1')
assert(sources[0].type === 'inline')
assert(sources[0].mimeType === 'image/png')

// AssetExtractor: generated_images path
const notifications = [{
  type: 'custom',
  subtype: 'imageGeneration',
  items: [{ id: 'item-1', status: 'complete' }]
}]
const sources = await extractor.extract(notifications, 'thread-1')
assert(sources[0].sourcePath.includes('generated_images/thread-1/item-1.png'))

// RpcClient: reconexión
const client = createRpcClient()
const session = await client.connect('ws://localhost:9999', { maxRetries: 3, retryDelay: 10 })
// Debe lanzar después de 3 intentos fallidos

// Turn: orquestación con mocks
const mockSession = { getOrCreateSession: async () => ({ threadId: 't1', turnId: 'tu1', sessionKey: 'k1' }) }
const mockRpc = { request: async () => ({ status: 'completed' }) }
const mockExtractor = { extract: async () => [{ type: 'file', sourcePath: '/img.png', mimeType: 'image/png' }] }
const turn = createCodexTurn({ sessionPool: mockSession, rpcClient: mockRpc, assetExtractor: mockExtractor })
const result = await turn.runTurn({ projectId: 'p1', prompt: 'a cat' })
assert(result.assets.length === 1)
```

## Riesgos

- **Alto**. Es el refactor más grande (552 líneas → 5 módulos). Requiere tests de regresión manuales contra el flujo real de Codex (generar una imagen real después del refactor).
- La extracción debe ser incremental: un módulo por vez, verificando que el sistema sigue funcionando después de cada paso.
- Depende de ADR 0004 (Platform Paths) para que `assetExtractor.ts` no tenga paths hardcodeados.
