# ADR 0006: SSE Job Watcher

## Estado

Propuesto.

## Contexto

El frontend usa dos loops de polling separados para monitorear el backend, a pesar de que el backend ya expone un endpoint SSE (`GET /api/events`) que emite eventos en tiempo real:

1. **`hooks/useLocalStudioSync.ts`** (línea 113): `setInterval` cada 3 segundos. Consulta `/api/jobs`, `/api/assets`, `/api/logs` completos en cada tick. Sin delta/incremental.
2. **`services/localStudioService.ts`** (`waitForStudioJob`, líneas 60-84): polling cada 1.2 segundos hasta 240 segundos. Busca un job específico por ID.

Ambos loops son **shallow modules**: su interfaz (un `setInterval` + `fetch`) es casi idéntica a su implementación. No esconden complejidad — la empujan al caller.

El endpoint SSE (`apps/local-server/src/index.ts`, líneas 131-153) emite eventos tipados:
- `job.created`, `job.updated` con payload `Job`
- `asset.created` con payload `Asset`
- `log.created` con payload `SystemLog`

El backend ya tiene el mecanismo de notificación en tiempo real. El frontend no lo usa.

## Decisión

Crear un módulo `services/studioEventSource.ts` que encapsule la conexión SSE y exponga dos modos de consumo:

### Interfaz de suscripción (para sync continuo)

```ts
interface StudioEventStream {
  onJobUpdate(jobIdOrWildcard: string | '*', callback: (job: Job) => void): () => void
  onAssetAdded(callback: (asset: Asset) => void): () => void
  onLogAdded(callback: (log: SystemLog) => void): () => void
  onConnectionChange(callback: (connected: boolean) => void): () => void
  close(): void
}

function createStudioEventStream(apiBase?: string): StudioEventStream
```

Cada `on*` retorna una función de unsubscribe. Múltiples suscriptores por tipo de evento. Reconexión automática con backoff exponencial (1s, 2s, 4s, 8s, cap 30s). `onConnectionChange` notifica cuando la conexión cae/se recupera.

### Interfaz de promesa (para esperar un job)

```ts
function watchJob(
  stream: StudioEventStream,
  jobId: string,
  timeoutMs?: number  // default 240000 (4 min)
): Promise<Job>
```

Resuelve cuando el job llega a un estado terminal (`completed`, `failed`, `cancelled`, `needs_review`). Rechaza con `JobWatchTimeoutError` si se excede el timeout. Usa `onJobUpdate` internamente — comparte la misma conexión SSE.

### Manejo de edge cases

- **Conexión cae mientras se espera un job**: reconexión automática. `watchJob` consulta `/api/jobs/{id}` una vez al reconectar para obtener el estado actual (por si el job completó durante la desconexión).
- **Job ya completado antes de suscribirse**: `watchJob` hace un fetch inicial (`GET /api/jobs` y busca por ID). Si ya está terminal, resuelve inmediatamente.
- **Múltiples watchJob concurrentes**: todos comparten la misma conexión SSE. Cada uno filtra eventos por su `jobId`.
- **Server no disponible al inicio**: `createStudioEventStream` no falla; emite `onConnectionChange(false)` y reintenta conexión.

## Cambios archivo por archivo

### Crear

- **`services/studioEventSource.ts`** (~120 líneas) — `createStudioEventStream()`, `watchJob()`. Manejo de EventSource, parseo de SSE, reconexión, filtrado de eventos, timeouts.

### Reescribir

- **`hooks/useLocalStudioSync.ts`** — Reemplazar `setInterval` + `fetch` con suscripciones a `StudioEventStream`:
  ```ts
  const stream = useRef(createStudioEventStream())
  useEffect(() => {
    const unsub1 = stream.current.onAssetAdded(handleNewAsset)
    const unsub2 = stream.current.onJobUpdate('*', handleJobUpdate)
    const unsub3 = stream.current.onLogAdded(handleNewLog)
    return () => { unsub1(); unsub2(); unsub3(); stream.current.close() }
  }, [])
  ```
  El hook pasa de ~144 líneas a ~60 líneas.

### Editar

- **`services/localGenerationRun.ts`** — `runSingleCodexImagegenJob` reemplaza `waitForStudioJob(jobId)` con `watchJob(stream, jobId)`. El stream se crea una vez en `runLocalGeneration` y se pasa a cada job.
- **`services/localStudioService.ts`** — Se elimina `waitForStudioJob` (líneas 60-84). Las funciones REST (`createStudioJob`, `listStudioJobs`, etc.) se mantienen.

### Sin cambios

- `apps/local-server/src/index.ts` — El endpoint SSE ya existe y funciona.
- `apps/local-server/src/events.ts` — El EventBus ya emite los eventos correctos.

## Consecuencias

### Positivas

- **Leverage**: Cualquier parte del frontend que necesite reaccionar a cambios del backend usa `createStudioEventStream()`. No necesita implementar su propio polling. El stream es un singleton por página (una conexión SSE para todos los consumidores).
- **Locality**: Toda la lógica de reconexión, parseo de SSE, timeouts y filtrado vive en `studioEventSource.ts`. Si el formato de eventos cambia, se arregla en un solo lugar.
- **Latencia**: Los jobs y assets aparecen en la UI en milisegundos en lugar de hasta 3 segundos.
- **Carga del servidor**: Una conexión SSE abierta en lugar de 3+ requests HTTP cada 3 segundos.
- **Tests**: `watchJob` se puede testear con un mock de `EventSource` que emita eventos programáticamente. `onAssetAdded` se puede testear con un stream sintético.

### Negativas

- La lógica de reconexión SSE es inherentemente compleja (backoff, reconexión en estado inconsistente, fetch de catch-up).
- Si el backend no soporta SSE en algún contexto (ej. Electron con restricciones de red), hay que agregar un adapter de fallback. Por ahora el seam está en la misma función `createStudioEventStream` — se puede crear un adapter polling-based con la misma interfaz.

## Tests

```ts
// watchJob resuelve cuando el job completa
const stream = createMockStream()
const jobPromise = watchJob(stream, 'job-1', 5000)
stream.emit('job.updated', { id: 'job-1', status: 'running' })
stream.emit('job.updated', { id: 'job-1', status: 'completed' })
const job = await jobPromise
assert(job.status === 'completed')

// watchJob rechaza por timeout
const stream = createMockStream()
await assert.rejects(
  watchJob(stream, 'job-1', 100),
  { name: 'JobWatchTimeoutError' }
)

// watchJob resuelve inmediatamente si el job ya está completo (fetch inicial)
mockFetchOnce('/api/jobs', [{ id: 'job-1', status: 'completed' }])
const stream = createMockStream()
const job = await watchJob(stream, 'job-1', 5000)
assert(job.status === 'completed')

// onAssetAdded notifica nuevo asset
const stream = createMockStream()
const assets: Asset[] = []
stream.onAssetAdded(a => assets.push(a))
stream.emit('asset.created', { id: 'a1', jobId: 'j1', publicUrl: '/library/assets/a1.png' })
assert(assets.length === 1)
```

## Riesgos

- **Medio**. La lógica de reconexión SSE es el punto más delicado. El polling actual es ineficiente pero confiable. La migración debe manejar todos los edge cases (server restart, network blip, job que completa durante una desconexión).
- El `EventSource` API del navegador no soporta headers personalizados. Si en el futuro se requiere autenticación, se necesitará `fetch` con `ReadableStream` en lugar de `EventSource`. La interfaz del módulo debe abstraer esto para que el cambio sea interno.
