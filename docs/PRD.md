# PRD: Codex Image Studio Local

## Proposito

Convertir la aplicacion visual existente en un studio local para generar, revisar y administrar imagenes usando la sesion autenticada de Codex/ChatGPT en esta maquina, sin exigir API keys.

## Usuarios

- Creadores que quieren un flujo local con biblioteca persistente.
- Artistas tecnicos que necesitan prompts, recetas, referencias, batches y exportaciones.
- Usuarios de Codex/ChatGPT que prefieren automatizar la generacion desde su sesion local.

## Requerimientos Funcionales

- Generar imagenes desde la UI original mediante jobs `codex_imagegen`.
- Guardar assets, logs, transcripts y metadata en una carpeta externa configurable.
- Persistir jobs/assets/logs en SQLite.
- Mostrar en UI la cola efimera y la cola persistente del backend.
- Mostrar logs locales en la consola de la app.
- Importar assets existentes de la biblioteca local al grid visual.
- Mantener workspaces, favoritos, seleccion multiple, trash, vault export/import y recetas.
- Permitir dry-run para validar la instalacion sin consumir generacion real.

## Requerimientos No Funcionales

- No depender de `OPENAI_API_KEY`, `GEMINI_API_KEY` ni llamadas directas desde el navegador a proveedores externos.
- Mantener el backend local ejecutable con Bun.
- Mantener tasks de VSCode para iniciar y verificar el studio.
- Evitar subir archivos sensibles o pesados: DB local, logs, assets generados y `.tmp`.

## Fuera de Alcance Actual

- Multiusuario remoto.
- Sincronizacion cloud.
- Edicion semantica perfecta con mascara: el editor ahora enruta a job local con contexto textual y adjuntos como referencia; la precision dependera de la capacidad disponible en Codex/imagegen.
