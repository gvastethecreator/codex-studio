# Baseline y alcance

- Commit auditado por este paquete: ffc5b41d2a9d4c54a36c7cfccb581125da1cd060.
- Rama/SHA reales del agente: `codex/styles-consolidated` / `30633b91c45199d17ad3658e4809703adeccb408`.
- Worktree previo: cambios ajenos sin commit en estilos, selector compacto, `cozy-studio-handoff/` y `Codex_Studio_Fichas_Completas_2026-09-25/`. No se revierten.
- Diferencias relevantes frente a BASELINE.json: el SHA auditado es ancestro de HEAD. `git diff --stat ffc5b41` sobre los ocho archivos listados no tiene cambios. Esos blobs siguen siendo la base de la cadena de cuota.
- Reglas locales leídas: `AGENTS.md` del repositorio, `CONTEXT.md` no fue necesario para esta cadena, y las instrucciones del handoff de diagnóstico. El `AGENTS.md` del ZIP no reemplaza al del repositorio.
- Cadena real adaptador → error → worker → persistencia → API → UI:
  - `createChatgptResponsesImageExecutor` hace un POST a `/responses` y clasifica con `classifyProviderFailure`.
  - `SubscriptionHttpError` conserva `code`, `providerCode`, `httpStatus` y `retryAfterSeconds`.
  - `processJob` escribe esos campos en `job.failed` o, si `cause` es `SubscriptionHttpError`, en `job.needs_review`.
  - `addJobEvent` guarda `metadata` como JSON en `job_events`. No hace falta una tabla nueva.
  - `JobEventRecord.metadata` llega al inspector. El banner muestra `job.error`, no el metadata.
- Archivos y funciones confirmados: `chatgptResponsesImageExecutor.ts` (`classifyProviderFailure`, `classifySseFailure`, `readRetryAfter`), `subscriptionHttpError.ts`, `worker.ts` (`processJob`, `processQueue`, span de `transport`), `db/events.ts`, `components/JobInspectorDetail.tsx`. Auth legacy `codex` y proveedor `chatgpt` siguen separados. No existe `codexResponsesImageExecutor.ts`.
- Archivos no inspeccionados: el resto de proveedores secundarios, la cola completa fuera de `processQueue`, y el contenido de la biblioteca del usuario.
- Entorno aislado de pruebas: Vitest con mocks. No se inicia el worker real.
- Riesgo de reanudar jobs al iniciar runtime: alto. `STUDIO_LIBRARY_DIR` apunta a `D:\AI-Studio-Library`. `library.sqlite` no está en la ruta que abre el servidor. No se listó el resto de esa carpeta ni se arrancó `bun run dev`.
- Autorización de generación de prueba: NO.
