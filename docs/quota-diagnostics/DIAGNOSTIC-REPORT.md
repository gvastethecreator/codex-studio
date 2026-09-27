# Informe de diagnóstico · Cozy / ChatGPT HTTP

## Veredicto limitado

Estado: categoría `source_limit` `confirmed` en eventos persistidos. Status HTTP `429` `confirmed`. Canal `http_json` `confirmed` en los fallos que ya traen diagnóstico. El token estructurado `usage_limit_reached` está `confirmed`. La hora de reinicio sigue `unknown`: el campo existe y su unidad no está verificada.

Causa: el evento `job.failed` guarda `code: source_limit` y el token `usage_limit_reached`. En los cuatro fallos capturados con la instrumentación cargada, ese token está en `error.type`. El export lo deja en `classification.providerType`. El metadata interno lo copia también a `providerCode`, porque el ejecutor usa `error.code ?? error.type`.

Qué evidencia la sustenta: lectura de solo lectura de `job_events` para el último job de la página (`d2dc0acd-f21b-42da-8c9a-8cc2c37d8d65`) y el primero (`88fd91c2-0dac-49f6-b1f9-735d4c193cac`), más el agregado de los `job.failed` con ese código desde `2026-09-25T21:06:23Z`. El mismo almacén es el que lee `GET /api/jobs/:id` vía `getJobDetail` y `listJobEvents`. No se llamó esa ruta: la respuesta incluye el prompt. No se inventó un endpoint.

## Evidencia recuperada de eventos

Los dos jobs están en `failed`, intento `1`, sin filas en `job_attempts`. El checkpoint pasa de `submitting` a `failed` en el mismo intento, y `job.failed` queda a unos milisegundos del checkpoint `failed`.

| Job                              | Evento `job.failed`                   | `code`         | Metadata `providerCode` | `httpStatus` | `retryAfterSeconds`          | `diagnostic` |
| -------------------------------- | ------------------------------------- | -------------- | ----------------------- | ------------ | ---------------------------- | ------------ |
| Primero de la página, `88fd91c2` | `2026-09-25T21:06:23.837Z`, intento 1 | `source_limit` | `usage_limit_reached`   | `429`        | clave presente, valor `null` | ausente      |
| Último de la página, `d2dc0acd`  | `2026-09-26T02:40:22.345Z`, intento 1 | `source_limit` | `usage_limit_reached`   | `429`        | clave presente, valor `null` | presente     |

Correlación del último: creado `02:40:21.738Z`, `job.started` `02:40:21.749Z`, checkpoint `submitting` `02:40:21.765Z`, checkpoint `failed` `02:40:22.343Z`, `job.failed` `02:40:22.345Z`. El primero repite esa secuencia a las `21:06:23.136Z`–`21:06:23.837Z`.

Desde las `21:06:23Z` hay 22 eventos `job.failed` con el mismo cuarteto: `source_limit`, `usage_limit_reached`, `429`, `retryAfterSeconds` nulo. Dieciséis, hasta `2026-09-26T02:07:22Z`, no tienen `diagnostic`. Seis sí: `02:39:59Z`, `02:40:09Z`, `02:40:22Z`, `02:58:32Z`, `03:07:58Z` y `03:16:43Z`. Esos seis coinciden. Los dos últimos aparecieron mientras el servidor seguía en marcha; esta revisión no creó jobs.

Diagnóstico de esos seis, objeto `SubscriptionHttpDiagnostic`:

- `channel: http_json`, `basis: structured_code`, `confidence: high`, `category: source_limit`
- `classification.providerCode: null`
- `classification.providerType: usage_limit_reached`
- `retryAfter.status: absent`
- `clock.serverDateUtc` presente, desfase entre −990 ms y +301 ms
- `reset.status: unknown`, `reset.atUtc: null`
- un candidato: `payload.error.resets_at`, `status: unit_unknown`, `atUtc: null`, `unitBasis: null`
- aviso único: `numeric_reset_unit_not_verified`
- `automaticRetry: false`, `automaticFallback: false`, `preserveNeedsReview: false`

El `httpStatus: 429` del metadata sale de `classifyCodexHttpFailure`. `classifySseFailure`, en el código cargado y en `HEAD`, pasa `httpStatus: null` al error. Un `429` persistido en ese campo corresponde al rechazo JSON. En los seis con diagnóstico, `diagnostic.channel` lo repite.

| Pregunta                             | Resultado                                                                                                                                                               | Fuente                             | Confianza                                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| ¿Qué provider y transporte fallaron? | `chatgpt`, transporte del span `chatgpt`, diagnóstico `subscription_http`.                                                                                              | Eventos                            | confirmed                                                             |
| ¿Cuál fue el status HTTP?            | `429` en los 22 eventos de esta ventana.                                                                                                                                | `job.failed.metadata.httpStatus`   | confirmed                                                             |
| ¿El canal fue JSON o SSE?            | JSON en los seis con diagnóstico. En los dieciséis anteriores, el `429` del error también sale del clasificador JSON.                                                   | Diagnóstico y `classifySseFailure` | confirmed                                                             |
| ¿Cuál fue el código estructurado?    | Token `usage_limit_reached`. En los seis examinados vive en `error.type`. El metadata interno lo muestra en `providerCode`.                                             | Eventos                            | confirmed el token; confirmed el campo `type` solo en esos seis       |
| ¿Cuota o rate limit?                 | `source_limit` por código estructurado, no por el texto del mensaje.                                                                                                    | `classification.basis`             | confirmed                                                             |
| ¿Retry-After?                        | En los seis, el extractor registró el header como ausente. En los dieciséis, el worker guardó `null`, que en ese código cubre header ausente, vacío o no interpretable. | Diagnóstico y metadata             | confirmed ausente en los seis; unknown la distinción en los dieciséis |
| ¿Reset?                              | En los seis, `payload.error.resets_at` numérico, unidad no verificada, instante no calculado.                                                                           | Candidato persistido               | confirmed el campo; unknown la hora                                   |
| ¿Desfase de reloj?                   | Header `Date` presente en los seis. Desfase entre −990 ms y +301 ms. No es un reset.                                                                                    | `diagnostic.clock`                 | confirmed                                                             |
| ¿La ventana está identificada?       | El límite seguía cerrado a las `2026-09-26T03:16:43Z`. Eso no mide la ventana.                                                                                          | Eventos                            | unknown                                                               |
| ¿Trabajos abiertos?                  | En la lectura de las `03:01Z`: `queued` 0, `running` 0, `needs_review` 664. Después entraron dos fallos más de la misma cuota, a las `03:07Z` y `03:16Z`.               | SQLite                             | confirmed en esas lecturas                                            |

## Dato no expuesto, no persistido, o ausente en la respuesta examinada

El listado de jobs no incluye metadata de evento. Que ahí no aparezcan `providerCode`, `httpStatus` o `diagnostic` es un dato no expuesto por el listado.

En el primero de la página, el worker sí persistió `code`, `providerCode`, `httpStatus` y `retryAfterSeconds`. No persistió `diagnostic`, el canal, el header `Date` ni el path del reset. El cuerpo original de ese intento no está guardado, así que no hay una respuesta original examinable para decir que el proveedor omitió un campo.

En el último de la página, el extractor sí examinó el cuerpo y los headers en el momento del fallo, y persistió la proyección. Esa proyección registra `error.type` conocido, sin `error.code` utilizable (no hay aviso `unrecognized_provider_code`), `Retry-After` ausente, `Date` presente y `resets_at` numérico. El cuerpo crudo y el número no se guardaron.

## Restablecimiento

Hora de esta respuesta, recibida a las `2026-09-26T04:09:27Z`: `2026-09-30T03:03:00Z`. En America/Argentina/Buenos_Aires son las `00:03` del 30.

El cuerpo trae `resets_in_seconds: 341613` y `resets_at: 1790737380`. El header `Date` más esos `341613` segundos cae en el mismo instante que `resets_at` leído como segundos unix. `x-codex-primary-reset-after-seconds` vale `341614` y `x-codex-primary-reset-at` vale `1790737381`, a un segundo. La unidad está en esos nombres, en la misma respuesta. `rateLimitUsage.ts` no se usó.

`limit_window_minutes` y `x-codex-primary-window-minutes` valen `10080`. Son 7 días. `x-codex-primary-used-percent` vale `100`. Los headers de la ventana secundaria están en `0`. `x-codex-credits-balance` vale `0`. `plan_type` es `pro`. No había `Retry-After`.

`appliesTo` sigue `unknown` y `recoveryGuaranteed` sigue `false`. El header llama a esa ventana primaria. Eso no promete que otra ruta se abra a la misma hora.

El proceso de las `02:35Z` solo guardaba `resets_at` y, sin unidad, tiraba el entero. En el mismo objeto venían `resets_in_seconds` y `limit_window_minutes`. Esos enteros no quedaron en los eventos ni en los logs. El código nuevo toma `resets_in_seconds` como segundos desde la recepción y acepta `resets_at` como segundos unix solo si cae a menos de 2 segundos de ese instante. Si no coinciden, no elige una hora. Ese código no está cargado en el proceso del puerto `17223`. Un reinicio lo cargaría y, al arrancar, encolaría los jobs que en ese momento estén `queued` o `running`.

## Diagnóstico interno y export seguro

Son objetos distintos.

El metadata interno de `job.failed` es el que escribe el worker. Campos de clasificación: `code`, `providerCode`, `httpStatus`, `retryAfterSeconds`, y `diagnostic` cuando la proyección sale bien. `providerCode` aquí es `error.code ?? error.type` ya recortado. También entran `attempt`, `transport` y un id local de ejecución. Ese id no se copia en este informe.

El export seguro es `metadata.diagnostic`, tipo `SubscriptionHttpDiagnostic`. El ejemplo sintético del informe anterior es ese objeto. En el ejemplo, `classification.providerCode` es `usage_limit_reached` y `providerType` es null porque el fixture pone el token en `error.code`. En la cuenta, el mismo tipo de objeto trae `providerCode` null y `providerType` `usage_limit_reached` porque el token llegó en `error.type`.

La frase de que el export excluye códigos se refiere a textos crudos, códigos fuera de la lista, prompts, cookies, imágenes e ids. Un código de la lista `SUBSCRIPTION_HTTP_PROVIDER_CODES` permanece. Uno fuera de la lista se anula y agrega `unrecognized_provider_code`. Esos seis no tienen ese aviso.

## Proceso local y cola

El backend ya está en marcha. PID 48280, `bun apps/local-server/src/index.ts`, escucha en `127.0.0.1:17223`, arranque `2026-09-26T02:35:54Z`. `dev:server` no usa `--watch` y el PID no cambió, así que sigue con las fuentes que cargó al arrancar.

Esas fuentes son la instrumentación sin commitear. Sus mtime van de `02:20:35Z` a `02:27:09Z`, antes del arranque. `HEAD` es `d1381585` y no contiene esos archivos. El proceso de las `02:35Z` ya escribe `diagnostic`; los eventos de las `02:39Z` en adelante lo demuestran. Los dieciséis anteriores los escribió el proceso previo, sin ese objeto.

El puerto `17224` es `codex.exe app-server`, arrancado a las `02:37:27Z`. Es otra ruta. No se tocó.

Al escuchar, `index.ts` llama `listRecoverableJobs()` y hace `enqueueJob` de cada fila. El filtro es `jobs.status IN ('queued', 'running')`. `needs_review` y `failed` no entran. No hay un interruptor para pausar ese recupero. `bun run dev` además cierra el listener actual antes de arrancar otro. En esta lectura el recupero es 0 filas. Esa lectura no deja la cola trabada: si aparece un `queued` o un `running`, el próximo arranque lo despacha. No hace falta reiniciar para cargar esta instrumentación: ya está cargada. Un archivo editado después de las `02:35:54Z` no entra en este proceso.

## Cambios y validación

La revisión posterior cambió solo el texto del inspector. Siguen `fallbackAllowed: false`, los checkpoints y `needs_review`. No se agregaron reintentos ni se cambió de proveedor.

El aviso decía «No reset time was reported» aunque el candidato `unit_unknown` ya estaba guardado. Ahora dice que hubo un campo numérico y que la unidad no está verificada. También muestra si el token está en `provider code` o en `provider type`. El JSON copiable sigue sin el número y sin el mensaje remoto.

Archivos de la instrumentación, ya descritos en la pasada anterior:

- `packages/shared/src/subscriptionHttpDiagnostic.ts` y su export en `packages/shared/src/index.ts`
- `apps/local-server/src/providers/subscriptionHttpDiagnostic.ts`
- `apps/local-server/src/providers/subscriptionHttpError.ts`
- `apps/local-server/src/providers/chatgptResponsesImageExecutor.ts`
- `apps/local-server/src/worker.ts`
- `lib/subscriptionHttpDiagnosticView.ts`
- `components/SubscriptionHttpDiagnosticNotice.tsx`
- `components/JobInspectorDetail.tsx`
- Tests: `subscriptionHttpDiagnostic.test.ts`, `codexResponsesImageExecutor.test.ts`, `workerQuotaDiagnostic.test.ts`, `SubscriptionHttpDiagnosticNotice.test.tsx`

Validaciones de esta pasada:

- Lectura SQLite `mode=ro` de `D:\AI-Studio-Library\.studio\studio.sqlite`, que es el archivo real de `library.sqlite`.
- Inspección del proceso, del puerto y de los mtime. Sin reinicio y sin `enqueue`.
- `git show HEAD` de `classifySseFailure`, para confirmar que el `httpStatus` nulo del camino SSE ya estaba en el código que escribió los eventos viejos.

Validaciones de la revisión:

- `bun run test --` los cuatro archivos. Exit 0. 72 tests. Log `logs/tooling/test-2026-09-26T03-23-15-023Z.log`. El caso nuevo reproduce el cuerpo real: `type` `usage_limit_reached`, HTTP 429, sin `Retry-After`, `resets_at` numérico, y comprueba que el número no entra al export.
- `bun run check --` la vista, el test del extractor y el test del aviso. Exit 0 tras un arreglo de formato. Log `logs/tooling/check-2026-09-26T03-26-39-346Z.log`.
- `system_logs` no contiene `resets_at`, `reset_at` ni `resetsAt`. Los logs de error solo guardan la frase de `source_limit`, 124 caracteres.

Validaciones anteriores, sin repetirlas:

- `bun run check --` los 12 archivos de la instrumentación. Exit 0. Log `logs/tooling/check-2026-09-26T02-28-37-166Z.log`.

Pendiente, a propósito:

- `bun run check` y `bun run test` de todo el repositorio. El worktree tiene ediciones ajenas de estilos.
- El inspector en la pestaña ya abierta de Cozy Studio. El aviso se cubrió con el test del componente. No se generaron imágenes ni se reenviaron jobs.

## Lo que ya no se puede recuperar

De los dieciséis intentos anteriores a las `02:35Z`: el objeto `diagnostic`, el header `Date`, el path del reset, si el token estaba en `code` o en `type`, y si `Retry-After` faltaba o era inválido. El cuerpo no se guardó.

De los seis intentos con diagnóstico: el cuerpo, el texto de los headers y los dígitos de `resets_at`. El extractor los vio y guardó solo la proyección con unidad desconocida. Los logs tampoco conservan ese número.

Siguen sin alcance: fallos de cuota anteriores al cursor de aquella página, el tamaño de la ventana y la hora en que el límite se abre.

## Cierre

Acción segura siguiente: dejar los `needs_review` como están. Los de cuota de esta ventana ya están `failed`. El proceso actual ya persiste el diagnóstico. Otro intento solo repetiría la captura mientras el límite siga cerrado, y el número de `resets_at` se volvería a descartar.

Rollback: quitar `diagnostic` del error, del metadata y del banner. Los jobs viejos no dependen de ese campo.
